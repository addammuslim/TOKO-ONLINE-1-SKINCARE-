<?php
/**
 * AURA BOTANICA - Order Success & Payment Gateway Guidance
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

$customMeta = ['title' => 'Instruksi Pembayaran & Pesanan Berhasil - ' . $orderNumber];
require_once __DIR__ . '/includes/header.php';

$vaNumber = '8820' . substr($order['customer_phone'], -4) . sprintf("%04d", $order['id']);
?>

<div class="container" style="padding: 50px 20px 90px; max-width: 840px;">
    <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 12px; padding: 40px; text-align: center; margin-bottom: 30px;">
        <div style="width: 64px; height: 64px; background: #E6F4EA; color: #137333; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; margin: 0 auto 20px;">
            ✓
        </div>
        <h1 style="font-size: 32px; margin-bottom: 8px;">Pesanan Anda Berhasil Dibuat!</h1>
        <p style="color: var(--color-text-muted); font-size: 15px;">Nomor Transaksi: <strong style="color: #2C2724; font-family: monospace; font-size: 18px;"><?= e($order['order_number']) ?></strong></p>
        <p style="color: var(--color-text-muted); font-size: 13.5px; margin-top: 6px;">Invoice konfirmasi telah dikirimkan ke email <strong><?= e($order['customer_email']) ?></strong>.</p>
    </div>

    <!-- Tailored Payment Instructions based on method -->
    <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 12px; padding: 32px; margin-bottom: 24px;">
        <h2 style="font-size: 20px; margin-bottom: 18px;">Panduan Pembayaran: <?= e($order['payment_method']) ?></h2>
        
        <?php if (str_contains($order['payment_method'], 'Virtual Account')): ?>
            <div style="background: #FAF8F5; border-left: 4px solid var(--color-accent); padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                <div style="font-size: 13px; color: var(--color-text-muted);">Nomor <?= e($order['payment_method']) ?>:</div>
                <div style="font-size: 24px; font-weight: 700; font-family: monospace; letter-spacing: 2px; margin: 6px 0; color: #1F1C1A;">
                    <?= $vaNumber ?>
                </div>
                <div style="font-size: 13px; font-weight: 600;">a/n AURA BOTANICA INDONESIA</div>
                <div style="font-size: 14px; margin-top: 8px;">Total Tagihan: <strong style="color: #1F1C1A; font-size: 16px;"><?= format_rupiah($order['grand_total']) ?></strong></div>
            </div>
            <div style="font-size: 13.5px; line-height: 1.6; color: #4A433E;">
                <strong>Langkah Pembayaran ATM / M-Banking:</strong>
                <ol style="margin-left: 20px; margin-top: 6px;">
                  <li>Buka aplikasi Mobile Banking bank Anda, pilih menu <strong>Transfer Virtual Account</strong>.</li>
                  <li>Masukkan nomor VA: <strong><?= $vaNumber ?></strong>.</li>
                  <li>Konfirmasi detail dan transaksi Anda akan otomatis terverifikasi sistem dalam hitungan detik.</li>
                </ol>
            </div>
        <?php elseif (str_contains($order['payment_method'], 'QRIS')): ?>
            <div style="text-align: center; padding: 20px; background: #FAF8F5; border-radius: 8px; margin-bottom: 20px;">
                <p style="font-size: 14px; margin-bottom: 12px;">Pindai kode QRIS di bawah ini menggunakan aplikasi mobile banking atau e-wallet pilihan Anda:</p>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=00020101021226600016ID.CO.AURA.WWW0118936000020110000000002030035104000053033605802ID5913AURA_BOTANICA6007JAKARTA6304A8F2" alt="QRIS Code" style="margin: 0 auto; border-radius: 8px; border: 2px solid #2C2724; width: 220px; height: 220px;">
                <p style="font-size: 13px; font-weight: 600; margin-top: 10px;">Total Pembayaran: <?= format_rupiah($order['grand_total']) ?></p>
            </div>
        <?php elseif (str_contains($order['payment_method'], 'COD')): ?>
            <p style="font-size: 14px; color: #4A433E; line-height: 1.6;">
                Pesanan <strong>Cash on Delivery (COD)</strong> Anda telah diterima dan diteruskan ke tim gudang. Siapkan dana pas sebesar <strong><?= format_rupiah($order['grand_total']) ?></strong> untuk diserahkan kepada kurir ekspedisi saat paket skincare tiba.
            </p>
        <?php else: ?>
            <p style="font-size: 14px; color: #4A433E;">
                Pembayaran via <strong><?= e($order['payment_method']) ?></strong> berhasil dicatat. Transaksi dijamin aman melalui proteksi gateway bersertifikasi.
            </p>
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
        <button onclick="window.print()" class="btn btn-primary">Cetak Bukti Pembayaran / Invoice</button>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
