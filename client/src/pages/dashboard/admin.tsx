import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';

interface Reader {
  _id: string;
  email: string;
  profile: {
    name: string;
    bio: string;
    specialties: string[];
    rating: number;
    totalReviews: number;
  };
  readerSettings: {
    rates: {
      video: number;
      audio: number;
      chat: number;
    };
    isOnline: boolean;
  };
  isActive: boolean;
  createdAt: string;
  stats?: {
    totalSessions: number;
    totalEarnings: number;
    averageRating: number;
  };
}

interface AdminStats {
  users: {
    clients: number;
    readers: number;
    admins: number;
    activeClients: number;
    activeReaders: number;
  };
  sessions: {
    totalSessions: number;
    totalRevenue: number;
    averageRating: number;
  };
  transactions: {
    totalTransactions: number;
    totalAmount: number;
  };
  recentActivity: any[];
}
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [readers, setReaders] = useState<Reader[]>([]);
  const [analytics, setAnalytics] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newReaderForm, setNewReaderForm] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    specialties: [] as string[],
    rates: { video: 3.99, audio: 2.99, chat: 1.99 }
  });
  const [showCreateReader, setShowCreateReader] = useState(false);

  // Load data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, readersResponse] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getReaders({ limit: 50 })
      ]);
      
      setAnalytics(statsResponse.data.stats);
      setReaders(readersResponse.data.readers);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReader = async () => {
    try {
      setLoading(true);
      await adminAPI.createReader(newReaderForm);
      setShowCreateReader(false);
      setNewReaderForm({
        name: '',
        email: '',
        password: '',
        bio: '',
        specialties: [],
        rates: { video: 3.99, audio: 2.99, chat: 1.99 }
      });
      await loadDashboardData(); // Reload data
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to create reader');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReaderStatus = async (readerId: string, isActive: boolean) => {
    try {
      await adminAPI.updateReader(readerId, { isActive: !isActive });
      await loadDashboardData(); // Reload data
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to update reader status');
    }
  };

  const handleProcessPayouts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.processPayouts();
      alert(`Processed ${response.data.results.filter((r: any) => r.status === 'success').length} payouts successfully`);
      await loadDashboardData(); // Reload data
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to process payouts');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mystical-pink mx-auto mb-4"></div>
          <p className="font-playfair text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-playfair text-red-400 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="btn-mystical"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'users', name: 'User Management', icon: '👥' },
    { id: 'readers', name: 'Reader Management', icon: '🔮' },
    { id: 'content', name: 'Content Moderation', icon: '🛡️' },
    { id: 'financial', name: 'Financial Admin', icon: '💰' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'inventory', name: 'Shop Inventory', icon: '🏪' }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-alex-brush text-5xl text-mystical-pink mb-4">
            Admin Dashboard
          </h1>
          <p className="font-playfair text-gray-300 text-lg">
            Manage your SoulSeer platform
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-mystical text-center">
            <div className="text-4xl mb-2">👥</div>
            <h3 className="font-playfair text-lg text-white font-semibold">Total Users</h3>
            <p className="font-alex-brush text-3xl text-mystical-pink">
              {analytics ? (analytics.users.clients + analytics.users.readers + analytics.users.admins).toLocaleString() : '0'}
            </p>
          </div>
          <div className="card-mystical text-center">
            <div className="text-4xl mb-2">🔮</div>
            <h3 className="font-playfair text-lg text-white font-semibold">Active Readers</h3>
            <p className="font-alex-brush text-3xl text-mystical-pink">
              {analytics?.users.activeReaders || 0}
            </p>
          </div>
          <div className="card-mystical text-center">
            <div className="text-4xl mb-2">💬</div>
            <h3 className="font-playfair text-lg text-white font-semibold">Total Sessions</h3>
            <p className="font-alex-brush text-3xl text-mystical-pink">
              {analytics?.sessions.totalSessions.toLocaleString() || '0'}
            </p>
          </div>
          <div className="card-mystical text-center">
            <div className="text-4xl mb-2">💰</div>
            <h3 className="font-playfair text-lg text-white font-semibold">Revenue</h3>
            <p className="font-alex-brush text-3xl text-mystical-pink">
              ${analytics?.sessions.totalRevenue.toLocaleString() || '0'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-playfair font-semibold transition-all flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-mystical-pink text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Recent Activity */}
            <div className="card-mystical">
              <h2 className="font-alex-brush text-3xl text-mystical-pink mb-6">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <p className="font-playfair text-white">New reader approved: Mystic Luna</p>
                      <p className="font-playfair text-gray-400 text-sm">2 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">💰</span>
                    </div>
                    <div>
                      <p className="font-playfair text-white">Daily payouts processed: $3,247.85</p>
                      <p className="font-playfair text-gray-400 text-sm">4 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">⚠️</span>
                    </div>
                    <div>
                      <p className="font-playfair text-white">Content flagged for review: 3 items</p>
                      <p className="font-playfair text-gray-400 text-sm">6 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'readers' && (
          <div className="space-y-8">
            {/* Reader Management */}
            <div className="card-mystical">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-alex-brush text-3xl text-mystical-pink">Reader Management</h2>
                <button
                  className="btn-mystical"
                  onClick={() => setShowCreateReader(true)}
                >
                  Create Reader Profile
                </button>
              </div>
              
              <div className="space-y-4">
                {readers.map((reader) => (
                  <div key={reader._id} className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-playfair text-xl text-white font-semibold mb-2">
                          {reader.profile.name || 'Unnamed Reader'}
                        </h3>
                        <p className="font-playfair text-gray-300 mb-2">{reader.email}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {reader.profile.specialties?.map((specialty) => (
                            <span
                              key={`${reader._id}-${specialty}`}
                              className="bg-mystical-pink text-white px-3 py-1 rounded-full text-sm"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <p className="font-playfair text-gray-400">
                            Rating: {reader.profile.rating?.toFixed(1) || 'N/A'} ⭐
                          </p>
                          <p className="font-playfair text-gray-400">
                            Sessions: {reader.stats?.totalSessions || 0}
                          </p>
                          <p className="font-playfair text-gray-400">
                            Earnings: ${reader.stats?.totalEarnings?.toFixed(2) || '0.00'}
                          </p>
                          <span className={`px-2 py-1 rounded text-xs ${
                            reader.readerSettings.isOnline ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                          }`}>
                            {reader.readerSettings.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleToggleReaderStatus(reader._id, reader.isActive)}
                          className={`px-4 py-2 rounded font-playfair font-semibold transition-colors ${
                            reader.isActive
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {reader.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Reader Modal */}
            {showCreateReader && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-mystical-darkBlue border border-mystical-purple rounded-lg p-8 max-w-md w-full mx-4">
                  <h3 className="font-alex-brush text-3xl text-mystical-pink mb-6">Create New Reader</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="input-mystical w-full"
                      value={newReaderForm.name}
                      onChange={(e) => setNewReaderForm({...newReaderForm, name: e.target.value})}
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="input-mystical w-full"
                      value={newReaderForm.email}
                      onChange={(e) => setNewReaderForm({...newReaderForm, email: e.target.value})}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      className="input-mystical w-full"
                      value={newReaderForm.password}
                      onChange={(e) => setNewReaderForm({...newReaderForm, password: e.target.value})}
                    />
                    <textarea
                      placeholder="Bio"
                      className="input-mystical w-full h-24"
                      value={newReaderForm.bio}
                      onChange={(e) => setNewReaderForm({...newReaderForm, bio: e.target.value})}
                    />
                    <div className="flex space-x-4">
                      <button
                        onClick={handleCreateReader}
                        className="btn-mystical flex-1"
                        disabled={!newReaderForm.name || !newReaderForm.email || !newReaderForm.password}
                      >
                        Create Reader
                      </button>
                      <button
                        onClick={() => setShowCreateReader(false)}
                        className="bg-gray-700 text-white px-4 py-2 rounded font-playfair hover:bg-gray-600 flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="space-y-8">
            <div className="card-mystical">
              <h2 className="font-alex-brush text-3xl text-mystical-pink mb-6">Financial Administration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
                  <h3 className="font-playfair text-xl text-white font-semibold mb-4">Revenue Overview</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-playfair text-gray-300">Platform Revenue (30%)</span>
                      <span className="font-playfair text-mystical-gold">
                        ${analytics ? ((analytics.sessions.totalRevenue * 0.3).toLocaleString()) : '0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-playfair text-gray-300">Reader Payouts (70%)</span>
                      <span className="font-playfair text-mystical-gold">
                        ${analytics ? ((analytics.sessions.totalRevenue * 0.7).toLocaleString()) : '0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-playfair text-gray-300">Pending Payouts</span>
                      <span className="font-playfair text-mystical-gold">$12,847.32</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
                  <h3 className="font-playfair text-xl text-white font-semibold mb-4">Transaction Monitoring</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-playfair text-gray-300">Successful Transactions</span>
                      <span className="font-playfair text-green-400">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-playfair text-gray-300">Failed Transactions</span>
                      <span className="font-playfair text-red-400">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-playfair text-gray-300">Chargebacks</span>
                      <span className="font-playfair text-yellow-400">3</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  className="btn-mystical"
                  onClick={handleProcessPayouts}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Process Payouts'}
                </button>
                <button className="bg-gray-700 text-white px-6 py-3 rounded font-playfair font-semibold hover:bg-gray-600 transition-colors">
                  Export Financial Report
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-8">
            <div className="card-mystical">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-alex-brush text-3xl text-mystical-pink">Shop Inventory Management</h2>
                <button className="btn-mystical">
                  Add New Product
                </button>
              </div>
              
              <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 mb-6">
                <h3 className="font-playfair text-xl text-white font-semibold mb-4">Stripe Integration</h3>
                <p className="font-playfair text-gray-300 mb-4">
                  Manage your product inventory through Stripe. Products are automatically synced with your Stripe catalog.
                </p>
                <div className="flex space-x-4">
                  <button className="btn-mystical">Sync with Stripe</button>
                  <button className="bg-gray-700 text-white px-6 py-3 rounded font-playfair font-semibold hover:bg-gray-600 transition-colors">
                    View Stripe Dashboard
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                  <h4 className="font-playfair text-lg text-white font-semibold mb-2">Total Products</h4>
                  <p className="font-alex-brush text-2xl text-mystical-pink">47</p>
                </div>
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                  <h4 className="font-playfair text-lg text-white font-semibold mb-2">Low Stock</h4>
                  <p className="font-alex-brush text-2xl text-yellow-400">5</p>
                </div>
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                  <h4 className="font-playfair text-lg text-white font-semibold mb-2">Out of Stock</h4>
                  <p className="font-alex-brush text-2xl text-red-400">2</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="card-mystical">
              <h2 className="font-alex-brush text-3xl text-mystical-pink mb-6">Platform Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 text-center">
                  <h3 className="font-playfair text-lg text-white font-semibold mb-2">User Growth</h3>
                  <p className="font-alex-brush text-3xl text-green-400">+12.5%</p>
                  <p className="font-playfair text-gray-400 text-sm">This month</p>
                </div>
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 text-center">
                  <h3 className="font-playfair text-lg text-white font-semibold mb-2">Session Duration</h3>
                  <p className="font-alex-brush text-3xl text-mystical-pink">23.4m</p>
                  <p className="font-playfair text-gray-400 text-sm">Average</p>
                </div>
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 text-center">
                  <h3 className="font-playfair text-lg text-white font-semibold mb-2">Reader Rating</h3>
                  <p className="font-alex-brush text-3xl text-yellow-400">4.8⭐</p>
                  <p className="font-playfair text-gray-400 text-sm">Average</p>
                </div>
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 text-center">
                  <h3 className="font-playfair text-lg text-white font-semibold mb-2">Retention Rate</h3>
                  <p className="font-alex-brush text-3xl text-blue-400">67%</p>
                  <p className="font-playfair text-gray-400 text-sm">30-day</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
