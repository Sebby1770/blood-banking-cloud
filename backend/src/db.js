const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL || 'sqlite:./blood_bank.sqlite';

const sequelize = new Sequelize(databaseUrl, {
  logging: false,
  dialectOptions: databaseUrl.startsWith('postgres')
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
});

module.exports = { sequelize };
