const DEFAULT_COOLDOWN = parseInt(process.env.DONATION_COOLDOWN_DAYS || '56', 10);

function daysSince(date) {
  if (!date) return Infinity;
  const ms = Date.now() - new Date(date).getTime();
  return ms / (1000 * 60 * 60 * 24);
}

function checkDonorEligibility(donor, cooldownDays = DEFAULT_COOLDOWN) {
  const cooldown = parseInt(cooldownDays, 10) || DEFAULT_COOLDOWN;
  const days = daysSince(donor.lastDonatedAt);
  if (!Number.isFinite(days) || days === Infinity) {
    return { eligible: true, daysSinceLastDonation: null, daysUntilEligible: 0, cooldownDays: cooldown };
  }

  const eligible = days >= cooldown;
  const daysUntilEligible = eligible ? 0 : Math.ceil(cooldown - days);

  return {
    eligible,
    daysSinceLastDonation: Math.floor(days),
    daysUntilEligible,
    cooldownDays: cooldown,
  };
}

module.exports = { checkDonorEligibility, DEFAULT_COOLDOWN };