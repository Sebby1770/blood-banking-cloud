const express = require('express');
const { BloodInventory } = require('../models');
const notify = require('../services/notificationService');
const { logActivity } = require('../services/activityService');

const router = express.Router();

const THRESHOLD = () => parseInt(process.env.LOW_STOCK_THRESHOLD || '5', 10);

router.get('/', async (_req, res, next) => {
  try {
    const inv = await BloodInventory.findAll({ order: [['bloodGroup', 'ASC']] });
    const threshold = THRESHOLD();
    res.json(
      inv.map((row) => ({
        ...row.toJSON(),
        status: row.units < threshold ? 'low' : row.units < threshold * 2 ? 'moderate' : 'healthy',
        threshold,
      })),
    );
  } catch (err) {
    next(err);
  }
});

router.post('/adjust', async (req, res, next) => {
  try {
    const { bloodGroup, delta } = req.body;
    if (!bloodGroup || typeof delta !== 'number') {
      return res.status(400).json({ error: 'bloodGroup and numeric delta are required' });
    }

    let row = await BloodInventory.findOne({ where: { bloodGroup } });
    if (!row) row = await BloodInventory.create({ bloodGroup, units: 0 });

    const newUnits = Math.max(0, row.units + delta);
    await row.update({ units: newUnits });

    if (newUnits < THRESHOLD()) {
      await notify.lowStockAlert(bloodGroup, newUnits, THRESHOLD());
    }

    await logActivity(
      'inventory_adjusted',
      `${bloodGroup}: ${delta > 0 ? '+' : ''}${delta} units (now ${newUnits})`,
      { bloodGroup, delta, newUnits },
    );

    res.json({ ...row.toJSON(), status: newUnits < THRESHOLD() ? 'low' : 'healthy', threshold: THRESHOLD() });
  } catch (err) {
    next(err);
  }
});

router.get('/check-thresholds', async (_req, res, next) => {
  try {
    const all = await BloodInventory.findAll();
    const low = all.filter((r) => r.units < THRESHOLD());
    await Promise.all(low.map((r) => notify.lowStockAlert(r.bloodGroup, r.units, THRESHOLD())));
    res.json({ alertsSent: low.length, lowStock: low, threshold: THRESHOLD() });
  } catch (err) {
    next(err);
  }
});

module.exports = router;