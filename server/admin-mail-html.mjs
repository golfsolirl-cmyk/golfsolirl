/**
 * Branded HTML for admin compose / Resend — reuses the existing Golf Sol transactional shell.
 */
import { ctaGreen, escapeHtml } from './branded-email-shell.mjs'
import { buildGsolTransactionalEmail, finalizeGsolEmailHtml } from './email-layout.mjs'
import { applyMailTemplateVars } from '../shared/admin-mail-templates.mjs'

const paragraphsToHtml = (text) =>
  String(text ?? '')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const inner = escapeHtml(block).replaceAll('\n', '<br />')
      return `<p style="margin:0 0 16px 0;line-height:1.7;">${inner}</p>`
    })
    .join('')

const safeHttpUrl = (raw) => {
  const s = String(raw ?? '').trim()
  if (!s) return ''
  try {
    const u = new URL(s)
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.toString()
  } catch {
    return ''
  }
  return ''
}

/**
 * @param {{
 *   heading: string
 *   introduction: string
 *   body: string
 *   closing: string
 *   ctaLabel?: string
 *   ctaUrl?: string
 *   customerName?: string
 *   vars?: Record<string, string>
 * }} input
 */
export const buildAdminBrandedMailHtml = (input) => {
  const vars = input.vars && typeof input.vars === 'object' ? input.vars : {}
  const heading = applyMailTemplateVars(input.heading, vars)
  const introduction = applyMailTemplateVars(input.introduction, vars)
  const body = applyMailTemplateVars(input.body, vars)
  const closing = applyMailTemplateVars(input.closing, vars)
  const ctaLabel = applyMailTemplateVars(input.ctaLabel || '', vars)
  const ctaUrl = safeHttpUrl(applyMailTemplateVars(input.ctaUrl || '', vars))
  const customerName = applyMailTemplateVars(input.customerName || vars.customerName || '', vars)

  const ctaHtml =
    ctaLabel && ctaUrl
      ? `<p style="margin:28px 0 8px 0;text-align:center;">
           <a class="cta-button" href="${escapeHtml(ctaUrl)}" style="${ctaGreen}" target="_blank" rel="noopener">${escapeHtml(ctaLabel)}</a>
         </p>`
      : ''

  const bodyHtml = `
    ${paragraphsToHtml(introduction)}
    ${paragraphsToHtml(body)}
    ${ctaHtml}
    ${paragraphsToHtml(closing)}
  `

  const raw = buildGsolTransactionalEmail({
    documentTitle: heading || 'Golf Sol Ireland',
    preheader: (introduction || body).replace(/\s+/g, ' ').slice(0, 110),
    heroKicker: 'Golf Sol Ireland',
    heroTitle: escapeHtml(heading || 'Golf Sol Ireland'),
    heroLead: customerName ? escapeHtml(`For ${customerName}`) : '',
    heroMetaHtml: '',
    bodyHtml
  })
  return finalizeGsolEmailHtml(raw)
}

export const brandedMailPlainText = (input) => {
  const vars = input.vars && typeof input.vars === 'object' ? input.vars : {}
  const parts = [
    applyMailTemplateVars(input.heading, vars),
    applyMailTemplateVars(input.introduction, vars),
    applyMailTemplateVars(input.body, vars),
    applyMailTemplateVars(input.ctaLabel || '', vars) && applyMailTemplateVars(input.ctaUrl || '', vars)
      ? `${applyMailTemplateVars(input.ctaLabel, vars)}: ${applyMailTemplateVars(input.ctaUrl, vars)}`
      : '',
    applyMailTemplateVars(input.closing, vars)
  ]
  return parts.filter(Boolean).join('\n\n')
}
