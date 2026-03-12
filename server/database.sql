-- Database Schema with Indonesian Table Names

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Table structure for table `wilayah`
--

CREATE TABLE `wilayah` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_wilayah` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `resor`
--

CREATE TABLE `resor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `wilayah_id` int(11) NOT NULL,
  `nama_resor` varchar(100) NOT NULL,
  `kabupaten` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_resor_wilayah` (`wilayah_id`),
  CONSTRAINT `fk_resor_wilayah` FOREIGN KEY (`wilayah_id`) REFERENCES `wilayah` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `kategori`
--

CREATE TABLE `kategori` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_kategori` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `pengguna`
--

CREATE TABLE `pengguna` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('superadmin','admin','user') NOT NULL DEFAULT 'user',
  `wilayah_id` int(11) DEFAULT NULL,
  `resor_id` int(11) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_pengguna_wilayah` (`wilayah_id`),
  KEY `fk_pengguna_resor` (`resor_id`),
  CONSTRAINT `fk_pengguna_wilayah` FOREIGN KEY (`wilayah_id`) REFERENCES `wilayah` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pengguna_resor` FOREIGN KEY (`resor_id`) REFERENCES `resor` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `arsip`
--

CREATE TABLE `arsip` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kode_arsip` varchar(50) NOT NULL,
  `judul_arsip` varchar(255) NOT NULL,
  `kategori_id` int(11) NOT NULL,
  `wilayah_id` int(11) NOT NULL,
  `resor_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `created_by` int(11) NOT NULL,
  `status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode_arsip` (`kode_arsip`),
  KEY `fk_arsip_kategori` (`kategori_id`),
  KEY `fk_arsip_wilayah` (`wilayah_id`),
  KEY `fk_arsip_resor` (`resor_id`),
  KEY `fk_arsip_pengguna` (`created_by`),
  CONSTRAINT `fk_arsip_kategori` FOREIGN KEY (`kategori_id`) REFERENCES `kategori` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_arsip_resor` FOREIGN KEY (`resor_id`) REFERENCES `resor` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_arsip_pengguna` FOREIGN KEY (`created_by`) REFERENCES `pengguna` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_arsip_wilayah` FOREIGN KEY (`wilayah_id`) REFERENCES `wilayah` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `metadata_arsip`
--

CREATE TABLE `metadata_arsip` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `arsip_id` int(11) NOT NULL,
  `nama_field` varchar(100) NOT NULL,
  `nilai_field` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_metadata_arsip` (`arsip_id`),
  CONSTRAINT `fk_metadata_arsip` FOREIGN KEY (`arsip_id`) REFERENCES `arsip` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `laporan_eksternal`
--

CREATE TABLE `laporan_eksternal` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jenis_pengirim` enum('mitra','eksternal') NOT NULL,

  -- Data Pengirim
  `nama_pengirim` varchar(150) NOT NULL,
  `instansi_pengirim` varchar(150) NOT NULL,
  `email_pengirim` varchar(150) NOT NULL,
  `nomor_pks` varchar(100) DEFAULT NULL,

  -- Detail Laporan
  `judul_laporan` varchar(255) NOT NULL,
  `kategori_id` int(11) NOT NULL,
  `wilayah_id` int(11) NOT NULL,
  `resor_id` int(11) DEFAULT NULL,
  `tanggal_berakhir` date DEFAULT NULL,
  `keterangan` text,

  -- File
  `file_dokumen` varchar(255) NOT NULL,
  `file_lampiran` varchar(255) DEFAULT NULL,

  -- Status Review
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `diverifikasi_oleh` int(11) DEFAULT NULL,
  `diverifikasi_pada` datetime DEFAULT NULL,

  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),

  PRIMARY KEY (`id`),
  KEY `fk_laporan_kategori` (`kategori_id`),
  KEY `fk_laporan_wilayah` (`wilayah_id`),
  KEY `fk_laporan_resor` (`resor_id`),
  KEY `fk_laporan_verifikator` (`diverifikasi_oleh`),

  CONSTRAINT `fk_laporan_kategori` FOREIGN KEY (`kategori_id`) REFERENCES `kategori` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_laporan_wilayah` FOREIGN KEY (`wilayah_id`) REFERENCES `wilayah` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_laporan_resor` FOREIGN KEY (`resor_id`) REFERENCES `resor` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_laporan_verifikator` FOREIGN KEY (`diverifikasi_oleh`) REFERENCES `pengguna` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `laporan_internal`
--

CREATE TABLE `laporan_internal` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    
    `judul` VARCHAR(255) NOT NULL,
    `jenis_laporan` ENUM('A','B') NOT NULL,
    
    `tanggal_berakhir` DATE NOT NULL,
    
    `file_laporan` VARCHAR(255) NOT NULL,
    `foto_hardfile` VARCHAR(255) NOT NULL,
    `file_output` VARCHAR(255) DEFAULT NULL,
    
    `keterangan` TEXT NULL,
    
    `wilayah_id` INT NOT NULL,
    `resor_id` INT NOT NULL,
    
    `created_by` INT NOT NULL,
    
    `status` ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`wilayah_id`) REFERENCES `wilayah`(`id`),
    FOREIGN KEY (`resor_id`) REFERENCES `resor`(`id`),
    FOREIGN KEY (`created_by`) REFERENCES `pengguna`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `laporan_id` int(11) DEFAULT NULL,
  `action` enum('SUBMIT','UPDATE','APPROVE','REJECT') NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_activity_user` (`user_id`),
  KEY `fk_activity_laporan` (`laporan_id`),
  CONSTRAINT `fk_activity_user` FOREIGN KEY (`user_id`) REFERENCES `pengguna` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_activity_laporan` FOREIGN KEY (`laporan_id`) REFERENCES `laporan_internal` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;
