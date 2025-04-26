# Sistem Kontrol Cerdas Tanaman Tomat

Sistem ini merupakan implementasi dari kontrol cerdas berbasis logika fuzzy untuk manajemen tanaman tomat. Menggunakan pendekatan Mamdani untuk sistem inferensi fuzzy, aplikasi ini mengendalikan irigasi, suhu, dan pencahayaan secara otomatis berdasarkan kondisi lingkungan.

## Fitur Utama

- **Pengukuran Parameter Lingkungan**: Monitor kelembaban tanah, suhu udara, intensitas cahaya, dan kelembaban udara
- **Sistem Fuzzy Mamdani**: Fuzzifikasi, inferensi fuzzy, dan defuzzifikasi untuk pengambilan keputusan cerdas
- **Visualisasi Fungsi Keanggotaan**: Tampilan grafis fungsi keanggotaan untuk semua parameter input dan output
- **Basis Aturan Fuzzy**: 20 aturan fuzzy yang dapat diperbarui dan diperluas
- **Integrasi Data Cuaca**: Simulasi data cuaca untuk pengujian
- **Antarmuka Pengguna Interaktif**: Dashboard mudah digunakan dengan slider interaktif dan tampilan output menarik

## Struktur Folder

```
/your-project-folder
│
├── index.html                   # Halaman utama aplikasi
│
├── /php
│   ├── connect.php              # Menghubungkan dengan database MySQL
│   ├── get_data.php             # Mengambil data dari database
│   ├── save_settings.php        # Menyimpan pengaturan ke database
│   └── fuzzy_logic.php          # Implementasi logika fuzzy
│
├── /javascript
│   ├── fuzzy_logic.js           # Logika fuzzy sisi klien
│   ├── ui_interaction.js        # Interaksi antarmuka pengguna
│   ├── chart.js                 # Visualisasi grafik fungsi keanggotaan
│   └── weather_integration.js   # Integrasi dengan data cuaca
│
├── /css
│   ├── style.css                # Gaya utama antarmuka
│   └── chart_style.css          # Gaya untuk chart dan visualisasi
│
├── /testing
│   ├── test_fuzzy_logic.php     # Pengujian unit logika fuzzy
│   └── test_ui.js               # Pengujian antarmuka pengguna
│
├── /assets                      # Aset untuk aplikasi (gambar, dll)
│
└── Databse.md           # Script pembuatan database
```

## Instalasi dan Pengaturan

### Persyaratan Sistem

- Web server (Apache, Nginx)
- PHP 7.4+
- MySQL 5.7+ atau MariaDB 10.3+
- Browser modern dengan dukungan JavaScript

### Langkah Instalasi

1. **Persiapkan Database**:
   - Buat database MySQL baru
   - Jalankan script `database_setup.sql` untuk membuat struktur tabel dan data awal

2. **Konfigurasi Koneksi Database**:
   - Edit file `php/connect.php` dengan detail koneksi database Anda

3. **Upload File**:
   - Upload semua file ke direktori web server Anda

4. **Akses Aplikasi**:
   - Buka aplikasi melalui browser

## Komponen Sistem

### Fuzzifikasi

Sistem menggunakan fungsi keanggotaan triangular dan trapesium untuk mengubah nilai-nilai input crisp menjadi derajat keanggotaan fuzzy:

- **Kelembaban Tanah**: Kering (0-40%), Sedang (30-70%), Basah (60-100%)
- **Suhu Udara**: Dingin (0-20°C), Sedang (15-30°C), Panas (25-50°C)
- **Intensitas Cahaya**: Rendah (0-400 lux), Sedang (300-700 lux), Tinggi (600-1000 lux)
- **Kelembaban Udara**: Rendah (0-40%), Sedang (30-70%), Tinggi (60-100%)

### Inferensi Fuzzy

Menggunakan metode Mamdani (Min-Max) untuk mengevaluasi 20 aturan fuzzy yang mendefinisikan hubungan antara input dan output. Aturan diformat sebagai:

```
JIKA kelembaban_tanah IS kering AND suhu_udara IS panas AND intensitas_cahaya IS tinggi AND kelembaban_udara IS rendah
MAKA durasi_irigasi IS lama AND pengaturan_suhu IS menurunkan AND kontrol_pencahayaan IS redup
```

### Defuzzifikasi

Menggunakan metode centroid (center of gravity) untuk mengubah output fuzzy menjadi nilai crisp:

- **Durasi Irigasi**: Tidak Ada (0-20 menit), Singkat (10-40 menit), Sedang (30-70 menit), Lama (60-100 menit)
- **Pengaturan Suhu**: Menurunkan (-10 hingga -3°C), Mempertahankan (-5 hingga +5°C), Menaikkan (+3 hingga +10°C)
- **Kontrol Pencahayaan**: Mati (0-20%), Redup (10-40%), Sedang (30-70%), Terang (60-100%)

## Pengujian Sistem

### Pengujian Logika Fuzzy

Sistem menyediakan modul pengujian untuk memvalidasi:
- Fungsi keanggotaan input dan output
- Proses inferensi fuzzy
- Algoritma defuzzifikasi
- Pengujian end-to-end sistem

Untuk menjalankan pengujian fuzzy, akses:
```
http://[alamat-server]/testing/test_fuzzy_logic.php
```

### Pengujian UI

Pengujian UI memvalidasi:
- Sinkronisasi input dan slider
- Respons dari aksi pengguna
- Rendering visualisasi fungsi keanggotaan
- Tampilan output yang benar

Untuk menjalankan pengujian UI:
```javascript
// Di konsol browser
window.runUITests();
```

## Pengembangan Lebih Lanjut

Sistem ini dapat dikembangkan dengan:
- Menambahkan lebih banyak parameter lingkungan (misalnya CO2, pH tanah)
- Mengembangkan basis aturan fuzzy yang lebih kompleks
- Integrasi dengan sensor fisik IoT (Internet of Things)
- Penambahan sistem peringatan dan notifikasi
- Peningkatan analisis data dan visualisasi jangka panjang

## Kontribusi

Kontribusi untuk pengembangan sistem ini sangat diterima. Silakan fork repositori dan kirimkan pull request untuk perbaikan atau peningkatan apa pun.

## Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT - lihat file LICENSE untuk detailnya.