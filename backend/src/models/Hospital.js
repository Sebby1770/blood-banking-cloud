const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Hospital = sequelize.define('Hospital', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  contactEmail: { type: DataTypes.STRING, allowNull: false, validate: { isEmail: true } },
  contactPhone: { type: DataTypes.STRING, allowNull: false },
});

module.exports = Hospital;
