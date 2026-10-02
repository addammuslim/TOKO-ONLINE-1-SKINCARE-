<?php
/**
 * AURA BOTANICA - Admin Website Settings
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

require_role(['Super Admin', 'Admin']);
$admin = current_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $settingsToUpdate = [
        'site_name' => $_POST['site_name'] ?? '',
        'site_tagline' => $_POST['site_tagline'] ?? '',
        'site_email' => $_POST['site_email'] ?? '',
        'site_phone' => $_POST['site_phone'] ?? '',
        'site_address' => $_POST['site_address'] ?? '',
        'announcement_bar' => $_POST['announcement_bar'] ?? '',
        'free_shipping_threshold' => $_POST['free_shipping_threshold'] ?? '250000',
        'hero_heading' => $_POST['hero_heading'] ?? '',
        'hero_subheading' => $_POST['hero_subheading'] ?? ''
    ];

    foreach ($settingsToUpdate as $key => $val) {
        Database::execute(
            "INSERT INTO settings (setting_key, setting_value, setting_group) VALUES (?, ?, 'general') ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
            "ss",
            [$key, $val]
        );
    }
    log_activity($admin['id'], 'UPDATE_SETTINGS', "Memperbarui konfigurasi global website");
    set_flash('success', 'Pengaturan website berhasil disimpan.');
    redirect('/admin/settings.php');
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Pengaturan Website - Admin AURA BOTANICA</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/admin.css">
</head>
<body class="admin-body">
    <div class="admin-wrapper">
        <aside class="admin-sidebar">
            <div class="admin-brand">AURA BOTANICA</div>
            <ul class="admin-menu">
                <li><a href="<?= BASE_URL ?>/admin/">📊 Dashboard</a></li>
                <li><a href="<?= BASE_URL ?>/admin/products.php">🧴 Produk Skincare</a></li>
                <li><a href="<?= BASE_URL ?>/admin/categories.php">📂 Kategori</a></li>
                <li><a href="<?= BASE_URL ?>/admin/orders.php">📦 Pesanan (Orders)</a></li>
                <li><a href="<?= BASE_URL ?>/admin/customers.php">👥 Data Pelanggan</a></li>
                <li><a href="<?= BASE_URL ?>/admin/inventory.php">📈 Stok & Inventori</a></li>
                <li><a href="<?= BASE_URL ?>/admin/articles.php">📝 Jurnal & Artikel</a></li>
                <li><a href="<?= BASE_URL ?>/admin/coupons.php">🎟️ Kupon & Diskon</a></li>
                <li><a href="<?= BASE_URL ?>/admin/settings.php" class="active">⚙️ Pengaturan Website</a></li>
                <li style="margin-top: 20px;"><a href="<?= BASE_URL ?>/" target="_blank">🌐 Toko Publik</a></li>
                <li><a href="<?= BASE_URL ?>/admin/logout.php" style="color: #F87171;">🚪 Logout</a></li>
            </ul>
        </aside>

        <main class="admin-main">
            <header class="admin-topbar">
                <h2 style="font-size: 18px; margin: 0; font-weight: 600;">Pengaturan Toko & Informasi Umum</h2>
            </header>

            <div class="admin-content">
                <div class="admin-card" style="max-width: 800px;">
                    <form method="POST" action="">
                        <?= csrf_field() ?>
                        
                        <h3 style="font-size: 16px; margin-bottom: 16px; border-bottom: 1px solid #E8E2DB; padding-bottom: 8px;">Identitas Brand & Toko</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                            <div>
                                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Nama Website / Brand</label>
                                <input type="text" name="site_name" value="<?= e(get_setting('site_name', 'AURA BOTANICA')) ?>" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;">
                            </div>
                            <div>
                                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Slogan / Tagline</label>
                                <input type="text" name="site_tagline" value="<?= e(get_setting('site_tagline', 'Haute Botanical Skincare & Barrier Therapy')) ?>" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;">
                            </div>
                        </div>

                        <div style="margin-bottom: 16px;">
                            <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Announcement Bar (Pesan Banner Teratas)</label>
                            <input type="text" name="announcement_bar" value="<?= e(get_setting('announcement_bar')) ?>" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;">
                        </div>

                        <h3 style="font-size: 16px; margin: 24px 0 16px; border-bottom: 1px solid #E8E2DB; padding-bottom: 8px;">Kontak & Layanan Pelanggan</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                            <div>
                                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">WhatsApp CS</label>
                                <input type="text" name="site_phone" value="<?= e(get_setting('site_phone')) ?>" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;">
                            </div>
                            <div>
                                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Email Resmi</label>
                                <input type="email" name="site_email" value="<?= e(get_setting('site_email')) ?>" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;">
                            </div>
                        </div>

                        <div style="margin-bottom: 16px;">
                            <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Alamat Fisik</label>
                            <textarea name="site_address" rows="2" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;"><?= e(get_setting('site_address')) ?></textarea>
                        </div>

                        <h3 style="font-size: 16px; margin: 24px 0 16px; border-bottom: 1px solid #E8E2DB; padding-bottom: 8px;">Pengiriman & Ongkir</h3>
                        <div style="margin-bottom: 24px;">
                            <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Batas Minimal Belanja Gratis Ongkir (Rp)</label>
                            <input type="number" name="free_shipping_threshold" value="<?= e(get_setting('free_shipping_threshold', '250000')) ?>" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;">
                        </div>

                        <button type="submit" class="badge badge-success" style="padding: 12px 24px; font-size: 14px; border: none; cursor: pointer;">
                            Simpan Perubahan Pengaturan
                        </button>
                    </form>
                </div>
            </div>
        </main>
    </div>
</body>
</html>
