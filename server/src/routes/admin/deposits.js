const express = require('express');
const router = express.Router();
const Deposit = require('../../models/Deposit');
const Wallet = require('../../models/Wallet');
const Transaction = require('../../models/Transaction');
const { protect } = require('../../middleware/auth');
const adminOnly = require('../../middleware/adminAuth');

router.use(protect, adminOnly);

// @GET /api/admin/deposits
router.get('/', async (req, res, next) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status !== 'all') filter.status = status;
    const deposits = await Deposit.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name username mobile email')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Deposit.countDocuments(filter);
    const pendingTotal = await Deposit.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    res.json({ success: true, deposits, total, pendingTotal: pendingTotal[0]?.total || 0 });
  } catch (err) { next(err); }
});

// @PUT /api/admin/deposits/:id/approve
router.put('/:id/approve', async (req, res, next) => {
  try {
    const deposit = await Deposit.findById(req.params.id);
    if (!deposit) return res.status(404).json({ success: false, message: 'Deposit not found' });
    if (deposit.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Deposit already ${deposit.status}` });
    }
    await Deposit.findByIdAndUpdate(deposit._id, {
      status: 'approved',
      approvedBy: req.user._id,
      approvedAt: new Date(),
      adminNote: req.body.note || '',
    });
    // Credit wallet
    await Wallet.findOneAndUpdate({ userId: deposit.userId }, { $inc: { depositBalance: deposit.amount } }, { upsert: true });
    await Transaction.create({
      userId: deposit.userId,
      type: 'deposit',
      amount: deposit.amount,
      balanceType: 'deposit',
      status: 'completed',
      reference: deposit._id.toString(),
      description: `Deposit approved`,
    });
    res.json({ success: true, message: 'Deposit approved and wallet credited', deposit });
  } catch (err) { next(err); }
});

// @PUT /api/admin/deposits/:id/reject
router.put('/:id/reject', async (req, res, next) => {
  try {
    const deposit = await Deposit.findById(req.params.id);
    if (!deposit) return res.status(404).json({ success: false, message: 'Deposit not found' });
    if (deposit.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Deposit already ${deposit.status}` });
    }
    await Deposit.findByIdAndUpdate(deposit._id, {
      status: 'rejected',
      adminNote: req.body.reason || 'Rejected by admin',
      approvedBy: req.user._id,
    });
    res.json({ success: true, message: 'Deposit rejected', deposit });
  } catch (err) { next(err); }
});

module.exports = router;
