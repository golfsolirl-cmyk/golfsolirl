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
  // +44 (0) 7… — trunk zero included after country code
  if (/^4407\d{9}$/.test(digits)) {
    return `+44${digits.slice(3)}`
  }
  if (digits.startsWith('44') && digits.length >= 10) {
    return `+${digits}`
  }

  // UK / Northern Ireland national mobile: 07xxxxxxxxx (11 digits).
  // Must run before the Irish "leading 0 → +353" rule or 07… becomes +3537… and fails mobile checks.
  if (/^07\d{9}$/.test(digits)) {
    return `+44${digits.slice(1)}`
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

/**
 * True when the uniqueness key looks like a mobile (IE / UK / ES focus for Golf Sol).
 * Landlines and unrecognised national formats return false.
 *
 * @param {string | null | undefined} e164
 * @returns {boolean}
 */
export const isLikelyMobileE164 = (e164) => {
  if (typeof e164 !== 'string' || !e164.startsWith('+')) {
    return false
  }
  // Ireland mobile: +353 8[2379]xxxxxxx
  if (/^\+3538[2379]\d{7}$/.test(e164)) {
    return true
  }
  // UK mobile: +44 7xxxxxxxxx
  if (/^\+447\d{9}$/.test(e164)) {
    return true
  }
  // Spain mobile: +34 6/7xxxxxxxx
  if (/^\+34[67]\d{8}$/.test(e164)) {
    return true
  }
  return false
}

/**
 * Normalize + validate a mobile for website forms. Throws nothing — returns result object.
 *
 * @param {string} raw
 * @returns {{ ok: true, phoneE164: string } | { ok: false, message: string }}
 */
export const validateMobilePhoneInput = (raw) => {
  const trimmed = typeof raw === 'string' ? raw.trim() : ''
  if (!trimmed) {
    return { ok: false, message: 'Please enter a valid mobile number (Ireland, UK, or Spain).' }
  }
  const phoneE164 = computePhoneUniquenessKey(trimmed)
  if (!phoneE164 || !isLikelyMobileE164(phoneE164)) {
    return {
      ok: false,
      message:
        'Enter a valid mobile number with country code or national format (e.g. 087… for Ireland, 07… for UK, or +34 6… for Spain). Landlines are not accepted.'
    }
  }
  return { ok: true, phoneE164 }
}
