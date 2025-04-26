<?php
/**
 * fuzzy_logic.php
 * 
 * File ini bertanggung jawab untuk melakukan perhitungan logika fuzzy
 * termasuk fuzzifikasi, inferensi fuzzy, dan defuzzifikasi
 * 
 * Diperbarui dengan 40 aturan fuzzy total dan kemampuan adaptif
 */

// Koneksi ke database
include('connect.php');

// Pastikan request adalah POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Metode tidak diizinkan']);
    exit;
}

// Ambil data input dari POST request
$soil_moisture = isset($_POST['soil_moisture']) ? (float) $_POST['soil_moisture'] : 0;
$air_temperature = isset($_POST['air_temperature']) ? (float) $_POST['air_temperature'] : 0;
$light_intensity = isset($_POST['light_intensity']) ? (float) $_POST['light_intensity'] : 0;
$humidity = isset($_POST['humidity']) ? (float) $_POST['humidity'] : 0;
$adaptive_mode = isset($_POST['adaptive_mode']) ? (bool) $_POST['adaptive_mode'] : false;

// Ambil parameter tanaman jika ada
$plant_stage = isset($_POST['plant_stage']) ? sanitizeInput($_POST['plant_stage']) : 'vegetative';
$plant_health = isset($_POST['plant_health']) ? (int) $_POST['plant_health'] : 100;

// Validasi input
if ($soil_moisture < 0 || $soil_moisture > 100 ||
    $air_temperature < 0 || $air_temperature > 50 ||
    $light_intensity < 0 || $light_intensity > 1000 ||
    $humidity < 0 || $humidity > 100) {
    http_response_code(400);
    echo json_encode(['error' => 'Nilai input tidak valid']);
    exit;
}

// Hasil perhitungan fuzzy
$fuzzyOutput = calculateFuzzyControl($soil_moisture, $air_temperature, $light_intensity, $humidity, $plant_stage, $plant_health, $adaptive_mode);

// Kembalikan hasil dalam format JSON
header('Content-Type: application/json');
echo json_encode($fuzzyOutput);
exit;

/**
 * ------------ FUNGSI KEANGGOTAAN KELEMBABAN TANAH ------------
 * Kering: 0-40%
 * Sedang: 30-70%
 * Basah: 60-100%
 */
function soilMoistureMembership($value) {
    $result = [
        'kering' => 0,
        'sedang' => 0,
        'basah' => 0
    ];
    
    // Fungsi keanggotaan Kering (0-40%)
    if ($value <= 30) {
        $result['kering'] = 1;
    } elseif ($value > 30 && $value < 40) {
        $result['kering'] = (40 - $value) / 10;
    }
    
    // Fungsi keanggotaan Sedang (30-70%)
    if ($value >= 30 && $value <= 50) {
        $result['sedang'] = ($value - 30) / 20;
    } elseif ($value > 50 && $value <= 70) {
        $result['sedang'] = (70 - $value) / 20;
    }
    
    // Fungsi keanggotaan Basah (60-100%)
    if ($value >= 60 && $value < 70) {
        $result['basah'] = ($value - 60) / 10;
    } elseif ($value >= 70) {
        $result['basah'] = 1;
    }
    
    return $result;
}

/**
 * ------------ FUNGSI KEANGGOTAAN SUHU UDARA ------------
 * Dingin: 0-20°C
 * Sedang: 15-30°C
 * Panas: 25-50°C
 */
function airTemperatureMembership($value) {
    $result = [
        'dingin' => 0,
        'sedang' => 0,
        'panas' => 0
    ];
    
    // Fungsi keanggotaan Dingin (0-20°C)
    if ($value <= 15) {
        $result['dingin'] = 1;
    } elseif ($value > 15 && $value < 20) {
        $result['dingin'] = (20 - $value) / 5;
    }
    
    // Fungsi keanggotaan Sedang (15-30°C)
    if ($value >= 15 && $value <= 22.5) {
        $result['sedang'] = ($value - 15) / 7.5;
    } elseif ($value > 22.5 && $value <= 30) {
        $result['sedang'] = (30 - $value) / 7.5;
    }
    
    // Fungsi keanggotaan Panas (25-50°C)
    if ($value >= 25 && $value < 30) {
        $result['panas'] = ($value - 25) / 5;
    } elseif ($value >= 30) {
        $result['panas'] = 1;
    }
    
    return $result;
}

/**
 * ------------ FUNGSI KEANGGOTAAN INTENSITAS CAHAYA ------------
 * Rendah: 0-400 lux
 * Sedang: 300-700 lux
 * Tinggi: 600-1000 lux
 */
function lightIntensityMembership($value) {
    $result = [
        'rendah' => 0,
        'sedang' => 0,
        'tinggi' => 0
    ];
    
    // Fungsi keanggotaan Rendah (0-400 lux)
    if ($value <= 300) {
        $result['rendah'] = 1;
    } elseif ($value > 300 && $value < 400) {
        $result['rendah'] = (400 - $value) / 100;
    }
    
    // Fungsi keanggotaan Sedang (300-700 lux)
    if ($value >= 300 && $value <= 500) {
        $result['sedang'] = ($value - 300) / 200;
    } elseif ($value > 500 && $value <= 700) {
        $result['sedang'] = (700 - $value) / 200;
    }
    
    // Fungsi keanggotaan Tinggi (600-1000 lux)
    if ($value >= 600 && $value < 700) {
        $result['tinggi'] = ($value - 600) / 100;
    } elseif ($value >= 700) {
        $result['tinggi'] = 1;
    }
    
    return $result;
}

/**
 * ------------ FUNGSI KEANGGOTAAN KELEMBABAN UDARA ------------
 * Rendah: 0-40%
 * Sedang: 30-70%
 * Tinggi: 60-100%
 */
function humidityMembership($value) {
    $result = [
        'rendah' => 0,
        'sedang' => 0,
        'tinggi' => 0
    ];
    
    // Fungsi keanggotaan Rendah (0-40%)
    if ($value <= 30) {
        $result['rendah'] = 1;
    } elseif ($value > 30 && $value < 40) {
        $result['rendah'] = (40 - $value) / 10;
    }
    
    // Fungsi keanggotaan Sedang (30-70%)
    if ($value >= 30 && $value <= 50) {
        $result['sedang'] = ($value - 30) / 20;
    } elseif ($value > 50 && $value <= 70) {
        $result['sedang'] = (70 - $value) / 20;
    }
    
    // Fungsi keanggotaan Tinggi (60-100%)
    if ($value >= 60 && $value < 70) {
        $result['tinggi'] = ($value - 60) / 10;
    } elseif ($value >= 70) {
        $result['tinggi'] = 1;
    }
    
    return $result;
}

/**
 * ------------ FUNGSI INFERENSI FUZZY ------------
 * Implementasi metode inferensi Mamdani (Min-Max)
 * Dengan 40 aturan fuzzy total
 */
