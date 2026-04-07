const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  depositBalance: { type: Number, default: 0 },    // from deposits only (not withdrawable)
  winningsBalance: { type: Number, default: 0 },   // from prizes (withdrawable)
}, { timestamps: true });

walletSchema.virtual('totalBalance').get(function () {
  return this.depositBalance + this.winningsBalance;
});

walletSchema.set('toJSON', { virtuals: true });
walletSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Wallet', walletSchema);
