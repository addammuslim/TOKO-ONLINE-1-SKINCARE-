# AURA BOTANICA — Haute Botanical Skincare E-Commerce Platform
**Tech Stack:** PHP Native (100% MySQLi Prepared Statements) + MySQL + Semantic HTML5 + Lightweight Modern CSS + Vanilla JavaScript (No Heavy Frameworks).

---

## 🌟 FITUR UTAMA & ARSITEKTUR

### Public E-Commerce:
1. **Homepage:** Hero banner dinamis, 10 kategori skincare, produk best seller, new arrivals, filosofi skin barrier pH 5.5, ulasan pembeli terverifikasi, artikel edukasi, dan newsletter.
2. **Katalog Produk:** Filter kategori, pengurutan harga/populer/terbaru, pencarian instan, dan pagination responsif.
3. **Detail Produk (SEO Slug):** Galeri foto produk, rating bintang, status stok real-time, selektor kuantiti, deskripsi ilmiah, komposisi lengkap (*Ingredients*), cara pemakaian (*How to Use*), ulasan pelanggan, produk terkait, dan JSON-LD Product Schema.
4. **Shopping Cart:** Tambah/hapus produk, perbarui kuantiti, validasi stok, hitung otomatis gratis ongkir (batas belanja Rp 250.000), dan penerapan kupon diskon (contoh: `GLOWSKIN`, `WELCOME10`).
5. **Checkout & Transaksi:** Form identitas pelanggan, pilihan kurir dan metode pembayaran (Transfer Bank BCA/Mandiri, QRIS Instan, COD), kalkulasi diskon, dan pembuatan nomor order otomatis unik format `ORD-YYYYMMDD-XXXX`.
6. **Halaman Sukses & Cetak Invoice:** Rincian rekening pembayaran dan fitur cetak invoice instan.
7. **Jurnal & Artikel Edukasi:** Blog panduan bahan aktif (Niacinamide, Retinol, Ceramide, Cica, AHA/BHA) lengkap dengan JSON-LD Article Schema.
8. **Akun Pelanggan:** Registrasi member, login aman dengan `password_hash()` (Bcrypt), dan pelacakan riwayat pesanan.

### Admin Dashboard (RBAC):
- **Role-Based Access Control:** Super Admin, Admin, Editor, Order Manager.
- **KPI Real-Time:** Total omset penjualan, total pesanan, pesanan pending/selesai, jumlah pelanggan, dan peringatan stok menipis.
- **Manajemen Produk (CRUD):** Tambah, edit, update harga/diskon/stok, tandai best seller/featured.
- **Manajemen Pesanan:** Update status pesanan (*Pending*, *Confirmed*, *Processing*, *Shipped*, *Completed*, *Cancelled*), verifikasi pembayaran, dan input resi pengiriman.
- **Kategori & Jurnal:** Kelola kategori skincare dan publikasi artikel tips kecantikan.
- **Pengaturan Website:** Nama toko, announcement banner, nomor WhatsApp CS, alamat, dan batas gratis ongkir.

---

## 🚀 PANDUAN INSTALASI XAMPP / LOCALHOST

### 1. Persiapan Folder
Pindahkan atau ekstrak seluruh folder project ke dalam direktori web server Anda:
- **XAMPP di Windows:** `C:\xampp\htdocs\aura-botanica`
- **XAMPP / LAMP di Linux/Mac:** `/opt/lampp/htdocs/aura-botanica` atau `/var/www/html/aura-botanica`

### 2. Import Database MySQL
1. Buka browser dan akses **phpMyAdmin**: `http://localhost/phpmyadmin`
2. Buat database baru dengan nama: `aura_botanica` (pilih collation `utf8mb4_unicode_ci`)
3. Klik tab **Import** pada database `aura_botanica`, pilih file `database.sql` yang ada di root project, lalu klik **Go** / **Kirim**.
4. Database akan otomatis membuat 20+ tabel relasional dan mengisinya dengan sample data produk, kategori, artikel, voucher, admin, dan pesanan.

### 3. Konfigurasi Koneksi (`config/config.php`)
Buka file `config/config.php` dan sesuaikan kredensial MySQL Anda (default XAMPP biasanya tanpa password):
```php
define('DB_HOST', '127.0.0.1');
define('DB_USER', 'root');
define('DB_PASS', ''); // Kosongkan jika default XAMPP
define('DB_NAME', 'aura_botanica');
define('DB_PORT', 3306);
```

### 4. Menjalankan Website
- **Website Publik:** `http://localhost/aura-botanica/`
- **Admin Login:** `http://localhost/aura-botanica/admin/login.php`

---

## 🔐 KREDENSIAL DEMO UNTUK PENGUJIAN

### Akun Administrator:
| Role | Email | Password |
|---|---|---|
| **Super Admin** | `superadmin@aurabotanica.com` | `password123` |
| **Admin** | `admin@aurabotanica.com` | `password123` |
| **Editor** | `editor@aurabotanica.com` | `password123` |
| **Order Manager** | `orders@aurabotanica.com` | `password123` |

### Akun Pelanggan (Customer):
| Nama | Email | Password |
|---|---|---|
| **Anindya Putri** | `anindya@gmail.com` | `password123` |
| **Sarah Maharani** | `sarah.m@gmail.com` | `password123` |

### Kode Kupon Aktif:
- `GLOWSKIN`: Potongan Rp 30.000 (Min. belanja Rp 250.000)
- `WELCOME10`: Diskon 10% pesanan pertama
- `FREESHIP`: Potongan ongkos kirim Rp 15.000

---

## 🛡️ STANDAR KEAMANAN & PRAKTIK TERBAIK
1. **100% Prepared Statements MySQLi:** Melindungi dari segala bentuk serangan SQL Injection.
2. **Password Hashing:** Menggunakan standar industri `password_hash(PASSWORD_BCRYPT)`.
3. **Perlindungan CSRF:** Setiap form POST dilengkapi token CSRF `hash_equals()`.
4. **Sanitasi XSS:** Semua output user diemulasi melalui fungsi `e()` (`htmlspecialchars`).
5. **Session Security:** `session.cookie_httponly = 1` dan `session_regenerate_id()` saat login untuk menangkal session hijacking.
6. **SEO & Clean URL:** Dukungan file `.htaccess` untuk rewrite URL slug, GZIP compression, dan structured data schema.org.
