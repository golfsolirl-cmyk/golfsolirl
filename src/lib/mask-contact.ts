/** Keep the start of the mailbox and the domain. Hide the rest. */
export const maskEmail = (raw: string): string => {
  const email = raw.trim()
  const at = email.lastIndexOf('@')
  if (at <= 0 || at === email.length - 1) {
    return '****'
  }
  const local = email.slice(0, at)
  const domain = email.slice(at + 1)
  const keep = local.length <= 2 ? 1 : 2
  return `${local.slice(0, keep)}****@${domain}`
}

/** Keep a short prefix and the last two digits. Hide the middle. */
export const maskPhone = (raw: string): string => {
  const trimmed = raw.trim()
  const digits = trimmed.replace(/\D/g, '')
  if (digits.length < 4) {
    return '****'
  }
  const prefix = trimmed.startsWith('+') ? `+${digits.slice(0, Math.min(3, digits.length - 2))}` : digits.slice(0, 3)
  const suffix = digits.slice(-2)
  return `${prefix} **** ${suffix}`
}
