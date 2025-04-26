/**
 * ui_interaction.js
 * 
 * File JavaScript untuk interaksi antarmuka pengguna (UI)
 * seperti mengubah pengaturan dan mengirim data
 */

// Objek untuk menangani interaksi UI
const UIInteraction = {
    // Status aplikasi
    status: {
        isCalculating: false,
        isSaving: false
    },

    // Inisialisasi aplikasi
    initialize: function() {
        // Tambahkan event listener untuk interaksi UI
        this.attachEventListeners();

        // Animasi pada load
        this.animateOnLoad();
    },

    // Tambahkan event listener
    attachEventListeners: function() {
        // Disable default form submission
        document.getElementById('parameterForm').addEventListener('submit', function(e) {
            e.preventDefault();
        });

        // Input dan slider sync untuk soil moisture
        const soilMoistureInput = document.getElementById('soil_moisture_value');
        const soilMoistureSlider = document.getElementById('soil_moisture_slider');

        soilMoistureInput.addEventListener('input', function() {
            soilMoistureSlider.value = this.value;
            FuzzyLogic.updateInputValue('soil_moisture', this.value);
        });

        soilMoistureSlider.addEventListener('input', function() {
            soilMoistureInput.value = this.value;
            FuzzyLogic.updateInputValue('soil_moisture', this.value);
        });

        // Input dan slider sync untuk air temperature
        const airTemperatureInput = document.getElementById('air_temperature_value');
        const airTemperatureSlider = document.getElementById('air_temperature_slider');

        airTemperatureInput.addEventListener('input', function() {
            airTemperatureSlider.value = this.value;
            FuzzyLogic.updateInputValue('air_temperature', this.value);
        });

        airTemperatureSlider.addEventListener('input', function() {
            airTemperatureInput.value = this.value;
            FuzzyLogic.updateInputValue('air_temperature', this.value);
        });

        // Input dan slider sync untuk light intensity
        const lightIntensityInput = document.getElementById('light_intensity_value');
        const lightIntensitySlider = document.getElementById('light_intensity_slider');

        lightIntensityInput.addEventListener('input', function() {
            lightIntensitySlider.value = this.value;
            FuzzyLogic.updateInputValue('light_intensity', this.value);
        });

        lightIntensitySlider.addEventListener('input', function() {
            lightIntensityInput.value = this.value;
            FuzzyLogic.updateInputValue('light_intensity', this.value);
        });

        // Input dan slider sync untuk humidity
        const humidityInput = document.getElementById('humidity_value');
        const humiditySlider = document.getElementById('humidity_slider');

        humidityInput.addEventListener('input', function() {
            humiditySlider.value = this.value;
            FuzzyLogic.updateInputValue('humidity', this.value);
        });

        humiditySlider.addEventListener('input', function() {
            humidityInput.value = this.value;
            FuzzyLogic.updateInputValue('humidity', this.value);
        });

        // Button event listener
        document.getElementById('calculateButton').addEventListener('click', function() {
            if (!UIInteraction.status.isCalculating) {
                UIInteraction.status.isCalculating = true;
                UIInteraction.showCalculating();
                FuzzyLogic.calculateFuzzyOutput();

                // Setelah 1 detik, selesai perhitungan
                setTimeout(function() {
                    UIInteraction.status.isCalculating = false;
                    UIInteraction.hideCalculating();
                }, 1000);
            }
        });

        document.getElementById('saveButton').addEventListener('click', function() {
            if (!UIInteraction.status.isSaving) {
                UIInteraction.showSaving();
                UIInteraction.status.isSaving = true;
                FuzzyLogic.saveSettings();

                // Setelah selesai penyimpanan
                setTimeout(function() {
                    UIInteraction.status.isSaving = false;
                    UIInteraction.hideSaving();
                }, 1500);
            }
        });

        // Interaksi dengan output card
        const outputCards = document.querySelectorAll('.output-card');
        outputCards.forEach(card => {
            card.addEventListener('mouseover', function() {
                this.style.transform = 'translateY(-10px)';
                this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
            });

            card.addEventListener('mouseout', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.05)';
            });
        });
    },

    // Tampilkan indikator perhitungan
    showCalculating: function() {
        const button = document.getElementById('calculateButton');
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghitung...';
        button.disabled = true;
    },

    // Sembunyikan indikator perhitungan
    hideCalculating: function() {
        const button = document.getElementById('calculateButton');
        button.innerHTML = '<i class="fas fa-calculator"></i> Hitung Output';
        button.disabled = false;
    },

    // Tampilkan indikator penyimpanan
    showSaving: function() {
        const button = document.getElementById('saveButton');
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
        button.disabled = true;
    },

    // Sembunyikan indikator penyimpanan
    hideSaving: function() {
        const button = document.getElementById('saveButton');
        button.innerHTML = '<i class="fas fa-save"></i> Simpan Pengaturan';
        button.disabled = false;
    },

    // Tampilkan notifikasi
    showNotification: function(message, type = 'success') {
        // Buat elemen notifikasi
        const notification = document.createElement('div');
        notification.className = 'notification ' + type;
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
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    },

    // Animasi saat halaman dimuat
    animateOnLoad: function() {
        // Animasi fade in untuk header
        const header = document.querySelector('header');
        header.style.opacity = '0';
        header.style.transform = 'translateY(-20px)';

        setTimeout(function() {
            header.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        }, 100);

        // Animasi fade in untuk dashboard
        const dashboard = document.querySelector('.dashboard');
        dashboard.style.opacity = '0';

        setTimeout(function() {
            dashboard.style.transition = 'opacity 0.5s ease';
            dashboard.style.opacity = '1';
        }, 300);

        // Animasi fade in untuk visualisasi
        const visualization = document.querySelector('.visualization-section');
        visualization.style.opacity = '0';

        setTimeout(function() {
            visualization.style.transition = 'opacity 0.5s ease';
            visualization.style.opacity = '1';
        }, 500);

        // Animasi fade in untuk aturan
        const rules = document.querySelector('.rules-section');
        rules.style.opacity = '0';

        setTimeout(function() {
            rules.style.transition = 'opacity 0.5s ease';
            rules.style.opacity = '1';
        }, 700);
    },

    // Reset form ke nilai default
    resetForm: function() {
        // Reset nilai input
        document.getElementById('soil_moisture_value').value = 50;
        document.getElementById('soil_moisture_slider').value = 50;
        document.getElementById('air_temperature_value').value = 25;
        document.getElementById('air_temperature_slider').value = 25;
        document.getElementById('light_intensity_value').value = 500;
        document.getElementById('light_intensity_slider').value = 500;
        document.getElementById('humidity_value').value = 60;
        document.getElementById('humidity_slider').value = 60;

        // Update nilai di fuzzy logic
        FuzzyLogic.updateInputValue('soil_moisture', 50);
        FuzzyLogic.updateInputValue('air_temperature', 25);
        FuzzyLogic.updateInputValue('light_intensity', 500);
        FuzzyLogic.updateInputValue('humidity', 60);

        // Reset output
        document.getElementById('irrigation_duration').innerText = 'Menunggu perhitungan...';
        document.getElementById('temperature_setting').innerText = 'Menunggu perhitungan...';
        document.getElementById('light_control').innerText = 'Menunggu perhitungan...';
        document.getElementById('irrigation_duration_value').innerText = '0';
        document.getElementById('temperature_setting_value').innerText = '0';
        document.getElementById('light_control_value').innerText = '0';

        // Reset progress bar
        document.getElementById('irrigation_progress').style.width = '0%';
        document.getElementById('temperature_progress').style.width = '50%';
        document.getElementById('light_progress').style.width = '0%';
    },

    // Tampilkan loading overlay
    showLoading: function() {
        // Buat elemen overlay
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="loading-spinner"></div><p>Memuat Data...</p>';

        // Tambahkan ke body
        document.body.appendChild(overlay);

        // Prevent scrolling
        document.body.style.overflow = 'hidden';
    },

    // Sembunyikan loading overlay
    hideLoading: function() {
        // Hapus overlay jika ada
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.style.opacity = '0';

            // Hapus elemen setelah animasi
            setTimeout(function() {
                document.body.removeChild(overlay);
                document.body.style.overflow = 'auto';
            }, 300);
        }
    },

    // Buka modal untuk menambah atau mengedit aturan
    openRuleModal: function(rule = null) {
        // Buat elemen modal
        const modal = document.createElement('div');
        modal.className = 'modal';

        // Isi modal
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${rule ? 'Edit Aturan' : 'Tambah Aturan'}</h3>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="ruleForm">
                        <div class="modal-input-group">
                            <label for="modal_soil_moisture">Kelembaban Tanah:</label>
                            <select id="modal_soil_moisture" name="soil_moisture">
                                <option value="kering" ${rule && rule.soil_moisture === 'kering' ? 'selected' : ''}>Kering</option>
                                <option value="sedang" ${rule && rule.soil_moisture === 'sedang' ? 'selected' : ''}>Sedang</option>
                                <option value="basah" ${rule && rule.soil_moisture === 'basah' ? 'selected' : ''}>Basah</option>
                            </select>
                        </div>
                        
                        <div class="modal-input-group">
                            <label for="modal_air_temperature">Suhu Udara:</label>
                            <select id="modal_air_temperature" name="air_temperature">
                                <option value="dingin" ${rule && rule.air_temperature === 'dingin' ? 'selected' : ''}>Dingin</option>
                                <option value="sedang" ${rule && rule.air_temperature === 'sedang' ? 'selected' : ''}>Sedang</option>
                                <option value="panas" ${rule && rule.air_temperature === 'panas' ? 'selected' : ''}>Panas</option>
                            </select>
                        </div>
                        
                        <div class="modal-input-group">
                            <label for="modal_light_intensity">Intensitas Cahaya:</label>
                            <select id="modal_light_intensity" name="light_intensity">
                                <option value="rendah" ${rule && rule.light_intensity === 'rendah' ? 'selected' : ''}>Rendah</option>
                                <option value="sedang" ${rule && rule.light_intensity === 'sedang' ? 'selected' : ''}>Sedang</option>
                                <option value="tinggi" ${rule && rule.light_intensity === 'tinggi' ? 'selected' : ''}>Tinggi</option>
                            </select>
                        </div>
                        
                        <div class="modal-input-group">
                            <label for="modal_humidity">Kelembaban Udara:</label>
                            <select id="modal_humidity" name="humidity">
                                <option value="rendah" ${rule && rule.humidity === 'rendah' ? 'selected' : ''}>Rendah</option>
                                <option value="sedang" ${rule && rule.humidity === 'sedang' ? 'selected' : ''}>Sedang</option>
                                <option value="tinggi" ${rule && rule.humidity === 'tinggi' ? 'selected' : ''}>Tinggi</option>
                            </select>
                        </div>
                        
                        <div class="modal-input-group">
                            <label for="modal_irrigation_duration">Durasi Irigasi:</label>
                            <select id="modal_irrigation_duration" name="irrigation_duration">
                                <option value="tidak_ada" ${rule && rule.irrigation_duration === 'tidak_ada' ? 'selected' : ''}>Tidak Ada</option>
                                <option value="singkat" ${rule && rule.irrigation_duration === 'singkat' ? 'selected' : ''}>Singkat</option>
                                <option value="sedang" ${rule && rule.irrigation_duration === 'sedang' ? 'selected' : ''}>Sedang</option>
                                <option value="lama" ${rule && rule.irrigation_duration === 'lama' ? 'selected' : ''}>Lama</option>
                            </select>
                        </div>
                        
                        <div class="modal-input-group">
                            <label for="modal_temperature_setting">Pengaturan Suhu:</label>
                            <select id="modal_temperature_setting" name="temperature_setting">
                                <option value="menurunkan" ${rule && rule.temperature_setting === 'menurunkan' ? 'selected' : ''}>Menurunkan</option>
                                <option value="mempertahankan" ${rule && rule.temperature_setting === 'mempertahankan' ? 'selected' : ''}>Mempertahankan</option>
                                <option value="menaikkan" ${rule && rule.temperature_setting === 'menaikkan' ? 'selected' : ''}>Menaikkan</option>
                            </select>
                        </div>
                        
                        <div class="modal-input-group">
                            <label for="modal_light_control">Kontrol Pencahayaan:</label>
                            <select id="modal_light_control" name="light_control">
                                <option value="mati" ${rule && rule.light_control === 'mati' ? 'selected' : ''}>Mati</option>
                                <option value="redup" ${rule && rule.light_control === 'redup' ? 'selected' : ''}>Redup</option>
                                <option value="sedang" ${rule && rule.light_control === 'sedang' ? 'selected' : ''}>Sedang</option>
                                <option value="terang" ${rule && rule.light_control === 'terang' ? 'selected' : ''}>Terang</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button id="saveRuleButton" class="primary-button"><i class="fas fa-save"></i> Simpan</button>
                    <button id="closeModalButton" class="secondary-button"><i class="fas fa-times"></i> Batal</button>
                </div>
            </div>
        `;

        // Tambahkan ke body
        document.body.appendChild(modal);

        // Tampilkan modal dengan animasi
        setTimeout(function() {
            modal.style.opacity = '1';
        }, 10);

        // Event listener untuk tombol tutup
        modal.querySelector('.close-modal').addEventListener('click', function() {
            UIInteraction.closeModal(modal);
        });

        // Event listener untuk tombol batal
        modal.querySelector('#closeModalButton').addEventListener('click', function() {
            UIInteraction.closeModal(modal);
        });

        // Event listener untuk tombol simpan
        modal.querySelector('#saveRuleButton').addEventListener('click', function() {
            UIInteraction.saveRule(modal, rule ? rule.id : null);
        });

        // Prevent scrolling
        document.body.style.overflow = 'hidden';
    },

    // Tutup modal
    closeModal: function(modal) {
        modal.style.opacity = '0';

        // Hapus elemen setelah animasi
        setTimeout(function() {
            document.body.removeChild(modal);
            document.body.style.overflow = 'auto';
        }, 300);
    },

    // Simpan aturan baru atau yang diedit
    saveRule: function(modal, ruleId = null) {
        // Ambil nilai dari form
        const formData = new FormData();
        formData.append('save_type', 'fuzzy_rule');
        formData.append('soil_moisture', document.getElementById('modal_soil_moisture').value);
        formData.append('air_temperature', document.getElementById('modal_air_temperature').value);
        formData.append('light_intensity', document.getElementById('modal_light_intensity').value);
        formData.append('humidity', document.getElementById('modal_humidity').value);
        formData.append('irrigation_duration', document.getElementById('modal_irrigation_duration').value);
        formData.append('temperature_setting', document.getElementById('modal_temperature_setting').value);
        formData.append('light_control', document.getElementById('modal_light_control').value);

        if (ruleId) {
            formData.append('rule_id', ruleId);
        }

        // Tampilkan loading
        const saveButton = modal.querySelector('#saveRuleButton');
        const originalText = saveButton.innerHTML;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
        saveButton.disabled = true;

        // Kirim data ke server
        fetch('php/save_settings.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Tampilkan notifikasi
                    UIInteraction.showNotification('Aturan berhasil disimpan!', 'success');

                    // Tutup modal
                    UIInteraction.closeModal(modal);

                    // Muat ulang tabel aturan
                    loadFuzzyRules();
                } else {
                    throw new Error(data.message || 'Gagal menyimpan aturan');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                UIInteraction.showNotification('Error: ' + error.message, 'error');

                // Kembalikan tombol
                saveButton.innerHTML = originalText;
                saveButton.disabled = false;
            });
    }
};

// Inisialisasi saat dokumen selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi UI
    UIInteraction.initialize();

    // Tambahkan CSS untuk notifikasi dan modal
    addCustomStyles();
});

// Fungsi untuk menambahkan style custom
function addCustomStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Notifikasi */
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background-color: #4CAF50;
            color: white;
            border-radius: 5px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            opacity: 0;
            transform: translateY(-20px);
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        .notification.error {
            background-color: #f44336;
        }
        
        .notification.warning {
            background-color: #ff9800;
        }
        
        /* Loading Overlay */
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 1;
            transition: opacity 0.3s ease;
        }
        
        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #4CAF50;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        
        .loading-overlay p {
            color: white;
            font-size: 18px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Modal */
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .modal-content {
            background-color: white;
            border-radius: 8px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid #ddd;
        }
        
        .modal-header h3 {
            margin: 0;
            color: #333;
        }
        
        .close-modal {
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            color: #aaa;
        }
        
        .close-modal:hover {
            color: #333;
        }
        
        .modal-body {
            padding: 20px;
        }
        
        .modal-footer {
            padding: 15px 20px;
            border-top: 1px solid #ddd;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        
        .modal-input-group {
            margin-bottom: 15px;
        }
        
        .modal-input-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        .modal-input-group select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
    `;

    document.head.appendChild(style);
}