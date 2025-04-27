/**
 * greenhouse_simulation.js
 * 
 * Simulasi visual greenhouse/lahan pertanian
 * dengan visualisasi pertumbuhan tanaman dan kondisi lingkungan
 */

const GreenhouseSimulation = {
    // Status simulasi
    simulation: {
        active: false,
        id: null,
        data: null,
        timeSpeed: 1, // 1 = normal, 2 = cepat, 0.5 = lambat
        adaptiveMode: false,
        environmentUpdateInterval: null,
        timeUpdateInterval: null,
        plantUpdateInterval: null
    },

    // Inisialisasi simulasi
    initialize: function() {
        console.log('Initializing greenhouse simulation...');

        // Tambahkan bagian simulasi ke halaman
        this.createSimulationSection();

        // Tambahkan event listeners
        this.attachEventListeners();

        // Cek apakah ada simulasi yang aktif
        this.checkActiveSimulation();
    },

    // Buat bagian simulasi
    createSimulationSection: function() {
        const simulationSection = document.createElement('div');
        simulationSection.className = 'simulation-container';
        simulationSection.innerHTML = `
            <h2><i class="fas fa-seedling"></i> Simulasi Lingkungan Tanaman Tomat</h2>
            <div class="simulation-grid">
                <!-- Area visualisasi greenhouse -->
                <div class="greenhouse-visualization">
                    <!-- Background elements -->
                    <div class="sky-bg"></div>
                    <div class="ground-bg"></div>
                    
                    <!-- Greenhouse structure -->
                    <div class="greenhouse">
                        <div class="greenhouse-roof"></div>
                    </div>
                    
                    <!-- Weather elements -->
                    <div class="sun"></div>
                    <div class="cloud one"></div>
                    <div class="cloud two"></div>
                    <div class="rain" id="rain-container"></div>
                    
                    <!-- Plant container -->
                    <div class="plant-container">
                        <div class="plant">
                            <div class="pot"></div>
                            <div class="soil"></div>
                            <div class="stem" id="plant-stem"></div>
                            <!-- Leaves dan fruits akan ditambahkan secara dinamis -->
                        </div>
                    </div>
                    
                    <!-- Environment indicators -->
                    <div class="environment-indicators">
                        <div class="indicator moisture">
                            <i class="fas fa-tint"></i>
                            <span id="soil-moisture-indicator">Kelembaban Tanah: 50%</span>
                        </div>
                        <div class="indicator temperature">
                            <i class="fas fa-thermometer-half"></i>
                            <span id="temperature-indicator">Suhu: 25°C</span>
                        </div>
                        <div class="indicator light">
                            <i class="fas fa-sun"></i>
                            <span id="light-indicator">Cahaya: 500 lux</span>
                        </div>
                        <div class="indicator humidity">
                            <i class="fas fa-water"></i>
                            <span id="humidity-indicator">Kelembaban Udara: 60%</span>
                        </div>
                    </div>
                    
                    <!-- Plant info -->
                    <div class="plant-info">
                        <h4>Status Tanaman</h4>
                        <p id="plant-stage">Fase: Bibit</p>
                        <p id="plant-days">Usia: 0 hari</p>
                        <p id="plant-height">Tinggi: 5 cm</p>
                        <p id="plant-health">Kesehatan: 100%</p>
                        <div class="health-bar">
                            <div class="health-indicator good" id="health-bar" style="width: 100%;"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Panel kontrol simulasi -->
                <div class="simulation-controls">
                    <div class="simulation-controller">
                        <div class="controller-header">
                            <h3>Kontrol Simulasi</h3>
                            <div class="time-controls">
                                <button id="time-slower" title="Perlambat waktu"><i class="fas fa-minus"></i></button>
                                <span id="time-speed">1x</span>
                                <button id="time-faster" title="Percepat waktu"><i class="fas fa-plus"></i></button>
                            </div>
                        </div>
                        
                        <button id="start-simulation" class="sim-button">
                            <i class="fas fa-play"></i> Mulai Simulasi Baru
                        </button>
                        
                        <button id="advance-time" class="sim-button" disabled>
                            <i class="fas fa-forward"></i> Maju 1 Hari
                        </button>
                        
                        <button id="toggle-adaptive" class="sim-button adapt" disabled>
                            <i class="fas fa-brain"></i> Mode Adaptif <span id="adaptive-status">OFF</span>
                        </button>
                        
                        <button id="reset-simulation" class="sim-button reset" disabled>
                            <i class="fas fa-undo"></i> Reset Simulasi
                        </button>
                    </div>
                    
                    <!-- Status panel -->
                    <div class="status-panel">
                        <h4>Informasi Simulasi</h4>
                        <div class="status-item">
                            <span class="status-label">Tanggal:</span>
                            <span class="status-value" id="sim-date">-</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">Varietas:</span>
                            <span class="status-value" id="sim-variety">-</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">Tingkat Pertumbuhan:</span>
                            <span class="status-value" id="sim-growth-rate">-</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">Jumlah Buah:</span>
                            <span class="status-value" id="sim-fruit-count">-</span>
                        </div>
                    </div>
                    
                    <!-- Stage progress -->
                    <div class="stage-progress">
                        <h4>Kemajuan Pertumbuhan</h4>
                        <div class="progress-track">
                            <div class="stage-point" id="stage-seedling">
                                <div class="stage-point-marker"></div>
                                <div class="stage-point-label">Bibit</div>
                            </div>
                            <div class="stage-point" id="stage-vegetative">
                                <div class="stage-point-marker"></div>
                                <div class="stage-point-label">Vegetatif</div>
                            </div>
                            <div class="stage-point" id="stage-flowering">
                                <div class="stage-point-marker"></div>
                                <div class="stage-point-label">Berbunga</div>
                            </div>
                            <div class="stage-point" id="stage-fruiting">
                                <div class="stage-point-marker"></div>
                                <div class="stage-point-label">Berbuah</div>
                            </div>
                            <div class="stage-point" id="stage-harvesting">
                                <div class="stage-point-marker"></div>
                                <div class="stage-point-label">Panen</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // FIX: Use the placeholder directly instead of trying to insert in the DOM
        const placeholder = document.getElementById('simulation-container-placeholder');
        if (placeholder) {
            // Replace the placeholder with the simulation section
            placeholder.replaceWith(simulationSection);
        } else {
            // Fallback: find container and append
            const container = document.querySelector('.container');
            if (container) {
                container.appendChild(simulationSection);
            } else {
                console.error('Cannot find container element to attach simulation');
            }
        }

        // Tambahkan stylesheet
        this.addSimulationStylesheet();
    },

    // Tambahkan stylesheet untuk simulasi
    addSimulationStylesheet: function() {
        // Cek apakah stylesheet sudah ada
        if (document.getElementById('simulation-styles')) {
            return;
        }

        // Buat link element untuk stylesheet
        const linkElement = document.createElement('link');
        linkElement.id = 'simulation-styles';
        linkElement.rel = 'stylesheet';
        linkElement.href = 'css/simulation_style.css';

        // Tambahkan ke head
        document.head.appendChild(linkElement);
    },

    // Tambahkan event listeners
    attachEventListeners: function() {
        // Kontrol waktu
        const timeSlower = document.getElementById('time-slower');
        const timeFaster = document.getElementById('time-faster');

        if (timeSlower) {
            timeSlower.addEventListener('click', function() {
                GreenhouseSimulation.adjustTimeSpeed(-0.5);
            });
        }

        if (timeFaster) {
            timeFaster.addEventListener('click', function() {
                GreenhouseSimulation.adjustTimeSpeed(0.5);
            });
        }

        // Start simulation
        const startSimBtn = document.getElementById('start-simulation');
        if (startSimBtn) {
            startSimBtn.addEventListener('click', function() {
                GreenhouseSimulation.startNewSimulation();
            });
        }

        // Advance time
        const advanceTimeBtn = document.getElementById('advance-time');
        if (advanceTimeBtn) {
            advanceTimeBtn.addEventListener('click', function() {
                GreenhouseSimulation.advanceSimulationTime(1);
            });
        }

        // Toggle adaptive mode
        const toggleAdaptiveBtn = document.getElementById('toggle-adaptive');
        if (toggleAdaptiveBtn) {
            toggleAdaptiveBtn.addEventListener('click', function() {
                GreenhouseSimulation.toggleAdaptiveMode();
            });
        }

        // Reset simulation
        const resetSimBtn = document.getElementById('reset-simulation');
        if (resetSimBtn) {
            resetSimBtn.addEventListener('click', function() {
                GreenhouseSimulation.resetSimulation();
            });
        }
    },

    // Periksa apakah ada simulasi aktif
    checkActiveSimulation: function() {
        // Tampilkan loading
        this.showLoading();

        // Kirim permintaan ke server
        fetch('php/plant_simulation.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'command=get_plant_state'
            })
            .then(response => response.json())
            .then(data => {
                // Sembunyikan loading
                this.hideLoading();

                // Periksa apakah ada simulasi aktif
                if (data.success && data.simulation_data) {
                    // Aktifkan simulasi
                    this.simulation.active = true;
                    this.simulation.id = data.simulation_data.id;
                    this.simulation.data = data.simulation_data;

                    // Perbarui UI
                    this.updateSimulationUI();

                    // Aktifkan tombol
                    const advanceTimeBtn = document.getElementById('advance-time');
                    const toggleAdaptiveBtn = document.getElementById('toggle-adaptive');
                    const resetSimBtn = document.getElementById('reset-simulation');

                    if (advanceTimeBtn) advanceTimeBtn.disabled = false;
                    if (toggleAdaptiveBtn) toggleAdaptiveBtn.disabled = false;
                    if (resetSimBtn) resetSimBtn.disabled = false;

                    // Perbarui tombol mulai
                    const startSimBtn = document.getElementById('start-simulation');
                    if (startSimBtn) {
                        startSimBtn.innerHTML = `<i class="fas fa-sync"></i> Muat Ulang Data`;
                    }

                    // Perbarui tampilan simulasi
                    this.updateEnvironmentVisualization();
                    this.updatePlantVisualization();
                }
            })
            .catch(error => {
                console.error('Error checking active simulation:', error);
                this.hideLoading();
            });
    },

    startTimeUpdateInterval: function() {
        // Hentikan interval sebelumnya jika ada
        if (this.simulation.timeUpdateInterval) {
            clearInterval(this.simulation.timeUpdateInterval);
        }
    
        // Buat interval baru untuk memajukan waktu
        this.simulation.timeUpdateInterval = setInterval(() => {
            // Pastikan simulasi aktif dan mode adaptif aktif
            if (this.simulation.active && this.simulation.adaptiveMode) {
                // Maju 1 hari sesuai kecepatan waktu
                const daysToAdvance = this.simulation.timeSpeed;
                this.advanceSimulationTime(daysToAdvance);
            }
        }, 5000); // Interval 5 detik, sesuaikan kebutuhan
    },


    // Mulai simulasi baru
    startNewSimulation: function() {
        // Tampilkan loading
        this.showLoading();
        this.startTimeUpdateInterval();
        // Buat nama tanaman acak
        const plantNames = ["Roma", "Cherry", "Beef", "Plum", "Grape", "Heirloom"];
        const randomName = plantNames[Math.floor(Math.random() * plantNames.length)];

        // Kirim permintaan ke server
        fetch('php/plant_simulation.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `command=init_simulation&name=Tomat&variety=${randomName}&start_date=${new Date().toISOString().split('T')[0]}`
            })
            .then(response => response.json())
            .then(data => {
                // Sembunyikan loading
                this.hideLoading();

                if (data.success) {
                    // Aktifkan simulasi
                    this.simulation.active = true;
                    this.simulation.id = data.simulation_id;
                    this.simulation.data = data.simulation_data;
                    this.startTimeUpdateInterval();

                    // Perbarui UI
                    this.updateSimulationUI();

                    // Aktifkan tombol
                    const advanceTimeBtn = document.getElementById('advance-time');
                    const toggleAdaptiveBtn = document.getElementById('toggle-adaptive');
                    const resetSimBtn = document.getElementById('reset-simulation');

                    if (advanceTimeBtn) advanceTimeBtn.disabled = false;
                    if (toggleAdaptiveBtn) toggleAdaptiveBtn.disabled = false;
                    if (resetSimBtn) resetSimBtn.disabled = false;

                    // Perbarui tombol mulai
                    const startSimBtn = document.getElementById('start-simulation');
                    if (startSimBtn) {
                        startSimBtn.innerHTML = `<i class="fas fa-sync"></i> Muat Ulang Data`;
                    }

                    // Perbarui tampilan simulasi
                    this.updateEnvironmentVisualization();
                    this.updatePlantVisualization();

                    // Tampilkan notifikasi
                    this.showNotification('Simulasi baru berhasil dibuat!', 'success');
                } else {
                    this.showNotification('Gagal membuat simulasi baru: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error starting new simulation:', error);
                this.hideLoading();
                this.showNotification('Error: ' + error.message, 'error');
            });
    },

    // Majukan waktu simulasi
    advanceSimulationTime: function(days) {
        if (!this.simulation.active || !this.simulation.id) {
            this.showNotification('Tidak ada simulasi aktif', 'error');
            return;
        }

        // Tampilkan loading
        this.showLoading();

        // Kirim permintaan ke server
        fetch('php/plant_simulation.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `command=advance_time&simulation_id=${this.simulation.id}&days=${days}`
            })
            .then(response => response.json())
            .then(data => {
                // Sembunyikan loading
                this.hideLoading();

                if (data.success) {
                    // Perbarui data simulasi
                    this.simulation.data = data.simulation_data;
                    this.startTimeUpdateInterval();

                    // Perbarui UI
                    this.updateSimulationUI();

                    // Perbarui tampilan simulasi
                    this.updateEnvironmentVisualization();
                    this.updatePlantVisualization();

                    // Tampilkan notifikasi
                    this.showNotification(`Simulasi dimajukan ${days} hari`, 'success');
                } else {
                    this.showNotification('Gagal memajukan waktu: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error advancing time:', error);
                this.hideLoading();
                this.showNotification('Error: ' + error.message, 'error');
            });
    },

    // Toggle mode adaptif
    toggleAdaptiveMode: function() {
        this.simulation.adaptiveMode = !this.simulation.adaptiveMode;

        // Perbarui tampilan
        const adaptiveStatus = document.getElementById('adaptive-status');
        if (adaptiveStatus) {
            adaptiveStatus.textContent = this.simulation.adaptiveMode ? 'ON' : 'OFF';
        }

        const toggleButton = document.getElementById('toggle-adaptive');
        if (toggleButton) {
            toggleButton.classList.toggle('active', this.simulation.adaptiveMode);
        }

        // Jika mode adaptif diaktifkan, mulai interval
        if (this.simulation.adaptiveMode) {
            this.startTimeUpdateInterval();
        } else {
            // Hentikan interval jika dinonaktifkan
            if (this.simulation.timeUpdateInterval) {
                clearInterval(this.simulation.timeUpdateInterval);
                this.simulation.timeUpdateInterval = null;
            }
        }

        // Tampilkan notifikasi
        this.showNotification(`Mode adaptif ${this.simulation.adaptiveMode ? 'diaktifkan' : 'dinonaktifkan'}`, 'info');
    },

    // Reset simulasi
    resetSimulation: function() {
        if (!this.simulation.active || !this.simulation.id) {
            this.showNotification('Tidak ada simulasi aktif', 'error');
            return;
        }

        // Konfirmasi reset
        if (!confirm('Apakah Anda yakin ingin mereset simulasi ini? Semua kemajuan akan hilang.')) {
            return;
        }

        // Tampilkan loading
        this.showLoading();

        // Kirim permintaan ke server
        fetch('php/plant_simulation.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `command=reset_simulation&simulation_id=${this.simulation.id}`
            })
            .then(response => response.json())
            .then(data => {
                // Sembunyikan loading
                this.hideLoading();

                if (data.success) {
                    // Perbarui data simulasi
                    this.simulation.data = data.simulation_data;
                    this.startTimeUpdateInterval();

                    // Perbarui UI
                    this.updateSimulationUI();

                    // Reset mode adaptif
                    this.simulation.adaptiveMode = false;
                    const adaptiveStatus = document.getElementById('adaptive-status');
                    if (adaptiveStatus) {
                        adaptiveStatus.textContent = 'OFF';
                    }

                    const toggleButton = document.getElementById('toggle-adaptive');
                    if (toggleButton) {
                        toggleButton.classList.remove('active');
                    }

                    // Perbarui tampilan simulasi
                    this.updateEnvironmentVisualization();
                    this.updatePlantVisualization();

                    // Tampilkan notifikasi
                    this.showNotification('Simulasi berhasil direset', 'success');
                } else {
                    this.showNotification('Gagal mereset simulasi: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error resetting simulation:', error);
                this.hideLoading();
                this.showNotification('Error: ' + error.message, 'error');
            });
    },

    // Sesuaikan kecepatan waktu
    adjustTimeSpeed: function(change) {
        // Kecepatan waktu: 0.5, 1, 1.5, 2, 2.5, 3
        const newSpeed = Math.max(0.5, Math.min(3, this.simulation.timeSpeed + change));
        this.simulation.timeSpeed = newSpeed;

        // Perbarui tampilan
        const timeSpeedElement = document.getElementById('time-speed');
        if (timeSpeedElement) {
            timeSpeedElement.textContent = newSpeed + 'x';
        }
    },

    // Perbarui UI simulasi
    updateSimulationUI: function() {
        if (!this.simulation.data) return;

        const data = this.simulation.data;

        // Perbarui informasi tanaman
        const plantStageElement = document.getElementById('plant-stage');
        const plantDaysElement = document.getElementById('plant-days');
        const plantHeightElement = document.getElementById('plant-height');
        const plantHealthElement = document.getElementById('plant-health');
        console.log("Triggering simulation-updated event");
        const updateEvent = new Event('simulation-updated');
        document.dispatchEvent(updateEvent);


        if (plantStageElement) plantStageElement.textContent = `Fase: ${this.getPlantStageText(data.plant_stage)}`;
        if (plantDaysElement) plantDaysElement.textContent = `Usia: ${data.days_since_start} hari`;
        if (plantHeightElement) plantHeightElement.textContent = `Tinggi: ${data.plant_height} cm`;
        if (plantHealthElement) plantHealthElement.textContent = `Kesehatan: ${Math.round(data.plant_health)}%`;
        
        // Perbarui health bar
        const healthBar = document.getElementById('health-bar');
        if (healthBar) {
            healthBar.style.width = `${data.plant_health}%`;
            healthBar.classList.remove('good', 'warning', 'danger');
            if (data.plant_health >= 70) {
                healthBar.classList.add('good');
            } else if (data.plant_health >= 40) {
                healthBar.classList.add('warning');
            } else {
                healthBar.classList.add('danger');
            }
        }

        // Perbarui informasi lingkungan
        const soilMoistureIndicator = document.getElementById('soil-moisture-indicator');
        const temperatureIndicator = document.getElementById('temperature-indicator');
        const lightIndicator = document.getElementById('light-indicator');
        const humidityIndicator = document.getElementById('humidity-indicator');

        if (soilMoistureIndicator) soilMoistureIndicator.textContent = `Kelembaban Tanah: ${Math.round(data.soil_moisture)}%`;
        if (temperatureIndicator) temperatureIndicator.textContent = `Suhu: ${data.air_temperature}°C`;
        if (lightIndicator) lightIndicator.textContent = `Cahaya: ${data.light_intensity} lux`;
        if (humidityIndicator) humidityIndicator.textContent = `Kelembaban Udara: ${Math.round(data.humidity)}%`;

        // Perbarui informasi simulasi
        const simDateElement = document.getElementById('sim-date');
        const simVarietyElement = document.getElementById('sim-variety');
        const simGrowthRateElement = document.getElementById('sim-growth-rate');
        const simFruitCountElement = document.getElementById('sim-fruit-count');

        if (simDateElement) simDateElement.textContent = this.formatDate(data.current_date);
        if (simVarietyElement) simVarietyElement.textContent = data.variety;
        if (simGrowthRateElement) simGrowthRateElement.textContent = `${(data.growth_rate * 100).toFixed(0)}%`;
        if (simFruitCountElement) simFruitCountElement.textContent = data.fruit_count || 0;

        // Perbarui progress stage
        this.updateStageProgress(data.plant_stage);
    },

    // Perbarui visualisasi lingkungan
    updateEnvironmentVisualization: function() {
        if (!this.simulation.data) return;

        const data = this.simulation.data;

        // Perbarui kelembaban tanah
        const soil = document.querySelector('.soil');
        if (soil) {
            soil.classList.remove('dry', 'moist', 'wet');
            if (data.soil_moisture < 30) {
                soil.classList.add('dry');
            } else if (data.soil_moisture < 60) {
                soil.classList.add('moist');
            } else {
                soil.classList.add('wet');
            }
        }

        // Perbarui suhu (warna langit)
        const skyBg = document.querySelector('.sky-bg');
        if (skyBg) {
            let skyColor;
            if (data.air_temperature < 15) {
                skyColor = 'linear-gradient(to bottom, #B3E5FC, #E1F5FE)'; // Dingin
            } else if (data.air_temperature < 25) {
                skyColor = 'linear-gradient(to bottom, #87CEEB, #E0F7FA)'; // Sedang
            } else {
                skyColor = 'linear-gradient(to bottom, #64B5F6, #BBDEFB)'; // Panas
            }
            skyBg.style.background = skyColor;
        }

        // Perbarui intensitas cahaya (ukuran dan kecerahan matahari)
        const sun = document.querySelector('.sun');
        if (sun) {
            const brightness = Math.min(100, data.light_intensity / 10);
            const size = 40 + (data.light_intensity / 1000 * 40); // 40-80px
            sun.style.width = `${size}px`;
            sun.style.height = `${size}px`;
            sun.style.boxShadow = `0 0 ${brightness}px #FFD54F`;
        }

        // Tampilkan hujan jika kelembaban udara tinggi
        this.updateRain(data.humidity);
    },

    // Perbarui visualisasi tanaman
    updatePlantVisualization: function() {
        if (!this.simulation.data) return;

        const data = this.simulation.data;

        // Hapus daun dan buah yang ada
        document.querySelectorAll('.leaf, .fruit').forEach(el => el.remove());

        // Perbarui tinggi batang
        const stem = document.getElementById('plant-stem');
        if (stem) {
            const stemHeight = Math.min(300, data.plant_height * 3); // Maksimal 300px
            stem.style.height = `${stemHeight}px`;

            // Perbarui warna batang berdasarkan kesehatan
            if (data.plant_health < 40) {
                stem.style.backgroundColor = '#9E9D24'; // Kuning-hijau sakit
            } else if (data.plant_health < 70) {
                stem.style.backgroundColor = '#7CB342'; // Hijau sedang
            } else {
                stem.style.backgroundColor = '#558B2F'; // Hijau sehat
            }

            // Tambahkan daun berdasarkan fase dan tinggi
            const leafCount = this.getLeafCount(data.plant_stage, data.plant_height);
            const plant = document.querySelector('.plant');

            if (plant) {
                for (let i = 0; i < leafCount; i++) {
                    const leafPair = document.createElement('div');
                    leafPair.style.position = 'absolute';
                    leafPair.style.bottom = `${80 + (i * stemHeight / leafCount)}px`;
                    leafPair.style.width = '100%';
                    leafPair.style.zIndex = '8';

                    // Daun kiri
                    const leftLeaf = document.createElement('div');
                    leftLeaf.className = `leaf left ${data.plant_health < 60 ? 'sick' : ''}`;

                    // Daun kanan
                    const rightLeaf = document.createElement('div');
                    rightLeaf.className = `leaf right ${data.plant_health < 60 ? 'sick' : ''}`;

                    // Ukuran daun bervariasi berdasarkan posisi
                    const leafSizeFactor = 0.7 + (i / leafCount) * 0.6;
                    leftLeaf.style.width = `${30 * leafSizeFactor}px`;
                    leftLeaf.style.height = `${15 * leafSizeFactor}px`;
                    rightLeaf.style.width = `${30 * leafSizeFactor}px`;
                    rightLeaf.style.height = `${15 * leafSizeFactor}px`;

                    leafPair.appendChild(leftLeaf);
                    leafPair.appendChild(rightLeaf);
                    plant.appendChild(leafPair);
                }

                // Tambahkan buah jika fase berbuah atau panen
                if (data.plant_stage === 'fruiting' || data.plant_stage === 'harvesting') {
                    const fruitCount = Math.min(8, data.fruit_count); // Tampilkan maksimal 8 buah pada visual

                    for (let i = 0; i < fruitCount; i++) {
                        const fruit = document.createElement('div');
                        fruit.className = `fruit ${data.plant_stage === 'fruiting' && i % 3 === 0 ? 'green' : ''}`;

                        // Posisi buah
                        const verticalPos = 80 + (stemHeight * 0.5) + (i % 3) * 30;
                        const horizontalPos = (i % 2 === 0) ? -20 : 20;

                        fruit.style.bottom = `${verticalPos}px`;
                        fruit.style.left = `${horizontalPos}px`;
                        fruit.style.animationDelay = `${i * 0.2}s`;

                        plant.appendChild(fruit);
                    }
                }
            }
        }
    },

    // Perbarui visualisasi hujan
    updateRain: function(humidity) {
        const rainContainer = document.getElementById('rain-container');
        if (!rainContainer) return;

        // Bersihkan container hujan
        rainContainer.innerHTML = '';

        // Jika kelembaban tinggi, tambahkan hujan
        if (humidity > 75) {
            rainContainer.style.display = 'block';

            // Tambahkan tetesan hujan
            const raindropsCount = Math.floor((humidity - 75) / 5) * 10; // 10-50 tetesan

            for (let i = 0; i < raindropsCount; i++) {
                const raindrop = document.createElement('div');
                raindrop.className = 'raindrop';
                raindrop.style.left = `${Math.random() * 100}%`;
                raindrop.style.animationDelay = `${Math.random() * 1}s`;
                raindrop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;

                rainContainer.appendChild(raindrop);
            }
        } else {
            rainContainer.style.display = 'none';
        }
    },

    // Perbarui progress tahap pertumbuhan
    updateStageProgress: function(currentStage) {
        const stages = ['seedling', 'vegetative', 'flowering', 'fruiting', 'harvesting'];
        const currentIndex = stages.indexOf(currentStage);

        // Reset semua stages
        stages.forEach(stage => {
            const stageElement = document.getElementById(`stage-${stage}`);
            if (stageElement) {
                stageElement.classList.remove('active', 'completed');
            }
        });

        // Set tahap sebelumnya sebagai completed
        for (let i = 0; i < currentIndex; i++) {
            const stageElement = document.getElementById(`stage-${stages[i]}`);
            if (stageElement) {
                stageElement.classList.add('completed');
            }
        }

        // Set tahap saat ini sebagai active
        const currentStageElement = document.getElementById(`stage-${currentStage}`);
        if (currentStageElement) {
            currentStageElement.classList.add('active');
        }
    },

    // Helper: Dapatkan teks tahap pertumbuhan
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

    // Helper: Dapatkan jumlah daun berdasarkan fase dan tinggi
    getLeafCount: function(stage, height) {
        switch (stage) {
            case 'seedling':
                return Math.min(2, Math.floor(height / 5));
            case 'vegetative':
                return Math.min(8, Math.floor(height / 10));
            case 'flowering':
                return Math.min(12, Math.floor(height / 10));
            case 'fruiting':
                return Math.min(16, Math.floor(height / 8));
            case 'harvesting':
                return Math.min(20, Math.floor(height / 7));
            default:
                return 4;
        }
    },

    // Helper: Format tanggal
    formatDate: function(dateString) {
        if (!dateString) return '-';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString; // Return the original string if formatting fails
        }
    },

    // Tampilkan loading
    showLoading: function() {
        // Cek apakah loading overlay sudah ada
        if (document.querySelector('.loading-overlay')) {
            return;
        }

        // Buat loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Memproses Simulasi...</p>
        `;

        // Tambahkan ke body
        document.body.appendChild(loadingOverlay);

        // Prevent scrolling
        document.body.style.overflow = 'hidden';
    },

    // Sembunyikan loading
    hideLoading: function() {
        // Hapus loading overlay jika ada
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';

            // Hapus elemen setelah animasi
            setTimeout(function() {
                if (loadingOverlay.parentNode) {
                    document.body.removeChild(loadingOverlay);
                    document.body.style.overflow = 'auto';
                }
            }, 300);
        }
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

// Inisialisasi saat dokumen selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi simulasi greenhouse
    GreenhouseSimulation.initialize();
});