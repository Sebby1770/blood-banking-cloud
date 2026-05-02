const express = require('express');
const { Donor } = require('../models');

const router = express.Router();

// GET /api/donors?bloodGroup=O+&city=Mumbai
router.get('/', async (req, res, next) => {
  try {
    const where = {};
    if (req.query.bloodGroup) where.bloodGroup = req.query.bloodGroup;
    if (req.query.city) where.city = req.query.city;
    if (req.query.available) where.available = req.query.available === 'true';
    const donors = await Donor.findAll({ where, order: [['name', 'ASC']] });
    res.json(donors);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const donor = await Donor.findByPk(req.params.id);
    if (!donor) return res.status(404).json({ error: 'Donor not found' });
    res.json(donor);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const donor = await Donor.create(req.body);
    res.status(201).json(donor);
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
