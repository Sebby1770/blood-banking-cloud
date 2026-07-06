const DONATION_COOLDOWN_DAYS = parseInt(process.env.DONATION_COOLDOWN_DAYS || '56', 10);

function daysSince(date) {
  if (!date) return Infinity;
  const ms = Date.now() - new Date(date).getTime();
  return ms / (1000 * 60 * 60 * 24);
}

function checkDonorEligibility(donor) {
  const days = daysSince(donor.lastDonatedAt);
  if (!Number.isFinite(days) || days === Infinity) {
    return { eligible: true, daysSinceLastDonation: null, daysUntilEligible: 0 };
  }

  const eligible = days >= DONATION_COOLDOWN_DAYS;
  const daysUntilEligible = eligible ? 0 : Math.ceil(DONATION_COOLDOWN_DAYS - days);

  return {
    eligible,
    daysSinceLastDonation: Math.floor(days),
    daysUntilEligible,
    cooldownDays: DONATION_COOLDOWN_DAYS,
  };
}

module.exports = { checkDonorEligibility, DONATION_COOLDOWN_DAYS };