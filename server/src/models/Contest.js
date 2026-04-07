const mongoose = require('mongoose');

const prizeGroupSchema = new mongoose.Schema({
  label: String,       // e.g. "Rank 1", "Rank 2-3"
  rankFrom: Number,
  rankTo: Number,
  percentage: Number,  // % of prize pool for this group
  perWinnerAmount: Number,
  totalGroupAmount: Number,
}, { _id: false });

const contestSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    required: true,
    enum: ['Cricket', 'Football', 'Basketball', 'Tennis', 'GK', 'Bollywood', 'Science', 'History', 'Technology', 'Geography'],
  },
  entryFee: { type: Number, required: true, min: 0 },
  totalSpots: { type: Number, required: true, min: 1 },
  prizePool: { type: Number, default: 0 },        // dynamically computed
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  quizDuration: { type: Number, default: 300 },   // seconds, default 5 min
  winnersCount: { type: Number, required: true, min: 1 },
  firstPrize: { type: Number, default: 0 },       // display on card
  joinedCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['draft', 'active', 'stopped', 'closed', 'completed'],
    default: 'draft',
  },
  prizeGroups: [prizeGroupSchema],
  winnersGenerated: { type: Boolean, default: false },
  totalCollection: { type: Number, default: 0 },   // joinedCount * entryFee
  platformFeeAmount: { type: Number, default: 0 },
  image: { type: String, default: '' },
}, { timestamps: true });

// Virtual: spots left
contestSchema.virtual('spotsLeft').get(function () {
  return this.totalSpots - this.joinedCount;
});

contestSchema.set('toJSON', { virtuals: true });
contestSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Contest', contestSchema);
