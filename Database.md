# Nama Database : fuzzy_tomato_system

USE fuzzy_tomato_system;

CREATE TABLE input_parameters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    soil_moisture VARCHAR(10),  -- kering, sedang, basah
    air_temperature VARCHAR(10), -- dingin, sedang, panas
    light_intensity VARCHAR(10), -- rendah, sedang, tinggi
    humidity VARCHAR(10)        -- rendah, sedang, tinggi
);

CREATE TABLE output_parameters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    irrigation_duration VARCHAR(10), -- tidak ada, singkat, sedang, lama
    temperature_setting VARCHAR(10), -- menurunkan, mempertahankan, menaikkan
    light_control VARCHAR(10)        -- mati, redup, sedang, terang
);

CREATE TABLE fuzzy_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    soil_moisture VARCHAR(10),
    air_temperature VARCHAR(10),
    light_intensity VARCHAR(10),
    humidity VARCHAR(10),
    irrigation_duration VARCHAR(10),
    temperature_setting VARCHAR(10),
    light_control VARCHAR(10)
);

---- DATABASE BARU ----

-- --------------------------------------------------------
-- SCRIPT PEMBUATAN DATABASE UNTUK SISTEM KONTROL CERDAS TOMAT
-- --------------------------------------------------------

-- Buat database baru
CREATE DATABASE IF NOT EXISTS fuzzy_tomato_system;

-- Gunakan database yang baru dibuat
USE fuzzy_tomato_system;

-- --------------------------------------------------------
-- STRUKTUR TABEL
-- --------------------------------------------------------

-- Tabel untuk parameter input
CREATE TABLE IF NOT EXISTS input_parameters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    soil_moisture VARCHAR(10) NOT NULL COMMENT 'Kelembaban tanah (kering, sedang, basah)',
    air_temperature VARCHAR(10) NOT NULL COMMENT 'Suhu udara (dingin, sedang, panas)',
    light_intensity VARCHAR(10) NOT NULL COMMENT 'Intensitas cahaya (rendah, sedang, tinggi)',
    humidity VARCHAR(10) NOT NULL COMMENT 'Kelembaban udara (rendah, sedang, tinggi)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pencatatan parameter'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Menyimpan parameter input sistem';

-- Tabel untuk parameter output
CREATE TABLE IF NOT EXISTS output_parameters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    irrigation_duration VARCHAR(10) NOT NULL COMMENT 'Durasi irigasi (tidak ada, singkat, sedang, lama)',
    temperature_setting VARCHAR(15) NOT NULL COMMENT 'Pengaturan suhu (menurunkan, mempertahankan, menaikkan)',
    light_control VARCHAR(10) NOT NULL COMMENT 'Kontrol pencahayaan (mati, redup, sedang, terang)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pencatatan output'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Menyimpan hasil output sistem';

-- Tabel untuk aturan fuzzy
CREATE TABLE IF NOT EXISTS fuzzy_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    soil_moisture VARCHAR(10) NOT NULL COMMENT 'Kelembaban tanah (kering, sedang, basah)',
    air_temperature VARCHAR(10) NOT NULL COMMENT 'Suhu udara (dingin, sedang, panas)',
    light_intensity VARCHAR(10) NOT NULL COMMENT 'Intensitas cahaya (rendah, sedang, tinggi)',
    humidity VARCHAR(10) NOT NULL COMMENT 'Kelembaban udara (rendah, sedang, tinggi)',
    irrigation_duration VARCHAR(10) NOT NULL COMMENT 'Durasi irigasi (tidak ada, singkat, sedang, lama)',
    temperature_setting VARCHAR(15) NOT NULL COMMENT 'Pengaturan suhu (menurunkan, mempertahankan, menaikkan)',
    light_control VARCHAR(10) NOT NULL COMMENT 'Kontrol pencahayaan (mati, redup, sedang, terang)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pembuatan aturan',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu terakhir update aturan',
    active TINYINT(1) DEFAULT 1 COMMENT 'Status aktif aturan (1 = aktif, 0 = tidak aktif)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Menyimpan aturan fuzzy untuk sistem kontrol';

-- Tabel untuk data sensor
CREATE TABLE IF NOT EXISTS sensor_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    soil_moisture_value FLOAT NOT NULL COMMENT 'Nilai kelembaban tanah (0-100%)',
    air_temperature_value FLOAT NOT NULL COMMENT 'Nilai suhu udara (dalam °C)',
    light_intensity_value FLOAT NOT NULL COMMENT 'Nilai intensitas cahaya (dalam lux)',
    humidity_value FLOAT NOT NULL COMMENT 'Nilai kelembaban udara (0-100%)',
    reading_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu pembacaan sensor',
    device_id VARCHAR(50) DEFAULT NULL COMMENT 'ID perangkat yang membaca sensor'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Menyimpan data pembacaan sensor secara berkala';

