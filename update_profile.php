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
    echo json_encode(['success' => false, 'message' => 'Connection failed.']);
    exit;
}

$data    = json_decode(file_get_contents('php://input'), true);
$userID  = $_SESSION['userID'];
$action  = $data['action'] ?? '';

// ── UPDATE PROFILE INFO ──
if ($action === 'update_info') {
    $fname = trim($data['fname'] ?? '');
    $mname = trim($data['mname'] ?? '');
    $lname = trim($data['lname'] ?? '');
    $uname = trim($data['uname'] ?? '');

    if (!$fname || !$lname || !$uname) {
        echo json_encode(['success' => false, 'message' => 'Please fill in all required fields.']);
        exit;
    }

    // Check if username is taken by another user
    $check = $conn->prepare("SELECT userID FROM users WHERE uname = ? AND userID != ?");
    $check->bind_param('si', $uname, $userID);
    $check->execute();
    $check->store_result();
    if ($check->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Username is already taken.']);
        exit;
    }

    $stmt = $conn->prepare("UPDATE users SET fname=?, mname=?, lname=?, uname=? WHERE userID=?");
    $stmt->bind_param('ssssi', $fname, $mname, $lname, $uname, $userID);

    if ($stmt->execute()) {
        // Update session
        $_SESSION['fname'] = $fname;
        $_SESSION['mname'] = $mname;
        $_SESSION['lname'] = $lname;
        $_SESSION['uname'] = $uname;
        echo json_encode(['success' => true, 'message' => 'Profile updated successfully.', 'user' => [
            'fname' => $fname, 'mname' => $mname, 'lname' => $lname, 'uname' => $uname
        ]]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update profile.']);
    }
}

// ── CHANGE PASSWORD ──
else if ($action === 'change_password') {
    $currentPw  = $data['current_password']  ?? '';
    $newPw      = $data['new_password']      ?? '';
    $confirmPw  = $data['confirm_password']  ?? '';

    if (!$currentPw || !$newPw || !$confirmPw) {
        echo json_encode(['success' => false, 'message' => 'Please fill in all password fields.']);
        exit;
    }
    if (strlen($newPw) < 8) {
        echo json_encode(['success' => false, 'message' => 'New password must be at least 8 characters.']);
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
        echo json_encode(['success' => false, 'message' => 'Password must contain at least one special character (e.g. @, #, !).']);
        exit;
    }
    if ($newPw !== $confirmPw) {
        echo json_encode(['success' => false, 'message' => 'New passwords do not match.']);
        exit;
    }

    // Get current password from DB
    $stmt = $conn->prepare("SELECT password FROM users WHERE userID = ?");
    $stmt->bind_param('i', $userID);
    $stmt->execute();
    $result = $stmt->get_result();
    $row    = $result->fetch_assoc();

    // Verify current password (supports both plain and hashed)
    $valid = password_verify($currentPw, $row['password']) || $currentPw === $row['password'];
    if (!$valid) {
        echo json_encode(['success' => false, 'message' => 'Current password is incorrect.']);
        exit;
    }

    // Hash and save new password
    $hashed = password_hash($newPw, PASSWORD_DEFAULT);
    $update = $conn->prepare("UPDATE users SET password=? WHERE userID=?");
    $update->bind_param('si', $hashed, $userID);

    if ($update->execute()) {
        echo json_encode(['success' => true, 'message' => 'Password changed successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to change password.']);
    }
}

else {
    echo json_encode(['success' => false, 'message' => 'Invalid action.']);
}

$conn->close();
?>