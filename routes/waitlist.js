const router = require("express").Router();
const {
  joinWaitlist,
  verifyWaitlistEmail,
  resendVerificationEmail,
} = require("../controller/waitlist");
const {
  waitlistValidator,
  verifyWaitlistValidator,
  resendWaitlistValidator,
} = require("../middleware/validators");

router.post("/waitlist", waitlistValidator, joinWaitlist);
router.get("/waitlist/verify", verifyWaitlistValidator, verifyWaitlistEmail);
router.post("/waitlist/verify", verifyWaitlistValidator, verifyWaitlistEmail);
router.post(
  "/waitlist/resend-verification",
  resendWaitlistValidator,
  resendVerificationEmail
);

module.exports = router;

