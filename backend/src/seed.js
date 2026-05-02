require('dotenv').config();
const { sequelize, Donor, Hospital, BloodInventory, Donation } = require('./models');

const DONORS = [
  { name: 'Asha Patel', email: 'asha@example.com', phone: '+91-9000000001', bloodGroup: 'O+', city: 'Mumbai' },
  { name: 'Ben Carter', email: 'ben@example.com', phone: '+1-555-0102', bloodGroup: 'A+', city: 'New York' },
  { name: 'Chen Wei', email: 'chen@example.com', phone: '+86-13800000003', bloodGroup: 'B+', city: 'Shanghai' },
  { name: 'Divya Rao', email: 'divya@example.com', phone: '+91-9000000004', bloodGroup: 'AB+', city: 'Mumbai' },
  { name: 'Eli Goldberg', email: 'eli@example.com', phone: '+1-555-0105', bloodGroup: 'O-', city: 'New York' },
  { name: 'Farah Khan', email: 'farah@example.com', phone: '+92-3000000006', bloodGroup: 'A-', city: 'Karachi' },
  { name: 'Gabriel Silva', email: 'gabriel@example.com', phone: '+55-11000000007', bloodGroup: 'B-', city: 'Sao Paulo' },
  { name: 'Hana Sato', email: 'hana@example.com', phone: '+81-9000000008', bloodGroup: 'AB-', city: 'Tokyo' },
];

const HOSPITALS = [
  { name: 'City General Hospital', city: 'Mumbai', contactEmail: 'ops@citygeneral.example', contactPhone: '+91-2200000001' },
  { name: 'Mercy Medical Center', city: 'New York', contactEmail: 'ops@mercymed.example', contactPhone: '+1-555-9000' },
  { name: 'Sunrise Clinic', city: 'Mumbai', contactEmail: 'ops@sunrise.example', contactPhone: '+91-2200000002' },
];

const INVENTORY = [
  { bloodGroup: 'A+', units: 12 },
  { bloodGroup: 'A-', units: 4 },
  { bloodGroup: 'B+', units: 9 },
  { bloodGroup: 'B-', units: 2 },
  { bloodGroup: 'AB+', units: 6 },
  { bloodGroup: 'AB-', units: 1 },
  { bloodGroup: 'O+', units: 18 },
  { bloodGroup: 'O-', units: 3 },
];

(async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('[seed] schema rebuilt');

    const donors = await Donor.bulkCreate(DONORS);
    await Hospital.bulkCreate(HOSPITALS);
    await BloodInventory.bulkCreate(INVENTORY);

    // A handful of historical donations across recent months for analytics.
    const now = new Date();
    const past = (monthsAgo) => new Date(now.getFullYear(), now.getMonth() - monthsAgo, 15);
    const sample = [];
    donors.forEach((d, idx) => {
      sample.push({ donorId: d.id, bloodGroup: d.bloodGroup, units: 1, donatedAt: past(idx % 6) });
      if (idx % 2 === 0) {
        sample.push({ donorId: d.id, bloodGroup: d.bloodGroup, units: 1, donatedAt: past((idx + 2) % 6) });
      }
    });
    await Donation.bulkCreate(sample);

    console.log(`[seed] ${donors.length} donors, ${HOSPITALS.length} hospitals, ${INVENTORY.length} inventory rows, ${sample.length} donations`);
    process.exit(0);
  } catch (err) {
    console.error('[seed] failed:', err);
    process.exit(1);
  }
})();
