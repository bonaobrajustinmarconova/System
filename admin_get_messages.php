<?php
header('Content-Type: application/json');
require 'admin_check.php';          // ensures admin role

$conn = new mysqli('localhost', 'root', '', 'nestqc_db');
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB connection failed.']);
    exit;
}

$targetUserID = isset($_GET['userID']) ? (int)$_GET['userID'] : 0;

if ($targetUserID) {
    // ── Full conversation with a specific user ──
    $stmt = $conn->prepare("
        SELECT m.messageID, m.senderID, m.receiverID, m.content, m.is_read, m.created_at,
               u.fname, u.lname
        FROM messages m
        JOIN users u ON u.userID = IF(m.senderID = 0, m.receiverID, m.senderID)
        WHERE m.senderID = ? OR m.receiverID = ?
        ORDER BY m.created_at ASC
    ");
    $stmt->bind_param('ii', $targetUserID, $targetUserID);
    $stmt->execute();
    $result = $stmt->get_result();

    $messages = [];
    while ($row = $result->fetch_assoc()) {
        $messages[] = [
            'messageID'  => (int)$row['messageID'],
            'senderID'   => (int)$row['senderID'],   // ⚠️ cast to integer
            'receiverID' => (int)$row['receiverID'],
            'content'    => $row['content'],
            'is_read'    => (int)$row['is_read'],
            'created_at' => $row['created_at'],
            'fname'      => $row['fname'],
            'lname'      => $row['lname'],
        ];
    }

    // Mark messages from this user as read
    $conn->query("UPDATE messages SET is_read = 1 WHERE senderID = $targetUserID AND receiverID = 0 AND is_read = 0");

    echo json_encode(['success' => true, 'messages' => $messages]);

} else {
    // ── User list (inbox overview) ──
    $result = $conn->query("
        SELECT u.userID, u.fname, u.lname, u.uname,
               COUNT(CASE WHEN m.is_read = 0 AND m.receiverID = 0 THEN 1 END) AS unread_count,
               MAX(m.created_at) AS last_message,
               (SELECT content FROM messages WHERE senderID = u.userID OR receiverID = u.userID ORDER BY created_at DESC LIMIT 1) AS last_content
        FROM messages m
        JOIN users u ON u.userID = m.senderID
        WHERE m.receiverID = 0
        GROUP BY u.userID
        ORDER BY last_message DESC
    ");

    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = [
            'userID'       => (int)$row['userID'],
            'fname'        => $row['fname'],
            'lname'        => $row['lname'],
            'uname'        => $row['uname'],
            'unread_count' => (int)$row['unread_count'],
            'last_content' => $row['last_content'],
            'last_message' => $row['last_message'],
            'phone'        => '—'   // placeholder
        ];
    }

    echo json_encode(['success' => true, 'users' => $users]);
}

$conn->close();