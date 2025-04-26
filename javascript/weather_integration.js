/**
 * weather_integration.js
 * 
 * File JavaScript untuk mengambil dan menampilkan data cuaca eksternal
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
        // Koordinat lokasi (default: Jakarta)
        latitude: -6.2088,
        longitude: 106.8456,

        // Interval update dalam milidetik (10 menit)
        updateInterval: 10 * 60 * 1000,

        // Format tanggal dan waktu
        dateTimeFormat: {
            dateStyle: 'medium',
            timeStyle: 'short'
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

        // Dalam aplikasi nyata, gunakan URL API cuaca yang sesungguhnya
        // Contoh: OpenWeatherMap, AccuWeather, dll.
        // 
        // Untuk demo ini, kita akan mensimulasikan respon API dengan data cuaca acak
        setTimeout(() => {
            // Simulasi data cuaca
            const now = new Date();
            this.weatherData = {
                location: {
                    name: "Jakarta",
                    region: "DKI Jakarta",
                    country: "Indonesia"
                },
                current: {
                    temp_c: this.getRandomValue(25, 35, 1), // 25-35 °C
                    humidity: this.getRandomValue(60, 90, 0), // 60-90%
                    light_intensity: this.getRandomValue(300, 900, 0), // 300-900 lux
                    soil_moisture: this.getRandomValue(30, 80, 0), // 30-80%
                    condition: {
                        text: this.getRandomWeatherCondition(),
                        icon: this.getRandomWeatherIcon()
                    },
                    precip_mm: this.getRandomValue(0, 10, 1),
                    wind_kph: this.getRandomValue(5, 20, 1),
                    cloud: this.getRandomValue(0, 100, 0),
                    last_updated: now.toISOString()
                },
                forecast: {
                    forecastday: [{
                        date: now.toISOString().split('T')[0],
                        day: {
                            maxtemp_c: this.getRandomValue(30, 38, 1),
                            mintemp_c: this.getRandomValue(22, 28, 1),
                            daily_chance_of_rain: this.getRandomValue(0, 100, 0),
                            condition: {
                                text: this.getRandomWeatherCondition(),
                                icon: this.getRandomWeatherIcon()
                            }
                        }
                    }]
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

            // Pertimbangkan untuk secara otomatis menerapkan nilai cuaca
            this.applyWeatherToInputs();

            // Hapus indikator loading
            if (weatherSection) {
                weatherSection.classList.remove('loading');
            }
        }, 1500); // Simulasi delay jaringan 1.5 detik
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

        // Format tanggal dan waktu update terakhir
        const lastUpdated = new Date(this.weatherData.current.last_updated);
        const formattedDate = lastUpdated.toLocaleDateString('id-ID', this.config.dateTimeFormat);

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
                            <img src="${this.weatherData.current.condition.icon}" alt="${this.weatherData.current.condition.text}">
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
        document.getElementById('refreshWeatherBtn').addEventListener('click', () => {
            this.fetchWeatherData();
        });

        // Tambahkan event listener untuk tombol apply
        document.getElementById('applyWeatherBtn').addEventListener('click', () => {
            this.applyWeatherToInputs();
        });
    },

    // Terapkan data cuaca ke input simulator
    applyWeatherToInputs: function() {
        if (!this.weatherData) {
            return;
        }

        // Terapkan nilai dari data cuaca ke input simulator
        document.getElementById('soil_moisture_value').value = this.weatherData.current.soil_moisture;
        document.getElementById('soil_moisture_slider').value = this.weatherData.current.soil_moisture;

        document.getElementById('air_temperature_value').value = this.weatherData.current.temp_c;
        document.getElementById('air_temperature_slider').value = this.weatherData.current.temp_c;

        document.getElementById('light_intensity_value').value = this.weatherData.current.light_intensity;
        document.getElementById('light_intensity_slider').value = this.weatherData.current.light_intensity;

        document.getElementById('humidity_value').value = this.weatherData.current.humidity;
        document.getElementById('humidity_slider').value = this.weatherData.current.humidity;

        // Update nilai di fuzzy logic
        FuzzyLogic.updateInputValue('soil_moisture', this.weatherData.current.soil_moisture);
        FuzzyLogic.updateInputValue('air_temperature', this.weatherData.current.temp_c);
        FuzzyLogic.updateInputValue('light_intensity', this.weatherData.current.light_intensity);
        FuzzyLogic.updateInputValue('humidity', this.weatherData.current.humidity);

        // Tampilkan notifikasi
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = 'Data cuaca berhasil diterapkan ke simulator!';

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
                document.body.removeChild(notification);
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

    // Fungsi helper untuk mendapatkan nilai acak dalam rentang tertentu
    getRandomValue: function(min, max, decimals = 0) {
        const value = Math.random() * (max - min) + min;
        return parseFloat(value.toFixed(decimals));
    },

    // Fungsi helper untuk mendapatkan kondisi cuaca acak
    getRandomWeatherCondition: function() {
        const conditions = [
            'Cerah', 'Berawan', 'Hujan Ringan', 'Hujan Sedang',
            'Berawan Sebagian', 'Mendung', 'Panas', 'Berkabut'
        ];
        return conditions[Math.floor(Math.random() * conditions.length)];
    },

    // Fungsi helper untuk mendapatkan ikon cuaca acak
    getRandomWeatherIcon: function() {
        const icons = [
            'https://cdn.weatherapi.com/weather/64x64/day/113.png', // Sunny
            'https://cdn.weatherapi.com/weather/64x64/day/116.png', // Partly cloudy
            'https://cdn.weatherapi.com/weather/64x64/day/119.png', // Cloudy
            'https://cdn.weatherapi.com/weather/64x64/day/176.png', // Patchy rain
            'https://cdn.weatherapi.com/weather/64x64/day/143.png', // Mist
            'https://cdn.weatherapi.com/weather/64x64/day/299.png' // Moderate rain
        ];
        return icons[Math.floor(Math.random() * icons.length)];
    }
};

// Inisialisasi saat dokumen selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi integrasi cuaca
    WeatherIntegration.initialize();
});