const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Settings = require('../models/Settings');
const { generateToken, protect } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../utils/email');
const { authLimiter } = require('../middleware/rateLimiter');

// @POST /api/auth/register
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { name, username, mobile, email, dob, password } = req.body;
    if (!name || !username || !mobile || !email || !dob || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if user already exists
    const existing = await User.findOne({ $or: [{ mobile }, { email }, { username: username.toLowerCase() }] });
    if (existing) {
      // Check if this is a partial failure: user was created but wallet wasn't
      // (happens when wallet creation failed on a previous attempt)
      const existingWallet = await Wallet.findOne({ userId: existing._id });
      if (!existingWallet) {
        // Recovery: create the missing wallet and return success
        await Wallet.create({ userId: existing._id });
        const token = generateToken(existing._id);
        return res.status(201).json({
          success: true,
          message: 'Registration successful',
          token,
          user: { _id: existing._id, name: existing.name, username: existing.username, mobile: existing.mobile, email: existing.email, isAdmin: existing.isAdmin },
        });
      }
      const field = existing.mobile === mobile ? 'Mobile' : existing.email === email ? 'Email' : 'Username';
      return res.status(400).json({ success: false, message: `${field} already registered` });
    }

    const user = await User.create({ name, username: username.toLowerCase(), mobile, email, dob, password });

    // Create wallet using upsert to avoid duplicate key errors on retry
    await Wallet.findOneAndUpdate(
      { userId: user._id },
      { userId: user._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Referral bonus
    const settings = await Settings.findOne();
    if (req.body.referralCode && settings?.referralBonus > 0) {
      const referrer = await User.findOne({ referralCode: req.body.referralCode.toUpperCase() });
      if (referrer) {
        await Wallet.findOneAndUpdate({ userId: referrer._id }, { $inc: { depositBalance: settings.referralBonus } });
      }
    }

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { _id: user._id, name: user.name, username: user.username, mobile: user.mobile, email: user.email, isAdmin: user.isAdmin },
    });
  } catch (err) { next(err); }
});

// @POST /api/auth/login
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({ success: false, message: 'Mobile and password required' });
    }
    const user = await User.findOne({ mobile }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid mobile or password' });
    }
    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Account banned. Contact support.' });
    }
    await User.updateOne({ _id: user._id }, { lastLogin: new Date() });
    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, username: user.username, mobile: user.mobile, email: user.email, isAdmin: user.isAdmin },
    });
  } catch (err) { next(err); }
});

// @GET /api/auth/profile
router.get('/profile', protect, async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user._id });
    res.json({ success: true, user: req.user, wallet });
  } catch (err) { next(err); }
});

// @PUT /api/auth/profile
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, email, dob, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (dob) updates.dob = dob;
    if (avatar) updates.avatar = avatar;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { returnDocument: 'after', runValidators: true });
    res.json({ success: true, user });
  } catch (err) { next(err); }
});

// @POST /api/auth/change-password
router.post('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password required' });
    }
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.updateOne({ _id: user._id }, { password: hashedPassword });
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) { next(err); }
});

// @POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
    const resetToken = user.getResetPasswordToken();
    // Save reset token fields directly — avoid triggering pre-save hooks
    await User.updateOne({ _id: user._id }, {
      resetPasswordToken: user.resetPasswordToken,
      resetPasswordExpire: user.resetPasswordExpire,
    });
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
    } catch (emailErr) {
      await User.updateOne({ _id: user._id }, { resetPasswordToken: undefined, resetPasswordExpire: undefined });
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
    res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
  } catch (err) { next(err); }
});

// @POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    // Hash the new password manually and update directly — avoids save() hook issues
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    await User.updateOne({ _id: user._id }, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpire: undefined,
    });
    const token = generateToken(user._id);
    res.json({ success: true, message: 'Password reset successful', token });
  } catch (err) { next(err); }
});

module.exports = router;
