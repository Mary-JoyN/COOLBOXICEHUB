<?php
declare(strict_types=1);

/**
 * CoolerBox Ice Hub — PDO Database Connection & Helpers
 *
 * Uses prepared statements (ATTR_EMULATE_PREPARES => false) to prevent SQL injection.
 * Supports MySQL/MariaDB in Hostinger production and SQLite for local verification.
 */

function cbx_config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }

    $configPath = __DIR__ . '/../config/config.php';
    $examplePath = __DIR__ . '/../config/config.example.php';
    if (is_file($configPath)) {
        $config = require $configPath;
    } elseif (is_file($examplePath)) {
        $config = require $examplePath;
    } else {
        throw new RuntimeException('Configuration file missing.');
    }

    if (!empty($config['timezone'])) {
        date_default_timezone_set((string)$config['timezone']);
    }

    return $config;
}

function cbx_db(): PDO
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $cfg = cbx_config()['db'];
    $driver = strtolower((string)($cfg['driver'] ?? 'mysql'));

    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    if ($driver === 'sqlite') {
        $sqlitePath = (string)$cfg['sqlite_path'];
        $pdo = new PDO('sqlite:' . $sqlitePath, null, null, $options);
        $pdo->exec('PRAGMA foreign_keys = ON;');
        return $pdo;
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=%s',
        $cfg['host'],
        (int)($cfg['port'] ?? 3306),
        $cfg['database'],
        $cfg['charset'] ?? 'utf8mb4'
    );

    $pdo = new PDO($dsn, (string)$cfg['username'], (string)$cfg['password'], $options);
    return $pdo;
}

function cbx_now_iso(): string
{
    return gmdate('Y-m-d\TH:i:s\Z');
}
