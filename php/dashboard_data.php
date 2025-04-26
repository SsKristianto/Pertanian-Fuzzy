<?php
/**
 * dashboard_data.php
 * 
 * File ini bertanggung jawab untuk menyediakan data untuk dashboard
 * termasuk status tanaman, riwayat parameter, dan prediksi
 */

// Koneksi ke database
include('connect.php');

// Pastikan request adalah POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metode tidak diizinkan']);
    exit;
}

// Ambil perintah dari request
$command = isset($_POST['command']) ? sanitizeInput($_POST['command']) : '';

// Proses perintah
switch ($command) {
    case 'get_dashboard_data':
        // Ambil data dashboard
        getDashboardData();
        break;
        
    case 'get_plant_performance':
        // Ambil data performa tanaman
        getPlantPerformance();
        break;
        
    case 'get_environment_history':
        // Ambil riwayat lingkungan
        getEnvironmentHistory();
        break;
        
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Perintah tidak dikenal']);
        break;
}

/**
 * Ambil data dashboard secara lengkap
 */
function getDashboardData() {
    try {
        global $pdo;
        
        // Ambil ID simulasi dan jumlah hari dari POST
        $simulationId = isset($_POST['simulation_id']) ? (int)$_POST['simulation_id'] : 0;
        $days = isset($_POST['days']) ? (int)$_POST['days'] : 7;
        
        if ($simulationId <= 0) {
            throw new Exception("ID simulasi tidak valid");
        }
        
        // Ambil data simulasi terkini
        $currentQuery = "SELECT * FROM plant_simulation WHERE id = ?";
        $currentStmt = $pdo->prepare($currentQuery);
        $currentStmt->execute([$simulationId]);
        
        if ($currentStmt->rowCount() === 0) {
            throw new Exception("Simulasi dengan ID $simulationId tidak ditemukan");
        }
        
        $currentData = $currentStmt->fetch(PDO::FETCH_ASSOC);
        
        // Ambil riwayat data
        $historyQuery = "SELECT * FROM simulation_log 
                       WHERE simulation_id = ? 
                       ORDER BY log_date DESC 
                       LIMIT ?";
        $historyStmt = $pdo->prepare($historyQuery);
        $historyStmt->execute([$simulationId, $days]);
        $historyData = $historyStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Persiapkan data untuk chart
        $dates = [];
        $health = [];
        $growth_rate = [];
        $soil_moisture = [];
        $air_temperature = [];
        $light_intensity = [];
        $humidity = [];
        $actions = [];
        
        // Reverse data untuk mendapatkan urutan kronologis (lama ke baru)
        $historyData = array_reverse($historyData);
        
        foreach ($historyData as $record) {
            $dates[] = $record['log_date'];
            $health[] = $record['plant_health'];
            $growth_rate[] = $record['growth_rate'];
            $soil_moisture[] = $record['soil_moisture'];
            $air_temperature[] = $record['air_temperature'];
            $light_intensity[] = $record['light_intensity'];
            $humidity[] = $record['humidity'];
            
            // Tambahkan ke array tindakan
            $actions[] = [
                'date' => $record['log_date'],
                'stage' => $record['plant_stage'],
                'irrigation' => getIrrigationText($record['irrigation_duration']),
                'temperature' => getTemperatureText($record['temperature_setting']),
                'light' => getLightText($record['light_control']),
                'health' => $record['plant_health']
            ];
        }
        
        // Hitung tren (perubahan dari awal hingga akhir)
        $health_trend = count($health) > 1 ? $health[count($health) - 1] - $health[0] : 0;
        $growth_trend = count($growth_rate) > 1 ? $growth_rate[count($growth_rate) - 1] - $growth_rate[0] : 0;
        $fruit_trend = 0; // Default

        // Dapatkan kondisi optimal untuk tahap pertumbuhan saat ini
        $optimal = getOptimalConditions($currentData['plant_stage']);
        
        // Dapatkan data cuaca (dalam implementasi nyata, ini bisa dari API cuaca)
        $weatherData = getWeatherData();
        
        // Susun respons
        $response = [
            'success' => true,
            'current' => $currentData,
            'trends' => [
                'health_trend' => $health_trend,
                'growth_trend' => $growth_trend,
                'fruit_trend' => $fruit_trend
            ],
            'optimal' => $optimal,
            'history' => [
                'dates' => $dates,
                'health' => $health,
                'growth_rate' => $growth_rate,
                'soil_moisture' => $soil_moisture,
                'air_temperature' => $air_temperature,
                'light_intensity' => $light_intensity,
                'humidity' => $humidity,
                'actions' => $actions
            ],
            'weather' => $weatherData
        ];
        
        echo json_encode($response);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

/**
 * Ambil data performa tanaman
 */
function getPlantPerformance() {
    try {
        global $pdo;
        
        // Ambil ID simulasi dari POST
        $simulationId = isset($_POST['simulation_id']) ? (int)$_POST['simulation_id'] : 0;
        
        if ($simulationId <= 0) {
            throw new Exception("ID simulasi tidak valid");
        }
        
        // Ambil data performa terkini
        $query = "SELECT plant_health, growth_rate, plant_stage, days_in_current_stage, plant_height, fruit_count
                 FROM plant_simulation WHERE id = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$simulationId]);
        
        if ($stmt->rowCount() === 0) {
            throw new Exception("Simulasi dengan ID $simulationId tidak ditemukan");
        }
        
        $performanceData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Ambil riwayat performa
        $historyQuery = "SELECT log_date, plant_health, growth_rate 
                        FROM simulation_log 
                        WHERE simulation_id = ? 
                        ORDER BY log_date DESC 
                        LIMIT 30";
        $historyStmt = $pdo->prepare($historyQuery);
        $historyStmt->execute([$simulationId]);
        $historyData = $historyStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Susun respons
        $response = [
            'success' => true,
            'current_performance' => $performanceData,
            'performance_history' => $historyData
        ];
        
        echo json_encode($response);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

/**
 * Ambil riwayat lingkungan
 */
function getEnvironmentHistory() {
    try {
        global $pdo;
        
        // Ambil ID simulasi dan parameter dari POST
        $simulationId = isset($_POST['simulation_id']) ? (int)$_POST['simulation_id'] : 0;
        $parameter = isset($_POST['parameter']) ? sanitizeInput($_POST['parameter']) : 'all';
        $days = isset($_POST['days']) ? (int)$_POST['days'] : 30;
        
        if ($simulationId <= 0) {
            throw new Exception("ID simulasi tidak valid");
        }
        
        // Pilih parameter yang diminta
        $parameterFields = 'log_date, soil_moisture, air_temperature, light_intensity, humidity';
        
        if ($parameter !== 'all') {
            // Validasi parameter
            $validParameters = ['soil_moisture', 'air_temperature', 'light_intensity', 'humidity'];
            if (!in_array($parameter, $validParameters)) {
                throw new Exception("Parameter tidak valid");
            }
            
            $parameterFields = "log_date, $parameter";
        }
        
        // Ambil riwayat parameter
        $query = "SELECT $parameterFields 
                 FROM simulation_log 
                 WHERE simulation_id = ? 
                 ORDER BY log_date DESC 
                 LIMIT ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$simulationId, $days]);
        $historyData = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Susun respons
        $response = [
            'success' => true,
            'parameter' => $parameter,
            'history' => $historyData
        ];
        
        echo json_encode($response);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

/**
 * Dapatkan teks irigasi dari nilai
 */
function getIrrigationText($value) {
    if (is_numeric($value)) {
        if ($value <= 15) return 'tidak_ada';
        if ($value <= 35) return 'singkat';
        if ($value <= 65) return 'sedang';
        return 'lama';
    } else {
        return $value; // Nilai sudah dalam bentuk teks
    }
}

/**
 * Dapatkan teks pengaturan suhu dari nilai
 */
function getTemperatureText($value) {
    if (is_numeric($value)) {
        if ($value <= -4) return 'menurunkan';
        if ($value >= 4) return 'menaikkan';
        return 'mempertahankan';
    } else {
        return $value; // Nilai sudah dalam bentuk teks
    }
}

/**
 * Dapatkan teks kontrol cahaya dari nilai
 */
function getLightText($value) {
    if (is_numeric($value)) {
        if ($value <= 15) return 'mati';
        if ($value <= 35) return 'redup';
        if ($value <= 65) return 'sedang';
        return 'terang';
    } else {
        return $value; // Nilai sudah dalam bentuk teks
    }
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
 * Dapatkan data cuaca (simulasi)
 */
function getWeatherData() {
    // Tanggal saat ini
    $today = date('Y-m-d');
    
    // Buat data cuaca simulasi
    $current = [
        'temperature' => rand(22, 30),
        'humidity' => rand(50, 80),
        'condition' => getRandomWeatherCondition(),
        'location' => 'Jakarta',
        'light_intensity' => rand(300, 800)
    ];
    
    // Buat prakiraan cuaca
    $forecast = [];
    for ($i = 1; $i <= 5; $i++) {
        $forecast[] = [
            'date' => date('Y-m-d', strtotime("+$i days")),
            'temperature' => rand(20, 32),
            'humidity' => rand(50, 85),
            'condition' => getRandomWeatherCondition(),
            'light_intensity' => rand(200, 900)
        ];
    }
    
    // Analisis dampak cuaca terhadap tanaman
    $impact = generateWeatherImpact($current, $forecast);
    
    // Buat rekomendasi
    $recommendations = generateWeatherRecommendations($impact);
    
    return [
        'current' => $current,
        'forecast' => $forecast,
        'impact' => $impact,
        'recommendations' => $recommendations
    ];
}

/**
 * Dapatkan kondisi cuaca acak
 */
function getRandomWeatherCondition() {
    $conditions = [
        'Cerah', 'Berawan', 'Hujan Ringan', 'Hujan Sedang',
        'Berawan Sebagian', 'Mendung', 'Panas', 'Berkabut'
    ];
    return $conditions[array_rand($conditions)];
}

/**
 * Buat analisis dampak cuaca
 */
function generateWeatherImpact($current, $forecast) {
    // Analisis dampak berdasarkan kondisi cuaca saat ini dan prakiraan
    $soilImpact = 'Stabil';
    $tempImpact = 'Stabil';
    $lightImpact = 'Stabil';
    $humidityImpact = 'Stabil';
    $growthImpact = 'Stabil';
    $healthImpact = 'Baik';
    
    // Cek kondisi hujan
    $rainForecast = array_filter($forecast, function($day) {
        return strpos($day['condition'], 'Hujan') !== false;
    });
    
    if (count($rainForecast) >= 3) {
        $soilImpact = 'Akan meningkat karena curah hujan';
        $lightImpact = 'Berkurang selama hujan';
        $humidityImpact = 'Meningkat';
        
        if ($current['temperature'] < 22) {
            $tempImpact = 'Menurun, perlu perhatian';
            $growthImpact = 'Mungkin melambat';
            $healthImpact = 'Perlu perhatian';
        }
    }
    
    // Cek suhu tinggi
    $highTempDays = array_filter($forecast, function($day) {
        return $day['temperature'] > 30;
    });
    
    if (count($highTempDays) >= 3) {
        $soilImpact = 'Cenderung menurun karena penguapan';
        $tempImpact = 'Meningkat, perlu pendinginan';
        
        if ($current['humidity'] < 60) {
            $growthImpact = 'Dapat terhambat oleh panas';
            $healthImpact = 'Perlu perhatian ekstra';
        }
    }
    
    // Cek cahaya rendah
    $lowLightDays = array_filter($forecast, function($day) {
        return $day['light_intensity'] < 400;
    });
    
    if (count($lowLightDays) >= 3) {
        $lightImpact = 'Kurang optimal, pertimbangkan pencahayaan tambahan';
        $growthImpact = 'Dapat melambat karena kurang cahaya';
    }
    
    return [
        'soil_moisture' => $soilImpact,
        'air_temperature' => $tempImpact,
        'light_intensity' => $lightImpact,
        'humidity' => $humidityImpact,
        'growth_rate' => $growthImpact,
        'plant_health' => $healthImpact
    ];
}

/**
 * Buat rekomendasi berdasarkan dampak cuaca
 */
function generateWeatherRecommendations($impact) {
    $recommendations = [];
    
    if (strpos($impact['soil_moisture'], 'meningkat') !== false) {
        $recommendations[] = 'Kurangi irigasi selama periode hujan';
    }
    
    if (strpos($impact['light_intensity'], 'Kurang') !== false || strpos($impact['light_intensity'], 'Berkurang') !== false) {
        $recommendations[] = 'Pertimbangkan pencahayaan tambahan pada hari mendung';
    }
    
    if (strpos($impact['soil_moisture'], 'meningkat') !== false) {
        $recommendations[] = 'Pastikan drainase yang baik untuk menghindari genangan air';
    }
    
    if (strpos($impact['air_temperature'], 'Meningkat') !== false) {
        $recommendations[] = 'Tingkatkan sirkulasi udara dan pertimbangkan pendinginan tambahan';
    }
    
    if (strpos($impact['humidity'], 'Meningkat') !== false) {
        $recommendations[] = 'Pantau kelembaban tanah secara teratur';
    }
    
    if (strpos($impact['growth_rate'], 'melambat') !== false || strpos($impact['growth_rate'], 'terhambat') !== false) {
        $recommendations[] = 'Sesuaikan parameter kontrol untuk mengoptimalkan pertumbuhan';
    }
    
    if (strpos($impact['plant_health'], 'perhatian') !== false) {
        $recommendations[] = 'Tingkatkan pemantauan kesehatan tanaman dalam beberapa hari ke depan';
    }
    
    // Jika tidak ada rekomendasi spesifik, berikan rekomendasi umum
    if (empty($recommendations)) {
        $recommendations[] = 'Kondisi cuaca mendukung pertumbuhan, pertahankan parameter kontrol saat ini';
        $recommendations[] = 'Lakukan pemantauan rutin untuk memastikan kondisi optimal';
    }
    
    return $recommendations;
}
?>