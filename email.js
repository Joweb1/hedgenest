/**
 * HedgeNest Email Templates
 * Branded transactional and notification email templates.
 * Designed for high deliverability, cross-client compatibility (Gmail, Outlook, Apple Mail),
 * and clean mobile responsiveness.
 */

const getBrandConfig = () => {
  const frontendUrl = (
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    "https://hedge-nest.vercel.app"
  ).replace(/\/+$/, "");

  const logoUrl =
    process.env.APP_LOGO_URL ||
    "https://hedge-nest.vercel.app/assets/Hedge-DBj5Zem1.png";

  const supportEmail =
    process.env.BREVO_SENDER_EMAIL || "support@hedgenest.com";

  return {
    brandName: "HedgeNest",
    frontendUrl,
    logoUrl,
    supportEmail,
    helpUrl: `${frontendUrl}/contact`,
    termsUrl: `${frontendUrl}/policy`,
    privacyUrl: `${frontendUrl}/policy`,
    loginUrl: `${frontendUrl}/login`,
    socials: {
      x: {
        url: "https://x.com",
        icon: "https://img.icons8.com/ios-filled/50/94a3b8/twitterx--v1.png",
        alt: "X (Twitter)",
      },
      facebook: {
        url: "https://facebook.com",
        icon: "https://img.icons8.com/ios-filled/50/94a3b8/facebook-new.png",
        alt: "Facebook",
      },
      instagram: {
        url: "https://instagram.com",
        icon: "https://img.icons8.com/ios-filled/50/94a3b8/instagram-new.png",
        alt: "Instagram",
      },
      linkedin: {
        url: "https://linkedin.com",
        icon: "https://img.icons8.com/ios-filled/50/94a3b8/linkedin.png",
        alt: "LinkedIn",
      },
    },
  };
};

/**
 * Universal email shell wrapping every outgoing email
 */
const renderEmailLayout = ({ title, previewText = "", contentHtml }) => {
  const {
    brandName,
    logoUrl,
    frontendUrl,
    supportEmail,
    helpUrl,
    termsUrl,
    privacyUrl,
    socials,
  } = getBrandConfig();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${title} - ${brandName}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; border-radius: 0 !important; }
      .content-cell { padding: 28px 20px !important; }
      .otp-display { font-size: 32px !important; letter-spacing: 6px !important; }
      .hero-number { font-size: 42px !important; }
      .action-button { width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9;">
  ${
    previewText
      ? `<div style="display: none; font-size: 1px; color: #f1f5f9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">${previewText}</div>`
      : ""
  }
  <center style="width: 100%; background-color: #f1f5f9; padding: 32px 10px 48px;">
    <!-- Container Card -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="container" style="max-width: 540px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06); border: 1px solid #e2e8f0;">
      
      <!-- Header with HedgeNest Logo -->
      <tr>
        <td align="center" style="padding: 28px 24px; background-color: #ffffff; border-bottom: 1px solid #f1f5f9;">
          <a href="${frontendUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
            <img src="${logoUrl}" alt="${brandName}" width="145" height="32" style="display: block; width: 145px; max-width: 145px; height: auto; border: 0;" />
          </a>
        </td>
      </tr>

      <!-- Content Body -->
      <tr>
        <td class="content-cell" style="padding: 36px 32px; background-color: #ffffff; text-align: left;">
          ${contentHtml}
        </td>
      </tr>

      <!-- Footer Section -->
      <tr>
        <td align="center" style="padding: 30px 24px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.6;">
          
          <!-- Social Icons Row -->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
            <tr>
              <td style="padding: 0 8px;">
                <a href="${socials.x.url}" target="_blank" title="X (Twitter)" style="display: inline-block; width: 32px; height: 32px; border-radius: 50%; background-color: #f1f5f9; text-align: center; line-height: 32px;">
                  <img src="${socials.x.icon}" alt="X" width="16" height="16" style="vertical-align: middle; margin-top: 8px;" />
                </a>
              </td>
              <td style="padding: 0 8px;">
                <a href="${socials.facebook.url}" target="_blank" title="Facebook" style="display: inline-block; width: 32px; height: 32px; border-radius: 50%; background-color: #f1f5f9; text-align: center; line-height: 32px;">
                  <img src="${socials.facebook.icon}" alt="Facebook" width="16" height="16" style="vertical-align: middle; margin-top: 8px;" />
                </a>
              </td>
              <td style="padding: 0 8px;">
                <a href="${socials.instagram.url}" target="_blank" title="Instagram" style="display: inline-block; width: 32px; height: 32px; border-radius: 50%; background-color: #f1f5f9; text-align: center; line-height: 32px;">
                  <img src="${socials.instagram.icon}" alt="Instagram" width="16" height="16" style="vertical-align: middle; margin-top: 8px;" />
                </a>
              </td>
              <td style="padding: 0 8px;">
                <a href="${socials.linkedin.url}" target="_blank" title="LinkedIn" style="display: inline-block; width: 32px; height: 32px; border-radius: 50%; background-color: #f1f5f9; text-align: center; line-height: 32px;">
                  <img src="${socials.linkedin.icon}" alt="LinkedIn" width="16" height="16" style="vertical-align: middle; margin-top: 8px;" />
                </a>
              </td>
            </tr>
          </table>

          <!-- Support & Help Links -->
          <p style="margin: 0 0 10px; font-size: 13px;">
            Questions? Contact our team at <a href="mailto:${supportEmail}" style="color: #ca8a04; text-decoration: none; font-weight: 600;">${supportEmail}</a>
          </p>
          <p style="margin: 0 0 14px; font-size: 12px; color: #94a3b8;">
            <a href="${helpUrl}" target="_blank" style="color: #64748b; text-decoration: underline;">Help Center</a>
            &nbsp;&bull;&nbsp;
            <a href="${termsUrl}" target="_blank" style="color: #64748b; text-decoration: underline;">Terms of Service</a>
            &nbsp;&bull;&nbsp;
            <a href="${privacyUrl}" target="_blank" style="color: #64748b; text-decoration: underline;">Privacy Policy</a>
          </p>

          <!-- Copyright & Disclaimer -->
          <p style="margin: 0; color: #94a3b8; font-size: 11px;">
            &copy; 2026 ${brandName}. All rights reserved.<br />
            Protect, save, and grow your wealth with confidence.
          </p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
};

