<?php
require_once __DIR__ . '/koneksi.php';

$action = $_GET['action'] ?? '';
$input = getJsonInput();

// 1. CEK STATUS LOGIN
if ($action === 'check') {
    $isLogged = !empty($_SESSION['admin_logged']);
    jsonResponse(true, ['isLoggedIn' => $isLogged, 'username' => $_SESSION['admin_username'] ?? '']);
}

// 2. LOGIN ADMIN
if ($action === 'login') {
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');

    if (!$username || !$password) {
        jsonResponse(false, null, 'Username dan password wajib diisi!', 400);
    }

    $stmt = $pdo->prepare('SELECT * FROM `admin` WHERE `username` = ? LIMIT 1');
    $stmt->execute([$username]);
    $admin = $stmt->fetch();

    if ($admin) {
        // Cek password hash atau plain text fallback jika belum di-hash
        $valid = password_verify($password, $admin['password']) || ($password === $admin['password']);
        if ($valid) {
            $_SESSION['admin_logged'] = true;
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_username'] = $admin['username'];

            jsonResponse(true, [
                'username' => $admin['username']
            ], 'Login admin berhasil!');
        }
    }

    jsonResponse(false, null, 'Username atau password salah!', 401);
}

// 3. LOGOUT ADMIN
if ($action === 'logout') {
    unset($_SESSION['admin_logged'], $_SESSION['admin_id'], $_SESSION['admin_username']);
    session_destroy();
    jsonResponse(true, null, 'Berhasil keluar dari sesi admin.');
}

// 4. GANTI PASSWORD ADMIN
if ($action === 'change_password') {
    if (empty($_SESSION['admin_logged'])) {
        jsonResponse(false, null, 'Akses ditolak, silakan login admin.', 403);
    }

    $newPass = trim($input['new_password'] ?? '');
    if (strlen($newPass) < 4) {
        jsonResponse(false, null, 'Password minimal 4 karakter!', 400);
    }

    $hash = password_hash($newPass, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare('UPDATE `admin` SET `password` = ? WHERE `username` = ?');
    $stmt->execute([$hash, $_SESSION['admin_username']]);

    jsonResponse(true, null, 'Password admin berhasil diperbarui!');
}

jsonResponse(false, null, 'Aksi tidak dikenali', 400);
