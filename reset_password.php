<?php
header('Content-Type: application/json');

$conn = new mysqli('localhost', 'root', '', 'nestqc_db');
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Connection failed.']);
    exit;
}

$data     = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username']     ?? '');
$newPw    = $data['new_password'] ?? '';

if (!$username || !$newPw) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all fields.']);
    exit;
}

// Validate password strength
if (strlen($newPw) < 8) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters.']);
    exit;
}
if (!preg_match('/[A-Z]/', $newPw)) {
    echo json_encode(['success' => false, 'message' => 'Password must contain at least one uppercase letter.']);
    exit;
}
if (!preg_match('/[a-z]/', $newPw)) {
    echo json_encode(['success' => false, 'message' => 'Password must contain at least one lowercase letter.']);
    exit;
}
if (!preg_match('/[0-9]/', $newPw)) {
    echo json_encode(['success' => false, 'message' => 'Password must contain at least one number.']);
    exit;
}
if (!preg_match('/[^a-zA-Z0-9]/', $newPw)) {
    echo json_encode(['success' => false, 'message' => 'Password must contain at least one special character.']);
    exit;
}

// Check if username exists
$check = $conn->prepare("SELECT userID FROM users WHERE uname = ?");
$check->bind_param('s', $username);
$check->execute();
$check->store_result();

if ($check->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Username not found.']);
    exit;
}

// Hash and update password
$hashed = password_hash($newPw, PASSWORD_DEFAULT);
$stmt   = $conn->prepare("UPDATE users SET password = ? WHERE uname = ?");
$stmt->bind_param('ss', $hashed, $username);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Password reset successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to reset password.']);
}

$conn->close();
?>