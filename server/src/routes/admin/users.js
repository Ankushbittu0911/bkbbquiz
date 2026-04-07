const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Wallet = require('../../models/Wallet');
const Transaction = require('../../models/Transaction');
const Ticket = require('../../models/Ticket');
const Deposit = require('../../models/Deposit');
const Withdrawal = require('../../models/Withdrawal');
const { protect } = require('../../middleware/auth');
const adminOnly = require('../../middleware/adminAuth');

router.use(protect, adminOnly);

// @GET /api/admin/users
router.get('/', async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = { isAdmin: false };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-password');
    const total = await User.countDocuments(filter);
    // Attach wallet to each user
    const userIds = users.map(u => u._id);
    const wallets = await Wallet.find({ userId: { $in: userIds } });
    const walletMap = {};
    wallets.forEach(w => { walletMap[w.userId.toString()] = w; });
    const usersWithWallet = users.map(u => ({ ...u.toObject(), wallet: walletMap[u._id.toString()] || null }));
    res.json({ success: true, users: usersWithWallet, total });
  } catch (err) { next(err); }
});

// @GET /api/admin/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const [wallet, tickets, deposits, withdrawals] = await Promise.all([
      Wallet.findOne({ userId: user._id }),
      Ticket.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20).populate('contestId', 'title'),
      Deposit.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10),
      Withdrawal.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10),
    ]);
    res.json({ success: true, user, wallet, tickets, deposits, withdrawals });
  } catch (err) { next(err); }
});

// @PUT /api/admin/users/:id/ban
router.put('/:id/ban', async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: true }, { returnDocument: 'after' });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User banned', user });
  } catch (err) { next(err); }
});

// @PUT /api/admin/users/:id/unban
router.put('/:id/unban', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: false }, { returnDocument: 'after' });
    res.json({ success: true, message: 'User unbanned', user });
  } catch (err) { next(err); }
});

// @PUT /api/admin/users/:id/wallet — Manually adjust wallet
router.put('/:id/wallet', async (req, res, next) => {
  try {
    const { amount, type, balanceType, description } = req.body;
    if (!amount || !type) return res.status(400).json({ success: false, message: 'amount and type required' });
    const wallet = await Wallet.findOne({ userId: req.params.id });
    if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found' });
    const amountNum = parseFloat(amount);
    const walletUpdate = {};
    if (type === 'credit') {
      walletUpdate[balanceType === 'winnings' ? 'winningsBalance' : 'depositBalance'] = 
        wallet[balanceType === 'winnings' ? 'winningsBalance' : 'depositBalance'] + amountNum;
    } else if (type === 'debit') {
      const field = balanceType === 'winnings' ? 'winningsBalance' : 'depositBalance';
      walletUpdate[field] = Math.max(0, wallet[field] - amountNum);
    }
    await Wallet.findByIdAndUpdate(wallet._id, walletUpdate);
    await Transaction.create({
      userId: req.params.id,
      type: type === 'credit' ? 'admin_credit' : 'admin_debit',
      amount: amountNum,
      balanceType: balanceType || 'deposit',
      description: description || `Admin ${type}`,
    });
    res.json({ success: true, message: 'Wallet adjusted', wallet });
  } catch (err) { next(err); }
});

module.exports = router;
