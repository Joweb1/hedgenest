const router = require('express').Router()
const { initiateTier1, initiateTier2, getStatus, metamapWebhook } = require('../controller/kyc')
const { Authentication } = require('../middleware/auth')

router.post('/kyc/tier1/initiate', Authentication, initiateTier1)
router.post('/kyc/tier2/initiate', Authentication, initiateTier2)
router.get('/kyc/status', Authentication, getStatus)
router.post('/kyc/webhook', metamapWebhook)

module.exports = router
