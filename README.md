# KM Service Plus — HR Webapp

ระบบบริหารจัดการพนักงานครบวงจร (HR Management System) พัฒนาด้วย Node.js, Express และ LINE Messaging API

## 🚀 การติดตั้งและเริ่มใช้งาน

1. **Clone Repository**
2. **ติดตั้ง Library:**
   ```bash
   npm install
   ```
3. **ตั้งค่า LINE API:** สร้างไฟล์ `.env` และใส่ค่า `LINE_CHANNEL_ACCESS_TOKEN` และ `LINE_CHANNEL_SECRET`
4. **รันเซิร์ฟเวอร์:**
   ```bash
   npm start
   ```

## 📁 โครงสร้างโฟลเดอร์
- `frontend/`: ไฟล์ HTML, CSS, JS
- `backend/`: API Routes และ Controllers
- `database/`: SQL Schema สำหรับฐานข้อมูล

## 🛠️ เทคโนโลยีที่ใช้
- Frontend: HTML, Tailwind CSS, JS (Chart.js)
- Backend: Node.js (Express), LINE Messaging API