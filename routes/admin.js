const express = require('express');

const router = express.Router();

// Basic admin routes
router.get('/stats', (req, res) => {
  res.json({ stats: {} });
});

module.exports = router;