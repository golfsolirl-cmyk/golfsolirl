/** Format an IBAN as groups of 4 characters (display only). */
export function formatIbanGroupsOf4(raw: string): string {
  const compact = String(raw ?? '')
    .replace(/\s+/g, '')
    .toUpperCase()
  if (!compact) return ''
  return compact.replace(/(.{4})/g, '$1 ').trim()
}
