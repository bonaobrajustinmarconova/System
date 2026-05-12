<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['userID'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in.']);
    exit;
}

if (!isset($_FILES['pfp'])) {
    echo json_encode(['success' => false, 'message' => 'No file uploaded.']);
    exit;
}

$file     = $_FILES['pfp'];
$userID   = $_SESSION['userID'];
$allowed  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$maxSize  = 2 * 1024 * 1024; // 2MB

if (!in_array($file['type'], $allowed)) {
    echo json_encode(['success' => false, 'message' => 'Only JPG, PNG, WEBP or GIF allowed.']);
    exit;
}
if ($file['size'] > $maxSize) {
    echo json_encode(['success' => false, 'message' => 'File must be under 2MB.']);
    exit;
}

// Create uploads/pfp directory if it doesn't exist
$uploadDir = 'uploads/pfp/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

// Generate unique filename
$ext      = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = 'user_' . $userID . '_' . time() . '.' . $ext;
$filepath = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    echo json_encode(['success' => false, 'message' => 'Failed to save file.']);
    exit;
}

// Update DB
$conn = new mysqli('localhost', 'root', '', 'nestqc_db');
$stmt = $conn->prepare("UPDATE users SET pfp = ? WHERE userID = ?");
$stmt->bind_param('si', $filepath, $userID);
$stmt->execute();

$_SESSION['pfp'] = $filepath;

echo json_encode(['success' => true, 'pfp' => $filepath]);
$conn->close();
?>