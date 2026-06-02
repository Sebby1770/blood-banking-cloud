const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const BloodRequest = sequelize.define('BloodRequest', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  patientName: { type: DataTypes.STRING, allowNull: false },
  bloodGroup: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: false,
  },
  unitsNeeded: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: { min: 1, max: 100 },
  },
  urgency: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'medium',
  },
  status: {
    type: DataTypes.ENUM('open', 'matched', 'fulfilled', 'cancelled'),
    allowNull: false,
    defaultValue: 'open',
  },
  hospitalId: { type: DataTypes.INTEGER, allowNull: false },
});

module.exports = BloodRequest;
