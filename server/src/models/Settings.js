const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  merchantUpiId: { type: String, default: 'bkbbquiz@upi' },
  merchantName: { type: String, default: 'BKBBQUIZ' },
  platformFeePercent: { type: Number, default: 30, min: 0, max: 100 },
  appName: { type: String, default: 'BKBBQUIZ' },
  supportEmail: { type: String, default: 'support@bkbbquiz.com' },
  supportPhone: { type: String, default: '+91 9999999999' },
  referralBonus: { type: Number, default: 50 },
  maintenanceMode: { type: Boolean, default: false },
  minDeposit: { type: Number, default: 10 },
  maxDeposit: { type: Number, default: 50000 },
  minWithdrawal: { type: Number, default: 100 },
  maxWithdrawal: { type: Number, default: 10000 },
  maxContestEntriesPerUser: { type: Number, default: 20 },
  statsFromDate: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
