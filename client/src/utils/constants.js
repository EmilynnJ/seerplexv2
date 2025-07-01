export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    ME: '/api/auth/me',
    LOGOUT: '/api/auth/logout'
  },
  USERS: {
    READERS: '/api/users/readers',
    PROFILE: '/api/users/profile',
    STATUS: '/api/users/status',
    EARNINGS: '/api/users/earnings'
  },
  SESSIONS: {
    REQUEST: '/api/sessions/request',
    ACCEPT: '/api/sessions/accept',
    CHARGE: '/api/sessions/charge',
    END: '/api/sessions/end',
    HISTORY: '/api/sessions/history'
  },
  STRIPE: {
    CREATE_PAYMENT_INTENT: '/api/stripe/create-payment-intent',
    PAYMENT_SUCCESS: '/api/stripe/payment-success'
  },
  ADMIN: {
    READERS: '/api/admin/readers',
    SESSIONS: '/api/admin/sessions',
    USERS: '/api/admin/users'
  }
};

export const SESSION_TYPES = {
  VIDEO: 'video',
  AUDIO: 'audio',
  CHAT: 'chat'
};

export const USER_ROLES = {
  CLIENT: 'client',
  READER: 'reader',
  ADMIN: 'admin'
};

export const SESSION_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  ENDED: 'ended',
  CANCELLED: 'cancelled'
};

export const CONNECTION_STATUS = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  FAILED: 'failed',
  ENDED: 'ended'
};

export const DEFAULT_RATES = {
  VIDEO: 3.99,
  AUDIO: 2.99,
  CHAT: 1.99
};

export const PLATFORM_FEE = 0.3; // 30%
export const READER_SHARE = 0.7; // 70%

export const MINIMUM_PAYOUT = 15.00;

export const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' }
];