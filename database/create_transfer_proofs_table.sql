CREATE TABLE IF NOT EXISTS client_transfer_proofs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomor_telepon VARCHAR(20) NOT NULL,
    nama_website VARCHAR(255),
    file_path VARCHAR(512) NOT NULL,
    caption TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_nomor_telepon (nomor_telepon),
    INDEX idx_nama_website (nama_website)
);
