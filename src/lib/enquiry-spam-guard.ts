/**
 * Client helpers for invisible enquiry spam protection (reCAPTCHA v3).
 * Pair with server/enquiry-spam-guard.mjs.
 */

export type EnquirySpamGuardPayload = {
  honeypot: string
  formOpenedAt: number
  recaptchaToken?: string
  recaptchaAction?: string
}

/** Stable reCAPTCHA v3 action names per public form. */
export const RECAPTCHA_ACTIONS = {
  tripQuote: 'trip_quote',
  contentEnquiry: 'content_enquiry',
  bundleQuote: 'bundle_quote',
  malagaTransfer: 'malaga_transfer',
  transportEnquiry: 'transport_enquiry'
} as const

export type RecaptchaAction = (typeof RECAPTCHA_ACTIONS)[keyof typeof RECAPTCHA_ACTIONS]

export const ENQUIRY_HONEYPOT_NAME = 'companyWebsite'

/** Vite-exposed site key — empty means captcha is skipped client-side. */
export function readRecaptchaSiteKey(): string {
  try {
    return String(import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? '').trim()
  } catch {
    return ''
  }
}

export function buildSpamGuardPayload(args: {
  honeypot: string
  formOpenedAt: number
  recaptchaToken?: string | null
  recaptchaAction?: string | null
}): EnquirySpamGuardPayload {
  return {
    honeypot: args.honeypot,
    formOpenedAt: args.formOpenedAt,
    ...(args.recaptchaToken ? { recaptchaToken: args.recaptchaToken } : {}),
    ...(args.recaptchaAction ? { recaptchaAction: args.recaptchaAction } : {})
  }
}
