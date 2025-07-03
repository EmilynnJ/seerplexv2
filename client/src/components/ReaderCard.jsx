import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReaderCard = ({ reader, onConnect }) => {
  const navigate = useNavigate();

  return (
    <div className="card-mystical hover:transform hover:scale-105 transition-all duration-300 flex flex-col">
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={reader.profile.avatar || '/default-avatar.png'}
          alt={reader.profile.name}
          className="w-16 h-16 rounded-full border-2 border-mystical-pink"
        />
        <div>
          <h3 className="font-playfair text-xl text-white font-semibold">
            {reader.profile.name}
          </h3>
          <p className="font-playfair text-mystical-pink">
            {reader.readerSettings.specialties.join(', ')}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="font-playfair text-mystical-gold font-semibold">
            ${reader.readerSettings.rates.chat}/min
          </span>
          <div className="flex items-center">
            <span className="text-yellow-400">★</span>
            <span className="font-playfair text-white ml-1">
              {reader.readerSettings.rating.toFixed(1)}
            </span>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-playfair ${
          reader.readerSettings.isOnline
            ? 'bg-green-500 bg-opacity-20 text-green-400 border border-green-500'
            : 'bg-gray-500 bg-opacity-20 text-gray-400 border border-gray-500'
        }`}>
          {reader.readerSettings.isOnline ? 'Online' : 'Offline'}
        </div>
      </div>
      
      <p className="font-playfair text-gray-300 text-sm mb-4 flex-grow">
        {reader.profile.bio || 'Experienced spiritual advisor ready to guide you.'}
      </p>
      
      <div className="space-y-2">
        <button
          className="btn-mystical w-full"
          onClick={() => navigate(`/profile/${reader._id}`)}
        >
          View Profile
        </button>
        <div className="flex space-x-2">
          <button
            className="btn-mystical flex-1"
            onClick={() => onConnect(reader._id, 'video')}
            disabled={!reader.readerSettings.isOnline}
          >
            Video
          </button>
          <button
            className="btn-mystical flex-1"
            onClick={() => onConnect(reader._id, 'audio')}
            disabled={!reader.readerSettings.isOnline}
          >
            Audio
          </button>
          <button
            className="btn-mystical flex-1"
            onClick={() => onConnect(reader._id, 'chat')}
            disabled={!reader.readerSettings.isOnline}
          >
            Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReaderCard;
