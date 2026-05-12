<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['userID'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in.']);
    exit;
}
 
$host = 'localhost';
$db   = 'nestqc_db';
$user = 'root';
$pass = '';
 
$conn = new mysqli($host, $user, $pass, $db);
 
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}
 
$data = json_decode(file_get_contents('php://input'), true);
 
$dormID  = isset($data['dormID'])  ? (int)$data['dormID']   : 0;
$userID  = (int)$_SESSION['userID']; // always use session, never trust POST
$ratings = isset($data['ratings']) ? (int)$data['ratings']  : 0;
$comment = isset($data['comment']) ? trim($data['comment']) : '';
 
// Validate
if (!$dormID || !$userID) {
    echo json_encode(['success' => false, 'message' => 'Invalid dorm or user.']);
    exit;
}
if ($ratings < 1 || $ratings > 5) {
    echo json_encode(['success' => false, 'message' => 'Rating must be between 1 and 5.']);
    exit;
}
if (strlen($comment) < 10) {
    echo json_encode(['success' => false, 'message' => 'Review must be at least 10 characters.']);
    exit;
}
 
$isUpdate = isset($data['_method']) && $data['_method'] === 'update';
$reviewID = isset($data['reviewID']) ? (int)$data['reviewID'] : 0;

if ($isUpdate && $reviewID) {
    // Verify the review belongs to this user before updating
    $check = $conn->prepare("SELECT reviewID FROM reviews WHERE reviewID = ? AND userID = ?");
    $check->bind_param('ii', $reviewID, $userID);
    $check->execute();
    $check->store_result();
    if ($check->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Review not found or unauthorized.']);
        exit;
    }
    $check->close();

    $stmt = $conn->prepare("UPDATE reviews SET ratings = ?, comment = ? WHERE reviewID = ? AND userID = ?");
    $stmt->bind_param('isii', $ratings, $comment, $reviewID, $userID);
    if (!$stmt->execute()) {
        echo json_encode(['success' => false, 'message' => 'Failed to update review.']);
        exit;
    }
    $returnID = $reviewID;
    $message  = 'Review updated successfully.';
} else {
    // Check if user already has a review for this dorm (prevent duplicates)
    $dupCheck = $conn->prepare("SELECT reviewID FROM reviews WHERE dormID = ? AND userID = ?");
    $dupCheck->bind_param('ii', $dormID, $userID);
    $dupCheck->execute();
    $dupCheck->store_result();
    if ($dupCheck->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'You have already reviewed this dorm.']);
        exit;
    }
    $dupCheck->close();

    $stmt = $conn->prepare("INSERT INTO reviews (dormID, userID, ratings, comment) VALUES (?, ?, ?, ?)");
    $stmt->bind_param('iiis', $dormID, $userID, $ratings, $comment);
    if (!$stmt->execute()) {
        echo json_encode(['success' => false, 'message' => 'Failed to save review.']);
        exit;
    }
    $returnID = $conn->insert_id;
    $message  = 'Review posted successfully.';
}

// Recalculate average_rating on the dorms table
$update = $conn->prepare("
    UPDATE dorms
    SET average_rating = (
        SELECT ROUND(AVG(ratings), 2) FROM reviews WHERE dormID = ?
    )
    WHERE dormID = ?
");
$update->bind_param('ii', $dormID, $dormID);
$update->execute();

echo json_encode(['success' => true, 'message' => $message, 'reviewID' => $returnID]);
$conn->close();
?>