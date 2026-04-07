const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
  ticketNumber: { type: String, required: true, unique: true },
  score: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  wrongAnswers: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 }, // seconds
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizQuestion' },
    selectedOption: Number,  // 0-3
    isCorrect: Boolean,
  }],
  completedAt: Date,
  prizeWon: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  isWinner: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
}, { timestamps: true });

// Auto-generate ticket number
ticketSchema.pre('validate', function () {
  if (!this.ticketNumber) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.ticketNumber = `BKB-${datePart}-${randomPart}`;
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);
