<?php
/**
 * AURA BOTANICA - Admin Product Management (CRUD)
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

require_admin();
$admin = current_admin();

$action = $_GET['action'] ?? 'list';
$editId = (int)($_GET['edit'] ?? 0);
$message = '';
$error = '';

// Handle Delete
if ($action === 'delete') {
    $deleteId = (int)($_GET['id'] ?? 0);
    if ($deleteId > 0) {
        Database::execute("UPDATE products SET is_active = 0 WHERE id = ?", "i", [$deleteId]);
        log_activity($admin['id'], 'DELETE_PRODUCT', "Menonaktifkan produk ID {$deleteId}");
        set_flash('success', 'Produk berhasil dinonaktifkan.');
        redirect('/admin/products.php');
    }
}

// Handle Form Submit (Add or Edit)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $name = trim($_POST['name'] ?? '');
    $sku = trim($_POST['sku'] ?? '');
    $categoryId = (int)($_POST['category_id'] ?? 1);
    $brandId = (int)($_POST['brand_id'] ?? 1);
    $price = (float)($_POST['price'] ?? 0);
    $discountPrice = !empty($_POST['discount_price']) ? (float)$_POST['discount_price'] : null;
    $stock = (int)($_POST['stock'] ?? 0);
    $volumeWeight = trim($_POST['volume_weight'] ?? '30 ml');
    $shortDesc = trim($_POST['short_description'] ?? '');
    $fullDesc = trim($_POST['full_description'] ?? '');
    $ingredients = trim($_POST['ingredients'] ?? '');
    $benefits = trim($_POST['benefits'] ?? '');
    $howToUse = trim($_POST['how_to_use'] ?? '');
    $isFeatured = isset($_POST['is_featured']) ? 1 : 0;
    $isBestseller = isset($_POST['is_bestseller']) ? 1 : 0;
    $isNewArrival = isset($_POST['is_new_arrival']) ? 1 : 0;
    $imageUrl = trim($_POST['image_url'] ?? '');
    $slug = slugify($name);

    if (empty($name) || empty($sku) || $price <= 0) {
        $error = "Nama produk, SKU, dan harga wajib diisi dengan benar.";
    } else {
        if ($editId > 0) {
            // Update
            $sql = "UPDATE products SET name=?, sku=?, slug=?, category_id=?, brand_id=?, price=?, discount_price=?, stock=?, volume_weight=?, short_description=?, full_description=?, ingredients=?, benefits=?, how_to_use=?, is_featured=?, is_bestseller=?, is_new_arrival=? WHERE id=?";
            Database::execute($sql, "sssiddissdssiiii", [$name, $sku, $slug, $categoryId, $brandId, $price, $discountPrice, $stock, $volumeWeight, $shortDesc, $fullDesc, $ingredients, $benefits, $howToUse, $isFeatured, $isBestseller, $isNewArrival, $editId]);
            if (!empty($imageUrl)) {
                Database::execute("INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE image_url = VALUES(image_url)", "is", [$editId, $imageUrl]);
            }
            log_activity($admin['id'], 'UPDATE_PRODUCT', "Memperbarui produk {$name} (SKU: {$sku})");
            set_flash('success', 'Produk berhasil diperbarui.');
            redirect('/admin/products.php');
        } else {
            // Insert
            $sql = "INSERT INTO products (name, sku, slug, category_id, brand_id, price, discount_price, stock, volume_weight, short_description, full_description, ingredients, benefits, how_to_use, is_featured, is_bestseller, is_new_arrival, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)";
            Database::execute($sql, "sssiddissdssiii", [$name, $sku, $slug, $categoryId, $brandId, $price, $discountPrice, $stock, $volumeWeight, $shortDesc, $fullDesc, $ingredients, $benefits, $howToUse, $isFeatured, $isBestseller, $isNewArrival]);
            $newId = Database::lastInsertId();
            if (!empty($imageUrl) && $newId > 0) {
                Database::execute("INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, 1)", "is", [$newId, $imageUrl]);
            }
            log_activity($admin['id'], 'CREATE_PRODUCT', "Menambahkan produk baru {$name} (ID: {$newId})");
            set_flash('success', 'Produk baru berhasil ditambahkan.');
            redirect('/admin/products.php');
        }
    }
}

// Fetch categories & brands for form
$categories = Database::fetchAll("SELECT id, name FROM categories ORDER BY name ASC");
$brands = Database::fetchAll("SELECT id, name FROM brands ORDER BY name ASC");

// Fetch product if editing
$editProduct = null;
if ($editId > 0) {
    $editProduct = Database::fetchOne("
        SELECT p.*, 
               (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as primary_image
        FROM products p WHERE p.id = ?
    ", "i", [$editId]);
}

// Fetch product list
$products = Database::fetchAll("
    SELECT p.*, c.name as category_name, b.name as brand_name,
           (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as primary_image
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.is_active = 1
    ORDER BY p.id DESC
");
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Manajemen Produk - Admin AURA BOTANICA</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/admin.css">
</head>
<body class="admin-body">
    <div class="admin-wrapper">
        <aside class="admin-sidebar">
            <div class="admin-brand">AURA BOTANICA</div>
            <ul class="admin-menu">
                <li><a href="<?= BASE_URL ?>/admin/">📊 Dashboard</a></li>
                <li><a href="<?= BASE_URL ?>/admin/products.php" class="active">🧴 Produk Skincare</a></li>
                <li><a href="<?= BASE_URL ?>/admin/categories.php">📂 Kategori</a></li>
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
                <h2 style="font-size: 18px; margin: 0; font-weight: 600;">Manajemen Produk Skincare</h2>
                <?php if ($action === 'list' && !$editId): ?>
                    <a href="<?= BASE_URL ?>/admin/products.php?action=add" class="badge badge-success" style="padding: 8px 16px; font-size: 13px; text-decoration: none;">+ Tambah Produk</a>
                <?php else: ?>
                    <a href="<?= BASE_URL ?>/admin/products.php" class="badge badge-secondary" style="padding: 8px 16px; font-size: 13px; text-decoration: none;">&larr; Kembali ke Daftar</a>
                <?php endif; ?>
            </header>

            <div class="admin-content">
                <?php if ($action === 'add' || $editId > 0): ?>
                    <!-- Product Form -->
                    <div class="admin-card" style="max-width: 900px;">
                        <h3 style="font-size: 18px; margin-bottom: 20px;"><?= $editId ? 'Edit Produk: ' . e($editProduct['name']) : 'Tambah Produk Skincare Baru' ?></h3>
                        
                        <?php if (!empty($error)): ?>
                            <div style="background: #FEE2E2; color: #DC2626; padding: 12px; border-radius: 6px; margin-bottom: 20px; font-size: 13.5px;"><?= e($error) ?></div>
                        <?php endif; ?>

                        <form method="POST" action="">
                            <?= csrf_field() ?>
                            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 16px;">
                                <div>
                                    <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Nama Produk *</label>
                                    <input type="text" name="name" required value="<?= e($editProduct['name'] ?? '') ?>" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;">
                                </div>
                                <div>
                                    <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">SKU *</label>
                                    <input type="text" name="sku" required value="<?= e($editProduct['sku'] ?? 'AB-' . rand(100, 999)) ?>" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;">
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Kategori</label>
                                    <select name="category_id" style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;">
                                        <?php foreach ($categories as $cat): ?>
                                            <option value="<?= $cat['id'] ?>" <?= ($editProduct['category_id'] ?? 0) == $cat['id'] ? 'selected' : '' ?>><?= e($cat['name']) ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                                <div>
                                    <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Brand</label>
                                    <select name="brand_id" style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;">
                                        <?php foreach ($brands as $b): ?>
                                            <option value="<?= $b['id'] ?>" <?= ($editProduct['brand_id'] ?? 0) == $b['id'] ? 'selected' : '' ?>><?= e($b['name']) ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                                <div>
                                    <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Volume / Berat</label>
                                    <input type="text" name="volume_weight" value="<?= e($editProduct['volume_weight'] ?? '30 ml') ?>" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;">
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Harga Standar (Rp) *</label>
                                    <input type="number" name="price" required value="<?= e($editProduct['price'] ?? '150000') ?>" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;">
                                </div>
                                <div>
                                    <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Harga Diskon (Opsional)</label>
                                    <input type="number" name="discount_price" value="<?= e($editProduct['discount_price'] ?? '') ?>" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;">
                                </div>
                                <div>
                                    <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Stok *</label>
                                    <input type="number" name="stock" required value="<?= e($editProduct['stock'] ?? '50') ?>" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;">
                                </div>
                            </div>

                            <div style="margin-bottom: 16px;">
                                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">URL Gambar Utama</label>
                                <input type="url" name="image_url" placeholder="https://..." value="<?= e($editProduct['primary_image'] ?? 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80') ?>" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;">
                            </div>

                            <div style="margin-bottom: 16px;">
                                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Deskripsi Singkat</label>
                                <textarea name="short_description" rows="2" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;"><?= e($editProduct['short_description'] ?? '') ?></textarea>
                            </div>

                            <div style="margin-bottom: 16px;">
                                <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Komposisi Lengkap (Ingredients)</label>
                                <textarea name="ingredients" rows="2" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;"><?= e($editProduct['ingredients'] ?? '') ?></textarea>
                            </div>

                            <div style="display: flex; gap: 20px; margin-bottom: 24px;">
                                <label style="font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                                    <input type="checkbox" name="is_featured" value="1" <?= !empty($editProduct['is_featured']) ? 'checked' : '' ?>> Produk Unggulan (Featured)
                                </label>
                                <label style="font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                                    <input type="checkbox" name="is_bestseller" value="1" <?= !empty($editProduct['is_bestseller']) ? 'checked' : '' ?>> Best Seller
                                </label>
                                <label style="font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                                    <input type="checkbox" name="is_new_arrival" value="1" <?= !empty($editProduct['is_new_arrival']) ? 'checked' : '' ?>> Produk Baru (New)
                                </label>
                            </div>

                            <button type="submit" class="badge badge-success" style="padding: 12px 24px; font-size: 14px; border: none; cursor: pointer;">
                                Simpan Data Produk
                            </button>
                        </form>
                    </div>
                <?php else: ?>
                    <!-- Product List Table -->
                    <div class="admin-card">
                        <div class="table-responsive">
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>Produk</th>
                                        <th>Kategori</th>
                                        <th>SKU</th>
                                        <th>Harga</th>
                                        <th>Stok</th>
                                        <th>Badge</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($products as $p): ?>
                                        <tr>
                                            <td style="display: flex; align-items: center; gap: 12px;">
                                                <img src="<?= e($p['primary_image'] ?? 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=100&q=80') ?>" style="width: 44px; height: 44px; border-radius: 4px; object-fit: cover;">
                                                <div>
                                                    <strong><?= e($p['name']) ?></strong><br>
                                                    <span style="font-size: 12px; color: #736B63;"><?= e($p['volume_weight']) ?></span>
                                                </div>
                                            </td>
                                            <td><?= e($p['category_name']) ?></td>
                                            <td><code><?= e($p['sku']) ?></code></td>
                                            <td>
                                                <strong><?= format_rupiah($p['discount_price'] ?: $p['price']) ?></strong>
                                            </td>
                                            <td>
                                                <span style="color: <?= $p['stock'] <= 15 ? '#DC2626' : '#137333' ?>; font-weight: 700;">
                                                    <?= $p['stock'] ?> unit
                                                </span>
                                            </td>
                                            <td>
                                                <?php if ($p['is_bestseller']): ?><span class="badge badge-warning">Best</span><?php endif; ?>
                                                <?php if ($p['is_featured']): ?><span class="badge badge-info">Featured</span><?php endif; ?>
                                            </td>
                                            <td>
                                                <a href="<?= BASE_URL ?>/admin/products.php?edit=<?= $p['id'] ?>" class="badge badge-info" style="text-decoration: none;">Edit</a>
                                                <a href="<?= BASE_URL ?>/admin/products.php?action=delete&id=<?= $p['id'] ?>" onclick="return confirm('Hapus produk ini?')" class="badge badge-warning" style="text-decoration: none; color: #DC2626;">Hapus</a>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        </main>
    </div>
</body>
</html>