function fuzzyInference(
    $soil_moisture_membership,
    $air_temperature_membership,
    $light_intensity_membership,
    $humidity_membership,
    $plant_stage = 'vegetative',
    $adaptive_mode = false
) {
    // Output untuk durasi irigasi (0-100 menit)
    $irrigation_membership = [
        'tidak_ada' => 0, // 0-20 menit
        'singkat' => 0,   // 10-40 menit
        'sedang' => 0,    // 30-70 menit
        'lama' => 0       // 60-100 menit
    ];
    
    // Output untuk pengaturan suhu (-10 sampai +10 derajat)
    $temperature_membership = [
        'menurunkan' => 0,    // -10 sampai -3 derajat
        'mempertahankan' => 0, // -5 sampai +5 derajat
        'menaikkan' => 0      // +3 sampai +10 derajat
    ];
    
    // Output untuk kontrol pencahayaan (0-100%)
    $light_control_membership = [
        'mati' => 0,    // 0-20%
        'redup' => 0,   // 10-40%
        'sedang' => 0,  // 30-70%
        'terang' => 0   // 60-100%
    ];

    // Load aturan fuzzy dari database jika mode adaptif aktif
    $rules = [];
    if ($adaptive_mode) {
        try {
            global $pdo;
            $adaptiveSQL = "SELECT * FROM fuzzy_rules WHERE active = 1";
            
            // Filter berdasarkan fase pertumbuhan tanaman jika ditentukan
            if (!empty($plant_stage)) {
                $adaptiveSQL .= " AND (plant_stage = ? OR plant_stage IS NULL OR plant_stage = '')";
            }
            
            $adaptiveSQL .= " ORDER BY confidence_level DESC, id ASC";
            
            $stmt = $pdo->prepare($adaptiveSQL);
            if (!empty($plant_stage)) {
                $stmt->execute([$plant_stage]);
            } else {
                $stmt->execute();
            }
            
            $rules = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            // Jika gagal mengambil dari database, gunakan aturan default
            error_log("Gagal mengambil aturan adaptif: " . $e->getMessage());
        }
    }
    
    // Jika tidak ada aturan dari database atau mode adaptif tidak aktif, gunakan aturan default
    if (empty($rules) || !$adaptive_mode) {
        // ##### 40 ATURAN FUZZY TOTAL #####
        
        // === ATURAN 1 ===
        // JIKA kelembaban tanah KERING dan suhu udara PANAS dan intensitas cahaya TINGGI dan kelembaban udara RENDAH
        // MAKA durasi irigasi LAMA, pengaturan suhu MENURUNKAN, kontrol pencahayaan REDUP
        $rule1 = min(
            $soil_moisture_membership['kering'],
            $air_temperature_membership['panas'],
            $light_intensity_membership['tinggi'],
            $humidity_membership['rendah']
        );
        $irrigation_membership['lama'] = max($irrigation_membership['lama'], $rule1);
        $temperature_membership['menurunkan'] = max($temperature_membership['menurunkan'], $rule1);
        $light_control_membership['redup'] = max($light_control_membership['redup'], $rule1);

        // === ATURAN 2 ===
        // JIKA kelembaban tanah KERING dan suhu udara PANAS dan intensitas cahaya TINGGI dan kelembaban udara SEDANG
        // MAKA durasi irigasi LAMA, pengaturan suhu MENURUNKAN, kontrol pencahayaan SEDANG
        $rule2 = min(
            $soil_moisture_membership['kering'],
            $air_temperature_membership['panas'],
            $light_intensity_membership['tinggi'],
            $humidity_membership['sedang']
        );
        $irrigation_membership['lama'] = max($irrigation_membership['lama'], $rule2);
        $temperature_membership['menurunkan'] = max($temperature_membership['menurunkan'], $rule2);
        $light_control_membership['sedang'] = max($light_control_membership['sedang'], $rule2);

        // === ATURAN 3 ===
        // JIKA kelembaban tanah KERING dan suhu udara PANAS dan intensitas cahaya SEDANG dan kelembaban udara RENDAH
        // MAKA durasi irigasi LAMA, pengaturan suhu MENURUNKAN, kontrol pencahayaan SEDANG
        $rule3 = min(
            $soil_moisture_membership['kering'],
            $air_temperature_membership['panas'],
            $light_intensity_membership['sedang'],
            $humidity_membership['rendah']
        );
        $irrigation_membership['lama'] = max($irrigation_membership['lama'], $rule3);
        $temperature_membership['menurunkan'] = max($temperature_membership['menurunkan'], $rule3);
        $light_control_membership['sedang'] = max($light_control_membership['sedang'], $rule3);

        // === ATURAN 4 ===
        // JIKA kelembaban tanah KERING dan suhu udara SEDANG dan intensitas cahaya RENDAH dan kelembaban udara RENDAH
        // MAKA durasi irigasi LAMA, pengaturan suhu MEMPERTAHANKAN, kontrol pencahayaan TERANG
        $rule4 = min(
            $soil_moisture_membership['kering'],
            $air_temperature_membership['sedang'],
            $light_intensity_membership['rendah'],
            $humidity_membership['rendah']
        );
        $irrigation_membership['lama'] = max($irrigation_membership['lama'], $rule4);
        $temperature_membership['mempertahankan'] = max($temperature_membership['mempertahankan'], $rule4);
        $light_control_membership['terang'] = max($light_control_membership['terang'], $rule4);

        // === ATURAN 5 ===
        // JIKA kelembaban tanah KERING dan suhu udara DINGIN dan intensitas cahaya RENDAH dan kelembaban udara RENDAH
        // MAKA durasi irigasi SEDANG, pengaturan suhu MENAIKKAN, kontrol pencahayaan TERANG
        $rule5 = min(
            $soil_moisture_membership['kering'],
            $air_temperature_membership['dingin'],
            $light_intensity_membership['rendah'],
            $humidity_membership['rendah']
        );
        $irrigation_membership['sedang'] = max($irrigation_membership['sedang'], $rule5);
        $temperature_membership['menaikkan'] = max($temperature_membership['menaikkan'], $rule5);
        $light_control_membership['terang'] = max($light_control_membership['terang'], $rule5);

        // === ATURAN 6 ===
        // JIKA kelembaban tanah SEDANG dan suhu udara PANAS dan intensitas cahaya TINGGI dan kelembaban udara RENDAH
        // MAKA durasi irigasi SEDANG, pengaturan suhu MENURUNKAN, kontrol pencahayaan REDUP
        $rule6 = min(
            $soil_moisture_membership['sedang'],
            $air_temperature_membership['panas'],
            $light_intensity_membership['tinggi'],
            $humidity_membership['rendah']
        );
        $irrigation_membership['sedang'] = max($irrigation_membership['sedang'], $rule6);
        $temperature_membership['menurunkan'] = max($temperature_membership['menurunkan'], $rule6);
        $light_control_membership['redup'] = max($light_control_membership['redup'], $rule6);

        // === ATURAN 7 ===
        // JIKA kelembaban tanah SEDANG dan suhu udara SEDANG dan intensitas cahaya SEDANG dan kelembaban udara SEDANG
        // MAKA durasi irigasi SEDANG, pengaturan suhu MEMPERTAHANKAN, kontrol pencahayaan SEDANG
        $rule7 = min(
            $soil_moisture_membership['sedang'],
            $air_temperature_membership['sedang'],
            $light_intensity_membership['sedang'],
            $humidity_membership['sedang']
        );
        $irrigation_membership['sedang'] = max($irrigation_membership['sedang'], $rule7);
        $temperature_membership['mempertahankan'] = max($temperature_membership['mempertahankan'], $rule7);
        $light_control_membership['sedang'] = max($light_control_membership['sedang'], $rule7);

        // === ATURAN 8 ===
        // JIKA kelembaban tanah SEDANG dan suhu udara DINGIN dan intensitas cahaya RENDAH dan kelembaban udara TINGGI
        // MAKA durasi irigasi SINGKAT, pengaturan suhu MENAIKKAN, kontrol pencahayaan TERANG
        $rule8 = min(
            $soil_moisture_membership['sedang'],
            $air_temperature_membership['dingin'],
            $light_intensity_membership['rendah'],
            $humidity_membership['tinggi']
        );
        $irrigation_membership['singkat'] = max($irrigation_membership['singkat'], $rule8);
        $temperature_membership['menaikkan'] = max($temperature_membership['menaikkan'], $rule8);
        $light_control_membership['terang'] = max($light_control_membership['terang'], $rule8);

        // === ATURAN 9 ===
        // JIKA kelembaban tanah BASAH dan suhu udara PANAS dan intensitas cahaya TINGGI dan kelembaban udara SEDANG
        // MAKA durasi irigasi TIDAK_ADA, pengaturan suhu MENURUNKAN, kontrol pencahayaan REDUP
        $rule9 = min(
            $soil_moisture_membership['basah'],
            $air_temperature_membership['panas'],
            $light_intensity_membership['tinggi'],
            $humidity_membership['sedang']
        );
        $irrigation_membership['tidak_ada'] = max($irrigation_membership['tidak_ada'], $rule9);
        $temperature_membership['menurunkan'] = max($temperature_membership['menurunkan'], $rule9);
        $light_control_membership['redup'] = max($light_control_membership['redup'], $rule9);

        // === ATURAN 10 ===
        // JIKA kelembaban tanah BASAH dan suhu udara SEDANG dan intensitas cahaya SEDANG dan kelembaban udara TINGGI
        // MAKA durasi irigasi TIDAK_ADA, pengaturan suhu MEMPERTAHANKAN, kontrol pencahayaan SEDANG
        $rule10 = min(
            $soil_moisture_membership['basah'],
            $air_temperature_membership['sedang'],
            $light_intensity_membership['sedang'],
            $humidity_membership['tinggi']
        );
        $irrigation_membership['tidak_ada'] = max($irrigation_membership['tidak_ada'], $rule10);
        $temperature_membership['mempertahankan'] = max($temperature_membership['mempertahankan'], $rule10);
        $light_control_membership['sedang'] = max($light_control_membership['sedang'], $rule10);

        // === ATURAN 11 ===
        // JIKA kelembaban tanah KERING dan suhu udara SEDANG dan intensitas cahaya SEDANG dan kelembaban udara SEDANG
        // MAKA durasi irigasi LAMA, pengaturan suhu MEMPERTAHANKAN, kontrol pencahayaan SEDANG
        $rule11 = min(
            $soil_moisture_membership['kering'],
            $air_temperature_membership['sedang'],
            $light_intensity_membership['sedang'],
            $humidity_membership['sedang']
        );
        $irrigation_membership['lama'] = max($irrigation_membership['lama'], $rule11);
        $temperature_membership['mempertahankan'] = max($temperature_membership['mempertahankan'], $rule11);
        $light_control_membership['sedang'] = max($light_control_membership['sedang'], $rule11);

        // === ATURAN 12 ===
        // JIKA kelembaban tanah SEDANG dan suhu udara PANAS dan intensitas cahaya SEDANG dan kelembaban udara RENDAH
        // MAKA durasi irigasi SEDANG, pengaturan suhu MENURUNKAN, kontrol pencahayaan SEDANG
        $rule12 = min(
            $soil_moisture_membership['sedang'],
            $air_temperature_membership['panas'],
            $light_intensity_membership['sedang'],
            $humidity_membership['rendah']
        );
        $irrigation_membership['sedang'] = max($irrigation_membership['sedang'], $rule12);
        $temperature_membership['menurunkan'] = max($temperature_membership['menurunkan'], $rule12);
        $light_control_membership['sedang'] = max($light_control_membership['sedang'], $rule12);

        // === ATURAN 13 ===
        // JIKA kelembaban tanah BASAH dan suhu udara DINGIN dan intensitas cahaya TINGGI dan kelembaban udara RENDAH
        // MAKA durasi irigasi TIDAK_ADA, pengaturan suhu MENAIKKAN, kontrol pencahayaan REDUP
        $rule13 = min(
            $soil_moisture_membership['basah'],
            $air_temperature_membership['dingin'],
            $light_intensity_membership['tinggi'],
            $humidity_membership['rendah']
        );
        $irrigation_membership['tidak_ada'] = max($irrigation_membership['tidak_ada'], $rule13);
        $temperature_membership['menaikkan'] = max($temperature_membership['menaikkan'], $rule13);
        $light_control_membership['redup'] = max($light_control_membership['redup'], $rule13);

        // === ATURAN 14 ===
        // JIKA kelembaban tanah KERING dan suhu udara DINGIN dan intensitas cahaya SEDANG dan kelembaban udara TINGGI
        // MAKA durasi irigasi SEDANG, pengaturan suhu MENAIKKAN, kontrol pencahayaan SEDANG
        $rule14 = min(
            $soil_moisture_membership['kering'],
            $air_temperature_membership['dingin'],
            $light_intensity_membership['sedang'],
            $humidity_membership['tinggi']
        );
        $irrigation_membership['sedang'] = max($irrigation_membership['sedang'], $rule14);
        $temperature_membership['menaikkan'] = max($temperature_membership['menaikkan'], $rule14);
        $light_control_membership['sedang'] = max($light_control_membership['sedang'], $rule14);

        // === ATURAN 15 ===
        // JIKA kelembaban tanah SEDANG dan suhu udara SEDANG dan intensitas cahaya TINGGI dan kelembaban udara SEDANG
        // MAKA durasi irigasi SEDANG, pengaturan suhu MEMPERTAHANKAN, kontrol pencahayaan REDUP
        $rule15 = min(
            $soil_moisture_membership['sedang'],
            $air_temperature_membership['sedang'],
            $light_intensity_membership['tinggi'],
            $humidity_membership['sedang']
        );
        $irrigation_membership['sedang'] = max($irrigation_membership['sedang'], $rule15);
        $temperature_membership['mempertahankan'] = max($temperature_membership['mempertahankan'], $rule15);
        $light_control_membership['redup'] = max($light_control_membership['redup'], $rule15);

        // === ATURAN 16 ===
        // JIKA kelembaban tanah BASAH dan suhu udara PANAS dan intensitas cahaya RENDAH dan kelembaban udara RENDAH
        // MAKA durasi irigasi TIDAK_ADA, pengaturan suhu MENURUNKAN, kontrol pencahayaan TERANG
        $rule16 = min(
            $soil_moisture_membership['basah'],
            $air_temperature_membership['panas'],
            $light_intensity_membership['rendah'],
            $humidity_membership['rendah']
        );
        $irrigation_membership['tidak_ada'] = max($irrigation_membership['tidak_ada'], $rule16);
        $temperature_membership['menurunkan'] = max($temperature_membership['menurunkan'], $rule16);
        $light_control_membership['terang'] = max($light_control_membership['terang'], $rule16);

        // === ATURAN 17 ===
        // JIKA kelembaban tanah KERING dan suhu udara SEDANG dan intensitas cahaya TINGGI dan kelembaban udara RENDAH
        // MAKA durasi irigasi LAMA, pengaturan suhu MEMPERTAHANKAN, kontrol pencahayaan REDUP
        $rule17 = min(
            $soil_moisture_membership['kering'],
            $air_temperature_membership['sedang'],
            $light_intensity_membership['tinggi'],
            $humidity_membership['rendah']
        );
        $irrigation_membership['lama'] = max($irrigation_membership['lama'], $rule17);
        $temperature_membership['mempertahankan'] = max($temperature_membership['mempertahankan'], $rule17);
        $light_control_membership['redup'] = max($light_control_membership['redup'], $rule17);

        // === ATURAN 18 ===
        // JIKA kelembaban tanah SEDANG dan suhu udara DINGIN dan intensitas cahaya SEDANG dan kelembaban udara SEDANG
        // MAKA durasi irigasi SINGKAT, pengaturan suhu MENAIKKAN, kontrol pencahayaan SEDANG
        $rule18 = min(
            $soil_moisture_membership['sedang'],
            $air_temperature_membership['dingin'],
            $light_intensity_membership['sedang'],
            $humidity_membership['sedang']
        );
        $irrigation_membership['singkat'] = max($irrigation_membership['singkat'], $rule18);
        $temperature_membership['menaikkan'] = max($temperature_membership['menaikkan'], $rule18);
        $light_control_membership['sedang'] = max($light_control_membership['sedang'], $rule18);

        // === ATURAN 19 ===
        // JIKA kelembaban tanah BASAH dan suhu udara DINGIN dan intensitas cahaya SEDANG dan kelembaban udara TINGGI
        // MAKA durasi irigasi TIDAK_ADA, pengaturan suhu MENAIKKAN, kontrol pencahayaan SEDANG
        $rule19 = min(
            $soil_moisture_membership['basah'],
            $air_temperature_membership['dingin'],
            $light_intensity_membership['sedang'],
            $humidity_membership['tinggi']
        );
        $irrigation_membership['tidak_ada'] = max($irrigation_membership['tidak_ada'], $rule19);
        $temperature_membership['menaikkan'] = max($temperature_membership['menaikkan'], $rule19);
        $light_control_membership['sedang'] = max($light_control_membership['sedang'], $rule19);

        // === ATURAN 20 ===
        // JIKA kelembaban tanah KERING dan suhu udara PANAS dan intensitas cahaya RENDAH dan kelembaban udara TINGGI
        // MAKA durasi irigasi LAMA, pengaturan suhu MENURUNKAN, kontrol pencahayaan SEDANG
        $rule20 = min(
            $soil_moisture_membership['kering'],
            $air_temperature_membership['panas'],
            $light_intensity_membership['rendah'],
            $humidity_membership['tinggi']
        );
        $irrigation_membership['lama'] = max($irrigation_membership['lama'], $rule20);
        $temperature_membership['menurunkan'] = max($temperature_membership['menurunkan'], $rule20);
        $light_control_membership['sedang'] = max($light_control_membership['sedang'], $rule20);

        // *** ATURAN TAMBAHAN (21-40) ***

        // === ATURAN 21 ===
        // JIKA kelembaban tanah BASAH dan suhu udara DINGIN dan intensitas cahaya RENDAH dan kelembaban udara SEDANG
        // MAKA durasi irigasi TIDAK_ADA, pengaturan suhu MENAIKKAN, kontrol pencahayaan TERANG
        $rule21 = min(
            $soil_moisture_membership['basah'],
            $air_temperature_membership['dingin'],
            $light_intensity_membership['rendah'],
            $humidity_membership['sedang']
        );
        $irrigation_membership['tidak_ada'] = max($irrigation_membership['tidak_ada'], $rule21);
        $temperature_membership['menaikkan'] = max($temperature_membership['menaikkan'], $rule21);
        $light_control_membership['terang'] = max($light_control_membership['terang'], $rule21);

        // === ATURAN 22 ===
        // JIKA kelembaban tanah BASAH dan suhu udara DINGIN dan intensitas cahaya RENDAH dan kelembaban udara RENDAH
        // MAKA durasi irigasi SINGKAT, pengaturan suhu MENAIKKAN, kontrol pencahayaan TERANG
        $rule22 = min(
            $soil_moisture_membership['basah'],
            $air_temperature_membership['dingin'],
            $light_intensity_membership['rendah'],
            $humidity_membership['rendah']
        );
        $irrigation_membership['singkat'] = max($irrigation_membership['singkat'], $rule22);
        $temperature_membership['menaikkan'] = max($temperature_membership['menaikkan'], $rule22);
        $light_control_membership['terang'] = max($light_control_membership['terang'], $rule22);

        // === ATURAN 23 ===
        // JIKA kelembaban tanah BASAH dan suhu udara SEDANG dan intensitas cahaya RENDAH dan kelembaban udara RENDAH
        // MAKA durasi irigasi SINGKAT, pengaturan suhu MEMPERTAHANKAN, kontrol pencahayaan TERANG
        $rule23 = min(
            $soil_moisture_membership['basah'],
            $air_temperature_membership['sedang'],
            $light_intensity_membership['rendah'],
            $humidity_membership['rendah']
        );
        $irrigation_membership['singkat'] = max($irrigation_membership['singkat'], $rule23);
        $temperature_membership['mempertahankan'] = max($temperature_membership['mempertahankan'], $rule23);
        $light_control_membership['terang'] = max($light_control_membership['terang'], $rule23);

        // === ATURAN 24 ===
        // JIKA kelembaban tanah SEDANG dan suhu udara SEDANG dan intensitas cahaya RENDAH dan kelembaban udara RENDAH
        // MAKA durasi irigasi SEDANG, pengaturan suhu MEMPERTAHANKAN, kontrol pencahayaan TERANG
        $rule24 = min(
            $soil_moisture_membership['sedang'],
            $air_temperature_membership['sedang'],
            $light_intensity_membership['rendah'],
            $humidity_membership['rendah']
        );
        $irrigation_membership['sedang'] = max($irrigation_membership['sedang'], $rule24);
        $temperature_membership['mempertahankan'] = max($temperature_membership['mempertahankan'], $rule24);
        $light_control_membership['terang'] = max($light_control_membership['terang'], $rule24);

        // === ATURAN 25 ===
        // JIKA kelembaban tanah KERING dan suhu udara DINGIN dan intensitas cahaya TINGGI dan kelembaban udara RENDAH
        // MAKA durasi irigasi LAMA, pengaturan suhu MENAIKKAN, kontrol pencahayaan MATI
        $rule25 = min(
            $soil_moisture_membership['kering'],
            $air_temperature_membership['dingin'],
            $light_intensity_membership['tinggi'],
            $humidity_membership['rendah']
        );
        $irrigation_membership['lama'] = max($irrigation_membership['lama'], $rule25);
        $temperature_membership['menaikkan'] = max($temperature_membership['menaikkan'], $rule25);
        $light_control_membership['mati'] = max($light_control_membership['mati'], $rule25);

        // === ATURAN 26 ===
        // JIKA kelembaban tanah KERING dan suhu udara PANAS dan intensitas cahaya RENDAH dan kelembaban udara RENDAH
        // MAKA durasi irigasi LAMA, pengaturan suhu MENURUNKAN, kontrol pencahayaan SEDANG
        $rule26 = min(
            $soil_moisture_membership['kering'],
            $air_temperature_membership['panas'],
            $light_intensity_membership['rendah'],
            $humidity_membership['rendah']
        );
        $irrigation_membership['lama'] = max($irrigation_membership['lama'], $rule26);
        $temperature_membership['menurunkan'] = max($temperature_membership['menurunkan'], $rule26);
        $light_control_membership['sedang'] = max($light_control_membership['sedang'], $rule26);

        // === ATURAN 27 ===
        // JIKA kelembaban tanah KERING dan suhu udara PANAS dan intensitas cahaya SEDANG dan kelembaban udara SEDANG
        // MAKA durasi irigasi LAMA, pengaturan suhu MENURUNKAN, kontrol pencahayaan SEDANG
        $rule27 = min(
            $soil_moisture_membership['kering'],
            $air_temperature_membership['panas'],
            $light_intensity_membership['sedang'],
            $humidity_membership['sedang']
        );
        $irrigation_membership['lama'] = max($irrigation_membership['lama'], $rule27);
        $temperature_membership['menurunkan'] = max($temperature_membership['menurunkan'], $rule27);
        $light_control_membership['sedang'] = max($light_control_membership['sedang'], $rule27);

        // === ATURAN 28 ===
        // JIKA kelembaban tanah KERING dan suhu udara PANAS dan intensitas cahaya TINGGI dan kelembaban udara TINGGI
        // MAKA durasi irigasi SEDANG, pengaturan suhu MENURUNKAN, kontrol pencahayaan MATI
        $rule28 = min(
            $soil_moisture_membership['kering'],
            $air_temperature_membership['panas'],
            $light_intensity_membership['tinggi'],
            $humidity_membership['tinggi']
        );
        $irrigation_membership['sedang'] = max($irrigation_membership['sedang'], $rule28);
        $temperature_membership['menurunkan'] = max($temperature_membership['menurunkan'], $rule28);
        $light_control_membership['mati'] = max($light_control_membership['mati'], $rule28);

        // === ATURAN 29 ===
        // JIKA kelembaban tanah SEDANG dan suhu udara PANAS dan intensitas cahaya TINGGI dan kelembaban udara TINGGI
        // MAKA durasi irigasi SINGKAT, pengaturan suhu MENURUNKAN, kontrol pencahayaan MATI
        $rule29 = min(
            $soil_moisture_membership['sedang'],
            $air_temperature_membership['panas'],
            $light_intensity_membership['tinggi'],
            $humidity_membership['tinggi']
        );
        $irrigation_membership['singkat'] = max($irrigation_membership['singkat'], $rule29);
        $temperature_membership['menurunkan'] = max($temperature_membership['menurunkan'], $rule29);
        $light_control_membership['mati'] = max($light_control_membership['mati'], $rule29);

        // === ATURAN 30 ===
        // JIKA kelembaban tanah BASAH dan suhu udara PANAS dan intensitas cahaya TINGGI dan kelembaban udara TINGGI
        // MAKA durasi irigasi TIDAK_ADA, pengaturan suhu MENURUNKAN, kontrol pencahayaan MATI
        $rule30 = min(
            $soil_moisture_membership['basah'],
            $air_temperature_membership['panas'],
            $light_intensity_membership['tinggi'],
            $humidity_membership['tinggi']
        );
        $irrigation_membership['tidak_ada'] = max($irrigation_membership['tidak_ada'], $rule30);
        $temperature_membership['menurunkan'] = max($temperature_membership['menurunkan'], $rule30);
        $light_control_membership['mati'] = max($light_control_membership['mati'], $rule30);

        // === ATURAN 31 ===
        // JIKA kelembaban tanah BASAH dan suhu udara SEDANG dan intensitas cahaya RENDAH dan kelembaban udara TINGGI
        // MAKA durasi irigasi TIDAK_ADA, pengaturan suhu MEMPERTAHANKAN, kontrol pencahayaan TERANG
        $rule31 = min(
            $soil_moisture_membership['basah'],
            $air_temperature_membership['sedang'],
            $light_intensity_membership['rendah'],
            $humidity_membership['tinggi']
        );
        $irrigation_membership['tidak_ada'] = max($irrigation_membership['tidak_ada'], $rule31);
        $temperature_membership['mempertahankan'] = max($temperature_membership['mempertahankan'], $rule31);
        $light_control_membership['terang'] = max($light_control_membership['terang'], $rule31);

        // === ATURAN 32 ===
        // JIKA kelembaban tanah BASAH dan suhu udara SEDANG dan intensitas cahaya TINGGI dan kelembaban udara RENDAH
        // MAKA durasi irigasi SINGKAT, pengaturan suhu MEMPERTAHANKAN, kontrol pencahayaan REDUP
        $rule32 = min(
            $soil_moisture_membership['basah'],
            $air_temperature_membership['sedang'],
            $light_intensity_membership['tinggi'],
            $humidity_membership['rendah']
        );
        $irrigation_membership['singkat'] = max($irrigation_membership['singkat'], $rule32);
        $temperature_membership['mempertahankan'] = max($temperature_membership['mempertahankan'], $rule32);
        $light_control_membership['redup'] = max($light_control_membership['redup'], $rule32);

        // === ATURAN 33 ===
        // JIKA kelembaban tanah SEDANG dan suhu udara DINGIN dan intensitas cahaya TINGGI dan kelembaban udara TINGGI
        // MAKA durasi irigasi SINGKAT, pengaturan suhu MENAIKKAN, kontrol pencahayaan MATI
        $rule33 = min(
            $soil_moisture_membership['sedang'],
            $air_temperature_membership['dingin'],
            $light_intensity_membership['tinggi'],
            $humidity_membership['tinggi']
        );
        $irrigation_membership['singkat'] = max($irrigation_membership['singkat'], $rule33);
        $temperature_membership['menaikkan'] = max($temperature_membership['menaikkan'], $rule33);
        $light_control_membership['mati'] = max($light_control_membership['mati'], $rule33);

        // === ATURAN 34 ===
        // JIKA kelembaban tanah SEDANG dan suhu udara PANAS dan intensitas cahaya RENDAH dan kelembaban udara TINGGI
        // MAKA durasi irigasi SEDANG, pengaturan suhu MENURUNKAN, kontrol pencahayaan TERANG
        $rule34 = min(
            $soil_moisture_membership['sedang'],
            $air_temperature_membership['panas'],
            $light_intensity_membership['rendah'],
            $humidity_membership['tinggi']
        );
        $irrigation_membership['sedang'] = max($irrigation_membership['sedang'], $rule34);
        $temperature_membership['menurunkan'] = max($temperature_membership['menurunkan'], $rule34);
        $light_control_membership['terang'] = max($light_control_membership['terang'], $rule34);

        // === ATURAN 35 ===
        // JIKA kelembaban tanah KERING dan suhu udara DINGIN dan intensitas cahaya TINGGI dan kelembaban udara TINGGI
        // MAKA durasi irigasi LAMA, pengaturan suhu MENAIKKAN, kontrol pencahayaan MATI
        $rule35 = min(
            $soil_moisture_membership['kering'],
            $air_temperature_membership['dingin'],
            $light_intensity_membership['tinggi'],
            $humidity_membership['tinggi']
        );
        $irrigation_membership['lama'] = max($irrigation_membership['lama'], $rule35);
        $temperature_membership['menaikkan'] = max($temperature_membership['menaikkan'], $rule35);
        $light_control_membership['mati'] = max($light_control_membership['mati'], $rule35);

        // === ATURAN 36 ===
        // JIKA kelembaban tanah KERING dan suhu udara SEDANG dan intensitas cahaya SEDANG dan kelembaban udara TINGGI
        // MAKA durasi irigasi LAMA, pengaturan suhu MEMPERTAHANKAN, kontrol pencahayaan SEDANG
        $rule36 = min(
            $soil_moisture_membership['kering'],
            $air_temperature_membership['sedang'],
            $light_intensity_membership['sedang'],
            $humidity_membership['tinggi']
        );
        $irrigation_membership['lama'] = max($irrigation_membership['lama'], $rule36);
        $temperature_membership['mempertahankan'] = max($temperature_membership['mempertahankan'], $rule36);
        $light_control_membership['sedang'] = max($light_control_membership['sedang'], $rule36);

        // === ATURAN 37 ===
        // JIKA kelembaban tanah KERING dan suhu udara DINGIN dan intensitas cahaya RENDAH dan kelembaban udara TINGGI
        // MAKA durasi irigasi LAMA, pengaturan suhu MENAIKKAN, kontrol pencahayaan TERANG
        $rule37 = min(
            $soil_moisture_membership['kering'],
            $air_temperature_membership['dingin'],
            $light_intensity_membership['rendah'],
            $humidity_membership['tinggi']
        );
        $irrigation_membership['lama'] = max($irrigation_membership['lama'], $rule37);
        $temperature_membership['menaikkan'] = max($temperature_membership['menaikkan'], $rule37);
        $light_control_membership['terang'] = max($light_control_membership['terang'], $rule37);

        // === ATURAN 38 ===
        // JIKA kelembaban tanah SEDANG dan suhu udara DINGIN dan intensitas cahaya TINGGI dan kelembaban udara SEDANG
        // MAKA durasi irigasi SEDANG, pengaturan suhu MENAIKKAN, kontrol pencahayaan REDUP
        $rule38 = min(
            $soil_moisture_membership['sedang'],
            $air_temperature_membership['dingin'],
            $light_intensity_membership['tinggi'],
            $humidity_membership['sedang']
        );
        $irrigation_membership['sedang'] = max($irrigation_membership['sedang'], $rule38);
        $temperature_membership['menaikkan'] = max($temperature_membership['menaikkan'], $rule38);
        $light_control_membership['redup'] = max($light_control_membership['redup'], $rule38);

        // === ATURAN 39 ===
        // JIKA kelembaban tanah BASAH dan suhu udara PANAS dan intensitas cahaya SEDANG dan kelembaban udara SEDANG
        // MAKA durasi irigasi TIDAK_ADA, pengaturan suhu MENURUNKAN, kontrol pencahayaan SEDANG
        $rule39 = min(
            $soil_moisture_membership['basah'],
            $air_temperature_membership['panas'],
            $light_intensity_membership['sedang'],
            $humidity_membership['sedang']
        );
        $irrigation_membership['tidak_ada'] = max($irrigation_membership['tidak_ada'], $rule39);
        $temperature_membership['menurunkan'] = max($temperature_membership['menurunkan'], $rule39);
        $light_control_membership['sedang'] = max($light_control_membership['sedang'], $rule39);

        // === ATURAN 40 ===
        // JIKA kelembaban tanah BASAH dan suhu udara PANAS dan intensitas cahaya RENDAH dan kelembaban udara TINGGI
        // MAKA durasi irigasi TIDAK_ADA, pengaturan suhu MENURUNKAN, kontrol pencahayaan SEDANG
        $rule40 = min(
            $soil_moisture_membership['basah'],
            $air_temperature_membership['panas'],
            $light_intensity_membership['rendah'],
            $humidity_membership['tinggi']
        );
        $irrigation_membership['tidak_ada'] = max($irrigation_membership['tidak_ada'], $rule40);
        $temperature_membership['menurunkan'] = max($temperature_membership['menurunkan'], $rule40);
        $light_control_membership['sedang'] = max($light_control_membership['sedang'], $rule40);
    } else {
        // Jika menggunakan aturan dari database (mode adaptif)
        foreach ($rules as $rule) {
            // Evaluasi setiap aturan
            $ruleStrength = min(
                $soil_moisture_membership[$rule['soil_moisture']],
                $air_temperature_membership[$rule['air_temperature']],
                $light_intensity_membership[$rule['light_intensity']],
                $humidity_membership[$rule['humidity']]
            );
            
            // Jika ada faktor kepercayaan dalam database, gunakan itu
            if (isset($rule['confidence_level']) && $rule['confidence_level'] > 0) {
                $ruleStrength = $ruleStrength * ($rule['confidence_level'] / 100);
            }
            
            // Terapkan hasil ke output
            $irrigation_membership[$rule['irrigation_duration']] = max(
                $irrigation_membership[$rule['irrigation_duration']], 
                $ruleStrength
            );
            
            $temperature_membership[$rule['temperature_setting']] = max(
                $temperature_membership[$rule['temperature_setting']], 
                $ruleStrength
            );
            
            $light_control_membership[$rule['light_control']] = max(
                $light_control_membership[$rule['light_control']], 
                $ruleStrength
            );
        }
    }

    // Sesuaikan berdasarkan fase tanaman jika ada
    if (!empty($plant_stage)) {
        // Lakukan penyesuaian output berdasarkan tahap pertumbuhan
        switch ($plant_stage) {
            case 'seedling': // Bibit
                // Bibit membutuhkan kelembaban tinggi, suhu lebih hangat, dan cahaya rendah-sedang
                $irrigation_membership['tidak_ada'] *= 0.7;
                $irrigation_membership['singkat'] *= 1.2;
                $irrigation_membership['sedang'] *= 1.3;
                $irrigation_membership['lama'] *= 1.0;
                
                $temperature_membership['menurunkan'] *= 0.8;
                $temperature_membership['mempertahankan'] *= 1.1;
                $temperature_membership['menaikkan'] *= 1.3;
                
                $light_control_membership['mati'] *= 0.7;
                $light_control_membership['redup'] *= 1.3;
                $light_control_membership['sedang'] *= 1.2;
                $light_control_membership['terang'] *= 0.9;
                break;
                
            case 'vegetative': // Fase pertumbuhan vegetatif
                // Pertumbuhan vegetatif membutuhkan lebih banyak air dan nutrisi
                $irrigation_membership['tidak_ada'] *= 0.8;
                $irrigation_membership['singkat'] *= 1.0;
                $irrigation_membership['sedang'] *= 1.2;
                $irrigation_membership['lama'] *= 1.1;
                
                $temperature_membership['menurunkan'] *= 0.9;
                $temperature_membership['mempertahankan'] *= 1.2;
                $temperature_membership['menaikkan'] *= 1.0;
                
                $light_control_membership['mati'] *= 0.7;
                $light_control_membership['redup'] *= 0.9;
                $light_control_membership['sedang'] *= 1.2;
                $light_control_membership['terang'] *= 1.3;
                break;
                
            case 'flowering': // Fase berbunga
                // Fase berbunga perlu cahaya lebih tinggi, kelembaban sedang
                $irrigation_membership['tidak_ada'] *= 0.9;
                $irrigation_membership['singkat'] *= 1.1;
                $irrigation_membership['sedang'] *= 1.2;
                $irrigation_membership['lama'] *= 0.9;
                
                $temperature_membership['menurunkan'] *= 1.0;
                $temperature_membership['mempertahankan'] *= 1.3;
                $temperature_membership['menaikkan'] *= 0.9;
                
                $light_control_membership['mati'] *= 0.6;
                $light_control_membership['redup'] *= 0.8;
                $light_control_membership['sedang'] *= 1.1;
                $light_control_membership['terang'] *= 1.4;
                break;
                
            case 'fruiting': // Fase berbuah
                // Fase berbuah perlu cahaya tinggi, kelembaban tanah yang konsisten
                $irrigation_membership['tidak_ada'] *= 0.7;
                $irrigation_membership['singkat'] *= 0.9;
                $irrigation_membership['sedang'] *= 1.3;
                $irrigation_membership['lama'] *= 1.1;
                
                $temperature_membership['menurunkan'] *= 1.1;
                $temperature_membership['mempertahankan'] *= 1.3;
                $temperature_membership['menaikkan'] *= 0.8;
                
                $light_control_membership['mati'] *= 0.5;
                $light_control_membership['redup'] *= 0.7;
                $light_control_membership['sedang'] *= 1.0;
                $light_control_membership['terang'] *= 1.5;
                break;
                
            case 'harvesting': // Fase panen
                // Fase panen perlu mengurangi air untuk meningkatkan rasa
                $irrigation_membership['tidak_ada'] *= 1.2;
                $irrigation_membership['singkat'] *= 1.3;
                $irrigation_membership['sedang'] *= 0.9;
                $irrigation_membership['lama'] *= 0.7;
                
                $temperature_membership['menurunkan'] *= 1.0;
                $temperature_membership['mempertahankan'] *= 1.2;
                $temperature_membership['menaikkan'] *= 0.9;
                
                $light_control_membership['mati'] *= 0.6;
                $light_control_membership['redup'] *= 0.8;
                $light_control_membership['sedang'] *= 1.2;
                $light_control_membership['terang'] *= 1.3;
                break;
        }
    }

    return [
        'irrigation' => $irrigation_membership,
        'temperature' => $temperature_membership,
        'light_control' => $light_control_membership
    ];
}

