import React from 'react';

const Hero = () => {
  return (
    <div className="relative py-16">
      <div className="max-w-4xl mx-auto text-center px-4">
        <img 
          src="https://i.postimg.cc/tRLSgCPb/HERO-IMAGE-1.jpg"
          alt="SoulSeer Hero"
          className="w-full max-w-3xl mx-auto rounded-lg shadow-2xl mb-8"
        />
        <p className="font-playfair text-2xl text-white mb-8">
          A Community of Gifted Psychics
        </p>
        <p className="font-playfair text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
          Connect with authentic spiritual readers for guidance, clarity, and healing on your journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-mystical">
            Find Your Reader
          </button>
          <button className="btn-mystical">
            Join Live Streams
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;