<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['userID'])) {
    echo json_encode(['success' => false, 'count' => 0]);
    exit;
}

$conn = new mysqli('localhost', 'root', '', 'nestqc_db');
if ($conn->connect_error) { echo json_encode(['success' => false, 'count' => 0]); exit; }

$userID = (int)$_SESSION['userID'];

// Count unread admin replies to this user
$stmt = $conn->prepare("
    SELECT COUNT(*) as cnt FROM messages
    WHERE receiverID = ? AND is_read = 0
");
$stmt->bind_param('i', $userID);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$count = (int)$row['cnt'];

echo json_encode(['success' => true, 'count' => $count]);
$conn->close();