/**
 * 1. Email OTP Verification Template (Sign Up / Auth)
 */
exports.emailTemplate = (name, otp) => {
  const contentHtml = `
    <!-- Category Badge -->
    <div style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
      Account Verification
    </div>

    <!-- Heading -->
    <h1 style="margin: 0 0 14px; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.3;">
      Verify Your Email Address
    </h1>

    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px; color: #475569;">
      Hello <strong>${name}</strong>,
    </p>

    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px; color: #475569;">
      Thank you for registering with HedgeNest. Below is your one-time verification passcode (OTP) to complete your account setup:
    </p>

    <!-- OTP Code Display Box -->
    <div style="background-color: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 12px; padding: 22px; text-align: center; margin: 0 0 24px;">
      <span class="otp-display" style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f172a; display: block;">
        ${otp}
      </span>
      <span style="display: block; margin-top: 8px; font-size: 12px; color: #64748b; font-weight: 500;">
        Valid for 7 minutes
      </span>
    </div>

    <!-- Security Guidance Card -->
    <div style="background-color: #f8fafc; border-left: 3px solid #ddad0f; border-radius: 0 8px 8px 0; padding: 14px 16px; margin: 0 0 20px;">
      <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">
        <strong>Security Notice:</strong> Never share this code with anyone. HedgeNest staff will never ask you for your verification code.
      </p>
    </div>

    <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0;">
      If you did not initiate this request, please disregard this email or contact our support team.
    </p>
  `;

  return renderEmailLayout({
    title: "Verify Your Email",
    previewText: `Your verification code is ${otp}. Valid for 7 minutes.`,
    contentHtml,
  });
};

/**
 * 2. Transaction PIN Setup / Verification Template
 */
