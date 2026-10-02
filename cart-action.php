<?php
/**
 * AURA BOTANICA - Cart Actions Handler (Add, Update, Remove, Coupon)
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/functions.php';

check_csrf();

$action = $_POST['action'] ?? '';
$isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

if ($action === 'add') {
    $productId = (int)($_POST['product_id'] ?? 0);
    $quantity = max(1, (int)($_POST['quantity'] ?? 1));
    $added = add_to_cart($productId, $quantity);

    if ($isAjax) {
        $totals = calculate_cart_totals();
        json_response([
            'success' => $added,
            'items_count' => $totals['items_count'],
            'message' => $added ? 'Produk ditambahkan ke keranjang' : 'Stok produk tidak mencukupi'
        ]);
    }

    set_flash($added ? 'success' : 'error', $added ? 'Produk berhasil ditambahkan ke keranjang.' : 'Stok produk tidak mencukupi.');
    redirect('/cart');
}

if ($action === 'update') {
    $productId = (int)($_POST['product_id'] ?? 0);
    $quantity = (int)($_POST['quantity'] ?? 1);

    if (isset($_SESSION['cart'][$productId])) {
        if ($quantity <= 0) {
            unset($_SESSION['cart'][$productId]);
        } else {
            $_SESSION['cart'][$productId]['quantity'] = min($quantity, $_SESSION['cart'][$productId]['stock']);
        }
    }
    redirect('/cart');
}

if ($action === 'remove') {
    $productId = (int)($_POST['product_id'] ?? 0);
    unset($_SESSION['cart'][$productId]);
    redirect('/cart');
}

if ($action === 'apply_coupon') {
    $code = strtoupper(trim($_POST['coupon_code'] ?? ''));
    $coupon = Database::fetchOne("
        SELECT * FROM coupons 
        WHERE code = ? AND is_active = 1 AND valid_from <= NOW() AND valid_until >= NOW()
    ", "s", [$code]);

    if (!$coupon) {
        set_flash('error', 'Kode kupon tidak valid atau sudah kedaluwarsa.');
    } else {
        $totals = calculate_cart_totals();
        if ($totals['subtotal'] < $coupon['min_spend']) {
            set_flash('error', 'Minimal belanja untuk kupon ini adalah ' . format_rupiah($coupon['min_spend']));
        } else {
            $_SESSION['applied_coupon'] = $coupon;
            set_flash('success', 'Kupon berhasil diterapkan! Potongan telah dihitung.');
        }
    }
    redirect('/cart');
}

if ($action === 'remove_coupon') {
    unset($_SESSION['applied_coupon']);
    redirect('/cart');
}

redirect('/cart');
