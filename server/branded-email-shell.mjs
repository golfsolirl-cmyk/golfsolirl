/**
 * Shared GolfSol “enquiry-customer” visual system: homepage gs.* palette, Open Sans,
 * 640px shell, turf background, emerald hero, fleet / transfer / trust / CTA / footer bands.
 * Used by `buildBrandedEnquiryEmailHtml` and all `buildGsolTransactionalEmail` flows.
 */
import { getGsolSiteUrl } from './site-url.mjs'
import { gsolCompanyLegal, gsolEmailBrand } from './email-constants.mjs'

export const gs = {
  bg: '#F4F7F5',
  dark: '#063B2A',
  green: '#0B6B45',
  gold: '#D4A843',
  goldDeep: '#B8922E',
  goldLight: '#F5EDD6',
  cream: '#F5F0E6',
  card: '#FFFFFF',
  white: '#FFFFFF',
  text: '#063B2A',
  muted: '#4e4e4e',
  border: '#e2e2e2',
  cardBorder: '#d9d2c1',
  fleetBorder: '#d6ccb8',
  rowA: '#f0f7ee',
  rowB: '#FFFFFF',
  tierBg: '#f4f7f5',
  tierBorder: '#c5cfc9',
}

/** Top bar lockup — larger for clearer brand recognition in inbox previews. */
export const EMAIL_LOGO_HEADER_W = 156
export const EMAIL_LOGO_HEADER_H = 75
/** Hero band centred lockup (transactional + enquiry). */
export const EMAIL_LOGO_HERO_W = 252
export const EMAIL_LOGO_HERO_H = 122
export const EMAIL_LOGO_FOOTER_W = 172

export const assets = {
  logo: '/images/g-sol-logo.png',
  fleetLineup: '/images/88054e80-6dd1-483f-8557-cdc45caa2442.png',
  arrivals: '/images/transport-moment-arrivals.jpg',
  resort: '/images/transport-moment-resort.jpg',
  coastalDrive: '/images/transport-hero-coastal-drive.jpg'
}

export const emailFonts = {
  sans: `'Open Sans','Segoe UI',Roboto,'Helvetica Neue',Helvetica,Arial,sans-serif`
}

/** Shared responsive rules — import in branded-enquiry-email.mjs to stay in sync. */
export const emailResponsiveCss = `
      @media screen and (min-width: 681px) {
        .hero-title { font-size: 56px !important; line-height: 1.1 !important; letter-spacing: -0.04em !important; font-weight: 800 !important; }
        .section-title { font-size: 34px !important; line-height: 1.14 !important; }
        .email-section-h2 { font-size: 32px !important; line-height: 1.14 !important; }
      }
      @media only screen and (max-width: 680px) {
        .email-outer-shell { padding: 28px 12px 36px 12px !important; }
        .email-shell { width: 100% !important; max-width: 100% !important; min-width: 0 !important; }
        .email-shell img { max-width: 100% !important; height: auto !important; }
        .email-header-row .mobile-stack { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; padding-left: 0 !important; padding-right: 0 !important; }
        .email-header-row .email-header-logo-cell { padding: 0 0 14px 0 !important; width: 100% !important; }
        .email-header-row .email-header-tagline { padding: 0 8px 12px 8px !important; width: 100% !important; font-size: 12px !important; letter-spacing: 0.14em !important; line-height: 1.55 !important; }
        .email-header-row .email-header-phone-cell { padding: 0 0 2px 0 !important; width: 100% !important; text-align: center !important; }
        .email-header-logo { width: 140px !important; max-width: 78% !important; height: auto !important; margin-left: auto !important; margin-right: auto !important; }
        .email-header-phone-link { display: inline-block !important; box-sizing: border-box !important; min-height: 48px !important; line-height: 1.45 !important; padding: 12px 22px !important; font-size: 17px !important; font-weight: 800 !important; white-space: normal !important; word-break: break-word !important; overflow-wrap: anywhere !important; background-color: rgba(6,59,42,0.07) !important; border-radius: 14px !important; color: #063B2A !important; }
        .email-hero-logo { width: 100% !important; max-width: 288px !important; height: auto !important; }
        .email-footer-logo { width: 148px !important; max-width: 58% !important; height: auto !important; }
        .mobile-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .mobile-pad-hero { padding-left: 20px !important; padding-right: 20px !important; padding-top: 32px !important; padding-bottom: 32px !important; }
        .mobile-stack { display: block !important; width: 100% !important; max-width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
        .email-tile-row .email-tile-cell { padding-bottom: 16px !important; }
        .email-tile-row .email-tile-cell:last-child { padding-bottom: 0 !important; }
        .mobile-center { text-align: center !important; }
        .hero-title { font-size: 34px !important; line-height: 1.14 !important; font-weight: 800 !important; letter-spacing: -0.03em !important; }
        .section-title { font-size: 26px !important; line-height: 1.2 !important; font-weight: 800 !important; letter-spacing: -0.02em !important; }
        .email-section-h2 { font-size: 26px !important; line-height: 1.2 !important; }
        .email-pill { font-size: 11px !important; line-height: 1.5 !important; letter-spacing: 0.18em !important; padding: 11px 20px !important; }
        .email-lead { font-size: 17px !important; line-height: 1.72 !important; }
        .email-trust-chip-title { font-size: 15px !important; line-height: 1.4 !important; }
        .email-trust-chip-sub { font-size: 14px !important; line-height: 1.58 !important; }
        .mobile-pad p { font-size: 17px !important; line-height: 1.72 !important; }
        .email-footer-contact a { font-size: 16px !important; line-height: 1.55 !important; padding: 6px 0 !important; display: inline-block !important; }
        .email-trust-badge { width: 100% !important; padding: 0 0 16px 0 !important; text-align: center !important; }
        .email-trust-body { width: 100% !important; padding: 0 !important; text-align: left !important; }
        .email-trust-body p { font-size: 17px !important; line-height: 1.72 !important; }
        .cta-button { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; padding: 18px 22px !important; min-height: 54px !important; line-height: 1.45 !important; font-size: 16px !important; }
        .mobile-pad a { word-break: break-word !important; overflow-wrap: break-word !important; }
      }`

