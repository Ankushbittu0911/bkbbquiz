const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  options: {
    type: [String],
    required: true,
    validate: [arr => arr.length === 4, 'Must have exactly 4 options'],
  },
  correctAnswer: { type: Number, required: true, min: 0, max: 3 }, // 0-indexed
  category: {
    type: String,
    required: true,
    enum: ['Cricket', 'Football', 'Basketball', 'Tennis', 'GK', 'Bollywood', 'Science', 'History', 'Technology', 'Geography'],
  },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  points: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('QuizQuestion', quizQuestionSchema);
