import { footerArticlePages, type FooterArticleContent } from '../../../data/footer-article-pages'

export interface GeContentPageSection {
  readonly title: string
  readonly body: string
  readonly bullets?: readonly string[]
}

export interface GeContentPageData {
  readonly metaTitle: string
  readonly eyebrow: string
  readonly title: string
  readonly subtitle: string
  readonly heroImage: string
  readonly heroAlt: string
  readonly highlights: readonly string[]
  readonly sections: readonly GeContentPageSection[]
  readonly formTitle: string
  readonly formLead: string
  readonly interestPreset: string
  readonly enquiryType?: 'booking' | 'legal' | 'newsletter' | 'testimonial' | 'support'
}

const trustHighlights = [
  'Irish-owned support from first call',
  'Clear next steps in plain English',
  'Fast replies for group organisers'
] as const

function getFooterArticleEyebrow(kicker: string) {
  const [prefix] = kicker.split('—')
  return prefix.trim() || 'Planning'
}

function getFooterArticleHighlights(content: FooterArticleContent) {
  const articleBullets = content.sections.flatMap((section) => section.bullets ?? [])
  return [...articleBullets, ...trustHighlights].slice(0, 3)
}

function getFooterArticleHeroImage(path: string) {
  if (path.includes('airport') || path.includes('transfer') || path.includes('routing')) {
    return '/images/transport-hero-coastal-drive.jpg'
  }
  if (path.includes('hotel') || path.includes('accommodation')) {
    return '/images/ge-premium-resort-hotel-hero.png'
  }
  if (path.includes('course')) {
    return '/images/ge-premium-golf-fairway-coastal.png'
  }
  if (
    path.includes('package') ||
    path.includes('itinerary') ||
    path.includes('group') ||
    path.includes('deposit') ||
    path.includes('balance') ||
    path.includes('enquiry')
  ) {
    return '/images/transport-fleet-lineup.jpg'
  }
  return '/images/ge-premium-golf-fairway-coastal.png'
}

function getFooterArticleHeroAlt(path: string, content: FooterArticleContent) {
  if (path.includes('airport') || path.includes('transfer') || path.includes('routing')) {
    return 'Golf Sol Ireland transport planning and Costa del Sol route support.'
  }
  if (path.includes('hotel') || path.includes('accommodation')) {
    return 'Costa del Sol hotel and resort options for Irish golf groups.'
  }
  if (path.includes('course')) {
    return 'Costa del Sol golf course planning and shortlist guidance.'
  }
  return `${content.heroTitle} - Golf Sol Ireland planning page.`
}

function getFooterArticleFormTitle(path: string) {
  if (path.includes('airport') || path.includes('transfer') || path.includes('routing')) {
    return 'Request transport guidance'
  }
  if (path.includes('hotel') || path.includes('accommodation')) {
    return 'Get matched hotel options'
  }
  if (path.includes('course')) {
    return 'Build your course shortlist'
  }
  if (path.includes('terms')) {
    return 'Ask about terms'
  }
  return 'Talk this through with us'
}

function getFooterArticleFormLead(path: string) {
  if (path.includes('airport') || path.includes('transfer') || path.includes('routing')) {
    return 'Share your dates, airport, or route questions and we will map the cleanest next step.'
  }
  if (path.includes('hotel') || path.includes('accommodation')) {
    return 'Tell us the trip dates and preferred location and we will come back with the right stay options.'
  }
  if (path.includes('course')) {
    return 'Send your dates and group details and we will point you toward the right rounds quickly.'
  }
  if (path.includes('terms')) {
    return 'Send the clause or question you want clarified and we will answer directly.'
  }
  return 'Send a short brief and we will come back with a practical next step.'
}

function convertFooterArticlePage(path: string, content: FooterArticleContent): GeContentPageData {
  return {
    metaTitle: content.metaTitle,
    eyebrow: getFooterArticleEyebrow(content.kicker),
    title: content.heroTitle,
    subtitle: content.heroBody,
    heroImage: getFooterArticleHeroImage(path),
    heroAlt: getFooterArticleHeroAlt(path, content),
    highlights: getFooterArticleHighlights(content),
    sections: content.sections,
    formTitle: getFooterArticleFormTitle(path),
    formLead: getFooterArticleFormLead(path),
    interestPreset: content.heroTitle,
    enquiryType: path.includes('terms') ? 'legal' : 'support'
  }
}

