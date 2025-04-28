-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 27 Apr 2025 pada 16.07
-- Versi server: 10.4.32-MariaDB-log
-- Versi PHP: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fuzzy_tomato_system`
--

DELIMITER $$
--
-- Prosedur
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `find_matching_rules` (IN `p_soil_moisture` VARCHAR(10), IN `p_air_temperature` VARCHAR(10), IN `p_light_intensity` VARCHAR(10), IN `p_humidity` VARCHAR(10))   BEGIN
    SELECT * FROM fuzzy_rules
    WHERE soil_moisture = p_soil_moisture
      AND air_temperature = p_air_temperature
      AND light_intensity = p_light_intensity
      AND humidity = p_humidity
      AND active = 1;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_system_statistics` ()   BEGIN
    -- Jumlah total aturan fuzzy
    SELECT COUNT(*) AS total_rules FROM fuzzy_rules;
    
    -- Jumlah tindakan kontrol per jenis
    SELECT 
        irrigation_duration, 
        COUNT(*) AS count 
    FROM 
        output_parameters 
    GROUP BY 
        irrigation_duration;
    
    SELECT 
        temperature_setting, 
        COUNT(*) AS count 
    FROM 
        output_parameters 
    GROUP BY 
        temperature_setting;
    
    SELECT 
        light_control, 
        COUNT(*) AS count 
    FROM 
        output_parameters 
    GROUP BY 
        light_control;
    
    -- Rata-rata nilai sensor selama 7 hari terakhir
    SELECT 
        AVG(soil_moisture_value) AS avg_soil_moisture,
        AVG(air_temperature_value) AS avg_temperature,
        AVG(light_intensity_value) AS avg_light,
        AVG(humidity_value) AS avg_humidity
    FROM 
        sensor_data
    WHERE 
        reading_time >= DATE_SUB(NOW(), INTERVAL 7 DAY);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `record_control_action` (IN `p_soil_moisture` VARCHAR(10), IN `p_air_temperature` VARCHAR(10), IN `p_light_intensity` VARCHAR(10), IN `p_humidity` VARCHAR(10), IN `p_irrigation_duration` VARCHAR(10), IN `p_temperature_setting` VARCHAR(15), IN `p_light_control` VARCHAR(10), IN `p_irrigation_duration_value` INT, IN `p_temperature_setting_value` FLOAT, IN `p_light_control_value` INT)   BEGIN
    DECLARE input_id INT;
    DECLARE output_id INT;
    
    -- Catat parameter input
    INSERT INTO input_parameters (soil_moisture, air_temperature, light_intensity, humidity)
    VALUES (p_soil_moisture, p_air_temperature, p_light_intensity, p_humidity);
    
    SET input_id = LAST_INSERT_ID();
    
    -- Catat parameter output
    INSERT INTO output_parameters (irrigation_duration, temperature_setting, light_control)
    VALUES (p_irrigation_duration, p_temperature_setting, p_light_control);
    
    SET output_id = LAST_INSERT_ID();
    
    -- Catat tindakan kontrol
    INSERT INTO control_actions (
        irrigation_duration_value,
        temperature_setting_value,
        light_control_value,
        input_parameters_id,
        output_parameters_id
    )
    VALUES (
        p_irrigation_duration_value,
        p_temperature_setting_value,
        p_light_control_value,
        input_id,
        output_id
    );
    
    -- Kembalikan ID tindakan kontrol yang baru ditambahkan
    SELECT LAST_INSERT_ID() AS control_action_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_rule_confidence` (IN `p_rule_id` INT, IN `p_confidence_change` FLOAT)   BEGIN
    DECLARE current_confidence INT;
    DECLARE new_confidence INT;
    
    -- Ambil tingkat kepercayaan saat ini
    SELECT confidence_level INTO current_confidence 
    FROM fuzzy_rules 
    WHERE id = p_rule_id;
    
    -- Hitung tingkat kepercayaan baru (batas 0-100)
    SET new_confidence = GREATEST(0, LEAST(100, current_confidence + p_confidence_change));
    
    -- Perbarui tingkat kepercayaan dan tambah hitungan adaptasi
    UPDATE fuzzy_rules 
    SET confidence_level = new_confidence,
        adaptations_count = adaptations_count + 1
    WHERE id = p_rule_id;
    
    -- Catat aktivitas pembelajaran
    INSERT INTO learning_log (activity, rule_id) 
    VALUES (CONCAT('Confidence updated: ', current_confidence, ' -> ', new_confidence), p_rule_id);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `active_fuzzy_rules`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `active_fuzzy_rules` (
`id` int(11)
,`soil_moisture` varchar(10)
,`air_temperature` varchar(10)
,`light_intensity` varchar(10)
,`humidity` varchar(10)
,`irrigation_duration` varchar(10)
,`temperature_setting` varchar(15)
,`light_control` varchar(10)
,`plant_stage` varchar(20)
,`confidence_level` int(11)
,`is_adaptive` tinyint(1)
,`created_at` timestamp
,`updated_at` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `adaptive_learning_stats`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `adaptive_learning_stats` (
`adaptive_rules_count` bigint(21)
,`avg_confidence` decimal(14,4)
,`learning_activities` bigint(21)
,`adjusted_rules_count` bigint(21)
,`last_learning_activity` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `adaptive_rules_confidence`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `adaptive_rules_confidence` (
`id` int(11)
,`soil_moisture` varchar(10)
,`air_temperature` varchar(10)
,`light_intensity` varchar(10)
,`humidity` varchar(10)
,`irrigation_duration` varchar(10)
,`temperature_setting` varchar(15)
,`light_control` varchar(10)
,`plant_stage` varchar(20)
,`confidence_level` int(11)
,`adaptations_count` int(11)
,`updated_at` timestamp
);

-- --------------------------------------------------------

--
-- Struktur dari tabel `control_actions`
--

CREATE TABLE `control_actions` (
  `id` int(11) NOT NULL,
  `irrigation_duration_value` int(11) NOT NULL COMMENT 'Nilai durasi irigasi (dalam menit)',
  `temperature_setting_value` float NOT NULL COMMENT 'Nilai pengaturan suhu (dalam °C)',
  `light_control_value` int(11) NOT NULL COMMENT 'Nilai kontrol pencahayaan (dalam %)',
  `action_time` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Waktu tindakan kontrol dilakukan',
  `input_parameters_id` int(11) DEFAULT NULL COMMENT 'ID parameter input yang terkait',
  `output_parameters_id` int(11) DEFAULT NULL COMMENT 'ID parameter output yang terkait'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Menyimpan log tindakan kontrol yang dilakukan';

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `daily_environment_stats`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `daily_environment_stats` (
`reading_date` date
,`avg_soil_moisture` double
,`min_soil_moisture` float
,`max_soil_moisture` float
,`avg_temperature` double
,`min_temperature` float
,`max_temperature` float
,`avg_light` double
,`min_light` float
,`max_light` float
,`avg_humidity` double
,`min_humidity` float
,`max_humidity` float
,`reading_count` bigint(21)
);

-- --------------------------------------------------------

--
-- Struktur dari tabel `fuzzy_rules`
--

CREATE TABLE `fuzzy_rules` (
  `id` int(11) NOT NULL,
  `soil_moisture` varchar(10) NOT NULL COMMENT 'Kelembaban tanah (kering, sedang, basah)',
  `air_temperature` varchar(10) NOT NULL COMMENT 'Suhu udara (dingin, sedang, panas)',
  `light_intensity` varchar(10) NOT NULL COMMENT 'Intensitas cahaya (rendah, sedang, tinggi)',
  `humidity` varchar(10) NOT NULL COMMENT 'Kelembaban udara (rendah, sedang, tinggi)',
  `irrigation_duration` varchar(10) NOT NULL COMMENT 'Durasi irigasi (tidak ada, singkat, sedang, lama)',
  `temperature_setting` varchar(15) NOT NULL COMMENT 'Pengaturan suhu (menurunkan, mempertahankan, menaikkan)',
  `light_control` varchar(10) NOT NULL COMMENT 'Kontrol pencahayaan (mati, redup, sedang, terang)',
  `plant_stage` varchar(20) DEFAULT NULL COMMENT 'Fase tanaman yang perlu aturan ini',
  `confidence_level` int(11) DEFAULT 50 COMMENT 'Tingkat kepercayaan aturan (0-100%)',
  `is_adaptive` tinyint(1) DEFAULT 0 COMMENT 'Apakah aturan dibuat oleh sistem adaptif',
  `adaptations_count` int(11) DEFAULT 0 COMMENT 'Jumlah adaptasi yang dilakukan',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Waktu pembuatan aturan',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Waktu terakhir update aturan',
  `active` tinyint(1) DEFAULT 1 COMMENT 'Status aktif aturan (1 = aktif, 0 = tidak aktif)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Menyimpan aturan fuzzy untuk sistem kontrol';

--
-- Dumping data untuk tabel `fuzzy_rules`
--

INSERT INTO `fuzzy_rules` (`id`, `soil_moisture`, `air_temperature`, `light_intensity`, `humidity`, `irrigation_duration`, `temperature_setting`, `light_control`, `plant_stage`, `confidence_level`, `is_adaptive`, `adaptations_count`, `created_at`, `updated_at`, `active`) VALUES
(1, 'sedang', 'sedang', 'sedang', 'sedang', 'sedang', 'mempertahankan', 'sedang', NULL, 50, 0, 0, '2025-04-26 19:53:22', '2025-04-26 19:53:22', 1),
(2, 'sedang', 'sedang', 'sedang', 'sedang', 'sedang', 'mempertahankan', 'sedang', NULL, 50, 0, 0, '2025-04-26 19:53:22', '2025-04-26 19:53:22', 1),
(3, 'sedang', 'sedang', 'sedang', 'sedang', 'sedang', 'mempertahankan', 'sedang', NULL, 50, 0, 0, '2025-04-26 19:53:36', '2025-04-26 19:53:36', 1),
(4, 'sedang', 'sedang', 'sedang', 'sedang', 'sedang', 'mempertahankan', 'sedang', NULL, 50, 0, 0, '2025-04-26 19:53:36', '2025-04-26 19:53:36', 1),
(5, 'sedang', 'panas', 'sedang', 'tinggi', 'singkat', 'mempertahankan', 'sedang', 'seedling', 50, 1, 0, '2025-04-26 21:13:25', '2025-04-26 21:13:25', 1),
(6, 'sedang', 'panas', 'sedang', 'sedang', 'singkat', 'mempertahankan', 'sedang', 'seedling', 50, 1, 0, '2025-04-26 21:27:38', '2025-04-26 21:27:38', 1),
(7, 'kering', 'panas', 'rendah', 'sedang', 'singkat', 'mempertahankan', 'sedang', 'vegetative', 50, 1, 0, '2025-04-26 21:27:43', '2025-04-26 21:27:43', 1),
(8, 'kering', 'panas', 'sedang', 'sedang', 'sedang', 'mempertahankan', 'mati', 'vegetative', 50, 1, 0, '2025-04-26 21:27:49', '2025-04-26 21:27:49', 1),
(9, 'kering', 'panas', 'tinggi', 'sedang', 'singkat', 'mempertahankan', 'mati', 'vegetative', 50, 1, 0, '2025-04-26 21:32:19', '2025-04-26 21:32:19', 1),
(10, 'kering', 'sedang', 'sedang', 'tinggi', 'lama', 'mempertahankan', 'sedang', NULL, 50, 0, 0, '2025-04-26 21:59:20', '2025-04-26 21:59:20', 1),
(11, 'kering', 'sedang', 'sedang', 'tinggi', 'lama', 'mempertahankan', 'sedang', NULL, 50, 0, 0, '2025-04-26 21:59:20', '2025-04-26 21:59:20', 1),
(12, 'kering', 'panas', 'tinggi', 'tinggi', 'sedang', 'mempertahankan', 'redup', 'seedling', 50, 1, 0, '2025-04-26 23:37:46', '2025-04-26 23:37:46', 1),
(13, 'kering', 'panas', 'rendah', 'tinggi', 'sedang', 'mempertahankan', 'terang', 'seedling', 50, 1, 0, '2025-04-26 23:37:51', '2025-04-26 23:37:51', 1),
(14, 'kering', 'sedang', 'rendah', 'tinggi', 'sedang', 'mempertahankan', 'sedang', 'vegetative', 50, 1, 0, '2025-04-27 03:40:22', '2025-04-27 03:40:22', 1),
(15, 'kering', 'sedang', 'sedang', 'sedang', 'singkat', 'mempertahankan', 'mati', 'vegetative', 50, 1, 0, '2025-04-27 03:40:37', '2025-04-27 03:40:37', 1),
(16, 'kering', 'panas', 'tinggi', 'rendah', 'lama', 'menurunkan', 'redup', NULL, 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(17, 'kering', 'panas', 'tinggi', 'sedang', 'lama', 'menurunkan', 'sedang', NULL, 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(18, 'kering', 'panas', 'sedang', 'rendah', 'lama', 'menurunkan', 'sedang', NULL, 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(19, 'kering', 'sedang', 'rendah', 'rendah', 'lama', 'mempertahankan', 'terang', NULL, 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(20, 'kering', 'dingin', 'rendah', 'rendah', 'sedang', 'menaikkan', 'terang', NULL, 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(21, 'sedang', 'panas', 'tinggi', 'rendah', 'sedang', 'menurunkan', 'redup', NULL, 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(22, 'sedang', 'sedang', 'sedang', 'sedang', 'sedang', 'mempertahankan', 'sedang', NULL, 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(23, 'sedang', 'dingin', 'rendah', 'tinggi', 'singkat', 'menaikkan', 'terang', NULL, 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(24, 'basah', 'panas', 'tinggi', 'sedang', 'tidak_ada', 'menurunkan', 'redup', NULL, 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(25, 'basah', 'sedang', 'sedang', 'tinggi', 'tidak_ada', 'mempertahankan', 'sedang', NULL, 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(26, 'kering', 'sedang', 'sedang', 'sedang', 'lama', 'mempertahankan', 'sedang', NULL, 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(27, 'sedang', 'panas', 'sedang', 'rendah', 'sedang', 'menurunkan', 'sedang', NULL, 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(28, 'basah', 'dingin', 'tinggi', 'rendah', 'tidak_ada', 'menaikkan', 'redup', NULL, 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(29, 'kering', 'dingin', 'sedang', 'tinggi', 'sedang', 'menaikkan', 'sedang', NULL, 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(30, 'sedang', 'sedang', 'tinggi', 'sedang', 'sedang', 'mempertahankan', 'redup', NULL, 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(31, 'basah', 'panas', 'rendah', 'rendah', 'tidak_ada', 'menurunkan', 'terang', NULL, 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(32, 'kering', 'sedang', 'tinggi', 'rendah', 'lama', 'mempertahankan', 'redup', NULL, 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(33, 'sedang', 'dingin', 'sedang', 'sedang', 'singkat', 'menaikkan', 'sedang', NULL, 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(34, 'basah', 'dingin', 'sedang', 'tinggi', 'tidak_ada', 'menaikkan', 'sedang', NULL, 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(35, 'kering', 'panas', 'rendah', 'tinggi', 'lama', 'menurunkan', 'sedang', NULL, 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(36, 'kering', 'sedang', 'rendah', 'sedang', 'lama', 'mempertahankan', 'sedang', 'seedling', 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(37, 'kering', 'dingin', 'sedang', 'sedang', 'sedang', 'menaikkan', 'sedang', 'seedling', 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(38, 'sedang', 'dingin', 'rendah', 'sedang', 'singkat', 'menaikkan', 'terang', 'seedling', 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(39, 'sedang', 'sedang', 'sedang', 'tinggi', 'singkat', 'mempertahankan', 'sedang', 'seedling', 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(40, 'basah', 'panas', 'tinggi', 'sedang', 'tidak_ada', 'menurunkan', 'redup', 'seedling', 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(41, 'kering', 'sedang', 'sedang', 'sedang', 'lama', 'mempertahankan', 'sedang', 'flowering', 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(42, 'kering', 'panas', 'tinggi', 'rendah', 'lama', 'menurunkan', 'redup', 'flowering', 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(43, 'sedang', 'sedang', 'tinggi', 'sedang', 'sedang', 'mempertahankan', 'sedang', 'flowering', 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(44, 'sedang', 'dingin', 'sedang', 'tinggi', 'sedang', 'menaikkan', 'sedang', 'flowering', 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(45, 'basah', 'panas', 'sedang', 'tinggi', 'tidak_ada', 'menurunkan', 'sedang', 'flowering', 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(46, 'kering', 'sedang', 'tinggi', 'sedang', 'lama', 'mempertahankan', 'sedang', 'fruiting', 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(47, 'kering', 'panas', 'sedang', 'sedang', 'lama', 'menurunkan', 'sedang', 'fruiting', 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(48, 'sedang', 'sedang', 'tinggi', 'sedang', 'sedang', 'mempertahankan', 'terang', 'fruiting', 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(49, 'sedang', 'dingin', 'sedang', 'tinggi', 'sedang', 'menaikkan', 'terang', 'fruiting', 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(50, 'basah', 'sedang', 'rendah', 'tinggi', 'tidak_ada', 'mempertahankan', 'terang', 'fruiting', 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(51, 'kering', 'sedang', 'sedang', 'sedang', 'singkat', 'mempertahankan', 'sedang', 'harvesting', 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(52, 'sedang', 'sedang', 'sedang', 'sedang', 'singkat', 'mempertahankan', 'sedang', 'harvesting', 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(53, 'sedang', 'panas', 'tinggi', 'rendah', 'singkat', 'menurunkan', 'redup', 'harvesting', 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(54, 'basah', 'sedang', 'sedang', 'sedang', 'tidak_ada', 'mempertahankan', 'sedang', 'harvesting', 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(55, 'basah', 'dingin', 'rendah', 'tinggi', 'tidak_ada', 'menaikkan', 'terang', 'harvesting', 50, 0, 0, '2025-04-27 03:46:40', '2025-04-27 03:46:40', 1),
(56, 'sedang', 'panas', 'rendah', 'sedang', 'singkat', 'mempertahankan', 'sedang', 'seedling', 50, 1, 0, '2025-04-27 03:49:02', '2025-04-27 03:49:02', 1),
(57, 'sedang', 'sedang', 'rendah', 'tinggi', 'singkat', 'mempertahankan', 'sedang', 'seedling', 50, 1, 0, '2025-04-27 05:46:37', '2025-04-27 05:46:37', 1),
(58, 'sedang', 'sedang', 'tinggi', 'tinggi', 'singkat', 'mempertahankan', 'mati', 'seedling', 50, 1, 0, '2025-04-27 05:46:47', '2025-04-27 05:46:47', 1);

-- --------------------------------------------------------

--
-- Struktur dari tabel `input_parameters`
--

CREATE TABLE `input_parameters` (
  `id` int(11) NOT NULL,
  `soil_moisture` varchar(10) NOT NULL COMMENT 'Kelembaban tanah (kering, sedang, basah)',
  `air_temperature` varchar(10) NOT NULL COMMENT 'Suhu udara (dingin, sedang, panas)',
  `light_intensity` varchar(10) NOT NULL COMMENT 'Intensitas cahaya (rendah, sedang, tinggi)',
  `humidity` varchar(10) NOT NULL COMMENT 'Kelembaban udara (rendah, sedang, tinggi)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Waktu pencatatan parameter'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Menyimpan parameter input sistem';

--
-- Dumping data untuk tabel `input_parameters`
--

INSERT INTO `input_parameters` (`id`, `soil_moisture`, `air_temperature`, `light_intensity`, `humidity`, `created_at`) VALUES
(1, 'basah', 'panas', 'sedang', 'tinggi', '2025-04-26 19:52:11'),
(2, 'basah', 'panas', 'sedang', 'tinggi', '2025-04-26 19:52:11'),
(3, 'sedang', 'panas', 'sedang', 'tinggi', '2025-04-26 19:52:22'),
(4, 'sedang', 'panas', 'sedang', 'tinggi', '2025-04-26 19:52:22'),
(5, 'kering', 'panas', 'sedang', 'tinggi', '2025-04-26 19:52:41'),
(6, 'kering', 'panas', 'sedang', 'tinggi', '2025-04-26 19:52:41'),
(7, 'sedang', 'panas', 'sedang', 'tinggi', '2025-04-26 19:52:47'),
(8, 'sedang', 'panas', 'sedang', 'tinggi', '2025-04-26 19:52:47'),
(9, 'sedang', 'panas', 'sedang', 'tinggi', '2025-04-26 19:53:01'),
(10, 'sedang', 'panas', 'sedang', 'tinggi', '2025-04-26 19:53:01'),
(11, 'sedang', 'panas', 'sedang', 'tinggi', '2025-04-26 19:53:22'),
(12, 'sedang', 'panas', 'sedang', 'tinggi', '2025-04-26 19:53:22'),
(13, 'sedang', 'panas', 'sedang', 'tinggi', '2025-04-26 19:53:36'),
(14, 'sedang', 'panas', 'sedang', 'tinggi', '2025-04-26 19:53:36'),
(15, 'sedang', 'sedang', 'tinggi', 'tinggi', '2025-04-26 21:59:20'),
(16, 'sedang', 'sedang', 'tinggi', 'tinggi', '2025-04-26 21:59:20');

--
-- Trigger `input_parameters`
--
DELIMITER $$
CREATE TRIGGER `validate_input_params` BEFORE INSERT ON `input_parameters` FOR EACH ROW BEGIN
    -- Validasi kelembaban tanah
    IF NEW.soil_moisture NOT IN ('kering', 'sedang', 'basah') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nilai kelembaban tanah tidak valid. Harus kering, sedang, atau basah.';
    END IF;
    
    -- Validasi suhu udara
    IF NEW.air_temperature NOT IN ('dingin', 'sedang', 'panas') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nilai suhu udara tidak valid. Harus dingin, sedang, atau panas.';
    END IF;
    
    -- Validasi intensitas cahaya
    IF NEW.light_intensity NOT IN ('rendah', 'sedang', 'tinggi') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nilai intensitas cahaya tidak valid. Harus rendah, sedang, atau tinggi.';
    END IF;
    
    -- Validasi kelembaban udara
    IF NEW.humidity NOT IN ('rendah', 'sedang', 'tinggi') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nilai kelembaban udara tidak valid. Harus rendah, sedang, atau tinggi.';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `latest_control_actions`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `latest_control_actions` (
`id` int(11)
,`irrigation_duration_value` int(11)
,`temperature_setting_value` float
,`light_control_value` int(11)
,`action_time` timestamp
,`soil_moisture` varchar(10)
,`air_temperature` varchar(10)
,`light_intensity` varchar(10)
,`humidity` varchar(10)
,`irrigation_duration` varchar(10)
,`temperature_setting` varchar(15)
,`light_control` varchar(10)
);

-- --------------------------------------------------------

--
-- Struktur dari tabel `learning_log`
--

CREATE TABLE `learning_log` (
  `id` int(11) NOT NULL,
  `activity` varchar(255) NOT NULL COMMENT 'Deskripsi aktivitas pembelajaran',
  `rule_id` int(11) DEFAULT NULL COMMENT 'ID aturan yang dimodifikasi',
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Waktu aktivitas'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Log aktivitas pembelajaran adaptif';

--
-- Dumping data untuk tabel `learning_log`
--

INSERT INTO `learning_log` (`id`, `activity`, `rule_id`, `timestamp`) VALUES
(1, 'Aturan baru dibuat', 5, '2025-04-26 21:13:25'),
(2, 'Aturan baru dibuat', 6, '2025-04-26 21:27:38'),
(3, 'Aturan baru dibuat', 7, '2025-04-26 21:27:43'),
(4, 'Aturan baru dibuat', 8, '2025-04-26 21:27:49'),
(5, 'Aturan baru dibuat', 9, '2025-04-26 21:32:19'),
(6, 'Aturan baru dibuat', 12, '2025-04-26 23:37:46'),
(7, 'Aturan baru dibuat', 13, '2025-04-26 23:37:51'),
(8, 'Aturan baru dibuat', 14, '2025-04-27 03:40:22'),
(9, 'Aturan baru dibuat', 15, '2025-04-27 03:40:37'),
(10, 'Aturan baru dibuat', 56, '2025-04-27 03:49:02'),
(11, 'Aturan baru dibuat', 57, '2025-04-27 05:46:37'),
(12, 'Aturan baru dibuat', 58, '2025-04-27 05:46:47');

-- --------------------------------------------------------

--
-- Struktur dari tabel `membership_functions`
--

CREATE TABLE `membership_functions` (
  `id` int(11) NOT NULL,
  `parameter` varchar(50) NOT NULL,
  `functions` longtext NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data untuk tabel `membership_functions`
--

INSERT INTO `membership_functions` (`id`, `parameter`, `functions`, `created_at`, `updated_at`) VALUES
(1, 'soil_moisture', '{\"kering\":{\"type\":\"trapezoid\",\"points\":[0,0,30,40]},\"sedang\":{\"type\":\"triangle\",\"points\":[30,50,70]},\"basah\":{\"type\":\"trapezoid\",\"points\":[60,70,100,100]}}', '2025-04-27 15:46:41', '2025-04-27 16:05:55');

-- --------------------------------------------------------

--
-- Struktur dari tabel `output_parameters`
--

CREATE TABLE `output_parameters` (
  `id` int(11) NOT NULL,
  `irrigation_duration` varchar(10) NOT NULL COMMENT 'Durasi irigasi (tidak ada, singkat, sedang, lama)',
  `temperature_setting` varchar(15) NOT NULL COMMENT 'Pengaturan suhu (menurunkan, mempertahankan, menaikkan)',
  `light_control` varchar(10) NOT NULL COMMENT 'Kontrol pencahayaan (mati, redup, sedang, terang)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Waktu pencatatan output'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Menyimpan hasil output sistem';

--
-- Dumping data untuk tabel `output_parameters`
--

INSERT INTO `output_parameters` (`id`, `irrigation_duration`, `temperature_setting`, `light_control`, `created_at`) VALUES
(1, 'Sedang', 'Mempertahankan', 'Sedang', '2025-04-26 19:53:22'),
(2, 'Sedang', 'Mempertahankan', 'Sedang', '2025-04-26 19:53:22'),
(3, 'Sedang', 'Mempertahankan', 'Sedang', '2025-04-26 19:53:36'),
(4, 'Sedang', 'Mempertahankan', 'Sedang', '2025-04-26 19:53:36'),
(5, 'Lama', 'Mempertahankan', 'Sedang', '2025-04-26 21:59:20'),
(6, 'Lama', 'Mempertahankan', 'Sedang', '2025-04-26 21:59:20');

--
-- Trigger `output_parameters`
--
DELIMITER $$
CREATE TRIGGER `validate_output_params` BEFORE INSERT ON `output_parameters` FOR EACH ROW BEGIN
    -- Validasi durasi irigasi
    IF NEW.irrigation_duration NOT IN ('tidak_ada', 'singkat', 'sedang', 'lama') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nilai durasi irigasi tidak valid. Harus tidak_ada, singkat, sedang, atau lama.';
    END IF;
    
    -- Validasi pengaturan suhu
    IF NEW.temperature_setting NOT IN ('menurunkan', 'mempertahankan', 'menaikkan') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nilai pengaturan suhu tidak valid. Harus menurunkan, mempertahankan, atau menaikkan.';
    END IF;
    
    -- Validasi kontrol pencahayaan
    IF NEW.light_control NOT IN ('mati', 'redup', 'sedang', 'terang') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nilai kontrol pencahayaan tidak valid. Harus mati, redup, sedang, atau terang.';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `plant_simulation`
--

CREATE TABLE `plant_simulation` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL COMMENT 'Nama tanaman',
  `variety` varchar(50) DEFAULT 'Roma' COMMENT 'Varietas tomat',
  `plant_stage` enum('seedling','vegetative','flowering','fruiting','harvesting') DEFAULT 'seedling' COMMENT 'Fase pertumbuhan tanaman',
  `plant_health` float DEFAULT 100 COMMENT 'Kesehatan tanaman (0-100%)',
  `growth_rate` float DEFAULT 1 COMMENT 'Tingkat pertumbuhan (faktor pengali)',
  `days_in_current_stage` int(11) DEFAULT 0 COMMENT 'Jumlah hari dalam fase saat ini',
  `soil_moisture` float DEFAULT 50 COMMENT 'Kelembaban tanah (%)',
  `air_temperature` float DEFAULT 25 COMMENT 'Suhu udara (°C)',
  `light_intensity` float DEFAULT 500 COMMENT 'Intensitas cahaya (lux)',
  `humidity` float DEFAULT 60 COMMENT 'Kelembaban udara (%)',
  `plant_height` float DEFAULT 5 COMMENT 'Tinggi tanaman (cm)',
  `fruit_count` int(11) DEFAULT 0 COMMENT 'Jumlah buah',
  `start_date` date DEFAULT curdate() COMMENT 'Tanggal mulai simulasi',
  `current_simulation_date` date DEFAULT curdate() COMMENT 'Tanggal saat ini dalam simulasi',
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'Status simulasi (aktif/tidak)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Waktu pembuatan simulasi',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Waktu terakhir update',
  `current_date` date DEFAULT curdate() COMMENT 'Tanggal saat ini dalam simulasi'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Menyimpan data simulasi pertumbuhan tanaman';

--
-- Dumping data untuk tabel `plant_simulation`
--

INSERT INTO `plant_simulation` (`id`, `name`, `variety`, `plant_stage`, `plant_health`, `growth_rate`, `days_in_current_stage`, `soil_moisture`, `air_temperature`, `light_intensity`, `humidity`, `plant_height`, `fruit_count`, `start_date`, `current_simulation_date`, `is_active`, `created_at`, `updated_at`, `current_date`) VALUES
(1, 'Tomat', 'Beef', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:08:53', '2025-04-26 21:09:20', '2025-04-26'),
(2, 'Tomat', 'Roma', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:09:29', '2025-04-26 21:09:34', '2025-04-26'),
(3, 'Tomat', 'Grape', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:09:34', '2025-04-26 21:09:56', '2025-04-26'),
(4, 'Tomat', 'Beef', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:09:56', '2025-04-26 21:11:00', '2025-04-26'),
(5, 'Tomat', 'Cherry', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:11:00', '2025-04-26 21:11:04', '2025-04-26'),
(6, 'Tomat', 'Roma', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:11:04', '2025-04-26 21:11:15', '2025-04-26'),
(7, 'Tomat', 'Grape', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:11:15', '2025-04-26 21:11:28', '2025-04-26'),
(8, 'Tomat', 'Grape', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:11:28', '2025-04-26 21:11:35', '2025-04-26'),
(9, 'Tomat', 'Cherry', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:11:35', '2025-04-26 21:11:39', '2025-04-26'),
(10, 'Tomat', 'Plum', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:11:39', '2025-04-26 21:11:46', '2025-04-26'),
(11, 'Tomat', 'Cherry', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:11:46', '2025-04-26 21:11:51', '2025-04-26'),
(12, 'Tomat', 'Roma', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:11:51', '2025-04-26 21:11:57', '2025-04-26'),
(13, 'Tomat', 'Beef', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:11:57', '2025-04-26 21:12:15', '2025-04-26'),
(14, 'Tomat', 'Beef', 'seedling', 100, 1.29967, 7, 28.1, 27.3, 576, 50, 11.5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:12:15', '2025-04-26 21:12:48', '2025-04-27'),
(15, 'Tomat', 'Plum', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:12:48', '2025-04-26 21:12:53', '2025-04-26'),
(16, 'Tomat', 'Roma', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:12:53', '2025-04-26 21:13:00', '2025-04-26'),
(17, 'Tomat', 'Plum', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:13:00', '2025-04-26 21:14:12', '2025-04-26'),
(18, 'Tomat', 'Beef', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:14:12', '2025-04-26 21:16:26', '2025-04-26'),
(19, 'Tomat', 'Grape', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:16:26', '2025-04-26 21:19:04', '2025-04-26'),
(20, 'Tomat', 'Roma', 'flowering', 100, 1.18113, 13, 0, 26.9, 306, 83, 81.9, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:19:04', '2025-04-26 21:25:37', '2025-06-13'),
(21, 'Tomat', 'Beef', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:25:37', '2025-04-26 21:26:49', '2025-04-26'),
(22, 'Tomat', 'Heirloom', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:26:49', '2025-04-26 21:26:52', '2025-04-26'),
(23, 'Tomat', 'Grape', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:26:52', '2025-04-26 21:27:10', '2025-04-26'),
(24, 'Tomat', 'Cherry', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:27:10', '2025-04-26 21:28:11', '2025-04-26'),
(25, 'Tomat', 'Heirloom', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:28:11', '2025-04-26 21:28:13', '2025-04-26'),
(26, 'Tomat', 'Heirloom', 'seedling', 100, 1.41858, 1, 46.4, 25.3, 334, 62, 6, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:28:13', '2025-04-26 21:31:32', '2025-04-27'),
(27, 'Tomat', 'Grape', 'flowering', 100, 1.286, 4, 0, 24.8, 553, 68, 67.3, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:31:32', '2025-04-26 21:54:29', '2025-06-03'),
(28, 'Tomat', 'Plum', 'fruiting', 0.00235, 0.0000233943, 54, 0, 25.6, 662, 23, 90, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 21:54:29', '2025-04-26 22:05:12', '2025-08-09'),
(29, 'Tomat', 'Plum', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 22:05:12', '2025-04-26 22:45:51', '2025-04-26'),
(30, 'Tomat', 'Heirloom', 'seedling', 100, 1.38242, 1, 47.6, 24.1, 121, 65, 6, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 22:45:51', '2025-04-26 22:49:50', '2025-04-27'),
(31, 'Tomat', 'Heirloom', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 22:49:50', '2025-04-26 22:54:19', '2025-04-26'),
(32, 'Tomat', 'Roma', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 22:54:19', '2025-04-26 22:56:14', '2025-04-26'),
(33, 'Tomat', 'Beef', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 22:56:14', '2025-04-26 22:56:15', '2025-04-26'),
(34, 'Tomat', 'Roma', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 22:56:15', '2025-04-26 22:56:15', '2025-04-26'),
(35, 'Tomat', 'Beef', 'seedling', 100, 1.36047, 7, 29.7, 26.3, 359, 58, 11.8, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 22:56:15', '2025-04-26 23:38:32', '2025-05-03'),
(36, 'Tomat', 'Beef', 'seedling', 100, 1.3583, 4, 38.6, 23.4, 607, 59, 8.9, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 23:07:47', '2025-04-26 23:23:39', '2025-04-30'),
(37, 'Tomat', 'Grape', 'seedling', 100, 1.3333, 4, 38.6, 26.8, 596, 52, 8.8, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 23:23:39', '2025-04-26 23:37:40', '2025-04-30'),
(38, 'Tomat', 'Heirloom', 'seedling', 100, 1.31163, 5, 34, 27.3, 121, 60, 9.7, 0, '2025-04-26', '2025-04-27', 0, '2025-04-26 23:37:40', '2025-04-27 00:50:34', '2025-05-01'),
(39, 'Tomat', 'Plum', 'vegetative', 98.4463, 0.831502, 17, 0, 29.3, 26, 55, 40.1, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 00:50:34', '2025-04-27 02:01:16', '2025-05-25'),
(40, 'Tomat', 'Plum', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 02:01:16', '2025-04-27 02:02:20', '2025-04-27'),
(41, 'Tomat', 'Cherry', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 02:02:20', '2025-04-27 02:02:34', '2025-04-27'),
(42, 'Tomat', 'Plum', 'seedling', 100, 1.29502, 6, 31.8, 24.9, 77, 53, 10.6, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 02:02:34', '2025-04-27 02:03:37', '2025-05-03'),
(43, 'Tomat', 'Beef', 'seedling', 100, 1.29118, 4, 37.1, 24.9, 6, 52, 8.7, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 02:03:37', '2025-04-27 02:03:59', '2025-05-01'),
(44, 'Tomat', 'Cherry', 'seedling', 100, 1.30348, 6, 33.7, 24.9, 48, 58, 10.6, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 02:03:59', '2025-04-27 02:20:46', '2025-05-03'),
(45, 'Tomat', 'Roma', 'seedling', 100, 1.35738, 1, 48, 24.7, 705, 57, 6, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 02:20:46', '2025-04-27 02:21:10', '2025-04-28'),
(46, 'Tomat', 'Grape', 'seedling', 100, 1.34325, 1, 48, 25.8, 50, 59, 6, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 02:21:10', '2025-04-27 03:39:48', '2025-04-28'),
(47, 'Tomat', 'Cherry', 'vegetative', 100, 1.15225, 4, 0.5, 30.4, 134, 48, 33.3, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 03:39:48', '2025-04-27 03:49:54', '2025-05-13'),
(48, 'Tomat', 'Roma', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 03:49:54', '2025-04-27 03:50:05', '2025-04-27'),
(49, 'Tomat', 'Heirloom', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 03:50:05', '2025-04-27 03:50:05', '2025-04-27'),
(50, 'Tomat', 'Heirloom', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 03:50:05', '2025-04-27 03:50:06', '2025-04-27'),
(51, 'Tomat', 'Plum', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 03:50:06', '2025-04-27 03:50:08', '2025-04-27'),
(52, 'Tomat', 'Grape', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 03:50:08', '2025-04-27 03:50:08', '2025-04-27'),
(53, 'Tomat', 'Cherry', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 03:50:08', '2025-04-27 03:50:09', '2025-04-27'),
(54, 'Tomat', 'Cherry', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 03:50:09', '2025-04-27 03:50:10', '2025-04-27'),
(55, 'Tomat', 'Grape', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 03:50:10', '2025-04-27 03:50:13', '2025-04-27'),
(56, 'Tomat', 'Grape', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 03:50:13', '2025-04-27 03:50:14', '2025-04-27'),
(57, 'Tomat', 'Roma', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 03:50:14', '2025-04-27 03:50:15', '2025-04-27'),
(58, 'Tomat', 'Beef', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 03:50:15', '2025-04-27 03:50:16', '2025-04-27'),
(59, 'Tomat', 'Roma', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 03:50:16', '2025-04-27 03:50:18', '2025-04-27'),
(60, 'Tomat', 'Plum', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 03:50:18', '2025-04-27 04:21:43', '2025-04-27'),
(61, 'Tomat', 'Plum', 'seedling', 100, 1, 0, 50, 25, 500, 60, 5, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 04:21:43', '2025-04-27 04:21:47', '2025-04-27'),
(62, 'Tomat', 'Cherry', 'vegetative', 100, 1.228, 21, 0, 29.4, 546, 32, 48.4, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 04:21:47', '2025-04-27 05:48:01', '2025-05-30'),
(63, 'Tomat', 'Grape', 'seedling', 100, 1.27462, 9, 20, 22.7, 629, 50, 13.2, 0, '2025-04-27', '2025-04-27', 0, '2025-04-27 05:48:01', '2025-04-27 12:56:09', '2025-05-06'),
(64, 'Tomat', 'Plum', 'vegetative', 100, 1.32537, 15, 48, 24.9, 204, 92, 44.2, 0, '2025-04-27', '2025-04-27', 1, '2025-04-27 12:56:09', '2025-04-27 16:06:25', '2025-05-24');

-- --------------------------------------------------------

--
-- Struktur dari tabel `sensor_data`
--

CREATE TABLE `sensor_data` (
  `id` int(11) NOT NULL,
  `soil_moisture_value` float NOT NULL COMMENT 'Nilai kelembaban tanah (0-100%)',
  `air_temperature_value` float NOT NULL COMMENT 'Nilai suhu udara (dalam °C)',
  `light_intensity_value` float NOT NULL COMMENT 'Nilai intensitas cahaya (dalam lux)',
  `humidity_value` float NOT NULL COMMENT 'Nilai kelembaban udara (0-100%)',
  `reading_time` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Waktu pembacaan sensor',
  `device_id` varchar(50) DEFAULT NULL COMMENT 'ID perangkat yang membaca sensor'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Menyimpan data pembacaan sensor secara berkala';

--
-- Trigger `sensor_data`
--
DELIMITER $$
CREATE TRIGGER `validate_sensor_data` BEFORE INSERT ON `sensor_data` FOR EACH ROW BEGIN
    -- Validasi nilai kelembaban tanah
    IF NEW.soil_moisture_value < 0 OR NEW.soil_moisture_value > 100 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nilai kelembaban tanah harus antara 0 dan 100%.';
    END IF;
    
    -- Validasi nilai suhu udara (kisaran yang masuk akal untuk tanaman)
    IF NEW.air_temperature_value < -10 OR NEW.air_temperature_value > 50 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nilai suhu udara harus antara -10 dan 50°C.';
    END IF;
    
    -- Validasi nilai intensitas cahaya
    IF NEW.light_intensity_value < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nilai intensitas cahaya tidak boleh negatif.';
    END IF;
    
    -- Validasi nilai kelembaban udara
    IF NEW.humidity_value < 0 OR NEW.humidity_value > 100 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nilai kelembaban udara harus antara 0 dan 100%.';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `simulation_log`
--

CREATE TABLE `simulation_log` (
  `id` int(11) NOT NULL,
  `simulation_id` int(11) NOT NULL COMMENT 'ID simulasi',
  `soil_moisture` float DEFAULT NULL COMMENT 'Kelembaban tanah (%)',
  `air_temperature` float DEFAULT NULL COMMENT 'Suhu udara (°C)',
  `light_intensity` float DEFAULT NULL COMMENT 'Intensitas cahaya (lux)',
  `humidity` float DEFAULT NULL COMMENT 'Kelembaban udara (%)',
  `irrigation_duration` float DEFAULT NULL COMMENT 'Durasi irigasi (menit)',
  `temperature_setting` float DEFAULT NULL COMMENT 'Pengaturan suhu (°C)',
  `light_control` float DEFAULT NULL COMMENT 'Kontrol cahaya (%)',
  `plant_stage` varchar(20) DEFAULT NULL COMMENT 'Fase pertumbuhan',
  `plant_health` float DEFAULT NULL COMMENT 'Kesehatan tanaman (%)',
  `growth_rate` float DEFAULT NULL COMMENT 'Tingkat pertumbuhan',
  `log_date` date DEFAULT NULL COMMENT 'Tanggal log'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Log simulasi pertumbuhan tanaman';

--
-- Dumping data untuk tabel `simulation_log`
--

INSERT INTO `simulation_log` (`id`, `simulation_id`, `soil_moisture`, `air_temperature`, `light_intensity`, `humidity`, `irrigation_duration`, `temperature_setting`, `light_control`, `plant_stage`, `plant_health`, `growth_rate`, `log_date`) VALUES
(1, 3, 46.7, 24.8, 797, 58, NULL, NULL, NULL, 'seedling', 100, 1.33185, '2025-04-27'),
(2, 3, 47.6, 24.5, 13, 60, NULL, NULL, NULL, 'seedling', 100, 1.34292, '2025-04-27'),
(3, 3, 47.7, 25.1, 36, 56, NULL, NULL, NULL, 'seedling', 100, 1.33722, '2025-04-27'),
(4, 3, 48, 25, 510, 65, NULL, NULL, NULL, 'seedling', 100, 1.42025, '2025-04-27'),
(5, 4, 47.3, 24.4, 70, 57, NULL, NULL, NULL, 'seedling', 100, 1.3509, '2025-04-27'),
(6, 4, 46.6, 24.7, 597, 63, NULL, NULL, NULL, 'seedling', 100, 1.39217, '2025-04-27'),
(7, 4, 46.3, 24.7, 666, 58, NULL, NULL, NULL, 'seedling', 100, 1.36402, '2025-04-27'),
(8, 4, 46.8, 25.9, 743, 59, NULL, NULL, NULL, 'seedling', 100, 1.34078, '2025-04-27'),
(9, 14, 47, 25.8, 560, 60, NULL, NULL, NULL, 'seedling', 100, 1.38975, '2025-04-27'),
(10, 14, 43.8, 25.5, 19, 58, NULL, NULL, NULL, 'seedling', 100, 1.32278, '2025-04-27'),
(11, 14, 40.7, 26.1, 704, 55, NULL, NULL, NULL, 'seedling', 100, 1.32298, '2025-04-27'),
(12, 14, 37.3, 26.3, 146, 56, NULL, NULL, NULL, 'seedling', 100, 1.32603, '2025-04-27'),
(13, 14, 34.7, 26.4, 569, 51, NULL, NULL, NULL, 'seedling', 100, 1.32885, '2025-04-27'),
(14, 14, 31.9, 27.2, 176, 49, NULL, NULL, NULL, 'seedling', 100, 1.2977, '2025-04-27'),
(15, 14, 28.1, 27.3, 576, 50, NULL, NULL, NULL, 'seedling', 100, 1.29967, '2025-04-27'),
(16, 15, 47.9, 24, 23, 64, NULL, NULL, NULL, 'seedling', 100, 1.35745, '2025-04-27'),
(17, 16, 46, 26, 583, 56, NULL, NULL, NULL, 'seedling', 100, 1.37175, '2025-04-27'),
(18, 17, 47.8, 24.2, 301, 58, NULL, NULL, NULL, 'seedling', 100, 1.4134, '2025-04-27'),
(31, 20, 48, 25.8, 168, 56, NULL, NULL, NULL, 'seedling', 100, 1.36675, '2025-04-27'),
(32, 20, 44.9, 26, 402, 60, NULL, NULL, NULL, 'seedling', 100, 1.4217, '2025-04-28'),
(33, 20, 42.2, 26.4, 197, 60, NULL, NULL, NULL, 'seedling', 100, 1.36085, '2025-04-29'),
(34, 20, 39.2, 25.4, 625, 62, NULL, NULL, NULL, 'seedling', 100, 1.3566, '2025-04-30'),
(35, 20, 35.4, 26.1, 13, 58, NULL, NULL, NULL, 'seedling', 100, 1.29233, '2025-05-01'),
(36, 20, 33.2, 26, 679, 58, NULL, NULL, NULL, 'seedling', 100, 1.31335, '2025-05-02'),
(37, 20, 29.8, 26.7, 442, 58, NULL, NULL, NULL, 'seedling', 100, 1.35802, '2025-05-03'),
(38, 20, 27.1, 26.9, 137, 53, NULL, NULL, NULL, 'seedling', 100, 1.28342, '2025-05-04'),
(39, 20, 24, 26.6, 150, 53, NULL, NULL, NULL, 'seedling', 100, 1.27925, '2025-05-05'),
(40, 20, 21.7, 26.9, 4, 56, NULL, NULL, NULL, 'seedling', 100, 1.23997, '2025-05-06'),
(41, 20, 19.5, 27.5, 166, 53, NULL, NULL, NULL, 'seedling', 100, 1.26412, '2025-05-07'),
(42, 20, 15.8, 27.1, 605, 54, NULL, NULL, NULL, 'vegetative', 100, 1.26478, '2025-05-08'),
(43, 20, 12.3, 26.5, 126, 52, NULL, NULL, NULL, 'vegetative', 100, 1.21802, '2025-05-09'),
(44, 20, 8.8, 25.9, 193, 57, NULL, NULL, NULL, 'vegetative', 100, 1.23802, '2025-05-10'),
(45, 20, 4.8, 25.7, 701, 54, NULL, NULL, NULL, 'vegetative', 100, 1.29778, '2025-05-11'),
(46, 20, 2.4, 26.4, 177, 58, NULL, NULL, NULL, 'vegetative', 100, 1.2137, '2025-05-12'),
(47, 20, 0, 25.6, 103, 62, NULL, NULL, NULL, 'vegetative', 100, 1.201, '2025-05-13'),
(48, 20, 0, 25.1, 103, 64, NULL, NULL, NULL, 'vegetative', 100, 1.20812, '2025-05-14'),
(49, 20, 0, 24.4, 563, 69, NULL, NULL, NULL, 'vegetative', 100, 1.314, '2025-05-15'),
(50, 20, 0, 24.4, 301, 74, NULL, NULL, NULL, 'vegetative', 100, 1.2385, '2025-05-16'),
(51, 20, 0, 25, 378, 69, NULL, NULL, NULL, 'vegetative', 100, 1.2715, '2025-05-17'),
(52, 20, 0, 26, 169, 68, NULL, NULL, NULL, 'vegetative', 100, 1.215, '2025-05-18'),
(53, 20, 0, 26.2, 46, 72, NULL, NULL, NULL, 'vegetative', 98.75, 0.864062, '2025-05-19'),
(54, 20, 0, 26.9, 9, 75, NULL, NULL, NULL, 'vegetative', 97.3037, 0.832312, '2025-05-20'),
(55, 20, 0, 26.1, 90, 79, NULL, NULL, NULL, 'vegetative', 96.03, 0.837981, '2025-05-21'),
(56, 20, 0, 27, 142, 74, NULL, NULL, NULL, 'vegetative', 97.93, 1.16537, '2025-05-22'),
(57, 20, 0, 27.2, 130, 75, NULL, NULL, NULL, 'vegetative', 99.7675, 1.181, '2025-05-23'),
(58, 20, 0, 27.1, 339, 76, NULL, NULL, NULL, 'vegetative', 100, 1.23462, '2025-05-24'),
(59, 20, 0, 26.5, 195, 80, NULL, NULL, NULL, 'vegetative', 100, 1.19438, '2025-05-25'),
(60, 20, 0, 26.2, 5, 83, NULL, NULL, NULL, 'vegetative', 98.4275, 0.829498, '2025-05-26'),
(61, 20, 0, 25.2, 519, 80, NULL, NULL, NULL, 'vegetative', 100, 1.2835, '2025-05-27'),
(62, 20, 0, 25.3, 797, 84, NULL, NULL, NULL, 'vegetative', 100, 1.24588, '2025-05-28'),
(63, 20, 0, 24.5, 186, 80, NULL, NULL, NULL, 'vegetative', 100, 1.19837, '2025-05-29'),
(64, 20, 0, 24.8, 459, 81, NULL, NULL, NULL, 'vegetative', 100, 1.2665, '2025-05-30'),
(65, 20, 0, 23.8, 706, 79, NULL, NULL, NULL, 'flowering', 100, 1.273, '2025-05-31'),
(66, 20, 0, 24.3, 685, 80, NULL, NULL, NULL, 'flowering', 100, 1.29813, '2025-06-01'),
(67, 20, 0, 24.2, 601, 76, NULL, NULL, NULL, 'flowering', 100, 1.28575, '2025-06-02'),
(68, 20, 0, 25, 488, 79, NULL, NULL, NULL, 'flowering', 100, 1.2465, '2025-06-03'),
(69, 20, 0, 24.5, 322, 78, NULL, NULL, NULL, 'flowering', 100, 1.21012, '2025-06-04'),
(70, 20, 0, 25.2, 752, 83, NULL, NULL, NULL, 'flowering', 100, 1.27725, '2025-06-05'),
(71, 20, 0, 26, 101, 84, NULL, NULL, NULL, 'flowering', 100, 1.1335, '2025-06-06'),
(72, 20, 0, 27, 31, 86, NULL, NULL, NULL, 'flowering', 100, 1.10575, '2025-06-07'),
(73, 20, 0, 26.7, 359, 82, NULL, NULL, NULL, 'flowering', 100, 1.19763, '2025-06-08'),
(74, 20, 0, 27.7, 688, 81, NULL, NULL, NULL, 'flowering', 100, 1.27562, '2025-06-09'),
(75, 20, 0, 27.7, 199, 84, NULL, NULL, NULL, 'flowering', 100, 1.14737, '2025-06-10'),
(76, 20, 0, 26.8, 37, 80, NULL, NULL, NULL, 'flowering', 100, 1.1205, '2025-06-11'),
(77, 20, 0, 27.3, 690, 81, NULL, NULL, NULL, 'flowering', 100, 1.27863, '2025-06-12'),
(78, 20, 0, 26.9, 306, 83, NULL, NULL, NULL, 'flowering', 100, 1.18113, '2025-06-13'),
(96, 26, 46.4, 25.3, 334, 62, NULL, NULL, NULL, 'seedling', 100, 1.41858, '2025-04-27'),
(97, 27, 47.8, 25.2, 489, 57, NULL, NULL, NULL, 'seedling', 100, 1.40765, '2025-04-27'),
(98, 27, 45.6, 24.9, 59, 53, NULL, NULL, NULL, 'seedling', 100, 1.33193, '2025-04-28'),
(99, 27, 43.5, 25, 464, 52, NULL, NULL, NULL, 'seedling', 100, 1.39225, '2025-04-29'),
(100, 27, 40.9, 25.9, 28, 53, NULL, NULL, NULL, 'seedling', 100, 1.30383, '2025-04-30'),
(101, 27, 38.8, 26.8, 34, 48, NULL, NULL, NULL, 'seedling', 100, 1.2834, '2025-05-01'),
(102, 27, 36.3, 26.5, 37, 45, NULL, NULL, NULL, 'seedling', 100, 1.27252, '2025-05-02'),
(103, 27, 33.4, 26.3, 139, 46, NULL, NULL, NULL, 'seedling', 100, 1.29258, '2025-05-03'),
(104, 27, 30.2, 25.5, 47, 45, NULL, NULL, NULL, 'seedling', 100, 1.26297, '2025-05-04'),
(105, 27, 26.9, 24.9, 170, 49, NULL, NULL, NULL, 'seedling', 100, 1.29558, '2025-05-05'),
(106, 27, 23.9, 25.9, 139, 50, NULL, NULL, NULL, 'seedling', 100, 1.27457, '2025-05-06'),
(107, 27, 20.4, 25.3, 375, 47, NULL, NULL, NULL, 'vegetative', 100, 1.32082, '2025-05-07'),
(108, 27, 17, 24.4, 354, 48, NULL, NULL, NULL, 'vegetative', 100, 1.28675, '2025-05-08'),
(109, 27, 15, 25.3, 761, 50, NULL, NULL, NULL, 'vegetative', 100, 1.30788, '2025-05-09'),
(110, 27, 12.1, 26, 470, 52, NULL, NULL, NULL, 'vegetative', 100, 1.30655, '2025-05-10'),
(111, 27, 8.6, 26.8, 658, 57, NULL, NULL, NULL, 'vegetative', 100, 1.31905, '2025-05-11'),
(112, 27, 6.3, 27.3, 128, 62, NULL, NULL, NULL, 'vegetative', 100, 1.21553, '2025-05-12'),
(113, 27, 3.3, 26.3, 613, 59, NULL, NULL, NULL, 'vegetative', 100, 1.32152, '2025-05-13'),
(114, 27, 0, 27, 61, 64, NULL, NULL, NULL, 'vegetative', 98.8575, 0.87563, '2025-05-14'),
(115, 27, 0, 27.9, 542, 62, NULL, NULL, NULL, 'vegetative', 100, 1.29638, '2025-05-15'),
(116, 27, 0, 27.2, 439, 58, NULL, NULL, NULL, 'vegetative', 100, 1.267, '2025-05-16'),
(117, 27, 0, 26.2, 448, 58, NULL, NULL, NULL, 'vegetative', 100, 1.2755, '2025-05-17'),
(118, 27, 0, 26.6, 94, 63, NULL, NULL, NULL, 'vegetative', 98.945, 0.885063, '2025-05-18'),
(119, 27, 0, 27.5, 178, 58, NULL, NULL, NULL, 'vegetative', 100, 1.19987, '2025-05-19'),
(120, 27, 0, 26.5, 174, 62, NULL, NULL, NULL, 'vegetative', 100, 1.21312, '2025-05-20'),
(121, 27, 0, 27, 195, 65, NULL, NULL, NULL, 'vegetative', 100, 1.22125, '2025-05-21'),
(122, 27, 0, 26.2, 778, 62, NULL, NULL, NULL, 'vegetative', 100, 1.277, '2025-05-22'),
(123, 27, 0, 25.9, 175, 66, NULL, NULL, NULL, 'vegetative', 100, 1.22113, '2025-05-23'),
(124, 27, 0, 26.3, 157, 64, NULL, NULL, NULL, 'vegetative', 100, 1.21413, '2025-05-24'),
(125, 27, 0, 26.4, 69, 66, NULL, NULL, NULL, 'vegetative', 98.915, 0.881827, '2025-05-25'),
(126, 27, 0, 26.7, 20, 64, NULL, NULL, NULL, 'vegetative', 97.6888, 0.857097, '2025-05-26'),
(127, 27, 0, 26.1, 34, 63, NULL, NULL, NULL, 'vegetative', 96.5151, 0.851866, '2025-05-27'),
(128, 27, 0, 25.2, 158, 65, NULL, NULL, NULL, 'vegetative', 98.7476, 1.20793, '2025-05-28'),
(129, 27, 0, 24.9, 542, 61, NULL, NULL, NULL, 'vegetative', 100, 1.31187, '2025-05-29'),
(130, 27, 0, 25.5, 153, 61, NULL, NULL, NULL, 'flowering', 100, 1.21212, '2025-05-30'),
(131, 27, 0, 25.7, 327, 63, NULL, NULL, NULL, 'flowering', 100, 1.23388, '2025-05-31'),
(132, 27, 0, 25, 761, 66, NULL, NULL, NULL, 'flowering', 100, 1.31025, '2025-06-01'),
(133, 27, 0, 25, 777, 65, NULL, NULL, NULL, 'flowering', 100, 1.30825, '2025-06-02'),
(134, 27, 0, 24.8, 553, 68, NULL, NULL, NULL, 'flowering', 100, 1.286, '2025-06-03'),
(135, 28, 47.8, 24.6, 484, 61, NULL, NULL, NULL, 'seedling', 100, 1.42065, '2025-04-27'),
(136, 28, 44.9, 24.1, 127, 58, NULL, NULL, NULL, 'seedling', 100, 1.36182, '2025-04-28'),
(137, 28, 42.2, 25, 9, 55, NULL, NULL, NULL, 'seedling', 100, 1.3126, '2025-04-29'),
(138, 28, 39.8, 24.9, 165, 59, NULL, NULL, NULL, 'seedling', 100, 1.35302, '2025-04-30'),
(139, 28, 37.3, 25.1, 426, 61, NULL, NULL, NULL, 'seedling', 100, 1.40052, '2025-05-01'),
(140, 28, 33.8, 24.3, 496, 63, NULL, NULL, NULL, 'seedling', 100, 1.38153, '2025-05-02'),
(141, 28, 31.8, 24.3, 652, 68, NULL, NULL, NULL, 'seedling', 100, 1.34652, '2025-05-03'),
(142, 28, 28.4, 23.4, 118, 67, NULL, NULL, NULL, 'seedling', 100, 1.32495, '2025-05-04'),
(143, 28, 25.9, 23.6, 683, 63, NULL, NULL, NULL, 'seedling', 100, 1.31045, '2025-05-05'),
(144, 28, 23.4, 23.5, 69, 59, NULL, NULL, NULL, 'seedling', 100, 1.28233, '2025-05-06'),
(145, 28, 19.4, 22.6, 391, 56, NULL, NULL, NULL, 'vegetative', 100, 1.3392, '2025-05-07'),
(146, 28, 16.1, 23.4, 155, 52, NULL, NULL, NULL, 'vegetative', 100, 1.23605, '2025-05-08'),
(147, 28, 13.4, 23.3, 768, 52, NULL, NULL, NULL, 'vegetative', 100, 1.29657, '2025-05-09'),
(148, 28, 11.4, 23.8, 28, 55, NULL, NULL, NULL, 'vegetative', 98.987, 0.889596, '2025-05-10'),
(149, 28, 7.7, 24.5, 129, 55, NULL, NULL, NULL, 'vegetative', 100, 1.21722, '2025-05-11'),
(150, 28, 5, 24.1, 56, 53, NULL, NULL, NULL, 'vegetative', 98.8438, 0.874149, '2025-05-12'),
(151, 28, 1.8, 23.8, 132, 56, NULL, NULL, NULL, 'vegetative', 100, 1.1979, '2025-05-13'),
(152, 28, 0, 24.4, 765, 53, NULL, NULL, NULL, 'vegetative', 100, 1.266, '2025-05-14'),
(153, 28, 0, 24, 166, 58, NULL, NULL, NULL, 'vegetative', 100, 1.20625, '2025-05-15'),
(154, 28, 0, 23.4, 3, 62, NULL, NULL, NULL, 'vegetative', 98.6975, 0.858422, '2025-05-16'),
(155, 28, 0, 23.2, 656, 63, NULL, NULL, NULL, 'vegetative', 100, 1.30575, '2025-05-17'),
(156, 28, 0, 23.7, 11, 62, NULL, NULL, NULL, 'vegetative', 98.7363, 0.862585, '2025-05-18'),
(157, 28, 0, 23.7, 85, 67, NULL, NULL, NULL, 'vegetative', 97.6775, 0.873359, '2025-05-19'),
(158, 28, 0, 23.7, 184, 70, NULL, NULL, NULL, 'vegetative', 99.8063, 1.21053, '2025-05-20'),
(159, 28, 0, 23.8, 777, 71, NULL, NULL, NULL, 'vegetative', 100, 1.27125, '2025-05-21'),
(160, 28, 0, 23.7, 613, 76, NULL, NULL, NULL, 'vegetative', 100, 1.30163, '2025-05-22'),
(161, 28, 0, 23.1, 178, 74, NULL, NULL, NULL, 'vegetative', 100, 1.19963, '2025-05-23'),
(162, 28, 0, 23.2, 378, 70, NULL, NULL, NULL, 'vegetative', 100, 1.25825, '2025-05-24'),
(163, 28, 0, 22.8, 339, 71, NULL, NULL, NULL, 'vegetative', 100, 1.244, '2025-05-25'),
(164, 28, 0, 22.1, 645, 66, NULL, NULL, NULL, 'vegetative', 100, 1.30362, '2025-05-26'),
(165, 28, 0, 21.5, 186, 61, NULL, NULL, NULL, 'vegetative', 100, 1.20162, '2025-05-27'),
(166, 28, 0, 20.5, 629, 65, NULL, NULL, NULL, 'vegetative', 100, 1.29963, '2025-05-28'),
(167, 28, 0, 20.4, 82, 68, NULL, NULL, NULL, 'flowering', 98.7075, 0.859496, '2025-05-29'),
(168, 28, 0, 21, 528, 69, NULL, NULL, NULL, 'flowering', 100, 1.2765, '2025-05-30'),
(169, 28, 0, 20, 462, 68, NULL, NULL, NULL, 'flowering', 100, 1.25575, '2025-05-31'),
(170, 28, 0, 20.7, 76, 63, NULL, NULL, NULL, 'flowering', 100, 1.17362, '2025-06-01'),
(171, 28, 0, 21.5, 57, 62, NULL, NULL, NULL, 'flowering', 100, 1.17587, '2025-06-02'),
(172, 28, 0, 21.3, 169, 66, NULL, NULL, NULL, 'flowering', 100, 1.19463, '2025-06-03'),
(173, 28, 0, 20.4, 122, 67, NULL, NULL, NULL, 'flowering', 100, 1.17525, '2025-06-04'),
(174, 28, 0, 21.2, 3, 62, NULL, NULL, NULL, 'flowering', 100, 1.1605, '2025-06-05'),
(175, 28, 0, 20.5, 155, 58, NULL, NULL, NULL, 'flowering', 100, 1.19413, '2025-06-06'),
(176, 28, 0, 20.1, 44, 54, NULL, NULL, NULL, 'flowering', 100, 1.15587, '2025-06-07'),
(177, 28, 0, 19.6, 54, 50, NULL, NULL, NULL, 'flowering', 100, 1.14725, '2025-06-08'),
(178, 28, 0, 20.5, 102, 54, NULL, NULL, NULL, 'flowering', 100, 1.17288, '2025-06-09'),
(179, 28, 0, 21.5, 14, 50, NULL, NULL, NULL, 'flowering', 100, 1.14912, '2025-06-10'),
(180, 28, 0, 22.5, 391, 45, NULL, NULL, NULL, 'flowering', 100, 1.23962, '2025-06-11'),
(181, 28, 0, 22.9, 161, 49, NULL, NULL, NULL, 'flowering', 100, 1.19263, '2025-06-12'),
(182, 28, 0, 23.9, 3, 52, NULL, NULL, NULL, 'flowering', 100, 1.15412, '2025-06-13'),
(183, 28, 0, 24.3, 128, 51, NULL, NULL, NULL, 'flowering', 100, 1.18087, '2025-06-14'),
(184, 28, 0, 24.9, 548, 48, NULL, NULL, NULL, 'flowering', 100, 1.27612, '2025-06-15'),
(185, 28, 0, 24.3, 97, 45, NULL, NULL, NULL, 'fruiting', 100, 1.16112, '2025-06-16'),
(186, 28, 0, 24.8, 172, 42, NULL, NULL, NULL, 'fruiting', 96.72, 0.649958, '2025-06-17'),
(187, 28, 0, 25.6, 36, 41, NULL, NULL, NULL, 'fruiting', 93.03, 0.587019, '2025-06-18'),
(188, 28, 0, 25.5, 145, 38, NULL, NULL, NULL, 'fruiting', 89.5587, 0.584707, '2025-06-19'),
(189, 28, 0, 26, 105, 36, NULL, NULL, NULL, 'fruiting', 85.9162, 0.546212, '2025-06-20'),
(190, 28, 0, 25.1, 145, 37, NULL, NULL, NULL, 'fruiting', 82.45, 0.538707, '2025-06-21'),
(191, 28, 0, 25.8, 370, 40, NULL, NULL, NULL, 'fruiting', 82.0624, 0.788825, '2025-06-22'),
(192, 28, 0, 25.5, 124, 37, NULL, NULL, NULL, 'fruiting', 78.5186, 0.506936, '2025-06-23'),
(193, 28, 0, 25.5, 605, 34, NULL, NULL, NULL, 'fruiting', 78.6174, 0.793937, '2025-06-24'),
(194, 28, 0, 25.1, 745, 33, NULL, NULL, NULL, 'fruiting', 78.5962, 0.784291, '2025-06-25'),
(195, 28, 0, 26.1, 349, 37, NULL, NULL, NULL, 'fruiting', 78.0775, 0.740272, '2025-06-26'),
(196, 28, 0, 25.6, 188, 39, NULL, NULL, NULL, 'fruiting', 74.7274, 0.496938, '2025-06-27'),
(197, 28, 0, 25.4, 691, 35, NULL, NULL, NULL, 'fruiting', 74.8624, 0.758731, '2025-06-28'),
(198, 28, 0, 25, 726, 31, NULL, NULL, NULL, 'fruiting', 74.8549, 0.747988, '2025-06-29'),
(199, 28, 0, 24.3, 533, 30, NULL, NULL, NULL, 'fruiting', 74.7686, 0.741238, '2025-06-30'),
(200, 28, 0, 23.4, 471, 29, NULL, NULL, NULL, 'fruiting', 74.5637, 0.730351, '2025-07-01'),
(201, 28, 0, 24.4, 160, 34, NULL, NULL, NULL, 'fruiting', 71.1187, 0.466183, '2025-07-02'),
(202, 28, 0, 23.8, 156, 34, NULL, NULL, NULL, 'fruiting', 67.7012, 0.445643, '2025-07-03'),
(203, 28, 0, 24.8, 703, 30, NULL, NULL, NULL, 'fruiting', 67.7437, 0.680316, '2025-07-04'),
(204, 28, 0, 24.7, 197, 29, NULL, NULL, NULL, 'fruiting', 64.2725, 0.419619, '2025-07-05'),
(205, 28, 0, 25.2, 82, 32, NULL, NULL, NULL, 'fruiting', 60.5424, 0.379601, '2025-07-06'),
(206, 28, 0, 24.6, 54, 36, NULL, NULL, NULL, 'fruiting', 56.86, 0.359213, '2025-07-07'),
(207, 28, 0, 24.8, 730, 35, NULL, NULL, NULL, 'fruiting', 56.935, 0.57362, '2025-07-08'),
(208, 28, 0, 25.6, 425, 31, NULL, NULL, NULL, 'fruiting', 56.5175, 0.541579, '2025-07-09'),
(209, 28, 0, 26, 498, 27, NULL, NULL, NULL, 'fruiting', 56.1775, 0.542675, '2025-07-10'),
(210, 28, 0, 26.4, 167, 24, NULL, NULL, NULL, 'fruiting', 52.425, 0.327525, '2025-07-11'),
(211, 28, 0, 26.5, 1, 29, NULL, NULL, NULL, 'fruiting', 48.3512, 0.286542, '2025-07-12'),
(212, 28, 0, 26.3, 737, 24, NULL, NULL, NULL, 'fruiting', 48.095, 0.468626, '2025-07-13'),
(213, 28, 0, 25.4, 175, 21, NULL, NULL, NULL, 'fruiting', 44.365, 0.278169, '2025-07-14'),
(214, 28, 0, 26.4, 156, 22, NULL, NULL, NULL, 'fruiting', 40.545, 0.250568, '2025-07-15'),
(215, 28, 0, 26, 113, 20, NULL, NULL, NULL, 'fruiting', 36.6025, 0.22172, '2025-07-16'),
(216, 28, 0, 25.5, 163, 21, NULL, NULL, NULL, 'fruiting', 32.8363, 0.204693, '2025-07-17'),
(217, 28, 0, 26.1, 556, 20, NULL, NULL, NULL, 'fruiting', 32.495, 0.313861, '2025-07-18'),
(218, 28, 0, 26.1, 29, 22, NULL, NULL, NULL, 'fruiting', 28.3762, 0.166888, '2025-07-19'),
(219, 28, 0, 25.6, 701, 20, NULL, NULL, NULL, 'fruiting', 28.1737, 0.276032, '2025-07-20'),
(220, 28, 0, 25, 322, 20, NULL, NULL, NULL, 'fruiting', 27.3162, 0.249738, '2025-07-21'),
(221, 28, 0, 24.1, 393, 20, NULL, NULL, NULL, 'fruiting', 26.6924, 0.250275, '2025-07-22'),
(222, 28, 0, 23.6, 329, 20, NULL, NULL, NULL, 'fruiting', 25.9399, 0.239879, '2025-07-23'),
(223, 28, 0, 23, 111, 20, NULL, NULL, NULL, 'fruiting', 22.1799, 0.138403, '2025-07-24'),
(224, 28, 0, 23.7, 174, 21, NULL, NULL, NULL, 'fruiting', 18.5536, 0.118256, '2025-07-25'),
(225, 28, 0, 23.7, 505, 21, NULL, NULL, NULL, 'fruiting', 18.2549, 0.177095, '2025-07-26'),
(226, 28, 0, 24.5, 53, 26, NULL, NULL, NULL, 'fruiting', 14.3761, 0.0879997, '2025-07-27'),
(227, 28, 0, 24.8, 176, 24, NULL, NULL, NULL, 'fruiting', 10.7461, 0.0684527, '2025-07-28'),
(228, 28, 0, 24, 436, 21, NULL, NULL, NULL, 'fruiting', 10.2561, 0.0975355, '2025-07-29'),
(229, 28, 0, 23.6, 667, 20, NULL, NULL, NULL, 'fruiting', 10.2636, 0.102713, '2025-07-30'),
(230, 28, 0, 23.7, 133, 20, NULL, NULL, NULL, 'fruiting', 6.51485, 0.040726, '2025-07-31'),
(231, 28, 0, 24.3, 199, 21, NULL, NULL, NULL, 'fruiting', 2.9136, 0.0186434, '2025-08-01'),
(232, 28, 0, 23.9, 435, 20, NULL, NULL, NULL, 'fruiting', 2.40735, 0.0228548, '2025-08-02'),
(233, 28, 0, 23.2, 405, 20, NULL, NULL, NULL, 'fruiting', 5.97735, 0.0565607, '2025-08-01'),
(234, 28, 0, 23.7, 55, 20, NULL, NULL, NULL, 'fruiting', 2.0336, 0.012316, '2025-08-02'),
(235, 28, 0, 23.8, 557, 20, NULL, NULL, NULL, 'fruiting', 6.31985, 0.0619661, '2025-08-01'),
(236, 28, 0, 24, 82, 25, NULL, NULL, NULL, 'fruiting', 2.52485, 0.0156667, '2025-08-02'),
(237, 28, 0, 24.6, 487, 26, NULL, NULL, NULL, 'fruiting', 2.22485, 0.021581, '2025-08-03'),
(238, 28, 0, 24.7, 302, 30, NULL, NULL, NULL, 'fruiting', 1.5361, 0.014303, '2025-08-04'),
(239, 28, 0, 25.6, 338, 30, NULL, NULL, NULL, 'fruiting', 0.8811, 0.00823388, '2025-08-05'),
(240, 28, 0, 24.3, 437, 27, NULL, NULL, NULL, 'fruiting', 1.8386, 0.0176758, '2025-08-04'),
(241, 28, 0, 25.1, 412, 28, NULL, NULL, NULL, 'fruiting', 1.35985, 0.0129475, '2025-08-05'),
(242, 28, 0, 25.5, 516, 30, NULL, NULL, NULL, 'fruiting', 2.0211, 0.0197992, '2025-08-04'),
(243, 28, 0, 24.8, 577, 25, NULL, NULL, NULL, 'fruiting', 2.11735, 0.0209459, '2025-08-04'),
(244, 28, 0, 25.5, 300, 22, NULL, NULL, NULL, 'fruiting', 1.2136, 0.0110392, '2025-08-05'),
(245, 28, 0, 25.1, 367, 27, NULL, NULL, NULL, 'fruiting', 0.60235, 0.00565531, '2025-08-06'),
(246, 28, 0, 25.7, 539, 22, NULL, NULL, NULL, 'fruiting', 0.2836, 0.0027456, '2025-08-07'),
(247, 28, 0, 25.1, 727, 20, NULL, NULL, NULL, 'fruiting', 0.04735, 0.000462314, '2025-08-08'),
(248, 28, 0, 25.6, 662, 23, NULL, NULL, NULL, 'fruiting', 0.00235, 0.0000233943, '2025-08-09'),
(369, 30, 47.6, 24.1, 121, 65, NULL, NULL, NULL, 'seedling', 100, 1.38242, '2025-04-27'),
(372, 36, 47.6, 25.9, 45, 55, NULL, NULL, NULL, 'seedling', 100, 1.33218, '2025-04-27'),
(373, 36, 45, 25.1, 375, 57, NULL, NULL, NULL, 'seedling', 100, 1.41587, '2025-04-28'),
(374, 36, 42.5, 24.3, 768, 60, NULL, NULL, NULL, 'seedling', 100, 1.33362, '2025-04-29'),
(375, 36, 38.6, 23.4, 607, 59, NULL, NULL, NULL, 'seedling', 100, 1.3583, '2025-04-30'),
(432, 37, 47.3, 25.3, 798, 56, NULL, NULL, NULL, 'seedling', 100, 1.32627, '2025-04-27'),
(433, 37, 44.8, 25.8, 189, 55, NULL, NULL, NULL, 'seedling', 100, 1.3604, '2025-04-28'),
(434, 37, 41.8, 26.4, 718, 57, NULL, NULL, NULL, 'seedling', 100, 1.3249, '2025-04-29'),
(435, 37, 38.6, 26.8, 596, 52, NULL, NULL, NULL, 'seedling', 100, 1.3333, '2025-04-30'),
(445, 35, 48, 25.2, 598, 60, NULL, NULL, NULL, 'seedling', 100, 1.387, '2025-04-27'),
(446, 35, 45.5, 25.7, 52, 64, NULL, NULL, NULL, 'seedling', 100, 1.34687, '2025-04-28'),
(447, 35, 42, 25.8, 86, 66, NULL, NULL, NULL, 'seedling', 100, 1.34825, '2025-04-29'),
(448, 35, 38.8, 24.9, 160, 66, NULL, NULL, NULL, 'seedling', 100, 1.36277, '2025-04-30'),
(449, 35, 36, 25.2, 141, 63, NULL, NULL, NULL, 'seedling', 100, 1.34175, '2025-05-01'),
(450, 35, 32.5, 26, 99, 61, NULL, NULL, NULL, 'seedling', 100, 1.31175, '2025-05-02'),
(451, 35, 29.7, 26.3, 359, 58, NULL, NULL, NULL, 'seedling', 100, 1.36047, '2025-05-03'),
(517, 38, 46.3, 25.5, 175, 61, NULL, NULL, NULL, 'seedling', 100, 1.37528, '2025-04-27'),
(518, 38, 43.5, 25.9, 360, 60, NULL, NULL, NULL, 'seedling', 100, 1.40863, '2025-04-28'),
(519, 38, 39.9, 26.6, 684, 65, NULL, NULL, NULL, 'seedling', 100, 1.34245, '2025-04-29'),
(520, 38, 36.4, 27.2, 598, 61, NULL, NULL, NULL, 'seedling', 100, 1.3417, '2025-04-30'),
(521, 38, 34, 27.3, 121, 60, NULL, NULL, NULL, 'seedling', 100, 1.31163, '2025-05-01'),
(571, 39, 47.5, 24.4, 407, 59, NULL, NULL, NULL, 'seedling', 100, 1.43625, '2025-04-28'),
(572, 39, 44.4, 23.6, 565, 56, NULL, NULL, NULL, 'seedling', 100, 1.38145, '2025-04-29'),
(573, 39, 42.2, 24.5, 685, 59, NULL, NULL, NULL, 'seedling', 100, 1.35022, '2025-04-30'),
(574, 39, 39.4, 23.6, 755, 63, NULL, NULL, NULL, 'seedling', 100, 1.33295, '2025-05-01'),
(575, 39, 36, 24.1, 142, 61, NULL, NULL, NULL, 'seedling', 100, 1.34487, '2025-05-02'),
(576, 39, 33.7, 23.8, 151, 61, NULL, NULL, NULL, 'seedling', 100, 1.3396, '2025-05-03'),
(577, 39, 31.3, 24.8, 455, 64, NULL, NULL, NULL, 'seedling', 100, 1.38315, '2025-05-04'),
(578, 39, 28.2, 25.6, 170, 61, NULL, NULL, NULL, 'seedling', 100, 1.3191, '2025-05-05'),
(579, 39, 25.1, 26.5, 40, 57, NULL, NULL, NULL, 'seedling', 100, 1.26367, '2025-05-06'),
(580, 39, 23.1, 25.9, 200, 53, NULL, NULL, NULL, 'seedling', 100, 1.29342, '2025-05-07'),
(581, 39, 19.1, 25.9, 95, 52, NULL, NULL, NULL, 'vegetative', 100, 1.25318, '2025-05-08'),
(582, 39, 16.6, 26.7, 425, 57, NULL, NULL, NULL, 'vegetative', 100, 1.31442, '2025-05-09'),
(583, 39, 13.3, 27.7, 362, 52, NULL, NULL, NULL, 'vegetative', 100, 1.27252, '2025-05-10'),
(584, 39, 10.6, 28.4, 146, 51, NULL, NULL, NULL, 'vegetative', 100, 1.20405, '2025-05-11'),
(585, 39, 7.1, 28.2, 488, 56, NULL, NULL, NULL, 'vegetative', 100, 1.2903, '2025-05-12'),
(586, 39, 3.3, 27.8, 15, 56, NULL, NULL, NULL, 'vegetative', 98.6315, 0.851338, '2025-05-13'),
(587, 39, 0.8, 27.5, 718, 58, NULL, NULL, NULL, 'vegetative', 100, 1.27828, '2025-05-14'),
(588, 39, 0, 28, 64, 63, NULL, NULL, NULL, 'vegetative', 98.7825, 0.867557, '2025-05-15'),
(589, 39, 0, 28.7, 108, 60, NULL, NULL, NULL, 'vegetative', 100, 1.17887, '2025-05-16'),
(590, 39, 0, 28, 59, 56, NULL, NULL, NULL, 'vegetative', 98.63, 0.851177, '2025-05-17'),
(591, 39, 0, 27, 651, 59, NULL, NULL, NULL, 'vegetative', 100, 1.29775, '2025-05-18'),
(592, 39, 0, 27.9, 33, 55, NULL, NULL, NULL, 'vegetative', 98.5512, 0.842736, '2025-05-19'),
(593, 39, 0, 28.3, 145, 56, NULL, NULL, NULL, 'vegetative', 100, 1.18263, '2025-05-20'),
(594, 39, 0, 27.6, 302, 59, NULL, NULL, NULL, 'vegetative', 100, 1.23225, '2025-05-21'),
(595, 39, 0, 28, 404, 62, NULL, NULL, NULL, 'vegetative', 100, 1.26125, '2025-05-22'),
(596, 39, 0, 27.9, 766, 60, NULL, NULL, NULL, 'vegetative', 100, 1.26538, '2025-05-23'),
(597, 39, 0, 28.5, 157, 60, NULL, NULL, NULL, 'vegetative', 100, 1.19237, '2025-05-24'),
(598, 39, 0, 29.3, 26, 55, NULL, NULL, NULL, 'vegetative', 98.4463, 0.831502, '2025-05-25'),
(599, 42, 46.5, 25.5, 729, 55, NULL, NULL, NULL, 'seedling', 100, 1.33788, '2025-04-28'),
(600, 42, 43, 24.6, 67, 59, NULL, NULL, NULL, 'seedling', 100, 1.34, '2025-04-29'),
(601, 42, 40, 25.5, 699, 55, NULL, NULL, NULL, 'seedling', 100, 1.32588, '2025-04-30'),
(602, 42, 36.4, 25.9, 12, 54, NULL, NULL, NULL, 'seedling', 100, 1.28832, '2025-05-01'),
(603, 42, 34, 25.9, 559, 58, NULL, NULL, NULL, 'seedling', 100, 1.34637, '2025-05-02'),
(604, 42, 31.8, 24.9, 77, 53, NULL, NULL, NULL, 'seedling', 100, 1.29502, '2025-05-03'),
(605, 43, 47.3, 25.1, 34, 57, NULL, NULL, NULL, 'seedling', 100, 1.33753, '2025-04-28'),
(606, 43, 43.7, 25.2, 69, 53, NULL, NULL, NULL, 'seedling', 100, 1.32685, '2025-04-29'),
(607, 43, 40.6, 24.6, 401, 48, NULL, NULL, NULL, 'seedling', 100, 1.3938, '2025-04-30'),
(608, 43, 37.1, 24.9, 6, 52, NULL, NULL, NULL, 'seedling', 100, 1.29118, '2025-05-01'),
(609, 44, 46.8, 24.7, 559, 64, NULL, NULL, NULL, 'seedling', 100, 1.40427, '2025-04-28'),
(610, 44, 44.7, 24.2, 101, 60, NULL, NULL, NULL, 'seedling', 100, 1.3581, '2025-04-29'),
(611, 44, 41.4, 25, 581, 63, NULL, NULL, NULL, 'seedling', 100, 1.3787, '2025-04-30'),
(612, 44, 39.1, 25.2, 67, 61, NULL, NULL, NULL, 'seedling', 100, 1.32855, '2025-05-01'),
(613, 44, 36.8, 24.5, 142, 62, NULL, NULL, NULL, 'seedling', 100, 1.34678, '2025-05-02'),
(614, 44, 33.7, 24.9, 48, 58, NULL, NULL, NULL, 'seedling', 100, 1.30348, '2025-05-03'),
(615, 45, 48, 24.7, 705, 57, NULL, NULL, NULL, 'seedling', 100, 1.35738, '2025-04-28'),
(616, 46, 48, 25.8, 50, 59, NULL, NULL, NULL, 'seedling', 100, 1.34325, '2025-04-28'),
(654, 47, 46.4, 25, 619, 55, NULL, NULL, NULL, 'seedling', 100, 1.3682, '2025-04-28'),
(655, 47, 43.8, 25.2, 777, 53, NULL, NULL, NULL, 'seedling', 100, 1.31565, '2025-04-29'),
(656, 47, 41.5, 25.8, 191, 54, NULL, NULL, NULL, 'seedling', 100, 1.349, '2025-04-30'),
(657, 47, 37.5, 26.8, 796, 56, NULL, NULL, NULL, 'seedling', 100, 1.288, '2025-05-01'),
(658, 47, 34.5, 27.8, 409, 59, NULL, NULL, NULL, 'seedling', 100, 1.3755, '2025-05-02'),
(659, 47, 31.1, 27.6, 62, 56, NULL, NULL, NULL, 'seedling', 100, 1.2783, '2025-05-03'),
(660, 47, 28.5, 28.6, 103, 56, NULL, NULL, NULL, 'seedling', 100, 1.2745, '2025-05-04'),
(661, 47, 26.5, 28.3, 55, 52, NULL, NULL, NULL, 'seedling', 100, 1.25038, '2025-05-05'),
(662, 47, 23.2, 28.6, 18, 54, NULL, NULL, NULL, 'seedling', 100, 1.23335, '2025-05-06'),
(663, 47, 21, 28.2, 90, 50, NULL, NULL, NULL, 'seedling', 100, 1.23925, '2025-05-07'),
(664, 47, 17.4, 28.8, 523, 54, NULL, NULL, NULL, 'seedling', 100, 1.27945, '2025-05-08'),
(665, 47, 13.4, 29.4, 421, 55, NULL, NULL, NULL, 'vegetative', 100, 1.2912, '2025-05-09'),
(666, 47, 9.4, 29.6, 577, 57, NULL, NULL, NULL, 'vegetative', 100, 1.3127, '2025-05-10'),
(667, 47, 5.6, 30.3, 143, 56, NULL, NULL, NULL, 'vegetative', 100, 1.18642, '2025-05-11'),
(668, 47, 3.3, 30.9, 642, 51, NULL, NULL, NULL, 'vegetative', 100, 1.26953, '2025-05-12'),
(669, 47, 0.5, 30.4, 134, 48, NULL, NULL, NULL, 'vegetative', 100, 1.15225, '2025-05-13'),
(680, 62, 47, 24.5, 1, 58, NULL, NULL, NULL, 'seedling', 100, 1.33413, '2025-04-28'),
(681, 62, 43.2, 25.1, 7, 62, NULL, NULL, NULL, 'seedling', 100, 1.32847, '2025-04-29'),
(682, 62, 39.6, 24.8, 193, 61, NULL, NULL, NULL, 'seedling', 100, 1.36405, '2025-04-30'),
(683, 62, 36.8, 25.2, 91, 58, NULL, NULL, NULL, 'seedling', 100, 1.32165, '2025-05-01'),
(684, 62, 33, 24.2, 626, 60, NULL, NULL, NULL, 'seedling', 100, 1.34125, '2025-05-02'),
(685, 62, 30.1, 24.4, 418, 57, NULL, NULL, NULL, 'seedling', 100, 1.3773, '2025-05-03'),
(686, 62, 26.4, 25.1, 595, 60, NULL, NULL, NULL, 'seedling', 100, 1.32358, '2025-05-04'),
(687, 62, 24.1, 25, 444, 55, NULL, NULL, NULL, 'seedling', 100, 1.34505, '2025-05-05'),
(688, 62, 20.6, 24.8, 77, 51, NULL, NULL, NULL, 'seedling', 100, 1.25805, '2025-05-06'),
(689, 62, 17.4, 23.8, 92, 51, NULL, NULL, NULL, 'seedling', 100, 1.25595, '2025-05-07'),
(690, 62, 14.1, 24.7, 676, 48, NULL, NULL, NULL, 'seedling', 100, 1.24493, '2025-05-08'),
(691, 62, 10.4, 24.6, 344, 46, NULL, NULL, NULL, 'vegetative', 100, 1.28545, '2025-05-09'),
(692, 62, 6.9, 25.4, 69, 43, NULL, NULL, NULL, 'vegetative', 98.7645, 0.865621, '2025-05-10'),
(693, 62, 3.5, 24.6, 429, 40, NULL, NULL, NULL, 'vegetative', 100, 1.25025, '2025-05-11'),
(694, 62, 0.5, 25.5, 507, 42, NULL, NULL, NULL, 'vegetative', 100, 1.26412, '2025-05-12'),
(695, 62, 0, 26, 671, 40, NULL, NULL, NULL, 'vegetative', 100, 1.261, '2025-05-13'),
(696, 62, 0, 25.2, 503, 42, NULL, NULL, NULL, 'vegetative', 100, 1.2635, '2025-05-14'),
(697, 62, 0, 26.2, 716, 40, NULL, NULL, NULL, 'vegetative', 100, 1.2485, '2025-05-15'),
(698, 62, 0, 25.2, 143, 45, NULL, NULL, NULL, 'vegetative', 100, 1.1795, '2025-05-16'),
(699, 62, 0, 26.2, 686, 43, NULL, NULL, NULL, 'vegetative', 100, 1.262, '2025-05-17'),
(700, 62, 0, 26.2, 172, 41, NULL, NULL, NULL, 'vegetative', 100, 1.1725, '2025-05-18'),
(701, 62, 0, 26.5, 179, 39, NULL, NULL, NULL, 'vegetative', 100, 1.16838, '2025-05-19'),
(702, 62, 0, 26.8, 178, 42, NULL, NULL, NULL, 'vegetative', 100, 1.17225, '2025-05-20'),
(703, 62, 0, 26, 3, 38, NULL, NULL, NULL, 'vegetative', 98.255, 0.811095, '2025-05-21'),
(704, 62, 0, 26.6, 162, 38, NULL, NULL, NULL, 'vegetative', 99.87, 1.15999, '2025-05-22'),
(705, 62, 0, 27, 700, 34, NULL, NULL, NULL, 'vegetative', 100, 1.2355, '2025-05-23'),
(706, 62, 0, 27.4, 173, 33, NULL, NULL, NULL, 'vegetative', 100, 1.14925, '2025-05-24'),
(707, 62, 0, 27.4, 188, 32, NULL, NULL, NULL, 'vegetative', 100, 1.151, '2025-05-25'),
(708, 62, 0, 28.1, 3, 30, NULL, NULL, NULL, 'vegetative', 97.9638, 0.780159, '2025-05-26'),
(709, 62, 0, 28.2, 774, 29, NULL, NULL, NULL, 'vegetative', 99.9587, 1.19901, '2025-05-27'),
(710, 62, 0, 28.9, 657, 34, NULL, NULL, NULL, 'vegetative', 100, 1.23438, '2025-05-28'),
(711, 62, 0, 29.3, 320, 34, NULL, NULL, NULL, 'vegetative', 100, 1.17613, '2025-05-29'),
(712, 62, 0, 29.4, 546, 32, NULL, NULL, NULL, 'vegetative', 100, 1.228, '2025-05-30'),
(741, 63, 47.2, 24.2, 632, 57, NULL, NULL, NULL, 'seedling', 100, 1.37635, '2025-04-28'),
(742, 63, 44.1, 24.3, 126, 58, NULL, NULL, NULL, 'seedling', 100, 1.35793, '2025-04-29'),
(743, 63, 40.6, 24.9, 185, 54, NULL, NULL, NULL, 'seedling', 100, 1.35043, '2025-04-30'),
(744, 63, 37.2, 24.2, 44, 50, NULL, NULL, NULL, 'seedling', 100, 1.30135, '2025-05-01'),
(745, 63, 33.2, 24, 145, 45, NULL, NULL, NULL, 'seedling', 100, 1.30585, '2025-05-02'),
(746, 63, 29.2, 23.3, 69, 48, NULL, NULL, NULL, 'seedling', 100, 1.27647, '2025-05-03'),
(747, 63, 26.2, 24.1, 72, 47, NULL, NULL, NULL, 'seedling', 100, 1.26997, '2025-05-04'),
(748, 63, 23.8, 23.2, 70, 49, NULL, NULL, NULL, 'seedling', 100, 1.2619, '2025-05-05'),
(749, 63, 20, 22.7, 629, 50, NULL, NULL, NULL, 'seedling', 100, 1.27462, '2025-05-06'),
(759, 64, 47.9, 24, 526, 62, NULL, NULL, NULL, 'seedling', 100, 1.4162, '2025-04-28'),
(760, 64, 44.1, 24.5, 761, 58, NULL, NULL, NULL, 'seedling', 100, 1.33493, '2025-04-29'),
(761, 64, 41.4, 25, 573, 61, NULL, NULL, NULL, 'seedling', 100, 1.3767, '2025-04-30'),
(762, 64, 37.5, 24.8, 639, 59, NULL, NULL, NULL, 'seedling', 100, 1.34575, '2025-05-01'),
(763, 64, 35.5, 23.9, 92, 56, NULL, NULL, NULL, 'seedling', 100, 1.32088, '2025-05-02'),
(764, 64, 32.8, 23.4, 465, 60, NULL, NULL, NULL, 'seedling', 100, 1.3784, '2025-05-03'),
(765, 64, 30.7, 22.7, 488, 56, NULL, NULL, NULL, 'seedling', 100, 1.35398, '2025-05-04'),
(766, 64, 28.4, 22.6, 172, 61, NULL, NULL, NULL, 'seedling', 100, 1.32145, '2025-05-05'),
(767, 64, 25, 21.9, 606, 61, NULL, NULL, NULL, 'seedling', 100, 1.31237, '2025-05-06'),
(768, 64, 22.9, 21.7, 36, 59, NULL, NULL, NULL, 'seedling', 100, 1.26133, '2025-05-07'),
(769, 64, 20.1, 21.1, 46, 54, NULL, NULL, NULL, 'seedling', 100, 1.24168, '2025-05-08'),
(770, 64, 16.9, 20.2, 125, 51, NULL, NULL, NULL, 'vegetative', 100, 1.2402, '2025-05-09'),
(771, 64, 12.9, 20.8, 779, 51, NULL, NULL, NULL, 'vegetative', 100, 1.2747, '2025-05-10'),
(772, 64, 9.5, 21.3, 190, 50, NULL, NULL, NULL, 'vegetative', 100, 1.20788, '2025-05-11'),
(773, 64, 48, 25, 238, 92, NULL, NULL, NULL, 'vegetative', 100, 1.3345, '2025-05-12'),
(774, 64, 46, 25.2, 525, 93, NULL, NULL, NULL, 'vegetative', 100, 1.397, '2025-05-13'),
(775, 64, 44, 26, 121, 96, NULL, NULL, NULL, 'vegetative', 100, 1.279, '2025-05-14'),
(776, 64, 41.8, 25.9, 43, 97, NULL, NULL, NULL, 'vegetative', 99.5153, 0.946912, '2025-05-15'),
(777, 64, 38.6, 25, 361, 100, NULL, NULL, NULL, 'vegetative', 100, 1.32105, '2025-05-16'),
(778, 64, 36.2, 25.7, 127, 96, NULL, NULL, NULL, 'vegetative', 100, 1.25898, '2025-05-17'),
(779, 64, 48, 25, 238, 92, NULL, NULL, NULL, 'vegetative', 100, 1.3345, '2025-05-18'),
(780, 64, 48, 25, 238, 92, NULL, NULL, NULL, 'vegetative', 100, 1.3345, '2025-05-19'),
(781, 64, 48, 25, 238, 92, NULL, NULL, NULL, 'vegetative', 100, 1.3345, '2025-05-20'),
(782, 64, 48, 25, 238, 92, NULL, NULL, NULL, 'vegetative', 100, 1.3345, '2025-05-21'),
(783, 64, 48, 25, 238, 92, NULL, NULL, NULL, 'vegetative', 100, 1.3345, '2025-05-22'),
(784, 64, 48, 25, 238, 92, NULL, NULL, NULL, 'vegetative', 100, 1.3345, '2025-05-23'),
(785, 64, 48, 24.9, 204, 92, NULL, NULL, NULL, 'vegetative', 100, 1.32537, '2025-05-24');

-- --------------------------------------------------------

--
-- Struktur dari tabel `weather_data`
--

CREATE TABLE `weather_data` (
  `id` int(11) NOT NULL,
  `location_name` varchar(100) DEFAULT 'Default' COMMENT 'Nama lokasi',
  `temperature` float DEFAULT NULL COMMENT 'Suhu (°C)',
  `humidity` float DEFAULT NULL COMMENT 'Kelembaban udara (%)',
  `precipitation` float DEFAULT 0 COMMENT 'Curah hujan (mm)',
  `wind_speed` float DEFAULT 0 COMMENT 'Kecepatan angin (km/h)',
  `cloud_cover` int(11) DEFAULT 0 COMMENT 'Tutupan awan (%)',
  `light_intensity` float DEFAULT NULL COMMENT 'Intensitas cahaya (lux)',
  `weather_condition` varchar(50) DEFAULT NULL COMMENT 'Kondisi cuaca (cerah, hujan, dll)',
  `is_forecasted` tinyint(1) DEFAULT 0 COMMENT 'Apakah data ini ramalan',
  `record_date` date DEFAULT NULL COMMENT 'Tanggal pencatatan',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Waktu pencatatan'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Data cuaca untuk simulasi';

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `control_actions`
--
ALTER TABLE `control_actions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `input_parameters_id` (`input_parameters_id`),
  ADD KEY `output_parameters_id` (`output_parameters_id`),
  ADD KEY `idx_action_time` (`action_time`);

