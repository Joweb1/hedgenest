/**
 * Generates an interactive, celebratory HTML landing page with graffiti / confetti animation
 * for users who successfully verify their waitlist email.
 */
exports.renderWaitlistSuccessPage = ({
  firstName,
  waitlistPosition,
  totalWaitlistCount,
  referralCode,
  referralLink,
  signupBonus = 5000,
  referralReward = 2000,
}) => {
  const formattedBonus = Number(signupBonus).toLocaleString();
  const formattedReward = Number(referralReward).toLocaleString();
  const formattedTotal = Number(totalWaitlistCount).toLocaleString();

  const tweetText = encodeURIComponent(
    `I just secured spot #${waitlistPosition} on the @HedgeNest waitlist! Join with my link to get a ₦${formattedBonus} bonus: ${referralLink}`
  );
  const whatsappText = encodeURIComponent(
    `Hey! I just secured spot #${waitlistPosition} on the HedgeNest waitlist. Join with my link to claim your ₦${formattedBonus} bonus: ${referralLink}`
  );
  const telegramText = encodeURIComponent(
    `I secured spot #${waitlistPosition} on the HedgeNest waitlist! Join here: ${referralLink}`
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Spot Secured! 🎉 - HedgeNest Waitlist</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Permanent+Marker&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: #111827;
      --card-border: #1f2937;
      --gold: #ddad0f;
      --gold-hover: #ca8a04;
      --emerald: #10b981;
      --text-main: #f9fafb;
      --text-muted: #9ca3af;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      color: var(--text-main);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      position: relative;
      overflow-x: hidden;
    }

    /* Fullscreen Confetti Canvas */
    #confettiCanvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999;
    }

    /* Ambient Background Glow */
    .glow-bg {
      position: absolute;
      width: 450px;
      height: 450px;
      background: radial-gradient(circle, rgba(221, 173, 15, 0.15) 0%, rgba(16, 185, 129, 0.08) 50%, transparent 70%);
      top: 5%;
      left: 50%;
      transform: translateX(-50%);
      filter: blur(50px);
      z-index: 1;
      pointer-events: none;
    }

    .container {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 540px;
      background: rgba(17, 24, 39, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid var(--card-border);
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(221, 173, 15, 0.1);
      overflow: hidden;
      animation: popIn 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes popIn {
      0% { opacity: 0; transform: scale(0.92) translateY(20px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }

    .header-bar {
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .brand {
      font-size: 20px;
      font-weight: 800;
      color: var(--gold);
      letter-spacing: 0.5px;
    }

    .verified-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(16, 185, 129, 0.12);
      color: var(--emerald);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 5px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .card-body {
      padding: 32px 28px;
      text-align: center;
    }

    /* Graffiti Badge */
    .graffiti-tag {
      font-family: 'Permanent Marker', cursive;
      font-size: 28px;
      color: #facc15;
      text-shadow: 2px 2px 0px #b45309, 0 0 20px rgba(234, 179, 8, 0.5);
      transform: rotate(-3deg);
      display: inline-block;
      margin-bottom: 8px;
      letter-spacing: 1px;
      animation: wiggle 3s infinite ease-in-out;
    }

    @keyframes wiggle {
      0%, 100% { transform: rotate(-3deg); }
      50% { transform: rotate(1deg) scale(1.03); }
    }

    h1 {
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 8px;
      line-height: 1.25;
    }

    .subtitle {
      font-size: 15px;
      color: var(--text-muted);
      margin-bottom: 24px;
      line-height: 1.5;
    }

    /* Position Hero */
    .position-hero {
      background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%);
      border: 2px solid rgba(221, 173, 15, 0.3);
      border-radius: 20px;
      padding: 24px 20px;
      margin-bottom: 24px;
      position: relative;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(221, 173, 15, 0.05);
    }

    .position-label {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: var(--gold);
      margin-bottom: 4px;
    }

    .position-number {
      font-size: 58px;
      font-weight: 900;
      color: #ffffff;
      line-height: 1;
      margin: 8px 0;
      letter-spacing: -2px;
      text-shadow: 0 0 30px rgba(221, 173, 15, 0.4);
    }

    .position-total {
      font-size: 14px;
      color: #94a3b8;
      font-weight: 500;
    }

    .reach-out-note {
      font-size: 13px;
      color: #cbd5e1;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-style: italic;
    }

    /* Perks Grid */
    .perks-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }

    .perk-card {
      background: rgba(31, 41, 55, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 14px;
      text-align: center;
    }

    .perk-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
      letter-spacing: 0.5px;
    }

    .perk-val {
      font-size: 18px;
      font-weight: 800;
      color: #ffffff;
      margin-top: 4px;
    }

    .perk-val.gold { color: var(--gold); }
    .perk-val.emerald { color: var(--emerald); }

    /* Referral Share Section */
    .share-box {
      background: rgba(30, 41, 59, 0.5);
      border: 1px dashed rgba(221, 173, 15, 0.4);
      border-radius: 18px;
      padding: 20px;
      text-align: left;
      margin-bottom: 20px;
    }

    .share-title {
      font-size: 15px;
      font-weight: 700;
      color: #fbbf24;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .share-desc {
      font-size: 13px;
      color: #cbd5e1;
      line-height: 1.45;
      margin-bottom: 14px;
    }

    .copy-group {
      display: flex;
      gap: 8px;
      margin-bottom: 14px;
    }

    .referral-input {
      flex: 1;
      background: #0f172a;
      border: 1px solid #334155;
      color: #e2e8f0;
      padding: 12px 14px;
      border-radius: 10px;
      font-size: 13px;
      font-family: monospace;
      outline: none;
    }

    .copy-btn {
      background: var(--gold);
      color: #111827;
      border: none;
      border-radius: 10px;
      padding: 0 18px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .copy-btn:hover {
      background: var(--gold-hover);
      color: #ffffff;
    }

    .social-row {
      display: flex;
      gap: 8px;
    }

    .social-btn {
      flex: 1;
      padding: 10px 8px;
      border-radius: 10px;
      text-decoration: none;
      font-size: 12px;
      font-weight: 600;
      text-align: center;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: opacity 0.2s;
    }

    .social-btn:hover { opacity: 0.85; }
    .social-whatsapp { background: #25d366; color: #ffffff; }
    .social-twitter { background: #1d9bf0; color: #ffffff; }
    .social-telegram { background: #0088cc; color: #ffffff; }

    .footer-note {
      font-size: 12px;
      color: #64748b;
      margin-top: 16px;
    }

    /* Toast Notification */
    .toast {
      position: fixed;
      bottom: 24px;
      background: #10b981;
      color: #ffffff;
      padding: 10px 20px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 700;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 1000;
      pointer-events: none;
    }

    .toast.show {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
</head>
<body>
  <div class="glow-bg"></div>
  <canvas id="confettiCanvas"></canvas>

  <div class="container">
    <div class="header-bar">
      <span class="brand">HedgeNest</span>
      <span class="verified-pill">✓ Email Verified</span>
    </div>

    <div class="card-body">
      <div class="graffiti-tag">🎉 CONGRATULATIONS!</div>
      <h1>You’re in. Spot secured! 🎉</h1>
      <p class="subtitle">Hi <strong>${firstName}</strong>, your email has been verified. You're officially on the HedgeNest waitlist!</p>

      <!-- Position Card -->
      <div class="position-hero">
        <p class="position-label">Your Waitlist Position</p>
        <div class="position-number">#${waitlistPosition}</div>
        <p class="position-total">Out of <strong>${formattedTotal}</strong> people on the waitlist.</p>
        <p class="reach-out-note">We’ll reach out when HedgeNest is ready for you.</p>
      </div>

      <!-- Perks Grid -->
      <div class="perks-grid">
        <div class="perk-card">
          <div class="perk-label">🎁 Signup Bonus</div>
          <div class="perk-val emerald">₦${formattedBonus}</div>
        </div>
        <div class="perk-card">
          <div class="perk-label">🤝 Referral Reward</div>
          <div class="perk-val gold">₦${formattedReward} <span style="font-size: 11px; font-weight: 400; color: #9ca3af;">/ friend</span></div>
        </div>
      </div>

      <!-- Share Box -->
      <div class="share-box">
        <div class="share-title">🚀 Want to move up the waitlist?</div>
        <p class="share-desc">
          Share your referral link with friends. For every friend who signs up, you will climb higher on the list and earn <strong>₦${formattedReward}</strong>!
        </p>

        <div class="copy-group">
          <input type="text" readonly value="${referralLink}" id="refLinkInput" class="referral-input" />
          <button onclick="copyRefLink()" class="copy-btn" id="copyBtn">📋 Copy</button>
        </div>

        <div class="social-row">
          <a href="https://api.whatsapp.com/send?text=${whatsappText}" target="_blank" rel="noopener" class="social-btn social-whatsapp">WhatsApp</a>
          <a href="https://twitter.com/intent/tweet?text=${tweetText}" target="_blank" rel="noopener" class="social-btn social-twitter">Share on X</a>
          <a href="https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${telegramText}" target="_blank" rel="noopener" class="social-btn social-telegram">Telegram</a>
        </div>
      </div>

      <p class="footer-note">We've also emailed you a confirmation of your spot and referral link.</p>
    </div>
  </div>

  <div id="toast" class="toast">Link copied to clipboard! 📋</div>

  <script>
    // Copy to clipboard
    function copyRefLink() {
      const input = document.getElementById('refLinkInput');
      input.select();
      input.setSelectionRange(0, 99999);
      navigator.clipboard.writeText(input.value).then(() => {
        const btn = document.getElementById('copyBtn');
        const toast = document.getElementById('toast');
        btn.textContent = '✅ Copied!';
        toast.classList.add('show');
        setTimeout(() => {
          btn.textContent = '📋 Copy';
          toast.classList.remove('show');
        }, 2500);
      });
    }

    // Graffiti / Confetti Animation Engine
    (function () {
      const canvas = document.getElementById('confettiCanvas');
      const ctx = canvas.getContext('2d');
      let width = window.innerWidth;
      let height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
      });

      const colors = ['#ddad0f', '#facc15', '#10b981', '#34d399', '#6366f1', '#ec4899', '#f97316', '#38bdf8'];
      const particles = [];
      const particleCount = 140;

      class Particle {
        constructor(x, y, isBurst = false) {
          this.x = x ?? Math.random() * width;
          this.y = y ?? (isBurst ? height * 0.45 : Math.random() * -50);
          this.size = Math.random() * 9 + 5;
          this.color = colors[Math.floor(Math.random() * colors.length)];
          this.speedX = (Math.random() - 0.5) * (isBurst ? 14 : 5);
          this.speedY = isBurst ? (Math.random() * -12 - 4) : (Math.random() * 3 + 2);
          this.gravity = 0.22;
          this.rotation = Math.random() * 360;
          this.rotationSpeed = (Math.random() - 0.5) * 10;
          this.shape = Math.random() > 0.4 ? 'rect' : 'circle';
          this.opacity = 1;
          this.decay = Math.random() * 0.005 + 0.002;
        }

        update() {
          this.speedY += this.gravity;
          this.x += this.speedX;
          this.y += this.speedY;
          this.rotation += this.rotationSpeed;
          this.opacity -= this.decay;
        }

        draw() {
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.rotate((this.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, this.opacity);
          ctx.fillStyle = this.color;

          if (this.shape === 'rect') {
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // Initial double burst from center
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(width * 0.5, height * 0.35, true));
      }

      // Continuous gentle falling confetti
      function loop() {
        ctx.clearRect(0, 0, width, height);

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.update();
          p.draw();

          if (p.y > height || p.opacity <= 0) {
            particles.splice(i, 1);
          }
        }

        // Add periodic ambient flakes
        if (particles.length < 80 && Math.random() > 0.6) {
          particles.push(new Particle());
        }

        requestAnimationFrame(loop);
      }

      loop();
    })();
  </script>
</body>
</html>`;
};

exports.renderWaitlistErrorPage = ({ message }) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verification Error - HedgeNest</title>
  <style>
    body {
      background-color: #0b0f19;
      color: #f9fafb;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 20px;
      max-width: 460px;
      width: 100%;
      padding: 40px 30px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 22px;
      color: #ef4444;
      margin-bottom: 12px;
    }
    p {
      color: #9ca3af;
      font-size: 15px;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-block;
      background: #ddad0f;
      color: #111827;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⚠️</div>
    <h1>Verification Link Expired or Invalid</h1>
    <p>${message || "We could not verify your email address. The link may have expired or already been used."}</p>
    <a href="https://hedge-nest.vercel.app/waitlist" class="btn">Return to Waitlist</a>
  </div>
</body>
</html>`;
};
