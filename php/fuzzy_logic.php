<?php
// Fungsi untuk mengkonversi nilai crisp ke nilai fuzzy
function fuzzify($value, $min, $max) {
    if ($value <= $min) return 0;
    if ($value >= $max) return 1;
    return ($value - $min) / ($max - $min);
}

// Fungsi untuk menghitung hasil dari kontrol berdasarkan logika fuzzy
function fuzzy_control($humidity, $temperature, $light) {
    // Fuzzifikasi setiap parameter
    $humidity_fuzzy = fuzzify($humidity, 0, 100);
    $temperature_fuzzy = fuzzify($temperature, 10, 40);
    $light_fuzzy = fuzzify($light, 0, 100);

    // Aturan Fuzzy
    if ($humidity_fuzzy <= 0.3 && $temperature_fuzzy >= 0.7) {
        $irrigation = "Lama";
    } else {
        $irrigation = "Sedang";
    }

    if ($temperature_fuzzy >= 0.7) {
        $temp_setting = "Menaikkan";
    } else {
        $temp_setting = "Menurunkan";
    }

    if ($light_fuzzy <= 0.3) {
        $light_control = "Terang";
    } else {
        $light_control = "Sedang";
    }

    return [
        'irrigation' => $irrigation,
        'temp_setting' => $temp_setting,
        'light_control' => $light_control
    ];
}
?>
