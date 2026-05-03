import { getGsolSiteUrl } from './email-layout.mjs'

const brand = {
  green: '#063B2A',
  greenSoft: '#0F513C',
  gold: '#FFC72C',
  goldDeep: '#D99A00',
  cream: '#F7F0E2',
  sand: '#E9D9B6',
  ink: '#16231D',
  muted: '#66736D',
  white: '#FFFFFF'
}

const assets = {
  logo: '/images/golfsol-header-logo-bitmap.png',
  fleetLineup: '/images/transport-fleet-lineup.jpg'
}

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const assetUrl = (path) => `${getGsolSiteUrl()}${path}`

const fieldRows = (rows) =>
  rows
    .map(
      ([label, value], index) => `
                            <tr style="background:${index % 2 === 0 ? '#FFFFFF' : '#FFF9EA'};">
                              <td style="padding:13px 16px; width:34%; border-bottom:1px solid #E9D9B6; font-family:Arial, Helvetica, sans-serif; color:${brand.muted}; font-size:11px; line-height:16px; font-weight:800; letter-spacing:1.1px; text-transform:uppercase; vertical-align:top;">${escapeHtml(label)}</td>
                              <td style="padding:13px 16px; border-bottom:1px solid #E9D9B6; font-family:Arial, Helvetica, sans-serif; color:${brand.ink}; font-size:14px; line-height:22px; font-weight:600; vertical-align:top;">${value}</td>
                            </tr>`
    )
    .join('')

/**
 * Same visual family as website enquiry confirmations (GolfSol Ireland premium shell).
 * @param {{ actionLink: string; email: string; requestedAtDisplay: string }} params
 */
