<?php
/**
 * test_fuzzy_logic.php
 * 
 * File untuk pengujian unit logika fuzzy
 * termasuk fungsi keanggotaan, inferensi, dan defuzzifikasi
 */

// Masukkan file fuzzy_logic.php
require_once('../php/fuzzy_logic.php');

// Kelas pengujian untuk logika fuzzy
class FuzzyLogicTest {
    // Hasil pengujian
    private $testResults = [
        'passed' => 0,
        'failed' => 0,
        'total' => 0
    ];
    
    // Data test yang akan digunakan
    private $testCases = [
        // Tanah kering, suhu panas, cahaya tinggi, kelembaban rendah
        [
            'input' => [
                'soil_moisture' => 20,
                'air_temperature' => 35,
                'light_intensity' => 800,
                'humidity' => 20
            ],
            'expected' => [
                'irrigation_duration' => 'Lama',
                'temperature_setting' => 'Menurunkan',
                'light_control' => 'Redup'
            ]
        ],
        // Tanah sedang, suhu sedang, cahaya sedang, kelembaban sedang
        [
            'input' => [
                'soil_moisture' => 50,
                'air_temperature' => 25,
                'light_intensity' => 500,
                'humidity' => 50
            ],
            'expected' => [
                'irrigation_duration' => 'Sedang',
                'temperature_setting' => 'Mempertahankan',
                'light_control' => 'Sedang'
            ]
        ],
        // Tanah basah, suhu dingin, cahaya rendah, kelembaban tinggi
        [
            'input' => [
                'soil_moisture' => 80,
                'air_temperature' => 12,
                'light_intensity' => 200,
                'humidity' => 85
            ],
            'expected' => [
                'irrigation_duration' => 'Tidak Ada',
                'temperature_setting' => 'Menaikkan',
                'light_control' => 'Terang'
            ]
        ],
        // Tanah kering, suhu sedang, cahaya rendah, kelembaban sedang
        [
            'input' => [
                'soil_moisture' => 25,
                'air_temperature' => 22,
                'light_intensity' => 250,
                'humidity' => 45
            ],
            'expected' => [
                'irrigation_duration' => 'Lama',
                'temperature_setting' => 'Mempertahankan',
                'light_control' => 'Terang'
            ]
        ],
        // Tanah basah, suhu panas, cahaya sedang, kelembaban rendah
        [
            'input' => [
                'soil_moisture' => 75,
                'air_temperature' => 32,
                'light_intensity' => 550,
                'humidity' => 25
            ],
            'expected' => [
                'irrigation_duration' => 'Tidak Ada',
                'temperature_setting' => 'Menurunkan',
                'light_control' => 'Sedang'
            ]
        ]
    ];
    
    // Konstruktor
    public function __construct() {
        echo "<html>
                <head>
                    <title>Pengujian Logika Fuzzy</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            max-width: 1000px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        h1, h2 {
                            color: #4CAF50;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 20px;
                        }
                        th, td {
                            border: 1px solid #ddd;
                            padding: 8px;
                            text-align: left;
                        }
                        th {
                            background-color: #4CAF50;
                            color: white;
                        }
                        tr:nth-child(even) {
                            background-color: #f2f2f2;
                        }
                        .pass {
                            background-color: #dff0d8;
                            color: #3c763d;
                        }
                        .fail {
                            background-color: #f2dede;
                            color: #a94442;
                        }
                        .summary {
                            margin-top: 20px;
                            padding: 10px;
                            border-radius: 5px;
                        }
                        .test-section {
                            margin-bottom: 30px;
                            border: 1px solid #ddd;
                            padding: 15px;
                            border-radius: 5px;
                        }
                    </style>
                </head>
                <body>
                    <h1>Pengujian Logika Fuzzy</h1>
        ";
    }
    
