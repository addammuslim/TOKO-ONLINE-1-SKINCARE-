<?php
/**
 * AURA BOTANICA - Articles & Skincare Journal
 */
require_once __DIR__ . '/config/database.php';

$categorySlug = $_GET['category'] ?? '';
$search = trim($_GET['search'] ?? '');

$where = ["a.status = 'published'"];
$params = [];
$types = "";

if (!empty($categorySlug)) {
    $where[] = "c.slug = ?";
    $params[] = $categorySlug;
    $types .= "s";
}

if (!empty($search)) {
    $where[] = "(a.title LIKE ? OR a.excerpt LIKE ?)";
    $like = "%" . $search . "%";
    $params[] = $like;
    $params[] = $like;
    $types .= "ss";
}

$whereSql = implode(" AND ", $where);
$articles = Database::fetchAll("
    SELECT a.*, c.name as category_name, c.slug as category_slug, ad.name as author_name
    FROM articles a
    LEFT JOIN article_categories c ON a.category_id = c.id
    LEFT JOIN admins ad ON a.author_id = ad.id
    WHERE {$whereSql}
    ORDER BY a.published_at DESC
", $types, $params);

$categories = Database::fetchAll("SELECT * FROM article_categories ORDER BY id ASC");

$customMeta = [
    'title' => 'Jurnal Kulit & Edukasi Skincare - AURA BOTANICA',
    'description' => 'Panduan terpercaya dari pakar kecantikan dan dermatologi tentang cara merawat kulit, kandungan aktif, dan perbaikan skin barrier.'
];
require_once __DIR__ . '/includes/header.php';
?>

<div style="background: #F4EFEB; padding: 40px 0; border-bottom: 1px solid var(--color-border);">
    <div class="container">
        <h1 style="font-size: 38px; margin-bottom: 8px;">Jurnal & Edukasi Kulit</h1>
        <p style="color: var(--color-text-muted);">Sains dermatologi, panduan bahan aktif, dan ritual perawatan untuk kulit sehat alami.</p>
    </div>
</div>

<div class="container" style="padding: 40px 20px 80px;">
    <!-- Category pills -->
    <div style="display: flex; gap: 10px; margin-bottom: 40px; flex-wrap: wrap;">
        <a href="<?= BASE_URL ?>/articles" style="padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 500; <?= empty($categorySlug) ? 'background:#2C2724; color:#fff;' : 'background:#FFFFFF; border: 1px solid var(--color-border); color:#2C2724;' ?>">Semua Topik</a>
        <?php foreach ($categories as $cat): ?>
            <a href="<?= BASE_URL ?>/articles?category=<?= e($cat['slug']) ?>" style="padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 500; <?= ($categorySlug === $cat['slug']) ? 'background:#2C2724; color:#fff;' : 'background:#FFFFFF; border: 1px solid var(--color-border); color:#2C2724;' ?>">
                <?= e($cat['name']) ?>
            </a>
        <?php endforeach; ?>
    </div>

    <!-- Article Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 32px;">
        <?php foreach ($articles as $art): ?>
            <article style="background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid var(--color-border); display: flex; flex-direction: column;">
                <a href="<?= BASE_URL ?>/article/<?= e($art['slug']) ?>">
                    <img src="<?= e($art['featured_image']) ?>" alt="<?= e($art['title']) ?>" style="height: 220px; width: 100%; object-fit: cover;">
                </a>
                <div style="padding: 24px; display: flex; flex-direction: column; flex-grow: 1;">
                    <div style="font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-accent); font-weight: 600; margin-bottom: 10px;">
                        <?= e($art['category_name']) ?> &bull; <?= date('d M Y', strtotime($art['published_at'])) ?>
                    </div>
                    <h2 style="font-size: 20px; line-height: 1.35; margin-bottom: 12px; font-weight: 600;">
                        <a href="<?= BASE_URL ?>/article/<?= e($art['slug']) ?>"><?= e($art['title']) ?></a>
                    </h2>
                    <p style="font-size: 14px; line-height: 1.6; color: var(--color-text-muted); margin-bottom: 20px; flex-grow: 1;">
                        <?= e(mb_strimwidth(strip_tags($art['excerpt']), 0, 120, '...')) ?>
                    </p>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border); padding-top: 14px; font-size: 12px; color: var(--color-text-muted);">
                        <span>Oleh: <?= e($art['author_name'] ?? 'Editorial Team') ?></span>
                        <a href="<?= BASE_URL ?>/article/<?= e($art['slug']) ?>" style="font-weight: 600; color: var(--color-text-main);">Baca Artikel &rarr;</a>
                    </div>
                </div>
            </article>
        <?php endforeach; ?>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
