function submitParameters() {
    const soil_moisture = document.getElementById('soil_moisture').value;
    const air_temperature = document.getElementById('air_temperature').value;
    const light_intensity = document.getElementById('light_intensity').value;
    const humidity = document.getElementById('humidity').value;
    const input_mode = document.getElementById('input_mode').value;

    const formData = new URLSearchParams();
    formData.append('soil_moisture', soil_moisture);
    formData.append('air_temperature', air_temperature);
    formData.append('light_intensity', light_intensity);
    formData.append('humidity', humidity);
    formData.append('input_mode', input_mode); // Pastikan input_mode dikirimkan dengan benar

    fetch('php/fuzzy_logic.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        })
        .then(response => response.json()) // Mengharapkan respons dalam format JSON
        .then(data => {
            console.log(data); // Debugging: melihat data yang diterima

            // Menampilkan output hasil perhitungan logika fuzzy
            document.getElementById('irrigation_duration').innerText = `Durasi Irigasi: ${data.irrigation_duration}`;
            document.getElementById('temperature_setting').innerText = `Pengaturan Suhu: ${data.temperature_setting}`;
            document.getElementById('light_control').innerText = `Kontrol Pencahayaan: ${data.light_control}`;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat memproses data');
        });
}