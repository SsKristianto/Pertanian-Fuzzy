<?php
include('connect.php');

// Fungsi fuzzy sederhana untuk mendefinisikan aturan dan inferensi
function calculate_fuzzy_output($soil_moisture, $air_temperature, $light_intensity, $humidity) {
    // Menentukan hasil output berdasarkan input (contoh sederhana)
    if ($soil_moisture == "kering" && $air_temperature == "panas") {
        return ['irrigation_duration' => 'lama', 'temperature_setting' => 'menurunkan', 'light_control' => 'terang'];
    } elseif ($soil_moisture == "sedang" && $air_temperature == "sedang") {
        return ['irrigation_duration' => 'sedang', 'temperature_setting' => 'mempertahankan', 'light_control' => 'sedang'];
    } else {
        return ['irrigation_duration' => 'singkat', 'temperature_setting' => 'menaikkan', 'light_control' => 'redyup'];
    }
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Pastikan input_mode ada dalam data POST
    $input_mode = isset($_POST['input_mode']) ? $_POST['input_mode'] : 'manual';  // Default ke manual jika tidak ada
    
    // Mengambil data input berdasarkan mode
    if ($input_mode == 'manual') {
        // Mengambil data input manual
        $soil_moisture = $_POST['soil_moisture'];
        $air_temperature = $_POST['air_temperature'];
        $light_intensity = $_POST['light_intensity'];
        $humidity = $_POST['humidity'];
    } else {
        // Mengambil data cuaca otomatis dari API (ini contoh, bisa lebih kompleks)
        $soil_moisture = $_POST['soil_moisture'];
        $air_temperature = $_POST['air_temperature'];
        $light_intensity = $_POST['light_intensity'];
        $humidity = $_POST['humidity'];
    }

    // Hitung output berdasarkan input
    $output = calculate_fuzzy_output($soil_moisture, $air_temperature, $light_intensity, $humidity);

    // Set header untuk respons JSON
    header('Content-Type: application/json');
    
    // Kirimkan hasil perhitungan dalam format JSON
    echo json_encode($output);
}
?>