    // Metode untuk menjalankan semua pengujian
    public function runAllTests() {
        echo "<div class='test-section'>";
        echo "<h2>1. Pengujian Fungsi Keanggotaan</h2>";
        $this->testMembershipFunctions();
        echo "</div>";
        
        echo "<div class='test-section'>";
        echo "<h2>2. Pengujian Inferensi Fuzzy</h2>";
        $this->testFuzzyInference();
        echo "</div>";
        
        echo "<div class='test-section'>";
        echo "<h2>3. Pengujian Defuzzifikasi</h2>";
        $this->testDefuzzification();
        echo "</div>";
        
        echo "<div class='test-section'>";
        echo "<h2>4. Pengujian End-to-End</h2>";
        $this->testEndToEnd();
        echo "</div>";
        
        // Tampilkan ringkasan hasil pengujian
        $this->showSummary();
        
        echo "</body></html>";
    }
    
    // Pengujian fungsi keanggotaan
    private function testMembershipFunctions() {
        echo "<h3>Pengujian Fungsi Keanggotaan Kelembaban Tanah</h3>";
        $this->testSoilMoistureMembership();
        
        echo "<h3>Pengujian Fungsi Keanggotaan Suhu Udara</h3>";
        $this->testAirTemperatureMembership();
        
        echo "<h3>Pengujian Fungsi Keanggotaan Intensitas Cahaya</h3>";
        $this->testLightIntensityMembership();
        
        echo "<h3>Pengujian Fungsi Keanggotaan Kelembaban Udara</h3>";
        $this->testHumidityMembership();
    }
    
    // Pengujian fungsi keanggotaan kelembaban tanah
    private function testSoilMoistureMembership() {
        $testCases = [
            ['value' => 20, 'expected' => ['kering' => 1, 'sedang' => 0, 'basah' => 0]],
            ['value' => 35, 'expected' => ['kering' => 0.5, 'sedang' => 0.25, 'basah' => 0]],
            ['value' => 50, 'expected' => ['kering' => 0, 'sedang' => 1, 'basah' => 0]],
            ['value' => 65, 'expected' => ['kering' => 0, 'sedang' => 0.25, 'basah' => 0.5]],
            ['value' => 80, 'expected' => ['kering' => 0, 'sedang' => 0, 'basah' => 1]]
        ];
        
        echo "<table>
                <tr>
                    <th>Nilai Input</th>
                    <th>Kering (Expected)</th>
                    <th>Kering (Actual)</th>
                    <th>Sedang (Expected)</th>
                    <th>Sedang (Actual)</th>
                    <th>Basah (Expected)</th>
                    <th>Basah (Actual)</th>
                    <th>Status</th>
                </tr>";
        
        foreach ($testCases as $test) {
            $actual = soilMoistureMembership($test['value']);
            
            $isPass = $this->compareWithTolerance($actual['kering'], $test['expected']['kering']) &&
                      $this->compareWithTolerance($actual['sedang'], $test['expected']['sedang']) &&
                      $this->compareWithTolerance($actual['basah'], $test['expected']['basah']);
            
            $status = $isPass ? 'PASS' : 'FAIL';
            $statusClass = $isPass ? 'pass' : 'fail';
            
            echo "<tr class='$statusClass'>
                    <td>{$test['value']}</td>
                    <td>{$test['expected']['kering']}</td>
                    <td>{$actual['kering']}</td>
                    <td>{$test['expected']['sedang']}</td>
                    <td>{$actual['sedang']}</td>
                    <td>{$test['expected']['basah']}</td>
                    <td>{$actual['basah']}</td>
                    <td>$status</td>
                  </tr>";
            
            // Update hasil test
            $this->testResults['total']++;
            if ($isPass) {
                $this->testResults['passed']++;
            } else {
                $this->testResults['failed']++;
            }
        }
        
        echo "</table>";
    }
    
