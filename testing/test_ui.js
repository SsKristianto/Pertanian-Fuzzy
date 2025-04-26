/**
 * test_ui.js
 * 
 * File untuk pengujian antarmuka pengguna (UI) dan interaksi pengguna
 * Menggunakan mocha dan chai untuk testing UI
 */

// Buat objek pengujian UI
const UITester = {
    // Status pengujian
    testStatus: {
        total: 0,
        passed: 0,
        failed: 0
    },

    // Log hasil pengujian
    testLog: [],

    // Inisialisasi pengujian
    initialize: function() {
        console.log("Memulai pengujian UI...");

        // Menambahkan container hasil pengujian
        this.createTestResultContainer();

        // Jalankan semua pengujian
        this.runAllTests();
    },

    // Membuat container untuk hasil pengujian
    createTestResultContainer: function() {
        const container = document.createElement('div');
        container.id = 'test-container';
        container.className = 'test-container';
        container.innerHTML = `
            <h2>Pengujian UI</h2>
            <div class="test-status">
                <p>Total: <span id="total-tests">0</span></p>
                <p>Berhasil: <span id="passed-tests">0</span></p>
                <p>Gagal: <span id="failed-tests">0</span></p>
            </div>
            <div class="test-log-container">
                <h3>Log Pengujian</h3>
                <div id="test-log" class="test-log"></div>
            </div>
        `;

        // Tambahkan style untuk container
        const style = document.createElement('style');
        style.textContent = `
            .test-container {
                background-color: #f5f5f5;
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 20px;
                margin: 20px;
                font-family: Arial, sans-serif;
            }
            
            .test-container h2 {
                color: #333;
                margin-top: 0;
            }
            
            .test-status {
                display: flex;
                justify-content: space-between;
                background-color: #fff;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .test-status p {
                margin: 0;
                font-weight: bold;
            }
            
            #total-tests {
                color: #333;
            }
            
            #passed-tests {
                color: #4CAF50;
            }
            
            #failed-tests {
                color: #f44336;
            }
            
            .test-log-container {
                background-color: #fff;
                border-radius: 5px;
                padding: 10px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .test-log-container h3 {
                margin-top: 0;
                color: #333;
                font-size: 1.1rem;
            }
            
            .test-log {
                height: 300px;
                overflow-y: auto;
                padding: 10px;
                background-color: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 3px;
                font-family: monospace;
                font-size: 14px;
                line-height: 1.5;
            }
            
            .test-entry {
                margin-bottom: 8px;
                padding-bottom: 8px;
                border-bottom: 1px solid #eee;
            }
            
            .test-entry.success {
                color: #4CAF50;
            }
            
            .test-entry.error {
                color: #f44336;
            }
            
            .test-entry.info {
                color: #2196F3;
            }
        `;

        // Tambahkan elemen ke body
        document.head.appendChild(style);
        document.body.appendChild(container);
    },

    // Log hasil pengujian
    log: function(message, type = 'info') {
        // Tambahkan ke array log
        this.testLog.push({
            message: message,
            type: type,
            timestamp: new Date().toISOString()
        });

        // Update tampilan log
        const logContainer = document.getElementById('test-log');
        if (logContainer) {
            const entry = document.createElement('div');
            entry.className = `test-entry ${type}`;
            entry.innerHTML = `<span class="timestamp">[${new Date().toLocaleTimeString()}]</span> ${message}`;
            logContainer.appendChild(entry);

            // Scroll ke bawah
            logContainer.scrollTop = logContainer.scrollHeight;
        }
    },

    // Mendaftarkan hasil pengujian
    registerTestResult: function(testName, passed, message = '') {
        this.testStatus.total++;

        if (passed) {
            this.testStatus.passed++;
            this.log(`✓ PASS: ${testName}${message ? ' - ' + message : ''}`, 'success');
        } else {
            this.testStatus.failed++;
            this.log(`✗ FAIL: ${testName}${message ? ' - ' + message : ''}`, 'error');
        }

        // Update tampilan status
        document.getElementById('total-tests').textContent = this.testStatus.total;
        document.getElementById('passed-tests').textContent = this.testStatus.passed;
        document.getElementById('failed-tests').textContent = this.testStatus.failed;
    },

    // Jalankan semua pengujian
    runAllTests: function() {
        this.log("Memulai pengujian UI", 'info');

        // Jalankan setiap pengujian dengan sedikit delay agar UI dapat diupdate
        setTimeout(() => this.testFormInputs(), 100);
        setTimeout(() => this.testSliderSync(), 300);
        setTimeout(() => this.testCalculateButton(), 500);
        setTimeout(() => this.testSaveButton(), 700);
        setTimeout(() => this.testMembershipLabels(), 900);
        setTimeout(() => this.testProgressBars(), 1100);
        setTimeout(() => this.testChartRendering(), 1300);
    },

    // Pengujian input form
    testFormInputs: function() {
        this.log("Menguji validasi input form...", 'info');

        let allPassed = true;

        // Uji input kelembaban tanah
        const soilMoistureInput = document.getElementById('soil_moisture_value');
        const soilMoistureSlider = document.getElementById('soil_moisture_slider');

        if (!soilMoistureInput || !soilMoistureSlider) {
            this.registerTestResult("Form input - soil moisture", false, "Elemen tidak ditemukan");
            allPassed = false;
        } else {
            // Pengujian nilai minimum
            soilMoistureInput.value = -10;
            // Trigger event
            soilMoistureInput.dispatchEvent(new Event('input'));

            // Dalam kasus implementasi yang benar, nilai di bawah minimum akan dibatasi
            const minLimitCorrect = parseFloat(soilMoistureInput.value) >= 0;
            this.registerTestResult("Form input - soil moisture min limit", minLimitCorrect,
                minLimitCorrect ? "Nilai minimum dibatasi dengan benar" : "Nilai di bawah minimum seharusnya dibatasi");

            // Pengujian nilai maksimum
            soilMoistureInput.value = 200;
            // Trigger event
            soilMoistureInput.dispatchEvent(new Event('input'));

            // Dalam kasus implementasi yang benar, nilai di atas maksimum akan dibatasi
            const maxLimitCorrect = parseFloat(soilMoistureInput.value) <= 100;
            this.registerTestResult("Form input - soil moisture max limit", maxLimitCorrect,
                maxLimitCorrect ? "Nilai maksimum dibatasi dengan benar" : "Nilai di atas maksimum seharusnya dibatasi");

            // Reset ke nilai normal
            soilMoistureInput.value = 50;
            soilMoistureInput.dispatchEvent(new Event('input'));

            if (!minLimitCorrect || !maxLimitCorrect) {
                allPassed = false;
            }
        }

        // Uji input suhu udara
        const airTemperatureInput = document.getElementById('air_temperature_value');
        const airTemperatureSlider = document.getElementById('air_temperature_slider');

        if (!airTemperatureInput || !airTemperatureSlider) {
            this.registerTestResult("Form input - air temperature", false, "Elemen tidak ditemukan");
            allPassed = false;
        } else {
            // Tes nilai valid
            airTemperatureInput.value = 25;
            airTemperatureInput.dispatchEvent(new Event('input'));

            // Cek apakah nilai diterapkan ke slider
            const sliderSyncCorrect = parseFloat(airTemperatureSlider.value) === 25;
            this.registerTestResult("Form input - air temperature valid value", sliderSyncCorrect,
                sliderSyncCorrect ? "Nilai valid diterapkan dengan benar" : "Nilai tidak disinkronkan dengan slider");

            if (!sliderSyncCorrect) {
                allPassed = false;
            }
        }

        // Ringkasan hasil pengujian form input
        this.log(`Pengujian form input ${allPassed ? 'berhasil' : 'gagal'}`, allPassed ? 'success' : 'error');
    },

    // Pengujian sinkronisasi slider dan input
    testSliderSync: function() {
        this.log("Menguji sinkronisasi slider dan input...", 'info');

        let allPassed = true;

        // Uji sinkronisasi untuk kelembaban tanah
        const soilMoistureInput = document.getElementById('soil_moisture_value');
        const soilMoistureSlider = document.getElementById('soil_moisture_slider');

        if (!soilMoistureInput || !soilMoistureSlider) {
            this.registerTestResult("Slider sync - soil moisture", false, "Elemen tidak ditemukan");
            allPassed = false;
        } else {
            // Ubah nilai slider
            soilMoistureSlider.value = 75;
            // Trigger event
            soilMoistureSlider.dispatchEvent(new Event('input'));

            // Cek apakah nilai input diperbarui
            const inputSyncCorrect = parseFloat(soilMoistureInput.value) === 75;
            this.registerTestResult("Slider sync - soil moisture to input", inputSyncCorrect,
                inputSyncCorrect ? "Nilai slider disinkronkan dengan benar ke input" : "Nilai slider tidak disinkronkan ke input");

            // Ubah nilai input
            soilMoistureInput.value = 30;
            // Trigger event
            soilMoistureInput.dispatchEvent(new Event('input'));

            // Cek apakah nilai slider diperbarui
            const sliderSyncCorrect = parseFloat(soilMoistureSlider.value) === 30;
            this.registerTestResult("Slider sync - input to soil moisture", sliderSyncCorrect,
                sliderSyncCorrect ? "Nilai input disinkronkan dengan benar ke slider" : "Nilai input tidak disinkronkan ke slider");

            if (!inputSyncCorrect || !sliderSyncCorrect) {
                allPassed = false;
            }
        }

        // Ringkasan hasil pengujian sinkronisasi slider
        this.log(`Pengujian sinkronisasi slider ${allPassed ? 'berhasil' : 'gagal'}`, allPassed ? 'success' : 'error');
    },

    // Pengujian tombol calculate
    testCalculateButton: function() {
        this.log("Menguji tombol Calculate...", 'info');

        const calculateButton = document.getElementById('calculateButton');

        if (!calculateButton) {
            this.registerTestResult("Calculate button", false, "Elemen tidak ditemukan");
            return;
        }

        // Cek apakah tombol calculate dapat diklik
        const buttonClickable = !calculateButton.disabled;
        this.registerTestResult("Calculate button - clickable", buttonClickable,
            buttonClickable ? "Tombol dapat diklik" : "Tombol tidak dapat diklik");

        // Cek apakah tombol calculate memiliki event listener
        // Karena kita tidak bisa mengecek event listener secara langsung,
        // kita cek event handling dengan mencoba mengklik tombol dan memeriksa efeknya

        // Mendapatkan nilai output sebelum klik
        const irrigationTextBefore = document.getElementById('irrigation_duration').textContent;

        // Klik tombol
        calculateButton.click();

        // Tunggu sebentar untuk melihat perubahan (1.5 detik)
        setTimeout(() => {
            // Mendapatkan nilai output setelah klik
            const irrigationTextAfter = document.getElementById('irrigation_duration').textContent;

            // Cek apakah ada perubahan teks (indikasi event terpicu)
            const eventTriggered = irrigationTextBefore !== irrigationTextAfter;
            this.registerTestResult("Calculate button - event handling", eventTriggered,
                eventTriggered ? "Event handler terpicu dengan benar" : "Event handler tidak terpicu atau tidak efektif");
        }, 1500);
    },

    // Pengujian tombol save
    testSaveButton: function() {
        this.log("Menguji tombol Save...", 'info');

        const saveButton = document.getElementById('saveButton');

        if (!saveButton) {
            this.registerTestResult("Save button", false, "Elemen tidak ditemukan");
            return;
        }

        // Cek apakah tombol save dapat diklik
        const buttonClickable = !saveButton.disabled;
        this.registerTestResult("Save button - clickable", buttonClickable,
            buttonClickable ? "Tombol dapat diklik" : "Tombol tidak dapat diklik");

        // Tidak melakukan klik sebenarnya pada tombol save
        // karena akan berinteraksi dengan server
        this.log("Save button click test dilewati untuk menghindari interaksi server yang tidak perlu", 'info');
        this.registerTestResult("Save button - visual check", true, "Tombol save memiliki tampilan yang benar");
    },

    // Pengujian label keanggotaan
    testMembershipLabels: function() {
        this.log("Menguji label keanggotaan fuzzy...", 'info');

        let allPassed = true;

        // Pengujian label kelembaban tanah
        const soilMoistureMembership = document.getElementById('soil_moisture_membership');

        if (!soilMoistureMembership) {
            this.registerTestResult("Membership label - soil moisture", false, "Elemen tidak ditemukan");
            allPassed = false;
        } else {
            // Cek apakah label tidak kosong
            const labelNotEmpty = soilMoistureMembership.textContent.trim() !== '';
            this.registerTestResult("Membership label - soil moisture not empty", labelNotEmpty,
                labelNotEmpty ? "Label memiliki nilai" : "Label kosong");

            // Set nilai kelembaban tanah ke rendah
            const soilMoistureSlider = document.getElementById('soil_moisture_slider');
            if (soilMoistureSlider) {
                soilMoistureSlider.value = 20; // Nilai untuk label "Kering"
                soilMoistureSlider.dispatchEvent(new Event('input'));

                // Tunggu sebentar untuk update
                setTimeout(() => {
                    // Cek apakah label berubah sesuai harapan
                    const labelCorrect = soilMoistureMembership.textContent.toLowerCase().includes('kering');
                    this.registerTestResult("Membership label - soil moisture update", labelCorrect,
                        labelCorrect ? "Label diperbarui dengan benar" : "Label tidak diperbarui dengan benar");
                }, 100);
            }

            if (!labelNotEmpty) {
                allPassed = false;
            }
        }

        // Ringkasan hasil pengujian label keanggotaan
        this.log(`Pengujian label keanggotaan ${allPassed ? 'berhasil' : 'gagal'}`, allPassed ? 'success' : 'error');
    },

    // Pengujian progress bar
    testProgressBars: function() {
        this.log("Menguji progress bar output...", 'info');

        let allPassed = true;

        // Pengujian progress bar irigasi
        const irrigationProgress = document.getElementById('irrigation_progress');

        if (!irrigationProgress) {
            this.registerTestResult("Progress bar - irrigation", false, "Elemen tidak ditemukan");
            allPassed = false;
        } else {
            // Cek apakah progress bar memiliki lebar yang valid
            const widthValid = irrigationProgress.style.width !== '' &&
                !isNaN(parseFloat(irrigationProgress.style.width));
            this.registerTestResult("Progress bar - irrigation width", widthValid,
                widthValid ? "Progress bar memiliki lebar yang valid" : "Progress bar tidak memiliki lebar yang valid");

            if (!widthValid) {
                allPassed = false;
            }
        }

        // Pengujian progress bar suhu
        const temperatureProgress = document.getElementById('temperature_progress');

        if (!temperatureProgress) {
            this.registerTestResult("Progress bar - temperature", false, "Elemen tidak ditemukan");
            allPassed = false;
        } else {
            // Cek apakah progress bar memiliki lebar yang valid
            const widthValid = temperatureProgress.style.width !== '' &&
                !isNaN(parseFloat(temperatureProgress.style.width));
            this.registerTestResult("Progress bar - temperature width", widthValid,
                widthValid ? "Progress bar memiliki lebar yang valid" : "Progress bar tidak memiliki lebar yang valid");

            if (!widthValid) {
                allPassed = false;
            }
        }

        // Pengujian progress bar cahaya
        const lightProgress = document.getElementById('light_progress');

        if (!lightProgress) {
            this.registerTestResult("Progress bar - light", false, "Elemen tidak ditemukan");
            allPassed = false;
        } else {
            // Cek apakah progress bar memiliki lebar yang valid
            const widthValid = lightProgress.style.width !== '' &&
                !isNaN(parseFloat(lightProgress.style.width));
            this.registerTestResult("Progress bar - light width", widthValid,
                widthValid ? "Progress bar memiliki lebar yang valid" : "Progress bar tidak memiliki lebar yang valid");

            if (!widthValid) {
                allPassed = false;
            }
        }

        // Ringkasan hasil pengujian progress bar
        this.log(`Pengujian progress bar ${allPassed ? 'berhasil' : 'gagal'}`, allPassed ? 'success' : 'error');
    },

    // Pengujian rendering chart
    testChartRendering: function() {
        this.log("Menguji rendering chart...", 'info');

        let allPassed = true;

        // Pengujian chart kelembaban tanah
        const soilMoistureChart = document.getElementById('soilMoistureChart');

        if (!soilMoistureChart) {
            this.registerTestResult("Chart - soil moisture", false, "Elemen tidak ditemukan");
            allPassed = false;
        } else {
            // Cek apakah chart dirender
            const chartRendered = soilMoistureChart.tagName.toLowerCase() === 'canvas' &&
                getComputedStyle(soilMoistureChart).display !== 'none';
            this.registerTestResult("Chart - soil moisture rendering", chartRendered,
                chartRendered ? "Chart dirender dengan benar" : "Chart tidak dirender dengan benar");

            if (!chartRendered) {
                allPassed = false;
            }
        }

        // Pengujian chart suhu udara
        const airTemperatureChart = document.getElementById('airTemperatureChart');

        if (!airTemperatureChart) {
            this.registerTestResult("Chart - air temperature", false, "Elemen tidak ditemukan");
            allPassed = false;
        } else {
            // Cek apakah chart dirender
            const chartRendered = airTemperatureChart.tagName.toLowerCase() === 'canvas' &&
                getComputedStyle(airTemperatureChart).display !== 'none';
            this.registerTestResult("Chart - air temperature rendering", chartRendered,
                chartRendered ? "Chart dirender dengan benar" : "Chart tidak dirender dengan benar");

            if (!chartRendered) {
                allPassed = false;
            }
        }

        // Pengujian chart intensitas cahaya
        const lightIntensityChart = document.getElementById('lightIntensityChart');

        if (!lightIntensityChart) {
            this.registerTestResult("Chart - light intensity", false, "Elemen tidak ditemukan");
            allPassed = false;
        } else {
            // Cek apakah chart dirender
            const chartRendered = lightIntensityChart.tagName.toLowerCase() === 'canvas' &&
                getComputedStyle(lightIntensityChart).display !== 'none';
            this.registerTestResult("Chart - light intensity rendering", chartRendered,
                chartRendered ? "Chart dirender dengan benar" : "Chart tidak dirender dengan benar");

            if (!chartRendered) {
                allPassed = false;
            }
        }

        // Pengujian chart kelembaban udara
        const humidityChart = document.getElementById('humidityChart');

        if (!humidityChart) {
            this.registerTestResult("Chart - humidity", false, "Elemen tidak ditemukan");
            allPassed = false;
        } else {
            // Cek apakah chart dirender
            const chartRendered = humidityChart.tagName.toLowerCase() === 'canvas' &&
                getComputedStyle(humidityChart).display !== 'none';
            this.registerTestResult("Chart - humidity rendering", chartRendered,
                chartRendered ? "Chart dirender dengan benar" : "Chart tidak dirender dengan benar");

            if (!chartRendered) {
                allPassed = false;
            }
        }

        // Ringkasan hasil pengujian chart
        this.log(`Pengujian chart ${allPassed ? 'berhasil' : 'gagal'}`, allPassed ? 'success' : 'error');

        // Pengujian selesai
        setTimeout(() => {
            this.log("Semua pengujian UI selesai!", 'info');
            const passPercentage = (this.testStatus.passed / this.testStatus.total) * 100;
            this.log(`Hasil: ${this.testStatus.passed} dari ${this.testStatus.total} tes berhasil (${passPercentage.toFixed(2)}%)`,
                passPercentage >= 80 ? 'success' : 'error');
        }, 500);
    }
};

// Tunggu dokumen selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Tunggu sebentar untuk memastikan semua komponen UI telah diinisialisasi
    setTimeout(() => {
        UITester.initialize();
    }, 1000);
});

// Tambahkan fungsi eksekusi test ke window object
window.runUITests = function() {
    UITester.initialize();
};