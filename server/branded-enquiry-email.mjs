import {
  assetUrl,
  assets,
  buildBrandedFooterHtml,
  buildBrandedQuoteCtaHtml,
  buildBrandedTrustBandHtml,
  EMAIL_AMBIENT_BG_COLOR,
  EMAIL_AMBIENT_BG_IMAGE,
  emailAmbientOuterLayers,
  emailResponsiveCss,
  cardShadow,
  cardShadowLift,
  ctaGreen,
  emailFonts,
  EMAIL_LOGO_HEADER_H,
  EMAIL_LOGO_HEADER_W,
  EMAIL_LOGO_HERO_H,
  EMAIL_LOGO_HERO_W,
  escapeHtml,
  gs,
  watermarkStyles
} from './branded-email-shell.mjs'
import { getGsolSiteUrl } from './site-url.mjs'

const lineBreaks = (value) => escapeHtml(value).replaceAll('\n', '<br>')

/** Itinerary-style enquiry rows — tinted bands, generous spacing. */
const fieldRowsStacked = (rows) =>
  rows
    .map(([label, value], index) => {
      const isEnquiryId = label === 'Enquiry ID'
      const rowBg = index % 2 === 0 ? gs.rowA : gs.rowB
      const borderB = index < rows.length - 1 ? `1px solid rgba(6,59,42,0.08)` : 'none'
      const cellPad = isEnquiryId
        ? `border-left:4px solid ${gs.gold};padding:22px 26px 22px 22px`
        : 'padding:22px 26px'
      return `
                            <tr>
                              <td style="background:${rowBg};border-bottom:${borderB};${cellPad};">
                                <p style="margin:0;font-family:${emailFonts.sans};font-size:11px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:${gs.green};">${escapeHtml(label)}</p>
                                <p style="margin:10px 0 0 0;font-family:${emailFonts.sans};font-size:${isEnquiryId ? '22px' : '18px'};line-height:1.45;color:${gs.text};font-weight:${isEnquiryId ? '800' : '700'};letter-spacing:${isEnquiryId ? '-0.02em' : '0'};">${lineBreaks(value)}</p>
                              </td>
                            </tr>`
    })
    .join('')

