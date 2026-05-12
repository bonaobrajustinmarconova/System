<?php
header('Content-Type: application/json');
require 'admin_check.php';

$conn = new mysqli('localhost', 'root', '', 'nestqc_db');
if ($conn->connect_error) { echo json_encode(['success' => false, 'message' => 'Connection failed']); exit; }

$dorms = [];
$result = $conn->query("
    SELECT dormID, dname, price, latitude, longitude, dormPics,
           average_rating, address, vacancy_status, vacancy_updated_at,
           owner_name, contact_phone, contact_email, contact_facebook
    FROM dorms
    WHERE is_archived = 1
    ORDER BY dname ASC
");

while ($row = $result->fetch_assoc()) {
    $dorms[$row['dormID']] = [
        'dormID'         => (int)$row['dormID'],
        'dname'          => $row['dname'],
        'price'          => (float)$row['price'],
        'average_rating' => (float)$row['average_rating'],
        'address'        => $row['address'] ?? '',
        'dormPics'       => $row['dormPics'],
        'amenities'      => [],
    ];
}

// Fetch amenities for archived dorms too
if (!empty($dorms)) {
    $ids     = implode(',', array_keys($dorms));
    $amenities = $conn->query("SELECT dormID, amenity_name FROM amenities WHERE dormID IN ($ids)");
    while ($row = $amenities->fetch_assoc()) {
        if (isset($dorms[$row['dormID']])) {
            $dorms[$row['dormID']]['amenities'][] = $row['amenity_name'];
        }
    }
}

echo json_encode(['success' => true, 'dorms' => array_values($dorms)]);
$conn->close();
?>