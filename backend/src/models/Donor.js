const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const Donor = sequelize.define('Donor', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  phone: { type: DataTypes.STRING, allowNull: false },
  bloodGroup: { type: DataTypes.ENUM(...BLOOD_GROUPS), allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  lastDonatedAt: { type: DataTypes.DATE, allowNull: true },
  available: { type: DataTypes.BOOLEAN, defaultValue: true },
});

Donor.BLOOD_GROUPS = BLOOD_GROUPS;

module.exports = Donor;
