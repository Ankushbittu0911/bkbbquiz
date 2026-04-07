const express = require('express');
const router = express.Router();
const Contest = require('../../models/Contest');
const Ticket = require('../../models/Ticket');
const Winner = require('../../models/Winner');
const Settings = require('../../models/Settings');
const { protect } = require('../../middleware/auth');
const adminOnly = require('../../middleware/adminAuth');

router.use(protect, adminOnly);

// @GET /api/admin/contests
router.get('/', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const contests = await Contest.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Contest.countDocuments(filter);
    res.json({ success: true, contests, total });
  } catch (err) { next(err); }
});

// @POST /api/admin/contests
router.post('/', async (req, res, next) => {
  try {
    const { title, description, category, entryFee, totalSpots, startTime, endTime, quizDuration, winnersCount, firstPrize } = req.body;
    if (!title || !category || !entryFee || !totalSpots || !startTime || !endTime || !winnersCount) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    // Default prize groups
    const defaultGroups = buildDefaultPrizeGroups(parseInt(winnersCount));

    const contest = await Contest.create({
      title, description, category,
      entryFee: parseFloat(entryFee),
      totalSpots: parseInt(totalSpots),
      startTime, endTime,
      quizDuration: parseInt(quizDuration) || 300,
      winnersCount: parseInt(winnersCount),
      firstPrize: parseFloat(firstPrize) || 0,
      status: 'draft',
      prizeGroups: defaultGroups,
    });

    res.status(201).json({ success: true, contest });
  } catch (err) { next(err); }
});

// @PUT /api/admin/contests/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { title, description, category, entryFee, totalSpots, startTime, endTime, quizDuration, winnersCount, firstPrize, status, prizeGroups } = req.body;
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    if (contest.joinedCount > 0 && (entryFee || totalSpots)) {
      return res.status(400).json({ success: false, message: 'Cannot change entry fee or spots after users have joined' });
    }
    const updates = {};
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category) updates.category = category;
    if (entryFee) updates.entryFee = parseFloat(entryFee);
    if (totalSpots) updates.totalSpots = parseInt(totalSpots);
    if (startTime) updates.startTime = startTime;
    if (endTime) updates.endTime = endTime;
    if (quizDuration) updates.quizDuration = parseInt(quizDuration);
    if (winnersCount) updates.winnersCount = parseInt(winnersCount);
    if (firstPrize !== undefined) updates.firstPrize = parseFloat(firstPrize);
    if (status) updates.status = status;
    if (prizeGroups) {
      // Validate total = 100%
      const totalPct = prizeGroups.reduce((s, g) => s + parseFloat(g.percentage || 0), 0);
      if (Math.abs(totalPct - 100) > 0.01) {
        return res.status(400).json({ success: false, message: 'Prize group percentages must sum to 100%' });
      }
      updates.prizeGroups = prizeGroups;
    }
    const updated = await Contest.findByIdAndUpdate(req.params.id, updates, { returnDocument: 'after', runValidators: true });
    res.json({ success: true, contest: updated });
  } catch (err) { next(err); }
});

// @DELETE /api/admin/contests/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    if (contest.joinedCount > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete a contest with joined users' });
    }
    await Contest.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Contest deleted' });
  } catch (err) { next(err); }
});

// @POST /api/admin/contests/:id/activate
router.post('/:id/activate', async (req, res, next) => {
  try {
    const contest = await Contest.findByIdAndUpdate(req.params.id, { status: 'active' }, { returnDocument: 'after' });
    res.json({ success: true, message: 'Contest activated', contest });
  } catch (err) { next(err); }
});

// @POST /api/admin/contests/:id/stop
router.post('/:id/stop', async (req, res, next) => {
  try {
    const contest = await Contest.findByIdAndUpdate(req.params.id, { status: 'stopped' }, { returnDocument: 'after' });
    res.json({ success: true, message: 'Contest stopped', contest });
  } catch (err) { next(err); }
});

// @POST /api/admin/contests/:id/close
router.post('/:id/close', async (req, res, next) => {
  try {
    const contest = await Contest.findByIdAndUpdate(req.params.id, { status: 'closed' }, { returnDocument: 'after' });
    res.json({ success: true, message: 'Contest closed. Ready for winner declaration.', contest });
  } catch (err) { next(err); }
});

// @POST /api/admin/contests/:id/reset
router.post('/:id/reset', async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    // Delete all tickets and winners for this contest
    await Ticket.deleteMany({ contestId: contest._id });
    await Winner.deleteMany({ contestId: contest._id });
    await Contest.findByIdAndUpdate(contest._id, {
      joinedCount: 0,
      prizePool: 0,
      totalCollection: 0,
      platformFeeAmount: 0,
      status: 'draft',
      winnersGenerated: false,
    });
    res.json({ success: true, message: 'Contest reset successfully' });
  } catch (err) { next(err); }
});

// @GET /api/admin/contests/:id — Single contest detail
router.get('/:id', async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    const ticketCount = await Ticket.countDocuments({ contestId: contest._id, status: 'completed' });
    res.json({ success: true, contest, ticketCount });
  } catch (err) { next(err); }
});

// Helper: build default prize groups
function buildDefaultPrizeGroups(winnersCount) {
  const groups = [];
  if (winnersCount >= 1) groups.push({ label: 'Rank 1', rankFrom: 1, rankTo: 1, percentage: 40 });
  if (winnersCount >= 2) groups.push({ label: 'Rank 2', rankFrom: 2, rankTo: 2, percentage: 20 });
  if (winnersCount >= 3) groups.push({ label: 'Rank 3', rankFrom: 3, rankTo: 3, percentage: 15 });
  if (winnersCount >= 10) groups.push({ label: 'Rank 4-10', rankFrom: 4, rankTo: 10, percentage: 15 });
  if (winnersCount >= 20) groups.push({ label: 'Rank 11-20', rankFrom: 11, rankTo: 20, percentage: 5 });
  if (winnersCount >= 50) groups.push({ label: 'Rank 21-50', rankFrom: 21, rankTo: 50, percentage: 3 });
  if (winnersCount >= 100) groups.push({ label: 'Rank 51-100', rankFrom: 51, rankTo: 100, percentage: 2 });

  // Normalize to 100%
  const total = groups.reduce((s, g) => s + g.percentage, 0);
  if (total !== 100 && groups.length > 0) {
    groups[0].percentage += (100 - total);
  }
  return groups;
}

module.exports = router;
