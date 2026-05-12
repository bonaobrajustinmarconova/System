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

if (!$userID) {
    echo json_encode(['success' => false, 'message' => 'Invalid user ID.']);
    exit;
}

// Prevent admin from terminating their own account
if ($userID === (int)$_SESSION['userID']) {
    echo json_encode(['success' => false, 'message' => 'You cannot terminate your own account.']);
    exit;
}

$stmt = $conn->prepare("DELETE FROM users WHERE userID = ?");
$stmt->bind_param('i', $userID);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to terminate account.']);
}

$stmt->close();
$conn->close();