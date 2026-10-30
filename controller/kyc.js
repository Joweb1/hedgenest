const crypto = require('crypto')
const axios = require('axios')
const userModel = require('../model/user')
const kycModel = require('../model/kyc')

const METAMAP_API = process.env.METAMAP_API_URL || 'https://api.prod.metamap.com'

const blindIndex = (value) =>
  crypto.createHmac('sha256', process.env.PII_HASH_SALT).update(String(value).trim()).digest('hex')

const normalizeName = (name) =>
  String(name || '').toLowerCase().replace(/[^a-z]/g, '')

const verifySignature = (req) => {
  const secret = process.env.METAMAP_WEBHOOK_SECRET
  const received = req.headers['x-signature'] || ''
  if (!secret || !req.rawBody || !received) return false

  const computed = crypto.createHmac('sha256', secret).update(req.rawBody).digest('hex')
  const a = Buffer.from(computed, 'hex')
  const b = Buffer.from(received, 'hex')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

const getMetaMapToken = async () => {
  const basic = Buffer.from(
    `${process.env.METAMAP_CLIENT_ID}:${process.env.METAMAP_CLIENT_SECRET}`
  ).toString('base64')
  const { data } = await axios.post(
    `${METAMAP_API}/oauth`,
    'grant_type=client_credentials',
    { headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
  )
  return data.access_token
}

const fetchVerification = async (resourceUrl) => {
  const token = await getMetaMapToken()
  const { data } = await axios.get(resourceUrl, { headers: { Authorization: `Bearer ${token}` } })
  return data
}

// Pulls the NIN and names out of MetaMap's verification resource.
const extractIdentity = (verification) => {
  const fields = {}
  for (const doc of verification?.documents || []) {
    Object.assign(fields, doc.fields || {})
  }
  const val = (key) => fields[key]?.value
  let firstName = val('firstName')
  let lastName = val('surname') || val('lastName')
  if ((!firstName || !lastName) && val('fullName')) {
    const parts = String(val('fullName')).trim().split(/\s+/)
    firstName = firstName || parts[0]
    lastName = lastName || parts[parts.length - 1]
  }
  return {
    nin: val('documentNumber') || val('nin') || val('idNumber'),
    firstName,
    lastName,
    fullName: val('fullName'),
  }
}

// Matches when the user's first and last names both appear in the NIN record.
const namesMatch = (user, identity) => {
  const haystack = normalizeName(
    [identity.firstName, identity.lastName, identity.fullName].filter(Boolean).join(' ')
  )
  const first = normalizeName(user.firstName)
  const last = normalizeName(user.lastName)
  return !!haystack && !!first && !!last && haystack.includes(first) && haystack.includes(last)
}

// Returns the public values the MetaMap web button needs to launch the Tier 1 flow.
exports.initiateTier1 = async (req, res) => {
  try {
    if (!process.env.METAMAP_CLIENT_ID || !process.env.METAMAP_FLOW_TIER1_ID) {
      return res.status(503).json({ success: false, message: 'KYC provider is not configured' })
    }

    const user = await userModel.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    if (user.tier >= 1) {
      return res.status(400).json({ success: false, message: 'Identity is already verified' })
    }

    const sessionId = crypto.randomBytes(16).toString('hex')
    await kycModel.findOneAndUpdate(
      { userId: user._id, status: { $in: ['pending', 'rejected', 'needs_review'] } },
      { userId: user._id, flowId: process.env.METAMAP_FLOW_TIER1_ID, status: 'pending', rejectionReason: null, sessionId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    res.status(200).json({
      success: true,
      message: 'Launch the MetaMap SDK with the details below',
      data: {
        clientId: process.env.METAMAP_CLIENT_ID,
        flowId: process.env.METAMAP_FLOW_TIER1_ID,
        metadata: { userId: String(user._id), sessionId, tier: 1 },
      },
    })
  } catch (error) {
    console.error('initiateTier1 error:', error)
    res.status(500).json({ success: false, message: 'Failed to start verification' })
  }
}

exports.initiateTier2 = (req, res) => {
  res.status(501).json({
    success: false,
    code: 'KYC_TIER2_UNAVAILABLE',
    message: 'Tier 2 verification (face liveness) is not available yet.',
  })
}

exports.getStatus = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select('tier')
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    const kyc = await kycModel.findOne({ userId: user._id }).sort({ createdAt: -1 })
    res.status(200).json({
      success: true,
      data: {
        tier: user.tier || 0,
        status: kyc?.status || 'not_started',
        rejectionReason: kyc?.rejectionReason || null,
      },
    })
  } catch (error) {
    console.error('getStatus error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch KYC status' })
  }
}

exports.metamapWebhook = async (req, res) => {
  try {
    if (!verifySignature(req)) {
      return res.status(401).json({ success: false, message: 'Invalid signature' })
    }

    const { eventName, resource, metadata, identityStatus } = req.body
    if (eventName !== 'verification_completed') {
      return res.status(200).json({ success: true, message: 'Event ignored' })
    }

    const verificationId = req.body.resource?.split('/').pop() || req.body.id
    const userId = metadata?.userId
    const sessionId = metadata?.sessionId
    if (!userId || !sessionId || !verificationId) {
      return res.status(200).json({ success: true, message: 'Missing metadata, ignored' })
    }

    // Idempotency: a verification is only ever processed once.
    if (await kycModel.exists({ verificationId })) {
      return res.status(200).json({ success: true, message: 'Already processed' })
    }

    const kyc = await kycModel.findOne({ userId, sessionId, status: { $in: ['pending', 'rejected', 'needs_review'] } })
    const user = kyc && (await userModel.findById(userId))
    if (!user || !kyc) {
      return res.status(200).json({ success: true, message: 'No matching KYC session' })
    }
    kyc.verificationId = verificationId
    kyc.sessionId = undefined // single use

    if (identityStatus !== 'verified') {
      kyc.status = 'rejected'
      kyc.rejectionReason = 'Identity verification was not successful'
      await kyc.save()
      return res.status(200).json({ success: true })
    }

    // With API access (client secret, paid plan) also confirm the NIN belongs to this user.
    if (process.env.METAMAP_CLIENT_SECRET && resource) {
      let identity
      try {
        identity = extractIdentity(await fetchVerification(resource))
      } catch (err) {
        console.error('MetaMap verification fetch failed:', err.message)
      }

      if (!identity || !identity.nin) {
        kyc.status = 'needs_review'
        kyc.rejectionReason = 'Could not read NIN details from provider'
        await kyc.save()
        return res.status(200).json({ success: true })
      }

      kyc.userFirstName = identity.firstName
      kyc.userLastName = identity.lastName

      if (!namesMatch(user, identity)) {
        kyc.status = 'rejected'
        kyc.rejectionReason = 'NIN does not match user details'
        await kyc.save()
        return res.status(200).json({ success: true })
      }

      const ninHash = blindIndex(identity.nin)
      if (await kycModel.exists({ ninHash, userId: { $ne: user._id } })) {
        kyc.status = 'rejected'
        kyc.rejectionReason = 'This NIN is already linked to another account'
        await kyc.save()
        return res.status(200).json({ success: true })
      }

      kyc.ninHash = ninHash
      kyc.nameVerified = true
    }

    kyc.status = 'verified'
    kyc.isVerified1 = true
    kyc.rejectionReason = null
    await kyc.save()

    user.tier = Math.max(user.tier || 0, 1)
    await user.save()

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('metamapWebhook error:', error)
    // 500 lets MetaMap retry delivery.
    res.status(500).json({ success: false, message: 'Webhook processing failed' })
  }
}
