# HR Manager & Salary Analytics System
### Final Examination: Internet Programming (2026)
**Faculty of Science at Sriracha, Kasetsart University (KU)**

* **Student Name:** พีรากร นิลแก้ว (Peerakorn Nilkaew)
* **Student ID / Username:** `std6730251506`
* **Cloud Database Host:** `119.59.102.161` (Local socket: `127.0.0.1:3306`)
* **Database Name:** `ip_std6730251506`
* **Field Naming Convention:** All database fields are prefixed with `NinSom_` (e.g. `NinSom_ID_Employee`, `NinSom_First_Name`, `NinSom_Base_Salary`, etc.)
* **Cloud Backend Server Port:** `3112` (`http://119.59.102.161:3112`)
* **GitHub Repository:** [https://github.com/peerakornn-boop/IP-Final-Exam.git](https://github.com/peerakornn-boop/IP-Final-Exam.git)

---

## 📋 ภาพรวมโครงการ (Project Overview)
ระบบบริหารจัดการทรัพยากรบุคคลและวิเคราะห์โครงสร้างเงินเดือน (**HR Manager & Salary Analytics System**) พัฒนาขึ้นแบบ Full-Stack เพื่อตอบโจทย์การบริหารจัดการพนักงาน การคำนวณเงินเดือนสุทธิตามกฎหมายแรงงานและภาษีไทย พร้อมแดชบอร์ดแสดงผลการวิเคราะห์ข้อมูลเชิงลึก (Salary Analytics) เชื่อมต่อตรงกับ Cloud Database ของมหาวิทยาลัย

### 🌟 ฟีเจอร์หลัก (Key Features)
1. **Executive Salary Analytics Dashboard:**
   * สรุปสถิติสำคัญ (KPIs): จำนวนพนักงานทั้งหมด (แยก Active / Probation), ยอดจ่ายเงินเดือนสุทธิรวม, เงินเดือนฐานเฉลี่ย, ภาษีและประกันสังคมที่นำส่ง
   * กราฟเปรียบเทียบค่าใช้จ่ายเงินเดือนจริงกับงบประมาณประจำปีแต่ละแผนก (Department Payroll vs Budget Ceiling)
   * กราฟวิเคราะห์การกระจายตัวของโครงสร้างเงินเดือน (Salary Brackets Distribution: Entry, Mid, Senior, Executive)
   * กราฟแนวโน้มการจ่ายเงินเดือนย้อนหลังในแต่ละรอบเดือน (Monthly Payroll Expenditure Trends)
2. **ระบบจัดการข้อมูลพนักงาน (Full CRUD Employee Management):**
   * **ค้นหาแบบเรียลไทม์ (Live Debounced Search):** ค้นหาพนักงานทันทีตามชื่อ นามสกุล อีเมล หรือตำแหน่ง
   * **ตัวกรองและการจัดเรียง (Filter & Sorting):** กรองตามแผนก (Department), กรองตามสถานะการทำงาน (Active, Probation, On Leave, Resigned), และจัดเรียงตามเงินเดือน วันที่เริ่มงาน
   * **เพิ่มพนักงานใหม่ (Add Employee):** ฟอร์ม Modal พร้อมระบบคำนวณภาษี ประกันสังคม และเงินเดือนสุทธิพรีวิวให้อัตโนมัติขณะกรอก
   * **แก้ไขข้อมูลพนักงาน (Edit Employee):** อัปเดตข้อมูลพนักงานและคำนวณเงินเดือนใหม่ลงฐานข้อมูล Cloud MySQL
   * **ลบข้อมูลพนักงาน (Delete Employee):** ลบข้อมูลจริงพร้อมกล่องยืนยันเพื่อความปลอดภัย
   * **ดูรายละเอียดพนักงาน (View Detail):** แสดงโครงสร้างเงินเดือนและการหักลดหย่อนของพนักงานรายบุคคล
3. **เครื่องมือจำลองคำนวณเงินเดือน & ภาษี (Payroll Simulator):**
   * จำลองคำนวณเงินเดือนฐาน โบนัส ค่าล่วงเวลา (OT) และเงินหัก
   * แสดง Waterfall Breakdown: รายรับรวม -> ประกันสังคม (-฿750) -> ภาษีหัก ณ ที่จ่าย (ตามขั้นบันได) -> รายรับสุทธิ
4. **งบประมาณแผนก (Department Budget Allocations):**
   * แสดงงบประมาณและเปอร์เซ็นต์การใช้งบประมาณของแต่ละแผนก พร้อม Progress Bar

---

## 🗄️ โครงสร้างฐานข้อมูล (Database Schema)
ฐานข้อมูลทำงานบน Cloud MySQL Server (`ip_std6730251506`) โดยตั้งชื่อฟิลด์ทั้งหมดตามข้อกำหนด `NinSom_`:

### 1. ตาราง `NinSom_Employees` (ข้อมูลพนักงาน)
| Field Name | Data Type | Key | Description |
|---|---|---|---|
| `NinSom_ID_Employee` | INT | PRIMARY (AI) | รหัสพนักงาน |
| `NinSom_First_Name` | VARCHAR(100) | | ชื่อจริง |
| `NinSom_Last_Name` | VARCHAR(100) | | นามสกุล |
| `NinSom_Email` | VARCHAR(150) | UNIQUE | อีเมลติดต่อ |
| `NinSom_Phone` | VARCHAR(25) | | เบอร์โทรศัพท์ |
| `NinSom_Department` | VARCHAR(100) | | แผนก |
| `NinSom_Position` | VARCHAR(100) | | ตำแหน่งงาน |
| `NinSom_Base_Salary` | DECIMAL(12,2) | | เงินเดือนฐาน |
| `NinSom_Bonus` | DECIMAL(12,2) | | เงินโบนัส / ค่าตอบแทนพิเศษ |
| `NinSom_Social_Security` | DECIMAL(12,2) | | เงินสมทบประกันสังคม (5% สูงสุด 750 บาท) |
| `NinSom_Tax` | DECIMAL(12,2) | | ภาษีเงินได้หัก ณ ที่จ่าย (คำนวณแบบขั้นบันได) |
| `NinSom_Net_Salary` | DECIMAL(12,2) | | เงินเดือนสุทธิหลังหักภาษีและประกันสังคม |
| `NinSom_Hire_Date` | DATE | | วันที่เริ่มงาน |
| `NinSom_Status` | ENUM | | สถานะ (Active, Probation, Resigned, On Leave) |
| `NinSom_Avatar_URL` | VARCHAR(255) | | ลิงก์รูปภาพโปรไฟล์ |

### 2. ตาราง `NinSom_Salary_History` (ประวัติการจ่ายเงินเดือน)
| Field Name | Data Type | Key | Description |
|---|---|---|---|
| `NinSom_ID_Salary` | INT | PRIMARY (AI) | รหัสรายการจ่ายเงินเดือน |
| `NinSom_ID_Employee` | INT | FOREIGN | อ้างอิงรหัสพนักงาน |
| `NinSom_Month` | INT | | เดือนที่จ่าย (1-12) |
| `NinSom_Year` | INT | | ปีที่จ่าย (e.g. 2026) |
| `NinSom_Base_Salary` | DECIMAL(12,2) | | เงินเดือนฐานประจำรอบ |
| `NinSom_Bonus` | DECIMAL(12,2) | | เงินโบนัสประจำรอบ |
| `NinSom_Overtime` | DECIMAL(12,2) | | ค่าล่วงเวลา |
| `NinSom_Social_Security` | DECIMAL(12,2) | | ประกันสังคม |
| `NinSom_Tax` | DECIMAL(12,2) | | ภาษีหัก ณ ที่จ่าย |
| `NinSom_Net_Salary` | DECIMAL(12,2) | | ยอดจ่ายสุทธิ |
| `NinSom_Payment_Status` | ENUM | | สถานะการจ่าย (Paid, Pending) |
| `NinSom_Payment_Date` | DATE | | วันที่ทำรายการจ่าย |

### 3. ตาราง `NinSom_Departments` (ข้อมูลแผนกและงบประมาณ)
| Field Name | Data Type | Key | Description |
|---|---|---|---|
| `NinSom_ID_Department` | INT | PRIMARY (AI) | รหัสแผนก |
| `NinSom_Department_Name` | VARCHAR(100) | UNIQUE | ชื่อแผนก |
| `NinSom_Budget` | DECIMAL(15,2) | | งบประมาณประจำปีที่ได้รับจัดสรร |

---

## 📡 รายละเอียด API Endpoints (RESTful API)
Backend รันบน Cloud Server พอร์ต `3112` (`http://119.59.102.161:3112`):

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | ตรวจสอบข้อมูลระบบและสถานะเซิร์ฟเวอร์ |
| `GET` | `/api/health` | Health check สถานะการเชื่อมต่อ Cloud MySQL Database |
| `GET` | `/api/employees` | ดึงข้อมูลพนักงานทั้งหมด (รองรับ search, filter, sort) |
| `GET` | `/api/employees/:id` | ดึงข้อมูลพนักงานรายบุคคล + ประวัติการรับเงินเดือน |
| `POST` | `/api/employees` | เพิ่มพนักงานใหม่ (คำนวณภาษีและเงินเดือนสุทธิอัตโนมัติ) |
| `PUT` | `/api/employees/:id` | แก้ไขข้อมูลพนักงาน (คำนวณเงินเดือนสุทธิใหม่) |
| `DELETE` | `/api/employees/:id` | ลบข้อมูลพนักงานออกจากฐานข้อมูล |
| `GET` | `/api/salary-records` | ดึงประวัติรายการจ่ายเงินเดือนทั้งหมด |
| `POST` | `/api/salary-records` | บันทึกการจ่ายเงินเดือนพนักงานประจำรอบ |
| `POST` | `/api/payroll/calculate` | คำนวณภาษี ประกันสังคม และเงินเดือนสุทธิจากตัวเลขจำลอง |
| `GET` | `/api/analytics/overview` | ข้อมูลสถิติวิเคราะห์ภาพรวม (Headcount, Payroll, Averages, Max/Min) |
| `GET` | `/api/analytics/by-department` | ข้อมูลวิเคราะห์เงินเดือนและงบประมาณแยกตามแผนก |
| `GET` | `/api/analytics/salary-brackets` | สถิติการกระจายตัวของพนักงานในแต่ละช่วงเงินเดือน |
| `GET` | `/api/analytics/monthly-trends` | สถิติแนวโน้มยอดจ่ายเงินเดือนย้อนหลังในแต่ละเดือน |
| `GET` | `/api/departments` | ดึงรายชื่อแผนกและงบประมาณทั้งหมด |

---

## 🧮 สูตรการคำนวณเงินเดือนและภาษี (Tax & Payroll Logic)
1. **ประกันสังคม (Social Security Fund - SSF):**
   $$\text{SSF} = \min(\max(\text{Base Salary}, 1650), 15000) \times 5\% \quad (\text{สูงสุด } 750 \text{ บาท/เดือน})$$
2. **ภาษีเงินได้บุคคลธรรมดาหัก ณ ที่จ่าย (Withholding Tax):**
   * รายได้พึงประเมินทั้งปี = $(\text{เงินเดือนฐาน} + \text{โบนัส} + \text{OT}) \times 12$
   * หักค่าใช้จ่าย 50% สูงสุด 100,000 บาท
   * หักลดหย่อนส่วนตัว 60,000 บาท
   * หักลดหย่อนประกันสังคมทั้งปี (สูงสุด 9,000 บาท)
   * คำนวณภาษีตามอัตราขั้นบันได (0% ถึง 35%) แล้วเฉลี่ยเป็นรายเดือน
3. **เงินเดือนสุทธิ (Net Salary):**
   $$\text{Net Salary} = \text{Total Income} - \text{SSF} - \text{Tax} - \text{Deductions}$$

---

## 🚀 วิธีการติดตั้งและรันระบบ (How to Run)

### 1. รัน Backend API Server
เปิดไฟล์ `1_START_BACKEND.bat` เพื่อเชื่อมต่อไปยัง Cloud Server (พอร์ต 3112):
```bash
node start_cloud_backend.js
```

### 2. เปิดหน้าเว็บ Frontend
เปิดไฟล์ `2_START_FRONTEND.bat` หรือเปิดไฟล์ `frontend/index.html` บนเว็บเบราว์เซอร์ใดก็ได้
หน้าระบบจะเชื่อมต่อกับ Cloud API `http://119.59.102.161:3112` โดยอัตโนมัติ

---

## 📁 โครงสร้างโฟลเดอร์ของโปรเจกต์
```
IP-Final-Exam/
├── backend/
│   ├── server.js              # Express.js RESTful API & MySQL Connection
│   ├── package.json           # Backend Dependencies
│   └── .env.example           # Environment Configuration Template
├── frontend/
│   ├── index.html             # Responsive Dashboard & CRUD Interface
│   ├── app.js                 # Chart.js, API Integration & Form Logic
│   └── style.css              # Custom Styling & Animations
├── database/
│   ├── schema.sql             # Table Definitions with NinSom_ Prefix
│   └── seed.sql               # Seed Data (Departments, Employees, Payroll)
├── 1_START_BACKEND.bat        # Double-click script to start Cloud Backend
├── 2_START_FRONTEND.bat       # Double-click script to open Frontend
├── start_cloud_backend.js     # SSH Tunnel & Daemon runner for port 3112
├── push_to_github.js          # Git Commit & Push helper (isomorphic-git)
├── package.json               # Root Dependencies
├── .gitignore                 # Git ignore rules
└── README.md                  # Comprehensive Documentation
```

---
*จัดทำขึ้นสำหรับการสอบปลายภาค วิชา Internet Programming ประจำปีการศึกษา 2026*  
*โดย นายพีรากร นิลแก้ว (รหัสนิสิต: 6730251506)*
