<?php
/**
 * AURA BOTANICA - Admin Order Management
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

require_admin();
$admin = current_admin();

$filterStatus = $_GET['status'] ?? '';
$orderId = (int)($_GET['view'] ?? 0);

// Handle Status Updates
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_order'])) {
    check_csrf();
    $targetOrderId = (int)$_POST['order_id'];
    $newOrderStatus = $_POST['order_status'];
    $newPaymentStatus = $_POST['payment_status'];
    $trackingNum = trim($_POST['tracking_number'] ?? '');

    Database::execute(
        "UPDATE orders SET order_status = ?, payment_status = ?, tracking_number = ? WHERE id = ?",
        "sssi",
        [$newOrderStatus, $newPaymentStatus, $trackingNum, $targetOrderId]
    );
    log_activity($admin['id'], 'UPDATE_ORDER_STATUS', "Memperbarui order ID {$targetOrderId} menjadi {$newOrderStatus} ({$newPaymentStatus})");
    set_flash('success', 'Status pesanan berhasil diperbarui.');
    redirect('/admin/orders.php?view=' . $targetOrderId);
}

// Single order view
$selectedOrder = null;
$selectedOrderItems = [];
if ($orderId > 0) {
    $selectedOrder = Database::fetchOne("SELECT * FROM orders WHERE id = ?", "i", [$orderId]);
    if ($selectedOrder) {
        $selectedOrderItems = Database::fetchAll("SELECT * FROM order_items WHERE order_id = ?", "i", [$orderId]);
    }
}

// Order list query
$sql = "SELECT * FROM orders";
$params = [];
$types = "";
if (!empty($filterStatus)) {
    $sql .= " WHERE order_status = ?";
    $params[] = $filterStatus;
    $types .= "s";
}
$sql .= " ORDER BY id DESC";
$orders = Database::fetchAll($sql, $types, $params);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Manajemen Pesanan - Admin AURA BOTANICA</title>
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
                <li><a href="<?= BASE_URL ?>/admin/orders.php" class="active">📦 Pesanan (Orders)</a></li>
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
                <h2 style="font-size: 18px; margin: 0; font-weight: 600;">Daftar Transaksi & Pesanan Masuk</h2>
                <?php if ($orderId > 0): ?>
                    <a href="<?= BASE_URL ?>/admin/orders.php" class="badge badge-secondary" style="padding: 8px 16px; font-size: 13px; text-decoration: none;">&larr; Kembali ke Semua Pesanan</a>
                <?php endif; ?>
            </header>

            <div class="admin-content">
                <?php if ($selectedOrder): ?>
                    <!-- Single Order Detail & Status Editor -->
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px;" class="hero-split">
                        <div class="admin-card">
                            <h3 style="font-size: 18px; margin-bottom: 16px;">Detail Pesanan: <?= e($selectedOrder['order_number']) ?></h3>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 13.5px; margin-bottom: 24px;">
                                <div>
                                    <strong>Informasi Pelanggan:</strong><br>
                                    Nama: <?= e($selectedOrder['customer_name']) ?><br>
                                    Email: <?= e($selectedOrder['customer_email']) ?><br>
                                    WhatsApp: <?= e($selectedOrder['customer_phone']) ?>
                                </div>
                                <div>
                                    <strong>Alamat Pengiriman:</strong><br>
                                    <?= e($selectedOrder['shipping_address']) ?><br>
                                    <?= e($selectedOrder['district']) ?>, <?= e($selectedOrder['city']) ?><br>
                                    <?= e($selectedOrder['province']) ?> - <?= e($selectedOrder['postal_code']) ?>
                                </div>
                            </div>

                            <table class="admin-table" style="margin-bottom: 20px;">
                                <thead>
                                    <tr>
                                        <th>Item Produk</th>
                                        <th>Harga</th>
                                        <th>Qty</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($selectedOrderItems as $item): ?>
                                        <tr>
                                            <td><strong><?= e($item['product_name']) ?></strong></td>
                                            <td><?= format_rupiah($item['price']) ?></td>
                                            <td><?= $item['quantity'] ?></td>
                                            <td><strong><?= format_rupiah($item['total']) ?></strong></td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>

                            <div style="text-align: right; font-size: 15px; border-top: 2px solid #E8E2DB; padding-top: 12px;">
                                <div>Subtotal: <?= format_rupiah($selectedOrder['subtotal']) ?></div>
                                <?php if ($selectedOrder['discount_amount'] > 0): ?>
                                    <div style="color: #137333;">Diskon: -<?= format_rupiah($selectedOrder['discount_amount']) ?></div>
                                <?php endif; ?>
                                <div>Ongkir: <?= format_rupiah($selectedOrder['shipping_cost']) ?></div>
                                <div style="font-size: 18px; font-weight: 700; margin-top: 6px;">Total: <?= format_rupiah($selectedOrder['grand_total']) ?></div>
                            </div>
                        </div>

                        <!-- Update Status Form -->
                        <div class="admin-card">
                            <h3 style="font-size: 16px; margin-bottom: 16px;">Kelola Status Pesanan</h3>
                            <form method="POST" action="">
                                <?= csrf_field() ?>
                                <input type="hidden" name="update_order" value="1">
                                <input type="hidden" name="order_id" value="<?= $selectedOrder['id'] ?>">

                                <div style="margin-bottom: 16px;">
                                    <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Status Pesanan</label>
                                    <select name="order_status" style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;">
                                        <?php foreach (['Pending', 'Confirmed', 'Processing', 'Shipped', 'Completed', 'Cancelled'] as $st): ?>
                                            <option value="<?= $st ?>" <?= $selectedOrder['order_status'] === $st ? 'selected' : '' ?>><?= $st ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>

                                <div style="margin-bottom: 16px;">
                                    <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Status Pembayaran</label>
                                    <select name="payment_status" style="width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;">
                                        <option value="unpaid" <?= $selectedOrder['payment_status'] === 'unpaid' ? 'selected' : '' ?>>Belum Dibayar (Unpaid)</option>
                                        <option value="paid" <?= $selectedOrder['payment_status'] === 'paid' ? 'selected' : '' ?>>Lunas / Terverifikasi (Paid)</option>
                                        <option value="refunded" <?= $selectedOrder['payment_status'] === 'refunded' ? 'selected' : '' ?>>Refunded</option>
                                    </select>
                                </div>

                                <div style="margin-bottom: 20px;">
                                    <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Nomor Resi Pengiriman</label>
                                    <input type="text" name="tracking_number" placeholder="JNE-882910..." value="<?= e($selectedOrder['tracking_number'] ?? '') ?>" style="width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px;">
                                </div>

                                <button type="submit" class="badge badge-success" style="width: 100%; padding: 12px; font-size: 14px; border: none; cursor: pointer;">
                                    Perbarui Status
                                </button>
                            </form>
                        </div>
                    </div>
                <?php else: ?>
                    <!-- Orders List -->
                    <div class="admin-card">
                        <div class="table-responsive">
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>No. Pesanan</th>
                                        <th>Pelanggan</th>
                                        <th>Kota / Provinsi</th>
                                        <th>Total Belanja</th>
                                        <th>Metode Bayar</th>
                                        <th>Status Bayar</th>
                                        <th>Status Order</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($orders as $ord): ?>
                                        <tr>
                                            <td><strong><?= e($ord['order_number']) ?></strong></td>
                                            <td>
                                                <?= e($ord['customer_name']) ?><br>
                                                <span style="font-size: 12px; color: #736B63;"><?= e($ord['customer_phone']) ?></span>
                                            </td>
                                            <td><?= e($ord['city']) ?>, <?= e($ord['province']) ?></td>
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
                                            <td>
                                                <a href="<?= BASE_URL ?>/admin/orders.php?view=<?= $ord['id'] ?>" class="badge badge-info" style="text-decoration: none;">Kelola Resi & Detail</a>
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
