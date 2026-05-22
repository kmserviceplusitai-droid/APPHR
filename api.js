const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jwt-simple');

module.exports = function(db, SECRET_KEY, sendLineNotification) {
    const router = express.Router();

    // Middleware ตรวจสอบ Token
    async function checkAuth(req, res, next) {
        const token = req.headers['authorization'];
        if (!token) return res.status(401).json({ message: 'No token provided' });
        try {
            const decoded = jwt.decode(token, SECRET_KEY);
            req.user = decoded;
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    }

    // 1. Login
    router.post('/login', async (req, res) => {
        const { username, password } = req.body;
        try {
            const [rows] = await db.query('SELECT * FROM employees WHERE username = ?', [username]);
            if (rows.length === 0) return res.status(400).json({ message: 'ไม่พบผู้ใช้งานนี้' });

            const user = rows[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: 'รหัสผ่านไม่ถูกต้อง' });

            const token = jwt.encode({ id: user.id, role: user.role, fullname: user.fullname }, SECRET_KEY);
            res.json({ token, role: user.role, fullname: user.fullname });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 2. ดำเนินการ ลงเวลาเข้า-ออกงาน
    router.post('/attendance', checkAuth, async (req, res) => {
        const { type } = req.body; // 'in' หรือ 'out'
        const today = new Date().toISOString().slice(0, 10);
        const timeNow = new Date().toTimeString().slice(0, 8);

        try {
            if (type === 'in') {
                let status = 'ปกติ';
                if (timeNow > '09:00:00') status = 'สาย';

                await db.query(
                    'INSERT INTO attendance (employee_id, work_date, check_in, status) VALUES (?, ?, ?, ?)',
                    [req.user.id, today, timeNow, status]
                );
                
                // ส่งแจ้งเตือน LINE
                const [admin] = await db.query("SELECT line_token FROM employees WHERE role='admin' LIMIT 1");
                if(admin[0]?.line_token) {
                    sendLineNotification(admin[0].line_token, `\n📢 ลงเวลาเข้างาน\nพนักงาน: ${req.user.fullname}\nเวลา: ${timeNow}\nสถานะ: ${status}`);
                }

                return res.json({ message: `บันทึกเข้างานสำเร็จ (${status})` });
            } else {
                await db.query(
                    'UPDATE attendance SET check_out = ? WHERE employee_id = ? AND work_date = ?',
                    [timeNow, req.user.id, today]
                );
                return res.json({ message: 'บันทึกออกงานสำเร็จ' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 3. ส่งคำขอลางาน
    router.post('/leave', checkAuth, async (req, res) => {
        const { leave_type, start_date, end_date, reason } = req.body;
        try {
            await db.query(
                'INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)',
                [req.user.id, leave_type, start_date, end_date, reason]
            );

            // แจ้งเตือนแอดมินทาง LINE
            const [admin] = await db.query("SELECT line_token FROM employees WHERE role='admin' LIMIT 1");
            if(admin[0]?.line_token) {
                sendLineNotification(admin[0].line_token, `\n📝 มีคำขอลาใหม่\nจาก: ${req.user.fullname}\nประเภท: ${leave_type}\nเหตุผล: ${reason}`);
            }

            res.json({ message: 'ส่งคำขอลางานแล้ว รออนุมัติ' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 4. ดูข้อมูล Dashboard & รายชื่อพนักงาน (สำหรับ Admin)
    router.get('/admin/dashboard', checkAuth, async (req, res) => {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'ปฏิเสธการเข้าถึง' });
        try {
            const [empCount] = await db.query('SELECT COUNT(*) as total FROM employees WHERE role="employee"');
            const [leaveCount] = await db.query('SELECT COUNT(*) as total FROM leave_requests WHERE status="รออนุมัติ"');
            const [employees] = await db.query('SELECT id, username, fullname, role, salary, line_token FROM employees');
            const [leaves] = await db.query('SELECT l.*, e.fullname FROM leave_requests l JOIN employees e ON l.employee_id = e.id');

            res.json({
                totalEmployees: empCount[0].total,
                pendingLeaves: leaveCount[0].total,
                employees,
                leaves
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 5. อนุมัติการลา
    router.post('/admin/leave-action', checkAuth, async (req, res) => {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'ปฏิเสธการเข้าถึง' });
        const { leave_id, status } = req.body;
        try {
            await db.query('UPDATE leave_requests SET status = ? WHERE id = ?', [status, leave_id]);
            res.json({ message: 'ดำเนินการสำเร็จ' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // 6. บันทึก LINE Token ของ Admin
    router.post('/admin/save-token', checkAuth, async (req, res) => {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'ปฏิเสธการเข้าถึง' });
        const { token } = req.body;
        try {
            await db.query('UPDATE employees SET line_token = ? WHERE id = ?', [token, req.user.id]);
            res.json({ message: 'บันทึก LINE Token สำเร็จ' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};