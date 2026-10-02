import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, Database as DatabaseIcon } from 'lucide-react';

interface CodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FILES_MAP: Record<string, { label: string; language: string; content: string }> = {
  'database.sql': {
    label: 'database.sql (MySQL Dump)',
    language: 'sql',
    content: `-- ========================================================
-- DATABASE DUMP: AURA BOTANICA - LUXURY SKINCARE E-COMMERCE
-- Tech Stack: PHP Native (MySQLi Prepared Statements) + MySQL
-- Normalized schema with Foreign Keys, Indexes, & Sample Data
-- ========================================================

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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admins (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Super Admin', 'Admin', 'Editor', 'Order Manager') NOT NULL DEFAULT 'Admin',
    status ENUM('active', 'inactive') DEFAULT 'active',
    last_login DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    is_bestseller TINYINT(1) NOT NULL DEFAULT 0,
    is_new_arrival TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INT UNSIGNED DEFAULT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(25) NOT NULL,
    shipping_address TEXT NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    shipping_cost DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    grand_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(50) NOT NULL,
    payment_status ENUM('unpaid', 'pending_verification', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid',
    order_status ENUM('Pending', 'Confirmed', 'Processing', 'Shipped', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    tracking_number VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Admin User: superadmin@aurabotanica.com | Password: password123
INSERT INTO admins (name, email, password, role) VALUES
('Jessica Wardhana', 'superadmin@aurabotanica.com', '$2y$10$eA09sUvN0Z3Q/F82fO9RneYc29XkZc6sP2q0P93z7c2wL1pT1ZfOu', 'Super Admin');`
  },
  'config/database.php': {
    label: 'config/database.php (MySQLi Prepared Statements)',
    language: 'php',
    content: `<?php
require_once __DIR__ . '/config.php';

class Database {
    private static ?mysqli $connection = null;

    public static function getConnection(): mysqli {
        if (self::$connection === null) {
            mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
            self::$connection = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
            self::$connection->set_charset("utf8mb4");
        }
        return self::$connection;
    }

    public static function fetchAll(string $query, string $types = "", array $params = []): array {
        $conn = self::getConnection();
        $stmt = $conn->prepare($query);
        if (!empty($types) && !empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $res = $stmt->get_result();
        $rows = [];
        while ($row = $res->fetch_assoc()) { $rows[] = $row; }
        $stmt->close();
        return $rows;
    }

    public static function fetchOne(string $query, string $types = "", array $params = []): ?array {
        $conn = self::getConnection();
        $stmt = $conn->prepare($query);
        if (!empty($types) && !empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $res = $stmt->get_result();
        $row = $res->fetch_assoc();
        $stmt->close();
        return $row ?: null;
    }

    public static function execute(string $query, string $types = "", array $params = []): int {
        $conn = self::getConnection();
        $stmt = $conn->prepare($query);
        if (!empty($types) && !empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $affected = $stmt->affected_rows;
        $stmt->close();
        return $affected;
    }

    public static function lastInsertId(): int {
        return (int)self::getConnection()->insert_id;
    }
}`
  },
  'includes/functions.php': {
    label: 'includes/functions.php (Helpers & Cart)',
    language: 'php',
    content: `<?php
require_once __DIR__ . '/../config/database.php';

function e(?string $string): string {
    return htmlspecialchars((string)($string ?? ''), ENT_QUOTES, 'UTF-8');
}

function format_rupiah(float|int|string|null $amount): string {
    return 'Rp ' . number_format((float)($amount ?? 0), 0, ',', '.');
}

function generate_csrf(): string {
    if (empty($_SESSION[CSRF_TOKEN_KEY])) {
        $_SESSION[CSRF_TOKEN_KEY] = bin2hex(random_bytes(32));
    }
    return $_SESSION[CSRF_TOKEN_KEY];
}

function verify_csrf(?string $token): bool {
    return !empty($token) && hash_equals($_SESSION[CSRF_TOKEN_KEY] ?? '', $token);
}

function generate_order_number(): string {
    return 'ORD-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 4));
}`
  },
  '.htaccess': {
    label: '.htaccess (Apache SEO Rewrites)',
    language: 'apache',
    content: `RewriteEngine On
RewriteBase /

# SEO Clean URLs
RewriteRule ^products/?$ products.php [L,QSA]
RewriteRule ^products/category/([a-zA-Z0-9_-]+)/?$ products.php?category=$1 [L,QSA]
RewriteRule ^product/([a-zA-Z0-9_-]+)/?$ product.php?slug=$1 [L,QSA]
RewriteRule ^cart/?$ cart.php [L,QSA]
RewriteRule ^checkout/?$ checkout.php [L,QSA]
RewriteRule ^order/success/([a-zA-Z0-9_-]+)/?$ order-success.php?order=$1 [L,QSA]
RewriteRule ^articles/?$ articles.php [L,QSA]
RewriteRule ^article/([a-zA-Z0-9_-]+)/?$ article.php?slug=$1 [L,QSA]
RewriteRule ^sitemap\\.xml$ sitemap.php [L]`
  }
};

export const CodeViewerModal: React.FC<CodeViewerModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<string>('database.sql');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(FILES_MAP[selectedFile].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([FILES_MAP['database.sql'].content], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'database.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#1F1C1A] text-[#FAF8F5] border border-[#3E3833] rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#302B27] bg-[#272320]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#9B786F]/20 text-[#C4A49C] rounded-lg">
              <FileCode size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">PHP Native & MySQL Source Code Inspector</h3>
              <p className="text-xs text-[#9E9285]">Berkas arsitektur native tanpa framework siap dipindahkan ke XAMPP / Apache</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSql}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#9B786F] text-white hover:bg-[#83635B] rounded-lg transition"
            >
              <Download size={14} /> Download database.sql
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#9E9285] hover:text-white rounded-lg hover:bg-[#302B27] transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body Split */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar file list */}
          <div className="w-64 border-r border-[#302B27] bg-[#1A1715] p-3 flex flex-col gap-1 overflow-y-auto">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#736B63] px-3 py-2">
              Berkas Project Native
            </div>
            {Object.keys(FILES_MAP).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedFile(key)}
                className={`flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-left transition ${
                  selectedFile === key
                    ? 'bg-[#302B27] text-white font-medium shadow-sm'
                    : 'text-[#9E9285] hover:bg-[#25211E] hover:text-white'
                }`}
              >
                {key.endsWith('.sql') ? <DatabaseIcon size={14} className="text-[#C4A49C]" /> : <FileCode size={14} className="text-[#C4A49C]" />}
                <span className="truncate">{key}</span>
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col bg-[#141211] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-2.5 border-b border-[#25211E] bg-[#191715] text-xs">
              <span className="text-[#A3978B] font-mono">{FILES_MAP[selectedFile].label}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#272320] hover:bg-[#35302C] text-[#C4A49C] transition"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>
            </div>
            <pre className="flex-1 p-6 overflow-auto text-xs font-mono leading-relaxed text-[#DCD1C5] selection:bg-[#9B786F]/40">
              <code>{FILES_MAP[selectedFile].content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
