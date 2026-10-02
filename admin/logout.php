<?php
/**
 * AURA BOTANICA - Admin Logout
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

admin_logout();
redirect('/admin/login.php');
