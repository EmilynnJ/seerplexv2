import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const LiveStream = () => {
  const { streamId } = useParams();
  const [loading, setLoading] = useState(true);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    // TODO: Fetch stream data
    setLoading(false);
  }, [streamId]);

  if (loading) {
    return <LoadingSpinner text="Loading stream..." />;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="card-mystical text-center">
          <h1 className="font-alex-brush text-4xl text-mystical-pink mb-4">
            Live Streams
          </h1>
          <p className="font-playfair text-white mb-6">
            Live streaming feature coming soon! Connect with readers through personal sessions for now.
          </p>
          <button className="btn-mystical">
            Browse Readers
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveStream;