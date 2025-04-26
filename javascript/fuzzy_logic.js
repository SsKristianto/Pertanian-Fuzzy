/**
 * fuzzy_logic.js
 * 
 * File JavaScript untuk mengimplementasikan logika fuzzy di sisi klien
 * termasuk fuzzifikasi, evaluasi aturan, dan defuzzifikasi
 */

// Mendefinisikan objek global untuk logika fuzzy
const FuzzyLogic = {
    // Nilai input sistem
    inputValues: {
        soil_moisture: 50,
        air_temperature: 25,
        light_intensity: 500,
        humidity: 60
    },

    // Nilai output sistem
    outputValues: {
        irrigation_duration: 0,
        temperature_setting: 0,
        light_control: 0
    },

    // Definisi fungsi keanggotaan input
    membershipFunctions: {
        soil_moisture: {
            kering: function(x) {
                if (x <= 30) return 1;
                if (x > 30 && x < 40) return (40 - x) / 10;
                return 0;
            },
            sedang: function(x) {
                if (x <= 30 || x >= 70) return 0;
                if (x > 30 && x <= 50) return (x - 30) / 20;
                return (70 - x) / 20;
            },
            basah: function(x) {
                if (x >= 70) return 1;
                if (x > 60 && x < 70) return (x - 60) / 10;
                return 0;
            }
        },
        air_temperature: {
            dingin: function(x) {
                if (x <= 15) return 1;
                if (x > 15 && x < 20) return (20 - x) / 5;
                return 0;
            },
            sedang: function(x) {
                if (x <= 15 || x >= 30) return 0;
                if (x > 15 && x <= 22.5) return (x - 15) / 7.5;
                return (30 - x) / 7.5;
            },
            panas: function(x) {
                if (x >= 30) return 1;
                if (x > 25 && x < 30) return (x - 25) / 5;
                return 0;
            }
        },
        light_intensity: {
            rendah: function(x) {
                if (x <= 300) return 1;
                if (x > 300 && x < 400) return (400 - x) / 100;
                return 0;
            },
            sedang: function(x) {
                if (x <= 300 || x >= 700) return 0;
                if (x > 300 && x <= 500) return (x - 300) / 200;
                return (700 - x) / 200;
            },
            tinggi: function(x) {
                if (x >= 700) return 1;
                if (x > 600 && x < 700) return (x - 600) / 100;
                return 0;
            }
        },
        humidity: {
            rendah: function(x) {
                if (x <= 30) return 1;
                if (x > 30 && x < 40) return (40 - x) / 10;
                return 0;
            },
            sedang: function(x) {
                if (x <= 30 || x >= 70) return 0;
                if (x > 30 && x <= 50) return (x - 30) / 20;
                return (70 - x) / 20;
            },
            tinggi: function(x) {
                if (x >= 70) return 1;
                if (x > 60 && x < 70) return (x - 60) / 10;
                return 0;
            }
        }
    },

    // Fungsi untuk mengevaluasi nilai linguistik dengan nilai tertinggi
    getLinguisticValue: function(type, value) {
        let maxMembership = 0;
        let linguisticValue = '';

        switch (type) {
            case 'soil_moisture':
                const soilMoistureFunctions = this.membershipFunctions.soil_moisture;
                for (const key in soilMoistureFunctions) {
                    const membership = soilMoistureFunctions[key](value);
                    if (membership > maxMembership) {
                        maxMembership = membership;
                        linguisticValue = key;
                    }
                }
                break;
            case 'air_temperature':
                const airTemperatureFunctions = this.membershipFunctions.air_temperature;
                for (const key in airTemperatureFunctions) {
                    const membership = airTemperatureFunctions[key](value);
                    if (membership > maxMembership) {
                        maxMembership = membership;
                        linguisticValue = key;
                    }
                }
                break;
            case 'light_intensity':
                const lightIntensityFunctions = this.membershipFunctions.light_intensity;
                for (const key in lightIntensityFunctions) {
                    const membership = lightIntensityFunctions[key](value);
                    if (membership > maxMembership) {
                        maxMembership = membership;
                        linguisticValue = key;
                    }
                }
                break;
            case 'humidity':
                const humidityFunctions = this.membershipFunctions.humidity;
                for (const key in humidityFunctions) {
                    const membership = humidityFunctions[key](value);
                    if (membership > maxMembership) {
                        maxMembership = membership;
                        linguisticValue = key;
                    }
                }
                break;
        }

        return {
            value: linguisticValue,
            membership: maxMembership
        };
    },

    // Fungsi untuk menerjemahkan nilai numerik soil_moisture ke human-readable
    getSoilMoistureText: function(value) {
        const linguisticValue = this.getLinguisticValue('soil_moisture', value).value;
        switch (linguisticValue) {
            case 'kering':
                return 'Kering';
            case 'sedang':
                return 'Sedang';
            case 'basah':
                return 'Basah';
            default:
                return 'Tidak Diketahui';
        }
    },

    // Fungsi untuk menerjemahkan nilai numerik air_temperature ke human-readable
    getAirTemperatureText: function(value) {
        const linguisticValue = this.getLinguisticValue('air_temperature', value).value;
        switch (linguisticValue) {
            case 'dingin':
                return 'Dingin';
            case 'sedang':
                return 'Sedang';
            case 'panas':
                return 'Panas';
            default:
                return 'Tidak Diketahui';
        }
    },

    // Fungsi untuk menerjemahkan nilai numerik light_intensity ke human-readable
    getLightIntensityText: function(value) {
        const linguisticValue = this.getLinguisticValue('light_intensity', value).value;
        switch (linguisticValue) {
            case 'rendah':
                return 'Rendah';
            case 'sedang':
                return 'Sedang';
            case 'tinggi':
                return 'Tinggi';
            default:
                return 'Tidak Diketahui';
        }
    },

    // Fungsi untuk menerjemahkan nilai numerik humidity ke human-readable
    getHumidityText: function(value) {
        const linguisticValue = this.getLinguisticValue('humidity', value).value;
        switch (linguisticValue) {
            case 'rendah':
                return 'Rendah';
            case 'sedang':
                return 'Sedang';
            case 'tinggi':
                return 'Tinggi';
            default:
                return 'Tidak Diketahui';
        }
    },

    // Fungsi untuk menerjemahkan nilai output ke human-readable
    getIrrigationDurationText: function(value) {
        if (value <= 15) return 'Tidak Ada';
        if (value <= 35) return 'Singkat';
        if (value <= 65) return 'Sedang';
        return 'Lama';
    },

    getTemperatureSettingText: function(value) {
        if (value <= -4) return 'Menurunkan';
        if (value >= 4) return 'Menaikkan';
        return 'Mempertahankan';
    },

    getLightControlText: function(value) {
        if (value <= 15) return 'Mati';
        if (value <= 35) return 'Redup';
        if (value <= 65) return 'Sedang';
        return 'Terang';
    },

    // Fungsi untuk memperbarui nilai input
    updateInputValue: function(type, value) {
        this.inputValues[type] = parseFloat(value);

        // Perbarui tampilan nilai linguistik
        let linguisticElement = document.getElementById(type + '_membership');
        if (linguisticElement) {
            switch (type) {
                case 'soil_moisture':
                    linguisticElement.innerText = this.getSoilMoistureText(value);
                    break;
                case 'air_temperature':
                    linguisticElement.innerText = this.getAirTemperatureText(value);
                    break;
                case 'light_intensity':
                    linguisticElement.innerText = this.getLightIntensityText(value);
                    break;
                case 'humidity':
                    linguisticElement.innerText = this.getHumidityText(value);
                    break;
            }
        }
    },

    // Fungsi untuk menghitung output fuzzy via API
    calculateFuzzyOutput: function() {
        // Tampilkan animasi loading atau indikator
        document.getElementById('irrigation_duration').innerText = 'Menghitung...';
        document.getElementById('temperature_setting').innerText = 'Menghitung...';
        document.getElementById('light_control').innerText = 'Menghitung...';

        // Siapkan data untuk dikirim ke server
        const formData = new FormData();
        formData.append('soil_moisture', this.inputValues.soil_moisture);
        formData.append('air_temperature', this.inputValues.air_temperature);
        formData.append('light_intensity', this.inputValues.light_intensity);
        formData.append('humidity', this.inputValues.humidity);

        // Kirim request ke server
        fetch('php/fuzzy_logic.php', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Respons jaringan tidak baik');
                }
                return response.json();
            })
            .then(data => {
                // Perbarui nilai output
                this.outputValues.irrigation_duration = data.irrigation_duration_value;
                this.outputValues.temperature_setting = data.temperature_setting_value;
                this.outputValues.light_control = data.light_control_value;

                // Perbarui tampilan
                this.updateOutputDisplay(data);
            })
            .catch(error => {
                console.error('Error:', error);
                // Tampilkan pesan error
                document.getElementById('irrigation_duration').innerText = 'Error: ' + error.message;
                document.getElementById('temperature_setting').innerText = 'Error: ' + error.message;
                document.getElementById('light_control').innerText = 'Error: ' + error.message;
            });
    },

    // Fungsi untuk memperbarui tampilan output
    updateOutputDisplay: function(data) {
        // Perbarui nilai output
        document.getElementById('irrigation_duration_value').innerText = data.irrigation_duration_value + ' menit';
        document.getElementById('temperature_setting_value').innerText = (data.temperature_setting_value >= 0 ? '+' : '') + data.temperature_setting_value + '°C';
        document.getElementById('light_control_value').innerText = data.light_control_value + '%';

        // Perbarui teks output
        document.getElementById('irrigation_duration').innerText = data.irrigation_duration;
        document.getElementById('temperature_setting').innerText = data.temperature_setting;
        document.getElementById('light_control').innerText = data.light_control;

        // Perbarui progress bar
        document.getElementById('irrigation_progress').style.width = (data.irrigation_duration_value / 100 * 100) + '%';

        // Temperature progress (nilai antara -10 dan +10, dikonversi ke 0-100%)
        const tempProgress = ((data.temperature_setting_value + 10) / 20 * 100);
        document.getElementById('temperature_progress').style.width = tempProgress + '%';

        document.getElementById('light_progress').style.width = (data.light_control_value / 100 * 100) + '%';

        // Sesuaikan warna progress bar berdasarkan nilai
        this.updateProgressBarColor('irrigation_progress', data.irrigation_duration_value, 100);
        this.updateProgressBarColor('temperature_progress', data.temperature_setting_value, 10);
        this.updateProgressBarColor('light_progress', data.light_control_value, 100);
    },

    // Fungsi untuk memperbarui warna progress bar
    updateProgressBarColor: function(elementId, value, max) {
        const element = document.getElementById(elementId);

        if (elementId === 'temperature_progress') {
            // Untuk pengaturan suhu
            if (value < -3) {
                element.style.backgroundColor = '#2196F3'; // Biru (menurunkan)
            } else if (value > 3) {
                element.style.backgroundColor = '#f44336'; // Merah (menaikkan)
            } else {
                element.style.backgroundColor = '#4CAF50'; // Hijau (mempertahankan)
            }
        } else {
            // Untuk durasi irigasi dan kontrol cahaya
            const percent = value / max;
            if (percent < 0.3) {
                element.style.backgroundColor = '#4CAF50'; // Hijau (rendah)
            } else if (percent < 0.7) {
                element.style.backgroundColor = '#ff9800'; // Oranye (sedang)
            } else {
                element.style.backgroundColor = '#f44336'; // Merah (tinggi)
            }
        }
    },

    // Fungsi untuk menyimpan pengaturan ke database
    saveSettings: function() {
        // Tampilkan animasi loading atau indikator
        const saveButton = document.getElementById('saveButton');
        const originalText = saveButton.innerHTML;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
        saveButton.disabled = true;

        // Simpan input parameters
        const inputFormData = new FormData();
        inputFormData.append('save_type', 'input_parameters');
        inputFormData.append('soil_moisture', this.inputValues.soil_moisture);
        inputFormData.append('air_temperature', this.inputValues.air_temperature);
        inputFormData.append('light_intensity', this.inputValues.light_intensity);
        inputFormData.append('humidity', this.inputValues.humidity);

        fetch('php/save_settings.php', {
                method: 'POST',
                body: inputFormData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Simpan output parameters
                    const outputFormData = new FormData();
                    outputFormData.append('save_type', 'output_parameters');
                    outputFormData.append('irrigation_duration', document.getElementById('irrigation_duration').innerText);
                    outputFormData.append('temperature_setting', document.getElementById('temperature_setting').innerText);
                    outputFormData.append('light_control', document.getElementById('light_control').innerText);

                    return fetch('php/save_settings.php', {
                        method: 'POST',
                        body: outputFormData
                    });
                } else {
                    throw new Error(data.message || 'Gagal menyimpan parameter input');
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Simpan fuzzy rule
                    const ruleFormData = new FormData();
                    ruleFormData.append('save_type', 'fuzzy_rule');
                    ruleFormData.append('soil_moisture', this.getSoilMoistureText(this.inputValues.soil_moisture).toLowerCase());
                    ruleFormData.append('air_temperature', this.getAirTemperatureText(this.inputValues.air_temperature).toLowerCase());
                    ruleFormData.append('light_intensity', this.getLightIntensityText(this.inputValues.light_intensity).toLowerCase());
                    ruleFormData.append('humidity', this.getHumidityText(this.inputValues.humidity).toLowerCase());
                    ruleFormData.append('irrigation_duration', document.getElementById('irrigation_duration').innerText.toLowerCase());
                    ruleFormData.append('temperature_setting', document.getElementById('temperature_setting').innerText.toLowerCase());
                    ruleFormData.append('light_control', document.getElementById('light_control').innerText.toLowerCase());

                    return fetch('php/save_settings.php', {
                        method: 'POST',
                        body: ruleFormData
                    });
                } else {
                    throw new Error(data.message || 'Gagal menyimpan parameter output');
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Sukses menyimpan semua data
                    alert('Pengaturan berhasil disimpan!');

                    // Muat ulang tabel aturan fuzzy
                    loadFuzzyRules();
                } else {
                    throw new Error(data.message || 'Gagal menyimpan aturan fuzzy');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error: ' + error.message);
            })
            .finally(() => {
                // Kembalikan tombol ke keadaan semula
                saveButton.innerHTML = originalText;
                saveButton.disabled = false;
            });
    }
};

