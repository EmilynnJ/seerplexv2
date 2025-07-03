import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const LiveStream = () => {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('live');

  // Mock data for live streams
  const liveStreams = [
    {
      id: 1,
      title: "Daily Tarot Guidance",
      readerName: "Mystic Luna",
      readerAvatar: "🌙",
      viewers: 142,
      duration: "32:45",
      category: "Tarot",
      description: "Join Luna for daily tarot insights and guidance for your spiritual journey",
      thumbnail: "🔮",
      isLive: true
    },
    {
      id: 2,
      title: "Crystal Healing Session",
      readerName: "Crystal Rose",
      readerAvatar: "🌹",
      viewers: 89,
      duration: "18:22",
      category: "Crystal Healing",
      description: "Experience the healing power of crystals in this interactive session",
      thumbnail: "💎",
      isLive: true
    },
    {
      id: 3,
      title: "Astrology Weekly Forecast",
      readerName: "Star Walker",
      readerAvatar: "⭐",
      viewers: 203,
      duration: "45:12",
      category: "Astrology",
      description: "Get insights into this week's planetary movements and their effects",
      thumbnail: "♈",
      isLive: true
    }
  ];

  const upcomingStreams = [
    {
      id: 4,
      title: "Past Life Regression Journey",
      readerName: "Soul Guide Maya",
      readerAvatar: "👁️",
      scheduledTime: "Today at 8:00 PM",
      category: "Past Life",
      description: "Guided meditation to explore your past lives and soul connections",
      thumbnail: "🌀"
    },
    {
      id: 5,
      title: "Full Moon Manifestation",
      readerName: "Moon Priestess",
      readerAvatar: "🌕",
      scheduledTime: "Tomorrow at 9:00 PM",
      category: "Manifestation",
      description: "Harness the power of the full moon for manifestation and release",
      thumbnail: "🌕"
    },
    {
      id: 6,
      title: "Psychic Development Circle",
      readerName: "Intuitive Oracle",
      readerAvatar: "🔮",
      scheduledTime: "Saturday at 7:00 PM",
      category: "Development",
      description: "Learn to develop and trust your psychic abilities in this group session",
      thumbnail: "✨"
    }
  ];

  const featuredStreams = [
    {
      id: 7,
      title: "Master Class: Advanced Tarot",
      readerName: "Tarot Master Elena",
      readerAvatar: "👑",
      views: 1247,
      category: "Education",
      description: "Deep dive into advanced tarot techniques and card combinations",
      thumbnail: "🎴",
      isPremium: true
    },
    {
      id: 8,
      title: "Healing Circle for Grief",
      readerName: "Compassionate Heart",
      readerAvatar: "💚",
      views: 892,
      category: "Healing",
      description: "A safe space for processing grief and finding comfort through spirit",
      thumbnail: "🕯️",
      isPremium: false
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [streamId]);

  const handleJoinStream = (stream) => {
    // TODO: Implement actual stream joining logic
    alert(`Joining ${stream.title} by ${stream.readerName}`);
  };

  const handleSetReminder = (stream) => {
    // TODO: Implement reminder functionality
    alert(`Reminder set for ${stream.title}`);
  };

  const handleSendGift = (stream) => {
    // TODO: Implement gift sending
    alert(`Send a gift to ${stream.readerName}`);
  };

  if (loading) {
    return <LoadingSpinner text="Loading streams..." />;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-alex-brush text-6xl text-mystical-pink mb-4">
            Live Streams
          </h1>
          <p className="font-playfair text-xl text-gray-300 max-w-3xl mx-auto">
            Connect with gifted readers through live spiritual sessions, group meditations, and interactive experiences
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-lg p-1 flex">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-6 py-3 rounded-md font-playfair font-semibold transition-all ${
                activeTab === 'live'
                  ? 'bg-mystical-pink text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              🔴 Live Now
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-3 rounded-md font-playfair font-semibold transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-mystical-pink text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              📅 Upcoming
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-6 py-3 rounded-md font-playfair font-semibold transition-all ${
                activeTab === 'featured'
                  ? 'bg-mystical-pink text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              ⭐ Featured
            </button>
          </div>
        </div>

        {/* Live Streams */}
        {activeTab === 'live' && (
          <section>
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                <h2 className="font-alex-brush text-4xl text-mystical-pink">
                  Live Now ({liveStreams.length})
                </h2>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {liveStreams.map((stream) => (
                <div key={stream.id} className="card-mystical relative overflow-hidden">
                  {/* Live Badge */}
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 z-10">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>LIVE</span>
                  </div>
                  
                  {/* Duration Badge */}
                  <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                    {stream.duration}
                  </div>

                  {/* Thumbnail */}
                  <div className="text-center mb-4 bg-gray-800 rounded-lg p-8">
                    <div className="text-6xl mb-2">{stream.thumbnail}</div>
                    <span className="bg-mystical-pink text-white px-3 py-1 rounded-full text-sm">
                      {stream.category}
                    </span>
                  </div>

                  {/* Stream Info */}
                  <div className="space-y-3">
                    <h3 className="font-playfair text-xl text-white font-semibold">
                      {stream.title}
                    </h3>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{stream.readerAvatar}</span>
                      <span className="font-playfair text-gray-300">{stream.readerName}</span>
                    </div>
                    
                    <p className="font-playfair text-gray-300 text-sm">
                      {stream.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-playfair text-mystical-gold flex items-center space-x-1">
                        <span>👥</span>
                        <span>{stream.viewers} viewers</span>
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        className="btn-mystical flex-1"
                        onClick={() => handleJoinStream(stream)}
                      >
                        Join Stream
                      </button>
                      <button
                        className="bg-mystical-gold text-black px-4 py-2 rounded font-playfair font-semibold hover:bg-yellow-400 transition-colors"
                        onClick={() => handleSendGift(stream)}
                      >
                        🎁
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Streams */}
        {activeTab === 'upcoming' && (
          <section>
            <h2 className="font-alex-brush text-4xl text-mystical-pink text-center mb-8">
              Upcoming Streams
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {upcomingStreams.map((stream) => (
                <div key={stream.id} className="card-mystical">
                  {/* Thumbnail */}
                  <div className="text-center mb-4 bg-gray-800 rounded-lg p-8">
                    <div className="text-6xl mb-2">{stream.thumbnail}</div>
                    <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm">
                      {stream.category}
                    </span>
                  </div>

                  {/* Stream Info */}
                  <div className="space-y-3">
                    <h3 className="font-playfair text-xl text-white font-semibold">
                      {stream.title}
                    </h3>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{stream.readerAvatar}</span>
                      <span className="font-playfair text-gray-300">{stream.readerName}</span>
                    </div>
                    
                    <p className="font-playfair text-gray-300 text-sm">
                      {stream.description}
                    </p>
                    
                    <div className="bg-gray-800 bg-opacity-50 rounded-lg p-3">
                      <span className="font-playfair text-mystical-gold text-sm flex items-center space-x-1">
                        <span>⏰</span>
                        <span>{stream.scheduledTime}</span>
                      </span>
                    </div>
                    
                    <button
                      className="btn-mystical w-full"
                      onClick={() => handleSetReminder(stream)}
                    >
                      Set Reminder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Featured Streams */}
        {activeTab === 'featured' && (
          <section>
            <h2 className="font-alex-brush text-4xl text-mystical-pink text-center mb-8">
              Featured Content
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {featuredStreams.map((stream) => (
                <div key={stream.id} className="card-mystical relative">
                  {stream.isPremium && (
                    <div className="absolute top-4 right-4 bg-mystical-gold text-black px-3 py-1 rounded-full text-sm font-semibold">
                      Premium
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div className="text-center mb-4 bg-gray-800 rounded-lg p-8">
                    <div className="text-6xl mb-2">{stream.thumbnail}</div>
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                      {stream.category}
                    </span>
                  </div>

                  {/* Stream Info */}
                  <div className="space-y-3">
                    <h3 className="font-playfair text-xl text-white font-semibold">
                      {stream.title}
                    </h3>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{stream.readerAvatar}</span>
                      <span className="font-playfair text-gray-300">{stream.readerName}</span>
                    </div>
                    
                    <p className="font-playfair text-gray-300 text-sm">
                      {stream.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-playfair text-mystical-gold flex items-center space-x-1">
                        <span>👁️</span>
                        <span>{stream.views} views</span>
                      </span>
                    </div>
                    
                    <button
                      className="btn-mystical w-full"
                      onClick={() => handleJoinStream(stream)}
                    >
                      {stream.isPremium ? 'Watch Premium' : 'Watch Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Stream Benefits */}
        <section className="mb-16">
          <h2 className="font-alex-brush text-4xl text-mystical-pink text-center mb-12">
            Why Join Our Live Streams?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-mystical text-center">
              <div className="w-16 h-16 bg-mystical-pink rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="font-playfair text-xl text-white font-semibold mb-3">Interactive Experience</h3>
              <p className="font-playfair text-gray-300 text-sm">
                Participate in real-time with chat, questions, and group activities during live sessions.
              </p>
            </div>

            <div className="card-mystical text-center">
              <div className="w-16 h-16 bg-mystical-pink rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">💝</span>
              </div>
              <h3 className="font-playfair text-xl text-white font-semibold mb-3">Send Virtual Gifts</h3>
              <p className="font-playfair text-gray-300 text-sm">
                Show appreciation to readers with beautiful animated gifts that support their work.
              </p>
            </div>

            <div className="card-mystical text-center">
              <div className="w-16 h-16 bg-mystical-pink rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
              <h3 className="font-playfair text-xl text-white font-semibold mb-3">Learn Together</h3>
              <p className="font-playfair text-gray-300 text-sm">
                Join group learning sessions and develop your spiritual abilities alongside others.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="card-mystical text-center">
          <h2 className="font-alex-brush text-4xl text-mystical-pink mb-4">
            Want to Host Your Own Stream?
          </h2>
          <p className="font-playfair text-gray-300 mb-6 max-w-2xl mx-auto">
            Join our community of gifted readers and share your spiritual wisdom with seekers worldwide.
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
              Become a Reader
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStream;