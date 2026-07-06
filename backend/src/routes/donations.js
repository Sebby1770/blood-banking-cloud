const express = require('express');
const { Donation, Donor, BloodInventory } = require('../models');
const { checkDonorEligibility } = require('../services/eligibilityService');
const { logActivity } = require('../services/activityService');
const notify = require('../services/notificationService');

const router = express.Router();
const THRESHOLD = () => parseInt(process.env.LOW_STOCK_THRESHOLD || '5', 10);

router.get('/', async (req, res, next) => {
  try {
    const where = {};
    if (req.query.bloodGroup) where.bloodGroup = req.query.bloodGroup;
    const donations = await Donation.findAll({
      where,
      include: [{ model: Donor, as: 'donor' }],
      order: [['donatedAt', 'DESC']],
      limit: Math.min(parseInt(req.query.limit || '100', 10), 500),
    });
    res.json(donations);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { donorId, units = 1 } = req.body;
    const donor = await Donor.findByPk(donorId);
    if (!donor) return res.status(404).json({ error: 'Donor not found' });

    const eligibility = checkDonorEligibility(donor);
    if (!eligibility.eligible) {
      return res.status(409).json({
        error: `Donor not eligible. Must wait ${eligibility.daysUntilEligible} more day(s).`,
        eligibility,
      });
    }

    const donation = await Donation.create({
      donorId,
      bloodGroup: donor.bloodGroup,
      units,
    });

    let inv = await BloodInventory.findOne({ where: { bloodGroup: donor.bloodGroup } });
    if (!inv) {
      inv = await BloodInventory.create({ bloodGroup: donor.bloodGroup, units: 0 });
    }
    await inv.update({ units: inv.units + units });
    await donor.update({ lastDonatedAt: new Date() });

    if (inv.units < THRESHOLD()) {
      await notify.lowStockAlert(donor.bloodGroup, inv.units, THRESHOLD());
    }

    await logActivity(
      'donation',
      `${donor.name} donated ${units} unit(s) of ${donor.bloodGroup}`,
      { donorId, bloodGroup: donor.bloodGroup, units },
    );

    res.status(201).json({ donation, inventory: inv, eligibility: checkDonorEligibility(donor) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;