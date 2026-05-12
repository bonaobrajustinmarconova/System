<?php
header('Content-Type: application/json');
require 'admin_check.php';

$conn = new mysqli('localhost', 'root', '', 'nestqc_db');
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB error']);
    exit;
}

// Accept FormData (multipart) instead of JSON so images can be uploaded
$dname      = trim($_POST['dname'] ?? '');
$address    = trim($_POST['address'] ?? '');
$price      = (float)($_POST['price'] ?? 0);
$lat        = (float)($_POST['latitude'] ?? 0);
$lng        = (float)($_POST['longitude'] ?? 0);
$owner_name = trim($_POST['owner_name'] ?? '');   // stores website URL
$phone      = trim($_POST['contact_phone'] ?? '');
$email      = trim($_POST['contact_email'] ?? '');
$facebook   = trim($_POST['contact_facebook'] ?? '');
$description = trim($_POST['description'] ?? '');
$amenities  = json_decode($_POST['amenities'] ?? '[]', true);

if (!$dname) {
    echo json_encode(['success' => false, 'message' => 'Dorm name required']);
    exit;
}

// ── Handle up to 3 image uploads ──
$uploadDir = 'uploads/dorm_pics/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

$picPaths = ['', '', ''];
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

for ($i = 0; $i < 3; $i++) {
    $key = "image{$i}";
    if (isset($_FILES[$key]) && $_FILES[$key]['error'] === UPLOAD_ERR_OK) {
        $tmp  = $_FILES[$key]['tmp_name'];
        $type = mime_content_type($tmp);
        if (!in_array($type, $allowedTypes)) continue;
        $ext      = pathinfo($_FILES[$key]['name'], PATHINFO_EXTENSION);
        $filename = uniqid("dorm_{$i}_") . '.' . $ext;
        $dest     = $uploadDir . $filename;
        if (move_uploaded_file($tmp, $dest)) {
            $picPaths[$i] = $dest;
        }
    }
}

$stmt = $conn->prepare(
    "INSERT INTO dorms
        (dname, address, price, latitude, longitude, owner_name, contact_phone, contact_email, contact_facebook, description, dormPics, dorm_pic1, dorm_pic2, dorm_pic3)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);
$legacyPic = $picPaths[0] ?: 'uploads/dorm_pics/default.jpg';
$stmt->bind_param(
    'ssdddsssssssss',
    $dname, $address, $price, $lat, $lng,
    $owner_name, $phone, $email, $facebook, $description,
    $legacyPic, $picPaths[0], $picPaths[1], $picPaths[2]
);

if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'message' => 'Insert failed: ' . $stmt->error]);
    exit;
}
$newID = $conn->insert_id;

if (!empty($amenities)) {
    $ins = $conn->prepare("INSERT INTO amenities (dormID, amenity_name) VALUES (?, ?)");
    foreach ($amenities as $a) {
        $a = trim($a);
        if ($a) { $ins->bind_param('is', $newID, $a); $ins->execute(); }
    }
}

echo json_encode(['success' => true, 'dormID' => $newID]);
$conn->close();