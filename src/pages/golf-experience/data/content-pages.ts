import type { MarketingPageData } from '../../../data/marketing-page-types'

const trustHighlights = [
  'Irish-owned support from first call',
  'Clear next steps in plain English',
  'Fast replies for group organisers'
] as const

const contactPage: MarketingPageData = {
  metaTitle: 'Contact | GolfSol Ireland',
  metaDescription:
    'Contact GolfSol Ireland for Costa del Sol golf quotes, tee times, accommodation options, transfers, and group trip planning from an Irish-owned team.',
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
  enquiryType: 'booking',
  formVariant: 'quote'
}

const termsPage: MarketingPageData = {
  metaTitle: 'Terms & Conditions | GolfSol Ireland',
  metaDescription:
    'Read GolfSol Ireland terms and conditions in plain language before you confirm deposits, balances, supplier clauses, or booking changes.',
  eyebrow: 'Legal',
  title: 'Terms and conditions overview before you book',
  subtitle:
    'We keep terms practical and readable so organisers understand key points before deposits are made.',
  heroImage: '/images/transport-fleet-lineup.jpg',
  heroAlt: 'Clear terms and reliable service for golf travel planning.',
  highlights: trustHighlights,
  sections: [
    {
      title: 'Booking and payment points',
      body:
        'Your written proposal outlines payment schedule, booking status, and key supplier terms that apply to your selected package.',
      bullets: ['Deposit and balance milestones', 'Change/cancellation framework', 'Supplier-specific clauses where relevant']
    },
    {
      title: 'Clarity first',
      body:
        'If any clause is unclear, we explain it before you commit. The goal is confidence, not fine-print surprises.',
      bullets: ['Direct support for organisers', 'Plain-language explanations', 'Clear next-step confirmations']
    }
  ],
  formTitle: 'Ask about terms',
  formLead: 'Send your question and we will clarify terms before you proceed.',
  interestPreset: 'Terms and conditions enquiry',
  enquiryType: 'legal',
  formVariant: 'legal'
}

const privacyPage: MarketingPageData = {
  metaTitle: 'Privacy Policy | GolfSol Ireland',
  metaDescription:
    'Understand how GolfSol Ireland uses enquiry data, manages communication, and handles privacy requests for Costa del Sol golf travel planning.',
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
  enquiryType: 'legal',
  formVariant: 'legal'
}

const golfClubRentalPage: MarketingPageData = {
  metaTitle: 'Golf Club Rental | GolfSol Ireland',
  metaDescription:
    'Arrange Costa del Sol golf club rental with GolfSol Ireland. Get premium or standard sets delivered around your arrival, hotel, and tee times.',
  eyebrow: 'Services',
  title: 'Golf club rental on the Sol, ready when you land',
  subtitle:
    'Skip airline stress and rent quality sets that match your handicap range. We coordinate drop-off and collection around your hotel and tee schedule.',
  heroImage: '/images/transport-moment-arrivals.jpg',
  heroAlt: 'Golf bags prepared for arriving players at Malaga airport.',
  highlights: trustHighlights,
  sections: [
    {
      title: 'Set quality and fit',
      body:
        'Rental clubs are selected by player profile and availability window so nobody shows up to the first tee with unsuitable equipment.',
      bullets: ['Men, women, and left-handed options', 'Premium and standard set tiers', 'Early confirmation for larger groups']
    },
    {
      title: 'Logistics that make sense',
      body:
        'We align rental handover with transfers and check-in flow, then collect at the agreed point so your return day stays clean.',
      bullets: ['Hotel delivery where available', 'Simple damage/loss guidance', 'One point of contact for changes']
    }
  ],
  formTitle: 'Request club rental options',
  formLead: 'Share player count and travel window. We send suitable rental choices quickly.',
  interestPreset: 'Golf club rental',
  enquiryType: 'booking',
  formVariant: 'club-rental'
}

