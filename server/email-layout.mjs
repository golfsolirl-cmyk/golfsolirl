/**
 * Unified Golf Sol Ireland transactional email shell (proposal / landing visual family).
 * Hero + white card + dark footer band; CID images finalized via finalizeGsolEmailHtml().
 */
import { gsolEmailBrand, logoLockupEmailContentId, shamrockInlineContentId, socialContentIds } from './email-constants.mjs'

export const getGsolSiteUrl = () => {
  const explicit = process.env.SITE_URL?.trim()
  if (explicit) {
    return explicit.replace(/\/+$/, '')
  }

  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) {
    return vercel.startsWith('http') ? vercel.replace(/\/+$/, '') : `https://${vercel.replace(/\/+$/, '')}`
  }

  return 'https://golfsolirl.com'
}

const shamrockHeroSvgPattern = /<svg class="logo-shamrock-email"[^>]*>[\s\S]*?<\/svg>/
const shamrockFooterSvgPattern = /<svg width="24" height="24" viewBox="0 0 24 24"[^>]*>[\s\S]*?<\/svg>/

const buildEmailSocialRowWithCidImages = () => {
  const cell = (href, label, cid) => `
                              <td style="padding:0 12px 0 0;vertical-align:middle;">
                                <a href="${href}" aria-label="${label}" style="display:block;text-decoration:none;">
                                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:48px;height:48px;border-collapse:collapse;border-radius:50%;background-color:rgba(255,255,255,0.08);border:1px solid rgba(220,88,1,0.45);">
                                    <tr>
                                      <td align="center" valign="middle" style="width:48px;height:48px;padding:0;line-height:0;">
                                        <img src="cid:${cid}" width="24" height="24" alt="" style="display:block;border:0;outline:none;margin:0 auto;" />
                                      </td>
                                    </tr>
                                  </table>
                                </a>
                              </td>`

  return `
                          <p style="margin:24px 0 14px 0;font-family:'DM Sans',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:rgba(255,255,255,0.45);">Stay connected</p>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                            <tr>
${cell('https://www.linkedin.com/', 'LinkedIn', socialContentIds.linkedin)}
${cell('https://www.facebook.com/', 'Facebook', socialContentIds.facebook)}
${cell(gsolEmailBrand.whatsappHref, 'WhatsApp', socialContentIds.whatsapp)}
                              <td style="padding:0;vertical-align:middle;">
                                <a href="https://bsky.app/" aria-label="Bluesky" style="display:block;text-decoration:none;">
                                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:48px;height:48px;border-collapse:collapse;border-radius:50%;background-color:rgba(255,255,255,0.08);border:1px solid rgba(220,88,1,0.45);">
                                    <tr>
                                      <td align="center" valign="middle" style="width:48px;height:48px;padding:0;line-height:0;">
                                        <img src="cid:${socialContentIds.bsky}" width="24" height="24" alt="" style="display:block;border:0;outline:none;margin:0 auto;" />
                                      </td>
                                    </tr>
                                  </table>
                                </a>
                              </td>
                            </tr>
                          </table>`
}

/**
 * Swap SVG / relative paths for CID attachments before Resend send.
 * @param {string} html
 */
export const finalizeGsolEmailHtml = (html) => {
  const socialBlock = buildEmailSocialRowWithCidImages()
  const shamrockHeroImg = `<img src="cid:${shamrockInlineContentId}" width="32" height="32" alt="" aria-hidden="true" style="display:block;width:32px;height:32px;border:0;" />`
  const shamrockFootImg = `<img src="cid:${shamrockInlineContentId}" width="24" height="24" alt="" aria-hidden="true" style="display:block;width:24px;height:24px;border:0;" />`

  const site = getGsolSiteUrl()

  return html
    .replace(/<!--\s*GSOL-SOCIAL-ICONS\s*-->[\s\S]*?<!--\s*\/GSOL-SOCIAL-ICONS\s*-->/, socialBlock)
    .replace(shamrockHeroSvgPattern, shamrockHeroImg)
    .replace(shamrockFooterSvgPattern, shamrockFootImg)
    .replaceAll('src="/gsol-brand-lockup-email.png"', `src="cid:${logoLockupEmailContentId}"`)
    .replaceAll('href="/terms-and-conditions"', `href="${site}/terms-and-conditions"`)
}

/**
 * @param {{
 *   documentTitle: string
 *   preheader: string
 *   heroKicker: string
 *   heroTitle: string
 *   heroLead: string
 *   heroMetaHtml: string
 *   bodyHtml: string
 * }} opts — pass HTML-safe strings (escape user content before calling).
 */
