/**
 * Unified Golf Sol Ireland transactional email shell (proposal / landing visual family).
 * Hero + white card + dark footer band; CID images finalized via finalizeGsolEmailHtml().
 */
import { gsolEmailBrand, logoLockupEmailContentId, shamrockInlineContentId, socialContentIds } from './email-constants.mjs'
import { buildBrandedTransactionalEmailHtml, emailFonts } from './branded-email-shell.mjs'
import { getGsolSiteUrl } from './site-url.mjs'

export { getGsolSiteUrl }

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
                          <p style="margin:24px 0 14px 0;font-family:${emailFonts.sans};font-size:10px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:rgba(255,255,255,0.45);">Stay connected</p>
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

const transparentPixelDataUri =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

/**
 * After `finalizeGsolEmailHtml`, Resend uses `cid:` image sources. Browsers cannot load those;
 * swap to public URLs / placeholders so transactional mail can be viewed in an iframe (dev preview).
 * @param {string} html
 * @param {string} [requestOrigin] e.g. `http://localhost:5173` — used for lockup + hero art paths
 */
export const adaptTransactionalEmailHtmlForBrowserPreview = (html, requestOrigin) => {
  const base = (requestOrigin || getGsolSiteUrl()).replace(/\/+$/, '')
  const logoSrc = `${base}/images/golfsol-header-logo-bitmap.png`
  let out = html
  out = out.replaceAll(`src="cid:${logoLockupEmailContentId}"`, `src="${logoSrc}"`)
  out = out.replaceAll(`src="cid:${shamrockInlineContentId}"`, `src="${transparentPixelDataUri}"`)
  for (const cid of Object.values(socialContentIds)) {
    out = out.replaceAll(`src="cid:${cid}"`, `src="${transparentPixelDataUri}"`)
  }
  return out
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
}) =>
  buildBrandedTransactionalEmailHtml({
    documentTitle,
    preheader,
    heroKicker,
    heroTitle,
    heroLead,
    heroMetaHtml,
    mainCardInnerHtml: bodyHtml
  })
