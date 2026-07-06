// Stubbed notification service. In development, alerts are logged to the
// console. In production (NODE_ENV=production with SNS_TOPIC_ARN set), it
// publishes to AWS SNS. Wrapped in try/catch so a notification failure
// never breaks an inventory write. All alerts are persisted to the database.

let snsClient = null;

async function getSnsClient() {
  if (snsClient) return snsClient;
  if (process.env.NODE_ENV !== 'production' || !process.env.SNS_TOPIC_ARN) {
    return null;
  }
  // Lazy-load the AWS SDK so dev installs don't need it.
  const { SNSClient } = require('@aws-sdk/client-sns');
  snsClient = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' });
  return snsClient;
}

async function persistAlert(type, subject, message, bloodGroup = null, deliveredVia = 'console') {
  try {
    const { Alert } = require('../models');
    return await Alert.create({ type, subject, message, bloodGroup, deliveredVia });
  } catch (err) {
    console.error('[notify] failed to persist alert:', err.message);
    return null;
  }
}

async function publish(subject, message, opts = {}) {
  const line = `[notify] ${subject} :: ${message}`;
  console.log(line);

  let deliveredVia = 'console';
  try {
    const client = await getSnsClient();
    if (client) {
      const { PublishCommand } = require('@aws-sdk/client-sns');
      await client.send(
        new PublishCommand({
          TopicArn: process.env.SNS_TOPIC_ARN,
          Subject: subject,
          Message: message,
        })
      );
      deliveredVia = 'sns';
    }
  } catch (err) {
    console.error('[notify] SNS publish failed, falling back to console:', err.message);
  }

  if (opts.type) {
    await persistAlert(opts.type, subject, message, opts.bloodGroup || null, deliveredVia);
  }

  return { delivered: deliveredVia };
}

async function lowStockAlert(bloodGroup, units, threshold) {
  return publish(
    `Low blood stock: ${bloodGroup}`,
    `Inventory for ${bloodGroup} has dropped to ${units} units (threshold: ${threshold}). Consider reaching out to donors.`,
    { type: 'low_stock', bloodGroup },
  );
}

async function newRequestAlert(request, matchedDonors) {
  return publish(
    `New ${request.urgency} request for ${request.bloodGroup}`,
    `Patient ${request.patientName} needs ${request.unitsNeeded} unit(s) of ${request.bloodGroup}. ${matchedDonors.length} potential donor(s) matched.`,
    { type: 'new_request', bloodGroup: request.bloodGroup },
  );
}

module.exports = { publish, lowStockAlert, newRequestAlert };
