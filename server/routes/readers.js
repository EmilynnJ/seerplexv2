const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/readers', async (req, res) => {
  try {
    const { limit, isOnline } = req.query;
    const query = { role: 'reader', isActive: true };

    if (isOnline === 'true') {
      query['readerSettings.isOnline'] = true;
    }

    let readers = await User.find(query)
      .select('profile.name profile.avatar profile.specialties profile.rating readerSettings.isOnline readerSettings.rates')
      .limit(parseInt(limit) || 0) // Apply limit if provided, otherwise no limit
      .lean(); // Return plain JavaScript objects

    // Format the output to match the expected frontend structure
    readers = readers.map(reader => ({
      id: reader._id,
      name: reader.profile.name,
      avatar: reader.profile.avatar,
      specialties: reader.profile.specialties,
      rating: reader.profile.rating,
      isOnline: reader.readerSettings.isOnline,
      rates: reader.readerSettings.rates
    }));

    res.json(readers);
  } catch (error) {
    console.error('Error fetching readers:', error);
    res.status(500).json({ message: 'Server error while fetching readers' });
  }
});

module.exports = router;
