import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import ReaderCard from '../components/ReaderCard';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

const Home = () => {
  const [readers, setReaders] = useState([]);
  const [liveStreams, setLiveStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [readersRes, streamsRes] = await Promise.all([
        axios.get('/api/users/readers'),
        axios.get('/api/streams/live')
      ]);
      
      setReaders(readersRes.data);
      setLiveStreams(streamsRes.data);
    } catch (error) {
      console.error('Failed to fetch home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectReader = async (readerId, sessionType) => {
    try {
      const response = await axios.post('/api/sessions/request', {
        readerId,
        sessionType
      });
      
      navigate(`/reading/${response.data.sessionId}`);
    } catch (error) {
      console.error('Failed to connect to reader:', error);
      alert('Failed to connect to reader. Please try again.');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading readers..." />;
  }

  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Online Readers */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-alex-brush text-4xl text-mystical-pink text-center mb-12">
            Featured Readers Online Now
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {readers.filter(reader => reader.isOnline).map((reader) => (
              <ReaderCard
                key={reader.id}
                reader={reader}
                onConnect={handleConnectReader}
              />
            ))}
          </div>
          
          {readers.filter(reader => reader.isOnline).length === 0 && (
            <div className="text-center py-12">
              <p className="font-playfair text-gray-300 text-lg">
                No readers are currently online. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>
      
      {/* Live Streams */}
      <section className="py-16 bg-black bg-opacity-30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-alex-brush text-4xl text-mystical-pink text-center mb-12">
            Live Streams
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {liveStreams.map((stream) => (
              <div key={stream.id} className="card-mystical cursor-pointer hover:transform hover:scale-105 transition-all duration-300"
                   onClick={() => navigate(`/live/${stream.id}`)}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-playfair text-xl text-white font-semibold">
                    {stream.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-playfair text-red-400 text-sm">LIVE</span>
                  </div>
                </div>
                
                <p className="font-playfair text-gray-300 mb-4">
                  {stream.readerName}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="font-playfair text-mystical-gold">
                    {stream.viewers} viewers
                  </span>
                  <button className="btn-mystical">
                    Join Stream
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {liveStreams.length === 0 && (
            <div className="text-center py-12">
              <p className="font-playfair text-gray-300 text-lg">
                No live streams at the moment. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;