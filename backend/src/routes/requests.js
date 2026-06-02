const express = require('express');
const { BloodRequest, Hospital, BloodInventory } = require('../models');
const { matchDonors } = require('../services/matchingService');
const notify = require('../services/notificationService');
const {
  pick,
  requireBloodGroup,
  requirePositiveInteger,
} = require('../middleware/security');

const router = express.Router();
const REQUEST_FIELDS = ['patientName', 'bloodGroup', 'unitsNeeded', 'urgency', 'hospitalId'];

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
    const body = pick(req.body, REQUEST_FIELDS);
    body.unitsNeeded = Number(body.unitsNeeded ?? 1);
    body.hospitalId = Number(body.hospitalId);
    requireBloodGroup(body.bloodGroup);
    requirePositiveInteger(body.unitsNeeded, 'unitsNeeded');
    requirePositiveInteger(body.hospitalId, 'hospitalId', { max: 1_000_000 });
    const request = await BloodRequest.create(body);

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
    const result = await BloodRequest.sequelize.transaction(async (transaction) => {
      const request = await BloodRequest.findByPk(req.params.id, { transaction });
      if (!request) {
        const error = new Error('Request not found');
        error.status = 404;
        throw error;
      }
      if (request.status === 'fulfilled') {
        const error = new Error('Request already fulfilled');
        error.status = 400;
        throw error;
      }

      const inv = await BloodInventory.findOne({
        where: { bloodGroup: request.bloodGroup },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!inv || inv.units < request.unitsNeeded) {
        const error = new Error('Insufficient inventory to fulfill');
        error.status = 409;
        throw error;
      }

      await inv.update({ units: inv.units - request.unitsNeeded }, { transaction });
      await request.update({ status: 'fulfilled' }, { transaction });
      return { request, inventory: inv };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
