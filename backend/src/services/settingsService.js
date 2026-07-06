const { Settings } = require('../models');

const DEFAULTS = {
  lowStockThreshold: process.env.LOW_STOCK_THRESHOLD || '5',
  donationCooldownDays: process.env.DONATION_COOLDOWN_DAYS || '56',
  organizationName: 'Blood Bank Cloud',
  alertEmail: '',
};

async function getSettings() {
  const rows = await Settings.findAll();
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...DEFAULTS, ...stored };
}

async function getSetting(key) {
  const row = await Settings.findByPk(key);
  return row ? row.value : DEFAULTS[key];
}

async function updateSettings(updates) {
  const allowed = ['lowStockThreshold', 'donationCooldownDays', 'organizationName', 'alertEmail'];
  for (const [key, value] of Object.entries(updates)) {
    if (!allowed.includes(key) || value === undefined) continue;
    const [row] = await Settings.findOrCreate({ where: { key }, defaults: { value: String(value) } });
    if (row.value !== String(value)) await row.update({ value: String(value) });
  }
  return getSettings();
}

module.exports = { getSettings, getSetting, updateSettings, DEFAULTS };