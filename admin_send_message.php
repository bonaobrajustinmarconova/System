<?php
header('Content-Type: application/json');
require 'admin_check.php';          // ensures admin role

$conn = new mysqli('localhost', 'root', '', 'nestqc_db');
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB connection failed.']);
    exit;
}

$data       = json_decode(file_get_contents('php://input'), true);
$receiverID = intval($data['receiverID'] ?? 0);
$content    = trim($data['content'] ?? '');
$adminID    = (int)$_SESSION['userID'];

if (!$receiverID || $content === '') {
    echo json_encode(['success' => false, 'message' => 'Missing receiver or message.']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO messages (senderID, receiverID, content) VALUES (?, ?, ?)");
$stmt->bind_param('iis', $adminID, $receiverID, $content);

if ($stmt->execute()) {
    $msgID = $stmt->insert_id;

    // Optional notification
    $notifContent = "Admin replied to your message.";
    $notifStmt = $conn->prepare("INSERT INTO notifications (userID, messageID, content) VALUES (?, ?, ?)");
    $notifStmt->bind_param('iis', $receiverID, $msgID, $notifContent);
    $notifStmt->execute();

    echo json_encode(['success' => true, 'messageID' => $msgID, 'created_at' => date('Y-m-d H:i:s')]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to send message.']);
}

$conn->close();