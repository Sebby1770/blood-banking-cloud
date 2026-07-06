const express = require('express');
const { getSettings, updateSettings } = require('../services/settingsService');
const { logActivity } = require('../services/activityService');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    res.json(await getSettings());
  } catch (err) {
    next(err);
  }
});

router.patch('/', async (req, res, next) => {
  try {
    const settings = await updateSettings(req.body);
    await logActivity('settings_updated', 'System settings updated', req.body);
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

module.exports = router;