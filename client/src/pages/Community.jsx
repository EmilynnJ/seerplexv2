import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const Community = () => {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('recent');
  const [forumPosts, setForumPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
  const [showNewPostForm, setShowNewPostForm] = useState(false);

  const handleDiscordJoin = () => {
    window.open('https://discord.gg/your-server-invite', '_blank');
  };

  const handlePatreonJoin = () => {
    window.open('https://www.patreon.com/your-patreon-page', '_blank');
  };

  // Mock forum data
  useEffect(() => {
    setForumPosts([
      {
        id: 1,
        title: "Weekly Tarot Reading Circle - Join Us!",
        content: "Every Sunday at 7 PM EST, we gather for a group tarot reading session. All levels welcome!",
        author: "Mystic Luna",
        authorAvatar: "🌙",
        category: "events",
        replies: 12,
        likes: 24,
        createdAt: "2024-01-15T10:30:00Z",
        isPinned: true
      },
      {
        id: 2,
        title: "Crystal Healing for Beginners - Tips & Tricks",
        content: "I've been working with crystals for 5 years now. Here are some beginner-friendly tips that helped me on my journey...",
        author: "Crystal Rose",
        authorAvatar: "🌹",
        category: "healing",
        replies: 8,
        likes: 31,
        createdAt: "2024-01-14T15:20:00Z",
        isPinned: false
      },
      {
        id: 3,
        title: "Mercury Retrograde Survival Guide",
        content: "With Mercury going retrograde next week, here's how to protect your energy and navigate the cosmic chaos...",
        author: "Star Walker",
        authorAvatar: "⭐",
        category: "astrology",
        replies: 15,
        likes: 42,
        createdAt: "2024-01-13T09:15:00Z",
        isPinned: false
      },
      {
        id: 4,
        title: "Dream Interpretation Workshop Results",
        content: "Thank you to everyone who participated in last week's dream workshop! Here are the key insights we discovered...",
        author: "Dream Weaver",
        authorAvatar: "💫",
        category: "dreams",
        replies: 6,
        likes: 18,
        createdAt: "2024-01-12T14:45:00Z",
        isPinned: false
      }
    ]);
  }, []);

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    
    const post = {
      id: forumPosts.length + 1,
      title: newPost.title,
      content: newPost.content,
      author: user?.firstName || 'Anonymous',
      authorAvatar: '👤',
      category: newPost.category,
      replies: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
      isPinned: false
    };
    
    setForumPosts([post, ...forumPosts]);
    setNewPost({ title: '', content: '', category: 'general' });
    setShowNewPostForm(false);
  };

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();

    // Check for invalid date
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    // Check for future date
    if (date > now) {
      return 'In the future';
    }

    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-gray-600',
      // Use mystical-pink if available, otherwise fallback to bg-pink-600
      events: 'bg-mystical-pink bg-pink-600',
      healing: 'bg-green-600',
      astrology: 'bg-purple-600',
      dreams: 'bg-blue-600',
      // Use mystical-gold if available, otherwise fallback to bg-yellow-500
      tarot: 'bg-mystical-gold bg-yellow-500'
    };
    return colors[category] || 'bg-gray-600';
  };

  // Configurable threshold for "popular" posts
  const POPULAR_LIKES_THRESHOLD = 20;

  const filteredPosts = forumPosts.filter(post => {
    if (activeTab === 'recent') return true;
    if (activeTab === 'popular') return post.likes > POPULAR_LIKES_THRESHOLD;
    if (activeTab === 'pinned') return post.isPinned;
    return post.category === activeTab;
  });

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-alex-brush text-6xl text-mystical-pink mb-4">
            SoulSeer Community
          </h1>
          <p className="font-playfair text-xl text-gray-300 max-w-3xl mx-auto">
            Join our vibrant community of spiritual seekers, psychic readers, and mystic enthusiasts
          </p>
        </div>

        {/* Public Forum Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-alex-brush text-4xl text-mystical-pink">
              Community Forum
            </h2>
            {isLoaded && user && (
              <button
                onClick={() => setShowNewPostForm(!showNewPostForm)}
                className="btn-mystical"
              >
                + New Post
              </button>
            )}
          </div>

          {/* New Post Form */}
          {showNewPostForm && (
            <div className="card-mystical mb-8">
              <h3 className="font-alex-brush text-2xl text-mystical-pink mb-4">Create New Post</h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-playfair text-white mb-2">Title</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white font-playfair focus:border-mystical-pink focus:outline-none"
                    placeholder="Enter your post title..."
                  />
                </div>
                <div>
                  <label className="block font-playfair text-white mb-2">Category</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white font-playfair focus:border-mystical-pink focus:outline-none"
                  >
                    <option value="general">General Discussion</option>
                    <option value="events">Events</option>
                    <option value="healing">Healing & Wellness</option>
                    <option value="astrology">Astrology</option>
                    <option value="dreams">Dreams</option>
                    <option value="tarot">Tarot & Divination</option>
                  </select>
                </div>
                <div>
                  <label className="block font-playfair text-white mb-2">Content</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white font-playfair focus:border-mystical-pink focus:outline-none h-32"
                    placeholder="Share your thoughts with the community..."
                  />
                </div>
                <div className="flex space-x-4">
                  <button onClick={handleCreatePost} className="btn-mystical">
                    Post
                  </button>
                  <button
                    onClick={() => setShowNewPostForm(false)}
                    className="bg-gray-700 text-white px-6 py-3 rounded font-playfair font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Forum Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['recent', 'popular', 'pinned', 'events', 'healing', 'astrology', 'dreams', 'tarot'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-playfair font-semibold transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-mystical-pink text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Forum Posts */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className="card-mystical">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{post.authorAvatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-playfair text-xl text-white font-semibold">
                        {post.title}
                        {post.isPinned && <span className="text-mystical-gold ml-2">📌</span>}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs text-white font-playfair ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </span>
                    </div>
                    
                    <p className="font-playfair text-gray-300 mb-3">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="font-playfair text-mystical-pink">
                          by {post.author}
                        </span>
                        <span className="font-playfair text-gray-400 text-sm">
                          {formatTimeAgo(post.createdAt)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-mystical-pink">💬</span>
                          <span className="font-playfair text-gray-300 text-sm">{post.replies}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-mystical-gold">👍</span>
                          <span className="font-playfair text-gray-300 text-sm">{post.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Community Platforms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Discord Card */}
          <div className="card-mystical">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.174.372.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z"/>
                </svg>
              </div>
              <div>
                <h2 className="font-alex-brush text-3xl text-mystical-pink">Join Our Discord</h2>
                <p className="font-playfair text-gray-300">Connect with fellow seekers in real-time</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="font-playfair text-white">2,847 active members</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-mystical-pink rounded-full"></div>
                <span className="font-playfair text-white">24/7 spiritual discussions</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-mystical-gold rounded-full"></div>
                <span className="font-playfair text-white">Daily oracle card pulls</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="font-playfair text-white">Weekly group meditations</span>
              </div>
            </div>

            <p className="font-playfair text-gray-300 mb-6">
              Join our Discord community to connect with like-minded souls, participate in group readings,
              share your spiritual experiences, and get support on your journey. Our moderators include
              certified psychic readers who offer guidance and wisdom.
            </p>

            <button
              className="btn-mystical w-full"
              onClick={handleDiscordJoin}
            >
              Join Discord Server
            </button>
          </div>

          {/* Patreon Card */}
          <div className="card-mystical">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-orange-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M0 .48v23.04h4.22V.48zm15.385 0c-4.764 0-8.641 3.88-8.641 8.65 0 4.755 3.877 8.623 8.641 8.623 4.75 0 8.615-3.868 8.615-8.623C24 4.36 20.136.48 15.385.48z"/>
                </svg>
              </div>
              <div>
                <h2 className="font-alex-brush text-3xl text-mystical-pink">Support on Patreon</h2>
                <p className="font-playfair text-gray-300">Exclusive content & premium perks</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                <h3 className="font-playfair text-lg text-mystical-gold font-semibold mb-2">Supporter ($5/month)</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Exclusive monthly horoscope</li>
                  <li>• Discord supporter badge</li>
                  <li>• Early access to new features</li>
                </ul>
              </div>
              <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                <h3 className="font-playfair text-lg text-mystical-gold font-semibold mb-2">Mystic ($15/month)</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Everything in Supporter tier</li>
                  <li>• Monthly group reading session</li>
                  <li>• Exclusive meditation recordings</li>
                </ul>
              </div>
              <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                <h3 className="font-playfair text-lg text-mystical-gold font-semibold mb-2">Oracle ($30/month)</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Everything in previous tiers</li>
                  <li>• Monthly 1-on-1 with top readers</li>
                  <li>• Exclusive spiritual courses</li>
                </ul>
              </div>
            </div>

            <button
              className="btn-mystical w-full"
              onClick={handlePatreonJoin}
            >
              Become a Patron
            </button>
          </div>
        </div>

        {/* Community Features */}
        <section className="mb-16">
          <h2 className="font-alex-brush text-4xl text-mystical-pink text-center mb-12">
            Community Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-mystical text-center">
              <div className="w-16 h-16 bg-mystical-pink rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🌙</span>
              </div>
              <h3 className="font-playfair text-xl text-white font-semibold mb-3">Moon Circle Gatherings</h3>
              <p className="font-playfair text-gray-300 text-sm">
                Join our monthly new moon and full moon virtual gatherings for intention setting and release ceremonies.
              </p>
            </div>

            <div className="card-mystical text-center">
              <div className="w-16 h-16 bg-mystical-pink rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📖</span>
              </div>
              <h3 className="font-playfair text-xl text-white font-semibold mb-3">Study Groups</h3>
              <p className="font-playfair text-gray-300 text-sm">
                Participate in guided study groups covering tarot, astrology, crystal healing, and other mystical arts.
              </p>
            </div>

            <div className="card-mystical text-center">
              <div className="w-16 h-16 bg-mystical-pink rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-playfair text-xl text-white font-semibold mb-3">Reader Spotlights</h3>
              <p className="font-playfair text-gray-300 text-sm">
                Get to know our talented readers through weekly spotlights, Q&As, and behind-the-scenes content.
              </p>
            </div>
          </div>
        </section>

        {/* Community Guidelines */}
        <section className="mb-16">
          <div className="card-mystical">
            <h2 className="font-alex-brush text-4xl text-mystical-pink text-center mb-8">
              Community Guidelines
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-playfair text-xl text-white font-semibold mb-4">Our Values</h3>
                <ul className="space-y-3 font-playfair text-gray-300">
                  <li className="flex items-start space-x-3">
                    <span className="text-mystical-pink mt-1">•</span>
                    <span>Respect and kindness towards all members</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-mystical-pink mt-1">•</span>
                    <span>Open-minded spiritual discussions</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-mystical-pink mt-1">•</span>
                    <span>Support for all spiritual paths and beliefs</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-mystical-pink mt-1">•</span>
                    <span>Constructive feedback and encouragement</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-playfair text-xl text-white font-semibold mb-4">Community Rules</h3>
                <ul className="space-y-3 font-playfair text-gray-300">
                  <li className="flex items-start space-x-3">
                    <span className="text-mystical-gold mt-1">•</span>
                    <span>No spam or self-promotion without permission</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-mystical-gold mt-1">•</span>
                    <span>Keep discussions spiritual and relevant</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-mystical-gold mt-1">•</span>
                    <span>No solicitation of free readings</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-mystical-gold mt-1">•</span>
                    <span>Respect privacy and confidentiality</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="card-mystical text-center">
          <h2 className="font-alex-brush text-4xl text-mystical-pink mb-4">
            Ready to Connect?
          </h2>
          <p className="font-playfair text-gray-300 mb-6 max-w-2xl mx-auto">
            Whether you're just starting your spiritual journey or you're a seasoned practitioner,
            our community welcomes you with open arms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="btn-mystical"
              onClick={() => navigate('/readers')}
            >
              Browse Readers
            </button>
            <button
              className="bg-gray-700 text-white px-6 py-3 rounded font-playfair font-semibold hover:bg-gray-600 transition-colors"
              onClick={() => navigate('/signup')}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
