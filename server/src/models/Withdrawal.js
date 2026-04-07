const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 10 },
  name: { type: String, required: true, trim: true },
  upiId: { type: String, required: true, trim: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote: { type: String, default: '' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  transactionReference: { type: String, default: '' }, // UTR filled by admin
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
