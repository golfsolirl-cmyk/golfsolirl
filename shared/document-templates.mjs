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

const sanitizeOptionalText = (value) => {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

const parseOptionalHotelStars = (value) => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    const n = Number(value.trim())
    if (!Number.isNaN(n)) {
      return n
    }
  }

  return null
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
    rounds,
    courseName: sanitizeOptionalText(typeof payload.courseName === 'string' ? payload.courseName : ''),
    hotelName: sanitizeOptionalText(typeof payload.hotelName === 'string' ? payload.hotelName : ''),
    hotelStars: parseOptionalHotelStars(payload.hotelStars),
    hotelDist: sanitizeOptionalText(typeof payload.hotelDist === 'string' ? payload.hotelDist : ''),
    customerFullName: sanitizeOptionalText(typeof payload.customerFullName === 'string' ? payload.customerFullName : ''),
    customerEmail: sanitizeOptionalText(typeof payload.customerEmail === 'string' ? payload.customerEmail : ''),
    customerPhoneWhatsApp: sanitizeOptionalText(
      typeof payload.customerPhoneWhatsApp === 'string' ? payload.customerPhoneWhatsApp : ''
    ),
    customerInterest: sanitizeOptionalText(typeof payload.customerInterest === 'string' ? payload.customerInterest : ''),
    enquiryReferenceId: sanitizeOptionalText(typeof payload.enquiryReferenceId === 'string' ? payload.enquiryReferenceId : ''),
    quoteScopeSummary: sanitizeOptionalText(typeof payload.quoteScopeSummary === 'string' ? payload.quoteScopeSummary : ''),
    enquirySubmittedDisplay: sanitizeOptionalText(
      typeof payload.enquirySubmittedDisplay === 'string' ? payload.enquirySubmittedDisplay : ''
    ),
    extraTripOverviewLines: Array.isArray(payload.extraTripOverviewLines)
      ? payload.extraTripOverviewLines
          .filter((x) => typeof x === 'string')
          .map((x) => sanitizeOptionalText(x))
          .filter(Boolean)
          .slice(0, 16)
      : [],
    travelDates: sanitizeOptionalText(typeof payload.travelDates === 'string' ? payload.travelDates : ''),
    departureAirportRoute: sanitizeOptionalText(
      typeof payload.departureAirportRoute === 'string' ? payload.departureAirportRoute : ''
    ),
    leadTravellerContact: sanitizeOptionalText(
      typeof payload.leadTravellerContact === 'string' ? payload.leadTravellerContact : ''
    ),
    resortArea: sanitizeOptionalText(typeof payload.resortArea === 'string' ? payload.resortArea : ''),
    proposalSpecialRequests: sanitizeOptionalText(
      typeof payload.proposalSpecialRequests === 'string' ? payload.proposalSpecialRequests : ''
    ),
    airportTransfersDetail: sanitizeOptionalText(
      typeof payload.airportTransfersDetail === 'string' ? payload.airportTransfersDetail : ''
    ),
    golfDayTransportDetail: sanitizeOptionalText(
      typeof payload.golfDayTransportDetail === 'string' ? payload.golfDayTransportDetail : ''
    ),
    boardBasis: sanitizeOptionalText(typeof payload.boardBasis === 'string' ? payload.boardBasis : ''),
    upgradeNotes: sanitizeOptionalText(typeof payload.upgradeNotes === 'string' ? payload.upgradeNotes : ''),
    /** When set, replaces the default “{nights} nights / {rounds} rounds” trip-shape line and pricing summary tile. */
    tripShapeCustom: sanitizeOptionalText(typeof payload.tripShapeCustom === 'string' ? payload.tripShapeCustom : ''),
    proposalProductKind: (() => {
      const raw = typeof payload.proposalProductKind === 'string' ? payload.proposalProductKind.trim().toLowerCase() : ''
      if (raw === 'airport_transfer' || raw === 'golf_transfer' || raw === 'hotel_accommodation') {
        return raw
      }
      return ''
    })(),
    proposalHeroKicker: sanitizeOptionalText(typeof payload.proposalHeroKicker === 'string' ? payload.proposalHeroKicker : ''),
    proposalHeroTitle: sanitizeOptionalText(typeof payload.proposalHeroTitle === 'string' ? payload.proposalHeroTitle : ''),
    proposalHeroDescription: sanitizeOptionalText(
      typeof payload.proposalHeroDescription === 'string' ? payload.proposalHeroDescription : ''
    )
  }
}

