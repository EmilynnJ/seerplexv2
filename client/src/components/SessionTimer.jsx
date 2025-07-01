import React from 'react';

const SessionTimer = ({ sessionTime, readerRate }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalCost = (sessionTime / 60) * readerRate;

  return (
    <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 mb-4">
      <div className="text-center">
        <div className="font-alex-brush text-3xl text-mystical-pink mb-2">
          {formatTime(sessionTime)}
        </div>
        <div className="font-playfair text-white">
          Session Time
        </div>
        <div className="font-playfair text-mystical-gold text-lg mt-2">
          ${totalCost.toFixed(2)} total
        </div>
        <div className="font-playfair text-gray-300 text-sm">
          ${readerRate}/min
        </div>
      </div>
    </div>
  );
};

export default SessionTimer;