<?php
/**
 * AURA BOTANICA - Database Connection & Helper (MySQLi)
 * 100% Prepared Statements for Security against SQL Injection
 */

require_once __DIR__ . '/config.php';

class Database {
    private static ?mysqli $connection = null;

    /**
     * Get or initialize MySQLi connection
     */
    public static function getConnection(): mysqli {
        if (self::$connection === null) {
            mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
            try {
                self::$connection = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
                self::$connection->set_charset("utf8mb4");
            } catch (mysqli_sql_exception $e) {
                error_log("Database connection error: " . $e->getMessage());
                die("Koneksi database gagal. Pastikan database MySQL berjalan dan konfigurasi di config/config.php sudah sesuai.");
            }
        }
        return self::$connection;
    }

    /**
     * Execute a prepared SELECT statement and fetch all rows as associative array
     * @param string $query SQL with ? placeholders
     * @param string $types Types string (e.g., "ssi")
     * @param array $params Values array
     * @return array
     */
    public static function fetchAll(string $query, string $types = "", array $params = []): array {
        $conn = self::getConnection();
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            error_log("Prepare failed: " . $conn->error);
            return [];
        }

        if (!empty($types) && !empty($params)) {
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        $result = $stmt->get_result();
        $rows = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }
            $result->free();
        }
        $stmt->close();
        return $rows;
    }

    /**
     * Execute a prepared SELECT statement and fetch a single associative row
     * @param string $query
     * @param string $types
     * @param array $params
     * @return array|null
     */
    public static function fetchOne(string $query, string $types = "", array $params = []): ?array {
        $conn = self::getConnection();
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            error_log("Prepare failed: " . $conn->error);
            return null;
        }

        if (!empty($types) && !empty($params)) {
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        $result = $stmt->get_result();
        $row = null;
        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $result->free();
        }
        $stmt->close();
        return $row;
    }

    /**
     * Execute INSERT, UPDATE, DELETE with prepared statement
     * @return int Affected rows or -1 on error
     */
    public static function execute(string $query, string $types = "", array $params = []): int {
        $conn = self::getConnection();
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            error_log("Prepare failed: " . $conn->error);
            return -1;
        }

        if (!empty($types) && !empty($params)) {
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        $affected = $stmt->affected_rows;
        $stmt->close();
        return $affected;
    }

    /**
     * Get last inserted ID
     */
    public static function lastInsertId(): int {
        return (int)self::getConnection()->insert_id;
    }
}
