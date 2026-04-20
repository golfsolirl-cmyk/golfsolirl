/**
 * Long-form copy for the GolfSol Ireland homepage.
 * Voice: Irish-owned, Costa del Sol specialist. We do not market golf in
 * Portugal or Morocco — content here is laser-focused on the Sol corridor
 * (Málaga → Sotogrande) where Irish groups travel most.
 */

export const contactInfo = {
  tagline: 'IRISH-OWNED · COSTA DEL SOL GOLF SPECIALISTS',
  phoneDisplay: '+353 87 446 4766',
  phoneTel: '+353874464766',
  email: 'hello@golfsolireland.ie'
} as const

/** Alt text for the brand-composed Malaga hero raster (homepage). */
export const malagaHeroImageAlt =
  'GolfSol Ireland — From plane to fairway. Meet-and-greet at Malaga, golf-bag friendly Mercedes transfers, tee times pre-booked. Call +353 87 446 4766.' as const

/** Alt for the transport-page hero variant (premium van, chauffeur, golf bags at airport). */
export const transportHeroImageAlt =
  'GolfSol Ireland transport hero — premium black Mercedes van at a Mediterranean airport arrivals curb, chauffeur beside the vehicle, golf bags and clubs being loaded, warm golden-hour light, forest green and gold brand atmosphere.' as const

export const heroCopy = {
  title: 'YOUR COSTA DEL SOL GOLF TRIP STARTS RIGHT HERE.',
  cta: 'GET A QUOTE'
} as const

export const designYourPackage = {
  title: 'Design Your Costa del Sol Golf Trip',
  step1Tag: 'Pick Your Costa del Sol Base',
  step2Tag: 'Pick Your Tee Times',
  step3Tag: 'Pick Your Hotel',
  closer: 'Leave the rest to us.',
  step1: {
    eyebrow: 'STEP 1',
    title: 'Pick your Costa del Sol base.',
    body:
      'Fuengirola, Torremolinos, Marbella or Sotogrande — every Sol resort town is within a short, golf-bag-friendly Mercedes transfer of the best courses in southern Spain.',
    image:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    link: '/#golf-courses-spain'
  },
  step2: {
    eyebrow: 'STEP 2',
    title: 'Pick your Costa del Sol tee times.',
    body:
      'Over seventy 18-hole courses sit between Málaga and Sotogrande — the highest density of golf anywhere in Europe. We hold preferential green-fee rates and live tee-sheet access on all of them, so we slot your group into the right course at the right time of day.',
    image:
      'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80',
    link: '/#golf-courses-spain'
  },
  step3: {
    eyebrow: 'STEP 3',
    title: 'Pick the hotel Irish groups already love.',
    body:
      'We work directly with the Costa del Sol hotels Irish societies return to year after year — Hotel Angela, Yaramar, Ilunion Fuengirola, Riu, Don Pablo, Sol Timor and Ocean House. Better rates, friendlier cancellation terms, no surprises.',
    image:
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    link: '/#accommodation-spain'
  }
} as const

/** Quick path for guests who already have a hotel — flight snapshot → continue page. */
export const alreadyBookedHotelCopy = {
  badge: 'Hotel already booked?',
  title: 'Send us your flight snapshot first',
  subtitle:
    'If your stay is already locked in, skip the hotel hunt — drop your arrival details here. On the next screen you can add courses, transfers and the rest of your week.',
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
  ctaTitle: 'Let us design your perfect Costa del Sol golf trip.',
  ctaLabel: 'GET A QUOTE'
} as const

export const aboutCopy = {
  eyebrow: 'About Us',
  title: 'About GolfSol Ireland',
  paragraphs: [
    'GolfSol Ireland is an Irish-owned, Costa del Sol-based golf travel specialist built for Irish societies, four-balls and family groups travelling out of Dublin, Cork, Shannon and Belfast.',
    'We are licensed and bonded as a tour operator in full compliance with Spanish and EU travel law, with airport meet-and-greet, golf-bag-friendly Mercedes transfers and pre-booked tee times wrapped into every package.',
    'Our promise is simple — take care of every Irish group from the moment they land in Málaga to the moment we drop them back at the AGP terminal. Same crew, same standard, every single trip.'
  ],
  cta: 'LEARN MORE',
  /** Local asset so the hero always loads (no hotlink / 403 issues). */
  image: '/images/about-golfsol-hero.jpg'
} as const

export const finalCtaCopy = {
  title: 'LET US DESIGN YOUR COSTA DEL SOL GOLF TRIP.',
  cta: 'GET A QUOTE'
} as const

export const accommodationIntroCopy = {
  eyebrow: 'STEP 3',
  title: 'The Costa del Sol hotels Irish groups love',
  body:
    'These are the seven Costa del Sol properties Irish societies and four-balls return to season after season — beachfront in Fuengirola, classic Torremolinos resorts and apartment-style stays for big groups. Better rates, friendlier cancellation terms, every detail looked after by our team on the ground.'
} as const

export const courseListsCopy = {
  spainHeading: 'Costa del Sol Golf Courses',
  manyMore: '…and many more across the Sol corridor.',
  cta: 'GET TEE-TIME PRICING'
} as const

export const hotelListsCopy = {
  spainHeading: 'Hotels Irish Groups Love on the Costa del Sol',
  cta: 'GET A STAY-AND-PLAY QUOTE'
} as const

export const extrasCopy = {
  title: 'The full Costa del Sol package.',
  subtitle: 'And we also handle:'
} as const

export const aboutFooterCopy =
  'Irish-owned and based on the Costa del Sol, GolfSol Ireland is a fully bonded golf travel specialist serving Irish societies, four-balls and family groups travelling to Spain’s Sol corridor.'
