-- ========================================================
-- Seed Data for HR Manager & Salary Analytics System
-- Course: Internet Programming (IP) Final Exam 2026
-- Student: std6730251506 (Peerakorn Nilkaew)
-- Database: ip_std6730251506
-- ========================================================

SET NAMES utf8mb4;

-- Departments
INSERT INTO NinSom_Departments (NinSom_Department_Name, NinSom_Budget) VALUES
('Information Technology', 1500000.00),
('Human Resources', 800000.00),
('Finance & Accounting', 1000000.00),
('Marketing & PR', 950000.00),
('Research & Development', 2000000.00),
('Customer Support', 600000.00);

-- Employees
INSERT INTO NinSom_Employees 
(NinSom_First_Name, NinSom_Last_Name, NinSom_Email, NinSom_Phone, NinSom_Department, NinSom_Position, NinSom_Base_Salary, NinSom_Bonus, NinSom_Social_Security, NinSom_Tax, NinSom_Net_Salary, NinSom_Hire_Date, NinSom_Status, NinSom_Avatar_URL)
VALUES
('Somsawut', 'Nindam', 'somsawut.n@ku.th', '081-234-5678', 'Information Technology', 'Chief Technical Officer (CTO)', 125000.00, 25000.00, 750.00, 14250.00, 135000.00, '2020-01-15', 'Active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
('Peerakorn', 'Nilkaew', 'peerakorn.n@ku.th', '089-876-5432', 'Information Technology', 'Senior Full Stack Engineer', 85000.00, 12000.00, 750.00, 6800.00, 89450.00, '2022-03-01', 'Active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
('Kanya', 'Wongsuwan', 'kanya.w@ku.th', '082-345-6789', 'Human Resources', 'HR Director', 75000.00, 10000.00, 750.00, 5200.00, 79050.00, '2021-06-15', 'Active', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
('Thanakorn', 'Srichan', 'thanakorn.s@ku.th', '083-456-7890', 'Finance & Accounting', 'Finance Manager', 68000.00, 8000.00, 750.00, 4300.00, 70950.00, '2021-09-01', 'Active', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
('Ploy', 'Suwannarat', 'ploy.s@ku.th', '084-567-8901', 'Marketing & PR', 'Senior Marketing Strategist', 55000.00, 7500.00, 750.00, 2800.00, 58950.00, '2023-01-10', 'Active', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'),
('Anan', 'Prasertkul', 'anan.p@ku.th', '085-678-9012', 'Research & Development', 'AI / ML Scientist', 92000.00, 15000.00, 750.00, 8100.00, 98150.00, '2022-11-15', 'Active', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'),
('Nattaporn', 'Chanthara', 'nattaporn.c@ku.th', '086-789-0123', 'Human Resources', 'HR Specialist (Payroll & Comp)', 42000.00, 4000.00, 750.00, 1400.00, 43850.00, '2023-08-01', 'Active', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'),
('Chaiwat', 'Boonsri', 'chaiwat.b@ku.th', '087-890-1234', 'Information Technology', 'DevOps & Cloud Engineer', 65000.00, 8500.00, 750.00, 3900.00, 68850.00, '2023-04-12', 'Active', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150'),
('Siriporn', 'Kittisak', 'siriporn.k@ku.th', '088-901-2345', 'Customer Support', 'Customer Success Lead', 38000.00, 3000.00, 750.00, 1100.00, 39150.00, '2024-02-15', 'Probation', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150'),
('Worawat', 'Intarasiri', 'worawat.i@ku.th', '089-012-3456', 'Information Technology', 'Frontend UI/UX Developer', 48000.00, 5000.00, 750.00, 2100.00, 50150.00, '2024-05-01', 'Probation', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150');

-- Salary History
INSERT INTO NinSom_Salary_History
(NinSom_ID_Employee, NinSom_Month, NinSom_Year, NinSom_Base_Salary, NinSom_Bonus, NinSom_Overtime, NinSom_Social_Security, NinSom_Tax, NinSom_Deductions, NinSom_Net_Salary, NinSom_Payment_Status, NinSom_Payment_Date)
VALUES
(1, 8, 2026, 125000.00, 25000.00, 0.00, 750.00, 14250.00, 0.00, 135000.00, 'Paid', '2026-08-31'),
(1, 9, 2026, 125000.00, 25000.00, 0.00, 750.00, 14250.00, 0.00, 135000.00, 'Paid', '2026-09-30'),
(1, 10, 2026, 125000.00, 25000.00, 0.00, 750.00, 14250.00, 0.00, 135000.00, 'Paid', '2026-10-31'),
(2, 8, 2026, 85000.00, 10000.00, 4500.00, 750.00, 6800.00, 0.00, 91950.00, 'Paid', '2026-08-31'),
(2, 9, 2026, 85000.00, 12000.00, 3000.00, 750.00, 6800.00, 0.00, 92450.00, 'Paid', '2026-09-30'),
(2, 10, 2026, 85000.00, 12000.00, 5000.00, 750.00, 6800.00, 0.00, 94450.00, 'Paid', '2026-10-31'),
(3, 9, 2026, 75000.00, 10000.00, 0.00, 750.00, 5200.00, 0.00, 79050.00, 'Paid', '2026-09-30'),
(3, 10, 2026, 75000.00, 10000.00, 0.00, 750.00, 5200.00, 0.00, 79050.00, 'Paid', '2026-10-31'),
(4, 9, 2026, 68000.00, 8000.00, 2500.00, 750.00, 4300.00, 0.00, 73450.00, 'Paid', '2026-09-30'),
(4, 10, 2026, 68000.00, 8000.00, 1500.00, 750.00, 4300.00, 0.00, 72450.00, 'Paid', '2026-10-31'),
(5, 9, 2026, 55000.00, 7500.00, 0.00, 750.00, 2800.00, 0.00, 58950.00, 'Paid', '2026-09-30'),
(5, 10, 2026, 55000.00, 7500.00, 0.00, 750.00, 2800.00, 0.00, 58950.00, 'Paid', '2026-10-31'),
(6, 9, 2026, 92000.00, 15000.00, 0.00, 750.00, 8100.00, 0.00, 98150.00, 'Paid', '2026-09-30'),
(6, 10, 2026, 92000.00, 15000.00, 0.00, 750.00, 8100.00, 0.00, 98150.00, 'Paid', '2026-10-31'),
(7, 10, 2026, 42000.00, 4000.00, 1000.00, 750.00, 1400.00, 0.00, 44850.00, 'Paid', '2026-10-31'),
(8, 10, 2026, 65000.00, 8500.00, 2000.00, 750.00, 3900.00, 0.00, 70850.00, 'Paid', '2026-10-31'),
(9, 10, 2026, 38000.00, 3000.00, 500.00, 750.00, 1100.00, 0.00, 39650.00, 'Paid', '2026-10-31'),
(10, 10, 2026, 48000.00, 5000.00, 1500.00, 750.00, 2100.00, 0.00, 51650.00, 'Paid', '2026-10-31');
