<?php
header('Content-Type: application/json');
session_start();

if (isset($_SESSION['userID'])) {
    // Fetch theme from DB so it's always accurate
    $conn = new mysqli('localhost', 'root', '', 'nestqc_db');
    $theme = 'dark'; // default fallback
    if (!$conn->connect_error) {
        $uid  = (int)$_SESSION['userID'];
        $stmt = $conn->prepare("SELECT theme FROM users WHERE userID = ?");
        $stmt->bind_param('i', $uid);
        $stmt->execute();
        $stmt->bind_result($dbTheme);
        if ($stmt->fetch() && $dbTheme) {
            $theme = $dbTheme;
        }
        $stmt->close();
        $conn->close();
    }

    echo json_encode([
        'loggedIn' => true,
        'user'     => [
            'userID' => $_SESSION['userID'],
            'fname'  => $_SESSION['fname'],
            'lname'  => $_SESSION['lname'],
            'uname'  => $_SESSION['uname'],
            'role'   => $_SESSION['role'],
            'pfp'    => $_SESSION['pfp'],
            'mname'  => $_SESSION['mname'] ?? '',
            'theme'  => $theme,
        ]
    ]);
} else {
    echo json_encode(['loggedIn' => false]);
}
?>