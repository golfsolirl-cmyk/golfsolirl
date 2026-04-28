/**
 * Copy for the dedicated Transport service page.
 * Voice: Irish-owned, Málaga AGP ↔ Costa del Sol corridor, premium but plain-spoken.
 */

export const transportHeroCopy = {
  eyebrow: 'Málaga AGP · Costa del Sol · Door-to-door',
  title: 'Concierge transfers, built for Irish golfers.',
  subtitle:
    'Cars and vans that fit the bags, drivers that know the courses, and one Irish team holding it all together — from the moment your flight lands until the last drive home.',
  primaryCta: 'Get a transfer quote',
  secondaryCta: 'Talk to us'
} as const

/** Numbered facts strip under the hero — tight, magazine-style stats. */
export const transportPromiseStats = [
  { value: 'Local & Irish', label: 'Phone numbers' },
  { value: '9 to 5', label: 'Irish phone line' },
  { value: '< 2 hr', label: 'Quote turnaround' },
  { value: '100%', label: 'Golf-bag friendly' }
] as const

export const transportPromiseCopy = {
  eyebrow: 'The promise',
  title: 'Land in Málaga. Don’t think about logistics again.',
  body:
    'You book through Ireland, you’re met at AGP arrivals by name, your bags ride in a vehicle that actually fits clubs, and the same crew handles every run that week — courses, dinners, the late one back to the hotel.',
  bullets: [
    'Flights tracked from Dublin, Cork, Shannon, Belfast.',
    'Mercedes V-Class, E-Class and Sprinter — sized to your group.',
    'No anonymous rank queue. No surprise charges. No language barrier.'
  ]
} as const

/** Three editorial moments — each with its own hero image. */
export const transportRouteStory = [
  {
    badge: 'Step 01',
    title: 'Met by name in arrivals.',
    body:
      'Your driver tracks the flight, parks meters from the door, and is standing in arrivals before the bags hit the carousel. You walk straight to the vehicle — golf travel covers loaded for you.',
    bullet: 'Flight monitored · Meet-and-greet · Sub-15 min curb',
    image: '/images/transport-moment-arrivals.jpg',
    alt:
      'Smartly-dressed chauffeur waiting in Málaga AGP arrivals hall beside a luggage trolley loaded with golf bags and suitcases.'
  },
  {
    badge: 'Step 02',
    title: 'Door to door, hotel or villa.',
    body:
      'Straight to your base on the Sol — Marbella, Estepona, Sotogrande or anywhere in between. Bag drop with the bellhop, room keys, and a clear plan for every tee time across the week.',
    bullet: 'Direct route · Bag drop · Week-long itinerary in hand',
    image: '/images/transport-moment-resort.jpg',
    alt:
      'Black Mercedes V-Class parked at the entrance of a luxury Costa del Sol golf resort, bellhop carrying a golf bag toward the door.'
  },
  {
    badge: 'Step 03',
    title: 'Fairway shuttles, late dinners, the lot.',
    body:
      'Morning runs to Valderrama, dinners in Puerto Banús, the slow trip home from Finca Cortesín — all joined up by one driver who knows the diary as well as you do.',
    bullet: 'Course transfers · Dinner runs · One Irish coordinator',
    image: '/images/transport-hero-coastal-drive.jpg',
    alt:
      'Black Mercedes V-Class on the AP-7 coastal motorway above Marbella at golden hour with the Mediterranean glittering on the right.'
  }
] as const

export const transportFleetIntroCopy = {
  eyebrow: 'The fleet',
  title: 'All vehicles. Sized to the group.',
  body:
    'Every transfer is matched to the four-ball, society or family travelling. Premium Mercedes only — leather, aircon, and proper room for travel covers, trolleys and shoe bags.'
} as const

/** Homepage fleet image — banner sits below the photo, not overlaid. */
export const transportFleetInsuranceBannerCopy = {
  kicker: 'Fully covered',
  headline: 'All transfers are fully insured',
  detail: 'Airport, hotel & golf course legs — commercial cover on every run.'
} as const

