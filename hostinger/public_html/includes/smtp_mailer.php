<?php
declare(strict_types=1);

/**
 * CoolerBox Ice Hub — Zero-Dependency SMTP Mailer (SSL/TLS Port 465 & STARTTLS 587)
 *
 * Uses PHP stream_socket_client with OpenSSL so Hostinger authenticated SMTP
 * works reliably without Composer/PHPMailer.
 *
 * SECURITY: Never logs SMTP passwords or authentication payloads.
 */

function cbx_smtp_read_response($socket): array
{
    $lines = [];
    $code = 0;
    while (($line = fgets($socket, 2048)) !== false) {
        $lines[] = rtrim($line, "\r\n");
        if (strlen($line) >= 3 && ctype_digit(substr($line, 0, 3))) {
            $code = (int)substr($line, 0, 3);
            if (!isset($line[3]) || $line[3] === ' ') {
                break;
            }
        } else {
            break;
        }
    }
    return [$code, implode(' | ', $lines)];
}

function cbx_smtp_cmd($socket, string $command, array $expectedCodes, string $logLabel): array
{
    fwrite($socket, $command . "\r\n");
    [$code, $resp] = cbx_smtp_read_response($socket);
    if (!in_array($code, $expectedCodes, true)) {
        return [false, "{$logLabel} failed (HTTP/SMTP {$code}): {$resp}"];
    }
    return [true, $resp];
}

