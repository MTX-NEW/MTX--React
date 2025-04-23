-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 23, 2025 at 03:46 PM
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
(1, 1),
(1, 2),
(1, 3),
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
  `page_id` int(11) NOT NULL,
  `page_name` varchar(50) NOT NULL,
  `page_path` varchar(100) NOT NULL,
  `page_section` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pages`
--

INSERT INTO `pages` (`page_id`, `page_name`, `page_path`, `page_section`) VALUES
(1, 'trip-system', '/trip-system', 'Trip system'),
(2, 'trip-requests', '/trip-system/trip-requests', 'Trip system'),
(3, 'trip-management', '/trip-system/trip-management', 'Trip system'),
(4, 'members', '/trip-system/members', 'Trip system'),
(5, 'time-sheet', '/time-sheet', 'Time sheet'),
(6, 'employee', '/time-sheet/employee', 'Time sheet'),
(7, 'employee-history', '/time-sheet/employee-history', 'Time sheet'),
(8, 'time-off-request', '/time-sheet/time-off-request', 'Time sheet'),
(9, 'manage-time-off', '/time-sheet/manage-time-off', 'Time sheet'),
(10, 'payroll', '/time-sheet/payroll', 'Time sheet'),
(11, 'manage-users', '/manage-users', 'Manage users'),
(12, 'all-users', '/manage-users/all-users', 'Manage users'),
(13, 'user-groups', '/manage-users/user-groups', 'Manage users'),
(14, 'clinic-pocs', '/manage-users/clinic-pocs', 'Manage users'),
(15, 'group-permissions', '/manage-users/group-permissions', 'Manage users'),
(16, 'page-permissions', '/manage-users/page-permissions', 'Manage users'),
(17, 'user-types', '/manage-users/user-types', 'Manage users'),
(18, 'manage-programs', '/manage-users/manage-programs', 'Manage users'),
(19, 'manage-emails', '/manage-emails', 'Manage emails'),
(20, 'hr', '/hr', 'HR'),
(21, 'forms', '/forms', 'Forms'),
(22, 'claims', '/claims', 'Claims'),
(23, 'manage-vehicles', '/manage-vehicles', 'Manage Vehicles'),
(24, 'vehicles', '/manage-vehicles/vehicles', 'Manage Vehicles'),
(25, 'maintenance-schedule', '/manage-vehicles/maintenance-schedule', 'Manage Vehicles'),
(26, 'parts-suppliers', '/manage-vehicles/parts-suppliers', 'Manage Vehicles'),
(27, 'import-data', '/import-data', 'Import data'),
(28, 'driver-panel', '/driver-panel', 'Driver Panel'),
(29, 'trips', '/driver-panel/trips', 'Driver Panel'),
(30, 'time-off', '/driver-panel/time-off', 'Driver Panel'),
(31, 'settings', '/driver-panel/settings', 'Driver Panel');

-- --------------------------------------------------------

--
-- Table structure for table `page_permissions`
--

CREATE TABLE `page_permissions` (
  `permission_id` int(11) NOT NULL,
  `type_id` int(11) DEFAULT NULL,
  `can_view` tinyint(1) DEFAULT 0,
  `can_edit` tinyint(1) DEFAULT 0,
  `page_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `page_permissions`
--

