<?php
require_once __DIR__ . '/koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = getJsonInput();

// 1. GET: AMBIL PENGATURAN TOKO
if ($method === 'GET') {
    $stmt = $pdo->query('SELECT `kunci`, `nilai` FROM `pengaturan_toko`');
    $rows = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    $settings = [
        'storeName'    => $rows['store_name'] ?? 'NomNom',
        'poOpen'       => ($rows['po_open'] ?? '1') === '1',
        'poClose'      => $rows['po_close'] ?? 'Jumat, 20.00 WITA',
        'pickup'       => $rows['pickup'] ?? 'Sabtu, 10.00 - 15.00',
        'contactPhone' => $rows['contact_phone'] ?? '081234567890',
        'instagram'    => $rows['instagram'] ?? 'nomnom.mtr'
    ];

    jsonResponse(true, $settings);
}

// 2. POST: SIMPAN PENGATURAN TOKO (ADMIN)
if ($method === 'POST') {
    if (empty($_SESSION['admin_logged'])) {
        jsonResponse(false, null, 'Akses ditolak, silakan login admin.', 403);
    }

    $map = [
        'po_open'       => empty($input['poOpen']) ? '0' : '1',
        'po_close'      => trim($input['poClose'] ?? ''),
        'pickup'        => trim($input['pickup'] ?? ''),
        'contact_phone' => trim($input['contactPhone'] ?? ''),
        'instagram'     => trim($input['instagram'] ?? '')
    ];

    $stmt = $pdo->prepare('INSERT INTO `pengaturan_toko` (`kunci`, `nilai`) 
        VALUES (?, ?) ON DUPLICATE KEY UPDATE `nilai` = VALUES(`nilai`)');

    foreach ($map as $key => $val) {
        $stmt->execute([$key, $val]);
    }

    jsonResponse(true, $map, 'Pengaturan toko berhasil disimpan ke database!');
}

jsonResponse(false, null, 'Metode tidak diizinkan', 405);
