<?php
/**
 * AURA BOTANICA - Contact Us Page
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/functions.php';

$success = false;
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $subject = trim($_POST['subject'] ?? '');
    $message = trim($_POST['message'] ?? '');

    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
        $error = 'Semua kolom bertanda bintang (*) wajib diisi.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Format email tidak valid.';
    } else {
        $affected = Database::execute(
            "INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)",
            "sssss",
            [$name, $email, $phone, $subject, $message]
        );
        if ($affected > 0) {
            $success = true;
        } else {
            $error = 'Gagal mengirim pesan. Silakan coba kembali.';
        }
    }
}

$customMeta = ['title' => 'Hubungi Kami - Konsultasi Skincare AURA BOTANICA'];
require_once __DIR__ . '/includes/header.php';
?>

<div style="background: #F4EFEB; padding: 40px 0; border-bottom: 1px solid var(--color-border); text-align: center;">
    <div class="container" style="max-width: 700px;">
        <h1 style="font-size: 38px; margin-bottom: 8px;">Hubungi Kami</h1>
        <p style="color: var(--color-text-muted);">Butuh bantuan konsultasi pemilihan produk yang cocok untuk jenis kulit Anda? Tim beauty advisor kami siap melayani.</p>
    </div>
</div>

<div class="container" style="padding: 50px 20px 90px; max-width: 1000px;">
    <div style="display: grid; grid-template-columns: 1fr 1.3fr; gap: 40px;" class="hero-split">
        <!-- Contact Info -->
        <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 12px; padding: 36px;">
            <h2 style="font-size: 22px; margin-bottom: 20px;">Layanan Pelanggan</h2>
            <div style="display: flex; flex-direction: column; gap: 20px; font-size: 14.5px; color: #4A433E;">
                <div>
                    <strong>📍 Alamat Kantor & Flagship Store:</strong>
                    <p style="color: var(--color-text-muted); margin-top: 4px;"><?= e(get_setting('site_address', 'Jl. Senopati No. 88, Kebayoran Baru, Jakarta Selatan')) ?></p>
                </div>
                <div>
                    <strong>💬 WhatsApp Customer Care:</strong>
                    <p style="color: var(--color-text-muted); margin-top: 4px;"><?= e(get_setting('site_phone', '+62 812-3456-7890')) ?> (Setiap Hari: 08.00 - 20.00 WIB)</p>
                </div>
                <div>
                    <strong>✉️ Email Resmi:</strong>
                    <p style="color: var(--color-text-muted); margin-top: 4px;"><?= e(get_setting('site_email', 'care@aurabotanica.com')) ?></p>
                </div>
                <div>
                    <strong>📸 Instagram:</strong>
                    <p style="color: var(--color-text-muted); margin-top: 4px;"><?= e(get_setting('instagram_handle', '@aurabotanica.id')) ?></p>
                </div>
            </div>
        </div>

        <!-- Contact Form -->
        <div style="background: #FFFFFF; border: 1px solid var(--color-border); border-radius: 12px; padding: 36px;">
            <h2 style="font-size: 22px; margin-bottom: 20px;">Kirim Pesan atau Konsultasi</h2>

            <?php if ($success): ?>
                <div style="background: #E6F4EA; color: #137333; padding: 16px 20px; border-radius: 6px; margin-bottom: 20px; font-size: 14.5px;">
                    ✓ Terima kasih! Pesan Anda telah kami terima. Tim kami akan membalas via email/WhatsApp dalam waktu 1x24 jam.
                </div>
            <?php else: ?>
                <?php if (!empty($error)): ?>
                    <div style="background: #FEE2E2; color: #DC2626; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; font-size: 14px;">
                        <?= e($error) ?>
                    </div>
                <?php endif; ?>

                <form method="POST" action="<?= BASE_URL ?>/contact.php">
                    <?= csrf_field() ?>
                    <div style="margin-bottom: 16px;">
                        <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Nama Lengkap *</label>
                        <input type="text" name="name" required style="width: 100%; padding: 10px 14px; border: 1px solid var(--color-border); border-radius: 4px; font-size: 14px;">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                        <div>
                            <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Email *</label>
                            <input type="email" name="email" required style="width: 100%; padding: 10px 14px; border: 1px solid var(--color-border); border-radius: 4px; font-size: 14px;">
                        </div>
                        <div>
                            <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">WhatsApp / No. Telp</label>
                            <input type="tel" name="phone" placeholder="0812xxxx" style="width: 100%; padding: 10px 14px; border: 1px solid var(--color-border); border-radius: 4px; font-size: 14px;">
                        </div>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Subjek Pesan *</label>
                        <input type="text" name="subject" required placeholder="Misal: Konsultasi Kulit Kering" style="width: 100%; padding: 10px 14px; border: 1px solid var(--color-border); border-radius: 4px; font-size: 14px;">
                    </div>
                    <div style="margin-bottom: 24px;">
                        <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">Pesan Anda *</label>
                        <textarea name="message" rows="4" required placeholder="Tuliskan pertanyaan atau deskripsi kondisi kulit Anda..." style="width: 100%; padding: 10px 14px; border: 1px solid var(--color-border); border-radius: 4px; font-size: 14px;"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 14.5px;">Kirim Pesan Sekarang</button>
                </form>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