const proposalHeroByProductKind = {
  airport_transfer: {
    public: {
      kicker: 'Golf Sol Ireland',
      title: 'Airport Transfers',
      description:
        'Private Málaga (AGP) and Costa del Sol ground transport — golf-bag friendly vehicles, clear routing from the airport to your hotel or course.'
    },
    admin: {
      kicker: 'Golf Sol Ireland',
      title: 'Airport Transfers',
      description:
        'Internal proposal layout for arrival, departure, and corridor transfers. Confirm vehicle class, meet-and-greet, and pricing before sending to the client.'
    }
  },
  golf_transfer: {
    public: {
      kicker: 'Golf Sol Ireland',
      title: 'Golf Transfers',
      description:
        'Resort, hotel, and airport legs timed for tee sheets — one coordinated plan for golf-day transport across the Costa del Sol.'
    },
    admin: {
      kicker: 'Golf Sol Ireland',
      title: 'Golf Transfers',
      description:
        'Proposal shell for course-to-course and hotel ↔ golf legs. Align pickup windows, bag count, and repeat-day routing before issue.'
    }
  },
  hotel_accommodation: {
    public: {
      kicker: 'Golf Sol Ireland',
      title: 'Hotel Transfers / Accommodation',
      description:
        'Stay, board basis, and hotel-linked transfers in one view — so accommodation and ground transport stay aligned with your golf itinerary.'
    },
    admin: {
      kicker: 'Golf Sol Ireland',
      title: 'Hotel Transfers / Accommodation',
      description:
        'Internal layout for hotel nights, inclusions, and related transfer legs. Confirm star tier, board basis, and deposit terms before send.'
    }
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

  const proposalInfoLine = (label, text) => {
    const v = typeof text === 'string' ? text.trim() : ''
    return v ? `${label}: ${v}` : `${label}: ${proposalPlaceholder}`
  }

  const tripShapeSummaryText =
    typeof proposal.tripShapeCustom === 'string' && proposal.tripShapeCustom.trim()
      ? proposal.tripShapeCustom.trim()
      : `${proposal.nights} nights / ${proposal.rounds} rounds`
  const tripShapeCardFirstLine = `Trip shape: ${tripShapeSummaryText}`

  const hotelAreaLine = proposal.hotelName
    ? `Hotel name / area: ${proposal.hotelName}${
        typeof proposal.hotelStars === 'number' && proposal.hotelStars > 0
          ? ` ${'★'.repeat(Math.min(5, Math.max(1, Math.floor(proposal.hotelStars))))}`
          : ''
      }${proposal.hotelDist ? ` · ${proposal.hotelDist} from course` : ''}`
    : 'Hotel name / area: ________________________'

  const courseListLine = proposal.courseName
    ? `Course list: ${proposal.courseName}`
    : 'Course list: ________________________'

  const golfCourseOverviewLine = proposal.courseName
    ? `Golf course: ${proposal.courseName}`
    : `Golf course: ${proposalPlaceholder}`

  const heroPublicDefault = {
    kicker: 'Costa del Sol Proposal',
    title: 'Your Costa del Sol golf proposal',
    description:
      'Everything in one place: how we have shaped your trip, what is included, indicative pricing, and practical next steps — prepared by Golf Sol Ireland for your group.'
  }

  const heroAdminDefault = {
    kicker: 'Costa del Sol Proposal',
    title: 'Premium trip proposal ready to tailor, confirm, and send',
    description:
      'A branded Golf Sol Ireland proposal document designed to turn a selected package into a cleaner, more professional client-facing trip outline.'
  }

  const productKind = proposal.proposalProductKind
  const productHeroPublic =
    productKind && proposalHeroByProductKind[productKind] ? proposalHeroByProductKind[productKind].public : null
  const productHeroAdmin =
    productKind && proposalHeroByProductKind[productKind] ? proposalHeroByProductKind[productKind].admin : null

  const explicitHero =
    proposal.proposalHeroKicker || proposal.proposalHeroTitle || proposal.proposalHeroDescription
      ? {
          kicker: proposal.proposalHeroKicker || heroPublicDefault.kicker,
          title: proposal.proposalHeroTitle || heroPublicDefault.title,
          description: proposal.proposalHeroDescription || heroPublicDefault.description
        }
      : null

  const heroPublic = explicitHero ?? productHeroPublic ?? heroPublicDefault
  const heroAdmin = explicitHero ?? productHeroAdmin ?? heroAdminDefault

  const clientMessageBody =
    'Hi ________________________, attached is your Golf Sol Ireland proposal for the Costa del Sol trip. Have a look through the package outline, pricing, and notes, and let us know what you would like adjusted.'

  const metaCard = [`Proposal ID: ${proposal.proposalId}`, `Prepared date: ${proposal.proposalDate}`]

  const tripOverviewLead = []
  if (proposal.customerFullName) {
    tripOverviewLead.push(`Client name: ${proposal.customerFullName}`)
  }
  if (proposal.customerEmail) {
    tripOverviewLead.push(`Email: ${proposal.customerEmail}`)
  }
  if (proposal.customerPhoneWhatsApp) {
    tripOverviewLead.push(`Phone / WhatsApp: ${proposal.customerPhoneWhatsApp}`)
  }
  if (proposal.enquiryReferenceId) {
    tripOverviewLead.push(`Website enquiry ref: ${proposal.enquiryReferenceId}`)
  }
  if (proposal.enquirySubmittedDisplay) {
    tripOverviewLead.push(`Enquiry submitted: ${proposal.enquirySubmittedDisplay}`)
  }
  if (proposal.customerInterest) {
    tripOverviewLead.push(`Trip interest (from form): ${proposal.customerInterest}`)
  }
  if (proposal.quoteScopeSummary) {
    tripOverviewLead.push(`Included in this quote: ${proposal.quoteScopeSummary}`)
  }

  for (const line of proposal.extraTripOverviewLines) {
    tripOverviewLead.push(line)
  }

  const tripOverviewItems = [
    ...tripOverviewLead,
    `Package style: ${proposal.packageName}`,
    `Stay level: ${proposal.stayName}`,
    `Transfer style: ${proposal.transferName}`,
    `Group size: ${proposal.groupSize} golfer${proposal.groupSize > 1 ? 's' : ''}`,
    golfCourseOverviewLine
  ]

  return {
    meta: proposal,
    hero: { ...(variant === 'admin' ? heroAdmin : heroPublic), metaCard },
    infoCards: [
      {
        icon: 'users',
        title: 'Trip overview',
        items: tripOverviewItems
      },
      {
        icon: 'calendar',
        title: 'Trip shape',
        items: [
          tripShapeCardFirstLine,
          proposalInfoLine('Travel dates', proposal.travelDates),
          proposalInfoLine('Departure airport / route', proposal.departureAirportRoute),
          proposalInfoLine('Lead traveller / contact', proposal.leadTravellerContact)
        ]
      },
      {
        icon: 'map',
        title: 'Proposal details',
        items: [
          hotelAreaLine,
          courseListLine,
          proposalInfoLine('Resort area', proposal.resortArea),
          proposalInfoLine('Special requests', proposal.proposalSpecialRequests)
        ]
      },
      {
        icon: 'bus',
        title: 'Logistics and inclusions',
        items: [
          proposalInfoLine('Airport transfers', proposal.airportTransfersDetail),
          proposalInfoLine('Golf-day transport', proposal.golfDayTransportDetail),
          proposalInfoLine('Board basis', proposal.boardBasis),
          proposalInfoLine('Upgrade notes', proposal.upgradeNotes)
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
        { label: 'Trip shape', value: tripShapeSummaryText }
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
