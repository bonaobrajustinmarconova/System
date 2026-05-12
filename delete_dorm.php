<?php
header('Content-Type: application/json');
require 'admin_check.php';

$conn = new mysqli('localhost', 'root', '', 'nestqc_db');
if ($conn->connect_error) { echo json_encode(['success'=>false,'message'=>'DB error']); exit; }

$data = json_decode(file_get_contents('php://input'), true);
$dormID = (int)($data['dormID'] ?? 0);
if (!$dormID) { echo json_encode(['success'=>false,'message'=>'Invalid dorm ID']); exit; }

// delete cascade thanks to FK constraints
$conn->query("DELETE FROM dorms WHERE dormID = $dormID");
if ($conn->affected_rows > 0) {
    echo json_encode(['success'=>true]);
} else {
    echo json_encode(['success'=>false,'message'=>'Dorm not found']);
}