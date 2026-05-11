/**
 * Normalize customer phone / WhatsApp strings for deduplication (IE +34 focus).
 * Returns a stable key stored in `phone_e164` on enquiries and profiles.
 *
 * @param {string} raw
 * @returns {string | null} Canonical key, or null if too ambiguous to dedupe safely.
 */
export const computePhoneUniquenessKey = (raw) => {
  const trimmed = typeof raw === 'string' ? raw.trim() : ''
  if (!trimmed) {
    return null
  }

  const digits = trimmed.replace(/[^\d]/g, '')
  if (digits.length < 9) {
    return null
  }

  if (digits.startsWith('353') && digits.length >= 11) {
    return `+${digits}`
  }
  if (digits.startsWith('34') && digits.length >= 11) {
    return `+${digits}`
  }
  if (digits.startsWith('44') && digits.length >= 10) {
    return `+${digits}`
  }

  // Irish national: 0 + area/mobile (drop leading 0 → +353)
  if (digits.startsWith('0') && digits.length >= 10 && digits.length <= 11) {
    return `+353${digits.slice(1)}`
  }

  // Spanish mobile without country code (9 digits, 6–7…)
  if (digits.length === 9 && /^[67]\d{8}$/.test(digits)) {
    return `+34${digits}`
  }

  // Irish mobile sometimes typed without leading 0 (8xxxxxxxx)
  if (digits.length === 9 && /^8[2379]\d{7}$/.test(digits)) {
    return `+353${digits}`
  }

  // Long digit blob that already looks international without +
  if (digits.length >= 11 && digits.length <= 15) {
    return `+${digits}`
  }

  return null
}
