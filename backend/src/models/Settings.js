const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Settings = sequelize.define('Settings', {
  key: { type: DataTypes.STRING, primaryKey: true },
  value: { type: DataTypes.STRING, allowNull: false },
});

module.exports = Settings;