<?php
declare(strict_types=1);

/**
 * CoolerBox Ice Hub — Active Runtime Configuration
 *
 * Update the database and mail values below with your Hostinger hPanel credentials
 * before uploading to public_html/config/config.php, or provide them via environment variables.
 */

return [
    'app_env' => getenv('APP_ENV') ?: 'production',
    'app_url' => getenv('APP_URL') ?: 'https://coolerboxicehub.com',
    'timezone' => 'Africa/Windhoek',

    'db' => [
        'driver' => getenv('DB_DRIVER') ?: 'mysql',
        'host' => getenv('DB_HOST') ?: 'localhost',
        'port' => (int)(getenv('DB_PORT') ?: 3306),
        'database' => getenv('DB_NAME') ?: 'u000000000_coolerbox',
        'username' => getenv('DB_USER') ?: 'u000000000_cbxadmin',
        'password' => getenv('DB_PASS') ?: 'REPLACE_WITH_STRONG_DB_PASSWORD',
        'charset' => 'utf8mb4',
        'sqlite_path' => getenv('SQLITE_PATH') ?: __DIR__ . '/../../database/local_test.db',
    ],

    'mail' => [
        'from_email' => getenv('MAIL_FROM_EMAIL') ?: 'info@coolerboxicehub.com',
        'from_name' => getenv('MAIL_FROM_NAME') ?: 'The CoolerBox Ice Hub',
        'to_email' => getenv('CONTACT_TO_EMAIL') ?: 'info@coolerboxicehub.com',
        'smtp_host' => getenv('SMTP_HOST') ?: 'smtp.hostinger.com',
        'smtp_port' => (int)(getenv('SMTP_PORT') ?: 465),
        'smtp_user' => getenv('SMTP_USER') ?: 'info@coolerboxicehub.com',
        'smtp_pass' => getenv('SMTP_PASS') ?: '',
    ],

    'security' => [
        'session_name' => 'cbx_admin_session',
        'session_lifetime' => 28800,
        'csrf_token_name' => '_csrf',
    ],

    'uploads' => [
        'dir' => __DIR__ . '/../uploads',
        'max_bytes' => 5 * 1024 * 1024,
    ],
];

