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
        
        // Dapatkan data cuaca dari WeatherAPI
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
 * Dapatkan data cuaca dari WeatherAPI.com
 */
function getWeatherData() {
    // Konfigurasi WeatherAPI
    $apiKey = "MASUKKAN_API_KEY_ANDA_DISINI"; // Ganti dengan API key Anda
    $location = "Palangkaraya"; // Lokasi default
    $url = "https://api.weatherapi.com/v1/forecast.json?key={$apiKey}&q={$location}&days=5&aqi=no&alerts=no";
    
    // Periksa apakah data cuaca sudah di-cache
    $cacheFile = sys_get_temp_dir() . '/weather_cache.json';
    $cacheExpiry = 3600; // 1 jam (dalam detik)
    
    // Gunakan cache jika ada dan masih valid
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheExpiry)) {
        $weatherData = json_decode(file_get_contents($cacheFile), true);
        return $weatherData;
    }
    
    try {
        // Siapkan opsi untuk request cURL
        $options = [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTPHEADER => [
                'Accept: application/json',
                'Cache-Control: no-cache'
            ]
        ];
        
        // Inisialisasi cURL
        $ch = curl_init();
        curl_setopt_array($ch, $options);
        
        // Eksekusi request
        $response = curl_exec($ch);
        $err = curl_error($ch);
        
        // Tutup koneksi cURL
        curl_close($ch);
        
        // Jika ada error, lempar exception
        if ($err) {
            throw new Exception("Error saat mengambil data cuaca: " . $err);
        }
        
        // Decode response JSON
        $data = json_decode($response, true);
        
        // Validasi response
        if (!isset($data['location']) || !isset($data['current']) || !isset($data['forecast'])) {
            throw new Exception("Format data cuaca tidak valid");
        }
        
        // Proses data untuk format yang dibutuhkan dashboard
        $current = [
            'temperature' => $data['current']['temp_c'],
            'humidity' => $data['current']['humidity'],
            'condition' => $data['current']['condition']['text'],
            'location' => $data['location']['name'],
            'light_intensity' => calculateLightIntensity($data['current']['condition']['code'], $data['current']['cloud'])
        ];
        
        // Proses data prakiraan
        $forecast = [];
        foreach ($data['forecast']['forecastday'] as $day) {
            $forecast[] = [
                'date' => $day['date'],
                'temperature' => $day['day']['maxtemp_c'],
                'humidity' => estimateHumidityFromRain($day['day']['daily_chance_of_rain']),
                'condition' => $day['day']['condition']['text'],
                'light_intensity' => estimateLightFromCondition($day['day']['condition']['text'], $day['day']['condition']['code'])
            ];
        }
        
        // Analisis dampak cuaca
        $impact = generateWeatherImpact($current, $forecast);
        
        // Hasilkan rekomendasi
        $recommendations = generateWeatherRecommendations($impact);
        
        // Format akhir data cuaca
        $weatherData = [
            'current' => $current,
            'forecast' => $forecast,
            'impact' => $impact,
            'recommendations' => $recommendations
        ];
        
        // Simpan ke cache
        file_put_contents($cacheFile, json_encode($weatherData));
        
        return $weatherData;
        
    } catch (Exception $e) {
        error_log("Weather API Error: " . $e->getMessage());
        
        // Jika gagal mengambil dari API, gunakan data default/simulator
        return getDefaultWeatherData();
    }
}

/**
 * Hitung perkiraan intensitas cahaya dari kondisi cuaca
 */
function calculateLightIntensity($conditionCode, $cloudCover) {
    // Nilai dasar intensitas cahaya pada kondisi cerah
    $baseLux = 800;
    
    // Faktor reduksi berdasarkan tutupan awan (0-100%)
    $cloudFactor = 1 - ($cloudCover / 100) * 0.7;
    
    // Faktor kondisi cuaca
    $conditionFactor = 1.0;
    
    // Kode kondisi dari WeatherAPI
    if ($conditionCode >= 1000 && $conditionCode < 1030) {
        // Cerah sampai berawan
        $conditionFactor = 1.0 - (($conditionCode - 1000) / 30) * 0.3;
    } else if ($conditionCode >= 1030 && $conditionCode < 1100) {
        // Kabut, berkabut
        $conditionFactor = 0.6;
    } else if ($conditionCode >= 1100 && $conditionCode < 1200) {
        // Hujan ringan
        $conditionFactor = 0.5;
    } else if ($conditionCode >= 1200 && $conditionCode < 1300) {
        // Hujan sedang-deras
        $conditionFactor = 0.3;
    } else {
        // Kondisi ekstrim lainnya (salju, badai, dll)
        $conditionFactor = 0.2;
    }
    
    // Hitung intensitas cahaya
    $lightIntensity = round($baseLux * $cloudFactor * $conditionFactor);
    
    return min(1000, max(0, $lightIntensity));
}

