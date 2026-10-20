require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 3112;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'std6730251506',
    password: process.env.DB_PASSWORD || 'D1w!uPiR',
    database: process.env.DB_NAME || 'ip_std6730251506',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+07:00'
});

// Helper: Tax and Social Security Calculation (Thai Standard Rules)
function calculateDeductions(baseSalary, bonus = 0, overtime = 0, customDeductions = 0) {
    const totalIncome = parseFloat(baseSalary || 0) + parseFloat(bonus || 0) + parseFloat(overtime || 0);
    
    // Social Security: 5% of monthly salary (capped at max 15,000 THB -> max 750 THB)
    const ssBase = Math.min(Math.max(parseFloat(baseSalary || 0), 1650), 15000);
    const socialSecurity = Math.round(ssBase * 0.05);

    // Annualized taxable income estimate for progressive tax
    const annualIncome = totalIncome * 12;
    // Standard expense deduction: 50% max 100,000 THB
    const expenseDeduction = Math.min(annualIncome * 0.5, 100000);
    // Personal allowance: 60,000 THB
    const personalAllowance = 60000;
    // Social Security annual deduction: max 9,000 THB
    const annualSS = socialSecurity * 12;

    const netTaxableIncome = Math.max(0, annualIncome - expenseDeduction - personalAllowance - annualSS);

    // Progressive tax brackets
    let annualTax = 0;
    if (netTaxableIncome > 5000000) {
        annualTax += (netTaxableIncome - 5000000) * 0.35;
        annualTax += 3000000 * 0.30 + 1000000 * 0.25 + 250000 * 0.20 + 250000 * 0.15 + 200000 * 0.10 + 150000 * 0.05;
    } else if (netTaxableIncome > 2000000) {
        annualTax += (netTaxableIncome - 2000000) * 0.30;
        annualTax += 1000000 * 0.25 + 250000 * 0.20 + 250000 * 0.15 + 200000 * 0.10 + 150000 * 0.05;
    } else if (netTaxableIncome > 1000000) {
        annualTax += (netTaxableIncome - 1000000) * 0.25;
        annualTax += 250000 * 0.20 + 250000 * 0.15 + 200000 * 0.10 + 150000 * 0.05;
    } else if (netTaxableIncome > 750000) {
        annualTax += (netTaxableIncome - 750000) * 0.20;
        annualTax += 250000 * 0.15 + 200000 * 0.10 + 150000 * 0.05;
    } else if (netTaxableIncome > 500000) {
        annualTax += (netTaxableIncome - 500000) * 0.15;
        annualTax += 200000 * 0.10 + 150000 * 0.05;
    } else if (netTaxableIncome > 300000) {
        annualTax += (netTaxableIncome - 300000) * 0.10;
        annualTax += 150000 * 0.05;
    } else if (netTaxableIncome > 150000) {
        annualTax += (netTaxableIncome - 150000) * 0.05;
    }

    const monthlyTax = Math.round((annualTax / 12) * 100) / 100;
    const totalDeductions = socialSecurity + monthlyTax + parseFloat(customDeductions || 0);
    const netSalary = Math.round((totalIncome - totalDeductions) * 100) / 100;

    return {
        totalIncome,
        socialSecurity,
        monthlyTax,
        customDeductions: parseFloat(customDeductions || 0),
        totalDeductions,
        netSalary
    };
}

