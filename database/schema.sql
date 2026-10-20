-- ========================================================
-- Final Exam: Internet Programming (2026)
-- Topic: HR Manager & Salary Analytics System
-- Student: std6730251506 (Peerakorn Nilkaew)
-- Database: ip_std6730251506 (Cloud Server 119.59.102.161)
-- Rule: Field prefix Peerakorn_Nin_ (e.g., Peerakorn_Nin_ID_Employee)
-- ========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Departments Table
DROP TABLE IF EXISTS Peerakorn_Nin_Salary_History;
DROP TABLE IF EXISTS Peerakorn_Nin_Employees;
DROP TABLE IF EXISTS Peerakorn_Nin_Departments;

CREATE TABLE Peerakorn_Nin_Departments (
    Peerakorn_Nin_ID_Department INT AUTO_INCREMENT PRIMARY KEY,
    Peerakorn_Nin_Department_Name VARCHAR(100) NOT NULL UNIQUE,
    Peerakorn_Nin_Budget DECIMAL(15, 2) DEFAULT 0.00,
    Peerakorn_Nin_Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Employees Table
CREATE TABLE Peerakorn_Nin_Employees (
    Peerakorn_Nin_ID_Employee INT AUTO_INCREMENT PRIMARY KEY,
    Peerakorn_Nin_First_Name VARCHAR(100) NOT NULL,
    Peerakorn_Nin_Last_Name VARCHAR(100) NOT NULL,
    Peerakorn_Nin_Email VARCHAR(150) NOT NULL UNIQUE,
    Peerakorn_Nin_Phone VARCHAR(25) NOT NULL,
    Peerakorn_Nin_Department VARCHAR(100) NOT NULL,
    Peerakorn_Nin_Position VARCHAR(100) NOT NULL,
    Peerakorn_Nin_Base_Salary DECIMAL(12, 2) NOT NULL,
    Peerakorn_Nin_Bonus DECIMAL(12, 2) DEFAULT 0.00,
    Peerakorn_Nin_Social_Security DECIMAL(12, 2) DEFAULT 750.00,
    Peerakorn_Nin_Tax DECIMAL(12, 2) DEFAULT 0.00,
    Peerakorn_Nin_Net_Salary DECIMAL(12, 2) NOT NULL,
    Peerakorn_Nin_Hire_Date DATE NOT NULL,
    Peerakorn_Nin_Status ENUM('Active', 'Probation', 'Resigned', 'On Leave') DEFAULT 'Active',
    Peerakorn_Nin_Avatar_URL VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    Peerakorn_Nin_Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Peerakorn_Nin_Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Salary History Table (Payroll Records)
CREATE TABLE Peerakorn_Nin_Salary_History (
    Peerakorn_Nin_ID_Salary INT AUTO_INCREMENT PRIMARY KEY,
    Peerakorn_Nin_ID_Employee INT NOT NULL,
    Peerakorn_Nin_Month INT NOT NULL,
    Peerakorn_Nin_Year INT NOT NULL,
    Peerakorn_Nin_Base_Salary DECIMAL(12, 2) NOT NULL,
    Peerakorn_Nin_Bonus DECIMAL(12, 2) DEFAULT 0.00,
    Peerakorn_Nin_Overtime DECIMAL(12, 2) DEFAULT 0.00,
    Peerakorn_Nin_Social_Security DECIMAL(12, 2) DEFAULT 750.00,
    Peerakorn_Nin_Tax DECIMAL(12, 2) DEFAULT 0.00,
    Peerakorn_Nin_Deductions DECIMAL(12, 2) DEFAULT 0.00,
    Peerakorn_Nin_Net_Salary DECIMAL(12, 2) NOT NULL,
    Peerakorn_Nin_Payment_Status ENUM('Paid', 'Pending', 'Processing') DEFAULT 'Paid',
    Peerakorn_Nin_Payment_Date DATE NOT NULL,
    Peerakorn_Nin_Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Peerakorn_Nin_ID_Employee) REFERENCES Peerakorn_Nin_Employees(Peerakorn_Nin_ID_Employee) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
