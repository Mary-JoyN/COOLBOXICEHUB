<?php
declare(strict_types=1);

/**
 * CoolerBox Ice Hub — Active Runtime Configuration
 *
 * Replace the placeholder values below with your Hostinger hPanel MySQL & SMTP
 * credentials before uploading, or provide them via environment variables.
 * Never commit real production passwords to version control.
 */

return [
    'app_env' => getenv('APP_ENV') ?: 'production',
    'app_url' => getenv('APP_URL') ?: 'https://coolerboxicehub.com',
    'timezone' => 'Africa/Windhoek',


    'db' => [
        'driver' => 'mysql',
        'host' => 'localhost',
        'port' => 3306,
        'database' => 'u804115636_cYa1V',
        'username' => 'u804115636_Pz5VA',
        'password' => 'gEwkoc-9siqjo-cyxjis',
        'charset' => 'utf8mb4',
        'sqlite_path' => __DIR__ . '/../../database/local_test.db',
    ],


    'mail' => [
        'from_email' => getenv('MAIL_FROM_EMAIL') ?: 'info@coolerboxicehub.com',
        'from_name' => getenv('MAIL_FROM_NAME') ?: 'The CoolerBox Ice Hub',
        'to_email' => getenv('CONTACT_TO_EMAIL') ?: 'info@coolerboxicehub.com',
        'smtp_host' => getenv('SMTP_HOST') ?: 'smtp.hostinger.com',
        'smtp_port' => (int) (getenv('SMTP_PORT') ?: 465),
        'smtp_user' => getenv('SMTP_USER') ?: 'info@coolerboxicehub.com',
        'smtp_pass' => getenv('SMTP_PASS') ?: 'REPLACE_WITH_SMTP_PASSWORD',
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
