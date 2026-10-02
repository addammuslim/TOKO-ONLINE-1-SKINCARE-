<?php
/**
 * AURA BOTANICA - Global Configuration
 */

// Start session if not started yet
if (session_status() === PHP_SESSION_NONE) {
    // Secure session cookie settings
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    session_start();
}

// Environment & Error Reporting (Set false on production)
define('APP_DEBUG', true);
if (APP_DEBUG) {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
}

// Database Credentials (Standard XAMPP / Localhost defaults)
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : '');
define('DB_NAME', getenv('DB_NAME') ?: 'aura_botanica');
define('DB_PORT', (int)(getenv('DB_PORT') ?: 3306));

// Base URL calculation (Autodetect for localhost/XAMPP or live domain)
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? ''));
$rootPath = preg_replace('/\/admin.*$/', '', $scriptDir);
define('BASE_URL', rtrim($protocol . $host . $rootPath, '/'));

// Directory Paths
define('ROOT_PATH', dirname(__DIR__));
define('UPLOAD_DIR', ROOT_PATH . '/uploads/');
define('UPLOAD_URL', BASE_URL . '/uploads/');

// Site Defaults
define('APP_NAME', 'AURA BOTANICA');
define('APP_TAGLINE', 'Haute Botanical Skincare & Barrier Therapy');
define('DEFAULT_CURRENCY', 'Rp');
define('CSRF_TOKEN_KEY', '_aura_csrf_token');

// Timezone
date_default_timezone_set('Asia/Jakarta');
