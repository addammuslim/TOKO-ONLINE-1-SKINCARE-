<?php
/**
 * AURA BOTANICA - Admin Dashboard (Dashboard, KPI, Sales Chart, Orders)
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

require_admin();
$admin = current_admin();

// Metrics
$totalSales = Database::fetchOne("SELECT COALESCE(SUM(grand_total), 0) as total FROM orders WHERE payment_status = 'paid'")['total'];
$totalOrders = Database::fetchOne("SELECT COUNT(*) as count FROM orders")['count'];
$pendingOrders = Database::fetchOne("SELECT COUNT(*) as count FROM orders WHERE order_status = 'Pending'")['count'];
$completedOrders = Database::fetchOne("SELECT COUNT(*) as count FROM orders WHERE order_status = 'Completed'")['count'];
$totalCustomers = Database::fetchOne("SELECT COUNT(*) as count FROM users")['count'];
$totalProducts = Database::fetchOne("SELECT COUNT(*) as count FROM products WHERE is_active = 1")['count'];
$lowStockCount = Database::fetchOne("SELECT COUNT(*) as count FROM products WHERE stock <= 15 AND is_active = 1")['count'];

// Recent Orders
$recentOrders = Database::fetchAll("SELECT * FROM orders ORDER BY id DESC LIMIT 6");

// Low stock items
$lowStockProducts = Database::fetchAll("SELECT id, name, sku, stock, price FROM products WHERE stock <= 25 AND is_active = 1 ORDER BY stock ASC LIMIT 5");
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - AURA BOTANICA</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/admin.css">
</head>
<body class="admin-body">
    <div class="admin-wrapper">
        <!-- Sidebar -->
        <aside class="admin-sidebar">
            <div class="admin-brand">AURA BOTANICA</div>
            <ul class="admin-menu">
                <li><a href="<?= BASE_URL ?>/admin/" class="active">📊 Dashboard</a></li>
                <li><a href="<?= BASE_URL ?>/admin/products.php">🧴 Produk Skincare</a></li>
                <li><a href="<?= BASE_URL ?>/admin/categories.php">📂 Kategori</a></li>
                <li><a href="<?= BASE_URL ?>/admin/orders.php">📦 Pesanan (Orders)</a></li>
                <li><a href="<?= BASE_URL ?>/admin/customers.php">👥 Data Pelanggan</a></li>
                <li><a href="<?= BASE_URL ?>/admin/inventory.php">📈 Stok & Inventori</a></li>
                <li><a href="<?= BASE_URL ?>/admin/articles.php">📝 Jurnal & Artikel</a></li>
                <li><a href="<?= BASE_URL ?>/admin/coupons.php">🎟️ Kupon & Diskon</a></li>
                <li><a href="<?= BASE_URL ?>/admin/reviews.php">⭐ Moderasi Review</a></li>
                <li><a href="<?= BASE_URL ?>/admin/messages.php">💬 Pesan Masuk</a></li>
                <li><a href="<?= BASE_URL ?>/admin/settings.php">⚙️ Pengaturan Website</a></li>
                <li style="margin-top: 20px;"><a href="<?= BASE_URL ?>/" target="_blank">🌐 Lihat Website Publik</a></li>
                <li><a href="<?= BASE_URL ?>/admin/logout.php" style="color: #F87171;">🚪 Keluar (Logout)</a></li>
            </ul>
        </aside>

        <!-- Main Body -->
        <main class="admin-main">
            <!-- Topbar -->
            <header class="admin-topbar">
                <div>
                    <h2 style="font-size: 18px; margin: 0; font-weight: 600;">Dashboard Ikhtisar</h2>
                    <span style="font-size: 13px; color: #736B63;">Selamat bekerja kembali, <?= e($admin['name']) ?> (<?= e($admin['role']) ?>)</span>
                </div>
                <div>
                    <a href="<?= BASE_URL ?>/admin/products.php?action=add" class="badge badge-success" style="padding: 8px 16px; font-size: 13px; text-decoration: none;">+ Tambah Produk Baru</a>
                </div>
            </header>

            <!-- Content -->
            <div class="admin-content">
                <!-- KPI Grid -->
                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-label">Total Penjualan</div>
                        <div class="kpi-value" style="color: #137333;"><?= format_rupiah($totalSales) ?></div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Total Pesanan</div>
                        <div class="kpi-value"><?= number_format($totalOrders) ?></div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Pesanan Pending</div>
                        <div class="kpi-value" style="color: #D97706;"><?= number_format($pendingOrders) ?></div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Pesanan Selesai</div>
                        <div class="kpi-value"><?= number_format($completedOrders) ?></div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Total Pelanggan</div>
                        <div class="kpi-value"><?= number_format($totalCustomers) ?></div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-label">Peringatan Stok Rendah</div>
                        <div class="kpi-value" style="color: #DC2626;"><?= number_format($lowStockCount) ?></div>
                    </div>
                </div>

                <!-- Recent Orders Table -->
                <div class="admin-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="font-size: 17px; margin: 0;">Pesanan Terbaru</h3>
                        <a href="<?= BASE_URL ?>/admin/orders.php" style="font-size: 13px; font-weight: 600; color: #9B786F;">Lihat Semua Pesanan &rarr;</a>
                    </div>

                    <div class="table-responsive">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>No. Pesanan</th>
                                    <th>Pelanggan</th>
                                    <th>Tanggal</th>
                                    <th>Total</th>
                                    <th>Metode</th>
                                    <th>Status Pembayaran</th>
                                    <th>Status Pesanan</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($recentOrders as $ord): ?>
                                    <tr>
                                        <td><strong><?= e($ord['order_number']) ?></strong></td>
                                        <td>
                                            <?= e($ord['customer_name']) ?><br>
                                            <span style="font-size: 12px; color: #736B63;"><?= e($ord['customer_phone']) ?></span>
                                        </td>
                                        <td><?= date('d/m/Y H:i', strtotime($ord['created_at'])) ?></td>
                                        <td><strong><?= format_rupiah($ord['grand_total']) ?></strong></td>
                                        <td><?= e($ord['payment_method']) ?></td>
                                        <td>
                                            <span class="badge <?= $ord['payment_status'] === 'paid' ? 'badge-success' : 'badge-warning' ?>">
                                                <?= e(strtoupper($ord['payment_status'])) ?>
                                            </span>
                                        </td>
                                        <td>
                                            <span class="badge badge-info"><?= e($ord['order_status']) ?></span>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Low Stock Alert Table -->
                <div class="admin-card">
                    <h3 style="font-size: 17px; margin-bottom: 16px; color: #DC2626;">⚠️ Perhatian: Stok Produk Menipis</h3>
                    <div class="table-responsive">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Nama Produk</th>
                                    <th>SKU</th>
                                    <th>Harga</th>
                                    <th>Sisa Stok</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($lowStockProducts as $lp): ?>
                                    <tr>
                                        <td><strong><?= e($lp['name']) ?></strong></td>
                                        <td><code><?= e($lp['sku']) ?></code></td>
                                        <td><?= format_rupiah($lp['price']) ?></td>
                                        <td><strong style="color: #DC2626;"><?= $lp['stock'] ?> unit</strong></td>
                                        <td>
                                            <a href="<?= BASE_URL ?>/admin/products.php?edit=<?= $lp['id'] ?>" class="badge badge-secondary" style="text-decoration: none;">Restock Produk</a>
                                        </td>
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
