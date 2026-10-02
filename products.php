<?php
/**
 * AURA BOTANICA - Product Catalog / Listing
 */
require_once __DIR__ . '/config/database.php';

$categorySlug = $_GET['category'] ?? '';
$search = trim($_GET['search'] ?? '');
$sort = $_GET['sort'] ?? 'newest';
$page = max(1, (int)($_GET['page'] ?? 1));
$limit = 12;
$offset = ($page - 1) * $limit;

// Base query parts
$whereClauses = ["p.is_active = 1"];
$params = [];
$types = "";

if (!empty($categorySlug)) {
    $whereClauses[] = "c.slug = ?";
    $params[] = $categorySlug;
    $types .= "s";
}

if (!empty($search)) {
    $whereClauses[] = "(p.name LIKE ? OR p.short_description LIKE ?)";
    $likeSearch = "%" . $search . "%";
    $params[] = $likeSearch;
    $params[] = $likeSearch;
    $types .= "ss";
}

$orderBy = "p.id DESC";
if ($sort === 'price_asc') {
    $orderBy = "COALESCE(NULLIF(p.discount_price, 0), p.price) ASC";
} elseif ($sort === 'price_desc') {
    $orderBy = "COALESCE(NULLIF(p.discount_price, 0), p.price) DESC";
} elseif ($sort === 'popular' || $sort === 'bestseller') {
    $orderBy = "p.is_bestseller DESC, p.id DESC";
}

$whereSql = implode(" AND ", $whereClauses);

// Count total
$countQuery = "
    SELECT COUNT(*) as total 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE {$whereSql}
";
$totalRow = Database::fetchOne($countQuery, $types, $params);
$totalProducts = $totalRow['total'] ?? 0;
$totalPages = ceil($totalProducts / $limit);

// Fetch products
$productQuery = "
    SELECT p.*, b.name as brand_name, c.name as category_name, c.slug as category_slug,
           (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) as primary_image
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE {$whereSql}
    ORDER BY {$orderBy}
    LIMIT {$limit} OFFSET {$offset}
";
$products = Database::fetchAll($productQuery, $types, $params);

// Fetch all categories for filter
$allCategories = Database::fetchAll("SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC");

$customMeta = [
    'title' => 'Koleksi Skincare Botanical - AURA BOTANICA',
    'description' => 'Eksplorasi rangkaian produk perawatan wajah lengkap: cleanser, toner, serum, pelembap ceramide, dan sunscreen.'
];
require_once __DIR__ . '/includes/header.php';
?>

<div style="background: #F4EFEB; padding: 40px 0; border-bottom: 1px solid var(--color-border);">
    <div class="container">
        <h1 style="font-size: 38px; margin-bottom: 8px;">Koleksi Skincare</h1>
        <p style="color: var(--color-text-muted);">Temukan formula botani yang disesuaikan khusus untuk kebutuhan dan tipe kulit Anda.</p>
    </div>
</div>

