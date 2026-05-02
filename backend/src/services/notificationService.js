// Stubbed notification service. In development, alerts are logged to the
// console. In production (NODE_ENV=production with SNS_TOPIC_ARN set), it
// publishes to AWS SNS. Wrapped in try/catch so a notification failure
// never breaks an inventory write.

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

async function publish(subject, message) {
  const line = `[notify] ${subject} :: ${message}`;
  console.log(line);

  try {
    const client = await getSnsClient();
    if (!client) return { delivered: 'console' };
    const { PublishCommand } = require('@aws-sdk/client-sns');
    await client.send(
      new PublishCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Subject: subject,
        Message: message,
      })
    );
    return { delivered: 'sns' };
  } catch (err) {
    console.error('[notify] SNS publish failed, falling back to console:', err.message);
    return { delivered: 'console', error: err.message };
  }
}

async function lowStockAlert(bloodGroup, units, threshold) {
  return publish(
    `Low blood stock: ${bloodGroup}`,
    `Inventory for ${bloodGroup} has dropped to ${units} units (threshold: ${threshold}). Consider reaching out to donors.`
  );
}

async function newRequestAlert(request, matchedDonors) {
  return publish(
    `New ${request.urgency} request for ${request.bloodGroup}`,
    `Patient ${request.patientName} needs ${request.unitsNeeded} unit(s) of ${request.bloodGroup}. ${matchedDonors.length} potential donor(s) matched.`
  );
}

module.exports = { publish, lowStockAlert, newRequestAlert };
