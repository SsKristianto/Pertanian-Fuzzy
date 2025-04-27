/**
 * weather_integration.js
 * 
 * File JavaScript untuk mengambil dan menampilkan data cuaca dari WeatherAPI.com
 * untuk simulasi lingkungan dalam sistem kontrol cerdas tanaman tomat
 */

// Objek untuk menangani integrasi data cuaca
const WeatherIntegration = {
    // Data cuaca terbaru
    weatherData: null,

    // Status pengambilan data
    fetchStatus: {
        lastFetch: null,
        isLoading: false,
        error: null
    },

    // Konfigurasi
    config: {
        // API Key untuk WeatherAPI.com (ganti dengan API key Anda)
        apiKey: "ab0f72154b424c60a9b70250252504",

        // Location (default: Palangkaraya)
        location: "Palangkaraya",

        // API URL
        apiUrl: "https://api.weatherapi.com/v1",

        // Update interval in milliseconds (30 minutes)
        updateInterval: 30 * 60 * 1000,

        // Format date only
        dateTimeFormat: {
            dateStyle: 'medium'
        }
    },

    // Inisialisasi integrasi cuaca
    initialize: function() {
        // Cek apakah ada cuaca di localStorage
        const savedWeather = localStorage.getItem('weatherData');
        const lastFetch = localStorage.getItem('weatherLastFetch');

        if (savedWeather && lastFetch) {
            try {
                this.weatherData = JSON.parse(savedWeather);
                this.fetchStatus.lastFetch = new Date(parseInt(lastFetch));

                // Tampilkan data cuaca yang tersimpan
                this.displayWeatherData();
            } catch (error) {
                console.error('Error parsing saved weather data:', error);

                // Hapus data yang rusak
                localStorage.removeItem('weatherData');
                localStorage.removeItem('weatherLastFetch');
            }
        }

        // Cek apakah perlu memperbarui data cuaca
        this.checkAndUpdateWeather();

        // Mulai interval pembaruan otomatis
        setInterval(() => {
            this.checkAndUpdateWeather();
        }, 60 * 1000); // Cek setiap menit (60 detik)
    },

    // Cek dan perbarui data cuaca jika perlu
    checkAndUpdateWeather: function() {
        // Jika sedang loading, jangan ambil lagi
        if (this.fetchStatus.isLoading) {
            return;
        }

        // Cek apakah perlu memperbarui data
        const needUpdate = !this.fetchStatus.lastFetch ||
            (new Date() - this.fetchStatus.lastFetch) > this.config.updateInterval;

        if (needUpdate) {
            this.fetchWeatherData();
        }
    },

    // Ambil data cuaca dari API
    fetchWeatherData: function() {
        this.fetchStatus.isLoading = true;
        this.fetchStatus.error = null;

        // Tampilkan indikator loading
        const weatherSection = document.querySelector('.weather-section');
        if (weatherSection) {
            weatherSection.classList.add('loading');
        }

        // URL untuk mendapatkan data cuaca dan prakiraan
        const forecastUrl = `${this.config.apiUrl}/forecast.json?key=${this.config.apiKey}&q=${this.config.location}&days=5&aqi=no&alerts=no`;

        // Lakukan fetch API
        fetch(forecastUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Data cuaca diterima:", data);

                // Proses data cuaca
                const now = new Date();
                this.weatherData = {
                    location: {
                        name: data.location.name,
                        region: data.location.region,
                        country: data.location.country
                    },
                    current: {
                        temp_c: data.current.temp_c,
                        humidity: data.current.humidity,
                        light_intensity: this.calculateLightIntensity(data.current.condition.code, data.current.cloud),
                        soil_moisture: this.estimateSoilMoisture(data.current.precip_mm, data.current.humidity),
                        condition: {
                            text: data.current.condition.text,
                            icon: data.current.condition.icon
                        },
                        precip_mm: data.current.precip_mm,
                        wind_kph: data.current.wind_kph,
                        cloud: data.current.cloud,
                        last_updated: data.current.last_updated
                    },
                    forecast: {
                        forecastday: data.forecast.forecastday.map(day => ({
                            date: day.date,
                            day: {
                                maxtemp_c: day.day.maxtemp_c,
                                mintemp_c: day.day.mintemp_c,
                                daily_chance_of_rain: day.day.daily_chance_of_rain,
                                condition: {
                                    text: day.day.condition.text,
                                    icon: day.day.condition.icon
                                }
                            }
                        }))
                    }
                };

                // Simpan data ke localStorage
                localStorage.setItem('weatherData', JSON.stringify(this.weatherData));
                localStorage.setItem('weatherLastFetch', now.getTime().toString());

                // Update status
                this.fetchStatus.lastFetch = now;
                this.fetchStatus.isLoading = false;

                // Tampilkan data cuaca
                this.displayWeatherData();

                // Kirim event bahwa data cuaca telah diperbarui
                const weatherUpdatedEvent = new CustomEvent('weather-updated', {
                    detail: this.weatherData
                });
                document.dispatchEvent(weatherUpdatedEvent);

                // Hapus indikator loading
                if (weatherSection) {
                    weatherSection.classList.remove('loading');
                }
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                this.fetchStatus.isLoading = false;
                this.fetchStatus.error = error.message;

                // Hapus indikator loading
                if (weatherSection) {
                    weatherSection.classList.remove('loading');
                    weatherSection.innerHTML = `
                        <h2>Data Cuaca Terkini</h2>
                        <div class="weather-container">
                            <p class="weather-error">Terjadi kesalahan saat mengambil data cuaca: ${error.message}. Silakan coba lagi.</p>
                            <button id="refreshWeatherBtn" class="secondary-button">
                                <i class="fas fa-sync-alt"></i> Coba Lagi
                            </button>
                        </div>
                    `;

                    // Add event listener for retry
                    const refreshBtn = document.getElementById('refreshWeatherBtn');
                    if (refreshBtn) {
                        refreshBtn.addEventListener('click', () => {
                            this.fetchWeatherData();
                        });
                    }
                }
            });
    },

    // Hitung perkiraan intensitas cahaya berdasarkan kondisi cuaca
    calculateLightIntensity: function(conditionCode, cloudCover) {
        // Nilai dasar intensitas cahaya pada kondisi cerah
        const baseLux = 800;

        // Faktor reduksi berdasarkan tutupan awan (0-100%)
        const cloudFactor = 1 - (cloudCover / 100) * 0.7;

        // Faktor kondisi cuaca
        let conditionFactor = 1.0;

        // Kode kondisi dari WeatherAPI: https://www.weatherapi.com/docs/weather_conditions.json
        if (conditionCode >= 1000 && conditionCode < 1030) {
            // Cerah sampai berawan
            conditionFactor = 1.0 - ((conditionCode - 1000) / 30) * 0.3;
        } else if (conditionCode >= 1030 && conditionCode < 1100) {
            // Kabut, berkabut
            conditionFactor = 0.6;
        } else if (conditionCode >= 1100 && conditionCode < 1200) {
            // Hujan ringan
            conditionFactor = 0.5;
        } else if (conditionCode >= 1200 && conditionCode < 1300) {
            // Hujan sedang-deras
            conditionFactor = 0.3;
        } else {
            // Kondisi ekstrim lainnya (salju, badai, dll)
            conditionFactor = 0.2;
        }

        // Hitung intensitas cahaya
        const lightIntensity = Math.round(baseLux * cloudFactor * conditionFactor);

        return Math.min(1000, Math.max(0, lightIntensity));
    },

    // Perkirakan kelembaban tanah berdasarkan curah hujan dan kelembaban udara
    estimateSoilMoisture: function(precipMm, humidity) {
        // Baseline untuk kelembaban tanah
        const base = 40;

        // Faktor pengaruh curah hujan
        const precipFactor = Math.min(20, precipMm * 2);

        // Faktor pengaruh kelembaban udara
        const humidityFactor = (humidity - 50) * 0.2;

        // Hitung perkiraan kelembaban tanah
        let soilMoisture = base + precipFactor + humidityFactor;

        // Pastikan nilai dalam rentang 0-100
        soilMoisture = Math.min(100, Math.max(0, soilMoisture));

        return Math.round(soilMoisture);
    },

    // Tampilkan data cuaca di UI
    displayWeatherData: function() {
        // Cek apakah ada data cuaca
        if (!this.weatherData) {
            return;
        }

        // Cek apakah elemen weather sudah ada
        let weatherSection = document.querySelector('.weather-section');

        // Jika belum ada, buat elemen baru
        if (!weatherSection) {
            weatherSection = document.createElement('div');
            weatherSection.className = 'weather-section';

            // Tentukan di mana akan menyisipkan elemen cuaca
            const dashboardSection = document.querySelector('.dashboard');
            if (dashboardSection) {
                dashboardSection.parentNode.insertBefore(weatherSection, dashboardSection.nextSibling);
            } else {
                // Jika tidak ada dasboard, tambahkan setelah header
                const header = document.querySelector('header');
                if (header) {
                    header.parentNode.insertBefore(weatherSection, header.nextSibling);
                }
            }
        }

        try {
            // Format tanggal dan waktu update terakhir
            const lastUpdated = new Date(this.weatherData.current.last_updated);
            let formattedDate;

            try {
                formattedDate = lastUpdated.toLocaleDateString('id-ID', this.config.dateTimeFormat);
            } catch (error) {
                console.warn('Error formatting date with options, falling back to default format', error);
                formattedDate = lastUpdated.toLocaleDateString('id-ID');
            }

            // Persiapkan URL ikon
            const iconUrl = this.weatherData.current.condition.icon.startsWith('//') ?
                'https:' + this.weatherData.current.condition.icon :
                this.weatherData.current.condition.icon;

            // Isi data cuaca ke UI
            weatherSection.innerHTML = `
                <h2>Data Cuaca Terkini</h2>
                <div class="weather-container">
                    <div class="weather-current">
                        <div class="weather-header">
                            <div class="weather-location">
                                <h3>${this.weatherData.location.name}, ${this.weatherData.location.country}</h3>
                                <p class="weather-updated">Update terakhir: ${formattedDate}</p>
                            </div>
                            <div class="weather-condition">
                                <img src="${iconUrl}" alt="${this.weatherData.current.condition.text}">
                                <p>${this.weatherData.current.condition.text}</p>
                            </div>
                        </div>
                        
                        <div class="weather-data">
                            <div class="weather-item">
                                <div class="weather-icon"><i class="fas fa-thermometer-half"></i></div>
                                <div class="weather-value">
                                    <p>${this.weatherData.current.temp_c}°C</p>
                                    <span>Suhu</span>
                                </div>
                            </div>
                            
                            <div class="weather-item">
                                <div class="weather-icon"><i class="fas fa-tint"></i></div>
                                <div class="weather-value">
                                    <p>${this.weatherData.current.humidity}%</p>
                                    <span>Kelembaban Udara</span>
                                </div>
                            </div>
                            
                            <div class="weather-item">
                                <div class="weather-icon"><i class="fas fa-lightbulb"></i></div>
                                <div class="weather-value">
                                    <p>${this.weatherData.current.light_intensity} lux</p>
                                    <span>Intensitas Cahaya</span>
                                </div>
                            </div>
                            
                            <div class="weather-item">
                                <div class="weather-icon"><i class="fas fa-seedling"></i></div>
                                <div class="weather-value">
                                    <p>${this.weatherData.current.soil_moisture}%</p>
                                    <span>Kelembaban Tanah</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="weather-actions">
                            <button id="refreshWeatherBtn" class="secondary-button">
                                <i class="fas fa-sync-alt"></i> Perbarui Data
                            </button>
                            <button id="applyWeatherBtn" class="primary-button">
                                <i class="fas fa-download"></i> Terapkan ke Simulator
                            </button>
                        </div>
                    </div>
                    
                    <div class="weather-forecast">
                        <h3>Prakiraan Hari Ini</h3>
                        <div class="forecast-details">
                            <div class="forecast-item">
                                <div class="forecast-icon"><i class="fas fa-temperature-high"></i></div>
                                <div class="forecast-value">
                                    <p>${this.weatherData.forecast.forecastday[0].day.maxtemp_c}°C</p>
                                    <span>Suhu Maks</span>
                                </div>
                            </div>
                            
                            <div class="forecast-item">
                                <div class="forecast-icon"><i class="fas fa-temperature-low"></i></div>
                                <div class="forecast-value">
                                    <p>${this.weatherData.forecast.forecastday[0].day.mintemp_c}°C</p>
                                    <span>Suhu Min</span>
                                </div>
                            </div>
                            
                            <div class="forecast-item">
                                <div class="forecast-icon"><i class="fas fa-cloud-rain"></i></div>
                                <div class="forecast-value">
                                    <p>${this.weatherData.forecast.forecastday[0].day.daily_chance_of_rain}%</p>
                                    <span>Peluang Hujan</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Tambahkan style untuk weather section
            this.addWeatherStyles();

            // Tambahkan event listener untuk tombol refresh
            const refreshBtn = document.getElementById('refreshWeatherBtn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => {
                    this.fetchWeatherData();
                });
            }

            // Tambahkan event listener untuk tombol apply
            const applyBtn = document.getElementById('applyWeatherBtn');
            if (applyBtn) {
                applyBtn.addEventListener('click', () => {
                    this.applyWeatherToInputs();
                });
            }
        } catch (error) {
            console.error('Error displaying weather data:', error);
            weatherSection.innerHTML = `
                <h2>Data Cuaca Terkini</h2>
                <div class="weather-container">
                    <p class="weather-error">Terjadi kesalahan saat menampilkan data cuaca. Silakan coba lagi.</p>
                    <button id="refreshWeatherBtn" class="secondary-button">
                        <i class="fas fa-sync-alt"></i> Coba Lagi
                    </button>
                </div>
            `;

            // Add event listener for retry
            const refreshBtn = document.getElementById('refreshWeatherBtn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => {
                    this.fetchWeatherData();
                });
            }
        }
    },

    // Terapkan data cuaca ke input simulator
    applyWeatherToInputs: function() {
        if (!this.weatherData) {
            return;
        }

        try {
            // Terapkan nilai dari data cuaca ke input simulator
            const soilMoistureValue = document.getElementById('soil_moisture_value');
            const soilMoistureSlider = document.getElementById('soil_moisture_slider');
            const airTemperatureValue = document.getElementById('air_temperature_value');
            const airTemperatureSlider = document.getElementById('air_temperature_slider');
            const lightIntensityValue = document.getElementById('light_intensity_value');
            const lightIntensitySlider = document.getElementById('light_intensity_slider');
            const humidityValue = document.getElementById('humidity_value');
            const humiditySlider = document.getElementById('humidity_slider');

            if (soilMoistureValue && soilMoistureSlider) {
                soilMoistureValue.value = this.weatherData.current.soil_moisture;
                soilMoistureSlider.value = this.weatherData.current.soil_moisture;
            }

            if (airTemperatureValue && airTemperatureSlider) {
                airTemperatureValue.value = this.weatherData.current.temp_c;
                airTemperatureSlider.value = this.weatherData.current.temp_c;
            }

            if (lightIntensityValue && lightIntensitySlider) {
                lightIntensityValue.value = this.weatherData.current.light_intensity;
                lightIntensitySlider.value = this.weatherData.current.light_intensity;
            }

            if (humidityValue && humiditySlider) {
                humidityValue.value = this.weatherData.current.humidity;
                humiditySlider.value = this.weatherData.current.humidity;
            }

            // Update nilai di fuzzy logic if FuzzyLogic object exists
            if (typeof FuzzyLogic !== 'undefined') {
                FuzzyLogic.updateInputValue('soil_moisture', this.weatherData.current.soil_moisture);
                FuzzyLogic.updateInputValue('air_temperature', this.weatherData.current.temp_c);
                FuzzyLogic.updateInputValue('light_intensity', this.weatherData.current.light_intensity);
                FuzzyLogic.updateInputValue('humidity', this.weatherData.current.humidity);
            }

            // Tampilkan notifikasi
            this.showNotification('Data cuaca berhasil diterapkan ke simulator!', 'success');
        } catch (error) {
            console.error('Error applying weather data to inputs:', error);
            this.showNotification('Gagal menerapkan data cuaca ke simulator.', 'error');
        }
    },

    // Dapatkan lokasi pengguna
    getUserLocation: function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Gunakan koordinat untuk mendapatkan data cuaca
                    this.config.location = `${position.coords.latitude},${position.coords.longitude}`;
                    this.showNotification('Menggunakan lokasi saat ini untuk data cuaca', 'info');
                    // Refresh data cuaca
                    this.fetchWeatherData();
                },
                (error) => {
                    console.warn(`Tidak bisa mendapatkan lokasi: ${error.message}`);
                    // Fallback ke lokasi default
                    this.showNotification('Menggunakan lokasi default: Palangkaraya', 'info');
                }
            );
        } else {
            console.warn('Geolocation tidak didukung di browser ini');
            this.showNotification('Geolocation tidak didukung, menggunakan lokasi default', 'warning');
        }
    },

    // Show notification 
    showNotification: function(message, type = 'info') {
        // Cek jika sudah ada fungsi notifikasi di UIInteraction
        if (typeof UIInteraction !== 'undefined' && UIInteraction.showNotification) {
            UIInteraction.showNotification(message, type);
            return;
        }

        // Buat elemen notifikasi
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = message;

        // Tambahkan ke body
        document.body.appendChild(notification);

        // Animasi notifikasi
        setTimeout(function() {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        // Hapus notifikasi setelah beberapa detik
        setTimeout(function() {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';

            // Hapus elemen setelah animasi selesai
            setTimeout(function() {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    },

    // Tambahkan style untuk weather section
    addWeatherStyles: function() {
        // Cek apakah style sudah ada
        if (document.getElementById('weather-styles')) {
            return;
        }

        // Buat elemen style
        const style = document.createElement('style');
        style.id = 'weather-styles';
        style.textContent = `
            .weather-section {
                background-color: var(--card-bg);
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
            }
            
            .weather-section.loading {
                position: relative;
                min-height: 200px;
            }
            
            .weather-section.loading::after {
                content: "Memuat data cuaca...";
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: rgba(255, 255, 255, 0.8);
                border-radius: 8px;
                font-style: italic;
            }
            
            .weather-container {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 20px;
            }
            
            .weather-current, .weather-forecast {
                background-color: #f9f9f9;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            }
            
            .weather-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid var(--border-color);
            }
            
            .weather-location h3 {
                margin: 0;
                font-size: 1.2rem;
                color: var(--dark-color);
            }
            
            .weather-updated {
                margin: 5px 0 0;
                font-size: 0.8rem;
                color: #666;
            }
            
            .weather-condition {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .weather-condition img {
                width: 64px;
                height: 64px;
            }
            
            .weather-condition p {
                margin: 5px 0 0;
                font-size: 0.9rem;
            }
            
            .weather-data {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .weather-item, .forecast-item {
                display: flex;
                align-items: center;
                background-color: white;
                padding: 10px;
                border-radius: 6px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .weather-icon, .forecast-icon {
                width: 40px;
                height: 40px;
                background-color: rgba(76, 175, 80, 0.1);
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-right: 10px;
                color: var(--primary-color);
                font-size: 1.2rem;
            }
            
            .weather-value, .forecast-value {
                flex: 1;
            }
            
            .weather-value p, .forecast-value p {
                margin: 0;
                font-weight: bold;
                font-size: 1.1rem;
            }
            
            .weather-value span, .forecast-value span {
                font-size: 0.8rem;
                color: #666;
            }
            
            .weather-actions {
                display: flex;
                justify-content: space-between;
                margin-top: 15px;
            }
            
            .weather-forecast h3 {
                margin: 0 0 15px;
                font-size: 1.1rem;
                text-align: center;
            }
            
            .forecast-details {
                display: grid;
                grid-template-columns: 1fr;
                gap: 10px;
            }
            
            .weather-error {
                padding: 15px;
                background-color: #FFEBEE;
                color: #D32F2F;
                border-radius: 5px;
                margin-bottom: 15px;
                text-align: center;
            }
            
            /* Responsif */
            @media (max-width: 768px) {
                .weather-container {
                    grid-template-columns: 1fr;
                }
                
                .weather-actions {
                    flex-direction: column;
                    gap: 10px;
                }
                
                .weather-actions button {
                    width: 100%;
                }
            }
        `;

        // Tambahkan ke head
        document.head.appendChild(style);
    },

    // Dapatkan data cuaca untuk dashboard
    getWeatherDataForDashboard: function() {
        if (!this.weatherData) {
            return null;
        }

        // Format data cuaca untuk dashboard
        const weatherForDashboard = {
            current: {
                temperature: this.weatherData.current.temp_c,
                humidity: this.weatherData.current.humidity,
                condition: this.weatherData.current.condition.text,
                location: this.weatherData.location.name,
                light_intensity: this.weatherData.current.light_intensity
            },
            forecast: this.weatherData.forecast.forecastday.map(day => ({
                date: day.date,
                temperature: day.day.maxtemp_c,
                humidity: this.estimateHumidityFromRain(day.day.daily_chance_of_rain),
                condition: day.day.condition.text,
                light_intensity: this.estimateLightFromCondition(day.day.condition.text, day.day.condition.code)
            })),
            impact: this.calculateWeatherImpact(),
            recommendations: this.generateRecommendations()
        };

        return weatherForDashboard;
    },

    // Perkirakan kelembaban berdasarkan peluang hujan
    estimateHumidityFromRain: function(rainChance) {
        // Baseline kelembaban
        const baseHumidity = 60;
        // Tambahkan faktor peluang hujan
        return Math.min(95, Math.max(30, baseHumidity + (rainChance - 50) * 0.3));
    },

    // Perkirakan intensitas cahaya dari kondisi cuaca
    estimateLightFromCondition: function(conditionText, conditionCode) {
        const conditionLower = conditionText.toLowerCase();
        let lightBase = 600; // Nilai dasar

        if (conditionLower.includes('cerah') || conditionLower.includes('sunny') || conditionLower.includes('clear')) {
            return Math.round(lightBase * 1.2);
        } else if (conditionLower.includes('berawan') || conditionLower.includes('cloudy') || conditionLower.includes('overcast')) {
            return Math.round(lightBase * 0.8);
        } else if (conditionLower.includes('hujan') || conditionLower.includes('rain')) {
            return Math.round(lightBase * 0.5);
        } else if (conditionLower.includes('badai') || conditionLower.includes('storm')) {
            return Math.round(lightBase * 0.3);
        }

        // Fallback ke kode kondisi
        return this.calculateLightIntensity(conditionCode, 50);
    },

    // Hitung dampak cuaca untuk dashboard
    calculateWeatherImpact: function() {
        if (!this.weatherData || !this.weatherData.forecast || !this.weatherData.forecast.forecastday) {
            return {
                soil_moisture: "Tidak ada data",
                air_temperature: "Tidak ada data",
                light_intensity: "Tidak ada data",
                humidity: "Tidak ada data",
                growth_rate: "Tidak ada data",
                plant_health: "Tidak ada data"
            };
        }

        const forecast = this.weatherData.forecast.forecastday;

        // Analisis tren suhu
        const temps = forecast.map(day => day.day.maxtemp_c);
        const avgTemp = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;

        // Analisis tren curah hujan
        const rainChances = forecast.map(day => day.day.daily_chance_of_rain);
        const avgRainChance = rainChances.reduce((sum, chance) => sum + chance, 0) / rainChances.length;

        // Buat analisis dampak
        const impact = {
            soil_moisture: avgRainChance > 70 ? "Akan meningkat karena curah hujan tinggi" :
                (avgRainChance > 40 ? "Sedikit meningkat" : "Mungkin menurun, perlu irigasi"),

            air_temperature: avgTemp > 32 ? "Cenderung tinggi, perlu perhatian" :
                (avgTemp > 25 ? "Dalam kisaran optimal" : "Cenderung rendah"),

            light_intensity: avgRainChance > 60 ? "Berkurang selama periode hujan" :
                (avgRainChance > 30 ? "Bervariasi, tergantung kondisi awan" : "Cukup baik"),

            humidity: avgRainChance > 60 ? "Meningkat, perlu ventilasi" :
                (avgRainChance > 30 ? "Dalam kisaran normal" : "Mungkin rendah"),

            growth_rate: this.assesGrowthImpact(avgTemp, avgRainChance),

            plant_health: this.assessHealthImpact(avgTemp, avgRainChance)
        };

        return impact;
    },

    // Nilai dampak pada pertumbuhan
    assesGrowthImpact: function(avgTemp, avgRainChance) {
        // Suhu ideal untuk tanaman tomat sekitar 21-27°C
        const tempFactor = avgTemp > 35 ? "terhambat karena suhu terlalu tinggi" :
            avgTemp < 15 ? "melambat karena suhu terlalu rendah" :
            avgTemp > 27 ? "sedikit melambat karena suhu agak tinggi" :
            avgTemp < 21 ? "sedikit melambat karena suhu agak rendah" :
            "optimal dari segi suhu";

        // Cuaca hujan berpengaruh pada fotosintesis
        const rainFactor = avgRainChance > 80 ? "terhambat karena kurang cahaya" :
            avgRainChance > 60 ? "sedikit melambat karena cahaya berkurang" :
            "normal dari segi cahaya";

        if (tempFactor.includes("optimal") && rainFactor.includes("normal")) {
            return "Diperkirakan optimal";
        } else if (tempFactor.includes("terhambat") || rainFactor.includes("terhambat")) {
            return "Mungkin melambat signifikan";
        } else {
            return "Sedikit melambat";
        }
    },

    // Nilai dampak pada kesehatan tanaman
    assessHealthImpact: function(avgTemp, avgRainChance) {
        // Risiko penyakit meningkat pada kelembaban tinggi
        if (avgRainChance > 80 && avgTemp > 25) {
            return "Perlu perhatian ekstra (risiko jamur dan penyakit tinggi)";
        } else if (avgRainChance > 60) {
            return "Perlu pengawasan (risiko penyakit sedang)";
        } else if (avgTemp > 35) {
            return "Perlu perhatian pada stres panas";
        } else if (avgTemp < 15) {
            return "Perlu perhatian pada stres dingin";
        } else {
            return "Diperkirakan stabil";
        }
    },

    // Hasilkan rekomendasi berdasarkan prakiraan cuaca
    generateRecommendations: function() {
        if (!this.weatherData || !this.weatherData.forecast || !this.weatherData.forecast.forecastday) {
            return ["Tidak ada data cuaca untuk menghasilkan rekomendasi"];
        }

        const forecast = this.weatherData.forecast.forecastday;
        const recommendations = [];

        // Analisis tren suhu
        const temps = forecast.map(day => day.day.maxtemp_c);
        const avgTemp = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
        const maxTemp = Math.max(...temps);

        // Analisis tren curah hujan
        const rainChances = forecast.map(day => day.day.daily_chance_of_rain);
        const avgRainChance = rainChances.reduce((sum, chance) => sum + chance, 0) / rainChances.length;
        const maxRainChance = Math.max(...rainChances);

        // Rekomendasi berdasarkan curah hujan
        if (avgRainChance > 60) {
            recommendations.push("Kurangi irigasi selama periode hujan");
            recommendations.push("Pastikan drainase yang baik untuk menghindari genangan air");
        } else if (avgRainChance < 30 && avgTemp > 28) {
            recommendations.push("Tingkatkan frekuensi irigasi untuk mengatasi suhu tinggi");
        }

        // Rekomendasi berdasarkan suhu
        if (maxTemp > 32) {
            recommendations.push("Pertimbangkan naungan atau pemberian paranet pada waktu panas terik");
        }

        // Rekomendasi berdasarkan kondisi cahaya
        if (avgRainChance > 50) {
            recommendations.push("Pertimbangkan pencahayaan tambahan pada hari mendung");
        }

        // Rekomendasi umum
        recommendations.push("Pantau kelembaban tanah secara teratur");

        // Jika kemungkinan hujan tinggi, risiko penyakit juga tinggi
        if (maxRainChance > 70 && avgTemp > 25) {
            recommendations.push("Awasi tanda-tanda penyakit jamur karena kelembaban tinggi");
        }

        return recommendations;
    }
};

// Inisialisasi saat dokumen selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi integrasi cuaca
    WeatherIntegration.initialize();
});