const teeTimeOnlyPage: MarketingPageData = {
  metaTitle: 'Tee Time Bookings Only | GolfSol Ireland',
  metaDescription:
    'Book Costa del Sol tee times only with GolfSol Ireland. Get route-aware course options, pricing clarity, and quick confirmations for Irish groups.',
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
      title: 'Booking flow',
      body:
        'You get straightforward options and timings, then we confirm what is available and lock it in once you approve.',
      bullets: ['Clear slot-by-slot confirmations', 'Plain pricing in euro', 'Quick updates on schedule changes']
    }
  ],
  formTitle: 'Get tee-time options',
  formLead: 'Tell us your dates and group size and we will return a clean shortlist.',
  interestPreset: 'Tee time bookings only',
  enquiryType: 'booking',
  formVariant: 'courses'
}

const familyHolidaysPage: MarketingPageData = {
  metaTitle: 'Family Golf Holidays | GolfSol Ireland',
  metaDescription:
    'Plan family golf holidays on the Costa del Sol with balanced golf, accommodation, transfers, and non-golfer options coordinated by GolfSol Ireland.',
  eyebrow: 'Services',
  title: 'Family golf holidays with less friction and better pacing',
  subtitle:
    'Some play every day, some do not. We design plans that keep golfers happy while giving non-golfers easy, enjoyable options.',
  heroImage: '/images/transport-moment-resort.jpg',
  heroAlt: 'Luxury Costa del Sol resort suitable for family golf holidays.',
  highlights: trustHighlights,
  sections: [
    {
      title: 'Family-first structure',
      body:
        'We avoid overpacked schedules and choose hotel bases where both golfers and non-golfers can enjoy the week without long commutes.',
      bullets: ['Mix of golf and downtime', 'Transfer plans built around children', 'Simple day-by-day guidance']
    },
    {
      title: 'Accommodation and activities',
      body:
        'From beach-friendly stays to resort pools and easy evening routes, the trip is shaped so nobody feels dragged around.',
      bullets: ['Board options explained simply', 'Airport flow that reduces stress', 'One team managing all details']
    }
  ],
  formTitle: 'Plan a family golf holiday',
  formLead: 'Share your travel dates and family mix. We propose a practical, easy-to-run trip.',
  interestPreset: 'Family golf holidays',
  enquiryType: 'booking',
  formVariant: 'itinerary'
}

const aboutPage: MarketingPageData = {
  metaTitle: 'About GolfSol Ireland',
  metaDescription:
    'Learn about GolfSol Ireland, the Irish-owned Costa del Sol golf travel specialist focused on clear planning, trusted suppliers, and joined-up golf trips.',
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
  enquiryType: 'support',
  formVariant: 'support'
}

const bookingPage: MarketingPageData = {
  metaTitle: 'Booking | GolfSol Ireland',
  metaDescription:
    'See how GolfSol Ireland handles booking support, pricing, confirmations, deposits, and next steps for Irish golf groups travelling to the Costa del Sol.',
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
  enquiryType: 'booking',
  formVariant: 'itinerary'
}

const transportOverviewPage: MarketingPageData = {
  metaTitle: 'Transport | GolfSol Ireland',
  metaDescription:
    'Request Costa del Sol golf transport from Málaga airport to hotel and course with GolfSol Ireland. Golf-bag friendly routing, timing, and Irish-led support.',
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
  enquiryType: 'booking',
  formVariant: 'transport',
  canonicalPath: '/services/transport'
}

const coursesPage: MarketingPageData = {
  metaTitle: 'Costa del Sol Golf Courses | GolfSol Ireland',
  metaDescription:
    'Explore Costa del Sol golf courses with GolfSol Ireland. Get shortlists based on travel time, challenge level, group profile, and trip rhythm.',
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
  formLead: 'Share your base and dates and we will send suitable rounds quickly.',
  interestPreset: 'Costa del Sol courses',
  enquiryType: 'booking',
  formVariant: 'courses'
}

