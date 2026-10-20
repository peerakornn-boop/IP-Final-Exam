-- ========================================================
-- Final Exam: Internet Programming (2026)
-- Topic: HR Manager & Salary Analytics System
-- Student: std6730251506 (Peerakorn Nilkaew)
-- Database: ip_std6730251506 (Cloud Server 119.59.102.161)
-- Rule: Field prefix NinSom_ (e.g., NinSom_ID_Employee)
-- ========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Departments Table
DROP TABLE IF EXISTS NinSom_Salary_History;
DROP TABLE IF EXISTS NinSom_Employees;
DROP TABLE IF EXISTS NinSom_Departments;

CREATE TABLE NinSom_Departments (
    NinSom_ID_Department INT AUTO_INCREMENT PRIMARY KEY,
    NinSom_Department_Name VARCHAR(100) NOT NULL UNIQUE,
    NinSom_Budget DECIMAL(15, 2) DEFAULT 0.00,
    NinSom_Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Employees Table
CREATE TABLE NinSom_Employees (
    NinSom_ID_Employee INT AUTO_INCREMENT PRIMARY KEY,
    NinSom_First_Name VARCHAR(100) NOT NULL,
    NinSom_Last_Name VARCHAR(100) NOT NULL,
    NinSom_Email VARCHAR(150) NOT NULL UNIQUE,
    NinSom_Phone VARCHAR(25) NOT NULL,
    NinSom_Department VARCHAR(100) NOT NULL,
    NinSom_Position VARCHAR(100) NOT NULL,
    NinSom_Base_Salary DECIMAL(12, 2) NOT NULL,
    NinSom_Bonus DECIMAL(12, 2) DEFAULT 0.00,
    NinSom_Social_Security DECIMAL(12, 2) DEFAULT 750.00,
    NinSom_Tax DECIMAL(12, 2) DEFAULT 0.00,
    NinSom_Net_Salary DECIMAL(12, 2) NOT NULL,
    NinSom_Hire_Date DATE NOT NULL,
    NinSom_Status ENUM('Active', 'Probation', 'Resigned', 'On Leave') DEFAULT 'Active',
    NinSom_Avatar_URL VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    NinSom_Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    NinSom_Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Salary History Table (Payroll Records)
CREATE TABLE NinSom_Salary_History (
    NinSom_ID_Salary INT AUTO_INCREMENT PRIMARY KEY,
    NinSom_ID_Employee INT NOT NULL,
    NinSom_Month INT NOT NULL,
    NinSom_Year INT NOT NULL,
    NinSom_Base_Salary DECIMAL(12, 2) NOT NULL,
    NinSom_Bonus DECIMAL(12, 2) DEFAULT 0.00,
    NinSom_Overtime DECIMAL(12, 2) DEFAULT 0.00,
    NinSom_Social_Security DECIMAL(12, 2) DEFAULT 750.00,
    NinSom_Tax DECIMAL(12, 2) DEFAULT 0.00,
    NinSom_Deductions DECIMAL(12, 2) DEFAULT 0.00,
    NinSom_Net_Salary DECIMAL(12, 2) NOT NULL,
    NinSom_Payment_Status ENUM('Paid', 'Pending', 'Processing') DEFAULT 'Paid',
    NinSom_Payment_Date DATE NOT NULL,
    NinSom_Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (NinSom_ID_Employee) REFERENCES NinSom_Employees(NinSom_ID_Employee) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
