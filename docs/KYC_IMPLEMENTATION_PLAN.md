# HedgeNest KYC Implementation & Architecture Plan

> **Current status (MetaMap free tier = one flow only)**
> - **Tier 1 (NIN only): implemented.** BVN is not part of the flow.
> - **Tier 2: not implemented.** It will be Face Liveness / Face Match (plus Proof of Address as planned) and needs a second MetaMap flow. `POST /kyc/tier2/initiate` returns 501 until then.
> - While Tier 2 is unavailable, `/initiateInvestment` (needs Tier 2) is blocked for everyone unless an admin turns KYC mode off.
> - The Kora NIN lookup and Cloudinary utility-bill upload were removed. The MetaMap web button is launched client-side; the backend only returns the public launch details and processes the webhook.
> - See `KYC_IMPLEMENTATION_NOTES.md` for what was built and how to test it.

## 1. Executive Summary

This document outlines the end-to-end technical plan, security protocols, API flows, and required credentials for implementing a two-tier **Know Your Customer (KYC)** system in HedgeNest.

The KYC system integrates with **MetaMap** (a compliant identity verification provider supporting Nigerian verification databases) to verify customer identities while giving HedgeNest administrators global control to toggle KYC enforcement on or off instantly.

---

## 2. KYC Tier Structure & Restriction Matrix

The verification process is divided into two distinct, decoupled stages that users can complete independently:

```
[ Unverified User ] (Tier 0)
        │
        ▼  Complete Stage 1 (NIN + BVN via MetaMap)
[ Verified User ] (Tier 1)
        │  • Can Convert (Naira ↔ USDT)
        │  • Can Save (SmartSave Vaults)
        │  • Cannot Invest
        │
        ▼  Complete Stage 2 (Face Liveness / Face Verification + Proof of Address via MetaMap)
[ Accredited Investor ] (Tier 2)
        │  • Can Convert
        │  • Can Save
        │  • Can Invest (Full Access)
```

### Feature Access Matrix

| KYC Status | Convert (`/convert`) | Save (`/create-plan`, `/top-up`) | Invest (`/initiateInvestment`) |
| :--- | :---: | :---: | :---: |
| **Tier 0** (Unverified) | ❌ Restricted | ❌ Restricted | ❌ Restricted |
| **Tier 1** (BVN & NIN Verified) | ✅ Allowed | ✅ Allowed | ❌ Restricted |
| **Tier 2** (Face + Address Verified) | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **KYC Mode OFF** (Admin Override) | ✅ Allowed | ✅ Allowed | ✅ Allowed |

---

## 3. Required Credentials & Environment Variables

To implement and deploy this architecture, the following configuration parameters must be supplied:

### A. MetaMap Dashboard Credentials
1. **`METAMAP_CLIENT_ID`**: Public Client ID found under MetaMap Dashboard > Integrations > API Keys.
2. **`METAMAP_CLIENT_SECRET`** *(paid plans only; not used on the free tier)*: Private Client Secret used by the backend to obtain OAuth access tokens (`POST /oauth`).
3. **`METAMAP_WEBHOOK_SECRET`**: The shared secret configured under MetaMap Dashboard > Integrations > Webhooks for HMAC-SHA256 signature verification.

### B. MetaMap Flow / Template IDs
MetaMap dashboard allows creating dedicated flow templates for each tier:
1. **`METAMAP_FLOW_TIER1_ID`**: Flow template containing:
   * **National Identity Number (NIN / vNIN)** validation against NIMC.
   * **Bank Verification Number (BVN)** validation against NIBSS.
2. **`METAMAP_FLOW_TIER2_ID`**: Flow template containing:
   * **3D Biometric Liveness & Facematch** (selfie matched against BVN/NIN database portrait).
   * **Proof of Residency / Address Verification** (OCR document reading for utility bills, bank statements, tenancy agreements).

### C. Server & Security Keys
1. **`PII_HASH_SALT`**: A 32+ character random secret used for deterministic blind indexing (HMAC-SHA256) of BVN and NIN values. This allows duplicate detection across accounts without storing plaintext PII.
2. **`PII_ENCRYPTION_KEY`**: 32-byte key for AES-256-GCM encryption if full identifiers must be archived for regulatory compliance.
3. **`BACKEND_WEBHOOK_URL`**: Public HTTPS URL where MetaMap sends webhook events (e.g. `https://api.hedgenest.com/api/v1/kyc/webhook`).

---

## 4. MetaMap Integration Architecture

### 4.1 Tier 1: BVN and NIN Verification Flow

```
User (Client)              HedgeNest Backend                       MetaMap
     │                             │                                  │
     │── 1. Start Tier 1 KYC ─────>│                                  │
     │                             │── 2. Authenticate & Create ─────>│
     │                             │      Session (TIER1_FLOW_ID)     │
     │                             │<─ 3. Return session token ───────│
     │<─ 4. Launch MetaMap SDK ────│                                  │
     │                                                                │
     │─────── 5. User Enters BVN & NIN in MetaMap Modal ─────────────>│
     │           (MetaMap queries NIBSS & NIMC databases)             │
     │                                                                │
     │                             │<── 6. Webhook: verification_ ────│
     │                             │       completed (HMAC signed)    │
     │                             │                                  │
     │                             │── 7. Validate x-signature        │
     │                             │── 8. Check legal name matches    │
     │                             │── 9. Set user.tier = 1           │
     │<─ 10. Tier 1 Confirmed ─────│                                  │
```

