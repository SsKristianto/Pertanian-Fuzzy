<?php
/**
 * manage_rules.php
 * 
 * File ini menangani manajemen aturan fuzzy
 * termasuk menambah, mengedit, dan menghapus aturan
 */

// Koneksi ke database
include('connect.php');

// Pastikan request adalah POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metode tidak diizinkan']);
    exit;
}

// Ambil perintah dari request
$command = isset($_POST['command']) ? sanitizeInput($_POST['command']) : '';

// Proses perintah
switch ($command) {
    case 'add_rule':
        // Tambah aturan baru
        addRule();
        break;
        
    case 'update_rule':
        // Update aturan yang ada
        updateRule();
        break;
        
    case 'delete_rule':
        // Hapus aturan
        deleteRule();
        break;
        
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Perintah tidak dikenal']);
        break;
}

/**
 * Tambah aturan baru
 */
function addRule() {
    try {
        global $pdo;
        
        // Ambil parameter dari POST
        $soil_moisture = isset($_POST['soil_moisture']) ? sanitizeInput($_POST['soil_moisture']) : '';
        $air_temperature = isset($_POST['air_temperature']) ? sanitizeInput($_POST['air_temperature']) : '';
        $light_intensity = isset($_POST['light_intensity']) ? sanitizeInput($_POST['light_intensity']) : '';
        $humidity = isset($_POST['humidity']) ? sanitizeInput($_POST['humidity']) : '';
        $irrigation_duration = isset($_POST['irrigation_duration']) ? sanitizeInput($_POST['irrigation_duration']) : '';
        $temperature_setting = isset($_POST['temperature_setting']) ? sanitizeInput($_POST['temperature_setting']) : '';
        $light_control = isset($_POST['light_control']) ? sanitizeInput($_POST['light_control']) : '';
        $plant_stage = isset($_POST['plant_stage']) ? sanitizeInput($_POST['plant_stage']) : null;
        $confidence_level = isset($_POST['confidence_level']) ? (int)$_POST['confidence_level'] : 100;
        $is_adaptive = isset($_POST['is_adaptive']) ? (int)$_POST['is_adaptive'] : 0;
        
        // Validasi parameter wajib
        if (empty($soil_moisture) || empty($air_temperature) || empty($light_intensity) || empty($humidity) ||
            empty($irrigation_duration) || empty($temperature_setting) || empty($light_control)) {
            throw new Exception("Semua parameter utama harus diisi");
        }
        
        // Cek apakah aturan serupa sudah ada
        $checkQuery = "SELECT id FROM fuzzy_rules 
                      WHERE soil_moisture = ? 
                      AND air_temperature = ? 
                      AND light_intensity = ? 
                      AND humidity = ?";
        
        $params = [$soil_moisture, $air_temperature, $light_intensity, $humidity];
        
        if (!empty($plant_stage)) {
            $checkQuery .= " AND plant_stage = ?";
            $params[] = $plant_stage;
        } else {
            $checkQuery .= " AND (plant_stage IS NULL OR plant_stage = '')";
        }
        
        $stmt = $pdo->prepare($checkQuery);
        $stmt->execute($params);
        
        if ($stmt->rowCount() > 0) {
            throw new Exception("Aturan dengan kondisi yang sama sudah ada");
        }
        
        // Tambahkan aturan baru
        $insertQuery = "INSERT INTO fuzzy_rules 
                       (soil_moisture, air_temperature, light_intensity, humidity,
                        irrigation_duration, temperature_setting, light_control,
                        plant_stage, confidence_level, is_adaptive, active) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)";
                       
        $stmt = $pdo->prepare($insertQuery);
        $stmt->execute([
            $soil_moisture, $air_temperature, $light_intensity, $humidity,
            $irrigation_duration, $temperature_setting, $light_control,
            $plant_stage, $confidence_level, $is_adaptive
        ]);
        
        $ruleId = $pdo->lastInsertId();
        
        // Respons sukses
        echo json_encode([
            'success' => true, 
            'message' => 'Aturan berhasil ditambahkan',
            'rule_id' => $ruleId
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

/**
 * Update aturan yang ada
 */
function updateRule() {
    try {
        global $pdo;
        
        // Ambil ID aturan
        $rule_id = isset($_POST['rule_id']) ? (int)$_POST['rule_id'] : 0;
        
        if ($rule_id <= 0) {
            throw new Exception("ID aturan tidak valid");
        }
        
        // Ambil parameter dari POST
        $soil_moisture = isset($_POST['soil_moisture']) ? sanitizeInput($_POST['soil_moisture']) : '';
        $air_temperature = isset($_POST['air_temperature']) ? sanitizeInput($_POST['air_temperature']) : '';
        $light_intensity = isset($_POST['light_intensity']) ? sanitizeInput($_POST['light_intensity']) : '';
        $humidity = isset($_POST['humidity']) ? sanitizeInput($_POST['humidity']) : '';
        $irrigation_duration = isset($_POST['irrigation_duration']) ? sanitizeInput($_POST['irrigation_duration']) : '';
        $temperature_setting = isset($_POST['temperature_setting']) ? sanitizeInput($_POST['temperature_setting']) : '';
        $light_control = isset($_POST['light_control']) ? sanitizeInput($_POST['light_control']) : '';
        $plant_stage = isset($_POST['plant_stage']) ? sanitizeInput($_POST['plant_stage']) : null;
        $confidence_level = isset($_POST['confidence_level']) ? (int)$_POST['confidence_level'] : 100;
        $is_adaptive = isset($_POST['is_adaptive']) ? (int)$_POST['is_adaptive'] : 0;
        
        // Validasi parameter wajib
        if (empty($soil_moisture) || empty($air_temperature) || empty($light_intensity) || empty($humidity) ||
            empty($irrigation_duration) || empty($temperature_setting) || empty($light_control)) {
            throw new Exception("Semua parameter utama harus diisi");
        }
        
        // Cek apakah aturan ada
        $checkQuery = "SELECT id FROM fuzzy_rules WHERE id = ?";
        $stmt = $pdo->prepare($checkQuery);
        $stmt->execute([$rule_id]);
        
        if ($stmt->rowCount() === 0) {
            throw new Exception("Aturan dengan ID $rule_id tidak ditemukan");
        }
        
        // Update aturan
        $updateQuery = "UPDATE fuzzy_rules 
                       SET soil_moisture = ?, 
                           air_temperature = ?, 
                           light_intensity = ?, 
                           humidity = ?,
                           irrigation_duration = ?, 
                           temperature_setting = ?, 
                           light_control = ?,
                           plant_stage = ?, 
                           confidence_level = ?, 
                           is_adaptive = ?
                       WHERE id = ?";
                       
        $stmt = $pdo->prepare($updateQuery);
        $stmt->execute([
            $soil_moisture, $air_temperature, $light_intensity, $humidity,
            $irrigation_duration, $temperature_setting, $light_control,
            $plant_stage, $confidence_level, $is_adaptive, $rule_id
        ]);
        
        // Respons sukses
        echo json_encode([
            'success' => true, 
            'message' => 'Aturan berhasil diperbarui'
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

/**
 * Hapus aturan
 */
function deleteRule() {
    try {
        global $pdo;
        
        // Ambil ID aturan
        $rule_id = isset($_POST['rule_id']) ? (int)$_POST['rule_id'] : 0;
        
        if ($rule_id <= 0) {
            throw new Exception("ID aturan tidak valid");
        }
        
        // Cek apakah aturan ada
        $checkQuery = "SELECT id FROM fuzzy_rules WHERE id = ?";
        $stmt = $pdo->prepare($checkQuery);
        $stmt->execute([$rule_id]);
        
        if ($stmt->rowCount() === 0) {
            throw new Exception("Aturan dengan ID $rule_id tidak ditemukan");
        }
        
        // Hapus aturan
        $deleteQuery = "DELETE FROM fuzzy_rules WHERE id = ?";
        $stmt = $pdo->prepare($deleteQuery);
        $stmt->execute([$rule_id]);
        
        // Respons sukses
        echo json_encode([
            'success' => true, 
            'message' => 'Aturan berhasil dihapus'
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
?>