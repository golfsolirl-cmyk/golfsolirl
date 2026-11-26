import { ENQUIRY_STRUCTURED_FIELD_KEYS } from './enquiry-form-registry'

/** Public terms page linked from every enquiry / booking form checkbox. */
export const TERMS_AND_CONDITIONS_PATH = '/terms-and-conditions'
export const PRIVACY_POLICY_PATH = '/privacy-policy'

export const TERMS_ACCEPTANCE_ERROR =
  'Please tick the box to confirm you agree to our terms and conditions.'

/**
 * Merged into `formPayload.fields` when the client accepts terms at submit time.
 * Also records GDPR privacy-notice acknowledgment (no schema migration — lives in JSONB).
 */
export function termsAcceptanceFormFields(): Record<string, string> {
  const at = new Date().toISOString()
  return {
    [ENQUIRY_STRUCTURED_FIELD_KEYS.termsAccepted]: 'yes',
    [ENQUIRY_STRUCTURED_FIELD_KEYS.termsAcceptedAt]: at,
    [ENQUIRY_STRUCTURED_FIELD_KEYS.gdprNoticeAcknowledgedAt]: at,
    'Terms accepted': 'yes',
    'Privacy notice acknowledged': 'yes'
  }
}

/** For forms without a terms tick (e.g. callback) — privacy notice acknowledgment only. */
export function gdprNoticeAcknowledgementFields(): Record<string, string> {
  const at = new Date().toISOString()
  return {
    [ENQUIRY_STRUCTURED_FIELD_KEYS.gdprNoticeAcknowledgedAt]: at,
    'Privacy notice acknowledged': 'yes'
  }
}