--
-- Indeks untuk tabel `fuzzy_rules`
--
ALTER TABLE `fuzzy_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rule_inputs` (`soil_moisture`,`air_temperature`,`light_intensity`,`humidity`),
  ADD KEY `idx_rule_outputs` (`irrigation_duration`,`temperature_setting`,`light_control`),
  ADD KEY `idx_plant_stage` (`plant_stage`),
  ADD KEY `idx_confidence` (`confidence_level`),
  ADD KEY `idx_is_adaptive` (`is_adaptive`);

--
-- Indeks untuk tabel `input_parameters`
--
ALTER TABLE `input_parameters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_soil_moisture` (`soil_moisture`),
  ADD KEY `idx_air_temperature` (`air_temperature`),
  ADD KEY `idx_light_intensity` (`light_intensity`),
  ADD KEY `idx_humidity` (`humidity`);

--
-- Indeks untuk tabel `learning_log`
--
ALTER TABLE `learning_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rule_id_log` (`rule_id`),
  ADD KEY `idx_timestamp_log` (`timestamp`);

--
-- Indeks untuk tabel `membership_functions`
--
ALTER TABLE `membership_functions`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `output_parameters`
--
ALTER TABLE `output_parameters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_irrigation_duration` (`irrigation_duration`),
  ADD KEY `idx_temperature_setting` (`temperature_setting`),
  ADD KEY `idx_light_control` (`light_control`);

