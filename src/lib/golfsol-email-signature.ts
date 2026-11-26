import { GOLFSOL_BRAND_LOGO_HOSTED } from './brand-logo-assets'
import { GSOL_BUSINESS } from './business-details'

const SITE = GSOL_BUSINESS.websiteUrl
const PHONE = GSOL_BUSINESS.irishPhoneDisplay
const EMAIL = GSOL_BUSINESS.email
const WA = GSOL_BUSINESS.whatsappHref

/** Hosted crest URL for Gmail signatures. */
export const SIGNATURE_LOGO_URL = GOLFSOL_BRAND_LOGO_HOSTED

export type SignatureVariant = 'full' | 'compact'

export function fullSignatureHtml(): string {
  return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.45;color:#0b3b2c">
  <tr>
    <td style="padding-right:14px;vertical-align:top">
      <img src="${SIGNATURE_LOGO_URL}" alt="Golf Sol Ireland" width="72" height="72" style="display:block;border:0;border-radius:50%" />
    </td>
    <td style="vertical-align:top">
      <div style="font-size:16px;font-weight:700;color:#0b3b2c">Golf Sol Ireland</div>
      <div style="color:#136047;font-weight:600">Costa del Sol golf trips</div>
      <div style="margin-top:6px">
        <a href="mailto:${EMAIL}" style="color:#0b3b2c;text-decoration:none">${EMAIL}</a><br/>
        <a href="tel:${PHONE.replace(/\s/g, '')}" style="color:#0b3b2c;text-decoration:none">${PHONE}</a>
        · <a href="${WA}" style="color:#128C7E;text-decoration:none;font-weight:600">WhatsApp</a><br/>
        <a href="${SITE}" style="color:#136047;text-decoration:underline">${SITE.replace('https://', '')}</a>
      </div>
      <div style="margin-top:8px;font-size:12px;color:#5a6b62">Private transfers · golf · accommodation — Irish team</div>
    </td>
  </tr>
</table>`
}

export function compactSignatureHtml(): string {
  return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;color:#0b3b2c">
  <tr>
    <td style="padding-right:10px;vertical-align:middle">
      <img src="${SIGNATURE_LOGO_URL}" alt="Golf Sol Ireland" width="48" height="48" style="display:block;border:0;border-radius:50%" />
    </td>
    <td style="vertical-align:middle">
      <strong>Golf Sol Ireland</strong><br/>
      <a href="mailto:${EMAIL}" style="color:#0b3b2c;text-decoration:none">${EMAIL}</a>
      · <a href="tel:${PHONE.replace(/\s/g, '')}" style="color:#0b3b2c;text-decoration:none">${PHONE}</a>
      · <a href="${WA}" style="color:#128C7E;text-decoration:none">WhatsApp</a>
      · <a href="${SITE}" style="color:#136047">${SITE.replace('https://', '')}</a>
    </td>
  </tr>
</table>`
}

export function signaturePlain(variant: SignatureVariant): string {
  if (variant === 'compact') {
    return `Golf Sol Ireland\n${EMAIL} · ${PHONE} · WhatsApp · ${SITE}`
  }
  return `Golf Sol Ireland\nCosta del Sol golf trips\n${EMAIL}\n${PHONE}\nWhatsApp\n${SITE}\nPrivate transfers · golf · accommodation — Irish team`
}

export const GMAIL_SIGNATURE_STEPS = [
  'Open Gmail on a computer.',
  'Click Settings (gear) → See all settings.',
  'Open the General tab and scroll to Signature.',
  'Create a new signature (or edit the existing one), then paste with Ctrl+V / Cmd+V.',
  'Save Changes at the bottom of the page.'
] as const
