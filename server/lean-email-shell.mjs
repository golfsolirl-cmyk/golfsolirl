/**
 * Clean single-column transactional email shell (TOW Layout style, Golf Sol branding).
 * Logo → thin accent bar → short heading → optional answer table → one CTA → Monzo block
 * → Past Customers Gallery (customer emails) → small footer.
 * No heavy heroes or long marketing banners.
 */
import { gsolEmailBrand } from './email-constants.mjs'
import { getGsolSiteUrl } from './site-url.mjs'
import { GOLFSOL_BRAND_LOGO_HOSTED } from './brand-logo-assets.mjs'
import { formatIbanGroupsOf4 } from '../shared/format-iban.mjs'
import { buildPastCustomersGalleryHtml } from './email-past-customers-gallery.mjs'
import { buildTripadvisorAnnouncementHtml } from './email-tripadvisor-announcement.mjs'

export const lean = {
  forest: '#063B2A',
  forestSoft: '#136047',
  ink: '#16231d',
  body: '#3d4a44',
  muted: '#66736d',
  gold: '#d4a843',
  cream: '#F4F7F5',
  card: '#ffffff',
  foot: '#f6f8f6',
  border: '#e3ebe6',
  rowAlt: '#f7faf8',
  white: '#ffffff'
}

export const leanFont =
  "'Open Sans', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"
export const leanMono = "'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace"

export const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const headCss = `@media only screen and (max-width:620px){.email-outer{padding:16px 8px !important}.email-pad{padding-left:24px !important;padding-right:24px !important}.email-h1{font-size:24px !important;line-height:32px !important}.pcg-cell{display:block !important;width:100% !important;max-width:100% !important;padding:6px 0 !important}.pcg-cell img{height:180px !important}}`

/**
 * Bulletproof CTA button.
 * @param {{ href: string, label: string, bg?: string, color?: string }} opts
 */
export const leanEmailButtonHtml = ({ href, label, bg = lean.forest, color = lean.white }) => `
<table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-table;margin:0 8px 8px 0;">
  <tr>
    <td style="background-color:${bg};border-radius:12px;">
      <a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 24px;font-size:16px;line-height:24px;font-weight:700;color:${color};text-decoration:none;font-family:${leanFont};">${escapeHtml(label)}</a>
    </td>
  </tr>
</table>`

/**
 * Label-above-value rows (TOW AnswerTable).
 * @param {[string, string][]} rows
 */
export const leanAnswerTableHtml = (rows) => {
  const list = Array.isArray(rows) ? rows.filter(([k, v]) => k && String(v ?? '').trim()) : []
  if (!list.length) return ''
  const body = list
    .map(
      ([k, v], i) => `
<tr style="background-color:${i % 2 ? lean.card : lean.rowAlt};">
  <td style="padding:16px 20px;vertical-align:top;">
    <p style="margin:0;font-size:13px;line-height:18px;font-weight:700;color:${lean.muted};font-family:${leanFont};text-transform:uppercase;letter-spacing:0.06em;">${escapeHtml(k)}</p>
    <p style="margin:6px 0 0;font-size:16px;line-height:24px;font-weight:500;color:${lean.ink};font-family:${leanFont};white-space:pre-wrap;word-break:break-word;">${escapeHtml(v)}</p>
  </td>
</tr>`
    )
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;border:1px solid ${lean.border};border-radius:16px;overflow:hidden;">${body}</table>`
}

/**
 * Monzo / bank transfer block for emails.
 * @param {{
 *   accountName?: string
 *   bankName?: string
 *   iban?: string
 *   ibanDisplay?: string
 *   bic?: string
 *   paymentReference?: string | null
 *   amountDueLabel?: string | null
 * }} opts
 */
