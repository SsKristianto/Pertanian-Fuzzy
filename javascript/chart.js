/**
 * chart.js
 * 
 * File JavaScript untuk visualisasi grafik fungsi keanggotaan
 * dan hasil kontrol fuzzy
 */

// Objek chart untuk menyimpan referensi ke semua grafik
const FuzzyCharts = {
    charts: {},
    membershipFunctions: {},

    // Inisialisasi semua grafik
    initialize: function() {
        // Muat data fungsi keanggotaan dari server
        this.loadMembershipFunctions();
    },

    // Memuat definisi fungsi keanggotaan dari server
    loadMembershipFunctions: function() {
        fetch('php/get_data.php?type=membership_functions')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.membershipFunctions = data.data;
                    this.createCharts();
                } else {
                    console.error('Error loading membership functions:', data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    },

    // Membuat semua grafik fungsi keanggotaan
    createCharts: function() {
        this.createSoilMoistureChart();
        this.createAirTemperatureChart();
        this.createLightIntensityChart();
        this.createHumidityChart();
    },

    // Fungsi untuk menghitung nilai fungsi keanggotaan
    calculateMembershipValue: function(type, points, x) {
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

    // Membuat dataset untuk grafik berdasarkan definisi fungsi keanggotaan
    createDataset: function(membershipDef, label, color) {
        const dataset = {
            label: label,
            data: [],
            borderColor: color,
            backgroundColor: color.replace(')', ', 0.2)').replace('rgb', 'rgba'),
            borderWidth: 2,
            pointRadius: 0,
            fill: true
        };

        return dataset;
    },

    // Membuat grafik untuk kelembaban tanah
    createSoilMoistureChart: function() {
        const ctx = document.getElementById('soilMoistureChart').getContext('2d');
        const soilMoistureDef = this.membershipFunctions.soil_moisture;

        // Membuat dataset untuk setiap fungsi keanggotaan
        const datasets = [
            this.createDataset(soilMoistureDef.kering, 'Kering', 'rgb(255, 99, 132)'),
            this.createDataset(soilMoistureDef.sedang, 'Sedang', 'rgb(54, 162, 235)'),
            this.createDataset(soilMoistureDef.basah, 'Basah', 'rgb(75, 192, 192)')
        ];

        // Menghitung nilai untuk setiap titik pada grafik
        const labels = [];
        for (let i = 0; i <= 100; i += 1) {
            labels.push(i);
            datasets[0].data.push(this.calculateMembershipValue(
                soilMoistureDef.kering.type,
                soilMoistureDef.kering.points,
                i
            ));
            datasets[1].data.push(this.calculateMembershipValue(
                soilMoistureDef.sedang.type,
                soilMoistureDef.sedang.points,
                i
            ));
            datasets[2].data.push(this.calculateMembershipValue(
                soilMoistureDef.basah.type,
                soilMoistureDef.basah.points,
                i
            ));
        }

        // Membuat grafik
        this.charts.soilMoisture = new Chart(ctx, {
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
                        max: 1,
                        title: {
                            display: true,
                            text: 'Derajat Keanggotaan'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Kelembaban Tanah (%)'
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
                        text: 'Fungsi Keanggotaan Kelembaban Tanah'
                    }
                },
                elements: {
                    line: {
                        tension: 0.4
                    }
                }
            }
        });

        // Tambahkan indikator nilai aktual
        this.addInputIndicator('soil_moisture', this.charts.soilMoisture);
    },

    // Membuat grafik untuk suhu udara
    createAirTemperatureChart: function() {
        const ctx = document.getElementById('airTemperatureChart').getContext('2d');
        const airTemperatureDef = this.membershipFunctions.air_temperature;

        // Membuat dataset untuk setiap fungsi keanggotaan
        const datasets = [
            this.createDataset(airTemperatureDef.dingin, 'Dingin', 'rgb(54, 162, 235)'),
            this.createDataset(airTemperatureDef.sedang, 'Sedang', 'rgb(75, 192, 192)'),
            this.createDataset(airTemperatureDef.panas, 'Panas', 'rgb(255, 99, 132)')
        ];

        // Menghitung nilai untuk setiap titik pada grafik
        const labels = [];
        for (let i = 0; i <= 50; i++) {
            labels.push(i);
            datasets[0].data.push(this.calculateMembershipValue(
                airTemperatureDef.dingin.type,
                airTemperatureDef.dingin.points,
                i
            ));
            datasets[1].data.push(this.calculateMembershipValue(
                airTemperatureDef.sedang.type,
                airTemperatureDef.sedang.points,
                i
            ));
            datasets[2].data.push(this.calculateMembershipValue(
                airTemperatureDef.panas.type,
                airTemperatureDef.panas.points,
                i
            ));
        }

        // Membuat grafik
        this.charts.airTemperature = new Chart(ctx, {
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
                        max: 1,
                        title: {
                            display: true,
                            text: 'Derajat Keanggotaan'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Suhu Udara (°C)'
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
                        text: 'Fungsi Keanggotaan Suhu Udara'
                    }
                },
                elements: {
                    line: {
                        tension: 0.4
                    }
                }
            }
        });

        // Tambahkan indikator nilai aktual
        this.addInputIndicator('air_temperature', this.charts.airTemperature);
    },

    // Membuat grafik untuk intensitas cahaya
    createLightIntensityChart: function() {
        const ctx = document.getElementById('lightIntensityChart').getContext('2d');
        const lightIntensityDef = this.membershipFunctions.light_intensity;

        // Membuat dataset untuk setiap fungsi keanggotaan
        const datasets = [
            this.createDataset(lightIntensityDef.rendah, 'Rendah', 'rgb(255, 99, 132)'),
            this.createDataset(lightIntensityDef.sedang, 'Sedang', 'rgb(54, 162, 235)'),
            this.createDataset(lightIntensityDef.tinggi, 'Tinggi', 'rgb(255, 205, 86)')
        ];

        // Menghitung nilai untuk setiap titik pada grafik
        const labels = [];
        for (let i = 0; i <= 1000; i += 10) {
            labels.push(i);
            datasets[0].data.push(this.calculateMembershipValue(
                lightIntensityDef.rendah.type,
                lightIntensityDef.rendah.points,
                i
            ));
            datasets[1].data.push(this.calculateMembershipValue(
                lightIntensityDef.sedang.type,
                lightIntensityDef.sedang.points,
                i
            ));
            datasets[2].data.push(this.calculateMembershipValue(
                lightIntensityDef.tinggi.type,
                lightIntensityDef.tinggi.points,
                i
            ));
        }

        // Membuat grafik
        this.charts.lightIntensity = new Chart(ctx, {
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
                        max: 1,
                        title: {
                            display: true,
                            text: 'Derajat Keanggotaan'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Intensitas Cahaya (lux)'
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
                        text: 'Fungsi Keanggotaan Intensitas Cahaya'
                    }
                },
                elements: {
                    line: {
                        tension: 0.4
                    }
                }
            }
        });

        // Tambahkan indikator nilai aktual
        this.addInputIndicator('light_intensity', this.charts.lightIntensity);
    },

    // Membuat grafik untuk kelembaban udara
    createHumidityChart: function() {
        const ctx = document.getElementById('humidityChart').getContext('2d');
        const humidityDef = this.membershipFunctions.humidity;

        // Membuat dataset untuk setiap fungsi keanggotaan
        const datasets = [
            this.createDataset(humidityDef.rendah, 'Rendah', 'rgb(255, 99, 132)'),
            this.createDataset(humidityDef.sedang, 'Sedang', 'rgb(54, 162, 235)'),
            this.createDataset(humidityDef.tinggi, 'Tinggi', 'rgb(75, 192, 192)')
        ];

        // Menghitung nilai untuk setiap titik pada grafik
        const labels = [];
        for (let i = 0; i <= 100; i += 1) {
            labels.push(i);
            datasets[0].data.push(this.calculateMembershipValue(
                humidityDef.rendah.type,
                humidityDef.rendah.points,
                i
            ));
            datasets[1].data.push(this.calculateMembershipValue(
                humidityDef.sedang.type,
                humidityDef.sedang.points,
                i
            ));
            datasets[2].data.push(this.calculateMembershipValue(
                humidityDef.tinggi.type,
                humidityDef.tinggi.points,
                i
            ));
        }

        // Membuat grafik
        this.charts.humidity = new Chart(ctx, {
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
                        max: 1,
                        title: {
                            display: true,
                            text: 'Derajat Keanggotaan'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Kelembaban Udara (%)'
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
                        text: 'Fungsi Keanggotaan Kelembaban Udara'
                    }
                },
                elements: {
                    line: {
                        tension: 0.4
                    }
                }
            }
        });

        // Tambahkan indikator nilai aktual
        this.addInputIndicator('humidity', this.charts.humidity);
    },

    // Tambahkan indikator nilai input aktual
    addInputIndicator: function(parameter, chart) {
        // Ambil slider parameter
        const slider = document.getElementById(parameter + '_slider');
        const value = document.getElementById(parameter + '_value');

        // Event listener untuk pergerakan slider
        slider.addEventListener('input', function() {
            // Perbarui grafik saat slider bergerak
            FuzzyCharts.updateChartIndicator(parameter, parseFloat(this.value));
        });

        // Event listener untuk input langsung
        value.addEventListener('input', function() {
            // Perbarui grafik saat nilai berubah
            FuzzyCharts.updateChartIndicator(parameter, parseFloat(this.value));
        });

        // Perbarui indikator dengan nilai awal
        this.updateChartIndicator(parameter, parseFloat(slider.value));
    },

    // Perbarui indikator pada grafik
    updateChartIndicator: function(parameter, value) {
        let chart;
        let maxValue;
        let step;

        // Tentukan grafik yang akan diperbarui
        switch (parameter) {
            case 'soil_moisture':
                chart = this.charts.soilMoisture;
                maxValue = 100;
                step = 1;
                break;
            case 'air_temperature':
                chart = this.charts.airTemperature;
                maxValue = 50;
                step = 1;
                break;
            case 'light_intensity':
                chart = this.charts.lightIntensity;
                maxValue = 1000;
                step = 10;
                break;
            case 'humidity':
                chart = this.charts.humidity;
                maxValue = 100;
                step = 1;
                break;
            default:
                return;
        }

        // Perbarui anotasi
        if (!chart.options.plugins.annotation) {
            chart.options.plugins.annotation = {
                annotations: {}
            };
        }

        // Cari indeks dalam data chart sesuai dengan nilai
        const index = Math.round(value / step);

        // Perbarui anotasi indikator
        chart.options.plugins.annotation.annotations.line1 = {
            type: 'line',
            mode: 'vertical',
            scaleID: 'x',
            value: value,
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 2,
            label: {
                backgroundColor: 'rgb(255, 99, 132)',
                content: value.toString(),
                enabled: true
            }
        };

        // Perbarui chart
        chart.update();
    }
};

// Inisialisasi saat dokumen selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi grafik
    FuzzyCharts.initialize();
});