# Sistem Kontrol Cerdas Tanaman Tomat

Sistem Manajemen Berbasis Logika Fuzzy dengan Pembelajaran Adaptif untuk optimalisasi pertumbuhan tanaman tomat dalam lingkungan terkontrol.

![Sistem Kontrol Cerdas](https://via.placeholder.com/800x400?text=Sistem+Kontrol+Cerdas+Tanaman+Tomat)

## 📋 Deskripsi

Sistem Kontrol Cerdas Tanaman Tomat adalah aplikasi berbasis web yang menerapkan logika fuzzy dan pembelajaran adaptif untuk mengontrol parameter lingkungan vital pada pertumbuhan tanaman tomat, termasuk kelembaban tanah, suhu udara, intensitas cahaya, dan kelembaban udara. Sistem ini tidak hanya mengimplementasikan aturan fuzzy statis tetapi juga memiliki kemampuan belajar dan beradaptasi seiring waktu, meningkatkan hasil pertumbuhan tanaman.

### 🌟 Fitur Utama

- **Panel Kontrol Fuzzy**: Kontrol parameter input dengan visualisasi derajat keanggotaan.
- **Simulasi Tanaman**: Simulasi visual pertumbuhan tanaman berdasarkan parameter lingkungan.
- **Dashboard Performa**: Pemantauan dan analisis kesehatan dan pertumbuhan tanaman.
- **Integrasi Cuaca**: Pengambilan data cuaca real-time dan penerapannya ke simulasi.
- **Pembelajaran Adaptif**: Penyesuaian otomatis aturan fuzzy berdasarkan performa tanaman.
- **Konfigurasi Sistem**: Antarmuka untuk mengubah fungsi keanggotaan dan aturan fuzzy.

## 🔧 Persyaratan Sistem

- PHP 7.4 atau lebih tinggi
- MySQL 5.7 atau lebih tinggi
- Web server (Apache, Nginx)
- Browser web modern dengan JavaScript dan CSS3 support

## 🚀 Panduan Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/SsKristianto/Pertanian-Fuzzy.git
cd Pertanian-Fuzzy
```

### 2. Setup Database (Bisa Dengan Import Dari Database.md Maupun Dari File .sql)

```bash
# Buat database baru
mysql -u root -p -e "CREATE DATABASE fuzzy_tomato_system"

# Import skema database
mysql -u root -p fuzzy_tomato_system < database/fuzzy_tomato_system.sql

# (Opsional) Import data contoh
mysql -u root -p fuzzy_tomato_system < database/sample_data.sql
```

### 3. Konfigurasi Koneksi Database

Edit file `php/connect.php` dan sesuaikan parameter koneksi:

```php
$host = 'localhost';      // Host database
$dbname = 'fuzzy_tomato_system';  // Nama database
$username = 'root';       // Username database
$password = '';           // Password database
```

### 4. Konfigurasi API Cuaca (Opsional)

Untuk menggunakan fitur integrasi cuaca, daftar dan dapatkan API key dari [WeatherAPI.com](https://www.weatherapi.com/), kemudian perbarui file `javascript/weather_integration.js`:

```javascript
// Konfigurasi
config: {
    // API Key untuk WeatherAPI.com
    apiKey: "YOUR_API_KEY_HERE",
    
    // Lokasi default
    location: "Palangkaraya",
    
    // ...
}
```

### 5. Deploy ke Web Server

- Salin seluruh folder ke direktori web server (htdocs, www, atau public_html).
- Pastikan web server memiliki izin baca/tulis pada direktori `cache/`.

### 6. Buka Aplikasi

Buka browser dan akses aplikasi melalui URL:

```
http://localhost/sistem-kontrol-cerdas-tomat/
```

## 📖 Panduan Penggunaan

### Panel Kontrol

1. **Pengaturan Parameter Input**:
   - Gunakan slider atau masukkan nilai numerik untuk mengatur kelembaban tanah, suhu udara, intensitas cahaya, dan kelembaban udara.
   - Nilai keanggotaan fuzzy ditampilkan secara otomatis.

2. **Perhitungan Output**:
   - Klik "Hitung Output" untuk memperoleh rekomendasi kontrol berdasarkan input.
   - Hasil output meliputi durasi irigasi, pengaturan suhu, dan kontrol pencahayaan.

3. **Penyimpanan Pengaturan**:
   - Klik "Simpan Pengaturan" untuk menyimpan parameter dan output ke database.

4. **Penerapan ke Simulasi**:
   - Klik "Terapkan ke Simulasi" untuk menggunakan parameter saat ini dalam simulasi tanaman.

### Simulasi Tanaman

1. **Mulai Simulasi Baru**:
   - Klik "Mulai Simulasi Baru" untuk memulai simulasi pertumbuhan tanaman tomat.

2. **Kontrol Simulasi**:
   - Gunakan tombol "Maju 1 Hari" untuk mempercepat simulasi.
   - Sesuaikan kecepatan waktu dengan tombol +/-.
   - Aktifkan "Mode Adaptif" untuk menerapkan pembelajaran otomatis.

3. **Reset Simulasi**:
   - Klik "Reset Simulasi" untuk mengembalikan tanaman ke kondisi awal.

### Dashboard & Konfigurasi

1. **Dashboard Performa**:
   - Pantau kesehatan tanaman, tingkat pertumbuhan, jumlah buah, dan fase pertumbuhan.
   - Lihat riwayat parameter dan kondisi lingkungan.
   - Akses prakiraan cuaca dan rekomendasinya.

2. **Konfigurasi Fungsi Keanggotaan**:
   - Edit fungsi keanggotaan fuzzy dengan antarmuka visual.
   - Simpan perubahan untuk diterapkan pada sistem.

3. **Konfigurasi Aturan Fuzzy**:
   - Tambah, edit, atau hapus aturan fuzzy.
   - Filter aturan berdasarkan fase pertumbuhan atau tipe.

4. **Pembelajaran Adaptif**:
   - Aktifkan pembelajaran adaptif untuk menyesuaikan aturan fuzzy secara otomatis.
   - Pantau performa sistem dan penyesuaian aturan.

## 📁 Struktur Folder dan File

### Struktur Utama

```
sistem-kontrol-cerdas-tomat/
├── css/                        # File stylesheet
├── javascript/                 # File JavaScript
├── php/                        # File PHP (backend)
├── database/                   # File database
├── cache/                      # Folder cache (dibuat otomatis)
└── index.html                  # Halaman utama aplikasi
```

### File JavaScript

```
javascript/
├── adaptive_learning.js        # Implementasi mekanisme pembelajaran adaptif
├── chart.js                    # Visualisasi grafik fungsi keanggotaan
├── dashboard_extension.js      # Fungsionalitas dashboard
├── fuzzy_config.js             # Interface konfigurasi sistem fuzzy
├── fuzzy_logic.js              # Implementasi logika fuzzy
├── greenhouse_simulation.js    # Simulasi visual greenhouse
├── ui_interaction.js           # Interaksi antarmuka pengguna
└── weather_integration.js      # Integrasi data cuaca
```

### File PHP

```
php/
├── adaptive_learning.php       # Penanganan pembelajaran adaptif
├── connect.php                 # Koneksi database
├── dashboard_data.php          # Penyediaan data dashboard
├── fuzzy_logic.php             # Perhitungan logika fuzzy
├── get_data.php                # Pengambilan data dari database
├── manage_rules.php            # Manajemen aturan fuzzy
├── plant_simulation.php        # Pengelolaan simulasi tanaman
├── save_settings.php           # Penyimpanan pengaturan
└── update_membership.php       # Pembaruan fungsi keanggotaan
```

### File CSS

```
css/
├── chart_style.css             # Styling untuk elemen chart
├── simulation_style.css        # Styling untuk simulasi tanaman
└── style.css                   # Styling utama aplikasi
```

### Database

```
database/
├── schema.sql                  # Skema database
└── sample_data.sql             # Data sampel untuk pengujian
```

## 🔍 Deskripsi File

### File PHP

| Nama File | Kegunaan |
|-----------|----------|
| `connect.php` | Koneksi ke database MySQL dan fungsi sanitasi input |
| `fuzzy_logic.php` | Perhitungan logika fuzzy (fuzzifikasi, inferensi, defuzzifikasi) |
| `plant_simulation.php` | Pengelolaan simulasi pertumbuhan tanaman berdasarkan parameter lingkungan |
| `get_data.php` | Pengambilan data aturan fuzzy, parameter input/output, dan fungsi keanggotaan |
| `save_settings.php` | Penyimpanan parameter input/output dan aturan fuzzy baru |
| `update_membership.php` | Pembaruan definisi fungsi keanggotaan fuzzy |
| `adaptive_learning.php` | Penanganan mekanisme pembelajaran adaptif |
| `manage_rules.php` | Manajemen aturan fuzzy (tambah, edit, hapus) |
| `dashboard_data.php` | Penyediaan data untuk dashboard (status tanaman, riwayat, prediksi) |

### File JavaScript

| Nama File | Kegunaan |
|-----------|----------|
| `fuzzy_logic.js` | Implementasi logika fuzzy client-side dan pembaruan UI |
| `chart.js` | Visualisasi grafik fungsi keanggotaan dan output fuzzy |
| `ui_interaction.js` | Penanganan interaksi UI (slider, button, notification) |
| `greenhouse_simulation.js` | Simulasi visual pertumbuhan tanaman dan kondisi lingkungan |
| `weather_integration.js` | Pengambilan dan visualisasi data cuaca dari API |
| `dashboard_extension.js` | Fungsionalitas dashboard (performa, kondisi, riwayat, prakiraan) |
| `adaptive_learning.js` | Implementasi mekanisme pembelajaran adaptif |
| `fuzzy_config.js` | Interface untuk konfigurasi fungsi keanggotaan dan aturan fuzzy |

## 🔧 Teknologi yang Digunakan

- **Backend**: PHP, MySQL
- **Frontend**: HTML5, CSS3, JavaScript
- **Visualisasi**: Chart.js
- **Ikon**: Font Awesome
- **API**: WeatherAPI.com (integrasi cuaca)

## 📈 Pengembangan Lebih Lanjut

- Integrasi dengan sensor IoT untuk pengambilan data real-time
- Implementasi sistem kontrol hardware (aktuator)
- Analisis prediktif menggunakan machine learning
- Dukungan untuk berbagai jenis tanaman

## 📝 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
