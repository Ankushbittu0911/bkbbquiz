const express = require('express');
const router = express.Router();
const Ticket = require('../../models/Ticket');
const { protect } = require('../../middleware/auth');
const adminOnly = require('../../middleware/adminAuth');

router.use(protect, adminOnly);

// @GET /api/admin/tickets
router.get('/', async (req, res, next) => {
  try {
    const { contestId, userId, status, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (contestId) filter.contestId = contestId;
    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    const tickets = await Ticket.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name username mobile')
      .populate('contestId', 'title category')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Ticket.countDocuments(filter);
    res.json({ success: true, tickets, total });
  } catch (err) { next(err); }
});

module.exports = router;
