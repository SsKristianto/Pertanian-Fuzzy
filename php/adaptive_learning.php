<?php
/**
 * adaptive_learning.php
 * 
 * File ini menangani mekanisme pembelajaran adaptif untuk sistem kontrol fuzzy
 * termasuk penyimpanan, pengambilan, dan pembaruan aturan fuzzy adaptif
 */

// Koneksi ke database
include('connect.php');

// Pastikan request adalah POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Metode tidak diizinkan']);
    exit;
}

// Ambil perintah dari request
$command = isset($_POST['command']) ? sanitizeInput($_POST['command']) : '';

// Proses perintah
switch ($command) {
    case 'get_adaptive_rules':
        // Ambil semua aturan fuzzy adaptif
        getAdaptiveRules();
        break;
        
    case 'save_adaptive_rule':
        // Simpan aturan fuzzy adaptif baru
        saveAdaptiveRule();
        break;
        
    case 'update_adaptive_rule':
        // Perbarui aturan fuzzy adaptif yang ada
        updateAdaptiveRule();
        break;
        
    case 'get_learning_stats':
        // Dapatkan statistik pembelajaran
        getLearningStats();
        break;
        
    case 'reset_learning':
        // Reset sistem pembelajaran
        resetLearning();
        break;
        
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Perintah tidak dikenal']);
        break;
}

/**
 * Ambil semua aturan fuzzy adaptif
 */
function getAdaptiveRules() {
    try {
        global $pdo;
        
        // Check if confidence_level column exists
        $checkColumnQuery = "SHOW COLUMNS FROM fuzzy_rules LIKE 'confidence_level'";
        $checkStmt = $pdo->query($checkColumnQuery);
        $confidenceColumnExists = ($checkStmt && $checkStmt->rowCount() > 0);
        
        // Add filter if needed
        $plantStage = isset($_POST['plant_stage']) ? sanitizeInput($_POST['plant_stage']) : null;
        
        $query = "SELECT * FROM fuzzy_rules";
        $params = [];
        
        if ($plantStage) {
            $query .= " WHERE (plant_stage = ? OR plant_stage IS NULL OR plant_stage = '')";
            $params[] = $plantStage;
        }
        
        // Use confidence_level for ordering only if it exists
        if ($confidenceColumnExists) {
            $query .= " ORDER BY confidence_level DESC, id ASC";
        } else {
            $query .= " ORDER BY id ASC";
        }
        
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $rules = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'rules' => $rules]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error database: ' . $e->getMessage()]);
    }
}

/**
 * Simpan aturan fuzzy adaptif baru
 */
function saveAdaptiveRule() {
    try {
        global $pdo;
        
        // Ambil parameter aturan
        $soil_moisture = isset($_POST['soil_moisture']) ? sanitizeInput($_POST['soil_moisture']) : '';
        $air_temperature = isset($_POST['air_temperature']) ? sanitizeInput($_POST['air_temperature']) : '';
        $light_intensity = isset($_POST['light_intensity']) ? sanitizeInput($_POST['light_intensity']) : '';
        $humidity = isset($_POST['humidity']) ? sanitizeInput($_POST['humidity']) : '';
        $irrigation_duration = isset($_POST['irrigation_duration']) ? sanitizeInput($_POST['irrigation_duration']) : '';
        $temperature_setting = isset($_POST['temperature_setting']) ? sanitizeInput($_POST['temperature_setting']) : '';
        $light_control = isset($_POST['light_control']) ? sanitizeInput($_POST['light_control']) : '';
        $plant_stage = isset($_POST['plant_stage']) ? sanitizeInput($_POST['plant_stage']) : '';
        $confidence_level = isset($_POST['confidence_level']) ? (int)$_POST['confidence_level'] : 50;
        $is_adaptive = isset($_POST['is_adaptive']) ? (int)$_POST['is_adaptive'] : 1;
        
        // Validasi input
        if (empty($soil_moisture) || empty($air_temperature) || empty($light_intensity) || empty($humidity) ||
            empty($irrigation_duration) || empty($temperature_setting) || empty($light_control)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Semua parameter aturan harus diisi']);
            return;
        }
        
        // Cek apakah aturan serupa sudah ada
        $checkQuery = "SELECT id FROM fuzzy_rules WHERE 
                      soil_moisture = ? AND air_temperature = ? AND light_intensity = ? AND humidity = ?";
                      
        $checkParams = [$soil_moisture, $air_temperature, $light_intensity, $humidity];
        
        if (!empty($plant_stage)) {
            $checkQuery .= " AND (plant_stage = ? OR plant_stage IS NULL OR plant_stage = '')";
            $checkParams[] = $plant_stage;
        }
        
        $checkStmt = $pdo->prepare($checkQuery);
        $checkStmt->execute($checkParams);
        
        if ($checkStmt->rowCount() > 0) {
            // Aturan serupa sudah ada, lakukan update sebagai gantinya
            $existingRule = $checkStmt->fetch(PDO::FETCH_ASSOC);
            $_POST['id'] = $existingRule['id'];
            updateAdaptiveRule();
            return;
        }
        
        // Simpan aturan baru
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
        
        // Catat log pembelajaran
        logLearningActivity("Aturan baru dibuat", $ruleId);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Aturan fuzzy adaptif berhasil disimpan',
            'rule_id' => $ruleId
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error database: ' . $e->getMessage()]);
    }
}

