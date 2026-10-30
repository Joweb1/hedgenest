# KYC Implementation Notes

Implements Tier 1 of `KYC_IMPLEMENTATION_PLAN.md` on MetaMap's free tier (one flow, NIN only).

## Flow
1. Client calls `POST /api/v1/kyc/tier1/initiate` (auth). Backend creates/resets a `pending` KYC record and returns `{ clientId, flowId, metadata: { userId, tier: 1 } }`.
2. Client renders the MetaMap web button with those values:
   ```html
   <script src="https://web-button.metamap.com/button.js"></script>
   <metamap-button clientid="..." flowId="..." metadata='{"userId":"...","tier":1}' />
   ```
3. MetaMap calls `POST /api/v1/kyc/webhook`. Backend:
   - verifies `x-signature` (HMAC-SHA256 of the raw body, `METAMAP_WEBHOOK_SECRET`); 401 otherwise,
   - handles only `verification_completed`; replays of the same verification id are ignored,
   - matches the session by the one-time `sessionId` nonce issued at initiate (single use), so a webhook can only upgrade the session it was issued for,
   - if `identityStatus !== "verified"` -> record `rejected`,
   - **Free tier (no `METAMAP_CLIENT_SECRET`, current setup):** trusts MetaMap's `identityStatus` and sets `kyc.status = verified`, `user.tier = 1`, `nameVerified = false`. The NIN itself is never seen by the backend.
   - **Paid plan (client secret set):** additionally fetches the verification via MetaMap's API, checks the user's names appear in the NIN record, blind-indexes the NIN (`PII_HASH_SALT`, unique = one NIN per account) and sets `nameVerified = true`. If NIN details can't be read the record becomes `needs_review` and the tier is NOT raised.
4. Client polls `GET /api/v1/kyc/status`.

## Gating
`middleware/checkTier.js` -> `requireTier(n)`, returns 403 `KYC_TIER_REQUIRED` (payload per plan section 7).

| Endpoint | Tier |
| --- | --- |
| `POST /convert` | 1 |
| `POST /create-plan`, `POST /top-up/:savingId` | 1 |
| `POST /initiateInvestment` | 2 |

Admin override: `GET/PATCH /api/v1/admin/kyc-mode` (`{ "isKycEnforced": false }`). Stored in `SystemSetting`; defaults to enforced.

## Environment
See `.env.example`: `METAMAP_CLIENT_ID`, `METAMAP_FLOW_TIER1_ID` (public), `METAMAP_WEBHOOK_SECRET`. Optional (paid plans): `METAMAP_CLIENT_SECRET`, `PII_HASH_SALT`. Register `<backend>/api/v1/kyc/webhook` in the MetaMap dashboard.

## Other changes
- `server.js`: `express.json` now keeps `req.rawBody` for signature checks.
- `model/kyc.js`: reshaped (status, verificationId, ninHash). `isVerified1/2` kept for the login payload. Old records still load, but legacy `id` / `utilityBill` fields are gone from the schema.
- Removed: `POST /verify` and `PUT /uploadUtilityBill`, the `kycValidator` is now unused.

## Testing
`node test-kyc-webhook.js <userId> [verified|rejected]` sends a signed webhook to a running server. Both `rejected` and `verified` work offline on the free tier (pass the `sessionId` from the initiate response).

## Known limitation on the free tier
Without API access the backend cannot compare the NIN holder's name to the account holder, nor detect one NIN used on several accounts. A user could verify with someone else's NIN. Mitigate by configuring the MetaMap flow itself (e.g. name/selfie checks), reviewing `kycs` records, and upgrading to get API access. `nameVerified: false` marks these records.

## Not done / assumptions
- Tier 2 (face liveness) awaits a second MetaMap flow.
- MetaMap's verification response is parsed defensively (`documents[].fields.*`); confirm against a real sandbox payload.
- Existing users are at tier 0, so with KYC on they cannot convert or save until verified. Turn KYC mode off first if that's not wanted at launch.

## Waitlist additions
`POST /api/v1/waitlist` now requires `phoneNumber` (Nigerian, stored `+234XXXXXXXXXX`, unique), `gender` (`male|female|other`) and `userType` (`student|salaried|freelancer|entrepreneur`). Older entries without them still work.
