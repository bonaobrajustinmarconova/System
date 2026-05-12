<?php
header('Content-Type: application/json');
session_start();

$conn = new mysqli('localhost', 'root', '', 'nestqc_db');
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

// Fetch only non-archived dorms
$dorms = [];
$result = $conn->query("
    SELECT dormID, dname, price, latitude, longitude, dormPics,
           dorm_pic1, dorm_pic2, dorm_pic3,
           average_rating, address, vacancy_status, vacancy_updated_at,
           owner_name, contact_phone, contact_email, contact_facebook
    FROM dorms
    WHERE is_archived = 0 OR is_archived IS NULL
    ORDER BY average_rating DESC
");
while ($row = $result->fetch_assoc()) {
    $dorms[$row['dormID']] = [
        'dormID'             => (int)$row['dormID'],
        'dname'              => $row['dname'],
        'price'              => (float)$row['price'],
        'latitude'           => (float)$row['latitude'],
        'longitude'          => (float)$row['longitude'],
        'dormPics'           => $row['dormPics'],
        'dorm_pic1'          => $row['dorm_pic1'] ?: $row['dormPics'],
        'dorm_pic2'          => $row['dorm_pic2'] ?? '',
        'dorm_pic3'          => $row['dorm_pic3'] ?? '',
        'average_rating'     => (float)$row['average_rating'],
        'address'            => $row['address'] ?? '',
        'vacancy_status'     => $row['vacancy_status'] ?? 'unknown',
        'vacancy_updated_at' => $row['vacancy_updated_at'],
        'owner_name'         => $row['owner_name'] ?? '',
        'contact_phone'      => $row['contact_phone'] ?? '',
        'contact_email'      => $row['contact_email'] ?? '',
        'contact_facebook'   => $row['contact_facebook'] ?? '',
        'amenities'          => [],
        'room_types'         => [],
    ];
}

// Fetch amenities
$amenities = $conn->query("SELECT dormID, amenity_name FROM amenities");
while ($row = $amenities->fetch_assoc()) {
    if (isset($dorms[$row['dormID']])) {
        $dorms[$row['dormID']]['amenities'][] = $row['amenity_name'];
    }
}

echo json_encode(['success' => true, 'dorms' => array_values($dorms)]);
$conn->close();
?>