const convertedFooterArticlePages: Record<string, GeContentPageData> = Object.fromEntries(
  Object.entries(footerArticlePages).map(([path, content]) => [path, convertFooterArticlePage(path, content)])
) as Record<string, GeContentPageData>

const contactPage: GeContentPageData = {
  metaTitle: 'Contact | GolfSol Ireland',
  eyebrow: 'Contact',
  title: 'Get your golf holiday quote quickly',
  subtitle:
    'Tell us the basics and we come back with clear options. No pressure, no long forms, no wasted time.',
  heroImage: '/images/transport-fleet-lineup.jpg',
  heroAlt: 'GolfSol Ireland transport fleet and premium Costa del Sol travel service.',
  highlights: trustHighlights,
  sections: [
    {
      title: 'What to send us',
      body:
        'Your dates, group size, and any must-play courses or hotel preferences are enough to start. We refine from there.',
      bullets: ['Quick first response', 'Clear choices to compare', 'Practical next actions']
    },
    {
      title: 'How we support you',
      body:
        'From first quote to final transfer timing, we keep one joined-up plan and one team accountable.',
      bullets: ['Irish-owned communication', 'Costa del Sol specialists only', 'Built for groups and societies']
    }
  ],
  formTitle: 'Start your quote request',
  formLead: 'Use this short form and we will come back with clear, actionable options.',
  interestPreset: 'General quote request',
  enquiryType: 'booking'
}

const termsPage: GeContentPageData = {
  metaTitle: 'Terms & Conditions | GolfSol Ireland',
  eyebrow: 'Legal',
  title: 'Terms and conditions for GolfSol Ireland bookings',
  subtitle:
    'Clear booking terms for deposits, supplier changes, golf course issues, accommodation problems, cancellations and liability before your group commits.',
  heroImage: '/images/transport-fleet-lineup.jpg',
  heroAlt: 'Clear terms and reliable service for golf travel planning.',
  highlights: trustHighlights,
  sections: [
    {
      title: 'Booking, deposit and balance',
      body:
        'Your booking is not confirmed until GolfSol Ireland confirms supplier availability in writing and receives the required payment. Unless your written proposal states otherwise, a 20% deposit is payable upfront and the remaining 80% balance is due within five days of booking confirmation.',
      bullets: [
        'The 20% deposit holds requested golf, accommodation, transfer and itinerary arrangements while suppliers confirm space.',
        'The deposit is refundable only when you cancel within 48 hours of paying it and before supplier non-refundable costs have been committed.',
        'After the 48-hour cooling-off period, the 20% deposit is non-refundable because supplier work, availability holds and administration have started.'
      ]
    },
    {
      title: 'Hotels, accommodation and third-party suppliers',
      body:
        'GolfSol Ireland plans and coordinates your trip using hotels, resorts, golf courses, transport providers and other third-party suppliers. We are responsible for using reasonable care when arranging your booking, but we do not own or control those suppliers.',
      bullets: [
        'If a hotel, resort or accommodation provider changes room type, facilities, allocation, pricing, service level or availability, we will help seek a practical alternative but cannot be liable for the supplier failure itself.',
        'If a golf course changes a tee time, closes a course, changes buggy policy, alters pricing or refuses play under its own rules, the course terms apply.',
        'Supplier cancellation, refund and amendment rules may be stricter than GolfSol Ireland terms and will apply where they are part of the confirmed booking.'
      ]
    },
    {
      title: 'Cancellations, reductions and no-shows',
      body:
        'Cancellations and group reductions affect tee times, hotel rooms, transfers and package pricing. Tell us as early as possible so we can reduce cost where suppliers allow it.',
      bullets: [
        'Any cancellation after the 48-hour deposit refund window may result in loss of deposit and any additional supplier charges already committed.',
        'If group numbers reduce, fixed costs such as transfers and group-priced golf or accommodation may increase the per-person price for remaining travellers.',
        'Golf no-shows, missed transfers, late arrivals and unused accommodation nights are normally charged in full unless the relevant supplier agrees otherwise.'
      ]
    },
    {
      title: 'Weather, course conditions and buggies',
      body:
        'Golf courses make final decisions on course closure, course condition, buggy use, pace of play and grouping on the day. Do not assume a course is closed or skip a tee time without checking with us or the course first.',
      bullets: [
        'If a course officially closes, we will seek the refund, credit or replacement round made available by that course.',
        'If the course remains open and your group chooses not to play, the tee time is usually treated as used.',
        'Buggy inclusion depends on each course offer and player numbers; odd-player groups may need to share, walk or pay locally for an extra buggy.'
      ]
    },
    {
      title: 'Liability and protection',
      body:
        'We do not accept responsibility for losses caused by suppliers, airlines, hotels, golf courses, transport operators, weather, strikes, illness, force majeure, guest conduct or events outside our reasonable control. Nothing in these terms limits liability where Irish law does not allow it.',
      bullets: [
        'Travel insurance is strongly recommended for every traveller and should cover cancellation, medical issues, missed flights, baggage, golf equipment and supplier disruption.',
        'Our maximum liability, where a legal claim is proven against GolfSol Ireland, is limited to the amount paid to us for the affected service, except where law requires otherwise.',
        'We will always try to assist with supplier issues, but assistance does not mean we accept liability for another company’s mistake.'
      ]
    }
  ],
  formTitle: 'Ask about terms',
  formLead: 'Send your question and we will clarify terms before you proceed.',
  interestPreset: 'Terms and conditions enquiry',
  enquiryType: 'legal'
}

