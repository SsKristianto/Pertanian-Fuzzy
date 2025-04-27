<?php
/**
 * plant_simulation.php
 * 
 * File ini bertanggung jawab untuk mengelola simulasi pertumbuhan tanaman tomat
 * berdasarkan parameter lingkungan dan kontrol yang diberikan
 */

// Koneksi ke database
include('connect.php');

// Pastikan request adalah POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Metode tidak diizinkan']);
    exit;
}

// Ambil perintah dari request
$command = isset($_POST['command']) ? sanitizeInput($_POST['command']) : '';

// Proses perintah
switch ($command) {
    case 'init_simulation':
        // Inisialisasi simulasi baru
        initializeSimulation();
        break;
        
    case 'update_simulation':
        // Update simulasi berdasarkan kondisi lingkungan dan kontrol
        updateSimulation();
        break;
        
    case 'get_plant_state':
        // Dapatkan status tanaman saat ini
        getPlantState();
        break;
        
    case 'reset_simulation':
        // Reset simulasi ke keadaan awal
        resetSimulation();
        break;
        
    case 'advance_time':
        // Majukan waktu simulasi ke periode berikutnya
        advanceSimulationTime();
        break;
        
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Perintah tidak dikenal']);
        break;
}

/**
 * Inisialisasi simulasi tanaman baru
 */
