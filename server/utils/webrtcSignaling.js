const Session = require('../models/Session');
const User = require('../models/User');

class WebRTCSignaling {
  constructor(io) {
    this.io = io;
    this.activeSessions = new Map();
    this.userSockets = new Map();
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`WebRTC: User connected - ${socket.id}`);

      // Register user with their socket
      socket.on('register-user', (userId) => {
        this.userSockets.set(userId, socket.id);
        socket.userId = userId;
        console.log(`WebRTC: User ${userId} registered with socket ${socket.id}`);
      });

      // Join a session room
      socket.on('join-session', async (data) => {
        try {
          const { sessionId, userId } = data;
          
          // Verify session exists and user is authorized
          const session = await Session.findOne({ sessionId })
            .populate('clientId readerId');
          
          if (!session) {
            socket.emit('error', { message: 'Session not found' });
            return;
          }

          const isAuthorized = session.clientId._id.toString() === userId || 
                              session.readerId._id.toString() === userId;
          
          if (!isAuthorized) {
            socket.emit('error', { message: 'Not authorized for this session' });
            return;
          }

          // Join the session room
          socket.join(sessionId);
          socket.sessionId = sessionId;
          
          // Track active session
          if (!this.activeSessions.has(sessionId)) {
            this.activeSessions.set(sessionId, {
              participants: new Set(),
              session: session
            });
          }
          
          this.activeSessions.get(sessionId).participants.add(socket.id);
          
          // Notify other participants
          socket.to(sessionId).emit('user-joined', {
            userId,
            socketId: socket.id,
            userRole: session.clientId._id.toString() === userId ? 'client' : 'reader'
          });

          console.log(`WebRTC: User ${userId} joined session ${sessionId}`);
          
        } catch (error) {
          console.error('WebRTC join session error:', error);
          socket.emit('error', { message: 'Failed to join session' });
        }
      });

      // Handle WebRTC offer
      socket.on('webrtc-offer', (data) => {
        const { sessionId, offer, targetUserId } = data;
        
        if (!socket.sessionId || socket.sessionId !== sessionId) {
          socket.emit('error', { message: 'Not in session' });
          return;
        }

        // Forward offer to target user
        if (targetUserId) {
          const targetSocketId = this.userSockets.get(targetUserId);
          if (targetSocketId) {
            this.io.to(targetSocketId).emit('webrtc-offer', {
              sessionId,
              offer,
              fromUserId: socket.userId
            });
          }
        } else {
          // Broadcast to all other participants in session
          socket.to(sessionId).emit('webrtc-offer', {
            sessionId,
            offer,
            fromUserId: socket.userId
          });
        }
      });

      // Handle WebRTC answer
      socket.on('webrtc-answer', (data) => {
        const { sessionId, answer, targetUserId } = data;
        
        if (!socket.sessionId || socket.sessionId !== sessionId) {
          socket.emit('error', { message: 'Not in session' });
          return;
        }

        // Forward answer to target user
        if (targetUserId) {
          const targetSocketId = this.userSockets.get(targetUserId);
          if (targetSocketId) {
            this.io.to(targetSocketId).emit('webrtc-answer', {
              sessionId,
              answer,
              fromUserId: socket.userId
            });
          }
        } else {
          socket.to(sessionId).emit('webrtc-answer', {
            sessionId,
            answer,
            fromUserId: socket.userId
          });
        }
      });

      // Handle ICE candidates
      socket.on('webrtc-ice-candidate', (data) => {
        const { sessionId, candidate, targetUserId } = data;
        
        if (!socket.sessionId || socket.sessionId !== sessionId) {
          socket.emit('error', { message: 'Not in session' });
          return;
        }

        // Forward ICE candidate
        if (targetUserId) {
          const targetSocketId = this.userSockets.get(targetUserId);
          if (targetSocketId) {
            this.io.to(targetSocketId).emit('webrtc-ice-candidate', {
              sessionId,
              candidate,
              fromUserId: socket.userId
            });
          }
        } else {
          socket.to(sessionId).emit('webrtc-ice-candidate', {
            sessionId,
            candidate,
            fromUserId: socket.userId
          });
        }
      });

