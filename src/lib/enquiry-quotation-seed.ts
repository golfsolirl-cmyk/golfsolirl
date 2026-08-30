import { ENQUIRY_STRUCTURED_FIELD_KEYS } from './enquiry-form-registry'
import { parseClientEnquiryFormPayload } from './client-data-card'
import { formatWebsiteFormFieldValueForDisplay } from './package-build'

export function quotationSeedFromEnquiry(row: {
  form_payload?: unknown
  interest?: string | null
}): { travelDates: string; numberOfGuests: string; destination: string } {
  const { fields } = parseClientEnquiryFormPayload(row.form_payload)
  const fromRaw = String(fields[ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateFrom] ?? '').trim()
  const toRaw = String(fields[ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateTo] ?? '').trim()
  const from = fromRaw ? formatWebsiteFormFieldValueForDisplay(ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateFrom, fromRaw) : ''
  const to = toRaw ? formatWebsiteFormFieldValueForDisplay(ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateTo, toRaw) : ''
  const pax = String(fields[ENQUIRY_STRUCTURED_FIELD_KEYS.pax] ?? fields.golfers ?? fields.numberOfGolfers ?? '').trim()
  const travelDates = from && to ? `${from} - ${to}` : from || to
  return {
    travelDates,
    numberOfGuests: pax,
    destination: String(row.interest ?? '').trim()
  }
}
