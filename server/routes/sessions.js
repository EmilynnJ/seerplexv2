const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Session = require('../models/Session');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { authMiddleware, requireClient, requireReader } = require('../middleware/auth');
const { validateSessionRequest } = require('../middleware/validation');

const router = express.Router();

// Request a new session (clients only)
router.post('/request', authMiddleware, requireClient, validateSessionRequest, async (req, res) => {
  try {
    const { readerId, sessionType } = req.body;
    const clientId = req.user.userId;

    // Validate reader exists and is available
    const reader = await User.findOne({
      _id: readerId,
      role: 'reader',
      isActive: true
    });

    if (!reader) {
      return res.status(404).json({ message: 'Reader not found or unavailable' });
    }

    if (!reader.readerSettings.isOnline) {
      return res.status(400).json({ message: 'Reader is currently offline' });
    }

    // Get client and check balance
    const client = await User.findById(clientId);
    const sessionRate = reader.readerSettings.rates[sessionType];

    if (!sessionRate) {
      return res.status(400).json({ message: 'Invalid session type for this reader' });
    }

    // Check if client has sufficient balance for at least 1 minute
    if (client.balance < sessionRate) {
      return res.status(400).json({ 
        message: 'Insufficient balance. Please add funds to your account.',
        requiredAmount: sessionRate,
        currentBalance: client.balance
      });
    }

    // Check for existing pending sessions
    const existingSession = await Session.findOne({
      $or: [
        { clientId, status: 'pending' },
        { clientId, status: 'active' },
        { readerId, status: 'active' }
      ]
    });

    if (existingSession) {
      return res.status(400).json({ 
        message: 'You already have an active or pending session',
        sessionId: existingSession.sessionId
      });
    }

    // Create new session
    const sessionId = uuidv4();
    const session = new Session({
      sessionId,
      clientId,
      readerId,
      sessionType,
      rate: sessionRate,
      status: 'pending'
    });

    await session.save();

    // Notify reader via socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('reader-notification', {
        readerId,
        sessionRequest: {
          sessionId,
          clientId,
          sessionType,
          rate: sessionRate,
          clientName: client.profile?.name || 'Anonymous Client'
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Session request sent to reader',
      sessionId,
      session: {
        id: session._id,
        sessionId,
        sessionType,
        rate: sessionRate,
        status: 'pending',
        readerName: reader.profile?.name || 'Reader'
      }
    });

  } catch (error) {
    console.error('Session request error:', error);
    res.status(500).json({ 
      message: 'Server error creating session request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Accept session (readers only)
router.post('/:sessionId/accept', authMiddleware, requireReader, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const readerId = req.user.userId;

    const session = await Session.findOne({ 
      sessionId, 
      readerId,
      status: 'pending'
    }).populate('clientId', 'profile.name email balance');

    if (!session) {
      return res.status(404).json({ message: 'Session not found or already processed' });
    }

    // Check if reader is still online
    const reader = await User.findById(readerId);
    if (!reader.readerSettings.isOnline) {
      return res.status(400).json({ message: 'You must be online to accept sessions' });
    }

    // Check client still has sufficient balance
    if (session.clientId.balance < session.rate) {
      session.status = 'cancelled';
      await session.save();
      
      return res.status(400).json({ 
        message: 'Client has insufficient balance. Session cancelled.',
        sessionId
      });
    }

    // Accept the session
    session.status = 'active';
    session.startTime = new Date();
    await session.save();

    // Notify client via socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('session-accepted', {
        sessionId,
        clientId: session.clientId._id,
        readerName: reader.profile?.name || 'Reader'
      });
    }

    res.json({
      success: true,
      message: 'Session accepted successfully',
      session: {
        sessionId,
        status: 'active',
        startTime: session.startTime,
        clientName: session.clientId.profile?.name || 'Client',
        rate: session.rate
      }
    });

  } catch (error) {
    console.error('Accept session error:', error);
    res.status(500).json({ 
      message: 'Server error accepting session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Decline session (readers only)
router.post('/:sessionId/decline', authMiddleware, requireReader, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const readerId = req.user.userId;

    const session = await Session.findOne({ 
      sessionId, 
      readerId,
      status: 'pending'
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found or already processed' });
    }

    session.status = 'cancelled';
    await session.save();

    // Notify client via socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('session-declined', {
        sessionId,
        clientId: session.clientId
      });
    }

    res.json({
      success: true,
      message: 'Session declined',
      sessionId
    });

  } catch (error) {
    console.error('Decline session error:', error);
    res.status(500).json({ 
      message: 'Server error declining session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Charge for session time (called periodically during active sessions)
router.post('/charge', authMiddleware, async (req, res) => {
  try {
    const { sessionId, amount } = req.body;
    const userId = req.user.userId;

    if (!sessionId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid sessionId and amount required' });
    }

    const session = await Session.findOne({ sessionId })
      .populate('clientId', 'balance')
      .populate('readerId', 'earnings');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Verify user is part of this session
    const isClient = session.clientId._id.toString() === userId;
    const isReader = session.readerId._id.toString() === userId;

    if (!isClient && !isReader) {
      return res.status(403).json({ message: 'Not authorized for this session' });
    }

    if (session.status !== 'active') {
      return res.status(400).json({ message: 'Session is not active' });
    }

    const chargeAmount = amount / 100; // Convert cents to dollars

    // Check client balance
    if (session.clientId.balance < chargeAmount) {
      // Insufficient balance - end session
      await endSessionDueToInsufficientFunds(session);
      
      return res.status(400).json({ 
        message: 'Insufficient balance. Session ended.',
        balance: session.clientId.balance,
        sessionEnded: true
      });
    }

    // Process the charge
    await processSessionCharge(session, chargeAmount);

    // Get updated balance
    const updatedClient = await User.findById(session.clientId._id).select('balance');

    res.json({
      success: true,
      charged: chargeAmount,
      balance: updatedClient.balance,
      sessionId
    });

  } catch (error) {
    console.error('Session charge error:', error);
    res.status(500).json({ 
      message: 'Server error processing charge',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// End session
router.post('/:sessionId/end', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const session = await Session.findOne({ sessionId })
      .populate('clientId', 'profile.name')
      .populate('readerId', 'profile.name');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Verify user is part of this session
    const isClient = session.clientId._id.toString() === userId;
    const isReader = session.readerId._id.toString() === userId;

    if (!isClient && !isReader) {
      return res.status(403).json({ message: 'Not authorized for this session' });
    }

    if (session.status === 'ended') {
      return res.status(400).json({ message: 'Session already ended' });
    }

    // End the session
    await session.endSession();

    // Notify other participant via socket.io
    const io = req.app.get('io');
    if (io) {
      const otherUserId = isClient ? session.readerId._id : session.clientId._id;
      io.emit('session-ended', {
        sessionId,
        userId: otherUserId,
        endedBy: userId
      });
    }

    res.json({
      success: true,
      message: 'Session ended successfully',
      session: {
        sessionId,
        duration: session.duration,
        totalCost: session.totalCost,
        status: 'ended'
      }
    });

  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ 
      message: 'Server error ending session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get session history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      page = 1, 
      limit = 20, 
      status, 
      sessionType,
      startDate,
      endDate 
    } = req.query;

    // Build query
    const query = {
      $or: [
        { clientId: userId },
        { readerId: userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    if (sessionType) {
      query.sessionType = sessionType;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sessions = await Session.find(query)
      .populate('clientId', 'profile.name email')
      .populate('readerId', 'profile.name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Session.countDocuments(query);

    // Format sessions for response
    const formattedSessions = sessions.map(session => ({
      id: session._id,
      sessionId: session.sessionId,
      sessionType: session.sessionType,
      status: session.status,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      rate: session.rate,
      totalCost: session.totalCost,
      readerEarnings: session.readerEarnings,
      rating: session.rating,
      review: session.review,
      createdAt: session.createdAt,
      client: {
        id: session.clientId._id,
        name: session.clientId.profile?.name || 'Anonymous',
        email: session.clientId.email
      },
      reader: {
        id: session.readerId._id,
        name: session.readerId.profile?.name || 'Reader',
        email: session.readerId.email
      },
      isClient: session.clientId._id.toString() === userId
    }));

    res.json({
      success: true,
      sessions: formattedSessions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalSessions: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Session history error:', error);
    res.status(500).json({ 
      message: 'Server error fetching session history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Rate and review session (clients only)
router.post('/:sessionId/review', authMiddleware, requireClient, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { rating, review } = req.body;
    const clientId = req.user.userId;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Validate review
    if (review && review.length > 1000) {
      return res.status(400).json({ message: 'Review must be less than 1000 characters' });
    }

    const session = await Session.findOne({
      sessionId,
      clientId,
      status: 'ended'
    }).populate('readerId');

    if (!session) {
      return res.status(404).json({ message: 'Session not found or not eligible for review' });
    }

    if (session.rating) {
      return res.status(400).json({ message: 'Session already reviewed' });
    }

    // Update session with rating and review
    session.rating = rating;
    session.review = review || '';
    await session.save();

    // Update reader's overall rating
    const reader = session.readerId;
    await reader.updateRating(rating);

    res.json({
      success: true,
      message: 'Review submitted successfully',
      sessionId,
      rating,
      review
    });

  } catch (error) {
    console.error('Session review error:', error);
    res.status(500).json({ 
      message: 'Server error submitting review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to process session charges
async function processSessionCharge(session, amount) {
  // Calculate earnings split
  const platformFee = amount * 0.30;
  const readerEarnings = amount * 0.70;

  // Update client balance
  await User.findByIdAndUpdate(session.clientId._id, {
    $inc: { balance: -amount }
  });

  // Update reader earnings
  await User.findByIdAndUpdate(session.readerId._id, {
    $inc: { 
      'earnings.pending': readerEarnings,
      'earnings.total': readerEarnings
    }
  });

  // Add billing to session
  await session.addBilling(amount, 'Per-minute session charge');

  // Create transaction record
  const transaction = new Transaction({
    userId: session.clientId._id,
    sessionId: session._id,
    type: 'charge',
    amount,
    status: 'succeeded',
    description: `Session charge - ${session.sessionType}`,
    metadata: {
      sessionType: session.sessionType,
      readerId: session.readerId._id,
      clientId: session.clientId._id
    }
  });

  await transaction.save();
}

// Helper function to end session due to insufficient funds
async function endSessionDueToInsufficientFunds(session) {
  session.status = 'ended';
  session.endTime = new Date();
  
  if (session.startTime) {
    session.duration = Math.floor((session.endTime - session.startTime) / 1000);
  }
  
  session.notes = session.notes || {};
  session.notes.admin = 'Session ended due to insufficient client balance';
  
  await session.save();

  // Notify both participants
  const io = session.constructor.app?.get('io');
  if (io) {
    io.emit('session-ended', {
      sessionId: session.sessionId,
      reason: 'insufficient_balance'
    });
  }
}

module.exports = router;