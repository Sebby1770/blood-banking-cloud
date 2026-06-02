const express = require('express');
const { BloodInventory } = require('../models');
const notify = require('../services/notificationService');
const {
  requireBloodGroup,
  requireIntegerDelta,
} = require('../middleware/security');

const router = express.Router();

const THRESHOLD = () => parseInt(process.env.LOW_STOCK_THRESHOLD || '5', 10);

// GET /api/inventory — current stock per blood group
router.get('/', async (_req, res, next) => {
  try {
    const inv = await BloodInventory.findAll({ order: [['bloodGroup', 'ASC']] });
    res.json(inv);
  } catch (err) {
    next(err);
  }
});

// POST /api/inventory/adjust { bloodGroup, delta }
// Positive delta = add units (e.g. from a donation); negative = consume.
router.post('/adjust', async (req, res, next) => {
  try {
    const { bloodGroup, delta } = req.body;
    const parsedDelta = Number(delta);
    requireBloodGroup(bloodGroup);
    requireIntegerDelta(parsedDelta);

    const row = await BloodInventory.sequelize.transaction(async (transaction) => {
      let inventory = await BloodInventory.findOne({
        where: { bloodGroup },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!inventory) {
        inventory = await BloodInventory.create({ bloodGroup, units: 0 }, { transaction });
      }

      const newUnits = Math.max(0, inventory.units + parsedDelta);
      await inventory.update({ units: newUnits }, { transaction });
      return inventory;
    });

    if (row.units < THRESHOLD()) {
      await notify.lowStockAlert(row.bloodGroup, row.units, THRESHOLD());
    }

    res.json(row);
  } catch (err) {
    next(err);
  }
});

// GET /api/inventory/check-thresholds — meant to be hit by a Lambda cron.
// Fires alerts for every blood group currently below threshold.
router.get('/check-thresholds', async (_req, res, next) => {
  try {
    const all = await BloodInventory.findAll();
    const low = all.filter((r) => r.units < THRESHOLD());
    await Promise.all(low.map((r) => notify.lowStockAlert(r.bloodGroup, r.units, THRESHOLD())));
    res.json({ alertsSent: low.length, lowStock: low });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