/**
 * ------------ FUNGSI DEFUZZIFIKASI ------------
 * Metode Centroid (Center of Gravity)
 */
function defuzzifyIrrigation($irrigation_membership) {
    // Definisi rentang nilai output untuk durasi irigasi
    $tidak_ada_range = range(0, 20);
    $singkat_range = range(10, 40);
    $sedang_range = range(30, 70);
    $lama_range = range(60, 100);
    
    $numerator = 0;
    $denominator = 0;
    
    // Hitung untuk setiap nilai dalam rentang
    foreach ($tidak_ada_range as $i) {
        // Fungsi keanggotaan trapesium untuk tidak ada
        $membership = ($i <= 10) ? 1 : (20 - $i) / 10;
        $membership = min($membership, $irrigation_membership['tidak_ada']);
        $numerator += $i * $membership;
        $denominator += $membership;
    }
    
    foreach ($singkat_range as $i) {
        // Fungsi keanggotaan segitiga untuk singkat
        if ($i < 10) {
            $membership = 0;
        } elseif ($i >= 10 && $i <= 25) {
            $membership = ($i - 10) / 15;
        } else {
            $membership = (40 - $i) / 15;
        }
        $membership = min($membership, $irrigation_membership['singkat']);
        $numerator += $i * $membership;
        $denominator += $membership;
    }
    
    foreach ($sedang_range as $i) {
        // Fungsi keanggotaan segitiga untuk sedang
        if ($i < 30) {
            $membership = 0;
        } elseif ($i >= 30 && $i <= 50) {
            $membership = ($i - 30) / 20;
        } else {
            $membership = (70 - $i) / 20;
        }
        $membership = min($membership, $irrigation_membership['sedang']);
        $numerator += $i * $membership;
        $denominator += $membership;
    }
    
    foreach ($lama_range as $i) {
        // Fungsi keanggotaan trapesium untuk lama
        $membership = ($i < 60) ? 0 : (($i >= 60 && $i < 80) ? ($i - 60) / 20 : 1);
        $membership = min($membership, $irrigation_membership['lama']);
        $numerator += $i * $membership;
        $denominator += $membership;
    }
    
    // Hindari pembagian dengan nol
    if ($denominator == 0) {
        return 0;
    }
    
    // Nilai defuzzifikasi
    return round($numerator / $denominator);
}

