const express = require('express');
const { BloodRequest, Hospital, BloodInventory } = require('../models');
const { matchDonors } = require('../services/matchingService');
const notify = require('../services/notificationService');
const { logActivity } = require('../services/activityService');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.urgency) where.urgency = req.query.urgency;
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

router.get('/:id/matches', async (req, res, next) => {
  try {
    const request = await BloodRequest.findByPk(req.params.id, {
      include: [{ model: Hospital, as: 'hospital' }],
    });
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const matched = await matchDonors({
      recipientBloodGroup: request.bloodGroup,
      city: request.hospital ? request.hospital.city : null,
      limit: 20,
    });

    const inv = await BloodInventory.findOne({ where: { bloodGroup: request.bloodGroup } });
    res.json({
      request,
      matchedDonors: matched,
      inventoryAvailable: inv ? inv.units : 0,
      canFulfill: inv ? inv.units >= request.unitsNeeded : false,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const request = await BloodRequest.create(req.body);

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
    await logActivity(
      'request_created',
      `${request.urgency} request for ${request.unitsNeeded} unit(s) of ${request.bloodGroup} — ${request.patientName}`,
      { requestId: request.id, matchedCount: matched.length },
    );

    res.status(201).json({ request, matchedDonors: matched });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

router.post('/:id/fulfill', async (req, res, next) => {
  try {
    const request = await BloodRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status === 'fulfilled') {
      return res.status(400).json({ error: 'Request already fulfilled' });
    }
    if (request.status === 'cancelled') {
      return res.status(400).json({ error: 'Request was cancelled' });
    }

    const inv = await BloodInventory.findOne({ where: { bloodGroup: request.bloodGroup } });
    if (!inv || inv.units < request.unitsNeeded) {
      return res.status(409).json({
        error: 'Insufficient inventory to fulfill',
        available: inv ? inv.units : 0,
        needed: request.unitsNeeded,
      });
    }

    await inv.update({ units: inv.units - request.unitsNeeded });
    await request.update({ status: 'fulfilled' });

    await logActivity(
      'request_fulfilled',
      `Fulfilled request for ${request.patientName}: ${request.unitsNeeded} unit(s) of ${request.bloodGroup}`,
      { requestId: request.id },
    );

    res.json({ request, inventory: inv });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/cancel', async (req, res, next) => {
  try {
    const request = await BloodRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status === 'fulfilled') {
      return res.status(400).json({ error: 'Cannot cancel a fulfilled request' });
    }

    await request.update({ status: 'cancelled' });
    await logActivity(
      'request_cancelled',
      `Cancelled request for ${request.patientName} (${request.bloodGroup})`,
      { requestId: request.id },
    );

    res.json(request);
  } catch (err) {
    next(err);
  }
});

module.exports = router;