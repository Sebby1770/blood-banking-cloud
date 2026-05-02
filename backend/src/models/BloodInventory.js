const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

// One row per (bloodGroup) tracking units in stock. A real-world
// implementation would also dimension by hospital and component
// (whole blood, plasma, platelets) — kept simple here on purpose.
const BloodInventory = sequelize.define('BloodInventory', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  bloodGroup: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: false,
    unique: true,
  },
  units: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
});

module.exports = BloodInventory;
