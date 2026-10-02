<?php
/**
 * AURA BOTANICA - Site Footer Template
 */
?>
<footer class="site-footer">
    <div class="container">
        <div class="footer-grid">
            <div class="footer-col">
                <h4 class="brand-logo" style="margin-bottom: 14px;"><?= e(get_setting('site_name', 'AURA BOTANICA')) ?></h4>
                <p style="color: #BDB5AD; font-size: 14px; line-height: 1.7; margin-bottom: 20px;">
                    <?= e(get_setting('site_tagline', 'Haute Botanical Skincare & Barrier Therapy')) ?>. Perpaduan kemurnian botani organik dan bioteknologi dermatologis mutakhir untuk kulit sehat bercahaya.
                </p>
                <p style="font-size: 13px; color: #8F867C;">
                    WhatsApp CS: <?= e(get_setting('site_phone', '+62 812-3456-7890')) ?><br>
                    Email: <?= e(get_setting('site_email', 'care@aurabotanica.com')) ?>
                </p>
            </div>
            
            <div class="footer-col">
                <h4>Kategori</h4>
                <ul class="footer-links">
                    <li><a href="<?= BASE_URL ?>/products/category/cleanser">Cleanser</a></li>
                    <li><a href="<?= BASE_URL ?>/products/category/toner">Hydrating Toner</a></li>
                    <li><a href="<?= BASE_URL ?>/products/category/serum">Active Serum</a></li>
                    <li><a href="<?= BASE_URL ?>/products/category/moisturizer">Barrier Cream</a></li>
                    <li><a href="<?= BASE_URL ?>/products/category/sunscreen">UV Sunscreen</a></li>
                </ul>
            </div>

            <div class="footer-col">
                <h4>Bantuan & Info</h4>
                <ul class="footer-links">
                    <li><a href="<?= BASE_URL ?>/about-us">Kisah Kami</a></li>
                    <li><a href="<?= BASE_URL ?>/contact-us">Hubungi Kami</a></li>
                    <li><a href="<?= BASE_URL ?>/faq">Pertanyaan (FAQ)</a></li>
                    <li><a href="<?= BASE_URL ?>/privacy-policy">Kebijakan Privasi</a></li>
                    <li><a href="<?= BASE_URL ?>/terms">Syarat & Ketentuan</a></li>
                </ul>
            </div>

            <div class="footer-col">
                <h4>Newsletter</h4>
                <p style="color: #BDB5AD; font-size: 13px; margin-bottom: 14px;">
                    Dapatkan penawaran eksklusif dan voucher diskon 10% untuk pesanan pertama Anda.
                </p>
                <form action="<?= BASE_URL ?>/newsletter.php" method="POST" style="display: flex; gap: 8px;">
                    <?= csrf_field() ?>
                    <input type="email" name="email" required placeholder="Masukkan email Anda..." style="flex-grow: 1; padding: 10px 14px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: #fff; border-radius: 4px; font-size: 13px;">
                    <button type="submit" class="btn btn-accent" style="padding: 10px 16px; font-size: 13px;">Gabung</button>
                </form>
            </div>
        </div>

        <div class="footer-bottom">
            <div>&copy; <?= date('Y') ?> <?= e(get_setting('site_name', 'AURA BOTANICA')) ?>. All Rights Reserved.</div>
            <div>Dibuat dengan kemurnian botani & sains teruji.</div>
        </div>
    </div>
</footer>

<script src="<?= BASE_URL ?>/assets/js/main.js"></script>
</body>
</html>
