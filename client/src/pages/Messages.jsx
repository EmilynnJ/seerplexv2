import React from 'react';

const Messages = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="card-mystical text-center">
          <h1 className="font-alex-brush text-4xl text-mystical-pink mb-4">
            Messages
          </h1>
          <p className="font-playfair text-white mb-6">
            Direct messaging with readers coming soon! For now, use live sessions to communicate.
          </p>
          <button className="btn-mystical">
            Start a Reading
          </button>
        </div>
      </div>
    </div>
  );
};

export default Messages;