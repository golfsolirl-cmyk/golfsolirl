/**
 * Unified Golf Sol Ireland transactional email entry points.
 * Lean single-column shell (TOW Layout style) — logo, accent bar, short heading, table, CTA, Monzo, footer.
 */
import { gsolEmailBrand } from './email-constants.mjs'
import { getGsolSiteUrl } from './site-url.mjs'
import { GOLFSOL_BRAND_LOGO_HOSTED } from './brand-logo-assets.mjs'
import {
  buildLeanTransactionalEmailHtml,
  escapeHtml,
  lean,
  leanAnswerTableHtml,
  leanEmailButtonHtml,
  leanFont,
  leanMonzoPaymentBlockHtml
} from './lean-email-shell.mjs'

export { getGsolSiteUrl }
export {
  buildLeanTransactionalEmailHtml,
  escapeHtml,
  lean,
  leanAnswerTableHtml,
  leanEmailButtonHtml,
  leanFont,
  leanMonzoPaymentBlockHtml
} from './lean-email-shell.mjs'

/** Social strip — text links only. */
const buildEmailSocialRowPlainLinks = () => {
  const sep = `<span style="color:${lean.muted};padding:0 6px;">·</span>`
  return `
    <p style="margin:16px 0 0;font-family:${leanFont};font-size:13px;line-height:22px;color:${lean.muted};">
      <a href="https://www.linkedin.com/" style="color:${lean.muted};">LinkedIn</a>${sep}
      <a href="https://www.facebook.com/" style="color:${lean.muted};">Facebook</a>${sep}
      <a href="${gsolEmailBrand.whatsappHref}" style="color:${lean.muted};">WhatsApp</a>${sep}
      <a href="https://bsky.app/" style="color:${lean.muted};">Bluesky</a>
    </p>`
}

/**
 * Final pass before Resend: optional social placeholder, absolute terms URL.
 * @param {string} html
 */
export const finalizeGsolEmailHtml = (html) => {
  const socialBlock = buildEmailSocialRowPlainLinks()
  const site = getGsolSiteUrl()

  return String(html ?? '')
    .replace(/<!--\s*GSOL-SOCIAL-ICONS\s*-->[\s\S]*?<!--\s*\/GSOL-SOCIAL-ICONS\s*-->/, socialBlock)
    .replaceAll('href="/terms-and-conditions"', `href="${site}/terms-and-conditions"`)
}

const transparentPixelDataUri =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

/**
 * Dev preview: rewrite production asset hosts to the current origin.
 * @param {string} html
 * @param {string} [requestOrigin]
 */
export const adaptTransactionalEmailHtmlForBrowserPreview = (html, requestOrigin) => {
  const base = (requestOrigin || getGsolSiteUrl()).replace(/\/+$/, '')
  const productionSite = getGsolSiteUrl().replace(/\/+$/, '')
  const logoSrc = GOLFSOL_BRAND_LOGO_HOSTED

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
 * Lean transactional email — preferred API for all Resend sends.
 * Maps legacy hero* fields into the clean shell so existing callers keep working.
 *
 * @param {{
 *   documentTitle?: string
 *   preheader?: string
 *   heroKicker?: string
 *   heroTitle?: string
 *   heroLead?: string
 *   heroMetaHtml?: string
 *   bodyHtml?: string
 *   kicker?: string
 *   title?: string
 *   lead?: string
 *   rows?: [string, string][]
 *   cta?: { href: string, label: string } | null
 *   payment?: object | null
 *   footerHtml?: string
 * }} opts
 */
export const buildGsolTransactionalEmail = (opts = {}) => {
  const title = String(opts.title || opts.heroTitle || opts.documentTitle || 'Golf Sol Ireland').trim()
  const kicker = String(opts.kicker || opts.heroKicker || '').trim()
  const lead = String(opts.lead || opts.heroLead || '').trim()
  let bodyHtml = String(opts.bodyHtml || '')
  // Legacy callers sometimes put meta into heroMetaHtml — fold lightly under lead.
  const meta = String(opts.heroMetaHtml || '').trim()
  if (meta && !bodyHtml.includes(meta)) {
    bodyHtml = `<div style="margin:0 0 12px;font-size:14px;color:${lean.muted};">${meta}</div>${bodyHtml}`
  }

  return buildLeanTransactionalEmailHtml({
    documentTitle: opts.documentTitle || title,
    preheader: opts.preheader || lead || title,
    kicker,
    title,
    lead,
    bodyHtml,
    rows: opts.rows,
    cta: opts.cta,
    payment: opts.payment,
    footerHtml: opts.footerHtml
  })
}
