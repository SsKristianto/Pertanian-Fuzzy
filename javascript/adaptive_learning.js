/**
 * adaptive_learning.js
 * 
 * Implementasi mekanisme pembelajaran adaptif untuk sistem kontrol fuzzy
 * Memantau respons tanaman terhadap tindakan kontrol dan menyesuaikan aturan
 */

const AdaptiveLearning = {
    // Status sistem adaptif
    adaptiveSystem: {
        active: false,
        learningRate: 0.2, // 0-1, seberapa cepat sistem beradaptasi
        confidence: {}, // Tingkat kepercayaan untuk setiap aturan
        performanceHistory: [], // Riwayat performa
        optimalConditions: {}, // Kondisi optimal yang dipelajari
        currentRules: [] // Aturan fuzzy saat ini
    },

    // Chart instances tracking
    charts: {},

    // Inisialisasi sistem pembelajaran adaptif
    initialize: function() {
        // Check if already initialized to prevent multiple initializations
        if (this.initialized) {
            console.log('Adaptive learning system already initialized');
            return;
        }

        console.log('Initializing adaptive learning system...');

        // Add configuration panel to the page
        this.createConfigPanel();

        // Get initial fuzzy rules
        this.loadFuzzyRules();

        // Add event listener for adaptive button in simulation
        this.attachEventListeners();

        // Mark as initialized
        this.initialized = true;
    },

    // Modify the initLearningChart function
    initLearningChart: function() {
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not available, loading from CDN...');

            // Load Chart.js from CDN if not already loaded
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.0/chart.min.js';
            script.onload = function() {
                // After loading, create the chart
                AdaptiveLearning.createLearningChart();
            };
            document.head.appendChild(script);
        } else {
            // Create chart if Chart.js is already available
            this.createLearningChart();
        }
    },

    // Completely rework the createLearningChart function
    createLearningChart: function() {
        const canvasId = 'learning-chart';
        const ctx = document.getElementById(canvasId);

        if (!ctx) {
            console.warn('Learning chart canvas not found');
            return;
        }

        // First, check if there's an existing chart on this canvas
        if (this.charts[canvasId]) {
            // Properly destroy the old chart
            this.charts[canvasId].destroy();
            delete this.charts[canvasId];
            console.log('Destroyed existing learning chart');
        }

        // Also check if Chart.js has a registry of this chart
        const chartInstance = Chart.getChart(ctx);
        if (chartInstance) {
            chartInstance.destroy();
            console.log('Destroyed Chart.js instance from registry');
        }

        // Data initialization
        const data = {
            labels: [],
            datasets: [{
                    label: 'Performa Sistem',
                    data: [],
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Tingkat Adaptasi',
                    data: [],
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.05)',
                    tension: 0.4,
                    fill: true
                }
            ]
        };

        // Create chart with a slight delay to ensure DOM is ready
        setTimeout(() => {
            try {
                // Create the new chart and store it in our tracking object
                this.charts[canvasId] = new Chart(ctx, {
                    type: 'line',
                    data: data,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100,
                                title: {
                                    display: true,
                                    text: 'Persentase (%)'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Siklus Pembelajaran'
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
                            }
                        }
                    }
                });

                // Store reference to the chart for easier access
                this.learningChart = this.charts[canvasId];
                console.log('Learning chart created successfully');
            } catch (e) {
                console.error('Error creating learning chart:', e);
            }
        }, 50);
    },

    // Update the updateLearningChart function
    updateLearningChart: function(cycle, performance, convergence) {
        // Make sure the chart exists before trying to update it
        if (!this.learningChart || !this.charts['learning-chart']) {
            console.warn('Learning chart not available for update');
            // Try to recreate the chart if it doesn't exist
            this.createLearningChart();
            return;
        }

        // Add data safely
        try {
            // Add labels and data
            this.learningChart.data.labels.push(cycle);
            this.learningChart.data.datasets[0].data.push(performance);
            this.learningChart.data.datasets[1].data.push(convergence);

            // Limit data points to last 20 for performance
            if (this.learningChart.data.labels.length > 20) {
                this.learningChart.data.labels.shift();
                this.learningChart.data.datasets[0].data.shift();
                this.learningChart.data.datasets[1].data.shift();
            }

            // Update the chart
            this.learningChart.update();
        } catch (e) {
            console.error('Error updating learning chart:', e);
        }
    },

    // Buat panel konfigurasi pembelajaran adaptif
    createConfigPanel: function() {
        // Cari kontainer konfigurasi yang ada atau buat yang baru
        let configSection = document.querySelector('.configuration-section');

        if (!configSection) {
            configSection = document.createElement('div');
            configSection.className = 'configuration-section';
            configSection.innerHTML = `
                <h2><i class="fas fa-cogs"></i> Konfigurasi Sistem</h2>
            `;

            // Sisipkan setelah simulasi atau visualisasi
            const simulationContainer = document.querySelector('.simulation-container');
            const visualizationSection = document.querySelector('.visualization-section');

            if (simulationContainer) {
                simulationContainer.parentNode.insertBefore(configSection, simulationContainer.nextSibling);
            } else if (visualizationSection) {
                visualizationSection.parentNode.insertBefore(configSection, visualizationSection.nextSibling);
            } else {
                document.querySelector('.container').appendChild(configSection);
            }
        }

        // Buat panel pembelajaran adaptif
        const adaptivePanel = document.createElement('div');
        adaptivePanel.className = 'config-panel adaptive-panel';
        adaptivePanel.innerHTML = `
            <div class="panel-header">
                <h3><i class="fas fa-brain"></i> Pembelajaran Adaptif</h3>
                <div class="panel-controls">
                    <label class="switch">
                        <input type="checkbox" id="adaptive-learning-toggle">
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>
            
            <div class="panel-content">
                <div class="config-group">
                    <label for="learning-rate">Tingkat Pembelajaran:</label>
                    <div class="range-container">
                        <input type="range" id="learning-rate" min="0.05" max="0.5" step="0.05" value="0.2">
                        <span id="learning-rate-value">0.2</span>
                    </div>
                </div>
                
                <div class="config-group">
                    <label>Status Pembelajaran:</label>
                    <div class="status-indicator">
                        <div class="indicator-dot" id="learning-status-dot"></div>
                        <span id="learning-status">Tidak Aktif</span>
                    </div>
                </div>
                
                <div class="performance-metrics">
                    <h4>Metrik Performa</h4>
                    <div class="metrics-grid">
                        <div class="metric-item">
                            <span class="metric-label">Siklus Pembelajaran:</span>
                            <span class="metric-value" id="learning-cycles">0</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Aturan Disesuaikan:</span>
                            <span class="metric-value" id="rules-adjusted">0</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Performa Sistem:</span>
                            <span class="metric-value" id="system-performance">0%</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Konvergensi:</span>
                            <span class="metric-value" id="convergence-status">0%</span>
                        </div>
                    </div>
                </div>
                
                <div class="adaptive-controls">
                    <button id="view-rules" class="adaptive-button">
                        <i class="fas fa-list"></i> Lihat Aturan yang Disesuaikan
                    </button>
                    <button id="reset-learning" class="adaptive-button danger">
                        <i class="fas fa-undo"></i> Reset Pembelajaran
                    </button>
                </div>
                
                <div class="learning-progress">
                    <h4>Grafik Pembelajaran</h4>
                    <canvas id="learning-chart"></canvas>
                </div>
            </div>
        `;

        // Tambahkan ke bagian konfigurasi
        configSection.appendChild(adaptivePanel);

        // Tambahkan stylesheet untuk panel
        this.addAdaptiveStylesheet();

        // Inisialisasi grafik pembelajaran
        this.initLearningChart();
    },

    // Tambahkan stylesheet untuk pembelajaran adaptif
    addAdaptiveStylesheet: function() {
        // Cek apakah stylesheet sudah ada
        if (document.getElementById('adaptive-styles')) {
            return;
        }

        // Buat style element
        const style = document.createElement('style');
        style.id = 'adaptive-styles';
        style.textContent = `
            /* Panel konfigurasi umum */
            .configuration-section {
                background-color: var(--card-bg);
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
                margin-bottom: 30px;
            }
            
            .configuration-section h2 {
                color: var(--primary-color);
                margin-bottom: 20px;
                display: flex;
                align-items: center;
            }
            
            .configuration-section h2 i {
                margin-right: 10px;
                font-size: 1.5rem;
            }
            
            .config-panel {
                background-color: #f9f9f9;
                border-radius: 8px;
                margin-bottom: 15px;
                border: 1px solid #e0e0e0;
                overflow: hidden;
            }
            
            .panel-header {
                padding: 15px;
                background-color: #f1f1f1;
                border-bottom: 1px solid #e0e0e0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .panel-header h3 {
                margin: 0;
                font-size: 1.1rem;
                color: var(--dark-color);
                display: flex;
                align-items: center;
            }
            
            .panel-header h3 i {
                margin-right: 8px;
                color: var(--primary-color);
            }
            
            .panel-content {
                padding: 15px;
            }
            
            /* Gaya untuk toggle switch */
            .switch {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
            }
            
            .switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #ccc;
                transition: .4s;
            }
            
            .slider:before {
                position: absolute;
                content: "";
                height: 16px;
                width: 16px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: .4s;
            }
            
            input:checked + .slider {
                background-color: var(--primary-color);
            }
            
            input:checked + .slider:before {
                transform: translateX(26px);
            }
            
            .slider.round {
                border-radius: 24px;
            }
            
            .slider.round:before {
                border-radius: 50%;
            }
            
            /* Gaya untuk range input */
            .config-group {
                margin-bottom: 15px;
            }
            
            .config-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                font-size: 0.9rem;
            }
            
            .range-container {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .range-container input[type="range"] {
                flex-grow: 1;
            }
            
            /* Status indicator */
            .status-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-top: 5px;
            }
            
            .indicator-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background-color: #ccc;
            }
            
            .indicator-dot.active {
                background-color: #4CAF50;
                box-shadow: 0 0 5px #4CAF50;
            }
            
            .indicator-dot.learning {
                background-color: #2196F3;
                box-shadow: 0 0 5px #2196F3;
                animation: pulse-blue 1.5s infinite;
            }
            
            @keyframes pulse-blue {
                0% {
                    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7);
                }
                70% {
                    box-shadow: 0 0 0 6px rgba(33, 150, 243, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
                }
            }
            
            /* Metrik performa */
            .performance-metrics {
                background-color: white;
                border-radius: 6px;
                padding: 15px;
                margin: 15px 0;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
            }
            
            .performance-metrics h4 {
                margin: 0 0 10px 0;
                font-size: 1rem;
                color: var(--dark-color);
            }
            
            .metrics-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }
            
            .metric-item {
                padding: 8px;
                background-color: #f5f5f5;
                border-radius: 4px;
                font-size: 0.9rem;
            }
            
            .metric-label {
                font-weight: bold;
                color: #555;
            }
            
            .metric-value {
                float: right;
                color: var(--primary-color);
                font-weight: bold;
            }
            
            /* Tombol adaptif */
            .adaptive-controls {
                display: flex;
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .adaptive-button {
                flex: 1;
                padding: 8px 12px;
                background-color: #f1f1f1;
                border: 1px solid #ddd;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.9rem;
                color: var(--dark-color);
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .adaptive-button i {
                margin-right: 5px;
            }
            
            .adaptive-button:hover {
                background-color: #e0e0e0;
            }
            
            .adaptive-button.danger {
                color: #D32F2F;
                border-color: #FFCDD2;
            }
            
            .adaptive-button.danger:hover {
                background-color: #FFEBEE;
            }
            
            /* Grafik pembelajaran */
            .learning-progress {
                margin-top: 15px;
            }
            
            .learning-progress h4 {
                margin: 0 0 10px 0;
                font-size: 1rem;
                color: var(--dark-color);
            }
            
            #learning-chart {
                height: 200px;
                width: 100%;
                background-color: white;
                border-radius: 4px;
                border: 1px solid #e0e0e0;
            }
            
            /* Modal untuk menampilkan aturan */
            .adaptive-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 1000;
                justify-content: center;
                align-items: center;
            }
            
            .modal-content {
                background-color: white;
                border-radius: 8px;
                width: 90%;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
                position: relative;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }
            
            .modal-header {
                padding: 15px;
                background-color: var(--primary-color);
                color: white;
                border-radius: 8px 8px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h3 {
                margin: 0;
                font-size: 1.2rem;
            }
            
            .modal-close {
                cursor: pointer;
                font-size: 1.5rem;
                color: white;
            }
            
            .modal-body {
                padding: 15px;
            }
            
            .rules-table {
                width: 100%;
                border-collapse: collapse;
            }
            
            .rules-table th, .rules-table td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #e0e0e0;
            }
            
            .rules-table th {
                background-color: #f5f5f5;
                font-weight: bold;
            }
            
            .rules-table tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            
            .confidence-bar {
                height: 10px;
                background-color: #e0e0e0;
                border-radius: 5px;
                position: relative;
                overflow: hidden;
            }
            
            .confidence-value {
                height: 100%;
                background-color: var(--primary-color);
                border-radius: 5px;
            }
            
            /* Responsif */
            @media (max-width: 768px) {
                .metrics-grid {
                    grid-template-columns: 1fr;
                }
                
                .adaptive-controls {
                    flex-direction: column;
                }
            }
        `;

        // Tambahkan ke head
        document.head.appendChild(style);
    },

    // Inisialisasi grafik pembelajaran
    initLearningChart: function() {
        // Cek jika Chart.js tersedia
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not available, loading from CDN...');

            // Load Chart.js dari CDN jika belum ada
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.0/chart.min.js';
            script.onload = function() {
                // Setelah loaded, buat chart
                AdaptiveLearning.createLearningChart();
            };
            document.head.appendChild(script);
        } else {
            // Buat chart jika Chart.js sudah tersedia
            this.createLearningChart();
        }
    },

    // Buat grafik pembelajaran
    createLearningChart: function() {
        const ctx = document.getElementById('learning-chart').getContext('2d');

        // Data awal kosong
        const data = {
            labels: [],
            datasets: [{
                    label: 'Performa Sistem',
                    data: [],
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Tingkat Adaptasi',
                    data: [],
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.05)',
                    tension: 0.4,
                    fill: true
                }
            ]
        };

        // Buat chart
        this.learningChart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Persentase (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Siklus Pembelajaran'
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
                    }
                }
            }
        });
    },

    // Tambahkan event listeners
    attachEventListeners: function() {
        // Event listener untuk toggle pembelajaran adaptif
        const adaptiveToggle = document.getElementById('adaptive-learning-toggle');
        if (adaptiveToggle) {
            adaptiveToggle.addEventListener('change', function() {
                AdaptiveLearning.toggleAdaptiveLearning(this.checked);
            });
        }

        // Event listener untuk slider tingkat pembelajaran
        const learningRate = document.getElementById('learning-rate');
        if (learningRate) {
            learningRate.addEventListener('input', function() {
                AdaptiveLearning.updateLearningRate(this.value);
            });
        }

        // Event listener untuk tombol lihat aturan
        const viewRulesButton = document.getElementById('view-rules');
        if (viewRulesButton) {
            viewRulesButton.addEventListener('click', function() {
                AdaptiveLearning.showRulesModal();
            });
        }

        // Event listener untuk tombol reset pembelajaran
        const resetLearningButton = document.getElementById('reset-learning');
        if (resetLearningButton) {
            resetLearningButton.addEventListener('click', function() {
                AdaptiveLearning.resetLearning();
            });
        }
    },

    // Aktifkan/nonaktifkan pembelajaran adaptif
    toggleAdaptiveLearning: function(enable) {
        this.adaptiveSystem.active = enable;

        // Perbarui UI
        const statusDot = document.getElementById('learning-status-dot');
        const statusText = document.getElementById('learning-status');

        if (enable) {
            statusDot.classList.add('active');
            statusDot.classList.add('learning');
            statusText.textContent = 'Sedang Belajar';

            // Mulai pembelajaran jika ada simulasi aktif
            this.startLearningProcess();
        } else {
            statusDot.classList.remove('active');
            statusDot.classList.remove('learning');
            statusText.textContent = 'Tidak Aktif';

            // Hentikan pembelajaran
            this.stopLearningProcess();
        }

        // Tampilkan notifikasi
        this.showNotification(`Pembelajaran adaptif ${enable ? 'diaktifkan' : 'dinonaktifkan'}`);
    },

    // Perbarui tingkat pembelajaran
    updateLearningRate: function(rate) {
        this.adaptiveSystem.learningRate = parseFloat(rate);
        document.getElementById('learning-rate-value').textContent = rate;

        if (this.adaptiveSystem.active) {
            this.showNotification(`Tingkat pembelajaran diperbarui: ${rate}`);
        }
    },

    // Mulai proses pembelajaran
    startLearningProcess: function() {
        console.log('Starting adaptive learning process...');

        // Periksa jika ada simulasi aktif
        if (typeof GreenhouseSimulation !== 'undefined' && GreenhouseSimulation.simulation.active) {
            // Ambil data awal
            this.adaptiveSystem.initialConditions = {...GreenhouseSimulation.simulation.data };

            // Mulai dengan memantau simulasi
            this.monitorSimulation();
        } else {
            this.showNotification('Tidak ada simulasi aktif untuk dipelajari', 'warning');
            this.toggleAdaptiveLearning(false);
        }
    },

    // Hentikan proses pembelajaran
    stopLearningProcess: function() {
        console.log('Stopping adaptive learning process...');

        // Hentikan interval pemantauan
        if (this.adaptiveSystem.monitorInterval) {
            clearInterval(this.adaptiveSystem.monitorInterval);
            this.adaptiveSystem.monitorInterval = null;
        }
    },

    // Pantau simulasi tanaman untuk pembelajaran
    monitorSimulation: function() {
        // Hentikan interval sebelumnya jika ada
        if (this.adaptiveSystem.monitorInterval) {
            clearInterval(this.adaptiveSystem.monitorInterval);
        }

        // Mulai interval pemantauan
        this.adaptiveSystem.monitorInterval = setInterval(() => {
            if (typeof GreenhouseSimulation !== 'undefined' && GreenhouseSimulation.simulation.active) {
                this.evaluatePerformance(GreenhouseSimulation.simulation.data);
            } else {
                // Hentikan pemantauan jika simulasi tidak aktif
                clearInterval(this.adaptiveSystem.monitorInterval);
                this.adaptiveSystem.monitorInterval = null;

                // Nonaktifkan pembelajaran
                this.toggleAdaptiveLearning(false);
            }
        }, 5000); // Pantau setiap 5 detik
    },

    // Evaluasi performa berdasarkan kondisi tanaman
    evaluatePerformance: function(plantData) {
        // Hitung skor performa berdasarkan kesehatan dan pertumbuhan tanaman
        const healthScore = plantData.plant_health;
        const growthScore = plantData.growth_rate * 100;

        // Dapatkan kondisi optimal untuk fase saat ini
        const optimalConditions = this.getOptimalConditions(plantData.plant_stage);

        // Hitung deviasi dari kondisi optimal
        const soilMoistureDeviation = Math.abs(plantData.soil_moisture - optimalConditions.soil_moisture) / 100;
        const airTemperatureDeviation = Math.abs(plantData.air_temperature - optimalConditions.air_temperature) / 40;
        const lightIntensityDeviation = Math.abs(plantData.light_intensity - optimalConditions.light_intensity) / 1000;
        const humidityDeviation = Math.abs(plantData.humidity - optimalConditions.humidity) / 100;

        // Hitung skor kondisi keseluruhan (0-100, di mana 100 adalah optimal)
        const conditionScore = 100 * (1 - (
            soilMoistureDeviation * 0.3 +
            airTemperatureDeviation * 0.25 +
            lightIntensityDeviation * 0.25 +
            humidityDeviation * 0.2
        ));

        // Skor performa keseluruhan
        const performanceScore = (healthScore * 0.5 + growthScore * 0.3 + conditionScore * 0.2);

        // Simpan data performa
        this.adaptiveSystem.performanceHistory.push({
            timestamp: new Date(),
            healthScore: healthScore,
            growthScore: growthScore,
            conditionScore: conditionScore,
            performanceScore: performanceScore,
            plant_stage: plantData.plant_stage,
            soil_moisture: plantData.soil_moisture,
            air_temperature: plantData.air_temperature,
            light_intensity: plantData.light_intensity,
            humidity: plantData.humidity
        });

        // Batasi riwayat performa ke 100 entri terakhir
        if (this.adaptiveSystem.performanceHistory.length > 100) {
            this.adaptiveSystem.performanceHistory.shift();
        }

        // Pelajari dari performa dan kondisi
        this.learnFromPerformance(performanceScore, plantData);

        // Perbarui UI dengan metrik terbaru
        this.updatePerformanceUI(performanceScore);
    },

    // Pelajari dari performa dan tanami kondisi
    learnFromPerformance: function(performanceScore, plantData) {
        // Dapatkan siklus pembelajaran saat ini
        const currentCycle = this.adaptiveSystem.performanceHistory.length;

        // Jika kurang dari 3 pengukuran, terlalu dini untuk belajar
        if (currentCycle < 3) return;

        // Ambil dua nilai performa terakhir untuk mengetahui tren
        const lastPerformance = this.adaptiveSystem.performanceHistory[currentCycle - 2].performanceScore;
        const performanceDelta = performanceScore - lastPerformance;

        // Pelajari kondisi optimal berdasarkan performa
        if (performanceScore > 75) {
            // Jika performa baik, kondisi saat ini mungkin mendekati optimal
            this.updateOptimalConditions(plantData.plant_stage, plantData);
        }

        // Buat nilai linguistik untuk kondisi saat ini
        const currentCondition = {
            soil_moisture: this.getSoilMoistureLinguistic(plantData.soil_moisture),
            air_temperature: this.getAirTemperatureLinguistic(plantData.air_temperature),
            light_intensity: this.getLightIntensityLinguistic(plantData.light_intensity),
            humidity: this.getHumidityLinguistic(plantData.humidity)
        };

        // Dapatkan aturan yang cocok dengan kondisi saat ini
        const matchingRules = this.adaptiveSystem.currentRules.filter(rule => {
            return rule.soil_moisture === currentCondition.soil_moisture &&
                rule.air_temperature === currentCondition.air_temperature &&
                rule.light_intensity === currentCondition.light_intensity &&
                rule.humidity === currentCondition.humidity;
        });

        // Jika tidak ada aturan yang cocok, tambahkan aturan baru
        if (matchingRules.length === 0) {
            this.addNewRule(currentCondition, plantData);
        } else {
            // Jika ada aturan yang cocok, perbarui tingkat kepercayaan berdasarkan performa
            matchingRules.forEach(rule => {
                const ruleId = rule.id;

                // Jika belum ada entri untuk aturan ini, inisialisasi dengan nilai default
                if (!this.adaptiveSystem.confidence[ruleId]) {
                    this.adaptiveSystem.confidence[ruleId] = 50; // Dimulai dengan kepercayaan 50%
                }

                // Hitung perubahan kepercayaan berdasarkan performa dan delta performa
                let confidenceChange = 0;

                if (performanceScore >= 80) {
                    // Performa sangat baik, tingkatkan kepercayaan
                    confidenceChange = 5 * this.adaptiveSystem.learningRate;
                } else if (performanceScore >= 60) {
                    // Performa baik, tingkatkan sedikit kepercayaan
                    confidenceChange = 2 * this.adaptiveSystem.learningRate;
                } else if (performanceScore < 40) {
                    // Performa buruk, kurangi kepercayaan
                    confidenceChange = -5 * this.adaptiveSystem.learningRate;
                } else {
                    // Performa rata-rata, perubahan kecil berdasarkan tren
                    confidenceChange = (performanceDelta > 0) ?
                        1 * this.adaptiveSystem.learningRate :
                        -1 * this.adaptiveSystem.learningRate;
                }

                // Terapkan perubahan kepercayaan
                this.adaptiveSystem.confidence[ruleId] = Math.max(0, Math.min(100,
                    this.adaptiveSystem.confidence[ruleId] + confidenceChange
                ));

                // Jika kepercayaan di bawah ambang batas, pertimbangkan menyesuaikan output aturan
                if (this.adaptiveSystem.confidence[ruleId] < 30 && performanceScore < 50) {
                    this.adjustRuleOutput(rule, plantData);
                }
            });
        }

        // Hitung metrik konvergensi
        const convergence = this.calculateConvergence();

        // Perbarui UI
        this.updateLearningChart(currentCycle, performanceScore, convergence);
        this.updateMetricUI('convergence-status', convergence.toFixed(0) + '%');
    },

    // Perbarui kondisi optimal untuk fase pertumbuhan
    updateOptimalConditions: function(plantStage, plantData) {
        // Inisialisasi jika belum ada
        if (!this.adaptiveSystem.optimalConditions[plantStage]) {
            this.adaptiveSystem.optimalConditions[plantStage] = {
                soil_moisture: plantData.soil_moisture,
                air_temperature: plantData.air_temperature,
                light_intensity: plantData.light_intensity,
                humidity: plantData.humidity,
                samples: 1
            };
        } else {
            // Perbarui dengan rolling average
            const currentOptimal = this.adaptiveSystem.optimalConditions[plantStage];
            const sampleWeight = Math.min(0.2, 1 / currentOptimal.samples);

            currentOptimal.soil_moisture = currentOptimal.soil_moisture * (1 - sampleWeight) + plantData.soil_moisture * sampleWeight;
            currentOptimal.air_temperature = currentOptimal.air_temperature * (1 - sampleWeight) + plantData.air_temperature * sampleWeight;
            currentOptimal.light_intensity = currentOptimal.light_intensity * (1 - sampleWeight) + plantData.light_intensity * sampleWeight;
            currentOptimal.humidity = currentOptimal.humidity * (1 - sampleWeight) + plantData.humidity * sampleWeight;
            currentOptimal.samples += 1;
        }
    },

    // Tambahkan aturan baru berdasarkan kondisi saat ini
    addNewRule: function(currentCondition, plantData) {
        // Output rule seharusnya mengikuti kondisi optimal untuk fase ini
        const optimalConditions = this.getOptimalConditions(plantData.plant_stage);

        // Hitung output berdasarkan kondisi optimal
        const outputRule = {
            irrigation_duration: this.calculateIdealIrrigation(plantData.soil_moisture, optimalConditions.soil_moisture),
            temperature_setting: this.calculateIdealTemperature(plantData.air_temperature, optimalConditions.air_temperature),
            light_control: this.calculateIdealLight(plantData.light_intensity, optimalConditions.light_intensity)
        };

        // Buat aturan baru
        const newRule = {
            ...currentCondition,
            ...outputRule,
            plant_stage: plantData.plant_stage,
            confidence_level: 50, // Mulai dengan kepercayaan menengah
            is_adaptive: 1
        };

        // Tambahkan ke sistem
        console.log('Adding new rule based on current conditions:', newRule);

        // Simpan ke database
        this.saveRuleToDatabase(newRule);
    },

    // Sesuaikan output aturan berdasarkan kondisi optimal
    adjustRuleOutput: function(rule, plantData) {
        // Dapatkan kondisi optimal untuk fase ini
        const optimalConditions = this.getOptimalConditions(plantData.plant_stage);

        // Hitung output yang disesuaikan
        const adjustedOutput = {
            irrigation_duration: this.calculateIdealIrrigation(plantData.soil_moisture, optimalConditions.soil_moisture),
            temperature_setting: this.calculateIdealTemperature(plantData.air_temperature, optimalConditions.air_temperature),
            light_control: this.calculateIdealLight(plantData.light_intensity, optimalConditions.light_intensity)
        };

        // Periksa apakah output perlu disesuaikan
        if (rule.irrigation_duration !== adjustedOutput.irrigation_duration ||
            rule.temperature_setting !== adjustedOutput.temperature_setting ||
            rule.light_control !== adjustedOutput.light_control) {

            // Buat aturan yang disesuaikan
            const adjustedRule = {
                ...rule,
                irrigation_duration: adjustedOutput.irrigation_duration,
                temperature_setting: adjustedOutput.temperature_setting,
                light_control: adjustedOutput.light_control,
                confidence_level: 50, // Reset kepercayaan setelah penyesuaian
                is_adaptive: 1
            };

            console.log(`Adjusting rule ${rule.id} output based on optimal conditions:`, adjustedRule);

            // Perbarui di database
            this.updateRuleInDatabase(adjustedRule);

            // Perbarui hitungan penyesuaian aturan
            const currentAdjusted = parseInt(document.getElementById('rules-adjusted').textContent) || 0;
            this.updateMetricUI('rules-adjusted', currentAdjusted + 1);
        }
    },

    // Simpan aturan ke database
    saveRuleToDatabase: function(rule) {
        // Buat form data
        const formData = new FormData();
        formData.append('command', 'save_adaptive_rule');

        // Tambahkan semua properti aturan
        for (const key in rule) {
            formData.append(key, rule[key]);
        }

        // Kirim ke server
        fetch('php/adaptive_learning.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Rule saved successfully:', data.rule_id);

                    // Tambahkan ID ke aturan dan simpan di sistem
                    rule.id = data.rule_id;
                    this.adaptiveSystem.currentRules.push(rule);

                    // Tambahkan kepercayaan awal
                    this.adaptiveSystem.confidence[data.rule_id] = rule.confidence_level;

                    // Perbarui hitungan aturan yang disesuaikan
                    const currentAdjusted = parseInt(document.getElementById('rules-adjusted').textContent) || 0;
                    this.updateMetricUI('rules-adjusted', currentAdjusted + 1);

                    // Tampilkan notifikasi
                    this.showNotification('Aturan baru ditambahkan ke sistem adaptif');
                } else {
                    console.error('Failed to save rule:', data.message);
                }
            })
            .catch(error => {
                console.error('Error saving rule to database:', error);
            });
    },

    // Perbarui aturan dalam database
    updateRuleInDatabase: function(rule) {
        // Buat form data
        const formData = new FormData();
        formData.append('command', 'update_adaptive_rule');

        // Tambahkan semua properti aturan
        for (const key in rule) {
            formData.append(key, rule[key]);
        }

        // Kirim ke server
        fetch('php/adaptive_learning.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Rule updated successfully:', rule.id);

                    // Perbarui aturan dalam sistem
                    const ruleIndex = this.adaptiveSystem.currentRules.findIndex(r => r.id === rule.id);
                    if (ruleIndex !== -1) {
                        this.adaptiveSystem.currentRules[ruleIndex] = rule;
                    }

                    // Perbarui kepercayaan
                    this.adaptiveSystem.confidence[rule.id] = rule.confidence_level;

                    // Tampilkan notifikasi
                    this.showNotification('Aturan adaptif berhasil diperbarui');
                } else {
                    console.error('Failed to update rule:', data.message);
                }
            })
            .catch(error => {
                console.error('Error updating rule in database:', error);
            });
    },

    // Muat aturan fuzzy dari database
    loadFuzzyRules: function() {
        fetch('php/adaptive_learning.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'command=get_adaptive_rules'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.adaptiveSystem.currentRules = data.rules;

                    // Inisialisasi kepercayaan untuk semua aturan
                    data.rules.forEach(rule => {
                        this.adaptiveSystem.confidence[rule.id] = rule.confidence_level || 50;
                    });

                    console.log(`Loaded ${data.rules.length} fuzzy rules for adaptive learning`);
                } else {
                    console.error('Failed to load fuzzy rules:', data.message);
                }
            })
            .catch(error => {
                console.error('Error loading fuzzy rules:', error);
            });
    },

    // Reset pembelajaran
    resetLearning: function() {
        // Konfirmasi reset
        if (!confirm('Apakah Anda yakin ingin mereset semua pembelajaran adaptif?')) {
            return;
        }

        // Reset data adaptif
        this.adaptiveSystem.performanceHistory = [];
        this.adaptiveSystem.optimalConditions = {};
        this.adaptiveSystem.confidence = {};

        // Reset UI
        this.updateMetricUI('learning-cycles', 0);
        this.updateMetricUI('rules-adjusted', 0);
        this.updateMetricUI('system-performance', '0%');
        this.updateMetricUI('convergence-status', '0%');

        // Reset grafik
        if (this.learningChart) {
            this.learningChart.data.labels = [];
            this.learningChart.data.datasets[0].data = [];
            this.learningChart.data.datasets[1].data = [];
            this.learningChart.update();
        }

        // Muat ulang aturan
        this.loadFuzzyRules();

        // Tampilkan notifikasi
        this.showNotification('Sistem pembelajaran adaptif telah direset', 'warning');
    },

    // Tampilkan modal untuk melihat aturan yang disesuaikan
    showRulesModal: function() {
        // Cek jika modal sudah ada
        let modalElement = document.querySelector('.adaptive-modal');

        if (!modalElement) {
            // Buat modal
            modalElement = document.createElement('div');
            modalElement.className = 'adaptive-modal';
            modalElement.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Aturan Fuzzy Adaptif</h3>
                        <span class="modal-close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div id="rules-container">
                            <table class="rules-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Kelembaban Tanah</th>
                                        <th>Suhu Udara</th>
                                        <th>Intensitas Cahaya</th>
                                        <th>Kelembaban Udara</th>
                                        <th>Irigasi</th>
                                        <th>Suhu</th>
                                        <th>Cahaya</th>
                                        <th>Kepercayaan</th>
                                    </tr>
                                </thead>
                                <tbody id="rules-table-body">
                                    <!-- Aturan akan diisi di sini -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            // Tambahkan ke body
            document.body.appendChild(modalElement);

            // Tambahkan event listener untuk menutup modal
            modalElement.querySelector('.modal-close').addEventListener('click', function() {
                modalElement.style.display = 'none';
            });

            // Tutup jika klik di luar modal
            modalElement.addEventListener('click', function(event) {
                if (event.target === modalElement) {
                    modalElement.style.display = 'none';
                }
            });
        }

        // Isi tabel dengan aturan adaptif
        const rulesTableBody = modalElement.querySelector('#rules-table-body');
        rulesTableBody.innerHTML = '';

        // Ambil aturan adaptif (is_adaptive = 1)
        const adaptiveRules = this.adaptiveSystem.currentRules.filter(rule => rule.is_adaptive == 1);

        if (adaptiveRules.length === 0) {
            rulesTableBody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 20px;">
                        Belum ada aturan adaptif yang dibuat. Sistem akan belajar seiring waktu.
                    </td>
                </tr>
            `;
        } else {
            adaptiveRules.forEach(rule => {
                const confidence = this.adaptiveSystem.confidence[rule.id] || 50;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${rule.id}</td>
                    <td>${capitalizeFirstLetter(rule.soil_moisture)}</td>
                    <td>${capitalizeFirstLetter(rule.air_temperature)}</td>
                    <td>${capitalizeFirstLetter(rule.light_intensity)}</td>
                    <td>${capitalizeFirstLetter(rule.humidity)}</td>
                    <td>${capitalizeFirstLetter(rule.irrigation_duration)}</td>
                    <td>${capitalizeFirstLetter(rule.temperature_setting)}</td>
                    <td>${capitalizeFirstLetter(rule.light_control)}</td>
                    <td>
                        <div class="confidence-bar">
                            <div class="confidence-value" style="width: ${confidence}%"></div>
                        </div>
                        ${confidence.toFixed(0)}%
                    </td>
                `;

                rulesTableBody.appendChild(row);
            });
        }

        // Tampilkan modal
        modalElement.style.display = 'flex';
    },

    // Perbarui UI metrik performa
    updatePerformanceUI: function(performanceScore) {
        // Perbarui metrik
        this.updateMetricUI('learning-cycles', this.adaptiveSystem.performanceHistory.length);
        this.updateMetricUI('system-performance', performanceScore.toFixed(0) + '%');
    },

    // Perbarui grafik pembelajaran
    updateLearningChart: function(cycle, performance, convergence) {
        if (!this.learningChart) return;

        // Tambahkan label siklus
        this.learningChart.data.labels.push(cycle);

        // Tambahkan data performa
        this.learningChart.data.datasets[0].data.push(performance);

        // Tambahkan data konvergensi
        this.learningChart.data.datasets[1].data.push(convergence);

        // Batasi data grafik ke 20 titik terakhir untuk performa
        if (this.learningChart.data.labels.length > 20) {
            this.learningChart.data.labels.shift();
            this.learningChart.data.datasets[0].data.shift();
            this.learningChart.data.datasets[1].data.shift();
        }

        // Perbarui grafik
        this.learningChart.update();
    },

    // Perbarui elemen UI untuk metrik
    updateMetricUI: function(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    },

    // Hitung konvergensi pembelajaran adaptif
    calculateConvergence: function() {
        // Jika tidak ada kepercayaan, konvergensi 0
        if (Object.keys(this.adaptiveSystem.confidence).length === 0) {
            return 0;
        }

        // Hitung rata-rata kepercayaan
        let totalConfidence = 0;
        let count = 0;

        for (const ruleId in this.adaptiveSystem.confidence) {
            totalConfidence += this.adaptiveSystem.confidence[ruleId];
            count++;
        }

        // Konvergensi adalah rata-rata kepercayaan
        return count > 0 ? totalConfidence / count : 0;
    },

    // Dapatkan kondisi optimal untuk fase pertumbuhan
    getOptimalConditions: function(plantStage) {
        // Jika sudah ada kondisi optimal yang dipelajari, gunakan itu
        if (this.adaptiveSystem.optimalConditions[plantStage]) {
            return this.adaptiveSystem.optimalConditions[plantStage];
        }

        // Jika tidak, gunakan kondisi optimal default
        switch (plantStage) {
            case 'seedling':
                return {
                    soil_moisture: 60,
                    air_temperature: 24,
                    light_intensity: 400,
                    humidity: 70
                };
            case 'vegetative':
                return {
                    soil_moisture: 55,
                    air_temperature: 25,
                    light_intensity: 600,
                    humidity: 65
                };
            case 'flowering':
                return {
                    soil_moisture: 50,
                    air_temperature: 23,
                    light_intensity: 700,
                    humidity: 60
                };
            case 'fruiting':
                return {
                    soil_moisture: 55,
                    air_temperature: 22,
                    light_intensity: 650,
                    humidity: 55
                };
            case 'harvesting':
                return {
                    soil_moisture: 45,
                    air_temperature: 21,
                    light_intensity: 600,
                    humidity: 50
                };
            default:
                return {
                    soil_moisture: 50,
                    air_temperature: 23,
                    light_intensity: 500,
                    humidity: 60
                };
        }
    },

    // Helper functions untuk mengubah nilai ke linguistik
    getSoilMoistureLinguistic: function(value) {
        if (value < 30) return 'kering';
        if (value < 60) return 'sedang';
        return 'basah';
    },

    getAirTemperatureLinguistic: function(value) {
        if (value < 15) return 'dingin';
        if (value < 25) return 'sedang';
        return 'panas';
    },

    getLightIntensityLinguistic: function(value) {
        if (value < 300) return 'rendah';
        if (value < 600) return 'sedang';
        return 'tinggi';
    },

    getHumidityLinguistic: function(value) {
        if (value < 30) return 'rendah';
        if (value < 60) return 'sedang';
        return 'tinggi';
    },

    // Hitung irigasi ideal berdasarkan kelembaban tanah
    calculateIdealIrrigation: function(current, optimal) {
        if (current >= optimal + 15) return 'tidak_ada';
        if (current >= optimal - 5) return 'singkat';
        if (current >= optimal - 15) return 'sedang';
        return 'lama';
    },

    // Hitung suhu ideal berdasarkan suhu saat ini
    calculateIdealTemperature: function(current, optimal) {
        if (current >= optimal + 5) return 'menurunkan';
        if (current <= optimal - 5) return 'menaikkan';
        return 'mempertahankan';
    },

    // Hitung cahaya ideal berdasarkan intensitas cahaya
    calculateIdealLight: function(current, optimal) {
        if (current >= optimal + 200) return 'mati';
        if (current >= optimal + 100) return 'redup';
        if (current >= optimal - 100) return 'sedang';
        return 'terang';
    },

    // Tampilkan notifikasi
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
    }
};

// Fungsi untuk kapitalisasi huruf pertama
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Inisialisasi saat dokumen selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi sistem pembelajaran adaptif
    setTimeout(() => {
        AdaptiveLearning.initialize();
    }, 1000); // Delay untuk memastikan semua elemen UI telah dimuat
});