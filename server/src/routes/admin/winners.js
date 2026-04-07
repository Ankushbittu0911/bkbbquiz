const express = require('express');
const router = express.Router();
const Contest = require('../../models/Contest');
const Ticket = require('../../models/Ticket');
const Winner = require('../../models/Winner');
const Wallet = require('../../models/Wallet');
const Transaction = require('../../models/Transaction');
const Notification = require('../../models/Notification');
const { protect } = require('../../middleware/auth');
const adminOnly = require('../../middleware/adminAuth');
const { sendWinnerEmail } = require('../../utils/email');

router.use(protect, adminOnly);

// @GET /api/admin/winners/:contestId — Get winners for a contest
router.get('/:contestId', async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.contestId);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });

    const winners = await Winner.find({ contestId: contest._id })
      .sort({ rank: 1 })
      .populate('userId', 'name username email mobile')
      .populate('ticketId', 'ticketNumber score');

    const tickets = await Ticket.find({ contestId: contest._id, status: 'completed' })
      .populate('userId', 'name username');

    res.json({ success: true, contest, winners, totalTickets: tickets.length });
  } catch (err) { next(err); }
});

// @POST /api/admin/winners/:contestId/generate — Random winner draw
router.post('/:contestId/generate', async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.contestId);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    if (contest.status !== 'closed') {
      return res.status(400).json({ success: false, message: 'Contest must be closed before generating winners' });
    }
    if (contest.winnersGenerated) {
      return res.status(400).json({ success: false, message: 'Winners already generated. Use override to change.' });
    }

    // Get all completed tickets for this contest
    const tickets = await Ticket.find({ contestId: contest._id, status: 'completed' });
    if (tickets.length === 0) {
      return res.status(400).json({ success: false, message: 'No completed tickets found for this contest' });
    }

    const winnersCount = Math.min(contest.winnersCount, tickets.length);
    const prizePool = contest.prizePool;

    // Shuffle tickets randomly (Fisher-Yates)
    const shuffled = [...tickets];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const winningTickets = shuffled.slice(0, winnersCount);

    // Calculate prize amounts from groups
    const prizeByRank = computePrizeByRank(contest.prizeGroups, prizePool, winnersCount);

    // Build winner docs
    const winnerDocs = [];
    for (let rank = 1; rank <= winningTickets.length; rank++) {
      const ticket = winningTickets[rank - 1];
      const { amount, groupLabel } = prizeByRank[rank] || { amount: 0, groupLabel: '' };
      winnerDocs.push({
        contestId: contest._id,
        ticketId: ticket._id,
        userId: ticket.userId,
        rank,
        prizeAmount: amount,
        prizeGroupLabel: groupLabel,
      });
    }

    // Insert winners
    await Winner.insertMany(winnerDocs);

    // Run all prize distribution ops in PARALLEL (much faster than sequential await in loop)
    await Promise.all(winnerDocs.map(async (w) => {
      await Promise.all([
        // Update ticket to mark as winner
        Ticket.findByIdAndUpdate(w.ticketId, { isWinner: true, rank: w.rank, prizeWon: w.prizeAmount }),
        // Credit wallet
        ...(w.prizeAmount > 0 ? [
          Wallet.findOneAndUpdate(
            { userId: w.userId },
            { $inc: { winningsBalance: w.prizeAmount } },
            { upsert: true }
          ),
          // Unique reference per winner using rank suffix to avoid duplicate key errors
          Transaction.create({
            userId: w.userId,
            type: 'prize_winning',
            amount: w.prizeAmount,
            balanceType: 'winnings',
            status: 'completed',
            reference: `${contest._id}-rank${w.rank}`,
            description: `Prize for Rank ${w.rank} in ${contest.title}`,
          }),
          Winner.findOneAndUpdate(
            { ticketId: w.ticketId },
            { prizeDistributed: true, prizeDistributedAt: new Date() }
          ),
          Notification.create({
            userId: w.userId,
            title: '🏆 You Won!',
            message: `Congratulations! You won ₹${w.prizeAmount} (Rank ${w.rank}) in ${contest.title}`,
            type: 'winner',
            icon: '🏆',
          }),
        ] : []),
      ]);
    }));

    // Mark contest as completed
    await Contest.findByIdAndUpdate(contest._id, { status: 'completed', winnersGenerated: true });

    // Send success response IMMEDIATELY — emails are fired in background
    res.json({ success: true, message: `${winnerDocs.length} winners declared and prizes distributed!`, winners: winnerDocs });

    // Fire winner emails in background AFTER responding (non-blocking)
    const User = require('../../models/User');
    Promise.allSettled(
      winnerDocs
        .filter(w => w.prizeAmount > 0)
        .map(async (w) => {
          const [winnerUser, winnerTicket] = await Promise.all([
            User.findById(w.userId).select('name email'),
            Ticket.findById(w.ticketId).select('ticketNumber'),
          ]);
          if (winnerUser?.email) {
            await sendWinnerEmail(
              winnerUser.email,
              winnerUser.name,
              contest.title,
              w.prizeAmount,
              winnerTicket?.ticketNumber || 'N/A'
            );
          }
        })
    ).then((results) => {
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length) console.error(`${failed.length} winner email(s) failed:`, failed.map(f => f.reason?.message));
      else console.log(`✅ All ${winnerDocs.length} winner emails sent`);
    });

  } catch (err) { next(err); }
});

