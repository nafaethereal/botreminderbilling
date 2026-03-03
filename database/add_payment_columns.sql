-- =====================================================
-- Migration: Add payment tracking columns to pelunasan
-- Run once against existing database
-- =====================================================

USE dummy_reminder;

-- Tambah kolom paid_amount dan remaining_amount ke tabel pelunasan
ALTER TABLE pelunasan
  ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) DEFAULT 0 COMMENT 'Jumlah yang sudah dibayar',
  ADD COLUMN IF NOT EXISTS remaining_amount DECIMAL(10,2) DEFAULT NULL COMMENT 'Sisa tagihan yang belum dibayar';

-- Buat tabel pending_confirmations
CREATE TABLE IF NOT EXISTS pending_confirmations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nomor_telepon_client VARCHAR(20) NOT NULL COMMENT 'Nomor telepon client yang mengirim transfer',
  nama_website VARCHAR(255) NOT NULL COMMENT 'Nama website/klien',
  jumlah_transfer DECIMAL(10,2) DEFAULT 0 COMMENT 'Nominal transfer yang dideteksi AI (0 jika tidak terdeteksi)',
  harga_renewal DECIMAL(10,2) DEFAULT 0 COMMENT 'Total tagihan client',
  is_valid TINYINT(1) DEFAULT 0 COMMENT 'Apakah bukti transfer valid menurut AI',
  awaiting_amount TINYINT(1) DEFAULT 0 COMMENT 'Bot menunggu admin mengetikkan nominal (jika AI gagal deteksi)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL COMMENT 'Konfirmasi hangus setelah waktu ini (24 jam)',
  INDEX idx_nomor (nomor_telepon_client),
  INDEX idx_nama_website (nama_website)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Konfirmasi pembayaran yang menunggu jawaban admin';

SELECT 'Migration completed successfully!' AS Status;
