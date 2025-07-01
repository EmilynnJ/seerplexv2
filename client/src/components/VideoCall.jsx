import React, { useRef, useEffect } from 'react';

const VideoCall = ({ localStream, remoteStream, onToggleVideo, onToggleAudio, onEndCall }) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="relative w-full h-96 bg-black rounded-lg overflow-hidden">
      {/* Remote Video */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      
      {/* Local Video */}
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-4 right-4 w-32 h-24 object-cover rounded-lg border-2 border-mystical-pink"
      />
      
      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <button
          onClick={onToggleVideo}
          className="p-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
        >
          📹
        </button>
        <button
          onClick={onToggleAudio}
          className="p-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
        >
          🎤
        </button>
        <button
          onClick={onEndCall}
          className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          📞
        </button>
      </div>
    </div>
  );
};

export default VideoCall;