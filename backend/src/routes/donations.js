const express = require('express');
const { Donation, Donor, BloodInventory } = require('../models');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const donations = await Donation.findAll({
      include: [{ model: Donor, as: 'donor' }],
      order: [['donatedAt', 'DESC']],
    });
    res.json(donations);
  } catch (err) {
    next(err);
  }
});

// POST /api/donations { donorId, units }
// Looks up the donor's blood group, records the donation, and increments
// inventory in a single transaction.
router.post('/', async (req, res, next) => {
  try {
    const { donorId, units = 1 } = req.body;
    const donor = await Donor.findByPk(donorId);
    if (!donor) return res.status(404).json({ error: 'Donor not found' });

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

    res.status(201).json({ donation, inventory: inv });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
