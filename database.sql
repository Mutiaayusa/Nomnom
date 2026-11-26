-- ========================================================
-- NomNom Database Schema (MySQL / MariaDB)
-- Siap diimpor ke phpMyAdmin / XAMPP / Laragon / cPanel
-- Nama Database: nomnom_db
-- ========================================================

CREATE DATABASE IF NOT EXISTS `nomnom_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `nomnom_db`;

-- 1. TABEL ADMIN
DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Akun default admin: username = admin, password = admin123
-- Hash dibuat dengan password_hash('admin123', PASSWORD_BCRYPT)
INSERT INTO `admin` (`id`, `username`, `password`) VALUES
(1, 'admin', '$2y$10$wTqJ9iC4VvA6k7U5k2S9uOGKj6tWvG2dM7hX8a3u5yKq5Z3nB0b2.');

-- 2. TABEL KATALOG PRODUK & MENU
DROP TABLE IF EXISTS `produk`;
CREATE TABLE `produk` (
  `id` VARCHAR(50) PRIMARY KEY,
  `nama` VARCHAR(100) NOT NULL,
  `tag` VARCHAR(50) NOT NULL,
  `harga` INT NOT NULL,
  `kategori` ENUM('satuan', 'paket') DEFAULT 'satuan',
  `deskripsi` TEXT NOT NULL,
  `warna_tile` VARCHAR(50) DEFAULT 'var(--tile-k)',
  `art` VARCHAR(50) DEFAULT 'default',
  `bonus` VARCHAR(100) DEFAULT NULL,
  `stok_habis` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data default katalog menu
INSERT INTO `produk` (`id`, `nama`, `tag`, `harga`, `kategori`, `deskripsi`, `warna_tile`, `art`, `bonus`, `stok_habis`) VALUES
('kimbab', 'Kimbab', 'Gaya Korea', 15000, 'satuan', 'Nasi gulung berbalut nori dengan isian sayur dan lauk. Dipotong rapi, enak buat camilan atau pengganti makan siang.', 'var(--tile-k)', 'kimbab', NULL, 0),
('kebab', 'Kebab', 'Gaya Timur Tengah', 13000, 'satuan', 'Tortilla gulung berisi daging, sayur segar, dan saus. Mengenyangkan dan gampang dibawa ke mana saja.', 'var(--tile-b)', 'kebab', NULL, 0),
('sate', 'Sate Pusut', 'Khas Lombok', 10000, 'satuan', 'Adonan daging berbumbu dan kelapa parut yang dililit di tusuk lalu dipanggang. Gurih, harum bumbu.', 'var(--tile-s)', 'sate', NULL, 0),
('duo', 'Paket Hemat Duo', 'Kimbab + Kebab', 28000, 'paket', 'Satu kimbab dan satu kebab, plus bonus saus atau sambal tambahan.', 'var(--tile-p)', 'duo', 'Bonus saus', 0),
('komplit', 'Paket Hemat Komplit', 'Kimbab + Kebab + Sate Pusut', 38000, 'paket', 'Ketiga menu NomNom dalam satu paket, plus bonus saus atau sambal tambahan.', 'var(--tile-p)', 'komplit', 'Bonus saus', 0);

-- 3. TABEL PESANAN (TRANSAKSI)
DROP TABLE IF EXISTS `pesanan`;
CREATE TABLE `pesanan` (
  `id` VARCHAR(50) PRIMARY KEY,
  `nama_pemesan` VARCHAR(100) NOT NULL,
  `telepon` VARCHAR(30) NOT NULL,
  `metode_pengiriman` VARCHAR(50) NOT NULL,
  `alamat_antar` TEXT DEFAULT NULL,
  `jadwal` VARCHAR(100) DEFAULT NULL,
  `metode_pembayaran` VARCHAR(30) NOT NULL,
  `nama_pengirim` VARCHAR(100) DEFAULT NULL,
  `catatan` TEXT DEFAULT NULL,
  `status` VARCHAR(30) DEFAULT 'menunggu_bayar',
  `total_tagihan` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. TABEL DETAIL ITEM PESANAN
DROP TABLE IF EXISTS `detail_pesanan`;
CREATE TABLE `detail_pesanan` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pesanan_id` VARCHAR(50) NOT NULL,
  `produk_id` VARCHAR(50) DEFAULT NULL,
  `nama_produk` VARCHAR(100) NOT NULL,
  `harga_satuan` INT NOT NULL,
  `jumlah` INT NOT NULL,
  `subtotal` INT NOT NULL,
  CONSTRAINT `fk_pesanan` FOREIGN KEY (`pesanan_id`) REFERENCES `pesanan` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. TABEL PENGATURAN TOKO & PO
DROP TABLE IF EXISTS `pengaturan_toko`;
CREATE TABLE `pengaturan_toko` (
  `kunci` VARCHAR(50) PRIMARY KEY,
  `nilai` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Nilai default pengaturan toko
INSERT INTO `pengaturan_toko` (`kunci`, `nilai`) VALUES
('store_name', 'NomNom'),
('po_open', '1'),
('po_close', 'Jumat, 20.00 WITA'),
('pickup', 'Sabtu, 10.00 - 15.00'),
('contact_phone', '081234567890'),
('instagram', 'nomnom.mtr');
