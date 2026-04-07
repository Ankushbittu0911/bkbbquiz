const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = broadcast to all
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['general', 'contest', 'wallet', 'winner', 'system'], default: 'general' },
  isRead: { type: Boolean, default: false },
  isGlobal: { type: Boolean, default: false }, // true = sent to all users
  relatedId: { type: mongoose.Schema.Types.ObjectId, default: null }, // contestId, ticketId, etc.
  icon: { type: String, default: '🔔' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
