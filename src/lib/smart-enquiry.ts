const WHATSAPP_TEXT_LIMIT = 1800

const cleanValue = (value?: string | number | null) => {
  if (typeof value === 'number') {
    return String(value)
  }

  return value?.trim() ?? ''
}

const withFallback = (value: string | number | null | undefined, fallback: string) => {
  const cleaned = cleanValue(value)
  return cleaned || fallback
}

const trimToWhatsAppLimit = (text: string) => {
  const cleaned = text.trim()
  if (cleaned.length <= WHATSAPP_TEXT_LIMIT) {
    return cleaned
  }

  return `${cleaned.slice(0, WHATSAPP_TEXT_LIMIT - 3)}...`
}

export function buildWhatsAppHref(baseHref: string, message: string) {
  const text = trimToWhatsAppLimit(message)

  try {
    const url = new URL(baseHref)
    url.searchParams.set('text', text)
    return url.toString()
  } catch {
    const separator = baseHref.includes('?') ? '&' : '?'
    return `${baseHref}${separator}text=${encodeURIComponent(text)}`
  }
}

export function buildGeneralWhatsAppMessage({
  intro,
  detailLines = [],
  closing = 'Please let me know the best next step.'
}: {
  readonly intro: string
  readonly detailLines?: readonly string[]
  readonly closing?: string
}) {
  const lines = ['Hi GolfSol Ireland,', '', intro]

  if (detailLines.length > 0) {
    lines.push('', ...detailLines)
  }

  lines.push('', closing)
  return lines.join('\n')
}

export function buildContentPageWhatsAppMessage({
  pageTitle,
  interestPreset
}: {
  readonly pageTitle: string
  readonly interestPreset: string
}) {
  return buildGeneralWhatsAppMessage({
    intro: `I'm enquiring from the "${pageTitle}" page.`,
    detailLines: [`Interest: ${interestPreset}`]
  })
}

export function buildTransportWhatsAppMessage({
  journeyType,
  collectionPoint,
  destination,
  passengers,
  collectionTime,
  golfBags,
  notes,
  sourceLabel
}: {
  readonly journeyType?: string
  readonly collectionPoint?: string
  readonly destination?: string
  readonly passengers?: number | string
  readonly collectionTime?: string
  readonly golfBags?: string
  readonly notes?: string
  readonly sourceLabel?: string
}) {
  const intro = sourceLabel
    ? `I'm enquiring about transport from the ${sourceLabel}.`
    : "I'm enquiring about transport on the Costa del Sol."

  const detailLines = [
    `Journey type: ${withFallback(journeyType, 'Airport transfer / hotel run / golf transfer')}`,
    `From: ${withFallback(collectionPoint, 'Malaga Airport / hotel / golf club')}`,
    `To: ${withFallback(destination, 'Hotel / resort / golf course')}`,
    `Passengers: ${withFallback(passengers, '1 to 8 people')}`,
    `Travel timing: ${withFallback(collectionTime, 'Date and time to be confirmed')}`,
    `Golf bags / luggage: ${withFallback(golfBags, 'Please allow for golf bags')}`
  ]

  const trimmedNotes = cleanValue(notes)
  if (trimmedNotes) {
    detailLines.push(`Extra notes: ${trimmedNotes}`)
  }

  return buildGeneralWhatsAppMessage({
    intro,
    detailLines,
    closing: 'Please let me know the best option and price.'
  })
}

export function buildPackageWhatsAppMessage({
  sourceLabel,
  packageStyle,
  stayName,
  transferName,
  groupSize,
  nights,
  rounds,
  perPersonPrice,
  groupTotal,
  deposit,
  courseName,
  hotelName,
  notes
}: {
  readonly sourceLabel?: string
  readonly packageStyle?: string
  readonly stayName?: string
  readonly transferName?: string
  readonly groupSize?: number | string
  readonly nights?: number | string
  readonly rounds?: number | string
  readonly perPersonPrice?: string
  readonly groupTotal?: string
  readonly deposit?: string
  readonly courseName?: string
  readonly hotelName?: string
  readonly notes?: string
}) {
  const detailLines = [
    `Package style: ${withFallback(packageStyle, 'Tailored Costa del Sol package')}`,
    `Stay level: ${withFallback(stayName, 'Open to recommendations')}`,
    `Transfer plan: ${withFallback(transferName, 'Airport and golf transfers')}`,
    `Group size: ${withFallback(groupSize, '1 to 8 golfers')}`,
    `Trip length: ${withFallback(nights, '4')} nights / ${withFallback(rounds, '3')} rounds`
  ]

  const cleanedPerPersonPrice = cleanValue(perPersonPrice)
  if (cleanedPerPersonPrice) {
    detailLines.push(`Indicative price: ${cleanedPerPersonPrice} per person`)
  }

  const cleanedGroupTotal = cleanValue(groupTotal)
  if (cleanedGroupTotal) {
    detailLines.push(`Indicative group total: ${cleanedGroupTotal}`)
  }

  const cleanedDeposit = cleanValue(deposit)
  if (cleanedDeposit) {
    detailLines.push(`Indicative deposit: ${cleanedDeposit}`)
  }

  const cleanedCourseName = cleanValue(courseName)
  if (cleanedCourseName) {
    detailLines.push(`Preferred course: ${cleanedCourseName}`)
  }

  const cleanedHotelName = cleanValue(hotelName)
  if (cleanedHotelName) {
    detailLines.push(`Preferred hotel: ${cleanedHotelName}`)
  }

  const cleanedNotes = cleanValue(notes)
  if (cleanedNotes) {
    detailLines.push(`Request: ${cleanedNotes}`)
  }

  return buildGeneralWhatsAppMessage({
    intro: sourceLabel
      ? `I'm enquiring about a golf package from the ${sourceLabel}.`
      : "I'm interested in a Costa del Sol golf package.",
    detailLines,
    closing: 'Please tailor this for my group.'
  })
}
