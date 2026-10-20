// ========================================================
// HR Manager & Salary Analytics System - Frontend Application
// Course: Internet Programming (IP) Final Exam 2026
// Student: std6730251506 (Peerakorn Nilkaew)
// API Server: http://119.59.102.161:3112
// Database: ip_std6730251506 (Field Prefix: Peerakorn_Nin_)
// ========================================================

const API_BASE = 'http://119.59.102.161:3112';

let employeesData = [];
let analyticsData = null;
let deptChartInstance = null;
let bracketsChartInstance = null;
let trendsChartInstance = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();
    await checkApiHealth();
    await fetchAnalytics();
    await fetchEmployees();
    await fetchSalaryHistory();
    await fetchDepartments();
    runSalarySimulation();
});

// -------------------------------------------------------------
// API Connection Health Check
// -------------------------------------------------------------
async function checkApiHealth() {
    const badge = document.getElementById('apiStatusBadge');
    const text = document.getElementById('apiStatusText');
    try {
        const res = await fetch(`${API_BASE}/api/health`);
        const data = await res.json();
        if (data.status === 'Healthy') {
            badge.className = 'hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200';
            text.textContent = 'Cloud API: 119.59.102.161:3112 (Connected)';
        }
    } catch (err) {
        badge.className = 'hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200';
        text.textContent = 'Cloud API: Offline / Reconnecting...';
    }
}

// -------------------------------------------------------------
// Tab Switching
// -------------------------------------------------------------
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'border-brand-600', 'text-brand-600');
        btn.classList.add('border-transparent', 'text-slate-500');
    });

    const activeContent = document.getElementById(`tab-${tabId}`);
    const activeBtn = document.getElementById(`tabBtn-${tabId}`);
    if (activeContent) activeContent.classList.remove('hidden');
    if (activeBtn) {
        activeBtn.classList.add('active', 'border-brand-600', 'text-brand-600');
        activeBtn.classList.remove('border-transparent', 'text-slate-500');
    }

    if (tabId === 'analytics') {
        setTimeout(() => {
            if (deptChartInstance) deptChartInstance.resize();
            if (bracketsChartInstance) bracketsChartInstance.resize();
            if (trendsChartInstance) trendsChartInstance.resize();
        }, 100);
    }
    lucide.createIcons();
}

// -------------------------------------------------------------
// Formatters
// -------------------------------------------------------------
function formatCurrency(val) {
    return '฿' + Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}

// -------------------------------------------------------------
// Analytics Data & Charts
// -------------------------------------------------------------
async function fetchAnalytics() {
    try {
        const [overviewRes, deptRes, bracketsRes, trendsRes] = await Promise.all([
            fetch(`${API_BASE}/api/analytics/overview`),
            fetch(`${API_BASE}/api/analytics/by-department`),
            fetch(`${API_BASE}/api/analytics/salary-brackets`),
            fetch(`${API_BASE}/api/analytics/monthly-trends`)
        ]);

        const overview = await overviewRes.json();
        const depts = await deptRes.json();
        const brackets = await bracketsRes.json();
        const trends = await trendsRes.json();

        if (overview.success) {
            const d = overview.data;
            document.getElementById('statTotalEmployees').textContent = d.total_employees;
            document.getElementById('statActiveEmployees').textContent = d.active_employees;
            document.getElementById('statProbationEmployees').textContent = d.probation_employees;
            document.getElementById('statTotalPayroll').textContent = formatCurrency(d.total_net_payroll);
            document.getElementById('statTotalBase').textContent = formatCurrency(d.total_base_payroll);
            document.getElementById('statTotalBonus').textContent = formatCurrency(d.total_bonus);
            document.getElementById('statAvgSalary').textContent = formatCurrency(d.avg_net_salary);
            document.getElementById('statAvgBaseSalary').textContent = formatCurrency(d.avg_base_salary);
            document.getElementById('statTotalTax').textContent = formatCurrency(d.total_tax);
            document.getElementById('statTotalSSF').textContent = formatCurrency(d.total_social_security);
            document.getElementById('insightMax').textContent = formatCurrency(d.max_salary);
            document.getElementById('insightMin').textContent = formatCurrency(d.min_salary);
            document.getElementById('employeeBadgeCount').textContent = d.total_employees;
        }

        if (depts.success) renderDeptChart(depts.data);
        if (brackets.success) renderBracketsChart(brackets.data);
        if (trends.success) renderTrendsChart(trends.data);

    } catch (err) {
        console.error('Fetch Analytics Error:', err);
    }
}

