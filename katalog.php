<?php
require_once __DIR__ . '/koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$input = getJsonInput();

// ========================================================
// 1. GET: AMBIL KATALOG PRODUK UNTUK WEBSITE
// ========================================================
if ($method === 'GET') {
    $stmt = $pdo->query('SELECT * FROM `produk` ORDER BY `kategori` ASC, `created_at` ASC');
    $all = $stmt->fetchAll();

    $products = [];
    $pakets = [];

    foreach ($all as $row) {
        $item = [
            'id'         => $row['id'],
            'name'       => $row['nama'],
            'tag'        => $row['tag'],
            'price'      => (int)$row['harga'],
            'desc'       => $row['deskripsi'],
            'tile'       => $row['warna_tile'] ?: 'var(--tile-k)',
            'art'        => $row['art'] ?: 'default',
            'bonus'      => $row['bonus'],
            'outOfStock' => (bool)$row['stok_habis'],
            'isPaket'    => ($row['kategori'] === 'paket')
        ];

        if ($row['kategori'] === 'paket') {
            $pakets[] = $item;
        } else {
            $products[] = $item;
        }
    }

    jsonResponse(true, [
        'products' => $products,
        'pakets'   => $pakets
    ]);
}

// ========================================================
// 2. POST: SIMPAN / TAMBAH / EDIT PRODUK (ADMIN)
// ========================================================
if ($method === 'POST' && $action === 'save') {
    if (empty($_SESSION['admin_logged'])) {
        jsonResponse(false, null, 'Akses ditolak, silakan login admin.', 403);
    }

    $id = trim($input['id'] ?? '');
    $nama = trim($input['name'] ?? '');
    $tag = trim($input['tag'] ?? '');
    $harga = (int)($input['price'] ?? 0);
    $kategori = trim($input['type'] ?? 'satuan');
    $deskripsi = trim($input['desc'] ?? '');
    $tile = trim($input['tile'] ?? 'var(--tile-k)');
    $bonus = trim($input['bonus'] ?? '');

    if (!$nama || $harga <= 0) {
        jsonResponse(false, null, 'Nama menu dan harga valid wajib diisi!', 400);
    }

    // Jika ID sudah ada -> UPDATE
    if ($id) {
        $stmt = $pdo->prepare('UPDATE `produk` SET 
            `nama` = ?, `tag` = ?, `harga` = ?, `kategori` = ?, `deskripsi` = ?, `warna_tile` = ?, `bonus` = ?
            WHERE `id` = ?');
        $stmt->execute([$nama, $tag, $harga, $kategori, $deskripsi, $tile, $bonus ?: null, $id]);
        jsonResponse(true, ['id' => $id], "Menu {$nama} berhasil diperbarui di database!");
    } else {
        // Menu Baru -> INSERT
        $newId = 'm_' . substr(uniqid(), -6);
        $stmt = $pdo->prepare('INSERT INTO `produk` 
            (`id`, `nama`, `tag`, `harga`, `kategori`, `deskripsi`, `warna_tile`, `bonus`, `stok_habis`) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)');
        $stmt->execute([$newId, $nama, $tag, $harga, $kategori, $deskripsi, $tile, $bonus ?: null]);
        jsonResponse(true, ['id' => $newId], "Menu baru {$nama} berhasil ditambahkan ke database!");
    }
}

// ========================================================
// 3. POST: TOGGLE STATUS STOK (TERSEDIA / HABIS)
// ========================================================
if ($method === 'POST' && $action === 'toggle_stock') {
    if (empty($_SESSION['admin_logged'])) {
        jsonResponse(false, null, 'Akses ditolak, silakan login admin.', 403);
    }

    $id = trim($input['id'] ?? '');
    if (!$id) {
        jsonResponse(false, null, 'ID produk wajib diisi!', 400);
    }

    $stmt = $pdo->prepare('UPDATE `produk` SET `stok_habis` = NOT `stok_habis` WHERE `id` = ?');
    $stmt->execute([$id]);

    $stmtGet = $pdo->prepare('SELECT `stok_habis` FROM `produk` WHERE `id` = ?');
    $stmtGet->execute([$id]);
    $stok = $stmtGet->fetchColumn();

    jsonResponse(true, ['id' => $id, 'outOfStock' => (bool)$stok], 'Status stok berhasil diubah!');
}

// ========================================================
// 4. POST: HAPUS PRODUK DARI KATALOG
// ========================================================
if ($method === 'POST' && $action === 'delete') {
    if (empty($_SESSION['admin_logged'])) {
        jsonResponse(false, null, 'Akses ditolak, silakan login admin.', 403);
    }

    $id = trim($input['id'] ?? '');
    if (!$id) {
        jsonResponse(false, null, 'ID produk wajib diisi!', 400);
    }

    $stmt = $pdo->prepare('DELETE FROM `produk` WHERE `id` = ?');
    $stmt->execute([$id]);

    jsonResponse(true, ['id' => $id], 'Menu berhasil dihapus dari database!');
}

jsonResponse(false, null, 'Aksi tidak diizinkan', 405);
