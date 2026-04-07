const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'contest_entry', 'prize_winning', 'refund', 'referral_bonus', 'admin_credit', 'admin_debit'],
    required: true,
  },
  amount: { type: Number, required: true },
  balanceType: { type: String, enum: ['deposit', 'winnings', 'both'], default: 'deposit' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'rejected'], default: 'completed' },
  reference: { type: String, default: '' }, // ticket number, deposit id, etc.
  description: { type: String, default: '' },
  balanceBefore: { type: Number, default: 0 },
  balanceAfter: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