function renderDeptChart(deptData) {
    const ctx = document.getElementById('deptSpendChart').getContext('2d');
    const labels = deptData.map(d => d.department);
    const netSpend = deptData.map(d => parseFloat(d.total_net_salary));
    const budget = deptData.map(d => parseFloat(d.budget) / 12); // monthly budget ceiling

    if (deptChartInstance) deptChartInstance.destroy();

    deptChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'จ่ายเงินเดือนสุทธิ (Monthly Net Payroll)',
                    data: netSpend,
                    backgroundColor: 'rgba(79, 70, 229, 0.85)',
                    borderRadius: 8,
                    borderSkipped: false
                },
                {
                    label: 'งบประมาณเฉลี่ยต่อเดือน (Monthly Budget Limit)',
                    data: budget,
                    backgroundColor: 'rgba(203, 213, 225, 0.6)',
                    borderRadius: 8,
                    borderSkipped: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: val => '฿' + (val / 1000) + 'k',
                        font: { size: 10 }
                    },
                    grid: { color: 'rgba(241, 245, 249, 1)' }
                },
                x: {
                    ticks: { font: { size: 10 } },
                    grid: { display: false }
                }
            }
        }
    });
}

function renderBracketsChart(bracketsData) {
    const ctx = document.getElementById('salaryBracketsChart').getContext('2d');
    const labels = bracketsData.map(b => b.bracket);
    const counts = bracketsData.map(b => b.count);
    const colors = ['#60a5fa', '#34d399', '#f59e0b', '#8b5cf6'];

    if (bracketsChartInstance) bracketsChartInstance.destroy();

    bracketsChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: counts,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            cutout: '68%'
        }
    });

    const legendContainer = document.getElementById('salaryBracketsLegend');
    legendContainer.innerHTML = bracketsData.map((b, idx) => `
        <div class="flex items-center space-x-1.5">
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${colors[idx % colors.length]}"></span>
            <span class="truncate text-slate-600 font-medium">${b.bracket}: <b>${b.count} คน</b></span>
        </div>
    `).join('');
}

function renderTrendsChart(trendsData) {
    const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
    const labels = trendsData.map(t => `รอบ ${t.month}/${t.year}`);
    const netSpend = trendsData.map(t => parseFloat(t.total_net_spend));
    const bonus = trendsData.map(t => parseFloat(t.total_bonus));

    if (trendsChartInstance) trendsChartInstance.destroy();

    trendsChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'ยอดจ่ายสุทธิรวม (Total Net Spend)',
                    data: netSpend,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 5,
                    pointBackgroundColor: '#4f46e5'
                },
                {
                    label: 'โบนัสรวม (Total Bonus)',
                    data: bonus,
                    borderColor: '#10b981',
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.35,
                    pointRadius: 4,
                    pointBackgroundColor: '#10b981'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
                tooltip: {
                    callbacks: {
                        label: ctx => ctx.dataset.label + ': ' + formatCurrency(ctx.raw)
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: val => '฿' + (val / 1000) + 'k' },
                    grid: { color: 'rgba(241, 245, 249, 1)' }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

// -------------------------------------------------------------
// Employees CRUD & Table
// -------------------------------------------------------------
let searchDebounceTimer = null;
function debounceSearch() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
        fetchEmployees();
    }, 300);
}

