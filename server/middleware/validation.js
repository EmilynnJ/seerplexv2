const validator = require('validator');

// Email validation
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (!validator.isEmail(email)) {
    return { isValid: false, message: 'Please provide a valid email address' };
  }
  
  return { isValid: true };
};

// Password validation
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  
  if (password.length > 128) {
    return { isValid: false, message: 'Password must be less than 128 characters' };
  }
  
  // Check for at least one letter and one number
  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one letter and one number' };
  }
  
  return { isValid: true };
};

// User registration validation
const validateUserRegistration = (req, res, next) => {
  const { email, password, role } = req.body;
  
  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return res.status(400).json({ message: emailValidation.message });
  }
  
  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({ message: passwordValidation.message });
  }
  
  // Validate role
  const validRoles = ['client', 'reader', 'admin'];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified' });
  }
  
  // Prevent direct reader registration (admin only)
  if (role === 'reader' && (!req.user || req.user.role !== 'admin')) {
    return res.status(403).json({ message: 'Reader accounts can only be created by administrators' });
  }
  
  next();
};

// User login validation
const validateUserLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return res.status(400).json({ message: emailValidation.message });
  }
  
  // Check password exists
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ message: 'Password is required' });
  }
  
  next();
};

// Profile update validation
const validateProfileUpdate = (req, res, next) => {
  const { name, bio, specialties } = req.body;
  
  // Validate name
  if (name !== undefined) {
    if (typeof name !== 'string') {
      return res.status(400).json({ message: 'Name must be a string' });
    }
    
    if (name.length > 100) {
      return res.status(400).json({ message: 'Name must be less than 100 characters' });
    }
    
    // Sanitize name
    req.body.name = validator.escape(name.trim());
  }
  
  // Validate bio
  if (bio !== undefined) {
    if (typeof bio !== 'string') {
      return res.status(400).json({ message: 'Bio must be a string' });
    }
    
    if (bio.length > 1000) {
      return res.status(400).json({ message: 'Bio must be less than 1000 characters' });
    }
    
    // Sanitize bio
    req.body.bio = validator.escape(bio.trim());
  }
  
  // Validate specialties
  if (specialties !== undefined) {
    if (!Array.isArray(specialties)) {
      return res.status(400).json({ message: 'Specialties must be an array' });
    }
    
    if (specialties.length > 10) {
      return res.status(400).json({ message: 'Maximum 10 specialties allowed' });
    }
    
    // Validate and sanitize each specialty
    req.body.specialties = specialties.map(specialty => {
      if (typeof specialty !== 'string') {
        throw new Error('Each specialty must be a string');
      }
      
      if (specialty.length > 50) {
        throw new Error('Each specialty must be less than 50 characters');
      }
      
      return validator.escape(specialty.trim());
    }).filter(specialty => specialty.length > 0);
  }
  
  next();
};

// Reader rates validation
const validateReaderRates = (req, res, next) => {
  const { rates } = req.body;
  
  if (!rates || typeof rates !== 'object') {
    return res.status(400).json({ message: 'Rates object is required' });
  }
  
  const { video, audio, chat } = rates;
  
  // Validate each rate
  const rateTypes = { video, audio, chat };
  
  for (const [type, rate] of Object.entries(rateTypes)) {
    if (rate !== undefined) {
      if (typeof rate !== 'number' || isNaN(rate)) {
        return res.status(400).json({ message: `${type} rate must be a valid number` });
      }
      
      if (rate < 0.50) {
        return res.status(400).json({ message: `${type} rate must be at least $0.50` });
      }
      
      if (rate > 50.00) {
        return res.status(400).json({ message: `${type} rate must be less than $50.00` });
      }
      
      // Round to 2 decimal places
      req.body.rates[type] = Math.round(rate * 100) / 100;
    }
  }
  
  next();
};

// Session request validation
const validateSessionRequest = (req, res, next) => {
  const { readerId, sessionType } = req.body;
  
  // Validate readerId
  if (!readerId || typeof readerId !== 'string') {
    return res.status(400).json({ message: 'Reader ID is required' });
  }
  
  if (!validator.isMongoId(readerId)) {
    return res.status(400).json({ message: 'Invalid reader ID format' });
  }
  
  // Validate sessionType
  const validSessionTypes = ['video', 'audio', 'chat'];
  if (!sessionType || !validSessionTypes.includes(sessionType)) {
    return res.status(400).json({ message: 'Valid session type is required (video, audio, or chat)' });
  }
  
  next();
};

// Message validation
const validateMessage = (req, res, next) => {
  const { content, messageType } = req.body;
  
  // Validate content
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ message: 'Message content is required' });
  }
  
  if (content.length > 2000) {
    return res.status(400).json({ message: 'Message must be less than 2000 characters' });
  }
  
  // Sanitize content
  req.body.content = validator.escape(content.trim());
  
  // Validate messageType
  const validMessageTypes = ['text', 'image', 'file', 'system', 'gift'];
  if (messageType && !validMessageTypes.includes(messageType)) {
    return res.status(400).json({ message: 'Invalid message type' });
  }
  
  next();
};

// Payment amount validation
const validatePaymentAmount = (req, res, next) => {
  const { amount } = req.body;
  
  if (!amount || typeof amount !== 'number' || isNaN(amount)) {
    return res.status(400).json({ message: 'Valid amount is required' });
  }
  
  if (amount < 100) { // $1.00 minimum in cents
    return res.status(400).json({ message: 'Minimum amount is $1.00' });
  }
  
  if (amount > 50000) { // $500.00 maximum in cents
    return res.status(400).json({ message: 'Maximum amount is $500.00' });
  }
  
  // Ensure amount is an integer (cents)
  req.body.amount = Math.round(amount);
  
  next();
};

// Sanitize input middleware
const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = validator.escape(obj[key].trim());
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };
  
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  
  next();
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate,
  validateReaderRates,
  validateSessionRequest,
  validateMessage,
  validatePaymentAmount,
  sanitizeInput
};