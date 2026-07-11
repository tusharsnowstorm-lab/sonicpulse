import { Resend } from 'resend'

const FROM = 'Sonic Pulse <noreply@sonicpulsefestival.com>'

function resend() {
  return new Resend(process.env.RESEND_API_KEY)
}

// ── Shared HTML wrapper ─────────────────────────────────────────────────────

function wrap(body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
</head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#050508;padding:28px 32px;text-align:center;">
            <div style="font-size:20px;font-weight:900;letter-spacing:0.22em;color:#FF3FC2;font-family:Arial,sans-serif;">⚡ SONIC PULSE</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:4px;letter-spacing:0.15em;text-transform:uppercase;">25 September 2026</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f7f7fb;border-top:1px solid #ebebf0;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;">
              <strong style="color:#666;">Sonic Pulse 2026</strong><br>
              25 September 2026<br>
              <a href="https://sonicpulsefestival.com" style="color:#999;text-decoration:underline;">sonicpulsefestival.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Button helper ───────────────────────────────────────────────────────────

function btn(href: string, label: string, bg = '#ff3fc2', color = '#050508') {
  return `<table cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr>
      <td style="background:${bg};border-radius:6px;">
        <a href="${href}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:${color};text-decoration:none;letter-spacing:0.03em;">${label}</a>
      </td>
    </tr>
  </table>`
}

// ── TIER LABELS ─────────────────────────────────────────────────────────────

const TIER_LABELS: Record<string, string> = {
  phase1: 'Phase 1 — Early Bird',
  phase2: 'Phase 2',
  phase3: 'Phase 3 — Last Release',
}

function tierLabel(tier: string) {
  return TIER_LABELS[tier] ?? tier
}

// ── EMAIL 1: WELCOME ────────────────────────────────────────────────────────

export async function sendWelcomeEmail(email: string, name: string) {
  const firstName = name.split(' ')[0]
  const html = wrap(`
    <h1 style="font-size:24px;font-weight:800;color:#050508;margin:0 0 12px;line-height:1.2;">Welcome, ${firstName}! 👋</h1>
    <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 14px;">
      You're now registered for <strong style="color:#111;">Sonic Pulse</strong> — Bangladesh's biggest outdoor music festival on 25 September 2026.
    </p>
    <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 20px;">
      To secure your spot, complete your profile and apply for a ticket. Make sure your <strong style="color:#111;">profile photo and NID details</strong> are ready — we verify all attendees before approval.
    </p>
    ${btn('https://sonicpulsefestival.com/dashboard', 'Go to my dashboard →')}
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0feff;border:1px solid #b0f0ff;border-radius:8px;margin:4px 0 20px;">
      <tr><td style="padding:14px 16px;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#0070a0;">🎵 What happens next?</p>
        <p style="margin:0;font-size:13px;color:#444;line-height:1.6;">
          Fill in your profile → Apply for a ticket → Wait for approval (24–48 hrs) → Download your ticket
        </p>
      </td></tr>
    </table>
    <p style="font-size:12px;color:#aaa;margin:0;">If you didn't create this account, you can safely ignore this email.</p>
  `)

  await resend().emails.send({
    from: FROM,
    to: email,
    subject: 'Welcome to Sonic Pulse 🎵',
    html,
  })
}

// ── EMAIL 2: APPLICATION RECEIVED ──────────────────────────────────────────

export async function sendApplicationEmail(
  email: string,
  name: string,
  tier: string,
  referenceCode: string,
) {
  const firstName = name.split(' ')[0]
  const html = wrap(`
    <h1 style="font-size:24px;font-weight:800;color:#050508;margin:0 0 12px;line-height:1.2;">Application received ✅</h1>
    <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 20px;">
      Hi <strong style="color:#111;">${firstName}</strong>, we've received your ticket application. Our team will review your details and ID within <strong style="color:#111;">24–48 hours</strong>.
    </p>

    <!-- Details table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7fb;border:1px solid #e0e0f0;border-radius:8px;margin:0 0 16px;">
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #ebebf5;">
          <span style="font-size:12px;color:#888;">Ticket tier</span><br>
          <strong style="font-size:14px;color:#111;">${tierLabel(tier)}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #ebebf5;">
          <span style="font-size:12px;color:#888;">Applicant name</span><br>
          <strong style="font-size:14px;color:#111;">${name}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;">
          <span style="font-size:12px;color:#888;">Status</span><br>
          <strong style="font-size:14px;color:#d97706;">⏳ Under review</strong>
        </td>
      </tr>
    </table>

    <!-- Reference code box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7fb;border:1px solid #e0e0f0;border-radius:8px;margin:0 0 20px;text-align:center;">
      <tr><td style="padding:16px;">
        <p style="margin:0 0 6px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.12em;">Reference code</p>
        <p style="margin:0;font-family:monospace;font-size:22px;font-weight:900;color:#050508;letter-spacing:0.15em;">${referenceCode}</p>
      </td></tr>
    </table>

    <p style="font-size:13px;color:#666;line-height:1.6;margin:0 0 20px;">
      Keep this reference code safe. Gate staff may ask for it if your QR code is unreadable.
    </p>

    ${btn('https://sonicpulsefestival.com/dashboard', 'Check application status →', '#f0f0f8', '#050508')}

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;margin:4px 0 0;">
      <tr><td style="padding:14px 16px;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#92400e;">⚠️ Important</p>
        <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">Do not share your reference code publicly. We will never ask for payment via email.</p>
      </td></tr>
    </table>
  `)

  await resend().emails.send({
    from: FROM,
    to: email,
    subject: 'Your Sonic Pulse ticket application is under review',
    html,
  })
}

// ── EMAIL 3: TICKET APPROVED ────────────────────────────────────────────────

export async function sendApprovalEmail(
  email: string,
  name: string,
  tier: string,
  referenceCode: string,
) {
  const firstName = name.split(' ')[0]
  const html = wrap(`
    <h1 style="font-size:24px;font-weight:800;color:#050508;margin:0 0 12px;line-height:1.2;">You're in, ${firstName}! 🎉</h1>
    <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 20px;">
      Your <strong style="color:#111;">${tierLabel(tier)}</strong> ticket has been approved. See you at the festival!
    </p>

    <!-- Ticket card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#050508;border-radius:10px;overflow:hidden;margin:0 0 20px;">
      <tr>
        <td style="background:linear-gradient(135deg,#0d0d1a 0%,#1a0a2e 100%);padding:20px;text-align:center;border-bottom:1px solid #1e1e3e;">
          <div style="font-size:13px;font-weight:900;letter-spacing:0.22em;color:#FF3FC2;">⚡ SONIC PULSE</div>
          <div style="font-size:20px;font-weight:800;color:#ffffff;margin:8px 0 4px;">${name}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:0.1em;text-transform:uppercase;">${tierLabel(tier)}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;">
                <span style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.1em;display:block;">Date</span>
                <span style="font-size:13px;color:#ffffff;font-weight:600;">25 September 2026</span>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 0;">
                <span style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.1em;display:block;">Venue</span>
                <span style="font-size:13px;color:#ffffff;font-weight:600;">Bangladesh</span>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 0;">
                <span style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.1em;display:block;">Reference</span>
                <span style="font-size:14px;color:#FF3FC2;font-weight:900;font-family:monospace;letter-spacing:0.12em;">${referenceCode}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${btn('https://sonicpulsefestival.com/dashboard', 'Download my ticket →', '#22c55e', '#ffffff')}

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fff4;border:1px solid #86efac;border-radius:8px;margin:4px 0 20px;">
      <tr><td style="padding:14px 16px;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#166534;">📋 At the gate</p>
        <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">Download your ticket from the dashboard and show the QR code to gate staff. Bring a valid photo ID matching your registration.</p>
      </td></tr>
    </table>

    <!-- Event details -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7fb;border:1px solid #e0e0f0;border-radius:8px;margin:0;">
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #ebebf5;">
          <span style="font-size:12px;color:#888;">Event</span>&nbsp;&nbsp;
          <strong style="font-size:13px;color:#111;">Sonic Pulse 2026</strong>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #ebebf5;">
          <span style="font-size:12px;color:#888;">Date</span>&nbsp;&nbsp;
          <strong style="font-size:13px;color:#111;">25 September 2026</strong>
        </td>
      </tr>

      <tr>
        <td style="padding:10px 16px;">
          <span style="font-size:12px;color:#888;">Gates open</span>&nbsp;&nbsp;
          <strong style="font-size:13px;color:#111;">3:00 PM</strong>
        </td>
      </tr>
    </table>
  `)

  await resend().emails.send({
    from: FROM,
    to: email,
    subject: `✅ Your Sonic Pulse ticket is confirmed — ${referenceCode}`,
    html,
  })
}

// ── EMAIL 4: INFLUENCER APPLICATION RECEIVED ───────────────────────────────

export async function sendInfluencerReceivedEmail(email: string, name: string) {
  const firstName = name.split(' ')[0]
  const html = wrap(`
    <h1 style="font-size:24px;font-weight:800;color:#050508;margin:0 0 12px;line-height:1.2;">Application received ✅</h1>
    <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 20px;">
      Hi <strong style="color:#111;">${firstName}</strong>, we've received your media/influencer application for Sonic Pulse 2026. Our team will review it within <strong style="color:#111;">48 hours</strong>.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff5fc;border:1px solid #ffd6f0;border-radius:8px;margin:0 0 20px;">
      <tr><td style="padding:14px 16px;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#9b1c7a;">🎤 Media Pass</p>
        <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">If approved, you'll receive a complimentary pass with your reference code by email. No payment required.</p>
      </td></tr>
    </table>
    <p style="font-size:12px;color:#aaa;margin:0;">If you didn't submit this application, you can safely ignore this email.</p>
  `)

  await resend().emails.send({
    from: FROM,
    to: email,
    subject: 'Your Sonic Pulse media application is under review',
    html,
  })
}

// ── EMAIL 5: INFLUENCER APPROVED ────────────────────────────────────────────

export async function sendInfluencerApprovalEmail(email: string, name: string, referenceCode: string) {
  const firstName = name.split(' ')[0]
  const html = wrap(`
    <h1 style="font-size:24px;font-weight:800;color:#050508;margin:0 0 12px;line-height:1.2;">You're approved, ${firstName}! 🎉</h1>
    <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 20px;">
      Your media/influencer pass for <strong style="color:#111;">Sonic Pulse 2026</strong> has been approved. Here's your complimentary ticket.
    </p>

    <!-- Ticket card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#050508;border-radius:10px;overflow:hidden;margin:0 0 20px;">
      <tr>
        <td style="background:linear-gradient(135deg,#1a0021 0%,#2d0040 100%);padding:20px;text-align:center;border-bottom:1px solid #3d1060;">
          <div style="font-size:13px;font-weight:900;letter-spacing:0.22em;color:#FF3FC2;">⚡ SONIC PULSE</div>
          <div style="font-size:20px;font-weight:800;color:#ffffff;margin:8px 0 4px;">${name}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:0.1em;text-transform:uppercase;">Media / Influencer Pass</div>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;">
                <span style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.1em;display:block;">Date</span>
                <span style="font-size:13px;color:#ffffff;font-weight:600;">25 September 2026</span>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 0;">
                <span style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.1em;display:block;">Reference Code</span>
                <span style="font-size:14px;color:#FF3FC2;font-weight:900;font-family:monospace;letter-spacing:0.12em;">${referenceCode}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fff4;border:1px solid #86efac;border-radius:8px;margin:0 0 20px;">
      <tr><td style="padding:14px 16px;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#166534;">📋 At the gate</p>
        <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">Show this reference code to gate staff along with a valid photo ID matching your registration name.</p>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff5fc;border:1px solid #ffd6f0;border-radius:8px;margin:0;">
      <tr><td style="padding:14px 16px;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#9b1c7a;">📸 Coverage guidelines</p>
        <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">Please tag <strong>@sonicpulsefestival</strong> in your content and let us know when you post. We'd love to share your coverage!</p>
      </td></tr>
    </table>
  `)

  await resend().emails.send({
    from: FROM,
    to: email,
    subject: `✅ Media pass confirmed — Sonic Pulse 2026 · ${referenceCode}`,
    html,
  })
}
