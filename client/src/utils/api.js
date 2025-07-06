import axios from 'axios';

// Use Netlify functions path in production, full URLs in development
const API_BASE_URL = import.meta.env.PROD
  ? '/.netlify/functions/api' // Use Netlify functions path in production
  : import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get token from Clerk (async)
      const token = await window.Clerk?.session?.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to get Clerk token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(new Error(error.message || 'Request failed'));
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access - redirecting to login');
      window.location.href = '/login';
    }
    return Promise.reject(new Error(error.message || 'Response failed'));
  }
);

// API Service Functions

// Admin API Services
export const adminAPI = {
  // Get platform statistics
  getStats: (period = '30d') => api.get(`/api/admin/stats?period=${period}`),
  
  // Reader management
  getReaders: (params = {}) => api.get('/api/admin/readers', { params }),
  createReader: (readerData) => api.post('/api/admin/readers', readerData),
  updateReader: (readerId, updates) => api.patch(`/api/admin/readers/${readerId}`, updates),
  deleteReader: (readerId) => api.delete(`/api/admin/readers/${readerId}`),
  
  // User management
  getUsers: (params = {}) => api.get('/api/admin/users', { params }),
  updateUser: (userId, updates) => api.patch(`/api/admin/users/${userId}`, updates),
  
  // Session management
  getSessions: (params = {}) => api.get('/api/admin/sessions', { params }),
  
  // Financial management
  getRevenue: (period = '30d') => api.get(`/api/admin/revenue?period=${period}`),
  processPayouts: () => api.post('/api/admin/payouts/process'),
};

// Reader API Services
export const readerAPI = {
  // Profile and settings
  updateProfile: (profileData) => api.patch('/api/users/profile', profileData),
  updateRates: (rates) => api.patch('/api/users/rates', { rates }),
  updateStatus: (isOnline) => api.patch('/api/users/status', { isOnline }),
  
  // Earnings and statistics
  getEarnings: (period = '30d') => api.get(`/api/users/earnings?period=${period}`),
  getStats: () => api.get('/api/users/stats'),
  
  // Session management
  getSessionHistory: (params = {}) => api.get('/api/sessions/history', { params }),
  acceptSession: (sessionId) => api.post(`/api/sessions/${sessionId}/accept`),
  declineSession: (sessionId) => api.post(`/api/sessions/${sessionId}/decline`),
  endSession: (sessionId) => api.post(`/api/sessions/${sessionId}/end`),
};

// Client API Services
export const clientAPI = {
  // Reader discovery
  getReaders: (params = {}) => api.get('/api/users/readers', { params }),
  getReader: (readerId) => api.get(`/api/users/readers/${readerId}`),
  
  // Session management
  requestSession: (sessionData) => api.post('/api/sessions/request', sessionData),
  getSessionHistory: (params = {}) => api.get('/api/sessions/history', { params }),
  reviewSession: (sessionId, reviewData) => api.post(`/api/sessions/${sessionId}/review`, reviewData),
  endSession: (sessionId) => api.post(`/api/sessions/${sessionId}/end`),
  
  // Profile and settings
  updateProfile: (profileData) => api.patch('/api/users/profile', profileData),
  getStats: () => api.get('/api/users/stats'),
  
  // Balance management (will integrate with Stripe)
  addFunds: (amount) => api.post('/api/stripe/add-funds', { amount }),
  getBalance: () => api.get('/api/users/balance'),
};

// General API Services
export const generalAPI = {
  // Authentication (if needed beyond Clerk)
  verifyToken: () => api.get('/api/auth/verify'),
  
  // File uploads
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/api/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Real-time notifications
  getNotifications: () => api.get('/api/notifications'),
  markNotificationRead: (notificationId) => api.patch(`/api/notifications/${notificationId}/read`),
};

export default api;
