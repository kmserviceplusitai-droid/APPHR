const express = require('express');
const cors = require('cors');
require('dotenv').config();

const lineRoutes = require('./lineRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// หน้าแรก
app.get('/', (req, res) => {
  res.send('APPHR Backend Running');
});

// API Routes
app.use('/api/line', lineRoutes);

// export ให้ vercel ใช้
module.exports = app;

// รัน local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}