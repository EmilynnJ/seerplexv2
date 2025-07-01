import React, { useState, useRef, useEffect } from 'react';

const ChatBox = ({ messages, onSendMessage, connectionStatus }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim() && connectionStatus === 'connected') {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="card-mystical h-96 flex flex-col">
      <h3 className="font-playfair text-xl text-mystical-pink mb-4">Chat</h3>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg max-w-xs ${
              message.sender === 'client' 
                ? 'bg-mystical-pink text-white ml-auto' 
                : 'bg-gray-700 text-white'
            }`}
          >
            <p className="font-playfair text-sm">{message.text}</p>
            <span className="text-xs opacity-70">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="input-mystical flex-1"
          disabled={connectionStatus !== 'connected'}
        />
        <button
          type="submit"
          className="btn-mystical"
          disabled={connectionStatus !== 'connected' || !newMessage.trim()}
        >
          Send
        </button>
      </form>
      
      {connectionStatus !== 'connected' && (
        <p className="font-playfair text-yellow-400 text-sm mt-2">
          {connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
        </p>
      )}
    </div>
  );
};

export default ChatBox;