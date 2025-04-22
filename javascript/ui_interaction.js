document.getElementById("submitBtn").addEventListener("click", function() {
    const humidity = document.getElementById("humidity").value === 'low' ? 20 :
        document.getElementById("humidity").value === 'medium' ? 50 : 80;
    const temperature = document.getElementById("temperature").value === 'low' ? 15 :
        document.getElementById("temperature").value === 'medium' ? 25 : 35;
    const light = document.getElementById("light").value === 'low' ? 30 :
        document.getElementById("light").value === 'medium' ? 60 : 90;

    const result = fuzzyLogic(humidity, temperature, light);

    // Menampilkan hasil ke UI
    document.getElementById("irrigation-duration").textContent = result.irrigation;
    document.getElementById("temperature-setting").textContent = result.temp_setting;
    document.getElementById("light-control").textContent = result.light_control;
});