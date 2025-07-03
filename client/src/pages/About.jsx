import React from 'react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="font-alex-brush text-6xl text-mystical-pink mb-8">
            About SoulSeer
          </h1>
        </div>
        
        <div className="card-mystical mb-12">
          <div className="prose prose-lg max-w-none">
            <p className="font-playfair text-white text-lg leading-relaxed mb-6">
              At SoulSeer, we are dedicated to providing ethical, compassionate, and judgment-free spiritual guidance. Our mission is twofold: to offer clients genuine, heart-centered readings and to uphold fair, ethical standards for our readers.
            </p>
            
            <p className="font-playfair text-white text-lg leading-relaxed mb-6">
              Founded by psychic medium Emilynn, SoulSeer was created as a response to the corporate greed that dominates many psychic platforms. Unlike other apps, our readers keep the majority of what they earn and play an active role in shaping the platform.
            </p>
            
            <p className="font-playfair text-white text-lg leading-relaxed mb-8">
              SoulSeer is more than just an app—it's a soul tribe. A community of gifted psychics united by our life's calling: to guide, heal, and empower those who seek clarity on their journey.
            </p>
          </div>
        </div>
        
        <div className="text-center mb-12">
          <img
            src="https://i.postimg.cc/s2ds9RtC/FOUNDER.jpg"
            alt="Founder: Emilynn"
            className="w-64 h-64 object-cover rounded-full mx-auto border-4 border-mystical-pink shadow-2xl mb-6"
          />
          <h2 className="font-alex-brush text-4xl text-mystical-pink mb-4">
            Meet Our Founder
          </h2>
          <h3 className="font-playfair text-2xl text-white mb-4">
            Emilynn - Psychic Medium
          </h3>
          <p className="font-playfair text-gray-300 text-lg max-w-2xl mx-auto">
            With over 15 years of experience in spiritual guidance, Emilynn founded SoulSeer to create a platform that truly serves both clients and readers with integrity and fairness.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="card-mystical text-center">
            <div className="w-16 h-16 bg-mystical-pink rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">⚖️</span>
            </div>
            <h3 className="font-alex-brush text-3xl text-mystical-pink mb-4">
              Ethical Standards
            </h3>
            <p className="font-playfair text-white">
              We maintain the highest ethical standards in all our spiritual services and reader interactions.
            </p>
          </div>
          
          <div className="card-mystical text-center">
            <div className="w-16 h-16 bg-mystical-pink rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="font-alex-brush text-3xl text-mystical-pink mb-4">
              Fair Revenue
            </h3>
            <p className="font-playfair text-white">
              Our readers keep 70% of their earnings, ensuring they are fairly compensated for their gifts.
            </p>
          </div>
          
          <div className="card-mystical text-center">
            <div className="w-16 h-16 bg-mystical-pink rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="font-alex-brush text-3xl text-mystical-pink mb-4">
              Community
            </h3>
            <p className="font-playfair text-white">
              We foster a supportive community where both clients and readers can grow and connect.
            </p>
          </div>
        </div>

        {/* Additional Mission Section */}
        <div className="card-mystical mb-12">
          <h2 className="font-alex-brush text-4xl text-mystical-pink text-center mb-8">
            Our Mission & Values
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-playfair text-xl text-white font-semibold mb-4">What We Believe</h3>
              <ul className="space-y-3 font-playfair text-gray-300">
                <li className="flex items-start space-x-3">
                  <span className="text-mystical-pink mt-1">•</span>
                  <span>Everyone deserves access to authentic spiritual guidance</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-mystical-pink mt-1">•</span>
                  <span>Psychic readers should be fairly compensated for their gifts</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-mystical-pink mt-1">•</span>
                  <span>Spiritual services should never exploit vulnerability</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-mystical-pink mt-1">•</span>
                  <span>Community and connection enhance spiritual growth</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-playfair text-xl text-white font-semibold mb-4">How We're Different</h3>
              <ul className="space-y-3 font-playfair text-gray-300">
                <li className="flex items-start space-x-3">
                  <span className="text-mystical-gold mt-1">•</span>
                  <span>No predatory pricing or hidden fees</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-mystical-gold mt-1">•</span>
                  <span>Readers have input on platform decisions</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-mystical-gold mt-1">•</span>
                  <span>Transparent and ethical business practices</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-mystical-gold mt-1">•</span>
                  <span>Focus on genuine connection over profit</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <button
            className="btn-mystical mr-4"
            onClick={() => navigate('/readers')}
          >
            Find Your Reader
          </button>
          <button
            className="btn-mystical"
            onClick={() => navigate('/community')}
          >
            Join Our Community
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;
