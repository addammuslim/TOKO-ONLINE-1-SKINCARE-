<?php
/**
 * AURA BOTANICA - Checkout & Payment Gateway Selection
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/auth.php';

$cart = get_cart();
$totals = calculate_cart_totals();

if (empty($cart)) {
    redirect('/cart');
}

$currentUser = current_user();
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();

    $name = trim($_POST['customer_name'] ?? '');
    $email = trim($_POST['customer_email'] ?? '');
    $phone = trim($_POST['customer_phone'] ?? '');
    $address = trim($_POST['shipping_address'] ?? '');
    $province = trim($_POST['province'] ?? '');
    $city = trim($_POST['city'] ?? '');
    $district = trim($_POST['district'] ?? '');
    $postalCode = trim($_POST['postal_code'] ?? '');
    $paymentMethod = trim($_POST['payment_method'] ?? 'BCA Virtual Account');
    $notes = trim($_POST['notes'] ?? '');

    if (empty($name)) $errors[] = "Nama lengkap wajib diisi.";
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "Email valid wajib diisi.";
    if (empty($phone)) $errors[] = "Nomor WhatsApp/telepon wajib diisi.";
    if (empty($address)) $errors[] = "Alamat pengiriman wajib diisi.";

    if (empty($errors)) {
        $orderNumber = generate_order_number();
        $userId = $currentUser ? $currentUser['id'] : null;

        $orderSql = "
            INSERT INTO orders (
                order_number, user_id, customer_name, customer_email, customer_phone,
                shipping_address, province, city, district, postal_code,
                subtotal, discount_amount, shipping_cost, grand_total,
                payment_method, payment_status, order_status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', 'Pending', ?)
        ";

        $types = "sissssssssddddss";
        $params = [
            $orderNumber, $userId, $name, $email, $phone,
            $address, $province, $city, $district, $postalCode,
            $totals['subtotal'], $totals['discount'], $totals['shipping'], $totals['grand_total'],
            $paymentMethod, $notes
        ];

        $affected = Database::execute($orderSql, $types, $params);
        if ($affected > 0) {
            $orderId = Database::lastInsertId();

            foreach ($cart as $item) {
                $totalItemPrice = $item['price'] * $item['quantity'];
                Database::execute(
                    "INSERT INTO order_items (order_id, product_id, product_name, product_sku, price, quantity, total) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    "iissdid",
                    [$orderId, $item['id'], $item['name'], 'SKU-' . $item['id'], $item['price'], $item['quantity'], $totalItemPrice]
                );
                Database::execute("UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?", "ii", [$item['quantity'], $item['id']]);
            }

            unset($_SESSION['cart']);
            unset($_SESSION['applied_coupon']);
            redirect('/order/success/' . $orderNumber);
        } else {
            $errors[] = "Gagal memproses pesanan. Silakan coba kembali.";
        }
    }
}

$customMeta = ['title' => 'Checkout Pesanan & Pembayaran - AURA BOTANICA'];
require_once __DIR__ . '/includes/header.php';
?>

<div class="container" style="padding: 40px 20px 80px;">
    <h1 style="font-size: 34px; margin-bottom: 24px;">Selesaikan Pesanan & Pembayaran</h1>

    <?php if (!empty($errors)): ?>
        <div style="background: #FEE2E2; color: #DC2626; padding: 14px 18px; border-radius: 6px; margin-bottom: 24px; font-size: 14px;">
            <ul style="margin-left: 20px;">
                <?php foreach ($errors as $err): ?>
                    <li><?= e($err) ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>

    <form method="POST" action="<?= BASE_URL ?>/checkout.php">
        <?= csrf_field() ?>
        <div style="display: grid; grid-template-columns: 1.8fr 1.2fr; gap: 40px; align-items: flex-start;" class="hero-split">
            <!-- Customer Shipping Form -->
            <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 12px; padding: 32px;">
                <h2 style="font-size: 22px; margin-bottom: 20px;">1. Informasi Pengiriman</h2>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                    <div>
                        <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Nama Lengkap *</label>
                        <input type="text" name="customer_name" required value="<?= e($_POST['customer_name'] ?? ($currentUser['name'] ?? '')) ?>" style="width: 100%; padding: 10px 14px; border: 1px solid var(--color-border); border-radius: 4px; font-size: 14px;">
                    </div>
                    <div>
                        <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">No. WhatsApp / HP *</label>
                        <input type="tel" name="customer_phone" required placeholder="0812xxxx" value="<?= e($_POST['customer_phone'] ?? ($currentUser['phone'] ?? '')) ?>" style="width: 100%; padding: 10px 14px; border: 1px solid var(--color-border); border-radius: 4px; font-size: 14px;">
                    </div>
                </div>

                <div style="margin-bottom: 16px;">
                    <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Email (Untuk Notifikasi & Invoice) *</label>
                    <input type="email" name="customer_email" required value="<?= e($_POST['customer_email'] ?? ($currentUser['email'] ?? '')) ?>" style="width: 100%; padding: 10px 14px; border: 1px solid var(--color-border); border-radius: 4px; font-size: 14px;">
                </div>

                <div style="margin-bottom: 16px;">
                    <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Alamat Lengkap *</label>
                    <textarea name="shipping_address" rows="3" required placeholder="Jalan, nomor rumah, RT/RW, kelurahan" style="width: 100%; padding: 10px 14px; border: 1px solid var(--color-border); border-radius: 4px; font-size: 14px;"><?= e($_POST['shipping_address'] ?? ($currentUser['address'] ?? '')) ?></textarea>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                    <div>
                        <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Provinsi *</label>
                        <input type="text" name="province" required value="<?= e($_POST['province'] ?? 'DKI Jakarta') ?>" style="width: 100%; padding: 10px 14px; border: 1px solid var(--color-border); border-radius: 4px; font-size: 14px;">
                    </div>
                    <div>
                        <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Kota / Kabupaten *</label>
                        <input type="text" name="city" required value="<?= e($_POST['city'] ?? 'Jakarta Selatan') ?>" style="width: 100%; padding: 10px 14px; border: 1px solid var(--color-border); border-radius: 4px; font-size: 14px;">
                    </div>
                </div>

                <!-- Comprehensive Payment Gateway Selection -->
                <h2 style="font-size: 22px; margin-bottom: 20px; border-top: 1px solid var(--color-border); padding-top: 24px;">2. Pilih Saluran Pembayaran</h2>
                
                <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
                    <!-- Virtual Accounts -->
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--color-accent); margin-top: 6px;">VIRTUAL ACCOUNT (VERIFIKASI OTOMATIS 24/7)</div>
                    
                    <label style="display: flex; align-items: center; gap: 12px; padding: 14px 18px; border: 1px solid var(--color-border); border-radius: 8px; cursor: pointer; background: #FAF8F5;">
                        <input type="radio" name="payment_method" value="BCA Virtual Account" checked>
                        <div>
                            <strong>BCA Virtual Account</strong>
                            <div style="font-size: 12px; color: var(--color-text-muted);">Nomor VA otomatis unik tanpa biaya admin</div>
                        </div>
                    </label>

                    <label style="display: flex; align-items: center; gap: 12px; padding: 14px 18px; border: 1px solid var(--color-border); border-radius: 8px; cursor: pointer;">
                        <input type="radio" name="payment_method" value="Mandiri Virtual Account">
                        <div>
                            <strong>Mandiri Virtual Account (Livin' by Mandiri)</strong>
                            <div style="font-size: 12px; color: var(--color-text-muted);">Verifikasi transaksi instan</div>
                        </div>
                    </label>

                    <label style="display: flex; align-items: center; gap: 12px; padding: 14px 18px; border: 1px solid var(--color-border); border-radius: 8px; cursor: pointer;">
                        <input type="radio" name="payment_method" value="BRI Virtual Account (BRIVA)">
                        <div>
                            <strong>BRI Virtual Account (BRIVA / BRImo)</strong>
                            <div style="font-size: 12px; color: var(--color-text-muted);">Pembayaran instan عبر BRImo & ATM BRI</div>
                        </div>
                    </label>

                    <!-- QRIS & E-Wallet -->
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--color-accent); margin-top: 10px;">QRIS & E-WALLET INSTAN</div>

                    <label style="display: flex; align-items: center; gap: 12px; padding: 14px 18px; border: 1px solid var(--color-border); border-radius: 8px; cursor: pointer;">
                        <input type="radio" name="payment_method" value="QRIS Instan (GoPay, OVO, ShopeePay)">
                        <div>
                            <strong>QRIS Instan Serbaguna</strong>
                            <div style="font-size: 12px; color: var(--color-text-muted);">Pindai barcode QRIS via GoPay, BCA Mobile, ShopeePay, OVO, atau DANA</div>
                        </div>
                    </label>

                    <!-- Cards & COD -->
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--color-accent); margin-top: 10px;">KARTU KREDIT & BAYAR DI TEMPAT</div>

                    <label style="display: flex; align-items: center; gap: 12px; padding: 14px 18px; border: 1px solid var(--color-border); border-radius: 8px; cursor: pointer;">
                        <input type="radio" name="payment_method" value="Kartu Kredit / Debit Visa Mastercard">
                        <div>
                            <strong>Kartu Kredit / Debit Online (Visa, Mastercard, JCB)</strong>
                            <div style="font-size: 12px; color: var(--color-text-muted);">Enkripsi keamanan 3D Secure dengan OTP bank penerbit</div>
                        </div>
                    </label>

                    <label style="display: flex; align-items: center; gap: 12px; padding: 14px 18px; border: 1px solid var(--color-border); border-radius: 8px; cursor: pointer;">
                        <input type="radio" name="payment_method" value="Cash on Delivery (COD)">
                        <div>
                            <strong>Cash on Delivery (COD) - Bayar di Tempat</strong>
                            <div style="font-size: 12px; color: var(--color-text-muted);">Bayar tunai kepada kurir saat paket skincare Anda sampai di alamat</div>
                        </div>
                    </label>
                </div>
            </div>

            <!-- Order Review Sidebar -->
            <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 12px; padding: 28px; position: sticky; top: 100px;">
                <h3 style="font-size: 20px; margin-bottom: 18px;">Pesanan Anda</h3>
                
                <div style="max-height: 240px; overflow-y: auto; margin-bottom: 20px; border-bottom: 1px solid var(--color-border); padding-bottom: 14px;">
                    <?php foreach ($cart as $item): ?>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 14px;">
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <img src="<?= e($item['image']) ?>" alt="" style="width: 44px; height: 44px; border-radius: 4px; object-fit: cover;">
                                <div>
                                    <div style="font-weight: 600; line-height: 1.3;"><?= e($item['name']) ?></div>
                                    <div style="font-size: 12px; color: var(--color-text-muted);"><?= $item['quantity'] ?> x <?= format_rupiah($item['price']) ?></div>
                                </div>
                            </div>
                            <span style="font-weight: 600;"><?= format_rupiah($item['price'] * $item['quantity']) ?></span>
                        </div>
                    <?php endforeach; ?>
                </div>

                <div style="display: flex; flex-direction: column; gap: 10px; border-bottom: 1px solid var(--color-border); padding-bottom: 16px; margin-bottom: 16px; font-size: 14px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--color-text-muted);">Subtotal</span>
                        <span style="font-weight: 600;"><?= format_rupiah($totals['subtotal']) ?></span>
                    </div>
                    <?php if ($totals['discount'] > 0): ?>
                        <div style="display: flex; justify-content: space-between; color: #16A34A;">
                            <span>Diskon Voucher</span>
                            <span>- <?= format_rupiah($totals['discount']) ?></span>
                        </div>
                    <?php endif; ?>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--color-text-muted);">Ongkos Kirim</span>
                        <span style="font-weight: 600;"><?= $totals['shipping'] === 0 ? '<span style="color: #16A34A;">Gratis</span>' : format_rupiah($totals['shipping']) ?></span>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 24px;">
                    <span style="font-size: 16px; font-weight: 700;">Total Tagihan</span>
                    <span style="font-size: 24px; font-weight: 700; color: #2C2724;"><?= format_rupiah($totals['grand_total']) ?></span>
                </div>

                <button type="submit" class="btn btn-primary" style="width: 100%; padding: 15px; font-size: 15px;">
                    Bayar & Konfirmasi Pesanan
                </button>
            </div>
        </div>
    </form>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
