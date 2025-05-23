/**
 * fuzzy_config.js
 * 
 * File untuk interface konfigurasi sistem fuzzy
 * termasuk pengaturan fungsi keanggotaan dan aturan fuzzy
 */

const FuzzyConfig = {
    // Status konfigurasi
    config: {
        isEditing: false,
        activeTab: 'membership', // membership, rules
        selectedInput: 'soil_moisture',
        selectedOutput: 'irrigation_duration',
        editingRule: null,
        membershipData: {}
    },

    // Inisialisasi konfigurasi
    initialize: function() {
        console.log('Initializing fuzzy configuration interface...');

        // Tambahkan konten ke container yang sudah ada
        this.createMembershipContent();
        this.createRulesContent();

        // Tambahkan stylesheet
        this.addConfigStylesheet();

        // Tambahkan event listener
        this.attachEventListeners();

        // Muat data fungsi keanggotaan
        this.loadMembershipFunctions();

        // Muat data aturan fuzzy
        this.loadFuzzyRules();
    },

    // Buat konten fungsi keanggotaan untuk container yang sudah ada
    createMembershipContent: function() {
        // Cek apakah container ada
        const membershipContainer = document.getElementById('membership-config');
        if (!membershipContainer) {
            console.error('Container membership-config tidak ditemukan!');
            return;
        }

        // Buat konten untuk fungsi keanggotaan
        const membershipContent = document.createElement('div');
        membershipContent.innerHTML = `
            <div class="membership-controls">
                <div class="input-select">
                    <label>Parameter:</label>
                    <select id="membership-param">
                        <option value="soil_moisture">Kelembaban Tanah</option>
                        <option value="air_temperature">Suhu Udara</option>
                        <option value="light_intensity">Intensitas Cahaya</option>
                        <option value="humidity">Kelembaban Udara</option>
                        <option value="irrigation_duration">Durasi Irigasi</option>
                        <option value="temperature_setting">Pengaturan Suhu</option>
                        <option value="light_control">Kontrol Cahaya</option>
                    </select>
                </div>
                
                <div class="button-group">
                    <button id="edit-membership-btn" class="config-button">
                        <i class="fas fa-edit"></i> Edit Fungsi
                    </button>
                    <button id="save-membership-btn" class="config-button primary" style="display: none;">
                        <i class="fas fa-save"></i> Simpan Perubahan
                    </button>
                    <button id="cancel-edit-btn" class="config-button" style="display: none;">
                        <i class="fas fa-times"></i> Batal
                    </button>
                </div>
            </div>
            
            <div class="membership-editor">
                <div class="membership-chart-container">
                    <canvas id="membership-editor-chart"></canvas>
                </div>
                
                <div class="membership-form" id="membership-form">
                    <!-- Form akan dihasilkan secara dinamis -->
                </div>
            </div>
        `;

        // Tambahkan konten ke container
        membershipContainer.appendChild(membershipContent);
    },

    // Buat konten aturan fuzzy untuk container yang sudah ada
    createRulesContent: function() {
        // Cek apakah container ada
        const rulesContainer = document.getElementById('rules-config');
        if (!rulesContainer) {
            console.error('Container rules-config tidak ditemukan!');
            return;
        }

        // Buat konten untuk aturan fuzzy
        const rulesContent = document.createElement('div');
        rulesContent.innerHTML = `
            <div class="rules-controls">
                <button id="add-rule-btn" class="config-button primary">
                    <i class="fas fa-plus"></i> Tambah Aturan
                </button>
                
                <div class="rules-filter">
                    <label>Filter:</label>
                    <select id="rules-filter">
                        <option value="all">Semua Aturan</option>
                        <option value="custom">Kustom</option>
                        <option value="adaptive">Adaptif</option>
                        <option value="seedling">Fase Bibit</option>
                        <option value="vegetative">Fase Vegetatif</option>
                        <option value="flowering">Fase Berbunga</option>
                        <option value="fruiting">Fase Berbuah</option>
                        <option value="harvesting">Fase Panen</option>
                    </select>
                </div>
            </div>
            
            <div class="rules-table-container">
                <table class="rules-table" id="config-rules-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Jika</th>
                            <th>Maka</th>
                            <th>Kepercayaan</th>
                            <th>Tipe</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="config-rules-body">
                        <!-- Isi tabel akan dihasilkan secara dinamis -->
                        <tr>
                            <td colspan="6" class="loading-row">Memuat aturan...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="rules-summary">
                <div class="summary-item">
                    <span class="summary-label">Total Aturan:</span>
                    <span class="summary-value" id="total-rules">0</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Aturan Adaptif:</span>
                    <span class="summary-value" id="adaptive-rules">0</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Aturan Kustom:</span>
                    <span class="summary-value" id="custom-rules">0</span>
                </div>
            </div>
        `;

        // Tambahkan konten ke container
        rulesContainer.appendChild(rulesContent);
    },

    // Tambahkan stylesheet untuk konfigurasi
    addConfigStylesheet: function() {
        // Cek apakah stylesheet sudah ada
        if (document.getElementById('config-styles')) {
            return;
        }

        // Buat style element
        const style = document.createElement('style');
        style.id = 'config-styles';
        style.textContent = `
            /* Bagian konfigurasi */
            .config-section-content {
                padding: 15px;
                background-color: var(--card-bg);
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            }
            
            /* Kontrol fungsi keanggotaan */
            .membership-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding: 10px;
                background-color: #f5f5f5;
                border-radius: 8px;
            }
            
            .input-select {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .input-select label {
                font-weight: 500;
                color: #555;
            }
            
            .input-select select {
                padding: 8px 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                background-color: white;
            }

            .button-group {
                display: flex;
                gap: 8px;
            }
            
            .config-button {
                padding: 8px 15px;
                background-color: #f1f1f1;
                border: 1px solid #ddd;
                border-radius: 5px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 5px;
                transition: all 0.3s ease;
            }
            
            .config-button:hover {
                background-color: #e0e0e0;
            }
            
            .config-button.primary {
                background-color: var(--primary-color);
                color: white;
                border-color: var(--primary-color);
            }
            
            .config-button.primary:hover {
                background-color: var(--primary-dark);
            }
            
            /* Editor fungsi keanggotaan */
            .membership-editor {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-top: 20px;
            }
            
            .membership-chart-container {
                background-color: white;
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
                height: 300px;
            }
            
            .membership-form {
                background-color: white;
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
                max-height: 300px;
                overflow-y: auto;
            }
            
            .membership-function {
                margin-bottom: 15px;
                padding-bottom: 15px;
                border-bottom: 1px dashed #ddd;
            }
            
            .membership-function:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }
            
            .function-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .function-name {
                font-weight: 500;
                color: #333;
            }
            
            .function-type {
                font-size: 0.8rem;
                color: #666;
            }
            
            .function-points {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .point-input {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .point-input label {
                font-size: 0.8rem;
                color: #666;
            }
            
            .point-input input {
                width: 60px;
                padding: 5px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            
            /* Kontrol aturan */
            .rules-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding: 10px;
                background-color: #f5f5f5;
                border-radius: 8px;
            }
            
            .rules-filter {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .rules-filter label {
                font-weight: 500;
                color: #555;
            }
            
            .rules-filter select {
                padding: 8px 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                background-color: white;
            }
            
            /* Tabel aturan */
            .rules-table-container {
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
                margin-bottom: 20px;
                overflow-x: auto;
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
                font-weight: 500;
                color: #333;
            }
            
            .rules-table tr:hover {
                background-color: #f9f9f9;
            }
            
            .rules-table tr.adaptive-rule {
                background-color: rgba(33, 150, 243, 0.05);
            }
            
            .rules-table .loading-row {
                text-align: center;
                color: #666;
                padding: 20px;
            }
            
            .rule-actions {
                display: flex;
                gap: 5px;
            }
            
            .rule-action-btn {
                padding: 5px 8px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: background-color 0.2s ease;
            }
            
            .rule-action-btn.edit {
                background-color: #f0f0f0;
                color: #555;
            }
            
            .rule-action-btn.edit:hover {
                background-color: #e0e0e0;
            }
            
            .rule-action-btn.delete {
                background-color: #ffebee;
                color: #f44336;
            }
            
            .rule-action-btn.delete:hover {
                background-color: #ffcdd2;
            }
            
            /* Ringkasan aturan */
            .rules-summary {
                display: flex;
                gap: 20px;
                padding: 15px;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            }
            
            .summary-item {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .summary-label {
                font-weight: 500;
                color: #555;
            }
            
            .summary-value {
                font-weight: bold;
                color: var(--primary-color);
            }
            
            /* Modal dialog */
            .config-modal {
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
                width: 90%;
                max-width: 700px;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                overflow: hidden;
            }
            
            .modal-header {
                padding: 15px 20px;
                background-color: var(--primary-color);
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h3 {
                margin: 0;
                font-size: 1.2rem;
            }
            
            .modal-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
            }
            
            .modal-body {
                padding: 20px;
                max-height: 70vh;
                overflow-y: auto;
            }
            
            .modal-footer {
                padding: 15px 20px;
                background-color: #f5f5f5;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            /* Form dalam modal */
            .modal-form-group {
                margin-bottom: 15px;
            }
            
            .modal-form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                color: #333;
            }
            
            .modal-form-group select, .modal-form-group input {
                width: 100%;
                padding: 8px 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 0.9rem;
            }
            
            .modal-form-group .form-hint {
                font-size: 0.8rem;
                color: #666;
                margin-top: 5px;
            }
            
            .form-row {
                display: flex;
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .form-col {
                flex: 1;
            }
            
            .form-section {
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e0e0e0;
            }
            
            .form-section:last-child {
                margin-bottom: 0;
                padding-bottom: 0;
                border-bottom: none;
            }
            
            .form-section h4 {
                margin: 0 0 15px 0;
                font-size: 1rem;
                color: #333;
            }
            
            /* Responsif */
            @media (max-width: 992px) {
                .membership-editor {
                    grid-template-columns: 1fr;
                }
            }
            
            @media (max-width: 768px) {
                .rules-controls, .membership-controls {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }
                
                .rules-filter, .input-select {
                    width: 100%;
                }
                
                .rules-filter select, .input-select select {
                    width: 100%;
                }
                
                .config-button {
                    width: 100%;
                    justify-content: center;
                }
                
                .rules-summary {
                    flex-direction: column;
                    gap: 10px;
                }
                
                .form-row {
                    flex-direction: column;
                    gap: 10px;
                }
            }

            /* Loader untuk indikator proses */
            .loading-indicator {
                display: inline-block;
                width: 1em;
                height: 1em;
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: #fff;
                animation: spin 1s ease-in-out infinite;
                margin-right: 8px;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* Pesan status feedback */
            .status-message {
                margin-top: 10px;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 0.9rem;
            }
            
            .status-message.success {
                background-color: rgba(76, 175, 80, 0.1);
                color: #2e7d32;
                border: 1px solid rgba(76, 175, 80, 0.2);
            }
            
            .status-message.error {
                background-color: rgba(244, 67, 54, 0.1);
                color: #d32f2f;
                border: 1px solid rgba(244, 67, 54, 0.2);
            }
            
            .status-message.info {
                background-color: rgba(33, 150, 243, 0.1);
                color: #1976d2;
                border: 1px solid rgba(33, 150, 243, 0.2);
            }
        `;

        // Tambahkan ke head
        document.head.appendChild(style);
    },

    // Tambahkan event listener
    attachEventListeners: function() {
        // Parameter selection
        const membershipParam = document.getElementById('membership-param');
        if (membershipParam) {
            membershipParam.addEventListener('change', () => {
                this.config.selectedInput = membershipParam.value;
                this.updateMembershipForm();
            });
        }

        // Edit membership button
        const editMembershipBtn = document.getElementById('edit-membership-btn');
        if (editMembershipBtn) {
            editMembershipBtn.addEventListener('click', () => {
                this.enterEditMode();
            });
        }

        // Save membership button
        const saveMembershipBtn = document.getElementById('save-membership-btn');
        if (saveMembershipBtn) {
            saveMembershipBtn.addEventListener('click', () => {
                this.saveMembershipChanges();
            });
        }

        // Cancel edit button
        const cancelEditBtn = document.getElementById('cancel-edit-btn');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
                this.cancelEdit();
            });
        }

        // Add rule button
        const addRuleBtn = document.getElementById('add-rule-btn');
        if (addRuleBtn) {
            addRuleBtn.addEventListener('click', () => {
                this.showRuleModal();
            });
        }

        // Rules filter
        const rulesFilter = document.getElementById('rules-filter');
        if (rulesFilter) {
            rulesFilter.addEventListener('change', () => {
                this.filterRules(rulesFilter.value);
            });
        }

        // Attach event listeners for config section tabs (these are already in index.html)
        // We're just making sure they work with our new content
        const configSectionTabs = document.querySelectorAll('.config-section-tab');
        configSectionTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Get the section this tab is for
                const section = this.getAttribute('data-section');

                // Update our active tab if it's our tab
                if (section === 'membership-config') {
                    FuzzyConfig.config.activeTab = 'membership';
                } else if (section === 'rules-config') {
                    FuzzyConfig.config.activeTab = 'rules';
                }
            });
        });
    },

    // Muat fungsi keanggotaan
    loadMembershipFunctions: function() {
        fetch('php/get_data.php?type=membership_functions')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.config.membershipData = data.data;
                    this.updateMembershipForm();
                } else {
                    console.error('Error loading membership functions:', data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                this.showNotification('Gagal memuat fungsi keanggotaan: ' + error.message, 'error');
            });
    },

    // Muat aturan fuzzy
    loadFuzzyRules: function() {
        fetch('php/get_data.php?type=rules')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.config.rules = data.data;
                    this.updateRulesTable();
                    this.updateRulesSummary();
                } else {
                    console.error('Error loading fuzzy rules:', data.message);
                    this.showNotification('Gagal memuat aturan fuzzy: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                this.showNotification('Gagal memuat aturan fuzzy: ' + error.message, 'error');
            });
    },

    // Perbarui form fungsi keanggotaan
    updateMembershipForm: function() {
        if (!this.config.membershipData || Object.keys(this.config.membershipData).length === 0) {
            return;
        }

        const param = this.config.selectedInput;
        const membershipForm = document.getElementById('membership-form');
        const functions = this.config.membershipData[param];

        if (!functions) {
            membershipForm.innerHTML = '<p>Tidak ada data fungsi keanggotaan untuk parameter ini.</p>';
            return;
        }

        let formHtml = '';

        // Tambahkan judul parameter
        const paramTitle = this.getParameterTitle(param);
        formHtml += `<h3 class="form-title">${paramTitle}</h3>`;

        // Tentukan jenis parameter (input/output)
        const isOutput = ['irrigation_duration', 'temperature_setting', 'light_control'].includes(param);
        const paramType = isOutput ? 'Output' : 'Input';
        formHtml += `<p class="param-type">${paramType} Parameter</p>`;

        // Status message container
        formHtml += `<div id="membership-status-message" class="status-message" style="display: none;"></div>`;

        // Generate form untuk setiap fungsi keanggotaan
        for (const [name, func] of Object.entries(functions)) {
            formHtml += `
                <div class="membership-function">
                    <div class="function-header">
                        <span class="function-name">${this.capitalizeFirstLetter(name)}</span>
                        <span class="function-type">${this.capitalizeFirstLetter(func.type)}</span>
                    </div>
                    <div class="function-points">
            `;

            // Add inputs for each point
            for (let i = 0; i < func.points.length; i++) {
                const pointLabel = this.getPointLabel(func.type, i);
                const isDisabled = !this.config.isEditing;

                formHtml += `
                    <div class="point-input">
                        <label>${pointLabel}</label>
                        <input type="number" value="${func.points[i]}" 
                            id="${param}_${name}_point_${i}" 
                            ${isDisabled ? 'disabled' : ''}
                            data-param="${param}"
                            data-function="${name}"
                            data-point="${i}"
                            onchange="FuzzyConfig.updatePoint('${param}', '${name}', ${i}, this.value)">
                    </div>
                `;
            }

            formHtml += `
                    </div>
                </div>
            `;
        }

        // Set HTML ke form
        membershipForm.innerHTML = formHtml;

        // Perbarui grafik
        this.updateMembershipChart();
    },

    // Perbarui nilai point fungsi keanggotaan
    updatePoint: function(param, funcName, pointIndex, value) {
        // Validasi angka
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            return;
        }

        // Perbarui nilai di data
        if (this.config.membershipData[param] &&
            this.config.membershipData[param][funcName] &&
            this.config.membershipData[param][funcName].points) {

            this.config.membershipData[param][funcName].points[pointIndex] = numValue;

            // Perbarui grafik
            this.updateMembershipChart();
        }
    },

    // Masuk ke mode pengeditan fungsi keanggotaan
    enterEditMode: function() {
        this.config.isEditing = true;

        // Show/hide the appropriate buttons
        document.getElementById('edit-membership-btn').style.display = 'none';
        document.getElementById('save-membership-btn').style.display = 'flex';
        document.getElementById('cancel-edit-btn').style.display = 'flex';

        // Enable all input fields
        const inputs = document.querySelectorAll('#membership-form input');
        inputs.forEach(input => {
            input.disabled = false;
        });

        // Show message to user
        const statusMessage = document.getElementById('membership-status-message');
        statusMessage.textContent = 'Mode pengeditan aktif. Ubah nilai sesuai kebutuhan dan klik Simpan Perubahan.';
        statusMessage.className = 'status-message info';
        statusMessage.style.display = 'block';
    },

    // Batalkan pengeditan
    cancelEdit: function() {
        this.config.isEditing = false;

        // Show/hide the appropriate buttons
        document.getElementById('edit-membership-btn').style.display = 'flex';
        document.getElementById('save-membership-btn').style.display = 'none';
        document.getElementById('cancel-edit-btn').style.display = 'none';

        // Reload the data to revert changes
        this.loadMembershipFunctions();

        // Show message to user
        const statusMessage = document.getElementById('membership-status-message');
        statusMessage.textContent = 'Perubahan dibatalkan.';
        statusMessage.className = 'status-message info';
        statusMessage.style.display = 'block';

        // Hide message after a delay
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 3000);
    },

    // Simpan perubahan fungsi keanggotaan
    saveMembershipChanges: function() {
        // Tampilkan indikator loading pada tombol
        const saveButton = document.getElementById('save-membership-btn');
        const originalText = saveButton.innerHTML;
        saveButton.innerHTML = '<span class="loading-indicator"></span>Menyimpan...';
        saveButton.disabled = true;

        // Siapkan data untuk dikirim
        const data = {
            parameter: this.config.selectedInput,
            functions: this.config.membershipData[this.config.selectedInput]
        };

        // Kirim ke server
        fetch('php/update_membership.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                // Kembalikan tombol ke keadaan semula
                saveButton.innerHTML = originalText;
                saveButton.disabled = false;

                if (data.success) {
                    // Tampilkan pesan sukses
                    const statusMessage = document.getElementById('membership-status-message');
                    statusMessage.textContent = 'Fungsi keanggotaan berhasil disimpan!';
                    statusMessage.className = 'status-message success';
                    statusMessage.style.display = 'block';

                    // Tutup mode pengeditan
                    this.config.isEditing = false;
                    document.getElementById('edit-membership-btn').style.display = 'flex';
                    document.getElementById('save-membership-btn').style.display = 'none';
                    document.getElementById('cancel-edit-btn').style.display = 'none';

                    // Disable inputs
                    const inputs = document.querySelectorAll('#membership-form input');
                    inputs.forEach(input => {
                        input.disabled = true;
                    });

                    // Juga tampilkan notifikasi normal
                    this.showNotification('Fungsi keanggotaan berhasil disimpan!', 'success');

                    // Sembunyikan pesan setelah beberapa detik
                    setTimeout(() => {
                        statusMessage.style.display = 'none';
                    }, 5000);
                } else {
                    // Tampilkan pesan error
                    const statusMessage = document.getElementById('membership-status-message');
                    statusMessage.textContent = 'Error: ' + data.message;
                    statusMessage.className = 'status-message error';
                    statusMessage.style.display = 'block';

                    this.showNotification('Error: ' + data.message, 'error');
                }
            })
            .catch(error => {
                // Kembalikan tombol ke keadaan semula
                saveButton.innerHTML = originalText;
                saveButton.disabled = false;

                console.error('Error saving membership changes:', error);

                // Tampilkan pesan error
                const statusMessage = document.getElementById('membership-status-message');
                statusMessage.textContent = 'Error: ' + error.message;
                statusMessage.className = 'status-message error';
                statusMessage.style.display = 'block';

                this.showNotification('Error menyimpan perubahan: ' + error.message, 'error');
            });
    },

    // Perbarui grafik fungsi keanggotaan
    updateMembershipChart: function() {
        const param = this.config.selectedInput;
        const membershipData = this.config.membershipData[param];

        if (!membershipData) return;

        const ctx = document.getElementById('membership-editor-chart');
        if (!ctx) return;

        // Destroy existing chart if any
        if (this.config.membershipChart) {
            this.config.membershipChart.destroy();
        }

        // Define datasets based on membership functions
        const datasets = [];
        const paramRange = this.getParameterRange(param);
        const step = (paramRange.max - paramRange.min) / 100;

        // Define labels (x-axis values)
        const labels = [];
        for (let x = paramRange.min; x <= paramRange.max; x += step) {
            labels.push(x);
        }

        // Create dataset for each membership function
        for (const [name, func] of Object.entries(membershipData)) {
            const data = labels.map(x => this.calculateMembership(func.type, func.points, x));

            datasets.push({
                label: this.capitalizeFirstLetter(name),
                data: data,
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4
            });
        }

        // Create chart
        this.config.membershipChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1.1,
                        title: {
                            display: true,
                            text: 'Derajat Keanggotaan'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: this.getParameterTitle(param)
                        },
                        ticks: {
                            callback: function(value, index, values) {
                                // Tampilkan hanya beberapa label
                                const count = values.length;
                                if (index === 0 || index === count - 1 || index % Math.floor(count / 5) === 0) {
                                    return value.toFixed(1);
                                }
                                return '';
                            }
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
                        display: true,
                        text: `Fungsi Keanggotaan - ${this.getParameterTitle(param)}`
                    }
                },
                elements: {
                    line: {
                        tension: 0.4
                    }
                }
            }
        });
    },

    // Perhitungan nilai keanggotaan
    calculateMembership: function(type, points, x) {
        if (type === 'triangle') {
            // Fungsi segitiga (a, b, c)
            const [a, b, c] = points;
            if (x <= a || x >= c) return 0;
            if (x <= b) return (x - a) / (b - a);
            return (c - x) / (c - b);
        } else if (type === 'trapezoid') {
            // Fungsi trapesium (a, b, c, d)
            const [a, b, c, d] = points;
            if (x <= a || x >= d) return 0;
            if (x >= b && x <= c) return 1;
            if (x < b) return (x - a) / (b - a);
            return (d - x) / (d - c);
        }
        return 0;
    },

    // Perbarui tabel aturan
    updateRulesTable: function() {
        if (!this.config.rules || this.config.rules.length === 0) {
            const rulesBody = document.getElementById('config-rules-body');
            if (rulesBody) {
                rulesBody.innerHTML = '<tr><td colspan="6" class="loading-row">Tidak ada aturan yang tersedia</td></tr>';
            }
            return;
        }

        const rulesBody = document.getElementById('config-rules-body');
        if (!rulesBody) return;

        // Dapatkan filter yang aktif
        const filterValue = document.getElementById('rules-filter').value;
        let filteredRules = this.config.rules;

        // Terapkan filter
        if (filterValue !== 'all') {
            if (filterValue === 'custom') {
                filteredRules = filteredRules.filter(rule => rule.is_adaptive !== 1);
            } else if (filterValue === 'adaptive') {
                filteredRules = filteredRules.filter(rule => rule.is_adaptive === 1);
            } else {
                // Filter berdasarkan fase tanaman
                filteredRules = filteredRules.filter(rule => rule.plant_stage === filterValue || rule.plant_stage === null || rule.plant_stage === '');
            }
        }

        // Bersihkan tabel
        rulesBody.innerHTML = '';

        // Jika tidak ada aturan setelah filter
        if (filteredRules.length === 0) {
            rulesBody.innerHTML = '<tr><td colspan="6" class="loading-row">Tidak ada aturan yang sesuai dengan filter</td></tr>';
            return;
        }

        // Buat baris untuk setiap aturan
        filteredRules.forEach(rule => {
            const row = document.createElement('tr');
            if (rule.is_adaptive == 1) {
                row.classList.add('adaptive-rule');
            }

            // Format kondisi IF
            const ifCondition = `Kelembaban Tanah ${this.capitalizeFirstLetter(rule.soil_moisture)} DAN 
                              Suhu Udara ${this.capitalizeFirstLetter(rule.air_temperature)} DAN 
                              Intensitas Cahaya ${this.capitalizeFirstLetter(rule.light_intensity)} DAN 
                              Kelembaban Udara ${this.capitalizeFirstLetter(rule.humidity)}`;

            // Format aksi THEN
            const thenAction = `Irigasi ${this.capitalizeFirstLetter(rule.irrigation_duration)} DAN 
                             Suhu ${this.capitalizeFirstLetter(rule.temperature_setting)} DAN 
                             Cahaya ${this.capitalizeFirstLetter(rule.light_control)}`;

            // Tentukan tipe aturan
            let ruleType = rule.is_adaptive == 1 ? 'Adaptif' : 'Kustom';
            if (rule.plant_stage) {
                ruleType += ` (${this.getPlantStageText(rule.plant_stage)})`;
            }

            // Tambahkan baris ke tabel
            row.innerHTML = `
                <td>${rule.id}</td>
                <td>${ifCondition}</td>
                <td>${thenAction}</td>
                <td>${rule.confidence_level || 100}%</td>
                <td>${ruleType}</td>
                <td>
                    <div class="rule-actions">
                        <button class="rule-action-btn edit" onclick="FuzzyConfig.editRule(${rule.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="rule-action-btn delete" onclick="FuzzyConfig.deleteRule(${rule.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;

            rulesBody.appendChild(row);
        });
    },

    // Filter aturan
    filterRules: function(filterValue) {
        // Perbarui tabel dengan filter
        this.updateRulesTable();
    },

    // Perbarui ringkasan aturan
    updateRulesSummary: function() {
        if (!this.config.rules) return;

        // Hitung total aturan
        const totalRules = this.config.rules.length;

        // Hitung aturan adaptif
        const adaptiveRules = this.config.rules.filter(rule => rule.is_adaptive == 1).length;

        // Hitung aturan kustom
        const customRules = totalRules - adaptiveRules;

        // Perbarui UI
        document.getElementById('total-rules').textContent = totalRules;
        document.getElementById('adaptive-rules').textContent = adaptiveRules;
        document.getElementById('custom-rules').textContent = customRules;
    },

    // Tampilkan modal aturan
    showRuleModal: function(ruleId = null) {
        // Buat modal jika belum ada
        let modal = document.querySelector('.config-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'config-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="rule-modal-title">Tambah Aturan Fuzzy Baru</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="rule-form">
                            <div class="form-section">
                                <h4>Kondisi (JIKA)</h4>
                                <div class="form-row">
                                    <div class="form-col">
                                        <div class="modal-form-group">
                                            <label for="rule-soil-moisture">Kelembaban Tanah:</label>
                                            <select id="rule-soil-moisture">
                                                <option value="kering">Kering</option>
                                                <option value="sedang">Sedang</option>
                                                <option value="basah">Basah</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="form-col">
                                        <div class="modal-form-group">
                                            <label for="rule-air-temperature">Suhu Udara:</label>
                                            <select id="rule-air-temperature">
                                                <option value="dingin">Dingin</option>
                                                <option value="sedang">Sedang</option>
                                                <option value="panas">Panas</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-col">
                                        <div class="modal-form-group">
                                            <label for="rule-light-intensity">Intensitas Cahaya:</label>
                                            <select id="rule-light-intensity">
                                                <option value="rendah">Rendah</option>
                                                <option value="sedang">Sedang</option>
                                                <option value="tinggi">Tinggi</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="form-col">
                                        <div class="modal-form-group">
                                            <label for="rule-humidity">Kelembaban Udara:</label>
                                            <select id="rule-humidity">
                                                <option value="rendah">Rendah</option>
                                                <option value="sedang">Sedang</option>
                                                <option value="tinggi">Tinggi</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-section">
                                <h4>Aksi (MAKA)</h4>
                                <div class="form-row">
                                    <div class="form-col">
                                        <div class="modal-form-group">
                                            <label for="rule-irrigation">Durasi Irigasi:</label>
                                            <select id="rule-irrigation">
                                                <option value="tidak_ada">Tidak Ada</option>
                                                <option value="singkat">Singkat</option>
                                                <option value="sedang">Sedang</option>
                                                <option value="lama">Lama</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="form-col">
                                        <div class="modal-form-group">
                                            <label for="rule-temperature">Pengaturan Suhu:</label>
                                            <select id="rule-temperature">
                                                <option value="menurunkan">Menurunkan</option>
                                                <option value="mempertahankan">Mempertahankan</option>
                                                <option value="menaikkan">Menaikkan</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="modal-form-group">
                                    <label for="rule-light">Kontrol Cahaya:</label>
                                    <select id="rule-light">
                                        <option value="mati">Mati</option>
                                        <option value="redup">Redup</option>
                                        <option value="sedang">Sedang</option>
                                        <option value="terang">Terang</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-section">
                                <h4>Pengaturan Tambahan</h4>
                                <div class="form-row">
                                    <div class="form-col">
                                        <div class="modal-form-group">
                                            <label for="rule-plant-stage">Fase Tanaman (Opsional):</label>
                                            <select id="rule-plant-stage">
                                                <option value="">Tidak Spesifik</option>
                                                <option value="seedling">Bibit</option>
                                                <option value="vegetative">Vegetatif</option>
                                                <option value="flowering">Berbunga</option>
                                                <option value="fruiting">Berbuah</option>
                                                <option value="harvesting">Panen</option>
                                            </select>
                                            <div class="form-hint">Kosongkan jika aturan berlaku untuk semua fase.</div>
                                        </div>
                                    </div>
                                    <div class="form-col">
                                        <div class="modal-form-group">
                                            <label for="rule-confidence">Tingkat Kepercayaan (%):</label>
                                            <input type="number" id="rule-confidence" min="1" max="100" value="100">
                                            <div class="form-hint">Seberapa yakin aturan ini benar.</div>
                                        </div>
                                    </div>
                                </div>
                                <input type="hidden" id="rule-id" value="">
                                <input type="hidden" id="rule-is-adaptive" value="0">
                            </div>

                            <div id="rule-status-message" class="status-message" style="display: none;"></div>
                        </form>
                        <div class="modal-footer">
                        <button class="config-button" id="rule-cancel-btn">Batal</button>
                        <button class="config-button primary" id="rule-save-btn">Simpan Aturan</button>
                    </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Tambahkan event listener untuk tombol tutup
            const closeBtn = modal.querySelector('.modal-close');
            closeBtn.addEventListener('click', () => {
                this.closeRuleModal();
            });

            // Event listener untuk tombol batal
            const cancelBtn = modal.querySelector('#rule-cancel-btn');
            cancelBtn.addEventListener('click', () => {
                this.closeRuleModal();
            });

            // Event listener untuk tombol simpan
            const saveBtn = modal.querySelector('#rule-save-btn');
            saveBtn.addEventListener('click', () => {
                this.saveRule();
            });
        }

        // Reset status message
        const statusMessage = document.getElementById('rule-status-message');
        if (statusMessage) {
            statusMessage.style.display = 'none';
            statusMessage.textContent = '';
            statusMessage.className = 'status-message';
        }

        // Isi form jika mengedit aturan
        if (ruleId !== null) {
            this.fillRuleForm(ruleId);
            modal.querySelector('#rule-modal-title').textContent = 'Edit Aturan Fuzzy';
        } else {
            // Reset form jika menambah aturan baru
            document.getElementById('rule-form').reset();
            document.getElementById('rule-id').value = '';
            document.getElementById('rule-is-adaptive').value = '0';
            modal.querySelector('#rule-modal-title').textContent = 'Tambah Aturan Fuzzy Baru';
        }

        // Tampilkan modal
        modal.style.display = 'flex';
    },

    // Isi form edit aturan
    fillRuleForm: function(ruleId) {
        // Cari aturan berdasarkan ID
        const rule = this.config.rules.find(r => r.id == ruleId);
        if (!rule) return;

        // Isi form dengan data aturan
        document.getElementById('rule-soil-moisture').value = rule.soil_moisture;
        document.getElementById('rule-air-temperature').value = rule.air_temperature;
        document.getElementById('rule-light-intensity').value = rule.light_intensity;
        document.getElementById('rule-humidity').value = rule.humidity;
        document.getElementById('rule-irrigation').value = rule.irrigation_duration;
        document.getElementById('rule-temperature').value = rule.temperature_setting;
        document.getElementById('rule-light').value = rule.light_control;
        document.getElementById('rule-plant-stage').value = rule.plant_stage || '';
        document.getElementById('rule-confidence').value = rule.confidence_level || 100;
        document.getElementById('rule-id').value = rule.id;
        document.getElementById('rule-is-adaptive').value = rule.is_adaptive || 0;
    },

    // Tutup modal aturan
    closeRuleModal: function() {
        const modal = document.querySelector('.config-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // Simpan aturan
    saveRule: function() {
        // Ambil nilai dari form
        const ruleId = document.getElementById('rule-id').value;
        const isAdaptive = document.getElementById('rule-is-adaptive').value;
        const soilMoisture = document.getElementById('rule-soil-moisture').value;
        const airTemperature = document.getElementById('rule-air-temperature').value;
        const lightIntensity = document.getElementById('rule-light-intensity').value;
        const humidity = document.getElementById('rule-humidity').value;
        const irrigation = document.getElementById('rule-irrigation').value;
        const temperature = document.getElementById('rule-temperature').value;
        const light = document.getElementById('rule-light').value;
        const plantStage = document.getElementById('rule-plant-stage').value;
        const confidence = document.getElementById('rule-confidence').value;

        // Validasi data
        if (!soilMoisture || !airTemperature || !lightIntensity || !humidity ||
            !irrigation || !temperature || !light) {
            // Tampilkan pesan error di modal
            const statusMessage = document.getElementById('rule-status-message');
            statusMessage.textContent = 'Semua parameter utama harus diisi';
            statusMessage.className = 'status-message error';
            statusMessage.style.display = 'block';
            return;
        }

        // Tampilkan loading pada tombol save
        const saveButton = document.getElementById('rule-save-btn');
        const originalText = saveButton.innerHTML;
        saveButton.innerHTML = '<span class="loading-indicator"></span>Menyimpan...';
        saveButton.disabled = true;

        // Siapkan data untuk dikirim
        const formData = new FormData();
        formData.append('command', ruleId ? 'update_rule' : 'add_rule');

        if (ruleId) {
            formData.append('rule_id', ruleId);
        }

        formData.append('soil_moisture', soilMoisture);
        formData.append('air_temperature', airTemperature);
        formData.append('light_intensity', lightIntensity);
        formData.append('humidity', humidity);
        formData.append('irrigation_duration', irrigation);
        formData.append('temperature_setting', temperature);
        formData.append('light_control', light);
        formData.append('plant_stage', plantStage);
        formData.append('confidence_level', confidence);
        formData.append('is_adaptive', isAdaptive);

        // Kirim ke server
        fetch('php/manage_rules.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Kembalikan tombol ke keadaan semula
                saveButton.innerHTML = originalText;
                saveButton.disabled = false;

                if (data.success) {
                    // Tampilkan pesan sukses di modal
                    const statusMessage = document.getElementById('rule-status-message');
                    statusMessage.textContent = ruleId ? 'Aturan berhasil diperbarui!' : 'Aturan baru berhasil ditambahkan!';
                    statusMessage.className = 'status-message success';
                    statusMessage.style.display = 'block';

                    // Tampilkan notifikasi umum
                    this.showNotification(ruleId ? 'Aturan berhasil diperbarui' : 'Aturan baru berhasil ditambahkan', 'success');

                    // Muat ulang aturan setelah delay singkat
                    setTimeout(() => {
                        this.loadFuzzyRules();
                        this.closeRuleModal();
                    }, 1500);
                } else {
                    // Tampilkan pesan error di modal
                    const statusMessage = document.getElementById('rule-status-message');
                    statusMessage.textContent = 'Error: ' + data.message;
                    statusMessage.className = 'status-message error';
                    statusMessage.style.display = 'block';

                    this.showNotification('Error: ' + data.message, 'error');
                }
            })
            .catch(error => {
                // Kembalikan tombol ke keadaan semula
                saveButton.innerHTML = originalText;
                saveButton.disabled = false;

                console.error('Error saving rule:', error);

                // Tampilkan pesan error di modal
                const statusMessage = document.getElementById('rule-status-message');
                statusMessage.textContent = 'Error menyimpan aturan: ' + error.message;
                statusMessage.className = 'status-message error';
                statusMessage.style.display = 'block';

                this.showNotification('Error menyimpan aturan: ' + error.message, 'error');
            });
    },

    // Edit aturan
    editRule: function(ruleId) {
        this.showRuleModal(ruleId);
    },

    // Hapus aturan
    deleteRule: function(ruleId) {
        if (!confirm('Anda yakin ingin menghapus aturan ini?')) {
            return;
        }

        // Tampilkan notifikasi proses
        this.showNotification('Menghapus aturan...', 'info');

        // Siapkan data untuk dikirim
        const formData = new FormData();
        formData.append('command', 'delete_rule');
        formData.append('rule_id', ruleId);

        // Kirim ke server
        fetch('php/manage_rules.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.showNotification('Aturan berhasil dihapus', 'success');
                    this.loadFuzzyRules(); // Muat ulang aturan
                } else {
                    this.showNotification('Error: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error deleting rule:', error);
                this.showNotification('Error menghapus aturan: ' + error.message, 'error');
            });
    },

    // Helper function untuk mendapatkan judul parameter
    getParameterTitle: function(param) {
        switch (param) {
            case 'soil_moisture':
                return 'Kelembaban Tanah (%)';
            case 'air_temperature':
                return 'Suhu Udara (°C)';
            case 'light_intensity':
                return 'Intensitas Cahaya (lux)';
            case 'humidity':
                return 'Kelembaban Udara (%)';
            case 'irrigation_duration':
                return 'Durasi Irigasi (menit)';
            case 'temperature_setting':
                return 'Pengaturan Suhu (°C)';
            case 'light_control':
                return 'Kontrol Cahaya (%)';
            default:
                return param;
        }
    },

    // Helper function untuk mendapatkan rentang parameter
    getParameterRange: function(param) {
        switch (param) {
            case 'soil_moisture':
                return { min: 0, max: 100 };
            case 'air_temperature':
                return { min: 0, max: 50 };
            case 'light_intensity':
                return { min: 0, max: 1000 };
            case 'humidity':
                return { min: 0, max: 100 };
            case 'irrigation_duration':
                return { min: 0, max: 100 };
            case 'temperature_setting':
                return { min: -10, max: 10 };
            case 'light_control':
                return { min: 0, max: 100 };
            default:
                return { min: 0, max: 100 };
        }
    },

    // Helper function untuk mendapatkan label point
    getPointLabel: function(type, index) {
        if (type === 'triangle') {
            switch (index) {
                case 0:
                    return 'a (Mulai)';
                case 1:
                    return 'b (Puncak)';
                case 2:
                    return 'c (Akhir)';
            }
        } else if (type === 'trapezoid') {
            switch (index) {
                case 0:
                    return 'a (Mulai)';
                case 1:
                    return 'b (Plateau 1)';
                case 2:
                    return 'c (Plateau 2)';
                case 3:
                    return 'd (Akhir)';
            }
        }
        return `Point ${index + 1}`;
    },

    // Helper function untuk mendapatkan teks fase tanaman
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

    // Helper function untuk kapitalkan huruf pertama
    capitalizeFirstLetter: function(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
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
    // Inisialisasi konfigurasi fuzzy
    setTimeout(() => {
        FuzzyConfig.initialize();
    }, 1000); // Delay untuk memastikan semua elemen UI telah dimuat
});