const privacyPage: GeContentPageData = {
  metaTitle: 'Privacy Policy | GolfSol Ireland',
  eyebrow: 'Legal',
  title: 'Privacy policy summary in plain language',
  subtitle:
    'We use your enquiry details to plan and communicate about your trip. We keep this practical, transparent, and respectful.',
  heroImage: '/images/about-golfsol-hero.jpg',
  heroAlt: 'Secure and trusted handling of customer enquiry information.',
  highlights: trustHighlights,
  sections: [
    {
      title: 'What we collect',
      body:
        'Typically your contact details and trip preferences submitted through enquiry forms. This helps us return relevant options.',
      bullets: ['Name, email, and phone contact', 'Trip dates and preferences', 'Communication history for support continuity']
    },
    {
      title: 'How we use it',
      body:
        'We use submitted information to respond, prepare quotes, and manage booking communication when requested.',
      bullets: ['No unrelated spam campaigns', 'Data used for travel planning context', 'Ask us if you want details updated or removed']
    }
  ],
  formTitle: 'Ask a privacy question',
  formLead: 'If you need clarification on data handling, send a quick request here.',
  interestPreset: 'Privacy policy enquiry',
  enquiryType: 'legal'
}

const teeTimeOnlyPage: GeContentPageData = {
  metaTitle: 'Tee Time Bookings Only | GolfSol Ireland',
  eyebrow: 'Services',
  title: 'Tee-time bookings only, if your hotel is already sorted',
  subtitle:
    'Need golf only? We can shortlist and secure the right rounds without repackaging your whole trip. Fast, clear, and suited to Irish groups.',
  heroImage: '/images/about-golfsol-hero.jpg',
  heroAlt: 'Costa del Sol golf fairway in warm sunlight.',
  highlights: trustHighlights,
  sections: [
    {
      title: 'Course selection with real context',
      body:
        'We recommend rounds by driving distance, pace of play, and handicap spread so you avoid slow days and awkward transfers.',
      bullets: ['Premium and value course mixes', 'Single-day or full-week blocks', 'Backup options for full tee sheets']
    },
    {
      title: 'Early bird, twilight, and the full day sheet',
      body:
        'Sol courses price and pace differently across the day. We line up earlies when you want cool air and a long lunch after, twilights when value and golden-hour golf matter, and prime mid-morning blocks when only the flagship tee sheet will do.',
      bullets: [
        'Early bird — first off, quiet fairways, ideal after a late Dublin / Cork arrival',
        'Twilight — softer green fees, forgiving light, easier run to dinner in Puerto Banús or Fuengirola',
        'Prime morning (≈08:30–10:30) — championship courses at their best; we hold alternates if the diary moves',
        'Midday / shoulder slots — smart for mixed-handicap groups or a second nine without a crack-of-dawn repeat',
        'Society spacing — buffer between matches, buggies pre-requested, shotgun vs tee-start explained in plain English'
      ]
    },
    {
      title: 'Booking flow',
      body:
        'You get straightforward options and timings, then we confirm what is available and lock it in once you approve.',
      bullets: ['Clear slot-by-slot confirmations', 'Plain pricing in euro', 'Quick updates on schedule changes']
    }
  ],
  formTitle: 'Get tee-time options',
  formLead: 'Tell us your dates and group size and we will return a clean shortlist.',
  interestPreset: 'Tee time bookings only',
  enquiryType: 'booking'
}

