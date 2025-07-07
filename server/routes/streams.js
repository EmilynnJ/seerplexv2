const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const User = require('../models/User');

router.get('/live', async (req, res) => {
  try {
    // Find active sessions that are either video or audio calls
    const liveSessions = await Session.find({
      status: 'active',
      sessionType: { $in: ['video', 'audio'] }
    })
    .populate({
      path: 'readerId',
      select: 'profile.name profile.avatar profile.specialties profile.rating readerSettings.isOnline readerSettings.rates',
      match: { role: 'reader' } // Ensure the populated user is a reader
    })
    .lean(); // Return plain JavaScript objects

    // Filter out sessions where readerId population failed or reader is not found
    const filteredLiveStreams = liveSessions.filter(session => session.readerId);

    // Format the output to match the expected frontend structure
    const formattedStreams = filteredLiveStreams.map(session => ({
      id: session._id, // Use session ID as stream ID
      title: `Live ${session.sessionType} with ${session.readerId.profile.name}`, // Dynamic title
      viewerCount: Math.floor(Math.random() * 200) + 10, // Dummy viewer count for now
      reader: {
        id: session.readerId._id,
        name: session.readerId.profile.name,
        avatar: session.readerId.profile.avatar,
        specialties: session.readerId.profile.specialties,
        rating: session.readerId.profile.rating,
        isOnline: session.readerId.readerSettings.isOnline,
        rates: session.readerId.readerSettings.rates
      },
      sessionType: session.sessionType,
      startTime: session.startTime
    }));

    res.json(formattedStreams);
  } catch (error) {
    console.error('Error fetching live streams:', error);
    res.status(500).json({ message: 'Server error while fetching live streams' });
  }
});

module.exports = router;
