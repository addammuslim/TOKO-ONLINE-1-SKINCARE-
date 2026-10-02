<?php
/**
 * AURA BOTANICA - Site Header Template
 */
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/seo.php';

$cartTotals = calculate_cart_totals();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php SEO::renderHeader($customMeta ?? []); ?>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- CSS Stylesheet -->
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css">
    
    <!-- JSON-LD Structured Data -->
    <?= SEO::renderOrganizationSchema() ?>
</head>
<body>

<!-- Announcement Bar -->
<div class="announcement-bar">
    <?= e(get_setting('announcement_bar', '✨ Gratis Ongkir Se-Indonesia untuk pesanan di atas Rp 250.000 | Kode: GLOWSKIN')) ?>
</div>

<!-- Header / Navigation -->
<header class="header-main">
    <div class="container navbar-container">
        <a href="<?= BASE_URL ?>/" class="brand-logo"><?= e(get_setting('site_name', 'AURA BOTANICA')) ?></a>
        
        <nav>
            <ul class="nav-links">
                <li><a href="<?= BASE_URL ?>/" class="nav-link">Home</a></li>
                <li><a href="<?= BASE_URL ?>/products" class="nav-link">Koleksi Produk</a></li>
                <li><a href="<?= BASE_URL ?>/products/category/serum" class="nav-link">Serum & Essence</a></li>
                <li><a href="<?= BASE_URL ?>/products/category/moisturizer" class="nav-link">Moisturizer</a></li>
                <li><a href="<?= BASE_URL ?>/articles" class="nav-link">Jurnal Skincare</a></li>
                <li><a href="<?= BASE_URL ?>/about-us" class="nav-link">Tentang Kami</a></li>
                <li><a href="<?= BASE_URL ?>/contact-us" class="nav-link">Kontak</a></li>
            </ul>
        </nav>

        <div class="nav-actions">
            <?php if (is_user_logged_in()): ?>
                <a href="<?= BASE_URL ?>/account" class="nav-link" title="Akun Saya">
                    👤 <?= e($_SESSION['user_name'] ?? 'Akun') ?>
                </a>
            <?php else: ?>
                <a href="<?= BASE_URL ?>/login" class="nav-link">Masuk</a>
            <?php endif; ?>

            <a href="<?= BASE_URL ?>/cart" class="cart-icon-btn nav-link" aria-label="Keranjang Belanja">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span class="cart-badge" style="<?= ($cartTotals['items_count'] > 0) ? '' : 'display:none;' ?>">
                    <?= $cartTotals['items_count'] ?>
                </span>
            </a>
        </div>
    </div>
</header>
