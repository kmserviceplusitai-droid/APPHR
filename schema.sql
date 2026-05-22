-- Database Schema for KM Service Plus
// ... (Content follows schema.sql context)

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dept VARCHAR(100),
    role VARCHAR(50) DEFAULT 'employee',
    line_user_id VARCHAR(100),
    salary DECIMAL(10, 2)
);

CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    type VARCHAR(20) NOT NULL, -- 'เข้างาน', 'ออกงาน'
    location VARCHAR(100),
    coordinates VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    face_scan_verified BOOLEAN DEFAULT TRUE
);

CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    type VARCHAR(50),
    start_date DATE,
    end_date DATE,
    reason TEXT,
    status VARCHAR(20) DEFAULT '⏳ รออนุมัติ'
);