/**
 * Perkirakan kelembaban dari peluang hujan
 */
function estimateHumidityFromRain($rainChance) {
    // Baseline kelembaban
    $baseHumidity = 60;
    // Tambahkan faktor peluang hujan
    return min(95, max(30, $baseHumidity + ($rainChance - 50) * 0.3));
}

/**
 * Perkirakan intensitas cahaya dari kondisi cuaca (teks)
 */
function estimateLightFromCondition($conditionText, $conditionCode = null) {
    $conditionLower = strtolower($conditionText);
    $lightBase = 600; // Nilai dasar
    
    if (strpos($conditionLower, 'cerah') !== false || 
        strpos($conditionLower, 'sunny') !== false || 
        strpos($conditionLower, 'clear') !== false) {
        return round($lightBase * 1.2);
    } else if (strpos($conditionLower, 'berawan') !== false || 
              strpos($conditionLower, 'cloudy') !== false || 
              strpos($conditionLower, 'overcast') !== false) {
        return round($lightBase * 0.8);
    } else if (strpos($conditionLower, 'hujan') !== false || 
              strpos($conditionLower, 'rain') !== false) {
        return round($lightBase * 0.5);
    } else if (strpos($conditionLower, 'badai') !== false || 
              strpos($conditionLower, 'storm') !== false) {
        return round($lightBase * 0.3);
    }
    
    // Jika kode kondisi tersedia, gunakan fungsi lain
    if ($conditionCode !== null) {
        return calculateLightIntensity($conditionCode, 50);
    }
    
    // Fallback ke nilai default
    return $lightBase;
}

/**
 * Buat analisis dampak cuaca untuk dashboard
 */
