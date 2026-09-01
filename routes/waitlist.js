const router = require("express").Router();
const { joinWaitlist } = require("../controller/waitlist");
const { waitlistValidator } = require("../middleware/validators");

router.post("/waitlist", waitlistValidator, joinWaitlist);

module.exports = router;
