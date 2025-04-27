/**
 * dashboard_extension.js
 * 
 * File ini menambahkan fungsionalitas dashboard ke sistem kontrol cerdas tanaman
 * untuk memantau performa dan kondisi tanaman
 */

const DashboardExtension = {
    // Status dashboard
    dashboard: {
        initialized: false,
        activeTabs: 'performance', // performance, conditions, history, forecast
        timeRange: '7', // 7, 30, 90 hari
        charts: {},
        updateInterval: null
    },

    // Inisialisasi dashboard
    initialize: function() {
        console.log('Initializing dashboard extension...');

        // Buat bagian dashboard
        this.createDashboardSection();

        // Tambahkan stylesheet
        this.addDashboardStylesheet();

        // Tambahkan event listener
        this.attachEventListeners();

        // Tambahkan event listener untuk pembaruan simulasi
        document.addEventListener('simulation-updated', () => {
            this.loadDashboardData();
        });

        console.log('Adding simulation-updated event listener');
        document.addEventListener('simulation-updated', () => {
            console.log('simulation-updated event received, refreshing dashboard');
            this.loadDashboardData();
        });

        // Muat data awal
        //this.loadDashboardData();

        // Set interval untuk memperbarui dashboard secara otomatis
        this.dashboard.updateInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.loadDashboardData();
            }
        }, 60000); // Perbarui setiap 1 menit

        this.addWeatherUpdateListener();

        // Tandai sebagai diinisialisasi
        this.dashboard.initialized = true;
    },

    // Buat bagian dashboard
    createDashboardSection: function() {
        const dashboardSection = document.createElement('div');
        dashboardSection.className = 'dashboard-extension-container';
        dashboardSection.innerHTML = `
            <h2><i class="fas fa-chart-line"></i> Dashboard Performa Tanaman</h2>
            
            <div class="dashboard-controls">
                <div class="tab-controls">
                    <button class="tab-button active" data-tab="performance">
                        <i class="fas fa-tachometer-alt"></i> Performa
                    </button>
                    <button class="tab-button" data-tab="conditions">
                        <i class="fas fa-thermometer-half"></i> Kondisi Lingkungan
                    </button>
                    <button class="tab-button" data-tab="history">
                        <i class="fas fa-history"></i> Riwayat
                    </button>
                    <button class="tab-button" data-tab="forecast">
                        <i class="fas fa-cloud-sun"></i> Prakiraan
                    </button>
                </div>
                
                <div class="time-range-selector">
                    <label>Rentang Waktu:</label>
                    <select id="time-range-select">
                        <option value="7" selected>7 Hari</option>
                        <option value="30">30 Hari</option>
                        <option value="90">90 Hari</option>
                    </select>
                </div>
            </div>
            
            <div class="dashboard-content">
                <!-- Tab Performa -->
                <div class="dashboard-tab active" id="performance-tab">
                    <div class="metrics-grid">
                        <div class="metric-card health">
                            <div class="metric-icon">
                                <i class="fas fa-heartbeat"></i>
                            </div>
                            <div class="metric-content">
                                <h3>Kesehatan Tanaman</h3>
                                <div class="metric-value" id="health-metric">0%</div>
                                <div class="metric-trend">
                                    <span class="trend-value" id="health-trend">0%</span>
                                    <span class="trend-icon"><i class="fas fa-equals"></i></span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="metric-card growth">
                            <div class="metric-icon">
                                <i class="fas fa-seedling"></i>
                            </div>
                            <div class="metric-content">
                                <h3>Tingkat Pertumbuhan</h3>
                                <div class="metric-value" id="growth-metric">0%</div>
                                <div class="metric-trend">
                                    <span class="trend-value" id="growth-trend">0%</span>
                                    <span class="trend-icon"><i class="fas fa-equals"></i></span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="metric-card fruits">
                            <div class="metric-icon">
                                <i class="fas fa-apple-alt"></i>
                            </div>
                            <div class="metric-content">
                                <h3>Jumlah Buah</h3>
                                <div class="metric-value" id="fruits-metric">0</div>
                                <div class="metric-trend">
                                    <span class="trend-value" id="fruits-trend">0</span>
                                    <span class="trend-icon"><i class="fas fa-equals"></i></span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="metric-card stage">
                            <div class="metric-icon">
                                <i class="fas fa-leaf"></i>
                            </div>
                            <div class="metric-content">
                                <h3>Fase Pertumbuhan</h3>
                                <div class="metric-value" id="stage-metric">-</div>
                                <div class="metric-info" id="stage-info">0 hari dalam fase ini</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="charts-container">
                        <div class="chart-wrapper">
                            <h3>Kesehatan dan Pertumbuhan</h3>
                            <canvas id="performance-chart"></canvas>
                        </div>
                        
                        <div class="chart-wrapper">
                            <h3>Performa Keseluruhan</h3>
                            <canvas id="overall-performance-chart"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Tab Kondisi Lingkungan -->
                <div class="dashboard-tab" id="conditions-tab">
                    <div class="environment-grid">
                        <div class="environment-card soil">
                            <div class="env-icon">
                                <i class="fas fa-water"></i>
                            </div>
                            <div class="env-content">
                                <h3>Kelembaban Tanah</h3>
                                <div class="env-value" id="soil-value">0%</div>
                                <div class="env-optimal">
                                    <span>Optimal: </span>
                                    <span id="soil-optimal">50%</span>
                                </div>
                                <div class="env-range-slider">
                                    <div class="range-track">
                                        <div class="range-fill" id="soil-fill" style="width: 0%"></div>
                                        <div class="optimal-marker" id="soil-marker" style="left: 50%"></div>
                                        <div class="current-marker" id="soil-current" style="left: 0%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="environment-card temperature">
                            <div class="env-icon">
                                <i class="fas fa-thermometer-half"></i>
                            </div>
                            <div class="env-content">
                                <h3>Suhu Udara</h3>
                                <div class="env-value" id="temp-value">0°C</div>
                                <div class="env-optimal">
                                    <span>Optimal: </span>
                                    <span id="temp-optimal">25°C</span>
                                </div>
                                <div class="env-range-slider">
                                    <div class="range-track">
                                        <div class="range-fill" id="temp-fill" style="width: 0%"></div>
                                        <div class="optimal-marker" id="temp-marker" style="left: 50%"></div>
                                        <div class="current-marker" id="temp-current" style="left: 0%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="environment-card light">
                            <div class="env-icon">
                                <i class="fas fa-sun"></i>
                            </div>
                            <div class="env-content">
                                <h3>Intensitas Cahaya</h3>
                                <div class="env-value" id="light-value">0 lux</div>
                                <div class="env-optimal">
                                    <span>Optimal: </span>
                                    <span id="light-optimal">500 lux</span>
                                </div>
                                <div class="env-range-slider">
                                    <div class="range-track">
                                        <div class="range-fill" id="light-fill" style="width: 0%"></div>
                                        <div class="optimal-marker" id="light-marker" style="left: 50%"></div>
                                        <div class="current-marker" id="light-current" style="left: 0%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="environment-card humidity">
                            <div class="env-icon">
                                <i class="fas fa-tint"></i>
                            </div>
                            <div class="env-content">
                                <h3>Kelembaban Udara</h3>
                                <div class="env-value" id="humidity-value">0%</div>
                                <div class="env-optimal">
                                    <span>Optimal: </span>
                                    <span id="humidity-optimal">60%</span>
                                </div>
                                <div class="env-range-slider">
                                    <div class="range-track">
                                        <div class="range-fill" id="humidity-fill" style="width: 0%"></div>
                                        <div class="optimal-marker" id="humidity-marker" style="left: 50%"></div>
                                        <div class="current-marker" id="humidity-current" style="left: 0%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="charts-container">
                        <div class="chart-wrapper">
                            <h3>Kondisi Tanah dan Udara</h3>
                            <canvas id="soil-air-chart"></canvas>
                        </div>
                        
                        <div class="chart-wrapper">
                            <h3>Intensitas Cahaya dan Kelembaban</h3>
                            <canvas id="light-humidity-chart"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Tab Riwayat -->
                <div class="dashboard-tab" id="history-tab">
                    <div class="history-filters">
                        <div class="filter-group">
                            <label for="history-parameter">Parameter:</label>
                            <select id="history-parameter">
                                <option value="plant_health">Kesehatan Tanaman</option>
                                <option value="growth_rate">Tingkat Pertumbuhan</option>
                                <option value="soil_moisture">Kelembaban Tanah</option>
                                <option value="air_temperature">Suhu Udara</option>
                                <option value="light_intensity">Intensitas Cahaya</option>
                                <option value="humidity">Kelembaban Udara</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label for="history-view">Tampilan:</label>
                            <select id="history-view">
                                <option value="daily">Harian</option>
                                <option value="weekly">Mingguan</option>
                                <option value="monthly">Bulanan</option>
                            </select>
                        </div>
                        
                        <button id="export-history-button" class="history-button">
                            <i class="fas fa-download"></i> Ekspor Data
                        </button>
                    </div>
                    
                    <div class="history-chart-container">
                        <canvas id="history-chart"></canvas>
                    </div>
                    
                    <div class="history-table-container">
                        <h3>Log Tindakan Kontrol</h3>
                        <div class="history-table-wrapper">
                            <table class="history-table">
                                <thead>
                                    <tr>
                                        <th>Tanggal</th>
                                        <th>Fase</th>
                                        <th>Irigasi</th>
                                        <th>Pengaturan Suhu</th>
                                        <th>Kontrol Cahaya</th>
                                        <th>Kesehatan</th>
                                    </tr>
                                </thead>
                                <tbody id="history-table-body">
                                    <!-- Isi tabel akan dihasilkan melalui JS -->
                                    <tr>
                                        <td colspan="6" class="no-data">Memuat data...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <!-- Tab Prakiraan -->
                <div class="dashboard-tab" id="forecast-tab">
                    <div class="forecast-header">
                        <div class="current-weather" id="current-weather-display">
                            <div class="weather-icon-large">
                                <i class="fas fa-sun"></i>
                            </div>
                            <div class="current-weather-details">
                                <h3>Cuaca Saat Ini</h3>
                                <div class="current-weather-temp" id="current-weather-temp">--°C</div>
                                <div class="current-weather-desc" id="current-weather-desc">--</div>
                                <div class="current-weather-location" id="current-weather-location">--</div>
                            </div>
                        </div>
                        
                        <div class="forecast-actions">
                            <button id="apply-weather-button" class="forecast-button">
                                <i class="fas fa-play"></i> Terapkan ke Simulasi
                            </button>
                            <button id="refresh-weather-button" class="forecast-button">
                                <i class="fas fa-sync-alt"></i> Refresh Data
                            </button>
                        </div>
                    </div>
                    
                    <div class="forecast-cards" id="forecast-cards">
                        <!-- Kartu prakiraan akan dihasilkan melalui JS -->
                        <div class="forecast-card">
                            <div class="forecast-date">--</div>
                            <div class="forecast-icon"><i class="fas fa-cloud"></i></div>
                            <div class="forecast-temp">--°C</div>
                            <div class="forecast-desc">--</div>
                        </div>
                    </div>
                    
                    <div class="charts-container">
                        <div class="chart-wrapper">
                            <h3>Prakiraan Parameter 7 Hari</h3>
                            <canvas id="forecast-chart"></canvas>
                        </div>
                        
                        <div class="impact-analysis">
                            <h3>Analisis Dampak Cuaca</h3>
                            <div class="impact-grid">
                                <div class="impact-item">
                                    <div class="impact-label">Kelembaban Tanah:</div>
                                    <div class="impact-value" id="impact-soil">--</div>
                                </div>
                                <div class="impact-item">
                                    <div class="impact-label">Suhu Tanaman:</div>
                                    <div class="impact-value" id="impact-temp">--</div>
                                </div>
                                <div class="impact-item">
                                    <div class="impact-label">Pencahayaan:</div>
                                    <div class="impact-value" id="impact-light">--</div>
                                </div>
                                <div class="impact-item">
                                    <div class="impact-label">Kelembaban Udara:</div>
                                    <div class="impact-value" id="impact-humidity">--</div>
                                </div>
                                <div class="impact-item">
                                    <div class="impact-label">Pertumbuhan:</div>
                                    <div class="impact-value" id="impact-growth">--</div>
                                </div>
                                <div class="impact-item">
                                    <div class="impact-label">Kesehatan:</div>
                                    <div class="impact-value" id="impact-health">--</div>
                                </div>
                            </div>
                            
                            <div class="weather-recommendations">
                                <h4>Rekomendasi</h4>
                                <ul id="weather-recommendations">
                                    <li>Memuat rekomendasi...</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const dashboardPlaceholder = document.getElementById('dashboard-container-placeholder');
        if (dashboardPlaceholder) {
            // Hapus konten placeholder jika ada
            dashboardPlaceholder.innerHTML = '';
            // Tambahkan dashboard section
            dashboardPlaceholder.appendChild(dashboardSection);
        } else {
            console.error('Dashboard placeholder tidak ditemukan (ID: dashboard-container-placeholder)');

            // Fallback: Cari container dan tambahkan
            const container = document.querySelector('.container');
            if (container) {
                container.appendChild(dashboardSection);
            } else {
                console.error('Tidak dapat menemukan elemen container untuk attach dashboard');
            }
        }

    },

    // Tambahkan stylesheet untuk dashboard
    addDashboardStylesheet: function() {
        // Cek apakah stylesheet sudah ada
        if (document.getElementById('dashboard-styles')) {
            return;
        }

        // Buat style element
        const style = document.createElement('style');
        style.id = 'dashboard-styles';
        style.textContent = `
            /* Container untuk dashboard */
            .dashboard-extension-container {
                background-color: var(--card-bg);
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
                margin-bottom: 30px;
            }
            
            .dashboard-extension-container h2 {
                color: var(--primary-color);
                margin-bottom: 20px;
                display: flex;
                align-items: center;
            }
            
            .dashboard-extension-container h2 i {
                margin-right: 10px;
                font-size: 1.5rem;
            }
            
            /* Kontrol dashboard */
            .dashboard-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                background-color: #f5f5f5;
                border-radius: 8px;
                padding: 10px;
            }
            
            .tab-controls {
                display: flex;
                gap: 5px;
            }
            
            .tab-button {
                padding: 8px 15px;
                border: none;
                background-color: transparent;
                border-radius: 5px;
                cursor: pointer;
                font-weight: 500;
                color: #555;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .tab-button:hover {
                background-color: #e0e0e0;
            }
            
            .tab-button.active {
                background-color: var(--primary-color);
                color: white;
            }
            
            .time-range-selector {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .time-range-selector label {
                font-weight: 500;
                color: #555;
            }
            
            .time-range-selector select {
                padding: 5px 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                background-color: white;
                font-size: 0.9rem;
            }
            
            /* Konten dashboard */
            .dashboard-content {
                position: relative;
                min-height: 500px;
            }
            
            .dashboard-tab {
                display: none;
                animation: fadeIn 0.3s ease;
            }
            
            .dashboard-tab.active {
                display: block;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            /* Grid metrik */
            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .metric-card {
                background-color: white;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
                display: flex;
                align-items: center;
                height: 100%;
                position: relative;
                overflow: hidden;
            }
            
            .metric-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 5px;
                height: 100%;
            }
            
            .metric-card.health::before { background-color: #4CAF50; }
            .metric-card.growth::before { background-color: #2196F3; }
            .metric-card.fruits::before { background-color: #FF9800; }
            .metric-card.stage::before { background-color: #9C27B0; }
            
            .metric-icon {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background-color: #f5f5f5;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-right: 15px;
                font-size: 1.5rem;
            }
            
            .metric-card.health .metric-icon { color: #4CAF50; }
            .metric-card.growth .metric-icon { color: #2196F3; }
            .metric-card.fruits .metric-icon { color: #FF9800; }
            .metric-card.stage .metric-icon { color: #9C27B0; }
            
            .metric-content {
                flex: 1;
            }
            
            .metric-content h3 {
                margin: 0 0 5px 0;
                font-size: 0.9rem;
                color: #666;
            }
            
            .metric-value {
                font-size: 1.8rem;
                font-weight: bold;
                margin-bottom: 5px;
                color: #333;
            }
            
            .metric-trend {
                font-size: 0.8rem;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .trend-value.positive { color: #4CAF50; }
            .trend-value.negative { color: #F44336; }
            .trend-value.neutral { color: #757575; }
            
            .trend-icon i {
                font-size: 0.9rem;
            }
            
            .fa-arrow-up { color: #4CAF50; }
            .fa-arrow-down { color: #F44336; }
            .fa-equals { color: #757575; }
            
            .metric-info {
                font-size: 0.8rem;
                color: #757575;
                margin-top: 5px;
            }
            
            /* Grid lingkungan */
            .environment-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .environment-card {
                background-color: white;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
                display: flex;
                align-items: center;
            }
            
            .env-icon {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background-color: #f5f5f5;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-right: 15px;
                font-size: 1.5rem;
            }
            
            .environment-card.soil .env-icon { color: #795548; }
            .environment-card.temperature .env-icon { color: #F44336; }
            .environment-card.light .env-icon { color: #FF9800; }
            .environment-card.humidity .env-icon { color: #2196F3; }
            
            .env-content {
                flex: 1;
            }
            
            .env-content h3 {
                margin: 0 0 5px 0;
                font-size: 0.9rem;
                color: #666;
            }
            
            .env-value {
                font-size: 1.5rem;
                font-weight: bold;
                margin-bottom: 5px;
                color: #333;
            }
            
            .env-optimal {
                font-size: 0.8rem;
                color: #666;
                margin-bottom: 10px;
            }
            
            .env-range-slider {
                margin-top: 5px;
            }
            
            .range-track {
                height: 6px;
                background-color: #e0e0e0;
                border-radius: 3px;
                position: relative;
            }
            
            .range-fill {
                height: 100%;
                background-color: var(--primary-color);
                border-radius: 3px;
                transition: width 0.5s ease;
            }
            
            .optimal-marker {
                position: absolute;
                width: 2px;
                height: 10px;
                background-color: #4CAF50;
                top: -2px;
                transform: translateX(-50%);
            }
            
            .current-marker {
                position: absolute;
                width: 10px;
                height: 10px;
                background-color: #2196F3;
                border-radius: 50%;
                top: -2px;
                transform: translateX(-50%);
                transition: left 0.5s ease;
            }
            
            /* Container grafik */
            .charts-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-top: 20px;
            }
            
            .chart-wrapper {
                background-color: white;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            }
            
            .chart-wrapper h3 {
                margin: 0 0 15px 0;
                font-size: 1rem;
                color: #333;
                text-align: center;
            }
            
            canvas {
                width: 100% !important;
                height: 250px !important;
            }
            
            /* Filter riwayat */
            .history-filters {
                display: flex;
                align-items: center;
                gap: 15px;
                background-color: white;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            }
            
            .filter-group {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .filter-group label {
                font-weight: 500;
                color: #555;
            }
            
            .filter-group select {
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 5px;
                background-color: white;
                font-size: 0.9rem;
            }
            
            .history-button {
                margin-left: auto;
                padding: 8px 15px;
                background-color: var(--primary-color);
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 0.9rem;
                transition: background-color 0.3s ease;
            }
            
            .history-button:hover {
                background-color: var(--primary-dark);
            }
            
            /* Grafik riwayat */
            .history-chart-container {
                background-color: white;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
                margin-bottom: 20px;
                height: 300px;
            }
            
            /* Tabel riwayat */
            .history-table-container {
                background-color: white;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            }
            
            .history-table-container h3 {
                margin: 0 0 15px 0;
                font-size: 1rem;
                color: #333;
            }
            
            .history-table-wrapper {
                overflow-x: auto;
                max-height: 300px;
                overflow-y: auto;
            }
            
            .history-table {
                width: 100%;
                border-collapse: collapse;
            }
            
            .history-table th, .history-table td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #e0e0e0;
            }
            
            .history-table th {
                background-color: #f5f5f5;
                position: sticky;
                top: 0;
                z-index: 10;
            }
            
            .history-table tr:hover {
                background-color: #f9f9f9;
            }
            
            .history-table .no-data {
                text-align: center;
                padding: 20px;
                color: #757575;
            }
            
            /* Header prakiraan */
            .forecast-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background-color: white;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            }
            
            .current-weather {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            
            .weather-icon-large {
                font-size: 3rem;
                color: #FF9800;
            }
            
            .current-weather-details h3 {
                margin: 0 0 5px 0;
                font-size: 1rem;
                color: #333;
            }
            
            .current-weather-temp {
                font-size: 2rem;
                font-weight: bold;
                color: #333;
            }
            
            .current-weather-desc {
                color: #666;
                margin-bottom: 5px;
            }
            
            .current-weather-location {
                font-size: 0.9rem;
                color: #757575;
            }
            
            .forecast-actions {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .forecast-button {
                padding: 8px 15px;
                background-color: var(--primary-color);
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
                font-size: 0.9rem;
                transition: background-color 0.3s ease;
                white-space: nowrap;
            }
            
            .forecast-button:hover {
                background-color: var(--primary-dark);
            }
            
            /* Kartu prakiraan */
            .forecast-cards {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .forecast-card {
                background-color: white;
                border-radius: 8px;
                padding: 15px;
                text-align: center;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
                transition: transform 0.3s ease;
            }
            
            .forecast-card:hover {
                transform: translateY(-5px);
            }
            
            .forecast-date {
                font-weight: 500;
                color: #333;
                margin-bottom: 10px;
            }
            
            .forecast-icon {
                font-size: 2rem;
                color: #FF9800;
                margin-bottom: 10px;
            }
            
            .forecast-temp {
                font-size: 1.5rem;
                font-weight: bold;
                color: #333;
                margin-bottom: 5px;
            }
            
            .forecast-desc {
                font-size: 0.9rem;
                color: #666;
            }
            
            /* Analisis dampak */
            .impact-analysis {
                background-color: white;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            }
            
            .impact-analysis h3 {
                margin: 0 0 15px 0;
                font-size: 1rem;
                color: #333;
                text-align: center;
            }
            
            .impact-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .impact-item {
                background-color: #f5f5f5;
                padding: 10px;
                border-radius: 5px;
            }
            
            .impact-label {
                font-weight: 500;
                color: #555;
                margin-bottom: 5px;
            }
            
            .impact-value {
                font-weight: bold;
                color: #333;
            }
            
            .impact-value.positive { color: #4CAF50; }
            .impact-value.negative { color: #F44336; }
            .impact-value.neutral { color: #757575; }
            
            .weather-recommendations {
                background-color: #f5f5f5;
                padding: 15px;
                border-radius: 5px;
            }
            
            .weather-recommendations h4 {
                margin: 0 0 10px 0;
                font-size: 0.9rem;
                color: #333;
            }
            
            .weather-recommendations ul {
                margin: 0;
                padding-left: 20px;
            }
            
            .weather-recommendations li {
                font-size: 0.9rem;
                color: #555;
                margin-bottom: 5px;
            }
            
            /* Responsif */
            @media (max-width: 1200px) {
                .metrics-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .charts-container {
                    grid-template-columns: 1fr;
                }
            }
            
            @media (max-width: 768px) {
                .dashboard-controls {
                    flex-direction: column;
                    gap: 10px;
                    align-items: flex-start;
                }
                
                .tab-controls {
                    width: 100%;
                    overflow-x: auto;
                    padding-bottom: 5px;
                }
                
                .time-range-selector {
                    width: 100%;
                    justify-content: space-between;
                }
                
                .metrics-grid,
                .environment-grid {
                    grid-template-columns: 1fr;
                }
                
                .forecast-header {
                    flex-direction: column;
                    gap: 15px;
                }
                
                .forecast-actions {
                    flex-direction: row;
                    width: 100%;
                }
                
                .impact-grid {
                    grid-template-columns: 1fr 1fr;
                }
                
                .history-filters {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .history-button {
                    margin-left: 0;
                    width: 100%;
                    justify-content: center;
                }
            }
        `;

        // Tambahkan ke head
        document.head.appendChild(style);
    },

    // Tambahkan event listener
    attachEventListeners: function() {
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-button');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.getAttribute('data-tab');
                this.changeTab(tab);
            });
        });

        // Range time selector
        const timeRangeSelect = document.getElementById('time-range-select');
        if (timeRangeSelect) {
            timeRangeSelect.addEventListener('change', () => {
                console.log('Time range changed to:', timeRangeSelect.value);
                this.dashboard.timeRange = timeRangeSelect.value;

                // Perbarui semua grafik
                this.loadDashboardData();
            });
        }

        // History parameter selector
        const historyParameter = document.getElementById('history-parameter');
        if (historyParameter) {
            historyParameter.addEventListener('change', () => {
                this.updateHistoryChart();
            });
        }

        // History view selector
        const historyView = document.getElementById('history-view');
        if (historyView) {
            historyView.addEventListener('change', () => {
                this.updateHistoryChart();
            });
        }

        // Export history button
        const exportHistoryButton = document.getElementById('export-history-button');
        if (exportHistoryButton) {
            exportHistoryButton.addEventListener('click', () => {
                this.exportHistoryData();
            });
        }

        // Refresh weather button
        const refreshWeatherButton = document.getElementById('refresh-weather-button');
        if (refreshWeatherButton) {
            refreshWeatherButton.addEventListener('click', () => {
                this.refreshWeatherData();
            });
        }

        // Apply weather to simulation button
        const applyWeatherButton = document.getElementById('apply-weather-button');
        if (applyWeatherButton) {
            applyWeatherButton.addEventListener('click', () => {
                this.applyWeatherToSimulation();
            });
        }
    },

    // Ubah tab aktif
    changeTab: function(tab) {
        // Perbarui status tab aktif
        this.dashboard.activeTabs = tab;

        // Perbarui class tombol tab
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            if (button.getAttribute('data-tab') === tab) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        // Perbarui class tab
        const tabs = document.querySelectorAll('.dashboard-tab');
        tabs.forEach(tabElement => {
            if (tabElement.id === tab + '-tab') {
                tabElement.classList.add('active');
            } else {
                tabElement.classList.remove('active');
            }
        });

        // Perbarui konten tab spesifik
        switch (tab) {
            case 'performance':
                this.updatePerformanceTab();
                break;
            case 'conditions':
                this.updateConditionsTab();
                break;
            case 'history':
                this.updateHistoryTab();
                break;
            case 'forecast':
                this.updateForecastTab();
                break;
        }
    },


    // Muat data dashboard
    /*
     * FUNGSI 1: loadDashboardData
     * Fungsi ini memuat data untuk dashboard termasuk mengambil data cuaca
     */
    loadDashboardData: function() {
        console.log("Attempting to load dashboard data with range:", this.dashboard.timeRange);

        // Cek apakah ada simulasi aktif dan memiliki log
        if (typeof GreenhouseSimulation !== 'undefined' &&
            GreenhouseSimulation.simulation &&
            GreenhouseSimulation.simulation.active === true &&
            GreenhouseSimulation.simulation.data) {

            console.log('Found active simulation, using simulation data');

            // Gunakan data langsung dari GreenhouseSimulation
            const simulationData = GreenhouseSimulation.simulation.data;

            // Minta data log simulasi
            // Kita perlu mengambil log simulasi melalui AJAX request
            fetch('php/plant_simulation.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `command=get_plant_state&simulation_id=${GreenhouseSimulation.simulation.id}`
                })
                .then(response => response.json())
                .then(logData => {
                    if (logData.success && logData.simulation_log && logData.simulation_log.length > 0) {
                        console.log('Retrieved simulation log data:', logData.simulation_log.length, 'entries');

                        // Proses data log
                        const historyDates = [];
                        const historyHealth = [];
                        const historyGrowth = [];
                        const historySoil = [];
                        const historyTemp = [];
                        const historyLight = [];
                        const historyHumidity = [];
                        const historyActions = [];

                        // Petakan data log ke format yang dibutuhkan dashboard
                        logData.simulation_log.forEach(log => {
                            historyDates.push(log.log_date);
                            historyHealth.push(log.plant_health);
                            historyGrowth.push(log.growth_rate);
                            historySoil.push(log.soil_moisture);
                            historyTemp.push(log.air_temperature);
                            historyLight.push(log.light_intensity);
                            historyHumidity.push(log.humidity);

                            // Tambahkan data tindakan kontrol
                            historyActions.push({
                                date: log.log_date,
                                stage: log.plant_stage,
                                irrigation: log.irrigation_duration ? this.getIrrigationText(log.irrigation_duration) : 'sedang',
                                temperature: log.temperature_setting ? this.getTemperatureText(log.temperature_setting) : 'mempertahankan',
                                light: log.light_control ? this.getLightText(log.light_control) : 'sedang',
                                health: log.plant_health
                            });
                        });

                        // Dapatkan data cuaca dari WeatherIntegration jika tersedia
                        const weatherData = this.getWeatherDataForDashboard();

                        // Buat struktur data yang dibutuhkan dashboard
                        const dashboardData = {
                            success: true,
                            current: simulationData,
                            trends: {
                                health_trend: this.calculateTrend(historyHealth),
                                growth_trend: this.calculateTrend(historyGrowth),
                                fruit_trend: 0 // Perlu data historis buah untuk menghitung tren
                            },
                            optimal: simulationData.optimal_conditions || {
                                soil_moisture: 50,
                                air_temperature: 25,
                                light_intensity: 500,
                                humidity: 60
                            },
                            history: {
                                dates: historyDates,
                                health: historyHealth,
                                growth_rate: historyGrowth,
                                soil_moisture: historySoil,
                                air_temperature: historyTemp,
                                light_intensity: historyLight,
                                humidity: historyHumidity,
                                actions: historyActions
                            },
                            weather: weatherData
                        };

                        // Simpan data
                        this.dashboard.data = dashboardData;

                        // Perbarui UI
                        this.updateDashboardUI();
                    } else {
                        console.log('No simulation log available, using sample data');
                        this.loadSampleData();
                    }
                })
                .catch(error => {
                    console.error('Error fetching simulation log:', error);
                    this.loadSampleData();
                });
        } else {
            console.log('No active simulation detected, using sample data');
            this.loadSampleData();
        }
    },

    /*
     * FUNGSI 2: getWeatherDataForDashboard
     * Fungsi ini mengambil data cuaca dari WeatherIntegration dan memformatnya untuk dashboard
     */
    getWeatherDataForDashboard: function() {
        if (typeof WeatherIntegration !== 'undefined' && WeatherIntegration.weatherData) {
            return WeatherIntegration.getWeatherDataForDashboard();
        } else {
            console.warn('WeatherIntegration not available, using default weather data');
            return this.getDefaultWeatherData();
        }
    },

    /*
     * FUNGSI 3: estimateLightFromCondition
     * Fungsi ini memperkirakan intensitas cahaya berdasarkan kondisi cuaca
     */
    estimateLightFromCondition: function(conditionText) {
        const conditionLower = conditionText.toLowerCase();
        let baseIntensity = 600;

        if (conditionLower.includes('cerah') || conditionLower.includes('sunny') || conditionLower.includes('clear')) {
            return Math.round(baseIntensity * 1.3); // Cerah
        } else if (conditionLower.includes('berawan sebagian') || conditionLower.includes('partly cloudy')) {
            return Math.round(baseIntensity * 1); // Berawan sebagian
        } else if (conditionLower.includes('berawan') || conditionLower.includes('cloudy') || conditionLower.includes('overcast')) {
            return Math.round(baseIntensity * 0.8); // Berawan penuh
        } else if (conditionLower.includes('kabut') || conditionLower.includes('fog') || conditionLower.includes('mist')) {
            return Math.round(baseIntensity * 0.6); // Berkabut
        } else if (conditionLower.includes('hujan ringan') || conditionLower.includes('light rain')) {
            return Math.round(baseIntensity * 0.5); // Hujan ringan
        } else if (conditionLower.includes('hujan') || conditionLower.includes('rain')) {
            return Math.round(baseIntensity * 0.3); // Hujan
        } else if (conditionLower.includes('badai') || conditionLower.includes('storm') || conditionLower.includes('thunder')) {
            return Math.round(baseIntensity * 0.2); // Badai
        }

        return baseIntensity; // Default
    },

    /*
     * FUNGSI 4: analyzeWeatherImpact
     * Fungsi ini menganalisis dampak cuaca pada parameter tanaman
     */
    analyzeWeatherImpact: function(current, forecast) {
        // Analisis tren suhu
        const temps = forecast.map(day => day.temperature);
        const avgTemp = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;

        // Analisis tren curah hujan berdasarkan kondisi
        const rainConditions = ['hujan', 'rain', 'storm', 'shower', 'drizzle', 'thunder'];
        let rainDays = 0;

        forecast.forEach(day => {
            const conditionLower = day.condition.toLowerCase();
            for (const cond of rainConditions) {
                if (conditionLower.includes(cond)) {
                    rainDays++;
                    break;
                }
            }
        });

        const rainProbability = (rainDays / forecast.length) * 100;

        // Analisis dampak pada parameter tanaman
        let soilImpact, tempImpact, lightImpact, humidityImpact, growthImpact, healthImpact;

        // Dampak pada kelembaban tanah
        if (rainProbability > 60) {
            soilImpact = "Akan meningkat karena curah hujan";
        } else if (avgTemp > 30 && current.humidity < 60) {
            soilImpact = "Cenderung menurun karena penguapan";
        } else {
            soilImpact = "Diperkirakan stabil";
        }

        // Dampak pada suhu
        if (avgTemp > 30) {
            tempImpact = "Cenderung tinggi, perlu perhatian";
        } else if (avgTemp < 20) {
            tempImpact = "Sedikit menurun";
        } else {
            tempImpact = "Dalam kisaran optimal";
        }

        // Dampak pada intensitas cahaya
        if (rainProbability > 50) {
            lightImpact = "Berkurang selama hujan";
        } else if (rainProbability > 30) {
            lightImpact = "Bervariasi tergantung awan";
        } else {
            lightImpact = "Cukup baik";
        }

        // Dampak pada kelembaban udara
        if (rainProbability > 60) {
            humidityImpact = "Meningkat";
        } else if (avgTemp > 30 && current.humidity < 50) {
            humidityImpact = "Cenderung rendah";
        } else {
            humidityImpact = "Dalam kisaran normal";
        }

        // Dampak pada pertumbuhan
        if ((avgTemp > 32 || avgTemp < 18) && rainProbability > 60) {
            growthImpact = "Mungkin melambat signifikan";
        } else if (avgTemp > 30 || avgTemp < 20 || rainProbability > 50) {
            growthImpact = "Mungkin melambat";
        } else {
            growthImpact = "Diperkirakan normal";
        }

        // Dampak pada kesehatan tanaman
        if (rainProbability > 70 && avgTemp > 26) {
            healthImpact = "Perlu perhatian";
        } else if (rainProbability > 60 || avgTemp > 32 || avgTemp < 18) {
            healthImpact = "Perlu pengawasan";
        } else {
            healthImpact = "Diperkirakan baik";
        }

        return {
            soil_moisture: soilImpact,
            air_temperature: tempImpact,
            light_intensity: lightImpact,
            humidity: humidityImpact,
            growth_rate: growthImpact,
            plant_health: healthImpact
        };
    },

    /*
     * FUNGSI 5: generateWeatherRecommendations
     * Fungsi ini membuat rekomendasi berdasarkan dampak cuaca
     */
    generateWeatherRecommendations: function(impact) {
        const recommendations = [];

        if (impact.soil_moisture.includes("meningkat")) {
            recommendations.push("Kurangi irigasi selama periode hujan");
            recommendations.push("Pastikan drainase yang baik untuk menghindari genangan air");
        } else if (impact.soil_moisture.includes("menurun")) {
            recommendations.push("Tingkatkan frekuensi irigasi");
        }

        if (impact.light_intensity.includes("Berkurang") || impact.light_intensity.includes("rendah")) {
            recommendations.push("Pertimbangkan pencahayaan tambahan pada hari mendung");
        }

        if (impact.air_temperature.includes("tinggi")) {
            recommendations.push("Pertimbangkan naungan atau pemberian paranet pada waktu panas terik");
        }

        if (impact.plant_health.includes("perhatian")) {
            recommendations.push("Tingkatkan pemantauan kesehatan tanaman dalam beberapa hari ke depan");
        }

        // Rekomendasi umum
        recommendations.push("Pantau kelembaban tanah secara teratur");

        return recommendations;
    },

    /*
     * FUNGSI 6: getDefaultWeatherData
     * Fungsi ini menyediakan data cuaca default jika WeatherIntegration tidak tersedia
     */
    getDefaultWeatherData: function() {
        return {
            current: {
                temperature: 26,
                humidity: 62,
                condition: "Cerah",
                location: "Palangka Raya",
                light_intensity: 700
            },
            forecast: [{
                    date: this.formatDate(new Date(Date.now() + 86400000)),
                    temperature: 27,
                    humidity: 65,
                    condition: "Cerah Berawan",
                    light_intensity: 650
                },
                {
                    date: this.formatDate(new Date(Date.now() + 172800000)),
                    temperature: 28,
                    humidity: 68,
                    condition: "Berawan",
                    light_intensity: 600
                },
                {
                    date: this.formatDate(new Date(Date.now() + 259200000)),
                    temperature: 27,
                    humidity: 70,
                    condition: "Hujan Ringan",
                    light_intensity: 400
                },
                {
                    date: this.formatDate(new Date(Date.now() + 345600000)),
                    temperature: 26,
                    humidity: 75,
                    condition: "Hujan",
                    light_intensity: 300
                },
                {
                    date: this.formatDate(new Date(Date.now() + 432000000)),
                    temperature: 25,
                    humidity: 72,
                    condition: "Hujan Ringan",
                    light_intensity: 350
                }
            ],
            impact: {
                soil_moisture: "Akan meningkat karena curah hujan",
                air_temperature: "Sedikit menurun",
                light_intensity: "Berkurang selama hujan",
                humidity: "Meningkat",
                growth_rate: "Mungkin melambat",
                plant_health: "Perlu perhatian"
            },
            recommendations: [
                "Kurangi irigasi selama periode hujan",
                "Pertimbangkan pencahayaan tambahan pada hari mendung",
                "Pastikan drainase yang baik untuk menghindari genangan air",
                "Pantau kelembaban tanah secara teratur"
            ]
        };
    },

    /*
     * FUNGSI 7: loadSampleData
     * Fungsi ini membuat data sampel untuk dashboard ketika data nyata tidak tersedia
     */
    loadSampleData: function() {
        // Data sampel
        const sampleData = {
            success: true,
            current: {
                plant_stage: 'vegetative',
                days_in_current_stage: 12,
                plant_health: 85,
                growth_rate: 1.2,
                soil_moisture: 58,
                air_temperature: 24.5,
                light_intensity: 650,
                humidity: 62,
                plant_height: 45,
                fruit_count: 0,
                days_since_start: 25
            },
            trends: {
                health_trend: 5,
                growth_trend: 0.1,
                fruit_trend: 0
            },
            optimal: {
                soil_moisture: 55,
                air_temperature: 25,
                light_intensity: 600,
                humidity: 65
            },
            history: {
                dates: this.generateSampleDates(7),
                health: [75, 78, 80, 82, 83, 84, 85],
                growth_rate: [1.0, 1.05, 1.1, 1.15, 1.15, 1.18, 1.2],
                soil_moisture: [50, 52, 55, 57, 56, 57, 58],
                air_temperature: [23, 23.5, 24, 24.5, 24, 24.2, 24.5],
                light_intensity: [500, 550, 600, 620, 630, 640, 650],
                humidity: [60, 61, 62, 63, 62, 62, 62],
                actions: this.generateSampleActions()
            },
            // Gunakan getDefaultWeatherData untuk data cuaca sampel
            weather: this.getDefaultWeatherData()
        };

        // Simpan data
        this.dashboard.data = sampleData;

        // Perbarui UI
        this.updateDashboardUI();
    },

    /*
     * FUNGSI 8: generateSampleDates
     * Fungsi ini menghasilkan tanggal sampel untuk data dummy
     */
    generateSampleDates: function(days) {
        const dates = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            dates.push(this.formatDate(date));
        }

        return dates;
    },

    /*
     * FUNGSI 9: generateSampleActions
     * Fungsi ini menghasilkan tindakan sampel untuk data dummy
     */
    generateSampleActions: function() {
        const dates = this.generateSampleDates(7);
        const actions = [];

        // Tindakan untuk setiap tanggal
        dates.forEach((date, index) => {
            actions.push({
                date: date,
                stage: "vegetative",
                irrigation: index < 3 ? "sedang" : "singkat",
                temperature: "mempertahankan",
                light: index < 2 ? "sedang" : "terang",
                health: 75 + (index * 1.5)
            });
        });

        return actions;
    },

    /*
     * FUNGSI 10: addWeatherUpdateListener
     * Fungsi ini menambahkan event listener untuk pembaruan data cuaca
     */
    addWeatherUpdateListener: function() {
        document.addEventListener('weather-updated', (event) => {
            console.log('Weather data updated, refreshing dashboard');
            if (this.dashboard.initialized) {
                // Perbarui data dashboard karena data cuaca diperbarui
                this.loadDashboardData();
            }
        });
    },



    getIrrigationText: function(value) {
        if (typeof value === 'string') return value;

        if (value <= 15) return 'tidak_ada';
        if (value <= 35) return 'singkat';
        if (value <= 65) return 'sedang';
        return 'lama';
    },

    getTemperatureText: function(value) {
        if (typeof value === 'string') return value;

        if (value <= -4) return 'menurunkan';
        if (value >= 4) return 'menaikkan';
        return 'mempertahankan';
    },

    getLightText: function(value) {
        if (typeof value === 'string') return value;

        if (value <= 15) return 'mati';
        if (value <= 35) return 'redup';
        if (value <= 65) return 'sedang';
        return 'terang';
    },

    calculateTrend: function(dataArray) {
        if (!dataArray || dataArray.length < 2) return 0;

        // Ambil data dalam rentang yang sesuai dengan dashboard.timeRange
        const timeRange = parseInt(this.dashboard.timeRange);
        const relevantData = dataArray.slice(-timeRange);

        if (relevantData.length < 2) return 0;

        // Hitung perubahan
        const latestValue = relevantData[relevantData.length - 1];
        const earliestValue = relevantData[0];

        return latestValue - earliestValue;
    },

    // Muat data sampel untuk testing
    loadSampleData: function() {
        // Data sampel
        const sampleData = {
            success: true,
            current: {
                plant_stage: 'vegetative',
                days_in_current_stage: 12,
                plant_health: 85,
                growth_rate: 1.2,
                soil_moisture: 58,
                air_temperature: 24.5,
                light_intensity: 650,
                humidity: 62,
                plant_height: 45,
                fruit_count: 0,
                days_since_start: 25
            },
            trends: {
                health_trend: 5,
                growth_trend: 0.1,
                fruit_trend: 0
            },
            optimal: {
                soil_moisture: 55,
                air_temperature: 25,
                light_intensity: 600,
                humidity: 65
            },
            history: {
                dates: ["2023-04-20", "2023-04-21", "2023-04-22", "2023-04-23", "2023-04-24", "2023-04-25", "2023-04-26"],
                health: [75, 78, 80, 82, 83, 84, 85],
                growth_rate: [1.0, 1.05, 1.1, 1.15, 1.15, 1.18, 1.2],
                soil_moisture: [50, 52, 55, 57, 56, 57, 58],
                air_temperature: [23, 23.5, 24, 24.5, 24, 24.2, 24.5],
                light_intensity: [500, 550, 600, 620, 630, 640, 650],
                humidity: [60, 61, 62, 63, 62, 62, 62],
                actions: [{
                        date: "2023-04-20",
                        stage: "vegetative",
                        irrigation: "sedang",
                        temperature: "mempertahankan",
                        light: "sedang",
                        health: 75
                    },
                    {
                        date: "2023-04-21",
                        stage: "vegetative",
                        irrigation: "sedang",
                        temperature: "mempertahankan",
                        light: "sedang",
                        health: 78
                    },
                    {
                        date: "2023-04-22",
                        stage: "vegetative",
                        irrigation: "sedang",
                        temperature: "mempertahankan",
                        light: "terang",
                        health: 80
                    },
                    {
                        date: "2023-04-23",
                        stage: "vegetative",
                        irrigation: "singkat",
                        temperature: "mempertahankan",
                        light: "terang",
                        health: 82
                    },
                    {
                        date: "2023-04-24",
                        stage: "vegetative",
                        irrigation: "singkat",
                        temperature: "mempertahankan",
                        light: "terang",
                        health: 83
                    },
                    {
                        date: "2023-04-25",
                        stage: "vegetative",
                        irrigation: "singkat",
                        temperature: "mempertahankan",
                        light: "terang",
                        health: 84
                    },
                    {
                        date: "2023-04-26",
                        stage: "vegetative",
                        irrigation: "singkat",
                        temperature: "mempertahankan",
                        light: "terang",
                        health: 85
                    }
                ]
            },
            weather: {
                current: {
                    temperature: 26,
                    humidity: 62,
                    condition: "Cerah",
                    location: "Palangka Raya",
                    light_intensity: 700
                },
                forecast: [{
                        date: "2023-04-27",
                        temperature: 27,
                        humidity: 65,
                        condition: "Cerah Berawan",
                        light_intensity: 650
                    },
                    {
                        date: "2023-04-28",
                        temperature: 28,
                        humidity: 68,
                        condition: "Berawan",
                        light_intensity: 600
                    },
                    {
                        date: "2023-04-29",
                        temperature: 27,
                        humidity: 70,
                        condition: "Hujan Ringan",
                        light_intensity: 400
                    },
                    {
                        date: "2023-04-30",
                        temperature: 26,
                        humidity: 75,
                        condition: "Hujan",
                        light_intensity: 300
                    },
                    {
                        date: "2023-05-01",
                        temperature: 25,
                        humidity: 72,
                        condition: "Hujan Ringan",
                        light_intensity: 350
                    }
                ],
                impact: {
                    soil_moisture: "Akan meningkat karena curah hujan",
                    air_temperature: "Sedikit menurun",
                    light_intensity: "Berkurang selama hujan",
                    humidity: "Meningkat",
                    growth_rate: "Mungkin melambat",
                    plant_health: "Perlu perhatian"
                },
                recommendations: [
                    "Kurangi irigasi selama periode hujan",
                    "Pertimbangkan pencahayaan tambahan pada hari mendung",
                    "Pastikan drainase yang baik untuk menghindari genangan air",
                    "Pantau kelembaban tanah secara teratur"
                ]
            }
        };

        // Simpan data
        this.dashboard.data = sampleData;

        // Perbarui UI
        this.updateDashboardUI();
    },

    // Perbarui UI dashboard
    updateDashboardUI: function() {
        // Perbarui tab yang aktif
        this.updateActiveTab();
    },

    // Perbarui tab yang sedang aktif
    updateActiveTab: function() {
        // Perbarui tab yang aktif berdasarkan status
        switch (this.dashboard.activeTabs) {
            case 'performance':
                this.updatePerformanceTab();
                break;
            case 'conditions':
                this.updateConditionsTab();
                break;
            case 'history':
                this.updateHistoryTab();
                break;
            case 'forecast':
                this.updateForecastTab();
                break;
        }
    },

    // Perbarui tab performa
    updatePerformanceTab: function() {
        if (!this.dashboard.data) return;

        const data = this.dashboard.data;

        // Update metrik kesehatan
        document.getElementById('health-metric').textContent = Math.round(data.current.plant_health) + '%';

        // Update tren kesehatan
        const healthTrend = document.getElementById('health-trend');
        const healthTrendIcon = healthTrend.nextElementSibling.querySelector('i');

        if (data.trends.health_trend > 0) {
            healthTrend.textContent = '+' + data.trends.health_trend + '%';
            healthTrend.className = 'trend-value positive';
            healthTrendIcon.className = 'fas fa-arrow-up';
        } else if (data.trends.health_trend < 0) {
            healthTrend.textContent = data.trends.health_trend + '%';
            healthTrend.className = 'trend-value negative';
            healthTrendIcon.className = 'fas fa-arrow-down';
        } else {
            healthTrend.textContent = '0%';
            healthTrend.className = 'trend-value neutral';
            healthTrendIcon.className = 'fas fa-equals';
        }

        // Update metrik pertumbuhan
        document.getElementById('growth-metric').textContent = Math.round(data.current.growth_rate * 100) + '%';

        // Update tren pertumbuhan
        const growthTrend = document.getElementById('growth-trend');
        const growthTrendIcon = growthTrend.nextElementSibling.querySelector('i');

        if (data.trends.growth_trend > 0) {
            growthTrend.textContent = '+' + (data.trends.growth_trend * 100).toFixed(0) + '%';
            growthTrend.className = 'trend-value positive';
            growthTrendIcon.className = 'fas fa-arrow-up';
        } else if (data.trends.growth_trend < 0) {
            growthTrend.textContent = (data.trends.growth_trend * 100).toFixed(0) + '%';
            growthTrend.className = 'trend-value negative';
            growthTrendIcon.className = 'fas fa-arrow-down';
        } else {
            growthTrend.textContent = '0%';
            growthTrend.className = 'trend-value neutral';
            growthTrendIcon.className = 'fas fa-equals';
        }

        // Update metrik buah
        document.getElementById('fruits-metric').textContent = data.current.fruit_count;

        // Update tren buah
        const fruitsTrend = document.getElementById('fruits-trend');
        const fruitsTrendIcon = fruitsTrend.nextElementSibling.querySelector('i');

        if (data.trends.fruit_trend > 0) {
            fruitsTrend.textContent = '+' + data.trends.fruit_trend;
            fruitsTrend.className = 'trend-value positive';
            fruitsTrendIcon.className = 'fas fa-arrow-up';
        } else if (data.trends.fruit_trend < 0) {
            fruitsTrend.textContent = data.trends.fruit_trend;
            fruitsTrend.className = 'trend-value negative';
            fruitsTrendIcon.className = 'fas fa-arrow-down';
        } else {
            fruitsTrend.textContent = '0';
            fruitsTrend.className = 'trend-value neutral';
            fruitsTrendIcon.className = 'fas fa-equals';
        }

        // Update metrik fase
        document.getElementById('stage-metric').textContent = this.getPlantStageText(data.current.plant_stage);
        document.getElementById('stage-info').textContent = `${data.current.days_in_current_stage} hari dalam fase ini`;

        // Perbarui grafik performa
        this.updatePerformanceChart();
        this.updateOverallPerformanceChart();
    },

    // Perbarui tab kondisi
    updateConditionsTab: function() {
        if (!this.dashboard.data) return;

        const data = this.dashboard.data;

        // Update kelembaban tanah
        document.getElementById('soil-value').textContent = Math.round(data.current.soil_moisture) + '%';
        document.getElementById('soil-optimal').textContent = data.optimal.soil_moisture + '%';

        // Update kelembaban tanah slider
        const soilPercent = Math.round(data.current.soil_moisture);
        const soilOptimalPercent = Math.round(data.optimal.soil_moisture);

        document.getElementById('soil-fill').style.width = soilPercent + '%';
        document.getElementById('soil-marker').style.left = soilOptimalPercent + '%';
        document.getElementById('soil-current').style.left = soilPercent + '%';

        // Update suhu udara
        document.getElementById('temp-value').textContent = data.current.air_temperature + '°C';
        document.getElementById('temp-optimal').textContent = data.optimal.air_temperature + '°C';

        // Update suhu udara slider
        const tempPercent = Math.round((data.current.air_temperature / 40) * 100);
        const tempOptimalPercent = Math.round((data.optimal.air_temperature / 40) * 100);

        document.getElementById('temp-fill').style.width = tempPercent + '%';
        document.getElementById('temp-marker').style.left = tempOptimalPercent + '%';
        document.getElementById('temp-current').style.left = tempPercent + '%';

        // Update intensitas cahaya
        document.getElementById('light-value').textContent = Math.round(data.current.light_intensity) + ' lux';
        document.getElementById('light-optimal').textContent = data.optimal.light_intensity + ' lux';

        // Update intensitas cahaya slider
        const lightPercent = Math.round((data.current.light_intensity / 1000) * 100);
        const lightOptimalPercent = Math.round((data.optimal.light_intensity / 1000) * 100);

        document.getElementById('light-fill').style.width = lightPercent + '%';
        document.getElementById('light-marker').style.left = lightOptimalPercent + '%';
        document.getElementById('light-current').style.left = lightPercent + '%';

        // Update kelembaban udara
        document.getElementById('humidity-value').textContent = Math.round(data.current.humidity) + '%';
        document.getElementById('humidity-optimal').textContent = data.optimal.humidity + '%';

        // Update kelembaban udara slider
        const humidityPercent = Math.round(data.current.humidity);
        const humidityOptimalPercent = Math.round(data.optimal.humidity);

        document.getElementById('humidity-fill').style.width = humidityPercent + '%';
        document.getElementById('humidity-marker').style.left = humidityOptimalPercent + '%';
        document.getElementById('humidity-current').style.left = humidityPercent + '%';

        // Perbarui grafik kondisi
        this.updateSoilAirChart();
        this.updateLightHumidityChart();
    },

    // Perbarui tab riwayat
    updateHistoryTab: function() {
        // Perbarui grafik riwayat
        this.updateHistoryChart();

        // Perbarui tabel riwayat
        this.updateHistoryTable();
    },

    // Perbarui tab prakiraan
    updateForecastTab: function() {
        if (!this.dashboard.data || !this.dashboard.data.weather) return;

        const weather = this.dashboard.data.weather;

        // Update cuaca saat ini
        document.getElementById('current-weather-temp').textContent = weather.current.temperature + '°C';
        document.getElementById('current-weather-desc').textContent = weather.current.condition;
        document.getElementById('current-weather-location').textContent = weather.current.location;

        // Update ikon cuaca saat ini
        const weatherIcon = document.querySelector('.weather-icon-large i');
        weatherIcon.className = this.getWeatherIcon(weather.current.condition);

        // Update kartu prakiraan
        const forecastCards = document.getElementById('forecast-cards');
        forecastCards.innerHTML = '';

        weather.forecast.forEach(day => {
            const card = document.createElement('div');
            card.className = 'forecast-card';

            card.innerHTML = `
                <div class="forecast-date">${this.formatDate(day.date)}</div>
                <div class="forecast-icon"><i class="${this.getWeatherIcon(day.condition)}"></i></div>
                <div class="forecast-temp">${day.temperature}°C</div>
                <div class="forecast-desc">${day.condition}</div>
            `;

            forecastCards.appendChild(card);
        });

        // Update grafik prakiraan
        this.updateForecastChart();

        // Update dampak cuaca
        document.getElementById('impact-soil').textContent = weather.impact.soil_moisture;
        document.getElementById('impact-temp').textContent = weather.impact.air_temperature;
        document.getElementById('impact-light').textContent = weather.impact.light_intensity;
        document.getElementById('impact-humidity').textContent = weather.impact.humidity;
        document.getElementById('impact-growth').textContent = weather.impact.growth_rate;
        document.getElementById('impact-health').textContent = weather.impact.plant_health;

        // Set kelas dampak
        this.setImpactClass('impact-soil', weather.impact.soil_moisture);
        this.setImpactClass('impact-temp', weather.impact.air_temperature);
        this.setImpactClass('impact-light', weather.impact.light_intensity);
        this.setImpactClass('impact-humidity', weather.impact.humidity);
        this.setImpactClass('impact-growth', weather.impact.growth_rate);
        this.setImpactClass('impact-health', weather.impact.plant_health);

        // Update rekomendasi
        const recommendationsList = document.getElementById('weather-recommendations');
        recommendationsList.innerHTML = '';

        weather.recommendations.forEach(recommendation => {
            const item = document.createElement('li');
            item.textContent = recommendation;
            recommendationsList.appendChild(item);
        });
    },

    addWeatherUpdateListener: function() {
        document.addEventListener('weather-updated', (event) => {
            console.log('Weather data updated, refreshing dashboard');
            if (this.dashboard.initialized) {
                // Perbarui data dashboard karena data cuaca diperbarui
                this.loadDashboardData();
            }
        });
    },

    // Perbarui grafik performa
    updatePerformanceChart: function() {
        if (!this.dashboard.data || !this.dashboard.data.history) return;

        const history = this.dashboard.data.history;

        // Cek jika Chart.js tersedia
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js tidak tersedia, memuat dari CDN...');

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.0/chart.min.js';

            script.onload = () => {
                this.createPerformanceChart(history);
            };

            document.head.appendChild(script);
            return;
        }

        // Jika grafik sudah dibuat, perbarui data
        if (this.dashboard.charts.performanceChart) {
            this.dashboard.charts.performanceChart.data.labels = history.dates.map(date => this.formatDate(date));
            this.dashboard.charts.performanceChart.data.datasets[0].data = history.health;
            this.dashboard.charts.performanceChart.data.datasets[1].data = history.growth_rate.map(rate => rate * 100);
            this.dashboard.charts.performanceChart.update();
        } else {
            // Buat grafik baru
            this.createPerformanceChart(history);
        }
    },

    // Buat grafik performa
    createPerformanceChart: function(history) {
        const ctx = document.getElementById('performance-chart');
        if (!ctx) return;

        this.dashboard.charts.performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: history.dates.map(date => this.formatDate(date)),
                datasets: [{
                        label: 'Kesehatan (%)',
                        data: history.health,
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Pertumbuhan (%)',
                        data: history.growth_rate.map(rate => rate * 100),
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: Math.min(Math.min(...history.health), Math.min(...history.growth_rate) * 100) - 10,
                        max: Math.max(Math.max(...history.health), Math.max(...history.growth_rate) * 100) + 10,
                        title: {
                            display: true,
                            text: 'Persentase (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tanggal'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false,
                        text: 'Kesehatan dan Pertumbuhan'
                    }
                }
            }
        });
    },

    // Perbarui grafik performa keseluruhan
    updateOverallPerformanceChart: function() {
        if (!this.dashboard.data || !this.dashboard.data.history) return;

        const history = this.dashboard.data.history;

        // Hitung performa keseluruhan
        const overallPerformance = history.health.map((health, index) => {
            const growth = history.growth_rate[index] * 100;
            return (health * 0.6 + growth * 0.4);
        });

        // Jika grafik sudah dibuat, perbarui data
        if (this.dashboard.charts.overallPerformanceChart) {
            this.dashboard.charts.overallPerformanceChart.data.labels = history.dates.map(date => this.formatDate(date));
            this.dashboard.charts.overallPerformanceChart.data.datasets[0].data = overallPerformance;
            this.dashboard.charts.overallPerformanceChart.update();
        } else {
            // Buat grafik baru
            this.createOverallPerformanceChart(history, overallPerformance);
        }
    },

    // Buat grafik performa keseluruhan
    createOverallPerformanceChart: function(history, overallPerformance) {
        const ctx = document.getElementById('overall-performance-chart');
        if (!ctx) return;

        this.dashboard.charts.overallPerformanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: history.dates.map(date => this.formatDate(date)),
                datasets: [{
                    label: 'Performa Keseluruhan',
                    data: overallPerformance,
                    backgroundColor: function(context) {
                        const value = context.dataset.data[context.dataIndex];
                        if (value >= 80) return 'rgba(76, 175, 80, 0.7)'; // Sangat baik
                        if (value >= 60) return 'rgba(33, 150, 243, 0.7)'; // Baik
                        if (value >= 40) return 'rgba(255, 152, 0, 0.7)'; // Sedang
                        return 'rgba(244, 67, 54, 0.7)'; // Buruk
                    },
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Performa (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tanggal'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                let label = 'Performa: ' + value.toFixed(1) + '%';

                                if (value >= 80) label += ' (Sangat Baik)';
                                else if (value >= 60) label += ' (Baik)';
                                else if (value >= 40) label += ' (Sedang)';
                                else label += ' (Perlu Perhatian)';

                                return label;
                            }
                        }
                    },
                    legend: {
                        display: false
                    }
                }
            }
        });
    },

    // Perbarui grafik tanah dan udara
    updateSoilAirChart: function() {
        if (!this.dashboard.data || !this.dashboard.data.history) return;

        const history = this.dashboard.data.history;

        // Persiapkan data berdasarkan rentang waktu yang dipilih
        const timeRange = parseInt(this.dashboard.timeRange);
        let dates = [...history.dates];
        let soilMoistureData = [...history.soil_moisture];
        let airTemperatureData = [...history.air_temperature];

        // Batasi data sesuai rentang waktu yang dipilih
        if (dates.length > timeRange) {
            dates = dates.slice(-timeRange);
            soilMoistureData = soilMoistureData.slice(-timeRange);
            airTemperatureData = airTemperatureData.slice(-timeRange);
        }

        // Jika grafik sudah dibuat, perbarui data
        if (this.dashboard.charts.soilAirChart) {
            this.dashboard.charts.soilAirChart.data.labels = dates.map(date => this.formatDate(date));
            this.dashboard.charts.soilAirChart.data.datasets[0].data = soilMoistureData;
            this.dashboard.charts.soilAirChart.data.datasets[1].data = airTemperatureData;
            this.dashboard.charts.soilAirChart.options.plugins.title.text = `Data ${timeRange} Hari Terakhir`;
            this.dashboard.charts.soilAirChart.update();
        } else {
            // Buat grafik baru
            this.createSoilAirChart(dates, soilMoistureData, airTemperatureData, timeRange);
        }
    },

    // Buat grafik tanah dan udara yang dimodifikasi
    createSoilAirChart: function(dates, soilMoistureData, airTemperatureData, timeRange) {
        const ctx = document.getElementById('soil-air-chart');
        if (!ctx) return;

        this.dashboard.charts.soilAirChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates.map(date => this.formatDate(date)),
                datasets: [{
                        label: 'Kelembaban Tanah (%)',
                        data: soilMoistureData,
                        borderColor: '#795548',
                        backgroundColor: 'rgba(121, 85, 72, 0.1)',
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Suhu Udara (°C)',
                        data: airTemperatureData,
                        borderColor: '#F44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Kelembaban Tanah (%)'
                        }
                    },
                    y1: {
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        title: {
                            display: true,
                            text: 'Suhu Udara (°C)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tanggal'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    title: {
                        display: true,
                        text: `Data ${timeRange} Hari Terakhir`
                    }
                }
            }
        });
    },

    // Perbaikan untuk grafik intensitas cahaya dan kelembaban agar sesuai dengan rentang waktu yang dipilih
    updateLightHumidityChart: function() {
        if (!this.dashboard.data || !this.dashboard.data.history) return;

        const history = this.dashboard.data.history;

        // Persiapkan data berdasarkan rentang waktu yang dipilih
        const timeRange = parseInt(this.dashboard.timeRange);
        let dates = [...history.dates];
        let lightIntensityData = [...history.light_intensity];
        let humidityData = [...history.humidity];

        // Batasi data sesuai rentang waktu yang dipilih
        if (dates.length > timeRange) {
            dates = dates.slice(-timeRange);
            lightIntensityData = lightIntensityData.slice(-timeRange);
            humidityData = humidityData.slice(-timeRange);
        }

        // Jika grafik sudah dibuat, perbarui data
        if (this.dashboard.charts.lightHumidityChart) {
            this.dashboard.charts.lightHumidityChart.data.labels = dates.map(date => this.formatDate(date));
            this.dashboard.charts.lightHumidityChart.data.datasets[0].data = lightIntensityData;
            this.dashboard.charts.lightHumidityChart.data.datasets[1].data = humidityData;
            this.dashboard.charts.lightHumidityChart.options.plugins.title.text = `Data ${timeRange} Hari Terakhir`;
            this.dashboard.charts.lightHumidityChart.update();
        } else {
            // Buat grafik baru
            this.createLightHumidityChart(dates, lightIntensityData, humidityData, timeRange);
        }
    },

    // Buat grafik cahaya dan kelembaban yang dimodifikasi
    createLightHumidityChart: function(dates, lightIntensityData, humidityData, timeRange) {
        const ctx = document.getElementById('light-humidity-chart');
        if (!ctx) return;

        this.dashboard.charts.lightHumidityChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates.map(date => this.formatDate(date)),
                datasets: [{
                        label: 'Intensitas Cahaya (lux)',
                        data: lightIntensityData,
                        borderColor: '#FF9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Kelembaban Udara (%)',
                        data: humidityData,
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Intensitas Cahaya (lux)'
                        }
                    },
                    y1: {
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        title: {
                            display: true,
                            text: 'Kelembaban Udara (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tanggal'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    title: {
                        display: true,
                        text: `Data ${timeRange} Hari Terakhir`
                    }
                }
            }
        });
    },

    // Perbarui grafik riwayat
    updateHistoryChart: function() {
        if (!this.dashboard.data || !this.dashboard.data.history) return;

        const history = this.dashboard.data.history;

        // Dapatkan parameter yang dipilih
        const parameter = document.getElementById('history-parameter').value;
        const view = document.getElementById('history-view').value;

        // Dapatkan data parameter yang dipilih
        let data = history[parameter];
        if (!data) return;

        // Konversi data growth_rate jika dipilih
        if (parameter === 'growth_rate') {
            data = data.map(rate => rate * 100);
        }

        // Dapatkan label yang sesuai berdasarkan view
        let labels = history.dates;

        // Jika view mingguan atau bulanan, agregasi data
        if (view === 'weekly' || view === 'monthly') {
            const aggregatedData = this.aggregateData(history.dates, data, view);
            labels = aggregatedData.labels;
            data = aggregatedData.data;
        }

        // Dapatkan label untuk parameter
        const parameterLabel = this.getParameterLabel(parameter);

        // Jika grafik sudah dibuat, perbarui data
        if (this.dashboard.charts.historyChart) {
            this.dashboard.charts.historyChart.data.labels = labels.map(date => this.formatDate(date, view));
            this.dashboard.charts.historyChart.data.datasets[0].data = data;
            this.dashboard.charts.historyChart.data.datasets[0].label = parameterLabel;
            this.dashboard.charts.historyChart.options.scales.y.title.text = parameterLabel;
            this.dashboard.charts.historyChart.update();
        } else {
            // Buat grafik baru
            this.createHistoryChart(labels, data, parameterLabel, view);
        }
    },

    // Buat grafik riwayat
    createHistoryChart: function(labels, data, parameterLabel, view) {
        const ctx = document.getElementById('history-chart');
        if (!ctx) return;

        this.dashboard.charts.historyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.map(date => this.formatDate(date, view)),
                datasets: [{
                    label: parameterLabel,
                    data: data,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: parameterLabel
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: view === 'daily' ? 'Tanggal' : (view === 'weekly' ? 'Minggu' : 'Bulan')
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    legend: {
                        display: false
                    }
                }
            }
        });
    },

    // Perbarui tabel riwayat
    updateHistoryTable: function() {
        if (!this.dashboard.data || !this.dashboard.data.history) return;

        const history = this.dashboard.data.history;
        const actions = history.actions;

        // Dapatkan tbody
        const tbody = document.getElementById('history-table-body');
        if (!tbody) return;

        // Kosongkan tbody
        tbody.innerHTML = '';

        // Jika tidak ada data
        if (actions.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="6" class="no-data">Tidak ada data tindakan kontrol</td>`;
            tbody.appendChild(row);
            return;
        }

        // Isi tbody dengan data actions
        actions.forEach(action => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${this.formatDate(action.date)}</td>
                <td>${this.getPlantStageText(action.stage)}</td>
                <td>${this.capitalizeFirstLetter(action.irrigation)}</td>
                <td>${this.capitalizeFirstLetter(action.temperature)}</td>
                <td>${this.capitalizeFirstLetter(action.light)}</td>
                <td>${action.health}%</td>
            `;

            tbody.appendChild(row);
        });
    },

    // Perbarui grafik prakiraan
    updateForecastChart: function() {
        if (!this.dashboard.data || !this.dashboard.data.weather) return;

        const weather = this.dashboard.data.weather;

        // Siapkan data untuk grafik
        const labels = [
            'Hari Ini',
            ...weather.forecast.map(day => this.formatDate(day.date))
        ];

        const temperatures = [
            weather.current.temperature,
            ...weather.forecast.map(day => day.temperature)
        ];

        const humidity = [
            weather.current.humidity,
            ...weather.forecast.map(day => day.humidity)
        ];

        const lightIntensity = [
            weather.current.light_intensity,
            ...weather.forecast.map(day => day.light_intensity)
        ];

        // Jika grafik sudah dibuat, perbarui data
        if (this.dashboard.charts.forecastChart) {
            this.dashboard.charts.forecastChart.data.labels = labels;
            this.dashboard.charts.forecastChart.data.datasets[0].data = temperatures;
            this.dashboard.charts.forecastChart.data.datasets[1].data = humidity;
            this.dashboard.charts.forecastChart.data.datasets[2].data = lightIntensity;
            this.dashboard.charts.forecastChart.update();
        } else {
            // Buat grafik baru
            this.createForecastChart(labels, temperatures, humidity, lightIntensity);
        }
    },

    // Buat grafik prakiraan
    createForecastChart: function(labels, temperatures, humidity, lightIntensity) {
        const ctx = document.getElementById('forecast-chart');
        if (!ctx) return;

        this.dashboard.charts.forecastChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                        label: 'Suhu (°C)',
                        data: temperatures,
                        borderColor: '#F44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y-temp'
                    },
                    {
                        label: 'Kelembaban (%)',
                        data: humidity,
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y-humid'
                    },
                    {
                        label: 'Cahaya (lux)',
                        data: lightIntensity,
                        borderColor: '#FF9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y-light'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    'y-temp': {
                        type: 'linear',
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Suhu (°C)'
                        },
                        grid: {
                            drawOnChartArea: true
                        }
                    },
                    'y-humid': {
                        type: 'linear',
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Kelembaban (%)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    },
                    'y-light': {
                        type: 'linear',
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Cahaya (lux)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Hari'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                }
            }
        });
    },

    // Ekspor data riwayat
    exportHistoryData: function() {
        if (!this.dashboard.data || !this.dashboard.data.history) {
            this.showNotification('Tidak ada data untuk diekspor', 'warning');
            return;
        }

        const history = this.dashboard.data.history;

        // Buat data CSV
        let csv = 'Tanggal,Kesehatan,Pertumbuhan,Kelembaban Tanah,Suhu Udara,Intensitas Cahaya,Kelembaban Udara\n';

        for (let i = 0; i < history.dates.length; i++) {
            csv += `${history.dates[i]},${history.health[i]},${history.growth_rate[i]},${history.soil_moisture[i]},${history.air_temperature[i]},${history.light_intensity[i]},${history.humidity[i]}\n`;
        }

        // Buat blob dan link unduhan
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'riwayat_tanaman_' + new Date().toISOString().split('T')[0] + '.csv';

        // Tambahkan ke dokumen dan klik
        document.body.appendChild(a);
        a.click();

        // Bersihkan
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        this.showNotification('Data riwayat berhasil diekspor ke CSV', 'success');
    },

    // Refresh data cuaca
    refreshWeatherData: function() {
        // Cek apakah WeatherIntegration tersedia
        if (typeof WeatherIntegration !== 'undefined') {
            WeatherIntegration.fetchWeatherData();
            this.showNotification('Memperbarui data cuaca...', 'info');

            // Muat ulang data dashboard setelah beberapa saat
            setTimeout(() => {
                this.loadDashboardData();
            }, 2000);
        } else {
            this.showNotification('Modul integrasi cuaca tidak tersedia', 'warning');
        }
    },

    // Terapkan data cuaca ke simulasi
    applyWeatherToSimulation: function() {
        // Cek apakah WeatherIntegration dan GreenhouseSimulation tersedia
        if (typeof WeatherIntegration !== 'undefined' && typeof GreenhouseSimulation !== 'undefined') {
            WeatherIntegration.applyWeatherToInputs();
            this.showNotification('Data cuaca diterapkan ke simulasi', 'success');
        } else {
            this.showNotification('Modul simulasi atau cuaca tidak tersedia', 'warning');
        }
    },

    // Agregasi data berdasarkan view
    aggregateData: function(dates, data, view) {
        const result = {
            labels: [],
            data: []
        };

        if (view === 'weekly') {
            // Agregasi mingguan
            const weeks = {};

            dates.forEach((date, index) => {
                const d = new Date(date);
                const year = d.getFullYear();
                const weekNumber = this.getWeekNumber(d);
                const weekKey = `${year}-W${weekNumber}`;

                if (!weeks[weekKey]) {
                    weeks[weekKey] = {
                        sum: 0,
                        count: 0,
                        date: date
                    };
                }

                weeks[weekKey].sum += data[index];
                weeks[weekKey].count++;
            });

            for (const weekKey in weeks) {
                result.labels.push(weeks[weekKey].date);
                result.data.push(weeks[weekKey].sum / weeks[weekKey].count);
            }
        } else if (view === 'monthly') {
            // Agregasi bulanan
            const months = {};

            dates.forEach((date, index) => {
                const monthKey = date.substring(0, 7); // YYYY-MM

                if (!months[monthKey]) {
                    months[monthKey] = {
                        sum: 0,
                        count: 0,
                        date: date
                    };
                }

                months[monthKey].sum += data[index];
                months[monthKey].count++;
            });

            for (const monthKey in months) {
                result.labels.push(months[monthKey].date);
                result.data.push(months[monthKey].sum / months[monthKey].count);
            }
        } else {
            // View harian, kembalikan data asli
            result.labels = dates;
            result.data = data;
        }

        return result;
    },

    // Dapatkan nomor minggu dari tanggal
    getWeekNumber: function(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    },

    // Dapatkan label untuk parameter
    getParameterLabel: function(parameter) {
        switch (parameter) {
            case 'plant_health':
                return 'Kesehatan Tanaman (%)';
            case 'growth_rate':
                return 'Tingkat Pertumbuhan (%)';
            case 'soil_moisture':
                return 'Kelembaban Tanah (%)';
            case 'air_temperature':
                return 'Suhu Udara (°C)';
            case 'light_intensity':
                return 'Intensitas Cahaya (lux)';
            case 'humidity':
                return 'Kelembaban Udara (%)';
            default:
                return parameter;
        }
    },

    // Format tanggal
    formatDate: function(dateString, view = 'daily') {
        if (!dateString) return '';

        const date = new Date(dateString);

        if (view === 'weekly') {
            const weekNumber = this.getWeekNumber(date);
            return `Minggu ${weekNumber}, ${date.getFullYear()}`;
        } else if (view === 'monthly') {
            const months = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ];
            return `${months[date.getMonth()]} ${date.getFullYear()}`;
        } else {
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short'
            });
        }
    },

    // Dapatkan teks fase tanaman
    getPlantStageText: function(stage) {
        switch (stage) {
            case 'seedling':
                return 'Bibit';
            case 'vegetative':
                return 'Vegetatif';
            case 'flowering':
                return 'Berbunga';
            case 'fruiting':
                return 'Berbuah';
            case 'harvesting':
                return 'Panen';
            default:
                return stage;
        }
    },

    // Dapatkan ikon cuaca
    getWeatherIcon: function(condition) {
        condition = condition.toLowerCase();

        if (condition.includes('cerah') || condition === 'sunny' || condition === 'clear') {
            return 'fas fa-sun';
        } else if (condition.includes('berawan') || condition === 'cloudy' || condition === 'partly cloudy') {
            return 'fas fa-cloud-sun';
        } else if (condition.includes('mendung') || condition === 'overcast') {
            return 'fas fa-cloud';
        } else if (condition.includes('hujan ringan') || condition === 'light rain') {
            return 'fas fa-cloud-rain';
        } else if (condition.includes('hujan') || condition === 'rain') {
            return 'fas fa-cloud-showers-heavy';
        } else if (condition.includes('badai') || condition === 'storm' || condition === 'thunderstorm') {
            return 'fas fa-bolt';
        } else if (condition.includes('kabut') || condition === 'fog' || condition === 'mist') {
            return 'fas fa-smog';
        } else if (condition.includes('salju') || condition === 'snow') {
            return 'fas fa-snowflake';
        } else {
            return 'fas fa-cloud';
        }
    },

    // Set kelas dampak berdasarkan teks
    setImpactClass: function(elementId, text) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Reset kelas
        element.classList.remove('positive', 'negative', 'neutral');

        // Set kelas berdasarkan teks
        const lowerText = text.toLowerCase();

        if (lowerText.includes('meningkat') || lowerText.includes('baik') || lowerText.includes('optimal')) {
            element.classList.add('positive');
        } else if (lowerText.includes('menurun') || lowerText.includes('kurang') || lowerText.includes('buruk') ||
            lowerText.includes('perlu perhatian') || lowerText.includes('berkurang') || lowerText.includes('melambat')) {
            element.classList.add('negative');
        } else {
            element.classList.add('neutral');
        }
    },

    // Kapitalkan huruf pertama
    capitalizeFirstLetter: function(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    // Tampilkan notifikasi
    showNotification: function(message, type = 'info') {
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
    }
};

// Inisialisasi saat dokumen selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi dashboard extension
    setTimeout(() => {
        DashboardExtension.initialize();
    }, 1000); // Delay untuk memastikan semua elemen UI telah dimuat
});