<?php
/**
 * update_membership.php
 * 
 * File ini menangani pembaruan fungsi keanggotaan fuzzy
 */

// Koneksi ke database
include('connect.php');

// Pastikan request adalah POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metode tidak diizinkan']);
    exit;
}

// Ambil data dari raw POST
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validasi data
if (!isset($data['parameter']) || !isset($data['functions'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Data tidak lengkap']);
    exit;
}

$parameter = sanitizeInput($data['parameter']);
$functions = $data['functions'];

// Validasi parameter
$valid_parameters = ['soil_moisture', 'air_temperature', 'light_intensity', 'humidity', 
                    'irrigation_duration', 'temperature_setting', 'light_control'];
                    
if (!in_array($parameter, $valid_parameters)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Parameter tidak valid']);
    exit;
}

// Validasi functions
foreach ($functions as $function_name => $function_data) {
    if (!isset($function_data['type']) || !isset($function_data['points'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Format fungsi tidak valid']);
        exit;
    }
    
    // Validasi tipe fungsi
    if (!in_array($function_data['type'], ['triangle', 'trapezoid'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Tipe fungsi tidak valid']);
        exit;
    }
    
    // Validasi jumlah points berdasarkan tipe
    $expected_points = ($function_data['type'] === 'triangle') ? 3 : 4;
    if (count($function_data['points']) !== $expected_points) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => "Jumlah titik tidak valid untuk fungsi {$function_data['type']}"
        ]);
        exit;
    }
}

try {
    // Cek apakah tabel membership_functions ada, jika tidak, buat tabel
    $tableExistsQuery = "SHOW TABLES LIKE 'membership_functions'";
    $tableExistsStmt = $pdo->query($tableExistsQuery);
    $tableExists = ($tableExistsStmt && $tableExistsStmt->rowCount() > 0);
    
    if (!$tableExists) {
        // Buat tabel jika belum ada
        $createTableQuery = "CREATE TABLE membership_functions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            parameter VARCHAR(50) NOT NULL,
            functions LONGTEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        $pdo->exec($createTableQuery);
        // Sekarang tabel sudah ada
        $tableExists = true;
    }
    
    // Simpan ke database
    if ($tableExists) {
        // Cek apakah konfigurasi sudah ada di database
        $checkQuery = "SELECT * FROM membership_functions WHERE parameter = ?";
        $stmt = $pdo->prepare($checkQuery);
        $stmt->execute([$parameter]);
        
        if ($stmt->rowCount() > 0) {
            // Update konfigurasi yang ada
            $updateQuery = "UPDATE membership_functions 
                          SET functions = ?, 
                              updated_at = CURRENT_TIMESTAMP
                          WHERE parameter = ?";
            
            $stmt = $pdo->prepare($updateQuery);
            $stmt->execute([json_encode($functions), $parameter]);
        } else {
            // Tambahkan konfigurasi baru
            $insertQuery = "INSERT INTO membership_functions 
                          (parameter, functions) 
                          VALUES (?, ?)";
            
            $stmt = $pdo->prepare($insertQuery);
            $stmt->execute([$parameter, json_encode($functions)]);
        }
        
        // Cache update untuk get_data.php
        $cache_file = 'cache/membership_' . $parameter . '.json';
        $cache_dir = 'cache';
        
        if (!is_dir($cache_dir)) {
            mkdir($cache_dir, 0755, true);
        }
        
        file_put_contents($cache_file, json_encode([
            'parameter' => $parameter,
            'functions' => $functions,
            'updated_at' => date('Y-m-d H:i:s')
        ]));
        
        // Kembalikan respons sukses
        echo json_encode([
            'success' => true, 
            'message' => 'Fungsi keanggotaan berhasil diperbarui',
            'parameter' => $parameter,
            'saved_to' => 'database'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>