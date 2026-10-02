<?php
/**
 * AURA BOTANICA - Product Detail Page
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/functions.php';

$slug = $_GET['slug'] ?? '';
if (empty($slug)) {
    redirect('/products');
}

$product = Database::fetchOne("
    SELECT p.*, b.name as brand_name, c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.slug = ? AND p.is_active = 1
", "s", [$slug]);

if (!$product) {
    http_response_code(404);
    require_once __DIR__ . '/includes/header.php';
    echo '<div class="container" style="padding: 100px 20px; text-align: center;"><h1>Produk Tidak Ditemukan</h1><p>Produk yang Anda cari tidak tersedia atau telah dipindahkan.</p><a href="' . BASE_URL . '/products" class="btn btn-primary" style="margin-top:20px;">Kembali ke Katalog</a></div>';
    require_once __DIR__ . '/includes/footer.php';
    exit;
}

// Fetch images
$images = Database::fetchAll("SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC", "i", [$product['id']]);
if (empty($images)) {
    $images = [['image_url' => 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', 'alt_text' => $product['name']]];
}

// Fetch approved reviews
$reviews = Database::fetchAll("SELECT * FROM reviews WHERE product_id = ? AND is_approved = 1 ORDER BY id DESC", "i", [$product['id']]);

// Fetch related products in same category
$relatedProducts = Database::fetchAll("
    SELECT p.*, 
           (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) as primary_image
    FROM products p
    WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1
    LIMIT 4
", "ii", [$product['category_id'], $product['id']]);

$customMeta = [
    'title' => (!empty($product['seo_title']) ? $product['seo_title'] : $product['name'] . ' - AURA BOTANICA'),
    'description' => (!empty($product['seo_description']) ? $product['seo_description'] : $product['short_description']),
    'og_image' => $images[0]['image_url'],
    'og_type' => 'product'
];

require_once __DIR__ . '/includes/header.php';

// JSON-LD Product Schema
echo SEO::renderProductSchema(array_merge($product, ['image_url' => $images[0]['image_url']]), $reviews);
?>

<div class="container" style="padding: 30px 20px 70px;">
    <!-- Breadcrumb -->
    <nav style="font-size: 13px; color: var(--color-text-muted); margin-bottom: 30px;">
        <a href="<?= BASE_URL ?>/">Home</a> / 
        <a href="<?= BASE_URL ?>/products">Produk</a> / 
        <a href="<?= BASE_URL ?>/products/category/<?= e($product['category_slug']) ?>"><?= e($product['category_name']) ?></a> / 
        <span style="color: var(--color-text-main); font-weight: 500;"><?= e($product['name']) ?></span>
    </nav>

    <!-- Main Product Detail Split -->
    <div style="display: grid; grid-template-columns: 1.1fr 1fr; gap: 50px; align-items: flex-start; margin-bottom: 70px;" class="hero-split">
        <!-- Gallery -->
        <div>
            <div style="background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid var(--color-border); margin-bottom: 16px;">
                <img id="main-product-image" src="<?= e($images[0]['image_url']) ?>" alt="<?= e($images[0]['alt_text'] ?? $product['name']) ?>" style="width: 100%; height: 500px; object-fit: cover;">
            </div>
            <?php if (count($images) > 1): ?>
                <div style="display: flex; gap: 12px;">
                    <?php foreach ($images as $img): ?>
                        <div style="width: 80px; height: 80px; border-radius: 6px; overflow: hidden; border: 2px solid var(--color-border); cursor: pointer;" onclick="document.getElementById('main-product-image').src='<?= e($img['image_url']) ?>'">
                            <img src="<?= e($img['image_url']) ?>" alt="" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>

        <!-- Product Purchase Information -->
        <div>
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--color-accent); font-weight: 600; margin-bottom: 8px;">
                <?= e($product['brand_name']) ?> &bull; <?= e($product['volume_weight']) ?>
            </div>
            <h1 style="font-size: 34px; line-height: 1.25; margin-bottom: 12px;"><?= e($product['name']) ?></h1>
            
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; font-size: 13.5px;">
                <div style="color: #E2B93B; letter-spacing: 2px;">★★★★★</div>
                <span style="color: var(--color-text-muted);">(<?= count($reviews) ?> ulasan pembeli terverifikasi)</span>
                <span style="color: var(--color-border);">|</span>
                <span style="color: var(--color-text-muted);">SKU: <?= e($product['sku']) ?></span>
            </div>

            <!-- Price -->
            <div style="display: flex; align-items: baseline; gap: 14px; margin-bottom: 24px; padding: 16px 20px; background: #FFFFFF; border-radius: 8px; border: 1px solid var(--color-border);">
                <?php if (!empty($product['discount_price']) && $product['discount_price'] > 0): ?>
                    <span style="font-size: 28px; font-weight: 700; color: #2C2724;"><?= format_rupiah($product['discount_price']) ?></span>
                    <span style="font-size: 18px; text-decoration: line-through; color: var(--color-text-muted);"><?= format_rupiah($product['price']) ?></span>
                    <span style="background: #FEE2E2; color: #DC2626; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">Hemat <?= round((($product['price'] - $product['discount_price']) / $product['price']) * 100) ?>%</span>
                <?php else: ?>
                    <span style="font-size: 28px; font-weight: 700; color: #2C2724;"><?= format_rupiah($product['price']) ?></span>
                <?php endif; ?>
            </div>

            <p style="font-size: 15px; line-height: 1.7; color: #4A433E; margin-bottom: 24px;">
                <?= e($product['short_description']) ?>
            </p>

            <!-- Stock status -->
            <div style="margin-bottom: 24px; font-size: 14px;">
                <?php if ($product['stock'] > 10): ?>
                    <span style="color: #16A34A; font-weight: 600;">✓ Stok Tersedia (<?= $product['stock'] ?> botol)</span>
                <?php elseif ($product['stock'] > 0): ?>
                    <span style="color: #D97706; font-weight: 600;">⚠️ Stok Terbatas! Sisa <?= $product['stock'] ?> unit</span>
                <?php else: ?>
                    <span style="color: #DC2626; font-weight: 600;">✕ Stok Habis</span>
                <?php endif; ?>
            </div>

            <!-- Add to Cart Form -->
            <form action="<?= BASE_URL ?>/cart-action.php" method="POST" class="form-add-to-cart" style="display: flex; gap: 14px; margin-bottom: 30px;">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="add">
                <input type="hidden" name="product_id" value="<?= $product['id'] ?>">
                
                <div style="display: flex; align-items: center; border: 1px solid var(--color-border); border-radius: 4px; background: #fff;">
                    <button type="button" style="padding: 12px 16px; border: none; background: none; cursor: pointer; font-size: 16px;" onclick="const q = document.getElementById('product-qty'); if(q.value>1) q.value--;">-</button>
                    <input id="product-qty" type="number" name="quantity" value="1" min="1" max="<?= $product['stock'] ?>" style="width: 50px; text-align: center; border: none; font-size: 15px; font-weight: 600;">
                    <button type="button" style="padding: 12px 16px; border: none; background: none; cursor: pointer; font-size: 16px;" onclick="const q = document.getElementById('product-qty'); if(q.value < <?= $product['stock'] ?>) q.value++;">+</button>
                </div>

                <button type="submit" class="btn btn-primary" style="flex-grow: 1; padding: 14px 28px; font-size: 15px;" <?= ($product['stock'] <= 0) ? 'disabled' : '' ?>>
                    + Tambahkan ke Keranjang
                </button>
            </form>

            <div style="background: #F4EFEB; padding: 18px 20px; border-radius: 8px; font-size: 13.5px; display: flex; flex-direction: column; gap: 10px;">
                <div>🚚 <strong>Gratis Ongkir:</strong> Otomatis untuk pesanan minimal Rp 250.000</div>
                <div>🌿 <strong>Clean Formula:</strong> Teruji dermatologis, bebas alkohol, paraben, & SLS</div>
                <div>🔒 <strong>100% Produk Original:</strong> Terdaftar resmi BPOM & bersertifikat halal</div>
            </div>
        </div>
    </div>

    <!-- Product Tabs: Description, Benefits, Ingredients, How to Use -->
    <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 12px; padding: 40px; margin-bottom: 60px;">
        <h2 style="font-size: 26px; margin-bottom: 20px;">Deskripsi & Informasi Formula</h2>
        <div style="font-size: 15px; line-height: 1.8; color: #4A433E; margin-bottom: 30px;">
            <?= nl2br(e($product['full_description'])) ?>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; border-top: 1px solid var(--color-border); padding-top: 30px;">
            <div>
                <h3 style="font-size: 20px; margin-bottom: 12px;">Manfaat Utama (Benefits)</h3>
                <p style="font-size: 14.5px; line-height: 1.7; color: #4A433E;"><?= nl2br(e($product['benefits'])) ?></p>
            </div>
            <div>
                <h3 style="font-size: 20px; margin-bottom: 12px;">Cara Pemakaian (How to Use)</h3>
                <p style="font-size: 14.5px; line-height: 1.7; color: #4A433E;"><?= nl2br(e($product['how_to_use'])) ?></p>
            </div>
        </div>

        <div style="margin-top: 30px; border-top: 1px solid var(--color-border); padding-top: 25px;">
            <h3 style="font-size: 20px; margin-bottom: 10px;">Komposisi Lengkap (Ingredients)</h3>
            <p style="font-size: 13.5px; line-height: 1.7; color: #6B6259; font-family: monospace; background: #FAF8F5; padding: 16px; border-radius: 6px; border: 1px solid var(--color-border);">
                <?= e($product['ingredients']) ?>
            </p>
        </div>
    </div>

    <!-- Customer Reviews -->
    <div style="margin-bottom: 70px;">
        <h2 style="font-size: 28px; margin-bottom: 24px;">Ulasan Pelanggan Terverifikasi</h2>
        <?php if (empty($reviews)): ?>
            <p style="color: var(--color-text-muted);">Belum ada ulasan untuk produk ini. Jadilah yang pertama memberikan ulasan!</p>
        <?php else: ?>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                <?php foreach ($reviews as $rev): ?>
                    <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 8px; padding: 22px;">
                        <div style="color: #E2B93B; margin-bottom: 8px;">★★★★★</div>
                        <p style="font-size: 14px; line-height: 1.6; color: #3A342F; margin-bottom: 14px;">&ldquo;<?= e($rev['comment']) ?>&rdquo;</p>
                        <div style="font-weight: 600; font-size: 13px;"><?= e($rev['customer_name']) ?></div>
                        <div style="font-size: 11px; color: var(--color-text-muted);"><?= date('d M Y', strtotime($rev['created_at'])) ?></div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
