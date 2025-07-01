const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  readerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionType: {
    type: String,
    enum: ['video', 'audio', 'chat'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'ended', 'cancelled'],
    default: 'pending',
    index: true
  },
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: 0 // in seconds
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  totalCost: {
    type: Number,
    default: 0
  },
  platformFee: {
    type: Number,
    default: 0
  },
  readerEarnings: {
    type: Number,
    default: 0
  },
  billingHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    amount: {
      type: Number,
      required: true
    },
    description: String,
    transactionId: String
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  review: {
    type: String,
    maxlength: 1000
  },
  readerResponse: {
    type: String,
    maxlength: 500
  },
  notes: {
    client: {
      type: String,
      maxlength: 1000
    },
    reader: {
      type: String,
      maxlength: 1000
    },
    admin: {
      type: String,
      maxlength: 1000
    }
  },
  metadata: {
    clientIP: String,
    userAgent: String,
    connectionQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: null
    },
    disconnections: {
      type: Number,
      default: 0
    },
    reconnections: {
      type: Number,
      default: 0
    }
  },
  flags: {
    disputed: {
      type: Boolean,
      default: false
    },
    refunded: {
      type: Boolean,
      default: false
    },
    technical_issues: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
sessionSchema.index({ clientId: 1, createdAt: -1 });
sessionSchema.index({ readerId: 1, createdAt: -1 });
sessionSchema.index({ status: 1, createdAt: -1 });
sessionSchema.index({ sessionType: 1 });

// Virtual for formatted duration
sessionSchema.virtual('formattedDuration').get(function() {
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes}m ${seconds}s`;
});

// Method to calculate earnings split
sessionSchema.methods.calculateEarnings = function() {
  const platformFeeRate = 0.30; // 30% platform fee
  const readerShare = 0.70; // 70% to reader
  
  this.platformFee = this.totalCost * platformFeeRate;
  this.readerEarnings = this.totalCost * readerShare;
  
  return {
    platformFee: this.platformFee,
    readerEarnings: this.readerEarnings
  };
};

// Method to add billing entry
sessionSchema.methods.addBilling = function(amount, description = 'Session charge') {
  this.billingHistory.push({
    amount,
    description,
    timestamp: new Date()
  });
  
  this.totalCost += amount;
  this.calculateEarnings();
  
  return this.save();
};

// Method to end session
sessionSchema.methods.endSession = function() {
  if (this.status === 'active' && this.startTime) {
    this.endTime = new Date();
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  }
  this.status = 'ended';
  return this.save();
};

// Static method to get session statistics
sessionSchema.statics.getStatistics = async function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalRevenue: { $sum: '$totalCost' },
        totalDuration: { $sum: '$duration' },
        averageRating: { $avg: '$rating' },
        averageDuration: { $avg: '$duration' }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalSessions: 0,
    totalRevenue: 0,
    totalDuration: 0,
    averageRating: 0,
    averageDuration: 0
  };
};

module.exports = mongoose.model('Session', sessionSchema);