function cbx_send_smtp_mail(
    string $to,
    string $subject,
    string $body,
    string $replyTo = '',
    ?string &$errorOut = null
): bool {
    $mailCfg = cbx_config()['mail'] ?? [];
    $host = trim((string)($mailCfg['smtp_host'] ?? ''));
    $port = (int)($mailCfg['smtp_port'] ?? 465);
    $user = trim((string)($mailCfg['smtp_user'] ?? ''));
    $pass = (string)($mailCfg['smtp_pass'] ?? '');
    $fromEmail = trim((string)($mailCfg['from_email'] ?? $user));
    $fromName = trim((string)($mailCfg['from_name'] ?? 'The CoolerBox Ice Hub'));

    if ($host === '' || $user === '' || $pass === '' || str_starts_with($pass, 'REPLACE_WITH_')) {
        $errorOut = 'SMTP credentials not configured in config.php; skipping SMTP.';
        return false;
    }

    $enc = strtolower(trim((string)($mailCfg['smtp_encryption'] ?? getenv('SMTP_ENCRYPTION') ?: '')));
    $useImplicitSsl = ($port === 465 || $enc === 'ssl');
    $remote = ($useImplicitSsl ? 'ssl://' : 'tcp://') . $host . ':' . $port;

    $verifyPeer = (cbx_config()['app_env'] ?? 'production') !== 'local_test';
    $ctx = stream_context_create([
        'ssl' => [
            'verify_peer' => $verifyPeer,
            'verify_peer_name' => $verifyPeer,
            'allow_self_signed' => !$verifyPeer,
        ],
    ]);

    $errno = 0;
    $errstr = '';
    $socket = @stream_socket_client($remote, $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx);
    if (!$socket) {
        $errorOut = "SMTP connection to {$host}:{$port} failed ({$errno}): {$errstr}";
        error_log('[CoolerBox Mail] ' . $errorOut);
        return false;
    }

    stream_set_timeout($socket, 15);

    try {
        [$greetCode, $greetResp] = cbx_smtp_read_response($socket);
        if ($greetCode !== 220) {
            $errorOut = "SMTP greeting error ({$greetCode}): {$greetResp}";
            error_log('[CoolerBox Mail] ' . $errorOut);
            return false;
        }

        $ehloHost = preg_replace('/[^a-zA-Z0-9.-]/', '', (string)($_SERVER['HTTP_HOST'] ?? 'coolerboxicehub.com')) ?: 'coolerboxicehub.com';
        [$ok, $msg] = cbx_smtp_cmd($socket, "EHLO {$ehloHost}", [250], 'EHLO');
        if (!$ok) {
            $errorOut = $msg;
            error_log('[CoolerBox Mail] ' . $errorOut);
            return false;
        }

        if ($port === 587) {
            [$ok, $msg] = cbx_smtp_cmd($socket, 'STARTTLS', [220], 'STARTTLS');
            if (!$ok) {
                $errorOut = $msg;
                error_log('[CoolerBox Mail] ' . $errorOut);
                return false;
            }
            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT)) {
                $errorOut = 'STARTTLS crypto negotiation failed.';
                error_log('[CoolerBox Mail] ' . $errorOut);
                return false;
            }
            [$ok, $msg] = cbx_smtp_cmd($socket, "EHLO {$ehloHost}", [250], 'EHLO after STARTTLS');
            if (!$ok) {
                $errorOut = $msg;
                error_log('[CoolerBox Mail] ' . $errorOut);
                return false;
            }
        }

        [$ok, $msg] = cbx_smtp_cmd($socket, 'AUTH LOGIN', [334], 'AUTH LOGIN');
        if (!$ok) {
            $errorOut = $msg;
            error_log('[CoolerBox Mail] ' . $errorOut);
            return false;
        }

        [$ok, $msg] = cbx_smtp_cmd($socket, base64_encode($user), [334], 'AUTH USERNAME');
        if (!$ok) {
            $errorOut = $msg;
            error_log('[CoolerBox Mail] ' . $errorOut);
            return false;
        }

        // Send password without ever logging it on failure
        fwrite($socket, base64_encode($pass) . "\r\n");
        [$authCode, $authResp] = cbx_smtp_read_response($socket);
        if ($authCode !== 235) {
            $errorOut = "SMTP authentication failed ({$authCode}): {$authResp}";
            error_log('[CoolerBox Mail] ' . $errorOut);
            return false;
        }

        [$ok, $msg] = cbx_smtp_cmd($socket, "MAIL FROM:<{$fromEmail}>", [250], 'MAIL FROM');
        if (!$ok) {
            $errorOut = $msg;
            error_log('[CoolerBox Mail] ' . $errorOut);
            return false;
        }

        [$ok, $msg] = cbx_smtp_cmd($socket, "RCPT TO:<{$to}>", [250, 251], 'RCPT TO');
        if (!$ok) {
            $errorOut = $msg;
            error_log('[CoolerBox Mail] ' . $errorOut);
            return false;
        }

        [$ok, $msg] = cbx_smtp_cmd($socket, 'DATA', [354], 'DATA');
        if (!$ok) {
            $errorOut = $msg;
            error_log('[CoolerBox Mail] ' . $errorOut);
            return false;
        }

        $safeSubject = str_replace(["\r", "\n"], ' ', $subject);
        $safeReplyTo = str_replace(["\r", "\n"], '', $replyTo);
        $safeFromName = str_replace(["\r", "\n", '"'], '', $fromName);

        $headers = [
            'Date: ' . gmdate('r'),
            "From: \"{$safeFromName}\" <{$fromEmail}>",
            "To: <{$to}>",
            'Subject: =?UTF-8?B?' . base64_encode($safeSubject) . '?=',
            'Message-ID: <' . bin2hex(random_bytes(8)) . '@coolerboxicehub.com>',
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
        ];
        if ($safeReplyTo !== '' && filter_var($safeReplyTo, FILTER_VALIDATE_EMAIL)) {
            $headers[] = "Reply-To: <{$safeReplyTo}>";
        }

        // Normalize CRLF and apply RFC 5321 dot-stuffing
        $normalizedBody = str_replace(["\r\n", "\r"], "\n", $body);
        $lines = explode("\n", $normalizedBody);
        foreach ($lines as &$line) {
            if (str_starts_with($line, '.')) {
                $line = '.' . $line;
            }
        }
        unset($line);

        $payload = implode("\r\n", $headers) . "\r\n\r\n" . implode("\r\n", $lines) . "\r\n.";
        [$ok, $msg] = cbx_smtp_cmd($socket, $payload, [250], 'DATA END');
        if (!$ok) {
            $errorOut = $msg;
            error_log('[CoolerBox Mail] ' . $errorOut);
            return false;
        }

        @cbx_smtp_cmd($socket, 'QUIT', [221], 'QUIT');
        return true;
    } finally {
        fclose($socket);
    }
}

