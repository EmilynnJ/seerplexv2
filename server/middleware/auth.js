const { getAuth, clerkClient } = require('@clerk/express');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    let user = await User.findOne({ clerkId: userId }).select('-password');

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);
      const email = clerkUser?.primaryEmailAddress?.emailAddress;
      user = await User.create({
        clerkId: userId,
        email,
        role: 'client'
      });
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account has been deactivated' });
    }

    // Update last seen
    user.lastSeen = new Date();
    await user.save();

    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
      clerkId: user.clerkId
    };
    
    req.userDoc = user; // Full user document if needed
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    res.status(401).json({ message: 'Invalid authentication token' });
  }
};

// Role-based authorization middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }

    next();
  };
};

// Admin only middleware
const requireAdmin = requireRole('admin');

// Reader only middleware
const requireReader = requireRole('reader');

// Client only middleware
const requireClient = requireRole('client');

// Reader or Admin middleware
const requireReaderOrAdmin = requireRole(['reader', 'admin']);

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return next();
    }
    const user = await User.findOne({ clerkId: userId }).select('-password');
    if (user && user.isActive) {
      req.user = {
        userId: user._id,
        email: user.email,
        role: user.role,
        clerkId: user.clerkId
      };
      req.userDoc = user;
    }
    next();
  } catch (error) {
    next();
  }
};

// Rate limiting middleware for sensitive operations
const rateLimitSensitive = (req, res, next) => {
  // This would typically use Redis or similar for production
  // For now, we'll implement a simple in-memory rate limiter
  
  const key = req.ip + ':' + req.path;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }

  const attempts = global.rateLimitStore.get(key) || [];
  const recentAttempts = attempts.filter(time => now - time < windowMs);

  if (recentAttempts.length >= maxAttempts) {
    return res.status(429).json({
      message: 'Too many attempts. Please try again later.',
      retryAfter: Math.ceil((recentAttempts[0] + windowMs - now) / 1000)
    });
  }

  recentAttempts.push(now);
  global.rateLimitStore.set(key, recentAttempts);

  next();
};

module.exports = {
  authMiddleware,
  requireRole,
  requireAdmin,
  requireReader,
  requireClient,
  requireReaderOrAdmin,
  optionalAuth,
  rateLimitSensitive
};