export const buildGsolTransactionalEmail = ({
  documentTitle,
  preheader,
  heroKicker,
  heroTitle,
  heroLead,
  heroMetaHtml,
  bodyHtml
}) => {
  const site = getGsolSiteUrl()
  const year = new Date().getFullYear()
  const addr = `${gsolEmailBrand.addressLines[0]}<br />${gsolEmailBrand.addressLines[1]}<br /><span style="color:rgba(255,255,255,0.65);letter-spacing:0.06em;">${gsolEmailBrand.eircode}</span>`

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${documentTitle}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&amp;family=Dancing+Script:wght@600;700&amp;family=Playfair+Display:wght@600;700&amp;display=swap" rel="stylesheet" />
  <style type="text/css">
    body { margin: 0 !important; padding: 0 !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { color: #163a13; }
    @media only screen and (max-width: 620px) {
      .stack { display: block !important; width: 100% !important; max-width: 100% !important; }
      .footer-contact-col { padding: 22px 0 0 0 !important; padding-left: 0 !important; }
      .p-m { padding-left: 16px !important; padding-right: 16px !important; }
      .logo-lockup-email { width: 300px !important; max-width: 92vw !important; height: auto !important; }
      .logo-lockup-email-footer { width: 200px !important; max-width: 72vw !important; height: auto !important; }
    }
    @media only screen and (min-width: 621px) {
      .logo-lockup-email { width: 380px !important; max-width: 100% !important; height: auto !important; }
      .logo-lockup-email-footer { width: 240px !important; max-width: 100% !important; height: auto !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#eef2eb;background:#eef2eb;">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${preheader}</div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;background-color:#eef2eb;background:#eef2eb;">
    <tr>
      <td align="center" style="padding:32px 16px;" class="p-m">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="1100" style="width:100%;max-width:1100px;border-collapse:collapse;">
          <tr>
            <td style="padding:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:separate;border-spacing:0;background-color:#ffffff;background:#ffffff;border:1px solid #d9efd3;border-radius:32px;overflow:hidden;box-shadow:0 22px 70px rgba(10,32,8,0.12);">
                <tr>
                  <td style="padding:0;background-color:#0a2008;background:#0a2008;background-image:radial-gradient(circle at 0% 0%, rgba(80,163,45,0.18), transparent 45%), radial-gradient(circle at 100% 0%, rgba(220,88,1,0.14), transparent 40%);">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
                      <tr>
                        <td style="padding:32px 36px 36px 36px;" class="p-m">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 20px 0;">
                            <tr>
                              <td style="vertical-align:middle;padding:0;" valign="middle">
                                <a aria-label="Go to Golf Sol Ireland homepage" href="${site}/" style="text-decoration:none;color:inherit;display:inline-block;max-width:100%;">
                                  <span style="display:inline-block;filter:drop-shadow(0 8px 24px rgba(10,32,8,0.22));-webkit-filter:drop-shadow(0 8px 24px rgba(10,32,8,0.22));">
                                    <img class="logo-lockup-email" src="/gsol-brand-lockup-email.png" alt="Golf Sol Ireland" width="380" style="display:block;width:380px;max-width:100%;height:auto;border:0;-ms-interpolation-mode:bicubic;" />
                                  </span>
                                </a>
                              </td>
                            </tr>
                          </table>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
                            <tr>
                              <td style="vertical-align:bottom;padding:0 24px 0 0;" valign="bottom" class="stack">
                                <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:#fdba74;">${heroKicker}</p>
                                <h1 style="margin:12px 0 0 0;font-family:'Playfair Display',Georgia,serif;font-size:36px;font-weight:700;line-height:1.12;color:#ffffff;max-width:620px;">${heroTitle}</h1>
                                <p style="margin:14px 0 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:14px;line-height:1.75;color:rgba(255,255,255,0.72);max-width:620px;">${heroLead}</p>
                              </td>
                              <td width="220" style="width:220px;vertical-align:bottom;padding:0;" valign="bottom" class="stack">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
                                  <tr>
                                    <td style="background-color:rgba(255,255,255,0.08);border-radius:24px;padding:16px 18px;font-family:'DM Sans',Arial,sans-serif;font-size:14px;line-height:1.65;color:rgba(255,255,255,0.82);">
                                      ${heroMetaHtml}
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${bodyHtml}
                <tr>
                  <td style="padding:0;background-color:#0f2410;background:linear-gradient(180deg,#0f2410 0%,#0a1809 100%);" class="p-m">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;border-top:1px solid rgba(255,255,255,0.1);">
                      <tr>
                        <td style="padding:32px 40px 36px 40px;vertical-align:top;" valign="top" class="p-m">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 22px 0;">
                            <tr>
                              <td style="width:48px;height:3px;background-color:#dc5801;border-radius:2px;font-size:1px;line-height:1px;">&nbsp;</td>
                            </tr>
                          </table>
                          <a href="${site}/" aria-label="Golf Sol Ireland — home" style="text-decoration:none;color:inherit;display:inline-block;">
                            <img class="logo-lockup-email-footer" src="/gsol-brand-lockup-email.png" alt="" width="240" style="display:block;width:240px;max-width:100%;height:auto;border:0;-ms-interpolation-mode:bicubic;" />
                          </a>
                          <p style="margin:18px 0 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:14px;line-height:1.65;color:rgba(255,255,255,0.78);max-width:520px;">Premium Costa del Sol golf trips for Irish groups — courses, stays, and transfers planned together.</p>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;margin:26px 0 0 0;">
                            <tr>
                              <td style="height:1px;background-color:rgba(255,255,255,0.12);font-size:1px;line-height:1px;">&nbsp;</td>
                            </tr>
                          </table>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;margin-top:26px;">
                            <tr>
                              <td width="50%" style="width:50%;vertical-align:top;padding:0 20px 0 0;" valign="top" class="stack">
                                <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:rgba(253,186,116,0.85);">Registered address</p>
                                <p style="margin:12px 0 0 0;font-family:'DM Sans',Arial,sans-serif;font-size:14px;line-height:1.65;color:rgba(255,255,255,0.92);">${addr}</p>
                              </td>
                              <td width="50%" style="width:50%;vertical-align:top;padding:0 0 0 20px;" valign="top" class="stack footer-contact-col">
                                <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:rgba(253,186,116,0.85);">Contact</p>
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:12px;">
                                  <tr>
                                    <td style="padding:0 0 12px 0;font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.45);width:52px;vertical-align:top;">Phone</td>
                                    <td style="padding:0 0 12px 0;font-family:'DM Sans',Arial,sans-serif;font-size:14px;vertical-align:top;">
                                      <a href="tel:${gsolEmailBrand.phoneTel}" style="color:#fdba74;text-decoration:none;font-weight:600;">${gsolEmailBrand.phoneDisplay}</a>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding:0 0 12px 0;font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.45);vertical-align:top;">Email</td>
                                    <td style="padding:0 0 12px 0;font-family:'DM Sans',Arial,sans-serif;font-size:14px;vertical-align:top;">
                                      <a href="mailto:${gsolEmailBrand.email}" style="color:#fdba74;text-decoration:none;">${gsolEmailBrand.email}</a>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding:0;font-family:'DM Sans',Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.45);vertical-align:top;">Web</td>
                                    <td style="padding:0;font-family:'DM Sans',Arial,sans-serif;font-size:14px;vertical-align:top;">
                                      <a href="${site}/" style="color:rgba(255,255,255,0.88);text-decoration:underline;text-underline-offset:3px;">golfsolirl.com</a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;margin:28px 0 0 0;">
                            <tr>
                              <td style="height:1px;background-color:rgba(255,255,255,0.12);font-size:1px;line-height:1px;">&nbsp;</td>
                            </tr>
                          </table>
                          <!-- GSOL-SOCIAL-ICONS -->
                          <!-- /GSOL-SOCIAL-ICONS -->
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;margin:28px 0 0 0;">
                            <tr>
                              <td style="height:1px;background-color:rgba(255,255,255,0.12);font-size:1px;line-height:1px;">&nbsp;</td>
                            </tr>
                          </table>
                          <p style="margin:22px 0 12px 0;font-family:'DM Sans',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.45);">Quick links</p>
                          <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;line-height:1.85;color:rgba(255,255,255,0.55);">
                            <a href="${site}/golf-packages" style="color:#fdba74;text-decoration:none;">Packages</a>
                            <span style="color:rgba(255,255,255,0.25);">&nbsp;·&nbsp;</span>
                            <a href="${site}/#courses" style="color:#fdba74;text-decoration:none;">Courses</a>
                            <span style="color:rgba(255,255,255,0.25);">&nbsp;·&nbsp;</span>
                            <a href="${site}/#hotels" style="color:#fdba74;text-decoration:none;">Hotels</a>
                            <span style="color:rgba(255,255,255,0.25);">&nbsp;·&nbsp;</span>
                            <a href="${site}/airport-transfers" style="color:#fdba74;text-decoration:none;">Transfers</a>
                            <span style="color:rgba(255,255,255,0.25);">&nbsp;·&nbsp;</span>
                            <a href="${site}/#plan-trip" style="color:#fdba74;text-decoration:none;">Plan your trip</a>
                            <span style="color:rgba(255,255,255,0.25);">&nbsp;·&nbsp;</span>
                            <a href="${site}/#testimonials" style="color:#fdba74;text-decoration:none;">Testimonials</a>
                          </p>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;margin:26px 0 0 0;">
                            <tr>
                              <td style="height:1px;background-color:rgba(255,255,255,0.12);font-size:1px;line-height:1px;">&nbsp;</td>
                            </tr>
                          </table>
                          <p style="margin:20px 0 10px 0;font-family:'DM Sans',Arial,sans-serif;font-size:12px;line-height:1.65;">
                            <a href="${site}/terms-and-conditions" style="color:rgba(255,255,255,0.75);font-weight:600;text-decoration:underline;text-underline-offset:2px;">Terms &amp; conditions</a>
                          </p>
                          <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:11px;line-height:1.55;color:rgba(255,255,255,0.38);">&copy; ${year} Golf Sol Ireland. All rights reserved.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
