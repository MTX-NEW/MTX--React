-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 09, 2025 at 12:43 PM
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
-- Database: `mtx`
--

-- --------------------------------------------------------

--
-- Table structure for table `case_managers`
--

CREATE TABLE `case_managers` (
  `manager_id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `affiliate` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(14, 12, '2025-04-08', '2025-04-08 15:19:01', '2025-04-08 20:43:44', '1.68', '0.00', '', NULL, '2025-04-08 15:19:01', '2025-04-08 20:43:44');

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
(13, 14, '2025-04-08 16:59:35', '2025-04-08 20:43:40', 224, 'break', '2025-04-08 16:59:35', '2025-04-08 20:43:40');

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
(28, 1, 'Standard', 9, 'Once', NULL, '2025-03-28', NULL, '2886.94', '2025-03-27 23:44:17', '2025-04-02 18:07:30'),
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
(41, 1, 'Round Trip', 9, 'Once', NULL, '2025-04-08', NULL, '5121.83', '2025-04-07 22:31:15', '2025-04-08 20:43:24'),
(45, 2, 'Standard', 9, 'Once', NULL, '2025-04-08', NULL, '0.03', '2025-04-07 23:17:17', '2025-04-08 10:37:14'),
(46, 4, 'Standard', 9, 'Once', NULL, '2025-04-08', NULL, '22.07', '2025-04-08 16:55:41', '2025-04-08 16:55:42');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trip_legs`
--

INSERT INTO `trip_legs` (`leg_id`, `trip_id`, `driver_id`, `status`, `pickup_location`, `dropoff_location`, `scheduled_pickup`, `actual_pickup`, `scheduled_dropoff`, `actual_dropoff`, `leg_distance`, `sequence`, `created_at`, `updated_at`) VALUES
(1, 25, 11, 'Dropped off', 6, 10, '01:05:00', '00:04:00', '06:08:00', '11:51:00', '1274.33', 1, '2025-03-27 06:30:36', '2025-04-04 15:44:29'),
(2, 27, 21, 'Attention', 8, 6, '10:00:00', '09:50:00', '02:00:00', '01:45:00', '2886.94', 1, '2025-03-27 22:49:30', '2025-04-04 15:29:08'),
(3, 28, NULL, 'Scheduled', 8, 6, NULL, '03:15:00', NULL, NULL, '2886.94', 1, '2025-03-27 23:44:19', '2025-04-02 18:07:30'),
(4, 29, NULL, 'Scheduled', 9, 10, NULL, NULL, NULL, NULL, '491.31', 1, '2025-03-27 23:45:46', '2025-03-27 23:45:46'),
(5, 30, NULL, 'Scheduled', 11, 12, NULL, NULL, NULL, NULL, '0.04', 1, '2025-03-27 23:47:30', '2025-03-27 23:47:30'),
(6, 31, NULL, 'Picked up', 11, 12, '21:00:00', '00:00:00', '22:00:00', NULL, '0.04', 1, '2025-03-27 23:52:33', '2025-04-04 15:29:23'),
(7, 32, NULL, 'Scheduled', 11, 12, '21:00:00', NULL, '23:10:00', NULL, '0.04', 1, '2025-03-28 00:09:02', '2025-03-28 00:09:02'),
(9, 34, 21, 'Scheduled', 11, 1, '02:09:00', '03:17:00', '00:00:00', NULL, '2869.89', 1, '2025-03-28 02:00:37', '2025-04-02 18:16:38'),
(11, 35, 11, 'Scheduled', 8, 6, '02:11:00', '00:00:00', '06:30:00', '00:00:00', '2886.94', 1, '2025-03-28 02:09:59', '2025-04-02 18:04:09'),
(12, 36, NULL, 'Picked up', 9, 10, '00:59:00', '11:37:00', '01:05:00', '01:00:00', '445.43', 1, '2025-03-28 20:06:35', '2025-04-02 18:04:31'),
(13, 37, NULL, 'Scheduled', 6, 9, '00:00:00', NULL, '03:00:00', NULL, '1334.69', 1, '2025-03-28 20:09:18', '2025-03-28 20:11:09'),
(15, 38, 11, 'Transport confirmed', 9, 10, '00:00:00', NULL, '05:25:00', NULL, '445.43', 1, '2025-03-28 20:19:12', '2025-04-02 17:46:47'),
(16, 38, 21, '', 1, 7, '00:00:00', '00:00:00', '03:24:00', NULL, '2915.00', 2, '2025-03-29 03:50:29', '2025-04-04 16:05:23'),
(17, 36, 11, 'Cancelled', 11, 12, '08:01:00', '00:00:00', '09:01:00', NULL, '0.04', 2, '2025-03-29 05:01:11', '2025-04-02 18:03:54'),
(18, 38, NULL, 'Scheduled', 1, 9, '23:01:00', NULL, '23:45:00', NULL, '1158.68', 3, '2025-04-02 17:45:27', '2025-04-02 17:45:27'),
(19, 29, 11, 'Scheduled', 1, 7, '21:19:00', NULL, '22:19:00', '04:20:00', '2899.57', 2, '2025-04-02 18:19:57', '2025-04-02 18:20:18'),
(22, 40, NULL, 'Scheduled', 9, 10, NULL, NULL, NULL, NULL, '445.43', 1, '2025-04-07 21:55:55', '2025-04-07 21:55:55'),
(23, 40, 11, 'Scheduled', 1, 7, NULL, NULL, NULL, NULL, '2915.24', 2, '2025-04-07 21:55:57', '2025-04-07 21:55:57'),
(24, 33, NULL, 'Scheduled', 11, 12, NULL, NULL, NULL, NULL, '0.04', 1, '2025-04-07 22:27:28', '2025-04-07 22:27:28'),
(25, 41, 21, 'Assigned', 8, 10, '06:30:00', '06:00:00', '06:46:00', '07:00:00', '2912.35', 1, '2025-04-07 22:31:17', '2025-04-08 20:43:24'),
(28, 45, NULL, 'Scheduled', 8, 12, '00:00:00', NULL, '03:15:00', NULL, '0.03', 1, '2025-04-07 23:17:18', '2025-04-08 10:37:14'),
(29, 41, 11, 'Scheduled', 7, 9, '18:30:00', NULL, '19:59:00', NULL, '2209.48', 2, '2025-04-08 16:45:02', '2025-04-08 16:47:11'),
(30, 46, NULL, 'Scheduled', 13, 14, '11:30:00', NULL, '00:14:00', NULL, '22.07', 1, '2025-04-08 16:55:42', '2025-04-08 16:55:42');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trip_members`
--

INSERT INTO `trip_members` (`member_id`, `first_name`, `last_name`, `program_id`, `ahcccs_id`, `insurance_expiry`, `birth_date`, `phone`, `pickup_location`, `dropoff_location`, `gender`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'jemmy', 'Macias', 1, 'A34239', '2026-03-09', '1977-03-14', '2025550384', 8, 6, 'Male', 'NA', '2025-03-09 01:46:47', '2025-04-07 09:01:40'),
(2, 'Lorenzo', 'Macias', 3, 'A34233', '2029-03-11', '1990-03-13', '2025550384', 11, 12, 'Male', '', '2025-03-09 02:12:52', '2025-04-07 09:01:42'),
(3, 'Yousef', 'Leio', 4, 'A34221', '2026-03-30', '1998-05-19', '2025550384', 9, 10, 'Male', 'New User ', '2025-03-12 03:46:49', '2025-04-07 09:01:44'),
(4, 'Mike', 'Roberry', 1, 'A34224', '2026-03-31', '1999-03-31', '3803708512', 13, 14, 'Male', 'Test User', '2025-04-08 16:52:28', '2025-04-08 17:16:35');

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
(30, 46, 'Ambulatory', 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-08 16:55:42', '2025-04-08 16:55:42');

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
  `hourly_rate` decimal(10,2) DEFAULT 15.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `username`, `email`, `phone`, `emp_code`, `user_group`, `user_type`, `status`, `created_at`, `updated_at`, `hiringDate`, `lastEmploymentDate`, `sex`, `spanishSpeaking`, `paymentStructure`, `hourly_rate`) VALUES
(9, 'Lorenzo', 'Macias', 'Lorenzo', 'lorenzo2@gmail.com', '3303708545', '23523', 2, 3, 'Active', '2025-01-24 01:46:27', '2025-04-06 21:09:01', '2025-02-11', '2025-02-09', 'Male', 'No', 'Pay per Mile', '10.00'),
(11, 'jemmy', 'Macias', 'jemmy', 'lorenzo1@gmail.com', '4803708512', '23523', 1, 2, 'Active', '2025-01-24 01:46:27', '2025-02-02 05:41:45', '2025-02-01', '2025-02-10', 'Male', 'No', 'Pay per Trip', '15.00'),
(12, 'Jeffery', 'Jackson', 'Jeffery', 'jeffery@gmail.com', '4803708512', '235235', 1, 1, 'Active', '2025-01-24 01:46:27', '2025-02-06 05:17:46', '2025-01-29', '2025-02-21', 'Male', 'No', 'Pay per Hour', '15.00'),
(21, 'Mohamed', 'Turash', 'Mohamed', 'mohamed@gmail.com', '4803708512', 'EMP12345', 2, 2, 'Active', '2025-01-28 00:37:04', '2025-02-08 13:44:29', '2024-12-08', '2025-01-06', 'Male', 'Yes', 'Pay per Hour', '15.00'),
(27, 'Mohamed', 'Test', 'Mohamed1', 'mohamed1@gmail.com', '4803708545', 'EMP7964', 2, 3, 'Active', '2025-01-28 00:48:30', '2025-02-11 14:03:13', '2024-12-13', '2024-12-15', 'Female', 'No', 'Pay per Hour', '15.00'),
(65, 'Yousef', 'Sarol', 'yousef', 'yousef@gmail.com', '2803708543', '777', 6, 1, 'Inactive', '2025-02-03 03:27:29', '2025-04-04 20:38:30', '2025-01-23', '2025-02-03', 'Male', 'Yes', 'Pay per Hour', '14.00'),
(66, 'Mike', 'Macias', 'Mike', 'mike@gmail.com', '7803708512', 'EMP4956', 1, 1, 'Active', '2025-02-03 03:42:15', '2025-02-06 04:36:24', '2025-01-29', '2025-02-16', 'Male', 'No', 'Pay per Trip', '15.00');

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
-- Indexes for table `case_managers`
--
ALTER TABLE `case_managers`
  ADD PRIMARY KEY (`manager_id`);

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
-- AUTO_INCREMENT for table `case_managers`
--
ALTER TABLE `case_managers`
  MODIFY `manager_id` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `timesheet_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `timesheet_breaks`
--
ALTER TABLE `timesheet_breaks`
  MODIFY `break_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `time_off_requests`
--
ALTER TABLE `time_off_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trips`
--
ALTER TABLE `trips`
  MODIFY `trip_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `trip_legs`
--
ALTER TABLE `trip_legs`
  MODIFY `leg_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

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
  MODIFY `instruction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

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
