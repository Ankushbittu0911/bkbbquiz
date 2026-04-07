const express = require('express');
const router = express.Router();
const Contest = require('../models/Contest');
const Ticket = require('../models/Ticket');
const QuizQuestion = require('../models/QuizQuestion');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Winner = require('../models/Winner');
const Settings = require('../models/Settings');
const { protect } = require('../middleware/auth');

// @GET /api/contests — Get active contests
router.get('/', async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const filter = { status: { $in: ['active'] } };
    if (category) filter.category = category;
    const contests = await Contest.find(filter)
      .sort({ startTime: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Contest.countDocuments(filter);
    res.json({ success: true, contests, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// @GET /api/contests/all — Get all non-draft contests (for results page)
router.get('/all', async (req, res, next) => {
  try {
    const contests = await Contest.find({ status: { $in: ['active', 'closed', 'completed', 'stopped'] } })
      .sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, contests });
  } catch (err) { next(err); }
});

// @GET /api/contests/:id
router.get('/:id', async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });

    // Leaderboard: top 20 tickets for this contest (ordered by score)
    const leaderboard = await Ticket.find({ contestId: contest._id, status: 'completed' })
      .sort({ score: -1, timeTaken: 1 })
      .limit(20)
      .populate('userId', 'name username');

    res.json({ success: true, contest, leaderboard });
  } catch (err) { next(err); }
});

// @GET /api/contests/:id/questions — Get 10 random questions for quiz
router.get('/:id/questions', protect, async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    if (contest.status !== 'active') return res.status(400).json({ success: false, message: 'Contest is not active' });

    const questions = await QuizQuestion.aggregate([
      { $match: { category: contest.category, isActive: true } },
      { $sample: { size: 10 } },
      { $project: { correctAnswer: 0 } }, // Hide correct answer
    ]);

    if (questions.length < 10) {
      return res.status(400).json({ success: false, message: `Not enough questions for category: ${contest.category}` });
    }

    res.json({ success: true, questions, quizDuration: contest.quizDuration });
  } catch (err) { next(err); }
});

// @POST /api/contests/:id/join — Pay entry fee & get ticket placeholder
router.post('/:id/join', protect, async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    if (contest.status !== 'active') return res.status(400).json({ success: false, message: 'Contest is not active' });
    if (contest.joinedCount >= contest.totalSpots) {
      return res.status(400).json({ success: false, message: 'Contest is full' });
    }

    const settings = await Settings.findOne() || {};
    const maxEntries = settings.maxContestEntriesPerUser || 20;
    const existingEntries = await Ticket.countDocuments({ userId: req.user._id, contestId: contest._id });
    if (existingEntries >= maxEntries) {
      return res.status(400).json({ success: false, message: `Maximum ${maxEntries} entries per contest allowed` });
    }

    // Check wallet balance
    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet || wallet.totalBalance < contest.entryFee) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance. Please deposit.' });
    }

    // Deduct from wallet using direct update to avoid hook triggers
    const walletUpdate = {};
    let deductFrom = 'deposit';
    if (wallet.depositBalance >= contest.entryFee) {
      walletUpdate.depositBalance = wallet.depositBalance - contest.entryFee;
      deductFrom = 'deposit';
    } else if (wallet.winningsBalance >= contest.entryFee) {
      walletUpdate.winningsBalance = wallet.winningsBalance - contest.entryFee;
      deductFrom = 'winnings';
    } else {
      const remaining = contest.entryFee - wallet.depositBalance;
      walletUpdate.depositBalance = 0;
      walletUpdate.winningsBalance = wallet.winningsBalance - remaining;
      deductFrom = 'both';
    }
    await Wallet.findByIdAndUpdate(wallet._id, walletUpdate);

    // Record transaction
    await Transaction.create({
      userId: req.user._id,
      type: 'contest_entry',
      amount: contest.entryFee,
      balanceType: deductFrom,
      reference: contest._id.toString(),
      description: `Entry fee for ${contest.title}`,
    });

    // Update contest stats
    const platformFeePercent = settings.platformFeePercent || 30;
    const newJoinedCount = contest.joinedCount + 1;
    const totalCollection = newJoinedCount * contest.entryFee;
    const newPrizePool = Math.floor(totalCollection * (1 - platformFeePercent / 100));

    await Contest.findByIdAndUpdate(contest._id, {
      $inc: { joinedCount: 1 },
      totalCollection,
      prizePool: newPrizePool,
      platformFeeAmount: totalCollection - newPrizePool,
    });

    // Create pending ticket (will be completed after quiz)
    const ticket = await Ticket.create({
      userId: req.user._id,
      contestId: contest._id,
      status: 'pending',
    });

    res.json({ success: true, message: 'Joined successfully. Start the quiz!', ticketId: ticket._id });
  } catch (err) { next(err); }
});

// @POST /api/contests/:id/submit — Submit quiz answers
router.post('/:id/submit', protect, async (req, res, next) => {
  try {
    const { ticketId, answers, timeTaken } = req.body;
    // answers: [{ questionId, selectedOption }]
    if (!ticketId || !answers) {
      return res.status(400).json({ success: false, message: 'ticketId and answers required' });
    }

    const ticket = await Ticket.findOne({ _id: ticketId, userId: req.user._id, status: 'pending' });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found or already submitted' });

    const contest = await Contest.findById(ticket.contestId);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });

    // Fetch questions with correct answers
    const questionIds = answers.map(a => a.questionId);
    const questions = await QuizQuestion.find({ _id: { $in: questionIds } });
    const questionMap = {};
    questions.forEach(q => { questionMap[q._id.toString()] = q; });

    let score = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    const processedAnswers = [];

    for (const ans of answers) {
      const question = questionMap[ans.questionId];
      if (!question) continue;
      const isCorrect = question.correctAnswer === parseInt(ans.selectedOption);
      if (isCorrect) {
        score += question.points || 10;
        correctAnswers++;
      } else {
        wrongAnswers++;
      }
      processedAnswers.push({ questionId: question._id, selectedOption: ans.selectedOption, isCorrect });
    }

    // Update ticket using direct findByIdAndUpdate to avoid re-triggering hooks
    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticket._id,
      {
        score,
        correctAnswers,
        wrongAnswers,
        timeTaken: timeTaken || 0,
        answers: processedAnswers,
        completedAt: new Date(),
        status: 'completed',
      },
      { returnDocument: 'after' }
    );
    const finalTicket = updatedTicket;

    res.json({
      success: true,
      message: 'Quiz submitted successfully!',
      ticket: {
        _id: finalTicket._id,
        ticketNumber: finalTicket.ticketNumber,
        score,
        correctAnswers,
        wrongAnswers,
        timeTaken: finalTicket.timeTaken,
        contestTitle: contest.title,
      },
    });
  } catch (err) { next(err); }
});

module.exports = router;
