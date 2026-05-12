<?php
header('Content-Type: application/json');
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

$data    = json_decode(file_get_contents('php://input'), true);
$dormID  = intval($data['dormID']  ?? 0);
$userID  = intval($data['userID']  ?? 0);
$comment = trim($data['comment']   ?? '');
$ratings = isset($data['ratings']) && $data['ratings'] !== null ? intval($data['ratings']) : null;
$reviewID = isset($data['reviewID']) && $data['reviewID'] ? intval($data['reviewID']) : null;

if (!$dormID || !$userID || !$comment) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit;
}

// Security: posted userID must match session
if ($userID !== (int)$_SESSION['userID']) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

// Validate rating range
if ($ratings !== null && ($ratings < 1 || $ratings > 5)) {
    echo json_encode(['success' => false, 'message' => 'Invalid rating.']);
    exit;
}

// Check if user already has a review for this dorm
$check = $conn->prepare('SELECT reviewID FROM reviews WHERE dormID = ? AND userID = ?');
$check->bind_param('ii', $dormID, $userID);
$check->execute();
$check->store_result();
$existingCount = $check->num_rows;
$check->bind_result($existingReviewID);
$check->fetch();
$check->close();

if ($existingCount > 0) {
    // UPDATE existing review
    if ($ratings !== null) {
        $stmt = $conn->prepare('UPDATE reviews SET comment = ?, ratings = ? WHERE dormID = ? AND userID = ?');
        $stmt->bind_param('siii', $comment, $ratings, $dormID, $userID);
    } else {
        $stmt = $conn->prepare('UPDATE reviews SET comment = ?, ratings = NULL WHERE dormID = ? AND userID = ?');
        $stmt->bind_param('sii', $comment, $dormID, $userID);
    }
    $stmt->execute();
    $stmt->close();
} else {
    // INSERT new review
    if ($ratings !== null) {
        $stmt = $conn->prepare('INSERT INTO reviews (dormID, userID, comment, ratings) VALUES (?, ?, ?, ?)');
        $stmt->bind_param('iisi', $dormID, $userID, $comment, $ratings);
    } else {
        $stmt = $conn->prepare('INSERT INTO reviews (dormID, userID, comment, ratings) VALUES (?, ?, ?, NULL)');
        $stmt->bind_param('iis', $dormID, $userID, $comment);
    }
    $stmt->execute();
    $stmt->close();
}

// Recalculate average_rating for the dorm
$avg = $conn->query("SELECT AVG(ratings) as avg_r FROM reviews WHERE dormID = $dormID AND ratings IS NOT NULL");
$avgRow = $avg->fetch_assoc();
$avgRating = round((float)($avgRow['avg_r'] ?? 0), 2);
$conn->query("UPDATE dorms SET average_rating = $avgRating WHERE dormID = $dormID");

echo json_encode(['success' => true]);
$conn->close();
?>