const express = require('express');
const router = express.Router();

// test api
router.get('/', (req, res) => {
  res.json({
    status: 'LINE API working'
  });
});

module.exports = router;