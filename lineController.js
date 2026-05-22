const { MessagingApiClient } = require('@line/bot-sdk').messagingApi;

const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new MessagingApiClient(config);

exports.sendWarning = async (req, res) => {
    const { userId, message } = req.body;
    try {
        await client.pushMessage({
            to: userId,
            messages: [{ type: 'text', text: message }]
        });
        res.json({ success: true, status: 'Warning sent' });
    } catch (err) {
        console.error('LINE API Error:', err);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

exports.sendPayroll = async (req, res) => {
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
        console.error('LINE API Error:', err);
        res.status(500).json({ error: err.message });
    }
};