<div class="container" style="padding: 40px 20px;">
    <!-- Filter Bar -->
    <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 35px; background: #FFFFFF; padding: 18px 24px; border-radius: 8px; border: 1px solid var(--color-border);">
        <!-- Category Pills -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <a href="<?= BASE_URL ?>/products" style="padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 500; <?= empty($categorySlug) ? 'background: #2C2724; color: #fff;' : 'background: #F4EFEB; color: #4A433E;' ?>">Semua</a>
            <?php foreach ($allCategories as $cat): ?>
                <a href="<?= BASE_URL ?>/products/category/<?= e($cat['slug']) ?>" style="padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 500; <?= ($categorySlug === $cat['slug']) ? 'background: #2C2724; color: #fff;' : 'background: #F4EFEB; color: #4A433E;' ?>">
                    <?= e($cat['name']) ?>
                </a>
            <?php endforeach; ?>
        </div>

        <!-- Sort Dropdown -->
        <form method="GET" action="<?= BASE_URL ?>/products" style="display: flex; align-items: center; gap: 10px;">
            <?php if (!empty($categorySlug)): ?>
                <input type="hidden" name="category" value="<?= e($categorySlug) ?>">
            <?php endif; ?>
            <label style="font-size: 13px; color: var(--color-text-muted);">Urutkan:</label>
            <select name="sort" onchange="this.form.submit()" style="padding: 6px 12px; border: 1px solid var(--color-border); border-radius: 4px; font-size: 13px; background: #fff;">
                <option value="newest" <?= $sort === 'newest' ? 'selected' : '' ?>>Terbaru</option>
                <option value="popular" <?= $sort === 'popular' ? 'selected' : '' ?>>Paling Populer</option>
                <option value="price_asc" <?= $sort === 'price_asc' ? 'selected' : '' ?>>Harga: Rendah ke Tinggi</option>
                <option value="price_desc" <?= $sort === 'price_desc' ? 'selected' : '' ?>>Harga: Tinggi ke Rendah</option>
            </select>
        </form>
    </div>

    <!-- Product Grid -->
    <?php if (empty($products)): ?>
        <div style="text-align: center; padding: 60px 20px; background: #fff; border-radius: 8px; border: 1px solid var(--color-border);">
            <div style="font-size: 40px; margin-bottom: 12px;">🌿</div>
            <h3>Produk Tidak Ditemukan</h3>
            <p style="color: var(--color-text-muted); margin-top: 6px;">Coba gunakan kata kunci pencarian lain atau pilih kategori lain.</p>
            <a href="<?= BASE_URL ?>/products" class="btn btn-outline" style="margin-top: 18px;">Lihat Semua Produk</a>
        </div>
    <?php else: ?>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 28px;">
            <?php foreach ($products as $prod): 
                $price = !empty($prod['discount_price']) && $prod['discount_price'] > 0 ? $prod['discount_price'] : $prod['price'];
            ?>
                <div class="product-card">
                    <div class="product-image-wrap">
                        <?php if ($prod['is_bestseller']): ?>
                            <span class="product-badge">Best Seller</span>
                        <?php elseif ($prod['is_new_arrival']): ?>
                            <span class="product-badge" style="background: #E8F0FE; color: #1A73E8;">New</span>
                        <?php endif; ?>
                        <a href="<?= BASE_URL ?>/product/<?= e($prod['slug']) ?>">
                            <img src="<?= e($prod['primary_image'] ?? 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80') ?>" alt="<?= e($prod['name']) ?>" loading="lazy">
                        </a>
                    </div>
                    <div class="product-body">
                        <div class="product-category-meta"><?= e($prod['category_name']) ?> &bull; <?= e($prod['volume_weight']) ?></div>
                        <h3 class="product-title">
                            <a href="<?= BASE_URL ?>/product/<?= e($prod['slug']) ?>"><?= e($prod['name']) ?></a>
                        </h3>
                        <p style="font-size: 13px; color: var(--color-text-muted); margin-bottom: 14px; line-height: 1.5;">
                            <?= e(mb_strimwidth($prod['short_description'] ?? '', 0, 80, '...')) ?>
                        </p>
                        <div class="product-prices">
                            <span class="price-current"><?= format_rupiah($price) ?></span>
                            <?php if (!empty($prod['discount_price']) && $prod['discount_price'] > 0): ?>
                                <span class="price-old"><?= format_rupiah($prod['price']) ?></span>
                            <?php endif; ?>
                        </div>
                        <form action="<?= BASE_URL ?>/cart-action.php" method="POST" class="form-add-to-cart">
                            <?= csrf_field() ?>
                            <input type="hidden" name="action" value="add">
                            <input type="hidden" name="product_id" value="<?= $prod['id'] ?>">
                            <input type="hidden" name="quantity" value="1">
                            <button type="submit" class="btn btn-outline" style="width: 100%; padding: 10px; font-size: 13px;">
                                + Tambah ke Keranjang
                            </button>
                        </form>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Pagination -->
        <?php if ($totalPages > 1): ?>
            <div style="display: flex; justify-content: center; gap: 8px; margin-top: 50px;">
                <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                    <a href="?page=<?= $i ?><?= !empty($categorySlug) ? '&category=' . e($categorySlug) : '' ?><?= !empty($sort) ? '&sort=' . e($sort) : '' ?>" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 6px; font-size: 14px; font-weight: 600; <?= ($page === $i) ? 'background: #2C2724; color: #fff;' : 'background: #fff; border: 1px solid var(--color-border); color: #2C2724;' ?>">
                        <?= $i ?>
                    </a>
                <?php endfor; ?>
            </div>
        <?php endif; ?>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
