/**
 * Golf Sol Ireland transactional email catalog — TOW Layout structure, Golf Sol brand.
 * Each kind returns { id, label, subject, preheader, html, text }.
 */
import {
  buildLeanTransactionalEmailHtml,
  escapeHtml,
  finalizeGsolEmailHtml,
  getGsolSiteUrl,
  lean,
  leanAnswerTableHtml,
  leanEmailButtonHtml,
  leanFont,
  leanMonzoPaymentBlockHtml
} from './email-layout.mjs'
import { gsolEmailBrand } from './email-constants.mjs'
import { buildBrandedEnquiryEmailHtml } from './branded-enquiry-email.mjs'
import { buildBrandedPostEnquiryPortalInviteHtml } from './branded-post-enquiry-portal-invite-email.mjs'
import { TRIP_TRACKER_STEPS } from '../shared/trip-tracker-steps.mjs'

const site = () => getGsolSiteUrl().replace(/\/+$/, '')
const wa = () => gsolEmailBrand.whatsappHref || 'https://wa.me/353866006202'
const waDisplay = () => gsolEmailBrand.whatsappDisplay || '+353 86 600 6202'
const email = () => gsolEmailBrand.email || 'info@golfsolirl.com'

const signOffHtml = () =>
  `<p style="margin:24px 0 0;font-size:16px;line-height:24px;color:${lean.body};font-family:${leanFont};">Talk soon,<br><b>Golf Sol Ireland</b><br><a href="mailto:${escapeHtml(email())}" style="color:${lean.forestSoft};">${escapeHtml(email())}</a> · WhatsApp <a href="${escapeHtml(wa())}" style="color:${lean.forestSoft};">${escapeHtml(waDisplay())}</a></p>`

const irelandFooter = (extra = '') =>
  `${extra ? `${extra} ` : ''}All payments handled in Ireland · <a href="mailto:${escapeHtml(email())}" style="color:${lean.muted};">${escapeHtml(email())}</a> · <a href="${escapeHtml(wa())}" style="color:${lean.muted};">WhatsApp ${escapeHtml(waDisplay())}</a>`

const htmlToText = (html) =>
  String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/h1>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

const samplePayment = {
  accountName: 'Golf Sol Ireland',
  bankName: 'Monzo Bank',
  iban: 'IE00MONZ00000000000000',
  ibanDisplay: 'IE00 MONZ 0000 0000 0000 00',
  bic: 'MONZIE2D',
  paymentReference: 'GSOL-SAMPLE-7K2M',
  amountDueLabel: '€490.00'
}

const sampleEnquiryPayload = {
  enquiryId: 'GSOL-SAMPLE-7K2M',
  fullName: 'Aoife Murphy',
  email: 'aoife@example.com',
  phoneWhatsApp: '+353 87 000 0000',
  bestTimeToCall: 'Evenings',
  enquiryDate: '22 Nov 2026, 21:04 (Irish time)',
  interest: '5 nights · 3 rounds · Málaga transfers',
  portalPrivateUrl: `${site()}/portal/sample-token`
}

/**
 * @param {string} id
 * @param {Record<string, unknown>} [overrides]
 */
