<?php
declare(strict_types=1);

/**
 * CoolerBox Ice Hub — PHP API Router (/api/*)
 * Replaces FastAPI /api/* routes for Hostinger Shared Hosting.
 */

require_once __DIR__ . '/security.php';

function cbx_handle_api(string $path, string $method): never
{
    $pdo = cbx_db();
    $sub = preg_replace('#^/api/?#', '', $path) ?? '';
    $sub = trim($sub, '/');
    $parts = $sub === '' ? [] : explode('/', $sub);

    // 1. Health check
    if ($sub === 'health' && $method === 'GET') {
        $pdo->query('SELECT 1');
        cbx_json_response(['ok' => true, 'engine' => 'php-pdo', 'timestamp' => cbx_now_iso()]);
    }

    // 2. CSRF & Auth endpoints
    if ($sub === 'csrf-token' && $method === 'GET') {
        cbx_json_response([
            'csrfToken' => cbx_csrf_token(),
            'authenticated' => cbx_is_admin(),
            'needsSetup' => !cbx_has_admin_users(),
        ]);
    }

    if ($sub === 'admin/setup' && $method === 'POST') {
        $body = cbx_json_input();
        if (!cbx_verify_csrf($body)) {
            cbx_json_response(['detail' => 'Invalid CSRF token'], 403);
        }
        $res = cbx_create_initial_admin(
            cbx_clean_str($body['username'] ?? '', 64),
            cbx_clean_str($body['displayName'] ?? 'CoolerBox Admin', 128),
            (string)($body['password'] ?? '')
        );
        if (!$res['ok']) {
            cbx_json_response(['detail' => $res['error']], 403);
        }
        cbx_json_response(['ok' => true, 'csrfToken' => cbx_csrf_token(), 'username' => $_SESSION['admin_username']], 201);
    }

    if ($sub === 'admin/login' && $method === 'POST') {
        $body = cbx_json_input();
        if (!cbx_verify_csrf($body)) {
            cbx_json_response(['detail' => 'Invalid CSRF token'], 403);
        }
        $username = cbx_clean_str($body['username'] ?? '', 64);
        $password = (string)($body['password'] ?? '');
        if (!cbx_login_admin($username, $password)) {
            cbx_json_response(['detail' => 'Invalid username or password'], 401);
        }
        cbx_json_response(['ok' => true, 'csrfToken' => cbx_csrf_token(), 'username' => $_SESSION['admin_username']]);
    }

    if ($sub === 'admin/logout' && $method === 'POST') {
        $body = cbx_json_input();
        if (!cbx_verify_csrf($body)) {
            cbx_json_response(['detail' => 'Invalid CSRF token'], 403);
        }
        cbx_logout_admin();
        cbx_json_response(['ok' => true]);
    }

    // 3. Catalogue (Products)
    if ($sub === 'catalogue' && $method === 'GET') {
        $activeOnly = (($_GET['active'] ?? '') === 'true' || ($_GET['active'] ?? '') === '1');
        $rows = $pdo->query('SELECT id, data_json, updated_at FROM catalogue ORDER BY id ASC')->fetchAll();
        $items = [];
        foreach ($rows as $row) {
            $data = json_decode((string)$row['data_json'], true);
            if (!is_array($data)) {
                continue;
            }
            $data['id'] = $row['id'];
            $data['updatedAt'] = $row['updated_at'];
            if ($activeOnly && !($data['active'] ?? true)) {
                continue;
            }
            $items[] = $data;
        }
        cbx_json_response($items);
    }

    if (count($parts) === 2 && $parts[0] === 'catalogue' && $method === 'GET') {
        $stmt = $pdo->prepare('SELECT id, data_json, updated_at FROM catalogue WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $parts[1]]);
        $row = $stmt->fetch();
        if (!$row) {
            cbx_json_response(['detail' => 'Product not found'], 404);
        }
        $data = json_decode((string)$row['data_json'], true) ?: [];
        $data['id'] = $row['id'];
        $data['updatedAt'] = $row['updated_at'];
        cbx_json_response($data);
    }

    if ($sub === 'catalogue' && $method === 'POST') {
        $body = cbx_json_input();
        cbx_require_admin_api($body, true);

        $name = cbx_clean_str($body['name'] ?? '', 255);
        if ($name === '') {
            cbx_json_response(['detail' => 'Product name is required'], 422);
        }
        $rawId = cbx_clean_str($body['id'] ?? '', 128);
        $slug = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $rawId !== '' ? $rawId : $name) ?? '', '-'));
        if ($slug === '') {
            $slug = 'product-' . bin2hex(random_bytes(3));
        }

        $price = is_numeric($body['price'] ?? null) ? (float)$body['price'] : 0.0;
        $priceLabel = cbx_clean_str($body['priceLabel'] ?? '', 128);
        if ($priceLabel === '') {
            $priceLabel = $price > 0 ? ('N$' . number_format($price, 2)) : 'Custom Quote';
        }

        $payload = [
            'id' => $slug,
            'name' => $name,
            'category' => cbx_clean_str($body['category'] ?? 'Ice Products', 128),
            'unit' => cbx_clean_str($body['unit'] ?? 'unit', 128),
            'price' => $price,
            'priceLabel' => $priceLabel,
            'description' => cbx_clean_str($body['description'] ?? '', 2000),
            'imageUrl' => cbx_clean_str($body['imageUrl'] ?? '/assets/logo-primary.jpeg', 512),
            'active' => (bool)($body['active'] ?? true),
            'showInEstimator' => (bool)($body['showInEstimator'] ?? true),
        ];

        $now = cbx_now_iso();
        $stmt = $pdo->prepare('SELECT id FROM catalogue WHERE id = :id');
        $stmt->execute([':id' => $slug]);
        if ($stmt->fetch()) {
            $upd = $pdo->prepare('UPDATE catalogue SET data_json = :json, updated_at = :ts WHERE id = :id');
            $upd->execute([':json' => json_encode($payload, JSON_UNESCAPED_SLASHES), ':ts' => $now, ':id' => $slug]);
        } else {
            $ins = $pdo->prepare('INSERT INTO catalogue (id, data_json, updated_at) VALUES (:id, :json, :ts)');
            $ins->execute([':id' => $slug, ':json' => json_encode($payload, JSON_UNESCAPED_SLASHES), ':ts' => $now]);
        }
        $payload['updatedAt'] = $now;
        cbx_json_response(['item' => $payload], 201);
    }

    if (count($parts) === 2 && $parts[0] === 'catalogue' && $method === 'PATCH') {
        $body = cbx_json_input();
        cbx_require_admin_api($body, true);

        $id = $parts[1];
        $stmt = $pdo->prepare('SELECT id, data_json FROM catalogue WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        if (!$row) {
            cbx_json_response(['detail' => 'Product not found'], 404);
        }
        $existing = json_decode((string)$row['data_json'], true) ?: ['id' => $id];
        foreach (['name', 'category', 'unit', 'priceLabel', 'description', 'imageUrl'] as $field) {
            if (array_key_exists($field, $body)) {
                $existing[$field] = cbx_clean_str($body[$field], 2000);
            }
        }
        if (array_key_exists('price', $body) && is_numeric($body['price'])) {
            $existing['price'] = (float)$body['price'];
        }
        if (array_key_exists('active', $body)) {
            $existing['active'] = (bool)$body['active'];
        }
        if (array_key_exists('showInEstimator', $body)) {
            $existing['showInEstimator'] = (bool)$body['showInEstimator'];
        }
        $now = cbx_now_iso();
        $upd = $pdo->prepare('UPDATE catalogue SET data_json = :json, updated_at = :ts WHERE id = :id');
        $upd->execute([':json' => json_encode($existing, JSON_UNESCAPED_SLASHES), ':ts' => $now, ':id' => $id]);
        $existing['updatedAt'] = $now;
        cbx_json_response(['item' => $existing]);
    }

    if (count($parts) === 2 && $parts[0] === 'catalogue' && $method === 'DELETE') {
        $body = cbx_json_input();
        cbx_require_admin_api($body, true);
        $stmt = $pdo->prepare('DELETE FROM catalogue WHERE id = :id');
        $stmt->execute([':id' => $parts[1]]);
        cbx_json_response(['deleted' => true, 'id' => $parts[1]]);
    }

    // 4. Services CRUD (Business & Events offerings)
    if ($sub === 'services' && $method === 'GET') {
        $activeOnly = (($_GET['active'] ?? '') === 'true' || ($_GET['active'] ?? '') === '1');
        $sql = 'SELECT id, title, category, price_label, summary, details_json, image_url, active, sort_order, updated_at FROM services';
        if ($activeOnly) {
            $sql .= ' WHERE active = 1';
        }
        $sql .= ' ORDER BY sort_order ASC, title ASC';
        $rows = $pdo->query($sql)->fetchAll();
        $items = array_map(static function (array $r): array {
            return [
                'id' => $r['id'],
                'title' => $r['title'],
                'category' => $r['category'],
                'priceLabel' => $r['price_label'],
                'summary' => $r['summary'],
                'details' => json_decode((string)$r['details_json'], true) ?: [],
                'imageUrl' => $r['image_url'],
                'active' => (bool)$r['active'],
                'sortOrder' => (int)$r['sort_order'],
                'updatedAt' => $r['updated_at'],
            ];
        }, $rows);
        cbx_json_response(['items' => $items]);
    }

    if ($sub === 'services' && $method === 'POST') {
        $body = cbx_json_input();
        cbx_require_admin_api($body, true);

        $title = cbx_clean_str($body['title'] ?? '', 255);
        if ($title === '') {
            cbx_json_response(['detail' => 'Service title is required'], 422);
        }
        $rawId = cbx_clean_str($body['id'] ?? '', 128);
        $id = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $rawId !== '' ? $rawId : $title) ?? '', '-'));
        if ($id === '') {
            $id = 'service-' . bin2hex(random_bytes(3));
        }

        $details = is_array($body['details'] ?? null) ? array_values(array_map(fn($d) => cbx_clean_str($d, 300), $body['details'])) : [];
        $now = cbx_now_iso();

        $check = $pdo->prepare('SELECT id FROM services WHERE id = :id');
        $check->execute([':id' => $id]);
        if ($check->fetch()) {
            $stmt = $pdo->prepare(
                'UPDATE services SET title=:title, category=:cat, price_label=:pl, summary=:sum, details_json=:det, image_url=:img, active=:act, sort_order=:ord, updated_at=:ts WHERE id=:id'
            );
        } else {
            $stmt = $pdo->prepare(
                'INSERT INTO services (id, title, category, price_label, summary, details_json, image_url, active, sort_order, updated_at) VALUES (:id, :title, :cat, :pl, :sum, :det, :img, :act, :ord, :ts)'
            );
        }
        $stmt->execute([
            ':id' => $id,
            ':title' => $title,
            ':cat' => cbx_clean_str($body['category'] ?? 'Business & Events', 128),
            ':pl' => cbx_clean_str($body['priceLabel'] ?? 'Custom Quote', 128),
            ':sum' => cbx_clean_str($body['summary'] ?? '', 2000),
            ':det' => json_encode($details, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            ':img' => cbx_clean_str($body['imageUrl'] ?? '/assets/logo-primary.jpeg', 512),
            ':act' => ($body['active'] ?? true) ? 1 : 0,
            ':ord' => (int)($body['sortOrder'] ?? 0),
            ':ts' => $now,
        ]);

        cbx_json_response([
            'item' => [
                'id' => $id,
                'title' => $title,
                'category' => cbx_clean_str($body['category'] ?? 'Business & Events', 128),
                'priceLabel' => cbx_clean_str($body['priceLabel'] ?? 'Custom Quote', 128),
                'summary' => cbx_clean_str($body['summary'] ?? '', 2000),
                'details' => $details,
                'imageUrl' => cbx_clean_str($body['imageUrl'] ?? '/assets/logo-primary.jpeg', 512),
                'active' => (bool)($body['active'] ?? true),
                'sortOrder' => (int)($body['sortOrder'] ?? 0),
                'updatedAt' => $now,
            ]
        ], 201);
    }

    if (count($parts) === 2 && $parts[0] === 'services' && $method === 'PATCH') {
        $body = cbx_json_input();
        cbx_require_admin_api($body, true);

        $id = $parts[1];
        $stmt = $pdo->prepare('SELECT * FROM services WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        if (!$row) {
            cbx_json_response(['detail' => 'Service not found'], 404);
        }

        $title = array_key_exists('title', $body) ? cbx_clean_str($body['title'], 255) : $row['title'];
        $cat = array_key_exists('category', $body) ? cbx_clean_str($body['category'], 128) : $row['category'];
        $pl = array_key_exists('priceLabel', $body) ? cbx_clean_str($body['priceLabel'], 128) : $row['price_label'];
        $sum = array_key_exists('summary', $body) ? cbx_clean_str($body['summary'], 2000) : $row['summary'];
        $img = array_key_exists('imageUrl', $body) ? cbx_clean_str($body['imageUrl'], 512) : $row['image_url'];
        $act = array_key_exists('active', $body) ? ($body['active'] ? 1 : 0) : (int)$row['active'];
        $ord = array_key_exists('sortOrder', $body) ? (int)$body['sortOrder'] : (int)$row['sort_order'];
        $det = array_key_exists('details', $body) && is_array($body['details'])
            ? json_encode(array_values(array_map(fn($d) => cbx_clean_str($d, 300), $body['details'])), JSON_UNESCAPED_SLASHES)
            : (string)$row['details_json'];
        $now = cbx_now_iso();

        $upd = $pdo->prepare(
            'UPDATE services SET title=:title, category=:cat, price_label=:pl, summary=:sum, details_json=:det, image_url=:img, active=:act, sort_order=:ord, updated_at=:ts WHERE id=:id'
        );
        $upd->execute([
            ':id' => $id, ':title' => $title, ':cat' => $cat, ':pl' => $pl,
            ':sum' => $sum, ':det' => $det, ':img' => $img, ':act' => $act, ':ord' => $ord, ':ts' => $now,
        ]);

        cbx_json_response([
            'item' => [
                'id' => $id, 'title' => $title, 'category' => $cat, 'priceLabel' => $pl,
                'summary' => $sum, 'details' => json_decode($det, true) ?: [], 'imageUrl' => $img,
                'active' => (bool)$act, 'sortOrder' => $ord, 'updatedAt' => $now,
            ]
        ]);
    }

    if (count($parts) === 2 && $parts[0] === 'services' && $method === 'DELETE') {
        $body = cbx_json_input();
        cbx_require_admin_api($body, true);
        $stmt = $pdo->prepare('DELETE FROM services WHERE id = :id');
        $stmt->execute([':id' => $parts[1]]);
        cbx_json_response(['deleted' => true, 'id' => $parts[1]]);
    }

    // 5. Business & Site Settings
    if ($sub === 'business' && $method === 'GET') {
        $stmt = $pdo->prepare('SELECT value_json FROM settings WHERE `key` = :k LIMIT 1');
        $stmt->execute([':k' => 'business_info']);
        $row = $stmt->fetch();
        $data = $row ? (json_decode((string)$row['value_json'], true) ?: []) : [];
        cbx_json_response($data);
    }

    if ($sub === 'business' && $method === 'PATCH') {
        $body = cbx_json_input();
        cbx_require_admin_api($body, true);
        $stmt = $pdo->prepare('SELECT value_json FROM settings WHERE `key` = :k LIMIT 1');
        $stmt->execute([':k' => 'business_info']);
        $row = $stmt->fetch();
        $existing = $row ? (json_decode((string)$row['value_json'], true) ?: []) : [];
        foreach (['phone', 'whatsapp', 'email', 'location', 'hours', 'mapLink'] as $k) {
            if (array_key_exists($k, $body)) {
                $existing[$k] = cbx_clean_str($body[$k], 500);
            }
        }
        $json = json_encode($existing, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if ($row) {
            $pdo->prepare('UPDATE settings SET value_json = :v WHERE `key` = :k')->execute([':v' => $json, ':k' => 'business_info']);
        } else {
            $pdo->prepare('INSERT INTO settings (`key`, value_json) VALUES (:k, :v)')->execute([':k' => 'business_info', ':v' => $json]);
        }
        cbx_json_response($existing);
    }

    if ($sub === 'settings' && $method === 'GET') {
        $stmt = $pdo->prepare('SELECT value_json FROM settings WHERE `key` = :k LIMIT 1');
        $stmt->execute([':k' => 'site_settings']);
        $row = $stmt->fetch();
        $data = $row ? (json_decode((string)$row['value_json'], true) ?: []) : [];
        cbx_json_response($data);
    }

    if ($sub === 'settings' && $method === 'PATCH') {
        $body = cbx_json_input();
        cbx_require_admin_api($body, true);
        $stmt = $pdo->prepare('SELECT value_json FROM settings WHERE `key` = :k LIMIT 1');
        $stmt->execute([':k' => 'site_settings']);
        $row = $stmt->fetch();
        $existing = $row ? (json_decode((string)$row['value_json'], true) ?: []) : [];
        unset($body['_csrf']);
        foreach ($body as $k => $v) {
            $existing[(string)$k] = is_string($v) ? cbx_clean_str($v, 2000) : $v;
        }
        $json = json_encode($existing, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if ($row) {
            $pdo->prepare('UPDATE settings SET value_json = :v WHERE `key` = :k')->execute([':v' => $json, ':k' => 'site_settings']);
        } else {
            $pdo->prepare('INSERT INTO settings (`key`, value_json) VALUES (:k, :v)')->execute([':k' => 'site_settings', ':v' => $json]);
        }
        cbx_json_response($existing);
    }

    // 6. FAQs & Posts & Showcase
    if ($sub === 'faqs' && $method === 'GET') {
        $rows = $pdo->query('SELECT id, category, question, answer, keywords, source FROM faqs ORDER BY id ASC')->fetchAll();
        cbx_json_response($rows);
    }

    if ($sub === 'posts' && $method === 'GET') {
        $rows = $pdo->query("SELECT * FROM posts WHERE status = 'published' ORDER BY created_at DESC")->fetchAll();
        cbx_json_response($rows);
    }

    if ($sub === 'posts' && $method === 'POST') {
        $body = cbx_json_input();
        cbx_require_admin_api($body, true);
        $title = cbx_clean_str($body['title'] ?? '', 255);
        $postBody = cbx_clean_str($body['body'] ?? '', 5000);
        if ($title === '' || $postBody === '') {
            cbx_json_response(['detail' => 'Title and body are required'], 422);
        }
        $now = cbx_now_iso();
        $id = 'post-' . bin2hex(random_bytes(4));
        $stmt = $pdo->prepare(
            'INSERT INTO posts (id, title, category, body, location, link, image, event_date, status, created_at) VALUES (:id, :t, :c, :b, :loc, :lnk, :img, :ed, :st, :ts)'
        );
        $stmt->execute([
            ':id' => $id,
            ':t' => $title,
            ':c' => cbx_clean_str($body['category'] ?? 'Announcement', 64),
            ':b' => $postBody,
            ':loc' => cbx_clean_str($body['location'] ?? '', 255),
            ':lnk' => cbx_clean_str($body['link'] ?? '', 512),
            ':img' => cbx_clean_str($body['image'] ?? '', 512),
            ':ed' => cbx_clean_str($body['eventDate'] ?? '', 64),
            ':st' => 'published',
            ':ts' => $now,
        ]);
        cbx_json_response(['id' => $id, 'title' => $title, 'category' => cbx_clean_str($body['category'] ?? 'Announcement', 64), 'body' => $postBody, 'status' => 'published', 'created_at' => $now], 201);
    }

    if (count($parts) === 2 && $parts[0] === 'posts' && $method === 'DELETE') {
        $body = cbx_json_input();
        cbx_require_admin_api($body, true);
        $stmt = $pdo->prepare('DELETE FROM posts WHERE id = :id');
        $stmt->execute([':id' => $parts[1]]);
        cbx_json_response(['deleted' => true, 'id' => $parts[1]]);
    }

    if ($sub === 'showcase' && $method === 'GET') {
        $rows = $pdo->query("SELECT * FROM reviews WHERE status = 'published' ORDER BY created_at DESC")->fetchAll();
        cbx_json_response($rows);
    }

    // 7. Reviews
    if ($sub === 'reviews' && $method === 'GET') {
        $rows = $pdo->query("SELECT * FROM reviews WHERE status = 'published' ORDER BY created_at DESC")->fetchAll();
        cbx_json_response($rows);
    }

    if ($sub === 'reviews' && $method === 'POST') {
        $body = cbx_json_input();
        $rating = max(1, min(5, (int)($body['rating'] ?? 5)));
        $comment = cbx_clean_str($body['comment'] ?? '', 2000);
        if ($comment === '') {
            cbx_json_response(['detail' => 'Review comment is required'], 422);
        }
        $now = cbx_now_iso();
        $id = 'rev-' . bin2hex(random_bytes(4));
        $stmt = $pdo->prepare(
            'INSERT INTO reviews (id, rating, title, comment, name, anonymous, reference, permission, status, created_at) VALUES (:id, :r, :t, :c, :n, :a, :ref, :perm, :st, :ts)'
        );
        $stmt->execute([
            ':id' => $id,
            ':r' => $rating,
            ':t' => cbx_clean_str($body['title'] ?? '', 255),
            ':c' => $comment,
            ':n' => cbx_clean_str($body['name'] ?? 'Customer', 255),
            ':a' => !empty($body['anonymous']) ? 1 : 0,
            ':ref' => cbx_clean_str($body['reference'] ?? '', 64),
            ':perm' => !empty($body['permission']) ? 1 : 0,
            ':st' => 'published',
            ':ts' => $now,
        ]);
        cbx_json_response(['ok' => true, 'id' => $id], 201);
    }

    if (count($parts) === 2 && $parts[0] === 'reviews' && $method === 'DELETE') {
        $body = cbx_json_input();
        cbx_require_admin_api($body, true);
        $stmt = $pdo->prepare('DELETE FROM reviews WHERE id = :id');
        $stmt->execute([':id' => (int)$parts[1]]);
        cbx_json_response(['deleted' => true, 'id' => (int)$parts[1]]);
    }

    // 8. Orders & Tracking
    if ($sub === 'my-orders' && $method === 'GET') {
        $ref = cbx_clean_str($_GET['reference'] ?? '', 64);
        $phone = cbx_clean_str($_GET['phone'] ?? '', 64);
        if ($ref === '' && $phone === '') {
            cbx_json_response(['orders' => []]);
        }
        $orders = [];
        if ($ref !== '') {
            $stmt = $pdo->prepare('SELECT * FROM orders WHERE UPPER(reference) = UPPER(:ref) ORDER BY created_at DESC');
            $stmt->execute([':ref' => $ref]);
            $orders = $stmt->fetchAll();
        } else {
            $stmt = $pdo->prepare('SELECT * FROM orders ORDER BY created_at DESC');
            $stmt->execute();
            $digits = preg_replace('/\D+/', '', $phone) ?? '';
            foreach ($stmt->fetchAll() as $row) {
                $cust = json_decode((string)$row['customer_json'], true) ?: [];
                $cDigits = preg_replace('/\D+/', '', (string)($cust['phone'] ?? '')) ?? '';
                if ($digits !== '' && $cDigits !== '' && str_contains($cDigits, $digits)) {
                    $orders[] = $row;
                }
            }
        }
        $mapped = array_map(static fn(array $r) => cbx_format_order($pdo, $r), $orders);
        cbx_json_response(['orders' => $mapped]);
    }

    if ($sub === 'my-orders' && $method === 'PATCH') {
        $body = cbx_json_input();
        $ref = cbx_clean_str($body['reference'] ?? '', 64);
        if ($ref === '') {
            cbx_json_response(['detail' => 'Order reference is required'], 422);
        }
        $stmt = $pdo->prepare('UPDATE updates SET read_at = :ts WHERE UPPER(order_reference) = UPPER(:ref) AND read_at IS NULL');
        $stmt->execute([':ts' => cbx_now_iso(), ':ref' => $ref]);
        cbx_json_response(['ok' => true]);
    }

    if ($sub === 'orders' && $method === 'POST') {
        $body = cbx_json_input();
        $cust = is_array($body['customer'] ?? null) ? $body['customer'] : [];
        $name = cbx_clean_str($cust['name'] ?? ($body['customerName'] ?? ''), 255);
        $phone = cbx_clean_str($cust['phone'] ?? ($body['customerPhone'] ?? ''), 64);
        if ($name === '' || $phone === '') {
            cbx_json_response(['detail' => 'Customer name and phone are required'], 422);
        }

        $items = is_array($body['items'] ?? null) ? $body['items'] : [];
        $totalCents = 0;
        foreach ($items as $it) {
            $qty = max(0, (int)($it['quantity'] ?? ($it['qty'] ?? 0)));
            $unitCents = max(0, (int)($it['unitPriceCents'] ?? round(((float)($it['price'] ?? 0)) * 100)));
            $totalCents += $qty * $unitCents;
        }
        if ($totalCents === 0 && is_numeric($body['totalCents'] ?? null)) {
            $totalCents = max(0, (int)$body['totalCents']);
        }

        $ref = 'CBX-' . gmdate('ym') . '-' . strtoupper(bin2hex(random_bytes(2)));
        $now = cbx_now_iso();
        $details = is_array($body['details'] ?? null) ? $body['details'] : [];

        $stmt = $pdo->prepare(
            'INSERT INTO orders (reference, status, total_cents, customer_json, details_json, items_json, created_at, updated_at) VALUES (:ref, :st, :tc, :cj, :dj, :ij, :ca, :ua)'
        );
        $stmt->execute([
            ':ref' => $ref,
            ':st' => 'Received',
            ':tc' => $totalCents,
            ':cj' => json_encode([
                'name' => $name,
                'phone' => $phone,
                'email' => cbx_clean_str($cust['email'] ?? ($body['customerEmail'] ?? ''), 255),
                'address' => cbx_clean_str($cust['address'] ?? ($details['address'] ?? ''), 500),
            ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            ':dj' => json_encode($details, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            ':ij' => json_encode($items, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            ':ca' => $now,
            ':ua' => $now,
        ]);

        $upd = $pdo->prepare('INSERT INTO updates (order_reference, message, created_at) VALUES (:ref, :msg, :ts)');
        $upd->execute([
            ':ref' => $ref,
            ':msg' => 'Enquiry / order received by The CoolerBox Ice Hub team.',
            ':ts' => $now,
        ]);

        $emailSent = cbx_send_order_email(
            $ref,
            $name,
            $phone,
            cbx_clean_str($cust['email'] ?? ($body['customerEmail'] ?? ''), 255),
            $totalCents,
            $items,
            $details
        );

        cbx_json_response([
            'ok' => true,
            'reference' => $ref,
            'status' => 'Received',
            'totalCents' => $totalCents,
            'emailSent' => $emailSent,
            'createdAt' => $now,
        ], 201);
    }

    if ($sub === 'orders' && $method === 'GET') {
        cbx_require_admin_api(null, false);
        $rows = $pdo->query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 200')->fetchAll();
        $mapped = array_map(static fn(array $r) => cbx_format_order($pdo, $r), $rows);
        cbx_json_response(['orders' => $mapped]);
    }

    if (count($parts) === 2 && $parts[0] === 'orders' && $method === 'GET') {
        cbx_require_admin_api(null, false);
        $stmt = $pdo->prepare('SELECT * FROM orders WHERE UPPER(reference) = UPPER(:ref) LIMIT 1');
        $stmt->execute([':ref' => $parts[1]]);
        $row = $stmt->fetch();
        if (!$row) {
            cbx_json_response(['detail' => 'Order not found'], 404);
        }
        cbx_json_response(cbx_format_order($pdo, $row));
    }

    if (count($parts) === 2 && $parts[0] === 'orders' && $method === 'PATCH') {
        $body = cbx_json_input();
        cbx_require_admin_api($body, true);

        $ref = $parts[1];
        $stmt = $pdo->prepare('SELECT * FROM orders WHERE UPPER(reference) = UPPER(:ref) LIMIT 1');
        $stmt->execute([':ref' => $ref]);
        $row = $stmt->fetch();
        if (!$row) {
            cbx_json_response(['detail' => 'Order not found'], 404);
        }
        $newStatus = cbx_clean_str($body['status'] ?? $row['status'], 64);
        $message = cbx_clean_str($body['message'] ?? "Status updated to {$newStatus}", 1000);
        $now = cbx_now_iso();

        $pdo->prepare('UPDATE orders SET status = :st, updated_at = :ts WHERE reference = :ref')
            ->execute([':st' => $newStatus, ':ts' => $now, ':ref' => $row['reference']]);
        $pdo->prepare('INSERT INTO updates (order_reference, message, created_at) VALUES (:ref, :msg, :ts)')
            ->execute([':ref' => $row['reference'], ':msg' => $message, ':ts' => $now]);

        cbx_json_response(['ok' => true, 'reference' => $row['reference'], 'status' => $newStatus]);
    }

    // 9. Contact & Supplier Applications
    if ($sub === 'supplier-application' && $method === 'POST') {
        $body = cbx_json_input();
        $outletName = cbx_clean_str($body['outletName'] ?? '', 255);
        $outletType = cbx_clean_str($body['outletType'] ?? '', 128);
        $location = cbx_clean_str($body['location'] ?? '', 255);
        $contactName = cbx_clean_str($body['contactName'] ?? '', 255);
        $phone = cbx_clean_str($body['phone'] ?? '', 64);
        $email = cbx_clean_str($body['email'] ?? '', 255);
        $freezerCapacity = cbx_clean_str($body['freezerCapacity'] ?? '', 128);
        $products = is_array($body['products'] ?? null) ? array_map(fn($p) => cbx_clean_str($p, 128), $body['products']) : [];
        $weeklyVolume = cbx_clean_str($body['weeklyVolume'] ?? '', 128);
        $deliveryFreq = cbx_clean_str($body['deliveryFrequency'] ?? '', 128);
        $arrangement = cbx_clean_str($body['arrangement'] ?? 'Supply-only arrangement', 255);
        $notes = cbx_clean_str($body['notes'] ?? '', 3000);

        if ($outletName === '' || $location === '' || $contactName === '' || $phone === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            cbx_json_response(['detail' => 'Please complete all required business and contact fields.'], 422);
        }

        $ref = 'CBX-SUP-' . gmdate('ym') . '-' . strtoupper(bin2hex(random_bytes(2)));
        $now = cbx_now_iso();
        $productsStr = $products ? implode(', ', $products) : 'Not specified';
        $formattedMsg = implode("\n", [
            "Business Partner / Stockist Application ({$ref})",
            "Outlet Name: {$outletName}",
            "Outlet Type: " . ($outletType !== '' ? $outletType : 'Not specified'),
            "Location / Trading Area: {$location}",
            "Contact Person: {$contactName}",
            "Phone / WhatsApp: {$phone}",
            "Email: {$email}",
            "Existing Freezer Capacity: " . ($freezerCapacity !== '' ? $freezerCapacity : 'Not specified'),
            "Products Requested: {$productsStr}",
            "Expected Weekly Volume: " . ($weeklyVolume !== '' ? $weeklyVolume : 'Not specified'),
            "Preferred Delivery Frequency: " . ($deliveryFreq !== '' ? $deliveryFreq : 'Not specified'),
            "Arrangement Requested: {$arrangement}",
            "",
            "Notes:",
            $notes !== '' ? $notes : 'None',
        ]);

        $recipient = 'sebiue@colerboxicehub.com';
        $subject = "Business Partner Application — {$outletName}";
        $emailSent = cbx_dispatch_notification_email("[CoolerBox Supplier {$ref}] {$subject}", $formattedMsg, $email, $recipient);

        $stmt = $pdo->prepare(
            'INSERT INTO contact_messages (reference, name, phone, email, subject, message, email_sent, created_at) VALUES (:ref, :n, :p, :e, :s, :m, :es, :ts)'
        );
        $stmt->execute([
            ':ref' => $ref,
            ':n' => "{$contactName} ({$outletName})",
            ':p' => $phone,
            ':e' => $email,
            ':s' => $subject,
            ':m' => $formattedMsg,
            ':es' => $emailSent ? 1 : 0,
            ':ts' => $now,
        ]);

        cbx_json_response([
            'ok' => true,
            'status' => 'success',
            'reference' => $ref,
            'emailSent' => $emailSent,
            'message' => $emailSent
                ? "Your Business Partner application has been emailed to {$recipient} and saved."
                : "Your Business Partner application has been saved for {$recipient}. Our team will review and contact you.",
            'createdAt' => $now,
        ], 201);
    }

    if ($sub === 'contact' && $method === 'POST') {
        $body = cbx_json_input();
        $name = cbx_clean_str($body['name'] ?? '', 255);
        $phone = cbx_clean_str($body['phone'] ?? '', 64);
        $email = cbx_clean_str($body['email'] ?? '', 255);
        $subject = cbx_clean_str($body['subject'] ?? 'General Enquiry', 255);
        $message = cbx_clean_str($body['message'] ?? '', 4000);

        if ($name === '' || $phone === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $message === '') {
            cbx_json_response(['detail' => 'Please provide valid name, phone, email and message.'], 422);
        }

        $ref = 'CBX-MSG-' . gmdate('ym') . '-' . strtoupper(bin2hex(random_bytes(2)));
        $now = cbx_now_iso();
        $emailSent = cbx_send_contact_email($ref, $name, $phone, $email, $subject, $message);

        $stmt = $pdo->prepare(
            'INSERT INTO contact_messages (reference, name, phone, email, subject, message, email_sent, created_at) VALUES (:ref, :n, :p, :e, :s, :m, :es, :ts)'
        );
        $stmt->execute([
            ':ref' => $ref,
            ':n' => $name,
            ':p' => $phone,
            ':e' => $email,
            ':s' => $subject,
            ':m' => $message,
            ':es' => $emailSent ? 1 : 0,
            ':ts' => $now,
        ]);

        cbx_json_response([
            'ok' => true,
            'reference' => $ref,
            'emailSent' => $emailSent,
            'createdAt' => $now,
        ], 201);
    }

    if ($sub === 'contact' && $method === 'GET') {
        cbx_require_admin_api(null, false);
        $rows = $pdo->query('SELECT id, reference, name, phone, email, subject, message, email_sent, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 200')->fetchAll();
        cbx_json_response(['messages' => $rows]);
    }

    if (count($parts) === 2 && $parts[0] === 'contact' && $method === 'DELETE') {
        $body = cbx_json_input();
        cbx_require_admin_api($body, true);
        $stmt = $pdo->prepare('DELETE FROM contact_messages WHERE id = :id');
        $stmt->execute([':id' => (int)$parts[1]]);
        cbx_json_response(['deleted' => true, 'id' => (int)$parts[1]]);
    }

    // 10. File uploads (Admin product images & Public custom label artwork)
    if ($sub === 'images' && $method === 'POST') {
        cbx_require_admin_api(null, true);
        cbx_handle_upload('file', 'products', ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp']);
    }

    if ($sub === 'artwork' && $method === 'POST') {
        cbx_handle_artwork_upload('file');
    }

    cbx_json_response(['detail' => 'API endpoint not found'], 404);
}

function cbx_format_order(PDO $pdo, array $row): array
{
    $stmt = $pdo->prepare('SELECT id, message, created_at, read_at FROM updates WHERE order_reference = :ref ORDER BY created_at DESC');
    $stmt->execute([':ref' => $row['reference']]);
    $updates = $stmt->fetchAll();

    return [
        'id' => (int)$row['id'],
        'reference' => $row['reference'],
        'status' => $row['status'],
        'totalCents' => (int)$row['total_cents'],
        'customer' => json_decode((string)$row['customer_json'], true) ?: [],
        'details' => json_decode((string)$row['details_json'], true) ?: [],
        'items' => json_decode((string)$row['items_json'], true) ?: [],
        'createdAt' => $row['created_at'],
        'updatedAt' => $row['updated_at'],
        'updates' => $updates,
    ];
}

function cbx_handle_upload(string $field, string $subdir, array $allowedMimes): never
{
    if (empty($_FILES[$field]) || !is_uploaded_file((string)$_FILES[$field]['tmp_name'])) {
        cbx_json_response(['detail' => 'No file uploaded'], 400);
    }

    $file = $_FILES[$field];
    $maxBytes = (int)(cbx_config()['uploads']['max_bytes'] ?? 5242880);
    if ((int)$file['size'] > $maxBytes) {
        cbx_json_response(['detail' => 'File exceeds maximum allowed size (5 MB)'], 413);
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = (string)$finfo->file((string)$file['tmp_name']);
    if (!isset($allowedMimes[$mime])) {
        cbx_json_response(['detail' => 'Unsupported file type: ' . $mime], 415);
    }

    $ext = $allowedMimes[$mime];
    $uploadRoot = rtrim((string)cbx_config()['uploads']['dir'], '/');
    $targetDir = $uploadRoot . '/' . $subdir;
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    $filename = gmdate('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
    $dest = $targetDir . '/' . $filename;
    if (!move_uploaded_file((string)$file['tmp_name'], $dest)) {
        cbx_json_response(['detail' => 'Failed to save uploaded file'], 500);
    }

    cbx_json_response([
        'ok' => true,
        'id' => $filename,
        'name' => $filename,
        'filename' => $filename,
        'url' => '/uploads/' . $subdir . '/' . $filename,
    ], 201);
}

function cbx_handle_artwork_upload(string $field): never
{
    if (empty($_FILES[$field]) || !is_uploaded_file((string)$_FILES[$field]['tmp_name'])) {
        cbx_json_response(['detail' => 'No design file uploaded'], 400);
    }
    $file = $_FILES[$field];
    $maxBytes = 10 * 1024 * 1024;
    if ((int)$file['size'] > $maxBytes) {
        cbx_json_response(['detail' => 'Design file exceeds maximum allowed size (10 MB)'], 413);
    }

    $allowedExts = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'pdf', 'ai', 'eps', 'psd', 'cdr', 'tiff', 'tif', 'zip'];
    $origName = (string)($file['name'] ?? 'design.png');
    $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExts, true)) {
        cbx_json_response(['detail' => 'Unsupported design file extension: .' . $ext], 415);
    }

    $uploadRoot = rtrim((string)cbx_config()['uploads']['dir'], '/');
    $targetDir = $uploadRoot . '/artwork';
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    $filename = gmdate('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
    $dest = $targetDir . '/' . $filename;
    if (!move_uploaded_file((string)$file['tmp_name'], $dest)) {
        cbx_json_response(['detail' => 'Failed to save uploaded design file'], 500);
    }

    cbx_json_response([
        'ok' => true,
        'id' => $filename,
        'name' => $origName,
        'filename' => $filename,
        'url' => '/uploads/artwork/' . $filename,
    ], 201);
}
