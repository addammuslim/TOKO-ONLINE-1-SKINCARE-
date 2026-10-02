<?php
/**
 * AURA BOTANICA - Single Article Detail
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/functions.php';

$slug = $_GET['slug'] ?? '';
if (empty($slug)) {
    redirect('/articles');
}

$article = Database::fetchOne("
    SELECT a.*, c.name as category_name, c.slug as category_slug, ad.name as author_name
    FROM articles a
    LEFT JOIN article_categories c ON a.category_id = c.id
    LEFT JOIN admins ad ON a.author_id = ad.id
    WHERE a.slug = ? AND a.status = 'published'
", "s", [$slug]);

if (!$article) {
    http_response_code(404);
    require_once __DIR__ . '/includes/header.php';
    echo '<div class="container" style="padding: 100px 20px; text-align: center;"><h1>Artikel Tidak Ditemukan</h1><p>Artikel yang Anda cari tidak tersedia.</p><a href="' . BASE_URL . '/articles" class="btn btn-primary" style="margin-top:20px;">Kembali ke Jurnal</a></div>';
    require_once __DIR__ . '/includes/footer.php';
    exit;
}

// Increment views
Database::execute("UPDATE articles SET views = views + 1 WHERE id = ?", "i", [$article['id']]);

$customMeta = [
    'title' => (!empty($article['seo_title']) ? $article['seo_title'] : $article['title'] . ' - AURA BOTANICA'),
    'description' => (!empty($article['seo_description']) ? $article['seo_description'] : $article['excerpt']),
    'og_image' => $article['featured_image'],
    'og_type' => 'article'
];

require_once __DIR__ . '/includes/header.php';
echo SEO::renderArticleSchema($article);
?>

<div class="container" style="padding: 40px 20px 90px; max-width: 860px;">
    <!-- Breadcrumb -->
    <nav style="font-size: 13px; color: var(--color-text-muted); margin-bottom: 24px;">
        <a href="<?= BASE_URL ?>/">Home</a> / 
        <a href="<?= BASE_URL ?>/articles">Jurnal</a> / 
        <a href="<?= BASE_URL ?>/articles?category=<?= e($article['category_slug']) ?>"><?= e($article['category_name']) ?></a> / 
        <span><?= e($article['title']) ?></span>
    </nav>

    <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-accent); font-weight: 600; margin-bottom: 12px;">
        <?= e($article['category_name']) ?> &bull; Dipublikasikan <?= date('d F Y', strtotime($article['published_at'])) ?>
    </div>

    <h1 style="font-size: 40px; line-height: 1.25; margin-bottom: 20px;"><?= e($article['title']) ?></h1>

    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid var(--color-border); font-size: 14px; color: var(--color-text-muted);">
        <span>Penulis: <strong><?= e($article['author_name'] ?? 'Editorial Team') ?></strong></span>
        <span>&bull;</span>
        <span>Dibaca: <?= number_format($article['views'] + 1) ?> kali</span>
    </div>

    <div style="border-radius: 12px; overflow: hidden; margin-bottom: 40px; box-shadow: var(--shadow-card);">
        <img src="<?= e($article['featured_image']) ?>" alt="<?= e($article['title']) ?>" style="width: 100%; height: auto; max-height: 480px; object-fit: cover;">
    </div>

    <div style="background: #FFFFFF; border-radius: 12px; border: 1px solid var(--color-border); padding: 40px; font-size: 16px; line-height: 1.85; color: #3A342F;">
        <p style="font-size: 18px; font-style: italic; color: #5C544E; margin-bottom: 24px; border-left: 3px solid var(--color-accent); padding-left: 16px;">
            <?= e($article['excerpt']) ?>
        </p>
        
        <?= $article['content'] ?>
    </div>

    <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: center;">
        <a href="<?= BASE_URL ?>/articles" class="btn btn-outline">&larr; Kembali ke Daftar Artikel</a>
        <a href="<?= BASE_URL ?>/products" class="btn btn-primary">Lihat Produk Rekomendasi</a>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
