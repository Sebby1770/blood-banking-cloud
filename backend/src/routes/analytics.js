const express = require('express');
const { fn, col, literal } = require('sequelize');
const { Donation, BloodInventory, BloodRequest, Donor, ActivityLog } = require('../models');

const router = express.Router();

router.get('/trends', async (_req, res, next) => {
  try {
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

router.get('/summary', async (_req, res, next) => {
  try {
    const [inventoryRows, pendingRequests, totalDonations, donorCount, recentAlerts] = await Promise.all([
      BloodInventory.findAll(),
      BloodRequest.count({ where: { status: { $in: ['open', 'matched'] } } }),
      Donation.sum('units'),
      Donor.count({ where: { available: true } }),
      ActivityLog.count({
        where: { type: 'low_stock_alert' },
        // Sequelize 3 may not support Op well here; count all activity as proxy
      }).catch(() => 0),
    ]);

    const totalUnits = inventoryRows.reduce((acc, r) => acc + r.units, 0);
    const threshold = parseInt(process.env.LOW_STOCK_THRESHOLD || '5', 10);
    const lowStock = inventoryRows.filter((r) => r.units < threshold);

    res.json({
      totalUnits,
      totalDonations: totalDonations || 0,
      openRequests: pendingRequests,
      availableDonors: donorCount,
      lowStock: lowStock.map((r) => ({ bloodGroup: r.bloodGroup, units: r.units })),
      threshold,
      inventoryByGroup: inventoryRows.map((r) => ({
        bloodGroup: r.bloodGroup,
        units: r.units,
        status: r.units < threshold ? 'low' : 'healthy',
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/activity', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '30', 10), 100);
    const logs = await ActivityLog.findAll({
      order: [['createdAt', 'DESC']],
      limit,
    });
    res.json(
      logs.map((log) => ({
        ...log.toJSON(),
        metadata: log.metadata ? JSON.parse(log.metadata) : null,
      })),
    );
  } catch (err) {
    next(err);
  }
});

router.get('/urgency', async (_req, res, next) => {
  try {
    const rows = await BloodRequest.findAll({
      attributes: ['urgency', [fn('COUNT', col('id')), 'count']],
      where: { status: { $in: ['open', 'matched'] } },
      group: ['urgency'],
      raw: true,
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/cities', async (_req, res, next) => {
  try {
    const donors = await Donor.findAll({
      attributes: ['city', [fn('COUNT', col('id')), 'donors']],
      group: ['city'],
      order: [[literal('donors'), 'DESC']],
      raw: true,
    });
    res.json(donors);
  } catch (err) {
    next(err);
  }
});

router.get('/donors-by-group', async (_req, res, next) => {
  try {
    const rows = await Donor.findAll({
      attributes: ['bloodGroup', [fn('COUNT', col('id')), 'count']],
      where: { available: true },
      group: ['bloodGroup'],
      order: [['bloodGroup', 'ASC']],
      raw: true,
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/forecast', async (_req, res, next) => {
  try {
    const [inventory, totalDonations, totalFulfilled] = await Promise.all([
      BloodInventory.findAll(),
      Donation.sum('units'),
      BloodRequest.sum('unitsNeeded', { where: { status: 'fulfilled' } }),
    ]);

    const totalUnits = inventory.reduce((s, r) => s + r.units, 0);
    const inflow = totalDonations || 0;
    const outflow = totalFulfilled || 0;
    const ratio = outflow > 0 ? (inflow / outflow).toFixed(2) : null;

    res.json({
      totalUnits,
      allTimeDonations: inflow,
      allTimeFulfilled: outflow,
      supplyDemandRatio: ratio,
      trend: inflow > outflow ? 'surplus' : inflow < outflow ? 'deficit' : 'balanced',
      lowGroups: inventory.filter((r) => r.units < 5).map((r) => r.bloodGroup),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/fulfillment', async (_req, res, next) => {
  try {
    const [total, fulfilled, cancelled, matched, open] = await Promise.all([
      BloodRequest.count(),
      BloodRequest.count({ where: { status: 'fulfilled' } }),
      BloodRequest.count({ where: { status: 'cancelled' } }),
      BloodRequest.count({ where: { status: 'matched' } }),
      BloodRequest.count({ where: { status: 'open' } }),
    ]);

    const rate = total > 0 ? Math.round((fulfilled / total) * 100) : 0;
    res.json({ total, fulfilled, cancelled, matched, open, fulfillmentRate: rate });
  } catch (err) {
    next(err);
  }
});

module.exports = router;