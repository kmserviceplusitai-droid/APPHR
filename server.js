const express = require('express');
const cors = require('cors');
require('dotenv').config();

const lineRoutes = require('./lineRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get('/', (req, res) => {
  res.send('APPHR Backend Running');
});

// API Routes
app.use('/api/line', lineRoutes);

// สำหรับ Vercel
module.exports = app;

// สำหรับ local run
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}