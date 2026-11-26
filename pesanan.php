<?php
require_once __DIR__ . '/koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$input = getJsonInput();

// ========================================================
// 1. GET: MENGAMBIL DATA PESANAN
// ========================================================
if ($method === 'GET') {
    // Ambil 1 pesanan berdasarkan ID (untuk Struk & Tracking)
    if (!empty($_GET['id'])) {
        $id = trim($_GET['id']);
        $stmt = $pdo->prepare('SELECT * FROM `pesanan` WHERE `id` = ? LIMIT 1');
        $stmt->execute([$id]);
        $order = $stmt->fetch();

        if (!$order) {
            jsonResponse(false, null, 'Pesanan tidak ditemukan', 404);
        }

        // Ambil item detail pesanan
        $stmtItems = $pdo->prepare('SELECT * FROM `detail_pesanan` WHERE `pesanan_id` = ?');
        $stmtItems->execute([$id]);
        $order['items'] = $stmtItems->fetchAll();

        jsonResponse(true, $order);
    }

    // Ambil semua pesanan untuk Dashboard Admin
    if ($action === 'admin_all') {
        $statusFilter = $_GET['status'] ?? '';
        $sql = 'SELECT * FROM `pesanan`';
        $params = [];

        if ($statusFilter && $statusFilter !== 'all') {
            $sql .= ' WHERE `status` = ?';
            $params[] = $statusFilter;
        }
        $sql .= ' ORDER BY `created_at` DESC';

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $orders = $stmt->fetchAll();

        // Lampirkan items untuk tiap pesanan
        foreach ($orders as &$ord) {
            $stmtItems = $pdo->prepare('SELECT * FROM `detail_pesanan` WHERE `pesanan_id` = ?');
            $stmtItems->execute([$ord['id']]);
            $ord['items'] = $stmtItems->fetchAll();
        }

        jsonResponse(true, $orders);
    }

    // Ambil riwayat pesanan pelanggan berdasarkan no telepon
    if ($action === 'my_orders' && !empty($_GET['telp'])) {
        $telp = trim($_GET['telp']);
        $stmt = $pdo->prepare('SELECT * FROM `pesanan` WHERE `telepon` = ? ORDER BY `created_at` DESC LIMIT 20');
        $stmt->execute([$telp]);
        $orders = $stmt->fetchAll();

        foreach ($orders as &$ord) {
            $stmtItems = $pdo->prepare('SELECT * FROM `detail_pesanan` WHERE `pesanan_id` = ?');
            $stmtItems->execute([$ord['id']]);
            $ord['items'] = $stmtItems->fetchAll();
        }

        jsonResponse(true, $orders);
    }

    jsonResponse(false, null, 'Parameter tidak lengkap', 400);
}

// ========================================================
// 2. POST: MEMBUAT PESANAN BARU DARI WEB
// ========================================================
if ($method === 'POST' && empty($action)) {
    $id = trim($input['id'] ?? '');
    $nama = trim($input['nama'] ?? '');
    $telp = trim($input['telp'] ?? '');
    $cara = trim($input['cara'] ?? 'Ambil di tempat');
    $alamat = trim($input['alamat'] ?? '');
    $jadwal = trim($input['jadwal'] ?? '');
    $bayar = trim($input['bayar'] ?? 'qris');
    $pengirimNama = trim($input['pengirimNama'] ?? '');
    $catatan = trim($input['cat'] ?? '');
    $items = $input['items'] ?? [];
    $total = (int)($input['total'] ?? 0);
    $status = trim($input['status'] ?? (($bayar === 'tunai') ? 'dimasak' : 'menunggu_bayar'));

    if (!$id || !$nama || !$telp || empty($items) || $total <= 0) {
        jsonResponse(false, null, 'Data formulir pesanan tidak lengkap!', 400);
    }

    // Gunakan Transaksi PDO agar tersimpan utuh
    try {
        $pdo->beginTransaction();

        // 1. Simpan tabel utama pesanan
        $stmt = $pdo->prepare('INSERT INTO `pesanan` 
            (`id`, `nama_pemesan`, `telepon`, `metode_pengiriman`, `alamat_antar`, `jadwal`, `metode_pembayaran`, `nama_pengirim`, `catatan`, `status`, `total_tagihan`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        
        $stmt->execute([
            $id, $nama, $telp, $cara, $alamat, $jadwal, $bayar, $pengirimNama, $catatan, $status, $total
        ]);

        // 2. Simpan setiap item ke detail_pesanan
        $stmtDetail = $pdo->prepare('INSERT INTO `detail_pesanan` 
            (`pesanan_id`, `produk_id`, `nama_produk`, `harga_satuan`, `jumlah`, `subtotal`) 
            VALUES (?, ?, ?, ?, ?, ?)');

        foreach ($items as $it) {
            $stmtDetail->execute([
                $id,
                $it['id'] ?? null,
                $it['name'] ?? $it['nama_produk'] ?? 'Item',
                $it['price'] ?? $it['harga_satuan'] ?? 0,
                $it['qty'] ?? $it['jumlah'] ?? 1,
                $it['subtotal'] ?? (($it['price'] ?? 0) * ($it['qty'] ?? 1))
            ]);
        }

        $pdo->commit();
        jsonResponse(true, ['order_id' => $id], 'Pesanan berhasil disimpan di database!');
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(false, null, 'Gagal menyimpan pesanan: ' . $e->getMessage(), 500);
    }
}

// ========================================================
// 3. POST / ACTION: UPDATE STATUS PESANAN (ADMIN / USER)
// ========================================================
if ($method === 'POST' && $action === 'update_status') {
    $orderId = trim($input['order_id'] ?? '');
    $newStatus = trim($input['status'] ?? '');

    $allowedStatus = ['menunggu_bayar', 'terverifikasi', 'dimasak', 'siap', 'selesai', 'batal'];

    if (!$orderId || !in_array($newStatus, $allowedStatus)) {
        jsonResponse(false, null, 'ID pesanan atau status tidak valid!', 400);
    }

    $stmt = $pdo->prepare('UPDATE `pesanan` SET `status` = ? WHERE `id` = ?');
    $stmt->execute([$newStatus, $orderId]);

    jsonResponse(true, ['order_id' => $orderId, 'status' => $newStatus], 'Status pesanan berhasil diperbarui!');
}

jsonResponse(false, null, 'Metode atau aksi tidak diizinkan', 405);
