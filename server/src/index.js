require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const maintenanceMode = require('./middleware/maintenance');

// Route imports
const authRoutes = require('./routes/auth');
const contestRoutes = require('./routes/contests');
const ticketRoutes = require('./routes/tickets');
const walletRoutes = require('./routes/wallet');
const depositRoutes = require('./routes/deposits');
const withdrawalRoutes = require('./routes/withdrawals');
const notificationRoutes = require('./routes/notifications');
const settingsRoutes = require('./routes/settings');

// Admin route imports
const adminDashboard = require('./routes/admin/dashboard');
const adminContests = require('./routes/admin/contests');
const adminQuestions = require('./routes/admin/questions');
const adminUsers = require('./routes/admin/users');
const adminDeposits = require('./routes/admin/deposits');
const adminWithdrawals = require('./routes/admin/withdrawals');
const adminWinners = require('./routes/admin/winners');
const adminNotifications = require('./routes/admin/notifications');
const adminSettings = require('./routes/admin/settings');
const adminTickets = require('./routes/admin/tickets');

const app = express();
app.set('trust proxy', 1);

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://bkbbquiz.vercel.app",
      "https://bkbbquiz-fgfd.vercel.app"
    ];

    // allow requests with no origin (like mobile apps, postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Maintenance mode — blocks user-facing routes when enabled
app.use(maintenanceMode);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

// Admin routes
app.use('/api/admin/dashboard', adminDashboard);
app.use('/api/admin/contests', adminContests);
app.use('/api/admin/questions', adminQuestions);
app.use('/api/admin/users', adminUsers);
app.use('/api/admin/deposits', adminDeposits);
app.use('/api/admin/withdrawals', adminWithdrawals);
app.use('/api/admin/winners', adminWinners);
app.use('/api/admin/notifications', adminNotifications);
app.use('/api/admin/settings', adminSettings);
app.use('/api/admin/tickets', adminTickets);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 BKBBQUIZ Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
