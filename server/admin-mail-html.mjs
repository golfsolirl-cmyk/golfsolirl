/**
 * Branded HTML for admin compose / Resend — reuses the existing Golf Sol transactional shell.
 */
import { ctaGreen, emailFonts, escapeHtml, gs } from './branded-email-shell.mjs'
import { buildGsolTransactionalEmail, finalizeGsolEmailHtml } from './email-layout.mjs'
import { applyMailTemplateVars } from '../shared/admin-mail-templates.mjs'

const DETAIL_LINE_RE = /^([^:\n]{1,48}):\s*(.+)$/

const pStyle = `margin:0 0 20px 0;font-family:${emailFonts.sans};font-size:18px;line-height:1.75;color:${gs.text};font-weight:500;`
const greetStyle = `margin:0 0 22px 0;font-family:${emailFonts.sans};font-size:22px;line-height:1.4;color:${gs.text};font-weight:800;`
const closeStyle = `margin:0 0 8px 0;font-family:${emailFonts.sans};font-size:18px;line-height:1.7;color:${gs.text};font-weight:500;`
const closeNameStyle = `margin:12px 0 0 0;font-family:${emailFonts.sans};font-size:18px;line-height:1.5;color:${gs.text};font-weight:800;`

const formatDetailValue = (raw) => {
  const value = String(raw ?? '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T12:00:00`)
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('en-IE', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
    }
  }
  if (/^planned$/i.test(value)) return 'Planned trip'
  return value
}

const emphasiseCopy = (escaped) =>
  escaped
    .replace(/Your reference is ([A-Z0-9-]+)\./g, 'Your reference is <strong style="font-weight:800;">$1</strong>.')
    .replace(/\n/g, '<br />')

const detailsTableHtml = (rows) => {
  const cells = rows
    .map((row, index) => {
      const bg = index % 2 === 0 ? gs.rowA : gs.rowB
      return `<tr>
        <td valign="top" style="padding:12px 14px;width:38%;font-family:${emailFonts.sans};font-size:13px;line-height:1.45;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;color:${gs.green};background:${bg};border-bottom:1px solid ${gs.border};">${escapeHtml(row.label)}</td>
        <td valign="top" style="padding:12px 14px;font-family:${emailFonts.sans};font-size:17px;line-height:1.55;font-weight:700;color:${gs.text};background:${bg};border-bottom:1px solid ${gs.border};">${escapeHtml(formatDetailValue(row.value))}</td>
      </tr>`
    })
    .join('')
  return `<table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 26px 0;border-collapse:collapse;border:1px solid ${gs.cardBorder};border-radius:18px;overflow:hidden;">
    <tr>
      <td colspan="2" style="padding:14px 16px 10px 16px;font-family:${emailFonts.sans};font-size:13px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${gs.goldDeep};background:${gs.cream};">Your trip details</td>
    </tr>
    ${cells}
  </table>`
}

const blockToHtml = (block, kind) => {
  const lines = String(block ?? '')
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length === 0) return ''

  if (kind === 'intro' && /^hello\b/i.test(lines[0])) {
    return `<p style="${greetStyle}">${escapeHtml(lines.join(' '))}</p>`
  }

  if (kind === 'closing') {
    const last = lines[lines.length - 1]
    const lead = lines.slice(0, -1)
    const leadHtml = lead
      .map((line) => `<p style="${closeStyle}">${emphasiseCopy(escapeHtml(line))}</p>`)
      .join('')
    return `${leadHtml}<p style="${closeNameStyle}">${escapeHtml(last)}</p>`
  }

  const detailRows = []
  const other = []
  for (const line of lines) {
    const match = line.match(DETAIL_LINE_RE)
    if (match && match[2].trim() && match[2].trim() !== '—') {
      detailRows.push({ label: match[1].trim(), value: match[2].trim() })
    } else if (!match) {
      other.push(line)
    }
  }

  if (detailRows.length >= 1) {
    const intro = other
      .map((line) => `<p style="${pStyle}">${emphasiseCopy(escapeHtml(line))}</p>`)
      .join('')
    return `${intro}${detailsTableHtml(detailRows)}`
  }

  return `<p style="${pStyle}">${emphasiseCopy(escapeHtml(lines.join('\n')))}</p>`
}

const paragraphsToHtml = (text, kind = 'body') =>
  String(text ?? '')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => blockToHtml(block, kind))
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
      ? `<p style="margin:28px 0 12px 0;text-align:center;">
           <a class="cta-button" href="${escapeHtml(ctaUrl)}" style="${ctaGreen}" target="_blank" rel="noopener">${escapeHtml(ctaLabel)}</a>
         </p>`
      : ''

  const bodyHtml = `
    ${paragraphsToHtml(introduction, 'intro')}
    ${paragraphsToHtml(body, 'body')}
    ${ctaHtml}
    ${paragraphsToHtml(closing, 'closing')}
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