const twilightGolfPage: GeContentPageData = {
  metaTitle: 'Twilight Golf Costa del Sol | GolfSol Ireland',
  eyebrow: 'Services',
  title: 'Twilight golf on the Costa del Sol — golden-hour rounds, smarter pacing',
  subtitle:
    'Late-afternoon tee times pair softer green fees with forgiving light and an easier run to dinner in Marbella, Fuengirola or Puerto Banús. We shortlist courses that run twilight sheets well for Irish groups.',
  heroImage: '/images/twilight-golf-hero.jpg',
  heroAlt:
    'Costa del Sol golf fairway at twilight — long shadows on manicured grass, warm golden sky above the Mediterranean horizon.',
  highlights: trustHighlights,
  sections: [
    {
      title: 'Why twilight works for travelling groups',
      body:
        'After an early flight or a travel day, a prime morning tee is not always realistic. Twilight slots keep the first full day flexible while still getting a quality round in before sunset.',
      bullets: [
        'Softer light for mixed-handicap groups',
        'Often better value than mid-morning championship slots',
        'Easier handover to evening plans — tapas, hotel dinners, early night before a big round'
      ]
    },
    {
      title: 'Course choice matters at dusk',
      body:
        'Not every layout finishes comfortably before dark in winter months. We factor sunset tables, buggy policy, and how fast your four-ball really plays.',
      bullets: ['Realistic last-tee advice for your month', 'Backup options if the diary shifts', 'Plain-English pace notes for captains']
    },
    {
      title: 'Pair twilight with prime morning rounds',
      body:
        'Most weeks mix one or two twilights with flagship morning rounds — same trip, better rhythm. Tell us your hotel base and we sequence driving time sensibly.',
      bullets: ['Route-aware day planning', 'Transfers aligned to tee windows', 'One Irish coordinator for the week']
    }
  ],
  formTitle: 'Request twilight tee-time options',
  formLead: 'Share dates, group size and area on the Sol — we return twilight-friendly shortlists with clear times and next steps.',
  interestPreset: 'Twilight golf Costa del Sol',
  enquiryType: 'booking'
}

const aboutPage: GeContentPageData = {
  metaTitle: 'About GolfSol Ireland',
  eyebrow: 'About',
  title: 'Irish-owned Costa del Sol golf specialists',
  subtitle:
    'We focus on one thing: helping Irish golfers book cleaner, calmer, better-planned golf holidays on the Costa del Sol.',
  heroImage: '/images/about-golfsol-hero.jpg',
  heroAlt: 'GolfSol Ireland team style and premium Costa del Sol golf setting.',
  highlights: trustHighlights,
  sections: [
    {
      title: 'Built for Irish groups',
      body:
        'Our planning style is designed around how Irish groups travel, budget, and make decisions. We keep everything straightforward from enquiry to travel week.',
      bullets: ['Irish-first communication style', 'No generic one-size package', 'Practical support for captains']
    },
    {
      title: 'Costa del Sol focus only',
      body:
        'We stay focused on the Sol corridor so your recommendations come from real route, course, and hotel context.',
      bullets: ['Málaga to Sotogrande expertise', 'Reliable supplier relationships', 'Clear, useful recommendations']
    }
  ],
  formTitle: 'Talk to our team',
  formLead: 'Share your dates and group details and we will guide the right next step.',
  interestPreset: 'About GolfSol Ireland',
  enquiryType: 'support'
}

