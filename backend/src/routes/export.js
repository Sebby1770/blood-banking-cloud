const express = require('express');
const { Donor, Donation, BloodInventory, BloodRequest, Hospital } = require('../models');

const router = express.Router();

function toCsv(rows, columns) {
  const header = columns.join(',');
  const body = rows
    .map((row) =>
      columns
        .map((col) => {
          const val = row[col] ?? '';
          const str = String(val).replace(/"/g, '""');
          return str.includes(',') || str.includes('"') ? `"${str}"` : str;
        })
        .join(','),
    )
    .join('\n');
  return `${header}\n${body}`;
}

router.get('/donors.csv', async (_req, res, next) => {
  try {
    const donors = await Donor.findAll({ order: [['name', 'ASC']], raw: true });
    const csv = toCsv(donors, ['id', 'name', 'email', 'phone', 'bloodGroup', 'city', 'lastDonatedAt', 'available']);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="donors.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

router.get('/inventory.csv', async (_req, res, next) => {
  try {
    const rows = await BloodInventory.findAll({ order: [['bloodGroup', 'ASC']], raw: true });
    const csv = toCsv(rows, ['bloodGroup', 'units']);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="inventory.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

router.get('/donations.csv', async (_req, res, next) => {
  try {
    const donations = await Donation.findAll({
      include: [{ model: Donor, as: 'donor', attributes: ['name', 'city'] }],
      order: [['donatedAt', 'DESC']],
    });
    const rows = donations.map((d) => ({
      id: d.id,
      donor: d.donor ? d.donor.name : '',
      city: d.donor ? d.donor.city : '',
      bloodGroup: d.bloodGroup,
      units: d.units,
      donatedAt: d.donatedAt,
    }));
    const csv = toCsv(rows, ['id', 'donor', 'city', 'bloodGroup', 'units', 'donatedAt']);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="donations.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

router.get('/requests.csv', async (_req, res, next) => {
  try {
    const requests = await BloodRequest.findAll({
      include: [{ model: Hospital, as: 'hospital', attributes: ['name', 'city'] }],
      order: [['createdAt', 'DESC']],
    });
    const rows = requests.map((r) => ({
      id: r.id,
      patient: r.patientName,
      bloodGroup: r.bloodGroup,
      units: r.unitsNeeded,
      urgency: r.urgency,
      status: r.status,
      hospital: r.hospital ? r.hospital.name : '',
      city: r.hospital ? r.hospital.city : '',
      createdAt: r.createdAt,
    }));
    const csv = toCsv(rows, ['id', 'patient', 'bloodGroup', 'units', 'urgency', 'status', 'hospital', 'city', 'createdAt']);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="requests.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

module.exports = router;