// -------------------------------------------------------------
// Root & Health Check
// -------------------------------------------------------------
app.get('/', (req, res) => {
    res.json({
        success: true,
        system: 'HR Manager & Salary Analytics System',
        course: 'Internet Programming (IP) Final Exam 2026',
        student: {
            id: 'std6730251506',
            name: 'Peerakorn Nilkaew',
            university: 'Kasetsart University Sriracha Campus'
        },
        port: port,
        status: 'Online',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', async (req, res) => {
    try {
        const [result] = await pool.query('SELECT 1 as db_status');
        res.json({
            status: 'Healthy',
            database: 'Connected (ip_std6730251506)',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({ status: 'Error', error: err.message });
    }
});

// -------------------------------------------------------------
// 1. Employees Endpoints (CRUD)
// -------------------------------------------------------------

// GET all employees (supports search, department, status, sort)
app.get('/api/employees', async (req, res) => {
    try {
        const { search, department, status, sortBy, order } = req.query;
        let query = 'SELECT * FROM NinSom_Employees WHERE 1=1';
        const params = [];

        if (search) {
            query += ` AND (NinSom_First_Name LIKE ? OR NinSom_Last_Name LIKE ? OR NinSom_Email LIKE ? OR NinSom_Position LIKE ?)`;
            const s = `%${search}%`;
            params.push(s, s, s, s);
        }

        if (department && department !== 'All') {
            query += ` AND NinSom_Department = ?`;
            params.push(department);
        }

        if (status && status !== 'All') {
            query += ` AND NinSom_Status = ?`;
            params.push(status);
        }

        const validSortCols = {
            'id': 'NinSom_ID_Employee',
            'name': 'NinSom_First_Name',
            'salary': 'NinSom_Base_Salary',
            'net_salary': 'NinSom_Net_Salary',
            'hire_date': 'NinSom_Hire_Date'
        };

        const sortCol = validSortCols[sortBy] || 'NinSom_ID_Employee';
        const sortOrder = (order && order.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';
        query += ` ORDER BY ${sortCol} ${sortOrder}`;

        const [rows] = await pool.query(query, params);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET single employee by ID + salary history
app.get('/api/employees/:id', async (req, res) => {
    try {
        const [emp] = await pool.query('SELECT * FROM NinSom_Employees WHERE NinSom_ID_Employee = ?', [req.params.id]);
        if (emp.length === 0) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const [history] = await pool.query(
            'SELECT * FROM NinSom_Salary_History WHERE NinSom_ID_Employee = ? ORDER BY NinSom_Year DESC, NinSom_Month DESC',
            [req.params.id]
        );

        res.json({
            success: true,
            employee: emp[0],
            salaryHistory: history
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST Create new employee
app.post('/api/employees', async (req, res) => {
    try {
        const {
            NinSom_First_Name,
            NinSom_Last_Name,
            NinSom_Email,
            NinSom_Phone,
            NinSom_Department,
            NinSom_Position,
            NinSom_Base_Salary,
            NinSom_Bonus,
            NinSom_Hire_Date,
            NinSom_Status,
            NinSom_Avatar_URL
        } = req.body;

        if (!NinSom_First_Name || !NinSom_Last_Name || !NinSom_Email || !NinSom_Base_Salary || !NinSom_Department) {
            return res.status(400).json({ success: false, message: 'Missing required employee fields' });
        }

        const base = parseFloat(NinSom_Base_Salary);
        const bonus = parseFloat(NinSom_Bonus || 0);
        const calc = calculateDeductions(base, bonus);

        const sql = `
            INSERT INTO NinSom_Employees (
                NinSom_First_Name, NinSom_Last_Name, NinSom_Email, NinSom_Phone,
                NinSom_Department, NinSom_Position, NinSom_Base_Salary, NinSom_Bonus,
                NinSom_Social_Security, NinSom_Tax, NinSom_Net_Salary,
                NinSom_Hire_Date, NinSom_Status, NinSom_Avatar_URL
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(sql, [
            NinSom_First_Name,
            NinSom_Last_Name,
            NinSom_Email,
            NinSom_Phone || '080-000-0000',
            NinSom_Department,
            NinSom_Position || 'Employee',
            base,
            bonus,
            calc.socialSecurity,
            calc.monthlyTax,
            calc.netSalary,
            NinSom_Hire_Date || new Date().toISOString().split('T')[0],
            NinSom_Status || 'Active',
            NinSom_Avatar_URL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
        ]);

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            employeeId: result.insertId,
            calculated: calc
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// PUT Update employee
app.put('/api/employees/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const {
            NinSom_First_Name,
            NinSom_Last_Name,
            NinSom_Email,
            NinSom_Phone,
            NinSom_Department,
            NinSom_Position,
            NinSom_Base_Salary,
            NinSom_Bonus,
            NinSom_Hire_Date,
            NinSom_Status,
            NinSom_Avatar_URL
        } = req.body;

        const base = parseFloat(NinSom_Base_Salary);
        const bonus = parseFloat(NinSom_Bonus || 0);
        const calc = calculateDeductions(base, bonus);

        const sql = `
            UPDATE NinSom_Employees SET
                NinSom_First_Name = ?,
                NinSom_Last_Name = ?,
                NinSom_Email = ?,
                NinSom_Phone = ?,
                NinSom_Department = ?,
                NinSom_Position = ?,
                NinSom_Base_Salary = ?,
                NinSom_Bonus = ?,
                NinSom_Social_Security = ?,
                NinSom_Tax = ?,
                NinSom_Net_Salary = ?,
                NinSom_Hire_Date = ?,
                NinSom_Status = ?,
                NinSom_Avatar_URL = ?
            WHERE NinSom_ID_Employee = ?
        `;

        await pool.query(sql, [
            NinSom_First_Name,
            NinSom_Last_Name,
            NinSom_Email,
            NinSom_Phone,
            NinSom_Department,
            NinSom_Position,
            base,
            bonus,
            calc.socialSecurity,
            calc.monthlyTax,
            calc.netSalary,
            NinSom_Hire_Date,
            NinSom_Status,
            NinSom_Avatar_URL,
            id
        ]);

        res.json({
            success: true,
            message: 'Employee updated successfully',
            calculated: calc
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE Employee
app.delete('/api/employees/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await pool.query('DELETE FROM NinSom_Salary_History WHERE NinSom_ID_Employee = ?', [id]);
        const [result] = await pool.query('DELETE FROM NinSom_Employees WHERE NinSom_ID_Employee = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        res.json({ success: true, message: 'Employee deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// -------------------------------------------------------------
// 2. Salary & Payroll Endpoints
// -------------------------------------------------------------

// Calculate preview endpoint
app.post('/api/payroll/calculate', (req, res) => {
    const { baseSalary, bonus, overtime, customDeductions } = req.body;
    const result = calculateDeductions(baseSalary, bonus, overtime, customDeductions);
    res.json({ success: true, result });
});

// GET Salary History Records
app.get('/api/salary-records', async (req, res) => {
    try {
        const { month, year, department } = req.query;
        let query = `
            SELECT s.*, e.NinSom_First_Name, e.NinSom_Last_Name, e.NinSom_Department, e.NinSom_Position
            FROM NinSom_Salary_History s
            JOIN NinSom_Employees e ON s.NinSom_ID_Employee = e.NinSom_ID_Employee
            WHERE 1=1
        `;
        const params = [];

        if (month) { query += ' AND s.NinSom_Month = ?'; params.push(month); }
        if (year) { query += ' AND s.NinSom_Year = ?'; params.push(year); }
        if (department && department !== 'All') { query += ' AND e.NinSom_Department = ?'; params.push(department); }

        query += ' ORDER BY s.NinSom_Year DESC, s.NinSom_Month DESC, s.NinSom_ID_Salary DESC';

        const [rows] = await pool.query(query, params);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST Add individual salary payment record
app.post('/api/salary-records', async (req, res) => {
    try {
        const {
            NinSom_ID_Employee,
            NinSom_Month,
            NinSom_Year,
            NinSom_Base_Salary,
            NinSom_Bonus,
            NinSom_Overtime,
            NinSom_Deductions,
            NinSom_Payment_Status,
            NinSom_Payment_Date
        } = req.body;

        const base = parseFloat(NinSom_Base_Salary);
        const bonus = parseFloat(NinSom_Bonus || 0);
        const ot = parseFloat(NinSom_Overtime || 0);
        const ded = parseFloat(NinSom_Deductions || 0);
        const calc = calculateDeductions(base, bonus, ot, ded);

        const sql = `
            INSERT INTO NinSom_Salary_History (
                NinSom_ID_Employee, NinSom_Month, NinSom_Year,
                NinSom_Base_Salary, NinSom_Bonus, NinSom_Overtime,
                NinSom_Social_Security, NinSom_Tax, NinSom_Deductions,
                NinSom_Net_Salary, NinSom_Payment_Status, NinSom_Payment_Date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(sql, [
            NinSom_ID_Employee,
            NinSom_Month || (new Date().getMonth() + 1),
            NinSom_Year || new Date().getFullYear(),
            base,
            bonus,
            ot,
            calc.socialSecurity,
            calc.monthlyTax,
            ded,
            calc.netSalary,
            NinSom_Payment_Status || 'Paid',
            NinSom_Payment_Date || new Date().toISOString().split('T')[0]
        ]);

        res.status(201).json({ success: true, recordId: result.insertId, calculated: calc });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// -------------------------------------------------------------
// 3. Salary Analytics Endpoints (Core Feature)
// -------------------------------------------------------------

// Overall Executive Analytics
app.get('/api/analytics/overview', async (req, res) => {
    try {
        const [empStats] = await pool.query(`
            SELECT 
                COUNT(*) as total_employees,
                SUM(CASE WHEN NinSom_Status = 'Active' THEN 1 ELSE 0 END) as active_employees,
                SUM(CASE WHEN NinSom_Status = 'Probation' THEN 1 ELSE 0 END) as probation_employees,
                SUM(NinSom_Base_Salary) as total_base_payroll,
                SUM(NinSom_Bonus) as total_bonus,
                SUM(NinSom_Social_Security) as total_social_security,
                SUM(NinSom_Tax) as total_tax,
                SUM(NinSom_Net_Salary) as total_net_payroll,
                AVG(NinSom_Base_Salary) as avg_base_salary,
                AVG(NinSom_Net_Salary) as avg_net_salary,
                MAX(NinSom_Base_Salary) as max_salary,
                MIN(NinSom_Base_Salary) as min_salary
            FROM NinSom_Employees
        `);

        const [deptCount] = await pool.query('SELECT COUNT(*) as total_departments FROM NinSom_Departments');

        res.json({
            success: true,
            data: {
                ...empStats[0],
                total_departments: deptCount[0].total_departments
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Department Breakdown Analytics
app.get('/api/analytics/by-department', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                d.NinSom_Department_Name as department,
                d.NinSom_Budget as budget,
                COUNT(e.NinSom_ID_Employee) as employee_count,
                COALESCE(SUM(e.NinSom_Base_Salary), 0) as total_base_salary,
                COALESCE(SUM(e.NinSom_Bonus), 0) as total_bonus,
                COALESCE(SUM(e.NinSom_Net_Salary), 0) as total_net_salary,
                COALESCE(AVG(e.NinSom_Base_Salary), 0) as avg_salary,
                COALESCE(d.NinSom_Budget - SUM(e.NinSom_Net_Salary), d.NinSom_Budget) as remaining_budget
            FROM NinSom_Departments d
            LEFT JOIN NinSom_Employees e ON d.NinSom_Department_Name = e.NinSom_Department
            GROUP BY d.NinSom_ID_Department, d.NinSom_Department_Name, d.NinSom_Budget
            ORDER BY total_net_salary DESC
        `);

        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Salary Distribution Brackets
app.get('/api/analytics/salary-brackets', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                CASE 
                    WHEN NinSom_Base_Salary < 35000 THEN 'Entry Level (< 35k)'
                    WHEN NinSom_Base_Salary BETWEEN 35000 AND 60000 THEN 'Mid Level (35k - 60k)'
                    WHEN NinSom_Base_Salary BETWEEN 60001 AND 90000 THEN 'Senior Level (60k - 90k)'
                    ELSE 'Executive / Lead (> 90k)'
                END as bracket,
                COUNT(*) as count,
                SUM(NinSom_Base_Salary) as total_salary,
                AVG(NinSom_Base_Salary) as avg_salary
            FROM NinSom_Employees
            GROUP BY bracket
            ORDER BY min(NinSom_Base_Salary) ASC
        `);

        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Monthly Payroll Expenditure Trends
app.get('/api/analytics/monthly-trends', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                CONCAT(NinSom_Year, '-', LPAD(NinSom_Month, 2, '0')) as period,
                NinSom_Month as month,
                NinSom_Year as year,
                COUNT(NinSom_ID_Salary) as total_disbursements,
                SUM(NinSom_Base_Salary) as total_base,
                SUM(NinSom_Bonus) as total_bonus,
                SUM(NinSom_Overtime) as total_overtime,
                SUM(NinSom_Tax) as total_tax,
                SUM(NinSom_Social_Security) as total_social_security,
                SUM(NinSom_Net_Salary) as total_net_spend
            FROM NinSom_Salary_History
            GROUP BY NinSom_Year, NinSom_Month
            ORDER BY NinSom_Year ASC, NinSom_Month ASC
        `);

        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// -------------------------------------------------------------
// 4. Departments Endpoints
// -------------------------------------------------------------
app.get('/api/departments', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM NinSom_Departments ORDER BY NinSom_ID_Department ASC');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Start Server
app.listen(port, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` HR Manager & Salary Analytics System Backend`);
    console.log(` Running on port: ${port}`);
    console.log(` Student: std6730251506 (Peerakorn Nilkaew)`);
    console.log(` Database: ip_std6730251506 @ 127.0.0.1:3306`);
    console.log(`=======================================================`);
});
