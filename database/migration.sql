-- =====================================================
-- Migration Script for Reminder Bot Database
-- Database: dummy_reminder
-- Date: 2026-02-17
-- =====================================================

USE dummy_reminder;

-- =====================================================
-- 1. Tambah kolom baru ke tabel pelunasan
-- =====================================================

-- Tambah kolom due_date (tanggal jatuh tempo)
ALTER TABLE pelunasan 
ADD COLUMN IF NOT EXISTS due_date DATE NULL COMMENT 'Tanggal jatuh tempo pembayaran';

-- Tambah kolom last_reminder_sent (waktu terakhir reminder dikirim)
ALTER TABLE pelunasan 
ADD COLUMN IF NOT EXISTS last_reminder_sent DATETIME NULL COMMENT 'Waktu terakhir reminder dikirim';

-- Tambah kolom reminder_count (jumlah reminder yang sudah dikirim)
ALTER TABLE pelunasan 
ADD COLUMN IF NOT EXISTS reminder_count INT DEFAULT 0 COMMENT 'Jumlah reminder yang sudah dikirim';

-- Tambah kolom last_reminder_type (tipe reminder terakhir: H-7, H-3, dll)
ALTER TABLE pelunasan 
ADD COLUMN IF NOT EXISTS last_reminder_type VARCHAR(10) NULL COMMENT 'Tipe reminder terakhir (H-7, H-3, H-1, H0, H+1, dll)';

-- Tambah kolom created_at (timestamp record dibuat)
ALTER TABLE pelunasan 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu record dibuat';

-- Tambah kolom updated_at (timestamp terakhir diupdate)
ALTER TABLE pelunasan 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu terakhir diupdate';

-- =====================================================
-- 2. Buat tabel client_responses untuk menyimpan balasan klien
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
-- 3. Tambah index untuk optimasi query
-- =====================================================

-- Index untuk kolom due_date (sering digunakan untuk filter reminder)
ALTER TABLE pelunasan 
ADD INDEX IF NOT EXISTS idx_due_date (due_date);

-- Index untuk kolom status (sering digunakan untuk filter)
ALTER TABLE pelunasan 
ADD INDEX IF NOT EXISTS idx_status (status);

-- Index untuk kombinasi status dan due_date (untuk query reminder)
ALTER TABLE pelunasan 
ADD INDEX IF NOT EXISTS idx_status_due_date (status, due_date);

-- Index untuk last_reminder_sent
ALTER TABLE pelunasan 
ADD INDEX IF NOT EXISTS idx_last_reminder_sent (last_reminder_sent);

-- =====================================================
-- 4. Update data existing (optional - sesuaikan dengan kebutuhan)
-- =====================================================

-- Contoh: Set due_date berdasarkan tahun_ke (jika ada logika tertentu)
-- UPDATE pelunasan 
-- SET due_date = DATE_ADD(CURDATE(), INTERVAL 30 DAY)
-- WHERE due_date IS NULL AND status = 'menunggu_pembayaran';

-- =====================================================
-- Migration Complete
-- =====================================================

SELECT 'Migration completed successfully!' AS Status;
