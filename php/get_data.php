<?php
include('connect.php');

$query = "SELECT * FROM fuzzy_rules";
$stmt = $pdo->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($data);
?>
