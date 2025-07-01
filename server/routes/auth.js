const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware, rateLimitSensitive } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');

const router = express.Router();

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Register new user
router.post('/signup', rateLimitSensitive, validateUserRegistration, async (req, res) => {
  try {
    const { email, password, role = 'client' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      role
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    // Return user data without password
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      balance: user.balance,
      earnings: user.earnings,
      readerSettings: user.readerSettings,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login user
router.post('/login', rateLimitSensitive, validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated. Please contact support.' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Update last seen
    user.lastSeen = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    // Return user data without password
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      balance: user.balance,
      earnings: user.earnings,
      readerSettings: user.readerSettings,
      isVerified: user.isVerified,
      lastSeen: user.lastSeen
    };

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        balance: user.balance,
        earnings: user.earnings,
        readerSettings: user.readerSettings,
        isVerified: user.isVerified,
        lastSeen: user.lastSeen,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Refresh token
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    // Generate new token
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        balance: user.balance,
        earnings: user.earnings,
        readerSettings: user.readerSettings
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error during token refresh' });
  }
});

// Logout (client-side token removal, but we can track it)
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // Update user's last seen and set offline if reader
    const user = await User.findById(req.user.userId);
    
    if (user) {
      user.lastSeen = new Date();
      
      if (user.role === 'reader') {
        user.readerSettings.isOnline = false;
      }
      
      await user.save();
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// Request password reset
router.post('/forgot-password', rateLimitSensitive, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    
    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

    // TODO: Implement actual password reset email logic
    if (user) {
      console.log(`Password reset requested for user: ${user.email}`);
      // Generate reset token and send email
    }

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify email (placeholder for future implementation)
router.post('/verify-email', authMiddleware, async (req, res) => {
  try {
    const { verificationCode } = req.body;

    // TODO: Implement email verification logic
    
    res.json({
      success: true,
      message: 'Email verification feature coming soon'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;