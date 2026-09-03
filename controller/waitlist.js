const { waitlistModel } = require("../model/waitlist");
const crypto = require("crypto");
const { sendEmail } = require("../utils/brevo");
const {
  waitlistVerificationTemplate,
  waitlistWelcomeTemplate,
} = require("../email");

const generateReferralCode = async () => {
  let isUnique = false;
  let code = "";
  while (!isUnique) {
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    code = `HN-${randomHex}`;
    const existing = await waitlistModel.findOne({ referralCode: code });
    if (!existing) {
      isUnique = true;
    }
  }
  return code;
};

exports.joinWaitlist = async (req, res) => {
  try {
    const { firstName, lastName, email, amountRange } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already registered on waitlist
    const existingWaitlistUser = await waitlistModel.findOne({
      email: normalizedEmail,
    });

    if (existingWaitlistUser) {
      if (!existingWaitlistUser.isVerified) {
        return res.status(400).json({
          success: false,
          message:
            "Email is already registered on the waitlist but not verified yet. Please check your inbox or request a new verification link.",
          isVerified: false,
        });
      }
      return res.status(400).json({
        success: false,
        message: "Email is already registered on the waitlist",
      });
    }

    const referralCode = await generateReferralCode();
    const signupBonus = 5000;
    const referralReward = 2000;
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const formattedFirstName =
      firstName.trim().charAt(0).toUpperCase() + firstName.trim().slice(1);
    const formattedLastName =
      lastName.trim().charAt(0).toUpperCase() + lastName.trim().slice(1);

    const waitlistUser = new waitlistModel({
      firstName: formattedFirstName,
      lastName: formattedLastName,
      email: normalizedEmail,
      amountRange,
      referralCode,
      signupBonus,
      referralReward,
      referralCount: 0,
      status: "pending",
      isVerified: false,
      verificationToken,
      verificationExpires,
    });

    await waitlistUser.save();

    const baseUrl =
      process.env.CLIENT_URL ||
      process.env.FRONTEND_URL ||
      "https://hedge-nest.vercel.app";
    const referralLink = `${baseUrl}/waitlist?ref=${referralCode}`;
    const verifyUrl = `${baseUrl}/waitlist/verify?token=${verificationToken}&email=${encodeURIComponent(normalizedEmail)}`;

    // Send Email 1: Verification Email
    try {
      const emailHtml = waitlistVerificationTemplate({
        name: waitlistUser.firstName,
        verifyUrl,
      });
      await sendEmail(
        waitlistUser.email,
        "You’re almost in - Verify your Hedgenest waitlist spot",
        emailHtml
      );
    } catch (mailError) {
      console.warn(
        "Could not send verification email (check Brevo API key):",
        mailError.message
      );
    }

    return res.status(201).json({
      success: true,
      message:
        "Successfully joined the waitlist. We have sent a verification email to secure your spot.",
      data: {
        firstName: waitlistUser.firstName,
        email: waitlistUser.email,
        signupBonus: waitlistUser.signupBonus,
        referralCode: waitlistUser.referralCode,
        referralLink,
        referralReward: waitlistUser.referralReward,
        isVerified: false,
        verificationToken,
      },
    });
  } catch (error) {
    console.error("Waitlist registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Error joining waitlist",
      error: error.message,
    });
  }
};

