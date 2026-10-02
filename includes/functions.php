<?php
/**
 * AURA BOTANICA - Reusable Helper Functions
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Sanitize output to prevent XSS
 */
function e(?string $string): string {
    return htmlspecialchars((string)($string ?? ''), ENT_QUOTES, 'UTF-8');
}

/**
 * Format number to Indonesian Rupiah currency
 */
function format_rupiah(float|int|string|null $amount): string {
    $num = (float)($amount ?? 0);
    return 'Rp ' . number_format($num, 0, ',', '.');
}

/**
 * Generate clean URL slug from string
 */
function slugify(string $text): string {
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    $text = preg_replace('~[^-\w]+~', '', $text);
    $text = trim($text, '-');
    $text = preg_replace('~-+~', '-', $text);
    $text = strtolower($text);
    return empty($text) ? 'item-' . time() : $text;
}

/**
 * Generate CSRF Token for forms
 */
function generate_csrf(): string {
    if (empty($_SESSION[CSRF_TOKEN_KEY])) {
        $_SESSION[CSRF_TOKEN_KEY] = bin2hex(random_bytes(32));
    }
    return $_SESSION[CSRF_TOKEN_KEY];
}

/**
 * Render CSRF hidden input field
 */
function csrf_field(): string {
    $token = generate_csrf();
    return '<input type="hidden" name="csrf_token" value="' . e($token) . '">';
}

/**
 * Verify CSRF Token
 */
function verify_csrf(?string $token): bool {
    if (empty($token) || empty($_SESSION[CSRF_TOKEN_KEY])) {
        return false;
    }
    return hash_equals($_SESSION[CSRF_TOKEN_KEY], $token);
}

/**
 * Enforce CSRF token on POST requests
 */
function check_csrf(): void {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $token = $_POST['csrf_token'] ?? '';
        if (!verify_csrf($token)) {
            http_response_code(403);
            die("Sesi kedaluwarsa atau token keamanan tidak valid. Silakan muat ulang halaman.");
        }
    }
}

/**
 * Safe redirect helper
 */
function redirect(string $path): void {
    if (!str_starts_with($path, 'http')) {
        $path = BASE_URL . '/' . ltrim($path, '/');
    }
    header("Location: " . $path);
    exit;
}

/**
 * Set session flash message
 */
function set_flash(string $type, string $message): void {
    $_SESSION['flash_messages'][] = [
        'type' => $type, // 'success', 'error', 'info', 'warning'
        'message' => $message
    ];
}

/**
 * Get and clear flash messages
 */
function get_flash(): array {
    $messages = $_SESSION['flash_messages'] ?? [];
    unset($_SESSION['flash_messages']);
    return $messages;
}

/**
 * Get setting value from settings table with fallback
 */
function get_setting(string $key, string $default = ''): string {
    static $settingsCache = null;
    if ($settingsCache === null) {
        $rows = Database::fetchAll("SELECT setting_key, setting_value FROM settings");
        $settingsCache = [];
        foreach ($rows as $row) {
            $settingsCache[$row['setting_key']] = $row['setting_value'];
        }
    }
    return $settingsCache[$key] ?? $default;
}

/**
 * Generate unique order number (e.g. ORD-20261002-8492)
 */
function generate_order_number(): string {
    $datePart = date('Ymd');
    $randomPart = strtoupper(substr(bin2hex(random_bytes(3)), 0, 4));
    return "ORD-{$datePart}-{$randomPart}";
}

/**
 * Log admin activities
 */
function log_activity(?int $adminId, string $action, string $description): void {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    Database::execute(
        "INSERT INTO activity_logs (admin_id, action, description, ip_address) VALUES (?, ?, ?, ?)",
        "isss",
        [$adminId, $action, $description, $ip]
    );
}

/**
 * Send JSON response
 */
function json_response(array $data, int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

/**
 * Get current shopping cart items with products details
 */
function get_cart(): array {
    if (!isset($_SESSION['cart'])) {
        $_SESSION['cart'] = [];
    }
    return $_SESSION['cart'];
}

/**
 * Add item to cart
 */
function add_to_cart(int $productId, int $qty = 1): bool {
    if (!isset($_SESSION['cart'])) {
        $_SESSION['cart'] = [];
    }

    $product = Database::fetchOne("SELECT id, name, price, discount_price, stock, volume_weight FROM products WHERE id = ? AND is_active = 1", "i", [$productId]);
    if (!$product) {
        return false;
    }

    $currentQty = $_SESSION['cart'][$productId]['quantity'] ?? 0;
    $newQty = $currentQty + $qty;

    if ($newQty > $product['stock']) {
        $newQty = $product['stock'];
    }

    $price = !empty($product['discount_price']) && $product['discount_price'] > 0 ? (float)$product['discount_price'] : (float)$product['price'];

    // Get primary image
    $img = Database::fetchOne("SELECT image_url FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC LIMIT 1", "i", [$productId]);
    $imageUrl = $img['image_url'] ?? 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80';

    $_SESSION['cart'][$productId] = [
        'id' => $product['id'],
        'name' => $product['name'],
        'price' => $price,
        'image' => $imageUrl,
        'volume_weight' => $product['volume_weight'],
        'quantity' => $newQty,
        'stock' => $product['stock']
    ];

    return true;
}

/**
 * Calculate cart subtotal, discount, shipping, and grand total
 */
function calculate_cart_totals(): array {
    $cart = get_cart();
    $subtotal = 0;
    $totalItems = 0;

    foreach ($cart as $item) {
        $subtotal += ($item['price'] * $item['quantity']);
        $totalItems += $item['quantity'];
    }

    $discount = 0;
    $appliedCoupon = $_SESSION['applied_coupon'] ?? null;
    if ($appliedCoupon) {
        if ($appliedCoupon['discount_type'] === 'percentage') {
            $discount = ($subtotal * ($appliedCoupon['discount_value'] / 100));
            if (!empty($appliedCoupon['max_discount']) && $discount > $appliedCoupon['max_discount']) {
                $discount = (float)$appliedCoupon['max_discount'];
            }
        } else {
            $discount = (float)$appliedCoupon['discount_value'];
        }
        if ($discount > $subtotal) {
            $discount = $subtotal;
        }
    }

    $freeShippingThreshold = (float)get_setting('free_shipping_threshold', '250000');
    $standardShipping = (float)get_setting('default_shipping_cost', '15000');

    $shipping = 0;
    if ($subtotal > 0) {
        $shipping = ($subtotal >= $freeShippingThreshold) ? 0 : $standardShipping;
    }

    $grandTotal = max(0, $subtotal - $discount + $shipping);

    return [
        'items_count' => $totalItems,
        'subtotal' => $subtotal,
        'discount' => $discount,
        'shipping' => $shipping,
        'grand_total' => $grandTotal,
        'applied_coupon' => $appliedCoupon
    ];
}
