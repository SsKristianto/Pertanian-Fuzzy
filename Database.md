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