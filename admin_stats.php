<?php
header('Content-Type: application/json');
require 'admin_check.php';

$conn = new mysqli('localhost', 'root', '', 'nestqc_db');
if ($conn->connect_error) {
    echo json_encode(['success'=>false, 'message'=>'DB error']); exit;
}

$dorms   = $conn->query("SELECT COUNT(*) AS cnt FROM dorms")->fetch_assoc()['cnt'];
$users   = $conn->query("SELECT COUNT(*) AS cnt FROM users WHERE role='user'")->fetch_assoc()['cnt'];
$reviews = $conn->query("SELECT COUNT(*) AS cnt FROM reviews")->fetch_assoc()['cnt'];
$unread  = $conn->query("SELECT COUNT(*) AS cnt FROM messages WHERE receiverID = 0 AND is_read = 0")->fetch_assoc()['cnt'];

$msgs = $conn->query("
    SELECT m.content, m.created_at, u.fname, u.lname
    FROM messages m JOIN users u ON u.userID = m.senderID
    WHERE m.receiverID = 0
    ORDER BY m.messageID DESC LIMIT 5
");
$recent = [];
while($r = $msgs->fetch_assoc()) $recent[] = $r;

echo json_encode([
    'success' => true,
    'dorms'   => (int)$dorms,
    'users'   => (int)$users,
    'reviews' => (int)$reviews,
    'unread_msgs' => (int)$unread,
    'recent_messages' => $recent
]);