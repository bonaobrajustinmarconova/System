<?php
header('Content-Type: application/json');
require 'admin_check.php';

$conn = new mysqli('localhost', 'root', '', 'nestqc_db');
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB connection failed.']);
    exit;
}

$data   = json_decode(file_get_contents('php://input'), true);
$userID = intval($data['userID'] ?? 0);
$role   = in_array($data['role'] ?? '', ['admin', 'user']) ? $data['role'] : '';

if (!$userID || !$role) {
    echo json_encode(['success' => false, 'message' => 'Invalid data.']);
    exit;
}

// Prevent admin from demoting themselves
if ($userID === (int)$_SESSION['userID']) {
    echo json_encode(['success' => false, 'message' => 'You cannot change your own role.']);
    exit;
}

$stmt = $conn->prepare("UPDATE users SET role = ? WHERE userID = ?");
$stmt->bind_param('si', $role, $userID);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update role.']);
}

$conn->close();