const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const ActivityLog = sequelize.define('ActivityLog', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  type: {
    type: DataTypes.ENUM(
      'donation',
      'request_created',
      'request_fulfilled',
      'request_cancelled',
      'inventory_adjusted',
      'low_stock_alert',
      'donor_registered',
      'settings_updated',
    ),
    allowNull: false,
  },
  message: { type: DataTypes.STRING, allowNull: false },
  metadata: { type: DataTypes.TEXT, allowNull: true },
});

module.exports = ActivityLog;