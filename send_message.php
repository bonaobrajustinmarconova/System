<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['userID'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in.']);
    exit;
}

$conn = new mysqli('localhost', 'root', '', 'nestqc_db');
if ($conn->connect_error) { echo json_encode(['success' => false, 'message' => 'DB error.']); exit; }

$data    = json_decode(file_get_contents('php://input'), true);
$content = trim($data['content'] ?? '');
$userID  = (int)$_SESSION['userID'];

if (!$content || strlen($content) > 1000) {
    echo json_encode(['success' => false, 'message' => 'Invalid message.']);
    exit;
}

// receiverID = 0 means "admin inbox"
$stmt = $conn->prepare("INSERT INTO messages (senderID, receiverID, content) VALUES (?, 0, ?)");
$stmt->bind_param('is', $userID, $content);

if ($stmt->execute()) {
    $msgID = $stmt->insert_id;
    echo json_encode([
        'success'    => true,
        'messageID'  => $msgID,
        'created_at' => date('Y-m-d H:i:s'),
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to send message.']);
}

$conn->close();