export const phoneIrelandHref = 'tel:+353874464766'
export const phoneIrelandDisplay = '+353 87 446 4766'

export const ctaGold =
  `display:inline-block;border-radius:16px;background-color:#0b4d3b;background-image:linear-gradient(135deg,#0b4d3b 0%,#136047 100%);color:#FFFFFF;font-family:${emailFonts.sans};font-size:15px;line-height:1.45;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;padding:20px 38px;box-shadow:0 8px 22px rgba(11,77,59,0.32);text-decoration:none;text-align:center;`

export const ctaGreen =
  `display:inline-block;border-radius:16px;background:#0B6B45;color:#FFFFFF;font-family:${emailFonts.sans};font-size:15px;line-height:1.45;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;padding:20px 38px;box-shadow:0 8px 22px rgba(11,107,69,0.32);text-decoration:none;text-align:center;`

export const cardShadow = '0 26px 70px rgba(40,33,19,0.12)'
export const cardShadowLift = '0 26px 70px rgba(6,59,42,0.18)'

export const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

export const assetUrl = (path) => `${getGsolSiteUrl()}${path}`

/**
 * Homepage `#design-package` ambient layer — forest/gold radial accents over a white→cream vertical wash.
 * Solid `#eef2ef` fallback for Outlook (bgcolor) and clients that strip `background-image`.
 */
export const EMAIL_AMBIENT_BG_COLOR = '#eef2ef'
export const EMAIL_AMBIENT_BG_IMAGE =
  'radial-gradient(circle at 8% 0%, rgba(19,96,71,0.22), transparent 30%), radial-gradient(circle at 92% 12%, rgba(217,190,122,0.14), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(246,240,226,0.98) 38%, rgba(235,227,207,0.97) 100%)'

/** Inline styles for body / full-width wrappers behind the 640px shell. */
export const emailAmbientOuterLayers = () =>
  `background-color:${EMAIL_AMBIENT_BG_COLOR};background-image:${EMAIL_AMBIENT_BG_IMAGE};background-repeat:no-repeat;background-size:100% 100%;`

/** Same layered wash — accent bars, highlighted tiles, CTAs (homepage `#design-package` parity). */
export const emailAmbientGradientFillStyle = emailAmbientOuterLayers

/** Cream-tone labels & links on forest bands (replaces yellow/gold type). */
export const emailAccentTextOnDark = '#ebe3cf'