/**
 * Perbarui aturan fuzzy adaptif yang ada
 */
function updateAdaptiveRule() {
    try {
        global $pdo;
        
        // Ambil ID aturan
        $ruleId = isset($_POST['id']) ? (int)$_POST['id'] : 0;
        
        if ($ruleId <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID aturan tidak valid']);
            return;
        }
        
        // Ambil parameter aturan
        $irrigation_duration = isset($_POST['irrigation_duration']) ? sanitizeInput($_POST['irrigation_duration']) : '';
        $temperature_setting = isset($_POST['temperature_setting']) ? sanitizeInput($_POST['temperature_setting']) : '';
        $light_control = isset($_POST['light_control']) ? sanitizeInput($_POST['light_control']) : '';
        $confidence_level = isset($_POST['confidence_level']) ? (int)$_POST['confidence_level'] : 50;
        $is_adaptive = isset($_POST['is_adaptive']) ? (int)$_POST['is_adaptive'] : 1;
        
        // Ambil data aturan asli untuk perbandingan
        $originalQuery = "SELECT * FROM fuzzy_rules WHERE id = ?";
        $originalStmt = $pdo->prepare($originalQuery);
        $originalStmt->execute([$ruleId]);
        
        if ($originalStmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Aturan tidak ditemukan']);
            return;
        }
        
        $originalRule = $originalStmt->fetch(PDO::FETCH_ASSOC);
        
        // Perbarui aturan
        $updateQuery = "UPDATE fuzzy_rules SET 
                       irrigation_duration = ?, 
                       temperature_setting = ?, 
                       light_control = ?,
                       confidence_level = ?, 
                       is_adaptive = ?,
                       updated_at = CURRENT_TIMESTAMP
                       WHERE id = ?";
                       
        $stmt = $pdo->prepare($updateQuery);
        $stmt->execute([
            $irrigation_duration, 
            $temperature_setting, 
            $light_control,
            $confidence_level, 
            $is_adaptive,
            $ruleId
        ]);
        
        // Catat log pembelajaran jika nilai berubah
        if ($originalRule['irrigation_duration'] !== $irrigation_duration ||
            $originalRule['temperature_setting'] !== $temperature_setting ||
            $originalRule['light_control'] !== $light_control) {
            
            $changes = [];
            if ($originalRule['irrigation_duration'] !== $irrigation_duration) {
                $changes[] = "irigasi: {$originalRule['irrigation_duration']} -> $irrigation_duration";
            }
            if ($originalRule['temperature_setting'] !== $temperature_setting) {
                $changes[] = "suhu: {$originalRule['temperature_setting']} -> $temperature_setting";
            }
            if ($originalRule['light_control'] !== $light_control) {
                $changes[] = "cahaya: {$originalRule['light_control']} -> $light_control";
            }
            
            logLearningActivity("Aturan diperbarui: " . implode(", ", $changes), $ruleId);
        }
        
        echo json_encode([
            'success' => true, 
            'message' => 'Aturan fuzzy adaptif berhasil diperbarui'
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error database: ' . $e->getMessage()]);
    }
}

/**
 * Dapatkan statistik pembelajaran
 */
function getLearningStats() {
    try {
        global $pdo;
        
        // Ambil statistik umum
        $statsQuery = "SELECT 
                      (SELECT COUNT(*) FROM fuzzy_rules WHERE is_adaptive = 1) AS adaptive_rules_count,
                      (SELECT COUNT(*) FROM learning_log) AS learning_activities,
                      (SELECT COUNT(DISTINCT rule_id) FROM learning_log) AS adjusted_rules,
                      (SELECT AVG(confidence_level) FROM fuzzy_rules WHERE is_adaptive = 1) AS avg_confidence";
                      
        $statsStmt = $pdo->query($statsQuery);
        $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
        
        // Ambil aktivitas pembelajaran terbaru
        $logQuery = "SELECT * FROM learning_log ORDER BY timestamp DESC LIMIT 10";
        $logStmt = $pdo->query($logQuery);
        $logs = $logStmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true, 
            'stats' => $stats,
            'recent_activities' => $logs
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error database: ' . $e->getMessage()]);
    }
}

/**
 * Reset sistem pembelajaran
 */
function resetLearning() {
    try {
        global $pdo;
        
        // Hapus semua aturan adaptif
        $deleteRulesQuery = "DELETE FROM fuzzy_rules WHERE is_adaptive = 1";
        $pdo->exec($deleteRulesQuery);
        
        // Hapus log pembelajaran
        $deleteLogQuery = "DELETE FROM learning_log";
        $pdo->exec($deleteLogQuery);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Sistem pembelajaran berhasil direset'
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error database: ' . $e->getMessage()]);
    }
}

/**
 * Catat aktivitas pembelajaran
 */
function logLearningActivity($activity, $ruleId = null) {
    try {
        global $pdo;
        
        $query = "INSERT INTO learning_log (activity, rule_id) VALUES (?, ?)";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$activity, $ruleId]);
        
    } catch (PDOException $e) {
        error_log("Error logging learning activity: " . $e->getMessage());
    }
}
?>