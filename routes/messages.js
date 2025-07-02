const express = require('express');

const router = express.Router();

// Basic message routes
router.get('/conversations', (req, res) => {
  res.json({ conversations: [] });
});

module.exports = router;