export const emailAccentBorderOnDark = 'rgba(235,227,207,0.45)'
export const emailAccentBorderOnDarkMuted = 'rgba(235,227,207,0.28)'

export const emailAmbientRuleTdStyle = () =>
  `height:4px;line-height:4px;font-size:0;mso-line-height-rule:exactly;${emailAmbientGradientFillStyle()}`

/** Primary CTA on dark bands — ambient gradient + forest text (flat mustard retired). */
export const ctaAmbient =
  `display:inline-block;border-radius:16px;${emailAmbientGradientFillStyle()}color:${gs.dark};font-family:${emailFonts.sans};font-size:15px;line-height:1.45;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;padding:20px 42px;border:1px solid rgba(19,96,71,0.22);box-shadow:0 10px 26px rgba(11,77,59,0.14);text-decoration:none;text-align:center;`

/** Back-compat — identical to `ctaAmbient`. */
export const ctaMustard = ctaAmbient

export const watermarkStyles = {
  shellTd: () => `padding:56px 20px 60px 20px;${emailAmbientOuterLayers()}`,
  heroInner: () => `padding:56px 46px 52px 46px;background-color:${gs.dark};`,
  submissionTd: () => `padding:44px 44px 48px 44px;background-color:#FFFFFF;`
}

/** Wrap loose `<tr>` fragments from legacy callers into a single table for valid nesting. */
export const normalizeTransactionalEmailBodyHtml = (bodyHtml) => {
  const t = String(bodyHtml ?? '').trim()
  if (!t) return ''
  if (t.startsWith('<tr')) {
    return `<table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${t}</table>`
  }
  return t
}

const heroMetaBlock = (heroMetaHtml) => {
  const h = String(heroMetaHtml ?? '').trim()
  if (!h) return ''
  return `
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:22px auto 0 auto;max-width:520px;">
                            <tr>
                              <td align="center" style="padding:0;">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.08);border-radius:24px;border:1px solid rgba(217,217,217,0.35);">
                                  <tr>
                                    <td style="padding:20px 26px;font-family:${emailFonts.sans};font-size:15px;line-height:1.68;color:rgba(255,255,255,0.92);">${h}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>`
}

