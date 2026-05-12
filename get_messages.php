<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['userID'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in.']);
    exit;
}

$conn = new mysqli('localhost', 'root', '', 'nestqc_db');
if ($conn->connect_error) { echo json_encode(['success' => false, 'message' => 'DB error.']); exit; }

$userID = (int)$_SESSION['userID'];

// All messages in this user's thread (user sent OR admin replied to them)
$stmt = $conn->prepare("
    SELECT messageID, senderID, receiverID, content, is_read, created_at
    FROM messages
    WHERE senderID = ? OR receiverID = ?
    ORDER BY created_at ASC
");
$stmt->bind_param('ii', $userID, $userID);
$stmt->execute();
$result = $stmt->get_result();

$messages = [];
while ($row = $result->fetch_assoc()) {
    $messages[] = [
        'messageID'  => (int)$row['messageID'],
        'senderID'   => (int)$row['senderID'],
        'receiverID' => (int)$row['receiverID'],
        'content'    => $row['content'],
        'is_read'    => (int)$row['is_read'],
        'created_at' => $row['created_at'],
        'is_mine'    => (int)$row['senderID'] === $userID,
    ];
}

// Mark admin replies to this user as read
$conn->query("UPDATE messages SET is_read = 1 WHERE receiverID = $userID AND is_read = 0");
// Mark notifications as read
$conn->query("UPDATE notifications SET is_read = 1 WHERE userID = $userID AND is_read = 0");

echo json_encode(['success' => true, 'messages' => $messages, 'userID' => $userID]);
$conn->close();