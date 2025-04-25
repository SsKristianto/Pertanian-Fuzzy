// Fungsi untuk mengatur tampilan mode input (manual/otomatis)
function toggleInputMode() {
    var inputMode = document.getElementById('input_mode').value;
    if (inputMode === "manual") {
        document.getElementById('manualInput').style.display = "block"; // Menampilkan input manual
        document.getElementById('automaticInput').style.display = "none"; // Menyembunyikan input otomatis
    } else {
        document.getElementById('manualInput').style.display = "none"; // Menyembunyikan input manual
        document.getElementById('automaticInput').style.display = "block"; // Menampilkan input otomatis
    }
}

// Fungsi untuk mengambil data cuaca otomatis dari API
function fetchWeatherData() {
    // Ganti dengan API cuaca yang sesuai
    fetch('https://api.weatherapi.com/v1/current.json?key=ab0f72154b424c60a9b70250252504&q=palangkaraya')
        .then(response => response.json())
        .then(data => {
            const temp = data.current.temp_c; // Suhu dalam Celcius
            const humidity = data.current.humidity; // Kelembaban udara
            const lightIntensity = temp > 30 ? 'tinggi' : 'rendah'; // Simulasi intensitas cahaya (misalnya berdasarkan suhu)
            const soilMoisture = humidity > 70 ? 'basah' : 'sedang'; // Simulasi kelembaban tanah berdasarkan kelembaban udara

            // Menampilkan data cuaca yang diperoleh
            document.getElementById('weatherData').innerHTML = `
                Suhu: ${temp}°C<br>
                Kelembaban Udara: ${humidity}%<br>
                Intensitas Cahaya: ${lightIntensity}<br>
                Kelembaban Tanah: ${soilMoisture}
            `;

            // Secara otomatis mengisi form input berdasarkan data cuaca (optional)
            document.getElementById('soil_moisture').value = soilMoisture;
            document.getElementById('air_temperature').value = temp > 30 ? 'panas' : 'sedang';
            document.getElementById('light_intensity').value = lightIntensity;
            document.getElementById('humidity').value = humidity > 70 ? 'tinggi' : 'sedang';
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            document.getElementById('weatherData').innerText = 'Gagal memuat data cuaca.';
        });
}