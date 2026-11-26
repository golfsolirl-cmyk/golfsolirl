/**
 * Enquiry confirmation (customer) and owner notification — lean TOW-style shell.
 */
import {
  buildLeanTransactionalEmailHtml,
  escapeHtml,
  finalizeGsolEmailHtml,
  getGsolSiteUrl,
  leanEmailButtonHtml
} from './email-layout.mjs'

/**
 * @param {Record<string, unknown>} payload
 * @param {'customer' | 'admin'} [variant]
 */
export function buildBrandedEnquiryEmailHtml(payload, variant = 'customer') {
  const isAdmin = variant === 'admin'
  const enquiryId = String(payload.enquiryId ?? '').trim()
  const fullName = String(payload.fullName ?? '').trim()
  const email = String(payload.email ?? '').trim()
  const first = fullName.split(/\s+/)[0] || 'there'
  const site = getGsolSiteUrl().replace(/\/+$/, '')
  const portalPrivateHref =
    !isAdmin && typeof payload.portalPrivateUrl === 'string' && payload.portalPrivateUrl.trim()
      ? payload.portalPrivateUrl.trim()
      : ''
  const portalLoginHref = `${site}/portal?next=${encodeURIComponent(`/dashboard?enquiry_ref=${enquiryId}`)}`
  const portalCtaHref = portalPrivateHref || portalLoginHref

  const rows = /** @type {[string, string][]} */ (
    [
      ['Full name', fullName],
      ['Email', email],
      ['Phone / WhatsApp', String(payload.phoneWhatsApp ?? '')],
      ['Best time to call', String(payload.bestTimeToCall ?? '')],
      ['Reference', enquiryId],
      ['Submitted', String(payload.enquiryDate ?? '')],
      ['Trip interest', String(payload.interest ?? '')]
    ].filter(([, v]) => String(v).trim())
  )

  if (isAdmin) {
    const mailto = email
      ? `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`Your Golf Sol Ireland enquiry (${enquiryId})`)}`
      : `${site}/admin`
    const html = buildLeanTransactionalEmailHtml({
      documentTitle: `New enquiry — ${fullName}`,
      preheader: `New enquiry ${enquiryId} from ${fullName}.`,
      kicker: `New enquiry · ${enquiryId}`,
      title: fullName || 'New website enquiry',
      lead: 'A guest submitted a trip brief on golfsolirl.com. Reply to continue the conversation.',
      rows,
      bodyHtml: leanEmailButtonHtml({ href: mailto, label: `Reply to ${first}` }),
      footerHtml: `Admin alert · ref ${escapeHtml(enquiryId)}. All payments handled in Ireland.`
    })
    return finalizeGsolEmailHtml(html)
  }

  const payment = payload.payment && typeof payload.payment === 'object' ? payload.payment : null
  const html = buildLeanTransactionalEmailHtml({
    documentTitle: `Enquiry confirmation (${enquiryId})`,
    preheader: `We received your Costa del Sol trip details (${enquiryId}).`,
    kicker: `Enquiry received · ${enquiryId}`,
    title: `Thanks, ${first} — we've got your enquiry.`,
    lead: 'We will review your dates and group shape, then reply from Ireland with clear next steps. Nothing is booked or charged yet.',
    rows,
    payment,
    cta: { href: portalCtaHref, label: 'Open your trip desk' },
    footerHtml: `You're getting this because you sent an enquiry to Golf Sol Ireland (ref ${escapeHtml(enquiryId)}). All payments handled in Ireland · WhatsApp via golfsolirl.com`
  })
  return finalizeGsolEmailHtml(html)
}
