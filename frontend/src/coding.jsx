// DB tables structure
/*
-- User Groups Table
CREATE TABLE user_groups (
    group_id INT PRIMARY KEY AUTO_INCREMENT,
    group_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    common_name VARCHAR(50) NOT NULL,
    short_name VARCHAR(10) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    parent_group_id INT,
    auto_routing BOOLEAN DEFAULT false,
    send_pdf BOOLEAN DEFAULT false,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_group_id) REFERENCES user_groups(group_id)
);

-- User Types Table
CREATE TABLE user_types (
    type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(50) NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Programs Table
CREATE TABLE programs (
    program_id INT PRIMARY KEY AUTO_INCREMENT,
    program_name VARCHAR(100) NOT NULL,
    company_id VARCHAR(50),
    company_name VARCHAR(100),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add sample data
INSERT INTO user_groups (group_number, full_name, common_name, short_name, email, phone, status)
VALUES
('GRP-001', 'Administrators Group', 'Admins', 'ADM', 'admins@example.com', '123-456-7890', 'Active'),
('GRP-002', 'Medical Transport Group', 'MedTrans', 'MTX', 'medtrans@example.com', '098-765-4321', 'Active');

INSERT INTO user_types (type_name, display_name, status)
VALUES
('admin', 'System Administrator', 'Active'),
('driver', 'Transport Driver', 'Active'),
('coordinator', 'Transport Coordinator', 'Active');

INSERT INTO programs (program_name, company_name, address, city, state, postal_code, phone)
VALUES
('Medical Transport Program', 'HealthCare Inc.', '123 Main St', 'New York', 'NY', '10001', '555-123-4567'),
('Emergency Response Program', 'QuickResponse LLC', '456 Oak Ave', 'Los Angeles', 'CA', '90001', '555-987-6543');
*/

/*
CREATE TABLE `user_types` (
  `type_id` int(11) NOT NULL,
  `type_name` varchar(50) NOT NULL,
  `display_name` varchar(50) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `view` tinyint(1) DEFAULT 0,
  `edit` tinyint(1) DEFAULT 0,
  `page` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_types`
--

INSERT INTO `user_types` (`type_id`, `type_name`, `display_name`, `status`, `view`, `edit`, `page`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'System Administrator', 'Active', 1, 1, 'all', '2025-02-01 01:46:46', '2025-02-02 05:45:27'),
(2, 'driver', 'Transport Driver', 'Active', 1, 0, 'dashboard', '2025-02-01 01:46:46', '2025-02-03 03:19:52'),
(3, 'coordinator', 'Transport Coordinator', 'Active', 1, 1, 'transport', '2025-02-01 01:46:46', '2025-02-03 03:19:54'),
(328, 'Ali', 'Baba', 'Inactive', 0, 0, 'none', '2025-02-02 16:36:51', '2025-02-03 03:19:37');*/