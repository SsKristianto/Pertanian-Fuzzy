# TUGAS 
Project Logika Fuzzy: Sistem Kontrol Cerdas untuk Smart Farming 
Pertanian modern menghadapi tantangan dalam mengoptimalkan produksi dengan sumber daya 
terbatas, sambil beradaptasi dengan perubahan iklim dan meningkatnya permintaan pangan global. 
Smart farming memanfaatkan teknologi untuk meningkatkan efisiensi, keberlanjutan, dan 
produktivitas dalam pertanian. Logika fuzzy menawarkan pendekatan yang ideal untuk mengatasi 
ketidakpastian dan variabilitas dalam lingkungan pertanian, memungkinkan sistem kontrol adaptif 
yang dapat menangani input yang ambigu atau tidak presisi. 

Tujuan Project 
Mengembangkan sistem kontrol cerdas berbasis logika fuzzy untuk otomatisasi 
greenhouse/pertanian cerdas yang dapat mengontrol irigasi, suhu, pencahayaan, dan ventilasi 
berdasarkan berbagai parameter lingkungan untuk menciptakan kondisi optimal bagi 
pertumbuhan tanaman. 
Spesifikasi Project 

1. Domain dan Parameter 
• Tanaman Target:  
o Mahasiswa dapat memilih jenis tanaman spesifik (sayuran, buah, atau tanaman 
hias) 
o Alternatif: desain sistem generik yang dapat dikonfigurasi untuk berbagai jenis 
tanaman 
• Parameter Input (minimal 4 dari berikut):  
o Kelembaban tanah (kering, lembab, basah) 
o Suhu udara (dingin, sedang, panas) 
o Kelembaban udara (kering, sedang, lembab) 
o Intensitas cahaya (rendah, sedang, tinggi) 
o Kadar CO2 (rendah, normal, tinggi) 
o pH tanah (asam, netral, basa) 
o Kadar nutrisi (kurang, cukup, berlebih) 
o Waktu (pagi, siang, sore, malam) 
o Fase pertumbuhan tanaman (bibit, vegetatif, generatif, panen) 
• Parameter Output (minimal 3 dari berikut):  
o Lama irigasi (tidak ada, singkat, sedang, lama) 
o Intensitas irigasi (rendah, sedang, tinggi) 
o Pengaturan suhu (menurunkan, mempertahankan, menaikkan) 
o Kontrol pencahayaan (mati, redup, sedang, terang) 
o Kontrol ventilasi (tutup, buka sebagian, buka penuh) 
o Dosis nutrisi (tidak ada, sedikit, sedang, banyak) 
o Aplikasi pestisida (tidak ada, minimal, moderat, intensif) 

2. Implementasi Logika Fuzzy 
1. Fuzzifikasi  
o Desain fungsi keanggotaan untuk setiap variabel input dan output 
o Implementasi proses fuzzifikasi untuk mengkonversi nilai crisp ke fuzzy sets 
o Minimum 3 term linguistik (misalnya: rendah, sedang, tinggi) untuk setiap 
variabel 
o Penggunaan fungsi keanggotaan yang sesuai (triangular, trapezoidal, gaussian, 
dll) 

2. Basis Aturan Fuzzy  
o Minimum 20 aturan IF-THEN yang komprehensif 
o Penggunaan operator fuzzy (AND, OR) dalam kondisi aturan 
o Desain aturan berdasarkan pengetahuan domain tentang pertanian 
o Contoh: IF kelembaban_tanah IS kering AND suhu IS tinggi THEN durasi_irigasi 
IS lama 

3. Inferensi Fuzzy  
o Implementasi metode inferensi (Mamdani atau Sugeno) 
o Evaluasi derajat keanggotaan untuk setiap aturan 
o Agregasi output dari semua aturan yang aktif 

4. Defuzzifikasi  
o Implementasi metode defuzzifikasi (centroid, weighted average, dll) 
o Konversi hasil fuzzy menjadi nilai crisp untuk aktuator 


3. Pengembangan Sistem 
1. Simulasi Lingkungan  
o Pembuatan model simulasi greenhouse/lahan pertanian 
o Simulasi perubahan parameter lingkungan berdasarkan input eksternal dan 
aktuator 
o Simulasi respons tanaman terhadap kondisi lingkungan 

