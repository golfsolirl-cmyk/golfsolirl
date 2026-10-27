/**
 * Long-form copy for the GolfSol Ireland homepage.
 * Voice: Irish-owned, Costa del Sol specialist. We do not market golf outside
 * this corridor — content here is laser-focused on the Sol corridor
 * (Málaga → Sotogrande) where Irish groups travel most.
 */

export const contactInfo = {
  tagline: 'IRISH-OWNED · COSTA DEL SOL GOLF SPECIALISTS',
  phoneDisplay: '+353 86 851 5000',
  phoneTel: '+353868515000',
  /** Voice line in Spain — same team; WhatsApp stays on the Irish number. */
  spanishPhoneDisplay: '+34 641 81 53 66',
  spanishPhoneTel: '+34641815366',
  phoneIrishLineLabel: 'Irish support (WhatsApp)',
  phoneSpanishLineLabel: 'Spanish line',
  /** Hint for enquiry forms — your number, not ours. */
  phoneFieldPlaceholder: '+353 or +34 mobile',
  email: 'info@golfsolirl.com'
} as const

/** Alt text for the brand-composed Malaga hero raster (homepage). */
export const malagaHeroImageAlt =
  'GolfSol Ireland — From plane to fairway. Meet-and-greet at Malaga, golf-bag friendly private transfers, tee times pre-booked. Irish and Spanish phone lines: +353 86 851 5000 and +34 641 81 53 66.' as const

/** Alt for the transport-page hero variant (premium van, chauffeur, golf bags at airport). */
export const transportHeroImageAlt =
  'GolfSol Ireland transport hero — premium people carrier at a Mediterranean airport arrivals curb, chauffeur beside the vehicle, golf bags and clubs being loaded, warm golden-hour light, forest green and gold brand atmosphere.' as const

export const heroCopy = {
  title: 'YOUR COSTA DEL SOL GOLF TRIP STARTS RIGHT HERE.',
  cta: 'GET A QUOTE'
} as const

/** Homepage airport transfers CTA — “Arrive in Málaga” band. */
export const homeAirportTransfersCopy = {
  eyebrow: 'Airport transfer desk',
  regionBadge: 'Málaga · Costa del Sol golf transfers',
  titleLine1: 'Arrive in Málaga.',
  titleLine2: 'Let us do the rest.',
  body:
    'Meet and greet at AGP, live flight tracking, golf-bag-ready vehicle, and a straight run to your hotel — no taxi queue, no guesswork.',
  fleetImageBadge: 'Golf-bag friendly vehicles',
  fleetImageSrc: '/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.webp',
  fleetImageAlt:
    'Private transfer vehicles on the Costa del Sol — room for clubs, for Irish groups.',
  fleetCardLabel: 'The vehicles',
  fleetCardBody:
    'Car, people carrier or minibus — matched to your group, clubs and trolley count.',
  ctaLabel: 'Explore airport transfers',
  boardingEyebrow: 'Now boarding',
  boardingTitle: 'Airport transfers',
  boardingLive: 'Live',
  boardingRouteLabel: 'Route',
  boardingRouteValue: 'Málaga Airport to your resort',
  boardingStatusLabel: 'Status',
  boardingStatusValue: 'Ready on landing',
  boardingDeskLabel: 'Desk',
  boardingDeskValue: 'Irish support line active'
} as const

export const homeAirportTransferSignals = [
  { title: 'AGP arrivals tracked', detail: 'Flight-aware pickup window' },
  { title: 'Direct to resort', detail: 'No taxi-rank scramble' },
  { title: 'Golf bags welcome', detail: 'Driver and luggage-ready vehicles' }
] as const

