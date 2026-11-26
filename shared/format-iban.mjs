/**
 * Format an IBAN as groups of 4 characters (display only).
 * @param {string} raw
 * @returns {string}
 */
export const formatIbanGroupsOf4 = (raw) => {
  const compact = String(raw ?? '')
    .replace(/\s+/g, '')
    .toUpperCase()
  if (!compact) return ''
  return compact.replace(/(.{4})/g, '$1 ').trim()
}
