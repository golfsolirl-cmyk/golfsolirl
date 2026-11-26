/**
 * Shared default subject/body for admin transfer upsell emails (client + server).
 * @param {(path?: string) => string} siteUrl
 */
export const defaultTransferUpsellSubject = (referenceId) =>
  `Airport & hotel transfers — ${String(referenceId ?? '').trim() || 'your Costa del Sol trip'}`

export const defaultTransferUpsellBodyPlain = ({ first, referenceId, portalUrl }) => {
  const ref = String(referenceId ?? '').trim()
  return [
    `Hello ${first},`,
    '',
    'Many guests add private airport and hotel transfers so their Costa del Sol golf trip runs smoothly from landing at Málaga (AGP).',
    '',
    'We handle Málaga Airport ↔ hotel ↔ golf course with one Irish-owned team — meet-and-greet, luggage space for golf bags, and timing that fits your tee sheet.',
    '',
    ref ? `Your reference is ${ref}.` : '',
    '',
    'If you would like a transfer quote added to your trip, reply to this email or open your trip desk:',
    portalUrl,
    '',
    'Best regards,',
    'Golf Sol Ireland'
  ]
    .filter((line) => line !== '')
    .join('\n')
}

export const enquiryTransferUpsellFirstName = (fullName) => {
  const s = String(fullName ?? '').trim()
  if (!s) {
    return 'there'
  }
  return s.split(/\s+/)[0] || 'there'
}