const express = require('express');
const { COMPATIBILITY } = require('../services/matchingService');

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({
    description: 'Recipient blood group → compatible donor groups (whole blood)',
    matrix: COMPATIBILITY,
    groups: Object.keys(COMPATIBILITY),
  });
});

router.get('/:bloodGroup', (req, res) => {
  const group = req.params.bloodGroup;
  const donors = COMPATIBILITY[group];
  if (!donors) {
    return res.status(404).json({ error: `Unknown blood group: ${group}` });
  }
  res.json({ recipient: group, compatibleDonors: donors });
});

module.exports = router;