const bookingPage: GeContentPageData = {
  metaTitle: 'Booking | GolfSol Ireland',
  eyebrow: 'Booking',
  title: 'Booking flow that stays clear at every step',
  subtitle:
    'We keep bookings simple: clear options, clear pricing, clear next actions, and one Irish team handling the details.',
  heroImage: '/images/transport-fleet-lineup.jpg',
  heroAlt: 'Golf travel booking coordination with premium transfer fleet.',
  highlights: trustHighlights,
  sections: [
    {
      title: 'How we move from enquiry to confirmation',
      body:
        'First we shape options with your group profile, then we confirm the preferred plan and provide straightforward payment milestones.',
      bullets: ['Clear quote with scope', 'Practical hold and confirm timing', 'One point of contact throughout']
    },
    {
      title: 'No admin overload for organisers',
      body:
        'We provide concise updates and simple checklists so captains do not have to chase details across multiple suppliers.',
      bullets: ['Committee-friendly summaries', 'Clear deadlines', 'Fast responses to changes']
    }
  ],
  formTitle: 'Start booking support',
  formLead: 'Send your dates and group details and we will outline the cleanest booking path.',
  interestPreset: 'Booking support',
  enquiryType: 'booking'
}

const transportOverviewPage: GeContentPageData = {
  metaTitle: 'Transport | GolfSol Ireland',
  eyebrow: 'Transport',
  title: 'Reliable golf transport from AGP to your final round',
  subtitle:
    'Airport runs, hotel shuttles, and golf-day transfers handled by one coordinated team that understands group golf travel.',
  heroImage: '/images/transport-hero-coastal-drive.jpg',
  heroAlt: 'Mercedes transfer vehicle on Costa del Sol motorway route.',
  highlights: trustHighlights,
  sections: [
    {
      title: 'Planned for golf bags and group timing',
      body:
        'Vehicles are matched to passenger and luggage load so your arrivals and golf-day transfers stay smooth and punctual.',
      bullets: ['Golf-bag friendly planning', 'Realistic route timing', 'Simple day-by-day transfer notes']
    },
    {
      title: 'One transport plan for the week',
      body:
        'We avoid fragmented journeys and keep your movement plan consistent from airport arrival through departure.',
      bullets: ['Airport to hotel flow', 'Golf-day movement support', 'Clear contact path']
    }
  ],
  formTitle: 'Request transport planning',
  formLead: 'Share your route and dates and we will return a clear transfer plan.',
  interestPreset: 'Transport planning',
  enquiryType: 'booking'
}

const coursesPage: GeContentPageData = {
  metaTitle: 'Costa del Sol Golf Courses | GolfSol Ireland',
  eyebrow: 'Golf Courses',
  title: 'Costa del Sol course options, narrowed to what matters',
  subtitle:
    'No endless scrolling. We help you choose courses that match your group, base, and trip rhythm so every round has purpose.',
  heroImage: '/images/about-golfsol-hero.jpg',
  heroAlt: 'Wide Costa del Sol golf course with mountain and sea backdrop.',
  highlights: trustHighlights,
  sections: [
    {
      title: 'Shortlists, not overload',
      body:
        'We filter by travel times, challenge level, and group preferences to keep your list focused and easy to decide.',
      bullets: ['Championship picks with realistic routing', 'Balanced challenge across the week', 'Clear alternatives if tee sheets move']
    },
    {
      title: 'Local clarity',
      body:
        'Our recommendations come from practical Costa del Sol experience, not generic destination copy.',
      bullets: ['Marbella to Sotogrande coverage', 'Quick notes on pace and atmosphere', 'Straightforward pricing context']
    }
  ],
  formTitle: 'Get a course shortlist',
  formLead: 'Share your dates, group size, and the course(s) you want — or ask us to shortlist — and we will reply with clear options.',
  interestPreset: 'Costa del Sol courses',
  enquiryType: 'booking'
}

const accommodationPage: GeContentPageData = {
  metaTitle: 'Accommodation | GolfSol Ireland',
  eyebrow: 'Accommodation',
  title: 'Costa del Sol accommodation matched to your golf trip',
  subtitle:
    'We help you choose the right base fast, with clear trade-offs between location, budget, and group style.',
  heroImage: '/images/transport-moment-resort.jpg',
  heroAlt: 'Costa del Sol hotel and resort accommodation for golfers.',
  highlights: trustHighlights,
  sections: [
    {
      title: 'Stay options that fit your group',
      body:
        'From practical 3-star to premium 5-star, we match your accommodation tier to your priorities and your golf schedule.',
      bullets: ['Room mix support for groups', 'Location context in plain language', 'Direct links to golf-day routing']
    },
    {
      title: 'No confusing choices',
      body:
        'Instead of endless listings, you get focused options with clear reasons each one works.',
      bullets: ['Short, actionable hotel lists', 'Budget-aware recommendations', 'Smooth handover to booking']
    }
  ],
  formTitle: 'Get matched hotel options',
  formLead: 'Share your dates and group size and we will return clean accommodation choices.',
  interestPreset: 'Accommodation matching',
  enquiryType: 'booking'
}

