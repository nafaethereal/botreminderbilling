-- =====================================================
-- Tabel lid_mapping (mapping WhatsApp LID ke nomor telepon)
-- Supaya bot bisa mengenali klien yang membalas pakai format LID
-- =====================================================

USE dummy_reminder;

CREATE TABLE IF NOT EXISTS lid_mapping (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lid VARCHAR(50) NOT NULL UNIQUE COMMENT 'WhatsApp Linked ID',
  nomor_telepon VARCHAR(20) NOT NULL COMMENT 'Nomor telepon klien',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_lid (lid),
  INDEX idx_nomor_telepon (nomor_telepon)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mapping WhatsApp LID ke nomor telepon';

SELECT 'Table lid_mapping created successfully!' AS Status;