function defuzzifyTemperature($temperature_membership) {
    // Definisi rentang nilai output untuk pengaturan suhu (-10 sampai +10)
    $menurunkan_range = range(-10, -3);
    $mempertahankan_range = range(-5, 5);
    $menaikkan_range = range(3, 10);
    
    $numerator = 0;
    $denominator = 0;
    
    // Hitung untuk setiap nilai dalam rentang
    foreach ($menurunkan_range as $i) {
        // Fungsi keanggotaan trapesium untuk menurunkan
        $membership = ($i <= -7) ? 1 : (-3 - $i) / 4;
        $membership = min($membership, $temperature_membership['menurunkan']);
        $numerator += $i * $membership;
        $denominator += $membership;
    }
    
    foreach ($mempertahankan_range as $i) {
        // Fungsi keanggotaan segitiga untuk mempertahankan
        if ($i < -5) {
            $membership = 0;
        } elseif ($i >= -5 && $i <= 0) {
            $membership = ($i + 5) / 5;
        } else {
            $membership = (5 - $i) / 5;
        }
        $membership = min($membership, $temperature_membership['mempertahankan']);
        $numerator += $i * $membership;
        $denominator += $membership;
    }
    
    foreach ($menaikkan_range as $i) {
        // Fungsi keanggotaan trapesium untuk menaikkan
        $membership = ($i < 3) ? 0 : (($i >= 3 && $i < 7) ? ($i - 3) / 4 : 1);
        $membership = min($membership, $temperature_membership['menaikkan']);
        $numerator += $i * $membership;
        $denominator += $membership;
    }
    
    // Hindari pembagian dengan nol
    if ($denominator == 0) {
        return 0;
    }
    
    // Nilai defuzzifikasi
    return round($numerator / $denominator, 1);
}

