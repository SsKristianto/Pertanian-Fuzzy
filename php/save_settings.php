<?php
include('connect.php');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $soil_moisture = $_POST['soil_moisture'];
    $air_temperature = $_POST['air_temperature'];
    $light_intensity = $_POST['light_intensity'];
    $humidity = $_POST['humidity'];
    $irrigation_duration = $_POST['irrigation_duration'];
    $temperature_setting = $_POST['temperature_setting'];
    $light_control = $_POST['light_control'];

    $sql = "INSERT INTO fuzzy_rules (soil_moisture, air_temperature, light_intensity, humidity, irrigation_duration, temperature_setting, light_control) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$soil_moisture, $air_temperature, $light_intensity, $humidity, $irrigation_duration, $temperature_setting, $light_control]);

    echo "Pengaturan berhasil disimpan!";
}
?>
