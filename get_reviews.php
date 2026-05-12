<?php
header('Content-Type: application/json');
 
$host = 'localhost';
$db   = 'nestqc_db';
$user = 'root';
$pass = '';
 
$conn = new mysqli($host, $user, $pass, $db);
 
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}
 
$dormID = isset($_GET['dormID']) ? (int)$_GET['dormID'] : 0;
 
if (!$dormID) {
    echo json_encode(['success' => false, 'message' => 'Invalid dormID']);
    exit;
}
 
$sql = "
    SELECT r.reviewID, r.userID, r.ratings, r.comment, u.fname, u.lname, u.pfp
    FROM reviews r
    JOIN users u ON r.userID = u.userID
    WHERE r.dormID = ?
    ORDER BY r.reviewID DESC
";
 
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $dormID);
$stmt->execute();
$result = $stmt->get_result();
 
$reviews = [];
while ($row = $result->fetch_assoc()) {
    $reviews[] = [
        'reviewID' => (int)$row['reviewID'],
        'userID'   => (int)$row['userID'],
        'ratings'  => (int)$row['ratings'],
        'comment'  => $row['comment'],
        'fname'    => $row['fname'],
        'lname'    => $row['lname'],
        'pfp'      => $row['pfp'],
    ];
}
 
echo json_encode(['success' => true, 'reviews' => $reviews]);
$conn->close();
?>