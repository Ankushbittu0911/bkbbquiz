const express = require('express');
const router = express.Router();
const QuizQuestion = require('../../models/QuizQuestion');
const { protect } = require('../../middleware/auth');
const adminOnly = require('../../middleware/adminAuth');

router.use(protect, adminOnly);

// @GET /api/admin/questions
router.get('/', async (req, res, next) => {
  try {
    const { category, difficulty, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    const questions = await QuizQuestion.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await QuizQuestion.countDocuments(filter);
    // Count per category
    const categoryCounts = await QuizQuestion.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, questions, total, categoryCounts });
  } catch (err) { next(err); }
});

// @POST /api/admin/questions
router.post('/', async (req, res, next) => {
  try {
    const { text, options, correctAnswer, category, difficulty, points } = req.body;
    if (!text || !options || options.length !== 4 || correctAnswer === undefined || !category) {
      return res.status(400).json({ success: false, message: 'text, 4 options, correctAnswer, category required' });
    }
    const question = await QuizQuestion.create({ text, options, correctAnswer: parseInt(correctAnswer), category, difficulty, points: parseInt(points) || 10 });
    res.status(201).json({ success: true, question });
  } catch (err) { next(err); }
});

// @POST /api/admin/questions/bulk — Bulk import
router.post('/bulk', async (req, res, next) => {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'questions array required' });
    }

    const VALID_CATEGORIES = ['Cricket', 'Football', 'Basketball', 'Tennis', 'GK', 'Bollywood', 'Science', 'History', 'Technology', 'Geography'];
    const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

    const valid = [];
    const invalid = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text || !Array.isArray(q.options) || q.options.length !== 4 || q.correctAnswer === undefined || !q.category) {
        invalid.push({ row: i + 1, reason: 'Missing required fields (text, 4 options, correctAnswer, category)' });
        continue;
      }
      if (!VALID_CATEGORIES.includes(q.category)) {
        invalid.push({ row: i + 1, reason: `Invalid category: ${q.category}` });
        continue;
      }
      valid.push({
        text: q.text.trim(),
        options: q.options.map(o => String(o).trim()),
        correctAnswer: parseInt(q.correctAnswer) || 0,
        category: q.category,
        difficulty: VALID_DIFFICULTIES.includes(q.difficulty) ? q.difficulty : 'medium',
        points: parseInt(q.points) || 10,
        isActive: true,
      });
    }

    if (valid.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid questions to import', invalid });
    }

    const created = await QuizQuestion.insertMany(valid, { ordered: false });
    res.status(201).json({
      success: true,
      count: created.length,
      message: `${created.length} questions imported${invalid.length > 0 ? `, ${invalid.length} skipped` : ''}`,
      invalid: invalid.length > 0 ? invalid : undefined,
    });
  } catch (err) { next(err); }
});

// @PUT /api/admin/questions/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { text, options, correctAnswer, category, difficulty, points, isActive } = req.body;
    const updates = {};
    if (text) updates.text = text;
    if (options) updates.options = options;
    if (correctAnswer !== undefined) updates.correctAnswer = parseInt(correctAnswer);
    if (category) updates.category = category;
    if (difficulty) updates.difficulty = difficulty;
    if (points) updates.points = parseInt(points);
    if (isActive !== undefined) updates.isActive = isActive;
    const question = await QuizQuestion.findByIdAndUpdate(req.params.id, updates, { returnDocument: 'after', runValidators: true });
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, question });
  } catch (err) { next(err); }
});

// @DELETE /api/admin/questions/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const question = await QuizQuestion.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, message: 'Question deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
