/**
 * Unified Golf Sol Ireland transactional email shell (proposal / landing visual family).
 * Hero + white card + dark footer band; finalizeGsolEmailHtml() fixes relative links + optional social strip (no image attachments).
 */
import { gsolEmailBrand } from './email-constants.mjs'
import { buildBrandedTransactionalEmailHtml, emailFonts } from './branded-email-shell.mjs'
import { getGsolSiteUrl } from './site-url.mjs'

export { getGsolSiteUrl }

/** Social strip without inline PNG attachments — text links only (icons load nowhere; avoids Resend image/png parts). */
const buildEmailSocialRowPlainLinks = () => {
  const sep = `<span style="color:rgba(255,255,255,0.35);padding:0 6px;">·</span>`
  return `
                          <p style="margin:24px 0 14px 0;font-family:${emailFonts.sans};font-size:10px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:rgba(255,255,255,0.45);">Stay connected</p>
                          <p style="margin:0;font-family:${emailFonts.sans};font-size:14px;line-height:1.85;font-weight:600;text-align:center;">
                            <a href="https://www.linkedin.com/" style="color:#d9d9d9;text-decoration:underline;">LinkedIn</a>${sep}
                            <a href="https://www.facebook.com/" style="color:#d9d9d9;text-decoration:underline;">Facebook</a>${sep}
                            <a href="${gsolEmailBrand.whatsappHref}" style="color:#d9d9d9;text-decoration:underline;">WhatsApp</a>${sep}
                            <a href="https://bsky.app/" style="color:#d9d9d9;text-decoration:underline;">Bluesky</a>
                          </p>`
}

/**
 * Final pass before Resend: optional social placeholder, absolute terms URL.
 * Brand imagery uses hosted URLs in `buildBrandedTransactionalEmailHtml` (`assetUrl`) — no PNG attachments.
 * @param {string} html
 */
export const finalizeGsolEmailHtml = (html) => {
  const socialBlock = buildEmailSocialRowPlainLinks()
  const site = getGsolSiteUrl()

  return html
    .replace(/<!--\s*GSOL-SOCIAL-ICONS\s*-->[\s\S]*?<!--\s*\/GSOL-SOCIAL-ICONS\s*-->/, socialBlock)
    .replaceAll('href="/terms-and-conditions"', `href="${site}/terms-and-conditions"`)
}

const transparentPixelDataUri =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

/**
 * Dev preview: rewrite production asset hosts to the current origin and swap legacy `cid:` images.
 * @param {string} html
 * @param {string} [requestOrigin] e.g. `http://localhost:5174` — used for all hosted image/link paths
 */
export const adaptTransactionalEmailHtmlForBrowserPreview = (html, requestOrigin) => {
  const base = (requestOrigin || getGsolSiteUrl()).replace(/\/+$/, '')
  const productionSite = getGsolSiteUrl().replace(/\/+$/, '')
  const logoSrc = `${base}/images/g-sol-logo.png`

  let out = String(html ?? '')

  if (productionSite !== base) {
    out = out.replaceAll(productionSite, base)
  }
  out = out.replaceAll('https://golfsolirl.com', base)

  out = out.replaceAll(`src="cid:gsol-brand-lockup-email"`, `src="${logoSrc}"`)
  out = out.replaceAll(`src="cid:gsol-shamrock-inline"`, `src="${transparentPixelDataUri}"`)
  for (const cid of ['gsol-social-linkedin', 'gsol-social-facebook', 'gsol-social-whatsapp', 'gsol-social-bsky']) {
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
