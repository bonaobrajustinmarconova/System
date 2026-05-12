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
$username = isset($data['username']) ? trim($data['username']) : '';
$password = isset($data['password']) ? $data['password']       : '';

if (!$username || !$password) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all fields.']);
    exit;
}

$stmt = $conn->prepare("SELECT userID, fname, mname, lname, uname, password, role, pfp FROM users WHERE uname = ?");
$stmt->bind_param('s', $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
    exit;
}

$user_row = $result->fetch_assoc();

// Check password (supports both plain text and hashed)
$valid = password_verify($password, $user_row['password']);

if (!$valid) {
    echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
    exit;
}

// Set session
$_SESSION['userID'] = $user_row['userID'];
$_SESSION['fname']  = $user_row['fname'];
$_SESSION['mname']  = $user_row['mname'];
$_SESSION['lname']  = $user_row['lname'];
$_SESSION['uname']  = $user_row['uname'];
$_SESSION['role']   = $user_row['role'];
$_SESSION['pfp']    = $user_row['pfp'];

echo json_encode([
    'success' => true,
    'user'    => [
        'userID' => $user_row['userID'],
        'fname'  => $user_row['fname'],
        'lname'  => $user_row['lname'],
        'uname'  => $user_row['uname'],
        'role'   => $user_row['role'],
        'pfp'    => $user_row['pfp'],
    ]
]);

$conn->close();
?>
