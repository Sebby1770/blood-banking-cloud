const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Campaign = sequelize.define('Campaign', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  bloodGroup: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'any'),
    defaultValue: 'any',
  },
  targetUnits: { type: DataTypes.INTEGER, defaultValue: 10 },
  scheduledAt: { type: DataTypes.DATE, allowNull: false },
  status: {
    type: DataTypes.ENUM('planned', 'active', 'completed', 'cancelled'),
    defaultValue: 'planned',
  },
  notes: { type: DataTypes.TEXT, allowNull: true },
});

module.exports = Campaign;