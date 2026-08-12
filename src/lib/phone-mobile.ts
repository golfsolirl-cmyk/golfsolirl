/**
 * Client-side mobile validation aligned with server/phone-e164.mjs
 * (Ireland / UK / Spain mobiles for Golf Sol forms).
 */

const digitsOnly = (raw: string) => raw.replace(/[^\d]/g, '')

export const computePhoneUniquenessKeyClient = (raw: string): string | null => {
  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }
  const digits = digitsOnly(trimmed)
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
  if (digits.startsWith('0') && digits.length >= 10 && digits.length <= 11) {
    return `+353${digits.slice(1)}`
  }
  if (digits.length === 9 && /^[67]\d{8}$/.test(digits)) {
    return `+34${digits}`
  }
  if (digits.length === 9 && /^8[2379]\d{7}$/.test(digits)) {
    return `+353${digits}`
  }
  if (digits.length >= 11 && digits.length <= 15) {
    return `+${digits}`
  }
  return null
}

export const isLikelyMobileE164 = (e164: string | null | undefined): boolean => {
  if (typeof e164 !== 'string' || !e164.startsWith('+')) {
    return false
  }
  if (/^\+3538[2379]\d{7}$/.test(e164)) {
    return true
  }
  if (/^\+447\d{9}$/.test(e164)) {
    return true
  }
  if (/^\+34[67]\d{8}$/.test(e164)) {
    return true
  }
  return false
}

export const validateMobilePhoneInput = (
  raw: string
): { ok: true; phoneE164: string } | { ok: false; message: string } => {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { ok: false, message: 'Please enter a valid mobile number (Ireland, UK, or Spain).' }
  }
  const phoneE164 = computePhoneUniquenessKeyClient(trimmed)
  if (!phoneE164 || !isLikelyMobileE164(phoneE164)) {
    return {
      ok: false,
      message:
        'Enter a valid mobile number (e.g. 087… Ireland, 07… UK, or +34 6… Spain). Landlines are not accepted.'
    }
  }
  return { ok: true, phoneE164 }
}
