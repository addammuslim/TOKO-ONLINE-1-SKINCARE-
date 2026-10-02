<?php
/**
 * AURA BOTANICA - Shopping Cart Page
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/functions.php';

$cart = get_cart();
$totals = calculate_cart_totals();
$flashMessages = get_flash();

$customMeta = ['title' => 'Keranjang Belanja - AURA BOTANICA'];
require_once __DIR__ . '/includes/header.php';
?>

<div class="container" style="padding: 40px 20px 80px;">
    <h1 style="font-size: 34px; margin-bottom: 24px;">Keranjang Belanja</h1>

    <?php foreach ($flashMessages as $msg): ?>
        <div style="padding: 12px 18px; border-radius: 6px; margin-bottom: 20px; font-size: 14px; <?= $msg['type'] === 'success' ? 'background: #E6F4EA; color: #137333;' : 'background: #FEE2E2; color: #DC2626;' ?>">
            <?= e($msg['message']) ?>
        </div>
    <?php endforeach; ?>

    <?php if (empty($cart)): ?>
        <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 12px; padding: 60px 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">🛍️</div>
            <h2>Keranjang Anda Masih Kosong</h2>
            <p style="color: var(--color-text-muted); margin: 10px 0 24px;">Mari eksplorasi koleksi skincare terbaik kami untuk memulai perawatan kulit Anda.</p>
            <a href="<?= BASE_URL ?>/products" class="btn btn-primary">Mulai Belanja</a>
        </div>
    <?php else: ?>
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 40px; align-items: flex-start;" class="hero-split">
            <!-- Cart Items List -->
            <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 12px; padding: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--color-border); text-align: left; font-size: 13px; color: var(--color-text-muted); text-transform: uppercase;">
                            <th style="padding-bottom: 16px;">Produk</th>
                            <th style="padding-bottom: 16px; text-align: center;">Jumlah</th>
                            <th style="padding-bottom: 16px; text-align: right;">Total</th>
                            <th style="padding-bottom: 16px;"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($cart as $item): ?>
                            <tr style="border-bottom: 1px solid var(--color-border);">
                                <td style="padding: 20px 0; display: flex; gap: 16px; align-items: center;">
                                    <img src="<?= e($item['image']) ?>" alt="<?= e($item['name']) ?>" style="width: 70px; height: 70px; object-fit: cover; border-radius: 6px; border: 1px solid var(--color-border);">
                                    <div>
                                        <div style="font-weight: 600; font-size: 15px; margin-bottom: 4px;"><?= e($item['name']) ?></div>
                                        <div style="font-size: 13px; color: var(--color-text-muted);"><?= format_rupiah($item['price']) ?> &bull; <?= e($item['volume_weight']) ?></div>
                                    </div>
                                </td>
                                <td style="padding: 20px 0; text-align: center;">
                                    <form action="<?= BASE_URL ?>/cart-action.php" method="POST" style="display: inline-flex; align-items: center; border: 1px solid var(--color-border); border-radius: 4px;">
                                        <?= csrf_field() ?>
                                        <input type="hidden" name="action" value="update">
                                        <input type="hidden" name="product_id" value="<?= $item['id'] ?>">
                                        <button type="submit" name="quantity" value="<?= $item['quantity'] - 1 ?>" style="padding: 6px 12px; border: none; background: none; cursor: pointer;">-</button>
                                        <span style="padding: 0 8px; font-weight: 600; font-size: 14px;"><?= $item['quantity'] ?></span>
                                        <button type="submit" name="quantity" value="<?= $item['quantity'] + 1 ?>" style="padding: 6px 12px; border: none; background: none; cursor: pointer;" <?= ($item['quantity'] >= $item['stock']) ? 'disabled' : '' ?>>+</button>
                                    </form>
                                </td>
                                <td style="padding: 20px 0; text-align: right; font-weight: 700; font-size: 15px;">
                                    <?= format_rupiah($item['price'] * $item['quantity']) ?>
                                </td>
                                <td style="padding: 20px 0; text-align: right;">
                                    <form action="<?= BASE_URL ?>/cart-action.php" method="POST">
                                        <?= csrf_field() ?>
                                        <input type="hidden" name="action" value="remove">
                                        <input type="hidden" name="product_id" value="<?= $item['id'] ?>">
                                        <button type="submit" style="background: none; border: none; color: #DC2626; cursor: pointer; font-size: 18px;" title="Hapus">&times;</button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px;">
                    <a href="<?= BASE_URL ?>/products" style="font-size: 14px; font-weight: 600; color: var(--color-text-main);">&larr; Lanjut Belanja</a>
                </div>
            </div>

            <!-- Order Summary & Checkout -->
            <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 12px; padding: 28px;">
                <h3 style="font-size: 20px; margin-bottom: 20px;">Ringkasan Belanja</h3>
                
                <!-- Coupon Code Form -->
                <form action="<?= BASE_URL ?>/cart-action.php" method="POST" style="margin-bottom: 24px;">
                    <?= csrf_field() ?>
                    <input type="hidden" name="action" value="apply_coupon">
                    <label style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--color-text-muted); display: block; margin-bottom: 8px;">Kupon / Promo Code</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" name="coupon_code" placeholder="Misal: GLOWSKIN" style="flex-grow: 1; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 4px; font-size: 13px; text-transform: uppercase;">
                        <button type="submit" class="btn btn-outline" style="padding: 10px 16px; font-size: 13px;">Terapkan</button>
                    </div>
                </form>

                <?php if (!empty($totals['applied_coupon'])): ?>
                    <div style="background: #E6F4EA; color: #137333; padding: 10px 14px; border-radius: 6px; font-size: 13px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                        <span>Kupon: <strong><?= e($totals['applied_coupon']['code']) ?></strong></span>
                        <form action="<?= BASE_URL ?>/cart-action.php" method="POST" style="margin: 0;">
                            <?= csrf_field() ?>
                            <input type="hidden" name="action" value="remove_coupon">
                            <button type="submit" style="background: none; border: none; color: #DC2626; cursor: pointer; font-size: 16px;">&times;</button>
                        </form>
                    </div>
                <?php endif; ?>

                <div style="display: flex; flex-direction: column; gap: 12px; border-bottom: 1px solid var(--color-border); padding-bottom: 18px; margin-bottom: 18px; font-size: 14.5px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--color-text-muted);">Subtotal (<?= $totals['items_count'] ?> item)</span>
                        <span style="font-weight: 600;"><?= format_rupiah($totals['subtotal']) ?></span>
                    </div>
                    <?php if ($totals['discount'] > 0): ?>
                        <div style="display: flex; justify-content: space-between; color: #16A34A;">
                            <span>Potongan Diskon</span>
                            <span>- <?= format_rupiah($totals['discount']) ?></span>
                        </div>
                    <?php endif; ?>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--color-text-muted);">Estimasi Ongkos Kirim</span>
                        <span style="font-weight: 600;">
                            <?= $totals['shipping'] === 0 ? '<span style="color: #16A34A;">Gratis</span>' : format_rupiah($totals['shipping']) ?>
                        </span>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 24px;">
                    <span style="font-size: 16px; font-weight: 600;">Total Pembayaran</span>
                    <span style="font-size: 24px; font-weight: 700; color: #2C2724;"><?= format_rupiah($totals['grand_total']) ?></span>
                </div>

                <a href="<?= BASE_URL ?>/checkout" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 15px; text-align: center;">
                    Lanjut ke Pembayaran &rarr;
                </a>
            </div>
        </div>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
