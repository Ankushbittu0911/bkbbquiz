const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rank: { type: Number, required: true },
  prizeAmount: { type: Number, required: true },
  prizeGroupLabel: { type: String, default: '' },
  isManualOverride: { type: Boolean, default: false },
  prizeDistributed: { type: Boolean, default: false },
  prizeDistributedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Winner', winnerSchema);
