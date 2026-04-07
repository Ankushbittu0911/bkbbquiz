const Settings = require('../models/Settings');

// Cache maintenance mode status for 30 seconds to avoid DB hit on every request
let cache = { value: false, lastChecked: 0 };
const CACHE_TTL = 30 * 1000; // 30 seconds

const maintenanceMode = async (req, res, next) => {
  try {
    // Always allow: admin routes, public settings, and health check
    if (
      req.path.startsWith('/api/admin') ||
      req.path.startsWith('/api/settings') ||
      req.path.startsWith('/api/auth') ||
      req.path === '/health'
    ) {
      return next();
    }

    // Use cache to avoid DB hit on every request
    const now = Date.now();
    if (now - cache.lastChecked > CACHE_TTL) {
      const settings = await Settings.findOne().select('maintenanceMode').lean();
      cache.value = settings?.maintenanceMode || false;
      cache.lastChecked = now;
    }

    if (cache.value) {
      return res.status(503).json({
        success: false,
        maintenanceMode: true,
        message: 'Platform is under maintenance. Please try again later.',
      });
    }

    next();
  } catch (err) {
    // If DB check fails, let the request through (fail open)
    next();
  }
};

// Call this to immediately invalidate the cache when settings are updated
maintenanceMode.invalidateCache = () => {
  cache.lastChecked = 0;
};

module.exports = maintenanceMode;
