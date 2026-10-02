<?php
/**
 * AURA BOTANICA - SEO & JSON-LD Structured Data Helper
 */

require_once __DIR__ . '/functions.php';

class SEO {
    public static function getMeta(string $pageKey = 'home'): array {
        $seo = Database::fetchOne("SELECT * FROM seo_settings WHERE page_key = ?", "s", [$pageKey]);
        if (!$seo) {
            return [
                'title' => get_setting('site_name', 'AURA BOTANICA') . ' - ' . get_setting('site_tagline', 'Haute Botanical Skincare'),
                'description' => 'Toko online skincare premium formulasi botani murni diperkaya bahan aktif dermatologis.',
                'keywords' => 'skincare botanical, serum, toner, moisturizer, sunscreen',
                'og_image' => 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80',
                'canonical_url' => BASE_URL
            ];
        }
        return $seo;
    }

    public static function renderHeader(array $customMeta = []): void {
        $meta = array_merge(self::getMeta('home'), $customMeta);
        $title = e($meta['title'] ?? APP_NAME);
        $desc = e($meta['description'] ?? '');
        $keywords = e($meta['keywords'] ?? '');
        $ogImage = e($meta['og_image'] ?? 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80');
        $canonical = e($meta['canonical_url'] ?? (BASE_URL . ($_SERVER['REQUEST_URI'] ?? '')));
        $ogType = e($meta['og_type'] ?? 'website');

        echo <<<HTML
    <title>{$title}</title>
    <meta name="description" content="{$desc}">
    <meta name="keywords" content="{$keywords}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="{$canonical}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="{$ogType}">
    <meta property="og:url" content="{$canonical}">
    <meta property="og:title" content="{$title}">
    <meta property="og:description" content="{$desc}">
    <meta property="og:image" content="{$ogImage}">
    <meta property="og:site_name" content="AURA BOTANICA">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="{$canonical}">
    <meta name="twitter:title" content="{$title}">
    <meta name="twitter:description" content="{$desc}">
    <meta name="twitter:image" content="{$ogImage}">
HTML;
    }

    public static function renderOrganizationSchema(): string {
        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => 'AURA BOTANICA',
            'url' => BASE_URL,
            'logo' => BASE_URL . '/assets/images/logo.png',
            'contactPoint' => [
                '@type' => 'ContactPoint',
                'telephone' => get_setting('site_phone', '+62 812-3456-7890'),
                'contactType' => 'customer service',
                'areaServed' => 'ID',
                'availableLanguage' => ['Indonesian', 'English']
            ]
        ];
        return '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . '</script>';
    }

    public static function renderProductSchema(array $product, array $reviews = []): string {
        $price = !empty($product['discount_price']) && $product['discount_price'] > 0 ? $product['discount_price'] : $product['price'];
        $ratingCount = count($reviews);
        $avgRating = 5.0;
        if ($ratingCount > 0) {
            $sum = array_reduce($reviews, fn($carry, $item) => $carry + (int)$item['rating'], 0);
            $avgRating = round($sum / $ratingCount, 1);
        }

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            'name' => $product['name'],
            'image' => $product['image_url'] ?? '',
            'description' => strip_tags($product['short_description'] ?? ''),
            'sku' => $product['sku'],
            'brand' => [
                '@type' => 'Brand',
                'name' => $product['brand_name'] ?? 'AURA BOTANICA'
            ],
            'offers' => [
                '@type' => 'Offer',
                'url' => BASE_URL . '/product/' . $product['slug'],
                'priceCurrency' => 'IDR',
                'price' => (float)$price,
                'priceValidUntil' => date('Y-12-31'),
                'itemCondition' => 'https://schema.org/NewCondition',
                'availability' => ($product['stock'] > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
            ]
        ];

        if ($ratingCount > 0) {
            $schema['aggregateRating'] = [
                '@type' => 'AggregateRating',
                'ratingValue' => $avgRating,
                'reviewCount' => $ratingCount
            ];
        }

        return '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . '</script>';
    }

    public static function renderArticleSchema(array $article): string {
        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Article',
            'headline' => $article['title'],
            'image' => [$article['featured_image']],
            'datePublished' => date('c', strtotime($article['published_at'] ?? 'now')),
            'dateModified' => date('c', strtotime($article['updated_at'] ?? 'now')),
            'author' => [
                '@type' => 'Person',
                'name' => $article['author_name'] ?? 'Editorial Team'
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name' => 'AURA BOTANICA',
                'logo' => [
                    '@type' => 'ImageObject',
                    'url' => BASE_URL . '/assets/images/logo.png'
                ]
            ],
            'description' => strip_tags($article['excerpt'])
        ];
        return '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . '</script>';
    }
}
