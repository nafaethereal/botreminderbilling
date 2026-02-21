-- =====================================================
-- Insert dummy data untuk testing
-- Database: dummy_reminder
-- Table: pelunasan
-- =====================================================

USE dummy_reminder;

INSERT INTO pelunasan (nama_website, nomor_telepon, paket, harga_renewal, tahun_ke, status, is_completed, due_date) VALUES
('okosukses.com', '6287862070932', 'profesional', 1500000, 1, 'menunggu_pembayaran', 0, DATE_ADD(CURDATE(), INTERVAL 7 DAY)),
('asadesain.id', '6289648211444', 'hemat', 750000, 2, 'aktif', 1, DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
('kulinerhits.co', '6285842903319', 'bisnis', 1200000, 1, 'menunggu_pembayaran', 0, DATE_ADD(CURDATE(), INTERVAL 3 DAY)),
('travelceria.net', '6285701950701', 'expert', 2000000, 3, 'expired', 0, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
('pelanjamurah.store', '6289603166370', 'hemat', 500000, 1, 'menunggu_pembayaran', 0, CURDATE());

SELECT 'Dummy data inserted successfully!' AS Status;
SELECT COUNT(*) AS total_records FROM pelunasan;
