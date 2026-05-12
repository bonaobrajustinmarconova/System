-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 01, 2026 at 02:05 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nestqc_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `amenities`
--

CREATE TABLE `amenities` (
  `amenityID` int(11) NOT NULL,
  `dormID` int(11) NOT NULL,
  `amenity_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `amenities`
--

INSERT INTO `amenities` (`amenityID`, `dormID`, `amenity_name`) VALUES
(17, 5, 'Wi-Fi'),
(18, 5, 'Study Room'),
(19, 5, 'CCTV'),
(20, 5, 'Water & Electricity'),
(116, 12, 'Wi-Fi'),
(117, 12, 'Water & Electricity'),
(140, 16, 'Dining area'),
(141, 16, 'Laundry Service'),
(142, 16, 'CCTV'),
(143, 16, 'Security'),
(144, 17, 'own bathroom'),
(145, 17, 'AC'),
(146, 17, 'Laundry Service'),
(147, 17, 'Water & Electricity'),
(148, 17, 'Security'),
(149, 17, 'CCTV'),
(150, 17, 'Wi-Fi'),
(151, 17, 'Biometric Door Lock'),
(152, 18, 'Water & Electricity'),
(153, 18, 'Wi-Fi'),
(176, 3, 'Water & Electricity'),
(177, 3, 'Parking'),
(178, 3, 'Transport service'),
(179, 3, 'AC'),
(180, 7, 'AC'),
(181, 7, 'Biometric Door Lock'),
(182, 7, 'Parking'),
(183, 7, 'Common Area'),
(184, 7, 'Laundry Service'),
(185, 7, 'Transport service'),
(189, 8, 'Wi-Fi'),
(190, 8, 'Parking'),
(191, 8, 'Open 24/7 no curfew'),
(192, 8, 'CCTV'),
(193, 8, 'High Security'),
(194, 8, 'Laundry Service'),
(195, 9, 'Wi-Fi'),
(196, 9, 'High Security'),
(197, 10, 'own bathroom'),
(198, 10, 'Wi-Fi'),
(209, 13, 'Wi-Fi'),
(210, 13, 'Water & Electricity'),
(211, 13, 'AC'),
(212, 13, 'CCTV'),
(213, 13, 'Biometric Door Lock'),
(216, 15, 'Free Housekeeping'),
(217, 15, 'Water & Electricity'),
(218, 15, 'AC'),
(219, 15, 'Wi-Fi'),
(220, 15, 'Study Room'),
(221, 15, 'Parking'),
(222, 15, 'Gym'),
(223, 15, 'Basketball Court'),
(224, 19, 'Security'),
(225, 19, 'Wi-Fi'),
(226, 19, 'Cable TV'),
(227, 11, 'Wi-Fi'),
(228, 11, 'High Security'),
(229, 11, 'AC'),
(237, 14, 'High Security'),
(238, 14, 'Water & Electricity'),
(239, 2, 'Laundry Area'),
(240, 2, 'Water & Electricity'),
(241, 2, 'own bathroom'),
(242, 2, 'CCTV'),
(243, 2, 'Gym'),
(244, 2, 'Dining area'),
(245, 2, 'Study Room'),
(246, 2, 'Wi-Fi'),
(267, 4, 'Water & Electricity'),
(268, 4, 'own locker'),
(269, 4, 'CCTV'),
(270, 4, 'Wi-Fi'),
(292, 1, 'Wi-Fi'),
(293, 1, 'AC'),
(294, 1, 'Water & Electricity'),
(295, 1, 'Study Room'),
(296, 1, 'Biometric Door Lock'),
(297, 1, 'Dining area'),
(298, 1, 'Laundry Service'),
(311, 20, 'Wi-Fi'),
(312, 20, 'CCTV'),
(313, 20, 'Study Room'),
(314, 20, 'Water & Electricity'),
(315, 20, 'Parking'),
(316, 20, 'AC'),
(317, 20, 'Basketball Court'),
(318, 20, 'Near Jeepney'),
(319, 21, 'Wi-Fi'),
(320, 21, 'CCTV'),
(321, 21, 'Study Room'),
(322, 21, 'Water & Electricity'),
(323, 21, 'AC'),
(324, 21, 'Security'),
(325, 21, 'Free Housekeeping'),
(326, 22, 'Wi-Fi'),
(327, 22, 'CCTV'),
(328, 22, 'Study Room'),
(329, 22, 'Water & Electricity'),
(330, 22, 'AC'),
(331, 22, 'Parking'),
(332, 22, 'Basketball Court'),
(333, 22, 'Near Jeepney'),
(334, 22, 'own locker'),
(335, 22, 'Gym'),
(336, 22, 'Open 24/7 no curfew');

-- --------------------------------------------------------

--
-- Table structure for table `dorms`
--

CREATE TABLE `dorms` (
  `dormID` int(11) NOT NULL,
  `dname` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `longitude` decimal(10,6) DEFAULT NULL,
  `latitude` decimal(10,6) DEFAULT NULL,
  `dormPics` varchar(255) NOT NULL DEFAULT 'uploads/dorm_pics/default.jpg',
  `address` varchar(255) DEFAULT NULL,
  `average_rating` decimal(3,2) NOT NULL DEFAULT 0.00,
  `vacancy_status` enum('available','full','unknown') NOT NULL DEFAULT 'unknown',
  `vacancy_updated_at` datetime DEFAULT NULL,
  `owner_name` varchar(150) DEFAULT NULL,
  `contact_phone` varchar(30) DEFAULT NULL,
  `contact_email` varchar(150) DEFAULT NULL,
  `contact_facebook` varchar(255) DEFAULT NULL,
  `dorm_pic1` varchar(255) DEFAULT '',
  `dorm_pic2` varchar(255) DEFAULT '',
  `dorm_pic3` varchar(255) DEFAULT '',
  `is_archived` tinyint(1) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dorms`
--

INSERT INTO `dorms` (`dormID`, `dname`, `price`, `longitude`, `latitude`, `dormPics`, `address`, `average_rating`, `vacancy_status`, `vacancy_updated_at`, `owner_name`, `contact_phone`, `contact_email`, `contact_facebook`, `dorm_pic1`, `dorm_pic2`, `dorm_pic3`, `is_archived`, `description`) VALUES
(1, 'TERRAZA AZUL DORMITORY AND RESIDENCE HALL', 7500.00, 121.074700, 14.634600, 'uploads/dorm_pics/dorm_0_69ee5d28a5418.jpg', '74 Xavierville Ave, Brgy, Quezon City, 1108 Metro Manila', 4.00, 'available', '2026-05-01 00:59:28', 'https://www.terrazaazulph.com', '+63 929 649 9591', '', 'https://www.facebook.com/terrazaresidence', 'uploads/dorm_pics/dorm_0_69ee5d28a5418.jpg', 'uploads/dorm_pics/dorm_1_69ee5d28a6308.jpg', 'uploads/dorm_pics/dorm_2_69ee5d28a7a13.jpg', 0, 'TERRAZA AZUL DORMITORY AND RESIDENCE HALL is a renovated four-storey building that feels like a home for international students. It’s located at 74 Xavierville Ave., Brgy. Loyola Heights, Quezon City.\r\n\r\nThe dorm has 22 spacious rooms, each comfortably fitting up to four people. It’s conveniently near major universities like UP Diliman, Ateneo de Manila, Miriam College, and culinary schools such as CCA-Katipunan, ISCHAM, First Gourmet Academy, and the CDEP review center.\r\n\r\nAmenities include 24/7 security, social spaces, and free Wi-Fi. The property is less than a 10-minute walk from train and public transit terminals, with round-the-clock transport options.'),
(2, 'CF Residence', 3300.00, 121.018200, 14.654700, 'uploads/dorm_pics/dorm_0_69ee666507357.jpg', '19, 1105 Alibangbang, Project 7, Quezon City, Metro Manila', 4.00, 'unknown', NULL, 'https://cfresidences.wixsite.com/cfresidences/', '+63 923 557 8487', '', 'https://www.facebook.com/cf.residence.1/', 'uploads/dorm_pics/dorm_0_69ee666507357.jpg', 'uploads/dorm_pics/dorm_1_69ee666507c77.jpg', 'uploads/dorm_pics/dorm_2_69ee666508c44.jpg', 0, NULL),
(3, 'My Rainbow Place Dormitory', 6500.00, 121.040736, 14.676590, 'uploads/dorm_pics/dorm_0_69ee470eb7a32.jpg', '437 Tandang Sora Ave, Tandang Sora, Quezon City, Metro Manila', 5.00, 'available', '2026-04-30 16:13:43', '', '+63 917 583 6143', '', 'https://www.facebook.com/share/18TxYLb1qy/', 'uploads/dorm_pics/dorm_0_69ee470eb7a32.jpg', 'uploads/dorm_pics/dorm_1_69ee5a433f6f8.jpg', 'uploads/dorm_pics/dorm_2_69ee5a434024b.jpg', 0, NULL),
(4, 'Mang Ben Dormitory', 16500.00, 121.005070, 14.634148, 'uploads/dorm_pics/dorm_0_69ee4423d7ff7.jpg', '732 N.S. Amoranto Sr. St, Santa Mesa Heights, Quezon City, 1114 Metro Manila', 4.00, 'available', '2026-04-26 12:27:56', '', '+63 966 006 0964', 'mangben.dlg@gmail.com', 'https://www.facebook.com/share/18VoPCMdqE/', 'uploads/dorm_pics/dorm_0_69ee4423d7ff7.jpg', 'uploads/dorm_pics/dorm_1_69ee5981291e7.jpg', 'uploads/dorm_pics/dorm_2_69ee598129733.jpg', 0, ''),
(5, 'New Era Mens Dorm 10', 2700.00, 121.057300, 14.663400, 'uploads/dorm_pics/default.jpg', '61 Central Ave, New Era (Constitution Hills), New Era, Quezon City, 1107 Metro Manila', 4.90, 'unknown', NULL, 'New Era Dorm Admin', '+63 921 567 8901', 'neweradorm@gmail.com', NULL, 'uploads/dorm_pics/default.jpg', 'uploads/dorm_pics/default.jpg', 'uploads/dorm_pics/default.jpg', 1, NULL),
(7, 'Comfort Zone by ECZ Dormitory', 8500.00, 121.069478, 14.709131, 'uploads/dorm_pics/dorm_0_69ee3fb695269.jpg', '63B Regalado Ave Extension cor Pearl St, Brgy East Fairview East, Novaliches, Quezon City, 1118 Metro Manila', 0.00, 'unknown', NULL, '', '+63 917 149 4022', '', 'https://www.facebook.com/share/1Gv69F4bvi/', 'uploads/dorm_pics/dorm_0_69ee3fb695269.jpg', 'uploads/dorm_pics/dorm_1_69ee3fb69597d.jpg', 'uploads/dorm_pics/dorm_2_69ee3fb696008.jpg', 0, NULL),
(8, '888 trumpwealth dormitory', 15000.00, 121.069444, 14.709221, 'uploads/dorm_pics/dorm_0_69ee41431b7f8.jpg', '63A Regalado Ave, Quezon City, 1118 Metro Manila', 0.00, 'unknown', NULL, '', '+63 945 492 5375', '888trumpwealthdormitory@gmail.com', 'https://www.facebook.com/share/19po3VKQ4g/', 'uploads/dorm_pics/dorm_0_69ee41431b7f8.jpg', 'uploads/dorm_pics/dorm_1_69ee5b8de26bb.jpg', 'uploads/dorm_pics/dorm_2_69ee5b8de2d13.jpg', 0, NULL),
(9, 'College square dormitory', 6000.00, 121.067808, 14.696559, 'uploads/dorm_pics/dorm_0_69ee430404ed1.jpg', 'Regalado Ave. West Fairview Quezon City', 0.00, 'unknown', NULL, '', '+63 917 857 2507', '', 'https://www.facebook.com/share/1B2bpkfjAL/', 'uploads/dorm_pics/dorm_0_69ee430404ed1.jpg', 'uploads/dorm_pics/dorm_1_69ee430405752.jpg', 'uploads/dorm_pics/dorm_2_69ee4304063bd.jpg', 0, NULL),
(10, 'Bonifacio Ladies Dorm', 5000.00, 121.060583, 14.664593, 'uploads/dorm_pics/dorm_0_69ee5c9c2a48a.jpg', '8 St John, New Era (Constitution Hills), Quezon City, Metro Manila', 0.00, 'unknown', NULL, '', '+63 997 064 6050', '', 'https://www.facebook.com/share/17e8PfBv5R/', 'uploads/dorm_pics/dorm_0_69ee5c9c2a48a.jpg', 'uploads/dorm_pics/dorm_1_69ee5c9c2ac8d.jpg', 'uploads/dorm_pics/dorm_2_69ee5c9c2b8c9.jpg', 0, NULL),
(11, 'FJN Dormitory', 6000.00, 121.066400, 14.700100, 'uploads/dorm_pics/dorm_0_69ee5dac174eb.jpg', 'Dahlia Commercial Complex Dahlia Ave, corner Rolex, Quezon City, 1118', 0.00, 'unknown', NULL, '', '+63 922 459 1193', '', 'https://www.facebook.com/share/1GGJLVjz9B/', 'uploads/dorm_pics/dorm_0_69ee5dac174eb.jpg', 'uploads/dorm_pics/dorm_1_69ee5dac17c93.jpg', 'uploads/dorm_pics/dorm_2_69ee5dac18758.jpg', 0, NULL),
(12, 'Casa la niña womens dorm', 3000.00, 121.027401, 14.630740, 'uploads/dorm_pics/default.jpg', '41 Scout Castor St., Brgy. Laging Handa, Quezon City, 1103 Metro Manila', 0.00, 'unknown', NULL, '', '+63 947 289 3808', '', 'https://www.facebook.com/share/1brngfnN3o/', 'uploads/dorm_pics/dorm_0_69ee47d1dee63.jpg', 'uploads/dorm_pics/dorm_1_69ee47d1df65f.jpg', 'uploads/dorm_pics/dorm_2_69ee47d1e0af5.jpg', 0, NULL),
(13, 'Moon heart Dormitory', 3000.00, 121.068808, 14.698800, 'uploads/dorm_pics/dorm_0_69ee48bca861f.jpg', '4 Bel Air, Novaliches, Quezon City, Metro Manila', 0.00, 'unknown', NULL, '', '+63 915 718 6670', '', 'https://www.facebook.com/share/1DxxQTuLrf/', 'uploads/dorm_pics/dorm_0_69ee48bca861f.jpg', 'uploads/dorm_pics/dorm_1_69ee5e2987fc1.jpg', 'uploads/dorm_pics/dorm_2_69ee48bca915c.jpg', 0, NULL),
(14, 'Estado dos dormitory 3-13', 3000.00, 121.065574, 14.700390, 'uploads/dorm_pics/dorm_0_69ee63daa773c.jpg', '3-13 Fairlane, Novaliches, Quezon City, 1118 Metro Manila', 0.00, 'unknown', NULL, '', '+63 905 940 1748', '', 'https://www.facebook.com/share/1CE5KNPe2X/', 'uploads/dorm_pics/dorm_0_69ee63daa773c.jpg', 'uploads/dorm_pics/dorm_1_69ee63daa81f9.jpg', 'uploads/dorm_pics/dorm_2_69ee5e94841f2.jpg', 0, NULL),
(15, 'Golden panda dormtel', 8500.00, 121.010229, 14.618628, 'uploads/dorm_pics/dorm_0_69ee4d7c8593c.jpg', 'G/F Golden Panda Building #447 E. Rodriguez Sr. Avenue cor. Banawe Street, Brgy. Tatalon, Quezon City, 1113 Metro Manila', 0.00, 'unknown', NULL, '', '+63 919 077 7997', '', 'https://www.facebook.com/share/1LqD6K4SCF/', 'uploads/dorm_pics/dorm_0_69ee4d7c8593c.jpg', 'uploads/dorm_pics/dorm_1_69ee4d7c8622c.jpg', 'uploads/dorm_pics/dorm_2_69ee4d7c869cb.jpg', 0, NULL),
(16, '4JS lady bed space', 3000.00, 121.048483, 14.633521, 'uploads/dorm_pics/default.jpg', '16-C Mapang-akit St, Diliman, Quezon City, 1100 Metro Manila', 0.00, 'unknown', NULL, '', '+63 948 366 2000', '', 'https://www.facebook.com/4JSLadyBedspace', 'uploads/dorm_pics/dorm_0_69ee4e8595d4d.jpg', 'uploads/dorm_pics/dorm_1_69ee4e85964b7.jpg', 'uploads/dorm_pics/dorm_2_69ee4e8596c58.jpg', 0, NULL),
(17, 'Four E mansion', 8500.00, 121.070086, 14.697942, 'uploads/dorm_pics/default.jpg', '16 Biscayne, Quezon City, 1118 Metro Manila', 0.00, 'unknown', NULL, '', '+63 917 591 0881', 'samboyfloresca@gmail.com', 'https://www.facebook.com/share/1CgYQT5Bgm/', 'uploads/dorm_pics/dorm_0_69ee4f6fdeeef.jpg', 'uploads/dorm_pics/dorm_1_69ee4f6fdf775.jpg', 'uploads/dorm_pics/dorm_2_69ee4f6fdfec9.jpg', 0, NULL),
(18, 'DSM room/beds rental', 3800.00, 121.049746, 14.636015, 'uploads/dorm_pics/default.jpg', 'DSM rooms/beds rentals 50-D Mabilis Street, Pinyahan, Quezon City, Philippines, 1100', 0.00, 'unknown', NULL, '', '+63 9995 036 3002', 'dsmpinyahan@gmail.com', 'https://www.facebook.com/share/1BGuxkpAoz/', 'uploads/dorm_pics/dorm_0_69ee50c5e5d67.jpg', 'uploads/dorm_pics/dorm_1_69ee50c5e6559.jpg', 'uploads/dorm_pics/dorm_2_69ee50c5e6b3c.jpg', 0, NULL),
(19, 'ACT Dormitory', 3500.00, 121.050715, 14.621423, 'uploads/dorm_pics/dorm_0_69ee518ade855.jpg', 'ACT Theater Building corner Aurora Boulevard, Epifanio de los Santos Ave, Cubao, Quezon City, 1109 Metro Manila', 0.00, 'unknown', NULL, '', '+63 921 862 3765', 'support@actdormitory.com', 'https://www.facebook.com/share/14YpYgajnFg/', 'uploads/dorm_pics/dorm_0_69ee518ade855.jpg', 'uploads/dorm_pics/dorm_1_69ee518adee89.jpg', 'uploads/dorm_pics/dorm_2_69ee518adf8d4.jpg', 0, NULL),
(20, 'abuchiki', 1000.00, 121.406700, 14.515200, 'uploads/dorm_pics/default.jpg', 'GFRGSRG', 0.00, 'unknown', NULL, 'https://www.terrazaazulph.com', '+63 929 649 9591', 'mangben.dlg@gmail.com', 'https://www.facebook.com/terrazaresidence', '', '', '', 1, 'GSEGD'),
(21, 'bruhhh', 1564.00, 121.456700, 14.679800, 'uploads/dorm_pics/dorm_0_69f4450f888e9.jpg', 'GFRGSRG', 0.00, 'unknown', NULL, 'https://www.terrazaazulph.com', '+63 929 649 9591', 'mangben.dlg@gmail.com', 'https://www.facebook.com/terrazaresidence', 'uploads/dorm_pics/dorm_0_69f4450f888e9.jpg', 'uploads/dorm_pics/dorm_1_69f4450f892f6.jpg', 'uploads/dorm_pics/dorm_2_69f4450f8988a.jpg', 1, 'it is a good dorm in qc'),
(22, 'bruhhh', 3458.00, 121.345600, 14.567800, 'uploads/dorm_pics/dorm_0_69f445fb54ae7.jpg', 'kdhgdhfjhhgc', 0.00, 'unknown', NULL, 'https://www.terrazaazulph.com', '+63 929 649 9591', 'jonesnhick@gmail.com', 'https://www.facebook.com/terrazaresidence', 'uploads/dorm_pics/dorm_0_69f445fb54ae7.jpg', 'uploads/dorm_pics/dorm_1_69f445fb552c6.jpg', 'uploads/dorm_pics/dorm_2_69f445fb55bcf.jpg', 0, 'it is a dorm near sm nova, great dorm');

-- --------------------------------------------------------

--
-- Table structure for table `likeddorms`
--

CREATE TABLE `likeddorms` (
  `likeDID` int(11) NOT NULL,
  `dormID` int(11) NOT NULL,
  `userID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `likeddorms`
--

INSERT INTO `likeddorms` (`likeDID`, `dormID`, `userID`) VALUES
(53, 3, 7),
(81, 1, 12),
(76, 2, 12),
(77, 3, 12),
(72, 4, 12),
(80, 16, 12);

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `messageID` int(11) NOT NULL,
  `senderID` int(11) NOT NULL,
  `receiverID` int(11) NOT NULL COMMENT 'For user→admin: receiverID = 0 (admin inbox). For admin→user: receiverID = userID',
  `content` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`messageID`, `senderID`, `receiverID`, `content`, `is_read`, `created_at`) VALUES
(2, 7, 0, 'hello', 1, '2026-04-25 13:26:12'),
(3, 7, 0, 'hello', 1, '2026-04-25 13:50:35'),
(5, 7, 0, 'hi', 1, '2026-04-25 14:36:04'),
(6, 7, 0, 'hi', 1, '2026-04-25 20:56:36'),
(7, 7, 0, 'hi', 1, '2026-04-25 20:56:44'),
(19, 7, 0, 'hi', 1, '2026-04-25 21:24:17'),
(22, 7, 0, 'hey', 1, '2026-04-25 21:30:36'),
(24, 7, 0, 'hello', 1, '2026-04-25 21:34:25'),
(25, 7, 0, 'hi', 1, '2026-04-25 21:35:00'),
(27, 7, 0, 'hi', 1, '2026-04-25 21:39:06'),
(30, 7, 0, 'test', 1, '2026-04-25 21:51:26'),
(32, 7, 0, 'hi', 1, '2026-04-25 22:06:21'),
(33, 10, 0, 'hello', 1, '2026-04-26 11:55:51'),
(35, 10, 6, 'gumagana yan', 1, '2026-04-26 12:40:45'),
(39, 10, 11, 'nah you trippin', 0, '2026-04-26 13:07:44'),
(40, 12, 0, 'skibidi toilet', 1, '2026-04-26 13:42:41'),
(41, 12, 0, '6 7', 1, '2026-04-26 13:42:44'),
(42, 10, 12, 'sira po ba ulo niyo sir', 1, '2026-04-26 13:43:48'),
(44, 10, 6, 'ano?', 1, '2026-04-26 20:49:13'),
(45, 10, 0, 'woi', 1, '2026-04-27 15:38:43'),
(46, 10, 10, 'what', 1, '2026-04-27 15:38:51'),
(47, 10, 12, 'pa sign autograph idol', 1, '2026-04-27 15:39:43'),
(48, 12, 0, 'sa saturday', 1, '2026-04-27 15:40:16'),
(49, 19, 0, 'hi po ginagamit po ba ito ni enrique gil?', 1, '2026-05-01 13:58:59'),
(50, 19, 0, 'HOI SAGOT KUNG AYAW MO ICANCEL KO TO', 1, '2026-05-01 14:00:14'),
(51, 10, 12, 'saturday na bukas idol', 1, '2026-05-01 14:01:03'),
(52, 10, 19, 'get a life bruh', 0, '2026-05-01 14:01:19');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notifID` int(11) NOT NULL,
  `userID` int(11) NOT NULL COMMENT 'Who receives the notification',
  `messageID` int(11) DEFAULT NULL COMMENT 'Linked message if applicable',
  `content` varchar(255) NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notifID`, `userID`, `messageID`, `content`, `is_read`, `created_at`) VALUES
(21, 12, 42, 'Admin replied to your message.', 1, '2026-04-26 13:43:48'),
(23, 10, 46, 'Admin replied to your message.', 1, '2026-04-27 15:38:51'),
(24, 12, 47, 'Admin replied to your message.', 1, '2026-04-27 15:39:43'),
(25, 12, 51, 'Admin replied to your message.', 1, '2026-05-01 14:01:03'),
(26, 19, 52, 'Admin replied to your message.', 0, '2026-05-01 14:01:19');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `reviewID` int(11) NOT NULL,
  `dormID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `ratings` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`reviewID`, `dormID`, `userID`, `comment`, `ratings`, `created_at`) VALUES
(2, 2, 7, 'nice', NULL, '2026-04-26 12:34:36'),
(4, 2, 12, 'the dorm is nice, the amenities and services are solid as well\n\nmag rate ka irvine', 4, '2026-04-26 13:41:53'),
(5, 1, 12, 'babaeeAWEFEDGGV', 4, '2026-04-27 15:24:42'),
(6, 4, 12, 'OMG ITZ GOOODDD', 4, '2026-04-27 15:32:19'),
(7, 3, 12, 'Ahahahhaha', 5, '2026-04-29 14:18:20');

-- --------------------------------------------------------

--
-- Table structure for table `room_types`
--

CREATE TABLE `room_types` (
  `roomID` int(11) NOT NULL,
  `dormID` int(11) NOT NULL,
  `room_name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `room_types`
--

INSERT INTO `room_types` (`roomID`, `dormID`, `room_name`, `price`) VALUES
(1, 1, 'Single Room', 7500.00),
(2, 1, 'Shared Room', 4500.00),
(3, 2, 'Single Room', 3300.00),
(4, 2, 'Shared Room', 2000.00),
(5, 3, 'Single Room', 2500.00),
(6, 3, 'Shared Room', 1500.00),
(7, 4, 'Single Room', 16500.00),
(8, 4, 'Shared Room', 10000.00),
(9, 5, 'Single Room', 2700.00),
(10, 5, 'Shared Room', 1800.00);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userID` int(11) NOT NULL,
  `fname` varchar(50) DEFAULT NULL,
  `mname` varchar(50) DEFAULT NULL,
  `lname` varchar(50) DEFAULT NULL,
  `uname` varchar(50) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  `pfp` varchar(150) DEFAULT 'uploads/pfp/default.jpg',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `theme` enum('dark','light') NOT NULL DEFAULT 'dark'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `fname`, `mname`, `lname`, `uname`, `password`, `role`, `pfp`, `created_at`, `theme`) VALUES
(7, 'Irvine', 'Paul', 'Mercado', 'irvinepaulmercado@gmail.com', '$2y$10$yQTztKe/gBpQBLusJo0DG.c.s7uSITE83KyhtoaIMuSDvnXvPlFrG', 'admin', 'uploads/pfp/user_7_1777121388.jpg', '2026-04-25 13:54:19', 'dark'),
(8, 'marco', NULL, 'bonaobra', 'bonaobramarco@gmail.com', '$2y$10$p7R4siQ.iZBE7aPgUkxBlumX00uK3CtWDYSm8waCDhehNTyCd9JsS', 'user', 'uploads/pfp/default.jpg', '2026-04-25 13:56:19', 'dark'),
(9, 'Irbayn', '', 'pol', 'pauldiepiee@gmail.com', '$2y$10$PfOEPjTq9YbAFZFRpN051.oh.pL8TX5IFj/4S8ONqQL0jGGnHLij.', 'user', 'uploads/pfp/default.jpg', '2026-04-25 14:32:06', 'dark'),
(10, 'admin', 'admin', 'admin', 'admin', '$2y$10$3PikWuLV1InHKvK7ZhUqV.IPISpeQ5ZVbTBfcuj1ayJ9eyn16c6N6', 'admin', 'uploads/pfp/user_10_1777185558.jfif', '2026-04-26 11:25:36', 'dark'),
(12, 'Enrique', 'Mari Bacay', 'Gil', 'EnGil', '$2y$10$bjjK5n9DA8qud2hQmuAXQ.WhaB6ixdKBV7qPS9smeGOnGrQH5w8Ru', 'user', 'uploads/pfp/user_12_1777564558.jpg', '2026-04-26 13:38:22', 'dark'),
(16, 'j', 's', 's', 'bro', '$2y$10$L/wmnaCvXfR/hSgj.Xc1hu07Cs3njdruXgYt5CIxyKvipbpYrNi8q', 'user', 'uploads/pfp/default.jpg', '2026-04-28 00:06:19', 'dark'),
(18, 't', '', 's', 'abuchioki', '$2y$10$CLoMkfMObzCu5xZf.AwCQe..HLK8vWUxPpj2qEDLv6WO0A9Y3kglS', 'user', 'uploads/pfp/default.jpg', '2026-04-30 23:52:14', 'dark'),
(19, 'fan', '', 'lizken', 'fan', '$2y$10$AlYuim7B03E2Vz98eJWAqOs1Q9w8tnQpsXiDe2B/bYOyjorb9c1jK', 'user', 'uploads/pfp/default.jpg', '2026-05-01 13:57:15', 'dark');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `amenities`
--
ALTER TABLE `amenities`
  ADD PRIMARY KEY (`amenityID`),
  ADD KEY `dormID` (`dormID`);

--
-- Indexes for table `dorms`
--
ALTER TABLE `dorms`
  ADD PRIMARY KEY (`dormID`);

--
-- Indexes for table `likeddorms`
--
ALTER TABLE `likeddorms`
  ADD PRIMARY KEY (`likeDID`),
  ADD UNIQUE KEY `user_dorm` (`userID`,`dormID`),
  ADD KEY `fk_dorm` (`dormID`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`messageID`),
  ADD KEY `idx_sender` (`senderID`),
  ADD KEY `idx_receiver` (`receiverID`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `idx_is_read` (`is_read`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notifID`),
  ADD KEY `idx_user` (`userID`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `fk_notif_message` (`messageID`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`reviewID`),
  ADD KEY `dormID` (`dormID`),
  ADD KEY `userID` (`userID`);

--
-- Indexes for table `room_types`
--
ALTER TABLE `room_types`
  ADD PRIMARY KEY (`roomID`),
  ADD KEY `dormID` (`dormID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userID`),
  ADD UNIQUE KEY `uname` (`uname`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `amenities`
--
ALTER TABLE `amenities`
  MODIFY `amenityID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=337;

--
-- AUTO_INCREMENT for table `dorms`
--
ALTER TABLE `dorms`
  MODIFY `dormID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `likeddorms`
--
ALTER TABLE `likeddorms`
  MODIFY `likeDID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `messageID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notifID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `reviewID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `room_types`
--
ALTER TABLE `room_types`
  MODIFY `roomID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `amenities`
--
ALTER TABLE `amenities`
  ADD CONSTRAINT `amenities_ibfk_1` FOREIGN KEY (`dormID`) REFERENCES `dorms` (`dormID`) ON DELETE CASCADE;

--
-- Constraints for table `likeddorms`
--
ALTER TABLE `likeddorms`
  ADD CONSTRAINT `fk_dorm` FOREIGN KEY (`dormID`) REFERENCES `dorms` (`dormID`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `fk_msg_sender` FOREIGN KEY (`senderID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notif_message` FOREIGN KEY (`messageID`) REFERENCES `messages` (`messageID`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notif_user` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `dormID` FOREIGN KEY (`dormID`) REFERENCES `dorms` (`dormID`) ON DELETE CASCADE,
  ADD CONSTRAINT `userID` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

--
-- Constraints for table `room_types`
--
ALTER TABLE `room_types`
  ADD CONSTRAINT `room_types_ibfk_1` FOREIGN KEY (`dormID`) REFERENCES `dorms` (`dormID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
