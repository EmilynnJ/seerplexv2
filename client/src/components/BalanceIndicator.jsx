import React from 'react';

const BalanceIndicator = ({ balance, readerRate }) => {
  const minutesRemaining = Math.floor(balance / readerRate);
  const isLowBalance = minutesRemaining < 5;

  return (
    <div className={`p-4 rounded-lg border-2 ${
      isLowBalance 
        ? 'bg-red-900 bg-opacity-30 border-red-500' 
        : 'bg-green-900 bg-opacity-30 border-green-500'
    }`}>
      <div className="text-center">
        <div className="font-playfair text-2xl font-bold text-white mb-1">
          ${balance.toFixed(2)}
        </div>
        <div className="font-playfair text-sm text-gray-300 mb-2">
          Account Balance
        </div>
        <div className={`font-playfair text-sm ${isLowBalance ? 'text-red-400' : 'text-green-400'}`}>
          ~{minutesRemaining} minutes remaining
        </div>
        {isLowBalance && (
          <div className="mt-2">
            <button className="btn-mystical text-xs px-3 py-1">
              Add Funds
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceIndicator;