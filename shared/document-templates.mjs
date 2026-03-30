const proposalPlaceholder = '________________________'
const proposalPricePlaceholder = '________________'

const sanitizeText = (value, fallback = proposalPlaceholder) => {
  if (typeof value !== 'string') {
    return fallback
  }

  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return fallback
  }

  return normalizedValue
}

const sanitizeNumber = (value, fallback) => {
  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) {
    return fallback
  }

  return numericValue
}

export const formatDocumentDate = () =>
  new Intl.DateTimeFormat('en-IE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date())

export const createProposalId = () => `GSI-PROP-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

export const createEnquiryReferenceId = () => `GSI-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`

export const parseNumberParam = (value, fallback) => {
  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) {
    return fallback
  }

  return numericValue
}

const resolveProposalVariant = (payload = {}) => {
  const raw = payload.variant ?? payload.proposalVariant

  if (typeof raw !== 'string') {
    return 'public'
  }

  const normalized = raw.trim().toLowerCase()

  if (normalized === 'admin' || normalized === 'internal') {
    return 'admin'
  }

  return 'public'
}

export const normalizeProposalPayload = (payload = {}) => {
  const groupSize = sanitizeNumber(payload.groupSize, 4)
  const nights = sanitizeNumber(payload.nights, 4)
  const rounds = sanitizeNumber(payload.rounds, 3)

  return {
    packageName: sanitizeText(payload.packageName ?? payload.package),
    stayName: sanitizeText(payload.stayName),
    transferName: sanitizeText(payload.transferName),
    proposalDate: sanitizeText(payload.proposalDate ?? payload.preparedDate, formatDocumentDate()),
    proposalId: sanitizeText(payload.proposalId, createProposalId()),
    perPersonPrice: sanitizeText(payload.perPersonPrice, proposalPricePlaceholder),
    groupTotal: sanitizeText(payload.groupTotal, proposalPricePlaceholder),
    depositAmount: sanitizeText(payload.depositAmount, proposalPricePlaceholder),
    remainingBalance: sanitizeText(payload.remainingBalance, proposalPricePlaceholder),
    groupSize,
    nights,
    rounds
  }
}

export const normalizeEnquiryPayload = (payload = {}) => ({
  fullName: sanitizeText(payload.fullName),
  email: sanitizeText(payload.email),
  interest: sanitizeText(payload.interest),
  phoneWhatsApp: sanitizeText(payload.phoneWhatsApp),
  bestTimeToCall: sanitizeText(payload.bestTimeToCall),
  enquiryDate: sanitizeText(payload.enquiryDate, formatDocumentDate()),
  enquiryId: sanitizeText(payload.enquiryId, createEnquiryReferenceId())
})

export const buildProposalDocument = (rawPayload = {}) => {
  const variant = resolveProposalVariant(rawPayload)
  const proposal = normalizeProposalPayload(rawPayload)

  const heroPublic = {
    kicker: 'Costa del Sol Proposal',
    title: 'Your Costa del Sol golf proposal',
    description:
      'Everything in one place: how we have shaped your trip, what is included, indicative pricing, and practical next steps — prepared by Golf Sol Ireland for your group.'
  }

  const heroAdmin = {
    kicker: 'Costa del Sol Proposal',
    title: 'Premium trip proposal ready to tailor, confirm, and send',
    description:
      'A branded Golf Sol Ireland proposal document designed to turn a selected package into a cleaner, more professional client-facing trip outline.'
  }

  const clientMessageBody =
    'Hi ________________________, attached is your Golf Sol Ireland proposal for the Costa del Sol trip. Have a look through the package outline, pricing, and notes, and let us know what you would like adjusted.'

  const metaCard = [`Proposal ID: ${proposal.proposalId}`, `Prepared date: ${proposal.proposalDate}`]

  return {
    meta: proposal,
    hero: { ...(variant === 'admin' ? heroAdmin : heroPublic), metaCard },
    infoCards: [
      {
        icon: 'users',
        title: 'Trip overview',
        items: [
          `Package style: ${proposal.packageName}`,
          `Stay level: ${proposal.stayName}`,
          `Transfer style: ${proposal.transferName}`,
          `Group size: ${proposal.groupSize} golfer${proposal.groupSize > 1 ? 's' : ''}`
        ]
      },
      {
        icon: 'calendar',
        title: 'Trip shape',
        items: [
          `Trip shape: ${proposal.nights} nights / ${proposal.rounds} rounds`,
          'Travel dates: ________________________',
          'Departure airport / route: ________________________',
          'Lead traveller / contact: ________________________'
        ]
      },
      {
        icon: 'map',
        title: 'Proposal details',
        items: [
          'Hotel name / area: ________________________',
          'Course list: ________________________',
          'Resort area: ________________________',
          'Special requests: ________________________'
        ]
      },
      {
        icon: 'bus',
        title: 'Logistics and inclusions',
        items: [
          'Airport transfers: ________________________',
          'Golf-day transport: ________________________',
          'Board basis: ________________________',
          'Upgrade notes: ________________________'
        ]
      }
    ],
    summary: {
      kicker: 'Proposal pricing',
      title: 'Indicative pricing summary for the selected trip',
      aside: 'Indicative unless confirmed in writing',
      topTiles: [
        { label: 'Estimated per person', value: proposal.perPersonPrice },
        { label: 'Estimated group total', value: proposal.groupTotal },
        { label: '20% deposit upfront', value: proposal.depositAmount },
        { label: 'Remaining balance', value: proposal.remainingBalance }
      ],
      bottomTiles: [
        { label: 'Proposal ID', value: proposal.proposalId },
        { label: 'Prepared date', value: proposal.proposalDate },
        { label: 'Group size', value: `${proposal.groupSize} golfer${proposal.groupSize > 1 ? 's' : ''}` },
        { label: 'Trip shape', value: `${proposal.nights} nights / ${proposal.rounds} rounds` }
      ],
      notesTitle: 'Proposal pricing notes',
      noteLines: ['Golf courses included', 'Green fee notes', 'Hotel inclusions', 'Upgrade options']
    },
    lower: {
      left: {
        kicker: 'What is included',
        items: [
          'Accommodation as outlined in the proposal',
          'Golf rounds confirmed in the itinerary',
          'Transfer support as selected',
          'Golf Sol Ireland planning and coordination'
        ],
        noteLines: ['Special requests', 'Tee-time preferences', 'Evening / dining notes']
      },
      right: {
        kicker: 'Terms and next steps',
        paragraphs: [
          '20% deposit upfront, with the remaining 80% due within 14 days of booking.',
          'T&Cs apply and deposits are non-refundable unless otherwise agreed in writing.',
          'Flights are not included unless specifically stated in the final proposal.',
          'Final availability and pricing are subject to hotel and golf confirmation on the requested dates.'
        ],
        signoffTitle: 'Internal sign-off',
        signoffLines: ['Prepared by', 'Approved by', 'Date sent to client']
      }
    },
    messageBlock:
      variant === 'admin'
        ? {
            title: 'Client message block',
            body: clientMessageBody
          }
        : null,
    disclaimer: {
      title: 'Important disclaimer',
      paragraphs: [
        'This document is a proposal only and is provided for indicative planning and quotation purposes.',
        'It is not a paid invoice, not a receipt, not a booking confirmation, and not a legally binding travel contract unless and until Golf Sol Ireland confirms the booking in writing.',
        'All pricing, availability, hotels, courses, and transfer details remain subject to change until final confirmation, deposit receipt, and formal acceptance of the applicable terms and conditions.'
      ]
    }
  }
}

export const buildEnquiryDocument = (rawPayload = {}) => {
  const enquiry = normalizeEnquiryPayload(rawPayload)

  return {
    meta: enquiry,
    hero: {
      kicker: 'General enquiry',
      title: 'Premium enquiry sheet ready to review, qualify, and follow up',
      description:
        'A branded Golf Sol Ireland enquiry document built in the same premium layout family as the proposal template, focused on contact details and enquiry capture.',
      metaCard: [`Enquiry ID: ${enquiry.enquiryId}`, `Enquiry date: ${enquiry.enquiryDate}`]
    },
    infoCards: [
      {
        icon: 'users',
        title: 'Enquiry overview',
        items: [
          `Full name: ${enquiry.fullName}`,
          `Email address: ${enquiry.email}`,
          `Enquiry ID: ${enquiry.enquiryId}`,
          `Enquiry date: ${enquiry.enquiryDate}`
        ]
      },
      {
        icon: 'calendar',
        title: 'Enquiry details',
        items: [
          `Trip interest: ${enquiry.interest}`,
          'Preferred travel dates: ________________________',
          `Phone / WhatsApp: ${enquiry.phoneWhatsApp}`,
          'Trip shape noted: ________________________'
        ]
      },
      {
        icon: 'map',
        title: 'Proposal details',
        items: [
          'Departure airport / route: ________________________',
          'Preferred hotel level / area: ________________________',
          'Budget expectation: ________________________',
          'Special requests: ________________________'
        ]
      },
      {
        icon: 'bus',
        title: 'Logistics and follow-up',
        items: [
          'Preferred contact method: Email + Phone / WhatsApp',
          `Best time to contact: ${enquiry.bestTimeToCall}`,
          'First follow-up owner: ________________________',
          'Status / next step: ________________________'
        ]
      }
    ],
    summary: {
      kicker: 'Contact details',
      title: 'How we can reach you for this enquiry',
      aside: 'Reference and primary contact only — trip detail sits in the sections above',
      topTiles: [
        { label: 'Full name', value: enquiry.fullName },
        { label: 'Email', value: enquiry.email },
        { label: 'Enquiry ID', value: enquiry.enquiryId },
        { label: 'Enquiry date', value: enquiry.enquiryDate }
      ],
      bottomTiles: [
        { label: 'Phone / WhatsApp', value: enquiry.phoneWhatsApp },
        { label: 'Preferred contact', value: 'Email + Phone / WhatsApp' },
        { label: 'Best time to call', value: enquiry.bestTimeToCall },
        { label: 'Company / group', value: '________________________' }
      ],
      notesTitle: 'Extra contact notes',
      noteLines: ['Alternate email', 'Secondary mobile', 'Accessibility / comms preferences', 'Who else to copy in']
    },
    lower: {
      left: {
        kicker: 'What is included',
        items: [
          'Lead contact details captured cleanly',
          'Trip interest recorded for review',
          'Reference ID and enquiry date logged',
          'Useful as a branded first-response attachment'
        ],
        noteLines: ['Notes from first call', 'Budget guidance', 'Next action']
      },
      right: {
        kicker: 'Terms and next steps',
        paragraphs: [
          'This document captures your enquiry in a clean branded format before a formal trip proposal is prepared.',
          'We use it to review your contact details, travel preferences, and the practical next step for your trip.',
          'A full proposal, pricing, and booking terms are only issued once availability has been checked and confirmed.'
        ],
        signoffTitle: 'Internal sign-off',
        signoffLines: ['Prepared by', 'First follow-up completed by', 'Date reviewed']
      }
    },
    messageBlock: {
      title: 'Client message block',
      body: `Hi ${enquiry.fullName}, thanks for getting in touch with Golf Sol Ireland. We have attached your enquiry sheet so the submitted details stay clean while we review the right next step for your trip.`
    },
    disclaimer: {
      title: 'Important disclaimer',
      paragraphs: [
        'Golf Sol Ireland arranges golf travel as an agent; final contracts are between you and the relevant suppliers once a booking is confirmed in writing.',
        'This sheet is an enquiry record only — not a quote, invoice, receipt, booking confirmation, or legally binding travel contract.',
        'No price, tee time, hotel room, or transfer is held or guaranteed until Golf Sol Ireland confirms availability and you accept the formal proposal and applicable terms.'
      ]
    }
  }
}
