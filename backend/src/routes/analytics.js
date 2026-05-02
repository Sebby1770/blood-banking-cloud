const express = require('express');
const { fn, col, literal } = require('sequelize');
const { Donation, BloodInventory, BloodRequest } = require('../models');

const router = express.Router();

// GET /api/analytics/trends — donations per month per blood group.
// QuickSight / Tableau can ingest this directly via the JSON-over-REST
// connector, or by querying RDS in production.
router.get('/trends', async (_req, res, next) => {
  try {
    // Use SQLite-friendly date formatting; on Postgres swap for date_trunc.
    const dialect = Donation.sequelize.getDialect();
    const monthExpr =
      dialect === 'sqlite'
        ? literal("strftime('%Y-%m', donatedAt)")
        : literal("TO_CHAR(\"donatedAt\", 'YYYY-MM')");

    const rows = await Donation.findAll({
      attributes: [
        [monthExpr, 'month'],
        'bloodGroup',
        [fn('SUM', col('units')), 'units'],
        [fn('COUNT', col('id')), 'donations'],
      ],
      group: ['month', 'bloodGroup'],
      order: [[literal('month'), 'ASC']],
      raw: true,
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/summary — quick KPIs for the dashboard.
router.get('/summary', async (_req, res, next) => {
  try {
    const [inventoryRows, openRequests, totalDonations] = await Promise.all([
      BloodInventory.findAll(),
      BloodRequest.count({ where: { status: 'open' } }),
      Donation.sum('units'),
    ]);

    const totalUnits = inventoryRows.reduce((acc, r) => acc + r.units, 0);
    const threshold = parseInt(process.env.LOW_STOCK_THRESHOLD || '5', 10);
    const lowStock = inventoryRows.filter((r) => r.units < threshold);

    res.json({
      totalUnits,
      totalDonations: totalDonations || 0,
      openRequests,
      lowStock: lowStock.map((r) => ({ bloodGroup: r.bloodGroup, units: r.units })),
      threshold,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
