const { Op } = require('sequelize');
const { Donor } = require('../models');

// Universal donor compatibility table for whole blood (recipient -> donors).
// Used when an exact match isn't required.
const COMPATIBILITY = {
  'O-':  ['O-'],
  'O+':  ['O-', 'O+'],
  'A-':  ['O-', 'A-'],
  'A+':  ['O-', 'O+', 'A-', 'A+'],
  'B-':  ['O-', 'B-'],
  'B+':  ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

/**
 * Find donors compatible with the given recipient blood group.
 * Donors must be marked available and (optionally) in the same city.
 */
async function matchDonors({ recipientBloodGroup, city, limit = 10 }) {
  const compatibleGroups = COMPATIBILITY[recipientBloodGroup] || [recipientBloodGroup];

  const where = {
    bloodGroup: { [Op.in]: compatibleGroups },
    available: true,
  };
  if (city) where.city = city;

  // Prefer donors who haven't donated recently (or ever). Portable across
  // SQLite/Postgres/MySQL — null `lastDonatedAt` sorts naturally first on
  // most dialects, and ties break by id.
  return Donor.findAll({
    where,
    order: [['lastDonatedAt', 'ASC'], ['id', 'ASC']],
    limit,
  });
}

module.exports = { matchDonors, COMPATIBILITY };
