function fuzzyLogic(humidity, temperature, light) {
    // Fungsi untuk menghitung logika fuzzy (mirip dengan PHP)
    let humidity_fuzzy = fuzzify(humidity, 0, 100);
    let temperature_fuzzy = fuzzify(temperature, 10, 40);
    let light_fuzzy = fuzzify(light, 0, 100);

    let irrigation, temp_setting, light_control;

    // Aturan Fuzzy
    if (humidity_fuzzy <= 0.3 && temperature_fuzzy >= 0.7) {
        irrigation = "Lama";
    } else {
        irrigation = "Sedang";
    }

    if (temperature_fuzzy >= 0.7) {
        temp_setting = "Menaikkan";
    } else {
        temp_setting = "Menurunkan";
    }

    if (light_fuzzy <= 0.3) {
        light_control = "Terang";
    } else {
        light_control = "Sedang";
    }

    return {
        irrigation: irrigation,
        temp_setting: temp_setting,
        light_control: light_control
    };
}

function fuzzify(value, min, max) {
    if (value <= min) return 0;
    if (value >= max) return 1;
    return (value - min) / (max - min);
}