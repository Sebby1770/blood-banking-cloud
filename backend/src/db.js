const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL || 'sqlite:./blood_bank.sqlite';
const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';

const sequelize = new Sequelize(databaseUrl, {
  logging: false,
  dialectOptions: databaseUrl.startsWith('postgres')
    ? { ssl: { require: true, rejectUnauthorized } }
    : {},
});

module.exports = { sequelize };