function initializeSimulation() {
    // Ambil parameter dari POST
    $name = isset($_POST['name']) ? sanitizeInput($_POST['name']) : 'Tanaman Tomat';
    $variety = isset($_POST['variety']) ? sanitizeInput($_POST['variety']) : 'Roma';
    $start_date = isset($_POST['start_date']) ? sanitizeInput($_POST['start_date']) : date('Y-m-d');
    
    try {
        global $pdo;
        
        // Periksa apakah ada simulasi sebelumnya yang aktif
        $checkQuery = "SELECT id FROM plant_simulation WHERE is_active = 1";
        $stmt = $pdo->query($checkQuery);
        
        if ($stmt->rowCount() > 0) {
            // Simulasi aktif sudah ada, matikan dulu
            $deactivateQuery = "UPDATE plant_simulation SET is_active = 0 WHERE is_active = 1";
            $pdo->exec($deactivateQuery);
        }
        
        // Buat simulasi baru
        $insertQuery = "INSERT INTO plant_simulation 
                       (name, variety, plant_stage, plant_health, growth_rate, days_in_current_stage,
                        soil_moisture, air_temperature, light_intensity, humidity, 
                        start_date, `current_date`, is_active) 
                       VALUES 
                       (?, ?, 'seedling', 100, 1.0, 0,
                        50, 25, 500, 60, 
                        ?, ?, 1)";
                       
        $stmt = $pdo->prepare($insertQuery);
        $stmt->execute([$name, $variety, $start_date, $start_date]);
        
        $simulationId = $pdo->lastInsertId();
        
        // Respons dengan ID simulasi baru
        echo json_encode([
            'success' => true, 
            'message' => 'Simulasi tanaman baru berhasil dibuat',
            'simulation_id' => $simulationId,
            'simulation_data' => getSimulationData($simulationId)
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

/**
 * Update simulasi berdasarkan kondisi lingkungan dan kontrol
 */
function updateSimulation() {
    try {
        global $pdo;
        
        // Ambil ID simulasi dan parameter lingkungan dari POST
        $simulationId = isset($_POST['simulation_id']) ? (int)$_POST['simulation_id'] : 0;
        $soil_moisture = isset($_POST['soil_moisture']) ? (float)$_POST['soil_moisture'] : null;
        $air_temperature = isset($_POST['air_temperature']) ? (float)$_POST['air_temperature'] : null;
        $light_intensity = isset($_POST['light_intensity']) ? (float)$_POST['light_intensity'] : null;
        $humidity = isset($_POST['humidity']) ? (float)$_POST['humidity'] : null;
        
        // Ambil kontrol yang diaplikasikan
        $irrigation_duration = isset($_POST['irrigation_duration']) ? (int)$_POST['irrigation_duration'] : null;
        $temperature_setting = isset($_POST['temperature_setting']) ? (float)$_POST['temperature_setting'] : null;
        $light_control = isset($_POST['light_control']) ? (int)$_POST['light_control'] : null;
        
        // Parameter lain
        $time_step = isset($_POST['time_step']) ? (int)$_POST['time_step'] : 1; // Langkah waktu dalam hari
        
        // Dapatkan data simulasi saat ini
        $query = "SELECT * FROM plant_simulation WHERE id = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$simulationId]);
        
        if ($stmt->rowCount() === 0) {
            throw new Exception("Simulasi dengan ID $simulationId tidak ditemukan");
        }
        
        $simulation = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Jika parameter lingkungan tidak diberikan, gunakan nilai saat ini
        if ($soil_moisture === null) $soil_moisture = $simulation['soil_moisture'];
        if ($air_temperature === null) $air_temperature = $simulation['air_temperature'];
        if ($light_intensity === null) $light_intensity = $simulation['light_intensity'];
        if ($humidity === null) $humidity = $simulation['humidity'];
        
        // Hitung nilai baru berdasarkan kontrol yang diterapkan
        if ($irrigation_duration !== null) {
            // Perbarui kelembaban tanah berdasarkan durasi irigasi
            $soil_moisture = updateSoilMoisture($simulation['soil_moisture'], $irrigation_duration, $time_step);
        }
        
        if ($temperature_setting !== null) {
            // Perbarui suhu udara berdasarkan pengaturan suhu
            $air_temperature = updateAirTemperature($simulation['air_temperature'], $temperature_setting, $time_step);
        }
        
        if ($light_control !== null) {
            // Perbarui intensitas cahaya berdasarkan kontrol cahaya
            $light_intensity = updateLightIntensity($simulation['light_intensity'], $light_control, $time_step);
        }
        
        // Simulasikan perubahan lingkungan alami seiring waktu (opsional)
        // Misalnya: siklus siang/malam, perubahan suhu harian, dll.
        
        // Hitung kondisi tanaman berdasarkan kondisi lingkungan
        $plantConditionResult = calculatePlantCondition(
            $simulation['plant_stage'],
            $simulation['days_in_current_stage'],
            $soil_moisture, 
            $air_temperature, 
            $light_intensity, 
            $humidity,
            $simulation['plant_health'],
            $simulation['growth_rate'],
            $time_step
        );
        
        $plant_stage = $plantConditionResult['plant_stage'];
        $plant_health = $plantConditionResult['plant_health'];
        $growth_rate = $plantConditionResult['growth_rate'];
        $days_in_current_stage = $plantConditionResult['days_in_current_stage'];
        $plant_height = $plantConditionResult['plant_height'] ?? $simulation['plant_height'] ?? 0;
        $fruit_count = $plantConditionResult['fruit_count'] ?? $simulation['fruit_count'] ?? 0;
        
        // Perbarui waktu simulasi
        $current_date = date('Y-m-d', strtotime($simulation['current_date'] . " + $time_step days"));
        
        // Simpan log simulasi
        $logQuery = "INSERT INTO simulation_log 
                    (simulation_id, soil_moisture, air_temperature, light_intensity, humidity,
                     irrigation_duration, temperature_setting, light_control,
                     plant_stage, plant_health, growth_rate, log_date) 
                    VALUES 
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    
        $logStmt = $pdo->prepare($logQuery);
        $logStmt->execute([
            $simulationId, $soil_moisture, $air_temperature, $light_intensity, $humidity,
            $irrigation_duration, $temperature_setting, $light_control,
            $plant_stage, $plant_health, $growth_rate, $current_date
        ]);
        
        // Update data simulasi
        $updateQuery = "UPDATE plant_simulation SET 
                        soil_moisture = ?, 
                        air_temperature = ?, 
                        light_intensity = ?, 
                        humidity = ?,
                        plant_stage = ?, 
                        plant_health = ?, 
                        growth_rate = ?,
                        days_in_current_stage = ?,
                        plant_height = ?,
                        fruit_count = ?,
                        `current_date` = ?
                        WHERE id = ?";
                        
        $updateStmt = $pdo->prepare($updateQuery);
        $updateStmt->execute([
            $soil_moisture, 
            $air_temperature, 
            $light_intensity, 
            $humidity,
            $plant_stage, 
            $plant_health, 
            $growth_rate,
            $days_in_current_stage,
            $plant_height,
            $fruit_count,
            $current_date,
            $simulationId
        ]);
        
        // Kembalikan data simulasi terbaru
        echo json_encode([
            'success' => true, 
            'message' => 'Simulasi berhasil diperbarui',
            'simulation_data' => getSimulationData($simulationId)
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

/**
 * Dapatkan status tanaman saat ini
 */
function getPlantState() {
    try {
        global $pdo;
        
        // Ambil ID simulasi dari POST atau gunakan simulasi aktif
        $simulationId = isset($_POST['simulation_id']) ? (int)$_POST['simulation_id'] : null;
        
        // Jika ID tidak diberikan, gunakan simulasi aktif
        if ($simulationId === null) {
            $query = "SELECT id FROM plant_simulation WHERE is_active = 1 LIMIT 1";
            $stmt = $pdo->query($query);
            
            if ($stmt->rowCount() === 0) {
                throw new Exception("Tidak ada simulasi aktif saat ini");
            }
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $simulationId = $result['id'];
        }
        
        // Dapatkan data simulasi
        $simulationData = getSimulationData($simulationId);
        
        // Dapatkan log simulasi
        $logQuery = "SELECT * FROM simulation_log 
                    WHERE simulation_id = ? 
                    ORDER BY log_date DESC LIMIT 30";
                    
        $logStmt = $pdo->prepare($logQuery);
        $logStmt->execute([$simulationId]);
        $logData = $logStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Respons dengan data simulasi dan log
        echo json_encode([
            'success' => true,
            'simulation_data' => $simulationData,
            'simulation_log' => $logData
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

/**
 * Reset simulasi ke keadaan awal
 */
function resetSimulation() {
    try {
        global $pdo;
        
        // Ambil ID simulasi dari POST
        $simulationId = isset($_POST['simulation_id']) ? (int)$_POST['simulation_id'] : 0;
        
        // Reset simulasi
        $resetQuery = "UPDATE plant_simulation SET 
                     plant_stage = 'seedling', 
                     plant_health = 100, 
                     growth_rate = 1.0,
                     days_in_current_stage = 0,
                     soil_moisture = 50,
                     air_temperature = 25,
                     light_intensity = 500,
                     humidity = 60,
                     plant_height = 5,
                     fruit_count = 0,
                     `current_date` = start_date
                     WHERE id = ?";
                     
        $stmt = $pdo->prepare($resetQuery);
        $stmt->execute([$simulationId]);
        
        // Hapus log simulasi
        $deleteLogQuery = "DELETE FROM simulation_log WHERE simulation_id = ?";
        $deleteStmt = $pdo->prepare($deleteLogQuery);
        $deleteStmt->execute([$simulationId]);
        
        // Respons dengan data simulasi yang telah direset
        echo json_encode([
            'success' => true, 
            'message' => 'Simulasi berhasil direset',
            'simulation_data' => getSimulationData($simulationId)
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

/**
 * Majukan waktu simulasi ke periode berikutnya
 */
function advanceSimulationTime() {
    try {
        global $pdo;
        
        // Ambil parameter
        $simulationId = isset($_POST['simulation_id']) ? (int)$_POST['simulation_id'] : 0;
        $days = isset($_POST['days']) ? (int)$_POST['days'] : 1;
        
        // Batas maksimum hari yang dapat dimajukan sekaligus (untuk mencegah abuse)
        $maxDays = 30;
        if ($days > $maxDays) {
            $days = $maxDays;
        }
        
        // Dapatkan data simulasi saat ini
        $query = "SELECT * FROM plant_simulation WHERE id = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$simulationId]);
        
        if ($stmt->rowCount() === 0) {
            throw new Exception("Simulasi dengan ID $simulationId tidak ditemukan");
        }
        
        $simulation = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Lakukan simulasi untuk setiap hari
        $currentSimulation = $simulation;
        for ($day = 1; $day <= $days; $day++) {
            // Simulasikan perubahan lingkungan alami
            $soil_moisture = simulateNaturalSoilMoistureChange($currentSimulation['soil_moisture']);
            $air_temperature = simulateNaturalTemperatureChange($currentSimulation['air_temperature']);
            $light_intensity = simulateNaturalLightChange($currentSimulation['light_intensity']);
            $humidity = simulateNaturalHumidityChange($currentSimulation['humidity']);
            
            // Hitung kondisi tanaman
            $plantConditionResult = calculatePlantCondition(
                $currentSimulation['plant_stage'],
                $currentSimulation['days_in_current_stage'],
                $soil_moisture, 
                $air_temperature, 
                $light_intensity, 
                $humidity,
                $currentSimulation['plant_health'],
                $currentSimulation['growth_rate'],
                1 // time_step = 1 hari
            );
            
            // Perbarui waktu simulasi
            $current_date = date('Y-m-d', strtotime($currentSimulation['current_date'] . " + 1 days"));
            
            // Simpan log simulasi
            $logQuery = "INSERT INTO simulation_log 
                        (simulation_id, soil_moisture, air_temperature, light_intensity, humidity,
                         irrigation_duration, temperature_setting, light_control,
                         plant_stage, plant_health, growth_rate, log_date) 
                        VALUES 
                        (?, ?, ?, ?, ?, NULL, NULL, NULL, ?, ?, ?, ?)";
                        
            $logStmt = $pdo->prepare($logQuery);
            $logStmt->execute([
                $simulationId, 
                $soil_moisture, 
                $air_temperature, 
                $light_intensity, 
                $humidity,
                $plantConditionResult['plant_stage'], 
                $plantConditionResult['plant_health'], 
                $plantConditionResult['growth_rate'], 
                $current_date
            ]);
            
            // Update simulasi saat ini untuk iterasi berikutnya
            $currentSimulation['soil_moisture'] = $soil_moisture;
            $currentSimulation['air_temperature'] = $air_temperature;
            $currentSimulation['light_intensity'] = $light_intensity;
            $currentSimulation['humidity'] = $humidity;
            $currentSimulation['plant_stage'] = $plantConditionResult['plant_stage'];
            $currentSimulation['plant_health'] = $plantConditionResult['plant_health'];
            $currentSimulation['growth_rate'] = $plantConditionResult['growth_rate'];
            $currentSimulation['days_in_current_stage'] = $plantConditionResult['days_in_current_stage'];
            $currentSimulation['plant_height'] = $plantConditionResult['plant_height'] ?? $currentSimulation['plant_height'] ?? 0;
            $currentSimulation['fruit_count'] = $plantConditionResult['fruit_count'] ?? $currentSimulation['fruit_count'] ?? 0;
            $currentSimulation['current_date'] = $current_date;
        }
        
        // Update data simulasi dengan hasil akhir
        $updateQuery = "UPDATE plant_simulation SET 
                        soil_moisture = ?, 
                        air_temperature = ?, 
                        light_intensity = ?, 
                        humidity = ?,
                        plant_stage = ?, 
                        plant_health = ?, 
                        growth_rate = ?,
                        days_in_current_stage = ?,
                        plant_height = ?,
                        fruit_count = ?,
                        `current_date` = ?
                        WHERE id = ?";
                        
        $updateStmt = $pdo->prepare($updateQuery);
        $updateStmt->execute([
            $currentSimulation['soil_moisture'], 
            $currentSimulation['air_temperature'], 
            $currentSimulation['light_intensity'], 
            $currentSimulation['humidity'],
            $currentSimulation['plant_stage'], 
            $currentSimulation['plant_health'], 
            $currentSimulation['growth_rate'],
            $currentSimulation['days_in_current_stage'],
            $currentSimulation['plant_height'],
            $currentSimulation['fruit_count'],
            $currentSimulation['current_date'],
            $simulationId
        ]);
        
        // Kembalikan data simulasi terbaru
        echo json_encode([
            'success' => true, 
            'message' => "Simulasi dimajukan $days hari",
            'simulation_data' => getSimulationData($simulationId)
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

/**
 * Dapatkan data simulasi berdasarkan ID
 */
function getSimulationData($simulationId) {
    global $pdo;
    
    $query = "SELECT * FROM plant_simulation WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$simulationId]);
    
    if ($stmt->rowCount() === 0) {
        throw new Exception("Simulasi dengan ID $simulationId tidak ditemukan");
    }
    
    $simulation = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Tambahkan informasi tambahan
    $simulation['days_since_start'] = dateDiffInDays($simulation['start_date'], $simulation['current_date']);
    $simulation['optimal_conditions'] = getOptimalConditions($simulation['plant_stage']);
    $simulation['plant_status'] = getPlantStatusDescription($simulation['plant_health'], $simulation['growth_rate']);
    $simulation['next_stage_in'] = calculateDaysToNextStage($simulation['plant_stage'], $simulation['days_in_current_stage'], $simulation['growth_rate']);
    
    // Kembalikan data simulasi
    return $simulation;
}

/**
 * Hitung selisih hari antara dua tanggal
 */
function dateDiffInDays($date1, $date2) {
    $datetime1 = new DateTime($date1);
    $datetime2 = new DateTime($date2);
    $interval = $datetime1->diff($datetime2);
    return $interval->days;
}

/**
 * Dapatkan kondisi optimal untuk fase pertumbuhan tertentu
 */
function getOptimalConditions($plant_stage) {
    switch ($plant_stage) {
        case 'seedling':
            return [
                'soil_moisture' => 60,
                'air_temperature' => 24,
                'light_intensity' => 400,
                'humidity' => 70
            ];
        case 'vegetative':
            return [
                'soil_moisture' => 55,
                'air_temperature' => 25,
                'light_intensity' => 600,
                'humidity' => 65
            ];
        case 'flowering':
            return [
                'soil_moisture' => 50,
                'air_temperature' => 23,
                'light_intensity' => 700,
                'humidity' => 60
            ];
        case 'fruiting':
            return [
                'soil_moisture' => 55,
                'air_temperature' => 22,
                'light_intensity' => 650,
                'humidity' => 55
            ];
        case 'harvesting':
            return [
                'soil_moisture' => 45,
                'air_temperature' => 21,
                'light_intensity' => 600,
                'humidity' => 50
            ];
        default:
            return [
                'soil_moisture' => 50,
                'air_temperature' => 23,
                'light_intensity' => 500,
                'humidity' => 60
            ];
    }
}

/**
 * Dapatkan deskripsi status tanaman berdasarkan kesehatan dan tingkat pertumbuhan
 */
function getPlantStatusDescription($health, $growth_rate) {
    if ($health >= 90) {
        if ($growth_rate >= 1.2) {
            return "Sangat sehat dan tumbuh subur";
        } else if ($growth_rate >= 1.0) {
            return "Sangat sehat dengan pertumbuhan normal";
        } else {
            return "Sangat sehat tapi pertumbuhan lambat";
        }
    } else if ($health >= 70) {
        if ($growth_rate >= 1.2) {
            return "Sehat dan tumbuh cepat";
        } else if ($growth_rate >= 1.0) {
            return "Sehat dengan pertumbuhan normal";
        } else {
            return "Sehat tapi pertumbuhan lambat";
        }
    } else if ($health >= 50) {
        if ($growth_rate >= 1.0) {
            return "Cukup sehat dengan pertumbuhan normal";
        } else {
            return "Cukup sehat tapi pertumbuhan terhambat";
        }
    } else if ($health >= 30) {
        return "Kurang sehat, perlu perawatan ekstra";
    } else {
        return "Kritis, butuh perhatian segera";
    }
}

/**
 * Hitung jumlah hari hingga fase pertumbuhan berikutnya
 */
function calculateDaysToNextStage($plant_stage, $days_in_current_stage, $growth_rate) {
    $standard_duration = [
        'seedling' => 14,     // 2 minggu
        'vegetative' => 28,   // 4 minggu
        'flowering' => 21,    // 3 minggu
        'fruiting' => 42,     // 6 minggu
        'harvesting' => 14    // 2 minggu
    ];
    
    if (!isset($standard_duration[$plant_stage])) {
        return 0; // Fase tidak dikenal atau fase terakhir
    }
    
    // Durasi yang dimodifikasi berdasarkan tingkat pertumbuhan
    $adjusted_duration = $standard_duration[$plant_stage] / $growth_rate;
    
    // Hari yang tersisa
    $days_remaining = max(0, ceil($adjusted_duration - $days_in_current_stage));
    
    return $days_remaining;
}

/**
 * Fungsi-fungsi untuk menghitung perubahan lingkungan berdasarkan kontrol yang diterapkan
 */
function updateSoilMoisture($current_moisture, $irrigation_duration, $time_step) {
    // Perubahan kelembaban tanah berdasarkan durasi irigasi
    $moisture_change = 0;
    
    if ($irrigation_duration >= 60) { // Irigasi lama
        $moisture_change = 30 * $time_step;
    } else if ($irrigation_duration >= 30) { // Irigasi sedang
        $moisture_change = 20 * $time_step;
    } else if ($irrigation_duration >= 10) { // Irigasi singkat
        $moisture_change = 10 * $time_step;
    } else { // Tidak ada irigasi
        $moisture_change = -5 * $time_step; // Pengeringan alami
    }
    
    // Hitung kelembaban baru
    $new_moisture = $current_moisture + $moisture_change;
    
    // Batasi kelembaban antara 0-100%
    return max(0, min(100, $new_moisture));
}

function updateAirTemperature($current_temperature, $temperature_setting, $time_step) {
    // Perubahan suhu udara berdasarkan pengaturan suhu
    $temperature_change = 0;
    
    if ($temperature_setting <= -5) { // Menurunkan suhu signifikan
        $temperature_change = -3 * $time_step;
    } else if ($temperature_setting < 0) { // Menurunkan suhu sedikit
        $temperature_change = -1.5 * $time_step;
    } else if ($temperature_setting <= 5) { // Mempertahankan suhu
        $temperature_change = 0;
    } else { // Menaikkan suhu
        $temperature_change = 2 * $time_step;
    }
    
    // Hitung suhu baru
    $new_temperature = $current_temperature + $temperature_change;
    
    // Batasi suhu antara 5-40°C
    return max(5, min(40, $new_temperature));
}

function updateLightIntensity($current_intensity, $light_control, $time_step) {
    // Perubahan intensitas cahaya berdasarkan kontrol pencahayaan
    $intensity_change = 0;
    
    if ($light_control >= 60) { // Terang
        $intensity_change = 200 * $time_step;
    } else if ($light_control >= 30) { // Sedang
        $intensity_change = 100 * $time_step;
    } else if ($light_control >= 10) { // Redup
        $intensity_change = 50 * $time_step;
    } else { // Mati
        $intensity_change = -100 * $time_step;
    }
    
    // Hitung intensitas cahaya baru
    $new_intensity = $current_intensity + $intensity_change;
    
    // Batasi intensitas cahaya antara 0-1000 lux
    return max(0, min(1000, $new_intensity));
}

/**
 * Fungsi-fungsi untuk mensimulasikan perubahan lingkungan alami
 */
function simulateNaturalSoilMoistureChange($current_moisture) {
    // Simulasi pengeringan alami
    $evaporation_rate = 2 + (rand(0, 20) / 10); // 2-4% per hari
    $new_moisture = $current_moisture - $evaporation_rate;
    
    // Batasi kelembaban antara 0-100%
    return max(0, min(100, $new_moisture));
}

function simulateNaturalTemperatureChange($current_temperature) {
    // Simulasi variasi suhu harian
    $random_fluctuation = (rand(-10, 10) / 10); // -1 sampai +1°C
    $new_temperature = $current_temperature + $random_fluctuation;
    
    // Batasi suhu antara 5-40°C
    return max(5, min(40, $new_temperature));
}

function simulateNaturalLightChange($current_intensity) {
    // Simulasi variasi cahaya harian
    $is_day = (rand(0, 1) == 1); // Siang atau malam
    
    if ($is_day) {
        $new_intensity = rand(300, 800); // Cahaya siang hari
    } else {
        $new_intensity = rand(0, 200); // Cahaya malam (bisa dari bulan atau lampu)
    }
    
    // Batasi intensitas cahaya antara 0-1000 lux
    return max(0, min(1000, $new_intensity));
}

function simulateNaturalHumidityChange($current_humidity) {
    // Simulasi variasi kelembaban harian
    $random_fluctuation = (rand(-5, 5) / 10) * 10; // -5 sampai +5%
    $new_humidity = $current_humidity + $random_fluctuation;
    
    // Batasi kelembaban antara 20-100%
    return max(20, min(100, $new_humidity));
}

/**
 * Hitung kondisi tanaman berdasarkan kondisi lingkungan
 */
function calculatePlantCondition($current_stage, $days_in_stage, $soil_moisture, $air_temperature, $light_intensity, $humidity, $current_health, $current_growth_rate, $time_step) {
    // Dapatkan kondisi optimal untuk tahap pertumbuhan saat ini
    $optimal = getOptimalConditions($current_stage);
    
    // Hitung deviasi dari kondisi optimal
    $soil_moisture_deviation = abs($soil_moisture - $optimal['soil_moisture']) / 100;
    $air_temperature_deviation = abs($air_temperature - $optimal['air_temperature']) / 40;
    $light_intensity_deviation = abs($light_intensity - $optimal['light_intensity']) / 1000;
    $humidity_deviation = abs($humidity - $optimal['humidity']) / 100;
    
    // Hitung skor kondisi keseluruhan (0-1, di mana 1 adalah optimal)
    $condition_score = 1 - (
        $soil_moisture_deviation * 0.3 + 
        $air_temperature_deviation * 0.25 + 
        $light_intensity_deviation * 0.25 + 
        $humidity_deviation * 0.2
    );
    
    // Penyesuaian skor kondisi berdasarkan fase pertumbuhan dan keekstreman
    // Fase pertumbuhan tertentu lebih sensitif terhadap kondisi tertentu
    switch ($current_stage) {
        case 'seedling':
            // Bibit sangat sensitif terhadap kelembaban tanah dan suhu
            $condition_score -= $soil_moisture_deviation > 0.5 ? 0.3 : 0;
            $condition_score -= $air_temperature_deviation > 0.4 ? 0.3 : 0;
            break;
            
        case 'vegetative':
            // Fase vegetatif perlu cahaya yang cukup dan nutrisi
            $condition_score -= $light_intensity_deviation > 0.5 ? 0.3 : 0;
            $condition_score -= $soil_moisture_deviation > 0.6 ? 0.25 : 0;
            break;
            
        case 'flowering':
            // Fase berbunga sensitif terhadap suhu dan kelembaban
            $condition_score -= $air_temperature_deviation > 0.3 ? 0.4 : 0;
            $condition_score -= $humidity_deviation > 0.4 ? 0.3 : 0;
            break;
            
        case 'fruiting':
            // Fase berbuah perlu keseimbangan semua faktor
            $condition_score -= $soil_moisture_deviation > 0.4 ? 0.25 : 0;
            $condition_score -= $light_intensity_deviation > 0.4 ? 0.25 : 0;
            $condition_score -= $air_temperature_deviation > 0.3 ? 0.25 : 0;
            break;
            
        case 'harvesting':
            // Fase panen kurang sensitif terhadap kondisi ekstrim
            $condition_score -= ($soil_moisture_deviation + $air_temperature_deviation + $light_intensity_deviation + $humidity_deviation) > 1.5 ? 0.3 : 0;
            break;
    }
    
    // Batasi skor kondisi antara 0-1
    $condition_score = max(0, min(1, $condition_score));
    
    // Hitung perubahan kesehatan tanaman
    $health_change = ($condition_score - 0.5) * 10 * $time_step;
    
    // Perbarui kesehatan tanaman
    $new_health = $current_health + $health_change;
    $new_health = max(0, min(100, $new_health));
    
    // Hitung tingkat pertumbuhan baru berdasarkan kondisi dan kesehatan
    $new_growth_rate = 0.5 + ($condition_score * 1.0);
    $new_growth_rate = $new_growth_rate * ($new_health / 100);
    
    // Tambah hari dalam fase saat ini
    $new_days_in_stage = $days_in_stage + $time_step;
    
    // Cek apakah tanaman harus berpindah ke fase berikutnya
    $next_stage = $current_stage;
    $stage_duration = 0;
    
    switch ($current_stage) {
        case 'seedling':
            $stage_duration = 14 / $current_growth_rate; // 2 minggu
            if ($new_days_in_stage >= $stage_duration) {
                $next_stage = 'vegetative';
                $new_days_in_stage = 0;
            }
            break;
            
        case 'vegetative':
            $stage_duration = 28 / $current_growth_rate; // 4 minggu
            if ($new_days_in_stage >= $stage_duration) {
                $next_stage = 'flowering';
                $new_days_in_stage = 0;
            }
            break;
            
        case 'flowering':
            $stage_duration = 21 / $current_growth_rate; // 3 minggu
            if ($new_days_in_stage >= $stage_duration) {
                $next_stage = 'fruiting';
                $new_days_in_stage = 0;
            }
            break;
            
        case 'fruiting':
            $stage_duration = 42 / $current_growth_rate; // 6 minggu
            if ($new_days_in_stage >= $stage_duration) {
                $next_stage = 'harvesting';
                $new_days_in_stage = 0;
            }
            break;
            
        case 'harvesting':
            $stage_duration = 14 / $current_growth_rate; // 2 minggu
            // Fase terakhir, tetap di sini atau reset ke seedling jika diinginkan
            break;
    }
    
    // Hitung tinggi tanaman (cm)
    $plant_height = calculatePlantHeight($current_stage, $next_stage, $new_days_in_stage, $new_growth_rate, $current_health);
    
    // Hitung jumlah buah (hanya pada fase fruiting dan harvesting)
    $fruit_count = calculateFruitCount($current_stage, $next_stage, $new_days_in_stage, $new_growth_rate, $new_health);
    
    // Kembalikan kondisi tanaman baru
    return [
        'plant_stage' => $next_stage,
        'plant_health' => $new_health,
        'growth_rate' => $new_growth_rate,
        'days_in_current_stage' => $new_days_in_stage,
        'condition_score' => $condition_score,
        'plant_height' => $plant_height,
        'fruit_count' => $fruit_count
    ];
}

/**
 * Hitung tinggi tanaman berdasarkan fase pertumbuhan dan faktor lainnya
 */
function calculatePlantHeight($current_stage, $next_stage, $days_in_stage, $growth_rate, $health) {
    // Tinggi dasar berdasarkan fase
    $base_height = [
        'seedling' => 5,      // 5 cm
        'vegetative' => 30,   // 30 cm
        'flowering' => 60,    // 60 cm
        'fruiting' => 90,     // 90 cm
        'harvesting' => 100   // 100 cm
    ];
    
    // Tinggi maksimum berdasarkan fase
    $max_height = [
        'seedling' => 15,     // 15 cm
        'vegetative' => 50,   // 50 cm
        'flowering' => 90,    // 90 cm
        'fruiting' => 120,    // 120 cm
        'harvesting' => 130   // 130 cm
    ];
    
    // Jika tanaman berpindah fase, gunakan tinggi dasar fase baru
    if ($current_stage != $next_stage) {
        return $base_height[$next_stage];
    }
    
    // Hitung durasi fase saat ini berdasarkan tingkat pertumbuhan
    $stage_duration = 14; // Default
    switch ($current_stage) {
        case 'seedling': $stage_duration = 14; break;
        case 'vegetative': $stage_duration = 28; break;
        case 'flowering': $stage_duration = 21; break;
        case 'fruiting': $stage_duration = 42; break;
        case 'harvesting': $stage_duration = 14; break;
    }
    $adjusted_duration = $stage_duration / $growth_rate;
    
    // Hitung kemajuan dalam fase saat ini (0-1)
    $stage_progress = $days_in_stage / $adjusted_duration;
    
    // Hitung pertumbuhan tinggi dalam fase ini
    $height_range = $max_height[$current_stage] - $base_height[$current_stage];
    $height_growth = $height_range * $stage_progress;
    
    // Terapkan faktor kesehatan
    $health_factor = $health / 100;
    $height_growth *= $health_factor;
    
    // Hitung tinggi akhir
    $final_height = $base_height[$current_stage] + $height_growth;
    
    return round($final_height, 1);
}

/**
 * Hitung jumlah buah berdasarkan fase pertumbuhan dan faktor lainnya
 */
function calculateFruitCount($current_stage, $next_stage, $days_in_stage, $growth_rate, $health) {
    // Awalnya tidak ada buah
    $fruit_count = 0;
    
    // Hanya fase fruiting dan harvesting yang memiliki buah
    if ($current_stage == 'fruiting' || $current_stage == 'harvesting') {
        // Durasi fase
        $stage_duration = ($current_stage == 'fruiting') ? 42 : 14;
        $adjusted_duration = $stage_duration / $growth_rate;
        
        // Kemajuan dalam fase
        $stage_progress = $days_in_stage / $adjusted_duration;
        
        // Potensi buah berdasarkan fase
        $potential_fruits = ($current_stage == 'fruiting') ? 20 : 30;
        
        // Terapkan faktor kesehatan dan pertumbuhan
        $health_factor = $health / 100;
        $growth_factor = $growth_rate;
        
        // Hitung jumlah buah
        $fruit_count = round($potential_fruits * $stage_progress * $health_factor * $growth_factor);
        
        // Batasi jumlah buah
        $fruit_count = min($fruit_count, 50); // Maksimal 50 buah
    }
    
    return $fruit_count;
}
?>