/** Trust & insurance band — shared by marketing tail and enquiry emails. */
export const buildBrandedTrustBandHtml = () => `
              <tr>
                <td style="padding:40px 0 0 0;">
                  <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background:${gs.dark};border-radius:36px;overflow:hidden;box-shadow:${cardShadowLift};border:1px solid ${emailAccentBorderOnDarkMuted};">
                    <tr>
                      <td style="${emailAmbientRuleTdStyle()}">&nbsp;</td>
                    </tr>
                    <tr>
                      <td class="mobile-pad" style="padding:40px 34px 42px 34px;">
                        <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding:0 0 22px 0;">
                              <span class="email-pill" style="display:inline-block;border:1px solid ${emailAccentBorderOnDark};border-radius:999px;padding:11px 24px;font-family:${emailFonts.sans};color:${emailAccentTextOnDark};font-size:12px;line-height:1.5;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;background:rgba(6,59,42,0.65);">Fully insured transfers</span>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding:0 0 12px 0;">
                              <h2 class="email-section-h2" style="margin:0;font-family:${emailFonts.sans};color:${gs.white};font-size:32px;line-height:1.14;letter-spacing:-0.03em;font-weight:800;text-align:center;">Your group is covered, door to door</h2>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding:0 0 28px 0;">
                              <p class="email-lead" style="margin:0 auto;max-width:500px;font-family:${emailFonts.sans};color:rgba(245,240,230,0.9);font-size:18px;line-height:1.72;font-weight:500;text-align:center;">Private Mercedes transfers, full passenger insurance, and meet-and-greet at Málaga AGP — from arrivals hall to first tee and back.</p>
                            </td>
                          </tr>
                        </table>
                        <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px 0;">
                          <tr class="email-tile-row">
                            <td class="email-tile-cell mobile-stack" style="width:33.33%;padding:0 6px 0 0;vertical-align:top;">
                              <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.06);border-radius:18px;border:1px solid ${emailAccentBorderOnDarkMuted};">
                                <tr><td style="padding:18px 16px 20px 16px;text-align:center;">
                                  <p style="margin:0;font-family:${emailFonts.sans};font-size:22px;line-height:1.25;color:${emailAccentTextOnDark};font-weight:800;">&#10003;</p>
                                  <p class="email-trust-chip-title" style="margin:12px 0 0 0;font-family:${emailFonts.sans};color:${gs.white};font-size:15px;line-height:1.38;font-weight:800;letter-spacing:-0.01em;">Professional chauffeurs</p>
                                  <p class="email-trust-chip-sub" style="margin:8px 0 0 0;font-family:${emailFonts.sans};color:rgba(255,255,255,0.72);font-size:14px;line-height:1.58;font-weight:500;">Named drivers, flight-tracked pickups</p>
                                </td></tr>
                              </table>
                            </td>
                            <td class="email-tile-cell mobile-stack" style="width:33.33%;padding:0 3px;vertical-align:top;">
                              <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background:${gs.green};background-image:linear-gradient(155deg,#10734d 0%,#0B6B45 52%,#084f37 100%);border-radius:18px;border:1px solid rgba(255,255,255,0.28);">
                                <tr><td style="padding:18px 16px 20px 16px;text-align:center;">
                                  <p style="margin:0;font-family:${emailFonts.sans};font-size:22px;line-height:1.25;color:${emailAccentTextOnDark};font-weight:800;">&#10003;</p>
                                  <p class="email-trust-chip-title" style="margin:12px 0 0 0;font-family:${emailFonts.sans};color:${gs.white};font-size:15px;line-height:1.38;font-weight:800;letter-spacing:-0.01em;">Full insurance</p>
                                  <p class="email-trust-chip-sub" style="margin:8px 0 0 0;font-family:${emailFonts.sans};color:rgba(255,255,255,0.78);font-size:14px;line-height:1.58;font-weight:500;">Passenger cover for every leg</p>
                                </td></tr>
                              </table>
                            </td>
                            <td class="email-tile-cell mobile-stack" style="width:33.33%;padding:0 0 0 6px;vertical-align:top;">
                              <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.06);border-radius:18px;border:1px solid ${emailAccentBorderOnDarkMuted};">
                                <tr><td style="padding:18px 16px 20px 16px;text-align:center;">
                                  <p style="margin:0;font-family:${emailFonts.sans};font-size:22px;line-height:1.25;color:${emailAccentTextOnDark};font-weight:800;">&#10003;</p>
                                  <p class="email-trust-chip-title" style="margin:12px 0 0 0;font-family:${emailFonts.sans};color:${gs.white};font-size:15px;line-height:1.38;font-weight:800;letter-spacing:-0.01em;">AGP meet &amp; greet</p>
                                  <p class="email-trust-chip-sub" style="margin:8px 0 0 0;font-family:${emailFonts.sans};color:rgba(255,255,255,0.72);font-size:14px;line-height:1.58;font-weight:500;">Golf-bag friendly Mercedes fleet</p>
                                </td></tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <p style="margin:0;font-family:${emailFonts.sans};color:rgba(255,255,255,0.82);font-size:17px;line-height:1.72;font-weight:500;text-align:center;">Every Golf Sol Ireland transfer is arranged with operators who carry <strong style="color:${gs.white};font-weight:800;">full passenger insurance</strong> — your society or group travels with confidence from the arrivals hall to the fairway and back.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`