const testimonialsPage: GeContentPageData = {
  metaTitle: 'Testimonials | GolfSol Ireland',
  eyebrow: 'Trust',
  title: 'Why Irish golfers trust GolfSol Ireland',
  subtitle:
    'Groups choose us because we keep the trip clear, calm, and joined up from enquiry through travel week.',
  heroImage: '/images/about-golfsol-hero.jpg',
  heroAlt: 'Irish golf group enjoying Costa del Sol fairways and sunshine.',
  highlights: trustHighlights,
  sections: [
    {
      title: 'What people value most',
      body:
        'Clear communication, realistic recommendations, and one team that stays accountable all week are the themes we hear most.',
      bullets: ['Fast and useful replies', 'No generic package confusion', 'Support that feels personal']
    },
    {
      title: 'Share your experience',
      body:
        'If your group has travelled with us, we would love a short testimonial to help new organisers make decisions faster.',
      bullets: ['Quick submission process', 'Useful for other Irish groups', 'Can include society or first name only']
    }
  ],
  formTitle: 'Send a testimonial or request',
  formLead: 'Use this form to request details or share feedback from your trip.',
  interestPreset: 'Testimonials and feedback',
  enquiryType: 'testimonial'
}

const faqPage: GeContentPageData = {
  metaTitle: 'FAQ | GolfSol Ireland',
  eyebrow: 'Help',
  title: 'Frequently asked questions, answered clearly',
  subtitle:
    'The key answers most Irish groups need before committing: payments, timing, transfers, and how the booking process actually works.',
  heroImage: '/images/transport-moment-arrivals.jpg',
  heroAlt: 'Airport arrivals and transfer coordination for frequently asked travel questions.',
  highlights: trustHighlights,
  sections: [
    {
      title: 'Common planning questions',
      body:
        'Most organisers ask about deposits, cancellation windows, tee-time certainty, and group-size pricing. We explain these upfront.',
      bullets: ['Simple payment milestones', 'What is confirmed and when', 'How changes are handled']
    },
    {
      title: 'Need a direct answer?',
      body:
        'If your question is specific to your dates or group, send it through and we will answer directly.',
      bullets: ['Fast response from Ireland', 'No chatbot runaround', 'Clear next step with each reply']
    }
  ],
  formTitle: 'Ask your question',
  formLead: 'Send your question here and we will respond with a direct answer.',
  interestPreset: 'FAQ request',
  enquiryType: 'support'
}

const newsPage: GeContentPageData = {
  metaTitle: 'Sol Insider News | GolfSol Ireland',
  eyebrow: 'Updates',
  title: 'Sol Insider news for Irish golf travellers',
  subtitle:
    'Quick, useful updates: course notes, seasonal windows, and practical travel guidance that helps you decide faster.',
  heroImage: '/images/about-golfsol-hero.jpg',
  heroAlt: 'Costa del Sol golf travel updates and seasonal conditions.',
  highlights: trustHighlights,
  sections: [
    {
      title: 'What we publish',
      body:
        'Short updates focused on planning value: not fluff. We keep this useful for organisers and repeat groups.',
      bullets: ['Seasonal course timing notes', 'Hotel and transfer updates', 'Practical planning reminders']
    },
    {
      title: 'Stay informed without spam',
      body:
        'If you want news, we can send occasional updates with clear relevance to Irish golf travel.',
      bullets: ['Low-frequency updates', 'No hard-sell tone', 'Useful links to next actions']
    }
  ],
  formTitle: 'Request latest planning updates',
  formLead: 'Drop your details and we will send the right information for your dates.',
  interestPreset: 'Sol insider news',
  enquiryType: 'support'
}

