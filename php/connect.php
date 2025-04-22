<?php
$host = 'localhost';  // ganti dengan host Anda
$dbname = 'fuzzy_tomato_system';
$username = 'root';   // ganti dengan username MySQL Anda
$password = '';       // ganti dengan password MySQL Anda

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>
