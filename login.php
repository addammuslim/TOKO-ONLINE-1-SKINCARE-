<?php
/**
 * AURA BOTANICA - Customer Login
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';

if (is_user_logged_in()) {
    redirect('/account');
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');

    $result = user_login($email, $password);
    if ($result['success']) {
        set_flash('success', 'Selamat datang kembali, ' . e($result['user']['name']) . '!');
        redirect('/account');
    } else {
        $error = $result['message'];
    }
}

$customMeta = ['title' => 'Masuk ke Akun - AURA BOTANICA'];
require_once __DIR__ . '/includes/header.php';
?>

<div class="container" style="padding: 70px 20px 100px; max-width: 460px;">
    <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 12px; padding: 40px; box-shadow: var(--shadow-subtle);">
        <h1 style="font-size: 28px; text-align: center; margin-bottom: 8px;">Masuk ke Akun</h1>
        <p style="text-align: center; color: var(--color-text-muted); font-size: 14px; margin-bottom: 28px;">
            Akses riwayat pesanan dan penawaran eksklusif member.
        </p>

        <?php if (!empty($error)): ?>
            <div style="background: #FEE2E2; color: #DC2626; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; font-size: 13.5px;">
                <?= e($error) ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="<?= BASE_URL ?>/login.php">
            <?= csrf_field() ?>
            <div style="margin-bottom: 16px;">
                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Email</label>
                <input type="email" name="email" required placeholder="nama@email.com" value="<?= e($_POST['email'] ?? 'anindya@gmail.com') ?>" style="width: 100%; padding: 11px 14px; border: 1px solid var(--color-border); border-radius: 4px; font-size: 14px;">
            </div>

            <div style="margin-bottom: 24px;">
                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Password</label>
                <input type="password" name="password" required value="password123" placeholder="••••••••" style="width: 100%; padding: 11px 14px; border: 1px solid var(--color-border); border-radius: 4px; font-size: 14px;">
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 13px; font-size: 14.5px;">
                Masuk
            </button>
        </form>

        <div style="text-align: center; margin-top: 24px; font-size: 13.5px; color: var(--color-text-muted);">
            Belum punya akun? <a href="<?= BASE_URL ?>/register.php" style="color: var(--color-text-main); font-weight: 600; text-decoration: underline;">Daftar Sekarang</a>
        </div>
        
        <div style="margin-top: 20px; padding: 12px; background: #FAF8F5; border-radius: 6px; font-size: 12px; color: #736B63;">
            💡 <strong>Demo Akun Customer:</strong><br>
            Email: <code>anindya@gmail.com</code> | Password: <code>password123</code>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