/** Quote refinement CTA — shared by marketing tail and enquiry emails. */
export const buildBrandedQuoteCtaHtml = () => {
  const siteRoot = `${getGsolSiteUrl()}/#enquire`
  return `
              <tr>
                <td style="padding:40px 0 0 0;">
                  <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background:${gs.dark};border-radius:36px;overflow:hidden;box-shadow:${cardShadowLift};border:1px solid ${emailAccentBorderOnDarkMuted};">
                    <tr>
                      <td style="height:4px;line-height:4px;font-size:0;mso-line-height-rule:exactly;background-color:${gs.green};">&nbsp;</td>
                    </tr>
                    <tr>
                      <td class="mobile-pad mobile-center" style="padding:42px 36px 40px 36px;">
                        <span class="email-pill" style="display:inline-block;border:1px solid ${emailAccentBorderOnDark};border-radius:999px;padding:10px 22px;font-family:${emailFonts.sans};color:${emailAccentTextOnDark};font-size:12px;line-height:1.5;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;background:rgba(11,107,69,0.35);">Next step</span>
                        <h2 class="email-section-h2" style="margin:18px 0 0 0;font-family:${emailFonts.sans};color:${gs.white};font-size:34px;line-height:1.14;font-weight:800;letter-spacing:-0.03em;">Fine-tune your quote in one reply</h2>
                        <p class="email-lead" style="margin:16px auto 0 auto;max-width:520px;font-family:${emailFonts.sans};color:rgba(245,240,230,0.9);font-size:18px;line-height:1.72;font-weight:500;">We shape the itinerary around your group — not a fixed package. Send any of the below and we will update your quote.</p>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:28px auto 32px auto;max-width:440px;">
                          <tr>
                            <td style="padding:8px 0;font-family:${emailFonts.sans};font-size:17px;line-height:1.62;color:rgba(255,255,255,0.92);font-weight:500;text-align:left;">
                              <span style="color:${emailAccentTextOnDark};font-weight:800;margin-right:10px;">&#10003;</span> Travel dates or flexibility
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;font-family:${emailFonts.sans};font-size:17px;line-height:1.62;color:rgba(255,255,255,0.92);font-weight:500;text-align:left;">
                              <span style="color:${emailAccentTextOnDark};font-weight:800;margin-right:10px;">&#10003;</span> Group size or rooming
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;font-family:${emailFonts.sans};font-size:17px;line-height:1.62;color:rgba(255,255,255,0.92);font-weight:500;text-align:left;">
                              <span style="color:${emailAccentTextOnDark};font-weight:800;margin-right:10px;">&#10003;</span> Must-play courses or resort area
                            </td>
                          </tr>
                        </table>
                        <a class="cta-button" href="${siteRoot}" target="_blank" rel="noopener noreferrer" style="${ctaMustard}">
                          Refine my quote
                        </a>
                        <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="margin:28px auto 0 auto;max-width:520px;">
                          <tr>
                            <td align="center" style="padding:16px 18px;background:rgba(255,255,255,0.06);border-radius:16px;border:1px solid ${emailAccentBorderOnDarkMuted};">
                              <p style="margin:0;font-family:${emailFonts.sans};font-size:12px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:${emailAccentTextOnDark};">Prefer to call?</p>
                              <p style="margin:12px 0 0 0;font-family:${emailFonts.sans};font-size:17px;line-height:1.62;font-weight:600;">
                                <a href="${phoneIrelandHref}" style="color:${gs.white};font-weight:800;text-decoration:none;">${escapeHtml(phoneIrelandDisplay)}</a>
                                <span style="color:rgba(255,255,255,0.4);padding:0 8px;">·</span>
                                <span style="color:rgba(255,255,255,0.78);font-weight:500;">Ireland / WhatsApp</span>
                              </p>
                              <p style="margin:10px 0 0 0;font-family:${emailFonts.sans};font-size:17px;line-height:1.62;font-weight:600;">
                                <a href="tel:+34641815366" style="color:${gs.white};font-weight:800;text-decoration:none;">+34 641 81 53 66</a>
                                <span style="color:rgba(255,255,255,0.4);padding:0 8px;">·</span>
                                <span style="color:rgba(255,255,255,0.72);font-weight:500;">Spain</span>
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`
}

/**
 * Fleet strip → transfer tiles → trust band → quote CTA (matches enquiry-customer).
 */
