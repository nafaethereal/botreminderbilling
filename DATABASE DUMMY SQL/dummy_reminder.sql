-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 23, 2026 at 03:12 AM
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
(26, 'kulinerhits.co', '6285842903319', 'Berhenti langganan', 'stop_berlangganan', '2026-02-23 01:51:38', 0, NULL);

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
(1, 'okosukses.com', '6287862070932', 'profesional', 1500000.00, NULL, 'menunggu_pembayaran', 0, '2026-02-25', '2026-02-18 19:09:48', 1, 'H+7', '2026-02-18 11:09:32', '2026-02-18 12:09:48'),
(2, 'asadesain.id', '6289648211444', 'hemat', 750000.00, NULL, 'menunggu_pembayaran', 0, '2026-02-21', '2026-02-23 08:36:29', 4, 'H-2', '2026-02-18 11:09:32', '2026-02-23 01:36:29'),
(3, 'kulinerhits.co', '6285842903319', 'bisnis', 1200000.00, 1, 'menunggu_pembayaran', 0, '2026-02-21', '2026-02-23 08:36:38', 2, 'H-2', '2026-02-21 04:15:49', '2026-02-23 01:36:38'),
(4, 'selomarket.id', '6285228805366', 'hemat', 750000.00, 1, 'menunggu_pembayaran', 0, '2026-02-21', '2026-02-23 08:36:46', 2, 'H-2', '2026-02-21 04:15:49', '2026-02-23 01:36:46'),
(5, 'tokobungamurah.co', '6282329500124', 'profesional', 1500000.00, 1, 'menunggu_pembayaran', 0, '2026-02-21', '2026-02-23 08:36:55', 2, 'H-2', '2026-02-21 04:15:49', '2026-02-23 01:36:55');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `client_responses`
--
ALTER TABLE `client_responses`
  ADD PRIMARY KEY (`response_id`);

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
  MODIFY `response_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

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
