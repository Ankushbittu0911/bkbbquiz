const express = require('express');
const router = express.Router();
const Deposit = require('../models/Deposit');
const Settings = require('../models/Settings');
const { protect } = require('../middleware/auth');
const { uploadDeposit } = require('../utils/cloudinary');

// @POST /api/deposits — Create deposit request
router.post('/', protect, uploadDeposit.single('screenshot'), async (req, res, next) => {
  try {
    const { amount, transactionId, upiId } = req.body;
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }
    const settings = await Settings.findOne() || {};
    if (parseFloat(amount) < (settings.minDeposit || 10)) {
      return res.status(400).json({ success: false, message: `Minimum deposit is ₹${settings.minDeposit || 10}` });
    }
    if (parseFloat(amount) > (settings.maxDeposit || 50000)) {
      return res.status(400).json({ success: false, message: `Maximum deposit is ₹${settings.maxDeposit || 50000}` });
    }
    const deposit = await Deposit.create({
      userId: req.user._id,
      amount: parseFloat(amount),
      transactionId: transactionId || '',
      upiId: upiId || settings.merchantUpiId || '',
      screenshotUrl: req.file?.path || '',
      screenshotPublicId: req.file?.filename || '',
    });
    res.status(201).json({ success: true, message: 'Deposit request submitted. Admin will approve shortly.', deposit });
  } catch (err) { next(err); }
});

// @GET /api/deposits — User deposit history
router.get('/', protect, async (req, res, next) => {
  try {
    const deposits = await Deposit.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, deposits });
  } catch (err) { next(err); }
});

// @GET /api/settings/public — Merchant info for payment
router.get('/payment-info', async (req, res, next) => {
  try {
    const settings = await Settings.findOne().select('merchantUpiId merchantName appName');
    res.json({ success: true, settings: settings || { merchantUpiId: 'bkbbquiz@upi', merchantName: 'BKBBQUIZ' } });
  } catch (err) { next(err); }
});

module.exports = router;
