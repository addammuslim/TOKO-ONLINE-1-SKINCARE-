<?php
/**
 * AURA BOTANICA - Home Page
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/header.php';

// Fetch Featured & Best Seller products
$bestSellers = Database::fetchAll("
    SELECT p.*, b.name as brand_name, c.name as category_name,
           (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) as primary_image
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1 AND p.is_bestseller = 1
    ORDER BY p.id DESC
    LIMIT 4
");

$featuredProducts = Database::fetchAll("
    SELECT p.*, b.name as brand_name, c.name as category_name,
           (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) as primary_image
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1 AND p.is_featured = 1
    ORDER BY p.id DESC
    LIMIT 8
");

// Fetch active categories
$categories = Database::fetchAll("SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC LIMIT 6");

// Fetch recent articles
$recentArticles = Database::fetchAll("
    SELECT a.*, c.name as category_name, ad.name as author_name
    FROM articles a
    LEFT JOIN article_categories c ON a.category_id = c.id
    LEFT JOIN admins ad ON a.author_id = ad.id
    WHERE a.status = 'published'
    ORDER BY a.published_at DESC
    LIMIT 3
");

// Fetch verified testimonials
$testimonials = Database::fetchAll("
    SELECT r.*, p.name as product_name
    FROM reviews r
    JOIN products p ON r.product_id = p.id
    WHERE r.is_approved = 1 AND r.rating >= 5
    ORDER BY r.id DESC
    LIMIT 3
");
?>

<!-- Hero Section -->
<section style="background: linear-gradient(135deg, #F5EFEB 0%, #EDE4DB 100%); padding: 90px 0 80px; border-bottom: 1px solid var(--color-border);">
    <div class="container" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 50px; align-items: center;" class="hero-split">
        <div>
            <div style="display: inline-block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: var(--color-accent); margin-bottom: 16px;">
                HAUTE BOTANICAL CLINICAL SKINCARE
            </div>
            <h1 style="font-size: 52px; line-height: 1.15; margin-bottom: 24px; color: #1F1C1A;">
                <?= e(get_setting('hero_heading', 'Kembalikan Kemilau Sehat Alami Kulit Anda')) ?>
            </h1>
            <p style="font-size: 17px; line-height: 1.7; color: #5C544E; margin-bottom: 36px; max-width: 520px;">
                <?= e(get_setting('hero_subheading', 'Formulasi botani murni diperkaya 5X Ceramide & Niacinamide aktif untuk merevitalisasi skin barrier dan menjaga hidrasi tahan lama.')) ?>
            </p>
            <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                <a href="<?= BASE_URL ?>/products" class="btn btn-primary" style="padding: 15px 36px; font-size: 15px;">
                    <?= e(get_setting('hero_cta_text', 'Belanja Sekarang')) ?>
                </a>
                <a href="<?= BASE_URL ?>/articles" class="btn btn-outline" style="padding: 15px 30px; font-size: 15px;">
                    Jelajahi Jurnal Kulit
                </a>
            </div>
            
            <div style="display: flex; gap: 32px; margin-top: 48px; border-top: 1px solid rgba(155, 120, 111, 0.2); padding-top: 24px;">
                <div>
                    <div style="font-size: 24px; font-weight: 700; color: #1F1C1A;">100%</div>
                    <div style="font-size: 12px; color: #736B63; text-transform: uppercase;">Cruelty Free</div>
                </div>
                <div>
                    <div style="font-size: 24px; font-weight: 700; color: #1F1C1A;">pH 5.5</div>
                    <div style="font-size: 12px; color: #736B63; text-transform: uppercase;">Barrier Safe</div>
                </div>
                <div>
                    <div style="font-size: 24px; font-weight: 700; color: #1F1C1A;">0%</div>
                    <div style="font-size: 12px; color: #736B63; text-transform: uppercase;">Paraben & SLS</div>
                </div>
            </div>
        </div>

        <div style="position: relative;">
            <div style="border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(44, 39, 36, 0.12); border: 8px solid #FFFFFF;">
                <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80" alt="Aura Botanica Serum" style="width: 100%; height: 500px; object-fit: cover;">
            </div>
        </div>
    </div>
</section>

<!-- Category Showcase -->
<section style="padding: 70px 0 40px;">
    <div class="container">
        <div style="text-align: center; margin-bottom: 45px;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--color-accent); font-weight: 600;">Eksplorasi Ritual Kulit</div>
            <h2 style="font-size: 36px; margin-top: 6px;">Kategori Pilihan</h2>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px;">
            <?php foreach ($categories as $cat): ?>
                <a href="<?= BASE_URL ?>/products/category/<?= e($cat['slug']) ?>" style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 12px; padding: 24px 16px; text-align: center; transition: all 0.3s ease; display: block;" onmouseover="this.style.borderColor='var(--color-accent)'; this.style.transform='translateY(-4px)';" onmouseout="this.style.borderColor='var(--color-border)'; this.style.transform='none';">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background: #FAF5F0; margin: 0 auto 14px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: var(--color-accent);">
                        ✨
                    </div>
                    <div style="font-weight: 600; font-size: 15px; margin-bottom: 4px;"><?= e($cat['name']) ?></div>
                    <div style="font-size: 12px; color: var(--color-text-muted);"><?= e(mb_strimwidth($cat['description'] ?? '', 0, 45, '...')) ?></div>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- Best Sellers Grid -->
<section style="padding: 60px 0;">
    <div class="container">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 35px;">
            <div>
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--color-accent); font-weight: 600;">Paling Diminati</div>
                <h2 style="font-size: 36px; margin-top: 4px;">Produk Best Seller</h2>
            </div>
            <a href="<?= BASE_URL ?>/products" style="font-weight: 600; font-size: 14px; color: var(--color-text-main); text-decoration: underline; text-underline-offset: 6px;">Lihat Semua &rarr;</a>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 28px;">
            <?php foreach ($bestSellers as $prod): 
                $price = !empty($prod['discount_price']) && $prod['discount_price'] > 0 ? $prod['discount_price'] : $prod['price'];
            ?>
                <div class="product-card">
                    <div class="product-image-wrap">
                        <span class="product-badge">Best Seller</span>
                        <a href="<?= BASE_URL ?>/product/<?= e($prod['slug']) ?>">
                            <img src="<?= e($prod['primary_image'] ?? 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80') ?>" alt="<?= e($prod['name']) ?>" loading="lazy">
                        </a>
                    </div>
                    <div class="product-body">
                        <div class="product-category-meta"><?= e($prod['category_name']) ?> &bull; <?= e($prod['volume_weight']) ?></div>
                        <h3 class="product-title">
                            <a href="<?= BASE_URL ?>/product/<?= e($prod['slug']) ?>"><?= e($prod['name']) ?></a>
                        </h3>
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
                                + Keranjang
                            </button>
                        </form>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- Skincare Philosophy & Benefits -->
<section style="background: #231F1C; color: #FAF8F5; padding: 80px 0; margin: 40px 0;">
    <div class="container">
        <div style="text-align: center; max-width: 680px; margin: 0 auto 50px;">
            <div style="font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #C2A299; margin-bottom: 10px;">Filosofi Kami</div>
            <h2 style="font-size: 38px; color: #FAF8F5; margin-bottom: 18px;">Kecantikan Sejati Dimulai dari Barrier Kulit yang Sehat</h2>
            <p style="color: #A89E94; font-size: 16px; line-height: 1.7;">
                Kami tidak percaya pada janji instan yang mengikis lapisan pelindung kulit. Setiap tetes formula Aura Botanica dirancang untuk menutrisi mikrobioma, mengunci kelembapan alami, dan mencegah penuaan sel secara berkelanjutan.
            </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 32px;">
            <div style="border-left: 2px solid #5A4E46; padding-left: 20px;">
                <h4 style="font-size: 20px; color: #FAF8F5; margin-bottom: 10px;">Clean Botanical Ingredients</h4>
                <p style="color: #9E9285; font-size: 14px;">Bahan botani murni perasan dingin tanpa pestisida, bebas paraben, sulfat, alkohol denat, dan pewangi buatan.</p>
            </div>
            <div style="border-left: 2px solid #5A4E46; padding-left: 20px;">
                <h4 style="font-size: 20px; color: #FAF8F5; margin-bottom: 10px;">Clinical Biomimetic Actives</h4>
                <p style="color: #9E9285; font-size: 14px;">Kombinasi 5 jenis Ceramide dan Peptida rantai ganda yang meniru struktur lipid alami sel kulit manusia.</p>
            </div>
            <div style="border-left: 2px solid #5A4E46; padding-left: 20px;">
                <h4 style="font-size: 20px; color: #FAF8F5; margin-bottom: 10px;">Dermatologist Verified</h4>
                <p style="color: #9E9285; font-size: 14px;">Telah melalui uji klinis hypoallergenic sehingga aman untuk kulit paling reaktif, sensitif, eczema, dan bumil.</p>
            </div>
        </div>
    </div>
</section>

<!-- Customer Reviews / Testimonials -->
<section style="padding: 70px 0;">
    <div class="container">
        <div style="text-align: center; margin-bottom: 50px;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--color-accent); font-weight: 600;">Ulasan Pelanggan</div>
            <h2 style="font-size: 36px; margin-top: 6px;">Kisah Nyata Perubahan Kulit</h2>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
            <?php foreach ($testimonials as $t): ?>
                <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 12px; padding: 32px 28px; display: flex; flex-direction: column;">
                    <div style="color: #E2B93B; font-size: 18px; margin-bottom: 14px;">★★★★★</div>
                    <p style="font-style: italic; color: #4A433E; font-size: 15px; line-height: 1.7; margin-bottom: 20px; flex-grow: 1;">
                        &ldquo;<?= e($t['comment']) ?>&rdquo;
                    </p>
                    <div style="border-top: 1px solid var(--color-border); padding-top: 16px;">
                        <div style="font-weight: 700; font-size: 14px;"><?= e($t['customer_name']) ?></div>
                        <div style="font-size: 12px; color: var(--color-accent); margin-top: 2px;">Verified Buyer &bull; <?= e($t['product_name']) ?></div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- Skincare Journal / Articles Section -->
<section style="padding: 60px 0; background: #F6F2ED;">
    <div class="container">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 35px;">
            <div>
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--color-accent); font-weight: 600;">Jurnal & Edukasi Kulit</div>
                <h2 style="font-size: 36px; margin-top: 4px;">Artikel Pilihan Terbaru</h2>
            </div>
            <a href="<?= BASE_URL ?>/articles" style="font-weight: 600; font-size: 14px; color: var(--color-text-main); text-decoration: underline;">Baca Seluruh Artikel &rarr;</a>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
            <?php foreach ($recentArticles as $art): ?>
                <article style="background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid var(--color-border); display: flex; flex-direction: column;">
                    <img src="<?= e($art['featured_image']) ?>" alt="<?= e($art['title']) ?>" style="height: 200px; width: 100%; object-fit: cover;">
                    <div style="padding: 24px; display: flex; flex-direction: column; flex-grow: 1;">
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-accent); font-weight: 600; margin-bottom: 8px;">
                            <?= e($art['category_name']) ?> &bull; <?= date('d M Y', strtotime($art['published_at'])) ?>
                        </span>
                        <h3 style="font-size: 18px; line-height: 1.4; margin-bottom: 12px; font-weight: 600;">
                            <a href="<?= BASE_URL ?>/article/<?= e($art['slug']) ?>"><?= e($art['title']) ?></a>
                        </h3>
                        <p style="color: var(--color-text-muted); font-size: 13.5px; line-height: 1.6; margin-bottom: 18px; flex-grow: 1;">
                            <?= e(mb_strimwidth(strip_tags($art['excerpt']), 0, 110, '...')) ?>
                        </p>
                        <a href="<?= BASE_URL ?>/article/<?= e($art['slug']) ?>" style="font-weight: 600; font-size: 13px; color: var(--color-text-main);">Baca Selengkapnya &rarr;</a>
                    </div>
                </article>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
