import React from 'react';

const ReaderCard = ({ reader, onConnect }) => {
  return (
    <div className="card-mystical hover:transform hover:scale-105 transition-all duration-300">
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={reader.avatar || '/default-avatar.png'}
          alt={reader.name}
          className="w-16 h-16 rounded-full border-2 border-mystical-pink"
        />
        <div>
          <h3 className="font-playfair text-xl text-white font-semibold">
            {reader.name}
          </h3>
          <p className="font-playfair text-mystical-pink">
            {reader.specialty}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="font-playfair text-mystical-gold font-semibold">
            ${reader.rate}/min
          </span>
          <div className="flex items-center">
            <span className="text-yellow-400">★</span>
            <span className="font-playfair text-white ml-1">
              {reader.rating}
            </span>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-playfair ${
          reader.isOnline 
            ? 'bg-green-500 bg-opacity-20 text-green-400 border border-green-500' 
            : 'bg-gray-500 bg-opacity-20 text-gray-400 border border-gray-500'
        }`}>
          {reader.isOnline ? 'Online' : 'Offline'}
        </div>
      </div>
      
      <p className="font-playfair text-gray-300 text-sm mb-4">
        {reader.description || 'Experienced spiritual advisor ready to guide you.'}
      </p>
      
      <div className="flex space-x-2">
        <button 
          className="btn-mystical flex-1"
          onClick={() => onConnect(reader.id, 'video')}
          disabled={!reader.isOnline}
        >
          Video Call
        </button>
        <button 
          className="btn-mystical flex-1"
          onClick={() => onConnect(reader.id, 'audio')}
          disabled={!reader.isOnline}
        >
          Audio Call
        </button>
        <button 
          className="btn-mystical flex-1"
          onClick={() => onConnect(reader.id, 'chat')}
          disabled={!reader.isOnline}
        >
          Chat
        </button>
      </div>
    </div>
  );
};

export default ReaderCard;