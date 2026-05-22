const API_URL = 'http://localhost:3000/api';

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('fullname', data.fullname);
            setupUI();
        } else {
            alert(data.message);
        }
    });
}

function setupUI() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const fullname = localStorage.getItem('fullname');

    if (!token) return;

    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    document.getElementById('user-display-name').innerText = fullname;
    document.getElementById('user-role').innerText = role === 'admin' ? 'ผู้ดูแลระบบ' : 'พนักงานทั่วไป';

    if (role === 'admin') {
        document.getElementById('admin-menu').classList.remove('hidden');
        loadAdminDashboard();
    } else {
        document.getElementById('admin-menu').classList.add('hidden');
    }
}

function markAttendance(type) {
    fetch(`${API_URL}/attendance`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({ type })
    })
    .then(res => res.json())
    .then(data => alert(data.message));
}

function submitLeave() {
    const leave_type = document.getElementById('leave-type').value;
    const start_date = document.getElementById('leave-start').value;
    const end_date = document.getElementById('leave-end').value;
    const reason = document.getElementById('leave-reason').value;

    fetch(`${API_URL}/leave`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({ leave_type, start_date, end_date, reason })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if(localStorage.getItem('role') === 'admin') loadAdminDashboard();
    });
}

function loadAdminDashboard() {
    fetch(`${API_URL}/admin/dashboard`, {
        headers: { 'Authorization': localStorage.getItem('token') }
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('dash-emp-count').innerText = data.totalEmployees;
        document.getElementById('dash-leave-count').innerText = data.pendingLeaves;

        // ตารางพนักงาน & เงินเดือน
        const empBody = document.querySelector('#employee-table tbody');
        empBody.innerHTML = '';
        data.employees.forEach(emp => {
            empBody.innerHTML += `<tr><td>${emp.fullname}</td><td>${emp.role}</td><td>${Number(emp.salary).toLocaleString()}</td></tr>`;
            if(emp.role === 'admin' && emp.line_token) {
                document.getElementById('line-token').value = emp.line_token;
            }
        });

        // ตารางอนุมัติการลา
        const leaveBody = document.querySelector('#leave-table tbody');
        leaveBody.innerHTML = '';
        data.leaves.forEach(lvl => {
            let actionBtn = lvl.status === 'รออนุมัติ' ? 
                `<button class="btn-success" onclick="actionLeave(${lvl.id}, 'อนุมัติ')">อนุมัติ</button> 
                 <button class="btn-danger" onclick="actionLeave(${lvl.id}, 'ไม่อนุมัติ')">ปฏิเสธ</button>` : lvl.status;
            
            leaveBody.innerHTML += `<tr><td>${lvl.fullname}</td><td>${lvl.leave_type}</td><td>${lvl.reason}</td><td>${lvl.status}</td><td>${actionBtn}</td></tr>`;
        });
    });
}

function actionLeave(leave_id, status) {
    fetch(`${API_URL}/admin/leave-action`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({ leave_id, status })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        loadAdminDashboard();
    });
}

function saveLineToken() {
    const token = document.getElementById('line-token').value;
    fetch(`${API_URL}/admin/save-token`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({ token })
    })
    .then(res => res.json())
    .then(data => alert(data.message));
}

function logout() {
    localStorage.clear();
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('main-app').classList.add('hidden');
}

// โหลดข้อมูลอัตโนมัติหากเคยเข้าระบบไว้แล้ว
window.onload = setupUI;