const accommodationPage: MarketingPageData = {
  metaTitle: 'Accommodation | GolfSol Ireland',
  metaDescription:
    'Compare Costa del Sol accommodation options with GolfSol Ireland. Find the right hotel base by budget, location, group style, and golf schedule.',
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
  enquiryType: 'booking',
  formVariant: 'accommodation'
}

const testimonialsPage: MarketingPageData = {
  metaTitle: 'Testimonials | GolfSol Ireland',
  metaDescription:
    'Read why Irish golfers trust GolfSol Ireland and share feedback about your Costa del Sol trip planning, stays, rounds, and transfers.',
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
  enquiryType: 'testimonial',
  formVariant: 'testimonial'
}

const faqPage: MarketingPageData = {
  metaTitle: 'FAQ | GolfSol Ireland',
  metaDescription:
    'Get clear answers about deposits, transfers, tee times, changes, and booking flow for GolfSol Ireland Costa del Sol golf holidays.',
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
  enquiryType: 'support',
  formVariant: 'support'
}

const newsPage: MarketingPageData = {
  metaTitle: 'Sol Insider News | GolfSol Ireland',
  metaDescription:
    'Follow Costa del Sol golf travel updates, seasonal course notes, hotel news, and planning reminders from GolfSol Ireland.',
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
  enquiryType: 'support',
  formVariant: 'guide'
}

const newsletterPage: MarketingPageData = {
  metaTitle: 'Newsletter | GolfSol Ireland',
  metaDescription:
    'Join the GolfSol Ireland newsletter for low-volume Costa del Sol golf travel updates, planning tips, and occasional Irish-group offers.',
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
  enquiryType: 'newsletter',
  formVariant: 'newsletter'
}

const sotograndeCoursesPage: MarketingPageData = {
  ...coursesPage,
  metaTitle: 'Sotogrande Golf Courses | GolfSol Ireland',
  metaDescription:
    'Discover Sotogrande golf courses with GolfSol Ireland, from Valderrama to La Reserva, with routing, travel times, and trip pacing designed for Irish groups.',
  title: 'Sotogrande courses for a flagship Costa del Sol week',
  subtitle:
    'Build around Europe-level headline golf without turning the rest of the trip into dead mileage. We balance marquee rounds with realistic routing and pacing.',
  interestPreset: 'Sotogrande course shortlist',
  sections: [
    {
      title: 'Start with the right marquee round',
      body:
        'Valderrama, La Reserva, and nearby championship names can anchor the week, but they need the right base and the right spacing. We help you decide which prestige rounds genuinely fit your group.',
      bullets: ['Flagship golf with realistic drive times', 'Course order that protects energy', 'Premium rounds without wasting a day']
    },
    {
      title: 'Mix headline golf with playable rhythm',
      body:
        'Sotogrande trips work best when the week is not all pressure golf. We can blend the must-play name with supporting rounds that suit mixed handicaps and keep the trip enjoyable.',
      bullets: ['Support rounds for the full group', 'Golf-day transfer logic', 'Clear notes on atmosphere, pace, and value']
    }
  ],
  formVariant: 'courses'
}

const marbellaGolfValleyPage: MarketingPageData = {
  ...coursesPage,
  metaTitle: 'Marbella Golf Valley | GolfSol Ireland',
  metaDescription:
    'Compare Marbella Golf Valley rounds with GolfSol Ireland and choose the right Nueva Andalucía course mix for your Costa del Sol trip.',
  title: 'Marbella Golf Valley rounds with better day-to-day flow',
  subtitle:
    'Nueva Andalucía gives Irish groups variety, strong conditioning, and easier nightlife access. We help you pick the right mix instead of overbooking the same type of day.',
  interestPreset: 'Marbella Golf Valley',
  sections: [
    {
      title: 'Golf close to the social base',
      body:
        'Marbella Golf Valley works when the group wants quality golf and lively evenings without long transfer days. We shortlist rounds that fit both the golf and the off-course rhythm.',
      bullets: ['Shorter transfer windows', 'Courses that suit mixed groups', 'Easier planning for shorter breaks']
    },
    {
      title: 'Pick variety, not repetition',
      body:
        'A strong Marbella week has contrast: different visuals, different challenge levels, and enough flexibility if tee sheets move. We shape the order so the week builds properly.',
      bullets: ['Balanced challenge across the trip', 'Useful backups if prime times move', 'Cleaner routing between hotel, course, and dinner']
    }
  ],
  formVariant: 'courses'
}

