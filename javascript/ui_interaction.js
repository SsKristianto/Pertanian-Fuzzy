function submitParameters() {
    const soil_moisture = document.getElementById('soil_moisture').value;
    const air_temperature = document.getElementById('air_temperature').value;
    const light_intensity = document.getElementById('light_intensity').value;
    const humidity = document.getElementById('humidity').value;

    fetch('php/fuzzy_logic.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `soil_moisture=${soil_moisture}&air_temperature=${air_temperature}&light_intensity=${light_intensity}&humidity=${humidity}`
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('irrigation_duration').innerText = `Durasi Irigasi: ${data.irrigation_duration}`;
            document.getElementById('temperature_setting').innerText = `Pengaturan Suhu: ${data.temperature_setting}`;
            document.getElementById('light_control').innerText = `Kontrol Pencahayaan: ${data.light_control}`;
        });
}