async function fetchEmployees() {
    const search = document.getElementById('searchInput').value.trim();
    const dept = document.getElementById('filterDepartment').value;
    const status = document.getElementById('filterStatus').value;
    const sortVal = document.getElementById('filterSort').value;

    let [sortBy, order] = sortVal.split('_');

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (dept !== 'All') params.append('department', dept);
    if (status !== 'All') params.append('status', status);
    if (sortBy) params.append('sortBy', sortBy);
    if (order) params.append('order', order);

    try {
        const res = await fetch(`${API_BASE}/api/employees?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
            employeesData = data.data;
            renderEmployeesTable(employeesData);
            document.getElementById('tableShowingCount').textContent = employeesData.length;
        }
    } catch (err) {
        console.error('Fetch Employees Error:', err);
    }
}

function renderEmployeesTable(employees) {
    const tbody = document.getElementById('employeeTableBody');
    if (!employees || employees.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="py-12 text-center text-slate-400">
                    <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
                    ไม่พบข้อมูลพนักงานที่ตรงกับเงื่อนไขการค้นหา
                </td>
            </tr>
        `;
        lucide.createIcons();
        return;
    }

    const deptColors = {
        'Information Technology': 'bg-blue-50 text-blue-700 border-blue-200',
        'Human Resources': 'bg-purple-50 text-purple-700 border-purple-200',
        'Finance & Accounting': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'Marketing & PR': 'bg-rose-50 text-rose-700 border-rose-200',
        'Research & Development': 'bg-indigo-50 text-indigo-700 border-indigo-200',
        'Customer Support': 'bg-amber-50 text-amber-700 border-amber-200'
    };

    const statusBadges = {
        'Active': 'bg-emerald-100 text-emerald-800',
        'Probation': 'bg-amber-100 text-amber-800',
        'On Leave': 'bg-blue-100 text-blue-800',
        'Resigned': 'bg-slate-100 text-slate-600'
    };

    tbody.innerHTML = employees.map(emp => {
        const deptClass = deptColors[emp.Peerakorn_Nin_Department] || 'bg-slate-50 text-slate-700 border-slate-200';
        const statusClass = statusBadges[emp.Peerakorn_Nin_Status] || 'bg-slate-100 text-slate-700';

        return `
            <tr class="hover:bg-slate-50/80 transition-colors group">
                <!-- Employee Info -->
                <td class="py-3 px-4">
                    <div class="flex items-center space-x-3">
                        <img src="${emp.Peerakorn_Nin_Avatar_URL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}" class="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm">
                        <div>
                            <div class="font-bold text-slate-900">${emp.Peerakorn_Nin_First_Name} ${emp.Peerakorn_Nin_Last_Name}</div>
                            <div class="text-[11px] text-slate-400 font-mono">${emp.Peerakorn_Nin_Email}</div>
                        </div>
                    </div>
                </td>

                <!-- Department -->
                <td class="py-3 px-4">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${deptClass}">
                        ${emp.Peerakorn_Nin_Department}
                    </span>
                </td>

                <!-- Position -->
                <td class="py-3 px-4 text-slate-700 font-medium">${emp.Peerakorn_Nin_Position}</td>

                <!-- Base Salary -->
                <td class="py-3 px-4 text-right font-mono font-bold text-slate-800">${formatCurrency(emp.Peerakorn_Nin_Base_Salary)}</td>

                <!-- Bonus -->
                <td class="py-3 px-4 text-right font-mono text-blue-600 font-semibold">+${formatCurrency(emp.Peerakorn_Nin_Bonus)}</td>

                <!-- SSF -->
                <td class="py-3 px-4 text-right font-mono text-purple-600">-${formatCurrency(emp.Peerakorn_Nin_Social_Security)}</td>

                <!-- Tax -->
                <td class="py-3 px-4 text-right font-mono text-amber-600">-${formatCurrency(emp.Peerakorn_Nin_Tax)}</td>

                <!-- Net Salary -->
                <td class="py-3 px-4 text-right font-mono font-extrabold text-emerald-600">${formatCurrency(emp.Peerakorn_Nin_Net_Salary)}</td>

                <!-- Status -->
                <td class="py-3 px-4 text-center">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${statusClass}">
                        ${emp.Peerakorn_Nin_Status}
                    </span>
                </td>

                <!-- Action Buttons -->
                <td class="py-3 px-4 text-center">
                    <div class="flex items-center justify-center space-x-1.5 opacity-90 group-hover:opacity-100">
                        <button onclick="viewEmployeeDetail(${emp.Peerakorn_Nin_ID_Employee})" title="ดูรายละเอียด" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all">
                            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                        </button>
                        <button onclick="openEditModal(${emp.Peerakorn_Nin_ID_Employee})" title="แก้ไขข้อมูล" class="w-7 h-7 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center justify-center transition-all">
                            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                        </button>
                        <button onclick="deleteEmployee(${emp.Peerakorn_Nin_ID_Employee}, '${emp.Peerakorn_Nin_First_Name} ${emp.Peerakorn_Nin_Last_Name}')" title="ลบข้อมูล" class="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center transition-all">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    lucide.createIcons();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterDepartment').value = 'All';
    document.getElementById('filterStatus').value = 'All';
    document.getElementById('filterSort').value = 'id_asc';
    fetchEmployees();
}

// -------------------------------------------------------------
// Modals & Employee Form Operations
// -------------------------------------------------------------
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'เพิ่มพนักงานใหม่ (Add Employee)';
    document.getElementById('formEmployeeId').value = '';
    document.getElementById('employeeForm').reset();
    document.getElementById('formHireDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('formStatus').value = 'Active';
    document.getElementById('formBaseSalary').value = 50000;
    document.getElementById('formBonus').value = 5000;
    updateModalCalculationPreview();

    document.getElementById('employeeModal').classList.remove('hidden');
    lucide.createIcons();
}

function openEditModal(empId) {
    const emp = employeesData.find(e => e.Peerakorn_Nin_ID_Employee === empId);
    if (!emp) return;

    document.getElementById('modalTitle').textContent = `แก้ไขข้อมูลพนักงาน (ID: ${emp.Peerakorn_Nin_ID_Employee})`;
    document.getElementById('formEmployeeId').value = emp.Peerakorn_Nin_ID_Employee;
    document.getElementById('formFirstName').value = emp.Peerakorn_Nin_First_Name;
    document.getElementById('formLastName').value = emp.Peerakorn_Nin_Last_Name;
    document.getElementById('formEmail').value = emp.Peerakorn_Nin_Email;
    document.getElementById('formPhone').value = emp.Peerakorn_Nin_Phone;
    document.getElementById('formDepartment').value = emp.Peerakorn_Nin_Department;
    document.getElementById('formPosition').value = emp.Peerakorn_Nin_Position;
    document.getElementById('formBaseSalary').value = emp.Peerakorn_Nin_Base_Salary;
    document.getElementById('formBonus').value = emp.Peerakorn_Nin_Bonus;
    document.getElementById('formHireDate').value = emp.Peerakorn_Nin_Hire_Date.split('T')[0];
    document.getElementById('formStatus').value = emp.Peerakorn_Nin_Status;
    document.getElementById('formAvatar').value = emp.Peerakorn_Nin_Avatar_URL || '';

    updateModalCalculationPreview();
    document.getElementById('employeeModal').classList.remove('hidden');
    lucide.createIcons();
}

function closeModal() {
    document.getElementById('employeeModal').classList.add('hidden');
}

// Live calculation preview in modal
function updateModalCalculationPreview() {
    const base = parseFloat(document.getElementById('formBaseSalary').value) || 0;
    const bonus = parseFloat(document.getElementById('formBonus').value) || 0;

    // Call local tax formula or calculate on fly
    const ssf = Math.min(Math.max(base, 1650), 15000) * 0.05;
    const totalIncome = base + bonus;
    const annual = totalIncome * 12;
    const expense = Math.min(annual * 0.5, 100000);
    const personal = 60000;
    const annualSSF = ssf * 12;
    const taxable = Math.max(0, annual - expense - personal - annualSSF);

    let annualTax = 0;
    if (taxable > 5000000) annualTax += (taxable - 5000000) * 0.35 + 1265000;
    else if (taxable > 2000000) annualTax += (taxable - 2000000) * 0.30 + 365000;
    else if (taxable > 1000000) annualTax += (taxable - 1000000) * 0.25 + 115000;
    else if (taxable > 750000) annualTax += (taxable - 750000) * 0.20 + 65000;
    else if (taxable > 500000) annualTax += (taxable - 500000) * 0.15 + 27500;
    else if (taxable > 300000) annualTax += (taxable - 300000) * 0.10 + 7500;
    else if (taxable > 150000) annualTax += (taxable - 150000) * 0.05;

    const monthlyTax = Math.round((annualTax / 12) * 100) / 100;
    const net = Math.round((totalIncome - ssf - monthlyTax) * 100) / 100;

    document.getElementById('previewSSF').textContent = formatCurrency(ssf);
    document.getElementById('previewTax').textContent = formatCurrency(monthlyTax);
    document.getElementById('previewNet').textContent = formatCurrency(net);
}

async function handleEmployeeSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('formEmployeeId').value;
    const isEdit = !!id;

    const payload = {
        Peerakorn_Nin_First_Name: document.getElementById('formFirstName').value.trim(),
        Peerakorn_Nin_Last_Name: document.getElementById('formLastName').value.trim(),
        Peerakorn_Nin_Email: document.getElementById('formEmail').value.trim(),
        Peerakorn_Nin_Phone: document.getElementById('formPhone').value.trim(),
        Peerakorn_Nin_Department: document.getElementById('formDepartment').value,
        Peerakorn_Nin_Position: document.getElementById('formPosition').value.trim(),
        Peerakorn_Nin_Base_Salary: parseFloat(document.getElementById('formBaseSalary').value) || 0,
        Peerakorn_Nin_Bonus: parseFloat(document.getElementById('formBonus').value) || 0,
        Peerakorn_Nin_Hire_Date: document.getElementById('formHireDate').value,
        Peerakorn_Nin_Status: document.getElementById('formStatus').value,
        Peerakorn_Nin_Avatar_URL: document.getElementById('formAvatar').value.trim() || undefined
    };

    try {
        const url = isEdit ? `${API_BASE}/api/employees/${id}` : `${API_BASE}/api/employees`;
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.success) {
            closeModal();
            await fetchEmployees();
            await fetchAnalytics();
            alert(isEdit ? '✅ อัปเดตข้อมูลพนักงานสำเร็จ!' : '✅ เพิ่มพนักงานใหม่ลง Cloud Database สำเร็จ!');
        } else {
            alert('❌ เกิดข้อผิดพลาด: ' + (data.message || data.error));
        }
    } catch (err) {
        alert('❌ Network Error: ' + err.message);
    }
}

async function deleteEmployee(id, name) {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลพนักงาน "${name}" (ID: ${id})?\nการดำเนินการนี้จะลบข้อมูลออกจากฐานข้อมูล Peerakorn_Nin_Employees จริง`)) {
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/employees/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            await fetchEmployees();
            await fetchAnalytics();
            alert('✅ ลบข้อมูลพนักงานเรียบร้อย');
        } else {
            alert('❌ ลบไม่สำเร็จ: ' + (data.message || data.error));
        }
    } catch (err) {
        alert('❌ Error: ' + err.message);
    }
}