export const designYourPackage = {
  kicker: 'Plan the week',
  title: 'Design your Costa del Sol golf trip',
  lead: 'Pick the base, the courses and the hotel. We sort the transfers.',
  bodyEmphasis: 'One Irish desk builds the week around your group.',
  stepCardEyebrow: 'Your itinerary',
  stepCta: 'Get a quote',
  step1Tag: 'Pick Your Costa del Sol Base',
  step2Tag: 'Pick Your Tee Times',
  step3Tag: 'Pick Your Hotel',
  closer: 'Leave the rest to us.',
  step1: {
    eyebrow: 'STEP 1',
    title: 'Pick your Costa del Sol base.',
    body:
      'Fuengirola, Torremolinos, Marbella or Sotogrande. Each one is a short drive from the courses, with room for the clubs.',
    image: '/images/ge-premium-golf-fairway-coastal.webp',
    link: '/accommodation',
    cta: 'See the hotels'
  },
  step2: {
    eyebrow: 'STEP 2',
    title: 'Pick your Costa del Sol tee times.',
    body:
      'More than seventy courses sit between Málaga and Sotogrande. Tell us the ones you want and we request the tee times.',
    image: '/images/twilight-golf-hero.webp',
    link: '/golf-courses',
    cta: 'See the courses'
  },
  step3: {
    eyebrow: 'STEP 3',
    title: 'Pick the hotel Irish groups already love.',
    body:
      'Hotel Angela, Yaramar, Ilunion Fuengirola, Riu, Don Pablo, Sol Timor and Ocean House. Irish groups stay in these again and again. Already booked somewhere else? We work around that.',
    image: '/images/ge-premium-resort-hotel-hero.webp',
    link: '/accommodation',
    cta: 'See the hotels'
  },
  step4: {
    eyebrow: 'STEP 4',
    title: 'Leave the rest to us.',
    body:
      'We plan the rounds, book the transfers and meet you at Málaga arrivals.',
    image: '/images/transport-moment-arrivals.webp',
    link: '/contact',
    cta: 'Get a quote'
  }
} as const

/** Band above the “hotel booked” panel on the homepage — reinforces snapshot → continue flow. */
export const homeTripSnapshotBand = {
  title: 'Hotel sorted — add golf next',
  body:
    'Send a quick arrival snapshot and we carry it forward — course ideas, prime tee times, twilight rounds, transfers, and the rest of your week in one enquiry.'
} as const

/** Quick path for guests who already have a hotel — flight snapshot → continue page. */
export const alreadyBookedHotelCopy = {
  badge: 'Hotel already booked?',
  title: 'Hotel booked? Send the flight',
  subtitle:
    'If the stay is already sorted, send your arrival details. On the next screen you add courses, tee times and transfers.',
  flightLabel: 'Flight number',
  flightPlaceholder: 'e.g. FR 7044',
  arrivalLabel: 'Arrival time (local)',
  travelModePrompt: 'How should we track your arrival?',
  modeFlight: 'Flight number',
  modeArrived: 'Already arrived',
  collectionTimeLabel: 'Collection time',
  collectionTimeHint: 'You’re already on the Sol — tell us when to collect you from your hotel or address.',
  modeRequiredError: 'Choose “Flight number” or “Already arrived”, then complete the fields that appear.',
  nameLabel: 'Full name',
  mobileLabel: 'Mobile',
  mobileHint: 'Irish or Spanish number — we’ll WhatsApp you if the gate changes.',
  submit: 'Continue to full trip form',
  footnote: 'Takes ~20 seconds · No payment · Same Irish team on the other side',
  toggleCta: 'Already booked your hotel? Add flight details',
  toggleSub: 'Opens a quick snapshot — we carry it to the next page for the rest of your trip.',
  /** Shown under the CTA when the panel is closed — deep links for golf-only planners. */
  quickBookingIntro: 'Prefer to skip the flight step?',
  quickBookingTeeTimes: 'Tee time bookings',
  quickBookingTwilight: 'Twilight golf',
  closeForm: 'Hide form'
} as const

