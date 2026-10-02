<?php
/**
 * AURA BOTANICA - Authentication & Role-Based Access Control (RBAC)
 */

require_once __DIR__ . '/functions.php';

// ------------------------------------------------------------------
// Customer Authentication
// ------------------------------------------------------------------

function is_user_logged_in(): bool {
    return !empty($_SESSION['user_id']);
}

function current_user(): ?array {
    if (!is_user_logged_in()) {
        return null;
    }
    return Database::fetchOne("SELECT id, name, email, phone, address, province, city, district, postal_code, status FROM users WHERE id = ?", "i", [$_SESSION['user_id']]);
}

function user_login(string $email, string $password): array {
    $user = Database::fetchOne("SELECT * FROM users WHERE email = ?", "s", [$email]);
    if (!$user) {
        return ['success' => false, 'message' => 'Email atau password salah.'];
    }

    if ($user['status'] !== 'active') {
        return ['success' => false, 'message' => 'Akun Anda dinonaktifkan atau ditangguhkan.'];
    }

    if (!password_verify($password, $user['password'])) {
        return ['success' => false, 'message' => 'Email atau password salah.'];
    }

    // Regenerate session ID to prevent session fixation
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email'] = $user['email'];

    return ['success' => true, 'user' => $user];
}

function user_register(string $name, string $email, string $password, string $phone = ''): array {
    $existing = Database::fetchOne("SELECT id FROM users WHERE email = ?", "s", [$email]);
    if ($existing) {
        return ['success' => false, 'message' => 'Email sudah terdaftar. Silakan login atau gunakan email lain.'];
    }

    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $affected = Database::execute(
        "INSERT INTO users (name, email, password, phone, status) VALUES (?, ?, ?, ?, 'active')",
        "ssss",
        [$name, $email, $hashedPassword, $phone]
    );

    if ($affected > 0) {
        $userId = Database::lastInsertId();
        $_SESSION['user_id'] = $userId;
        $_SESSION['user_name'] = $name;
        $_SESSION['user_email'] = $email;
        return ['success' => true, 'user_id' => $userId];
    }

    return ['success' => false, 'message' => 'Gagal mendaftarkan akun. Silakan coba kembali.'];
}

function user_logout(): void {
    unset($_SESSION['user_id'], $_SESSION['user_name'], $_SESSION['user_email']);
}

function require_user_login(): void {
    if (!is_user_logged_in()) {
        set_flash('info', 'Silakan login terlebih dahulu untuk melanjutkan.');
        redirect('/login.php');
    }
}

// ------------------------------------------------------------------
// Admin Authentication & RBAC
// ------------------------------------------------------------------

function is_admin_logged_in(): bool {
    return !empty($_SESSION['admin_id']);
}

function current_admin(): ?array {
    if (!is_admin_logged_in()) {
        return null;
    }
    return Database::fetchOne("SELECT id, name, email, role, avatar, status FROM admins WHERE id = ?", "i", [$_SESSION['admin_id']]);
}

function admin_login(string $email, string $password): array {
    $admin = Database::fetchOne("SELECT * FROM admins WHERE email = ?", "s", [$email]);
    if (!$admin) {
        return ['success' => false, 'message' => 'Kredensial admin tidak valid.'];
    }

    if ($admin['status'] !== 'active') {
        return ['success' => false, 'message' => 'Akun admin telah dinonaktifkan.'];
    }

    if (!password_verify($password, $admin['password'])) {
        return ['success' => false, 'message' => 'Kredensial admin tidak valid.'];
    }

    session_regenerate_id(true);
    $_SESSION['admin_id'] = $admin['id'];
    $_SESSION['admin_name'] = $admin['name'];
    $_SESSION['admin_email'] = $admin['email'];
    $_SESSION['admin_role'] = $admin['role'];

    // Update last login
    Database::execute("UPDATE admins SET last_login = NOW() WHERE id = ?", "i", [$admin['id']]);
    log_activity($admin['id'], 'ADMIN_LOGIN', "Admin {$admin['name']} ({$admin['role']}) berhasil login.");

    return ['success' => true, 'admin' => $admin];
}

function admin_logout(): void {
    if (is_admin_logged_in()) {
        log_activity($_SESSION['admin_id'], 'ADMIN_LOGOUT', 'Admin keluar dari sistem.');
        unset($_SESSION['admin_id'], $_SESSION['admin_name'], $_SESSION['admin_email'], $_SESSION['admin_role']);
    }
}

function require_admin(): void {
    if (!is_admin_logged_in()) {
        set_flash('error', 'Akses ditolak. Silakan login sebagai administrator.');
        redirect('/admin/login.php');
    }
}

/**
 * Check if current admin has one of the allowed roles
 * e.g. has_role(['Super Admin', 'Admin'])
 */
function has_role(array|string $roles): bool {
    if (!is_admin_logged_in()) {
        return false;
    }
    $userRole = $_SESSION['admin_role'] ?? '';
    if (is_string($roles)) {
        $roles = [$roles];
    }
    return in_array($userRole, $roles, true);
}

function require_role(array|string $roles): void {
    require_admin();
    if (!has_role($roles)) {
        http_response_code(403);
        die("<h1>403 Forbidden</h1><p>Anda tidak memiliki hak akses untuk halaman ini.</p><a href='" . BASE_URL . "/admin/'>Kembali ke Dashboard</a>");
    }
}
