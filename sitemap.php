<?php
/**
 * AURA BOTANICA - Dynamic XML Sitemap Generator
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/functions.php';

header("Content-Type: application/xml; charset=utf-8");

echo '<?xml version="1.0" encoding="UTF-8"?>';
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Homepage -->
    <url>
        <loc><?= BASE_URL ?>/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>

    <!-- Main Public Pages -->
    <url>
        <loc><?= BASE_URL ?>/products</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc><?= BASE_URL ?>/articles</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc><?= BASE_URL ?>/about-us</loc>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
    <url>
        <loc><?= BASE_URL ?>/contact-us</loc>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
    <url>
        <loc><?= BASE_URL ?>/faq</loc>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>

    <!-- Dynamic Categories -->
    <?php
    $categories = Database::fetchAll("SELECT slug, created_at FROM categories WHERE is_active = 1");
    foreach ($categories as $cat):
    ?>
    <url>
        <loc><?= BASE_URL ?>/products/category/<?= e($cat['slug']) ?></loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <?php endforeach; ?>

    <!-- Dynamic Products -->
    <?php
    $products = Database::fetchAll("SELECT slug, updated_at FROM products WHERE is_active = 1 ORDER BY id DESC");
    foreach ($products as $prod):
        $lastmod = date('Y-m-d', strtotime($prod['updated_at'] ?? 'now'));
    ?>
    <url>
        <loc><?= BASE_URL ?>/product/<?= e($prod['slug']) ?></loc>
        <lastmod><?= $lastmod ?></lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.85</priority>
    </url>
    <?php endforeach; ?>

    <!-- Dynamic Articles -->
    <?php
    $articles = Database::fetchAll("SELECT slug, updated_at FROM articles WHERE status = 'published' ORDER BY id DESC");
    foreach ($articles as $art):
        $lastmod = date('Y-m-d', strtotime($art['updated_at'] ?? 'now'));
    ?>
    <url>
        <loc><?= BASE_URL ?>/article/<?= e($art['slug']) ?></loc>
        <lastmod><?= $lastmod ?></lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <?php endforeach; ?>
</urlset>
