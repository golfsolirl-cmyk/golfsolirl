import { compactMessageLines, formatPeopleLabel } from './whatsapp'

const EMPTY_FIELD_TOKEN = '[add details]'

export type SmartEnquiryType = 'booking' | 'legal' | 'newsletter' | 'testimonial' | 'support'

export type TransportServiceType = 'Airport transfer' | 'Golf-day shuttle' | 'Full-week driver support'

export interface TransportEnquiryDraft {
  readonly serviceType: TransportServiceType
  readonly passengers: number
  readonly collectionPoint: string
  readonly destination: string
  readonly collectionTime: string
  readonly asap: boolean
}

export interface ContentPageWhatsAppDraft {
  readonly pageTitle: string
  readonly interestPreset: string
  readonly enquiryType?: SmartEnquiryType
  readonly contextSummary?: string
  readonly travelDates?: string
  readonly groupSize?: string
  readonly notes?: string
}

export interface HomeQuoteWhatsAppDraft {
  readonly sourceLabel?: string
  readonly tripShape?: string
  readonly travelDates?: string
  readonly groupSize?: string
  readonly preferredBase?: string
  readonly preferredCourses?: string
}

export interface SmartActionButtonConfig {
  readonly label: string
  readonly helper: string
  readonly message: string
}

export interface SmartPageWhatsAppConfig {
  readonly primaryLabel: string
  readonly primaryHelper: string
  readonly primaryMessage: string
  readonly quickActions: readonly SmartActionButtonConfig[]
}

function withFallback(value: string | number | null | undefined, fallback: string) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : fallback
  }

  if (typeof value !== 'string') {
    return fallback
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

function formatDateTimeLabel(value: string, fallback: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return fallback
  }

  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) {
    return trimmed
  }

  return new Intl.DateTimeFormat('en-IE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(parsed)
}

function supportPromptForType(enquiryType?: SmartEnquiryType) {
  switch (enquiryType) {
    case 'legal':
      return 'Question: [add the clause or policy point you want explained]'
    case 'newsletter':
      return 'Update preference: [courses / hotels / offers / planning tips]'
    case 'testimonial':
      return 'Trip notes: [share the headline feedback or what stood out]'
    case 'support':
      return 'Question: [add the detail you want help with]'
    case 'booking':
    default:
      return 'Question: [add the detail you want help with]'
  }
}

export function buildTransportWhatsAppMessage(draft: TransportEnquiryDraft) {
  const routeFrom = withFallback(draft.collectionPoint, '[add pickup point]')
  const routeTo = withFallback(draft.destination, '[add destination]')
  const timing = draft.asap
    ? 'ASAP - first available driver'
    : formatDateTimeLabel(draft.collectionTime, '[add collection date and time]')

  return compactMessageLines([
    'Hi GolfSol Ireland,',
    '',
    `I am enquiring about ${draft.serviceType.toLowerCase()} on the Costa del Sol.`,
    `Route: ${routeFrom} to ${routeTo}`,
    `Passengers: ${formatPeopleLabel(draft.passengers)}`,
    `Timing: ${timing}`,
    'Extra notes: [add flight number, golf bags, return leg, or tee times]',
    '',
    'Please let me know the best option and price in euro.'
  ])
}

export function buildContentPageWhatsAppMessage(draft: ContentPageWhatsAppDraft) {
  const isBookingLike = draft.enquiryType === 'booking' || draft.enquiryType === undefined

  return compactMessageLines([
    'Hi GolfSol Ireland,',
    '',
    `I am enquiring about ${draft.interestPreset}.`,
    `Page: ${draft.pageTitle}`,
    draft.contextSummary ? draft.contextSummary : null,
    isBookingLike ? `Travel dates: ${withFallback(draft.travelDates, '[add travel dates]')}` : null,
    isBookingLike ? `Group size: ${withFallback(draft.groupSize, '[add golfers]')}` : null,
    draft.notes?.trim() ? `Notes: ${draft.notes.trim()}` : supportPromptForType(draft.enquiryType),
    '',
    'Please reply on WhatsApp with the clearest next step.'
  ])
}

export function buildHomeQuoteWhatsAppMessage(draft: HomeQuoteWhatsAppDraft = {}) {
  return compactMessageLines([
    'Hi GolfSol Ireland,',
    '',
    `I would love a quote for a Costa del Sol golf trip${draft.sourceLabel ? ` from the ${draft.sourceLabel} page` : ''}.`,
    `Trip shape: ${withFallback(draft.tripShape, 'Golf holiday planning')}`,
    `Travel dates: ${withFallback(draft.travelDates, '[add travel dates]')}`,
    `Group size: ${withFallback(draft.groupSize, '[add golfers]')}`,
    `Preferred base: ${withFallback(draft.preferredBase, '[Marbella / Fuengirola / Sotogrande / open to ideas]')}`,
    `Preferred courses: ${withFallback(draft.preferredCourses, '[add must-play courses or say open to suggestions]')}`,
    '',
    'Please send me your best next-step options on WhatsApp.'
  ])
}

