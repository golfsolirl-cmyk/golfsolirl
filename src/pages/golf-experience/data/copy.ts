/**
 * Long-form copy for the GolfSol Ireland homepage.
 * Voice: Irish-owned, Costa del Sol specialist. We do not market golf outside
 * this corridor — content here is laser-focused on the Sol corridor
 * (Málaga → Sotogrande) where Irish groups travel most.
 */

export const contactInfo = {
  tagline: 'IRISH-OWNED · COSTA DEL SOL GOLF SPECIALISTS',
  phoneDisplay: '+353 87 446 4766',
  phoneTel: '+353874464766',
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
  'GolfSol Ireland — From plane to fairway. Meet-and-greet at Malaga, golf-bag friendly Mercedes transfers, tee times pre-booked. Irish and Spanish phone lines: +353 87 446 4766 and +34 641 81 53 66.' as const

/** Alt for the transport-page hero variant (premium van, chauffeur, golf bags at airport). */
export const transportHeroImageAlt =
  'GolfSol Ireland transport hero — premium black Mercedes van at a Mediterranean airport arrivals curb, chauffeur beside the vehicle, golf bags and clubs being loaded, warm golden-hour light, forest green and gold brand atmosphere.' as const

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
    'Meet and greet at AGP, live flight tracking, golf-bag-ready Mercedes, and a straight run to your hotel — no taxi queue, no guesswork.',
  fleetImageBadge: 'Golf-bag friendly Mercedes fleet',
  fleetImageSrc: '/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.webp',
  fleetImageAlt:
    'Premium Mercedes transfer vehicles on the Costa del Sol — golf-bag friendly fleet for Irish groups.',
  fleetCardLabel: 'Mercedes fleet',
  fleetCardBody:
    'E-Class, V-Class and Sprinter — matched to your group, clubs and trolley count.',
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
  kicker: 'Concierge-built trip design',
  title: 'Design your Costa del Sol golf trip',
  lead: 'Choose your base · tee times · stay — we handle transfers and the full week',
  bodyEmphasis: 'One Irish-led desk shapes the entire Sol itinerary around your group.',
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
      'Fuengirola, Torremolinos, Marbella or Sotogrande — every Sol resort town is within a short, golf-bag-friendly Mercedes transfer of the best courses in southern Spain.',
    image: '/images/ge-premium-golf-fairway-coastal.webp',
    link: '/#golf-courses-spain'
  },
  step2: {
    eyebrow: 'STEP 2',
    title: 'Pick your Costa del Sol tee times.',
    body:
      'Over seventy 18-hole courses sit between Málaga and Sotogrande — the highest density of golf anywhere in Europe. We hold preferential green-fee rates and live tee-sheet access on all of them, so we slot your group into the right course at the right time of day.',
    image: '/images/twilight-golf-hero.webp',
    link: '/#golf-courses-spain'
  },
  step3: {
    eyebrow: 'STEP 3',
    title: 'Pick the hotel Irish groups already love.',
    body:
      'We work directly with the Costa del Sol hotels Irish societies return to year after year — Hotel Angela, Yaramar, Ilunion Fuengirola, Riu, Don Pablo, Sol Timor and Ocean House. Better rates, friendlier cancellation terms, no surprises.',
    image: '/images/ge-premium-resort-hotel-hero.webp',
    link: '/#accommodation-spain'
  },
  step4: {
    eyebrow: 'STEP 4',
    title: 'Leave the rest to us.',
    body:
      'We design the itinerary, book the tees, lock in golf-bag-friendly Mercedes transfers and meet you at AGP arrivals — every detail from arrivals hall to final putt.',
    image: '/images/transport-moment-arrivals.webp',
    link: '/#enquire'
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
  title: 'Send us your flight snapshot first',
  subtitle:
    'If your stay is already locked in, skip the hotel hunt — drop your arrival details here. On the next screen you can add Costa del Sol golf courses, choose prime tee times or twilight slots, transfers and the rest of your week.',
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
        'We are Irish, we live on the Costa del Sol, and we know how Irish golf societies travel. Every itinerary, transfer and tee time is built around what works for an Irish group — not a generic European package.'
    },
    {
      title: 'Costa del Sol specialists',
      body:
        'We do one thing: golf trips on the Costa del Sol. That focus means we know every course, every hotel and every transfer route between Málaga airport and Sotogrande. No guesswork — just the right course at the right time.'
    },
    {
      title: 'Plane to fairway · 24/7 care',
      body:
        'From the moment you land at Málaga AGP to your final putt at Sotogrande, an Irish point of contact is one phone call (or WhatsApp) away — flight delays, late tee changes, lost clubs, we handle it. No call centres, no language barriers, no being passed around.'
    }
  ],
  ctaKicker: 'Concierge-built · Irish desk',
  ctaTitle: 'Let us design your perfect Costa del Sol golf trip.',
  ctaLead: 'Tell us your dates and group size — we come back with the full route.',
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
    'https://wa.me/353874464766?text=Hi%20Golf%20Sol%20Ireland%20%E2%80%94%20can%20you%20design%20our%20Costa%20del%20Sol%20trip%3F',
  ctaAside: 'Málaga → Sotogrande · One crew · 24/7 on-trip care'
} as const