function defuzzifyLightControl($light_control_membership) {
    // Definisi rentang nilai output untuk kontrol pencahayaan (0-100%)
    $mati_range = range(0, 20);
    $redup_range = range(10, 40);
    $sedang_range = range(30, 70);
    $terang_range = range(60, 100);
    
    $numerator = 0;
    $denominator = 0;
    
    // Hitung untuk setiap nilai dalam rentang
    foreach ($mati_range as $i) {
        // Fungsi keanggotaan trapesium untuk mati
        $membership = ($i <= 10) ? 1 : (20 - $i) / 10;
        $membership = min($membership, $light_control_membership['mati']);
        $numerator += $i * $membership;
        $denominator += $membership;
    }
    
    foreach ($redup_range as $i) {
        // Fungsi keanggotaan segitiga untuk redup
        if ($i < 10) {
            $membership = 0;
        } elseif ($i >= 10 && $i <= 25) {
            $membership = ($i - 10) / 15;
        } else {
            $membership = (40 - $i) / 15;
        }
        $membership = min($membership, $light_control_membership['redup']);
        $numerator += $i * $membership;
        $denominator += $membership;
    }
    
    foreach ($sedang_range as $i) {
        // Fungsi keanggotaan segitiga untuk sedang
        if ($i < 30) {
            $membership = 0;
        } elseif ($i >= 30 && $i <= 50) {
            $membership = ($i - 30) / 20;
        } else {
            $membership = (70 - $i) / 20;
        }
        $membership = min($membership, $light_control_membership['sedang']);
        $numerator += $i * $membership;
        $denominator += $membership;
    }
    
    foreach ($terang_range as $i) {
        // Fungsi keanggotaan trapesium untuk terang
        $membership = ($i < 60) ? 0 : (($i >= 60 && $i < 80) ? ($i - 60) / 20 : 1);
        $membership = min($membership, $light_control_membership['terang']);
        $numerator += $i * $membership;
        $denominator += $membership;
    }
    
    // Hindari pembagian dengan nol
    if ($denominator == 0) {
        return 0;
    }
    
    // Nilai defuzzifikasi
    return round($numerator / $denominator);
}