export const defaultTransportEnquiryDraft: TransportEnquiryDraft = {
  serviceType: 'Airport transfer',
  passengers: 4,
  collectionPoint: '',
  destination: '',
  collectionTime: '',
  asap: false
}

export const emptyContentPageWhatsAppDraft: Omit<ContentPageWhatsAppDraft, 'pageTitle' | 'interestPreset'> = {
  enquiryType: 'booking',
  contextSummary: '',
  travelDates: '',
  groupSize: '',
  notes: ''
}

export function normaliseSmartPathname(pathname: string) {
  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed.length > 0 ? trimmed : '/'
}

function isTransportPath(pathname: string) {
  return pathname === '/services/transport' || pathname === '/transport'
}

function isAccommodationPath(pathname: string) {
  return pathname === '/accommodation' || pathname.startsWith('/accommodation/')
}

function isCoursesPath(pathname: string) {
  return pathname === '/golf-courses' || pathname.startsWith('/golf-courses/') || pathname === '/golf-map'
}

function isGuidePath(pathname: string) {
  return pathname.startsWith('/guides/') || pathname.startsWith('/links-and-information/')
}

function bookingMessageForPreset(pageTitle: string, interestPreset: string, notes: string) {
  return buildContentPageWhatsAppMessage({
    pageTitle,
    interestPreset,
    enquiryType: 'booking',
    notes
  })
}

function supportMessageForPreset(pageTitle: string, interestPreset: string, enquiryType: SmartEnquiryType | undefined, notes?: string) {
  return buildContentPageWhatsAppMessage({
    pageTitle,
    interestPreset,
    enquiryType,
    notes
  })
}

