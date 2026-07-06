const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Alert = sequelize.define('Alert', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  type: {
    type: DataTypes.ENUM('low_stock', 'new_request', 'expiring_inventory'),
    allowNull: false,
  },
  subject: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  bloodGroup: { type: DataTypes.STRING, allowNull: true },
  deliveredVia: { type: DataTypes.STRING, defaultValue: 'console' },
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = Alert;