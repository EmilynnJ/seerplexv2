const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    default: null,
    index: true
  },
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system', 'gift'],
    default: 'text'
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'file', 'audio', 'video']
    },
    url: String,
    filename: String,
    size: Number,
    mimeType: String
  }],
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date,
    default: null
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  originalContent: {
    type: String,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    isPaid: {
      type: Boolean,
      default: false
    },
    cost: {
      type: Number,
      default: 0
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    tags: [String],
    clientIP: String,
    userAgent: String
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sessionId: 1, createdAt: 1 });
messageSchema.index({ isRead: 1, receiverId: 1 });

// Virtual for conversation participants
messageSchema.virtual('participants').get(function() {
  return [this.senderId, this.receiverId];
});

// Method to mark as read
messageSchema.methods.markAsRead = function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to edit message
messageSchema.methods.editContent = function(newContent) {
  if (!this.isEdited) {
    this.originalContent = this.content;
  }
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

// Method to soft delete message
messageSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

// Method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => !r.userId.equals(userId));
  
  // Add new reaction
  this.reactions.push({
    userId,
    emoji,
    createdAt: new Date()
  });
  
  return this.save();
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => !r.userId.equals(userId));
  return this.save();
};

// Static method to get conversation history
messageSchema.statics.getConversation = async function(conversationId, options = {}) {
  const {
    page = 1,
    limit = 50,
    before = null,
    after = null
  } = options;

  const query = {
    conversationId,
    isDeleted: false
  };

  if (before) query.createdAt = { $lt: new Date(before) };
  if (after) query.createdAt = { $gt: new Date(after) };

  const messages = await this.find(query)
    .populate('senderId', 'profile.name profile.avatar role')
    .populate('receiverId', 'profile.name profile.avatar role')
    .populate('replyTo', 'content senderId createdAt')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  return messages.reverse(); // Return in chronological order
};

// Static method to get unread count
messageSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    receiverId: userId,
    isRead: false,
    isDeleted: false
  });
};

// Static method to mark conversation as read
messageSchema.statics.markConversationAsRead = async function(conversationId, userId) {
  return await this.updateMany(
    {
      conversationId,
      receiverId: userId,
      isRead: false,
      isDeleted: false
    },
    {
      $set: {
        isRead: true,
        readAt: new Date()
      }
    }
  );
};

// Static method to get recent conversations
messageSchema.statics.getRecentConversations = async function(userId, limit = 20) {
  const pipeline = [
    {
      $match: {
        $or: [
          { senderId: mongoose.Types.ObjectId(userId) },
          { receiverId: mongoose.Types.ObjectId(userId) }
        ],
        isDeleted: false
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$receiverId', mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$isRead', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.senderId',
        foreignField: '_id',
        as: 'sender'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.receiverId',
        foreignField: '_id',
        as: 'receiver'
      }
    }
  ];

  return await this.aggregate(pipeline);
};

// Helper function to generate conversation ID
messageSchema.statics.generateConversationId = function(userId1, userId2) {
  const ids = [userId1.toString(), userId2.toString()].sort();
  return `${ids[0]}_${ids[1]}`;
};

module.exports = mongoose.model('Message', messageSchema);