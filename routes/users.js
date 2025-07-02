const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Get all readers
router.get('/readers', async (req, res) => {
  try {
    const readers = await User.find({ role: 'reader', isActive: true })
      .select('profile readerSettings createdAt')
      .lean();

    const formattedReaders = readers.map(reader => ({
      id: reader._id,
      name: reader.profile.name || 'Anonymous Reader',
      avatar: reader.profile.avatar,
      bio: reader.profile.bio,
      specialties: reader.profile.specialties || [],
      rating: reader.profile.rating || 0,
      totalReviews: reader.profile.totalReviews || 0,
      isOnline: reader.readerSettings.isOnline || false,
      rates: reader.readerSettings.rates
    }));

    res.json(formattedReaders);
  } catch (error) {
    console.error('Get readers error:', error);
    res.status(500).json({ message: 'Server error fetching readers' });
  }
});

module.exports = router;