      // Handle session chat messages
      socket.on('session-message', async (data) => {
        try {
          const { sessionId, message, messageType = 'text' } = data;
          
          if (!socket.sessionId || socket.sessionId !== sessionId) {
            socket.emit('error', { message: 'Not in session' });
            return;
          }

          const sessionData = this.activeSessions.get(sessionId);
          if (!sessionData) {
            socket.emit('error', { message: 'Session not active' });
            return;
          }

          // Broadcast message to all participants
          const messageData = {
            sessionId,
            message,
            messageType,
            fromUserId: socket.userId,
            timestamp: new Date().toISOString()
          };

          this.io.to(sessionId).emit('session-message', messageData);
          
        } catch (error) {
          console.error('WebRTC session message error:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle connection quality updates
      socket.on('connection-quality', (data) => {
        const { sessionId, quality, stats } = data;
        
        if (!socket.sessionId || socket.sessionId !== sessionId) {
          return;
        }

        // Forward quality info to other participants
        socket.to(sessionId).emit('peer-connection-quality', {
          fromUserId: socket.userId,
          quality,
          stats
        });
      });

      // Handle session end
      socket.on('end-session', async (data) => {
        try {
          const { sessionId } = data;
          
          if (!socket.sessionId || socket.sessionId !== sessionId) {
            socket.emit('error', { message: 'Not in session' });
            return;
          }

          // Notify all participants
          socket.to(sessionId).emit('session-ended', {
            sessionId,
            endedBy: socket.userId,
            reason: 'user_ended'
          });

          // Clean up session
          await this.cleanupSession(sessionId, socket);
          
        } catch (error) {
          console.error('WebRTC end session error:', error);
        }
      });

      // Handle disconnection
      socket.on('disconnect', async () => {
        console.log(`WebRTC: User disconnected - ${socket.id}`);
        
        // Clean up user socket mapping
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
        }
        
        // Clean up session if user was in one
        if (socket.sessionId) {
          await this.cleanupSession(socket.sessionId, socket);
        }
      });
    });
  }

  async cleanupSession(sessionId, socket) {
    try {
      const sessionData = this.activeSessions.get(sessionId);
      
      if (sessionData) {
        sessionData.participants.delete(socket.id);
        
        // If no participants left, remove session
        if (sessionData.participants.size === 0) {
          this.activeSessions.delete(sessionId);
          console.log(`WebRTC: Session ${sessionId} cleaned up`);
        } else {
          // Notify remaining participants
          socket.to(sessionId).emit('participant-left', {
            userId: socket.userId,
            remainingParticipants: sessionData.participants.size
          });
        }
      }
      
      // Leave the socket room
      socket.leave(sessionId);
      
    } catch (error) {
      console.error('WebRTC cleanup session error:', error);
    }
  }

  // Notify reader of new session request
  notifyReaderOfSessionRequest(readerId, sessionRequest) {
    const readerSocketId = this.userSockets.get(readerId);
    
    if (readerSocketId) {
      this.io.to(readerSocketId).emit('new-session-request', sessionRequest);
      console.log(`WebRTC: Notified reader ${readerId} of new session request`);
      return true;
    }
    
    return false;
  }

  // Notify client of session acceptance
  notifyClientOfSessionAcceptance(clientId, sessionData) {
    const clientSocketId = this.userSockets.get(clientId);
    
    if (clientSocketId) {
      this.io.to(clientSocketId).emit('session-accepted', sessionData);
      console.log(`WebRTC: Notified client ${clientId} of session acceptance`);
      return true;
    }
    
    return false;
  }

  // Force end session (for billing issues, etc.)
  forceEndSession(sessionId, reason = 'system_ended') {
    const sessionData = this.activeSessions.get(sessionId);
    
    if (sessionData) {
      this.io.to(sessionId).emit('session-force-ended', {
        sessionId,
        reason,
        message: this.getEndReasonMessage(reason)
      });
      
      // Clean up
      this.activeSessions.delete(sessionId);
      console.log(`WebRTC: Force ended session ${sessionId} - ${reason}`);
    }
  }

  getEndReasonMessage(reason) {
    const messages = {
      'insufficient_balance': 'Session ended due to insufficient balance',
      'reader_offline': 'Session ended because reader went offline',
      'system_maintenance': 'Session ended for system maintenance',
      'violation': 'Session ended due to policy violation',
      'technical_error': 'Session ended due to technical error'
    };
    
    return messages[reason] || 'Session ended';
  }

  // Get active session count
  getActiveSessionCount() {
    return this.activeSessions.size;
  }

  // Get connected user count
  getConnectedUserCount() {
    return this.userSockets.size;
  }

  // Get session participants
  getSessionParticipants(sessionId) {
    const sessionData = this.activeSessions.get(sessionId);
    return sessionData ? Array.from(sessionData.participants) : [];
  }
}

module.exports = WebRTCSignaling;