const newsletterPage: GeContentPageData = {
  metaTitle: 'Newsletter | GolfSol Ireland',
  eyebrow: 'Stay Updated',
  title: 'Join our newsletter for useful golf travel updates',
  subtitle:
    'Get concise updates when they are relevant: no constant emails, just practical insights for Irish golfers planning the Sol.',
  heroImage: '/images/about-golfsol-hero.jpg',
  heroAlt: 'Costa del Sol golf travel newsletter and planning updates.',
  highlights: trustHighlights,
  sections: [
    {
      title: 'What you get',
      body:
        'Course timing notes, travel reminders, and occasional offers that make planning easier for captains and repeat groups.',
      bullets: ['Low-volume, high-signal emails', 'Practical travel and routing guidance', 'Seasonal golf planning tips']
    },
    {
      title: 'Easy to control',
      body:
        'You can update preferences or stop updates anytime. We keep communication respectful and useful.',
      bullets: ['Simple opt-out', 'No aggressive marketing', 'Focused on Irish golfer needs']
    }
  ],
  formTitle: 'Join the newsletter',
  formLead: 'Drop your details and we will include you in relevant updates.',
  interestPreset: 'Newsletter signup',
  enquiryType: 'newsletter'
}

const coreGeContentPages: Record<string, GeContentPageData> = {
  '/about': aboutPage,
  '/booking': bookingPage,
  '/transport': transportOverviewPage,
  '/tee-time-bookings-only': teeTimeOnlyPage,
  '/twilight-golf': twilightGolfPage,
  '/testimonials': testimonialsPage,
  '/faq': faqPage,
  '/news': newsPage,
  '/newsletter': newsletterPage,
  '/contact': contactPage,
  '/contact/golf-holiday-enquiry-form': contactPage,
  '/contact/give-a-testimonial': testimonialsPage,
  '/contact/privacy-policy': privacyPage,
  '/terms-conditions': termsPage,
  '/privacy-policy': privacyPage,
  '/terms-and-conditions': termsPage,
  '/links-and-information/dress-code-for-golf-in-spain': {
    ...faqPage,
    metaTitle: 'Dress Code Guide | GolfSol Ireland',
    eyebrow: 'Travel Guide',
    title: 'Dress code guide for Costa del Sol golf courses',
    subtitle: 'Avoid awkward surprises at check-in with practical, course-ready clothing guidance.',
    interestPreset: 'Dress code guidance'
  },
  '/links-and-information/travelling-to-spain': {
    ...transportOverviewPage,
    metaTitle: 'Travelling to Spain | GolfSol Ireland',
    eyebrow: 'Travel Guide',
    title: 'Travelling to Spain for Costa del Sol golf groups',
    subtitle: 'From flight timings to arrival flow, keep first-day logistics calm and straightforward.',
    interestPreset: 'Travel to Spain'
  },
  '/guides/dress-code-costa-del-sol': {
    ...faqPage,
    metaTitle: 'Dress Code Guide | GolfSol Ireland',
    eyebrow: 'Travel Guide',
    title: 'Dress code guide for Costa del Sol golf courses',
    subtitle: 'Avoid awkward surprises at check-in with practical, course-ready clothing guidance.',
    interestPreset: 'Dress code guidance'
  },
  '/guides/travelling-to-malaga-agp': {
    ...transportOverviewPage,
    metaTitle: 'Travelling to Málaga (AGP) | GolfSol Ireland',
    eyebrow: 'Travel Guide',
    title: 'Travelling to Málaga AGP for golf groups',
    subtitle: 'From flight timings to arrival flow, keep first-day logistics calm and straightforward.',
    interestPreset: 'Travel to Malaga AGP'
  },
  '/golf-courses': coursesPage,
  '/golf-courses/sotogrande': {
    ...coursesPage,
    metaTitle: 'Sotogrande Golf Courses | GolfSol Ireland',
    eyebrow: 'Golf Courses',
    title: 'Sotogrande golf cluster for premium trip planning',
    subtitle:
      'Plan around Sotogrande with practical routing, balanced challenge, and polished course options that suit Irish groups.',
    interestPreset: 'Sotogrande golf cluster'
  },
  '/golf-courses/marbella-golf-valley': {
    ...coursesPage,
    metaTitle: 'Marbella Golf Valley | GolfSol Ireland',
    eyebrow: 'Golf Courses',
    title: 'Marbella Golf Valley options with clear routing logic',
    subtitle:
      'Build a smarter week around Marbella Golf Valley with practical travel times, pace balance, and cleaner day flow.',
    interestPreset: 'Marbella Golf Valley'
  },
  '/golf-courses/mijas-fuengirola': {
    ...coursesPage,
    metaTitle: 'Mijas & Fuengirola Golf Courses | GolfSol Ireland',
    eyebrow: 'Golf Courses',
    title: 'Mijas and Fuengirola golf routes made straightforward',
    subtitle:
      'Compare Mijas and Fuengirola clusters with simple guidance on course mix, transfer rhythm, and group-friendly sequencing.',
    interestPreset: 'Mijas and Fuengirola golf cluster'
  },
  '/accommodation': accommodationPage,
  '/accommodation/fuengirola-hotels': {
    ...accommodationPage,
    metaTitle: 'Fuengirola Hotels | GolfSol Ireland',
    eyebrow: 'Accommodation',
    title: 'Fuengirola hotels for golf groups who want easy pacing',
    subtitle:
      'Compare Fuengirola stay options with clear guidance on location, social rhythm, and practical access to Costa del Sol golf days.',
    interestPreset: 'Fuengirola hotels'
  },
  '/accommodation/torremolinos-hotels': {
    ...accommodationPage,
    metaTitle: 'Torremolinos Hotels | GolfSol Ireland',
    eyebrow: 'Accommodation',
    title: 'Torremolinos hotels matched to smoother golf itineraries',
    subtitle:
      'Choose Torremolinos bases with straightforward advice on airport convenience, hotel feel, and how the week runs for Irish groups.',
    interestPreset: 'Torremolinos hotels'
  },
  '/accommodation-tiers': {
    ...accommodationPage,
    metaTitle: 'Accommodation Tiers | GolfSol Ireland',
    eyebrow: 'Accommodation',
    title: 'Accommodation tiers explained with practical trade-offs',
    subtitle:
      'Understand what changes between 3-star, 4-star, and 5-star Costa del Sol stays so your group picks the right level first time.',
    interestPreset: 'Accommodation tiers'
  },
  '/hotel-matching': {
    ...accommodationPage,
    metaTitle: 'Hotel Matching | GolfSol Ireland',
    eyebrow: 'Accommodation',
    title: 'Hotel matching that fits the golf plan and the group',
    subtitle:
      'We match your base to travel dates, group style, and course rhythm so the stay supports the trip instead of complicating it.',
    interestPreset: 'Hotel matching'
  },
  '/golf-map': {
    ...coursesPage,
    metaTitle: 'Costa del Sol Golf Map | GolfSol Ireland',
    eyebrow: 'Planning',
    title: 'Costa del Sol golf map guidance without the noise',
    subtitle: 'Understand practical clusters, driving windows, and route logic before you commit.',
    interestPreset: 'Costa del Sol golf map'
  },
  '/iagto': {
    ...aboutPage,
    metaTitle: 'IAGTO Membership | GolfSol Ireland',
    eyebrow: 'Accreditation',
    title: 'IAGTO-aligned standards for golf travel planning',
    subtitle: 'Our planning approach follows recognised golf travel standards focused on clarity and client care.',
    interestPreset: 'IAGTO information'
  },
  '/incentive-packages': {
    ...bookingPage,
    metaTitle: 'Incentive Packages | GolfSol Ireland',
    eyebrow: 'Groups',
    title: 'Incentive golf packages for teams and corporate groups',
    subtitle: 'Structured golf trips that balance premium experience with practical group logistics.',
    interestPreset: 'Incentive packages'
  },
  '/promo-maps': {
    ...coursesPage,
    metaTitle: 'Golf Route Maps | GolfSol Ireland',
    eyebrow: 'Planning',
    title: 'Promo maps for faster Costa del Sol trip planning',
    subtitle: 'Use route-led planning to decide base, courses, and transfer rhythm quickly.',
    interestPreset: 'Promo maps'
  },
  '/services/tee-time-bookings': teeTimeOnlyPage,
  '/services/twilight-golf': twilightGolfPage,
  '/services/society-group-trips': bookingPage
}

const geContentPages: Record<string, GeContentPageData> = {
  ...convertedFooterArticlePages,
  ...coreGeContentPages
}

export { geContentPages }

export const isGeContentPagePath = (path: string): boolean => path in geContentPages

export const getGeContentPage = (path: string): GeContentPageData | null => geContentPages[path] ?? null