2. Antarmuka Pengguna  
o Panel kontrol untuk monitoring parameter lingkungan 
o Visualisasi fungsi keanggotaan dan proses fuzzy 
o Dashboard performa sistem dan kondisi tanaman 
o Interface untuk konfigurasi sistem (aturan, fungsi keanggotaan) 

3. Fitur Tambahan (minimal 2)  
o Pembelajaran adaptif untuk menyesuaikan aturan berdasarkan hasil 
o Integrasi dengan data cuaca untuk antisipasi perubahan lingkungan 
o Pengoptimalan multi-objektif (hasil, air, energi) 
o Deteksi anomali dan sistem peringatan 
o Perbandingan dengan sistem kontrol konvensional (on/off) 
o Sistem prediksi hasil panen 
o Analisis efisiensi sumber daya 

4. Evaluasi Sistem 
1. Skenario Pengujian  
o Pengujian dalam berbagai kondisi lingkungan (normal, ekstrem) 
o Evaluasi respons sistem terhadap perubahan mendadak 
o Pengujian jangka panjang untuk stabilitas 
2. Metrik Evaluasi  
o Stabilitas parameter lingkungan 
o Efisiensi penggunaan sumber daya (air, energi) 
o Performa dibandingkan dengan sistem kontrol konvensional 
o Kesehatan dan produktivitas tanaman (dalam simulasi) 

Yang dikumpulkan  
1. Aplikasi Simulasi Sistem Kontrol Smart Farming  
o Source code lengkap dengan dokumentasi 
o Executable atau aplikasi web yang dapat dijalankan 
o Panduan instalasi dan penggunaan 
2. Dokumentasi Sistem Fuzzy  
o Definisi lengkap fungsi keanggotaan untuk setiap variabel 
o Basis aturan fuzzy dengan penjelasan logika 
o Penjelasan metode inferensi dan defuzzifikasi yang digunakan 
o Diagram alur sistem kontrol 
3. Laporan Teknis (15-20 halaman)  
o Landasan teori logika fuzzy 
o Deskripsi domain dan kebutuhan sistem 
o Metodologi pengembangan sistem 
o Desain dan implementasi detail 
o Hasil evaluasi dan analisis performa 
o Perbandingan dengan sistem kontrol konvensional 
o Diskusi kelebihan dan keterbatasan 
o Rekomendasi untuk pengembangan lebih lanjut 
4. Video Demonstrasi (5-7 menit)  
o Overview sistem dan fitur utama 
o Demonstrasi fungsionalitas dalam berbagai skenario 
o Visualisasi proses fuzzy dan respons sistem 
o Penjelasan hasil dan keuntungan pendekatan 
5. Presentasi (15-20 menit)  
o Pengenalan domain dan pendekatan 
o Penjelasan implementasi logika fuzzy 
o Demo sistem 
o Hasil evaluasi dan diskusi 


Kriteria Penilaian Detil 
1. Kualitas Implementasi Logika Fuzzy (35%)  
o Desain fungsi keanggotaan (10%) 
o Kelengkapan dan ketepatan basis aturan (10%) 
o Implementasi inferensi dan defuzzifikasi (10%) 
o Justifikasi dan penjelasan pendekatan (5%) 
2. Fungsionalitas Sistem (20%)  
o Respons system terhadap berbagai kondisi (5%) 
o Kualitas simulasi lingkungan (5%) 
o Implementasi fitur tambahan (5%) 
o Kehandalan dan stabilitas sistem (5%) 
3. Antarmuka dan Visualisasi (15%)  
o Kegunaan dan desain antarmuka (5%) 
o Visualisasi proses fuzzy (5%) 
o Dashboard dan representasi data (5%) 
4. Evaluasi dan Analisis (15%)  
o Metodologi pengujian (5%) 
o Kedalaman analisis hasil (5%) 
o Perbandingan dengan pendekatan lain (5%) 
5. Dokumentasi dan Presentasi (15%)  
o Kelengkapan dokumentasi (5%) 
o Kualitas presentasi (5%) 
o Kemampuan menjawab pertanyaan (5%) 
