const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Donation = sequelize.define('Donation', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  donorId: { type: DataTypes.INTEGER, allowNull: false },
  bloodGroup: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: false,
  },
  units: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: { min: 1, max: 100 },
  },
  donatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
});

module.exports = Donation;