    // Pengujian fungsi keanggotaan suhu udara
    private function testAirTemperatureMembership() {
        $testCases = [
            ['value' => 10, 'expected' => ['dingin' => 1, 'sedang' => 0, 'panas' => 0]],
            ['value' => 17, 'expected' => ['dingin' => 0.6, 'sedang' => 0.27, 'panas' => 0]],
            ['value' => 23, 'expected' => ['dingin' => 0, 'sedang' => 0.93, 'panas' => 0]],
            ['value' => 27, 'expected' => ['dingin' => 0, 'sedang' => 0.4, 'panas' => 0.4]],
            ['value' => 35, 'expected' => ['dingin' => 0, 'sedang' => 0, 'panas' => 1]]
        ];
        
        echo "<table>
                <tr>
                    <th>Nilai Input</th>
                    <th>Dingin (Expected)</th>
                    <th>Dingin (Actual)</th>
                    <th>Sedang (Expected)</th>
                    <th>Sedang (Actual)</th>
                    <th>Panas (Expected)</th>
                    <th>Panas (Actual)</th>
                    <th>Status</th>
                </tr>";
        
        foreach ($testCases as $test) {
            $actual = airTemperatureMembership($test['value']);
            
            $isPass = $this->compareWithTolerance($actual['dingin'], $test['expected']['dingin']) &&
                      $this->compareWithTolerance($actual['sedang'], $test['expected']['sedang']) &&
                      $this->compareWithTolerance($actual['panas'], $test['expected']['panas']);
            
            $status = $isPass ? 'PASS' : 'FAIL';
            $statusClass = $isPass ? 'pass' : 'fail';
            
            echo "<tr class='$statusClass'>
                    <td>{$test['value']}</td>
                    <td>{$test['expected']['dingin']}</td>
                    <td>{$actual['dingin']}</td>
                    <td>{$test['expected']['sedang']}</td>
                    <td>{$actual['sedang']}</td>
                    <td>{$test['expected']['panas']}</td>
                    <td>{$actual['panas']}</td>
                    <td>$status</td>
                  </tr>";
            
            // Update hasil test
            $this->testResults['total']++;
            if ($isPass) {
                $this->testResults['passed']++;
            } else {
                $this->testResults['failed']++;
            }
        }
        
        echo "</table>";
    }
    
    // Pengujian fungsi keanggotaan intensitas cahaya
    private function testLightIntensityMembership() {
        $testCases = [
            ['value' => 200, 'expected' => ['rendah' => 1, 'sedang' => 0, 'tinggi' => 0]],
            ['value' => 350, 'expected' => ['rendah' => 0.5, 'sedang' => 0.25, 'tinggi' => 0]],
            ['value' => 500, 'expected' => ['rendah' => 0, 'sedang' => 1, 'tinggi' => 0]],
            ['value' => 650, 'expected' => ['rendah' => 0, 'sedang' => 0.25, 'tinggi' => 0.5]],
            ['value' => 800, 'expected' => ['rendah' => 0, 'sedang' => 0, 'tinggi' => 1]]
        ];
        
        echo "<table>
                <tr>
                    <th>Nilai Input</th>
                    <th>Rendah (Expected)</th>
                    <th>Rendah (Actual)</th>
                    <th>Sedang (Expected)</th>
                    <th>Sedang (Actual)</th>
                    <th>Tinggi (Expected)</th>
                    <th>Tinggi (Actual)</th>
                    <th>Status</th>
                </tr>";
        
        foreach ($testCases as $test) {
            $actual = lightIntensityMembership($test['value']);
            
            $isPass = $this->compareWithTolerance($actual['rendah'], $test['expected']['rendah']) &&
                      $this->compareWithTolerance($actual['sedang'], $test['expected']['sedang']) &&
                      $this->compareWithTolerance($actual['tinggi'], $test['expected']['tinggi']);
            
            $status = $isPass ? 'PASS' : 'FAIL';
            $statusClass = $isPass ? 'pass' : 'fail';
            
            echo "<tr class='$statusClass'>
                    <td>{$test['value']}</td>
                    <td>{$test['expected']['rendah']}</td>
                    <td>{$actual['rendah']}</td>
                    <td>{$test['expected']['sedang']}</td>
                    <td>{$actual['sedang']}</td>
                    <td>{$test['expected']['tinggi']}</td>
                    <td>{$actual['tinggi']}</td>
                    <td>$status</td>
                  </tr>";
            
            // Update hasil test
            $this->testResults['total']++;
            if ($isPass) {
                $this->testResults['passed']++;
            } else {
                $this->testResults['failed']++;
            }
        }
        
        echo "</table>";
    }
    
