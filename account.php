<?php
/**
 * AURA BOTANICA - Customer Account & Order History
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';

require_user_login();
$user = current_user();

// Fetch orders of current user
$orders = Database::fetchAll("
    SELECT o.*, 
           (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as total_items
    FROM orders o
    WHERE o.user_id = ? OR o.customer_email = ?
    ORDER BY o.id DESC
", "is", [$user['id'], $user['email']]);

$customMeta = ['title' => 'Akun Saya & Riwayat Pesanan - AURA BOTANICA'];
require_once __DIR__ . '/includes/header.php';
?>

<div class="container" style="padding: 40px 20px 90px; max-width: 1040px;">
    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 30px; border-bottom: 1px solid var(--color-border); padding-bottom: 20px;">
        <div>
            <h1 style="font-size: 32px; margin-bottom: 6px;">Akun Saya</h1>
            <p style="color: var(--color-text-muted);">Selamat datang, <strong><?= e($user['name']) ?></strong> (<?= e($user['email']) ?>)</p>
        </div>
        <a href="<?= BASE_URL ?>/logout.php" class="btn btn-outline" style="padding: 8px 20px; font-size: 13px;">Keluar Akun</a>
    </div>

    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 40px;" class="hero-split">
        <!-- Order History List -->
        <div>
            <h2 style="font-size: 22px; margin-bottom: 20px;">Riwayat Pesanan</h2>
            
            <?php if (empty($orders)): ?>
                <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 8px; padding: 40px 20px; text-align: center;">
                    <p style="color: var(--color-text-muted); margin-bottom: 16px;">Anda belum memiliki riwayat pesanan.</p>
                    <a href="<?= BASE_URL ?>/products" class="btn btn-primary">Mulai Belanja</a>
                </div>
            <?php else: ?>
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <?php foreach ($orders as $ord): 
                        $statusColor = match($ord['order_status']) {
                            'Completed' => 'background: #E6F4EA; color: #137333;',
                            'Shipped' => 'background: #E8F0FE; color: #1A73E8;',
                            'Processing' => 'background: #FEF7E0; color: #B06000;',
                            'Cancelled' => 'background: #FEE2E2; color: #DC2626;',
                            default => 'background: #F3F4F6; color: #4B5563;'
                        };
                    ?>
                        <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 8px; padding: 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                                <div>
                                    <div style="font-weight: 700; font-size: 15px; font-family: monospace;"><?= e($ord['order_number']) ?></div>
                                    <div style="font-size: 12px; color: var(--color-text-muted);"><?= date('d F Y, H:i', strtotime($ord['created_at'])) ?> WIB</div>
                                </div>
                                <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; <?= $statusColor ?>">
                                    <?= e($ord['order_status']) ?>
                                </span>
                            </div>

                            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border); padding-top: 14px; font-size: 14px;">
                                <div>
                                    <span style="color: var(--color-text-muted);"><?= $ord['total_items'] ?> item</span> &bull; 
                                    <span style="font-weight: 600;"><?= format_rupiah($ord['grand_total']) ?></span>
                                </div>
                                <a href="<?= BASE_URL ?>/order-success.php?order=<?= e($ord['order_number']) ?>" style="font-size: 13px; font-weight: 600; color: var(--color-text-main); text-decoration: underline;">
                                    Lihat Detail &rarr;
                                </a>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>

        <!-- Customer Profile & Address Info -->
        <div>
            <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 8px; padding: 24px;">
                <h3 style="font-size: 18px; margin-bottom: 16px;">Alamat Tersimpan</h3>
                <div style="font-size: 14px; line-height: 1.6; color: #4A433E;">
                    <strong><?= e($user['name']) ?></strong><br>
                    <?= e($user['phone'] ?? '-') ?><br>
                    <?= e($user['address'] ?? 'Alamat belum diatur') ?><br>
                    <?= e($user['district'] ?? '') ?>, <?= e($user['city'] ?? '') ?><br>
                    <?= e($user['province'] ?? '') ?> <?= e($user['postal_code'] ?? '') ?>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
