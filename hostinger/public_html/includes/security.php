<?php
declare(strict_types=1);

/**
 * CoolerBox Ice Hub — Security, Sessions, CSRF, Auth & Sanitization
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/smtp_mailer.php';

function cbx_is_https(): bool
{
    if (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off') {
        return true;
    }
    if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower((string)$_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https') {
        return true;
    }
    return ((int)($_SERVER['SERVER_PORT'] ?? 0) === 443);
}

function cbx_start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $sec = cbx_config()['security'];
    $lifetime = (int)($sec['session_lifetime'] ?? 28800);

    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');

    session_name((string)($sec['session_name'] ?? 'cbx_admin_session'));
    session_set_cookie_params([
        'lifetime' => $lifetime,
        'path' => '/',
        'domain' => '',
        'secure' => cbx_is_https(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    session_start();

    if (empty($_SESSION['_created_at'])) {
        $_SESSION['_created_at'] = time();
    }
    if (empty($_SESSION['_csrf_token'])) {
        $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));
    }
}

function cbx_csrf_token(): string
{
    cbx_start_session();
    return (string)$_SESSION['_csrf_token'];
}

function cbx_verify_csrf(?array $body = null): bool
{
    cbx_start_session();
    $sessionToken = (string)($_SESSION['_csrf_token'] ?? '');
    if ($sessionToken === '') {
        return false;
    }

    $headerToken = (string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    $postToken = (string)($_POST['_csrf'] ?? '');
    $jsonToken = is_array($body) ? (string)($body['_csrf'] ?? '') : '';

    $candidate = $headerToken !== '' ? $headerToken : ($postToken !== '' ? $postToken : $jsonToken);
    if ($candidate === '') {
        return false;
    }

    return hash_equals($sessionToken, $candidate);
}

function cbx_is_admin(): bool
{
    cbx_start_session();
    if (empty($_SESSION['admin_user_id']) || empty($_SESSION['admin_username'])) {
        return false;
    }
    $lifetime = (int)(cbx_config()['security']['session_lifetime'] ?? 28800);
    $lastActive = (int)($_SESSION['_last_activity'] ?? 0);
    if ($lastActive > 0 && (time() - $lastActive) > $lifetime) {
        cbx_logout_admin();
        return false;
    }
    $_SESSION['_last_activity'] = time();
    return true;
}

function cbx_has_admin_users(): bool
{
    $pdo = cbx_db();
    $count = (int)$pdo->query('SELECT COUNT(*) FROM admin_users WHERE active = 1')->fetchColumn();
    return $count > 0;
}

function cbx_create_initial_admin(string $username, string $displayName, string $password): array
{
    cbx_start_session();
    if (cbx_has_admin_users()) {
        return ['ok' => false, 'error' => 'Administrator account already exists. Please sign in.'];
    }

    $username = trim($username);
    $displayName = cbx_clean_str($displayName !== '' ? $displayName : 'Administrator', 128);
    if (!preg_match('/^[a-zA-Z0-9._-]{3,64}$/', $username)) {
        return ['ok' => false, 'error' => 'Username must be 3–64 characters (letters, numbers, ., _, -).'];
    }
    if (strlen($password) < 12) {
        return ['ok' => false, 'error' => 'Password must be at least 12 characters long.'];
    }

    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    $pdo = cbx_db();
    $stmt = $pdo->prepare(
        'INSERT INTO admin_users (username, password_hash, display_name, active, created_at, last_login_at) VALUES (:u, :h, :d, 1, :ca, :la)'
    );
    $now = cbx_now_iso();
    $stmt->execute([
        ':u' => $username,
        ':h' => $hash,
        ':d' => $displayName,
        ':ca' => $now,
        ':la' => $now,
    ]);

    session_regenerate_id(true);
    $_SESSION['admin_user_id'] = (int)$pdo->lastInsertId();
    $_SESSION['admin_username'] = $username;
    $_SESSION['admin_display_name'] = $displayName;
    $_SESSION['_last_activity'] = time();
    $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));

    return ['ok' => true];
}

function cbx_login_admin(string $username, string $password): bool
{
    cbx_start_session();
    $username = trim($username);
    if ($username === '' || $password === '') {
        return false;
    }

    $pdo = cbx_db();
    $stmt = $pdo->prepare(
        'SELECT id, username, password_hash, display_name, active FROM admin_users WHERE username = :username LIMIT 1'
    );
    $stmt->execute([':username' => $username]);
    $user = $stmt->fetch();

    if (!$user || !(int)$user['active']) {
        return false;
    }

    if (!password_verify($password, (string)$user['password_hash'])) {
        return false;
    }

    session_regenerate_id(true);
    $_SESSION['admin_user_id'] = (int)$user['id'];
    $_SESSION['admin_username'] = (string)$user['username'];
    $_SESSION['admin_display_name'] = (string)$user['display_name'];
    $_SESSION['_last_activity'] = time();
    $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));

    $upd = $pdo->prepare('UPDATE admin_users SET last_login_at = :ts WHERE id = :id');
    $upd->execute([':ts' => cbx_now_iso(), ':id' => (int)$user['id']]);

    return true;
}

function cbx_logout_admin(): void
{
    cbx_start_session();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            (bool)$params['secure'],
            (bool)$params['httponly']
        );
    }
    session_destroy();
}

function cbx_require_admin_page(): void
{
    if (!cbx_is_admin()) {
        header('Location: /admin/login', true, 302);
        exit;
    }
}

function cbx_require_admin_api(?array $body = null, bool $requireCsrf = true): void
{
    if (!cbx_is_admin()) {
        cbx_json_response(['detail' => 'Authentication required. Please log in at /admin/login.'], 401);
    }
    if ($requireCsrf && !cbx_verify_csrf($body)) {
        cbx_json_response(['detail' => 'Invalid or missing CSRF token. Refresh the page and try again.'], 403);
    }
}

function cbx_send_security_headers(): void
{
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('Referrer-Policy: strict-origin-when-cross-origin');
}

function cbx_json_response(mixed $data, int $status = 200): never
{
    http_response_code($status);
    cbx_send_security_headers();
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function cbx_json_input(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function cbx_clean_str(mixed $value, int $maxLen = 2000): string
{
    $str = trim((string)$value);
    $str = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $str) ?? '';
    if (function_exists('mb_substr')) {
        return mb_substr($str, 0, $maxLen, 'UTF-8');
    }
    return substr($str, 0, $maxLen);
}

function cbx_dispatch_notification_email(string $subject, string $body, string $replyTo = '', string $toOverride = ''): bool
{
    $mailCfg = cbx_config()['mail'] ?? [];
    $to = $toOverride !== '' ? $toOverride : (string)($mailCfg['to_email'] ?? 'info@coolerboxicehub.com');
    $from = (string)($mailCfg['from_email'] ?? 'info@coolerboxicehub.com');
    $fromName = (string)($mailCfg['from_name'] ?? 'The CoolerBox Ice Hub');
    $smtpPass = (string)($mailCfg['smtp_pass'] ?? '');

    if ($smtpPass !== '' && !str_starts_with($smtpPass, 'REPLACE_WITH_')) {
        $smtpError = null;
        return cbx_send_smtp_mail($to, $subject, $body, $replyTo, $smtpError);
    }

    if ((cbx_config()['app_env'] ?? 'production') === 'local_test') {
        return false;
    }

    $safeSubject = str_replace(["\r", "\n"], ' ', $subject);
    $safeReplyTo = str_replace(["\r", "\n"], '', $replyTo);
    $headers = [
        "From: {$fromName} <{$from}>",
        "MIME-Version: 1.0",
        "Content-Type: text/plain; charset=UTF-8",
    ];
    if ($safeReplyTo !== '' && filter_var($safeReplyTo, FILTER_VALIDATE_EMAIL)) {
        $headers[] = "Reply-To: {$safeReplyTo}";
    }

    return @mail($to, $safeSubject, $body, implode("\r\n", $headers));
}

function cbx_send_contact_email(
    string $reference,
    string $name,
    string $phone,
    string $email,
    string $subject,
    string $message
): bool {
    $safeSubject = str_replace(["\r", "\n"], ' ', "[CoolerBox Enquiry {$reference}] {$subject}");
    $body = implode("\n", [
        "New website enquiry received on The CoolerBox Ice Hub",
        "Reference: {$reference}",
        "Name: {$name}",
        "Phone / WhatsApp: {$phone}",
        "Email: {$email}",
        "Subject: {$subject}",
        "",
        "Message:",
        $message,
        "",
        "Submitted at: " . cbx_now_iso(),
    ]);

    return cbx_dispatch_notification_email($safeSubject, $body, $email);
}

function cbx_send_order_email(
    string $reference,
    string $name,
    string $phone,
    string $email,
    int $totalCents,
    array $items,
    array $details
): bool {
    $itemLines = [];
    foreach ($items as $it) {
        $itemName = (string)($it['name'] ?? ($it['id'] ?? 'Item'));
        $qty = (int)($it['quantity'] ?? ($it['qty'] ?? 0));
        $itemLines[] = " - {$itemName} x {$qty}";
    }

    $safeSubject = "[CoolerBox Order / Quote {$reference}] {$name}";
    $body = implode("\n", [
        "New order / quote request received on The CoolerBox Ice Hub",
        "Reference: {$reference}",
        "Customer: {$name}",
        "Phone / WhatsApp: {$phone}",
        "Email: " . ($email !== '' ? $email : 'Not provided'),
        "Estimated Total: N$" . number_format($totalCents / 100, 2),
        "",
        "Items:",
        $itemLines ? implode("\n", $itemLines) : " - Custom quote / enquiry",
        "",
        "Details: " . json_encode($details, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
        "Submitted at: " . cbx_now_iso(),
    ]);

    return cbx_dispatch_notification_email($safeSubject, $body, $email);
}