exports.transactionPinTemplate = (name, otp) => {
  const contentHtml = `
    <!-- Category Badge -->
    <div style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
      PIN Verification
    </div>

    <!-- Heading -->
    <h1 style="margin: 0 0 14px; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.3;">
      Authorize Transaction PIN
    </h1>

    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px; color: #475569;">
      Hello <strong>${name}</strong>,
    </p>

    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px; color: #475569;">
      We received a request to verify or set your transaction PIN. Enter the one-time passcode below to authorize this action:
    </p>

    <!-- OTP Code Display Box -->
    <div style="background-color: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 12px; padding: 22px; text-align: center; margin: 0 0 24px;">
      <span class="otp-display" style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f172a; display: block;">
        ${otp}
      </span>
      <span style="display: block; margin-top: 8px; font-size: 12px; color: #64748b; font-weight: 500;">
        Valid for 7 minutes
      </span>
    </div>

    <!-- Security Guidance Card -->
    <div style="background-color: #fff1f2; border-left: 3px solid #e11d48; border-radius: 0 8px 8px 0; padding: 14px 16px; margin: 0 0 20px;">
      <p style="margin: 0; font-size: 13px; color: #881337; line-height: 1.5;">
        <strong>Important:</strong> If you did not request this code, your account credentials may be compromised. Please change your password and contact support immediately.
      </p>
    </div>

    <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0;">
      Do not share this code with anyone under any circumstances.
    </p>
  `;

  return renderEmailLayout({
    title: "Transaction PIN Verification",
    previewText: `Your transaction PIN authorization code is ${otp}.`,
    contentHtml,
  });
};

/**
 * 3. Reset Password OTP Template
 */
exports.resetPasswordTemplate = (name, otp) => {
  const contentHtml = `
    <!-- Category Badge -->
    <div style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
      Password Recovery
    </div>

    <!-- Heading -->
    <h1 style="margin: 0 0 14px; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.3;">
      Reset Your Password
    </h1>

    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px; color: #475569;">
      Hello <strong>${name}</strong>,
    </p>

    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px; color: #475569;">
      We received a request to reset your HedgeNest account password. Use the verification code below to proceed:
    </p>

    <!-- OTP Code Display Box -->
    <div style="background-color: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 12px; padding: 22px; text-align: center; margin: 0 0 24px;">
      <span class="otp-display" style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f172a; display: block;">
        ${otp}
      </span>
      <span style="display: block; margin-top: 8px; font-size: 12px; color: #64748b; font-weight: 500;">
        Valid for 7 minutes
      </span>
    </div>

    <!-- Security Guidance Card -->
    <div style="background-color: #f8fafc; border-left: 3px solid #ddad0f; border-radius: 0 8px 8px 0; padding: 14px 16px; margin: 0 0 20px;">
      <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">
        <strong>Notice:</strong> If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
    </div>

    <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0;">
      For your security, never forward or disclose this code to anyone.
    </p>
  `;

  return renderEmailLayout({
    title: "Password Reset Request",
    previewText: `Use code ${otp} to reset your HedgeNest account password.`,
    contentHtml,
  });
};

/**
 * 4. Password Reset Successful Template
 */
exports.resetPasswordSuccessfulTemplate = (name) => {
  const { loginUrl } = getBrandConfig();

  const contentHtml = `
    <!-- Category Badge -->
    <div style="display: inline-block; background-color: #ecfdf5; color: #065f46; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 20px;">
      Security Update
    </div>

    <!-- Success Checkmark Badge (Clean SVG Icon, No Emojis) -->
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 64px; height: 64px; line-height: 64px; background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 50%; color: #10b981; text-align: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    </div>

    <!-- Heading -->
    <h1 style="margin: 0 0 14px; font-size: 22px; font-weight: 800; color: #0f172a; text-align: center; line-height: 1.3;">
      Password Reset Successful
    </h1>

    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px; color: #475569; text-align: center;">
      Hello <strong>${name}</strong>, your account password has been successfully updated.
    </p>

    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 28px; color: #64748b; text-align: center;">
      You can now log in to your HedgeNest account using your new credentials.
    </p>

    <!-- Login CTA Button -->
    <div style="text-align: center; margin-bottom: 32px;">
      <a href="${loginUrl}" class="action-button" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #ddad0f 0%, #ca8a04 100%); color: #ffffff; padding: 15px 36px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(221, 173, 15, 0.35);">
        Log In to HedgeNest
      </a>
    </div>

    <!-- Security Warning Card -->
    <div style="background-color: #fff1f2; border-left: 3px solid #e11d48; border-radius: 0 8px 8px 0; padding: 14px 16px; margin: 0;">
      <p style="margin: 0; font-size: 13px; color: #881337; line-height: 1.5;">
        <strong>Didn't make this change?</strong> If you did not authorize this password reset, please contact our support team immediately to secure your account.
      </p>
    </div>
  `;

  return renderEmailLayout({
    title: "Password Updated Successfully",
    previewText: "Your HedgeNest account password has been successfully updated.",
    contentHtml,
  });
};

