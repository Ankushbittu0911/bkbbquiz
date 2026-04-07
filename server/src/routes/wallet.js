const express = require('express');
const router = express.Router();
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// @GET /api/wallet
router.get('/', protect, async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found' });
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, wallet, transactions });
  } catch (err) { next(err); }
});

module.exports = router;
