-- =====================================================
-- Script untuk membuat database dan tabel awal
-- Database: dummy_reminder
-- =====================================================

-- Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS dummy_reminder 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE dummy_reminder;

-- =====================================================
-- Tabel pelunasan (tabel utama untuk data klien)
-- =====================================================

CREATE TABLE IF NOT EXISTS pelunasan (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama_website VARCHAR(255) NOT NULL COMMENT 'Nama website/klien',
  nomor_telepon VARCHAR(20) NOT NULL COMMENT 'Nomor telepon klien',
  paket VARCHAR(100) NULL COMMENT 'Paket layanan (profesional, hemat, bisnis, expert)',
  harga_renewal DECIMAL(10,2) NULL COMMENT 'Harga perpanjangan',
  tahun_ke INT NULL COMMENT 'Tahun ke berapa',
  status VARCHAR(50) DEFAULT 'menunggu_pembayaran' COMMENT 'Status: menunggu_pembayaran, aktif, expired',
  is_completed TINYINT(1) DEFAULT 0 COMMENT 'Status selesai (0 atau 1)',
  
  -- Field baru untuk reminder bot
  due_date DATE NULL COMMENT 'Tanggal jatuh tempo pembayaran',
  last_reminder_sent DATETIME NULL COMMENT 'Waktu terakhir reminder dikirim',
  reminder_count INT DEFAULT 0 COMMENT 'Jumlah reminder yang sudah dikirim',
  last_reminder_type VARCHAR(10) NULL COMMENT 'Tipe reminder terakhir (H-7, H-3, H-1, H0, H+1, dll)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu record dibuat',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu terakhir diupdate',
  
  INDEX idx_nama_website (nama_website),
  INDEX idx_nomor_telepon (nomor_telepon),
  INDEX idx_due_date (due_date),
  INDEX idx_status (status),
  INDEX idx_status_due_date (status, due_date),
  INDEX idx_last_reminder_sent (last_reminder_sent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel data pelunasan klien';

-- =====================================================
-- Tabel client_responses (untuk menyimpan balasan klien)
-- =====================================================

CREATE TABLE IF NOT EXISTS client_responses (
  response_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID unik untuk setiap balasan',
  nama_website VARCHAR(255) NOT NULL COMMENT 'Nama website klien',
  nomor_telepon VARCHAR(20) NOT NULL COMMENT 'Nomor telepon klien yang membalas',
  message_text TEXT NOT NULL COMMENT 'Isi pesan balasan dari klien',
  response_type VARCHAR(50) NULL COMMENT 'Tipe balasan (konfirmasi_bayar, minta_perpanjangan, komplain, dll)',
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu balasan diterima',
  is_processed BOOLEAN DEFAULT FALSE COMMENT 'Apakah balasan sudah diproses/ditindaklanjuti',
  notes TEXT NULL COMMENT 'Catatan tambahan untuk balasan ini',
  
  INDEX idx_nama_website (nama_website),
  INDEX idx_nomor_telepon (nomor_telepon),
  INDEX idx_received_at (received_at),
  INDEX idx_is_processed (is_processed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk menyimpan balasan dari klien';

-- =====================================================
-- Tabel lid_mapping (mapping WhatsApp LID ke nomor telepon)
-- =====================================================

CREATE TABLE IF NOT EXISTS lid_mapping (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lid VARCHAR(50) NOT NULL UNIQUE COMMENT 'WhatsApp Linked ID',
  nomor_telepon VARCHAR(20) NOT NULL COMMENT 'Nomor telepon klien',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_lid (lid),
  INDEX idx_nomor_telepon (nomor_telepon)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mapping WhatsApp LID ke nomor telepon';

-- =====================================================
-- Insert data dummy untuk testing (OPTIONAL - jalankan manual jika diperlukan)
-- =====================================================

-- Uncomment untuk insert data dummy:
-- INSERT INTO pelunasan (nama_website, nomor_telepon, paket, harga_renewal, tahun_ke, status, due_date) VALUES
-- ('okosukses.com', '6287862070932', 'profesional', 1500000, 1, 'menunggu_pembayaran', DATE_ADD(CURDATE(), INTERVAL 7 DAY)),
-- ('asadesain.id', '6289648211444', 'hemat', 750000, 2, 'aktif', DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
-- ('kulinerhits.co', '6285842903319', 'bisnis', 1200000, 1, 'menunggu_pembayaran', DATE_ADD(CURDATE(), INTERVAL 3 DAY)),
-- ('travelceria.net', '6285701950701', 'expert', 2000000, 3, 'expired', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
-- ('pelanjamurah.store', '6289603166370', 'hemat', 500000, 1, 'menunggu_pembayaran', CURDATE());

SELECT 'Database and tables created successfully!' AS Status;
