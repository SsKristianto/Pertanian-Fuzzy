<?php
/**
 * connect.php
 * File untuk koneksi database
 * 
 * File ini bertugas menghubungkan aplikasi dengan database MySQL
 */

$host = 'localhost';  // ganti dengan host server Anda
$dbname = 'fuzzy_tomato_system';
$username = 'root';   // ganti dengan username MySQL Anda
$password = '';       // ganti dengan password MySQL Anda

try {
    // Membuat koneksi ke database menggunakan PDO
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    
    // Mengatur PDO untuk menampilkan error
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Mengatur charset menjadi utf8mb4
    $pdo->exec("SET NAMES utf8mb4");
    
} catch (PDOException $e) {
    // Jika terjadi kesalahan pada koneksi, tampilkan pesan error
    die("Koneksi database gagal: " . $e->getMessage());
}

// Fungsi untuk membersihkan input dari pengguna
function sanitizeInput($input) {
    $input = trim($input);
    $input = stripslashes($input);
    $input = htmlspecialchars($input);
    return $input;
}
?>