const { sequelize } = require('../db');
const Donor = require('./Donor');
const Hospital = require('./Hospital');
const BloodInventory = require('./BloodInventory');
const BloodRequest = require('./BloodRequest');
const Donation = require('./Donation');
const ActivityLog = require('./ActivityLog');
const Alert = require('./Alert');
const Settings = require('./Settings');
const Campaign = require('./Campaign');

// Associations
Hospital.hasMany(BloodRequest, { foreignKey: 'hospitalId', as: 'requests' });
BloodRequest.belongsTo(Hospital, { foreignKey: 'hospitalId', as: 'hospital' });

Donor.hasMany(Donation, { foreignKey: 'donorId', as: 'donations' });
Donation.belongsTo(Donor, { foreignKey: 'donorId', as: 'donor' });

module.exports = {
  sequelize,
  Donor,
  Hospital,
  BloodInventory,
  BloodRequest,
  Donation,
  ActivityLog,
  Alert,
  Settings,
  Campaign,
};
