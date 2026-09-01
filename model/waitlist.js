const mongoose = require("mongoose");

const ALLOWED_AMOUNT_RANGES = [
  "5000-100000-annually",
  "100000-500000-annually",
  "500000-1000000-annually",
  "1000000-5000000-annually",
  "5000000-above-annually",
  "5000-100000-monthly",
  "100000-500000-monthly",
  "500000-1000000-monthly",
  "1000000-5000000-monthly",
  "5000000-above-monthly",
  "5000-100000",
  "100000-500000",
  "500000-1000000",
  "1000000-5000000",
  "5000000-above",
  "below-5000",
];

const waitlistSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    amountRange: {
      type: String,
      required: true,
      enum: ALLOWED_AMOUNT_RANGES,
      trim: true,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    signupBonus: {
      type: Number,
      default: 5000,
    },
    referralReward: {
      type: Number,
      default: 2000,
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "approved", "active"],
    },
  },
  { timestamps: true }
);

const waitlistModel = mongoose.model("waitlist", waitlistSchema);

module.exports = {
  waitlistModel,
  ALLOWED_AMOUNT_RANGES,
};
