<?php
header('Content-Type: application/json');
require 'admin_check.php';

$conn = new mysqli('localhost', 'root', '', 'nestqc_db');
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB error']);
    exit;
}

// Accept FormData (multipart) for image uploads
$dormID   = intval($_POST['dormID'] ?? 0);
$dname    = trim($_POST['dname'] ?? '');
$address  = trim($_POST['address'] ?? '');
$price    = (float)($_POST['price'] ?? 0);
$lat      = (float)($_POST['latitude'] ?? 0);
$lng      = (float)($_POST['longitude'] ?? 0);
$website  = trim($_POST['owner_name'] ?? '');   // owner_name column stores website URL
$phone    = trim($_POST['contact_phone'] ?? '');
$email    = trim($_POST['contact_email'] ?? '');
$facebook = trim($_POST['contact_facebook'] ?? '');
$description = trim($_POST['description'] ?? '');
$amenities = json_decode($_POST['amenities'] ?? '[]', true);

if (!$dormID || !$dname) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// ── Resolve each image slot ──
$uploadDir = 'uploads/dorm_pics/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$picPaths = ['', '', ''];

for ($i = 0; $i < 3; $i++) {
    $fileKey     = "image{$i}";
    $existingKey = "image{$i}_existing";
    $clearKey    = "image{$i}_clear";

    if (isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error'] === UPLOAD_ERR_OK) {
        // New file uploaded
        $tmp  = $_FILES[$fileKey]['tmp_name'];
        $type = mime_content_type($tmp);
        if (in_array($type, $allowedTypes)) {
            $ext      = pathinfo($_FILES[$fileKey]['name'], PATHINFO_EXTENSION);
            $filename = uniqid("dorm_{$i}_") . '.' . $ext;
            $dest     = $uploadDir . $filename;
            if (move_uploaded_file($tmp, $dest)) {
                $picPaths[$i] = $dest;
            }
        }
    } elseif (!empty($_POST[$existingKey])) {
        // Keep existing URL
        $picPaths[$i] = $_POST[$existingKey];
    } elseif (!empty($_POST[$clearKey])) {
        // Explicitly cleared — leave as empty string
        $picPaths[$i] = '';
    }
}

// Your DB has a single dormPics column — use the first uploaded image as the main photo.
// If all slots are cleared, fall back to the default placeholder.
$mainPic = '';
foreach ($picPaths as $p) {
    if (!empty($p)) { $mainPic = $p; break; }
}
if (empty($mainPic)) $mainPic = 'uploads/dorm_pics/default.jpg';

$stmt = $conn->prepare(
    "UPDATE dorms SET
        dname=?, address=?, price=?, latitude=?, longitude=?,
        owner_name=?, contact_phone=?, contact_email=?, contact_facebook=?,
        description=?,
        dormPics=?, dorm_pic1=?, dorm_pic2=?, dorm_pic3=?
     WHERE dormID=?"
);
$stmt->bind_param(
    'ssdddsssssssssi',
    $dname, $address, $price, $lat, $lng,
    $website, $phone, $email, $facebook,
    $description,
    $mainPic,
    $picPaths[0], $picPaths[1], $picPaths[2],
    $dormID
);

if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'message' => 'Update failed: ' . $stmt->error]);
    exit;
}

// ── Replace amenities ──
$conn->query("DELETE FROM amenities WHERE dormID = $dormID");
if (!empty($amenities)) {
    $ins = $conn->prepare("INSERT INTO amenities (dormID, amenity_name) VALUES (?, ?)");
    foreach ($amenities as $a) {
        $a = trim($a);
        if ($a) { $ins->bind_param('is', $dormID, $a); $ins->execute(); }
    }
}

echo json_encode(['success' => true]);
$conn->close();