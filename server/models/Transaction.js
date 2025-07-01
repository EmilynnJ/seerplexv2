const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
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
  type: {
    type: String,
    enum: ['charge', 'refund', 'payout', 'deposit', 'adjustment'],
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd',
    uppercase: true
  },
  stripePaymentIntentId: {
    type: String,
    default: null
  },
  stripeTransferId: {
    type: String,
    default: null
  },
  stripeChargeId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    sessionType: String,
    readerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    originalTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    },
    adminNotes: String,
    automaticPayout: {
      type: Boolean,
      default: false
    }
  },
  balanceAfter: {
    type: Number,
    default: null
  },
  balanceBefore: {
    type: Number,
    default: null
  },
  fees: {
    stripeFee: {
      type: Number,
      default: 0
    },
    platformFee: {
      type: Number,
      default: 0
    },
    totalFees: {
      type: Number,
      default: 0
    }
  },
  processedAt: {
    type: Date,
    default: null
  },
  failureReason: {
    type: String,
    default: null
  },
  retryCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ stripePaymentIntentId: 1 });
transactionSchema.index({ stripeTransferId: 1 });
transactionSchema.index({ createdAt: -1 });

// Virtual for net amount (amount minus fees)
transactionSchema.virtual('netAmount').get(function() {
  return this.amount - this.fees.totalFees;
});

// Method to mark as processed
transactionSchema.methods.markAsProcessed = function(balanceAfter = null) {
  this.status = 'succeeded';
  this.processedAt = new Date();
  if (balanceAfter !== null) {
    this.balanceAfter = balanceAfter;
  }
  return this.save();
};

// Method to mark as failed
transactionSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  this.processedAt = new Date();
  return this.save();
};

// Static method to get user transaction history
transactionSchema.statics.getUserHistory = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    type = null,
    status = null,
    startDate = null,
    endDate = null
  } = options;

  const query = { userId };
  
  if (type) query.type = type;
  if (status) query.status = status;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const transactions = await this.find(query)
    .populate('sessionId', 'sessionType duration')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const total = await this.countDocuments(query);

  return {
    transactions,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  };
};

// Static method to get transaction statistics
transactionSchema.statics.getStatistics = async function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        averageAmount: { $avg: '$amount' }
      }
    }
  ];

  const results = await this.aggregate(pipeline);
  
  const stats = {
    charge: { count: 0, totalAmount: 0, averageAmount: 0 },
    refund: { count: 0, totalAmount: 0, averageAmount: 0 },
    payout: { count: 0, totalAmount: 0, averageAmount: 0 },
    deposit: { count: 0, totalAmount: 0, averageAmount: 0 }
  };

  results.forEach(result => {
    if (stats[result._id]) {
      stats[result._id] = {
        count: result.count,
        totalAmount: result.totalAmount,
        averageAmount: result.averageAmount
      };
    }
  });

  return stats;
};

// Static method for daily revenue report
transactionSchema.statics.getDailyRevenue = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pipeline = [
    {
      $match: {
        type: 'charge',
        status: 'succeeded',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        revenue: { $sum: '$amount' },
        transactions: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ];

  return await this.aggregate(pipeline);
};

module.exports = mongoose.model('Transaction', transactionSchema);