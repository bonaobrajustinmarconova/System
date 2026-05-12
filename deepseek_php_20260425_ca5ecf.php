<?php
header('Content-Type: application/json');
require 'admin_check.php';

$conn = new mysqli('localhost', 'root', '', 'nestqc_db');
if ($conn->connect_error) { echo json_encode(['success'=>false]); exit; }

$result = $conn->query("SELECT userID, fname, lname, uname, role, created_at FROM users ORDER BY userID DESC");
$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = [
        'userID'    => (int)$row['userID'],
        'fname'     => $row['fname'],
        'lname'     => $row['lname'],
        'uname'     => $row['uname'],
        'role'      => $row['role'],
        'created_at'=> $row['created_at']
    ];
}
echo json_encode(['success' => true, 'users' => $users]);
$conn->close();