export function buildGsolCatalogEmail(id, overrides = {}) {
  const builders = {
    'enquiry-customer': () => {
      const html = buildBrandedEnquiryEmailHtml({ ...sampleEnquiryPayload, ...overrides }, 'customer')
      return {
        id,
        label: 'Enquiry confirmation (client)',
        subject: `Your Golf Sol Ireland enquiry confirmation (${sampleEnquiryPayload.enquiryId})`,
        preheader: 'We received your Costa del Sol trip details.',
        html,
        text: htmlToText(html)
      }
    },
    'enquiry-admin': () => {
      const html = buildBrandedEnquiryEmailHtml({ ...sampleEnquiryPayload, ...overrides }, 'admin')
      return {
        id,
        label: 'New enquiry (admin)',
        subject: `New Golf Sol Ireland enquiry ${sampleEnquiryPayload.enquiryId} from Aoife Murphy`,
        preheader: 'New enquiry on golfsolirl.com',
        html,
        text: htmlToText(html)
      }
    },
    'offer-transfers': () => buildOffer('transfers', 'Airport & hotel transfers', overrides),
    'offer-accommodation': () => buildOffer('accommodation', 'Accommodation', overrides),
    'offer-golf': () => buildOffer('golf_courses', 'Golf courses & tee times', overrides),
    'payment-request': () => {
      const pay = { ...samplePayment, ...(overrides.payment || {}) }
      const amountNow = String(overrides.amountNowLabel || pay.amountDueLabel || '')
      const headline = String(overrides.paymentRequestHeadline || 'Amount due now')
      const html = finalizeGsolEmailHtml(
        buildLeanTransactionalEmailHtml({
          documentTitle: 'Payment request',
          preheader: `${headline}: ${amountNow} · ref ${pay.paymentReference}.`,
          kicker: `Payment request · ${pay.paymentReference}`,
          title: 'Here is how to pay for your trip',
          lead: `${headline}: ${amountNow}. Transfer from any Irish or EU bank. Use the reference so we can match your payment. All payments are handled in Ireland.`,
          rows: [
            ['Item', String(overrides.item || 'Costa del Sol golf trip')],
            [headline, amountNow],
            ['Reference', pay.paymentReference]
          ],
          payment: pay,
          cta: { href: String(overrides.payUrl || `${site()}/portal`), label: 'Open your pay page' },
          bodyHtml: signOffHtml(),
          footerHtml: irelandFooter(`Payment request ref ${escapeHtml(pay.paymentReference)}.`)
        })
      )
      return {
        id,
        label: 'Payment request (Monzo)',
        subject: `Golf Sol Ireland — payment details (${pay.paymentReference})`,
        preheader: `${headline}: ${amountNow} · ref ${pay.paymentReference}`,
        html,
        text: [
          `Payment request ${pay.paymentReference}`,
          `${headline}: ${amountNow}`,
          `Account: ${pay.accountName}`,
          `IBAN: ${pay.ibanDisplay}`,
          pay.bic ? `BIC: ${pay.bic}` : '',
          `All payments handled in Ireland.`,
          `WhatsApp ${waDisplay()} · ${email()}`
        ]
          .filter(Boolean)
          .join('\n')
      }
    },
    'payment-receipt': () => {
      const amount = String(overrides.amountLabel || '€490.00')
      const ref = String(overrides.reference || 'GSOL-SAMPLE-7K2M')
      const html = finalizeGsolEmailHtml(
        buildLeanTransactionalEmailHtml({
          documentTitle: 'Payment received',
          preheader: `Thanks — we received ${amount}.`,
          kicker: `Receipt · paid · ${ref}`,
          title: 'Thanks for your payment',
          lead: 'Here is your receipt for your records. No action needed.',
          rows: [
            ['Amount paid', amount],
            ['Reference', ref],
            ['Method', String(overrides.method || 'Bank transfer (Monzo)')],
            ['Date', String(overrides.date || '22 Nov 2026')]
          ],
          cta: { href: `${site()}/portal`, label: 'Open your trip desk' },
          bodyHtml: signOffHtml(),
          footerHtml: irelandFooter(`Receipt ${escapeHtml(ref)}.`)
        })
      )
      return {
        id,
        label: 'Payment received receipt',
        subject: `Golf Sol Ireland — payment received (${ref})`,
        preheader: `Thanks — we received ${amount}.`,
        html,
        text: htmlToText(html)
      }
    },
    'portal-access': () => {
      const html = buildBrandedPostEnquiryPortalInviteHtml({
        fullName: 'Aoife Murphy',
        email: 'aoife@example.com',
        enquiryId: 'GSOL-SAMPLE-7K2M',
        enquiryDate: '22 Nov 2026',
        sentAtDisplay: '22 Nov 2026',
        privateUrl: `${site()}/portal/sample-token`,
        portalLoginUrl: `${site()}/portal`,
        ...overrides
      })
      return {
        id,
        label: 'Portal access link',
        subject: 'Your Golf Sol trip desk is open — GSOL-SAMPLE-7K2M',
        preheader: 'Your private trip desk link is ready.',
        html: finalizeGsolEmailHtml(html),
        text: htmlToText(html)
      }
    },
    'trip-step-update': () => {
      const stepId = String(overrides.stepId || 'quote_sent')
      const status = String(overrides.status || 'done')
      const step =
        TRIP_TRACKER_STEPS.find((s) => s.id === stepId) || TRIP_TRACKER_STEPS[1]
      const done = Number(overrides.done ?? 2)
      const total = TRIP_TRACKER_STEPS.length
      const pct = Math.round((done / total) * 100)
      const statusLabel =
        status === 'done' ? 'Done' : status === 'doing' ? 'In progress' : status === 'skip' ? 'Skipped' : 'To do'
      const progressRows = TRIP_TRACKER_STEPS.map((s, i) => {
        const st =
          i < done - 1 ? 'Done' : s.id === step.id ? statusLabel : i < done ? 'Done' : 'To do'
        return [s.label, st]
      })
      const html = finalizeGsolEmailHtml(
        buildLeanTransactionalEmailHtml({
          documentTitle: 'Trip update',
          preheader: `${step.label}: ${statusLabel} · ${done} of ${total} steps`,
          kicker: `Trip update · ${done}/${total} (${pct}%)`,
          title: `${step.label} — ${statusLabel.toLowerCase()}`,
          lead: `Hi Aoife, a quick update on your Costa del Sol trip. ${step.label} is now marked ${statusLabel.toLowerCase()}.`,
          rows: progressRows.slice(0, 6),
          bodyHtml: `${leanAnswerTableHtml(progressRows.slice(6))}
            <div style="margin-top:20px;">${leanEmailButtonHtml({ href: `${site()}/portal`, label: 'Open your trip desk' })}</div>
            ${signOffHtml()}`,
          footerHtml: irelandFooter('Trip tracker update from Golf Sol Ireland.')
        })
      )
      return {
        id,
        label: 'Trip tracker step update',
        subject: `Golf Sol Ireland — ${step.label} (${statusLabel})`,
        preheader: `${step.label}: ${statusLabel}`,
        html,
        text: htmlToText(html)
      }
    },
    'invoice-receipt': () => {
      const ref = String(overrides.reference || 'GS-INV-1001')
      const html = finalizeGsolEmailHtml(
        buildLeanTransactionalEmailHtml({
          documentTitle: 'Invoice',
          preheader: `Invoice ${ref} from Golf Sol Ireland.`,
          kicker: `Invoice · ${ref}`,
          title: 'Your invoice is ready',
          lead: 'A copy is attached (or available in your trip desk). All payments handled in Ireland.',
          rows: [
            ['Invoice', ref],
            ['Description', String(overrides.description || 'Costa del Sol golf trip')],
            ['Amount', String(overrides.amountLabel || '€490.00 incl. VAT')],
            ['Due', String(overrides.due || 'On receipt')]
          ],
          payment: overrides.includePayment === false ? null : samplePayment,
          cta: { href: `${site()}/portal`, label: 'View in trip desk' },
          bodyHtml: signOffHtml(),
          footerHtml: irelandFooter(`Invoice ${escapeHtml(ref)}.`)
        })
      )
      return {
        id,
        label: 'Invoice / receipt',
        subject: `Golf Sol Ireland — invoice ${ref}`,
        preheader: `Invoice ${ref}`,
        html,
        text: htmlToText(html)
      }
    }
  }

  const fn = builders[id]
  if (!fn) {
    const err = new Error(`Unknown email template: ${id}`)
    err.statusCode = 404
    throw err
  }
  return fn()
}

