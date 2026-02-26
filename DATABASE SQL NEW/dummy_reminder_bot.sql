-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 26, 2026 at 08:31 AM
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
(9, 'okosukses.com', '6287862070932', 'tunggu ya kak, nanti saya transfer', 'janji_bayar', '2026-02-20 02:39:30', 0, NULL),
(10, 'asadesain.id', '6289648211444', 'kenapa ya kak?', 'pertanyaan', '2026-02-20 02:40:09', 0, NULL),
(11, 'asadesain.id', '6289648211444', 'nanti saya tf', 'janji_bayar', '2026-02-20 02:42:18', 0, NULL),
(13, 'kulinerhits.co', '6285842903319', 'Sudah saya tf kemarin', 'konfirmasi_bayar', '2026-02-21 04:19:38', 0, NULL),
(14, 'tokobungamurah.co', '6282329500124', 'Sudah saya bayar', 'konfirmasi_bayar', '2026-02-21 04:25:53', 0, NULL),
(17, 'kulinerhits.co', '6285842903319', 'Kak jatuh tempo saya kapan?', 'pertanyaan', '2026-02-21 05:02:51', 0, NULL),
(18, 'kulinerhits.co', '6285842903319', 'Nanti saya kirim ya kak', 'janji_bayar', '2026-02-21 05:03:23', 0, NULL),
(19, 'kulinerhits.co', '6285842903319', 'Okey kak', 'konfirmasi', '2026-02-21 05:03:34', 0, NULL),
(20, 'kulinerhits.co', '6285842903319', 'Noted kak, terimakasih', 'konfirmasi', '2026-02-21 05:03:51', 0, NULL),
(21, 'UNKNOWN_167258944974903', '167258944974903', 'Iya', 'konfirmasi', '2026-02-21 06:27:15', 0, NULL),
(22, 'kulinerhits.co', '6285842903319', 'Okey ka', 'konfirmasi', '2026-02-23 01:43:50', 0, NULL),
(24, 'kulinerhits.co', '6285842903319', 'Saya udah ga minat langganan kak, ini terakhir', 'umum', '2026-02-23 01:44:35', 0, NULL),
(25, 'kulinerhits.co', '6285842903319', 'Stop langganan', 'stop_berlangganan', '2026-02-23 01:49:59', 0, NULL),
(26, 'kulinerhits.co', '6285842903319', 'Berhenti langganan', 'stop_berlangganan', '2026-02-23 01:51:38', 0, NULL),
(27, 'kulinerhits.co', '6285842903319', 'Saya ada kendala kak', 'umum', '2026-02-25 03:04:49', 0, NULL),
(28, 'kulinerhits.co', '6285842903319', 'Kak saya mau stop', 'stop_berlangganan', '2026-02-25 03:19:03', 0, NULL),
(29, 'kulinerhits.co', '6285842903319', 'Kak saya mau tanya', 'umum', '2026-02-25 03:21:31', 0, NULL),
(30, 'kulinerhits.co', '6285842903319', 'Kak saya nanti tf nya', 'janji_bayar', '2026-02-25 03:49:26', 0, NULL),
(31, 'kulinerhits.co', '6285842903319', 'kak apa ada paket lain?', 'pertanyaan', '2026-02-25 03:49:40', 0, NULL),
(32, 'kulinerhits.co', '6285842903319', 'kak saya ada kendala', 'umum', '2026-02-25 03:49:47', 0, NULL),
(33, 'kulinerhits.co', '6285842903319', 'Kak saya punya kendala nih', 'umum', '2026-02-25 03:50:01', 0, NULL),
(34, 'kulinerhits.co', '6285842903319', 'Kak apa masi ada', 'pertanyaan', '2026-02-25 04:07:35', 0, NULL),
(35, 'kulinerhits.co', '6285842903319', 'Halo kak', 'umum', '2026-02-25 04:37:52', 0, NULL),
(36, 'kulinerhits.co', '6285842903319', 'Tess', 'umum', '2026-02-25 04:40:43', 0, NULL),
(37, 'kulinerhits.co', '6285842903319', 'Kak?', 'pertanyaan', '2026-02-25 04:40:46', 0, NULL),
(38, 'kulinerhits.co', '6285842903319', 'Aku ada kendala', 'umum', '2026-02-25 04:40:52', 0, NULL),
(39, 'kulinerhits.co', '6285842903319', 'Saya ada kendala kak dalam pembayaran nya, kali saya bayar besok bisa ga kak', 'janji_bayar', '2026-02-25 04:43:43', 0, NULL),
(40, 'kulinerhits.co', '6285842903319', 'Saya ada kendala', 'umum', '2026-02-25 04:44:37', 0, NULL),
(41, 'kulinerhits.co', '6285842903319', 'Ada kendala nih kak', 'kendala_keluhan', '2026-02-25 04:47:01', 0, NULL),
(42, 'kulinerhits.co', '6285842903319', 'Kak saya ada error', 'kendala_keluhan', '2026-02-25 04:47:17', 0, NULL),
(43, 'kulinerhits.co', '6285842903319', 'Kak?', 'pertanyaan', '2026-02-25 04:48:13', 0, NULL),
(44, 'kulinerhits.co', '6285842903319', 'Tesss', 'umum', '2026-02-25 04:51:02', 0, NULL),
(45, 'kulinerhits.co', '6285842903319', 'Kak aku mau tanya', 'umum', '2026-02-25 04:51:25', 0, NULL),
(46, 'kulinerhits.co', '6285842903319', 'Kak mau perpanjang', 'minta_perpanjangan', '2026-02-25 04:51:33', 0, NULL),
(47, 'kulinerhits.co', '6285842903319', 'kakkkk', 'umum', '2026-02-25 04:52:18', 0, NULL),
(48, 'UNKNOWN_status@broadcast', 'status@broadcast', 'Aamiin ya rabbal alamin', 'umum', '2026-02-25 06:32:35', 0, NULL),
(49, 'kulinerhits.co', '6285842903319', 'kak saya ada keluham', 'umum', '2026-02-25 07:48:03', 0, NULL),
(50, 'kulinerhits.co', '6285842903319', 'Kk', 'umum', '2026-02-25 07:48:05', 0, NULL),
(51, 'kulinerhits.co', '6285842903319', 'Keluhab', 'umum', '2026-02-25 07:48:10', 0, NULL),
(52, 'kulinerhits.co', '6285842903319', 'Keluhan', 'kendala', '2026-02-25 07:48:13', 0, NULL),
(53, 'kulinerhits.co', '6285842903319', 'Kak', 'umum', '2026-02-25 07:54:10', 0, NULL),
(54, 'kulinerhits.co', '6285842903319', 'Kak?', 'pertanyaan', '2026-02-25 07:54:21', 0, NULL),
(55, 'kulinerhits.co', '6285842903319', 'Kak saya website nya error yrs', 'kendala', '2026-02-25 07:54:34', 0, NULL),
(56, 'kulinerhits.co', '6285842903319', 'I have a problem, can u help me?', 'pertanyaan', '2026-02-25 08:38:11', 0, NULL),
(57, 'kulinerhits.co', '6285842903319', 'I have problem', 'umum', '2026-02-25 08:38:20', 0, NULL),
(58, 'UNKNOWN_status@broadcast', 'status@broadcast', 'https://vt.tiktok.com/ZSmqtjm32/', 'konfirmasi', '2026-02-26 01:35:11', 0, NULL),
(59, 'UNKNOWN_status@broadcast', 'status@broadcast', 'Alham dulilah  ana panas  muda2han  Alloh meyukupi kebutuane  bayak per min ta an muda 2 Han aloh meyukupi', 'umum', '2026-02-26 04:07:21', 0, NULL);

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
(19, '6285842903319', 'kulinerhits.co', 'C:\\xampp\\htdocs\\botreminder\\transfers\\proof_6285842903319_1772074898655.jpg', '', '2026-02-26 03:01:38'),
(20, '6285842903319', 'kulinerhits.co', 'C:\\xampp\\htdocs\\botreminder\\transfers\\proof_6285842903319_1772074975034.jpg', '', '2026-02-26 03:02:55'),
(21, '6285842903319', 'kulinerhits.co', 'C:\\xampp\\htdocs\\botreminder\\transfers\\proof_6285842903319_1772075335278.jpg', '', '2026-02-26 03:08:55'),
(22, '6285842903319', 'kulinerhits.co', 'C:\\xampp\\htdocs\\botreminder\\transfers\\proof_6285842903319_1772077513657.jpg', '', '2026-02-26 03:45:13'),
(23, '6285842903319', 'kulinerhits.co', 'C:\\xampp\\htdocs\\botreminder\\transfers\\proof_6285842903319_1772077837885.jpg', '', '2026-02-26 03:50:37'),
(24, '6285842903319', 'kulinerhits.co', 'C:\\xampp\\htdocs\\botreminder\\transfers\\proof_6285842903319_1772077863431.jpg', '', '2026-02-26 03:51:03'),
(25, '6285842903319', 'kulinerhits.co', 'C:\\xampp\\htdocs\\botreminder\\transfers\\proof_6285842903319_1772077902217.jpg', 'Wodeco', '2026-02-26 03:51:42'),
(26, 'status@broadcast', 'UNKNOWN_status@broadcast', 'C:\\xampp\\htdocs\\botreminder\\transfers\\proof_status@broadcast_1772079337599.jpg', '', '2026-02-26 04:15:37'),
(27, '6285842903319', 'kulinerhits.co', 'C:\\xampp\\htdocs\\botreminder\\transfers\\proof_6285842903319_1772089740819.jpg', '', '2026-02-26 07:09:00'),
(28, '6285842903319', 'kulinerhits.co', 'C:\\xampp\\htdocs\\botreminder\\transfers\\proof_6285842903319_1772089768645.jpg', '', '2026-02-26 07:09:28'),
(29, '6285842903319', 'kulinerhits.co', 'C:\\xampp\\htdocs\\botreminder\\transfers\\proof_6285842903319_1772089779058.jpg', '', '2026-02-26 07:09:39'),
(30, '6285842903319', 'kulinerhits.co', 'C:\\xampp\\htdocs\\botreminder\\transfers\\proof_6285842903319_1772090148928.jpg', '', '2026-02-26 07:15:48'),
(31, '6285842903319', 'kulinerhits.co', 'C:\\xampp\\htdocs\\botreminder\\transfers\\proof_6285842903319_1772090598526.jpg', '', '2026-02-26 07:23:18');

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
(1, '6285842903319', 'kulinerhits.co', 'C:\\xampp\\htdocs\\botreminder\\transfers\\invalid\\invalid_6285842903319_1772090567908.jpg', '', '2026-02-26 07:22:47');

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
(4, 'selomarket.id', '6285228805366', 'hemat', 750000.00, 1, 'menunggu_pembayaran', 0, '2026-02-27', '2026-02-26 08:35:20', 3, 'H+1', '2026-02-21 04:15:49', '2026-02-26 01:35:20'),
(5, 'tokobungamurah.co', '6282329500124', 'profesional', 1500000.00, 1, 'menunggu_pembayaran', 0, '2026-03-03', NULL, 2, 'H-2', '2026-02-21 04:15:49', '2026-02-24 13:03:53');

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `client_responses`
--
ALTER TABLE `client_responses`
  MODIFY `response_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `client_transfer_proofs`
--
ALTER TABLE `client_transfer_proofs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `invalid_transfer_proofs`
--
ALTER TABLE `invalid_transfer_proofs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `lid_mapping`
--
ALTER TABLE `lid_mapping`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `pelunasan`
--
ALTER TABLE `pelunasan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