export function buildBrandedEnquiryEmailHtml(payload, variant = 'customer') {
  const isAdmin = variant === 'admin'
  const title = isAdmin
    ? `New GolfSol Ireland enquiry — ${payload.fullName}`
    : `Your GolfSol Ireland enquiry is ready`
  const preview = isAdmin
    ? `New enquiry ${payload.enquiryId} from ${payload.fullName}.`
    : `We received your Costa del Sol trip details (${payload.enquiryId}).`
  const heroKicker = isAdmin ? 'New website enquiry' : 'Trip plan received'
  const heroTitle = isAdmin ? 'A new GolfSol enquiry has landed.' : 'Your golf escape is taking shape.'
  const heroLead = isAdmin
    ? 'A customer has submitted a GolfSol Ireland trip brief. Reply to this email to continue the conversation directly.'
    : 'Thanks for sending your Costa del Sol trip details. We will review your dates, group shape, transfers and tee-time needs before replying.'

  const rows = fieldRowsStacked([
    ['Full name', payload.fullName],
    ['Email', payload.email],
    ['Phone / WhatsApp', payload.phoneWhatsApp],
    ['Best time to call', payload.bestTimeToCall],
    ['Enquiry ID', payload.enquiryId],
    ['Submitted', payload.enquiryDate],
    ['Trip interest', payload.interest]
  ])

  const saveToAccountHref = isAdmin
    ? ''
    : `${getGsolSiteUrl()}/dashboard/login?next=${encodeURIComponent(`/dashboard?enquiry_ref=${payload.enquiryId}`)}`

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <!-- GolfSol enquiry: fluid outer table → 640px shell → section tables; inline styles + MSO wrapper for Outlook. -->
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>${escapeHtml(title)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&amp;display=swap" rel="stylesheet">
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
            <o:AllowPNG/>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <style>
      body, table, td, p, a { font-family: 'Open Sans', 'Segoe UI', Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif; }
      body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
      .shell-wm-wrap { position: relative !important; display: block !important; width: 100% !important; }
      table { border-collapse: collapse !important; }
      body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: ${EMAIL_AMBIENT_BG_COLOR} !important; background-image: ${EMAIL_AMBIENT_BG_IMAGE} !important; background-repeat: no-repeat !important; background-size: 100% 100% !important; }
      .ReadMsgBody { width: 100% !important; }
      .ExternalClass { width: 100% !important; }
      #MessageViewBody, #MessageWebViewDiv { width: 100% !important; }
      .ExternalClass,
      .ExternalClass p,
      .ExternalClass span,
      .ExternalClass font,
      .ExternalClass td,
      .ExternalClass div { line-height: 100%; }
      a[x-apple-data-detectors] {
        color: inherit !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
      }
      a { text-decoration: none; }
      .preheader { display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; overflow: hidden; mso-hide: all; }
${emailResponsiveCss}
    </style>
  </head>
  <body style="margin:0; padding:0; ${emailAmbientOuterLayers()} font-family:${emailFonts.sans};">
    <!--[if mso | IE]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;"><tr><td bgcolor="${EMAIL_AMBIENT_BG_COLOR}" style="background-color:${EMAIL_AMBIENT_BG_COLOR};padding:0;border-collapse:collapse;">
    <![endif]-->
    <div class="preheader">${escapeHtml(preview)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
    <center role="article" aria-roledescription="email" lang="en" style="width:100%;max-width:100%;${emailAmbientOuterLayers()}">
      <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="${emailAmbientOuterLayers()}">
        <tr>
          <td align="center" bgcolor="${EMAIL_AMBIENT_BG_COLOR}" class="shell-wm email-outer-shell" style="${watermarkStyles.shellTd()}"><div class="shell-wm-wrap" style="position:relative;display:block;width:100%;margin:0;padding:0;">
            <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="max-width:100%;position:relative;z-index:1;">
              <tr>
                <td align="center" style="padding:0;">
            <table role="presentation" border="0" class="email-shell" width="640" cellpadding="0" cellspacing="0" style="width:640px; max-width:640px;">
              <tr>
                <td style="padding:0 0 24px 0;">
                  <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" class="email-header-row" style="border-bottom:1px solid rgba(13,61,46,0.1);padding-bottom:22px;">
                    <tr>
                      <td valign="middle" width="178" class="email-header-logo-cell mobile-stack mobile-center" style="padding:0 18px 0 0;">
                        <img class="email-header-logo" src="${assetUrl(assets.logo)}" width="${EMAIL_LOGO_HEADER_W}" height="${EMAIL_LOGO_HEADER_H}" alt="GolfSol Ireland" style="display:block;width:${EMAIL_LOGO_HEADER_W}px;max-width:${EMAIL_LOGO_HEADER_W}px;height:auto;margin:0;border:0;">
                      </td>
                      <td valign="middle" class="email-header-tagline mobile-stack mobile-center" style="font-family:${emailFonts.sans}; color:rgba(6,59,42,0.72); font-size:11px; line-height:1.55; font-weight:800; letter-spacing:0.2em; text-transform:uppercase;">
                        Irish-owned · Costa del Sol · Golf concierge
                      </td>
                      <td valign="middle" width="176" class="email-header-phone-cell mobile-stack mobile-center" align="right" style="padding:0 0 0 14px;">
                        <a class="email-header-phone-link" href="${phoneIrelandHref}" style="font-family:${emailFonts.sans};font-size:15px;line-height:1.45;font-weight:800;color:#063B2A;text-decoration:none;white-space:nowrap;letter-spacing:0.02em;">${escapeHtml(phoneIrelandDisplay)}</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="border-radius:42px; overflow:hidden; background:${gs.dark}; box-shadow:${cardShadowLift}; border:1px solid rgba(255,255,255,0.16);">
                  <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="height:4px;line-height:4px;font-size:0;mso-line-height-rule:exactly;background-color:${gs.gold};">&nbsp;</td>
                    </tr>
                    <tr>
                      <td class="mobile-pad mobile-pad-hero" bgcolor="${gs.dark}" style="${watermarkStyles.heroInner()}">
                        <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding:0 0 32px 0;">
                              <img class="email-hero-logo" src="${assetUrl(assets.logo)}" width="${EMAIL_LOGO_HERO_W}" height="${EMAIL_LOGO_HERO_H}" alt="GolfSol Ireland" style="display:block;width:${EMAIL_LOGO_HERO_W}px;max-width:86%;height:auto;margin:0 auto;border:0;">
                            </td>
                          </tr>
                        </table>
                        <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding:0 0 26px 0;">
                              <span style="display:inline-block;border:1px solid rgba(217,217,217,0.45);border-radius:999px;padding:12px 26px;font-family:${emailFonts.sans};color:#eef2ef;font-size:10px;line-height:14px;font-weight:800;letter-spacing:0.24em;text-transform:uppercase;background:rgba(6,59,42,0.72);">${escapeHtml(heroKicker)}</span>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding:0;">
                              <h1 class="hero-title" style="margin:0;font-family:${emailFonts.sans};color:${gs.white};font-size:48px;line-height:1.1;font-weight:800;letter-spacing:-0.04em;text-align:center;">
                                ${escapeHtml(heroTitle)}
                              </h1>
                              <p class="email-lead" style="margin:26px auto 0 auto;max-width:520px;font-family:${emailFonts.sans};color:rgba(255,255,255,0.82);font-size:19px;line-height:1.72;font-weight:500;letter-spacing:-0.01em;text-align:center;">
                                ${escapeHtml(heroLead)}
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:44px 0 0 0;">
                  <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background:${gs.card}; border:1px solid ${gs.cardBorder}; border-radius:38px; box-shadow:${cardShadow};">
                    <tr>
                      <td class="mobile-pad" bgcolor="${gs.card}" style="${watermarkStyles.submissionTd()}">
                        <p style="margin:0;font-family:${emailFonts.sans};font-size:12px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:${gs.green};">Your itinerary details</p>
                        <h2 class="section-title" style="margin:16px 0 0 0;font-family:${emailFonts.sans};color:${gs.text};font-size:34px;line-height:1.16;letter-spacing:-0.03em;font-weight:800;">Trip details we received</h2>
                        <p class="email-lead" style="margin:18px 0 32px 0;font-family:${emailFonts.sans};color:${gs.muted};font-size:18px;line-height:1.72;max-width:520px;font-weight:500;">Confirm everything looks correct below. Reply to this email if anything needs changing — same thread, same concierge team.</p>
                        <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(13,61,46,0.12);border-radius:24px;overflow:hidden;">
                          ${rows}
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:40px 0 0 0;">
                  <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background:${gs.dark}; border-radius:36px; overflow:hidden; box-shadow:${cardShadowLift}; border:1px solid rgba(217,194,122,0.18);">
                    <tr>
                      <td style="padding:0;line-height:0;font-size:0;">
                        <img src="${assetUrl(assets.fleetLineup)}" width="640" height="359" alt="GolfSol Ireland Mercedes fleet lineup for Costa del Sol golf transfers." style="display:block; width:100%; max-width:640px; height:auto; border:0;">
                      </td>
                    </tr>
                    <tr>
                      <td class="mobile-pad" style="padding:28px 36px 32px 36px; background:${gs.dark}; border-top:1px solid rgba(245,196,81,0.25);">
                        <p style="margin:0;font-family:${emailFonts.sans};color:${gs.gold};font-size:11px;font-weight:800;letter-spacing:0.24em;text-transform:uppercase;">Fleet</p>
                        <p style="margin:12px 0 0 0;font-family:${emailFonts.sans};color:${gs.white};font-size:26px;line-height:1.2;font-weight:800;letter-spacing:-0.025em;">Mercedes E-Class, V-Class &amp; Sprinter — sized to your group and bags.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              ${
                isAdmin
                  ? ''
                  : `<tr>
                <td style="padding:40px 0 0 0;">
                  <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background:${gs.card}; border:1px solid ${gs.cardBorder}; border-radius:36px; box-shadow:${cardShadow};">
                    <tr>
                      <td class="mobile-pad" style="padding:36px 38px 40px 38px;">
                        <p style="margin:0; font-family:${emailFonts.sans}; color:${gs.green}; font-size:11px; line-height:15px; font-weight:900; letter-spacing:0.22em; text-transform:uppercase;">Your trip hub</p>
                        <h2 class="section-title" style="margin:12px 0 12px 0; font-family:${emailFonts.sans}; color:${gs.text}; font-size:30px; line-height:1.15; font-weight:800; letter-spacing:-0.03em;">Save this enquiry to your account</h2>
                        <p style="margin:0 0 24px 0; font-family:${emailFonts.sans}; color:${gs.muted}; font-size:16px; line-height:1.65; font-weight:500;">Use the same email you entered on the form. After sign-in you can add airport transfers, golf rounds (including our interactive course map), and hotel notes for 1–8 guests — pick one, two, or all three.</p>
                        <a class="cta-button" href="${escapeHtml(saveToAccountHref)}" target="_blank" rel="noopener noreferrer" style="${ctaGreen}">
                          Open my dashboard
                        </a>
                        <p style="margin:18px 0 0 0; font-family:${emailFonts.sans}; color:${gs.muted}; font-size:13px; line-height:20px;">Reference <strong style="color:${gs.text};font-weight:800;">${escapeHtml(payload.enquiryId)}</strong> is carried into your workspace automatically.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`
              }

              <tr>
                <td style="padding:40px 0 0 0;">
                  <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background:${gs.card}; border:1px solid ${gs.cardBorder}; border-radius:36px; box-shadow:${cardShadow};">
                    <tr>
                      <td class="mobile-pad" style="padding:36px 34px 38px 34px;">
                        <p style="margin:0;font-family:${emailFonts.sans};color:${gs.green};font-size:11px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;">Transfer experience</p>
                        <h2 class="section-title" style="margin:14px 0 28px 0;font-family:${emailFonts.sans};color:${gs.text};font-size:32px;line-height:1.15;letter-spacing:-0.03em;font-weight:800;">From arrivals hall to resort door</h2>
                        <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0">
                          <tr class="email-tile-row">
                            <td class="email-tile-cell mobile-stack" style="width:33.33%; padding:0 8px 0 0; vertical-align:top;">
                              <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background:${gs.rowA}; border-radius:22px; overflow:hidden; box-shadow:0 12px 32px rgba(0,0,0,0.08);">
                                <tr><td style="line-height:0;font-size:0;"><img src="${assetUrl(assets.arrivals)}" width="190" height="107" alt="Meet and greet at Malaga Airport arrivals." style="display:block; width:100%; height:auto; border:0;"></td></tr>
                                <tr><td style="padding:18px 16px 20px 16px;"><p style="margin:0; font-family:${emailFonts.sans}; color:${gs.text}; font-size:15px; line-height:1.25; font-weight:800; letter-spacing:-0.02em;">Arrivals tracked</p><p style="margin:8px 0 0 0; font-family:${emailFonts.sans}; color:${gs.muted}; font-size:13px; line-height:1.55; font-weight:500;">Driver ready when your flight lands.</p></td></tr>
                              </table>
                            </td>
                            <td class="email-tile-cell mobile-stack" style="width:33.33%; padding:0 4px; vertical-align:top;">
                              <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background:${gs.card}; border:1px solid rgba(245,196,81,0.45); border-radius:22px; overflow:hidden; box-shadow:0 16px 40px rgba(245,196,81,0.12);">
                                <tr><td style="line-height:0;font-size:0;"><img src="${assetUrl(assets.resort)}" width="190" height="107" alt="GolfSol transfer van arriving at a Costa del Sol golf resort." style="display:block; width:100%; height:auto; border:0;"></td></tr>
                                <tr><td style="padding:18px 16px 20px 16px;"><p style="margin:0; font-family:${emailFonts.sans}; color:${gs.text}; font-size:15px; line-height:1.25; font-weight:800; letter-spacing:-0.02em;">Resort drop-off</p><p style="margin:8px 0 0 0; font-family:${emailFonts.sans}; color:${gs.muted}; font-size:13px; line-height:1.55; font-weight:500;">Straight to hotel, villa or course.</p></td></tr>
                              </table>
                            </td>
                            <td class="email-tile-cell mobile-stack" style="width:33.33%; padding:0 0 0 8px; vertical-align:top;">
                              <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background:${gs.rowA}; border-radius:22px; overflow:hidden; box-shadow:0 12px 32px rgba(0,0,0,0.08);">
                                <tr><td style="line-height:0;font-size:0;"><img src="${assetUrl(assets.coastalDrive)}" width="190" height="107" alt="Premium transfer van driving along the Costa del Sol coastline." style="display:block; width:100%; height:auto; border:0;"></td></tr>
                                <tr><td style="padding:18px 16px 20px 16px;"><p style="margin:0; font-family:${emailFonts.sans}; color:${gs.text}; font-size:15px; line-height:1.25; font-weight:800; letter-spacing:-0.02em;">Sol corridor</p><p style="margin:8px 0 0 0; font-family:${emailFonts.sans}; color:${gs.muted}; font-size:13px; line-height:1.55; font-weight:500;">Malaga, Marbella and beyond.</p></td></tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              ${buildBrandedTrustBandHtml()}
              ${buildBrandedQuoteCtaHtml()}
              ${buildBrandedFooterHtml({
                footerDisclaimerHtml:
                  'You are receiving this because you requested GolfSol Ireland trip information. If this was not you, ignore this message.'
              })}
            </table>
                </td>
              </tr>
            </table>
          </div>
          </td>
        </tr>
      </table>
    </center>
    <!--[if mso | IE]>
    </td></tr></table>
    <![endif]-->
  </body>
</html>`
}
