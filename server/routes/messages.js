const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const { validateMessage } = require('../middleware/validation');

const router = express.Router();

// Send a message
router.post('/send', authMiddleware, validateMessage, async (req, res) => {
  try {
    const { receiverId, content, messageType = 'text', sessionId = null } = req.body;
    const senderId = req.user.userId;

    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Check if user is trying to message themselves
    if (senderId === receiverId) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }

    // Generate conversation ID
    const conversationId = Message.generateConversationId(senderId, receiverId);

    // Create message
    const message = new Message({
      senderId,
      receiverId,
      sessionId,
      conversationId,
      content,
      messageType,
      metadata: {
        clientIP: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    await message.save();

    // Populate sender info for response
    await message.populate('senderId', 'profile.name profile.avatar role');

    // Emit real-time message via socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('new-message', {
        receiverId,
        message: {
          id: message._id,
          conversationId,
          content: message.content,
          messageType: message.messageType,
          sender: {
            id: message.senderId._id,
            name: message.senderId.profile?.name || 'Anonymous',
            avatar: message.senderId.profile?.avatar,
            role: message.senderId.role
          },
          createdAt: message.createdAt
        }
      });
    }

    res.status(201).json({
      success: true,
      message: {
        id: message._id,
        conversationId,
        content: message.content,
        messageType: message.messageType,
        createdAt: message.createdAt,
        sender: {
          id: message.senderId._id,
          name: message.senderId.profile?.name || 'Anonymous',
          avatar: message.senderId.profile?.avatar
        }
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get conversation history
router.get('/conversation/:conversationId', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;
    const { page = 1, limit = 50, before, after } = req.query;

    // Verify user is part of this conversation
    const [userId1, userId2] = conversationId.split('_');
    if (userId !== userId1 && userId !== userId2) {
      return res.status(403).json({ message: 'Not authorized to view this conversation' });
    }

    const messages = await Message.getConversation(conversationId, {
      page: parseInt(page),
      limit: parseInt(limit),
      before,
      after
    });

    // Mark messages as read for the current user
    await Message.markConversationAsRead(conversationId, userId);

    res.json({
      success: true,
      messages,
      conversationId,
      pagination: {
        currentPage: parseInt(page),
        limit: parseInt(limit),
        hasMore: messages.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get recent conversations
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 20 } = req.query;

    const conversations = await Message.getRecentConversations(userId, parseInt(limit));

    // Format conversations for response
    const formattedConversations = conversations.map(conv => {
      const lastMessage = conv.lastMessage;
      const sender = conv.sender[0];
      const receiver = conv.receiver[0];
      
      // Determine the other participant
      const otherParticipant = lastMessage.senderId.toString() === userId 
        ? receiver 
        : sender;

      return {
        conversationId: conv._id,
        otherParticipant: {
          id: otherParticipant._id,
          name: otherParticipant.profile?.name || 'Anonymous',
          avatar: otherParticipant.profile?.avatar,
          role: otherParticipant.role,
          isOnline: otherParticipant.role === 'reader' ? otherParticipant.readerSettings?.isOnline : false
        },
        lastMessage: {
          content: lastMessage.content,
          messageType: lastMessage.messageType,
          createdAt: lastMessage.createdAt,
          isFromMe: lastMessage.senderId.toString() === userId
        },
        unreadCount: conv.unreadCount
      };
    });

    res.json({
      success: true,
      conversations: formattedConversations
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get unread message count
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const unreadCount = await Message.getUnreadCount(userId);

    res.json({
      success: true,
      unreadCount
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ 
      message: 'Failed to get unread count',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mark message as read
router.patch('/:messageId/read', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    const message = await Message.findOne({
      _id: messageId,
      receiverId: userId
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.markAsRead();

    res.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ 
      message: 'Failed to mark message as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mark entire conversation as read
router.patch('/conversation/:conversationId/read', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    // Verify user is part of this conversation
    const [userId1, userId2] = conversationId.split('_');
    if (userId !== userId1 && userId !== userId2) {
      return res.status(403).json({ message: 'Not authorized to modify this conversation' });
    }

    const result = await Message.markConversationAsRead(conversationId, userId);

    res.json({
      success: true,
      message: 'Conversation marked as read',
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Mark conversation as read error:', error);
    res.status(500).json({ 
      message: 'Failed to mark conversation as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Edit message
router.patch('/:messageId/edit', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    if (content.length > 2000) {
      return res.status(400).json({ message: 'Message must be less than 2000 characters' });
    }

    const message = await Message.findOne({
      _id: messageId,
      senderId: userId
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found or not authorized' });
    }

    // Check if message is too old to edit (e.g., 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (message.createdAt < fifteenMinutesAgo) {
      return res.status(400).json({ message: 'Message is too old to edit' });
    }

    await message.editContent(content.trim());

    // Emit real-time update via socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('message-edited', {
        messageId: message._id,
        conversationId: message.conversationId,
        newContent: message.content,
        editedAt: message.editedAt
      });
    }

    res.json({
      success: true,
      message: {
        id: message._id,
        content: message.content,
        isEdited: message.isEdited,
        editedAt: message.editedAt
      }
    });

  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ 
      message: 'Failed to edit message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete message
router.delete('/:messageId', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    const message = await Message.findOne({
      _id: messageId,
      senderId: userId
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found or not authorized' });
    }

    await message.softDelete(userId);

    // Emit real-time update via socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('message-deleted', {
        messageId: message._id,
        conversationId: message.conversationId
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ 
      message: 'Failed to delete message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add reaction to message
router.post('/:messageId/reaction', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.userId;

    if (!emoji || typeof emoji !== 'string') {
      return res.status(400).json({ message: 'Valid emoji is required' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Verify user is part of this conversation
    const [userId1, userId2] = message.conversationId.split('_');
    if (userId !== userId1 && userId !== userId2) {
      return res.status(403).json({ message: 'Not authorized to react to this message' });
    }

    await message.addReaction(userId, emoji);

    // Emit real-time update via socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('message-reaction', {
        messageId: message._id,
        conversationId: message.conversationId,
        userId,
        emoji,
        reactions: message.reactions
      });
    }

    res.json({
      success: true,
      message: 'Reaction added',
      reactions: message.reactions
    });

  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ 
      message: 'Failed to add reaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Remove reaction from message
router.delete('/:messageId/reaction', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.removeReaction(userId);

    // Emit real-time update via socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('message-reaction-removed', {
        messageId: message._id,
        conversationId: message.conversationId,
        userId,
        reactions: message.reactions
      });
    }

    res.json({
      success: true,
      message: 'Reaction removed',
      reactions: message.reactions
    });

  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ 
      message: 'Failed to remove reaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;