exports.verifyWaitlistEmail = async (req, res) => {
  try {
    const token = req.body?.token || req.query?.token;
    const email = (req.body?.email || req.query?.email || "").trim().toLowerCase();

    if (!token && !email) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    let waitlistUser = null;

    if (token) {
      waitlistUser = await waitlistModel.findOne({ verificationToken: token });
    }

    if (!waitlistUser && email) {
      const userByEmail = await waitlistModel.findOne({ email });
      if (userByEmail && userByEmail.isVerified) {
        const baseUrl =
          process.env.CLIENT_URL ||
          process.env.FRONTEND_URL ||
          "https://hedge-nest.vercel.app";
        const referralLink = `${baseUrl}/waitlist?ref=${userByEmail.referralCode}`;

        return res.status(200).json({
          success: true,
          message: "Email is already verified.",
          data: {
            firstName: userByEmail.firstName,
            email: userByEmail.email,
            waitlistPosition: userByEmail.waitlistPosition,
            signupBonus: userByEmail.signupBonus,
            referralCode: userByEmail.referralCode,
            referralLink,
            referralReward: userByEmail.referralReward,
            isVerified: true,
          },
        });
      }
    }

    if (!waitlistUser) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    if (
      waitlistUser.verificationExpires &&
      Date.now() > waitlistUser.verificationExpires
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Verification link has expired. Please request a new verification email.",
      });
    }

    // Mark as verified
    waitlistUser.isVerified = true;
    waitlistUser.status = "active";
    waitlistUser.verifiedAt = new Date();
    waitlistUser.verificationToken = null;
    waitlistUser.verificationExpires = null;

    // Calculate 1-indexed waitlist position among verified users
    const priorVerifiedCount = await waitlistModel.countDocuments({
      _id: { $ne: waitlistUser._id },
      isVerified: true,
      $or: [
        { verifiedAt: { $lte: waitlistUser.verifiedAt } },
        { createdAt: { $lte: waitlistUser.createdAt } },
      ],
    });
    const position = priorVerifiedCount + 1;

    waitlistUser.waitlistPosition = position;
    await waitlistUser.save();


    const baseUrl =
      process.env.CLIENT_URL ||
      process.env.FRONTEND_URL ||
      "https://hedge-nest.vercel.app";
    const referralLink = `${baseUrl}/waitlist?ref=${waitlistUser.referralCode}`;

    // Send Email 2: Congratulations & Waitlist Spot Email
    try {
      const welcomeHtml = waitlistWelcomeTemplate({
        name: waitlistUser.firstName,
        waitlistPosition: position,
        referralCode: waitlistUser.referralCode,
        referralLink,
        signupBonus: waitlistUser.signupBonus,
        referralReward: waitlistUser.referralReward,
      });

      await sendEmail(
        waitlistUser.email,
        `You're #${position} on the Hedgenest Waitlist! 🎉`,
        welcomeHtml
      );
    } catch (mailError) {
      console.warn(
        "Could not send welcome email (check Brevo API key):",
        mailError.message
      );
    }

    if (req.method === "GET" && req.query.redirect === "true") {
      return res.redirect(
        `${baseUrl}/waitlist/success?verified=true&position=${position}&ref=${waitlistUser.referralCode}`
      );
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! Your waitlist spot is secured.",
      data: {
        firstName: waitlistUser.firstName,
        email: waitlistUser.email,
        waitlistPosition: position,
        signupBonus: waitlistUser.signupBonus,
        referralCode: waitlistUser.referralCode,
        referralLink,
        referralReward: waitlistUser.referralReward,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error("Waitlist email verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying waitlist email",
      error: error.message,
    });
  }
};

exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const waitlistUser = await waitlistModel.findOne({ email: normalizedEmail });

    if (!waitlistUser) {
      return res.status(404).json({
        success: false,
        message: "Email not found on the waitlist",
      });
    }

    if (waitlistUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: "This email address is already verified.",
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    waitlistUser.verificationToken = verificationToken;
    waitlistUser.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await waitlistUser.save();

    const baseUrl =
      process.env.CLIENT_URL ||
      process.env.FRONTEND_URL ||
      "https://hedge-nest.vercel.app";
    const verifyUrl = `${baseUrl}/waitlist/verify?token=${verificationToken}&email=${encodeURIComponent(normalizedEmail)}`;

    try {
      const emailHtml = waitlistVerificationTemplate({
        name: waitlistUser.firstName,
        verifyUrl,
      });
      await sendEmail(
        waitlistUser.email,
        "You’re almost in - Verify your Hedgenest waitlist spot",
        emailHtml
      );
    } catch (mailError) {
      console.warn(
        "Could not send verification email (check Brevo API key):",
        mailError.message
      );
    }

    return res.status(200).json({
      success: true,
      message: "Verification email resent successfully.",
      data: {
        email: waitlistUser.email,
        verificationToken,
      },
    });
  } catch (error) {
    console.error("Resend waitlist verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Error resending verification email",
      error: error.message,
    });
  }
};