/**
 * 5. Reset Transaction PIN OTP Template
 */
exports.resetPinTemplate = (name, otp) => {
  const contentHtml = `
    <!-- Category Badge -->
    <div style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
      PIN Reset
    </div>

    <!-- Heading -->
    <h1 style="margin: 0 0 14px; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.3;">
      Reset Your Transaction PIN
    </h1>

    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px; color: #475569;">
      Hello <strong>${name}</strong>,
    </p>

    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px; color: #475569;">
      We received a request to reset your transaction PIN. Enter the one-time passcode below to confirm and set your new PIN:
    </p>

    <!-- OTP Code Display Box -->
    <div style="background-color: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 12px; padding: 22px; text-align: center; margin: 0 0 24px;">
      <span class="otp-display" style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f172a; display: block;">
        ${otp}
      </span>
      <span style="display: block; margin-top: 8px; font-size: 12px; color: #64748b; font-weight: 500;">
        Valid for 7 minutes
      </span>
    </div>

    <!-- Security Guidance Card -->
    <div style="background-color: #f8fafc; border-left: 3px solid #ddad0f; border-radius: 0 8px 8px 0; padding: 14px 16px; margin: 0 0 20px;">
      <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">
        <strong>Security Notice:</strong> Never share your PIN or verification code with anyone. If you didn't initiate this request, contact support immediately.
      </p>
    </div>

    <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0;">
      This code is for your eyes only.
    </p>
  `;

  return renderEmailLayout({
    title: "Reset Transaction PIN",
    previewText: `Use code ${otp} to reset your transaction PIN.`,
    contentHtml,
  });
};

/**
 * 6. Waitlist Email Verification Template
 */
exports.waitlistVerificationTemplate = ({ name, verifyUrl }) => {
  const contentHtml = `
    <!-- Category Badge -->
    <div style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
      Waitlist Verification
    </div>

    <!-- Heading -->
    <h1 style="margin: 0 0 14px; font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.3;">
      Confirm Your Waitlist Spot
    </h1>

    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 14px; color: #475569;">
      Hello <strong>${name}</strong>,
    </p>

    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px; color: #475569;">
      Thank you for your interest in <strong>HedgeNest</strong>. We are building the smartest platform to hedge against currency depreciation, build automated savings vaults, and invest with peace of mind.
    </p>

    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 28px; color: #475569;">
      Please verify your email address to secure your priority position and unlock your personal referral link:
    </p>

    <!-- Verification Button CTA -->
    <div style="text-align: center; margin: 10px 0 28px;">
      <a href="${verifyUrl}" class="action-button" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #ddad0f 0%, #ca8a04 100%); color: #ffffff; padding: 16px 38px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(221, 173, 15, 0.35);">
        Verify My Email Spot
      </a>
    </div>

    <!-- Fallback URL Container -->
    <p style="font-size: 13px; color: #64748b; margin: 24px 0 8px; line-height: 1.5;">
      Button not working? Copy and paste the link below directly into your browser:
    </p>
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; word-break: break-all; font-size: 12px; color: #475569; font-family: 'SFMono-Regular', Consolas, monospace; margin-bottom: 24px;">
      <a href="${verifyUrl}" style="color: #ca8a04; text-decoration: none;">${verifyUrl}</a>
    </div>

    <!-- Expiry Guidance -->
    <div style="background-color: #f8fafc; border-left: 3px solid #ddad0f; border-radius: 0 8px 8px 0; padding: 12px 16px; margin: 0 0 20px;">
      <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
        This verification link is valid for <strong>24 hours</strong>. If you did not sign up for the HedgeNest waitlist, you can safely ignore this email.
      </p>
    </div>
  `;

  return renderEmailLayout({
    title: "Verify Your Waitlist Spot",
    previewText: "Confirm your email address to lock in your priority spot on the HedgeNest waitlist.",
    contentHtml,
  });
};

/**
 * 7. Waitlist Welcome & Position Confirmed Template (With Referral Details)
 */
