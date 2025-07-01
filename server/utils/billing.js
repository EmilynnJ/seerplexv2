const User = require('../models/User');
const Session = require('../models/Session');
const Transaction = require('../models/Transaction');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class BillingManager {
  constructor() {
    this.activeBillingIntervals = new Map();
    this.PLATFORM_FEE_RATE = 0.30; // 30%
    this.READER_SHARE_RATE = 0.70; // 70%
    this.MINIMUM_PAYOUT = 15.00; // $15
  }

  // Start billing for a session
  startSessionBilling(sessionId, clientId, readerId, ratePerMinute) {
    if (this.activeBillingIntervals.has(sessionId)) {
      console.log(`Billing already active for session ${sessionId}`);
      return;
    }

    console.log(`Starting billing for session ${sessionId} at $${ratePerMinute}/min`);

    const billingInterval = setInterval(async () => {
      try {
        await this.processMinuteBilling(sessionId, clientId, readerId, ratePerMinute);
      } catch (error) {
        console.error(`Billing error for session ${sessionId}:`, error);
        this.stopSessionBilling(sessionId);
      }
    }, 60000); // Bill every minute

    this.activeBillingIntervals.set(sessionId, {
      interval: billingInterval,
      clientId,
      readerId,
      rate: ratePerMinute,
      startTime: new Date()
    });
  }

  // Stop billing for a session
  stopSessionBilling(sessionId) {
    const billingData = this.activeBillingIntervals.get(sessionId);
    
    if (billingData) {
      clearInterval(billingData.interval);
      this.activeBillingIntervals.delete(sessionId);
      console.log(`Stopped billing for session ${sessionId}`);
    }
  }

  // Process a single minute of billing
  async processMinuteBilling(sessionId, clientId, readerId, ratePerMinute) {
    try {
      // Get current session and user data
      const [session, client, reader] = await Promise.all([
        Session.findOne({ sessionId, status: 'active' }),
        User.findById(clientId),
        User.findById(readerId)
      ]);

      if (!session || !client || !reader) {
        throw new Error('Session or users not found');
      }

      // Check if client has sufficient balance
      if (client.balance < ratePerMinute) {
        console.log(`Insufficient balance for session ${sessionId}. Ending session.`);
        await this.endSessionDueToInsufficientFunds(session);
        this.stopSessionBilling(sessionId);
        return;
      }

      // Calculate earnings split
      const platformFee = ratePerMinute * this.PLATFORM_FEE_RATE;
      const readerEarnings = ratePerMinute * this.READER_SHARE_RATE;

      // Process the charge
      await this.processCharge(client, reader, session, ratePerMinute, platformFee, readerEarnings);

      console.log(`Billed $${ratePerMinute} for session ${sessionId}`);

    } catch (error) {
      console.error('Minute billing error:', error);
      throw error;
    }
  }

  // Process the actual charge
  async processCharge(client, reader, session, amount, platformFee, readerEarnings) {
    // Start a transaction to ensure consistency
    const clientUpdate = User.findByIdAndUpdate(
      client._id,
      { $inc: { balance: -amount } },
      { new: true }
    );

    const readerUpdate = User.findByIdAndUpdate(
      reader._id,
      { 
        $inc: { 
          'earnings.pending': readerEarnings,
          'earnings.total': readerEarnings
        }
      },
      { new: true }
    );

    const sessionUpdate = session.addBilling(amount, 'Per-minute session charge');

    // Execute all updates
    const [updatedClient] = await Promise.all([clientUpdate, readerUpdate, sessionUpdate]);

    // Create transaction record
    const transaction = new Transaction({
      userId: client._id,
      sessionId: session._id,
      type: 'charge',
      amount,
      status: 'succeeded',
      description: `Session charge - ${session.sessionType}`,
      balanceBefore: updatedClient.balance + amount,
      balanceAfter: updatedClient.balance,
      fees: {
        platformFee,
        totalFees: platformFee
      },
      metadata: {
        sessionType: session.sessionType,
        readerId: reader._id,
        clientId: client._id,
        readerEarnings
      }
    });

    await transaction.save();

    return updatedClient;
  }

  // End session due to insufficient funds
  async endSessionDueToInsufficientFunds(session) {
    session.status = 'ended';
    session.endTime = new Date();
    
    if (session.startTime) {
      session.duration = Math.floor((session.endTime - session.startTime) / 1000);
    }
    
    session.notes = session.notes || {};
    session.notes.admin = 'Session ended due to insufficient client balance';
    
    await session.save();

    console.log(`Session ${session.sessionId} ended due to insufficient balance`);
  }

  // Process automatic payouts for readers
  async processAutomaticPayouts() {
    try {
      console.log('Processing automatic payouts...');

      // Find readers eligible for payout
      const eligibleReaders = await User.find({
        role: 'reader',
        'earnings.pending': { $gte: this.MINIMUM_PAYOUT },
        stripeAccountId: { $exists: true, $ne: null },
        isActive: true
      });

      const results = [];

      for (const reader of eligibleReaders) {
        try {
          const payoutResult = await this.processReaderPayout(reader);
          results.push({
            readerId: reader._id,
            email: reader.email,
            amount: payoutResult.amount,
            status: 'success',
            transferId: payoutResult.transferId
          });
        } catch (error) {
          console.error(`Payout failed for reader ${reader._id}:`, error);
          results.push({
            readerId: reader._id,
            email: reader.email,
            amount: reader.earnings.pending,
            status: 'failed',
            error: error.message
          });
        }
      }

      console.log(`Processed ${results.filter(r => r.status === 'success').length} automatic payouts`);
      return results;

    } catch (error) {
      console.error('Automatic payout processing error:', error);
      throw error;
    }
  }

  // Process individual reader payout
  async processReaderPayout(reader) {
    const payoutAmount = reader.earnings.pending;

    // Check Stripe account status
    const account = await stripe.accounts.retrieve(reader.stripeAccountId);
    
    if (!account.payouts_enabled) {
      throw new Error('Stripe account not ready for payouts');
    }

    // Create Stripe transfer
    const transfer = await stripe.transfers.create({
      amount: Math.round(payoutAmount * 100), // Convert to cents
      currency: 'usd',
      destination: reader.stripeAccountId,
      metadata: {
        userId: reader._id.toString(),
        type: 'automatic_payout',
        originalAmount: payoutAmount.toString()
      },
      description: `SoulSeer automatic payout for ${reader.email}`
    });

    // Update reader earnings
    reader.earnings.pending = 0;
    reader.earnings.paid += payoutAmount;
    reader.earnings.lastPayout = new Date();
    await reader.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: reader._id,
      type: 'payout',
      amount: payoutAmount,
      stripeTransferId: transfer.id,
      status: 'succeeded',
      description: `Automatic payout - $${payoutAmount.toFixed(2)}`,
      metadata: {
        automaticPayout: true,
        stripeAccountId: reader.stripeAccountId
      }
    });

    await transaction.save();

    return {
      amount: payoutAmount,
      transferId: transfer.id
    };
  }

  // Add funds to client balance
  async addFundsToClient(clientId, amount, paymentIntentId) {
    try {
      const client = await User.findById(clientId);
      if (!client) {
        throw new Error('Client not found');
      }

      const previousBalance = client.balance;
      client.balance += amount;
      await client.save();

      // Create transaction record
      const transaction = new Transaction({
        userId: clientId,
        type: 'deposit',
        amount,
        stripePaymentIntentId: paymentIntentId,
        status: 'succeeded',
        description: `Balance top-up - $${amount.toFixed(2)}`,
        balanceBefore: previousBalance,
        balanceAfter: client.balance
      });

      await transaction.save();

      console.log(`Added $${amount} to client ${client.email} balance`);
      return client;

    } catch (error) {
      console.error('Add funds error:', error);
      throw error;
    }
  }

  // Get billing statistics
  async getBillingStatistics(period = '30d') {
    try {
      let startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const [sessionStats, transactionStats] = await Promise.all([
        Session.aggregate([
          {
            $match: {
              status: 'ended',
              endTime: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: null,
              totalSessions: { $sum: 1 },
              totalRevenue: { $sum: '$totalCost' },
              totalDuration: { $sum: '$duration' },
              averageSessionCost: { $avg: '$totalCost' },
              averageSessionDuration: { $avg: '$duration' }
            }
          }
        ]),
        Transaction.aggregate([
          {
            $match: {
              status: 'succeeded',
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 },
              totalAmount: { $sum: '$amount' }
            }
          }
        ])
      ]);

      const stats = sessionStats[0] || {
        totalSessions: 0,
        totalRevenue: 0,
        totalDuration: 0,
        averageSessionCost: 0,
        averageSessionDuration: 0
      };

      const transactionBreakdown = {};
      transactionStats.forEach(stat => {
        transactionBreakdown[stat._id] = {
          count: stat.count,
          totalAmount: stat.totalAmount
        };
      });

      return {
        period,
        sessions: stats,
        transactions: transactionBreakdown,
        platformRevenue: stats.totalRevenue * this.PLATFORM_FEE_RATE,
        readerEarnings: stats.totalRevenue * this.READER_SHARE_RATE,
        activeBillingSessions: this.activeBillingIntervals.size
      };

    } catch (error) {
      console.error('Get billing statistics error:', error);
      throw error;
    }
  }

  // Get active billing sessions
  getActiveBillingSessions() {
    const sessions = [];
    
    for (const [sessionId, data] of this.activeBillingIntervals) {
      sessions.push({
        sessionId,
        clientId: data.clientId,
        readerId: data.readerId,
        rate: data.rate,
        startTime: data.startTime,
        duration: Math.floor((new Date() - data.startTime) / 1000)
      });
    }
    
    return sessions;
  }

  // Clean up billing for ended sessions
  cleanup() {
    console.log(`Cleaning up ${this.activeBillingIntervals.size} active billing intervals`);
    
    for (const [sessionId, data] of this.activeBillingIntervals) {
      clearInterval(data.interval);
    }
    
    this.activeBillingIntervals.clear();
  }
}

// Create singleton instance
const billingManager = new BillingManager();

// Schedule automatic payouts (run daily at 2 AM)
if (process.env.NODE_ENV === 'production') {
  const cron = require('node-cron');
  
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('Running scheduled automatic payouts...');
      await billingManager.processAutomaticPayouts();
    } catch (error) {
      console.error('Scheduled payout error:', error);
    }
  });
}

module.exports = billingManager;