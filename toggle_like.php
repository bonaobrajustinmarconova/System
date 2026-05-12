<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
session_start();

if (!isset($_SESSION['userID'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in.']);
    exit;
}

//toggle_like.php

// DB connection
$conn = new mysqli('localhost', 'root', '', 'nestqc_db');
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB connection failed']);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);
$userID = intval($data['userID'] ?? 0);
$dormID = intval($data['dormID'] ?? 0);

if (!$userID || !$dormID) {
    echo json_encode(['success' => false, 'message' => 'Missing userID or dormID']);
    exit;
}

// Ensure the posted userID matches the logged-in session
if ($userID !== (int)$_SESSION['userID']) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

// Check if like already exists
$check = $conn->prepare('SELECT likeDID FROM likeddorms WHERE userID = ? AND dormID = ?');
$check->bind_param('ii', $userID, $dormID);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    // Already liked — remove it
    $del = $conn->prepare('DELETE FROM likeddorms WHERE userID = ? AND dormID = ?');
    $del->bind_param('ii', $userID, $dormID);
    $del->execute();
    echo json_encode(['success' => true, 'liked' => false]);
} else {
    // Not liked yet — add it
    $ins = $conn->prepare('INSERT INTO likeddorms (userID, dormID) VALUES (?, ?)');
    $ins->bind_param('ii', $userID, $dormID);
    $ins->execute();
    echo json_encode(['success' => true, 'liked' => true]);
}

$conn->close();
?>