exports.waitlistWelcomeTemplate = ({
  name,
  waitlistPosition,
  totalWaitlistCount,
  referralCode,
  referralLink,
  signupBonus = 0,
  referralReward = "1 USDT",
}) => {
  const formattedTotal = totalWaitlistCount
    ? Number(totalWaitlistCount).toLocaleString()
    : waitlistPosition;
  const rewardDisplay =
    typeof referralReward === "number"
      ? `${referralReward} USDT`
      : referralReward;

  const contentHtml = `
    <!-- Category Badge -->
    <div style="display: inline-block; background-color: #ecfdf5; color: #065f46; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 18px;">
      Spot Confirmed
    </div>

    <!-- Success Checkmark Badge (Clean SVG Icon, No Emojis) -->
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="display: inline-block; width: 60px; height: 60px; line-height: 60px; background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 50%; color: #10b981; text-align: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    </div>

    <!-- Heading -->
    <h1 style="margin: 0 0 10px; font-size: 24px; font-weight: 800; color: #0f172a; text-align: center; line-height: 1.3;">
      Your Waitlist Spot Is Secured
    </h1>

    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 28px; color: #64748b; text-align: center;">
      Hello <strong>${name}</strong>, your email has been verified and your place on the waitlist is officially locked in.
    </p>

    <!-- Hero Card: Waitlist Position -->
    <div style="background: linear-gradient(135deg, #0a1931 0%, #0f172a 100%); border-radius: 14px; padding: 28px 20px; color: #ffffff; text-align: center; margin-bottom: 28px; box-shadow: 0 8px 20px rgba(10, 25, 49, 0.15);">
      <p style="margin: 0; color: #ddad0f; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
        Your Waitlist Position
      </p>
      <div class="hero-number" style="margin: 10px 0; font-size: 52px; font-weight: 900; color: #ffffff; letter-spacing: -1px; line-height: 1;">
        #${waitlistPosition}
      </div>
      <p style="margin: 0; color: #94a3b8; font-size: 14px;">
        Out of <strong style="color: #ffffff;">${formattedTotal}</strong> registered members
      </p>
      <div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid rgba(255, 255, 255, 0.1); color: #cbd5e1; font-size: 12px; font-style: italic;">
        Priority onboarding starts soon. We will notify you as soon as access opens.
      </div>
    </div>

    <!-- Referral Reward Feature Card -->
    <div style="background-color: #fffbeb; border: 1.5px dashed #fde68a; border-radius: 14px; padding: 24px; margin-bottom: 26px;">
      <h2 style="margin: 0 0 8px; font-size: 16px; color: #92400e; font-weight: 700;">
        Refer Friends and Move Up the List
      </h2>
      <p style="margin: 0 0 16px; font-size: 13px; color: #78350f; line-height: 1.5;">
        Share your personal referral link with friends and colleagues. Each friend who joins using your link earns you an entry into our exclusive <strong>${rewardDisplay}</strong> raffle draw and helps you climb higher on the priority access list.
      </p>

      <!-- Referral Code Box -->
      <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #92400e;">
        Your Unique Referral Code:
      </p>
      <div style="background-color: #ffffff; border: 1px solid #fcd34d; border-radius: 8px; padding: 11px; font-size: 18px; font-weight: 800; font-family: 'SFMono-Regular', Consolas, monospace; color: #0f172a; text-align: center; letter-spacing: 2px; margin-bottom: 14px;">
        ${referralCode}
      </div>

      <!-- Referral Link Box -->
      <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #92400e;">
        Your Referral Link:
      </p>
      <div style="background-color: #ffffff; border: 1px solid #fcd34d; border-radius: 8px; padding: 11px; font-size: 12px; word-break: break-all; color: #b45309; text-align: center; font-family: 'SFMono-Regular', Consolas, monospace;">
        <a href="${referralLink}" style="color: #b45309; text-decoration: underline; font-weight: 600;">${referralLink}</a>
      </div>
    </div>

    <!-- Closing Note -->
    <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0; text-align: center;">
      Keep an eye on your inbox for our next update, product walkthroughs, and early launch invitations.
    </p>
  `;

  return renderEmailLayout({
    title: "Waitlist Spot Secured",
    previewText: `You are #${waitlistPosition} on the HedgeNest waitlist. Share your referral link to move up.`,
    contentHtml,
  });
};