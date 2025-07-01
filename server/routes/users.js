const express = require('express');
const User = require('../models/User');
const Session = require('../models/Session');
const Transaction = require('../models/Transaction');
const { authMiddleware, requireReader, requireReaderOrAdmin, optionalAuth } = require('../middleware/auth');
const { validateProfileUpdate, validateReaderRates } = require('../middleware/validation');

const router = express.Router();

// Get all readers (public endpoint with optional auth for favorites)
router.get('/readers', optionalAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      specialty, 
      minRating, 
      maxRate, 
      isOnline,
      sortBy = 'rating' 
    } = req.query;

    // Build query
    const query = { 
      role: 'reader', 
      isActive: true 
    };

    if (specialty) {
      query['profile.specialties'] = { $in: [specialty] };
    }

    if (minRating) {
      query['profile.rating'] = { $gte: parseFloat(minRating) };
    }

    if (isOnline === 'true') {
      query['readerSettings.isOnline'] = true;
    }

    if (maxRate) {
      query['readerSettings.rates.video'] = { $lte: parseFloat(maxRate) };
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'rating':
        sort = { 'profile.rating': -1, 'profile.totalReviews': -1 };
        break;
      case 'price_low':
        sort = { 'readerSettings.rates.video': 1 };
        break;
      case 'price_high':
        sort = { 'readerSettings.rates.video': -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'online':
        sort = { 'readerSettings.isOnline': -1, 'profile.rating': -1 };
        break;
      default:
        sort = { 'profile.rating': -1 };
    }

    const readers = await User.find(query)
      .select('profile readerSettings createdAt')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await User.countDocuments(query);

    // Format reader data for public consumption
    const formattedReaders = readers.map(reader => ({
      id: reader._id,
      name: reader.profile.name || 'Anonymous Reader',
      avatar: reader.profile.avatar,
      bio: reader.profile.bio,
      specialties: reader.profile.specialties || [],
      rating: reader.profile.rating || 0,
      totalReviews: reader.profile.totalReviews || 0,
      isOnline: reader.readerSettings.isOnline || false,
      rates: reader.readerSettings.rates,
      memberSince: reader.createdAt
    }));

    res.json({
      success: true,
      readers: formattedReaders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalReaders: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get readers error:', error);
    res.status(500).json({ 
      message: 'Server error fetching readers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get specific reader profile
router.get('/readers/:readerId', optionalAuth, async (req, res) => {
  try {
    const { readerId } = req.params;

    const reader = await User.findOne({
      _id: readerId,
      role: 'reader',
      isActive: true
    }).select('profile readerSettings createdAt');

    if (!reader) {
      return res.status(404).json({ message: 'Reader not found' });
    }

    // Get recent reviews (you might want to create a Review model)
    const recentSessions = await Session.find({
      readerId,
      status: 'ended',
      rating: { $exists: true },
      review: { $exists: true, $ne: '' }
    })
    .populate('clientId', 'profile.name')
    .select('rating review createdAt clientId')
    .sort({ createdAt: -1 })
    .limit(5);

    const readerProfile = {
      id: reader._id,
      name: reader.profile.name || 'Anonymous Reader',
      avatar: reader.profile.avatar,
      bio: reader.profile.bio,
      specialties: reader.profile.specialties || [],
      rating: reader.profile.rating || 0,
      totalReviews: reader.profile.totalReviews || 0,
      isOnline: reader.readerSettings.isOnline || false,
      rates: reader.readerSettings.rates,
      memberSince: reader.createdAt,
      recentReviews: recentSessions.map(session => ({
        rating: session.rating,
        review: session.review,
        clientName: session.clientId?.profile?.name || 'Anonymous',
        date: session.createdAt
      }))
    };

    res.json({
      success: true,
      reader: readerProfile
    });

  } catch (error) {
    console.error('Get reader profile error:', error);
    res.status(500).json({ 
      message: 'Server error fetching reader profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user profile
router.patch('/profile', authMiddleware, validateProfileUpdate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;

    // Build update object
    const updateObj = {};
    
    if (updates.name !== undefined) {
      updateObj['profile.name'] = updates.name;
    }
    
    if (updates.bio !== undefined) {
      updateObj['profile.bio'] = updates.bio;
    }
    
    if (updates.specialties !== undefined) {
      updateObj['profile.specialties'] = updates.specialties;
    }

    if (updates.avatar !== undefined) {
      updateObj['profile.avatar'] = updates.avatar;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateObj },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        readerSettings: user.readerSettings
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Server error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update reader rates (readers only)
router.patch('/rates', authMiddleware, requireReader, validateReaderRates, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { rates } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { 'readerSettings.rates': rates } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Rates updated successfully',
      rates: user.readerSettings.rates
    });

  } catch (error) {
    console.error('Update rates error:', error);
    res.status(500).json({ 
      message: 'Server error updating rates',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Toggle online status (readers only)
router.patch('/status', authMiddleware, requireReader, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { isOnline } = req.body;

    if (typeof isOnline !== 'boolean') {
      return res.status(400).json({ message: 'isOnline must be a boolean value' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          'readerSettings.isOnline': isOnline,
          lastSeen: new Date()
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: `Status updated to ${isOnline ? 'online' : 'offline'}`,
      isOnline: user.readerSettings.isOnline
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ 
      message: 'Server error updating status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user earnings (readers only)
router.get('/earnings', authMiddleware, requireReader, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { period = '30d' } = req.query;

    const user = await User.findById(userId).select('earnings');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate period-specific earnings
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get sessions for the period
    const sessions = await Session.find({
      readerId: userId,
      status: 'ended',
      endTime: { $gte: startDate }
    }).select('readerEarnings endTime');

    const periodEarnings = sessions.reduce((sum, session) => sum + (session.readerEarnings || 0), 0);

    // Get today's earnings
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todaySessions = await Session.find({
      readerId: userId,
      status: 'ended',
      endTime: { $gte: todayStart }
    }).select('readerEarnings');

    const todayEarnings = todaySessions.reduce((sum, session) => sum + (session.readerEarnings || 0), 0);

    res.json({
      success: true,
      earnings: {
        total: user.earnings.total,
        pending: user.earnings.pending,
        paid: user.earnings.paid,
        today: todayEarnings,
        period: periodEarnings,
        lastPayout: user.earnings.lastPayout
      }
    });

  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ 
      message: 'Server error fetching earnings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'client') {
      // Client statistics
      const sessions = await Session.find({ clientId: userId });
      const totalSpent = sessions.reduce((sum, session) => sum + (session.totalCost || 0), 0);
      const totalSessions = sessions.length;
      const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration || 0), 0) / 60;

      stats = {
        totalSessions,
        totalSpent,
        totalMinutes: Math.round(totalMinutes),
        averageSessionLength: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
        favoriteReaders: 0 // TODO: Implement favorites
      };

    } else if (userRole === 'reader') {
      // Reader statistics
      const sessions = await Session.find({ readerId: userId, status: 'ended' });
      const totalEarnings = sessions.reduce((sum, session) => sum + (session.readerEarnings || 0), 0);
      const totalSessions = sessions.length;
      const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration || 0), 0) / 60;
      const ratedSessions = sessions.filter(s => s.rating);
      const averageRating = ratedSessions.length > 0 
        ? ratedSessions.reduce((sum, s) => sum + s.rating, 0) / ratedSessions.length 
        : 0;

      stats = {
        totalSessions,
        totalEarnings,
        totalMinutes: Math.round(totalMinutes),
        averageSessionLength: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: ratedSessions.length
      };
    }

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      message: 'Server error fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;