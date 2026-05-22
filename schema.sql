CREATE DATABASE IF NOT EXISTS company_db;
USE company_db;

-- 1. ตารางพนักงาน
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(100) NOT NULL,
    role ENUM('employee', 'admin') DEFAULT 'employee',
    salary DECIMAL(10, 2) DEFAULT 0.00,
    line_token VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตารางลงเวลาเข้า-ออกงาน
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    work_date DATE NOT NULL,
    check_in TIME DEFAULT NULL,
    check_out TIME DEFAULT NULL,
    status ENUM('ปกติ', 'สาย', 'ขาดงาน') DEFAULT 'ปกติ',
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- 3. ตารางการลางาน
CREATE TABLE leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    leave_type ENUM('ลาป่วย', 'ลากิจ', 'ลาพักร้อน') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status ENUM('รออนุมัติ', 'อนุมัติ', 'ไม่อนุมัติ') DEFAULT 'รออนุมัติ',
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- เพิ่มข้อมูล Admin เริ่มต้นสำหรับใช้ Login (Password: admin1234)
INSERT INTO employees (username, password, fullname, role, salary) 
VALUES ('admin', '$2b$10$X8M9FvHkP6Z8Q7CjG8y6uO2k6e5M4E2F6G7H8I9J0K1L2M3N4O5P6', 'ผู้ดูแลระบบ', 'admin', 50000);