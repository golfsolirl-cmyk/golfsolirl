import { contactInfo } from '../data/copy'

export interface WhatsAppQuickAction {
  readonly label: string
  readonly prompt: string
  readonly message: string
}

interface ContentPageWhatsappInput {
  readonly title: string
  readonly interestPreset: string
  readonly enquiryType?: 'booking' | 'legal' | 'newsletter' | 'testimonial' | 'support'
}

interface TransportWhatsappInput {
  readonly fullName?: string
  readonly phoneWhatsApp?: string
  readonly passengers: number
  readonly collectionPoint?: string
  readonly destination?: string
  readonly collectionTime?: string
  readonly asap?: boolean
}

const MAX_WHATSAPP_MESSAGE_LENGTH = 900

function cleanLine(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function withFallback(value: string | undefined, fallback: string) {
  const cleaned = cleanLine(value ?? '')
  return cleaned || fallback
}

function compactMessage(message: string) {
  return message
    .split('\n')
    .map((line) => cleanLine(line))
    .filter(Boolean)
    .join('\n')
    .slice(0, MAX_WHATSAPP_MESSAGE_LENGTH)
}

export function buildWhatsAppHref(message: string, phoneTel = contactInfo.phoneTel) {
  const phoneNumber = phoneTel.replace(/[^0-9]/g, '')
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(compactMessage(message))}`
}

export function createHomeWhatsAppMessage() {
  return [
    'Hi GolfSol Ireland, I would like help planning a Costa del Sol golf trip.',
    'Please send me the best next steps for courses, accommodation, and transfers.',
    'I am happy to share dates and group size here on WhatsApp.'
  ].join('\n')
}

export function createTransportPageWhatsAppMessage() {
  return [
    'Hi GolfSol Ireland, I am enquiring about Costa del Sol transport.',
    'I need a golf-bag-friendly transfer plan and a quick quote.',
    'Please let me know the best vehicle options.'
  ].join('\n')
}

export function createTransportFormWhatsAppMessage({
  fullName,
  phoneWhatsApp,
  passengers,
  collectionPoint,
  destination,
  collectionTime,
  asap
}: TransportWhatsappInput) {
  const timing = asap ? 'ASAP / first available driver' : withFallback(collectionTime, 'Please advise the best collection time')

  return [
    'Hi GolfSol Ireland, I am enquiring about transport on the Costa del Sol.',
    `Route: ${withFallback(collectionPoint, 'Collection point to be confirmed')} to ${withFallback(destination, 'Destination to be confirmed')}.`,
    `Passengers: ${passengers} ${passengers === 1 ? 'person' : 'people'}.`,
    `Collection timing: ${timing}.`,
    `Name: ${withFallback(fullName, 'To be confirmed')}.`,
    phoneWhatsApp ? `Reply on WhatsApp: ${cleanLine(phoneWhatsApp)}.` : 'Reply on WhatsApp: I will confirm my number in chat.',
    'Please send availability and the most suitable vehicle.'
  ].join('\n')
}

export function createTransportQuickActions(): readonly WhatsAppQuickAction[] {
  return [
    {
      label: 'Airport pickup',
      prompt: 'Ask for AGP to hotel pricing',
      message: [
        'Hi GolfSol Ireland, I need an airport transfer quote.',
        'Please price a golf-bag-friendly pickup from Malaga Airport to our accommodation.',
        'I can send flight times and passenger numbers here.'
      ].join('\n')
    },
    {
      label: 'Golf-day shuttle',
      prompt: 'Plan hotel to course transfers',
      message: [
        'Hi GolfSol Ireland, I need help with golf-day transport.',
        'We want hotel-to-course and return transfers for our group.',
        'Please let me know the best way to plan the week.'
      ].join('\n')
    },
    {
      label: 'Society group',
      prompt: 'Multi-vehicle planning for 8+ golfers',
      message: [
        'Hi GolfSol Ireland, I am organising transport for a larger golf group.',
        'We may need multiple vehicles and a full-week transfer plan.',
        'Please advise on the best setup and next details you need.'
      ].join('\n')
    }
  ]
}

export function createContentPageWhatsAppPlan({
  title,
  interestPreset,
  enquiryType
}: ContentPageWhatsappInput) {
  const topic = cleanLine(interestPreset)
  const pageTitle = cleanLine(title)

  if (topic.toLowerCase().includes('transport')) {
    return {
      fabMessage: createTransportPageWhatsAppMessage(),
      title: 'WhatsApp a transport brief',
      body: 'Pick the angle that matches your trip and start with a better first message.',
      actions: createTransportQuickActions()
    } as const
  }

  if (enquiryType === 'legal') {
    return {
      fabMessage: `Hi GolfSol Ireland, I have a question about ${topic.toLowerCase()}. Please advise on the right next step.`,
      title: 'Send a legal or policy question',
      body: 'These prompts keep privacy and terms questions concise so your team can respond faster.',
      actions: [
        {
          label: 'Privacy question',
          prompt: 'Ask how enquiry data is handled',
          message: `Hi GolfSol Ireland, I have a privacy question about ${topic.toLowerCase()}. Can you clarify how my enquiry details are handled?`
        },
        {
          label: 'Booking terms',
          prompt: 'Clarify a clause before paying',
          message: `Hi GolfSol Ireland, I am reviewing your terms before booking. Can you explain the key points that apply to my trip?`
        },
        {
          label: 'Data request',
          prompt: 'Update or remove my details',
          message: 'Hi GolfSol Ireland, I need help with a data update or removal request. Please tell me the best way to proceed.'
        }
      ]
    } as const
  }

  if (enquiryType === 'newsletter') {
    return {
      fabMessage: 'Hi GolfSol Ireland, I would like useful golf travel updates for the Costa del Sol. Please add me to the right WhatsApp or email flow.',
      title: 'Choose the update type',
      body: 'Let golfers self-select the kind of updates they actually want instead of sending a generic note.',
      actions: [
        {
          label: 'Course updates',
          prompt: 'News on tee sheets and seasonal changes',
          message: 'Hi GolfSol Ireland, I would like course updates and planning notes for Costa del Sol golf trips.'
        },
        {
          label: 'Planning tips',
          prompt: 'Useful guidance for organisers',
          message: 'Hi GolfSol Ireland, please send practical planning tips for Irish golf groups travelling to the Costa del Sol.'
        },
        {
          label: 'Offers only',
          prompt: 'Keep it to high-signal deals',
          message: 'Hi GolfSol Ireland, I only want to hear about relevant offers or package opportunities. Can you keep me posted?'
        }
      ]
    } as const
  }

  if (enquiryType === 'testimonial') {
    return {
      fabMessage: 'Hi GolfSol Ireland, I would like to share feedback from our trip and help other Irish golfers decide with confidence.',
      title: 'Open a better feedback conversation',
      body: 'These prompts make it easy for past clients to start the conversation without typing from scratch.',
      actions: [
        {
          label: 'Share feedback',
          prompt: 'Send a quick testimonial',
          message: 'Hi GolfSol Ireland, I would like to share feedback from our golf trip. What is the easiest way to send a testimonial?'
        },
        {
          label: 'Society review',
          prompt: 'Talk about a group experience',
          message: 'Hi GolfSol Ireland, our society would like to share a review of the trip. Please tell me what details are most useful.'
        },
        {
          label: 'Need trip details',
          prompt: 'Ask for a reminder before writing',
          message: 'Hi GolfSol Ireland, I want to leave feedback but need a reminder of our trip details first. Can you help?'
        }
      ]
    } as const
  }

  if (enquiryType === 'support' || topic.toLowerCase().includes('faq')) {
    return {
      fabMessage: `Hi GolfSol Ireland, I have a question about ${topic.toLowerCase() || pageTitle.toLowerCase()}. Please point me in the right direction.`,
      title: 'Start with the right question',
      body: 'Each button opens WhatsApp with a smarter opening line so the team can answer faster.',
      actions: [
        {
          label: 'Quick question',
          prompt: 'General help for this page',
          message: `Hi GolfSol Ireland, I have a quick question about ${pageTitle}. Can you help me with the best next step?`
        },
        {
          label: 'Payments',
          prompt: 'Ask about deposits and timing',
          message: 'Hi GolfSol Ireland, I have a payments or deposit question for an upcoming golf trip. Can you clarify it for me?'
        },
        {
          label: 'Transfers',
          prompt: 'Get logistics help quickly',
          message: 'Hi GolfSol Ireland, I need help with transfers and trip logistics. What details do you need from me?'
        }
      ]
    } as const
  }

  return {
    fabMessage: `Hi GolfSol Ireland, I am enquiring about ${topic.toLowerCase() || pageTitle.toLowerCase()}. Please help me with the best options for my trip.`,
    title: 'Send a smarter trip enquiry',
    body: 'These one-tap prompts match this page so the conversation starts with more useful context.',
    actions: [
      {
        label: 'Quick quote',
        prompt: 'Start with dates and group size',
        message: `Hi GolfSol Ireland, I would like a quick quote for ${topic.toLowerCase()}. I can send my dates and group size here on WhatsApp.`
      },
      {
        label: 'Compare options',
        prompt: 'Ask for the best mix of golf, stay, and transport',
        message: `Hi GolfSol Ireland, I am comparing options for ${topic.toLowerCase()}. Can you suggest the best combinations for courses, stay, and transport?`
      },
      {
        label: 'Group planning',
        prompt: 'Best for societies or 8+ golfers',
        message: `Hi GolfSol Ireland, I am planning ${topic.toLowerCase()} for a group trip. Please tell me the smartest way to organise this for 8 or more golfers.`
      }
    ]
  } as const
}
