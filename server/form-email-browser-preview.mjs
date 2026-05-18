import { formatDocumentDate } from '../shared/document-templates.mjs'
import { buildBrandedEnquiryEmailHtml } from './branded-enquiry-email.mjs'
import { buildBrandedPostEnquiryPortalInviteHtml } from './branded-post-enquiry-portal-invite-email.mjs'
import { buildFormAutoresponseEmailHtml, buildSignInEmailHtml } from './branded-autoresponse-email.mjs'
import { adaptTransactionalEmailHtmlForBrowserPreview, finalizeGsolEmailHtml, getGsolSiteUrl } from './email-layout.mjs'
import { getTermsEmailHtmlSampleForPreview } from './enquiry-service.mjs'

const sampleEnquiryPayload = () => ({
  fullName: 'Aoife Murphy',
  email: 'aoife.murphy@example.com',
  phoneWhatsApp: '+353 87 123 4567',
  bestTimeToCall: 'Weekday mornings',
  enquiryId: 'GSI-SAMPLE-001',
  enquiryDate: formatDocumentDate(),
  interest: '5-night trip, 3 rounds, private transfers from Malaga.'
})

/**
 * HTML for public form-related Resend templates (fixed sample data).
 * @param {string} kind — `enquiry-customer` | `enquiry-admin` | `terms` | `portal-invite`
 * @param {string} [requestOrigin] — current site origin for asset URLs and link previews
 */
export const getFormEmailPreviewHtml = (kind, requestOrigin = '') => {
  const origin = (requestOrigin || '').replace(/\/+$/, '') || getGsolSiteUrl()
  const p = sampleEnquiryPayload()

  let html
  switch (kind) {
    case 'enquiry-customer':
      html = buildBrandedEnquiryEmailHtml(p, 'customer')
      break
    case 'enquiry-admin':
      html = buildBrandedEnquiryEmailHtml(p, 'admin')
      break
    case 'terms':
      html = getTermsEmailHtmlSampleForPreview()
      break
    case 'portal-invite':
      html = buildBrandedPostEnquiryPortalInviteHtml({
        fullName: p.fullName,
        email: p.email,
        enquiryId: p.enquiryId,
        enquiryDate: p.enquiryDate,
        actionLink: `${origin}/dashboard/login?next=${encodeURIComponent(`/dashboard?enquiry_ref=${p.enquiryId}`)}`,
        sentAtDisplay: p.enquiryDate
      })
      break
    case 'form-autoresponse':
      html = finalizeGsolEmailHtml(
        buildFormAutoresponseEmailHtml({
          fullName: p.fullName,
          email: p.email,
          enquiryId: p.enquiryId,
          interest: p.interest
        })
      )
      break
    case 'sign-in':
      html = finalizeGsolEmailHtml(
        buildSignInEmailHtml({
          fullName: p.fullName,
          email: p.email,
          magicLink: `${origin}/dashboard/login?token=sample-magic-link-token-preview`,
          enquiryId: p.enquiryId
        })
      )
      break
    default:
      throw new Error(`Unknown email preview kind: ${kind}`)
  }

  return adaptTransactionalEmailHtmlForBrowserPreview(html, origin)
}
