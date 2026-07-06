const express = require('express');
const { Donor, Donation } = require('../models');
const { checkDonorEligibility } = require('../services/eligibilityService');
const { logActivity } = require('../services/activityService');

const router = express.Router();

// GET /api/donors?bloodGroup=O+&city=Mumbai
router.get('/', async (req, res, next) => {
  try {
    const where = {};
    if (req.query.bloodGroup) where.bloodGroup = req.query.bloodGroup;
    if (req.query.city) where.city = req.query.city;
    if (req.query.available) where.available = req.query.available === 'true';
    const donors = await Donor.findAll({ where, order: [['name', 'ASC']] });
    res.json(donors.map((d) => ({ ...d.toJSON(), eligibility: checkDonorEligibility(d) })));
  } catch (err) {
    next(err);
  }
});

router.post('/import', async (req, res, next) => {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'rows array required' });
    }
    const created = [];
    const errors = [];
    for (const row of rows) {
      try {
        const donor = await Donor.create(row);
        created.push(donor);
      } catch (err) {
        errors.push({ row, error: err.message });
      }
    }
    if (created.length > 0) {
      await logActivity('donor_registered', `Bulk import: ${created.length} donor(s) added`);
    }
    res.status(201).json({ imported: created.length, errors: errors.length, donors: created, failed: errors });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/history', async (req, res, next) => {
  try {
    const donor = await Donor.findByPk(req.params.id);
    if (!donor) return res.status(404).json({ error: 'Donor not found' });
    const donations = await Donation.findAll({
      where: { donorId: donor.id },
      order: [['donatedAt', 'DESC']],
    });
    const totalUnits = donations.reduce((s, d) => s + d.units, 0);
    res.json({
      donor: { ...donor.toJSON(), eligibility: checkDonorEligibility(donor) },
      donations,
      stats: { totalDonations: donations.length, totalUnits },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/eligibility', async (req, res, next) => {
  try {
    const donor = await Donor.findByPk(req.params.id);
    if (!donor) return res.status(404).json({ error: 'Donor not found' });
    res.json({ donor: { id: donor.id, name: donor.name, bloodGroup: donor.bloodGroup }, ...checkDonorEligibility(donor) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const donor = await Donor.findByPk(req.params.id);
    if (!donor) return res.status(404).json({ error: 'Donor not found' });
    res.json({ ...donor.toJSON(), eligibility: checkDonorEligibility(donor) });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const donor = await Donor.create(req.body);
    await logActivity('donor_registered', `New donor registered: ${donor.name} (${donor.bloodGroup}, ${donor.city})`, { donorId: donor.id });
    res.status(201).json({ ...donor.toJSON(), eligibility: checkDonorEligibility(donor) });
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const donor = await Donor.findByPk(req.params.id);
    if (!donor) return res.status(404).json({ error: 'Donor not found' });
    await donor.update(req.body);
    res.json(donor);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const donor = await Donor.findByPk(req.params.id);
    if (!donor) return res.status(404).json({ error: 'Donor not found' });
    await donor.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
