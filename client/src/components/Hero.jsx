import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative py-16">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="font-alex-brush text-6xl text-mystical-pink mb-6">
          SoulSeer
        </h1>
        <img
          src="https://i.postimg.cc/tRLSgCPb/HERO-IMAGE-1.jpg"
          alt="SoulSeer Hero"
          className="w-72 h-auto mx-auto rounded-lg shadow-2xl mb-8"
        />
        <p className="font-playfair text-2xl text-white mb-8">
          A Community of Gifted Psychics
        </p>
        <p className="font-playfair text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
          Connect with authentic spiritual readers for guidance, clarity, and healing on your journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="btn-mystical"
            onClick={() => navigate('/readers')}
          >
            Find Your Reader
          </button>
          <button
            className="btn-mystical"
            onClick={() => navigate('/livestream')}
          >
            Join Live Streams
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