    // Pengujian fungsi keanggotaan kelembaban udara
    private function testHumidityMembership() {
        $testCases = [
            ['value' => 20, 'expected' => ['rendah' => 1, 'sedang' => 0, 'tinggi' => 0]],
            ['value' => 35, 'expected' => ['rendah' => 0.5, 'sedang' => 0.25, 'tinggi' => 0]],
            ['value' => 50, 'expected' => ['rendah' => 0, 'sedang' => 1, 'tinggi' => 0]],
            ['value' => 65, 'expected' => ['rendah' => 0, 'sedang' => 0.25, 'tinggi' => 0.5]],
            ['value' => 80, 'expected' => ['rendah' => 0, 'sedang' => 0, 'tinggi' => 1]]
        ];
        
        echo "<table>
                <tr>
                    <th>Nilai Input</th>
                    <th>Rendah (Expected)</th>
                    <th>Rendah (Actual)</th>
                    <th>Sedang (Expected)</th>
                    <th>Sedang (Actual)</th>
                    <th>Tinggi (Expected)</th>
                    <th>Tinggi (Actual)</th>
                    <th>Status</th>
                </tr>";
        
        foreach ($testCases as $test) {
            $actual = humidityMembership($test['value']);
            
            $isPass = $this->compareWithTolerance($actual['rendah'], $test['expected']['rendah']) &&
                      $this->compareWithTolerance($actual['sedang'], $test['expected']['sedang']) &&
                      $this->compareWithTolerance($actual['tinggi'], $test['expected']['tinggi']);
            
            $status = $isPass ? 'PASS' : 'FAIL';
            $statusClass = $isPass ? 'pass' : 'fail';
            
            echo "<tr class='$statusClass'>
                    <td>{$test['value']}</td>
                    <td>{$test['expected']['rendah']}</td>
                    <td>{$actual['rendah']}</td>
                    <td>{$test['expected']['sedang']}</td>
                    <td>{$actual['sedang']}</td>
                    <td>{$test['expected']['tinggi']}</td>
                    <td>{$actual['tinggi']}</td>
                    <td>$status</td>
                  </tr>";
            
            // Update hasil test
            $this->testResults['total']++;
            if ($isPass) {
                $this->testResults['passed']++;
            } else {
                $this->testResults['failed']++;
            }
        }
        
        echo "</table>";
    }
    
    // Pengujian inferensi fuzzy
    private function testFuzzyInference() {
        $testCases = [
            [
                'input' => [
                    'soil_moisture' => ['kering' => 1, 'sedang' => 0, 'basah' => 0],
                    'air_temperature' => ['dingin' => 0, 'sedang' => 0, 'panas' => 1],
                    'light_intensity' => ['rendah' => 0, 'sedang' => 0, 'tinggi' => 1],
                    'humidity' => ['rendah' => 1, 'sedang' => 0, 'tinggi' => 0]
                ],
                'expected' => [
                    'irrigation' => ['tidak_ada' => 0, 'singkat' => 0, 'sedang' => 0, 'lama' => 1],
                    'temperature' => ['menurunkan' => 1, 'mempertahankan' => 0, 'menaikkan' => 0],
                    'light_control' => ['mati' => 0, 'redup' => 1, 'sedang' => 0, 'terang' => 0]
                ]
            ],
            [
                'input' => [
                    'soil_moisture' => ['kering' => 0, 'sedang' => 1, 'basah' => 0],
                    'air_temperature' => ['dingin' => 0, 'sedang' => 1, 'panas' => 0],
                    'light_intensity' => ['rendah' => 0, 'sedang' => 1, 'tinggi' => 0],
                    'humidity' => ['rendah' => 0, 'sedang' => 1, 'tinggi' => 0]
                ],
                'expected' => [
                    'irrigation' => ['tidak_ada' => 0, 'singkat' => 0, 'sedang' => 1, 'lama' => 0],
                    'temperature' => ['menurunkan' => 0, 'mempertahankan' => 1, 'menaikkan' => 0],
                    'light_control' => ['mati' => 0, 'redup' => 0, 'sedang' => 1, 'terang' => 0]
                ]
            ]
        ];
        
        echo "<p>Menguji apakah inferensi fuzzy menghasilkan output yang diharapkan berdasarkan input linguistik...</p>";
        
        foreach ($testCases as $index => $test) {
            $actual = fuzzyInference(
                $test['input']['soil_moisture'],
                $test['input']['air_temperature'],
                $test['input']['light_intensity'],
                $test['input']['humidity']
            );
            
            $irrigationPass = $this->compareArrays($actual['irrigation'], $test['expected']['irrigation']);
            $temperaturePass = $this->compareArrays($actual['temperature'], $test['expected']['temperature']);
            $lightControlPass = $this->compareArrays($actual['light_control'], $test['expected']['light_control']);
            
            $isPass = $irrigationPass && $temperaturePass && $lightControlPass;
            
            echo "<div style='margin-bottom: 20px;'>";
            echo "<h4>Test Case " . ($index + 1) . ": " . ($isPass ? "<span class='pass'>PASS</span>" : "<span class='fail'>FAIL</span>") . "</h4>";
            
            echo "<p><strong>Input:</strong></p>";
            echo "<ul>";
            echo "<li>Kelembaban Tanah: Kering = {$test['input']['soil_moisture']['kering']}, Sedang = {$test['input']['soil_moisture']['sedang']}, Basah = {$test['input']['soil_moisture']['basah']}</li>";
            echo "<li>Suhu Udara: Dingin = {$test['input']['air_temperature']['dingin']}, Sedang = {$test['input']['air_temperature']['sedang']}, Panas = {$test['input']['air_temperature']['panas']}</li>";
            echo "<li>Intensitas Cahaya: Rendah = {$test['input']['light_intensity']['rendah']}, Sedang = {$test['input']['light_intensity']['sedang']}, Tinggi = {$test['input']['light_intensity']['tinggi']}</li>";
            echo "<li>Kelembaban Udara: Rendah = {$test['input']['humidity']['rendah']}, Sedang = {$test['input']['humidity']['sedang']}, Tinggi = {$test['input']['humidity']['tinggi']}</li>";
            echo "</ul>";
            
            echo "<p><strong>Output yang Diharapkan:</strong></p>";
            echo "<ul>";
            echo "<li>Durasi Irigasi: Tidak Ada = {$test['expected']['irrigation']['tidak_ada']}, Singkat = {$test['expected']['irrigation']['singkat']}, Sedang = {$test['expected']['irrigation']['sedang']}, Lama = {$test['expected']['irrigation']['lama']}</li>";
            echo "<li>Pengaturan Suhu: Menurunkan = {$test['expected']['temperature']['menurunkan']}, Mempertahankan = {$test['expected']['temperature']['mempertahankan']}, Menaikkan = {$test['expected']['temperature']['menaikkan']}</li>";
            echo "<li>Kontrol Pencahayaan: Mati = {$test['expected']['light_control']['mati']}, Redup = {$test['expected']['light_control']['redup']}, Sedang = {$test['expected']['light_control']['sedang']}, Terang = {$test['expected']['light_control']['terang']}</li>";
            echo "</ul>";
            
            echo "<p><strong>Output Aktual:</strong></p>";
            echo "<ul>";
            echo "<li>Durasi Irigasi: Tidak Ada = {$actual['irrigation']['tidak_ada']}, Singkat = {$actual['irrigation']['singkat']}, Sedang = {$actual['irrigation']['sedang']}, Lama = {$actual['irrigation']['lama']}</li>";
            echo "<li>Pengaturan Suhu: Menurunkan = {$actual['temperature']['menurunkan']}, Mempertahankan = {$actual['temperature']['mempertahankan']}, Menaikkan = {$actual['temperature']['menaikkan']}</li>";
            echo "<li>Kontrol Pencahayaan: Mati = {$actual['light_control']['mati']}, Redup = {$actual['light_control']['redup']}, Sedang = {$actual['light_control']['sedang']}, Terang = {$actual['light_control']['terang']}</li>";
            echo "</ul>";
            echo "</div>";
            
            // Update hasil test
            $this->testResults['total']++;
            if ($isPass) {
                $this->testResults['passed']++;
            } else {
                $this->testResults['failed']++;
            }
        }
    }
    
