const mongoose = require('mongoose')

const kycSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    provider: {
      type: String,
      default: 'metamap'
    },
    flowId: {
      type: String,
      default: null
    },
    // MetaMap verification id; unique so a replayed webhook is processed once.
    verificationId: {
      type: String,
      default: undefined
    },
    // One-time nonce sent to MetaMap as metadata so a webhook can only upgrade the session it was issued for.
    sessionId: {
      type: String,
      default: undefined
    },
    // True only when the NIN name was checked against the user (needs MetaMap API access, i.e. a paid plan).
    nameVerified: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'needs_review'],
      default: 'pending'
    },
    rejectionReason: {
      type: String,
      default: null
    },
    // Names returned by the identity provider (NIN record).
    userFirstName: {
      type: String,
      trim: true
    },
    userLastName: {
      type: String,
      trim: true
    },
    idType: {
      type: String,
      enum: ['nin'],
      lowercase: true,
      default: 'nin'
    },
    // HMAC-SHA256 blind index of the NIN; the raw NIN is never stored.
    ninHash: {
      type: String,
      default: undefined
    },
    isVerified1: {
      type: Boolean,
      default: false
    },
    // Tier 2 (face liveness) is not implemented yet; kept so login payloads stay stable.
    isVerified2: {
      type: Boolean,
      default: false
    },
  }, { timestamps: true }
)

kycSchema.index({ verificationId: 1 }, { unique: true, partialFilterExpression: { verificationId: { $type: 'string' } } })
kycSchema.index({ sessionId: 1 }, { unique: true, partialFilterExpression: { sessionId: { $type: 'string' } } })
kycSchema.index({ ninHash: 1 }, { unique: true, partialFilterExpression: { ninHash: { $type: 'string' } } })

module.exports = mongoose.model('kycs', kycSchema)
