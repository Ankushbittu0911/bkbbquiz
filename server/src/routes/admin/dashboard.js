const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Contest = require('../../models/Contest');
const Ticket = require('../../models/Ticket');
const Deposit = require('../../models/Deposit');
const Withdrawal = require('../../models/Withdrawal');
const Winner = require('../../models/Winner');
const Settings = require('../../models/Settings');
const { protect } = require('../../middleware/auth');
const adminOnly = require('../../middleware/adminAuth');

router.use(protect, adminOnly);

// @GET /api/admin/dashboard
router.get('/', async (req, res, next) => {
  try {
    // Get statsFromDate filter
    const settings = await Settings.findOne().lean();
    const statsFrom = settings?.statsFromDate ? new Date(settings.statsFromDate) : null;
    const dateFilter = statsFrom ? { createdAt: { $gte: statsFrom } } : {};

    const [
      totalUsers, totalContests, activeContests,
      totalTickets, pendingDeposits, pendingWithdrawals,
    ] = await Promise.all([
      User.countDocuments({ isAdmin: false }),
      Contest.countDocuments(statsFrom ? { createdAt: { $gte: statsFrom } } : {}),
      Contest.countDocuments({ status: 'active' }),
      Ticket.countDocuments({ status: 'completed', ...dateFilter }),
      Deposit.countDocuments({ status: 'pending' }),
      Withdrawal.countDocuments({ status: 'pending' }),
    ]);

    // Revenue stats — filtered by statsFromDate
    const depositStats = await Deposit.aggregate([
      { $match: { status: 'approved', ...(statsFrom ? { createdAt: { $gte: statsFrom } } : {}) } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const withdrawalStats = await Withdrawal.aggregate([
      { $match: { status: 'approved', ...(statsFrom ? { createdAt: { $gte: statsFrom } } : {}) } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const prizeStats = await Winner.aggregate([
      { $match: { prizeDistributed: true, ...(statsFrom ? { createdAt: { $gte: statsFrom } } : {}) } },
      { $group: { _id: null, total: { $sum: '$prizeAmount' } } },
    ]);
    const contestRevenue = await Contest.aggregate([
      ...(statsFrom ? [{ $match: { createdAt: { $gte: statsFrom } } }] : []),
      { $group: { _id: null, totalCollection: { $sum: '$totalCollection' }, platformFee: { $sum: '$platformFeeAmount' } } },
    ]);

    // User growth (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Contest activity (last 7 days tickets)
    const contestActivity = await Ticket.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Recent users
    const recentUsers = await User.find({ isAdmin: false }).sort({ createdAt: -1 }).limit(5).select('name username mobile createdAt');

    res.json({
      success: true,
      statsFromDate: statsFrom,
      stats: {
        totalUsers, totalContests, activeContests, totalTickets,
        pendingDeposits, pendingWithdrawals,
        totalDeposits: depositStats[0]?.total || 0,
        totalWithdrawals: withdrawalStats[0]?.total || 0,
        totalPrizesDistributed: prizeStats[0]?.total || 0,
        totalCollection: contestRevenue[0]?.totalCollection || 0,
        platformRevenue: contestRevenue[0]?.platformFee || 0,
      },
      userGrowth,
      contestActivity,
      recentUsers,
    });
  } catch (err) { next(err); }
});

module.exports = router;
