<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
session_start();

if (!isset($_SESSION['userID'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in.']);
    exit;
}

$conn = new mysqli('localhost', 'root', '', 'nestqc_db');
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB connection failed']);
    exit;
}

$userID = intval($_GET['userID'] ?? 0);

if (!$userID) {
    echo json_encode(['success' => false, 'message' => 'Missing userID']);
    exit;
}

// Ensure requested userID matches the logged-in session
if ($userID !== (int)$_SESSION['userID']) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$stmt = $conn->prepare('
    SELECT d.dormID, d.dname, d.price, d.average_rating, d.address
    FROM likeddorms ld
    JOIN dorms d ON ld.dormID = d.dormID
    WHERE ld.userID = ?
    ORDER BY ld.likeDID DESC
');
$stmt->bind_param('i', $userID);
$stmt->execute();
$result = $stmt->get_result();

$dorms = [];
while ($row = $result->fetch_assoc()) {
    $dorms[] = $row;
}

echo json_encode(['success' => true, 'dorms' => $dorms]);
$conn->close();
?>