INSERT INTO `page_permissions` (`permission_id`, `type_id`, `can_view`, `can_edit`, `page_id`) VALUES
(419, 1, 1, 1, 1),
(420, 1, 1, 1, 2),
(421, 1, 1, 1, 3),
(422, 1, 1, 1, 4),
(423, 1, 1, 1, 5),
(424, 1, 1, 1, 6),
(425, 1, 1, 1, 7),
(426, 1, 1, 1, 8),
(427, 1, 1, 1, 9),
(428, 1, 1, 1, 10),
(429, 1, 1, 1, 11),
(430, 1, 1, 1, 12),
(431, 1, 1, 1, 13),
(432, 1, 1, 1, 14),
(433, 1, 1, 1, 15),
(434, 1, 1, 1, 16),
(435, 1, 1, 1, 17),
(436, 1, 1, 1, 18),
(437, 1, 1, 1, 19),
(438, 1, 1, 1, 20),
(439, 1, 1, 1, 21),
(440, 1, 1, 1, 22),
(441, 1, 1, 1, 23),
(442, 1, 1, 1, 24),
(443, 1, 1, 1, 25),
(444, 1, 1, 1, 26),
(445, 1, 1, 1, 27),
(446, 1, 1, 1, 28),
(447, 1, 1, 1, 29),
(448, 1, 1, 1, 30),
(449, 1, 1, 1, 31),
(450, 2, 1, 1, 1),
(451, 2, 1, 1, 2),
(452, 328, 1, 0, 4),
(453, 3, 1, 0, 4);

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
(4, 11, '2025-03-24', '2025-03-24 23:20:36', '2025-04-16 21:37:30', '8.00', '542.28', '', NULL, '2025-03-24 23:20:36', '2025-04-16 21:37:30'),
(5, 12, '2025-03-22', '2025-03-22 23:20:44', '2025-03-22 23:28:12', '0.12', '0.00', '', NULL, '2025-03-24 23:20:44', '2025-03-24 23:28:12'),
(6, 12, '2025-03-24', '2025-03-24 23:28:13', '2025-03-24 23:44:05', '0.01', '0.00', '', NULL, '2025-03-24 23:28:13', '2025-03-24 23:44:05'),
(7, 21, '2025-03-24', '2025-03-24 23:42:11', NULL, '0.00', '0.00', 'draft', NULL, '2025-03-24 23:42:11', '2025-03-24 23:42:11'),
(8, 9, '2025-03-25', '2025-03-25 00:02:31', '2025-03-25 00:04:04', '0.02', '0.00', '', NULL, '2025-03-25 00:02:31', '2025-03-25 00:04:04'),
(9, 11, '2025-03-25', '2025-03-25 00:40:09', '2025-04-16 21:37:38', '8.00', '540.96', '', NULL, '2025-03-25 00:40:09', '2025-04-16 21:37:38'),
(10, 9, '2025-03-28', '2025-03-28 19:47:49', NULL, '0.00', '0.00', 'draft', NULL, '2025-03-28 19:47:49', '2025-03-28 19:47:49'),
(11, 9, '2025-03-29', '2025-03-29 21:30:04', '2025-03-29 21:39:20', '0.15', '0.00', '', NULL, '2025-03-29 21:30:04', '2025-03-29 21:39:20'),
(12, 11, '2025-04-08', '2025-04-08 07:53:17', '2025-04-08 15:03:22', '7.17', '0.00', '', NULL, '2025-04-08 07:53:17', '2025-04-08 15:03:22'),
(13, 9, '2025-04-08', '2025-04-08 15:17:54', '2025-04-08 20:43:38', '3.74', '0.00', '', NULL, '2025-04-08 15:17:54', '2025-04-08 20:43:38'),
(14, 12, '2025-04-08', '2025-04-08 15:19:01', '2025-04-08 20:43:44', '1.68', '0.00', '', NULL, '2025-04-08 15:19:01', '2025-04-08 20:43:44'),
(15, 9, '2025-04-10', '2025-04-10 16:56:56', NULL, '0.00', '0.00', 'draft', NULL, '2025-04-10 16:56:56', '2025-04-10 16:56:56'),
(16, 9, '2025-04-12', '2025-04-12 21:01:48', '2025-04-12 21:06:53', '0.07', '0.00', '', NULL, '2025-04-12 21:01:48', '2025-04-12 21:06:53'),
(18, 11, '2025-04-12', '2025-04-12 21:16:24', '2025-04-12 21:17:48', '0.02', '0.00', '', 'Auto clock-in from trip 59, leg 45\nAuto clock-out from trip 59, leg 45', '2025-04-12 21:16:24', '2025-04-12 21:17:48'),
(19, 11, '2025-04-13', '2025-04-13 14:06:02', '2025-04-13 14:08:55', '0.05', '0.00', '', 'Auto clock-in from trip 59, leg 46\nAuto clock-out from trip 59, leg 46', '2025-04-13 14:06:02', '2025-04-13 14:08:55'),
(20, 11, '2025-04-16', '2025-04-16 16:17:34', '2025-04-16 21:39:47', '5.26', '0.00', '', 'Auto clock-in from trip 70, leg 57', '2025-04-16 16:17:34', '2025-04-16 21:39:47'),
(21, 9, '2025-04-16', '2025-04-16 21:44:40', NULL, '0.00', '0.00', 'draft', NULL, '2025-04-16 21:44:40', '2025-04-16 21:44:40'),
(22, 9, '2025-04-21', '2025-04-21 19:24:16', '2025-04-21 19:54:10', '0.50', '0.00', '', NULL, '2025-04-21 19:24:16', '2025-04-21 19:54:10');

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
(14, 16, '2025-04-12 21:06:09', '2025-04-12 21:06:51', 15, 'break', '2025-04-12 21:06:09', '2025-04-12 21:06:51'),
(15, 20, '2025-04-16 21:22:01', '2025-04-16 21:22:22', 29, 'break', '2025-04-16 21:22:01', '2025-04-16 21:22:22'),
(16, 20, '2025-04-16 21:31:21', '2025-04-16 21:51:37', 0, 'break', '2025-04-16 21:31:21', '2025-04-16 21:31:37'),
(17, 20, '2025-04-16 21:31:45', '2025-04-16 21:39:28', 15, 'break', '2025-04-16 21:31:45', '2025-04-16 21:37:28'),
(18, 21, '2025-04-16 21:44:45', '2025-04-16 22:20:53', 36, 'break', '2025-04-16 21:44:45', '2025-04-16 22:20:53');

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

--
-- Dumping data for table `time_off_requests`
--