function buildOffer(service, label, overrides) {
  const first = String(overrides.firstName || 'Aoife')
  const ref = String(overrides.reference || 'GSOL-SAMPLE-7K2M')
  const html = finalizeGsolEmailHtml(
    buildLeanTransactionalEmailHtml({
      documentTitle: `${label} offer`,
      preheader: `A ${label.toLowerCase()} option for your trip (${ref}).`,
      kicker: `Quote · ${label} · ${ref}`,
      title: `${first}, here is your ${label.toLowerCase()} option`,
      lead: 'Reply to this email or open your trip desk to confirm. Nothing is booked until you say so.',
      rows: [
        ['Service', label],
        ['Reference', ref],
        ['Notes', String(overrides.notes || 'Irish team quote — clear prices, no surprises.')]
      ],
      cta: { href: String(overrides.portalUrl || `${site()}/portal`), label: 'Open your trip desk' },
      bodyHtml: `${leanEmailButtonHtml({
        href: `mailto:${email()}?subject=${encodeURIComponent(`${label} — ${ref}`)}`,
        label: 'Reply by email',
        bg: lean.ink,
        color: lean.white
      })}${signOffHtml()}`,
      footerHtml: irelandFooter(`Offer email for ${escapeHtml(label)}.`)
    })
  )
  return {
    id: `offer-${service === 'golf_courses' ? 'golf' : service}`,
    label: `Quote / offer — ${label}`,
    subject: `Golf Sol Ireland — ${label} quote (${ref})`,
    preheader: `${label} option for your trip`,
    html,
    text: htmlToText(html)
  }
}

export const GSOL_EMAIL_CATALOG = [
  { id: 'enquiry-customer', label: 'Enquiry confirmation (client)' },
  { id: 'enquiry-admin', label: 'New enquiry (admin)' },
  { id: 'offer-transfers', label: 'Quote — transfers' },
  { id: 'offer-accommodation', label: 'Quote — accommodation' },
  { id: 'offer-golf', label: 'Quote — golf' },
  { id: 'payment-request', label: 'Payment request (Monzo)' },
  { id: 'payment-receipt', label: 'Payment received receipt' },
  { id: 'portal-access', label: 'Portal access link' },
  { id: 'trip-step-update', label: 'Trip tracker step update' },
  { id: 'invoice-receipt', label: 'Invoice / receipt' }
]

export function listGsolCatalogEmails() {
  return GSOL_EMAIL_CATALOG.map((item) => {
    const built = buildGsolCatalogEmail(item.id)
    return {
      id: item.id,
      label: item.label,
      subject: built.subject,
      preheader: built.preheader
    }
  })
}