export function buildBrandedMagicLinkEmailHtml({ actionLink, email, requestedAtDisplay }) {
  const title = 'Sign in to GolfSol Ireland'
  const preview = `Passwordless sign-in for ${email}. Link expires shortly — use the button in this email.`
  const safeLink = escapeHtml(actionLink)
  const emailCell = `<span style="color:${brand.ink}; font-weight:700;">${escapeHtml(email)}</span>`
  const rows = fieldRows([
    ['Signing in as', emailCell],
    ['Sign-in method', escapeHtml('Secure magic link (no password)')],
    ['Requested', escapeHtml(requestedAtDisplay)]
  ])

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
    <meta name="color-scheme" content="light">
    <title>${escapeHtml(title)}</title>
    <style>
      body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
      table { border-collapse: collapse !important; }
      body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
      a { text-decoration: none; }
      .preheader { display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; overflow: hidden; mso-hide: all; }
      @media screen and (max-width: 680px) {
        .email-shell { width: 100% !important; }
        .mobile-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .mobile-stack { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
        .mobile-center { text-align: center !important; }
        .hero-title { font-size: 34px !important; line-height: 38px !important; }
        .cta-button { display: block !important; width: 100% !important; box-sizing: border-box !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background:${brand.cream};">
    <div class="preheader">${escapeHtml(preview)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
    <center role="article" aria-roledescription="email" lang="en" style="width:100%; background:${brand.cream};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.cream};">
        <tr>
          <td align="center" style="padding:32px 12px;">
            <table role="presentation" class="email-shell" width="640" cellpadding="0" cellspacing="0" style="width:640px; max-width:640px;">
              <tr>
                <td style="padding:0 0 14px 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td class="mobile-center" style="font-family:Arial, Helvetica, sans-serif; color:${brand.green}; font-size:12px; line-height:18px; font-weight:800; letter-spacing:2.4px; text-transform:uppercase;">
                        Irish-owned · Costa del Sol Golf Specialists
                      </td>
                      <td class="mobile-center" align="right" style="font-family:Arial, Helvetica, sans-serif; color:${brand.muted}; font-size:12px; line-height:18px;">
                        GolfSol Ireland
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="border-radius:30px; overflow:hidden; background:${brand.green}; box-shadow:0 28px 80px rgba(6,59,42,0.22);">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td class="mobile-pad" style="padding:34px 38px 28px 38px; background:${brand.green};">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;">
                          <tr>
                            <td class="mobile-center" align="left" style="vertical-align:middle;">
                              <img src="${assetUrl(assets.logo)}" width="220" height="107" alt="GolfSol Ireland" style="display:block; width:220px; max-width:76%; height:auto; margin:0; border:0;">
                            </td>
                            <td class="mobile-center" align="right" style="vertical-align:middle; font-family:Arial, Helvetica, sans-serif; color:${brand.gold}; font-size:11px; line-height:15px; font-weight:800; letter-spacing:1.8px; text-transform:uppercase;">
                              Secure access
                            </td>
                          </tr>
                        </table>
                        <div style="display:inline-block; border:1px solid rgba(255,199,44,0.55); border-radius:999px; padding:8px 12px; font-family:Arial, Helvetica, sans-serif; color:${brand.gold}; font-size:11px; line-height:14px; font-weight:800; letter-spacing:1.8px; text-transform:uppercase;">
                          Account access
                        </div>
                        <h1 class="hero-title" style="margin:18px 0 0 0; font-family:Georgia, 'Times New Roman', serif; color:${brand.white}; font-size:43px; line-height:48px; font-weight:700; letter-spacing:-1.2px;">
                          Your dashboard is one tap away
                        </h1>
                        <p style="margin:16px 0 0 0; font-family:Arial, Helvetica, sans-serif; color:#DCE8E2; font-size:17px; line-height:27px;">
                          Use the secure magic link below — no password to remember. Same trusted GolfSol Ireland look as your enquiry confirmation, built for clarity on mobile.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="height:5px; line-height:5px; background:${brand.gold}; font-size:0;">&nbsp;</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:24px 0 0 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.white}; border:1px solid ${brand.sand}; border-radius:26px; overflow:hidden;">
                    <tr>
                      <td style="padding:0;">
                        <img src="${assetUrl(assets.fleetLineup)}" width="640" height="359" alt="GolfSol Ireland Mercedes fleet for Costa del Sol golf transfers." style="display:block; width:100%; max-width:640px; height:auto; border:0;">
                      </td>
                    </tr>
                    <tr>
                      <td class="mobile-pad" style="padding:18px 24px 22px 24px; background:#FFF9EA;">
                        <p style="margin:0; font-family:Arial, Helvetica, sans-serif; color:${brand.goldDeep}; font-size:11px; line-height:15px; font-weight:900; letter-spacing:1.7px; text-transform:uppercase;">Passwordless sign-in</p>
                        <p style="margin:8px 0 0 0; font-family:Georgia, 'Times New Roman', serif; color:${brand.ink}; font-size:24px; line-height:30px; font-weight:700;">Open saved packages, maps, and documents.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:24px 0 0 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.white}; border:1px solid ${brand.sand}; border-radius:26px;">
                    <tr>
                      <td class="mobile-pad" style="padding:28px 34px;">
                        <h2 style="margin:0; font-family:Georgia, 'Times New Roman', serif; color:${brand.ink}; font-size:28px; line-height:34px;">Sign-in request</h2>
                        <p style="margin:10px 0 22px 0; font-family:Arial, Helvetica, sans-serif; color:${brand.muted}; font-size:15px; line-height:24px;">Tap the button once on this device. The link expires after a short time and is meant for you only.</p>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${brand.sand}; border-radius:18px; overflow:hidden;">
                          ${rows}
                        </table>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0 0;">
                          <tr>
                            <td>
                              <a class="cta-button" href="${safeLink}" style="display:inline-block; border-radius:999px; background:${brand.greenSoft}; color:${brand.white}; font-family:Arial, Helvetica, sans-serif; font-size:13px; line-height:18px; font-weight:900; letter-spacing:1.2px; text-transform:uppercase; padding:16px 28px;">
                                Sign in to GolfSol Ireland
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin:22px 0 0 0; font-family:Arial, Helvetica, sans-serif; font-size:12px; line-height:18px; color:${brand.muted};">If the button does not work, copy this link into your browser:</p>
                        <p style="margin:8px 0 0 0; font-family:Arial, Helvetica, sans-serif; font-size:11px; line-height:1.45; word-break:break-all; color:${brand.ink};">${safeLink}</p>
                        <div style="margin-top:26px; padding:20px 22px; border:1px solid ${brand.goldDeep}; border-radius:18px; background:#FFFCF3;">
                          <p style="margin:0 0 10px 0; font-family:Arial, Helvetica, sans-serif; font-size:11px; font-weight:900; letter-spacing:1.4px; text-transform:uppercase; color:${brand.goldDeep};">Security</p>
                          <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:22px; color:${brand.ink};">Do not forward this email. If you did not request access, you can ignore this message — your password is not changed by this flow.</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:24px 0 0 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.green}; border-radius:26px;">
                    <tr>
                      <td class="mobile-pad mobile-center" style="padding:28px 34px;">
                        <p style="margin:0; font-family:Arial, Helvetica, sans-serif; color:${brand.gold}; font-size:12px; line-height:16px; font-weight:800; letter-spacing:1.8px; text-transform:uppercase;">Need help?</p>
                        <p style="margin:10px 0 0 0; font-family:Georgia, 'Times New Roman', serif; color:${brand.white}; font-size:24px; line-height:30px;">We are on WhatsApp and phone.</p>
                        <p style="margin:12px 0 0 0; font-family:Arial, Helvetica, sans-serif; color:#DCE8E2; font-size:15px; line-height:24px;">Prefer to talk it through? <a href="tel:+353874464766" style="color:${brand.gold}; font-weight:800;">+353 87 446 4766</a> (Ireland / WhatsApp) · <a href="tel:+34641815366" style="color:${brand.gold}; font-weight:800;">+34 641 81 53 66</a> (Spain)</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td class="mobile-pad" style="padding:22px 34px 0 34px;">
                  <p style="margin:0; font-family:Arial, Helvetica, sans-serif; color:${brand.muted}; font-size:12px; line-height:20px; text-align:center;">
                    GolfSol Ireland · Irish-owned Costa del Sol golf travel
                  </p>
                  <p style="margin:8px 0 0 0; font-family:Arial, Helvetica, sans-serif; color:${brand.muted}; font-size:11px; line-height:18px; text-align:center;">
                    You are receiving this because someone requested a sign-in link for this address.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </center>
  </body>
</html>`
}
