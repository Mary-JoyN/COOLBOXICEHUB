<?php
declare(strict_types=1);

/**
 * CoolerBox Ice Hub — Hostinger Production Configuration Template
 *
 * Copy this file to config.php and fill in your Hostinger MySQL / SMTP credentials,
 * or set the corresponding environment variables in Hostinger hPanel / .htaccess.
 *
 * SECURITY: Keep this directory protected via .htaccess (Deny from all).
 * Never commit real production credentials to version control.
 */

return [
    'app_env' => getenv('APP_ENV') ?: 'production',
    'app_url' => getenv('APP_URL') ?: 'https://coolerboxicehub.com',
    'timezone' => 'Africa/Windhoek',

    // Database configuration ('mysql' for Hostinger MariaDB/MySQL, 'sqlite' for local testing)
    'db' => [
        'driver' => getenv('DB_DRIVER') ?: 'mysql',
        'host' => getenv('DB_HOST') ?: 'localhost',
        'port' => (int)(getenv('DB_PORT') ?: 3306),
        'database' => getenv('DB_NAME') ?: 'u000000000_coolerbox',
        'username' => getenv('DB_USER') ?: 'u000000000_cbxadmin',
        'password' => getenv('DB_PASS') ?: 'REPLACE_WITH_STRONG_DB_PASSWORD',
        'charset' => 'utf8mb4',
        // Used only when driver === 'sqlite'
        'sqlite_path' => getenv('SQLITE_PATH') ?: __DIR__ . '/../../database/local_test.db',
    ],

    // Email / Contact form settings
    // On Hostinger, PHP mail() or Hostinger SMTP (smtp.hostinger.com:465 SSL) can be used.
    'mail' => [
        'from_email' => getenv('MAIL_FROM_EMAIL') ?: 'info@coolerboxicehub.com',
        'from_name' => getenv('MAIL_FROM_NAME') ?: 'The CoolerBox Ice Hub',
        'to_email' => getenv('CONTACT_TO_EMAIL') ?: 'info@coolerboxicehub.com',
        'smtp_host' => getenv('SMTP_HOST') ?: 'smtp.hostinger.com',
        'smtp_port' => (int)(getenv('SMTP_PORT') ?: 465),
        'smtp_user' => getenv('SMTP_USER') ?: 'info@coolerboxicehub.com',
        'smtp_pass' => getenv('SMTP_PASS') ?: '',
    ],

    // Session & Security
    'security' => [
        'session_name' => 'cbx_admin_session',
        'session_lifetime' => 28800, // 8 hours
        'csrf_token_name' => '_csrf',
    ],

    // Uploads
    'uploads' => [
        'dir' => __DIR__ . '/../uploads',
        'max_bytes' => 5 * 1024 * 1024, // 5 MB
    ],
];
