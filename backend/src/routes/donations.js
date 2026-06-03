const express = require('express');
const { Donation, Donor, BloodInventory } = require('../models');
const { requirePositiveInteger } = require('../middleware/security');

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
    const donorId = Number(req.body.donorId);
    const units = Number(req.body.units ?? 1);
    requirePositiveInteger(donorId, 'donorId', { max: 1_000_000 });
    requirePositiveInteger(units, 'units');

    const result = await Donation.sequelize.transaction(async (transaction) => {
      const donor = await Donor.findByPk(donorId, { transaction });
      if (!donor) {
        const error = new Error('Donor not found');
        error.status = 404;
        throw error;
      }

      const donation = await Donation.create({
        donorId,
        bloodGroup: donor.bloodGroup,
        units,
      }, { transaction });

      let inv = await BloodInventory.findOne({
        where: { bloodGroup: donor.bloodGroup },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!inv) {
        inv = await BloodInventory.create({ bloodGroup: donor.bloodGroup, units: 0 }, { transaction });
      }
      await inv.update({ units: inv.units + units }, { transaction });
      await donor.update({ lastDonatedAt: new Date() }, { transaction });
      return { donation, inventory: inv };
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
