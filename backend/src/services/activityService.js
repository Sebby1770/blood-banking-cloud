const { ActivityLog } = require('../models');

async function logActivity(type, message, metadata = null) {
  try {
    return await ActivityLog.create({
      type,
      message,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
  } catch (err) {
    console.error('[activity] failed to log:', err.message);
    return null;
  }
}

module.exports = { logActivity };