export const buildBrandedMarketingTailHtml = () => {
  return `
              <tr>
                <td style="padding:40px 0 0 0;">
                  <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background:${gs.dark}; border-radius:36px; overflow:hidden; box-shadow:${cardShadowLift}; border:1px solid ${emailAccentBorderOnDarkMuted};">
                    <tr>
                      <td style="padding:0;line-height:0;font-size:0;">
                        <img src="${assetUrl(assets.fleetLineup)}" width="640" height="359" alt="GolfSol Ireland Mercedes fleet lineup for Costa del Sol golf transfers." style="display:block; width:100%; max-width:640px; height:auto; border:0;">
                      </td>
                    </tr>
                    <tr>
                      <td class="mobile-pad" style="padding:28px 36px 32px 36px; background:${gs.dark}; border-top:1px solid ${emailAccentBorderOnDarkMuted};">
                        <p style="margin:0;font-family:${emailFonts.sans};color:${emailAccentTextOnDark};font-size:12px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;">Fleet</p>
                        <p style="margin:14px 0 0 0;font-family:${emailFonts.sans};color:${gs.white};font-size:28px;line-height:1.22;font-weight:800;letter-spacing:-0.025em;">Mercedes E-Class, V-Class &amp; Sprinter — sized to your group and bags.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:40px 0 0 0;">
                  <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background:${gs.card}; border:1px solid ${gs.cardBorder}; border-radius:36px; box-shadow:${cardShadow};">
                    <tr>
                      <td class="mobile-pad" style="padding:36px 34px 38px 34px;">
                        <p style="margin:0;font-family:${emailFonts.sans};color:${gs.green};font-size:12px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;">Transfer experience</p>
                        <h2 class="section-title" style="margin:16px 0 28px 0;font-family:${emailFonts.sans};color:${gs.text};font-size:34px;line-height:1.16;letter-spacing:-0.03em;font-weight:800;">From arrivals hall to resort door</h2>
                        <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0">
                          <tr class="email-tile-row">
                            <td class="email-tile-cell mobile-stack" style="width:33.33%; padding:0 8px 0 0; vertical-align:top;">
                              <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background:${gs.rowA}; border-radius:22px; overflow:hidden; box-shadow:0 12px 32px rgba(0,0,0,0.08);">
                                <tr><td style="line-height:0;font-size:0;"><img src="${assetUrl(assets.arrivals)}" width="190" height="107" alt="Meet and greet at Malaga Airport arrivals." style="display:block; width:100%; height:auto; border:0;"></td></tr>
                                <tr><td style="padding:18px 16px 20px 16px;"><p style="margin:0; font-family:${emailFonts.sans}; color:${gs.text}; font-size:15px; line-height:1.25; font-weight:800; letter-spacing:-0.02em;">Arrivals tracked</p><p style="margin:8px 0 0 0; font-family:${emailFonts.sans}; color:${gs.muted}; font-size:13px; line-height:1.55; font-weight:500;">Driver ready when your flight lands.</p></td></tr>
                              </table>
                            </td>
                            <td class="email-tile-cell mobile-stack" style="width:33.33%; padding:0 4px; vertical-align:top;">
                              <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background:${gs.card}; border:1px solid ${emailAccentBorderOnDarkMuted}; border-radius:22px; overflow:hidden; box-shadow:0 16px 40px rgba(11,77,59,0.07);">
                                <tr><td style="line-height:0;font-size:0;"><img src="${assetUrl(assets.resort)}" width="190" height="107" alt="GolfSol transfer van arriving at a Costa del Sol golf resort." style="display:block; width:100%; height:auto; border:0;"></td></tr>
                                <tr><td style="padding:18px 16px 20px 16px;"><p style="margin:0; font-family:${emailFonts.sans}; color:${gs.text}; font-size:15px; line-height:1.25; font-weight:800; letter-spacing:-0.02em;">Resort drop-off</p><p style="margin:8px 0 0 0; font-family:${emailFonts.sans}; color:${gs.muted}; font-size:13px; line-height:1.55; font-weight:500;">Straight to hotel, villa or course.</p></td></tr>
                              </table>
                            </td>
                            <td class="email-tile-cell mobile-stack" style="width:33.33%; padding:0 0 0 8px; vertical-align:top;">
                              <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background:${gs.rowA}; border-radius:22px; overflow:hidden; box-shadow:0 12px 32px rgba(0,0,0,0.08);">
                                <tr><td style="line-height:0;font-size:0;"><img src="${assetUrl(assets.coastalDrive)}" width="190" height="107" alt="Premium transfer van driving along the Costa del Sol coastline." style="display:block; width:100%; height:auto; border:0;"></td></tr>
                                <tr><td style="padding:18px 16px 20px 16px;"><p style="margin:0; font-family:${emailFonts.sans}; color:${gs.text}; font-size:16px; line-height:1.35; font-weight:800; letter-spacing:-0.02em;">Sol corridor</p><p style="margin:10px 0 0 0; font-family:${emailFonts.sans}; color:${gs.muted}; font-size:15px; line-height:1.58; font-weight:500;">Malaga, Marbella and beyond.</p></td></tr>
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
${buildBrandedQuoteCtaHtml()}`
}

/**
 * Dark footer card — matches enquiry-customer (company line + registration).
 * @param {{ footerDisclaimerHtml?: string }} [opts]
 */
