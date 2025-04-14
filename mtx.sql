-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 14, 2025 at 06:56 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.1.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mtx` rea
--


-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `document_id` int(11) NOT NULL,
  `documentable_type` varchar(50) NOT NULL COMMENT 'Entity type (e.g. vehicle, user, maintenance)',
  `documentable_id` int(11) NOT NULL COMMENT 'Related entity ID',
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `path` varchar(500) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `size` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `group_permissions`
--

CREATE TABLE `group_permissions` (
  `group_id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `group_permissions`
--

INSERT INTO `group_permissions` (`group_id`, `type_id`) VALUES
(1, 2),
(2, 2),
(2, 3),
(2, 329),
(3, 2),
(3, 3),
(6, 1);

-- --------------------------------------------------------

--
-- Table structure for table `maintenance`
--

CREATE TABLE `maintenance` (
  `id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `mechanic` varchar(255) NOT NULL,
  `service_date` date NOT NULL,
  `odometer` int(11) NOT NULL COMMENT 'Miles/KMs at service time',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `maintenance`
--

INSERT INTO `maintenance` (`id`, `vehicle_id`, `mechanic`, `service_date`, `odometer`, `notes`, `created_at`) VALUES
(1, 1, 'John Smith', '2025-02-15', 44999, 'Regular maintenance service', '2025-02-09 02:11:16'),
(2, 2, 'Mike Johnson', '2025-02-14', 62000, 'Brake service and oil change', '2025-02-09 02:11:16'),
(3, 1, 'John Smith', '2025-02-09', 50, 'Odometer Service', '2025-02-09 14:47:33'),
(4, 2, 'Mike Jhones', '2025-02-12', 5, 'Weekly General Maintenance', '2025-02-11 12:17:57');

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_parts`
--

CREATE TABLE `maintenance_parts` (
  `id` int(11) NOT NULL,
  `maintenance_id` int(11) NOT NULL,
  `part_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `purchase_date` date NOT NULL,
  `actual_price` decimal(10,2) NOT NULL,
  `warranty_applied` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `maintenance_parts`
--

INSERT INTO `maintenance_parts` (`id`, `maintenance_id`, `part_id`, `quantity`, `purchase_date`, `actual_price`, `warranty_applied`) VALUES
(3, 2, 3, 1, '2025-02-14', '85.99', 1),
(4, 2, 1, 1, '2025-02-14', '42.99', 0),
(9, 3, 1, 1, '2025-02-09', '180.00', 0),
(10, 1, 1, 1, '2025-02-11', '25.00', 1);

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_services`
--

CREATE TABLE `maintenance_services` (
  `id` int(11) NOT NULL,
  `maintenance_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `actual_hours` decimal(4,2) NOT NULL,
  `actual_cost` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `maintenance_services`
--

INSERT INTO `maintenance_services` (`id`, `maintenance_id`, `service_id`, `actual_hours`, `actual_cost`) VALUES
(3, 2, 2, '2.75', '190.00'),
(4, 2, 1, '1.00', '45.00'),
(10, 3, 3, '2.00', '50.00'),
(13, 1, 4, '2.00', '6.00'),
(15, 4, 3, '2.00', '50.00');

-- --------------------------------------------------------

--
-- Table structure for table `pages`
--

CREATE TABLE `pages` (
  `page_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `page_permissions`
--

CREATE TABLE `page_permissions` (
  `permission_id` int(11) NOT NULL,
  `type_id` int(11) DEFAULT NULL,
  `page_name` varchar(50) DEFAULT NULL,
  `can_view` tinyint(1) DEFAULT 0,
  `can_edit` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `page_permissions`
--

INSERT INTO `page_permissions` (`permission_id`, `type_id`, `page_name`, `can_view`, `can_edit`) VALUES
(3, 1, 'Clinic POCs', 1, 1),
(4, 1, 'Group Permissions', 1, 1),
(5, 1, 'User Types', 1, 1),
(6, 1, 'Manage Programs', 1, 1),
(8, 2, 'Clinic POCs', 1, 0),
(9, 2, 'Manage Programs', 1, 0),
(12, 3, 'Clinic POCs', 1, 1),
(13, 3, 'Manage Programs', 1, 1),
(15, 328, 'Clinic POCs', 1, 0),
(130, 1, 'User groups', 1, 0),
(131, 2, 'User groups', 0, 0),
(132, 3, 'User groups', 0, 0),
(133, 328, 'User groups', 0, 0),
(134, 329, 'User groups', 0, 0),
(145, 1, 'All users', 0, 0),
(146, 2, 'All users', 1, 0),
(147, 3, 'All users', 0, 0),
(148, 328, 'All users', 0, 0),
(149, 329, 'All users', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `parts_supplier`
--

CREATE TABLE `parts_supplier` (
  `supplier_id` int(11) NOT NULL,
  `company_name` varchar(100) NOT NULL,
  `street_address` varchar(255) NOT NULL,
  `city` varchar(50) NOT NULL,
  `state` varchar(2) NOT NULL,
  `zip` varchar(10) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `fax` varchar(15) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `parts_supplier`
--

INSERT INTO `parts_supplier` (`supplier_id`, `company_name`, `street_address`, `city`, `state`, `zip`, `phone`, `fax`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'HealthCare Inc.', '424 Eve', 'New York', 'IN', '90009', '4803708545', '', '', '2025-02-11 14:27:14', '2025-02-11 14:27:14');

-- --------------------------------------------------------

--
-- Table structure for table `programs`
--

CREATE TABLE `programs` (
  `program_id` int(11) NOT NULL,
  `program_name` varchar(100) NOT NULL,
  `company_id` int(11) NOT NULL,
  `company_name` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `programs`
--

INSERT INTO `programs` (`program_id`, `program_name`, `company_id`, `company_name`, `address`, `city`, `state`, `postal_code`, `phone`, `created_at`, `updated_at`) VALUES
(1, 'Medical Transport Program', 1, 'HealthCare Inc.', '123 Main St', 'New York', 'NY', '10001', '4803708512', '2025-01-31 22:46:46', '2025-02-07 14:00:16'),
(2, 'Emergency Response Program', 2, 'QuickResponse LLC', '456 Oak Ave', 'Los Angeles', 'CA', '90001', '555-987-6543', '2025-01-31 22:46:46', '2025-01-31 22:46:46'),
(3, 'Emergency Response Program', 1, 'HealthCare Inc.', '1 street main', 'bellan', 'NA', '90003', '4803708543', '2025-02-01 23:19:31', '2025-02-02 03:25:04'),
(4, 'Medical Transport Program', 1, 'HealthCare Inc.', '1 street', 'New York', 'NY', '90003', '4803708512', '2025-02-01 23:39:44', '2025-02-02 13:56:01'),
(5, 'Service 1', 1, 'HealthCare Inc.', '123 Street N ave', 'Orlando', 'CA', '90003', '4803708512', '2025-03-15 12:40:14', '2025-03-15 19:13:01');

-- --------------------------------------------------------

--
-- Table structure for table `timesheets`
--

CREATE TABLE `timesheets` (
  `timesheet_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `clock_in` datetime NOT NULL,
  `clock_out` datetime DEFAULT NULL,
  `total_regular_hours` decimal(5,2) DEFAULT 0.00,
  `total_overtime_hours` decimal(5,2) DEFAULT 0.00,
  `status` enum('draft','submitted','approved','rejected') DEFAULT 'draft',
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `timesheets`
--

INSERT INTO `timesheets` (`timesheet_id`, `user_id`, `date`, `clock_in`, `clock_out`, `total_regular_hours`, `total_overtime_hours`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 9, '2025-04-04', '2025-03-24 21:01:10', '2025-03-24 21:13:36', '3.12', '0.00', 'draft', NULL, '2025-03-24 21:01:10', '2025-03-24 21:13:36'),
(2, 9, '2025-03-24', '2025-03-24 23:19:39', NULL, '0.00', '0.00', 'draft', NULL, '2025-03-24 23:19:39', '2025-03-24 23:19:39'),
(3, 11, '2025-03-24', '2025-03-24 23:20:29', '2025-03-24 23:20:35', '0.00', '0.00', '', NULL, '2025-03-24 23:20:29', '2025-03-24 23:20:35'),
(4, 11, '2025-03-24', '2025-03-24 23:20:36', NULL, '0.00', '0.00', 'draft', NULL, '2025-03-24 23:20:36', '2025-03-24 23:20:36'),
(5, 12, '2025-03-22', '2025-03-22 23:20:44', '2025-03-22 23:28:12', '0.12', '0.00', '', NULL, '2025-03-24 23:20:44', '2025-03-24 23:28:12'),
(6, 12, '2025-03-24', '2025-03-24 23:28:13', '2025-03-24 23:44:05', '0.01', '0.00', '', NULL, '2025-03-24 23:28:13', '2025-03-24 23:44:05'),
(7, 21, '2025-03-24', '2025-03-24 23:42:11', NULL, '0.00', '0.00', 'draft', NULL, '2025-03-24 23:42:11', '2025-03-24 23:42:11'),
(8, 9, '2025-03-25', '2025-03-25 00:02:31', '2025-03-25 00:04:04', '0.02', '0.00', '', NULL, '2025-03-25 00:02:31', '2025-03-25 00:04:04'),
(9, 11, '2025-03-25', '2025-03-25 00:40:09', NULL, '0.00', '0.00', 'draft', NULL, '2025-03-25 00:40:09', '2025-03-25 00:40:09'),
(10, 9, '2025-03-28', '2025-03-28 19:47:49', NULL, '0.00', '0.00', 'draft', NULL, '2025-03-28 19:47:49', '2025-03-28 19:47:49'),
(11, 9, '2025-03-29', '2025-03-29 21:30:04', '2025-03-29 21:39:20', '0.15', '0.00', '', NULL, '2025-03-29 21:30:04', '2025-03-29 21:39:20'),
(12, 11, '2025-04-08', '2025-04-08 07:53:17', '2025-04-08 15:03:22', '7.17', '0.00', '', NULL, '2025-04-08 07:53:17', '2025-04-08 15:03:22'),
(13, 9, '2025-04-08', '2025-04-08 15:17:54', '2025-04-08 20:43:38', '3.74', '0.00', '', NULL, '2025-04-08 15:17:54', '2025-04-08 20:43:38'),
(14, 12, '2025-04-08', '2025-04-08 15:19:01', '2025-04-08 20:43:44', '1.68', '0.00', '', NULL, '2025-04-08 15:19:01', '2025-04-08 20:43:44'),
(15, 9, '2025-04-10', '2025-04-10 16:56:56', NULL, '0.00', '0.00', 'draft', NULL, '2025-04-10 16:56:56', '2025-04-10 16:56:56'),
(16, 9, '2025-04-12', '2025-04-12 21:01:48', '2025-04-12 21:06:53', '0.07', '0.00', '', NULL, '2025-04-12 21:01:48', '2025-04-12 21:06:53'),
(18, 11, '2025-04-12', '2025-04-12 21:16:24', '2025-04-12 21:17:48', '0.02', '0.00', '', 'Auto clock-in from trip 59, leg 45\nAuto clock-out from trip 59, leg 45', '2025-04-12 21:16:24', '2025-04-12 21:17:48'),
(19, 11, '2025-04-13', '2025-04-13 14:06:02', '2025-04-13 14:08:55', '0.05', '0.00', '', 'Auto clock-in from trip 59, leg 46\nAuto clock-out from trip 59, leg 46', '2025-04-13 14:06:02', '2025-04-13 14:08:55');

-- --------------------------------------------------------

--
-- Table structure for table `timesheet_breaks`
--

CREATE TABLE `timesheet_breaks` (
  `break_id` int(11) NOT NULL,
  `timesheet_id` int(11) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `type` enum('lunch','break','other') DEFAULT 'break',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `timesheet_breaks`
--

INSERT INTO `timesheet_breaks` (`break_id`, `timesheet_id`, `start_time`, `end_time`, `duration_minutes`, `type`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-03-24 21:01:18', '2025-03-24 21:03:39', 2, 'break', '2025-03-24 21:01:18', '2025-03-24 21:03:39'),
(2, 1, '2025-03-24 21:05:34', '2025-03-24 21:08:45', 3, 'break', '2025-03-24 21:05:34', '2025-03-24 21:08:45'),
(3, 2, '2025-03-24 23:19:44', NULL, NULL, 'break', '2025-03-24 23:19:44', '2025-03-24 23:19:44'),
(4, 3, '2025-03-24 23:20:32', '2025-03-24 23:20:34', 0, 'break', '2025-03-24 23:20:32', '2025-03-24 23:20:34'),
(5, 5, '2025-03-24 23:20:46', '2025-03-24 23:20:48', 0, 'break', '2025-03-24 23:20:46', '2025-03-24 23:20:48'),
(6, 6, '2025-03-24 23:28:14', '2025-03-24 23:43:44', 16, 'break', '2025-03-24 23:28:14', '2025-03-24 23:43:44'),
(7, 6, '2025-03-24 23:44:01', '2025-03-24 23:44:04', 0, 'break', '2025-03-24 23:44:01', '2025-03-24 23:44:04'),
(8, 8, '2025-03-25 00:03:27', '2025-03-25 00:03:55', 0, 'break', '2025-03-25 00:03:27', '2025-03-25 00:03:55'),
(9, 9, '2025-03-25 01:39:12', NULL, NULL, 'break', '2025-03-25 01:39:12', '2025-03-25 01:39:12'),
(10, 10, '2025-03-28 19:48:38', NULL, NULL, 'break', '2025-03-28 19:48:38', '2025-03-28 19:48:38'),
(11, 11, '2025-03-29 21:30:15', '2025-03-29 21:30:19', 0, 'break', '2025-03-29 21:30:15', '2025-03-29 21:30:19'),
(12, 13, '2025-04-08 15:18:25', '2025-04-08 16:59:40', 101, 'break', '2025-04-08 15:18:25', '2025-04-08 16:59:40'),
(13, 14, '2025-04-08 16:59:35', '2025-04-08 20:43:40', 224, 'break', '2025-04-08 16:59:35', '2025-04-08 20:43:40'),
(14, 16, '2025-04-12 21:06:09', '2025-04-12 21:06:51', 1, 'break', '2025-04-12 21:06:09', '2025-04-12 21:06:51');

-- --------------------------------------------------------

--
-- Table structure for table `time_off_requests`
--

CREATE TABLE `time_off_requests` (
  `request_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `type` enum('vacation','sick','personal','other') NOT NULL,
  `status` enum('pending','approved','denied') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trips`
--

CREATE TABLE `trips` (
  `trip_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `trip_type` enum('Standard','Round Trip','Multi-stop') NOT NULL DEFAULT 'Standard',
  `created_by` int(11) NOT NULL,
  `schedule_type` enum('Immediate','Once','Blanket') NOT NULL DEFAULT 'Once',
  `schedule_days` varchar(100) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `total_distance` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trips`
--

INSERT INTO `trips` (`trip_id`, `member_id`, `trip_type`, `created_by`, `schedule_type`, `schedule_days`, `start_date`, `end_date`, `total_distance`, `created_at`, `updated_at`) VALUES
(25, 1, 'Standard', 9, 'Once', NULL, '2025-03-27', '2025-03-27', '1274.33', '2025-03-27 06:30:35', '2025-04-04 15:44:29'),
(27, 1, 'Standard', 9, 'Once', NULL, '2025-03-28', NULL, '2886.94', '2025-03-27 22:49:27', '2025-04-04 15:29:08'),
(28, 1, 'Standard', 9, 'Once', NULL, '2025-03-28', NULL, '2886.94', '2025-03-27 23:44:17', '2025-04-10 16:34:49'),
(29, 3, 'Standard', 9, 'Immediate', NULL, '2025-03-28', NULL, '3390.88', '2025-03-27 23:45:45', '2025-04-02 18:20:18'),
(30, 2, 'Standard', 9, 'Once', NULL, '2025-03-28', NULL, '0.04', '2025-03-27 23:47:29', '2025-03-27 23:47:30'),
(31, 2, 'Standard', 9, 'Once', NULL, '2025-03-28', NULL, '0.04', '2025-03-27 23:52:33', '2025-04-04 15:29:23'),
(32, 2, 'Standard', 9, 'Once', NULL, '2025-03-28', NULL, '0.04', '2025-03-28 00:09:01', '2025-03-28 00:09:02'),
(33, 3, 'Standard', 9, 'Once', NULL, '2025-03-28', '2025-03-28', '0.04', '2025-03-28 01:13:18', '2025-04-07 22:27:28'),
(34, 2, 'Standard', 9, 'Once', NULL, '2025-03-28', NULL, '2869.89', '2025-03-28 02:00:36', '2025-04-02 18:16:38'),
(35, 1, 'Standard', 9, 'Once', NULL, '2025-03-28', NULL, '2886.94', '2025-03-28 02:09:57', '2025-04-02 18:04:09'),
(36, 3, 'Standard', 9, 'Immediate', NULL, '2025-03-28', NULL, '445.47', '2025-03-28 20:06:34', '2025-04-02 18:04:31'),
(37, 2, 'Standard', 9, 'Blanket', NULL, '2025-03-19', '2025-04-29', '1334.69', '2025-03-28 20:09:16', '2025-03-28 20:11:09'),
(38, 3, 'Standard', 9, 'Blanket', 'Tuesday,Thursday', '2025-03-28', '2025-04-16', '4519.11', '2025-03-28 20:19:11', '2025-04-04 16:05:23'),
(40, 3, 'Standard', 9, 'Immediate', NULL, '2025-04-07', '2025-04-07', '3360.67', '2025-04-07 21:55:54', '2025-04-07 21:55:57'),
(41, 1, 'Standard', 9, 'Once', NULL, '2025-04-08', NULL, '2912.35', '2025-04-07 22:31:15', '2025-04-09 20:18:28'),
(45, 2, 'Standard', 9, 'Once', NULL, '2025-04-08', NULL, '0.03', '2025-04-07 23:17:17', '2025-04-08 10:37:14'),
(46, 4, 'Standard', 9, 'Once', NULL, '2025-04-08', NULL, '22.07', '2025-04-08 16:55:41', '2025-04-09 20:33:08'),
(47, 1, 'Standard', 9, 'Immediate', NULL, '2025-04-09', NULL, '2888.81', '2025-04-09 11:38:30', '2025-04-09 12:33:04'),
(48, 1, 'Standard', 9, 'Once', NULL, '2025-04-10', NULL, '2886.94', '2025-04-10 16:02:53', '2025-04-10 16:05:17'),
(49, 1, 'Standard', 9, 'Once', NULL, '2025-04-10', '2025-04-10', '2886.94', '2025-04-10 16:45:48', '2025-04-10 16:45:48'),
(50, 1, 'Standard', 9, 'Once', NULL, '2025-04-10', '2025-04-10', '2886.94', '2025-04-10 16:47:19', '2025-04-10 16:47:19'),
(51, 1, 'Standard', 9, 'Immediate', NULL, '2025-04-10', '2025-04-10', '2886.94', '2025-04-10 16:50:05', '2025-04-10 16:50:07'),
(52, 3, 'Round Trip', 9, 'Once', NULL, '2025-04-11', NULL, '889.88', '2025-04-11 22:31:00', '2025-04-11 22:31:02'),
(53, 1, 'Standard', 9, 'Once', NULL, '2025-04-12', '2025-04-12', '1273.55', '2025-04-12 10:28:37', '2025-04-12 20:18:52'),
(54, 1, 'Standard', 9, 'Once', NULL, '2025-04-12', NULL, '2886.94', '2025-04-12 10:36:55', '2025-04-12 10:36:58'),
(55, 1, 'Standard', 9, 'Once', NULL, '2025-04-12', '2025-04-12', '1273.55', '2025-04-12 10:41:02', '2025-04-12 20:18:17'),
(56, 3, 'Standard', 9, 'Once', NULL, '2025-04-19', NULL, '445.43', '2025-04-12 10:44:10', '2025-04-12 10:56:57'),
(57, 4, 'Standard', 9, 'Once', NULL, '2025-04-12', NULL, '22.07', '2025-04-12 20:17:52', '2025-04-12 20:17:52'),
(58, 4, 'Standard', 9, 'Once', NULL, '2025-04-14', NULL, '22.07', '2025-04-12 20:44:42', '2025-04-12 20:45:16'),
(59, 4, 'Standard', 9, 'Once', NULL, '2025-04-13', NULL, '1098.56', '2025-04-12 21:04:57', '2025-04-13 17:04:57'),
(60, 4, 'Standard', 9, 'Once', NULL, '2025-04-14', '2025-04-14', '22.07', '2025-04-14 12:31:36', '2025-04-14 12:31:36');

-- --------------------------------------------------------

--
-- Table structure for table `trip_legs`
--

CREATE TABLE `trip_legs` (
  `leg_id` int(11) NOT NULL,
  `trip_id` int(11) NOT NULL,
  `driver_id` int(11) DEFAULT NULL,
  `status` enum('Scheduled','Attention','Assigned','Transport confirmed','Transport enroute','Picked up','Not going','Not available','Dropped off','Cancelled') DEFAULT 'Scheduled',
  `pickup_location` int(11) DEFAULT NULL,
  `dropoff_location` int(11) DEFAULT NULL,
  `scheduled_pickup` time DEFAULT NULL,
  `actual_pickup` time DEFAULT NULL,
  `scheduled_dropoff` time DEFAULT NULL,
  `actual_dropoff` time DEFAULT NULL,
  `leg_distance` decimal(10,2) DEFAULT NULL,
  `sequence` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `pickup_odometer` decimal(10,2) DEFAULT NULL,
  `dropoff_odometer` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trip_legs`
--

INSERT INTO `trip_legs` (`leg_id`, `trip_id`, `driver_id`, `status`, `pickup_location`, `dropoff_location`, `scheduled_pickup`, `actual_pickup`, `scheduled_dropoff`, `actual_dropoff`, `leg_distance`, `sequence`, `created_at`, `updated_at`, `pickup_odometer`, `dropoff_odometer`) VALUES
(1, 25, 11, 'Dropped off', 6, 10, '01:05:00', '00:04:00', '06:08:00', '11:51:00', '1274.33', 1, '2025-03-27 06:30:36', '2025-04-04 15:44:29', NULL, NULL),
(2, 27, 21, 'Attention', 8, 6, '10:00:00', '09:50:00', '02:00:00', '01:45:00', '2886.94', 1, '2025-03-27 22:49:30', '2025-04-04 15:29:08', NULL, NULL),
(3, 28, 11, 'Scheduled', 8, 6, NULL, '03:15:00', NULL, NULL, '2886.94', 1, '2025-03-27 23:44:19', '2025-04-10 16:34:49', NULL, NULL),
(4, 29, NULL, 'Scheduled', 9, 10, NULL, NULL, NULL, NULL, '491.31', 1, '2025-03-27 23:45:46', '2025-03-27 23:45:46', NULL, NULL),
(5, 30, NULL, 'Scheduled', 11, 12, NULL, NULL, NULL, NULL, '0.04', 1, '2025-03-27 23:47:30', '2025-03-27 23:47:30', NULL, NULL),
(6, 31, NULL, 'Picked up', 11, 12, '21:00:00', '00:00:00', '22:00:00', NULL, '0.04', 1, '2025-03-27 23:52:33', '2025-04-04 15:29:23', NULL, NULL),
(7, 32, NULL, 'Scheduled', 11, 12, '21:00:00', NULL, '23:10:00', NULL, '0.04', 1, '2025-03-28 00:09:02', '2025-03-28 00:09:02', NULL, NULL),
(9, 34, 21, 'Scheduled', 11, 1, '02:09:00', '03:17:00', '00:00:00', NULL, '2869.89', 1, '2025-03-28 02:00:37', '2025-04-02 18:16:38', NULL, NULL),
(11, 35, 11, 'Scheduled', 8, 6, '02:11:00', '00:00:00', '06:30:00', '00:00:00', '2886.94', 1, '2025-03-28 02:09:59', '2025-04-02 18:04:09', NULL, NULL),
(12, 36, NULL, 'Picked up', 9, 10, '00:59:00', '11:37:00', '01:05:00', '01:00:00', '445.43', 1, '2025-03-28 20:06:35', '2025-04-02 18:04:31', NULL, NULL),
(13, 37, NULL, 'Scheduled', 6, 9, '00:00:00', NULL, '03:00:00', NULL, '1334.69', 1, '2025-03-28 20:09:18', '2025-03-28 20:11:09', NULL, NULL),
(15, 38, 11, 'Transport confirmed', 9, 10, '00:00:00', NULL, '05:25:00', NULL, '445.43', 1, '2025-03-28 20:19:12', '2025-04-02 17:46:47', NULL, NULL),
(16, 38, 21, '', 1, 7, '00:00:00', '00:00:00', '03:24:00', NULL, '2915.00', 2, '2025-03-29 03:50:29', '2025-04-04 16:05:23', NULL, NULL),
(17, 36, 11, 'Cancelled', 11, 12, '08:01:00', '00:00:00', '09:01:00', NULL, '0.04', 2, '2025-03-29 05:01:11', '2025-04-02 18:03:54', NULL, NULL),
(18, 38, NULL, 'Scheduled', 1, 9, '23:01:00', NULL, '23:45:00', NULL, '1158.68', 3, '2025-04-02 17:45:27', '2025-04-02 17:45:27', NULL, NULL),
(19, 29, 11, 'Scheduled', 1, 7, '21:19:00', NULL, '22:19:00', '04:20:00', '2899.57', 2, '2025-04-02 18:19:57', '2025-04-02 18:20:18', NULL, NULL),
(22, 40, NULL, 'Scheduled', 9, 10, NULL, NULL, NULL, NULL, '445.43', 1, '2025-04-07 21:55:55', '2025-04-07 21:55:55', NULL, NULL),
(23, 40, 11, 'Scheduled', 1, 7, NULL, NULL, NULL, NULL, '2915.24', 2, '2025-04-07 21:55:57', '2025-04-07 21:55:57', NULL, NULL),
(24, 33, NULL, 'Scheduled', 11, 12, NULL, NULL, NULL, NULL, '0.04', 1, '2025-04-07 22:27:28', '2025-04-07 22:27:28', NULL, NULL),
(25, 41, 21, 'Assigned', 8, 10, '06:30:00', '06:00:00', '06:46:00', '07:00:00', '2912.35', 1, '2025-04-07 22:31:17', '2025-04-09 20:18:28', NULL, NULL),
(28, 45, NULL, 'Scheduled', 8, 12, '00:00:00', NULL, '03:15:00', NULL, '0.03', 1, '2025-04-07 23:17:18', '2025-04-08 10:37:14', NULL, NULL),
(30, 46, NULL, 'Scheduled', 13, 14, '11:30:00', NULL, '00:14:00', NULL, '22.07', 1, '2025-04-08 16:55:42', '2025-04-09 20:33:08', NULL, NULL),
(31, 47, 11, 'Assigned', 8, 6, '01:05:00', NULL, '04:18:00', NULL, '2888.81', 1, '2025-04-09 11:38:33', '2025-04-09 12:33:04', NULL, NULL),
(32, 48, 11, 'Transport confirmed', 8, 6, '05:25:00', NULL, '06:31:00', NULL, '2886.94', 1, '2025-04-10 16:02:55', '2025-04-10 16:05:34', NULL, NULL),
(33, 49, 11, 'Scheduled', 8, 6, NULL, NULL, NULL, NULL, '2886.94', 1, '2025-04-10 16:45:51', '2025-04-10 16:45:51', NULL, NULL),
(34, 50, 11, 'Scheduled', 8, 6, NULL, NULL, NULL, NULL, '2886.94', 1, '2025-04-10 16:47:21', '2025-04-10 16:47:21', NULL, NULL),
(35, 51, 11, 'Picked up', 8, 6, NULL, '20:13:39', NULL, NULL, '2886.94', 1, '2025-04-10 16:50:07', '2025-04-10 17:13:39', NULL, NULL),
(36, 52, NULL, 'Scheduled', 9, 10, NULL, NULL, NULL, NULL, '445.43', 1, '2025-04-11 22:31:01', '2025-04-11 22:31:01', NULL, NULL),
(37, 52, NULL, 'Scheduled', 10, 9, NULL, NULL, NULL, NULL, '444.45', 2, '2025-04-11 22:31:02', '2025-04-11 22:31:02', NULL, NULL),
(38, 53, 11, 'Transport enroute', 6, 10, '07:15:00', NULL, '07:40:00', NULL, '1273.55', 1, '2025-04-12 10:28:39', '2025-04-12 20:37:53', NULL, NULL),
(39, 54, NULL, 'Scheduled', 8, 6, '05:19:00', NULL, '00:59:00', NULL, '2886.94', 1, '2025-04-12 10:36:58', '2025-04-12 10:36:58', NULL, NULL),
(40, 55, 11, 'Picked up', 6, 10, '03:10:00', '23:21:19', '04:30:00', NULL, '1273.55', 1, '2025-04-12 10:41:04', '2025-04-12 20:21:19', NULL, NULL),
(42, 56, NULL, 'Scheduled', 9, 10, '00:00:00', NULL, '03:13:00', NULL, '445.43', 1, '2025-04-12 10:56:57', '2025-04-12 10:56:57', NULL, NULL),
(43, 57, NULL, 'Scheduled', 13, 14, '05:00:00', NULL, '06:00:00', NULL, '22.07', 1, '2025-04-12 20:17:52', '2025-04-12 20:17:52', NULL, NULL),
(44, 58, 11, 'Scheduled', 13, 14, '02:00:00', NULL, '02:15:00', NULL, '22.07', 1, '2025-04-12 20:44:42', '2025-04-12 20:45:16', NULL, NULL),
(45, 59, 11, 'Dropped off', 13, 14, '00:00:00', '00:16:24', '01:00:00', '00:17:48', '22.07', 1, '2025-04-12 21:04:58', '2025-04-12 21:17:48', NULL, NULL),
(46, 59, 11, 'Transport confirmed', 1, 6, '02:59:00', '17:06:02', '03:30:00', '17:08:55', '1076.49', 2, '2025-04-12 21:19:07', '2025-04-13 17:05:56', NULL, NULL),
(47, 60, 11, 'Scheduled', 13, 14, NULL, NULL, NULL, NULL, '22.07', 1, '2025-04-14 12:31:36', '2025-04-14 12:31:36', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `trip_locations`
--

CREATE TABLE `trip_locations` (
  `location_id` int(11) NOT NULL,
  `street_address` varchar(255) NOT NULL,
  `building` varchar(255) DEFAULT NULL,
  `building_type` varchar(50) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(50) NOT NULL,
  `zip` varchar(20) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `location_type` varchar(50) DEFAULT NULL,
  `recipient_default` tinyint(1) DEFAULT 0,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trip_locations`
--

INSERT INTO `trip_locations` (`location_id`, `street_address`, `building`, `building_type`, `city`, `state`, `zip`, `phone`, `location_type`, `recipient_default`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES
(1, '4332 N 24TH ST', '#2', 'Apartment', 'New York', 'CA', '90009', '3203708545', '', 1, NULL, NULL, '2025-03-09 09:17:16', '2025-04-06 21:43:49'),
(6, '424 Eve', '2', 'Room', 'Orlando', 'NY', '90009', '4803708545', 'Rural', 1, '43.29942850', '-74.21793260', '2025-03-10 00:37:16', '2025-04-06 21:21:37'),
(7, '4332 N 24TH ST', '#6', 'Unit', 'Orlando', 'CA', '90009', '3203708545', 'Rural', 0, NULL, NULL, '2025-03-10 07:51:08', '2025-04-06 21:43:51'),
(8, '4332 N 24TH ST', '#4', 'Unit', 'Orlando', 'CA', '90009', '3203708545', 'Rural', 1, '39.74738030', '-122.19637480', '2025-03-12 00:29:53', '2025-04-06 21:43:54'),
(9, '424 Eve', '#6', 'Apartment', 'New York', 'FL', '90002', '3203708545', 'Rural', 1, NULL, NULL, '2025-03-12 03:47:12', '2025-04-06 21:44:00'),
(10, '4332 N 24TH ST', '#5', 'Unit', 'Orlando', 'FL', '90002', '3203708545', 'Urban', 1, NULL, NULL, '2025-03-12 03:47:35', '2025-04-06 21:43:53'),
(11, '517 Walker Street', '#6', 'Apartment', 'Orland', 'CA', '95963', '3203708545', 'Urban', 1, '39.74695300', '-122.19635800', '2025-03-19 22:26:31', '2025-04-06 21:43:56'),
(12, '512 Walker Street', '#2', 'Apartment', 'Orland', 'CA', '95963', '3203708545', 'Urban', 1, '39.74761210', '-122.19600020', '2025-03-19 22:50:47', '2025-04-06 21:43:59'),
(13, '124 W LEISURE LN', '', 'House', 'Phoenix', 'AZ', '85086', '3303708545', 'Urban', 1, '33.80883070', '-112.07542140', '2025-04-08 16:54:05', '2025-04-08 17:16:35'),
(14, '17505 N 79TH AVE', '407', 'Suite', 'Glendale', 'AZ', '85308', '3303708545', 'Rural', 1, '33.64342810', '-112.23015860', '2025-04-08 16:55:02', '2025-04-08 17:06:56');

-- --------------------------------------------------------

--
-- Table structure for table `trip_members`
--

CREATE TABLE `trip_members` (
  `member_id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `program_id` int(11) DEFAULT NULL,
  `ahcccs_id` varchar(50) DEFAULT NULL,
  `insurance_expiry` date DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `pickup_location` int(11) DEFAULT NULL,
  `dropoff_location` int(11) DEFAULT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `signature` text DEFAULT NULL COMMENT 'Base64 encoded signature image'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trip_members`
--

INSERT INTO `trip_members` (`member_id`, `first_name`, `last_name`, `program_id`, `ahcccs_id`, `insurance_expiry`, `birth_date`, `phone`, `pickup_location`, `dropoff_location`, `gender`, `notes`, `created_at`, `updated_at`, `signature`) VALUES
(1, 'jemmy', 'Macias', 1, 'A34239', '2026-03-09', '1977-03-14', '2025550384', 8, 6, 'Male', 'NA', '2025-03-09 01:46:47', '2025-04-07 09:01:40', NULL),
(2, 'Lorenzo', 'Macias', 3, 'A34233', '2029-03-11', '1990-03-13', '2025550384', 11, 12, 'Male', '', '2025-03-09 02:12:52', '2025-04-07 09:01:42', NULL),
(3, 'Yousef', 'Leio', 4, 'A34221', '2026-03-30', '1998-05-19', '2025550384', 9, 10, 'Male', 'New User ', '2025-03-12 03:46:49', '2025-04-07 09:01:44', NULL),
(4, 'Mike', 'Roberry', 1, 'A34224', '2026-03-31', '1999-03-31', '3803708512', 13, 14, 'Male', 'Test User', '2025-04-08 16:52:28', '2025-04-13 21:28:23', 'data:image/png;base64,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');

-- --------------------------------------------------------

--
-- Table structure for table `trip_special_instructions`
--

CREATE TABLE `trip_special_instructions` (
  `instruction_id` int(11) NOT NULL,
  `trip_id` int(11) NOT NULL,
  `mobility_type` enum('Wheelchair','Ambulatory') NOT NULL DEFAULT 'Ambulatory',
  `rides_alone` tinyint(1) DEFAULT 0,
  `spanish_speaking` tinyint(1) DEFAULT 0,
  `males_only` tinyint(1) DEFAULT 0,
  `females_only` tinyint(1) DEFAULT 0,
  `special_assist` tinyint(1) DEFAULT 0,
  `pickup_time_exact` tinyint(1) DEFAULT 0,
  `stay_with_client` tinyint(1) DEFAULT 0,
  `car_seat` tinyint(1) DEFAULT 0,
  `extra_person` tinyint(1) DEFAULT 0,
  `call_first` tinyint(1) DEFAULT 0,
  `knock` tinyint(1) DEFAULT 0,
  `van` tinyint(1) DEFAULT 0,
  `sedan` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trip_special_instructions`
--

INSERT INTO `trip_special_instructions` (`instruction_id`, `trip_id`, `mobility_type`, `rides_alone`, `spanish_speaking`, `males_only`, `females_only`, `special_assist`, `pickup_time_exact`, `stay_with_client`, `car_seat`, `extra_person`, `call_first`, `knock`, `van`, `sedan`, `created_at`, `updated_at`) VALUES
(14, 25, 'Ambulatory', 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, '2025-03-27 06:30:36', '2025-03-27 06:30:36'),
(15, 27, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-03-27 22:49:30', '2025-03-27 22:49:30'),
(16, 28, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-03-27 23:44:19', '2025-03-27 23:44:19'),
(17, 29, 'Ambulatory', 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-03-27 23:45:46', '2025-03-27 23:45:46'),
(18, 30, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-03-27 23:47:30', '2025-03-27 23:47:30'),
(19, 31, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-03-27 23:52:34', '2025-03-27 23:52:34'),
(20, 32, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-03-28 00:09:02', '2025-03-28 00:09:02'),
(21, 33, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-03-28 01:13:19', '2025-04-07 22:27:27'),
(22, 35, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-03-28 02:09:59', '2025-03-28 02:09:59'),
(23, 34, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, '2025-03-28 20:04:47', '2025-03-28 20:04:47'),
(24, 36, 'Wheelchair', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, '2025-03-28 20:06:35', '2025-03-28 20:06:35'),
(25, 37, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-03-28 20:09:18', '2025-03-28 20:11:09'),
(26, 38, 'Wheelchair', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-03-28 20:19:12', '2025-03-28 20:19:12'),
(27, 40, 'Ambulatory', 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-07 21:55:57', '2025-04-07 21:55:57'),
(29, 45, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '2025-04-07 23:17:18', '2025-04-08 10:37:14'),
(30, 46, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '2025-04-08 16:55:42', '2025-04-09 20:33:08'),
(31, 47, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-09 11:38:33', '2025-04-09 11:38:33'),
(32, 41, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '2025-04-09 20:18:28', '2025-04-09 20:18:28'),
(33, 48, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-10 16:02:56', '2025-04-10 16:02:56'),
(34, 49, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-10 16:45:51', '2025-04-10 16:45:51'),
(35, 50, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-10 16:47:21', '2025-04-10 16:47:21'),
(36, 51, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-10 16:50:07', '2025-04-10 16:50:07'),
(37, 52, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-11 22:31:02', '2025-04-11 22:31:02'),
(38, 53, 'Ambulatory', 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, '2025-04-12 10:28:39', '2025-04-12 10:28:39'),
(39, 54, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-12 10:36:58', '2025-04-12 10:36:58'),
(40, 55, 'Ambulatory', 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, '2025-04-12 10:41:04', '2025-04-12 10:41:04'),
(41, 56, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '2025-04-12 10:44:11', '2025-04-12 10:56:56'),
(42, 57, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-12 20:17:52', '2025-04-12 20:17:52'),
(43, 58, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-12 20:44:42', '2025-04-12 20:44:42'),
(44, 59, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '2025-04-12 21:04:58', '2025-04-12 21:05:48'),
(45, 60, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-14 12:31:36', '2025-04-14 12:31:36');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `emp_code` varchar(50) NOT NULL,
  `user_group` int(11) DEFAULT NULL,
  `user_type` int(11) DEFAULT NULL,
  `status` enum('Active','Inactive','Suspended') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `hiringDate` date DEFAULT NULL,
  `lastEmploymentDate` date DEFAULT NULL,
  `sex` enum('Male','Female') DEFAULT NULL,
  `spanishSpeaking` enum('Yes','No') DEFAULT NULL,
  `paymentStructure` enum('Pay per Hour','Pay per Mile','Pay per Trip') DEFAULT NULL,
  `hourly_rate` decimal(10,2) DEFAULT 15.00,
  `signature` text DEFAULT NULL COMMENT 'Base64 encoded signature image'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `username`, `email`, `phone`, `emp_code`, `user_group`, `user_type`, `status`, `created_at`, `updated_at`, `hiringDate`, `lastEmploymentDate`, `sex`, `spanishSpeaking`, `paymentStructure`, `hourly_rate`, `signature`) VALUES
(9, 'Lorenzo', 'Macias', 'Lorenzo', 'lorenzo2@gmail.com', '3303708545', '23523', 2, 3, 'Active', '2025-01-24 01:46:27', '2025-04-06 21:09:01', '2025-02-11', '2025-02-09', 'Male', 'No', 'Pay per Mile', '10.00', NULL),
(11, 'jemmy', 'Macias', 'jemmy', 'lorenzo1@gmail.com', '4803708512', '23523', 1, 2, 'Active', '2025-01-24 01:46:27', '2025-04-13 19:54:42', '2025-02-01', '2025-02-10', 'Male', 'No', 'Pay per Trip', '15.00', 'data:image/png;base64,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'),
(12, 'Jeffery', 'Jackson', 'Jeffery', 'jeffery@gmail.com', '4803708512', '235235', 1, 1, 'Active', '2025-01-24 01:46:27', '2025-02-06 05:17:46', '2025-01-29', '2025-02-21', 'Male', 'No', 'Pay per Hour', '15.00', NULL),
(21, 'Mohamed', 'Turash', 'Mohamed', 'mohamed@gmail.com', '4803708512', 'EMP12345', 2, 2, 'Active', '2025-01-28 00:37:04', '2025-02-08 13:44:29', '2024-12-08', '2025-01-06', 'Male', 'Yes', 'Pay per Hour', '15.00', NULL),
(27, 'Mohamed', 'Test', 'Mohamed1', 'mohamed1@gmail.com', '4803708545', 'EMP7964', 2, 3, 'Active', '2025-01-28 00:48:30', '2025-02-11 14:03:13', '2024-12-13', '2024-12-15', 'Female', 'No', 'Pay per Hour', '15.00', NULL),
(65, 'Yousef', 'Sarol', 'yousef', 'yousef@gmail.com', '2803708543', '777', 6, 1, 'Inactive', '2025-02-03 03:27:29', '2025-04-04 20:38:30', '2025-01-23', '2025-02-03', 'Male', 'Yes', 'Pay per Hour', '14.00', NULL),
(66, 'Mike', 'Macias', 'Mike', 'mike@gmail.com', '7803708512', 'EMP4956', 1, 1, 'Active', '2025-02-03 03:42:15', '2025-02-06 04:36:24', '2025-01-29', '2025-02-16', 'Male', 'No', 'Pay per Trip', '15.00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_groups`
--

CREATE TABLE `user_groups` (
  `group_id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `common_name` varchar(50) NOT NULL,
  `short_name` varchar(10) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `parent_group_id` int(11) DEFAULT NULL,
  `auto_routing` tinyint(1) DEFAULT 0,
  `send_pdf` tinyint(1) DEFAULT 0,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_groups`
--

INSERT INTO `user_groups` (`group_id`, `full_name`, `common_name`, `short_name`, `email`, `phone`, `parent_group_id`, `auto_routing`, `send_pdf`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Administrators Group', 'Admins', 'ADM', 'admins@example.com', '4803708545', NULL, 0, 1, 'Active', '2025-02-01 01:46:46', '2025-02-03 04:57:31'),
(2, 'Marketing Transport Group', 'MarkTrans', 'MTX', 'medtrans@example.com', '4803708545', NULL, 1, 1, 'Active', '2025-02-01 01:46:46', '2025-02-07 16:43:37'),
(3, 'Medical Transport Group', 'MedTrans', 'MTX', 'mohamed@gmail.com', '4803708545', 1, 0, 1, 'Active', '2025-02-02 03:18:48', '2025-02-07 16:52:05'),
(6, 'Diamond', 'Diamond', 'MTX', 'medtransa@example.com', '4803708543', 1, 1, 0, 'Active', '2025-02-02 17:46:34', '2025-02-03 05:01:24');

-- --------------------------------------------------------

--
-- Table structure for table `user_types`
--

CREATE TABLE `user_types` (
  `type_id` int(11) NOT NULL,
  `type_name` varchar(50) NOT NULL,
  `display_name` varchar(50) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_types`
--

INSERT INTO `user_types` (`type_id`, `type_name`, `display_name`, `status`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'System Administrator', 'Active', '2025-01-31 22:46:46', '2025-02-07 17:00:02'),
(2, 'driver', 'Transport Driver', 'Active', '2025-01-31 22:46:46', '2025-02-06 05:10:47'),
(3, 'coordinator', 'Transport Coordinator', 'Active', '2025-01-31 22:46:46', '2025-02-04 17:33:08'),
(328, 'Ali', 'Baba', 'Active', '2025-02-02 13:36:51', '2025-02-07 16:43:32'),
(329, 'Moderator', 'System Moderator', 'Inactive', '2025-02-04 21:40:35', '2025-03-15 00:34:30');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `vehicle_id` int(11) NOT NULL,
  `mtx_unit` varchar(20) NOT NULL,
  `make` varchar(50) NOT NULL,
  `model` varchar(50) NOT NULL,
  `color` varchar(30) NOT NULL,
  `capacity` int(2) NOT NULL,
  `type` enum('Ambulatory','Wheelchair') NOT NULL,
  `vehicle_type` enum('Sedan','Van','SUV') NOT NULL,
  `plate_number` varchar(20) NOT NULL,
  `tyre_size` varchar(20) NOT NULL,
  `vin` varchar(17) NOT NULL,
  `purchase_date` date NOT NULL,
  `registration_due` date NOT NULL,
  `last_registered` date NOT NULL,
  `assigned_ts` int(11) DEFAULT NULL,
  `date_assigned` date DEFAULT NULL,
  `insured_from` date NOT NULL,
  `insured_to` date NOT NULL,
  `status` enum('Active','Inactive','Maintenance') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`vehicle_id`, `mtx_unit`, `make`, `model`, `color`, `capacity`, `type`, `vehicle_type`, `plate_number`, `tyre_size`, `vin`, `purchase_date`, `registration_due`, `last_registered`, `assigned_ts`, `date_assigned`, `insured_from`, `insured_to`, `status`, `created_at`, `updated_at`) VALUES
(1, 'MTX-001', 'Dodge', 'Caravan', 'White', 6, 'Wheelchair', 'Van', 'ABC-123', 'P215/65R15', '2D4RN4DG5BR761249', '2023-01-15', '2025-12-31', '2024-06-15', 11, '2024-01-01', '2024-01-01', '2025-01-01', 'Active', '2025-02-07 15:17:40', '2025-02-11 19:57:36'),
(2, 'MTX-012', 'Ford', 'Transit', 'Black', 8, 'Ambulatory', 'Van', 'XYZ-789', 'LT225/75R16', '1FMDU34X4VUB13652', '2022-05-20', '2025-11-30', '2024-05-20', 21, '2023-06-01', '2023-06-01', '2024-12-31', 'Active', '2025-02-07 15:17:40', '2025-02-11 19:49:16'),
(3, 'MTX-017', 'Toyota', 'Sienna', 'Silver', 7, 'Wheelchair', 'Van', 'DEF-456', 'P235/60R17', '5TDYK3DC4HS041526', '2024-02-01', '2026-01-31', '2025-01-15', 11, '2024-03-01', '2024-03-01', '2025-06-30', 'Maintenance', '2025-02-07 15:17:40', '2025-02-11 19:49:18'),
(4, 'MTX-022', 'Mercedes', 'Sprinter', 'Blue', 10, 'Ambulatory', 'Van', 'GHI-789', '215/75R16C', 'WDZPE8CC3KJ123456', '2021-09-10', '2025-09-30', '2024-09-01', 11, '2022-01-01', '2022-01-01', '2025-01-01', 'Inactive', '2025-02-07 15:17:40', '2025-02-11 19:49:21'),
(5, 'MTX-005', 'Dodge', 'Sprinter', 'Silver', 4, 'Wheelchair', 'Sedan', 'XYZ-781', 'P235/60R17', '2D4RN4DG5BR765319', '2025-02-01', '2025-02-27', '2025-02-03', 11, '2025-02-02', '2025-02-28', '2025-02-09', 'Active', '2025-02-11 20:26:14', '2025-02-11 20:26:14');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_parts`
--

CREATE TABLE `vehicle_parts` (
  `part_id` int(11) NOT NULL,
  `part_number` varchar(255) NOT NULL,
  `part_name` varchar(255) NOT NULL,
  `type` enum('OEM','Aftermarket','Refurbished') NOT NULL,
  `brand` varchar(50) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `warranty` tinyint(1) NOT NULL DEFAULT 0,
  `warranty_type` enum('Time','Mileage','Both') DEFAULT NULL,
  `warranty_mileage` int(11) DEFAULT NULL,
  `warranty_time_unit` enum('Days','Months','Years','Lifetime') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicle_parts`
--

INSERT INTO `vehicle_parts` (`part_id`, `part_number`, `part_name`, `type`, `brand`, `unit_price`, `supplier_id`, `warranty`, `warranty_type`, `warranty_mileage`, `warranty_time_unit`) VALUES
(1, 'OIL-5W30', 'Synthetic Oil 5W-30', 'OEM', 'Mobil', '45.99', NULL, 0, NULL, NULL, NULL),
(2, 'FIL-001', 'Oil Filter', 'OEM', 'FRAM', '12.99', NULL, 1, 'Time', NULL, 'Months'),
(3, 'BRK-001', 'Brake Pads - Front', 'OEM', 'Bosch', '89.99', NULL, 1, 'Both', 50000, 'Months'),
(4, 'TIR-225', 'P235/60R17 Tire', 'OEM', 'Michelin', '189.99', NULL, 1, 'Mileage', 60000, NULL),
(5, 'BAT-001', 'Car Battery', 'Aftermarket', 'DieHard', '159.99', NULL, 1, 'Time', NULL, 'Months');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_services`
--

CREATE TABLE `vehicle_services` (
  `service_id` int(11) NOT NULL,
  `service_code` varchar(50) NOT NULL,
  `service_name` varchar(255) NOT NULL,
  `standard_hours` decimal(4,2) NOT NULL,
  `standard_cost` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicle_services`
--

INSERT INTO `vehicle_services` (`service_id`, `service_code`, `service_name`, `standard_hours`, `standard_cost`) VALUES
(1, 'OIL-CHG', 'Oil Change Service', '1.00', '45.00'),
(2, 'BRK-SVC', 'Brake Service', '2.50', '180.00'),
(3, 'TIR-ROT', 'Tire Rotation', '0.75', '35.00'),
(4, 'ENG-TUN', 'Engine Tune-up', '3.00', '250.00'),
(5, 'AC-SVC', 'AC Service', '1.50', '120.00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `documentable` (`documentable_type`,`documentable_id`);

--
-- Indexes for table `group_permissions`
--
ALTER TABLE `group_permissions`
  ADD PRIMARY KEY (`group_id`,`type_id`),
  ADD UNIQUE KEY `group_permissions_group_id_type_id` (`group_id`,`type_id`),
  ADD KEY `type_id` (`type_id`);

--
-- Indexes for table `maintenance`
--
ALTER TABLE `maintenance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicle_id` (`vehicle_id`);

--
-- Indexes for table `maintenance_parts`
--
ALTER TABLE `maintenance_parts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `maintenance_id` (`maintenance_id`),
  ADD KEY `part_id` (`part_id`);

--
-- Indexes for table `maintenance_services`
--
ALTER TABLE `maintenance_services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `maintenance_id` (`maintenance_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `pages`
--
ALTER TABLE `pages`
  ADD PRIMARY KEY (`page_name`);

--
-- Indexes for table `page_permissions`
--
ALTER TABLE `page_permissions`
  ADD PRIMARY KEY (`permission_id`),
  ADD UNIQUE KEY `page_permissions_page_name_type_id` (`page_name`,`type_id`),
  ADD KEY `type_id` (`type_id`);

--
-- Indexes for table `parts_supplier`
--
ALTER TABLE `parts_supplier`
  ADD PRIMARY KEY (`supplier_id`);

--
-- Indexes for table `programs`
--
ALTER TABLE `programs`
  ADD PRIMARY KEY (`program_id`);

--
-- Indexes for table `timesheets`
--
ALTER TABLE `timesheets`
  ADD PRIMARY KEY (`timesheet_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `timesheet_breaks`
--
ALTER TABLE `timesheet_breaks`
  ADD PRIMARY KEY (`break_id`),
  ADD KEY `timesheet_id` (`timesheet_id`);

--
-- Indexes for table `time_off_requests`
--
ALTER TABLE `time_off_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `trips`
--
ALTER TABLE `trips`
  ADD PRIMARY KEY (`trip_id`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `trip_legs`
--
ALTER TABLE `trip_legs`
  ADD PRIMARY KEY (`leg_id`),
  ADD KEY `trip_id` (`trip_id`),
  ADD KEY `driver_id` (`driver_id`),
  ADD KEY `pickup_location` (`pickup_location`),
  ADD KEY `dropoff_location` (`dropoff_location`);

--
-- Indexes for table `trip_locations`
--
ALTER TABLE `trip_locations`
  ADD PRIMARY KEY (`location_id`);

--
-- Indexes for table `trip_members`
--
ALTER TABLE `trip_members`
  ADD PRIMARY KEY (`member_id`),
  ADD KEY `program_id` (`program_id`),
  ADD KEY `fk_member_default_pickup` (`pickup_location`),
  ADD KEY `fk_member_default_dropoff` (`dropoff_location`);

--
-- Indexes for table `trip_special_instructions`
--
ALTER TABLE `trip_special_instructions`
  ADD PRIMARY KEY (`instruction_id`),
  ADD KEY `trip_id` (`trip_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `fk_user_type` (`user_type`),
  ADD KEY `fk_user_group` (`user_group`);

--
-- Indexes for table `user_groups`
--
ALTER TABLE `user_groups`
  ADD PRIMARY KEY (`group_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `parent_group_id` (`parent_group_id`);

--
-- Indexes for table `user_types`
--
ALTER TABLE `user_types`
  ADD PRIMARY KEY (`type_id`),
  ADD UNIQUE KEY `type_name` (`type_name`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`vehicle_id`),
  ADD UNIQUE KEY `vin` (`vin`),
  ADD UNIQUE KEY `plate_number` (`plate_number`),
  ADD UNIQUE KEY `vmt_unit` (`mtx_unit`),
  ADD KEY `assigned_ts` (`assigned_ts`);

--
-- Indexes for table `vehicle_parts`
--
ALTER TABLE `vehicle_parts`
  ADD PRIMARY KEY (`part_id`),
  ADD UNIQUE KEY `part_number` (`part_number`),
  ADD KEY `fk_part_supplier` (`supplier_id`);

--
-- Indexes for table `vehicle_services`
--
ALTER TABLE `vehicle_services`
  ADD PRIMARY KEY (`service_id`),
  ADD UNIQUE KEY `service_code` (`service_code`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `maintenance`
--
ALTER TABLE `maintenance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `maintenance_parts`
--
ALTER TABLE `maintenance_parts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `maintenance_services`
--
ALTER TABLE `maintenance_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `page_permissions`
--
ALTER TABLE `page_permissions`
  MODIFY `permission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=150;

--
-- AUTO_INCREMENT for table `parts_supplier`
--
ALTER TABLE `parts_supplier`
  MODIFY `supplier_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `programs`
--
ALTER TABLE `programs`
  MODIFY `program_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `timesheets`
--
ALTER TABLE `timesheets`
  MODIFY `timesheet_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `timesheet_breaks`
--
ALTER TABLE `timesheet_breaks`
  MODIFY `break_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `time_off_requests`
--
ALTER TABLE `time_off_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trips`
--
ALTER TABLE `trips`
  MODIFY `trip_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `trip_legs`
--
ALTER TABLE `trip_legs`
  MODIFY `leg_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `trip_locations`
--
ALTER TABLE `trip_locations`
  MODIFY `location_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `trip_members`
--
ALTER TABLE `trip_members`
  MODIFY `member_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `trip_special_instructions`
--
ALTER TABLE `trip_special_instructions`
  MODIFY `instruction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `user_groups`
--
ALTER TABLE `user_groups`
  MODIFY `group_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `user_types`
--
ALTER TABLE `user_types`
  MODIFY `type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=330;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `vehicle_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `vehicle_parts`
--
ALTER TABLE `vehicle_parts`
  MODIFY `part_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `vehicle_services`
--
ALTER TABLE `vehicle_services`
  MODIFY `service_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `group_permissions`
--
ALTER TABLE `group_permissions`
  ADD CONSTRAINT `group_permissions_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `user_groups` (`group_id`),
  ADD CONSTRAINT `group_permissions_ibfk_2` FOREIGN KEY (`type_id`) REFERENCES `user_types` (`type_id`);

--
-- Constraints for table `maintenance_parts`
--
ALTER TABLE `maintenance_parts`
  ADD CONSTRAINT `maintenance_parts_ibfk_1` FOREIGN KEY (`maintenance_id`) REFERENCES `maintenance` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `maintenance_parts_ibfk_2` FOREIGN KEY (`part_id`) REFERENCES `vehicle_parts` (`part_id`);

--
-- Constraints for table `maintenance_services`
--
ALTER TABLE `maintenance_services`
  ADD CONSTRAINT `maintenance_services_ibfk_1` FOREIGN KEY (`maintenance_id`) REFERENCES `maintenance` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `maintenance_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `vehicle_services` (`service_id`);

--
-- Constraints for table `page_permissions`
--
ALTER TABLE `page_permissions`
  ADD CONSTRAINT `page_permissions_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `user_types` (`type_id`);

--
-- Constraints for table `timesheets`
--
ALTER TABLE `timesheets`
  ADD CONSTRAINT `timesheets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `timesheet_breaks`
--
ALTER TABLE `timesheet_breaks`
  ADD CONSTRAINT `timesheet_breaks_ibfk_1` FOREIGN KEY (`timesheet_id`) REFERENCES `timesheets` (`timesheet_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `time_off_requests`
--
ALTER TABLE `time_off_requests`
  ADD CONSTRAINT `time_off_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `trips`
--
ALTER TABLE `trips`
  ADD CONSTRAINT `trips_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `trip_members` (`member_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trips_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trip_legs`
--
ALTER TABLE `trip_legs`
  ADD CONSTRAINT `trip_legs_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`trip_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trip_legs_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `trip_legs_ibfk_3` FOREIGN KEY (`pickup_location`) REFERENCES `trip_locations` (`location_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `trip_legs_ibfk_4` FOREIGN KEY (`dropoff_location`) REFERENCES `trip_locations` (`location_id`) ON DELETE SET NULL;

--
-- Constraints for table `trip_members`
--
ALTER TABLE `trip_members`
  ADD CONSTRAINT `fk_member_default_dropoff` FOREIGN KEY (`dropoff_location`) REFERENCES `trip_locations` (`location_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_member_default_pickup` FOREIGN KEY (`pickup_location`) REFERENCES `trip_locations` (`location_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `trip_members_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `programs` (`program_id`) ON DELETE SET NULL;

--
-- Constraints for table `trip_special_instructions`
--
ALTER TABLE `trip_special_instructions`
  ADD CONSTRAINT `trip_special_instructions_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`trip_id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_group` FOREIGN KEY (`user_group`) REFERENCES `user_groups` (`group_id`),
  ADD CONSTRAINT `fk_user_type` FOREIGN KEY (`user_type`) REFERENCES `user_types` (`type_id`);

--
-- Constraints for table `user_groups`
--
ALTER TABLE `user_groups`
  ADD CONSTRAINT `user_groups_ibfk_1` FOREIGN KEY (`parent_group_id`) REFERENCES `user_groups` (`group_id`);

--
-- Constraints for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `fk_vehicle_assigned_ts` FOREIGN KEY (`assigned_ts`) REFERENCES `users` (`id`);

--
-- Constraints for table `vehicle_parts`
--
ALTER TABLE `vehicle_parts`
  ADD CONSTRAINT `fk_part_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `parts_supplier` (`supplier_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
