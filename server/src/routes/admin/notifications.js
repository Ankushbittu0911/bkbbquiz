const express = require('express');
const router = express.Router();
const Notification = require('../../models/Notification');
const User = require('../../models/User');
const { protect } = require('../../middleware/auth');
const adminOnly = require('../../middleware/adminAuth');

router.use(protect, adminOnly);

// @GET /api/admin/notifications
router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.find({ isGlobal: true })
      .sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, notifications });
  } catch (err) { next(err); }
});

// @POST /api/admin/notifications — Broadcast to all users
router.post('/', async (req, res, next) => {
  try {
    const { title, message, type, userId, icon } = req.body;
    if (!title || !message) return res.status(400).json({ success: false, message: 'title and message required' });

    if (userId) {
      // Send to specific user
      const notification = await Notification.create({ userId, title, message, type: type || 'general', icon: icon || '🔔' });
      return res.status(201).json({ success: true, message: 'Notification sent to user', notification });
    }

    // Broadcast to all users (create one global notification)
    const notification = await Notification.create({
      userId: null, title, message,
      type: type || 'general',
      isGlobal: true,
      icon: icon || '📢',
    });
    res.status(201).json({ success: true, message: 'Notification broadcasted to all users', notification });
  } catch (err) { next(err); }
});

// @DELETE /api/admin/notifications/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