async function viewEmployeeDetail(id) {
    try {
        const res = await fetch(`${API_BASE}/api/employees/${id}`);
        const data = await res.json();
        if (data.success) {
            const e = data.employee;
            document.getElementById('detailAvatar').src = e.Peerakorn_Nin_Avatar_URL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150';
            document.getElementById('detailName').textContent = `${e.Peerakorn_Nin_First_Name} ${e.Peerakorn_Nin_Last_Name}`;
            document.getElementById('detailPosition').textContent = e.Peerakorn_Nin_Position;
            document.getElementById('detailDept').textContent = e.Peerakorn_Nin_Department;
            document.getElementById('detailStatus').textContent = e.Peerakorn_Nin_Status;
            document.getElementById('detailStatus').className = `px-2 py-0.5 rounded text-[10px] font-bold ${e.Peerakorn_Nin_Status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'}`;

            document.getElementById('detailEmail').textContent = e.Peerakorn_Nin_Email;
            document.getElementById('detailPhone').textContent = e.Peerakorn_Nin_Phone;
            document.getElementById('detailHireDate').textContent = formatDate(e.Peerakorn_Nin_Hire_Date);
            document.getElementById('detailEmpId').textContent = '#' + e.Peerakorn_Nin_ID_Employee;

            document.getElementById('detailBaseSalary').textContent = formatCurrency(e.Peerakorn_Nin_Base_Salary);
            document.getElementById('detailBonus').textContent = '+' + formatCurrency(e.Peerakorn_Nin_Bonus);
            document.getElementById('detailSSF').textContent = '-' + formatCurrency(e.Peerakorn_Nin_Social_Security);
            document.getElementById('detailTax').textContent = '-' + formatCurrency(e.Peerakorn_Nin_Tax);
            document.getElementById('detailNetSalary').textContent = formatCurrency(e.Peerakorn_Nin_Net_Salary);

            document.getElementById('detailModal').classList.remove('hidden');
            lucide.createIcons();
        }
    } catch (err) {
        alert('Cannot load employee detail: ' + err.message);
    }
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

// -------------------------------------------------------------
// Payroll Simulator (Tab 3)
// -------------------------------------------------------------
function runSalarySimulation() {
    const base = parseFloat(document.getElementById('calcBaseSalary').value) || 0;
    const bonus = parseFloat(document.getElementById('calcBonus').value) || 0;
    const ot = parseFloat(document.getElementById('calcOT').value) || 0;
    const ded = parseFloat(document.getElementById('calcDeduction').value) || 0;

    const totalGross = base + bonus + ot;
    const ssf = Math.min(Math.max(base, 1650), 15000) * 0.05;

    const annual = totalGross * 12;
    const expense = Math.min(annual * 0.5, 100000);
    const personal = 60000;
    const annualSSF = ssf * 12;
    const taxable = Math.max(0, annual - expense - personal - annualSSF);

    let annualTax = 0;
    if (taxable > 5000000) annualTax += (taxable - 5000000) * 0.35 + 1265000;
    else if (taxable > 2000000) annualTax += (taxable - 2000000) * 0.30 + 365000;
    else if (taxable > 1000000) annualTax += (taxable - 1000000) * 0.25 + 115000;
    else if (taxable > 750000) annualTax += (taxable - 750000) * 0.20 + 65000;
    else if (taxable > 500000) annualTax += (taxable - 500000) * 0.15 + 27500;
    else if (taxable > 300000) annualTax += (taxable - 300000) * 0.10 + 7500;
    else if (taxable > 150000) annualTax += (taxable - 150000) * 0.05;

    const monthlyTax = Math.round((annualTax / 12) * 100) / 100;
    const totalDeductions = ssf + monthlyTax + ded;
    const net = Math.round((totalGross - totalDeductions) * 100) / 100;

    document.getElementById('calcResultGross').textContent = formatCurrency(totalGross);
    document.getElementById('calcResultSSF').textContent = '-' + formatCurrency(ssf);
    document.getElementById('calcResultTax').textContent = '-' + formatCurrency(monthlyTax);
    document.getElementById('calcResultTotalDed').textContent = '-' + formatCurrency(totalDeductions);
    document.getElementById('calcResultNet').textContent = formatCurrency(net);
}

async function fetchSalaryHistory() {
    try {
        const res = await fetch(`${API_BASE}/api/salary-records`);
        const data = await res.json();
        if (data.success) {
            const tbody = document.getElementById('salaryHistoryBody');
            tbody.innerHTML = data.data.map(r => `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="py-2.5 px-4 font-mono font-semibold text-slate-700">${r.Peerakorn_Nin_Month}/${r.Peerakorn_Nin_Year}</td>
                    <td class="py-2.5 px-4 font-bold text-slate-900">${r.Peerakorn_Nin_First_Name} ${r.Peerakorn_Nin_Last_Name}</td>
                    <td class="py-2.5 px-4 text-slate-500">${r.Peerakorn_Nin_Department}</td>
                    <td class="py-2.5 px-4 text-right font-mono">${formatCurrency(r.Peerakorn_Nin_Base_Salary)}</td>
                    <td class="py-2.5 px-4 text-right font-mono text-blue-600">+${formatCurrency(r.Peerakorn_Nin_Bonus)}</td>
                    <td class="py-2.5 px-4 text-right font-mono text-emerald-600">+${formatCurrency(r.Peerakorn_Nin_Overtime)}</td>
                    <td class="py-2.5 px-4 text-right font-mono text-amber-600">-${formatCurrency(r.Peerakorn_Nin_Tax)}</td>
                    <td class="py-2.5 px-4 text-right font-mono text-purple-600">-${formatCurrency(r.Peerakorn_Nin_Social_Security)}</td>
                    <td class="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">${formatCurrency(r.Peerakorn_Nin_Net_Salary)}</td>
                    <td class="py-2.5 px-4 text-center">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            ${r.Peerakorn_Nin_Payment_Status}
                        </span>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error('Fetch Salary History Error:', err);
    }
}

// -------------------------------------------------------------
// Departments & Budget Utilization (Tab 4)
// -------------------------------------------------------------
async function fetchDepartments() {
    try {
        const res = await fetch(`${API_BASE}/api/analytics/by-department`);
        const data = await res.json();
        if (data.success) {
            const grid = document.getElementById('departmentsGrid');
            grid.innerHTML = data.data.map(d => {
                const annualSpend = parseFloat(d.total_net_salary) * 12;
                const budget = parseFloat(d.budget);
                const percent = Math.min(Math.round((annualSpend / budget) * 100), 100) || 0;
                const color = percent > 85 ? 'bg-rose-500' : percent > 60 ? 'bg-amber-500' : 'bg-emerald-500';

                return `
                    <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 hover:border-brand-300 transition-all">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="font-bold text-slate-900 text-sm">${d.department}</h4>
                                <p class="text-xs text-slate-500 mt-0.5">${d.employee_count} พนักงาน (Headcount)</p>
                            </div>
                            <span class="text-xs px-2 py-0.5 rounded font-bold ${percent > 85 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}">
                                ${percent}% งบที่ใช้
                            </span>
                        </div>

                        <div class="space-y-1.5 text-xs">
                            <div class="flex justify-between text-slate-600">
                                <span>งบประมาณประจำปี:</span>
                                <span class="font-mono font-bold text-slate-800">${formatCurrency(d.budget)}</span>
                            </div>
                            <div class="flex justify-between text-slate-600">
                                <span>จ่ายเงินเดือนสุทธิต่อเดือน:</span>
                                <span class="font-mono font-bold text-indigo-600">${formatCurrency(d.total_net_salary)}</span>
                            </div>
                            <div class="flex justify-between text-slate-600">
                                <span>เงินเดือนเฉลี่ย:</span>
                                <span class="font-mono text-slate-700">${formatCurrency(d.avg_salary)}</span>
                            </div>
                        </div>

                        <!-- Progress Bar -->
                        <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div class="${color} h-full rounded-full transition-all duration-500" style="width: ${percent}%"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (err) {
        console.error('Fetch Departments Error:', err);
    }
}
