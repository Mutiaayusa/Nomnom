<?php
/**
 * Koneksi Database MySQL & Helper API JSON
 * Digunakan oleh seluruh file API NomNom
 */

// Mulai sesi PHP
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Header respon JSON & CORS
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Konfigurasi Database (Sesuaikan jika dihosting)
$db_host = 'localhost';
$db_name = 'nomnom_db';
$db_user = 'root';
$db_pass = ''; // Default kosong di XAMPP / Laragon

try {
    $pdo = new PDO("mysql:host={$db_host};dbname={$db_name};charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Gagal terhubung ke database: ' . $e->getMessage()
    ]);
    exit();
}

/**
 * Helper untuk mengembalikan respon JSON terstandar
 */
function jsonResponse($success, $data = null, $message = '', $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data'    => $data
    ]);
    exit();
}

/**
 * Helper untuk membaca input JSON dari fetch()
 */
function getJsonInput() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}
