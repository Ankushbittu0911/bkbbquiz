const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Contest = require('../models/Contest');
const { protect } = require('../middleware/auth');

// @GET /api/tickets — User's all tickets
router.get('/', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const tickets = await Ticket.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('contestId', 'title category status entryFee endTime')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Ticket.countDocuments({ userId: req.user._id });
    res.json({ success: true, tickets, total });
  } catch (err) { next(err); }
});

// @GET /api/tickets/:id — Single ticket
router.get('/:id', protect, async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('contestId', 'title category status entryFee endTime prizePool winnersCount');
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, ticket });
  } catch (err) { next(err); }
});

// @GET /api/tickets/contest/:contestId — User's tickets for a specific contest
router.get('/contest/:contestId', protect, async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ userId: req.user._id, contestId: req.params.contestId })
      .sort({ createdAt: -1 });
    res.json({ success: true, tickets, count: tickets.length });
  } catch (err) { next(err); }
});

module.exports = router;
