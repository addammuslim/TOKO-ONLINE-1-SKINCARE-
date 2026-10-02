<?php
/**
 * AURA BOTANICA - Admin Login
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

if (is_admin_logged_in()) {
    redirect('/admin/');
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');

    $result = admin_login($email, $password);
    if ($result['success']) {
        redirect('/admin/');
    } else {
        $error = $result['message'];
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - AURA BOTANICA</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/admin.css">
    <style>
        body { background: #1F1C1A; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        .login-box { background: #FFFFFF; width: 100%; max-width: 420px; border-radius: 12px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
        .btn-submit { background: #9B786F; color: #fff; width: 100%; padding: 13px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; }
        .btn-submit:hover { background: #7D5D55; }
    </style>
</head>
<body>
    <div class="login-box">
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-family: Georgia, serif; font-size: 24px; font-weight: 700; letter-spacing: 0.1em; color: #1F1C1A;">AURA BOTANICA</div>
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #736B63; margin-top: 4px;">Admin Portal Access</div>
        </div>

        <?php if (!empty($error)): ?>
            <div style="background: #FEE2E2; color: #DC2626; padding: 12px; border-radius: 6px; margin-bottom: 20px; font-size: 13px;">
                <?= e($error) ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="<?= BASE_URL ?>/admin/login.php">
            <?= csrf_field() ?>
            <div style="margin-bottom: 16px;">
                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px; color: #333;">Email Admin</label>
                <input type="email" name="email" required value="superadmin@aurabotanica.com" style="width: 100%; box-sizing: border-box; padding: 10px 14px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;">
            </div>

            <div style="margin-bottom: 24px;">
                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px; color: #333;">Password</label>
                <input type="password" name="password" required value="password123" style="width: 100%; box-sizing: border-box; padding: 10px 14px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px;">
            </div>

            <button type="submit" class="btn-submit">Masuk ke Dashboard</button>
        </form>

        <div style="margin-top: 24px; padding: 12px; background: #F9FAFB; border-radius: 6px; font-size: 12px; color: #4B5563;">
            🔐 <strong>Kredensial Demo:</strong><br>
            Email: <code>superadmin@aurabotanica.com</code><br>
            Password: <code>password123</code>
        </div>
    </div>
</body>
</html>
