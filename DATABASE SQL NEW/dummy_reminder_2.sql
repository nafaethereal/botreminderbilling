-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 27, 2026 at 08:11 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dummy_reminder`
--

-- --------------------------------------------------------

--
-- Table structure for table `client_responses`
--

CREATE TABLE `client_responses` (
  `response_id` int(11) NOT NULL,
  `nama_website` varchar(255) NOT NULL COMMENT 'Nama website klien',
  `nomor_telepon` varchar(20) NOT NULL COMMENT 'Nomor telepon klien yang membalas',
  `message_text` text NOT NULL COMMENT 'Isi pesan balasan dari klien',
  `response_type` varchar(50) DEFAULT NULL COMMENT 'Tipe balasan (konfirmasi_bayar, minta_perpanjangan, komplain, dll)',
  `received_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Waktu balasan diterima',
  `is_processed` tinyint(1) DEFAULT 0 COMMENT 'Apakah balasan sudah diproses/ditindaklanjuti',
  `notes` text DEFAULT NULL COMMENT 'Catatan tambahan untuk balasan ini'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk menyimpan balasan dari klien';

--
-- Dumping data for table `client_responses`
--

INSERT INTO `client_responses` (`response_id`, `nama_website`, `nomor_telepon`, `message_text`, `response_type`, `received_at`, `is_processed`, `notes`) VALUES
(64, 'kulinerhits.co', '6285842903319', 'Ada kendala', 'kendala', '2026-02-27 04:17:25', 0, NULL),
(65, 'kulinerhits.co', '6285842903319', 'Kak mau tanya', 'umum', '2026-02-27 04:18:18', 0, NULL),
(66, 'kulinerhits.co', '6285842903319', 'Kak saya ada pertanyaan', 'pertanyaan', '2026-02-27 04:21:52', 0, NULL),
(67, 'kulinerhits.co', '6285842903319', 'Kak', 'umum', '2026-02-27 04:22:44', 0, NULL),
(68, 'kulinerhits.co', '6285842903319', 'admin aku kurang brp ya', 'umum', '2026-02-27 06:04:10', 0, NULL),
(69, 'okosukses.com', '6287862070932', 'hy', 'umum', '2026-02-27 06:07:36', 0, NULL),
(70, 'okosukses.com', '6287862070932', 'helo', 'umum', '2026-02-27 06:23:27', 0, NULL),
(71, 'okosukses.com', '6287862070932', 'KOCAK', 'umum', '2026-02-27 06:24:19', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `client_transfer_proofs`
--

CREATE TABLE `client_transfer_proofs` (
  `id` int(11) NOT NULL,
  `nomor_telepon` varchar(20) NOT NULL,
  `nama_website` varchar(255) DEFAULT NULL,
  `file_path` varchar(512) NOT NULL,
  `caption` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `client_transfer_proofs`
--

INSERT INTO `client_transfer_proofs` (`id`, `nomor_telepon`, `nama_website`, `file_path`, `caption`, `created_at`) VALUES
(39, '6285842903319', 'kulinerhits.co', 'C:\\xampp\\htdocs\\botreminder\\transfers\\valid\\proof_6285842903319_1772165572939.jpg', '', '2026-02-27 04:12:52');

-- --------------------------------------------------------

--
-- Table structure for table `invalid_transfer_proofs`
--

CREATE TABLE `invalid_transfer_proofs` (
  `id` int(11) NOT NULL,
  `nomor_telepon` varchar(20) NOT NULL,
  `nama_website` varchar(255) DEFAULT NULL,
  `file_path` varchar(512) NOT NULL,
  `caption` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invalid_transfer_proofs`
--

INSERT INTO `invalid_transfer_proofs` (`id`, `nomor_telepon`, `nama_website`, `file_path`, `caption`, `created_at`) VALUES
(3, '6285842903319', 'kulinerhits.co', 'C:\\xampp\\htdocs\\botreminder\\transfers\\invalid\\invalid_6285842903319_1772162471757.jpg', 'Kak aku bayar ya', '2026-02-27 03:21:11'),
(4, '6285842903319', 'kulinerhits.co', 'C:\\xampp\\htdocs\\botreminder\\transfers\\invalid\\invalid_6285842903319_1772164257938.jpg', 'Saya mau bayar nih kak', '2026-02-27 03:50:57'),
(5, '6285842903319', 'kulinerhits.co', 'C:\\xampp\\htdocs\\botreminder\\transfers\\invalid\\invalid_6285842903319_1772164775575.jpg', '', '2026-02-27 03:59:35'),
(6, '6285842903319', 'kulinerhits.co', 'C:\\xampp\\htdocs\\botreminder\\transfers\\invalid\\invalid_6285842903319_1772164820196.jpg', '', '2026-02-27 04:00:20'),
(7, '6285842903319', 'kulinerhits.co', 'C:\\xampp\\htdocs\\botreminder\\transfers\\invalid\\invalid_6285842903319_1772165099619.jpg', '', '2026-02-27 04:04:59');

-- --------------------------------------------------------

--
-- Table structure for table `lid_mapping`
--

CREATE TABLE `lid_mapping` (
  `id` int(11) NOT NULL,
  `lid` varchar(50) NOT NULL COMMENT 'WhatsApp Linked ID',
  `nomor_telepon` varchar(20) NOT NULL COMMENT 'Nomor telepon klien',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mapping WhatsApp LID ke nomor telepon';

--
-- Dumping data for table `lid_mapping`
--

INSERT INTO `lid_mapping` (`id`, `lid`, `nomor_telepon`, `created_at`, `updated_at`) VALUES
(1, '147837170000022', '6285842903319', '2026-02-21 04:46:55', '2026-02-21 04:46:55'),
(2, '18172207993071', '6282329500124', '2026-02-21 04:56:14', '2026-02-21 04:56:14'),
(3, '181115130233030', '6289648211444', '2026-02-21 04:56:14', '2026-02-21 04:56:14'),
(4, '256689022451939', '6287862070932', '2026-02-21 04:56:14', '2026-02-21 04:56:14');

-- --------------------------------------------------------

--
-- Table structure for table `pelunasan`
--

CREATE TABLE `pelunasan` (
  `id` int(11) NOT NULL,
  `nama_website` varchar(255) NOT NULL,
  `nomor_telepon` varchar(20) NOT NULL,
  `paket` varchar(100) DEFAULT NULL,
  `harga_renewal` decimal(10,2) DEFAULT NULL,
  `tahun_ke` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'menunggu_pembayaran',
  `is_completed` tinyint(1) DEFAULT 0,
  `due_date` date DEFAULT NULL,
  `last_reminder_sent` datetime DEFAULT NULL,
  `reminder_count` int(11) DEFAULT 0,
  `last_reminder_type` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pelunasan`
--

INSERT INTO `pelunasan` (`id`, `nama_website`, `nomor_telepon`, `paket`, `harga_renewal`, `tahun_ke`, `status`, `is_completed`, `due_date`, `last_reminder_sent`, `reminder_count`, `last_reminder_type`, `created_at`, `updated_at`) VALUES
(1, 'okosukses.com', '6287862070932', 'profesional', 1500000.00, NULL, 'menunggu_pembayaran', 0, '2026-02-25', '2026-02-25 11:51:48', 8, 'H+0', '2026-02-18 11:09:32', '2026-02-25 04:51:48'),
(2, 'asadesain.id', '6289648211444', 'hemat', 750000.00, NULL, 'nonaktif', 0, '2026-02-21', NULL, 4, 'H-2', '2026-02-18 11:09:32', '2026-02-25 03:03:25'),
(3, 'kulinerhits.co', '6285842903319', 'bisnis', 1200000.00, 1, 'menunggu_pembayaran', 0, '2026-02-25', '2026-02-25 11:43:06', 4, 'H+0', '2026-02-21 04:15:49', '2026-02-25 04:43:06'),
(4, 'selomarket.id', '6285228805366', 'hemat', 750000.00, 1, 'menunggu_pembayaran', 0, '2026-02-27', '2026-02-27 10:14:36', 4, 'H+0', '2026-02-21 04:15:49', '2026-02-27 03:14:36'),
(5, 'tokobungamurah.co', '6282329500124', 'profesional', 1500000.00, 1, 'menunggu_pembayaran', 0, '2026-03-03', NULL, 2, 'H-2', '2026-02-21 04:15:49', '2026-02-24 13:03:53'),
(6, 'yusniastore.com', '6285710383098', 'hemat', 750000.00, NULL, 'menunggu_pembayaran', 0, '2026-02-27', '2026-02-27 13:49:36', 1, 'H+0', '2026-02-27 06:44:35', '2026-02-27 06:49:36');

-- --------------------------------------------------------

--
-- Table structure for table `unrelated_images`
--

CREATE TABLE `unrelated_images` (
  `id` int(11) NOT NULL,
  `nomor_telepon` varchar(20) NOT NULL,
  `nama_website` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `caption` text DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `unrelated_images`
--

INSERT INTO `unrelated_images` (`id`, `nomor_telepon`, `nama_website`, `file_path`, `caption`, `reason`, `created_at`) VALUES
(1, '6285842903319', 'kulinerhits.co', 'C:\\xampp\\htdocs\\botreminder\\transfers\\unrelated\\unrelated_6285842903319_1772165192355.jpg', '', 'Poster menu makanan', '2026-02-27 04:06:32');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `client_responses`
--
ALTER TABLE `client_responses`
  ADD PRIMARY KEY (`response_id`);

--
-- Indexes for table `client_transfer_proofs`
--
ALTER TABLE `client_transfer_proofs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_nomor_telepon` (`nomor_telepon`),
  ADD KEY `idx_nama_website` (`nama_website`);

--
-- Indexes for table `invalid_transfer_proofs`
--
ALTER TABLE `invalid_transfer_proofs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_nomor_telepon` (`nomor_telepon`),
  ADD KEY `idx_nama_website` (`nama_website`);

--
-- Indexes for table `lid_mapping`
--
ALTER TABLE `lid_mapping`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lid` (`lid`),
  ADD KEY `idx_lid` (`lid`),
  ADD KEY `idx_nomor_telepon` (`nomor_telepon`);

--
-- Indexes for table `pelunasan`
--
ALTER TABLE `pelunasan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_nama_website` (`nama_website`),
  ADD KEY `idx_nomor_telepon` (`nomor_telepon`),
  ADD KEY `idx_due_date` (`due_date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `unrelated_images`
--
ALTER TABLE `unrelated_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_nomor_telepon` (`nomor_telepon`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `client_responses`
--
ALTER TABLE `client_responses`
  MODIFY `response_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT for table `client_transfer_proofs`
--
ALTER TABLE `client_transfer_proofs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `invalid_transfer_proofs`
--
ALTER TABLE `invalid_transfer_proofs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `lid_mapping`
--
ALTER TABLE `lid_mapping`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `pelunasan`
--
ALTER TABLE `pelunasan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `unrelated_images`
--
ALTER TABLE `unrelated_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
