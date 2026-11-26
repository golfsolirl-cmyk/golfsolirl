/**
 * Shared default subject/body for admin service offer emails (client + server).
 */

export const enquiryTransferUpsellFirstName = (fullName) => {
  const s = String(fullName ?? '').trim()
  if (!s) {
    return 'there'
  }
  return s.split(/\s+/)[0] || 'there'
}

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

export const defaultServiceOfferSubject = (service, referenceId) => {
  const ref = String(referenceId ?? '').trim() || 'your Costa del Sol trip'
  if (service === 'accommodation') return `Accommodation options — ${ref}`
  if (service === 'golf_courses') return `Golf course options — ${ref}`
  return defaultTransferUpsellSubject(referenceId)
}

export const defaultServiceOfferBodyPlain = ({ service, first, referenceId, portalUrl }) => {
  if (service === 'accommodation') {
    const ref = String(referenceId ?? '').trim()
    return [
      `Hello ${first},`,
      '',
      'Would you like us to add accommodation to your Costa del Sol golf trip?',
      '',
      'We shortlist Value, Classic and Premium hotels near your courses — clear options, plain English, Irish-owned support.',
      '',
      ref ? `Your reference is ${ref}.` : '',
      '',
      'Reply to this email or open your trip desk:',
      portalUrl,
      '',
      'Best regards,',
      'Golf Sol Ireland'
    ]
      .filter((line) => line !== '')
      .join('\n')
  }
  if (service === 'golf_courses') {
    const ref = String(referenceId ?? '').trim()
    return [
      `Hello ${first},`,
      '',
      'Would you like us to add golf courses / tee times to your trip?',
      '',
      'We shortlist Costa del Sol courses that match your group and base — then line up practical tee windows.',
      '',
      ref ? `Your reference is ${ref}.` : '',
      '',
      'Reply to this email or open your trip desk:',
      portalUrl,
      '',
      'Best regards,',
      'Golf Sol Ireland'
    ]
      .filter((line) => line !== '')
      .join('\n')
  }
  return defaultTransferUpsellBodyPlain({ first, referenceId, portalUrl })
}
