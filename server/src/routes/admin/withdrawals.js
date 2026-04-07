const express = require('express');
const router = express.Router();
const Withdrawal = require('../../models/Withdrawal');
const Wallet = require('../../models/Wallet');
const Transaction = require('../../models/Transaction');
const { protect } = require('../../middleware/auth');
const adminOnly = require('../../middleware/adminAuth');

router.use(protect, adminOnly);

// @GET /api/admin/withdrawals
router.get('/', async (req, res, next) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status !== 'all') filter.status = status;
    const withdrawals = await Withdrawal.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name username mobile email')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Withdrawal.countDocuments(filter);
    res.json({ success: true, withdrawals, total });
  } catch (err) { next(err); }
});

// @PUT /api/admin/withdrawals/:id/approve
router.put('/:id/approve', async (req, res, next) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Withdrawal already ${withdrawal.status}` });
    }
    await Withdrawal.findByIdAndUpdate(withdrawal._id, {
      status: 'approved',
      approvedBy: req.user._id,
      approvedAt: new Date(),
      transactionReference: req.body.utr || '',
      adminNote: req.body.note || '',
    });
    // Update transaction status
    await Transaction.findOneAndUpdate({ reference: withdrawal._id.toString(), type: 'withdrawal' }, { status: 'completed' });
    res.json({ success: true, message: 'Withdrawal approved', withdrawal });
  } catch (err) { next(err); }
});

// @PUT /api/admin/withdrawals/:id/reject
router.put('/:id/reject', async (req, res, next) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Withdrawal already ${withdrawal.status}` });
    }
    await Withdrawal.findByIdAndUpdate(withdrawal._id, {
      status: 'rejected',
      adminNote: req.body.reason || 'Rejected by admin',
      approvedBy: req.user._id,
    });
    // Refund to winnings balance
    await Wallet.findOneAndUpdate({ userId: withdrawal.userId }, { $inc: { winningsBalance: withdrawal.amount } });
    await Transaction.findOneAndUpdate({ reference: withdrawal._id.toString(), type: 'withdrawal' }, { status: 'failed' });
    await Transaction.create({
      userId: withdrawal.userId,
      type: 'refund',
      amount: withdrawal.amount,
      balanceType: 'winnings',
      status: 'completed',
      description: 'Withdrawal rejected - amount refunded',
    });
    res.json({ success: true, message: 'Withdrawal rejected and amount refunded', withdrawal });
  } catch (err) { next(err); }
});

module.exports = router;
