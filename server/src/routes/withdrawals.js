const express = require('express');
const router = express.Router();
const Withdrawal = require('../models/Withdrawal');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');
const { protect } = require('../middleware/auth');

// @POST /api/withdrawals — Create withdrawal request
router.post('/', protect, async (req, res, next) => {
  try {
    const { amount, name, upiId } = req.body;
    if (!amount || !name || !upiId) {
      return res.status(400).json({ success: false, message: 'Amount, name, and UPI ID are required' });
    }
    const amountNum = parseFloat(amount);
    const settings = await Settings.findOne() || {};
    if (amountNum < (settings.minWithdrawal || 100)) {
      return res.status(400).json({ success: false, message: `Minimum withdrawal is ₹${settings.minWithdrawal || 100}` });
    }
    if (amountNum > (settings.maxWithdrawal || 10000)) {
      return res.status(400).json({ success: false, message: `Maximum withdrawal is ₹${settings.maxWithdrawal || 10000}` });
    }
    // Check winnings balance only
    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet || wallet.winningsBalance < amountNum) {
      return res.status(400).json({ success: false, message: 'Insufficient winnings balance. Only winnings can be withdrawn.' });
    }
    // Reserve amount (deduct immediately, refund on rejection)
    await Wallet.findByIdAndUpdate(wallet._id, { $inc: { winningsBalance: -amountNum } });
    const withdrawal = await Withdrawal.create({ userId: req.user._id, amount: amountNum, name, upiId });
    await Transaction.create({
      userId: req.user._id,
      type: 'withdrawal',
      amount: amountNum,
      balanceType: 'winnings',
      status: 'pending',
      reference: withdrawal._id.toString(),
      description: `Withdrawal request to ${upiId}`,
    });
    res.status(201).json({ success: true, message: 'Withdrawal request submitted. Will be processed within 24 hours.', withdrawal });
  } catch (err) { next(err); }
});

// @GET /api/withdrawals
router.get('/', protect, async (req, res, next) => {
  try {
    const withdrawals = await Withdrawal.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, withdrawals });
  } catch (err) { next(err); }
});

module.exports = router;
