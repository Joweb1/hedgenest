const { requireTier } = require('../middleware/checkTier')
const router = require('express').Router()

const { conversion, liveRate, myConversion } = require('../controller/conversion')
const { Authentication } = require('../middleware/auth')
const { conversionValidator } = require('../middleware/validators')


router.get('/liveRate', liveRate )
router.post('/convert', Authentication, requireTier(1), conversionValidator, conversion )
router.get('/myConversion', Authentication, conversionValidator, myConversion )

module.exports = router