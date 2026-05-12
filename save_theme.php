<?php
header('Content-Type: application/json');
session_start();

// Only logged-in users hit this endpoint
if (!isset($_SESSION['userID'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in.']);
    exit;
}

$conn = new mysqli('localhost', 'root', '', 'nestqc_db');
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Connection failed.']);
    exit;
}

$data  = json_decode(file_get_contents('php://input'), true);
$theme = isset($data['theme']) ? $data['theme'] : '';

// Only allow 'dark' or 'light'
if ($theme !== 'dark' && $theme !== 'light') {
    echo json_encode(['success' => false, 'message' => 'Invalid theme.']);
    exit;
}

$userID = (int)$_SESSION['userID'];
$stmt   = $conn->prepare("UPDATE users SET theme = ? WHERE userID = ?");
$stmt->bind_param('si', $theme, $userID);
$stmt->execute();

echo json_encode(['success' => true]);
$conn->close();
?>