/**
 * ------------ FUNGSI UTAMA PERHITUNGAN FUZZY ------------
 */
function calculateFuzzyControl($soil_moisture, $air_temperature, $light_intensity, $humidity, $plant_stage = 'vegetative', $plant_health = 100, $adaptive_mode = false) {
    // Langkah 1: Fuzzifikasi
    $soil_moisture_membership = soilMoistureMembership($soil_moisture);
    $air_temperature_membership = airTemperatureMembership($air_temperature);
    $light_intensity_membership = lightIntensityMembership($light_intensity);
    $humidity_membership = humidityMembership($humidity);
    
    // Langkah 2: Inferensi Fuzzy
    $inferenceResult = fuzzyInference(
        $soil_moisture_membership,
        $air_temperature_membership,
        $light_intensity_membership,
        $humidity_membership,
        $plant_stage,
        $adaptive_mode
    );
    
    // Langkah 3: Defuzzifikasi
    $irrigation_duration_value = defuzzifyIrrigation($inferenceResult['irrigation']);
    $temperature_setting_value = defuzzifyTemperature($inferenceResult['temperature']);
    $light_control_value = defuzzifyLightControl($inferenceResult['light_control']);
    
    // Konversi nilai numerik ke linguistik
    $irrigation_duration = getIrrigationLinguistic($irrigation_duration_value);
    $temperature_setting = getTemperatureLinguistic($temperature_setting_value);
    $light_control = getLightLinguistic($light_control_value);
    
    // Simpan hasil ke database jika mode adaptif aktif
    if ($adaptive_mode) {
        try {
            global $pdo;
            
            // Catat kontrol tindakan
            $storeControlAction = $pdo->prepare("
                INSERT INTO control_actions (
                    irrigation_duration_value, temperature_setting_value, light_control_value,
                    soil_moisture_value, air_temperature_value, light_intensity_value, humidity_value,
                    plant_stage, plant_health
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $storeControlAction->execute([
                $irrigation_duration_value,
                $temperature_setting_value,
                $light_control_value,
                $soil_moisture,
                $air_temperature,
                $light_intensity,
                $humidity,
                $plant_stage,
                $plant_health
            ]);
            
        } catch (PDOException $e) {
            error_log("Gagal menyimpan tindakan kontrol: " . $e->getMessage());
        }
    }
    
    // Buat hasil untuk dikembalikan
    return [
        'input_memberships' => [
            'soil_moisture' => $soil_moisture_membership,
            'air_temperature' => $air_temperature_membership,
            'light_intensity' => $light_intensity_membership,
            'humidity' => $humidity_membership
        ],
        'output_memberships' => $inferenceResult,
        'irrigation_duration' => $irrigation_duration,
        'irrigation_duration_value' => $irrigation_duration_value,
        'temperature_setting' => $temperature_setting,
        'temperature_setting_value' => $temperature_setting_value,
        'light_control' => $light_control,
        'light_control_value' => $light_control_value,
        'plant_stage' => $plant_stage,
        'plant_health' => $plant_health,
        'adaptive_mode' => $adaptive_mode
    ];
}

/**
 * ------------ FUNGSI KONVERSI NILAI KE LINGUISTIK ------------
 */
function getIrrigationLinguistic($value) {
    if ($value <= 15) {
        return 'Tidak Ada';
    } elseif ($value <= 35) {
        return 'Singkat';
    } elseif ($value <= 65) {
        return 'Sedang';
    } else {
        return 'Lama';
    }
}

function getTemperatureLinguistic($value) {
    if ($value <= -4) {
        return 'Menurunkan';
    } elseif ($value >= 4) {
        return 'Menaikkan';
    } else {
        return 'Mempertahankan';
    }
}

function getLightLinguistic($value) {
    if ($value <= 15) {
        return 'Mati';
    } elseif ($value <= 35) {
        return 'Redup';
    } elseif ($value <= 65) {
        return 'Sedang';
    } else {
        return 'Terang';
    }
}
?>