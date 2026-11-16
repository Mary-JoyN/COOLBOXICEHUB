<?php
declare(strict_types=1);

/**
 * CoolerBox Ice Hub — Front Controller
 * Routes public pages, admin portal, static assets, and /api/* endpoints.
 */

require_once __DIR__ . '/includes/security.php';
require_once __DIR__ . '/includes/api_router.php';

$uri = (string)($_SERVER['REQUEST_URI'] ?? '/');
$path = parse_url($uri, PHP_URL_PATH) ?: '/';
$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));

// Serve static files when running under PHP's built-in dev server or fallback
if (php_sapi_name() === 'cli-server' || !str_starts_with($path, '/api')) {
    $staticFile = cbx_resolve_static_file($path);
    if ($staticFile !== null) {
        cbx_serve_static($staticFile);
    }
}

// API routes
if (str_starts_with($path, '/api/') || $path === '/api') {
    cbx_handle_api($path, $method);
}

// Redirects preserved from FastAPI (L01 canonical routes)
if ($path === '/calculator' || $path === '/estimator' || $path === '/shop') {
    header('Location: /products', true, 302);
    exit;
}

if ($path === '/about') {
    header('Location: /#about', true, 302);
    exit;
}

// Admin authentication routes
if ($path === '/admin/login') {
    cbx_send_security_headers();
    require __DIR__ . '/views/admin-login.php';
    exit;
}

if ($path === '/admin/logout') {
    cbx_logout_admin();
    header('Location: /admin/login', true, 302);
    exit;
}

if ($path === '/admin' || $path === '/dashboard') {
    cbx_require_admin_page();
    cbx_send_security_headers();
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    require __DIR__ . '/views/admin.php';
    exit;
}

// Public PHP template routes
$routeMap = [
    '/' => 'index.php',
    '/index.html' => 'index.php',
    '/order' => 'order.php',
    '/shop' => 'shop.php',
    '/products' => 'shop.php',
    '/services' => 'services.php',
    '/hire' => 'services.php',
    '/business' => 'services.php',
    '/events' => 'services.php',
    '/contact' => 'contact.php',
    '/track' => 'track.php',
    '/reviews' => 'reviews.php',
    '/news' => 'news.php',
    '/questions' => 'questions.php',
    '/privacy' => 'privacy.php',
];

$normalized = $path !== '/' ? rtrim($path, '/') : '/';
if (isset($routeMap[$normalized])) {
    $viewPath = __DIR__ . '/views/' . $routeMap[$normalized];
    if (is_file($viewPath)) {
        cbx_send_security_headers();
        header('Content-Type: text/html; charset=utf-8');
        header('Cache-Control: no-cache');
        require $viewPath;
        exit;
    }
}

http_response_code(404);
cbx_send_security_headers();
header('Content-Type: text/html; charset=utf-8');
echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Page Not Found — The CoolerBox Ice Hub</title></head>'
    . '<body style="font-family:Inter,system-ui,sans-serif;text-align:center;padding:4rem;color:#0B3861;">'
    . '<h1>404 — Page Not Found</h1><p>The page you requested could not be found.</p>'
    . '<p><a href="/" style="color:#0095D9;font-weight:600;">Return to Home</a></p></body></html>';
exit;

function cbx_resolve_static_file(string $path): ?string
{
    $clean = rawurldecode($path);
    if (str_contains($clean, '..')) {
        return null;
    }

    $candidates = [];
    if (str_starts_with($clean, '/static/')) {
        $candidates[] = __DIR__ . $clean;
    } elseif (str_starts_with($clean, '/assets/')) {
        $candidates[] = __DIR__ . '/static' . $clean;
    } elseif (str_starts_with($clean, '/uploads/')) {
        $candidates[] = __DIR__ . $clean;
    } elseif (preg_match('/\.(css|js|png|jpg|jpeg|webp|svg|ico|mp4|webm|woff2?)$/i', $clean)) {
        $candidates[] = __DIR__ . '/static' . $clean;
    }

    foreach ($candidates as $candidate) {
        $real = realpath($candidate);
        $baseStatic = realpath(__DIR__ . '/static');
        $baseUploads = realpath(__DIR__ . '/uploads');
        if ($real !== false && is_file($real)) {
            if (($baseStatic !== false && str_starts_with($real, $baseStatic))
                || ($baseUploads !== false && str_starts_with($real, $baseUploads))) {
                return $real;
            }
        }
    }
    return null;
}

function cbx_serve_static(string $filePath): never
{
    $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    $mimes = [
        'css' => 'text/css; charset=utf-8',
        'js' => 'application/javascript; charset=utf-8',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'webp' => 'image/webp',
        'svg' => 'image/svg+xml',
        'ico' => 'image/x-icon',
        'mp4' => 'video/mp4',
        'webm' => 'video/webm',
        'pdf' => 'application/pdf',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
    ];
    header('Content-Type: ' . ($mimes[$ext] ?? 'application/octet-stream'));
    if ($ext === 'css' || $ext === 'js') {
        header('Cache-Control: no-cache');
    } else {
        header('Cache-Control: public, max-age=86400');
    }
    readfile($filePath);
    exit;
}

