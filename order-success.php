<?php
/**
 * AURA BOTANICA - Order Success Page
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/functions.php';

$orderNumber = $_GET['order'] ?? '';
if (empty($orderNumber)) {
    redirect('/');
}

$order = Database::fetchOne("SELECT * FROM orders WHERE order_number = ?", "s", [$orderNumber]);
if (!$order) {
    redirect('/');
}

$orderItems = Database::fetchAll("SELECT * FROM order_items WHERE order_id = ?", "i", [$order['id']]);

$customMeta = ['title' => 'Pesanan Berhasil - ' . $orderNumber];
require_once __DIR__ . '/includes/header.php';
?>

<div class="container" style="padding: 50px 20px 90px; max-width: 820px;">
    <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 12px; padding: 40px; text-align: center; margin-bottom: 30px;">
        <div style="width: 64px; height: 64px; background: #E6F4EA; color: #137333; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; margin: 0 auto 20px;">
            ✓
        </div>
        <h1 style="font-size: 32px; margin-bottom: 8px;">Terima Kasih Atas Pesanan Anda!</h1>
        <p style="color: var(--color-text-muted); font-size: 15px;">Nomor pesanan Anda: <strong style="color: #2C2724; font-family: monospace; font-size: 17px;"><?= e($order['order_number']) ?></strong></p>
        <p style="color: var(--color-text-muted); font-size: 13.5px; margin-top: 6px;">Detail konfirmasi dan invoice telah dikirimkan ke email <strong><?= e($order['customer_email']) ?></strong>.</p>
    </div>

    <!-- Order & Payment Instructions -->
    <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 12px; padding: 32px; margin-bottom: 24px;">
        <h2 style="font-size: 20px; margin-bottom: 18px;">Instruksi Pembayaran</h2>
        
        <?php if (str_contains($order['payment_method'], 'BCA')): ?>
            <div style="background: #FAF8F5; border-left: 4px solid var(--color-accent); padding: 18px 20px; border-radius: 4px; margin-bottom: 20px;">
                <div style="font-size: 13px; color: var(--color-text-muted);">Transfer Bank BCA</div>
                <div style="font-size: 22px; font-weight: 700; font-family: monospace; margin: 4px 0;">8820-192-384</div>
                <div style="font-size: 13px; font-weight: 500;">a/n PT AURA BOTANICA INDONESIA</div>
                <div style="font-size: 13px; color: var(--color-text-muted); margin-top: 6px;">Total yang harus ditransfer: <strong style="color: #2C2724; font-size: 16px;"><?= format_rupiah($order['grand_total']) ?></strong></div>
            </div>
            <p style="font-size: 13px; color: var(--color-text-muted);">Setelah melakukan pembayaran, konfirmasi transfer Anda melalui WhatsApp Customer Care dengan menyertakan nomor pesanan.</p>
        <?php elseif ($order['payment_method'] === 'Cash on Delivery'): ?>
            <p style="font-size: 14px; color: #4A433E;">Pesanan COD Anda sedang disiapkan dan akan dikirim ke alamat tujuan. Siapkan uang pas sebesar <strong><?= format_rupiah($order['grand_total']) ?></strong> saat kurir mengantarkan paket.</p>
        <?php else: ?>
            <p style="font-size: 14px; color: #4A433E;">Metode Pembayaran: <strong><?= e($order['payment_method']) ?></strong>. Silakan selesaikan pembayaran sesuai instruksi pada aplikasi e-wallet Anda.</p>
        <?php endif; ?>
    </div>

    <!-- Items Summary -->
    <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 12px; padding: 32px; margin-bottom: 30px;">
        <h2 style="font-size: 20px; margin-bottom: 18px;">Rincian Produk</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
                <tr style="border-bottom: 1px solid var(--color-border); text-align: left; font-size: 13px; color: var(--color-text-muted);">
                    <th style="padding-bottom: 12px;">Produk</th>
                    <th style="padding-bottom: 12px; text-align: center;">Qty</th>
                    <th style="padding-bottom: 12px; text-align: right;">Total</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($orderItems as $item): ?>
                    <tr style="border-bottom: 1px solid var(--color-border); font-size: 14px;">
                        <td style="padding: 14px 0;">
                            <strong><?= e($item['product_name']) ?></strong>
                            <div style="font-size: 12px; color: var(--color-text-muted);"><?= format_rupiah($item['price']) ?></div>
                        </td>
                        <td style="padding: 14px 0; text-align: center;"><?= $item['quantity'] ?></td>
                        <td style="padding: 14px 0; text-align: right; font-weight: 600;"><?= format_rupiah($item['total']) ?></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 14px;">
            <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--color-text-muted);">Subtotal</span>
                <span><?= format_rupiah($order['subtotal']) ?></span>
            </div>
            <?php if ($order['discount_amount'] > 0): ?>
                <div style="display: flex; justify-content: space-between; color: #16A34A;">
                    <span>Diskon Kupon</span>
                    <span>- <?= format_rupiah($order['discount_amount']) ?></span>
                </div>
            <?php endif; ?>
            <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--color-text-muted);">Ongkos Kirim</span>
                <span><?= $order['shipping_cost'] == 0 ? 'Gratis' : format_rupiah($order['shipping_cost']) ?></span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 17px; border-top: 1px solid var(--color-border); padding-top: 12px; margin-top: 6px;">
                <span>Total Pembayaran</span>
                <span><?= format_rupiah($order['grand_total']) ?></span>
            </div>
        </div>
    </div>

    <!-- Actions -->
    <div style="display: flex; justify-content: space-between; gap: 16px;">
        <a href="<?= BASE_URL ?>/" class="btn btn-outline">Kembali ke Beranda</a>
        <button onclick="window.print()" class="btn btn-primary">Cetak Bukti Pesanan (Invoice)</button>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