function generateWeatherImpact($current, $forecast) {
    // Analisis tren suhu
    $temps = array_column($forecast, 'temperature');
    $avgTemp = array_sum($temps) / count($temps);
    
    // Analisis tren curah hujan berdasarkan kondisi
    $rainConditions = ['Hujan', 'Rain', 'Drizzle', 'Shower', 'Thunderstorm'];
    $rainDays = 0;
    
    foreach ($forecast as $day) {
        foreach ($rainConditions as $condition) {
            if (strpos($day['condition'], $condition) !== false) {
                $rainDays++;
                break;
            }
        }
    }
    
    $rainProbability = $rainDays / count($forecast) * 100;
    
    // Buat analisis dampak
    $soilImpact = 'Stabil';
    $tempImpact = 'Stabil';
    $lightImpact = 'Stabil';
    $humidityImpact = 'Stabil';
    $growthImpact = 'Stabil';
    $healthImpact = 'Baik';
    
    // Analisis kelembaban tanah
    if ($rainProbability > 60) {
        $soilImpact = 'Akan meningkat karena curah hujan';
    } else if ($avgTemp > 30 && $current['humidity'] < 60) {
        $soilImpact = 'Cenderung menurun karena penguapan';
    }
    
    // Analisis suhu
    if ($avgTemp > 30) {
        $tempImpact = 'Cenderung tinggi, perlu perhatian';
    } else if ($avgTemp < 18) {
        $tempImpact = 'Cenderung rendah';
    } else if ($avgTemp >= 22 && $avgTemp <= 28) {
        $tempImpact = 'Dalam kisaran optimal';
    }
    
    // Analisis cahaya
    if ($rainProbability > 60) {
        $lightImpact = 'Berkurang selama periode hujan';
    } else if (array_sum(array_column($forecast, 'light_intensity')) / count($forecast) < 400) {
        $lightImpact = 'Cenderung rendah, pertimbangkan pencahayaan tambahan';
    }
    
    // Analisis kelembaban udara
    if ($rainProbability > 60) {
        $humidityImpact = 'Meningkat, perlu ventilasi';
    } else if ($avgTemp > 30 && $current['humidity'] < 50) {
        $humidityImpact = 'Mungkin rendah, perlu ditingkatkan';
    }
    
    // Analisis pertumbuhan
    if (($avgTemp > 30 || $avgTemp < 18) && $rainProbability > 70) {
        $growthImpact = 'Mungkin melambat signifikan';
    } else if ($avgTemp > 28 || $avgTemp < 20 || $rainProbability > 50) {
        $growthImpact = 'Sedikit melambat';
    } else {
        $growthImpact = 'Diperkirakan optimal';
    }
    
    // Analisis kesehatan
    if ($rainProbability > 70 && $avgTemp > 27) {
        $healthImpact = 'Perlu perhatian ekstra (risiko jamur dan penyakit)';
    } else if ($rainProbability > 60 || $avgTemp > 32 || $avgTemp < 18) {
        $healthImpact = 'Perlu pengawasan';
    } else {
        $healthImpact = 'Diperkirakan stabil';
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
        $recommendations[] = 'Pastikan drainase yang baik untuk menghindari genangan air';
    } else if (strpos($impact['soil_moisture'], 'menurun') !== false) {
        $recommendations[] = 'Tingkatkan frekuensi irigasi untuk mengatasi penguapan';
    }
    
    if (strpos($impact['light_intensity'], 'rendah') !== false || 
        strpos($impact['light_intensity'], 'Berkurang') !== false) {
        $recommendations[] = 'Pertimbangkan pencahayaan tambahan pada hari mendung';
    }
    
    if (strpos($impact['air_temperature'], 'tinggi') !== false) {
        $recommendations[] = 'Tingkatkan sirkulasi udara dan pertimbangkan pendinginan tambahan';
        $recommendations[] = 'Pertimbangkan naungan atau pemberian paranet pada waktu panas terik';
    } else if (strpos($impact['air_temperature'], 'rendah') !== false) {
        $recommendations[] = 'Pertimbangkan penggunaan sistem pemanas jika tersedia';
    }
    
    if (strpos($impact['humidity'], 'Meningkat') !== false) {
        $recommendations[] = 'Tingkatkan ventilasi untuk mencegah kelembaban berlebih';
    } else if (strpos($impact['humidity'], 'rendah') !== false) {
        $recommendations[] = 'Pertimbangkan penyemprotan air atau teknik meningkatkan kelembaban';
    }
    
    if (strpos($impact['growth_rate'], 'melambat') !== false || 
        strpos($impact['growth_rate'], 'terhambat') !== false) {
        $recommendations[] = 'Sesuaikan parameter kontrol untuk mengoptimalkan pertumbuhan';
    }
    
    if (strpos($impact['plant_health'], 'perhatian') !== false) {
        $recommendations[] = 'Tingkatkan pemantauan kesehatan tanaman dalam beberapa hari ke depan';
        $recommendations[] = 'Awasi tanda-tanda penyakit jamur karena kelembaban tinggi';
    }
    
    // Tambahkan rekomendasi umum jika belum ada rekomendasi
    if (empty($recommendations)) {
        $recommendations[] = 'Kondisi cuaca mendukung pertumbuhan, pertahankan parameter kontrol saat ini';
    }
    
    // Selalu tambahkan rekomendasi monitoring
    $recommendations[] = 'Pantau kelembaban tanah secara teratur';
    
    return $recommendations;
}

/**
 * Dapatkan data cuaca default jika API gagal
 */
function getDefaultWeatherData() {
    // Tanggal saat ini
    $today = date('Y-m-d');
    
    // Buat data cuaca simulasi
    $current = [
        'temperature' => rand(22, 30),
        'humidity' => rand(50, 80),
        'condition' => getRandomWeatherCondition(),
        'location' => 'Palangkaraya',
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
    $impact = [
        'soil_moisture' => 'Stabil',
        'air_temperature' => 'Dalam kisaran normal',
        'light_intensity' => 'Cukup baik',
        'humidity' => 'Dalam kisaran normal',
        'growth_rate' => 'Diperkirakan normal',
        'plant_health' => 'Diperkirakan stabil'
    ];
    
    // Buat rekomendasi
    $recommendations = [
        'Pantau kelembaban tanah secara teratur',
        'Lakukan pemantauan rutin untuk memastikan kondisi optimal',
        'Sesuaikan parameter kontrol berdasarkan fase pertumbuhan tanaman'
    ];
    
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

?>