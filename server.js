const express = require('express');
const line = require('@line/bot-sdk');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- การตั้งค่า LINE Messaging API ---
// นำ Token จาก LINE Developers Console มาใส่ที่นี่
const config = {
  channelAccessToken: 'vX6EeJA8+f33abIOjJ/YycLUmoCf2Wbb90K25I4q37obHKltGwycWPWIuzwJGxmuxqCd7WdOQ39uFgUhVT1Zxo/hgkVfRGjM3H+VPPW5GlM939FS1oGmhLaeDc7hZecxIPIeS+w1c8wOZqiUuwnhPwdB04t89/1O/w1cDnyilFU=',
  channelSecret: '0688a442750e50f380064560d968b696' // ใส่ Secret ของคุณ (ถ้ามี)
};

// ใช้ MessagingApiClient ให้ถูกต้องตาม version
const { MessagingApiClient } = require('@line/bot-sdk').messagingApi;
const client = new MessagingApiClient(config);

// Endpoint สำหรับส่ง "ใบเตือน"
app.post('/api/line/send-warning', async (req, res) => {
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
app.post('/api/line/send-payroll', async (req, res) => {
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