    // Pengujian defuzzifikasi
    private function testDefuzzification() {
        $testCases = [
            [
                'irrigation' => ['tidak_ada' => 0, 'singkat' => 0, 'sedang' => 0, 'lama' => 1],
                'temperature' => ['menurunkan' => 1, 'mempertahankan' => 0, 'menaikkan' => 0],
                'light_control' => ['mati' => 0, 'redup' => 1, 'sedang' => 0, 'terang' => 0],
                'expected' => [
                    'irrigation_duration' => 80,
                    'temperature_setting' => -7,
                    'light_control' => 25
                ],
                'tolerance' => [10, 1, 5]
            ],
            [
                'irrigation' => ['tidak_ada' => 0, 'singkat' => 0, 'sedang' => 1, 'lama' => 0],
                'temperature' => ['menurunkan' => 0, 'mempertahankan' => 1, 'menaikkan' => 0],
                'light_control' => ['mati' => 0, 'redup' => 0, 'sedang' => 1, 'terang' => 0],
                'expected' => [
                    'irrigation_duration' => 50,
                    'temperature_setting' => 0,
                    'light_control' => 50
                ],
                'tolerance' => [10, 1, 5]
            ]
        ];
        
        echo "<p>Menguji apakah defuzzifikasi menghasilkan nilai numerik yang benar berdasarkan keanggotaan output...</p>";
        
        foreach ($testCases as $index => $test) {
            $actualIrrigation = defuzzifyIrrigation($test['irrigation']);
            $actualTemperature = defuzzifyTemperature($test['temperature']);
            $actualLightControl = defuzzifyLightControl($test['light_control']);
            
            $irrigationPass = abs($actualIrrigation - $test['expected']['irrigation_duration']) <= $test['tolerance'][0];
            $temperaturePass = abs($actualTemperature - $test['expected']['temperature_setting']) <= $test['tolerance'][1];
            $lightControlPass = abs($actualLightControl - $test['expected']['light_control']) <= $test['tolerance'][2];
            
            $isPass = $irrigationPass && $temperaturePass && $lightControlPass;
            
            echo "<div style='margin-bottom: 20px;'>";
            echo "<h4>Test Case " . ($index + 1) . ": " . ($isPass ? "<span class='pass'>PASS</span>" : "<span class='fail'>FAIL</span>") . "</h4>";
            
            echo "<p><strong>Input Membership:</strong></p>";
            echo "<ul>";
            echo "<li>Durasi Irigasi: Tidak Ada = {$test['irrigation']['tidak_ada']}, Singkat = {$test['irrigation']['singkat']}, Sedang = {$test['irrigation']['sedang']}, Lama = {$test['irrigation']['lama']}</li>";
            echo "<li>Pengaturan Suhu: Menurunkan = {$test['temperature']['menurunkan']}, Mempertahankan = {$test['temperature']['mempertahankan']}, Menaikkan = {$test['temperature']['menaikkan']}</li>";
            echo "<li>Kontrol Pencahayaan: Mati = {$test['light_control']['mati']}, Redup = {$test['light_control']['redup']}, Sedang = {$test['light_control']['sedang']}, Terang = {$test['light_control']['terang']}</li>";
            echo "</ul>";
            
            echo "<p><strong>Output yang Diharapkan:</strong></p>";
            echo "<ul>";
            echo "<li>Durasi Irigasi: {$test['expected']['irrigation_duration']} menit " . ($irrigationPass ? "(PASS)" : "(FAIL)") . "</li>";
            echo "<li>Pengaturan Suhu: {$test['expected']['temperature_setting']}°C " . ($temperaturePass ? "(PASS)" : "(FAIL)") . "</li>";
            echo "<li>Kontrol Pencahayaan: {$test['expected']['light_control']}% " . ($lightControlPass ? "(PASS)" : "(FAIL)") . "</li>";
            echo "</ul>";
            
            echo "<p><strong>Output Aktual:</strong></p>";
            echo "<ul>";
            echo "<li>Durasi Irigasi: {$actualIrrigation} menit</li>";
            echo "<li>Pengaturan Suhu: {$actualTemperature}°C</li>";
            echo "<li>Kontrol Pencahayaan: {$actualLightControl}%</li>";
            echo "</ul>";
            echo "</div>";
            
            // Update hasil test
            $this->testResults['total']++;
            if ($isPass) {
                $this->testResults['passed']++;
            } else {
                $this->testResults['failed']++;
            }
        }
    }
    