1. **Session Initialization:**
   Client calls `POST /api/v1/kyc/tier1/initiate`. Backend calls MetaMap `POST /v2/verifications` with `METAMAP_FLOW_TIER1_ID` and user metadata `{ userId: user._id }`.
2. **Execution:**
   User enters BVN & NIN inside the MetaMap SDK on mobile or web.
3. **Webhook Verification:**
   MetaMap sends a signed webhook to `POST /api/v1/kyc/webhook`. Backend verifies the `x-signature` header, compares returned names against `user.firstName` and `user.lastName`, stores blind hashes to prevent duplicate usage, and elevates user to `tier: 1`.

---

### 4.2 Tier 2: Facial Liveness & Proof of Address Verification Flow

Users who are at **Tier 1** can trigger Tier 2 upgrade anytime:

```
User (Client)              HedgeNest Backend                       MetaMap
     │                             │                                  │
     │── 1. Start Tier 2 KYC ─────>│                                  │
     │      (Requires Tier 1)      │── 2. Create Tier 2 Session ─────>│
     │                             │      (TIER2_FLOW_ID)             │
     │                             │<─ 3. Return session token ───────│
     │<─ 4. Launch MetaMap SDK ────│                                  │
     │                                                                │
     │─────── 5. Biometric Selfie Scan (3D Liveness) ────────────────>│
     │─────── 6. Upload Proof of Address (Utility Bill) ─────────────>│
     │                                                                │
     │                             │<── 7. Webhook: verification_ ────│
     │                             │       completed (HMAC signed)    │
     │                             │                                  │
     │                             │── 8. Validate signature & checks │
     │                             │── 9. Set user.tier = 2           │
     │<─ 10. Tier 2 Confirmed ─────│                                  │
```

1. **Guard Condition:**
   `POST /api/v1/kyc/tier2/initiate` validates that `user.tier >= 1` before allowing session creation.
2. **Liveness & Document Processing:**
   * 3D camera scan tests for real human presence (anti-spoofing).
   * Face is matched against the portrait retrieved from the user's Tier 1 BVN/NIN record.
   * Document reader extracts address, issue date (< 3 months old), and user's full name.
3. **Elevation:**
   Upon successful webhook verification, `user.tier = 2` is saved.

---

## 5. Admin Dynamic KYC Control (Mode Toggle)

Administrators can enable or disable KYC enforcement globally at any moment without application downtime.

### Data Model (`model/systemSetting.js`)
```javascript
const mongoose = require("mongoose");

const systemSettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "app_settings", unique: true },
    isKycEnforced: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemSetting", systemSettingSchema);
```

### Admin Endpoints
* `GET /api/v1/admin/kyc-mode`: Retrieves current global enforcement status.
* `PATCH /api/v1/admin/kyc-mode`: Body `{ isKycEnforced: boolean }`. Enables or disables KYC gates immediately.

---

## 6. Security Protocols & NDPR Compliance

1. **Zero Plaintext PII:**
   Raw 11-digit BVNs and NINs must never be stored directly in MongoDB.
2. **Deterministic Blind Indexing:**
   ```javascript
   const bvnBlindIndex = crypto
     .createHmac("sha256", process.env.PII_HASH_SALT)
     .update(rawBvn.trim())
     .digest("hex");
   ```
   Stored in `kycModel.bvnHash` (with a unique sparse MongoDB index) to prevent one identity from registering across multiple accounts.
3. **Webhook HMAC-SHA256 Validation:**
   ```javascript
   const computedHash = crypto
     .createHmac("sha256", process.env.METAMAP_WEBHOOK_SECRET)
     .update(req.rawBody)
     .digest("hex");

   const isValid = crypto.timingSafeEqual(
     Buffer.from(computedHash, "hex"),
     Buffer.from(req.headers["x-signature"] || "", "hex")
   );
   ```
4. **Idempotency Protection:**
   MetaMap verification IDs are recorded in MongoDB; duplicate webhook payloads are rejected safely.

---

## 7. Gating Middleware Specification (`requireTier`)

A modular middleware will wrap financial endpoints:

```javascript
// Example usage:
router.post('/convert', Authentication, requireTier(1), conversion);
router.post('/create-plan', Authentication, requireTier(1), createPlan);
router.post('/top-up/:savingId', Authentication, requireTier(1), topUpFlexible);
router.post('/initiateInvestment', Authentication, requireTier(2), createInvestment);
```

### Standardized Error Payload (HTTP 403)
When a user attempts an action above their KYC tier (and KYC Mode is ON):
```json
{
  "success": false,
  "code": "KYC_TIER_REQUIRED",
  "message": "Tier 1 verification (BVN & NIN) is required to access currency conversions.",
  "requiredTier": 1,
  "currentTier": 0,
  "action": "INITIATE_TIER_1_KYC"
}
```

---

## 8. Implementation Checklist

- [ ] Obtain MetaMap Client ID, Client Secret, and Webhook Secret.
- [ ] Configure Flow 1 (NIN + BVN) and Flow 2 (Liveness + PoA) on MetaMap Dashboard.
- [ ] Add `model/systemSetting.js` and admin toggle endpoints.
- [ ] Add `middleware/checkTier.js` (`requireTier`).
- [ ] Implement `POST /api/v1/kyc/webhook` with raw-body HMAC-SHA256 signature verification.
- [ ] Protect `/convert`, `/create-plan`, `/top-up`, and `/initiateInvestment` with tier requirements.
- [ ] Conduct end-to-end sandbox verification and verify admin toggle overrides.
