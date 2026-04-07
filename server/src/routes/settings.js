const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// @GET /api/settings/public — Public settings (merchant UPI, app name)
router.get('/public', async (req, res, next) => {
  try {
    const settings = await Settings.findOne().select('merchantUpiId merchantName appName supportEmail supportPhone maintenanceMode');
    res.json({
      success: true,
      settings: settings || {
        merchantUpiId: 'bkbbquiz@upi',
        merchantName: 'BKBBQUIZ',
        appName: 'BKBBQUIZ',
        supportEmail: 'support@bkbbquiz.com',
        supportPhone: '+91 9999999999',
        maintenanceMode: false,
      },
    });
  } catch (err) { next(err); }
});

module.exports = router;