export const buildBrandedFooterHtml = (opts = {}) => {
  const siteUrl = getGsolSiteUrl()
  const footerYear = new Date().getFullYear()
  const websiteLabel = 'golfsolirl.com'
  const disclaimer =
    opts.footerDisclaimerHtml ??
    'You are receiving this email from Golf Sol Ireland regarding your trip, booking or account. If this was not you, ignore this message.'

  return `
              <tr>
                <td style="padding:44px 12px 8px 12px;">
                  <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:${gs.dark};border-radius:32px;overflow:hidden;box-shadow:${cardShadowLift};border:1px solid ${emailAccentBorderOnDarkMuted};">
                    <tr>
                      <td style="height:4px;line-height:4px;max-height:4px;font-size:0;mso-line-height-rule:exactly;${emailAmbientGradientFillStyle()}">&nbsp;</td>
                    </tr>
                    <tr>
                      <td class="mobile-pad" style="padding:38px 30px 34px 30px;">
                        <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding:0 0 18px 0;">
                              <img class="email-footer-logo" src="${assetUrl(assets.logo)}" width="${EMAIL_LOGO_FOOTER_W}" height="83" alt="GolfSol Ireland" style="display:block;margin:0 auto;width:${EMAIL_LOGO_FOOTER_W}px;max-width:56%;height:auto;border:0;">
                            </td>
                          </tr>
                        </table>
                        <p style="margin:0 auto;max-width:460px;text-align:center;font-family:${emailFonts.sans};font-size:12px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:${emailAccentTextOnDark};">Irish-owned · Costa del Sol</p>
                        <p style="margin:14px auto 0 auto;max-width:460px;text-align:center;font-family:${emailFonts.sans};font-size:20px;line-height:1.38;font-weight:800;letter-spacing:-0.02em;color:${gs.white};">Golf travel, planned in one place</p>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:20px auto 0 auto;">
                          <tr>
                            <td style="padding:0 5px;">
                              <span style="display:inline-block;padding:9px 16px;border-radius:999px;background:rgba(255,255,255,0.07);border:1px solid ${emailAccentBorderOnDarkMuted};font-family:${emailFonts.sans};font-size:12px;line-height:1.45;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${emailAccentTextOnDark};">Transfers</span>
                            </td>
                            <td style="padding:0 5px;">
                              <span style="display:inline-block;padding:9px 16px;border-radius:999px;background:rgba(255,255,255,0.07);border:1px solid ${emailAccentBorderOnDarkMuted};font-family:${emailFonts.sans};font-size:12px;line-height:1.45;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${emailAccentTextOnDark};">Golf</span>
                            </td>
                            <td style="padding:0 5px;">
                              <span style="display:inline-block;padding:9px 16px;border-radius:999px;background:rgba(255,255,255,0.07);border:1px solid ${emailAccentBorderOnDarkMuted};font-family:${emailFonts.sans};font-size:12px;line-height:1.45;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${emailAccentTextOnDark};">Hotels</span>
                            </td>
                          </tr>
                        </table>
                        <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 0 0;">
                          <tr>
                            <td align="center" class="email-footer-contact mobile-stack" style="width:50%;padding:0 6px 0 0;vertical-align:top;">
                              <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(7,28,22,0.5);border-radius:14px;border:1px solid ${emailAccentBorderOnDarkMuted};">
                                <tr><td align="center" style="padding:14px 16px;">
                                  <a href="mailto:${escapeHtml(gsolEmailBrand.email)}" style="font-family:${emailFonts.sans};font-size:16px;line-height:1.5;color:${emailAccentTextOnDark};font-weight:800;text-decoration:none;word-break:break-word;">${escapeHtml(gsolEmailBrand.email)}</a>
                                </td></tr>
                              </table>
                            </td>
                            <td align="center" class="email-footer-contact mobile-stack" style="width:50%;padding:0 0 0 6px;vertical-align:top;">
                              <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(7,28,22,0.5);border-radius:14px;border:1px solid ${emailAccentBorderOnDarkMuted};">
                                <tr><td align="center" style="padding:14px 16px;">
                                  <a href="${escapeHtml(siteUrl + '/')}" target="_blank" rel="noopener noreferrer" style="font-family:${emailFonts.sans};font-size:14px;color:${emailAccentTextOnDark};font-weight:800;text-decoration:none;">${escapeHtml(websiteLabel)}</a>
                                </td></tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <p style="margin:22px 0 0 0;text-align:center;font-family:${emailFonts.sans};font-size:15px;line-height:1.62;color:rgba(255,255,255,0.78);font-weight:500;">
                          <a href="${phoneIrelandHref}" style="color:${gs.white};font-weight:800;text-decoration:none;">${escapeHtml(phoneIrelandDisplay)}</a>
                          <span style="color:rgba(255,255,255,0.35);padding:0 8px;">·</span>
                          Ireland / WhatsApp
                        </p>
                        <p style="margin:8px 0 0 0;text-align:center;font-family:${emailFonts.sans};font-size:14px;line-height:1.62;color:rgba(255,255,255,0.6);font-weight:500;">
                          Company registration no. <span style="color:rgba(255,255,255,0.88);font-weight:700;">${escapeHtml(gsolCompanyLegal.companyRegistrationNumber)}</span> (Ireland)
                        </p>
                        <p style="margin:8px 0 0 0;text-align:center;font-family:${emailFonts.sans};font-size:14px;line-height:1.62;color:rgba(255,255,255,0.6);font-weight:500;">
                          &copy; ${footerYear} Golf Sol Ireland. All rights reserved.
                        </p>
                        <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0 0;">
                          <tr>
                            <td style="padding:18px 16px;background:rgba(0,0,0,0.18);border-radius:14px;border:1px solid rgba(255,255,255,0.08);text-align:center;">
                              <p style="margin:0;font-family:${emailFonts.sans};font-size:13px;line-height:1.68;color:rgba(255,255,255,0.55);font-weight:500;font-style:normal;">${disclaimer}</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`
}

