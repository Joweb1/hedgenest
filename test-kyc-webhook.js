// Sends a locally HMAC-signed MetaMap webhook to a running server.
// Usage: node test-kyc-webhook.js <userId> [verified|rejected]
// Usage: node test-kyc-webhook.js <userId> <sessionId> [verified|rejected]
// Requires a pending session (call POST /kyc/tier1/initiate first and copy data.metadata.sessionId) and METAMAP_WEBHOOK_SECRET in .env.
require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = process.env.TEST_URL || `http://localhost:${process.env.PORT || 8228}`;
const [userId, sessionId, identityStatus = 'rejected'] = process.argv.slice(2);

if (!userId || !sessionId) {
  console.error('Usage: node test-kyc-webhook.js <userId> <sessionId> [verified|rejected]');
  process.exit(1);
}

const body = JSON.stringify({
  eventName: 'verification_completed',
  resource: `https://api.prod.metamap.com/v2/verifications/test-${Date.now()}`,
  flowId: process.env.METAMAP_FLOW_TIER1_ID,
  identityStatus,
  metadata: { userId, sessionId, tier: 1 },
});
const sign = (secret) => crypto.createHmac('sha256', secret).update(body).digest('hex');

(async () => {
  const url = `${BASE_URL}/api/v1/kyc/webhook`;
  const headers = { 'Content-Type': 'application/json' };

  const bad = await axios.post(url, body, { headers: { ...headers, 'x-signature': sign('wrong') }, validateStatus: () => true });
  console.log(`Bad signature  -> ${bad.status} (expected 401)`);

  const good = await axios.post(url, body, { headers: { ...headers, 'x-signature': sign(process.env.METAMAP_WEBHOOK_SECRET) }, validateStatus: () => true });
  console.log(`Good signature -> ${good.status}`, good.data);
})();
