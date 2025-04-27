<?php
/**
 * get_data.php
 * 
 * File ini bertanggung jawab untuk mengambil data dari database
 * seperti parameter lingkungan dan hasil analisis fuzzy
 */

// Koneksi ke database
include('connect.php');

// Cek jenis data yang diminta
$data_type = isset($_GET['type']) ? sanitizeInput($_GET['type']) : 'rules';

// Header untuk response JSON
header('Content-Type: application/json');

try {
    switch ($data_type) {
        case 'rules':
            // Ambil data aturan fuzzy
            $query = "SELECT * FROM fuzzy_rules ORDER BY id ASC";
            $stmt = $pdo->query($query);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Kirim data sebagai JSON
            echo json_encode(['success' => true, 'data' => $data]);
            break;
            
        case 'input_parameters':
            // Ambil data parameter input terakhir
            $query = "SELECT * FROM input_parameters ORDER BY id DESC LIMIT 10";
            $stmt = $pdo->query($query);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Kirim data sebagai JSON
            echo json_encode(['success' => true, 'data' => $data]);
            break;
            
        case 'output_parameters':
            // Ambil data parameter output terakhir
            $query = "SELECT * FROM output_parameters ORDER BY id DESC LIMIT 10";
            $stmt = $pdo->query($query);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Kirim data sebagai JSON
            echo json_encode(['success' => true, 'data' => $data]);
            break;
        
            case 'membership_functions':
                // Definisi default untuk fungsi keanggotaan
                $defaultMembershipFunctions = [
                    'soil_moisture' => [
                        'kering' => [
                            'type' => 'trapezoid',
                            'points' => [0, 0, 30, 40]
                        ],
                        'sedang' => [
                            'type' => 'triangle',
                            'points' => [30, 50, 70]
                        ],
                        'basah' => [
                            'type' => 'trapezoid',
                            'points' => [60, 70, 100, 100]
                        ]
                    ],
                    'air_temperature' => [
                        'dingin' => [
                            'type' => 'trapezoid',
                            'points' => [0, 0, 15, 20]
                        ],
                        'sedang' => [
                            'type' => 'triangle',
                            'points' => [15, 22.5, 30]
                        ],
                        'panas' => [
                            'type' => 'trapezoid',
                            'points' => [25, 30, 50, 50]
                        ]
                    ],
                    'light_intensity' => [
                        'rendah' => [
                            'type' => 'trapezoid',
                            'points' => [0, 0, 300, 400]
                        ],
                        'sedang' => [
                            'type' => 'triangle',
                            'points' => [300, 500, 700]
                        ],
                        'tinggi' => [
                            'type' => 'trapezoid',
                            'points' => [600, 700, 1000, 1000]
                        ]
                    ],
                    'humidity' => [
                        'rendah' => [
                            'type' => 'trapezoid',
                            'points' => [0, 0, 30, 40]
                        ],
                        'sedang' => [
                            'type' => 'triangle',
                            'points' => [30, 50, 70]
                        ],
                        'tinggi' => [
                            'type' => 'trapezoid',
                            'points' => [60, 70, 100, 100]
                        ]
                    ],
                    'irrigation_duration' => [
                        'tidak_ada' => [
                            'type' => 'trapezoid',
                            'points' => [0, 0, 10, 20]
                        ],
                        'singkat' => [
                            'type' => 'triangle',
                            'points' => [10, 25, 40]
                        ],
                        'sedang' => [
                            'type' => 'triangle',
                            'points' => [30, 50, 70]
                        ],
                        'lama' => [
                            'type' => 'trapezoid',
                            'points' => [60, 80, 100, 100]
                        ]
                    ],
                    'temperature_setting' => [
                        'menurunkan' => [
                            'type' => 'trapezoid',
                            'points' => [-10, -10, -7, -3]
                        ],
                        'mempertahankan' => [
                            'type' => 'triangle',
                            'points' => [-5, 0, 5]
                        ],
                        'menaikkan' => [
                            'type' => 'trapezoid',
                            'points' => [3, 7, 10, 10]
                        ]
                    ],
                    'light_control' => [
                        'mati' => [
                            'type' => 'trapezoid',
                            'points' => [0, 0, 10, 20]
                        ],
                        'redup' => [
                            'type' => 'triangle',
                            'points' => [10, 25, 40]
                        ],
                        'sedang' => [
                            'type' => 'triangle',
                            'points' => [30, 50, 70]
                        ],
                        'terang' => [
                            'type' => 'trapezoid',
                            'points' => [60, 80, 100, 100]
                        ]
                    ]
                ];
            
                // Inisialisasi dengan defaults
                $membershipFunctions = $defaultMembershipFunctions;
                
                // Cek apakah tabel ada di database
                $tableExistsQuery = "SHOW TABLES LIKE 'membership_functions'";
                $tableExistsStmt = $pdo->query($tableExistsQuery);
                $tableExists = ($tableExistsStmt && $tableExistsStmt->rowCount() > 0);
                
                if ($tableExists) {
                    // Coba ambil dari database
                    $query = "SELECT parameter, functions FROM membership_functions";
                    $stmt = $pdo->query($query);
                    
                    if ($stmt && $stmt->rowCount() > 0) {
                        // Untuk setiap baris dari DB, override default
                        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                            $membershipFunctions[$row['parameter']] = json_decode($row['functions'], true);
                        }
                    }
                }
                
                // Selalu kirim data lengkap (kombinasi DB + defaults)
                echo json_encode(['success' => true, 'data' => $membershipFunctions, 'source' => 'combined']);
                break;
            
        default:
            // Tipe data tidak dikenali
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Tipe data tidak valid']);
            break;
    }
} catch (PDOException $e) {
    // Error pada database
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>