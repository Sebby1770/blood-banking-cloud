const express = require('express');
const { BloodRequest, Hospital, BloodInventory } = require('../models');
const { matchDonors } = require('../services/matchingService');
const notify = require('../services/notificationService');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    const requests = await BloodRequest.findAll({
      where,
      include: [{ model: Hospital, as: 'hospital' }],
      order: [['createdAt', 'DESC']],
    });
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const request = await BloodRequest.create(req.body);

    // Auto-match compatible donors in the same city as the hospital, if known.
    const hospital = await Hospital.findByPk(request.hospitalId);
    const matched = await matchDonors({
      recipientBloodGroup: request.bloodGroup,
      city: hospital ? hospital.city : null,
      limit: 10,
    });

    if (matched.length > 0) {
      await request.update({ status: 'matched' });
    }

    await notify.newRequestAlert(request, matched);

    res.status(201).json({
      request,
      matchedDonors: matched,
    });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

// Mark request fulfilled — decrements inventory by unitsNeeded.
router.post('/:id/fulfill', async (req, res, next) => {
  try {
    const request = await BloodRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status === 'fulfilled') {
      return res.status(400).json({ error: 'Request already fulfilled' });
    }

    const inv = await BloodInventory.findOne({ where: { bloodGroup: request.bloodGroup } });
    if (!inv || inv.units < request.unitsNeeded) {
      return res.status(409).json({ error: 'Insufficient inventory to fulfill' });
    }

    await inv.update({ units: inv.units - request.unitsNeeded });
    await request.update({ status: 'fulfilled' });

    res.json({ request, inventory: inv });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
