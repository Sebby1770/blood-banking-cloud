const express = require('express');
const { BloodInventory } = require('../models');
const { matchDonors } = require('../services/matchingService');
const { checkDonorEligibility } = require('../services/eligibilityService');
const { getSetting } = require('../services/settingsService');

const router = express.Router();

// GET /api/outreach — find eligible donors for each low-stock blood group
router.get('/', async (req, res, next) => {
  try {
    const threshold = parseInt(await getSetting('lowStockThreshold'), 10);
    const city = req.query.city || null;
    const inventory = await BloodInventory.findAll();
    const lowStock = inventory.filter((r) => r.units < threshold);

    const outreach = await Promise.all(
      lowStock.map(async (row) => {
        const matched = await matchDonors({
          recipientBloodGroup: row.bloodGroup,
          city,
          limit: 5,
        });
        const eligible = matched
          .map((d) => ({ ...d.toJSON(), eligibility: checkDonorEligibility(d) }))
          .filter((d) => d.eligibility.eligible);

        return {
          bloodGroup: row.bloodGroup,
          units: row.units,
          threshold,
          deficit: threshold - row.units,
          eligibleDonors: eligible.map((d) => ({
            id: d.id,
            name: d.name,
            bloodGroup: d.bloodGroup,
            city: d.city,
            phone: d.phone,
            lastDonatedAt: d.lastDonatedAt,
          })),
        };
      }),
    );

    res.json({ threshold, outreach });
  } catch (err) {
    next(err);
  }
});

module.exports = router;