import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const Messages = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Mock data - replace with actual API calls
  useEffect(() => {
    setConversations([
      {
        id: 1,
        participantName: "Mystic Luna",
        participantAvatar: "🌙",
        participantRole: "reader",
        lastMessage: "Thank you for the wonderful session! Feel free to reach out if you have any follow-up questions.",
        lastMessageTime: "2024-01-15T16:30:00Z",
        unreadCount: 0,
        isOnline: true
      },
      {
        id: 2,
        participantName: "Crystal Rose",
        participantAvatar: "🌹",
        participantRole: "reader",
        lastMessage: "I'm available for a reading today if you'd like to continue our conversation about your career path.",
        lastMessageTime: "2024-01-15T14:20:00Z",
        unreadCount: 2,
        isOnline: false
      },
      {
        id: 3,
        participantName: "SoulSeer Support",
        participantAvatar: "💬",
        participantRole: "admin",
        lastMessage: "Your recent order has been processed and will be shipped within 2-3 business days.",
        lastMessageTime: "2024-01-14T11:45:00Z",
        unreadCount: 0,
        isOnline: true
      }
    ]);
  }, []);

  useEffect(() => {
    if (activeChat) {
      // Mock messages for the active chat
      const mockMessages = {
        1: [
          {
            id: 1,
            senderId: 1,
            senderName: "Mystic Luna",
            content: "Hello! I hope you're doing well after our reading yesterday.",
            timestamp: "2024-01-15T15:30:00Z",
            isFromCurrentUser: false
          },
          {
            id: 2,
            senderId: user?.id,
            senderName: user?.firstName || "You",
            content: "Hi Luna! Yes, everything you said really resonated with me. Thank you so much!",
            timestamp: "2024-01-15T15:45:00Z",
            isFromCurrentUser: true
          },
          {
            id: 3,
            senderId: 1,
            senderName: "Mystic Luna",
            content: "I'm so glad to hear that! Remember what we discussed about trusting your intuition - you have more power than you realize.",
            timestamp: "2024-01-15T16:00:00Z",
            isFromCurrentUser: false
          },
          {
            id: 4,
            senderId: 1,
            senderName: "Mystic Luna",
            content: "Thank you for the wonderful session! Feel free to reach out if you have any follow-up questions.",
            timestamp: "2024-01-15T16:30:00Z",
            isFromCurrentUser: false
          }
        ],
        2: [
          {
            id: 1,
            senderId: 2,
            senderName: "Crystal Rose",
            content: "Hi there! I wanted to follow up on our discussion about career changes.",
            timestamp: "2024-01-15T14:00:00Z",
            isFromCurrentUser: false
          },
          {
            id: 2,
            senderId: 2,
            senderName: "Crystal Rose",
            content: "I'm available for a reading today if you'd like to continue our conversation about your career path.",
            timestamp: "2024-01-15T14:20:00Z",
            isFromCurrentUser: false
          }
        ],
        3: [
          {
            id: 1,
            senderId: 'admin',
            senderName: "SoulSeer Support",
            content: "Thank you for your recent purchase! Your order #12345 has been confirmed.",
            timestamp: "2024-01-14T11:30:00Z",
            isFromCurrentUser: false
          },
          {
            id: 2,
            senderId: 'admin',
            senderName: "SoulSeer Support",
            content: "Your recent order has been processed and will be shipped within 2-3 business days.",
            timestamp: "2024-01-14T11:45:00Z",
            isFromCurrentUser: false
          }
        ]
      };
      
      setMessages(mockMessages[activeChat] || []);
    }
  }, [activeChat, user]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChat) return;

    const message = {
      id: messages.length + 1,
      senderId: user?.id,
      senderName: user?.firstName || "You",
      content: newMessage,
      timestamp: new Date().toISOString(),
      isFromCurrentUser: true
    };

    setMessages([...messages, message]);
    setNewMessage('');
    
    // TODO: Send message via API
  };

  const handleStartReading = (readerId) => {
    // TODO: Implement start reading functionality
    alert(`Starting reading with reader ${readerId}`);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-alex-brush text-5xl text-mystical-pink mb-4">
            Messages
          </h1>
          <p className="font-playfair text-gray-300 text-lg">
            Connect with your readers and SoulSeer support
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
          {/* Conversations List */}
          <div className="card-mystical">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-alex-brush text-2xl text-mystical-pink">Conversations</h2>
              <button
                className="text-mystical-pink hover:text-pink-400 transition-colors"
                onClick={() => navigate('/readers')}
              >
                + New Chat
              </button>
            </div>
            
            <div className="space-y-3 overflow-y-auto max-h-[600px]">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setActiveChat(conversation.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    activeChat === conversation.id
                      ? 'bg-mystical-pink bg-opacity-20 border border-mystical-pink'
                      : 'bg-gray-800 bg-opacity-50 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="text-2xl">{conversation.participantAvatar}</div>
                      {conversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-playfair text-white font-semibold truncate">
                          {conversation.participantName}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-mystical-pink text-white rounded-full px-2 py-1 text-xs">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="font-playfair text-gray-300 text-sm truncate">
                        {conversation.lastMessage}
                      </p>
                      <p className="font-playfair text-gray-400 text-xs">
                        {formatTime(conversation.lastMessageTime)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2 card-mystical flex flex-col">
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">
                      {conversations.find(c => c.id === activeChat)?.participantAvatar}
                    </div>
                    <div>
                      <h3 className="font-playfair text-xl text-white font-semibold">
                        {conversations.find(c => c.id === activeChat)?.participantName}
                      </h3>
                      <p className="font-playfair text-gray-300 text-sm">
                        {conversations.find(c => c.id === activeChat)?.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  
                  {conversations.find(c => c.id === activeChat)?.participantRole === 'reader' && (
                    <button
                      className="btn-mystical"
                      onClick={() => handleStartReading(activeChat)}
                    >
                      Start Reading
                    </button>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4 max-h-[450px]">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isFromCurrentUser
                            ? 'bg-mystical-pink text-white'
                            : 'bg-gray-700 text-white'
                        }`}
                      >
                        <p className="font-playfair">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.isFromCurrentUser ? 'text-pink-100' : 'text-gray-400'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="input-mystical flex-1"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="btn-mystical px-6"
                    >
                      Send
                    </button>
                  </div>
                  
                  <div className="mt-3 text-center">
                    <p className="font-playfair text-gray-400 text-sm">
                      Messages with readers are free to send.
                      <span className="text-mystical-pink"> Readers may choose to charge for responses.</span>
                    </p>
                  </div>
                </div>
              </>
            ) : (
              /* No Chat Selected */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="font-alex-brush text-3xl text-mystical-pink mb-4">
                    Select a Conversation
                  </h3>
                  <p className="font-playfair text-gray-300 mb-6">
                    Choose a conversation from the left to start messaging
                  </p>
                  <button
                    className="btn-mystical"
                    onClick={() => navigate('/readers')}
                  >
                    Find a Reader to Chat With
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Messaging Guidelines */}
        <div className="card-mystical mt-8">
          <h2 className="font-alex-brush text-3xl text-mystical-pink mb-6">Messaging Guidelines</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-playfair text-xl text-white font-semibold mb-4">For Clients</h3>
              <ul className="space-y-3 font-playfair text-gray-300">
                <li className="flex items-start space-x-3">
                  <span className="text-mystical-pink mt-1">•</span>
                  <span>Sending messages to readers is always free</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-mystical-pink mt-1">•</span>
                  <span>Readers may choose to charge for detailed responses</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-mystical-pink mt-1">•</span>
                  <span>Be respectful and patient with response times</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-mystical-pink mt-1">•</span>
                  <span>For urgent matters, book a live reading session</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-playfair text-xl text-white font-semibold mb-4">Community Rules</h3>
              <ul className="space-y-3 font-playfair text-gray-300">
                <li className="flex items-start space-x-3">
                  <span className="text-mystical-gold mt-1">•</span>
                  <span>Keep conversations respectful and professional</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-mystical-gold mt-1">•</span>
                  <span>No sharing of personal contact information</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-mystical-gold mt-1">•</span>
                  <span>Report any inappropriate behavior to support</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-mystical-gold mt-1">•</span>
                  <span>All conversations are private and confidential</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;