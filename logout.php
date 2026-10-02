<?php
/**
 * AURA BOTANICA - Logout Handler
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';

user_logout();
set_flash('info', 'Anda telah berhasil keluar dari akun.');
redirect('/');
