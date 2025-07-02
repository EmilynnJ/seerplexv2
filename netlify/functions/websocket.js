const { createServer } = require('http');
const { Server } = require('socket.io');
const serverless = require('serverless-http');
const express = require('express');

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});

// WebRTC Signaling
const activeSessions = new Map();
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`User ${socket.id} joined session ${sessionId}`);
    
    // Track active sessions
    if (!activeSessions.has(sessionId)) {
      activeSessions.set(sessionId, new Set());
    }
    activeSessions.get(sessionId).add(socket.id);
    
    // Notify others in the session
    socket.to(sessionId).emit('user-joined', socket.id);
  });

  socket.on('offer', ({ sessionId, offer }) => {
    console.log(`Offer received for session ${sessionId}`);
    socket.to(sessionId).emit('offer', offer);
  });

  socket.on('answer', ({ sessionId, answer }) => {
    console.log(`Answer received for session ${sessionId}`);
    socket.to(sessionId).emit('answer', answer);
  });

  socket.on('ice-candidate', ({ sessionId, candidate }) => {
    socket.to(sessionId).emit('ice-candidate', candidate);
  });

  socket.on('end-session', (sessionId) => {
    console.log(`Session ${sessionId} ended by ${socket.id}`);
    socket.to(sessionId).emit('session-ended');
    socket.leave(sessionId);
    
    // Clean up session tracking
    if (activeSessions.has(sessionId)) {
      activeSessions.get(sessionId).delete(socket.id);
      if (activeSessions.get(sessionId).size === 0) {
        activeSessions.delete(sessionId);
      }
    }
  });

  socket.on('reader-notification', ({ readerId, sessionRequest }) => {
    // Find reader's socket and send notification
    const readerSocketId = userSockets.get(readerId);
    if (readerSocketId) {
      io.to(readerSocketId).emit('new-session-request', sessionRequest);
    }
  });

  socket.on('register-user', (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Clean up user socket mapping
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
    
    // Clean up session tracking
    for (const [sessionId, sockets] of activeSessions.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          activeSessions.delete(sessionId);
        }
      }
    }
  });
});

// Note: For Netlify, this is provided as reference for implementing WebSockets
// This won't work directly as a Netlify Function, as Netlify Functions don't support
// long-lived connections. For production, consider using:
// 1. Netlify's WebSocket streaming feature (currently in beta)
// 2. A separate WebSocket service (like Pusher, Socket.io cloud, etc.)
// 3. Moving to Netlify Edge Functions which have better WebSocket support

// For the purposes of this example, we include the code for reference
module.exports.handler = serverless(app);

// Export io for testing
module.exports.io = io;