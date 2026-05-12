<?php
header('Content-Type: application/json');
require 'admin_check.php';
$conn = new mysqli('localhost','root','','nestqc_db');
$res = $conn->query("SELECT userID, fname, lname, uname, role, created_at FROM users ORDER BY userID DESC");
$users = [];
while($r = $res->fetch_assoc()) $users[] = $r;
echo json_encode(['success'=>true, 'users'=>$users]);