--
-- Indeks untuk tabel `plant_simulation`
--
ALTER TABLE `plant_simulation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_plant_stage` (`plant_stage`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indeks untuk tabel `sensor_data`
--
ALTER TABLE `sensor_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reading_time` (`reading_time`);

--
-- Indeks untuk tabel `simulation_log`
--
ALTER TABLE `simulation_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_simulation_id` (`simulation_id`),
  ADD KEY `idx_log_date` (`log_date`);

--
-- Indeks untuk tabel `weather_data`
--
ALTER TABLE `weather_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_loc_date` (`location_name`,`record_date`),
  ADD KEY `idx_forecast` (`is_forecasted`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `control_actions`
--
ALTER TABLE `control_actions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `fuzzy_rules`
--
ALTER TABLE `fuzzy_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT untuk tabel `input_parameters`
--
ALTER TABLE `input_parameters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT untuk tabel `learning_log`
--
ALTER TABLE `learning_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT untuk tabel `membership_functions`
--
ALTER TABLE `membership_functions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `output_parameters`
--
ALTER TABLE `output_parameters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `plant_simulation`
--
ALTER TABLE `plant_simulation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT untuk tabel `sensor_data`
--
ALTER TABLE `sensor_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `simulation_log`
--
ALTER TABLE `simulation_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=786;

--
-- AUTO_INCREMENT untuk tabel `weather_data`
--
ALTER TABLE `weather_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- --------------------------------------------------------

--
-- Struktur untuk view `active_fuzzy_rules`
--
DROP TABLE IF EXISTS `active_fuzzy_rules`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `active_fuzzy_rules`  AS SELECT `fuzzy_rules`.`id` AS `id`, `fuzzy_rules`.`soil_moisture` AS `soil_moisture`, `fuzzy_rules`.`air_temperature` AS `air_temperature`, `fuzzy_rules`.`light_intensity` AS `light_intensity`, `fuzzy_rules`.`humidity` AS `humidity`, `fuzzy_rules`.`irrigation_duration` AS `irrigation_duration`, `fuzzy_rules`.`temperature_setting` AS `temperature_setting`, `fuzzy_rules`.`light_control` AS `light_control`, `fuzzy_rules`.`plant_stage` AS `plant_stage`, `fuzzy_rules`.`confidence_level` AS `confidence_level`, `fuzzy_rules`.`is_adaptive` AS `is_adaptive`, `fuzzy_rules`.`created_at` AS `created_at`, `fuzzy_rules`.`updated_at` AS `updated_at` FROM `fuzzy_rules` WHERE `fuzzy_rules`.`active` = 1 ORDER BY `fuzzy_rules`.`id` ASC ;

-- --------------------------------------------------------

--
-- Struktur untuk view `adaptive_learning_stats`
--
DROP TABLE IF EXISTS `adaptive_learning_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `adaptive_learning_stats`  AS SELECT (select count(0) from `fuzzy_rules` where `fuzzy_rules`.`is_adaptive` = 1) AS `adaptive_rules_count`, (select avg(`fuzzy_rules`.`confidence_level`) from `fuzzy_rules` where `fuzzy_rules`.`is_adaptive` = 1) AS `avg_confidence`, (select count(0) from `learning_log`) AS `learning_activities`, (select count(distinct `learning_log`.`rule_id`) from `learning_log`) AS `adjusted_rules_count`, (select max(`learning_log`.`timestamp`) from `learning_log`) AS `last_learning_activity` ;

-- --------------------------------------------------------

--
-- Struktur untuk view `adaptive_rules_confidence`
--
DROP TABLE IF EXISTS `adaptive_rules_confidence`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `adaptive_rules_confidence`  AS SELECT `fr`.`id` AS `id`, `fr`.`soil_moisture` AS `soil_moisture`, `fr`.`air_temperature` AS `air_temperature`, `fr`.`light_intensity` AS `light_intensity`, `fr`.`humidity` AS `humidity`, `fr`.`irrigation_duration` AS `irrigation_duration`, `fr`.`temperature_setting` AS `temperature_setting`, `fr`.`light_control` AS `light_control`, `fr`.`plant_stage` AS `plant_stage`, `fr`.`confidence_level` AS `confidence_level`, `fr`.`adaptations_count` AS `adaptations_count`, `fr`.`updated_at` AS `updated_at` FROM `fuzzy_rules` AS `fr` WHERE `fr`.`is_adaptive` = 1 AND `fr`.`active` = 1 ORDER BY `fr`.`confidence_level` DESC, `fr`.`id` ASC ;

-- --------------------------------------------------------

--
-- Struktur untuk view `daily_environment_stats`
--
DROP TABLE IF EXISTS `daily_environment_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `daily_environment_stats`  AS SELECT cast(`sensor_data`.`reading_time` as date) AS `reading_date`, avg(`sensor_data`.`soil_moisture_value`) AS `avg_soil_moisture`, min(`sensor_data`.`soil_moisture_value`) AS `min_soil_moisture`, max(`sensor_data`.`soil_moisture_value`) AS `max_soil_moisture`, avg(`sensor_data`.`air_temperature_value`) AS `avg_temperature`, min(`sensor_data`.`air_temperature_value`) AS `min_temperature`, max(`sensor_data`.`air_temperature_value`) AS `max_temperature`, avg(`sensor_data`.`light_intensity_value`) AS `avg_light`, min(`sensor_data`.`light_intensity_value`) AS `min_light`, max(`sensor_data`.`light_intensity_value`) AS `max_light`, avg(`sensor_data`.`humidity_value`) AS `avg_humidity`, min(`sensor_data`.`humidity_value`) AS `min_humidity`, max(`sensor_data`.`humidity_value`) AS `max_humidity`, count(0) AS `reading_count` FROM `sensor_data` GROUP BY cast(`sensor_data`.`reading_time` as date) ORDER BY cast(`sensor_data`.`reading_time` as date) DESC ;

-- --------------------------------------------------------

--
-- Struktur untuk view `latest_control_actions`
--
DROP TABLE IF EXISTS `latest_control_actions`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `latest_control_actions`  AS SELECT `ca`.`id` AS `id`, `ca`.`irrigation_duration_value` AS `irrigation_duration_value`, `ca`.`temperature_setting_value` AS `temperature_setting_value`, `ca`.`light_control_value` AS `light_control_value`, `ca`.`action_time` AS `action_time`, `ip`.`soil_moisture` AS `soil_moisture`, `ip`.`air_temperature` AS `air_temperature`, `ip`.`light_intensity` AS `light_intensity`, `ip`.`humidity` AS `humidity`, `op`.`irrigation_duration` AS `irrigation_duration`, `op`.`temperature_setting` AS `temperature_setting`, `op`.`light_control` AS `light_control` FROM ((`control_actions` `ca` left join `input_parameters` `ip` on(`ca`.`input_parameters_id` = `ip`.`id`)) left join `output_parameters` `op` on(`ca`.`output_parameters_id` = `op`.`id`)) ORDER BY `ca`.`action_time` DESC LIMIT 0, 100 ;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `control_actions`
--
ALTER TABLE `control_actions`
  ADD CONSTRAINT `control_actions_ibfk_1` FOREIGN KEY (`input_parameters_id`) REFERENCES `input_parameters` (`id`),
  ADD CONSTRAINT `control_actions_ibfk_2` FOREIGN KEY (`output_parameters_id`) REFERENCES `output_parameters` (`id`);

--
-- Ketidakleluasaan untuk tabel `learning_log`
--
ALTER TABLE `learning_log`
  ADD CONSTRAINT `learning_log_ibfk_1` FOREIGN KEY (`rule_id`) REFERENCES `fuzzy_rules` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `simulation_log`
--
ALTER TABLE `simulation_log`
  ADD CONSTRAINT `simulation_log_ibfk_1` FOREIGN KEY (`simulation_id`) REFERENCES `plant_simulation` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