export function getSmartPageWhatsAppConfig({
  pathname,
  pageTitle,
  interestPreset,
  enquiryType,
  transportDraft
}: {
  readonly pathname: string
  readonly pageTitle?: string
  readonly interestPreset?: string
  readonly enquiryType?: SmartEnquiryType
  readonly transportDraft?: TransportEnquiryDraft
}): SmartPageWhatsAppConfig {
  const normalisedPath = normaliseSmartPathname(pathname)
  const resolvedTitle = pageTitle ?? 'GolfSol Ireland'
  const resolvedInterest = interestPreset ?? resolvedTitle

  if (normalisedPath === '/') {
    return {
      primaryLabel: 'WhatsApp for a tailored quote',
      primaryHelper: 'A premium trip brief is already drafted for you.',
      primaryMessage: buildHomeQuoteWhatsAppMessage({
        sourceLabel: 'home',
        tripShape: 'Costa del Sol golf holiday'
      }),
      quickActions: [
        {
          label: 'Luxury fourball',
          helper: 'A sharper 4-golfer escape with premium touches',
          message: buildHomeQuoteWhatsAppMessage({
            sourceLabel: 'home',
            tripShape: 'Luxury fourball escape',
            groupSize: '4 golfers',
            preferredBase: 'Marbella or Sotogrande'
          })
        },
        {
          label: 'Society captain',
          helper: 'Ask for a clean group quote with easy next steps',
          message: buildHomeQuoteWhatsAppMessage({
            sourceLabel: 'home',
            tripShape: 'Society trip planning',
            groupSize: '8 golfers or more',
            preferredCourses: 'Open to your best society-friendly shortlist'
          })
        },
        {
          label: 'Hotel already booked',
          helper: 'Need golf and transfers around an existing stay',
          message: buildHomeQuoteWhatsAppMessage({
            sourceLabel: 'home',
            tripShape: 'Hotel already booked - golf and transfer planning',
            preferredBase: 'Hotel already booked'
          })
        }
      ]
    }
  }

  if (isTransportPath(normalisedPath)) {
    const liveDraft = transportDraft ?? defaultTransportEnquiryDraft

    return {
      primaryLabel: 'WhatsApp this transfer brief',
      primaryHelper: 'Route, headcount, and timing are already drafted.',
      primaryMessage: buildTransportWhatsAppMessage(liveDraft),
      quickActions: [
        {
          label: 'Airport run',
          helper: 'AGP to resort, villa, or hotel',
          message: buildTransportWhatsAppMessage({
            ...defaultTransportEnquiryDraft,
            serviceType: 'Airport transfer'
          })
        },
        {
          label: 'Golf-day shuttle',
          helper: 'Hotel to course and back',
          message: buildTransportWhatsAppMessage({
            ...defaultTransportEnquiryDraft,
            serviceType: 'Golf-day shuttle'
          })
        },
        {
          label: 'Driver for the week',
          helper: 'Joined-up support across the trip',
          message: buildTransportWhatsAppMessage({
            ...defaultTransportEnquiryDraft,
            serviceType: 'Full-week driver support'
          })
        }
      ]
    }
  }

  if (isCoursesPath(normalisedPath)) {
    return {
      primaryLabel: 'WhatsApp for a course shortlist',
      primaryHelper: 'Best-fit rounds, drive times, and must-play options.',
      primaryMessage: bookingMessageForPreset(resolvedTitle, resolvedInterest, 'We would like a course shortlist for our group.'),
      quickActions: [
        {
          label: 'Course shortlist',
          helper: 'Built around handicap and routing',
          message: bookingMessageForPreset(resolvedTitle, resolvedInterest, 'Please shortlist the right courses for our group.')
        },
        {
          label: 'Tee-time check',
          helper: 'Ask about specific dates or courses',
          message: bookingMessageForPreset(resolvedTitle, resolvedInterest, 'Could you check tee-time options for our dates and preferred courses?')
        },
        {
          label: 'Golf + transfers',
          helper: 'Shape rounds around easier logistics',
          message: bookingMessageForPreset(resolvedTitle, resolvedInterest, 'Could you shape the golf around the easiest transfer plan?')
        }
      ]
    }
  }

  if (isAccommodationPath(normalisedPath)) {
    return {
      primaryLabel: 'WhatsApp for hotel options',
      primaryHelper: 'Get matched stays by budget, base, and group style.',
      primaryMessage: bookingMessageForPreset(resolvedTitle, resolvedInterest, 'Please suggest the best hotel options for our group.'),
      quickActions: [
        {
          label: 'Hotel match',
          helper: 'Focused shortlist, no endless listings',
          message: bookingMessageForPreset(resolvedTitle, resolvedInterest, 'Please match the best hotels to our group and budget.')
        },
        {
          label: 'Stay + play',
          helper: 'Hotel and golf shaped together',
          message: bookingMessageForPreset(resolvedTitle, resolvedInterest, 'We want stay-and-play options with golf and transfers shaped together.')
        },
        {
          label: 'Value vs luxury',
          helper: 'Compare tiers side by side',
          message: bookingMessageForPreset(resolvedTitle, resolvedInterest, 'Could you compare value, premium, and luxury hotel options for us?')
        }
      ]
    }
  }

  if (isGuidePath(normalisedPath) || enquiryType === 'legal' || enquiryType === 'support' || enquiryType === 'newsletter' || enquiryType === 'testimonial') {
    return {
      primaryLabel: enquiryType === 'legal' ? 'WhatsApp your question' : 'WhatsApp for a quick answer',
      primaryHelper: 'This page context is already included in the draft.',
      primaryMessage: supportMessageForPreset(resolvedTitle, resolvedInterest, enquiryType),
      quickActions: [
        {
          label: 'Ask about this page',
          helper: 'Use the current guide or info page as context',
          message: supportMessageForPreset(resolvedTitle, resolvedInterest, enquiryType)
        },
        {
          label: 'Need a quote instead',
          helper: 'Switch from info to planning',
          message: buildHomeQuoteWhatsAppMessage({
            sourceLabel: resolvedTitle,
            tripShape: 'Costa del Sol golf trip planning'
          })
        },
        {
          label: 'Transport question',
          helper: 'Ask about AGP arrivals or transfer flow',
          message: buildTransportWhatsAppMessage(defaultTransportEnquiryDraft)
        }
      ]
    }
  }

  return {
    primaryLabel: 'WhatsApp for a tailored quote',
    primaryHelper: 'A polished trip brief is already drafted for you.',
    primaryMessage: buildHomeQuoteWhatsAppMessage({
      sourceLabel: resolvedTitle
    }),
    quickActions: [
      {
        label: 'Full trip quote',
        helper: 'Courses, stay, and transfers together',
        message: buildHomeQuoteWhatsAppMessage({
          sourceLabel: resolvedTitle
        })
      },
      {
        label: 'Transport only',
        helper: 'Airport and golf-day runs',
        message: buildTransportWhatsAppMessage(defaultTransportEnquiryDraft)
      },
      {
        label: 'Already have hotel',
        helper: 'Need golf and transfers around an existing stay',
        message: buildHomeQuoteWhatsAppMessage({
          sourceLabel: resolvedTitle,
          tripShape: 'Hotel already booked - golf and transfer planning',
          preferredBase: 'Hotel already booked'
        })
      }
    ]
  }
}

export { EMPTY_FIELD_TOKEN }
