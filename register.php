<?php
/**
 * AURA BOTANICA - Customer Registration
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';

if (is_user_logged_in()) {
    redirect('/account');
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $phone = trim($_POST['phone'] ?? '');

    if (empty($name) || empty($email) || empty($password)) {
        $error = 'Semua kolom wajib diisi.';
    } elseif (strlen($password) < 6) {
        $error = 'Password minimal 6 karakter.';
    } else {
        $result = user_register($name, $email, $password, $phone);
        if ($result['success']) {
            set_flash('success', 'Akun berhasil dibuat! Selamat bergabung di Aura Botanica.');
            redirect('/account');
        } else {
            $error = $result['message'];
        }
    }
}

$customMeta = ['title' => 'Daftar Akun Baru - AURA BOTANICA'];
require_once __DIR__ . '/includes/header.php';
?>

<div class="container" style="padding: 70px 20px 100px; max-width: 480px;">
    <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 12px; padding: 40px; box-shadow: var(--shadow-subtle);">
        <h1 style="font-size: 28px; text-align: center; margin-bottom: 8px;">Daftar Akun Baru</h1>
        <p style="text-align: center; color: var(--color-text-muted); font-size: 14px; margin-bottom: 28px;">
            Dapatkan voucher diskon 10% dan kumpulkan poin reward belanja.
        </p>

        <?php if (!empty($error)): ?>
            <div style="background: #FEE2E2; color: #DC2626; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; font-size: 13.5px;">
                <?= e($error) ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="<?= BASE_URL ?>/register.php">
            <?= csrf_field() ?>
            <div style="margin-bottom: 16px;">
                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Nama Lengkap</label>
                <input type="text" name="name" required placeholder="Nama Anda" value="<?= e($_POST['name'] ?? '') ?>" style="width: 100%; padding: 11px 14px; border: 1px solid var(--color-border); border-radius: 4px; font-size: 14px;">
            </div>

            <div style="margin-bottom: 16px;">
                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Email</label>
                <input type="email" name="email" required placeholder="nama@email.com" value="<?= e($_POST['email'] ?? '') ?>" style="width: 100%; padding: 11px 14px; border: 1px solid var(--color-border); border-radius: 4px; font-size: 14px;">
            </div>

            <div style="margin-bottom: 16px;">
                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">No. WhatsApp (Untuk Pengiriman Paket)</label>
                <input type="tel" name="phone" placeholder="0812xxxx" value="<?= e($_POST['phone'] ?? '') ?>" style="width: 100%; padding: 11px 14px; border: 1px solid var(--color-border); border-radius: 4px; font-size: 14px;">
            </div>

            <div style="margin-bottom: 24px;">
                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Password (Minimal 6 karakter)</label>
                <input type="password" name="password" required placeholder="••••••••" style="width: 100%; padding: 11px 14px; border: 1px solid var(--color-border); border-radius: 4px; font-size: 14px;">
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 13px; font-size: 14.5px;">
                Daftar Akun Member
            </button>
        </form>

        <div style="text-align: center; margin-top: 24px; font-size: 13.5px; color: var(--color-text-muted);">
            Sudah memiliki akun? <a href="<?= BASE_URL ?>/login.php" style="color: var(--color-text-main); font-weight: 600; text-decoration: underline;">Masuk di sini</a>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