/**
 * Shared `<head>` + outer wrappers through header row + hero band (enquiry-customer layout).
 */
export const buildBrandedEmailHeadAndOpen = (documentTitle) => `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>${escapeHtml(documentTitle)}</title>
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
    <![endif]-->`

/** Preheader through logo/header row only — hero follows separately. */
export const buildBrandedPreheaderThroughHeaderRow = (preview) => {
  const zwnj = '&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;'
  return `
    <div class="preheader">${escapeHtml(preview)}${zwnj}</div>
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
              </tr>`
}

/**
 * Full transactional email: enquiry-customer shell + one primary white card + marketing tail + footer.
 */
export const buildBrandedTransactionalEmailHtml = ({
  documentTitle,
  preheader,
  heroKicker,
  heroTitle,
  heroLead,
  heroMetaHtml,
  mainCardInnerHtml,
  footerDisclaimerHtml
}) => {
  const titleSafe = String(documentTitle ?? '')
  const preview = String(preheader ?? '')
  const kicker = String(heroKicker ?? '')
  const title = String(heroTitle ?? '')
  const lead = String(heroLead ?? '')
  const inner = normalizeTransactionalEmailBodyHtml(mainCardInnerHtml)

  const heroSection = `
              <tr>
                <td style="border-radius:42px; overflow:hidden; background:${gs.dark}; box-shadow:${cardShadowLift}; border:1px solid rgba(255,255,255,0.16);">
                  <table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="${emailAmbientRuleTdStyle()}">&nbsp;</td>
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
                              <span class="email-pill" style="display:inline-block;border:1px solid rgba(217,217,217,0.45);border-radius:999px;padding:12px 26px;font-family:${emailFonts.sans};color:#eef2ef;font-size:12px;line-height:1.5;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;background:rgba(6,59,42,0.72);">${kicker}</span>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding:0;">
                              <h1 class="hero-title" style="margin:0;font-family:${emailFonts.sans};color:${gs.white};font-size:48px;line-height:1.1;font-weight:800;letter-spacing:-0.04em;text-align:center;">
                                ${title}
                              </h1>
                              <p class="email-lead" style="margin:26px auto 0 auto;max-width:520px;font-family:${emailFonts.sans};color:rgba(255,255,255,0.82);font-size:19px;line-height:1.72;font-weight:500;letter-spacing:-0.01em;text-align:center;">
                                ${lead}
                              </p>
                              ${heroMetaBlock(heroMetaHtml)}
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
                        ${inner}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
`

  return `${buildBrandedEmailHeadAndOpen(titleSafe)}
${buildBrandedPreheaderThroughHeaderRow(preview)}
${heroSection}
${buildBrandedMarketingTailHtml()}
${buildBrandedFooterHtml({ footerDisclaimerHtml })}
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
