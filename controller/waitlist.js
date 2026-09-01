const { waitlistModel } = require("../model/waitlist");
const crypto = require("crypto");

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
      return res.status(400).json({
        success: false,
        message: "Email is already registered on the waitlist",
      });
    }

    const referralCode = await generateReferralCode();
    const signupBonus = 5000;
    const referralReward = 2000;

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
    });

    await waitlistUser.save();

    const baseUrl =
      process.env.CLIENT_URL ||
      process.env.FRONTEND_URL ||
      "https://hedge-nest.vercel.app";
    const referralLink = `${baseUrl}/waitlist?ref=${referralCode}`;

    return res.status(201).json({
      success: true,
      message: "Successfully joined the waitlist.",
      data: {
        firstName: waitlistUser.firstName,
        email: waitlistUser.email,
        signupBonus: waitlistUser.signupBonus,
        referralCode: waitlistUser.referralCode,
        referralLink,
        referralReward: waitlistUser.referralReward,
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
