import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ReaderCard from '../components/ReaderCard';
import { useUser } from '@clerk/clerk-react';
import { clientAPI, readerAPI, adminAPI } from '../utils/api'; // Import adminAPI
import { useClerkUserRole } from '../hooks/useClerkUserRole'; // Import useClerkUserRole
import { toast } from 'react-toastify'; // Import toast for notifications
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

const Dashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { role, isLoading: isRoleLoading } = useClerkUserRole(user);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [readers, setReaders] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'readers', 'sessions', 'users', 'settings', 'products'

  useEffect(() => {
    if (user && !isRoleLoading) {
      fetchDashboardData();
    }
  }, [user, isRoleLoading, activeTab]); // Re-fetch data when activeTab changes

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (role === 'admin') {
        const [statsRes, revenueRes, readersRes, sessionsRes, usersRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getRevenue(),
          adminAPI.getReaders(),
          adminAPI.getSessions(),
          adminAPI.getUsers(),
        ]);
        setStats(statsRes.data.stats);
        setRevenue(revenueRes.data.revenue);
        setReaders(readersRes.data.readers);
        setSessions(sessionsRes.data.sessions);
        setUsers(usersRes.data.users);
      } else if (role === 'reader') {
        const [sessionsRes, earningsRes] = await Promise.all([
          readerAPI.getSessionHistory(),
          readerAPI.getEarnings()
        ]);
        setSessions(sessionsRes.data.sessions);
        setStats({ earnings: earningsRes.data.earnings }); // Consolidate earnings into stats for consistency
      } else if (role === 'client') {
        const [readersRes, sessionsRes, clientStatsRes] = await Promise.all([
          clientAPI.getReaders(),
          clientAPI.getSessionHistory(),
          clientAPI.getStats()
        ]);
        setReaders(readersRes.data.readers);
        setSessions(sessionsRes.data.sessions);
        setStats({ client: clientStatsRes.data.stats }); // Consolidate client stats
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard data.');
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectReader = async (readerId, sessionType) => {
    try {
      const response = await clientAPI.requestSession({
        readerId,
        sessionType
      });
      toast.success('Session request sent!');
      navigate(`/reading/${response.data.sessionId}`);
    } catch (error) {
      console.error('Failed to connect to reader:', error);
      toast.error('Failed to connect to reader. Please try again.');
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      await readerAPI.updateStatus(!user.readerSettings?.isOnline);
      toast.success(`Status updated to ${user.readerSettings?.isOnline ? 'offline' : 'online'}!`);
      // Re-fetch data to update UI
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status.');
    }
  };

  const handleSyncProducts = async () => {
    try {
      setLoading(true);
      await adminAPI.syncStripeProducts();
      toast.success('Products synced successfully!');
      // Optionally re-fetch products if there's a product display on the dashboard
    } catch (err) {
      console.error('Failed to sync products:', err);
      toast.error('Failed to sync products. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || isRoleLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner text="Loading user role..." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-8">
        <p>{error}</p>
      </div>
    );
  }

  // Admin Dashboard
  if (role === 'admin') {
    return (
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 bg-gray-800 text-white p-6 space-y-4 rounded-lg shadow-lg lg:mr-6 mb-6 lg:mb-0">
          <h2 className="text-2xl font-bold mb-4 text-center text-purple-300">Admin Panel</h2>
          <nav>
            <ul>
              <li>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200 ${
                    activeTab === 'overview' ? 'bg-purple-700' : 'hover:bg-gray-700'
                  }`}
                >
                  Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('readers')}
                  className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200 ${
                    activeTab === 'readers' ? 'bg-purple-700' : 'hover:bg-gray-700'
                  }`}
                >
                  Readers
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('sessions')}
                  className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200 ${
                    activeTab === 'sessions' ? 'bg-purple-700' : 'hover:bg-gray-700'
                  }`}
                >
                  Sessions
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200 ${
                    activeTab === 'users' ? 'bg-purple-700' : 'hover:bg-gray-700'
                  }`}
                >
                  Users
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200 ${
                    activeTab === 'products' ? 'bg-purple-700' : 'hover:bg-gray-700'
                  }`}
                >
                  Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200 ${
                    activeTab === 'settings' ? 'bg-purple-700' : 'hover:bg-gray-700'
                  }`}
                >
                  Settings
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gray-900 p-8 rounded-lg shadow-lg">
          {activeTab === 'overview' && (
            <section>
              <h2 className="text-3xl font-bold text-purple-400 mb-6">Admin Overview</h2>
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-200 mb-2">Total Users</h3>
                    <p className="text-3xl font-bold text-purple-300">{stats.users.clients + stats.users.readers + stats.users.admins}</p>
                    <p className="text-gray-400">Clients: {stats.users.clients}</p>
                    <p className="text-gray-400">Readers: {stats.users.readers}</p>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-200 mb-2">Total Sessions ({stats.period})</h3>
                    <p className="text-3xl font-bold text-purple-300">{stats.sessions.totalSessions}</p>
                    <p className="text-gray-400">Completed: {stats.sessions.completedSessions}</p>
                    <p className="text-gray-400">Avg Duration: {stats.sessions.averageDuration} min</p>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-200 mb-2">Total Revenue ({stats.period})</h3>
                    <p className="text-3xl font-bold text-purple-300">${revenue?.total?.toFixed(2) || '0.00'}</p>
                    <p className="text-gray-400">Platform Fee: ${revenue?.platform?.toFixed(2) || '0.00'}</p>
                    <p className="text-gray-400">Reader Payouts: ${revenue?.readerPayouts?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              )}

              <h3 className="text-2xl font-bold text-purple-400 mb-4">Recent Activity</h3>
              {stats?.recentActivity?.length > 0 ? (
                <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                  <ul>
                    {stats.recentActivity.map((activity) => (
                      <li key={activity._id} className="border-b border-gray-700 last:border-b-0 py-2">
                        <p className="text-gray-300">
                          <span className="font-semibold">{activity.clientId?.profile?.name || activity.clientId?.email}</span> had a {activity.sessionType} session with <span className="font-semibold">{activity.readerId?.profile?.name || activity.readerId?.email}</span> for {activity.duration ? `${(activity.duration / 60).toFixed(1)} minutes` : 'N/A'} costing ${activity.totalCost?.toFixed(2) || '0.00'} on {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-400">No recent activity.</p>
              )}
            </section>
          )}

          {activeTab === 'readers' && (
            <section>
              <h2 className="text-3xl font-bold text-purple-400 mb-6">Manage Readers</h2>
              {/* Reader management UI */}
              <p className="text-gray-300">Reader management features will go here.</p>
              {/* Example: List readers */}
              {readers.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {readers.map(reader => (
                    <li key={reader.id} className="bg-gray-800 p-4 rounded-md shadow-sm">
                      <p className="text-lg font-semibold text-purple-300">{reader.profile.name} ({reader.email})</p>
                      <p className="text-gray-400">Status: {reader.isActive ? 'Active' : 'Inactive'} / {reader.readerSettings.isOnline ? 'Online' : 'Offline'}</p>
                      <p className="text-gray-400">Total Sessions: {reader.stats.totalSessions}</p>
                      <p className="text-gray-400">Total Earnings: ${reader.stats.totalEarnings?.toFixed(2)}</p>
                      <p className="text-gray-400">Avg Rating: {reader.stats.averageRating?.toFixed(1)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No readers found.</p>
              )}
            </section>
          )}

          {activeTab === 'sessions' && (
            <section>
              <h2 className="text-3xl font-bold text-purple-400 mb-6">Manage Sessions</h2>
              {/* Session management UI */}
              <p className="text-gray-300">Session management features will go here.</p>
              {sessions.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {sessions.map(session => (
                    <li key={session.id} className="bg-gray-800 p-4 rounded-md shadow-sm">
                      <p className="text-lg font-semibold text-purple-300">Session ID: {session.sessionId}</p>
                      <p className="text-gray-400">Type: {session.sessionType}</p>
                      <p className="text-gray-400">Status: {session.status}</p>
                      <p className="text-gray-400">Client: {session.client?.name || session.client?.email}</p>
                      <p className="text-gray-400">Reader: {session.reader?.name || session.reader?.email}</p>
                      <p className="text-gray-400">Cost: ${session.totalCost?.toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No sessions found.</p>
              )}
            </section>
          )}

          {activeTab === 'users' && (
            <section>
              <h2 className="text-3xl font-bold text-purple-400 mb-6">Manage Users</h2>
              {/* User management UI */}
              <p className="text-gray-300">User management features will go here.</p>
              {users.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {users.map(user => (
                    <li key={user.id} className="bg-gray-800 p-4 rounded-md shadow-sm">
                      <p className="text-lg font-semibold text-purple-300">{user.profile.name} ({user.email})</p>
                      <p className="text-gray-400">Role: {user.role}</p>
                      <p className="text-gray-400">Active: {user.isActive ? 'Yes' : 'No'}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No users found.</p>
              )}
            </section>
          )}

          {activeTab === 'products' && (
            <section>
              <h2 className="text-3xl font-bold text-purple-400 mb-6">Manage Products</h2>
              <p className="text-gray-300 mb-4">Sync products and prices from Stripe to your local database.</p>
              <button
                onClick={handleSyncProducts}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                disabled={loading}
              >
                {loading ? 'Syncing...' : 'Sync Products from Stripe'}
              </button>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </section>
          )}

          {activeTab === 'settings' && (
            <section>
              <h2 className="text-3xl font-bold text-purple-400 mb-6">Admin Settings</h2>
              {/* Admin settings UI */}
              <p className="text-gray-300">General admin settings will go here.</p>
            </section>
          )}
        </main>
      </div>
    );
  }

  // Client Dashboard
  if (role === 'client') {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-alex-brush text-5xl text-mystical-pink mb-4">
              Welcome Back, {user.profile?.name || 'Seeker'}
            </h1>
            <p className="font-playfair text-gray-300 text-lg">
              Connect with gifted psychics for guidance and clarity
            </p>
          </div>

          {/* Balance Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card-mystical">
              <h3 className="font-playfair text-xl text-mystical-pink mb-2">Account Balance</h3>
              <p className="font-alex-brush text-3xl text-white">${stats?.client?.balance?.toFixed(2) || '0.00'}</p>
              <button className="btn-mystical mt-4">Add Funds</button>
            </div>
            
            <div className="card-mystical">
              <h3 className="font-playfair text-xl text-mystical-pink mb-2">Total Sessions</h3>
              <p className="font-alex-brush text-3xl text-white">{stats?.client?.totalSessions || 0}</p>
            </div>
            
            <div className="card-mystical">
              <h3 className="font-playfair text-xl text-mystical-pink mb-2">Favorite Readers</h3>
              <p className="font-alex-brush text-3xl text-white">{stats?.client?.favoriteReaders || 0}</p>
              <button className="btn-mystical mt-4">View All</button>
            </div>
          </div>

          {/* Online Readers */}
          <div className="mb-8">
            <h2 className="font-alex-brush text-4xl text-mystical-pink mb-6">
              Available Readers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(readers) && readers.filter(reader => reader.isOnline).map((reader) => (
                <ReaderCard
                  key={reader.id}
                  reader={reader}
                  onConnect={handleConnectReader}
                />
              ))}
            </div>
          </div>

          {/* Recent Sessions */}
          <div>
            <h2 className="font-alex-brush text-4xl text-mystical-pink mb-6">
              Recent Sessions
            </h2>
            <div className="card-mystical">
              {sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.slice(0, 5).map((session) => (
                    <div key={session._id} className="flex items-center justify-between p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                      <div>
                        <h4 className="font-playfair text-white font-semibold">
                          {session.readerId?.profile?.name || 'Reader'}
                        </h4>
                        <p className="font-playfair text-gray-300 text-sm">
                          {new Date(session.createdAt).toLocaleDateString()} - {session.sessionType}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-playfair text-mystical-gold font-semibold">
                          ${session.totalCost?.toFixed(2) || '0.00'}
                        </p>
                        <p className="font-playfair text-gray-300 text-sm">
                          {Math.floor(session.duration / 60)}m {session.duration % 60}s
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-playfair text-gray-300 text-center py-8">
                  No sessions yet. Connect with a reader to get started!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reader Dashboard
  if (role === 'reader') {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="font-alex-brush text-5xl text-mystical-pink mb-4">
                Reader Dashboard
              </h1>
              <p className="font-playfair text-gray-300 text-lg">
                Manage your readings and earnings
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleOnlineStatus}
                className={`px-6 py-3 rounded-lg font-playfair font-semibold transition-colors ${
                  user.readerSettings?.isOnline
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {user.readerSettings?.isOnline ? 'Go Offline' : 'Go Online'}
              </button>
            </div>
          </div>

          {/* Earnings Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card-mystical">
              <h3 className="font-playfair text-xl text-mystical-pink mb-2">Today's Earnings</h3>
              <p className="font-alex-brush text-3xl text-white">
                ${stats?.earnings?.today?.toFixed(2) || '0.00'}
              </p>
            </div>
            
            <div className="card-mystical">
              <h3 className="font-playfair text-xl text-mystical-pink mb-2">Pending Payout</h3>
              <p className="font-alex-brush text-3xl text-white">
                ${stats?.earnings?.pending?.toFixed(2) || '0.00'}
              </p>
            </div>
            
            <div className="card-mystical">
              <h3 className="font-playfair text-xl text-mystical-pink mb-2">Total Earned</h3>
              <p className="font-alex-brush text-3xl text-white">
                ${stats?.earnings?.total?.toFixed(2) || '0.00'}
              </p>
            </div>
            
            <div className="card-mystical">
              <h3 className="font-playfair text-xl text-mystical-pink mb-2">Sessions Today</h3>
              <p className="font-alex-brush text-3xl text-white">
                {Array.isArray(sessions) && sessions.filter(s =>
                  new Date(s.createdAt).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>

          {/* Rate Settings */}
          <div className="card-mystical mb-8">
            <h2 className="font-alex-brush text-3xl text-mystical-pink mb-6">
              Your Rates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h4 className="font-playfair text-white font-semibold mb-2">Video Call</h4>
                <p className="font-alex-brush text-2xl text-mystical-gold">
                  ${user.readerSettings?.rates?.video?.toFixed(2) || '3.99'}/min
                </p>
              </div>
              <div className="text-center">
                <h4 className="font-playfair text-white font-semibold mb-2">Audio Call</h4>
                <p className="font-alex-brush text-2xl text-mystical-gold">
                  ${user.readerSettings?.rates?.audio?.toFixed(2) || '2.99'}/min
                </p>
              </div>
              <div className="text-center">
                <h4 className="font-playfair text-white font-semibold mb-2">Chat</h4>
                <p className="font-alex-brush text-2xl text-mystical-gold">
                  ${user.readerSettings?.rates?.chat?.toFixed(2) || '1.99'}/min
                </p>
              </div>
            </div>
            <div className="text-center mt-6">
              <button className="btn-mystical">Update Rates</button>
            </div>
          </div>

          {/* Recent Sessions */}
          <div>
            <h2 className="font-alex-brush text-4xl text-mystical-pink mb-6">
              Recent Sessions
            </h2>
            <div className="card-mystical">
              {Array.isArray(sessions) && sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.slice(0, 5).map((session) => (
                    <div key={session._id} className="flex items-center justify-between p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                      <div>
                        <h4 className="font-playfair text-white font-semibold">
                          {session.clientId?.email || 'Client'}
                        </h4>
                        <p className="font-playfair text-gray-300 text-sm">
                          {new Date(session.createdAt).toLocaleDateString()} - {session.sessionType}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-playfair text-mystical-gold font-semibold">
                          ${session.readerEarnings?.toFixed(2) || '0.00'}
                        </p>
                        <p className="font-playfair text-gray-300 text-sm">
                          {Math.floor(session.duration / 60)}m {session.duration % 60}s
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-playfair text-gray-300 text-center py-8">
                  No sessions yet. Go online to start receiving clients!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
