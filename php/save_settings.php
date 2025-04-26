<?php
/**
 * save_settings.php
 * 
 * File ini bertanggung jawab untuk menyimpan pengaturan atau parameter
 * fuzzy yang diubah oleh pengguna ke dalam database
 */

// Koneksi ke database
include('connect.php');

// Pastikan request adalah POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metode tidak diizinkan']);
    exit;
}

// Ambil data dari POST request
$save_type = isset($_POST['save_type']) ? sanitizeInput($_POST['save_type']) : '';

// Header untuk response JSON
header('Content-Type: application/json');

try {
    switch ($save_type) {
        case 'input_parameters':
            // Ambil nilai parameter input
            $soil_moisture = isset($_POST['soil_moisture']) ? (float) $_POST['soil_moisture'] : 0;
            $air_temperature = isset($_POST['air_temperature']) ? (float) $_POST['air_temperature'] : 0;
            $light_intensity = isset($_POST['light_intensity']) ? (float) $_POST['light_intensity'] : 0;
            $humidity = isset($_POST['humidity']) ? (float) $_POST['humidity'] : 0;
            
            // Dapatkan nilai linguistik dari nilai numerik
            $soil_moisture_linguistic = getSoilMoistureLinguistic($soil_moisture);
            $air_temperature_linguistic = getAirTemperatureLinguistic($air_temperature);
            $light_intensity_linguistic = getLightIntensityLinguistic($light_intensity);
            $humidity_linguistic = getHumidityLinguistic($humidity);
            
            // Simpan parameter input ke database
            $sql = "INSERT INTO input_parameters (soil_moisture, air_temperature, light_intensity, humidity) 
                    VALUES (?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$soil_moisture_linguistic, $air_temperature_linguistic, $light_intensity_linguistic, $humidity_linguistic]);
            
            // Ambil ID yang baru saja dimasukkan
            $input_id = $pdo->lastInsertId();
            
            echo json_encode([
                'success' => true, 
                'message' => 'Parameter input berhasil disimpan',
                'input_id' => $input_id
            ]);
            break;
            
        case 'output_parameters':
            // Ambil nilai parameter output
            $irrigation_duration = isset($_POST['irrigation_duration']) ? sanitizeInput($_POST['irrigation_duration']) : '';
            $temperature_setting = isset($_POST['temperature_setting']) ? sanitizeInput($_POST['temperature_setting']) : '';
            $light_control = isset($_POST['light_control']) ? sanitizeInput($_POST['light_control']) : '';
            
            // Simpan parameter output ke database
            $sql = "INSERT INTO output_parameters (irrigation_duration, temperature_setting, light_control) 
                    VALUES (?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$irrigation_duration, $temperature_setting, $light_control]);
            
            // Ambil ID yang baru saja dimasukkan
            $output_id = $pdo->lastInsertId();
            
            echo json_encode([
                'success' => true, 
                'message' => 'Parameter output berhasil disimpan',
                'output_id' => $output_id
            ]);
            break;
            
        case 'fuzzy_rule':
            // Ambil nilai parameter untuk aturan fuzzy
            $soil_moisture = isset($_POST['soil_moisture']) ? sanitizeInput($_POST['soil_moisture']) : '';
            $air_temperature = isset($_POST['air_temperature']) ? sanitizeInput($_POST['air_temperature']) : '';
            $light_intensity = isset($_POST['light_intensity']) ? sanitizeInput($_POST['light_intensity']) : '';
            $humidity = isset($_POST['humidity']) ? sanitizeInput($_POST['humidity']) : '';
            $irrigation_duration = isset($_POST['irrigation_duration']) ? sanitizeInput($_POST['irrigation_duration']) : '';
            $temperature_setting = isset($_POST['temperature_setting']) ? sanitizeInput($_POST['temperature_setting']) : '';
            $light_control = isset($_POST['light_control']) ? sanitizeInput($_POST['light_control']) : '';
            
            // Simpan aturan fuzzy ke database
            $sql = "INSERT INTO fuzzy_rules (soil_moisture, air_temperature, light_intensity, humidity, 
                                            irrigation_duration, temperature_setting, light_control) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $soil_moisture, 
                $air_temperature, 
                $light_intensity, 
                $humidity, 
                $irrigation_duration, 
                $temperature_setting, 
                $light_control
            ]);
            
            // Ambil ID yang baru saja dimasukkan
            $rule_id = $pdo->lastInsertId();
            
            echo json_encode([
                'success' => true, 
                'message' => 'Aturan fuzzy berhasil disimpan',
                'rule_id' => $rule_id
            ]);
            break;
            
        default:
            // Tipe penyimpanan tidak dikenali
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Tipe penyimpanan tidak valid']);
            break;
    }
} catch (PDOException $e) {
    // Error pada database
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

/**
 * ------------ FUNGSI KONVERSI NILAI KE LINGUISTIK ------------
 */
function getSoilMoistureLinguistic($value) {
    if ($value < 30) {
        return 'kering';
    } elseif ($value < 60) {
        return 'sedang';
    } else {
        return 'basah';
    }
}

function getAirTemperatureLinguistic($value) {
    if ($value < 15) {
        return 'dingin';
    } elseif ($value < 25) {
        return 'sedang';
    } else {
        return 'panas';
    }
}

function getLightIntensityLinguistic($value) {
    if ($value < 300) {
        return 'rendah';
    } elseif ($value < 600) {
        return 'sedang';
    } else {
        return 'tinggi';
    }
}

function getHumidityLinguistic($value) {
    if ($value < 30) {
        return 'rendah';
    } elseif ($value < 60) {
        return 'sedang';
    } else {
        return 'tinggi';
    }
}
?>