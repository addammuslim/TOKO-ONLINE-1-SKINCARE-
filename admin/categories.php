<?php
/**
 * AURA BOTANICA - Admin Category Management
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

require_admin();
$admin = current_admin();

// Handle add category
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $name = trim($_POST['name'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $slug = slugify($name);

    if (!empty($name)) {
        Database::execute(
            "INSERT INTO categories (name, slug, description, is_active) VALUES (?, ?, ?, 1)",
            "sss",
            [$name, $slug, $description]
        );
        log_activity($admin['id'], 'ADD_CATEGORY', "Menambahkan kategori: {$name}");
        set_flash('success', 'Kategori baru berhasil ditambahkan.');
        redirect('/admin/categories.php');
    }
}

$categories = Database::fetchAll("
    SELECT c.*, (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = 1) as total_products
    FROM categories c
    ORDER BY c.sort_order ASC, c.name ASC
");
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Manajemen Kategori - Admin AURA BOTANICA</title>
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
                <li><a href="<?= BASE_URL ?>/admin/categories.php" class="active">📂 Kategori</a></li>
                <li><a href="<?= BASE_URL ?>/admin/orders.php">📦 Pesanan (Orders)</a></li>
                <li><a href="<?= BASE_URL ?>/admin/customers.php">👥 Data Pelanggan</a></li>
                <li><a href="<?= BASE_URL ?>/admin/inventory.php">📈 Stok & Inventori</a></li>
                <li><a href="<?= BASE_URL ?>/admin/articles.php">📝 Jurnal & Artikel</a></li>
                <li><a href="<?= BASE_URL ?>/admin/coupons.php">🎟️ Kupon & Diskon</a></li>
                <li><a href="<?= BASE_URL ?>/admin/settings.php">⚙️ Pengaturan Website</a></li>
                <li style="margin-top: 20px;"><a href="<?= BASE_URL ?>/" target="_blank">🌐 Toko Publik</a></li>
                <li><a href="<?= BASE_URL ?>/admin/logout.php" style="color: #F87171;">🚪 Logout</a></li>
            </ul>
        </aside>

        <main class="admin-main">
            <header class="admin-topbar">
                <h2 style="font-size: 18px; margin: 0; font-weight: 600;">Kategori Produk Skincare</h2>
            </header>

            <div class="admin-content">
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 30px;" class="hero-split">
                    <!-- Add Category Form -->
                    <div class="admin-card">
                        <h3 style="font-size: 16px; margin-bottom: 16px;">Tambah Kategori Baru</h3>
                        <form method="POST" action="">
                            <?= csrf_field() ?>
                            <div style="margin-bottom: 16px;">
                                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Nama Kategori</label>
                                <input type="text" name="name" required placeholder="Misal: Sunscreen, Toner" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;">
                            </div>
                            <div style="margin-bottom: 20px;">
                                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Deskripsi Kategori</label>
                                <textarea name="description" rows="3" placeholder="Deskripsi singkat untuk SEO dan katalog..." style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;"></textarea>
                            </div>
                            <button type="submit" class="badge badge-success" style="width: 100%; padding: 12px; font-size: 14px; border: none; cursor: pointer;">
                                Simpan Kategori
                            </button>
                        </form>
                    </div>

                    <!-- Category Table -->
                    <div class="admin-card">
                        <h3 style="font-size: 16px; margin-bottom: 16px;">Daftar Kategori Aktif</h3>
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Nama Kategori</th>
                                    <th>Slug URL</th>
                                    <th>Total Produk</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($categories as $cat): ?>
                                    <tr>
                                        <td><strong><?= e($cat['name']) ?></strong></td>
                                        <td><code>/products/category/<?= e($cat['slug']) ?></code></td>
                                        <td><?= $cat['total_products'] ?> produk</td>
                                        <td><span class="badge badge-success">Aktif</span></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>
</body>
</html>