export const leanMonzoPaymentBlockHtml = (opts = {}) => {
  const accountName = String(opts.accountName ?? '').trim()
  const iban = String(opts.iban ?? '').replace(/\s+/g, '').toUpperCase()
  if (!accountName || !iban) return ''
  const ibanDisplay =
    String(opts.ibanDisplay ?? '').trim() || formatIbanGroupsOf4(iban)
  const bankName = String(opts.bankName ?? 'Monzo Bank').trim() || 'Monzo Bank'
  const bic = String(opts.bic ?? '').trim()
  const ref = String(opts.paymentReference ?? '').trim()
  const amount = String(opts.amountDueLabel ?? '').trim()

  const fact = (k, v, mono) =>
    `<p style="margin:10px 0 0;font-size:16px;line-height:24px;color:${lean.ink};font-family:${leanFont};">
      <span style="display:block;font-size:13px;line-height:18px;font-weight:700;color:${lean.muted};text-transform:uppercase;letter-spacing:0.06em;">${escapeHtml(k)}</span>
      <b style="font-family:${mono ? leanMono : leanFont};font-weight:700;">${escapeHtml(v)}</b>
    </p>`

  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;background-color:${lean.forest};border-radius:16px;margin:8px 0 0;">
  <tr>
    <td style="padding:24px 24px 8px;">
      <p style="margin:0;font-size:13px;line-height:18px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#c9e8d4;font-family:${leanFont};">How to pay · bank transfer</p>
      ${
        amount
          ? `<p style="margin:8px 0 0;font-size:28px;line-height:36px;font-weight:800;color:#ffffff;font-family:${leanFont};letter-spacing:-0.02em;">${escapeHtml(amount)}</p>`
          : ''
      }
      ${
        ref
          ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 0;border-collapse:separate;background:rgba(255,255,255,0.08);border:1px dashed rgba(212,168,67,0.7);border-radius:14px;">
        <tr><td style="padding:14px 18px;">
          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#c9e8d4;font-family:${leanFont};">Payment reference</p>
          <p style="margin:6px 0 0;font-size:22px;line-height:28px;font-weight:800;letter-spacing:0.04em;color:#ffffff;font-family:${leanMono};word-break:break-word;">${escapeHtml(ref)}</p>
        </td></tr>
      </table>
      <p style="margin:14px 0 0;font-size:15px;line-height:22px;color:#ffffff;font-weight:600;font-family:${leanFont};">Use this reference so we can match your payment.</p>`
          : ''
      }
    </td>
  </tr>
  <tr>
    <td style="padding:12px 24px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;background:#ffffff;border-radius:14px;">
        <tr>
          <td style="padding:20px;">
            <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${lean.forestSoft};font-family:${leanFont};">Monzo · Ireland</p>
            ${fact('Account name', accountName)}
            ${fact('Bank', bankName)}
            ${fact('IBAN', ibanDisplay, true)}
            ${bic ? fact('BIC', bic, true) : ''}
            ${amount ? fact('Amount', amount) : ''}
            ${ref ? fact('Reference', ref, true) : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

/**
 * Full lean transactional document.
 * @param {{
 *   documentTitle?: string
 *   preheader: string
 *   kicker?: string
 *   title: string
 *   lead?: string
 *   bodyHtml?: string
 *   rows?: [string, string][]
 *   cta?: { href: string, label: string } | null
 *   payment?: Parameters<typeof leanMonzoPaymentBlockHtml>[0] | null
 *   footerHtml?: string
 *   includePastCustomersGallery?: boolean
 * }} opts
 */
export const buildLeanTransactionalEmailHtml = (opts) => {
  const site = getGsolSiteUrl().replace(/\/+$/, '')
  const logo = GOLFSOL_BRAND_LOGO_HOSTED
  const whatsapp = gsolEmailBrand.whatsappHref || 'https://wa.me/353866006202'
  const whatsappDisplay = gsolEmailBrand.whatsappDisplay || '+353 86 600 6202'
  const kicker = String(opts.kicker ?? '').trim()
  const title = String(opts.title ?? '').trim()
  const lead = String(opts.lead ?? '').trim()
  const bodyHtml = String(opts.bodyHtml ?? '')
  const rowsHtml = leanAnswerTableHtml(opts.rows ?? [])
  const paymentHtml = opts.payment ? leanMonzoPaymentBlockHtml(opts.payment) : ''
  const ctaHtml = opts.cta?.href
    ? leanEmailButtonHtml({ href: opts.cta.href, label: opts.cta.label || 'Open your trip desk' })
    : ''
  // Customer-facing only — admin/ops pass includePastCustomersGallery: false.
  const showCustomerExtras = opts.includePastCustomersGallery !== false
  const pastCustomersHtml = showCustomerExtras
    ? buildPastCustomersGalleryHtml({
        fontFamily: leanFont,
        forest: lean.forest,
        forestDeep: '#0A2E23',
        cream: '#F5F0E6',
        gold: lean.gold,
        muted: lean.muted,
        ink: lean.ink,
        border: lean.border,
        card: lean.card
      })
    : ''
  const tripadvisorHtml = showCustomerExtras
    ? buildTripadvisorAnnouncementHtml({
        fontFamily: leanFont,
        forest: lean.forest,
        cream: '#F5F0E6',
        gold: lean.gold,
        muted: lean.muted,
        ink: lean.ink,
        border: lean.border,
        card: lean.card
      })
    : ''
  const footer =
    opts.footerHtml?.trim() ||
    `All payments handled in Ireland · <a href="${escapeHtml(whatsapp)}" style="color:${lean.muted};font-weight:600;">WhatsApp ${escapeHtml(whatsappDisplay)}</a> · <a href="${escapeHtml(site)}" style="color:${lean.muted};">${escapeHtml(site.replace(/^https?:\/\//, ''))}</a>`

  return `<!doctype html>
<html lang="en-IE">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(opts.documentTitle || title || 'Golf Sol Ireland')}</title>
  <style>${headCss}</style>
</head>
<body style="margin:0;padding:0;background:${lean.cream};font-family:${leanFont};color:${lean.ink};font-size:16px;line-height:24px;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(opts.preheader || lead || title)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${lean.cream};">
    <tr>
      <td class="email-outer" align="center" style="padding:24px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${lean.card};border-radius:16px;">
          <tr>
            <td class="email-pad" style="padding:28px 32px 20px;background:${lean.card};">
              <img src="${escapeHtml(logo)}" width="200" alt="Golf Sol Ireland" style="display:block;width:200px;max-width:100%;height:auto;border:0;">
            </td>
          </tr>
          <tr><td style="height:6px;line-height:6px;font-size:0;background:${lean.gold};">&nbsp;</td></tr>
          <tr>
            <td class="email-pad" style="padding:28px 32px 8px;">
              ${
                kicker
                  ? `<p style="margin:0;font-size:13px;line-height:18px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${lean.forestSoft};font-family:${leanFont};">${escapeHtml(kicker)}</p>`
                  : ''
              }
              <h1 class="email-h1" style="margin:${kicker ? '12px' : '0'} 0 0;font-size:28px;line-height:36px;font-weight:800;letter-spacing:-0.02em;color:${lean.ink};font-family:${leanFont};">${escapeHtml(title)}</h1>
              ${
                lead
                  ? `<p style="margin:16px 0 0;font-size:16px;line-height:24px;color:${lean.body};font-family:${leanFont};">${escapeHtml(lead)}</p>`
                  : ''
              }
            </td>
          </tr>
          ${
            rowsHtml
              ? `<tr><td class="email-pad" style="padding:20px 32px 8px;">${rowsHtml}</td></tr>`
              : ''
          }
          ${
            bodyHtml
              ? `<tr><td class="email-pad" style="padding:16px 32px 8px;font-family:${leanFont};font-size:16px;line-height:24px;color:${lean.body};">${bodyHtml}</td></tr>`
              : ''
          }
          ${
            paymentHtml
              ? `<tr><td class="email-pad" style="padding:16px 32px 8px;">${paymentHtml}</td></tr>`
              : ''
          }
          ${
            ctaHtml
              ? `<tr><td class="email-pad" style="padding:24px 32px 28px;">${ctaHtml}</td></tr>`
              : `<tr><td style="padding:12px 0 0;">&nbsp;</td></tr>`
          }
          ${
            pastCustomersHtml
              ? `<tr><td class="email-pad" style="padding:8px 32px 12px;background:${lean.card};">${pastCustomersHtml}</td></tr>`
              : ''
          }
          ${
            tripadvisorHtml
              ? `<tr><td class="email-pad" style="padding:8px 32px 24px;background:${lean.card};">${tripadvisorHtml}</td></tr>`
              : ''
          }
          <tr>
            <td class="email-pad" style="background:${lean.foot};padding:20px 32px;font-size:14px;line-height:22px;color:${lean.muted};font-family:${leanFont};">
              ${footer}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