INSERT INTO `time_off_requests` (`request_id`, `user_id`, `start_date`, `end_date`, `type`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 9, '2025-04-16', '2025-04-16', 'vacation', 'approved', '', '2025-04-15 21:37:40', '2025-04-15 22:09:15'),
(2, 11, '2025-04-16', '2025-04-16', 'vacation', 'pending', '', '2025-04-15 21:52:37', '2025-04-15 21:52:37'),
(3, 9, '2025-04-20', '2025-04-25', 'sick', 'denied', 'Please I wanna go out and have fun with my friends', '2025-04-15 22:10:13', '2025-04-16 14:48:14'),
(4, 9, '2025-04-26', '2025-04-28', 'vacation', 'pending', 'Going out', '2025-04-16 14:48:32', '2025-04-16 14:48:32'),
(5, 11, '2025-04-17', '2025-04-17', 'vacation', 'approved', 'Is driver Available', '2025-04-17 04:48:12', '2025-04-17 04:48:25');

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
(60, 4, 'Standard', 9, 'Once', NULL, '2025-04-14', '2025-04-14', '22.07', '2025-04-14 12:31:36', '2025-04-14 12:31:36'),
(61, 4, 'Standard', 9, 'Once', NULL, '2025-04-15', NULL, '22.07', '2025-04-14 19:55:29', '2025-04-14 19:55:29'),
(62, 4, 'Standard', 9, 'Once', NULL, '2025-04-15', '2025-04-14', '22.07', '2025-04-14 19:57:07', '2025-04-14 19:57:07'),
(63, 4, 'Standard', 9, 'Once', NULL, '2025-04-16', '2025-04-14', '22.07', '2025-04-14 20:02:02', '2025-04-14 20:02:02'),
(64, 1, 'Standard', 9, 'Once', NULL, '2025-04-14', NULL, '2912.10', '2025-04-14 20:03:41', '2025-04-14 20:03:43'),
(65, 4, 'Standard', 9, 'Once', NULL, '2025-04-17', '2025-04-14', '22.07', '2025-04-14 20:11:58', '2025-04-17 12:24:08'),
(68, 4, 'Standard', 9, 'Once', NULL, '2025-04-18', '2025-04-18', '22.07', '2025-04-15 16:00:18', '2025-04-15 16:00:41'),
(69, 3, 'Standard', 9, 'Once', NULL, '2025-04-16', '2025-04-16', '445.43', '2025-04-16 14:49:55', '2025-04-16 14:49:56'),
(70, 3, 'Standard', 9, 'Once', NULL, '2025-04-17', '2025-04-17', '2654.91', '2025-04-16 15:01:16', '2025-04-17 12:17:40'),
(71, 4, 'Standard', 9, 'Once', NULL, '2025-04-16', '2025-04-16', '22.07', '2025-04-16 18:35:05', '2025-04-16 18:35:05'),
(72, 3, 'Round Trip', 9, 'Once', NULL, '2025-04-17', '2025-04-17', '0.00', '2025-04-16 22:14:27', '2025-04-17 04:48:36'),
(73, 3, 'Standard', 9, 'Once', NULL, '2025-04-17', '2025-04-17', '2915.08', '2025-04-16 22:15:09', '2025-04-16 22:15:11'),
(74, 1, 'Standard', 9, 'Immediate', NULL, '2025-04-17', '2025-04-17', '2913.30', '2025-04-16 22:19:41', '2025-04-16 22:19:43'),
(75, 1, 'Round Trip', 9, 'Once', NULL, '2025-04-17', '2025-04-17', NULL, '2025-04-16 22:27:57', '2025-04-16 22:27:57'),
(76, 1, 'Round Trip', 9, 'Once', NULL, '2025-04-16', '2025-04-16', NULL, '2025-04-16 22:31:33', '2025-04-16 22:31:33'),
(77, 4, 'Round Trip', 9, 'Once', NULL, '2025-04-17', '2025-04-17', NULL, '2025-04-16 22:34:09', '2025-04-16 22:34:09'),
(78, 4, 'Round Trip', 9, 'Once', NULL, '2025-04-17', '2025-04-17', '0.00', '2025-04-16 22:41:25', '2025-04-16 22:41:26'),
(79, 2, 'Round Trip', 9, 'Once', NULL, '2025-04-17', '2025-04-17', '0.00', '2025-04-16 22:43:43', '2025-04-16 22:48:01'),
(80, 4, 'Round Trip', 9, 'Once', NULL, '2025-04-16', '2025-04-16', '0.00', '2025-04-16 22:50:51', '2025-04-16 22:50:51'),
(81, 3, 'Multi-stop', 9, 'Once', NULL, '2025-04-16', '2025-04-16', '741.01', '2025-04-16 22:53:38', '2025-04-16 22:53:40'),
(82, 4, 'Standard', 9, 'Blanket', 'Tuesday,Wednesday,Saturday', '2025-04-19', '2025-04-19', '22.07', '2025-04-17 03:56:20', '2025-04-17 03:56:21'),
(83, 4, 'Standard', 9, 'Blanket', 'Tuesday,Wednesday,Saturday', '2025-04-22', '2025-04-22', '2866.73', '2025-04-17 03:56:20', '2025-04-21 15:38:26'),
(84, 4, 'Standard', 9, 'Blanket', 'Tuesday,Wednesday,Saturday', '2025-04-23', '2025-04-23', '0.00', '2025-04-17 03:56:20', '2025-04-23 00:52:12'),
(85, 4, 'Standard', 9, 'Blanket', 'Tuesday,Wednesday,Saturday', '2025-04-26', '2025-04-26', '22.07', '2025-04-17 03:56:20', '2025-04-17 03:56:22'),
(86, 4, 'Standard', 9, 'Blanket', 'Tuesday,Wednesday,Saturday', '2025-04-29', '2025-04-29', '22.07', '2025-04-17 03:56:20', '2025-04-17 03:56:22'),
(87, 4, 'Standard', 9, 'Blanket', 'Tuesday,Wednesday,Saturday', '2025-04-30', '2025-04-30', '22.07', '2025-04-17 03:56:20', '2025-04-17 03:56:23'),
(88, 1, 'Standard', 9, 'Once', NULL, '2025-04-20', '2025-04-20', '0.00', '2025-04-20 15:52:25', '2025-04-20 20:41:52'),
(89, 1, 'Round Trip', 9, 'Once', NULL, '2025-04-20', '2025-04-20', '7439.34', '2025-04-20 16:00:00', '2025-04-21 12:37:23'),
(90, 3, 'Standard', 9, 'Once', NULL, '2025-04-22', '2025-04-22', '22.07', '2025-04-21 22:41:12', '2025-04-21 22:41:13'),
(91, 3, 'Standard', 9, 'Once', NULL, '2025-04-24', '2025-04-24', '445.43', '2025-04-21 22:44:50', '2025-04-21 22:44:51'),
(92, 3, 'Standard', 9, 'Once', NULL, '2025-04-21', '2025-04-21', '17231.64', '2025-04-21 22:45:23', '2025-04-21 23:24:07'),
(93, 1, 'Standard', 9, 'Once', NULL, '2025-04-23', '2025-04-23', '0.00', '2025-04-23 02:00:56', '2025-04-23 02:19:59'),
(94, 3, 'Standard', 67, 'Once', NULL, '2025-04-23', '2025-04-23', '445.43', '2025-04-23 02:13:23', '2025-04-23 02:13:24');

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
(47, 60, 11, 'Scheduled', 13, 14, NULL, NULL, NULL, NULL, '22.07', 1, '2025-04-14 12:31:36', '2025-04-14 12:31:36', NULL, NULL),
(48, 61, NULL, 'Scheduled', 13, 14, '06:30:00', NULL, '07:00:00', NULL, '22.07', 1, '2025-04-14 19:55:30', '2025-04-14 19:55:30', NULL, NULL),
(49, 62, NULL, 'Scheduled', 13, 14, '11:57:00', NULL, '01:06:00', NULL, '22.07', 1, '2025-04-14 19:57:08', '2025-04-14 19:57:08', NULL, NULL),
(50, 63, NULL, 'Scheduled', 13, 14, '09:00:00', NULL, '09:30:00', NULL, '22.07', 1, '2025-04-14 20:02:03', '2025-04-14 20:02:03', NULL, NULL),
(51, 64, NULL, 'Scheduled', 8, 6, '09:15:00', NULL, '09:30:00', NULL, '2912.10', 1, '2025-04-14 20:03:43', '2025-04-14 20:03:43', NULL, NULL),
(52, 65, NULL, 'Assigned', 13, 14, '07:33:00', NULL, '05:23:00', NULL, '22.07', 1, '2025-04-14 20:11:59', '2025-04-17 12:24:08', NULL, NULL),
(55, 68, 11, 'Scheduled', 13, 14, '10:00:00', NULL, '01:00:00', NULL, '22.07', 1, '2025-04-15 16:00:19', '2025-04-15 16:00:41', NULL, NULL),
(56, 69, NULL, 'Scheduled', 9, 10, '02:00:00', NULL, '03:00:00', NULL, '445.43', 1, '2025-04-16 14:49:56', '2025-04-16 14:49:56', NULL, NULL),
(57, 70, 11, 'Dropped off', 9, 10, '06:30:00', '19:17:34', '08:00:00', '01:18:48', '445.43', 1, '2025-04-16 15:01:17', '2025-04-16 22:18:48', '123.00', NULL),
(58, 70, 21, 'Assigned', 7, 9, '20:15:00', NULL, '21:00:00', NULL, '2209.48', 2, '2025-04-16 15:01:46', '2025-04-17 12:17:40', NULL, NULL),
(59, 71, NULL, 'Scheduled', 13, 14, NULL, NULL, NULL, NULL, '22.07', 1, '2025-04-16 18:35:05', '2025-04-16 18:35:05', NULL, NULL),
(60, 72, 11, 'Assigned', 9, 10, '00:00:00', NULL, '04:00:00', NULL, NULL, 1, '2025-04-16 22:14:28', '2025-04-17 04:48:36', NULL, NULL),
(62, 73, NULL, 'Scheduled', 1, 7, '01:00:00', NULL, '05:23:00', NULL, NULL, 1, '2025-04-16 22:15:11', '2025-04-16 22:15:11', NULL, NULL),
(63, 74, NULL, 'Scheduled', 8, 6, '00:00:00', NULL, '01:59:00', NULL, NULL, 1, '2025-04-16 22:19:43', '2025-04-16 22:19:43', NULL, NULL),
(64, 75, NULL, 'Scheduled', 8, 6, '03:00:00', NULL, '04:00:00', NULL, NULL, 1, '2025-04-16 22:27:59', '2025-04-16 22:27:59', NULL, NULL),
(66, 76, NULL, 'Scheduled', 7, 10, '04:18:00', NULL, '05:25:00', NULL, NULL, 1, '2025-04-16 22:31:35', '2025-04-16 22:31:35', NULL, NULL),
(68, 77, NULL, 'Scheduled', 13, 14, '00:00:00', NULL, '03:00:00', NULL, NULL, 1, '2025-04-16 22:34:10', '2025-04-16 22:34:10', NULL, NULL),
(70, 78, NULL, 'Scheduled', 13, 14, '01:00:00', NULL, '02:00:00', NULL, NULL, 1, '2025-04-16 22:41:26', '2025-04-16 22:41:26', NULL, NULL),
(71, 78, NULL, 'Scheduled', 14, 13, NULL, NULL, NULL, NULL, NULL, 2, '2025-04-16 22:41:26', '2025-04-16 22:41:26', NULL, NULL),
(74, 79, NULL, 'Scheduled', 11, 12, '06:00:00', NULL, '03:00:00', NULL, NULL, 1, '2025-04-16 22:48:01', '2025-04-16 22:48:01', NULL, NULL),
(75, 79, NULL, 'Scheduled', 12, 11, NULL, NULL, NULL, NULL, NULL, 2, '2025-04-16 22:48:01', '2025-04-16 22:48:01', NULL, NULL),
(76, 80, NULL, 'Scheduled', 13, 14, '06:30:00', NULL, '03:15:00', NULL, NULL, 1, '2025-04-16 22:50:51', '2025-04-16 22:50:51', NULL, NULL),
(77, 80, NULL, 'Scheduled', 14, 13, NULL, NULL, NULL, NULL, NULL, 2, '2025-04-16 22:50:51', '2025-04-16 22:50:51', NULL, NULL),
(78, 81, NULL, 'Scheduled', 9, 10, '00:00:00', NULL, '01:00:00', NULL, NULL, 1, '2025-04-16 22:53:39', '2025-04-16 22:53:39', NULL, NULL),
(79, 81, NULL, 'Scheduled', 11, 8, '03:01:00', NULL, '04:00:00', NULL, NULL, 2, '2025-04-16 22:53:40', '2025-04-16 22:53:40', NULL, NULL),
(80, 81, NULL, 'Scheduled', 11, 7, '07:00:00', NULL, '05:00:00', NULL, NULL, 3, '2025-04-16 22:53:40', '2025-04-16 22:53:40', NULL, NULL),
(81, 82, NULL, 'Scheduled', 13, 14, '02:00:00', NULL, '02:30:00', NULL, NULL, 1, '2025-04-17 03:56:21', '2025-04-17 03:56:21', NULL, NULL),
(82, 83, NULL, 'Scheduled', 13, 14, '02:00:00', NULL, '02:30:00', NULL, NULL, 1, '2025-04-17 03:56:21', '2025-04-17 03:56:21', NULL, NULL),
(83, 84, 11, 'Transport enroute', 13, 14, '02:00:00', '02:00:00', '02:30:00', '02:25:00', NULL, 1, '2025-04-17 03:56:22', '2025-04-23 00:53:29', NULL, NULL),
(84, 85, NULL, 'Scheduled', 13, 14, '02:00:00', NULL, '02:30:00', NULL, NULL, 1, '2025-04-17 03:56:22', '2025-04-17 03:56:22', NULL, NULL),
(85, 86, NULL, 'Scheduled', 13, 14, '02:00:00', NULL, '02:30:00', NULL, NULL, 1, '2025-04-17 03:56:22', '2025-04-17 03:56:22', NULL, NULL),
(86, 87, NULL, 'Scheduled', 13, 14, '02:00:00', NULL, '02:30:00', NULL, NULL, 1, '2025-04-17 03:56:23', '2025-04-17 03:56:23', NULL, NULL),
(87, 88, 11, 'Scheduled', 8, 6, '03:00:00', '02:50:00', '03:30:00', '03:30:00', NULL, 1, '2025-04-20 15:52:27', '2025-04-20 20:41:52', NULL, NULL),
(88, 89, 21, 'Assigned', 8, 6, '04:00:00', NULL, '04:30:00', NULL, NULL, 1, '2025-04-20 16:00:02', '2025-04-21 00:14:33', NULL, NULL),
(89, 89, NULL, 'Scheduled', 6, 8, '06:00:00', NULL, NULL, NULL, NULL, 2, '2025-04-20 16:00:02', '2025-04-20 16:00:02', NULL, NULL),
(90, 89, 67, 'Assigned', 13, 13, '21:10:00', NULL, '09:30:00', NULL, '0.00', 3, '2025-04-20 20:20:17', '2025-04-21 00:16:12', NULL, NULL),
(91, 89, NULL, 'Scheduled', 9, 6, '22:00:00', NULL, '00:40:00', NULL, '445.43', 4, '2025-04-20 20:40:23', '2025-04-20 20:40:35', NULL, NULL),
(92, 89, NULL, 'Scheduled', 1, 9, '02:35:00', NULL, '03:35:00', NULL, '1177.65', 5, '2025-04-20 23:35:51', '2025-04-20 23:35:51', NULL, NULL),
(93, 89, NULL, 'Scheduled', 6, 8, '08:00:00', NULL, '09:00:00', NULL, '2908.13', 6, '2025-04-20 23:43:09', '2025-04-20 23:43:09', NULL, NULL),
(94, 89, 21, 'Assigned', 6, 8, '08:00:00', NULL, '09:00:00', NULL, '2908.13', 6, '2025-04-20 23:43:09', '2025-04-21 12:37:23', NULL, NULL),
(95, 83, NULL, 'Scheduled', 1, 8, '18:38:00', NULL, '19:38:00', NULL, '2866.73', 2, '2025-04-21 15:38:26', '2025-04-21 15:38:26', NULL, NULL),
(96, 90, NULL, 'Scheduled', 13, 14, '05:00:00', NULL, '05:30:00', NULL, NULL, 1, '2025-04-21 22:41:13', '2025-04-21 22:41:13', NULL, NULL),
(97, 91, NULL, 'Scheduled', 9, 10, '09:00:00', NULL, '09:40:00', NULL, NULL, 1, '2025-04-21 22:44:51', '2025-04-21 22:44:51', NULL, NULL),
(98, 92, NULL, 'Scheduled', 9, 10, '06:30:00', NULL, '06:45:00', NULL, NULL, 1, '2025-04-21 22:45:24', '2025-04-21 22:45:24', NULL, NULL),
(99, 92, NULL, 'Scheduled', 13, 14, '01:46:00', NULL, '02:46:00', NULL, '22.07', 2, '2025-04-21 22:47:07', '2025-04-21 22:47:07', NULL, NULL),
(100, 92, NULL, 'Scheduled', 6, 8, '02:00:00', NULL, '03:00:00', NULL, '2908.12', 3, '2025-04-21 23:00:15', '2025-04-21 23:00:15', NULL, NULL),
(111, 93, NULL, 'Scheduled', 8, 6, '06:00:00', '00:25:00', '06:30:00', NULL, NULL, 1, '2025-04-23 02:00:58', '2025-04-23 02:19:59', NULL, NULL),
(112, 94, NULL, 'Scheduled', 9, 10, '02:00:00', NULL, '03:00:00', NULL, NULL, 1, '2025-04-23 02:13:24', '2025-04-23 02:13:24', NULL, NULL);

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
(13, '124 W LEISURE LN', '', 'House', 'Chandler', 'AZ', '85086', '3303708545', 'Urban', 1, '33.80883070', '-112.07542140', '2025-04-08 16:54:05', '2025-04-17 04:40:28'),
(14, '17505 N 79TH AVE', '407', 'Suite', 'Glendale', 'AZ', '85308', '3303708545', 'Rural', 1, '33.64342810', '-112.23015860', '2025-04-08 16:55:02', '2025-04-16 22:18:23');

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
(4, 'Mike', 'Roberry', 1, 'A34224', '2026-03-31', '1999-03-31', '3803708512', 13, 14, 'Male', 'Test User', '2025-04-08 16:52:28', '2025-04-17 04:40:28', 'data:image/png;base64,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');

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
(45, 60, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-14 12:31:36', '2025-04-14 12:31:36'),
(46, 61, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-14 19:55:30', '2025-04-14 19:55:30'),
(47, 62, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-14 19:57:08', '2025-04-14 19:57:08'),
(48, 63, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-14 20:02:03', '2025-04-14 20:02:03'),
(49, 64, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-14 20:03:43', '2025-04-14 20:03:43'),
(50, 65, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-14 20:11:59', '2025-04-14 20:11:59'),
(53, 68, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-15 16:00:19', '2025-04-15 16:00:19'),
(54, 69, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-16 14:49:56', '2025-04-16 14:49:56'),
(55, 70, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-16 15:01:17', '2025-04-16 15:01:17'),
(56, 78, 'Ambulatory', 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-16 22:41:26', '2025-04-16 22:41:26'),
(58, 79, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '2025-04-16 22:48:01', '2025-04-16 22:48:01'),
(59, 80, 'Ambulatory', 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-16 22:50:51', '2025-04-16 22:50:51'),
(60, 81, 'Ambulatory', 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, '2025-04-16 22:53:40', '2025-04-16 22:53:40'),
(61, 82, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-17 03:56:21', '2025-04-17 03:56:21'),
(62, 83, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-17 03:56:21', '2025-04-17 03:56:21'),
(63, 84, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-17 03:56:22', '2025-04-17 03:56:22'),
(64, 85, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-17 03:56:22', '2025-04-17 03:56:22'),
(65, 86, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-17 03:56:22', '2025-04-17 03:56:22'),
(66, 87, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-17 03:56:23', '2025-04-17 03:56:23'),
(67, 88, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-20 15:52:27', '2025-04-20 15:52:27'),
(68, 89, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, '2025-04-20 16:00:02', '2025-04-20 16:00:02'),
(69, 90, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-21 22:41:13', '2025-04-21 22:41:13'),
(70, 91, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-21 22:44:51', '2025-04-21 22:44:51'),
(71, 92, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-21 22:45:24', '2025-04-21 22:45:24'),
(72, 93, 'Ambulatory', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-23 02:00:58', '2025-04-23 02:00:58'),
(73, 94, 'Ambulatory', 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, '2025-04-23 02:13:24', '2025-04-23 02:13:24');

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
  `status` enum('Active','Inactive','Suspended','Pending') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `hiringDate` date DEFAULT NULL,
  `lastEmploymentDate` date DEFAULT NULL,
  `sex` enum('Male','Female') DEFAULT NULL,
  `spanishSpeaking` enum('Yes','No') DEFAULT NULL,
  `paymentStructure` enum('Pay per Hour','Pay per Mile','Pay per Trip') DEFAULT NULL,
  `hourly_rate` decimal(10,2) DEFAULT 15.00,
  `signature` text DEFAULT NULL COMMENT 'Base64 encoded signature image',
  `password` varchar(255) NOT NULL DEFAULT '$2b$10$8aWJMZ0QKMFbdXNl3HRD9uItZrZY3g2oA5bIGrVr3HHDFx/k26Kl.',
  `profile_image` text DEFAULT NULL COMMENT 'Base64 encoded or file path to profile image'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `username`, `email`, `phone`, `emp_code`, `user_group`, `user_type`, `status`, `created_at`, `updated_at`, `hiringDate`, `lastEmploymentDate`, `sex`, `spanishSpeaking`, `paymentStructure`, `hourly_rate`, `signature`, `password`, `profile_image`) VALUES
(9, 'Lorenzo', 'Macias', 'Lorenzo', 'lorenzo2@gmail.com', '3303708545', '23523', 2, 3, 'Active', '2025-01-24 01:46:27', '2025-04-21 17:54:58', '2025-02-08', '2025-02-06', 'Male', 'No', 'Pay per Mile', '10.00', NULL, '$2b$10$8aWJMZ0QKMFbdXNl3HRD9uItZrZY3g2oA5bIGrVr3HHDFx/k26Kl.', 'data:image/jpeg;base64,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'),
(11, 'jemmy', 'Macias', 'jemmy', 'lorenzo1@gmail.com', '4803708512', '23523', 1, 2, 'Active', '2025-01-24 01:46:27', '2025-04-21 19:25:19', '2025-01-31', '2025-02-09', 'Male', 'No', 'Pay per Trip', '15.00', 'data:image/png;base64,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', '$2b$10$8aWJMZ0QKMFbdXNl3HRD9uItZrZY3g2oA5bIGrVr3HHDFx/k26Kl.', 'data:image/jpeg;base64,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'),
(12, 'Jeffery', 'Jackson', 'Jeffery', 'jeffery@gmail.com', '4803708512', '235235', 1, 1, 'Active', '2025-01-24 01:46:27', '2025-04-21 19:31:15', '2025-01-28', '2025-02-20', 'Male', 'No', 'Pay per Hour', '15.00', NULL, '$2b$10$8aWJMZ0QKMFbdXNl3HRD9uItZrZY3g2oA5bIGrVr3HHDFx/k26Kl.', 'data:image/jpeg;base64,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'),
(21, 'Mohamed', 'Turash', 'Mohamed', 'mohamed@gmail.com', '4803708512', 'EMP12345', 2, 2, 'Active', '2025-01-28 00:37:04', '2025-02-08 13:44:29', '2024-12-08', '2025-01-06', 'Male', 'Yes', 'Pay per Hour', '15.00', NULL, '$2b$10$8aWJMZ0QKMFbdXNl3HRD9uItZrZY3g2oA5bIGrVr3HHDFx/k26Kl.', NULL),
(27, 'Mohamed', 'Test', 'Mohamed1', 'mohamed1@gmail.com', '4803708545', 'EMP7964', 2, 3, 'Active', '2025-01-28 00:48:30', '2025-02-11 14:03:13', '2024-12-13', '2024-12-15', 'Female', 'No', 'Pay per Hour', '15.00', NULL, '$2b$10$8aWJMZ0QKMFbdXNl3HRD9uItZrZY3g2oA5bIGrVr3HHDFx/k26Kl.', NULL),
(65, 'Yousef', 'Sarol', 'yousef', 'yousef@gmail.com', '2803708543', '777', 6, 1, 'Inactive', '2025-02-03 03:27:29', '2025-04-04 20:38:30', '2025-01-23', '2025-02-03', 'Male', 'Yes', 'Pay per Hour', '14.00', NULL, '$2b$10$8aWJMZ0QKMFbdXNl3HRD9uItZrZY3g2oA5bIGrVr3HHDFx/k26Kl.', NULL),
(66, 'Mike', 'Macias', 'Mike', 'mike@gmail.com', '7803708512', 'EMP4956', 1, 1, 'Active', '2025-02-03 03:42:15', '2025-02-06 04:36:24', '2025-01-29', '2025-02-16', 'Male', 'No', 'Pay per Trip', '15.00', NULL, '$2b$10$8aWJMZ0QKMFbdXNl3HRD9uItZrZY3g2oA5bIGrVr3HHDFx/k26Kl.', NULL);
INSERT INTO `users` (`id`, `first_name`, `last_name`, `username`, `email`, `phone`, `emp_code`, `user_group`, `user_type`, `status`, `created_at`, `updated_at`, `hiringDate`, `lastEmploymentDate`, `sex`, `spanishSpeaking`, `paymentStructure`, `hourly_rate`, `signature`, `password`, `profile_image`) VALUES
(67, 'Mike', 'Oreal', 'oreal', 'oreal@gmail.com', '2203708111', 'EMP6668', 1, 1, 'Active', '2025-04-18 17:01:27', '2025-04-23 02:07:03', '2025-04-02', '2025-03-16', 'Male', 'No', 'Pay per Hour', '30.00', NULL, '$2b$10$x2nJFKCvX.7rrdlbbOUa3uPV7N7fzD/2IVtgnusLpsOT0G1sjFob2', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/4QBuRXhpZgAASUkqAAgAAAADAA4BAgAkAAAAMgAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAAAAAAABJIHN0cmV0Y2ggYmVmb3JlIGFuZCBhZnRlciBhIHdvcmtvdXQsAQAAAQAAACwBAAABAAAA/+EFmGh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyI+Cgk8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgoJCTxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6SXB0YzR4bXBDb3JlPSJodHRwOi8vaXB0Yy5vcmcvc3RkL0lwdGM0eG1wQ29yZS8xLjAveG1sbnMvIiAgIHhtbG5zOkdldHR5SW1hZ2VzR0lGVD0iaHR0cDovL3htcC5nZXR0eWltYWdlcy5jb20vZ2lmdC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBsdXM9Imh0dHA6Ly9ucy51c2VwbHVzLm9yZy9sZGYveG1wLzEuMC8iICB4bWxuczppcHRjRXh0PSJodHRwOi8vaXB0Yy5vcmcvc3RkL0lwdGM0eG1wRXh0LzIwMDgtMDItMjkvIiB4bWxuczp4bXBSaWdodHM9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9yaWdodHMvIiBwaG90b3Nob3A6Q3JlZGl0PSJHZXR0eSBJbWFnZXMiIEdldHR5SW1hZ2VzR0lGVDpBc3NldElEPSIxMzU5MTQ5NDY3IiB4bXBSaWdodHM6V2ViU3RhdGVtZW50PSJodHRwczovL3d3dy5pc3RvY2twaG90by5jb20vbGVnYWwvbGljZW5zZS1hZ3JlZW1lbnQ/dXRtX21lZGl1bT1vcmdhbmljJmFtcDt1dG1fc291cmNlPWdvb2dsZSZhbXA7dXRtX2NhbXBhaWduPWlwdGN1cmwiIHBsdXM6RGF0YU1pbmluZz0iaHR0cDovL25zLnVzZXBsdXMub3JnL2xkZi92b2NhYi9ETUktUFJPSElCSVRFRC1FWENFUFRTRUFSQ0hFTkdJTkVJTkRFWElORyIgPgo8ZGM6Y3JlYXRvcj48cmRmOlNlcT48cmRmOmxpPlBlb3BsZUltYWdlczwvcmRmOmxpPjwvcmRmOlNlcT48L2RjOmNyZWF0b3I+PGRjOmRlc2NyaXB0aW9uPjxyZGY6QWx0PjxyZGY6bGkgeG1sOmxhbmc9IngtZGVmYXVsdCI+SSBzdHJldGNoIGJlZm9yZSBhbmQgYWZ0ZXIgYSB3b3Jrb3V0PC9yZGY6bGk+PC9yZGY6QWx0PjwvZGM6ZGVzY3JpcHRpb24+CjxwbHVzOkxpY2Vuc29yPjxyZGY6U2VxPjxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPjxwbHVzOkxpY2Vuc29yVVJMPmh0dHBzOi8vd3d3LmlzdG9ja3Bob3RvLmNvbS9waG90by9saWNlbnNlLWdtMTM1OTE0OTQ2Ny0/dXRtX21lZGl1bT1vcmdhbmljJmFtcDt1dG1fc291cmNlPWdvb2dsZSZhbXA7dXRtX2NhbXBhaWduPWlwdGN1cmw8L3BsdXM6TGljZW5zb3JVUkw+PC9yZGY6bGk+PC9yZGY6U2VxPjwvcGx1czpMaWNlbnNvcj4KCQk8L3JkZjpEZXNjcmlwdGlvbj4KCTwvcmRmOlJERj4KPC94OnhtcG1ldGE+Cjw/eHBhY2tldCBlbmQ9InciPz4K/+0AaFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAABLHAJQAAxQZW9wbGVJbWFnZXMcAngAJEkgc3RyZXRjaCBiZWZvcmUgYW5kIGFmdGVyIGEgd29ya291dBwCbgAMR2V0dHkgSW1hZ2VzAP/bAEMACgcHCAcGCggICAsKCgsOGBAODQ0OHRUWERgjHyUkIh8iISYrNy8mKTQpISIwQTE0OTs+Pj4lLkRJQzxINz0+O//bAEMBCgsLDg0OHBAQHDsoIig7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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');
INSERT INTO `users` (`id`, `first_name`, `last_name`, `username`, `email`, `phone`, `emp_code`, `user_group`, `user_type`, `status`, `created_at`, `updated_at`, `hiringDate`, `lastEmploymentDate`, `sex`, `spanishSpeaking`, `paymentStructure`, `hourly_rate`, `signature`, `password`, `profile_image`) VALUES
(70, 'Owner', 'Tester', 'owner', 'owner@gmail.com', '4803708111', 'EMP3890', 1, 1, 'Active', '2025-04-23 02:16:28', '2025-04-23 02:18:06', '2025-04-18', NULL, 'Male', 'No', 'Pay per Hour', '20.00', NULL, '$2b$10$ItRsD4ipzTJIVxg3XoqRm.dbEgi9/i1biKDYspknuWU5yUig63RXK', 'data:image/jpeg;base64,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6Wp9W6ent0oDZfbgk+w8cj4dqkCIMe3O3VNpuM9vrI+jnp3lj294XVV67ZdDyXOk+kVA0GaljxURgetIzPMd4+SopAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQF+9DRVFxroKKlYZJ53iNjR1knC/BXbsa0IaaNup7jGOkkaRSRuacsHIv8+pBOtC6Rg0hp6OiaA6pf69TIOO8/u7gpIi5QEREBERAREQfEkbJInRvaHMcCHNIyCCs67UdAP0tczcKGL/AHVUv9TBz0Tzx3T3c8LRq6V2tNFe7bNb6+Bs1PM3Dmn5jsKDICKU6+0VUaLvXo5cZaScF1PLjmOw94UWQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERARFJdDaNqdZXwUbHGKmjG/UTYzut7B3lB6uzTQE2q7mysrISLTTuzI48OlP2B+K0dDDHTwshhY1kcbQ1rWjAAHILqWaz0dhtcNtt8Qjp4Rho7e0nvK76AiIgIiICIiAiIgIiIPL1Dp636mtMluuMW/E/i1w9pjupwPUVmjWWjrho67OpKppfA8kwVAGGyN/A9oWq15l+0/bdSW11Bc6cTQuOR1Fp7QepBkZFKNa6DuejKtvpIE1HKT0NQweqe49hUXQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQERSLSGibprCu6KjjMdOwgTVLh6kf8AU9yD8dJ6TuOrrsyioWEMBBmmI9WJvaf6LTGmdM2/StoZbrdHho4ySEetI7tKaZ0zbtK2llut0eGjjJIfakd2leugLlEQEREBERAREQEREBERAREQdK7WmhvduloLhTtnp5RhzXfMdhVCa92U12nZZK61Mkq7acuIaMugA+12jnxWiF8SRtlY5j2h7HDDmuGQQgxsivPXexyG4F9x02xlPUYLpKUnDJD937J+CpOtoKu3VclLWU74Jo3FrmPGCCEH4IiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICL9qWkqK2pZT0sL5pZCA1jG5JKurQ+xmKikbX6lEdRKADHStJLWHtcevw5IIdoPZbcNTTR1twZJR2zg7fcMOmHY3+qv6z2a32G3R2+207YKePk0cye0nrK7kUTIYmxRMaxjBhrWjAA7AvtBwuURAREQEREBERAREQEREBERAREQEREHGFH9VaKs2rqMw3CDEo/R1EeBIzwPZ3KQrhBmvWOyy9aXdJUwsNdbweE0Yy5o+83q8eShGMHBWynNa4EOAIPMFQjVeyjT+oy+ohi/J9Y7/ABYBhrj95vIoM2IpjqPZdqXT0rz6G6tpWgkT043hjvHMKHuaWkgggjmCg4REQEREBERAREQEREBERAREQEREBERARACTgcSpbpzZnqXUUrCyidSUzuJqKgbrQO4cygiQGVNdIbL77qiRs0kTqGhDsPnmGCe3dbzPyVtaV2Saf065lRUs/KNY3B6SYeo09zeXvU8AAHAYQR3SmhrNpCm3KCHfqHe3UyAGR3n1DuCkQXKICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgLhcog4wOxRbUezrTmpYnekULIKg5IqIGhj8ntxz81KkQUVfNhNypw6Wy18VW0cophuP8jyPwVfXfS18sT8XK2TwD7RZlp8xw6lrZfEsUczCyRjXtPMOGQUGNkWoLvsz0neCDLaYoHjHrU35s/Dgolctgtsmk3rddZ6YFxJZIwSADqA5IKMRWNXbENU0xb6M+kqg4nO5Ju4HVnIXgVmzjV1EJXS2WdzIs7zowHA+GOaCMIu/U2C8UcJmqbXVwxg4L3wuA+S6fQTfqX/ulB8Ivp0cjPbY5viMI2KR4yyNzh3DKD5Rffo836l/7pXcprDd62LpaW2Vc0ecb0cLiM+5B0EUlo9nWra1kckVkqAyQ8C8buPHPJSCi2I6qqS/0h1JS7uMb8m9ve4IK6RXlbtglvifvXG7zVABBDYowzxBJJUttGzHSdncXxWqOd5z61T+cwOzB4IM6WnTN6vj92222eo+81nqjz5dasGxbCrrVAS3mtiomfqovzj+fbyHxV5RQRQRiOGNsbGjAawAABfqgiWnNm2mtNxtdDRNqqkYJqKgB7sjszwHkpYAAMYXKIOFyiICIiAiIgIiICIiAiIgIiIP/9k='),
(71, 'amir', 'sadet', 'amir', 'amir@gmail.com', '4441245344', 'EMP9570', 1, 1, 'Active', '2025-04-23 13:31:29', '2025-04-23 13:32:18', '2025-04-22', NULL, 'Male', 'No', 'Pay per Hour', '15.00', NULL, '$2b$10$lhgxs2oPAt6N261MQ/xyP.dPNMJJACORcNYVNMH4ZCgcLC55tkoH2', NULL);

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
(328, 'Support', 'Helper', 'Active', '2025-02-02 13:36:51', '2025-04-19 22:18:40'),
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
(5, 'MTX-005', 'Dodge', 'Sprinter X', 'Silver', 4, 'Wheelchair', 'Sedan', 'XYZ-781', 'P235/60R17', '2D4RN4DG5BR765319', '2025-02-01', '2025-02-27', '2025-02-03', 21, '2025-02-02', '2025-02-28', '2025-02-09', 'Active', '2025-02-11 20:26:14', '2025-04-22 15:07:45');

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
  ADD PRIMARY KEY (`page_id`),
  ADD UNIQUE KEY `page_name` (`page_name`);

--
-- Indexes for table `page_permissions`
--
ALTER TABLE `page_permissions`
  ADD PRIMARY KEY (`permission_id`),
  ADD UNIQUE KEY `page_permissions_page_id_type_id` (`page_id`,`type_id`),
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
-- AUTO_INCREMENT for table `pages`
--
ALTER TABLE `pages`
  MODIFY `page_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `page_permissions`
--
ALTER TABLE `page_permissions`
  MODIFY `permission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=454;

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
  MODIFY `timesheet_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `timesheet_breaks`
--
ALTER TABLE `timesheet_breaks`
  MODIFY `break_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `time_off_requests`
--
ALTER TABLE `time_off_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `trips`
--
ALTER TABLE `trips`
  MODIFY `trip_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- AUTO_INCREMENT for table `trip_legs`
--
ALTER TABLE `trip_legs`
  MODIFY `leg_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

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
  MODIFY `instruction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

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
  ADD CONSTRAINT `fk_page_perm_page_id` FOREIGN KEY (`page_id`) REFERENCES `pages` (`page_id`),
  ADD CONSTRAINT `fk_pages_permissions` FOREIGN KEY (`page_id`) REFERENCES `pages` (`page_id`),
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
