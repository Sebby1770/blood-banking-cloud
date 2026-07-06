const express = require('express');
const { Op } = require('sequelize');
const { Donor, BloodRequest, Hospital } = require('../models');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const like = { [Op.like]: `%${q}%` };

    const [donors, requests] = await Promise.all([
      Donor.findAll({
        where: {
          [Op.or]: [{ name: like }, { city: like }, { email: like }, { bloodGroup: q }],
        },
        limit: 10,
        order: [['name', 'ASC']],
      }),
      BloodRequest.findAll({
        where: {
          [Op.or]: [{ patientName: like }, { bloodGroup: q }],
        },
        include: [{ model: Hospital, as: 'hospital' }],
        limit: 10,
        order: [['createdAt', 'DESC']],
      }),
    ]);

    res.json({
      query: q,
      donors: donors.map((d) => ({ type: 'donor', id: d.id, label: d.name, detail: `${d.bloodGroup} · ${d.city}`, bloodGroup: d.bloodGroup })),
      requests: requests.map((r) => ({
        type: 'request',
        id: r.id,
        label: r.patientName,
        detail: `${r.bloodGroup} · ${r.urgency} · ${r.status}`,
        bloodGroup: r.bloodGroup,
        urgency: r.urgency,
      })),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;