    // Pengujian end-to-end
    private function testEndToEnd() {
        echo "<p>Menguji sistem fuzzy secara keseluruhan dengan berbagai input...</p>";
        
        echo "<table>
                <tr>
                    <th>Kelembaban Tanah</th>
                    <th>Suhu Udara</th>
                    <th>Intensitas Cahaya</th>
                    <th>Kelembaban Udara</th>
                    <th>Durasi Irigasi (Expected)</th>
                    <th>Durasi Irigasi (Actual)</th>
                    <th>Pengaturan Suhu (Expected)</th>
                    <th>Pengaturan Suhu (Actual)</th>
                    <th>Kontrol Cahaya (Expected)</th>
                    <th>Kontrol Cahaya (Actual)</th>
                    <th>Status</th>
                </tr>";
        
        foreach ($this->testCases as $test) {
            $input = $test['input'];
            $expected = $test['expected'];
            
            // Hitung output fuzzy
            $result = calculateFuzzyControl(
                $input['soil_moisture'],
                $input['air_temperature'],
                $input['light_intensity'],
                $input['humidity']
            );
            
            // Cek apakah output sesuai dengan yang diharapkan
            $isPass = 
                $result['irrigation_duration'] === $expected['irrigation_duration'] &&
                $result['temperature_setting'] === $expected['temperature_setting'] &&
                $result['light_control'] === $expected['light_control'];
            
            $status = $isPass ? 'PASS' : 'FAIL';
            $statusClass = $isPass ? 'pass' : 'fail';
            
            echo "<tr class='$statusClass'>
                    <td>{$input['soil_moisture']}</td>
                    <td>{$input['air_temperature']}</td>
                    <td>{$input['light_intensity']}</td>
                    <td>{$input['humidity']}</td>
                    <td>{$expected['irrigation_duration']}</td>
                    <td>{$result['irrigation_duration']}</td>
                    <td>{$expected['temperature_setting']}</td>
                    <td>{$result['temperature_setting']}</td>
                    <td>{$expected['light_control']}</td>
                    <td>{$result['light_control']}</td>
                    <td>$status</td>
                  </tr>";
            
            // Update hasil test
            $this->testResults['total']++;
            if ($isPass) {
                $this->testResults['passed']++;
            } else {
                $this->testResults['failed']++;
            }
        }
        
        echo "</table>";
    }
    
    // Tampilkan ringkasan hasil pengujian
    private function showSummary() {
        $passPercentage = ($this->testResults['passed'] / $this->testResults['total']) * 100;
        $summaryClass = $passPercentage >= 90 ? 'pass' : ($passPercentage >= 70 ? 'warning' : 'fail');
        
        echo "<div class='summary $summaryClass'>
                <h2>Ringkasan Hasil Pengujian</h2>
                <p>Total Test: {$this->testResults['total']}</p>
                <p>Test Berhasil: {$this->testResults['passed']}</p>
                <p>Test Gagal: {$this->testResults['failed']}</p>
                <p>Persentase Keberhasilan: " . number_format($passPercentage, 2) . "%</p>
              </div>";
    }
    
    // Fungsi helper untuk membandingkan nilai dengan toleransi
    private function compareWithTolerance($actual, $expected, $tolerance = 0.05) {
        return abs($actual - $expected) <= $tolerance;
    }
    
    // Fungsi helper untuk membandingkan dua array
    private function compareArrays($actual, $expected, $tolerance = 0.05) {
        if (count($actual) !== count($expected)) {
            return false;
        }
        
        foreach ($expected as $key => $value) {
            if (!isset($actual[$key]) || !$this->compareWithTolerance($actual[$key], $value, $tolerance)) {
                return false;
            }
        }
        
        return true;
    }
}

// Jalankan pengujian
$tester = new FuzzyLogicTest();
$tester->runAllTests();
?>