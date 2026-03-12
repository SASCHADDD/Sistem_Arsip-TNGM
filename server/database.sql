-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3307
-- Generation Time: Mar 12, 2026 at 07:52 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sistem_arsip_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `laporan_id` int(11) DEFAULT NULL,
  `action` enum('SUBMIT','UPDATE','APPROVE','REJECT') NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kategori`
--

CREATE TABLE `kategori` (
  `id` int(11) NOT NULL,
  `nama_kategori` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kategori`
--

INSERT INTO `kategori` (`id`, `nama_kategori`) VALUES
(1, 'Jenis Laporan A'),
(2, 'Jenis Laporan B');

-- --------------------------------------------------------

--
-- Table structure for table `laporan_eksternal`
--

CREATE TABLE `laporan_eksternal` (
  `id` int(11) NOT NULL,
  `jenis_pengirim` enum('mitra','eksternal','pengaju simaksi') NOT NULL,
  `nama_pengirim` varchar(150) NOT NULL,
  `instansi_pengirim` varchar(150) NOT NULL,
  `email_pengirim` varchar(150) NOT NULL,
  `nomor_pks` varchar(100) DEFAULT NULL,
  `judul_laporan` varchar(255) NOT NULL,
  `kategori_id` int(11) NOT NULL,
  `wilayah_id` int(11) NOT NULL,
  `resor_id` int(11) DEFAULT NULL,
  `tanggal_berakhir` date DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `file_dokumen` varchar(255) DEFAULT NULL,
  `file_lampiran` varchar(255) DEFAULT NULL,
  `file_output` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `catatan` text DEFAULT NULL,
  `diverifikasi_oleh` int(11) DEFAULT NULL,
  `diverifikasi_pada` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `laporan_internal`
--

CREATE TABLE `laporan_internal` (
  `id` int(11) NOT NULL,
  `judul` varchar(255) NOT NULL,
  `jenis_laporan` enum('A','B') NOT NULL,
  `tanggal_berakhir` date NOT NULL,
  `file_laporan` varchar(255) DEFAULT NULL,
  `foto_hardfile` varchar(255) DEFAULT NULL,
  `file_output` varchar(255) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `wilayah_id` int(11) NOT NULL,
  `resor_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `penilaian` enum('Baik','Cukup','Kurang') DEFAULT NULL,
  `catatan` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pengguna`
--

CREATE TABLE `pengguna` (
  `id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `instansi` varchar(255) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin_balai','admin_wilayah','kepala_wilayah','staff','eksternal','mitra') NOT NULL,
  `wilayah_id` int(11) DEFAULT NULL,
  `resor_id` int(11) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resor`
--

CREATE TABLE `resor` (
  `id` int(11) NOT NULL,
  `wilayah_id` int(11) NOT NULL,
  `nama_resor` varchar(100) NOT NULL,
  `kabupaten` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `resor`
--

INSERT INTO `resor` (`id`, `wilayah_id`, `nama_resor`, `kabupaten`) VALUES
(1, 1, 'Resor Cangkringan', 'Kabupaten Sleman'),
(2, 1, 'Resor Turi', 'Kabupaten Sleman'),
(3, 1, 'Resor Srumbung', 'Kabupaten Magelang'),
(4, 1, 'Resor Dukun', 'Kabupaten Magelang'),
(5, 2, 'Resor Selo', 'Kabupaten Boyolali'),
(6, 2, 'Resor Musuk Cepogo', 'Kabupaten Boyolali'),
(7, 2, 'Resor Kemalang', 'Kabupaten Klaten'),
(8, 3, 'Balai TNGM', '-');

-- --------------------------------------------------------

--
-- Table structure for table `wilayah`
--

CREATE TABLE `wilayah` (
  `id` int(11) NOT NULL,
  `nama_wilayah` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wilayah`
--

INSERT INTO `wilayah` (`id`, `nama_wilayah`) VALUES
(1, 'Wilayah 1'),
(2, 'Wilayah 2'),
(3, 'Balai TNGM');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_activity_user` (`user_id`),
  ADD KEY `fk_activity_laporan` (`laporan_id`);

--
-- Indexes for table `kategori`
--
ALTER TABLE `kategori`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `laporan_eksternal`
--
ALTER TABLE `laporan_eksternal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_laporan_kategori` (`kategori_id`),
  ADD KEY `fk_laporan_wilayah` (`wilayah_id`),
  ADD KEY `fk_laporan_resor` (`resor_id`),
  ADD KEY `fk_laporan_verifikator` (`diverifikasi_oleh`);

--
-- Indexes for table `laporan_internal`
--
ALTER TABLE `laporan_internal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wilayah_id` (`wilayah_id`),
  ADD KEY `resor_id` (`resor_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `pengguna`
--
ALTER TABLE `pengguna`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_pengguna_wilayah` (`wilayah_id`),
  ADD KEY `fk_pengguna_resor` (`resor_id`);

--
-- Indexes for table `resor`
--
ALTER TABLE `resor`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_resor_wilayah` (`wilayah_id`);

--
-- Indexes for table `wilayah`
--
ALTER TABLE `wilayah`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `kategori`
--
ALTER TABLE `kategori`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `laporan_eksternal`
--
ALTER TABLE `laporan_eksternal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `laporan_internal`
--
ALTER TABLE `laporan_internal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pengguna`
--
ALTER TABLE `pengguna`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `resor`
--
ALTER TABLE `resor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `wilayah`
--
ALTER TABLE `wilayah`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD CONSTRAINT `fk_activity_laporan` FOREIGN KEY (`laporan_id`) REFERENCES `laporan_internal` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_activity_user` FOREIGN KEY (`user_id`) REFERENCES `pengguna` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `laporan_eksternal`
--
ALTER TABLE `laporan_eksternal`
  ADD CONSTRAINT `fk_laporan_kategori` FOREIGN KEY (`kategori_id`) REFERENCES `kategori` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_laporan_resor` FOREIGN KEY (`resor_id`) REFERENCES `resor` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_laporan_verifikator` FOREIGN KEY (`diverifikasi_oleh`) REFERENCES `pengguna` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_laporan_wilayah` FOREIGN KEY (`wilayah_id`) REFERENCES `wilayah` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `laporan_internal`
--
ALTER TABLE `laporan_internal`
  ADD CONSTRAINT `laporan_internal_ibfk_1` FOREIGN KEY (`wilayah_id`) REFERENCES `wilayah` (`id`),
  ADD CONSTRAINT `laporan_internal_ibfk_2` FOREIGN KEY (`resor_id`) REFERENCES `resor` (`id`),
  ADD CONSTRAINT `laporan_internal_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `pengguna` (`id`);

--
-- Constraints for table `pengguna`
--
ALTER TABLE `pengguna`
  ADD CONSTRAINT `fk_pengguna_resor` FOREIGN KEY (`resor_id`) REFERENCES `resor` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pengguna_wilayah` FOREIGN KEY (`wilayah_id`) REFERENCES `wilayah` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `resor`
--
ALTER TABLE `resor`
  ADD CONSTRAINT `fk_resor_wilayah` FOREIGN KEY (`wilayah_id`) REFERENCES `wilayah` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
