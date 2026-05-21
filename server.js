const express = require('express');
const line = require('@line/bot-sdk');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- การตั้งค่า LINE Messaging API ---
// นำ Token จาก LINE Developers Console มาใส่ที่นี่
const config = {
  channelAccessToken: 'YOUR_CHANNEL_ACCESS_TOKEN',
  channelSecret: 'YOUR_CHANNEL_SECRET'
};

const client = new line.MessagingApiClient(config);

// Endpoint สำหรับส่ง "ใบเตือน"
app.post('/api/send-line', async (req, res) => {
  const { userId, message } = req.body;
  
  try {
    await client.pushMessage({
      to: userId,
      messages: [{ type: 'text', text: message }]
    });
    res.json({ success: true, status: 'Sent' });
  } catch (err) {
    console.error('LINE API Error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Endpoint สำหรับส่ง "สลิปเงินเดือน" (Flex Message)
app.post('/api/send-payroll', async (req, res) => {
  const { userId, employeeName, amount } = req.body;

  const flexMessage = {
    type: 'flex',
    altText: `สลิปเงินเดือนของคุณ ${employeeName}`,
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: 'สลิปเงินเดือน', weight: 'bold', size: 'xl' },
          { type: 'text', text: `ชื่อ: ${employeeName}`, margin: 'md' },
          { type: 'separator', margin: 'lg' },
          { type: 'text', text: `ยอดสุทธิ: ฿${amount}`, weight: 'bold', size: 'lg', color: '#00b900', margin: 'md' }
        ]
      }
    }
  };

  try {
    await client.pushMessage({ to: userId, messages: [flexMessage] });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`HR Backend Server is running on http://localhost:${PORT}`));