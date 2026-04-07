const express = require('express');
const router = express.Router();
const Settings = require('../../models/Settings');
const Deposit = require('../../models/Deposit');
const Withdrawal = require('../../models/Withdrawal');
const Winner = require('../../models/Winner');
const Ticket = require('../../models/Ticket');
const Contest = require('../../models/Contest');
const Transaction = require('../../models/Transaction');
const Wallet = require('../../models/Wallet');
const { protect } = require('../../middleware/auth');
const adminOnly = require('../../middleware/adminAuth');
const maintenanceMode = require('../../middleware/maintenance');

router.use(protect, adminOnly);

// @GET /api/admin/settings
router.get('/', async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json({ success: true, settings });
  } catch (err) { next(err); }
});

// @PUT /api/admin/settings
router.put('/', async (req, res, next) => {
  try {
    const allowedFields = [
      'merchantUpiId', 'merchantName', 'platformFeePercent', 'appName',
      'supportEmail', 'supportPhone', 'referralBonus', 'maintenanceMode',
      'minDeposit', 'maxDeposit', 'minWithdrawal', 'maxWithdrawal',
      'maxContestEntriesPerUser', 'statsFromDate',
    ];
    const updates = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    let settings = await Settings.findOneAndUpdate({}, updates, { returnDocument: 'after', upsert: true, runValidators: true });
    maintenanceMode.invalidateCache();
    res.json({ success: true, message: 'Settings updated', settings });
  } catch (err) { next(err); }
});

// @POST /api/admin/settings/reset-stats
// Hard-wipe: delete all financial/contest records and zero all wallets
router.post('/reset-stats', async (req, res, next) => {
  try {
    await Promise.all([
      Deposit.deleteMany({}),
      Withdrawal.deleteMany({}),
      Winner.deleteMany({}),
      Ticket.deleteMany({}),
      Transaction.deleteMany({}),
      Contest.deleteMany({}),
      Wallet.updateMany({}, { $set: { depositBalance: 0, winningsBalance: 0 } }),
      // Also clear statsFromDate so fresh slate starts from now
      Settings.findOneAndUpdate({}, { $set: { statsFromDate: null } }, { upsert: true }),
    ]);
    res.json({ success: true, message: 'All stats and platform data have been reset.' });
  } catch (err) { next(err); }
});

module.exports = router;