export const factsCopy = {
  eyebrow: 'Why book with us',
  title: 'Why GolfSol Ireland',
  pillars: [
    {
      title: 'Irish-owned, on the ground',
      body:
        'We are Irish and we live on the Costa del Sol. The plan is built for an Irish group, not a generic package.'
    },
    {
      title: 'Costa del Sol specialists',
      body:
        'Golf trips on the Costa del Sol are the whole job. Courses, hotels and the drive from Málaga Airport to Sotogrande.'
    },
    {
      title: 'Plane to fairway · 24/7 care',
      body:
        'From landing at Málaga to the last round, you have one Irish number. Flight delays, tee changes and lost clubs come to us, not a call centre.'
    }
  ],
  ctaKicker: 'Irish desk',
  ctaTitle: 'Tell us the dates. We’ll send the plan.',
  ctaLead: 'Group size, rough dates, and the courses you have in mind.',
  ctaSignals: [
    {
      label: 'Reply inside 24h',
      detail: 'Quote with rates · Mon–Sat'
    },
    {
      label: 'One Irish desk',
      detail: 'Same crew, same number, every leg'
    },
    {
      label: 'Plain-English plan',
      detail: 'Itinerary, transfers, rounds — one PDF'
    }
  ],
  ctaLabel: 'GET A QUOTE',
  ctaSecondaryLabel: 'WHATSAPP US NOW',
  ctaWhatsappHref:
    'https://wa.me/353868515000?text=Hi%20Golf%20Sol%20Ireland%20%E2%80%94%20can%20you%20design%20our%20Costa%20del%20Sol%20trip%3F',
  ctaAside: 'Málaga → Sotogrande · One crew · 24/7 on-trip care'
} as const

export const aboutCopy = {
  kicker: 'About GolfSol Ireland',
  eyebrow: 'About Us',
  title: 'About GolfSol Ireland',
  lead: 'One Irish team. Costa del Sol only. The week planned before you fly.',
  /** Short line under the logo on the photo plate. */
  imageTagline: 'Irish-owned · Costa del Sol golf specialists',
  /** Three small chips under the logo plate. */
  imageStats: ['Málaga → Sotogrande', 'Private vehicles', 'One Irish crew'],
  /** Small brand line beside the CTA on desktop. */
  ctaAside: 'Málaga to Sotogrande · One crew',
  paragraphs: [
    'GolfSol Ireland plans Costa del Sol golf trips for Irish societies, four-balls and families flying from Dublin, Cork, Shannon and Belfast.',
    'We are a licensed and bonded tour operator. The usual week includes a meet-and-greet at Málaga, a transfer with room for the clubs, and tee times requested before you fly.',
    'Same crew from the moment you land until we drop you back at the airport.'
  ],
  bodyEmphasis: 'Same crew. Same standard. Every single trip.',
  cta: 'READ OUR FULL STORY',
  /** Local asset — sunlit Costa del Sol fairway (Irish golfer on course). */
  image: '/images/about-golfsol-hero.webp'
} as const

export const finalCtaCopy = {
  title: 'Tell us your dates. We’ll plan the rest.',
  cta: 'Get a quote'
} as const

export const accommodationIntroCopy = {
  kicker: 'Costa del Sol stays',
  eyebrow: 'STEP 3',
  title: 'The Costa del Sol hotels Irish groups love',
  lead: 'Beachfront, resort & apartment bases · Fuengirola → Sotogrande',
  body:
    'Beachfront Fuengirola, Torremolinos resorts, and apartments for bigger groups. If you already have a hotel, we plan the golf and the transfers around it.',
  bodyEmphasis: 'Pick the base. We line up the rounds, the routes and the rates.',
  heroImage: '/images/ge-premium-resort-hotel-hero.webp',
  heroImageAlt:
    'Premium Costa del Sol resort stay — sunlit terrace and golf-trip hotel base for Irish groups',
  stats: [
    { value: '7+', label: 'Hand-picked bases' },
    { value: '4★', label: 'Beach & resort' },
    { value: '8–24', label: 'Typical group size' }
  ] as const,
  corridorStops: [
    { town: 'Fuengirola', hint: 'Paseo Marítimo' },
    { town: 'Torremolinos', hint: 'Classic resorts' },
    { town: 'Benalmádena', hint: 'Marina & clubs' },
    { town: 'Marbella', hint: 'Golf valley' },
    { town: 'Estepona', hint: 'Coastal calm' },
    { town: 'Sotogrande', hint: 'Championship base' }
  ] as const,
  signals: [
    {
      label: 'Beachfront 4★',
      detail: 'Fuengirola Paseo Marítimo & Torremolinos seafront'
    },
    {
      label: 'Group apartments',
      detail: '2-bed & 3-bed self-catering for societies of 8–24'
    },
    {
      label: 'Better rates',
      detail: 'Local-rate access · friendlier cancellation terms'
    }
  ]
} as const

