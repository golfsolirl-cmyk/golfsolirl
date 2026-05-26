import { ENQUIRY_STRUCTURED_FIELD_KEYS } from './enquiry-form-registry'

/** Public terms page linked from every enquiry / booking form checkbox. */
export const TERMS_AND_CONDITIONS_PATH = '/terms-and-conditions'

export const TERMS_ACCEPTANCE_ERROR =
  'Please tick the box to confirm you agree to our terms and conditions.'

/** Merged into `formPayload.fields` when the client accepts terms at submit time. */
export function termsAcceptanceFormFields(): Record<string, string> {
  return {
    [ENQUIRY_STRUCTURED_FIELD_KEYS.termsAccepted]: 'yes',
    [ENQUIRY_STRUCTURED_FIELD_KEYS.termsAcceptedAt]: new Date().toISOString(),
    'Terms accepted': 'yes'
  }
}
