import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div className="card-mystical max-w-lg w-full">
        <div className="text-7xl mb-6">🚫</div>
        <h1 className="font-alex-brush text-5xl text-mystical-pink mb-4">
          Access Denied
        </h1>
        <p className="font-playfair text-lg text-gray-300 mb-8">
          Sorry, you do not have the necessary permissions to view this page.
        </p>
        <Link
          to="/dashboard"
          className="btn-mystical"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
