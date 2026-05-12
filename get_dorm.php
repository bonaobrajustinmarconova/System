<?php
session_start();
header('Content-Type: application/json');

// ── DB connection (same as your other PHP files) ──────────────────────────
$conn = new mysqli('localhost', 'root', '', 'nestqc_db');
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB connection failed']);
    exit;
}

// ── Validate dormID ────────────────────────────────────────────────────────
$dormID = isset($_GET['dormID']) ? intval($_GET['dormID']) : 0;
if ($dormID <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid dormID']);
    exit;
}

// ── Fetch dorm ─────────────────────────────────────────────────────────────
$stmt = $conn->prepare("SELECT * FROM dorms WHERE dormID = ? AND is_archived = 0");
$stmt->bind_param('i', $dormID);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Dorm not found']);
    exit;
}
$dorm = $result->fetch_assoc();
$stmt->close();

// ── Fetch amenities ────────────────────────────────────────────────────────
$amenities = [];
$stmt = $conn->prepare("SELECT amenity_name FROM amenities WHERE dormID = ?");
$stmt->bind_param('i', $dormID);
$stmt->execute();
$res = $stmt->get_result();
while ($row = $res->fetch_assoc()) {
    $amenities[] = $row['amenity_name'];
}
$stmt->close();

// ── Fetch reviews (with reviewer name + pfp) ───────────────────────────────
$reviews = [];
$stmt = $conn->prepare("
    SELECT r.reviewID, r.comment, r.ratings, r.created_at,
           u.fname, u.pfp, r.userID
    FROM reviews r
    JOIN users u ON u.userID = r.userID
    WHERE r.dormID = ?
    ORDER BY r.created_at DESC
");
$stmt->bind_param('i', $dormID);
$stmt->execute();
$res = $stmt->get_result();
while ($row = $res->fetch_assoc()) {
    $reviews[] = $row;
}
$stmt->close();

// ── Fetch room types ───────────────────────────────────────────────────────
$roomTypes = [];
$stmt = $conn->prepare("SELECT room_name, price FROM room_types WHERE dormID = ?");
$stmt->bind_param('i', $dormID);
$stmt->execute();
$res = $stmt->get_result();
while ($row = $res->fetch_assoc()) {
    $roomTypes[] = $row;
}
$stmt->close();

// ── Check if current user liked this dorm ─────────────────────────────────
// ── Check if current user liked this dorm ─────────────────────────────────
$isLiked = false;
if (isset($_SESSION['userID'])) {
    $userID = $_SESSION['userID'];
    $stmt = $conn->prepare("SELECT likeDID FROM likeddorms WHERE userID = ? AND dormID = ?");
    $stmt->bind_param('ii', $userID, $dormID);
    $stmt->execute();
    $stmt->store_result();
    $isLiked = $stmt->num_rows > 0;
    $stmt->close();
}

$conn->close();

echo json_encode([
    'success'   => true,
    'dorm'      => $dorm,
    'amenities' => $amenities,
    'reviews'   => $reviews,
    'roomTypes' => $roomTypes,
    'isLiked'   => $isLiked,
]);