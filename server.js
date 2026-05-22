const express = require('express');
const cors = require('cors');
require('dotenv').config();
const lineRoutes = require('./routes/lineRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/line', lineRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HR Backend Server is running on http://localhost:${PORT}`));