const mijasFuengirolaCoursesPage: MarketingPageData = {
  ...coursesPage,
  metaTitle: 'Mijas & Fuengirola Golf | GolfSol Ireland',
  metaDescription:
    'Plan Mijas and Fuengirola golf trips with GolfSol Ireland using practical course shortlists, route planning, and hotel-fit advice for Irish groups.',
  title: 'Mijas and Fuengirola golf for cleaner, easy-running trips',
  subtitle:
    'This stretch suits groups who want easier logistics, dependable golf days, and a practical Costa del Sol base without sacrificing the quality of the week.',
  interestPreset: 'Mijas and Fuengirola golf',
  sections: [
    {
      title: 'Practical golf base for Irish groups',
      body:
        'Mijas and Fuengirola often make the trip easier to run: shorter airport transfer, clearer hotel choices, and golf clusters that reduce time in the van.',
      bullets: ['Less wasted transfer time', 'Good fit for shorter breaks', 'Smart value without a generic feel']
    },
    {
      title: 'Build the week around convenience and quality',
      body:
        'We help you avoid awkward zig-zag routing and choose rounds that keep the week calm, social, and easy for organisers to manage.',
      bullets: ['Hotel-to-course flow that makes sense', 'Solid options for all handicap levels', 'Useful trade-offs explained clearly']
    }
  ],
  formVariant: 'courses'
}

const fuengirolaHotelsPage: MarketingPageData = {
  ...accommodationPage,
  metaTitle: 'Fuengirola Hotels for Golf Trips | GolfSol Ireland',
  metaDescription:
    'Find Fuengirola hotels for Costa del Sol golf trips with GolfSol Ireland, including room mix, nightlife fit, golf routing, and group-friendly options.',
  title: 'Fuengirola hotels that work well for golf groups',
  subtitle:
    'Fuengirola suits Irish golfers who want a lively, practical base with good dining, walkability, and strong access to nearby rounds.',
  interestPreset: 'Fuengirola hotel options',
  sections: [
    {
      title: 'Best for social golf groups',
      body:
        'Fuengirola works when the evenings matter as much as the golf. We shortlist hotels that keep the group close to restaurants, bars, and smooth morning departures.',
      bullets: ['Walkable nightlife and dining', 'Group-friendly room mixes', 'Simple transfer planning from AGP']
    },
    {
      title: 'Stay level matched to the trip',
      body:
        'From cleaner value-led stays to more polished beachfront options, we explain which Fuengirola hotels suit the trip style you want and which ones are just brochure noise.',
      bullets: ['Budget and premium tiers explained', 'Breakfast and late-arrival practicality', 'Direct fit with nearby golf-day routing']
    }
  ],
  formVariant: 'accommodation'
}

