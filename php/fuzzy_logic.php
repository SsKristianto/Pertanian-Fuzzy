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
    $soil_moisture = $_POST['soil_moisture'];
    $air_temperature = $_POST['air_temperature'];
    $light_intensity = $_POST['light_intensity'];
    $humidity = $_POST['humidity'];

    $output = calculate_fuzzy_output($soil_moisture, $air_temperature, $light_intensity, $humidity);
    echo json_encode($output);
}
?>
