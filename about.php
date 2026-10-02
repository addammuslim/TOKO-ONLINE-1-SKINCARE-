<?php
/**
 * AURA BOTANICA - About Us Page
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/functions.php';

$page = Database::fetchOne("SELECT * FROM pages WHERE slug = 'about-us'");

$customMeta = [
    'title' => 'Tentang Kami - Filosofi Kemurnian Botani AURA BOTANICA',
    'description' => 'Mengenal perjalanan AURA BOTANICA dalam menghadirkan formulasi botanical klinis untuk skin barrier manusia modern.'
];
require_once __DIR__ . '/includes/header.php';
?>

<div style="background: #F4EFEB; padding: 50px 0; border-bottom: 1px solid var(--color-border); text-align: center;">
    <div class="container" style="max-width: 760px;">
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--color-accent); font-weight: 600; margin-bottom: 8px;">Kisah Kami</div>
        <h1 style="font-size: 42px; margin-bottom: 14px;">Filosofi Keindahan Alami</h1>
        <p style="font-size: 16px; color: var(--color-text-muted);">Memadukan kekuatan botani murni perasan dingin dengan sains formulasi mutakhir.</p>
    </div>
</div>

<div class="container" style="padding: 60px 20px 90px; max-width: 900px;">
    <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 12px; padding: 45px; line-height: 1.8; font-size: 15.5px; color: #3A342F;">
        <?= $page['content'] ?? '<p>Informasi profil Aura Botanica sedang dimuat.</p>' ?>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