export const aboutCopy = {
  kicker: 'About GolfSol Ireland',
  eyebrow: 'About Us',
  title: 'About GolfSol Ireland',
  lead: 'One Irish team. One Costa del Sol corridor. Every detail planned.',
  /** Short line under the logo on the photo plate. */
  imageTagline: 'Irish-owned · Costa del Sol golf specialists',
  /** Three small chips under the logo plate. */
  imageStats: ['Málaga → Sotogrande', 'Mercedes-only fleet', 'One Irish crew'],
  /** Small brand line beside the CTA on desktop. */
  ctaAside: 'Málaga to Sotogrande · One crew',
  paragraphs: [
    'GolfSol Ireland is an Irish-owned, Costa del Sol-based golf travel specialist built for Irish societies, four-balls and family groups travelling out of Dublin, Cork, Shannon and Belfast.',
    'We are licensed and bonded as a tour operator in full compliance with Spanish and EU travel law, with airport meet-and-greet, golf-bag-friendly Mercedes transfers and pre-booked tee times wrapped into every package.',
    'Our promise is simple — take care of every Irish group from the moment they land in Málaga to the moment we drop them back at the AGP terminal. Same crew, same standard, every single trip.'
  ],
  bodyEmphasis: 'Same crew. Same standard. Every single trip.',
  cta: 'READ OUR FULL STORY',
  /** Local asset so the hero always loads (no hotlink / 403 issues). */
  image: '/images/about-golfsol-hero.webp'
} as const

export const finalCtaCopy = {
  title: 'LET US DESIGN YOUR COSTA DEL SOL GOLF TRIP.',
  cta: 'GET A QUOTE'
} as const

export const accommodationIntroCopy = {
  kicker: 'Costa del Sol stays',
  eyebrow: 'STEP 3',
  title: 'The Costa del Sol hotels Irish groups love',
  lead: 'Beachfront, resort & apartment bases · Fuengirola → Sotogrande',
  body:
    'These are hand-picked Costa del Sol bases Irish societies and four-balls book again and again — beachfront in Fuengirola, classic Torremolinos resorts and apartment-style stays for big groups. Better rates, friendlier cancellation terms, every detail looked after by our team on the ground.',
  bodyEmphasis: 'Pick the base. We line up the rounds, the routes and the rates.',
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
  kicker: 'Costa del Sol tee sheet',
  spainHeading: 'Costa del Sol Golf Courses',
  lead: 'Málaga to Sotogrande · 70+ championship layouts',
  body:
    'Europe’s densest stretch of golf — from Ryder Cup hosts in Sotogrande to coast-line classics above Fuengirola. We hold preferential green-fee rates and live tee-sheet access, so your group plays the right course, at the right time of day, every day.',
  bodyEmphasis: 'Pick the courses, we lock the times.',
  signals: [
    {
      label: '70+ courses',
      detail: 'Across the Málaga – Sotogrande corridor'
    },
    {
      label: 'Live tee-sheet access',
      detail: 'Direct to course operators, not third-party brokers'
    },
    {
      label: 'Preferential green-fee rates',
      detail: 'Negotiated for Irish societies and four-balls'
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
    'Stop juggling four bookings and three WhatsApp groups. Tell us your dates, course wishlist and group size — we plan the round, route the Mercedes and lock the rates with our team on the ground in southern Spain.',
  subtitle: 'And we also handle',
  /** First tile — tee times & course planning (extras strip). */
  teeTimesStripTitle: 'Tee times & courses',
  teeTimesStripBody:
    'Society rounds, four-balls and shortlists across the Sol — paced to your transfers and hotel base.',
  teeTimesStripBadge: 'Irish groups · Plain English',
  /** Second tile — transfers capacity (extras strip). */
  transfersCapacityTitle: 'Transfers',
  transfersCapacityBody:
    'Most vehicles seat 1–8 with golf bags. Larger group? Tell us in advance and we line up the right Mercedes capacity.',
  transfersCapacityBadge: '1–8 people per vehicle',
  /** Third tile in the extras strip. */
  transferInsuredTitle: 'Airport & course transfers',
  transferInsuredBody:
    'Every airport pickup and on-course transfer fully insured — drivers vetted, vehicles maintained on the Costa del Sol.',
  transferInsuredBadge: 'Fully insured on all transfers',
  /** Closer panel under the cards. */
  closerTitle: 'One quote. One team. One Costa del Sol itinerary.',
  closerBody:
    'Send us your dates and we come back with prices, options, and a clean breakdown — usually inside 24 hours.',
  primaryCta: 'GET MY FULL PACKAGE QUOTE',
  secondaryCta: 'BUILD MY ITINERARY'
} as const

export const aboutFooterCopy =
  'Irish-owned and based on the Costa del Sol, GolfSol Ireland is a fully bonded golf travel specialist serving Irish societies, four-balls and family groups travelling to Spain’s Sol corridor.'
