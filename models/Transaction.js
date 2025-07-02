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

module.exports = mongoose.model('Transaction', transactionSchema);