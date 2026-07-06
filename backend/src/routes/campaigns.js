const express = require('express');
const { Campaign } = require('../models');
const { logActivity } = require('../services/activityService');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    const campaigns = await Campaign.findAll({
      where,
      order: [['scheduledAt', 'ASC']],
    });
    res.json(campaigns);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const campaign = await Campaign.create(req.body);
    await logActivity('campaign_created', `Blood drive scheduled: ${campaign.name} in ${campaign.city}`, { campaignId: campaign.id });
    res.status(201).json(campaign);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    await campaign.update(req.body);
    res.json(campaign);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    await campaign.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;