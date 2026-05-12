<?php
header('Content-Type: application/json');
session_start();

$host = 'localhost';
$db   = 'nestqc_db';
$user = 'root';
$pass = '';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Connection failed.']);
    exit;
}

$data     = json_decode(file_get_contents('php://input'), true);
$fname    = isset($data['fname'])    ? trim($data['fname'])    : '';
$mname    = isset($data['mname'])    ? trim($data['mname'])    : '';
$lname    = isset($data['lname'])    ? trim($data['lname'])    : '';
$uname    = isset($data['uname'])    ? trim($data['uname'])    : '';
$password = isset($data['password']) ? $data['password']       : '';

// Validate
if (!$fname || !$lname || !$uname || !$password) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields.']);
    exit;
}
if (strlen($uname) < 3) {
    echo json_encode(['success' => false, 'message' => 'Username must be at least 3 characters.']);
    exit;
}
if (strlen($password) < 8) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters.']);
    exit;
}
if (!preg_match('/[A-Z]/', $password)) {
    echo json_encode(['success' => false, 'message' => 'Password must contain at least one uppercase letter.']);
    exit;
}
if (!preg_match('/[a-z]/', $password)) {
    echo json_encode(['success' => false, 'message' => 'Password must contain at least one lowercase letter.']);
    exit;
}
if (!preg_match('/[0-9]/', $password)) {
    echo json_encode(['success' => false, 'message' => 'Password must contain at least one number.']);
    exit;
}
if (!preg_match('/[^a-zA-Z0-9]/', $password)) {
    echo json_encode(['success' => false, 'message' => 'Password must contain at least one special character.']);
    exit;
}

// Check if username already exists
$check = $conn->prepare("SELECT userID FROM users WHERE uname = ?");
$check->bind_param('s', $uname);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Username is already taken. Please choose another.']);
    exit;
}

// Hash password
$hashed = password_hash($password, PASSWORD_DEFAULT);

// Insert user
$stmt = $conn->prepare("INSERT INTO users (fname, mname, lname, uname, password, role) VALUES (?, ?, ?, ?, ?, 'user')");
$stmt->bind_param('sssss', $fname, $mname, $lname, $uname, $hashed);

if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
    exit;
}

$newUserID = $stmt->insert_id;

// Auto login after registration
$_SESSION['userID'] = $newUserID;
$_SESSION['fname']  = $fname;
$_SESSION['mname']  = $mname;
$_SESSION['lname']  = $lname;
$_SESSION['uname']  = $uname;
$_SESSION['role']   = 'user';
$_SESSION['pfp']    = 'uploads/pfp/default.jpg';

echo json_encode(['success' => true, 'message' => 'Account created successfully.']);
$conn->close();
?>