export const transportFleetTiers = [
  {
    name: 'Mercedes E-Class',
    seats: '1 – 3 passengers',
    bagsLine: 'Up to 3 golf travel bags',
    bullets: ['Executive saloon', 'Quiet cabin · leather', 'Best for couples & solos'],
    accent: 'Discreet'
  },
  {
    name: 'Mercedes V-Class',
    seats: '4 – 7 passengers',
    bagsLine: 'Up to 7 travel bags + cabin luggage',
    bullets: ['Premium people carrier', 'Captain seats · panoramic glass', 'The Sol corridor classic'],
    accent: 'Most chosen'
  },
  {
    name: 'Mercedes Sprinter',
    seats: 'Up to 8 passengers',
    bagsLine: 'Society-sized luggage hold',
    bullets: ['Full minibus comfort', 'Reclining seats · onboard usb', 'Built for societies & corporates'],
    accent: 'Group strength'
  }
] as const

/** Big enquiry block at the foot of the page. */
export const transportEnquireBlockCopy = {
  eyebrow: 'Get your transfer',
  title: 'Send the run. We come back with times and a clear price.',
  body:
    'Drop the flight, the dates and the destination. We respond from Ireland — usually inside two hours during the working day — with availability, vehicle, and an honest quote in euro.',
  reassurances: [
    'Replies from Ireland · not a call centre',
    'No deposit to receive a quote',
    'Group bookings welcome — up to 32 across multiple vehicles'
  ]
} as const

export const transportEnquiryFormCopy = {
  sheetEyebrow: 'Quick request',
  title: 'Tell us about your run',
  subtitle: 'Five details and we’re away — we’ll come back with availability and what happens next.',
  nameLabel: 'Full name',
  emailLabel: 'Email',
  phoneLabel: 'Mobile / WhatsApp',
  passengersLabel: 'Number of passengers',
  collectionLabel: 'Collection point',
  collectionHint: 'e.g. Málaga AGP Terminal 3, hotel name, villa address',
  destinationLabel: 'Destination',
  destinationHint: 'e.g. Marbella hotel, Sotogrande resort, golf club',
  timeLabel: 'Collection date & time',
  asapLabel: 'ASAP — first available driver',
  asapHint: 'Tick if you want the next slot rather than a fixed time.',
  submit: 'Send transfer request',
  sending: 'Sending…',
  successTitle: 'Request received',
  successBody: 'Check your inbox — we’ll be in touch shortly from Ireland.',
  errorTitle: 'Could not send',
  errorBody: 'Try again in a moment or email us directly.',
  validationRequired: 'Please complete all required fields.',
  validationEmail: 'Please enter a valid email address.',
  validationTime: 'Choose a collection date and time, or tick ASAP.',
  validationPassengers: 'Passengers must be between 1 and 16.'
} as const

/** Legacy exports kept so older sections don’t break during migration. */
export const transportHeroIntroCopy = {
  kicker: transportPromiseCopy.eyebrow,
  title: transportPromiseCopy.title,
  lead: transportPromiseCopy.body,
  bullets: [
    { title: 'Met in arrivals', body: transportRouteStory[0].body },
    { title: 'Door to door', body: transportRouteStory[1].body },
    { title: 'All-week shuttles', body: transportRouteStory[2].body }
  ],
  foot: transportEnquireBlockCopy.body,
  footMobile: transportEnquireBlockCopy.body
} as const

export const transportMoments = transportRouteStory.map((moment) => ({
  title: moment.title,
  body: moment.body
})) as ReadonlyArray<{ readonly title: string; readonly body: string }>

export const transportTiers = transportFleetTiers.map((tier) => ({
  name: tier.name,
  blurb: tier.bullets[0] ?? tier.seats,
  fit: `Best for: ${tier.seats}`
})) as ReadonlyArray<{ readonly name: string; readonly blurb: string; readonly fit: string }>

export const transportTrustBand = {
  title: 'Why Irish groups trust us with the wheels',
  body:
    'Invoices from Ireland, SEPA-friendly, and the same team answering WhatsApp when Ryanair moves the gate. No anonymous rank queue — just drivers briefed on your hotel, your bags and your tee sheet.'
} as const
