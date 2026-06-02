const express = require('express');
const { Hospital } = require('../models');
const { pick } = require('../middleware/security');

const router = express.Router();
const HOSPITAL_FIELDS = ['name', 'city', 'contactEmail', 'contactPhone'];

router.get('/', async (_req, res, next) => {
  try {
    const hospitals = await Hospital.findAll({ order: [['name', 'ASC']] });
    res.json(hospitals);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const hospital = await Hospital.create(pick(req.body, HOSPITAL_FIELDS));
    res.status(201).json(hospital);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
    res.json(hospital);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
