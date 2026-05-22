const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jwt-simple');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // เสิร์ฟไฟล์หน้าเว็บ (index.html, styles.css ฯลฯ)

const SECRET_KEY = process.env.JWT_SECRET || 'MY_SUPER_SECRET_KEY';

// เชื่อมต่อ Database
const dbPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'company_db'
});

// ฟังก์ชันส่งการแจ้งเตือนเข้า LINE Notify
async function sendLineNotification(token, message) {
    if (!token) return;
    try {
        await axios.post('https://notify-api.line.me/api/notify', 
            `message=${encodeURIComponent(message)}`, 
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${token}`
                }
            }
        );
    } catch (error) {
        console.error('LINE Notify Error:', error.message);
    }
}

// === รวม API ROUTES ===
const apiRoutes = require('./api')(dbPool, SECRET_KEY, sendLineNotification);
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});