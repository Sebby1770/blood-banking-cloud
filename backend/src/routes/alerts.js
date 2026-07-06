const express = require('express');
const { Alert } = require('../models');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const where = {};
    if (req.query.unread === 'true') where.read = false;
    const alerts = await Alert.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
    });
    res.json(alerts);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/read', async (req, res, next) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    await alert.update({ read: true });
    res.json(alert);
  } catch (err) {
    next(err);
  }
});

router.post('/read-all', async (_req, res, next) => {
  try {
    await Alert.update({ read: true }, { where: { read: false } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;