export const courseListsCopy = {
  kicker: 'The courses',
  spainHeading: 'Costa del Sol Golf Courses',
  lead: 'Málaga to Sotogrande · 70+ courses',
  body:
    'From Sotogrande to the courses above Fuengirola. Tell us who is playing and which days, and we request the tee times.',
  bodyEmphasis: 'Pick the courses, we lock the times.',
  signals: [
    {
      label: '70+ courses',
      detail: 'Málaga to Sotogrande'
    },
    {
      label: 'Tee times requested',
      detail: 'We ask the course, then confirm with you'
    },
    {
      label: 'Irish groups',
      detail: 'Societies, four-balls and families'
    }
  ],
  cardCta: 'Quote this round',
  manyMore:
    '…and many more across the Sol corridor — from twilight rounds at La Cala to championship rotations through Sotogrande and Casares.',
  cta: 'GET TEE-TIME PRICING',
  secondaryCta: 'BUILD MY TEE SHEET'
} as const

export const hotelListsCopy = {
  kicker: 'Hand-picked properties',
  spainHeading: 'Hotels Irish Groups Love on the Costa del Sol',
  lead: 'Stay-and-play bases trusted by Irish societies',
  cta: 'GET A STAY-AND-PLAY QUOTE',
  secondaryCta: 'TALK TO US ABOUT GROUP STAYS',
  /** Shown under the grid — we book far beyond this sample. */
  beyondTitle: 'Not limited to what you see here',
  beyondBody:
    'This grid is a snapshot of properties Irish groups use often — not a closed list. If you already have a hotel, villa, or apartment in mind anywhere on the Sol (Marbella, Benalmádena, Estepona, Sotogrande, inland bases), send the name or link and we’ll build transfers, tee times and pricing around it.'
} as const

export const extrasCopy = {
  eyebrow: 'One itinerary · Irish team on the ground',
  title: 'The full Costa del Sol package.',
  lead: 'Tee sheet, transfers, hotel — one team, one itinerary.',
  body:
    'Send the dates, the courses you want and how many are travelling. We come back with the rounds, the transfers and the price.',
  subtitle: 'And we also handle',
  /** First tile — tee times & course planning (extras strip). */
  teeTimesStripTitle: 'Tee times & courses',
  teeTimesStripBody:
    'Society rounds, four-balls and shortlists across the Sol — paced to your transfers and hotel base.',
  teeTimesStripBadge: 'Irish groups · Costa del Sol',
  /** Second tile — transfers capacity (extras strip). */
  transfersCapacityTitle: 'Transfers',
  transfersCapacityBody:
    'Most vehicles seat 1–8 with golf bags. Larger group? Tell us in advance and we line up the right vehicle.',
  transfersCapacityBadge: '1–8 people per vehicle',
  /** Third tile in the extras strip. */
  transferInsuredTitle: 'Airport & course transfers',
  transferInsuredBody:
    'Every airport pickup and on-course transfer fully insured — drivers vetted, vehicles maintained on the Costa del Sol.',
  transferInsuredBadge: 'Fully insured on all transfers',
  /** Closer panel under the cards. */
  closerTitle: 'One quote. One team. One week.',
  closerBody:
    'Send us your dates and we come back with prices, options, and a clean breakdown — usually inside 24 hours.',
  primaryCta: 'GET MY FULL PACKAGE QUOTE',
  secondaryCta: 'BUILD MY ITINERARY'
} as const

export const aboutFooterCopy =
  'Irish-owned and based on the Costa del Sol, GolfSol Ireland is a fully bonded golf travel specialist, fully insured on all transfers, serving Irish societies, four-balls and groups of 8 people travelling to Spain’s Sol corridor.'