// Fungsi untuk memuat aturan fuzzy dari database
function loadFuzzyRules() {
    fetch('php/get_data.php?type=rules')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Bersihkan tabel
                const tableBody = document.getElementById('rulesBody');
                tableBody.innerHTML = '';

                // Isi tabel dengan data
                data.data.forEach((rule, index) => {
                    const row = document.createElement('tr');

                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${capitalizeFirstLetter(rule.soil_moisture)}</td>
                        <td>${capitalizeFirstLetter(rule.air_temperature)}</td>
                        <td>${capitalizeFirstLetter(rule.light_intensity)}</td>
                        <td>${capitalizeFirstLetter(rule.humidity)}</td>
                        <td>${capitalizeFirstLetter(rule.irrigation_duration)}</td>
                        <td>${capitalizeFirstLetter(rule.temperature_setting)}</td>
                        <td>${capitalizeFirstLetter(rule.light_control)}</td>
                    `;

                    tableBody.appendChild(row);
                });
            } else {
                console.error('Error loading rules:', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Fungsi untuk kapitalisasi huruf pertama
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Inisialisasi saat dokumen selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Load fuzzy rules
    loadFuzzyRules();

    // Inisialisasi slider dan input
    initializeInputControls();

    // Event listener untuk tombol calculate
    document.getElementById('calculateButton').addEventListener('click', function() {
        FuzzyLogic.calculateFuzzyOutput();
    });

    // Event listener untuk tombol save
    document.getElementById('saveButton').addEventListener('click', function() {
        FuzzyLogic.saveSettings();
    });
});

// Fungsi untuk inisialisasi kontrol input
function initializeInputControls() {
    // Soil Moisture
    const soilMoistureSlider = document.getElementById('soil_moisture_slider');
    const soilMoistureValue = document.getElementById('soil_moisture_value');

    soilMoistureSlider.addEventListener('input', function() {
        soilMoistureValue.value = this.value;
        FuzzyLogic.updateInputValue('soil_moisture', this.value);
    });

    soilMoistureValue.addEventListener('input', function() {
        soilMoistureSlider.value = this.value;
        FuzzyLogic.updateInputValue('soil_moisture', this.value);
    });

    // Air Temperature
    const airTemperatureSlider = document.getElementById('air_temperature_slider');
    const airTemperatureValue = document.getElementById('air_temperature_value');

    airTemperatureSlider.addEventListener('input', function() {
        airTemperatureValue.value = this.value;
        FuzzyLogic.updateInputValue('air_temperature', this.value);
    });

    airTemperatureValue.addEventListener('input', function() {
        airTemperatureSlider.value = this.value;
        FuzzyLogic.updateInputValue('air_temperature', this.value);
    });

    // Light Intensity
    const lightIntensitySlider = document.getElementById('light_intensity_slider');
    const lightIntensityValue = document.getElementById('light_intensity_value');

    lightIntensitySlider.addEventListener('input', function() {
        lightIntensityValue.value = this.value;
        FuzzyLogic.updateInputValue('light_intensity', this.value);
    });

    lightIntensityValue.addEventListener('input', function() {
        lightIntensitySlider.value = this.value;
        FuzzyLogic.updateInputValue('light_intensity', this.value);
    });

    // Humidity
    const humiditySlider = document.getElementById('humidity_slider');
    const humidityValue = document.getElementById('humidity_value');

    humiditySlider.addEventListener('input', function() {
        humidityValue.value = this.value;
        FuzzyLogic.updateInputValue('humidity', this.value);
    });

    humidityValue.addEventListener('input', function() {
        humiditySlider.value = this.value;
        FuzzyLogic.updateInputValue('humidity', this.value);
    });

    // Update nilai awal
    FuzzyLogic.updateInputValue('soil_moisture', soilMoistureValue.value);
    FuzzyLogic.updateInputValue('air_temperature', airTemperatureValue.value);
    FuzzyLogic.updateInputValue('light_intensity', lightIntensityValue.value);
    FuzzyLogic.updateInputValue('humidity', humidityValue.value);
}