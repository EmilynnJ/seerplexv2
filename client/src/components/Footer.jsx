import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black bg-opacity-90 border-t border-pink-500 border-opacity-20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-alex-brush text-3xl text-mystical-pink mb-4">
              SoulSeer
            </h3>
            <p className="font-playfair text-gray-300 mb-4">
              A Community of Gifted Psychics
            </p>
            <p className="font-playfair text-gray-400 text-sm">
              Providing ethical, compassionate, and judgment-free spiritual guidance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-playfair text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="font-playfair text-gray-300 hover:text-mystical-pink transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/help" className="font-playfair text-gray-300 hover:text-mystical-pink transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/policies" className="font-playfair text-gray-300 hover:text-mystical-pink transition-colors">
                  Terms & Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-playfair text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@soulseer.com" className="font-playfair text-gray-300 hover:text-mystical-pink transition-colors">
                  support@soulseer.com
                </a>
              </li>
              <li>
                <span className="font-playfair text-gray-300">
                  24/7 Customer Support
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-pink-500 border-opacity-20 mt-8 pt-8 text-center">
          <p className="font-playfair text-gray-400 text-sm">
            © 2025 SoulSeer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;