-- Tabel untuk log aksi kontrol
CREATE TABLE IF NOT EXISTS control_actions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    irrigation_duration_value INT NOT NULL COMMENT 'Nilai durasi irigasi (dalam menit)',
    temperature_setting_value FLOAT NOT NULL COMMENT 'Nilai pengaturan suhu (dalam °C)',
    light_control_value INT NOT NULL COMMENT 'Nilai kontrol pencahayaan (dalam %)',
    action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu tindakan kontrol dilakukan',
    input_parameters_id INT COMMENT 'ID parameter input yang terkait',
    output_parameters_id INT COMMENT 'ID parameter output yang terkait',
    FOREIGN KEY (input_parameters_id) REFERENCES input_parameters(id),
    FOREIGN KEY (output_parameters_id) REFERENCES output_parameters(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Menyimpan log tindakan kontrol yang dilakukan';

-- --------------------------------------------------------
-- DATA AWAL UNTUK ATURAN FUZZY
-- --------------------------------------------------------

-- Masukkan 20 aturan fuzzy awal
INSERT INTO fuzzy_rules 
    (soil_moisture, air_temperature, light_intensity, humidity, irrigation_duration, temperature_setting, light_control) 
VALUES 
    ('kering', 'panas', 'tinggi', 'rendah', 'lama', 'menurunkan', 'redup'),
    ('kering', 'panas', 'tinggi', 'sedang', 'lama', 'menurunkan', 'sedang'),
    ('kering', 'panas', 'sedang', 'rendah', 'lama', 'menurunkan', 'sedang'),
    ('kering', 'sedang', 'rendah', 'rendah', 'lama', 'mempertahankan', 'terang'),
    ('kering', 'dingin', 'rendah', 'rendah', 'sedang', 'menaikkan', 'terang'),
    ('sedang', 'panas', 'tinggi', 'rendah', 'sedang', 'menurunkan', 'redup'),
    ('sedang', 'sedang', 'sedang', 'sedang', 'sedang', 'mempertahankan', 'sedang'),
    ('sedang', 'dingin', 'rendah', 'tinggi', 'singkat', 'menaikkan', 'terang'),
    ('basah', 'panas', 'tinggi', 'sedang', 'tidak_ada', 'menurunkan', 'redup'),
    ('basah', 'sedang', 'sedang', 'tinggi', 'tidak_ada', 'mempertahankan', 'sedang'),
    ('kering', 'sedang', 'sedang', 'sedang', 'lama', 'mempertahankan', 'sedang'),
    ('sedang', 'panas', 'sedang', 'rendah', 'sedang', 'menurunkan', 'sedang'),
    ('basah', 'dingin', 'tinggi', 'rendah', 'tidak_ada', 'menaikkan', 'redup'),
    ('kering', 'dingin', 'sedang', 'tinggi', 'sedang', 'menaikkan', 'sedang'),
    ('sedang', 'sedang', 'tinggi', 'sedang', 'sedang', 'mempertahankan', 'redup'),
    ('basah', 'panas', 'rendah', 'rendah', 'tidak_ada', 'menurunkan', 'terang'),
    ('kering', 'sedang', 'tinggi', 'rendah', 'lama', 'mempertahankan', 'redup'),
    ('sedang', 'dingin', 'sedang', 'sedang', 'singkat', 'menaikkan', 'sedang'),
    ('basah', 'dingin', 'sedang', 'tinggi', 'tidak_ada', 'menaikkan', 'sedang'),
    ('kering', 'panas', 'rendah', 'tinggi', 'lama', 'menurunkan', 'sedang');

-- --------------------------------------------------------
-- INDEKS UNTUK PERFORMA QUERY
-- --------------------------------------------------------

-- Indeks pada tabel input_parameters untuk pencarian cepat
ALTER TABLE input_parameters ADD INDEX idx_soil_moisture (soil_moisture);
ALTER TABLE input_parameters ADD INDEX idx_air_temperature (air_temperature);
ALTER TABLE input_parameters ADD INDEX idx_light_intensity (light_intensity);
ALTER TABLE input_parameters ADD INDEX idx_humidity (humidity);

-- Indeks pada tabel output_parameters untuk pencarian cepat
ALTER TABLE output_parameters ADD INDEX idx_irrigation_duration (irrigation_duration);
ALTER TABLE output_parameters ADD INDEX idx_temperature_setting (temperature_setting);
ALTER TABLE output_parameters ADD INDEX idx_light_control (light_control);

-- Indeks pada tabel fuzzy_rules untuk pencarian aturan
ALTER TABLE fuzzy_rules ADD INDEX idx_rule_inputs (soil_moisture, air_temperature, light_intensity, humidity);
ALTER TABLE fuzzy_rules ADD INDEX idx_rule_outputs (irrigation_duration, temperature_setting, light_control);

-- Indeks pada tabel sensor_data untuk pencarian berdasarkan waktu
ALTER TABLE sensor_data ADD INDEX idx_reading_time (reading_time);

-- Indeks pada tabel control_actions untuk pencarian berdasarkan waktu
ALTER TABLE control_actions ADD INDEX idx_action_time (action_time);

-- --------------------------------------------------------
-- TRIGGER UNTUK MEMPERTAHANKAN INTEGRITAS DATA
-- --------------------------------------------------------

-- Trigger untuk memvalidasi nilai parameter input saat penyisipan data
DELIMITER //
CREATE TRIGGER validate_input_params BEFORE INSERT ON input_parameters
FOR EACH ROW
BEGIN
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
END;
//
DELIMITER ;

-- Trigger untuk memvalidasi nilai parameter output saat penyisipan data
DELIMITER //
CREATE TRIGGER validate_output_params BEFORE INSERT ON output_parameters
FOR EACH ROW
BEGIN
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
END;
//
DELIMITER ;

-- Trigger untuk memvalidasi nilai sensor saat penyisipan data
DELIMITER //
CREATE TRIGGER validate_sensor_data BEFORE INSERT ON sensor_data
FOR EACH ROW
BEGIN
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
END;
//
DELIMITER ;

-- --------------------------------------------------------
-- TAMPILAN (VIEW) UNTUK ANALISIS DATA
-- --------------------------------------------------------

-- Tampilan untuk melihat hasil kontrol terbaru
CREATE VIEW latest_control_actions AS
SELECT 
    ca.id,
    ca.irrigation_duration_value,
    ca.temperature_setting_value,
    ca.light_control_value,
    ca.action_time,
    ip.soil_moisture,
    ip.air_temperature,
    ip.light_intensity,
    ip.humidity,
    op.irrigation_duration,
    op.temperature_setting,
    op.light_control
FROM 
    control_actions ca
LEFT JOIN 
    input_parameters ip ON ca.input_parameters_id = ip.id
LEFT JOIN 
    output_parameters op ON ca.output_parameters_id = op.id
ORDER BY 
    ca.action_time DESC
LIMIT 100;

-- Tampilan untuk statistik kondisi lingkungan harian
CREATE VIEW daily_environment_stats AS
SELECT 
    DATE(reading_time) AS reading_date,
    AVG(soil_moisture_value) AS avg_soil_moisture,
    MIN(soil_moisture_value) AS min_soil_moisture,
    MAX(soil_moisture_value) AS max_soil_moisture,
    AVG(air_temperature_value) AS avg_temperature,
    MIN(air_temperature_value) AS min_temperature,
    MAX(air_temperature_value) AS max_temperature,
    AVG(light_intensity_value) AS avg_light,
    MIN(light_intensity_value) AS min_light,
    MAX(light_intensity_value) AS max_light,
    AVG(humidity_value) AS avg_humidity,
    MIN(humidity_value) AS min_humidity,
    MAX(humidity_value) AS max_humidity,
    COUNT(*) AS reading_count
FROM 
    sensor_data
GROUP BY 
    DATE(reading_time)
ORDER BY 
    reading_date DESC;

-- Tampilan untuk melihat semua aturan fuzzy aktif
CREATE VIEW active_fuzzy_rules AS
SELECT 
    id,
    soil_moisture,
    air_temperature,
    light_intensity,
    humidity,
    irrigation_duration,
    temperature_setting,
    light_control,
    created_at,
    updated_at
FROM 
    fuzzy_rules
WHERE 
    active = 1
ORDER BY 
    id ASC;

-- --------------------------------------------------------
-- PROSEDUR TERSIMPAN (STORED PROCEDURES)
-- --------------------------------------------------------

-- Prosedur untuk mencari aturan fuzzy berdasarkan kondisi input
DELIMITER //
CREATE PROCEDURE find_matching_rules(
    IN p_soil_moisture VARCHAR(10),
    IN p_air_temperature VARCHAR(10),
    IN p_light_intensity VARCHAR(10),
    IN p_humidity VARCHAR(10)
)
BEGIN
    SELECT * FROM fuzzy_rules
    WHERE soil_moisture = p_soil_moisture
      AND air_temperature = p_air_temperature
      AND light_intensity = p_light_intensity
      AND humidity = p_humidity
      AND active = 1;
END //
DELIMITER ;

-- Prosedur untuk merekam tindakan kontrol lengkap
DELIMITER //
CREATE PROCEDURE record_control_action(
    IN p_soil_moisture VARCHAR(10),
    IN p_air_temperature VARCHAR(10),
    IN p_light_intensity VARCHAR(10),
    IN p_humidity VARCHAR(10),
    IN p_irrigation_duration VARCHAR(10),
    IN p_temperature_setting VARCHAR(15),
    IN p_light_control VARCHAR(10),
    IN p_irrigation_duration_value INT,
    IN p_temperature_setting_value FLOAT,
    IN p_light_control_value INT
)
BEGIN
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
END //
DELIMITER ;

-- Prosedur untuk mendapatkan statistik ringkasan sistem
DELIMITER //
CREATE PROCEDURE get_system_statistics()
BEGIN
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
END //
DELIMITER ;

-- --------------------------------------------------------
-- PESAN KONFIRMASI AKHIR
-- --------------------------------------------------------

SELECT 'Database fuzzy_tomato_system berhasil dibuat dengan semua tabel, indeks, trigger, view, dan prosedur tersimpan!' AS 'Pesan Sukses';