// @POST /api/admin/winners/:contestId/override — Manual winner override
router.post('/:contestId/override', async (req, res, next) => {
  try {
    const { ticketId, rank, prizeAmount } = req.body;
    if (!ticketId || !rank) return res.status(400).json({ success: false, message: 'ticketId and rank required' });

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    // Check if this rank already has a winner - replace it
    const existingWinner = await Winner.findOne({ contestId: req.params.contestId, rank });
    if (existingWinner) {
      // Refund old winner
      await Wallet.findOneAndUpdate({ userId: existingWinner.userId }, { $inc: { winningsBalance: -existingWinner.prizeAmount } });
      await Ticket.findByIdAndUpdate(existingWinner.ticketId, { isWinner: false, rank: 0, prizeWon: 0 });
      await Winner.findByIdAndDelete(existingWinner._id);
    }

    const contestDoc = await Contest.findById(req.params.contestId);
    const prize = prizeAmount || 0;
    const newWinner = await Winner.create({
      contestId: req.params.contestId,
      ticketId,
      userId: ticket.userId,
      rank: parseInt(rank),
      prizeAmount: prize,
      isManualOverride: true,
    });

    if (prize > 0) {
      await Wallet.findOneAndUpdate({ userId: ticket.userId }, { $inc: { winningsBalance: prize } }, { upsert: true });
      await Ticket.findByIdAndUpdate(ticketId, { isWinner: true, rank: parseInt(rank), prizeWon: prize });
      await Transaction.create({
        userId: ticket.userId,
        type: 'prize_winning',
        amount: prize,
        balanceType: 'winnings',
        status: 'completed',
        reference: req.params.contestId,
        description: `Override prize Rank ${rank} in ${contestDoc?.title}`,
      });
    }

    res.json({ success: true, message: 'Winner overridden successfully', winner: newWinner });
  } catch (err) { next(err); }
});

// Helper: compute prize amounts by rank
function computePrizeByRank(prizeGroups, prizePool, winnersCount) {
  const result = {};
  if (!prizeGroups || prizeGroups.length === 0) {
    const perWinner = Math.floor(prizePool / winnersCount);
    for (let r = 1; r <= winnersCount; r++) result[r] = { amount: perWinner, groupLabel: `Rank ${r}` };
    return result;
  }
  for (const group of prizeGroups) {
    const groupAmount = Math.floor((prizePool * group.percentage) / 100);
    const rankCount = group.rankTo - group.rankFrom + 1;
    const perWinner = Math.floor(groupAmount / rankCount);
    for (let r = group.rankFrom; r <= group.rankTo && r <= winnersCount; r++) {
      result[r] = { amount: perWinner, groupLabel: group.label };
    }
  }
  return result;
}

module.exports = router;
