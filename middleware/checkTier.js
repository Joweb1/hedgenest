const userModel = require('../model/user')
const systemSettingModel = require('../model/systemSetting')

const TIER_MESSAGES = {
  1: 'Tier 1 verification (NIN) is required to access this feature.',
  2: 'Tier 2 verification (face liveness) is required to access this feature.',
}

const isKycEnforced = async () => {
  const setting = await systemSettingModel.findOne({ key: 'app_settings' })
  return setting ? setting.isKycEnforced : true
}

// Must run after Authentication. Passes through when admins have switched KYC mode off.
const requireTier = (requiredTier) => async (req, res, next) => {
  try {
    if (!(await isKycEnforced())) return next()

    const user = await userModel.findById(req.user.id).select('tier')
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    if ((user.tier || 0) < requiredTier) {
      return res.status(403).json({
        success: false,
        code: 'KYC_TIER_REQUIRED',
        message: TIER_MESSAGES[requiredTier],
        requiredTier,
        currentTier: user.tier || 0,
        action: `INITIATE_TIER_${(user.tier || 0) + 1}_KYC`,
      })
    }
    next()
  } catch (error) {
    console.error('requireTier error:', error)
    res.status(500).json({ success: false, message: 'Unable to check KYC status' })
  }
}

module.exports = { requireTier, isKycEnforced }