const torremolinosHotelsPage: MarketingPageData = {
  ...accommodationPage,
  metaTitle: 'Torremolinos Hotels for Golf Trips | GolfSol Ireland',
  metaDescription:
    'Explore Torremolinos hotel options for Costa del Sol golf holidays with GolfSol Ireland and compare stay style, location, value, and transfer ease.',
  title: 'Torremolinos hotels for simpler arrivals and golf weeks',
  subtitle:
    'Torremolinos is a practical base for golfers who want quick airport access, beach proximity, and clear value without overcomplicating the trip.',
  interestPreset: 'Torremolinos hotel options',
  sections: [
    {
      title: 'Quick airport-to-hotel flow',
      body:
        'Torremolinos can remove a lot of first-day stress. We recommend hotels that make late arrivals easier and keep morning golf departures straightforward.',
      bullets: ['Fast AGP arrival flow', 'Good fit for short breaks', 'Beach and dining nearby']
    },
    {
      title: 'Value that still feels polished',
      body:
        'The right Torremolinos hotel can keep the trip sharp without forcing five-star spend. We focus on where the practical value really is for golf groups.',
      bullets: ['Good-value options with clean service', 'Board basis that fits tee times', 'Honest trade-offs on buzz versus quiet']
    }
  ],
  formVariant: 'accommodation'
}

