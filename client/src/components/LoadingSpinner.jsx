import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-2 border-mystical-pink border-t-transparent rounded-full animate-spin mb-2`}></div>
      <p className="font-playfair text-white text-sm">{text}</p>
    </div>
  );
};

export default LoadingSpinner;