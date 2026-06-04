/** Payload encoded in client trip-pass barcodes (CODE128). */
export type TransferPassPaymentLevel = 'deposit' | 'paid'

export type ParsedTransferPaymentPass = {
  bookingId: string
  paymentLevel: TransferPassPaymentLevel
}

const PASS_PREFIX = 'GSOLPAY'

export const encodeTransferPaymentPass = (bookingId: string, paymentLevel: TransferPassPaymentLevel) => {
  const id = bookingId.trim()
  const code = paymentLevel === 'paid' ? 'PAID' : 'DEP'
  return `${PASS_PREFIX}|${id}|${code}`
}

export const parseTransferPaymentPass = (raw: string): ParsedTransferPaymentPass | null => {
  const normalized = raw.trim()
  const parts = normalized.split('|')
  if (parts.length !== 3 || parts[0] !== PASS_PREFIX) {
    return null
  }
  const bookingId = parts[1]?.trim()
  const levelRaw = parts[2]?.trim().toUpperCase()
  if (!bookingId || !/^[0-9a-f-]{36}$/i.test(bookingId)) {
    return null
  }
  if (levelRaw === 'PAID') {
    return { bookingId, paymentLevel: 'paid' }
  }
  if (levelRaw === 'DEP') {
    return { bookingId, paymentLevel: 'deposit' }
  }
  return null
}

/** Trip pass barcode is issued only after the transfer is paid in full (not on deposit alone). */
export const transferPassIsScannable = (paymentStatus: string | null | undefined) => {
  const pay = String(paymentStatus ?? 'unpaid').toLowerCase()
  return pay === 'paid'
}

export const transferPassPaymentLevelFromStatus = (
  paymentStatus: string | null | undefined
): TransferPassPaymentLevel | null => {
  const pay = String(paymentStatus ?? 'unpaid').toLowerCase()
  if (pay === 'paid') {
    return 'paid'
  }
  if (pay === 'deposit') {
    return 'deposit'
  }
  return null
}

export const formatTransferPassHumanId = (enquiryReferenceId: string | null | undefined, bookingId: string) => {
  const ref = (enquiryReferenceId ?? '').trim()
  if (ref) {
    return ref
  }
  return bookingId.slice(0, 8).toUpperCase()
}
