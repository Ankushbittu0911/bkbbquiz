const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 1 },
  transactionId: { type: String, trim: true, default: '' },
  screenshotUrl: { type: String, default: '' },           // Cloudinary URL
  screenshotPublicId: { type: String, default: '' },      // Cloudinary public_id
  upiId: { type: String, default: '' },                  // merchant UPI used
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote: { type: String, default: '' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Deposit', depositSchema);
