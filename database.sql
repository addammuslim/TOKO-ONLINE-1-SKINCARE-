-- ========================================================
-- DATABASE DUMP: AURA BOTANICA - LUXURY SKINCARE E-COMMERCE
-- Tech Stack: PHP Native (MySQLi Prepared Statements) + MySQL
-- Normalized schema with Foreign Keys, Indexes, & Sample Data
-- ========================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS seo_settings;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS newsletter_subscribers;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS pages;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS article_categories;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS coupon_usages;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS product_variants;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS brands;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- Table structure: users (Customers)
-- --------------------------------------------------------
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    province VARCHAR(100) DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    district VARCHAR(100) DEFAULT NULL,
    postal_code VARCHAR(10) DEFAULT NULL,
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    reset_token VARCHAR(100) DEFAULT NULL,
    reset_expiry DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: admins (Admin Users & RBAC)
-- --------------------------------------------------------
CREATE TABLE admins (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Super Admin', 'Admin', 'Editor', 'Order Manager') NOT NULL DEFAULT 'Admin',
    avatar VARCHAR(255) DEFAULT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    last_login DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_admin_email (email),
    INDEX idx_admin_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: categories
-- --------------------------------------------------------
CREATE TABLE categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    image VARCHAR(255) DEFAULT NULL,
    parent_id INT UNSIGNED DEFAULT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cat_slug (slug),
    INDEX idx_cat_active (is_active),
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: brands
-- --------------------------------------------------------
CREATE TABLE brands (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    logo VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_brand_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: products
-- --------------------------------------------------------
CREATE TABLE products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    category_id INT UNSIGNED NOT NULL,
    brand_id INT UNSIGNED NOT NULL,
    short_description TEXT DEFAULT NULL,
    full_description LONGTEXT DEFAULT NULL,
    ingredients LONGTEXT DEFAULT NULL,
    benefits TEXT DEFAULT NULL,
    how_to_use TEXT DEFAULT NULL,
    volume_weight VARCHAR(50) DEFAULT '30 ml',
    price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount_price DECIMAL(12,2) DEFAULT NULL,
    stock INT NOT NULL DEFAULT 0,
    min_purchase INT NOT NULL DEFAULT 1,
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    is_bestseller TINYINT(1) NOT NULL DEFAULT 0,
    is_new_arrival TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    seo_title VARCHAR(255) DEFAULT NULL,
    seo_description TEXT DEFAULT NULL,
    seo_keywords VARCHAR(255) DEFAULT NULL,
    canonical_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_prod_slug (slug),
    INDEX idx_prod_cat (category_id),
    INDEX idx_prod_brand (brand_id),
    INDEX idx_prod_price (price),
    INDEX idx_prod_featured (is_featured),
    INDEX idx_prod_bestseller (is_bestseller),
    INDEX idx_prod_active (is_active),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: product_images
-- --------------------------------------------------------
CREATE TABLE product_images (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255) DEFAULT NULL,
    is_primary TINYINT(1) NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_img_prod (product_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: product_variants
-- --------------------------------------------------------
CREATE TABLE product_variants (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    variant_name VARCHAR(100) NOT NULL,
    sku VARCHAR(60) NOT NULL,
    additional_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: inventory (Stock adjustments history)
-- --------------------------------------------------------
CREATE TABLE inventory (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    change_type ENUM('restock', 'sale', 'adjustment', 'return', 'damaged') NOT NULL,
    quantity INT NOT NULL,
    notes VARCHAR(255) DEFAULT NULL,
    created_by INT UNSIGNED DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: cart & cart_items
-- --------------------------------------------------------
CREATE TABLE cart (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED DEFAULT NULL,
    session_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cart_user (user_id),
    INDEX idx_cart_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cart_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cart_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: orders
-- --------------------------------------------------------
CREATE TABLE orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INT UNSIGNED DEFAULT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(25) NOT NULL,
    shipping_address TEXT NOT NULL,
    province VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    postal_code VARCHAR(15) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    shipping_cost DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    grand_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Bank Transfer',
    payment_status ENUM('unpaid', 'pending_verification', 'paid', 'refunded', 'failed') NOT NULL DEFAULT 'unpaid',
    order_status ENUM('Pending', 'Confirmed', 'Processing', 'Shipped', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    tracking_number VARCHAR(100) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order_num (order_number),
    INDEX idx_order_user (user_id),
    INDEX idx_order_status (order_status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: order_items
-- --------------------------------------------------------
CREATE TABLE order_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED DEFAULT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_sku VARCHAR(50) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    quantity INT NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: payments
-- --------------------------------------------------------
CREATE TABLE payments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100) DEFAULT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
    proof_file VARCHAR(255) DEFAULT NULL,
    bank_account_name VARCHAR(100) DEFAULT NULL,
    paid_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: coupons
-- --------------------------------------------------------
CREATE TABLE coupons (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) DEFAULT NULL,
    discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(10,2) NOT NULL,
    min_spend DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    max_discount DECIMAL(12,2) DEFAULT NULL,
    usage_limit INT DEFAULT NULL,
    usage_count INT NOT NULL DEFAULT 0,
    valid_from DATETIME NOT NULL,
    valid_until DATETIME NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_coupon_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: coupon_usages
-- --------------------------------------------------------
CREATE TABLE coupon_usages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT UNSIGNED NOT NULL,
    order_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED DEFAULT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: reviews
-- --------------------------------------------------------
CREATE TABLE reviews (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED DEFAULT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(150) DEFAULT NULL,
    rating TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    is_approved TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_rev_prod (product_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: article_categories
-- --------------------------------------------------------
CREATE TABLE article_categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: articles
-- --------------------------------------------------------
CREATE TABLE articles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content LONGTEXT NOT NULL,
    featured_image VARCHAR(255) DEFAULT NULL,
    category_id INT UNSIGNED NOT NULL,
    author_id INT UNSIGNED DEFAULT NULL,
    status ENUM('published', 'draft', 'scheduled') NOT NULL DEFAULT 'published',
    views INT NOT NULL DEFAULT 0,
    seo_title VARCHAR(255) DEFAULT NULL,
    seo_description TEXT DEFAULT NULL,
    focus_keyword VARCHAR(100) DEFAULT NULL,
    canonical_url VARCHAR(255) DEFAULT NULL,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_art_slug (slug),
    INDEX idx_art_status (status),
    FOREIGN KEY (category_id) REFERENCES article_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (author_id) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: pages (Static dynamic pages)
-- --------------------------------------------------------
CREATE TABLE pages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    content LONGTEXT NOT NULL,
    seo_title VARCHAR(255) DEFAULT NULL,
    seo_description TEXT DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: contacts (Inquiries)
-- --------------------------------------------------------
CREATE TABLE contacts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(25) DEFAULT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: newsletter_subscribers
-- --------------------------------------------------------
CREATE TABLE newsletter_subscribers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: settings (Global configuration)
-- --------------------------------------------------------
CREATE TABLE settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT DEFAULT NULL,
    setting_group VARCHAR(50) NOT NULL DEFAULT 'general',
    description VARCHAR(255) DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: seo_settings
-- --------------------------------------------------------
CREATE TABLE seo_settings (
    page_key VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    meta_description TEXT NOT NULL,
    keywords VARCHAR(255) DEFAULT NULL,
    og_image VARCHAR(255) DEFAULT NULL,
    canonical_url VARCHAR(255) DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure: activity_logs
-- --------------------------------------------------------
CREATE TABLE activity_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id INT UNSIGNED DEFAULT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- SAMPLE DATA SEEDING
-- ========================================================

-- Admins (Default password for all demo accounts: 'password123')
-- Hash generated via password_hash('password123', PASSWORD_BCRYPT)
INSERT INTO admins (name, email, password, role, status) VALUES
('Jessica Wardhana', 'superadmin@aurabotanica.com', '$2y$10$eA09sUvN0Z3Q/F82fO9RneYc29XkZc6sP2q0P93z7c2wL1pT1ZfOu', 'Super Admin', 'active'),
('Rian Pratama', 'admin@aurabotanica.com', '$2y$10$eA09sUvN0Z3Q/F82fO9RneYc29XkZc6sP2q0P93z7c2wL1pT1ZfOu', 'Admin', 'active'),
('Clara Suteja', 'editor@aurabotanica.com', '$2y$10$eA09sUvN0Z3Q/F82fO9RneYc29XkZc6sP2q0P93z7c2wL1pT1ZfOu', 'Editor', 'active'),
('Dimas Anggara', 'orders@aurabotanica.com', '$2y$10$eA09sUvN0Z3Q/F82fO9RneYc29XkZc6sP2q0P93z7c2wL1pT1ZfOu', 'Order Manager', 'active');

-- Customers (Demo customer accounts, password: 'password123')
INSERT INTO users (name, email, password, phone, address, province, city, district, postal_code) VALUES
('Anindya Putri', 'anindya@gmail.com', '$2y$10$eA09sUvN0Z3Q/F82fO9RneYc29XkZc6sP2q0P93z7c2wL1pT1ZfOu', '081234567890', 'Jl. Senopati No. 42', 'DKI Jakarta', 'Jakarta Selatan', 'Kebayoran Baru', '12190'),
('Sarah Maharani', 'sarah.m@gmail.com', '$2y$10$eA09sUvN0Z3Q/F82fO9RneYc29XkZc6sP2q0P93z7c2wL1pT1ZfOu', '081398765432', 'Jl. Diponegoro No. 15', 'Jawa Barat', 'Bandung', 'Coblong', '40132'),
('Nadia Kusuma', 'nadia.k@gmail.com', '$2y$10$eA09sUvN0Z3Q/F82fO9RneYc29XkZc6sP2q0P93z7c2wL1pT1ZfOu', '082145678912', 'Jl. Pemuda No. 88', 'Jawa Timur', 'Surabaya', 'Genteng', '60271'),
('Gabriella Tan', 'gabriella@gmail.com', '$2y$10$eA09sUvN0Z3Q/F82fO9RneYc29XkZc6sP2q0P93z7c2wL1pT1ZfOu', '085712345678', 'Jl. Thamrin Boulevard No. 10', 'DKI Jakarta', 'Jakarta Pusat', 'Menteng', '10310'),
('Maya Larasati', 'maya.larasati@gmail.com', '$2y$10$eA09sUvN0Z3Q/F82fO9RneYc29XkZc6sP2q0P93z7c2wL1pT1ZfOu', '081912344321', 'Jl. Affandi No. 27', 'DI Yogyakarta', 'Sleman', 'Depok', '55281');

-- Categories (10 Clean Skincare Categories)
INSERT INTO categories (name, slug, description, sort_order, is_active) VALUES
('Cleanser', 'cleanser', 'Pembersih wajah lembut dengan pH seimbang tanpa merusak skin barrier alami.', 1, 1),
('Toner', 'toner', 'Hidrasi mendalam dan mempersiapkan kulit menyerap nutrisi esensial.', 2, 1),
('Essence', 'essence', 'Cairan konsentrat aktif untuk memperbaiki tekstur dan elastisitas kulit.', 3, 1),
('Serum', 'serum', 'Formula potent dengan targeted active ingredients untuk hasil optimal.', 4, 1),
('Moisturizer', 'moisturizer', 'Pelembap kaya ceramide & lipid botanis untuk mengunci kelembapan 24 jam.', 5, 1),
('Sunscreen', 'sunscreen', 'Perlindungan UV spektrum luas dengan tekstur seringan bulu tanpa whitecast.', 6, 1),
('Face Mask', 'face-mask', 'Perawatan intensif mingguan untuk detoksifikasi, hidrasi, dan revitalisasi kulit.', 7, 1),
('Eye Care', 'eye-care', 'Perawatan lembut area kontur mata untuk samarkan garis halus & mata panda.', 8, 1),
('Exfoliator', 'exfoliator', 'Eksfoliasi kimia lembut AHA/BHA/PHA untuk regenerasi sel kulit mati.', 9, 1),
('Body Care', 'body-care', 'Nutrisi botanical menyeluruh untuk kulit tubuh yang lembut dan bercahaya.', 10, 1);

-- Brands
INSERT INTO brands (name, slug, description, is_active) VALUES
('AURA BOTANICA', 'aura-botanica', 'Haute botanical skincare yang menggabungkan kemurnian botani dan bioteknologi modern.', 1),
('CeraBiome', 'cerabiome', 'Formula dermatologis penguat skin barrier berbasis 5 jenis Ceramide & Probiotik.', 1),
('Reine De Fleurs', 'reine-de-fleurs', 'Ekstrak bunga mawar Damaskus organik dan squalane nabati Prancis.', 1),
('Luminesse Labs', 'luminesse-labs', 'Klinis presisi tinggi dengan peptida aktif dan antioksidan poten.', 1);

-- Products (20 Realistic Premium Skincare Products)
INSERT INTO products (sku, name, slug, category_id, brand_id, short_description, full_description, ingredients, benefits, how_to_use, volume_weight, price, discount_price, stock, is_featured, is_bestseller, is_new_arrival, is_active, seo_title, seo_description) VALUES
('AB-SRM-001', 'Niacinamide 10% + Zinc Glow Serum', 'niacinamide-10-zinc-glow-serum', 4, 1, 'Serum pencerah konsentrat tinggi untuk meratakan warna kulit dan mengontrol sebum.', 'Serum revolusioner berbahan aktif Niacinamide kemurnian tinggi 10% dipadukan dengan Zinc PCA 1% dan Centella Asiatica. Diformulasikan khusus untuk memudarkan flek hitam bekas jerawat (PIH), memperkecil tampilan pori-pori, dan menenangkan kemerahan tanpa rasa lengket.', 'Aqua, Niacinamide 10%, Butylene Glycol, Zinc PCA 1%, Centella Asiatica Extract, Sodium Hyaluronate, Panthenol, Allantoin, Phenoxyethanol, Ethylhexylglycerin.', 'Mencerahkan flek hitam, mengontrol sebum berlebih, menenangkan kemerahan, memperkuat barrier kulit.', 'Teteskan 2-3 tetes ke telapak tangan yang bersih. Usap dan tepuk lembut pada wajah dan leher setiap pagi dan malam setelah toner.', '30 ml', 189000.00, 169000.00, 48, 1, 1, 0, 1, 'Niacinamide 10% + Zinc Glow Serum - Aura Botanica', 'Serum pencerah kulit alami dengan Niacinamide 10% dan Zinc PCA.'),
('AB-TON-002', 'Centella Soothing Barrier Toner', 'centella-soothing-barrier-toner', 2, 1, 'Toner hidrasi menenangkan dengan 85% Centella Asiatica murni dari pulau Jeju.', 'Toner menenangkan kulit sensitif dan kemerahan secara instan. Diperkaya dengan 85% ekstrak Centella Asiatica, Madecassoside, dan Panthenol 2% untuk mengembalikan keseimbangan pH alami kulit setelah mencuci muka.', 'Centella Asiatica Leaf Water (85%), Glycerin, Dipropylene Glycol, Panthenol, Madecassoside, Asiaticoside, Allantoin, Betaine, Disodium EDTA.', 'Meredakan iritasi dan kemerahan seketika, mengembalikan hidrasi optimal, menyeimbangkan pH.', 'Tuangkan secukupnya pada kapas atau telapak tangan, aplikasikan secara merata ke seluruh wajah dan tepuk lembut hingga meresap sempurna.', '150 ml', 155000.00, 139000.00, 62, 1, 1, 0, 1, 'Centella Soothing Barrier Toner - Menenangkan & Melembapkan Kulit Sensitif', 'Toner 85% Centella Asiatica untuk kulit tenang dan terhidrasi.'),
('CB-MST-003', '5X Ceramide Barrier Moisture Cream', '5x-ceramide-barrier-moisture-cream', 5, 2, 'Pelembap intensif dengan 5 jenis Ceramide biomimetik & Hyaluronic Acid.', 'Krim pelembap bertekstur gel-krim ringan seperti sutra. Mengandung perpaduan 5 tipe Ceramide penting (EOP, NP, AP, AS, NS), Probiotik, dan Centella untuk memperbaiki skin barrier yang rusak dalam 7 hari pemakaian rutin.', 'Aqua, Glycerin, Caprylic/Capric Triglyceride, Ceramide EOP, Ceramide NP, Ceramide AP, Ceramide AS, Ceramide NS, Bifida Ferment Lysate, Sodium Hyaluronate.', 'Memperbaiki skin barrier rusak, mengunci hidrasi 24 jam, membuat kulit kenyal dan glowing natural.', 'Ambil seukuran kacang polong, ratakan ke seluruh wajah dan leher setelah penggunaan serum pada pagi dan malam hari.', '50 g', 215000.00, 189000.00, 35, 1, 1, 1, 1, '5X Ceramide Barrier Moisture Cream - CeraBiome Skin Barrier Repair', 'Krim pelembap dengan 5 jenis Ceramide untuk perbaikan barrier kulit secara klinis.'),
('AB-SUN-004', 'Invisible Velvet Sunscreen SPF 50+ PA++++', 'invisible-velvet-sunscreen-spf-50', 6, 1, 'Tabir surya kimia generasi baru tanpa whitecast, tidak pedih di mata, dan seringan air.', 'Pelindung matahari revolusioner dengan proteksi UV spektrum luas. Teksturnya seringan serum, cepat meresap dengan finish satin velvet yang cantik tanpa kilap berlebih. Bebas alkohol, bebas pewangi, dan ramah terumbu karang.', 'Aqua, Ethylhexyl Triazone, Diethylamino Hydroxybenzoyl Hexyl Benzoate, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Niacinamide, Squalane, Tocopherol.', 'Perlindungan maksimal dari radiasi UVA & UVB, tidak lengket, no whitecast, mencegah penuaan dini.', 'Oleskan sebanyak dua ruas jari ke seluruh wajah dan leher 15 menit sebelum terpapar sinar matahari. Reaplikasi setiap 2-3 jam.', '50 ml', 175000.00, 159000.00, 80, 1, 1, 0, 1, 'Invisible Velvet Sunscreen SPF 50+ PA++++ - Aura Botanica', 'Sunscreen ringan tanpa whitecast dengan perlindungan maksimal.'),
('RF-OIL-005', 'Pure Damask Rosehip Night Elixir', 'pure-damask-rosehip-night-elixir', 4, 3, 'Minyak wajah organik perasan dingin kaya Omega 3, 6, 9 dan Pro-Vitamin A.', 'Kombinasi mewah Rosehip seed oil cold-pressed dari Chili dipadukan dengan essential oil mawar Damaskus Prancis dan vitamin E murni. Menstimulasi regenerasi sel kulit pada malam hari untuk kulit bercahaya saat bangun pagi.', 'Rosa Canina (Rosehip) Seed Oil 100% Organic, Rosa Damascena Flower Oil, Squalane, Tocopherol (Vitamin E).', 'Menyamarkan bekas luka, meningkatkan elastisitas, mengenyalkan kulit, aroma aromaterapi relaksasi.', 'Hangatkan 2-3 tetes di telapak tangan, tekan lembut ke wajah yang masih lembap sebagai langkah terakhir skincare malam.', '20 ml', 279000.00, 249000.00, 24, 1, 0, 1, 1, 'Pure Damask Rosehip Night Elixir - Reine De Fleurs Face Oil', 'Minyak perawatan wajah mewah untuk regenerasi kulit malam hari.'),
('AB-CLN-006', 'Gentle Amino Acid Jelly Cleanser', 'gentle-amino-acid-jelly-cleanser', 1, 1, 'Pembersih wajah tekstur jeli dengan surfaktan asam amino lembut tanpa SLS/SLES.', 'Pembersih wajah bertekstur jeli kristal yang membersihkan sisa kotoran, minyak berlebih, dan residu makeup dengan kelembutan maksimal. Formula pH 5.5 seimbang tidak membuat kulit terasa ketarik atau kering setelah cuci muka.', 'Aqua, Sodium Cocoyl Glycinate, Glycerin, Cocamidopropyl Betaine, Chamomilla Recutita Extract, Aloe Barbadensis Leaf Juice, Citric Acid.', 'Membersihkan pori-pori secara mendalam, mempertahankan kelembapan alami, menenangkan kulit sensitif.', 'Basahi wajah dengan air hangat kuku. Tuangkan pembersih ke telapak tangan, busakan lembut lalu pijat ke seluruh wajah. Bilas hingga bersih.', '120 ml', 129000.00, 115000.00, 54, 0, 1, 0, 1, 'Gentle Amino Acid Jelly Cleanser - Pembersih Wajah pH Seimbang', 'Facial wash jelly asam amino lembut dan menjaga skin barrier.'),
('LL-SRM-007', 'Hyaluronic Acid 8D Moisture Drench', 'hyaluronic-acid-8d-moisture-drench', 4, 4, 'Serum hidrasi dengan 8 variasi ukuran molekul Hyaluronic Acid dan Peptida.', 'Penetrasi ke 8 lapisan epidermis kulit terdalam berkat formulasi 8 ukuran molekul Hyaluronic Acid. Menghidrasi kulit yang dehidrasi seketika dan mengembalikan kelembapan dari dalam agar kulit tampak montok (plump) dan segar.', 'Aqua, 8D Hyaluronic Acid Complex, Polyglutamic Acid, Panthenol, Copper Tripeptide-1, Trehalose, Phenoxyethanol.', 'Hidrasi instan dan tahan lama, mengisi kerutan halus akibat dehidrasi, meningkatkan kekenyalan.', 'Gunakan 3-4 tetes pada kulit yang masih lembap setelah toner. Lanjutkan dengan moisturizer untuk mengunci kelembapan.', '30 ml', 225000.00, 199000.00, 42, 0, 0, 1, 1, 'Hyaluronic Acid 8D Moisture Drench - Luminesse Labs', 'Serum hidrasi mendalam dengan 8 tipe Hyaluronic Acid.'),
('LL-SRM-008', 'Bakuchiol 2% + Peptides Botanical Elixir', 'bakuchiol-2-peptides-botanical-elixir', 4, 4, 'Alternatif alami retinol yang aman untuk bumil, busui, dan kulit sangat sensitif.', 'Diformulasikan dengan Bakuchiol murni 2% tingkat farmasi dipadukan dengan Palmitoyl Tripeptide-5 dan Ekstrak Resveratrol. Memberikan manfaat anti-aging setara retinol: mengencangkan pori, menghaluskan garis halus tanpa efek purging atau iritasi.', 'Aqua, Squalane, Bakuchiol 2%, Palmitoyl Tripeptide-5, Resveratrol, Sodium Hyaluronate, Tocopherol, Carbomer.', 'Anti-aging tanpa iritasi, merangsang produksi kolagen, memudarkan hiperpigmentasi, aman bumil/busui.', 'Oleskan 3-4 tetes pada wajah bersih di pagi dan malam hari sebelum pelembap.', '30 ml', 249000.00, 219000.00, 30, 1, 1, 0, 1, 'Bakuchiol 2% Botanical Elixir - Alternatif Alami Retinol', 'Serum anti-aging aman untuk ibu hamil dan kulit sensitif.'),
('AB-SRM-009', 'Vitamin C 15% Ethyl Ascorbic Radiance Booster', 'vitamin-c-15-radiance-booster', 4, 1, 'Serum vitamin C generasi stabil tinggi untuk menyamarkan noda hitam dan mencerahkan.', 'Serum pencerah dengan Ethyl Ascorbic Acid 15% yang stabil, tidak mudah teroksidasi dan tidak menimbulkan rasa perih. Dipadukan dengan Ferulic Acid dan Vitamin E untuk perlindungan antioksidan ganda dari paparan radikal bebas dan polusi.', 'Aqua, 3-O-Ethyl Ascorbic Acid 15%, Propanediol, Ferulic Acid, Alpha Arbutin 1%, Tocopherol, Sodium Hyaluronate.', 'Mencerahkan kulit kusam, menyamarkan noda flek & bekas jerawat, menangkal radikal bebas.', 'Gunakan setiap pagi sebanyak 3 tetes sebelum menggunakan sunscreen untuk proteksi antioksidan maksimal.', '20 ml', 210000.00, 185000.00, 40, 1, 0, 1, 1, 'Vitamin C 15% Radiance Booster - Aura Botanica', 'Serum Vitamin C pencerah wajah terbaik tanpa iritasi.'),
('LL-EYE-010', 'Peptide Infusion Firming Eye Cream', 'peptide-infusion-firming-eye-cream', 8, 4, 'Krim mata kaya peptida dengan aplikator logam dingin untuk menyegarkan kantung mata.', 'Krim kontur mata intensif yang diformulasikan dengan Acetyl Hexapeptide-8, Kafein murni 3%, dan Niacinamide. Dilengkapi aplikator keramik pendingin untuk melancarkan sirkulasi mikro, mengempiskan kantung mata, dan mencerahkan lingkaran hitam.', 'Aqua, Caffeine 3%, Acetyl Hexapeptide-8, Niacinamide, Squalane, Butyrospermum Parkii (Shea) Butter, Ceramide NP.', 'Mengurangi lingkaran hitam mata panda, meredakan bengkak kantung mata, menyamarkan crow’s feet.', 'Pencet sedikit tube, aplikasikan aplikator logam lembut di sekitar tulang mata dengan gerakan memutar dari dalam ke luar.', '15 ml', 195000.00, 175000.00, 28, 0, 0, 0, 1, 'Peptide Infusion Firming Eye Cream - Luminesse Labs', 'Krim mata kafein dan peptida untuk kantung mata dan kerutan.'),
('AB-MSK-011', 'Green Tea Purifying Clay Detox Mask', 'green-tea-purifying-clay-detox-mask', 7, 1, 'Masker tanah liat Kaolin & bentonit dengan daun teh hijau organik untuk pori bersih.', 'Clay mask lembut bertekstur mousse krim yang menyerap kotoran hingga ke dasar pori-pori tanpa membuat kulit kering pecah-pecah. Menenangkan jerawat aktif dan menghaluskan bruntusan.', 'Kaolin Clay, Bentonite, Camellia Sinensis (Green Tea) Leaf Extract, Centella Asiatica, Melaleuca Alternifolia (Tea Tree) Leaf Oil, Glycerin.', 'Membersihkan komedo dan minyak berlebih, meredakan jerawat meradang, mengecilkan tampilan pori.', 'Oleskan merata ke seluruh wajah, diamkan selama 10-15 menit hingga setengah kering, lalu bilas dengan air hangat.', '100 g', 139000.00, 125000.00, 45, 0, 1, 0, 1, 'Green Tea Clay Detox Mask - Masker Pori-pori dan Komedo', 'Clay mask detoksifikasi alami untuk kulit bersih bebas komedo.'),
('AB-EXF-012', 'AHA 7% + BHA 2% Clarifying Exfoliating Toner', 'aha-bha-clarifying-exfoliating-toner', 9, 1, 'Toner eksfoliasi kimia lembut dengan Glycolic Acid & Salicylic Acid murni.', 'Kombinasi Glycolic Acid (AHA) 7% untuk eksfoliasi permukaan kulit kusam dan Salicylic Acid (BHA) 2% yang menembus minyak untuk membersihkan pori tersumbat. Kulit menjadi halus, glowing, dan bebas bruntusan.', 'Aqua, Glycolic Acid 7%, Salicylic Acid 2%, Aloe Barbadensis Leaf Juice, Hamamelis Virginiana (Witch Hazel) Water, Allantoin.', 'Mengangkat sel kulit mati, membersihkan komedo hitam dan putih, mencerahkan tekstur kasar.', 'Gunakan 2-3 kali seminggu pada malam hari menggunakan kapas. Hindari area mata dan bibir. Wajib pakai sunscreen keesokan paginya.', '100 ml', 165000.00, 145000.00, 38, 0, 1, 0, 1, 'AHA 7% BHA 2% Clarifying Toner - Eksfoliasi Kulit Bruntusan', 'Toner eksfoliasi AHA BHA untuk tekstur kulit mulus bercahaya.'),
('CB-MSK-013', 'Mugwort Calming Hydrogel Sleeping Mask', 'mugwort-calming-hydrogel-sleeping-mask', 7, 2, 'Masker tidur jeli dingin dengan ekstrak Mugwort Korea untuk meredakan kemerahan.', 'Masker tidur tanpa bilas bertekstur jeli dingin menyegarkan. Bekerja semalaman saat Anda tidur untuk menenangkan kulit yang stres akibat polusi, paparan sinar matahari, dan breakout.', 'Aqua, Artemisia Princeps (Mugwort) Leaf Extract 10,000ppm, Dipropylene Glycol, Panthenol, Ceramide NP, Madecassoside.', 'Meredakan iritasi dalam semalam, hidrasi mendalam saat tidur, kulit segar dan glowing di pagi hari.', 'Sebagai langkah terakhir skincare malam, oleskan secara merata ke seluruh wajah dan biarkan menyerap semalaman. Bilas keesokan paginya.', '80 g', 179000.00, 159000.00, 50, 0, 0, 1, 1, 'Mugwort Calming Sleeping Mask - Masker Tidur Menenangkan Kulit', 'Sleeping mask jeli menenangkan kulit kemerahan dan berjerawat.'),
('RF-CLN-014', 'Botanical Squalane Melting Cleansing Oil', 'botanical-squalane-melting-cleansing-oil', 1, 3, 'Minyak pembersih first cleanser yang mengemulsi lembut meluruhkan makeup waterproof.', 'Cleansing oil mewah berbahan dasar 100% Squalane tebu murni dan Jojoba Oil. Melarutkan riasan mata tebal, sunscreen waterproof, dan sebum tanpa menyumbat pori-pori dan tanpa meninggalkan lapisan minyak lengket.', 'Squalane, Simmondsia Chinensis (Jojoba) Seed Oil, PEG-20 Glyceryl Triisostearate, Tocopherol, Lavandula Angustifolia Oil.', 'Meluruhkan makeup waterproof seketika, membersihkan pori tanpa menyumbat, melembutkan kulit.', 'Pompa 2-3 kali ke telapak tangan yang kering. Pijat ke wajah kering selama 1 menit, percikkan air untuk mengemulsi putih seperti susu, lalu bilas bersih.', '150 ml', 210000.00, 189000.00, 32, 0, 0, 0, 1, 'Botanical Squalane Melting Cleansing Oil - First Cleanser Mewah', 'Cleansing oil lembut untuk makeup waterproof dan sunscreen.'),
('AB-ESS-015', 'Galactomyces Probiotic Balancing Essence', 'galactomyces-probiotic-balancing-essence', 3, 1, 'Essence fermentasi alami 93% untuk kulit bening berkilau bagai kaca (glass skin).', 'Mengandung 93% filtrat fermentasi Galactomyces berkualitas tinggi yang dipadukan dengan Niacinamide 2%. Bekerja menyamarkan pori-pori besar, memperbaiki pergantian sel kulit, dan menghasilkan kilau kulit sehat alami.', 'Galactomyces Ferment Filtrate 93%, Niacinamide 2%, 1,2-Hexanediol, Sodium Hyaluronate, Allantoin, Adenosine.', 'Menghasilkan tampilan glass skin, mengontrol minyak, menghaluskan tekstur kulit yang tidak rata.', 'Tuang 4-5 tetes ke telapak tangan, tepuk-tepuk lembut ke seluruh permukaan wajah dan leher hingga terserap sebelum menggunakan serum.', '100 ml', 230000.00, 199000.00, 39, 1, 0, 0, 1, 'Galactomyces Probiotic Balancing Essence - Glass Skin Ferment', 'Essence fermentasi alami untuk kulit halus bercahaya bening.'),
('CB-MST-016', 'Triple Oat Intensive Barrier Rescue Salve', 'triple-oat-barrier-rescue-salve', 5, 2, 'Krim penyelamat kulit sangat kering, eksim, dan skin barrier rusak parah.', 'Krim terapi intensif yang menggabungkan Oat Koloid, Minyak Oat, dan Ekstrak Avenanthramides dengan 3 jenis Ceramide. Terbukti secara dermatologis meredakan gatal, perih, dan kulit mengelupas dalam 24 jam.', 'Avena Sativa (Oat) Kernel Flour, Avena Sativa Kernel Oil, Ceramide NP, Squalane, Butyrospermum Parkii, Glycerin.', 'Meredakan gatal dan perih pada kulit sensitif, melembapkan area sangat kering, mempercepat pemulihan barrier.', 'Aplikasikan pada area wajah atau tubuh yang terasa sangat kering atau teriritasi kapan saja diperlukan.', '75 ml', 185000.00, 165000.00, 41, 0, 0, 0, 1, 'Triple Oat Barrier Rescue Salve - Salep Kulit Kering Sensitif', 'Perawatan intensif kulit kering mengelupas dan eksim.'),
('LL-SRM-017', 'Encapsulated Retinal 0.1% Youth Renewal Serum', 'encapsulated-retinal-youth-renewal-serum', 4, 4, 'Retinaldehid teknologi enkapsulasi liposomal yang bekerja 11x lebih cepat dari retinol biasa.', 'Serum anti-aging mutakhir dengan Retinaldehid terenkapsulasi yang stabil dan minim iritasi. Meningkatkan produksi kolagen, memudarkan garis senyum dan keriput, serta meremajakan sel kulit mati secara optimal.', 'Aqua, Glycerin, Caprylic/Capric Triglyceride, Retinal 0.1% (Encapsulated), Phospholipids, Centella Asiatica, Ceramide NP.', 'Bekerja 11x lebih cepat meregenerasi kulit, mengencangkan kulit kendur, memudarkan flek penuaan.', 'Gunakan hanya pada malam hari 2-3 kali seminggu. Mulai dengan frekuensi rendah. Selalu gunakan pelembap setelahnya dan sunscreen keesokan hari.', '30 ml', 289000.00, 259000.00, 22, 1, 1, 0, 1, 'Encapsulated Retinal 0.1% Youth Renewal Serum - Luminesse Labs', 'Serum peremajaan kulit terdepan dengan teknologi enkapsulasi liposomal.'),
('RF-BOD-018', 'Velvet Rose Damascena Hydrating Body Milk', 'velvet-rose-damascena-hydrating-body-milk', 10, 3, 'Lotion tubuh bertekstur susu dengan ekstrak mawar Damaskus dan Niacinamide 3%.', 'Body milk mewah yang melembapkan kulit tubuh sepanjang hari dengan wangi mawar alami yang elegan dan menenangkan. Diperkaya Niacinamide 3% dan Shea butter untuk mencerahkan siku, lutut, dan meratakan warna kulit tubuh.', 'Aqua, Niacinamide 3%, Butyrospermum Parkii Butter, Rosa Damascena Extract, Squalane, Cetearyl Alcohol, Fragrance Alami.', 'Melembutkan kulit kasar, mencerahkan area lipatan dan siku, wangi tahan lama 8 jam.', 'Usapkan secara merata ke seluruh tubuh setelah mandi atau saat kulit terasa kering.', '250 ml', 165000.00, 145000.00, 55, 0, 0, 1, 1, 'Velvet Rose Hydrating Body Milk - Reine De Fleurs Body Care', 'Lotion tubuh wangi mawar mewah dengan Niacinamide mencerahkan.'),
('AB-EXF-019', 'Rice Milk Gentle Brightening Micro-Polish', 'rice-milk-gentle-brightening-polish', 9, 1, 'Scrub fisik ekstra halus berbahan tepung beras organik dan enzim pepaya.', 'Eksfoliator fisik yang sangat lembut tanpa partikel tajam yang dapat melukai kulit. Butiran mikro beras meluruhkan daki dan komedo sementara ekstrak susu beras memberi nutrisi asam amino mencerahkan seketika.', 'Aqua, Oryza Sativa (Rice) Bran Extract, Microcrystalline Cellulose, Papain Enzyme, Glycerin, Niacinamide.', 'Membersihkan kusam seketika, menghaluskan hidung kasar berkomedo, mencerahkan warna kulit.', 'Pijat lembut dengan gerakan melingkar di wajah yang basah selama 1 menit, lalu bilas hingga bersih. Gunakan 1-2 kali seminggu.', '80 g', 135000.00, 119000.00, 47, 0, 0, 0, 1, 'Rice Milk Gentle Brightening Polish - Lulur Wajah Alami', 'Scrub wajah butiran mikro beras organik untuk kulit halus seketika.'),
('LL-LIP-020', 'Peptide Plump & Glow Lip Treatment Butter', 'peptide-plump-glow-lip-treatment-butter', 8, 4, 'Balsam bibir kaya peptida, ceramides, dan mentega murumuru untuk bibir pecah-pecah.', 'Perawatan bibir intensif yang melembapkan bibir kering pecah-pecah seketika dan memberikan kilau alami tanpa rasa lengket. Peptida merangsang produksi kolagen bibir agar tampak lebih penuh dan segar alami.', 'Bis-Diglyceryl Polyacyladipate-2, Astrocaryum Murumuru Seed Butter, Palmitoyl Tripeptide-38, Ceramide NP, Tocopherol.', 'Mengatasi bibir kering mengelupas, membuat bibir tampak lebih bervolume, kilau sehat natural.', 'Aplikasikan langsung pada bibir kapan saja dibutuhkan atau gunakan tebal sebagai sleeping mask bibir sebelum tidur.', '12 ml', 99000.00, 89000.00, 65, 0, 1, 1, 1, 'Peptide Plump & Glow Lip Treatment - Perawatan Bibir Kering', 'Lip balm peptida dan ceramide untuk bibir lembap dan bervolume.');

-- Product Images (Primary + Gallery images for 20 products)
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(1, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', 'Niacinamide 10% Glow Serum Aura Botanica', 1, 1),
(1, 'https://images.unsplash.com/photo-1608248597359-00f72365eb54?auto=format&fit=crop&w=800&q=80', 'Niacinamide Serum Texture Dropper', 0, 2),
(2, 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80', 'Centella Soothing Barrier Toner Bottle', 1, 1),
(2, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80', 'Centella Toner Natural Ingredients', 0, 2),
(3, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', '5X Ceramide Barrier Moisture Cream Jar', 1, 1),
(3, 'https://images.unsplash.com/photo-1556228722-d0b5d92df974?auto=format&fit=crop&w=800&q=80', 'Ceramide Cream Texture Swatch', 0, 2),
(4, 'https://images.unsplash.com/photo-1556228852-80b6e5eeff06?auto=format&fit=crop&w=800&q=80', 'Invisible Velvet Sunscreen SPF 50 Tube', 1, 1),
(4, 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80', 'Velvet Sunscreen Matte Finish', 0, 2),
(5, 'https://images.unsplash.com/photo-1608248597359-00f72365eb54?auto=format&fit=crop&w=800&q=80', 'Pure Damask Rosehip Night Elixir Luxury Bottle', 1, 1),
(6, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80', 'Gentle Amino Acid Jelly Cleanser Tube', 1, 1),
(7, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', 'Hyaluronic Acid 8D Moisture Drench Serum', 1, 1),
(8, 'https://images.unsplash.com/photo-1608248597359-00f72365eb54?auto=format&fit=crop&w=800&q=80', 'Bakuchiol 2% Botanical Elixir Bottle', 1, 1),
(9, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', 'Vitamin C 15% Radiance Booster Glass Bottle', 1, 1),
(10, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', 'Peptide Infusion Firming Eye Cream Ceramic Applicator', 1, 1),
(11, 'https://images.unsplash.com/photo-1556228722-d0b5d92df974?auto=format&fit=crop&w=800&q=80', 'Green Tea Purifying Clay Detox Mask Glass Jar', 1, 1),
(12, 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80', 'AHA 7% BHA 2% Clarifying Exfoliating Toner', 1, 1),
(13, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', 'Mugwort Calming Hydrogel Sleeping Mask', 1, 1),
(14, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80', 'Botanical Squalane Melting Cleansing Oil Pump Bottle', 1, 1),
(15, 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80', 'Galactomyces Probiotic Balancing Essence Frosted Glass', 1, 1),
(16, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', 'Triple Oat Intensive Barrier Rescue Salve Jar', 1, 1),
(17, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', 'Encapsulated Retinal 0.1% Youth Renewal Serum', 1, 1),
(18, 'https://images.unsplash.com/photo-1556228852-80b6e5eeff06?auto=format&fit=crop&w=800&q=80', 'Velvet Rose Damascena Hydrating Body Milk Pump', 1, 1),
(19, 'https://images.unsplash.com/photo-1556228722-d0b5d92df974?auto=format&fit=crop&w=800&q=80', 'Rice Milk Gentle Brightening Micro-Polish Tube', 1, 1),
(20, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', 'Peptide Plump & Glow Lip Treatment Butter Tube', 1, 1);

-- Product Variants (Size / Shade options)
INSERT INTO product_variants (product_id, variant_name, sku, additional_price, stock) VALUES
(1, 'Standard 30 ml', 'AB-SRM-001-30', 0.00, 30),
(1, 'Jumbo 50 ml', 'AB-SRM-001-50', 80000.00, 18),
(2, 'Travel 50 ml', 'AB-TON-002-50', -50000.00, 22),
(2, 'Full Size 150 ml', 'AB-TON-002-150', 0.00, 40),
(3, 'Standard Jar 50 g', 'CB-MST-003-50', 0.00, 25),
(3, 'Eco Refill Pouch 50 g', 'CB-MST-003-RF', -25000.00, 10);

-- Inventory initial log
INSERT INTO inventory (product_id, change_type, quantity, notes, created_by) VALUES
(1, 'restock', 50, 'Initial production batch #2026-A1', 1),
(2, 'restock', 70, 'Initial production batch #2026-A2', 1),
(3, 'restock', 40, 'Initial production batch #2026-A3', 1),
(4, 'restock', 90, 'Initial production batch #2026-A4', 1);

-- Coupons
INSERT INTO coupons (code, description, discount_type, discount_value, min_spend, max_discount, usage_limit, usage_count, valid_from, valid_until, is_active) VALUES
('WELCOME10', 'Diskon 10% untuk pesanan pertama member baru', 'percentage', 10.00, 100000.00, 50000.00, 1000, 42, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1),
('GLOWSKIN', 'Potongan Rp 30.000 untuk pembelian produk serum & moisturizer', 'fixed', 30000.00, 250000.00, 30000.00, 500, 68, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1),
('FREESHIP', 'Potongan ongkos kirim Rp 15.000 se-Indonesia', 'fixed', 15000.00, 150000.00, 15000.00, 500, 89, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1);

-- Reviews (Real Customer Testimonials)
INSERT INTO reviews (product_id, user_id, customer_name, customer_email, rating, comment, is_approved) VALUES
(1, 1, 'Anindya Putri', 'anindya@gmail.com', 5, 'Teksturnya seringan air tapi efeknya luar biasa! Dalam 2 minggu bekas jerawat kehitaman di pipi pudar drastis dan kulit berasa jauh lebih kenyal. Gak ada tingling sensation sama sekali.', 1),
(1, 2, 'Sarah Maharani', 'sarah.m@gmail.com', 5, 'My holy grail serum! Niacinamide terenak yang pernah aku coba. Biasanya pakai niacinamide merk lain suka jerawatan kecil, tapi ini lembut banget karena ada centellanya.', 1),
(3, 3, 'Nadia Kusuma', 'nadia.k@gmail.com', 5, 'Skin barrier aku yang tadinya ngelupas perih gara-gara over-exfoliasi sembuh dalam 4 hari pakai Ceramide cream ini. Wanginya subtle dan formulanya sangat melembapkan.', 1),
(4, 4, 'Gabriella Tan', 'gabriella@gmail.com', 5, 'Sunscreen terbaik tahun ini! Beneran no whitecast sama sekali di kulitku yang sawo matang, dan gak bikin muka kayak kilang minyak walau dipakai seharian.', 1),
(5, 5, 'Maya Larasati', 'maya.larasati@gmail.com', 5, 'Wanginya relaxing banget kayak lagi spa di Paris. Pagi-pagi bangun tidur wajah glowing sehat dan kenyal. Botolnya juga cantik banget di meja rias.', 1);

-- Orders (10 Sample Orders)
INSERT INTO orders (order_number, user_id, customer_name, customer_email, customer_phone, shipping_address, province, city, district, postal_code, subtotal, discount_amount, shipping_cost, grand_total, payment_method, payment_status, order_status, tracking_number) VALUES
('ORD-20261001-0001', 1, 'Anindya Putri', 'anindya@gmail.com', '081234567890', 'Jl. Senopati No. 42', 'DKI Jakarta', 'Jakarta Selatan', 'Kebayoran Baru', '12190', 358000.00, 30000.00, 0.00, 328000.00, 'Bank Transfer (BCA)', 'paid', 'Completed', 'JNE-8829103948'),
('ORD-20261001-0002', 2, 'Sarah Maharani', 'sarah.m@gmail.com', '081398765432', 'Jl. Diponegoro No. 15', 'Jawa Barat', 'Bandung', 'Coblong', '40132', 298000.00, 0.00, 15000.00, 313000.00, 'Bank Transfer (Mandiri)', 'paid', 'Shipped', 'SCP-773829104'),
('ORD-20261001-0003', 3, 'Nadia Kusuma', 'nadia.k@gmail.com', '082145678912', 'Jl. Pemuda No. 88', 'Jawa Timur', 'Surabaya', 'Genteng', '60271', 408000.00, 40000.00, 0.00, 368000.00, 'QRIS / GoPay', 'paid', 'Processing', NULL),
('ORD-20261002-0004', 4, 'Gabriella Tan', 'gabriella@gmail.com', '085712345678', 'Jl. Thamrin Boulevard No. 10', 'DKI Jakarta', 'Jakarta Pusat', 'Menteng', '10310', 189000.00, 18900.00, 0.00, 170100.00, 'Bank Transfer (BCA)', 'paid', 'Confirmed', NULL),
('ORD-20261002-0005', 5, 'Maya Larasati', 'maya.larasati@gmail.com', '081912344321', 'Jl. Affandi No. 27', 'DI Yogyakarta', 'Sleman', 'Depok', '55281', 498000.00, 0.00, 0.00, 498000.00, 'Cash on Delivery', 'unpaid', 'Pending', NULL),
('ORD-20261002-0006', 1, 'Anindya Putri', 'anindya@gmail.com', '081234567890', 'Jl. Senopati No. 42', 'DKI Jakarta', 'Jakarta Selatan', 'Kebayoran Baru', '12190', 274000.00, 0.00, 0.00, 274000.00, 'Bank Transfer (BCA)', 'paid', 'Completed', 'JNE-994827103'),
('ORD-20261002-0007', 2, 'Sarah Maharani', 'sarah.m@gmail.com', '081398765432', 'Jl. Diponegoro No. 15', 'Jawa Barat', 'Bandung', 'Coblong', '40132', 159000.00, 15000.00, 12000.00, 156000.00, 'QRIS / ShopeePay', 'paid', 'Processing', NULL),
('ORD-20261002-0008', 3, 'Nadia Kusuma', 'nadia.k@gmail.com', '082145678912', 'Jl. Pemuda No. 88', 'Jawa Timur', 'Surabaya', 'Genteng', '60271', 438000.00, 30000.00, 0.00, 408000.00, 'Bank Transfer (BCA)', 'paid', 'Shipped', 'JNT-112039485'),
('ORD-20261002-0009', 4, 'Gabriella Tan', 'gabriella@gmail.com', '085712345678', 'Jl. Thamrin Boulevard No. 10', 'DKI Jakarta', 'Jakarta Pusat', 'Menteng', '10310', 219000.00, 0.00, 0.00, 219000.00, 'Bank Transfer (Mandiri)', 'unpaid', 'Pending', NULL),
('ORD-20261002-0010', 5, 'Maya Larasati', 'maya.larasati@gmail.com', '081912344321', 'Jl. Affandi No. 27', 'DI Yogyakarta', 'Sleman', 'Depok', '55281', 175000.00, 0.00, 15000.00, 190000.00, 'Cash on Delivery', 'unpaid', 'Pending', NULL);

-- Order Items
INSERT INTO order_items (order_id, product_id, product_name, product_sku, price, quantity, total) VALUES
(1, 1, 'Niacinamide 10% + Zinc Glow Serum', 'AB-SRM-001', 169000.00, 1, 169000.00),
(1, 3, '5X Ceramide Barrier Moisture Cream', 'CB-MST-003', 189000.00, 1, 189000.00),
(2, 4, 'Invisible Velvet Sunscreen SPF 50+ PA++++', 'AB-SUN-004', 159000.00, 1, 159000.00),
(2, 2, 'Centella Soothing Barrier Toner', 'AB-TON-002', 139000.00, 1, 139000.00),
(3, 5, 'Pure Damask Rosehip Night Elixir', 'RF-OIL-005', 249000.00, 1, 249000.00),
(3, 4, 'Invisible Velvet Sunscreen SPF 50+ PA++++', 'AB-SUN-004', 159000.00, 1, 159000.00),
(4, 3, '5X Ceramide Barrier Moisture Cream', 'CB-MST-003', 189000.00, 1, 189000.00),
(5, 5, 'Pure Damask Rosehip Night Elixir', 'RF-OIL-005', 249000.00, 2, 498000.00);

-- Article Categories
INSERT INTO article_categories (name, slug, description) VALUES
('Skincare 101', 'skincare-101', 'Panduan dasar dan tahapan perawatan kulit untuk pemula.'),
('Active Ingredients', 'active-ingredients', 'Kupas tuntas sains di balik bahan aktif seperti Niacinamide, Retinol, dan Vitamin C.'),
('Skin Concerns', 'skin-concerns', 'Solusi terarah untuk jerawat, flek hitam, dehidrasi, dan skin barrier rusak.'),
('Holistic Beauty', 'holistic-beauty', 'Gaya hidup sehat, nutrisi, dan rutinitas self-care untuk kecantikan menyeluruh.');

-- Articles (10 Educational Skincare Articles)
INSERT INTO articles (title, slug, excerpt, content, featured_image, category_id, author_id, status, views, seo_title, seo_description, focus_keyword) VALUES
('How to Choose the Right Moisturizer for Oily and Acne-Prone Skin', 'how-to-choose-the-right-moisturizer-for-oily-skin', 'Banyak orang dengan kulit berminyak sengaja melewatkan pelembap. Simak alasan mengapa pelembap tetap krusial dan kriteria tekstur yang tepat.', '<p>Satu mitos terbesar dalam dunia perawatan kulit adalah anggapan bahwa kulit berminyak tidak membutuhkan pelembap. Faktanya, ketika kulit berminyak kehilangan hidrasi, kelenjar sebasea justru akan memproduksi lebih banyak minyak untuk mengompensasi kekeringan.</p><h2>Pilihlah Formula Gel Berbasis Air</h2><p>Bagi pemilik kulit berminyak, formula pelembap bertekstur gel atau water-cream adalah pilihan paling ideal. Kandungan seperti Ceramide, Hyaluronic Acid, dan Centella Asiatica memberi hidrasi mendalam tanpa menyumbat pori-pori (non-comedogenic).</p>', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80', 1, 1, 'published', 1420, 'How to Choose the Right Moisturizer for Oily Skin - Skincare Guide', 'Panduan lengkap memilih pelembap untuk kulit berminyak dan berjerawat tanpa menyumbat pori.', 'moisturizer for oily skin'),
('Best Skincare Routine for Beginners: 4 Basic Steps That Actually Work', 'best-skincare-routine-for-beginners', 'Jangan bingung dengan tren 10-step skincare. Cukup kuasai 4 pilar fundamental (Basic Skincare) untuk hasil kulit sehat maksimal.', '<p>Memulai rutinitas skincare tidak harus rumit dan menguras kantong. Rutinitas terbaik adalah yang bisa Anda lakukan secara konsisten setiap hari.</p><h2>Empat Pilar Basic Skincare (CTMP)</h2><ol><li><strong>Cleansing:</strong> Cuci muka dengan pembersih ber-pH rendah 5.0 - 5.5.</li><li><strong>Toning / Hydrating:</strong> Kembalikan hidrasi instan dengan toner lembut.</li><li><strong>Moisturizing:</strong> Kunci kelembapan dengan pelembap yang sesuai tipe kulit.</li><li><strong>Protecting:</strong> Lindungi kulit dari penuaan dini dengan sunscreen SPF minimal 30 di pagi hari.</li></ol>', 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80', 1, 3, 'published', 2890, 'Best Skincare Routine for Beginners: 4 Basic Steps - Aura Botanica', 'Panduan urutan skincare pemula yang benar, efektif, dan praktis.', 'skincare routine for beginners'),
('How to Use Niacinamide in Your Skincare Routine for Glowing Skin', 'how-to-use-niacinamide-in-your-skincare-routine', 'Niacinamide adalah holy-grail sejuta umat. Pelajari persentase yang efektif, waktu pemakaian, dan kombinasi terbaiknya.', '<p>Niacinamide (Vitamin B3) telah teruji secara dermatologis efektif memudarkan noda bekas jerawat, mengecilkan pori-pori, dan memperkuat skin barrier.</p><h2>Berapa Persentase Terbaik?</h2><p>Penelitian menunjukkan konsentrasi 5% hingga 10% adalah sweet-spot paling optimal. Anda dapat mengombinasikannya dengan Hyaluronic Acid dan Centella untuk meredakan kemerahan.</p>', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', 2, 1, 'published', 3540, 'Cara Memakai Niacinamide yang Benar untuk Kulit Glowing', 'Tips dan cara menggunakan Niacinamide agar kulit cerah tanpa iritasi.', 'cara pakai niacinamide'),
('The Science of Skin Barrier: Tanda-tanda Kerusakan dan Cara Memulihkannya', 'the-science-of-skin-barrier-repair', 'Sering merasa kulit perih saat kena air atau mendadak bruntusan? Kenali tanda skin barrier Anda rusak dan cara merawatnya.', '<p>Lapisan terluar kulit (stratum corneum) berfungsi sebagai dinding pelindung yang menahan air di dalam dan menghalau bakteri serta polutan luar.</p><h2>Tanda Skin Barrier Rusak</h2><p>Kulit terasa ketarik, mudah memerah, terasa perih saat memakai produk biasa, dan timbul bruntusan kasar. Segera hentikan eksfoliasi dan fokus gunakan Ceramide dan Panthenol.</p>', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', 3, 2, 'published', 1980, 'Cara Memperbaiki Skin Barrier yang Rusak - Solusi Dermatologis', 'Panduan ilmiah memulihkan skin barrier rusak dalam hitungan hari.', 'skin barrier repair'),
('Sunscreen 101: Memahami Perbedaan Physical vs Chemical Sunscreen', 'sunscreen-101-physical-vs-chemical', 'Bingung memilih antara mineral atau chemical sunscreen? Pelajari kelebihan dan kecocokannya dengan jenis kulit Anda.', '<p>Perlindungan matahari adalah produk anti-aging terbaik yang pernah diciptakan. Mengetahui jenis sunscreen yang tepat akan membuat Anda nyaman menggunakannya setiap hari.</p>', 'https://images.unsplash.com/photo-1556228852-80b6e5eeff06?auto=format&fit=crop&w=800&q=80', 1, 3, 'published', 2110, 'Perbedaan Physical vs Chemical Sunscreen - Mana yang Lebih Bagus?', 'Kenali perbedaan physical dan chemical sunscreen untuk kulit Anda.', 'physical vs chemical sunscreen'),
('Bakuchiol vs Retinol: Mana yang Lebih Tepat untuk Kulit Sensitif?', 'bakuchiol-vs-retinol-for-sensitive-skin', 'Ingin manfaat anti-aging retinol tapi takut iritasi dan purging? Bakuchiol nabati adalah jawabannya.', '<p>Bagi pemilik kulit sensitif, wanita hamil, atau menyusui, retinol konvensional seringkali menimbulkan resiko iritasi. Bakuchiol yang diekstrak dari tanaman Psoralea corylifolia memberikan stimulasi kolagen serupa secara lembut.</p>', 'https://images.unsplash.com/photo-1608248597359-00f72365eb54?auto=format&fit=crop&w=800&q=80', 2, 1, 'published', 1650, 'Bakuchiol vs Retinol untuk Kulit Sensitif dan Bumil', 'Perbandingan ilmiah bakuchiol dan retinol untuk anti-aging aman.', 'bakuchiol vs retinol'),
('Cara Tepat Eksfoliasi Wajah dengan AHA dan BHA Tanpa Over-Exfoliating', 'cara-tepat-eksfoliasi-wajah-aha-bha', 'Eksfoliasi mengangkat sel kulit mati agar tidak menumpuk jadi komedo. Namun over-exfoliating adalah bahaya laten. Ini frekuensi idealnya.', '<p>Gunakan AHA (Glycolic/Lactic) untuk masalah kusam di permukaan kulit, dan gunakan BHA (Salicylic Acid) untuk membersihkan pori tersumbat dari dalam.</p>', 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80', 2, 2, 'published', 1890, 'Cara Eksfoliasi Wajah yang Benar dengan AHA BHA', 'Aturan pakai AHA BHA agar wajah halus tanpa risiko iritasi.', 'cara eksfoliasi wajah'),
('Mengenal Centella Asiatica (Cica) dan Manfaat Ajaibnya untuk Jerawat', 'mengenal-centella-asiatica-cica-manfaat-jerawat', 'Tanaman pegagan tradisional yang kini menjadi primadona dermatologi modern dalam menenangkan peradangan.', '<p>Centella Asiatica kaya akan saponin triterpenoid seperti Asiaticoside dan Madecassoside yang mempercepat penyembuhan luka dan meredakan peradangan jerawat.</p>', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80', 2, 3, 'published', 2410, 'Manfaat Centella Asiatica untuk Kulit Berjerawat', 'Kandungan aktif Cica yang terbukti menenangkan jerawat meradang.', 'centella asiatica jerawat'),
('Urutan Skincare Pagi dan Malam yang Benar agar Produk Bekerja Optimal', 'urutan-skincare-pagi-dan-malam-yang-benar', 'Tahukah Anda bahwa urutan pemakaian dari tekstur paling cair ke paling kental menentukan tingkat penyerapan nutrisi?', '<p>Aturan emas pemakaian skincare: aplikasikan produk dari viskositas terendah (paling cair seperti toner) menuju viskositas tertinggi (krim kental atau face oil).</p>', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', 1, 1, 'published', 4120, 'Urutan Skincare Pagi dan Malam Hari yang Benar', 'Panduan urutan pakai skincare dari toner hingga sunscreen secara berurutan.', 'urutan skincare pagi malam'),
('Glow from Within: Hubungan Pola Tidur, Hidrasi Air, dan Kesehatan Kulit', 'glow-from-within-pola-hidup-dan-kesehatan-kulit', 'Produk skincare bekerja dari luar, namun regenerasi sejati terjadi saat tubuh Anda beristirahat pulas.', '<p>Tidur 7-8 jam per hari memungkinkan tubuh memproduksi hormon pertumbuhan yang menstimulasi pembentukan kolagen dan perbaikan jaringan sel yang rusak sepanjang hari.</p>', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', 4, 3, 'published', 1330, 'Pola Hidup Sehat untuk Kulit Bercahaya Alami', 'Rahasia kulit glowing alami melalui pola tidur dan hidrasi yang seimbang.', 'kulit sehat alami');

-- Pages (Static Content)
INSERT INTO pages (title, slug, content, seo_title, seo_description) VALUES
('About Us', 'about-us', '<h2>Kemurnian Botani Bertemu Sains Modern</h2><p>Didirikan dengan filosofi bahwa kulit manusia layak mendapatkan nutrisi paling murni dan teruji secara klinis, <strong>AURA BOTANICA</strong> mendedikasikan setiap formulasinya untuk mengembalikan keseimbangan skin barrier alami Anda.</p><p>Kami memadukan ekstrak tumbuhan organik bersertifikat dengan bahan aktif bioteknologi presisi tinggi seperti Ceramide biomimetik, Peptida aktif, dan Niacinamide murni tanpa bahan berbahaya, paraben, sulfat, maupun pewangi buatan yang mengiritasi.</p><h3>Komitmen Kami:</h3><ul><li>100% Cruelty-Free & Dermatologist-Tested</li><li>Clean Formulation dengan pH Seimbang</li><li>Kemasan Ramah Lingkungan & Dapat Didaur Ulang</li><li>Transparansi 100% Persentase Bahan Aktif</li></ul>', 'Tentang Kami - Filosofi Aura Botanica Skincare', 'Kisah di balik Aura Botanica: perpaduan kemurnian botani dan bioteknologi modern.'),
('Contact Us', 'contact-us', '<p>Kami siap membantu Anda menemukan rutinitas skincare yang tepat untuk kebutuhan kulit Anda.</p><p>Email: care@aurabotanica.com<br>WhatsApp: +62 812-3456-7890<br>Senin - Minggu: 08:00 - 20:00 WIB</p>', 'Hubungi Kami - Konsultasi & Layanan Pelanggan Aura Botanica', 'Layanan bantuan pelanggan dan konsultasi kulit gratis dengan beauty advisor.'),
('FAQ', 'faq', '<h2>Pertanyaan yang Sering Diajukan</h2><h3>Apakah produk aman untuk ibu hamil dan menyusui?</h3><p>Sebagian besar produk kami seperti Centella Toner, 5X Ceramide Cream, dan Bakuchiol Elixir sangat aman untuk bumil & busui. Untuk produk dengan konsentrasi asam aktif tinggi seperti AHA/BHA, silakan konsultasikan dengan dokter kandungan Anda.</p><h3>Berapa lama estimasi pengiriman pesanan?</h3><p>Pesanan sebelum jam 15.00 WIB akan dikirim pada hari yang sama. Estimasi untuk Jabodetabek adalah 1-2 hari kerja, dan luar pulau Jawa 2-4 hari kerja.</p>', 'FAQ - Pertanyaan Umum Seputar Aura Botanica', 'Jawaban atas pertanyaan seputar pemakaian produk, keaslian, dan pengiriman.'),
('Privacy Policy', 'privacy-policy', '<h2>Kebijakan Privasi</h2><p>Kami sangat menghargai privasi data Anda. Semua data pribadi seperti nama, alamat, nomor telepon, dan email yang Anda berikan saat berbelanja dilindungi dengan enkripsi SSL 256-bit dan tidak akan pernah diperjualbelikan kepada pihak ketiga manapun.</p>', 'Kebijakan Privasi - Aura Botanica', 'Kebijakan privasi dan perlindungan data pelanggan Aura Botanica.'),
('Terms & Conditions', 'terms-and-conditions', '<h2>Syarat & Ketentuan</h2><p>Dengan mengakses dan melakukan pemesanan di situs Aura Botanica, Anda menyetujui seluruh syarat dan ketentuan transaksi yang berlaku secara sah.</p>', 'Syarat & Ketentuan Pembelian - Aura Botanica', 'Syarat dan ketentuan pembelian serta pengembalian produk.');

-- Website Settings (Dynamic Configuration)
INSERT INTO settings (setting_key, setting_value, setting_group, description) VALUES
('site_name', 'AURA BOTANICA', 'general', 'Nama website toko online'),
('site_tagline', 'Haute Botanical Skincare & Barrier Therapy', 'general', 'Slogan brand skincare'),
('site_email', 'care@aurabotanica.com', 'general', 'Email resmi customer care'),
('site_phone', '+62 812-3456-7890', 'general', 'Nomor telepon / WhatsApp CS'),
('site_address', 'Jl. Senopati No. 88, Kebayoran Baru, Jakarta Selatan 12190, Indonesia', 'general', 'Alamat kantor operasional'),
('announcement_bar', '✨ Gratis Ongkir Se-Indonesia untuk pesanan di atas Rp 250.000 | Gunakan kode promo: GLOWSKIN', 'general', 'Pesan banner di bagian paling atas'),
('free_shipping_threshold', '250000', 'shipping', 'Nominal belanja minimal untuk mendapatkan gratis ongkir otomatis'),
('default_shipping_cost', '15000', 'shipping', 'Biaya ongkir flat standar jika di bawah batas minimum belanja'),
('instagram_handle', '@aurabotanica.id', 'social', 'Akun Instagram resmi'),
('hero_heading', 'Kembalikan Kemilau Sehat Alami Kulit Anda', 'homepage', 'Judul utama di hero banner homepage'),
('hero_subheading', 'Formulasi botani murni diperkaya 5X Ceramide & Niacinamide aktif untuk merevitalisasi skin barrier dan menjaga hidrasi tahan lama.', 'homepage', 'Deskripsi di hero banner homepage'),
('hero_cta_text', 'Belanja Koleksi', 'homepage', 'Teks tombol utama hero banner'),
('hero_cta_link', '/products', 'homepage', 'Tautan tombol utama hero banner');

-- SEO Default Settings
INSERT INTO seo_settings (page_key, title, meta_description, keywords, og_image) VALUES
('home', 'AURA BOTANICA - Haute Botanical Skincare & Barrier Therapy', 'Toko online skincare premium dengan formulasi botani alami dan bahan aktif dermatologis. Gratis ongkir se-Indonesia.', 'skincare premium, toner centella, serum niacinamide, ceramide cream, sunscreen tanpa whitecast', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80'),
('products', 'Koleksi Skincare Lengkap - Serum, Toner, Moisturizer & Sunscreen', 'Jelajahi seluruh rangkaian produk perawatan kulit Aura Botanica untuk semua jenis kulit: berminyak, kering, dan sensitif.', 'katalog skincare, beli serum wajah, pelembap ceramide, facial wash', 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1200&q=80'),
('articles', 'Jurnal Kecantikan & Tips Skincare - Aura Botanica Journal', 'Artikel edukatif dan tips perawatan kulit terpercaya seputar bahan aktif, skin barrier, dan rekomendasi dermatologis.', 'tips skincare pemula, artikel kecantikan, cara pakai retinol, urutan skincare', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80');

-- Activity Logs (Initial Admin Logs)
INSERT INTO activity_logs (admin_id, action, description, ip_address) VALUES
(1, 'DATABASE_INIT', 'Sistem database e-commerce skincare berhasil diinisialisasi dengan sample data.', '127.0.0.1'),
(1, 'SETTINGS_UPDATE', 'Pengaturan awal toko dan batas gratis ongkir Rp 250.000 disimpan.', '127.0.0.1');

-- Newsletter Subscribers
INSERT INTO newsletter_subscribers (email) VALUES
('anindya@gmail.com'),
('sarah.m@gmail.com'),
('nadia.k@gmail.com');

-- Contacts (Sample Customer Message)
INSERT INTO contacts (name, email, phone, subject, message, is_read) VALUES
('Clarissa Dewi', 'clarissa@yahoo.com', '081288889999', 'Konsultasi Kulit Bruntusan', 'Halo admin, tipe kulit saya kombinasi dan sering bruntusan di area dahi. Lebih disarankan pakai toner Centella atau langsung serum Niacinamide ya? Terima kasih.', 0);