const geContentPages: Record<string, MarketingPageData> = {
  '/about': aboutPage,
  '/booking': bookingPage,
  '/transport': transportOverviewPage,
  '/golf-club-rental': golfClubRentalPage,
  '/tee-time-bookings-only': teeTimeOnlyPage,
  '/family-holidays': familyHolidaysPage,
  '/testimonials': testimonialsPage,
  '/faq': faqPage,
  '/news': newsPage,
  '/newsletter': newsletterPage,
  '/contact': contactPage,
  '/contact/golf-holiday-enquiry-form': {
    ...contactPage,
    canonicalPath: '/contact'
  },
  '/contact/give-a-testimonial': {
    ...testimonialsPage,
    canonicalPath: '/testimonials'
  },
  '/contact/privacy-policy': {
    ...privacyPage,
    canonicalPath: '/privacy-policy'
  },
  '/terms-conditions': {
    ...termsPage,
    canonicalPath: '/terms-and-conditions'
  },
  '/privacy-policy': privacyPage,
  '/terms-and-conditions': termsPage,
  '/links-and-information/dress-code-for-golf-in-spain': {
    ...faqPage,
    metaTitle: 'Dress Code Guide | GolfSol Ireland',
    metaDescription:
      'Get practical Costa del Sol golf dress code guidance from GolfSol Ireland so your group arrives course-ready with no awkward surprises.',
    eyebrow: 'Travel Guide',
    title: 'Dress code guide for Costa del Sol golf courses',
    subtitle: 'Avoid awkward surprises at check-in with practical, course-ready clothing guidance.',
    interestPreset: 'Dress code guidance',
    canonicalPath: '/guides/dress-code-costa-del-sol',
    formVariant: 'guide'
  },
  '/links-and-information/travelling-to-spain': {
    ...transportOverviewPage,
    metaTitle: 'Travelling to Spain | GolfSol Ireland',
    metaDescription:
      'Plan travel to Spain for Costa del Sol golf groups with GolfSol Ireland and get advice on flights, arrivals, timing, and transfer flow.',
    eyebrow: 'Travel Guide',
    title: 'Travelling to Spain for Costa del Sol golf groups',
    subtitle: 'From flight timings to arrival flow, keep first-day logistics calm and straightforward.',
    interestPreset: 'Travel to Spain',
    canonicalPath: '/guides/travelling-to-malaga-agp',
    formVariant: 'guide'
  },
  '/guides/dress-code-costa-del-sol': {
    ...faqPage,
    metaTitle: 'Dress Code Guide | GolfSol Ireland',
    metaDescription:
      'Get practical Costa del Sol golf dress code guidance from GolfSol Ireland so your group arrives course-ready with no awkward surprises.',
    eyebrow: 'Travel Guide',
    title: 'Dress code guide for Costa del Sol golf courses',
    subtitle: 'Avoid awkward surprises at check-in with practical, course-ready clothing guidance.',
    interestPreset: 'Dress code guidance',
    formVariant: 'guide'
  },
  '/guides/travelling-to-malaga-agp': {
    ...transportOverviewPage,
    metaTitle: 'Travelling to Málaga (AGP) | GolfSol Ireland',
    metaDescription:
      'Plan arrivals into Málaga AGP for your golf trip with GolfSol Ireland using practical advice on flights, transfers, first-day timing, and group flow.',
    eyebrow: 'Travel Guide',
    title: 'Travelling to Málaga AGP for golf groups',
    subtitle: 'From flight timings to arrival flow, keep first-day logistics calm and straightforward.',
    interestPreset: 'Travel to Malaga AGP',
    formVariant: 'guide'
  },
  '/golf-courses': coursesPage,
  '/golf-courses/sotogrande': sotograndeCoursesPage,
  '/golf-courses/marbella-golf-valley': marbellaGolfValleyPage,
  '/golf-courses/mijas-fuengirola': mijasFuengirolaCoursesPage,
  '/accommodation': accommodationPage,
  '/accommodation/fuengirola-hotels': fuengirolaHotelsPage,
  '/accommodation/torremolinos-hotels': torremolinosHotelsPage,
  '/golf-map': {
    ...coursesPage,
    metaTitle: 'Costa del Sol Golf Map | GolfSol Ireland',
    metaDescription:
      'Use the GolfSol Ireland Costa del Sol golf map guidance to compare course clusters, drive times, and practical routing before you book.',
    eyebrow: 'Planning',
    title: 'Costa del Sol golf map guidance without the noise',
    subtitle: 'Understand practical clusters, driving windows, and route logic before you commit.',
    interestPreset: 'Costa del Sol golf map',
    formVariant: 'courses'
  },
  '/iagto': {
    ...aboutPage,
    metaTitle: 'IAGTO Membership | GolfSol Ireland',
    metaDescription:
      'See how GolfSol Ireland aligns with recognised golf travel standards through an IAGTO-informed approach to planning and client care.',
    eyebrow: 'Accreditation',
    title: 'IAGTO-aligned standards for golf travel planning',
    subtitle: 'Our planning approach follows recognised golf travel standards focused on clarity and client care.',
    interestPreset: 'IAGTO information',
    formVariant: 'support'
  },
  '/incentive-packages': {
    ...bookingPage,
    metaTitle: 'Incentive Packages | GolfSol Ireland',
    metaDescription:
      'Plan Costa del Sol incentive golf packages for teams and corporate groups with premium pacing, golf, accommodation, and transport coordination.',
    eyebrow: 'Groups',
    title: 'Incentive golf packages for teams and corporate groups',
    subtitle: 'Structured golf trips that balance premium experience with practical group logistics.',
    interestPreset: 'Incentive packages',
    formVariant: 'itinerary'
  },
  '/promo-maps': {
    ...coursesPage,
    metaTitle: 'Golf Route Maps | GolfSol Ireland',
    metaDescription:
      'Explore GolfSol Ireland route maps for Costa del Sol golf trips and compare destinations, courses, and transfer logic faster.',
    eyebrow: 'Planning',
    title: 'Promo maps for faster Costa del Sol trip planning',
    subtitle: 'Use route-led planning to decide base, courses, and transfer rhythm quickly.',
    interestPreset: 'Promo maps',
    formVariant: 'courses'
  },
  '/services/golf-club-rental': {
    ...golfClubRentalPage,
    canonicalPath: '/golf-club-rental'
  },
  '/services/tee-time-bookings': {
    ...teeTimeOnlyPage,
    canonicalPath: '/tee-time-bookings-only'
  },
  '/services/family-holidays': {
    ...familyHolidaysPage,
    canonicalPath: '/family-holidays'
  },
  '/services/society-group-trips': {
    ...bookingPage,
    canonicalPath: '/booking'
  }
}

export { geContentPages }

export const isGeContentPagePath = (path: string): boolean => path in geContentPages

export const getGeContentPage = (path: string): MarketingPageData | null => geContentPages[path] ?? null
