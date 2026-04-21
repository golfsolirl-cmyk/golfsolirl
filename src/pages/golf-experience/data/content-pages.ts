export interface GeContentPageSection {
  readonly title: string
  readonly body: string
  readonly bullets?: readonly string[]
}

export interface GeContentPageData {
  readonly metaTitle: string
  readonly metaDescription?: string
  readonly metaKeywords?: readonly string[]
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
  readonly formContextLabel?: string
  readonly bestTimeToCallLabel?: string
  readonly bestTimeToCallOptions?: readonly string[]
}

const trustHighlights = [
  'Irish-owned support from first call',
  'Clear next steps in plain English',
  'Fast replies for group organisers'
] as const

const contactPage: GeContentPageData = {
  metaTitle: 'Contact | GolfSol Ireland',
  metaDescription:
    'Contact GolfSol Ireland for Costa del Sol golf holiday quotes, group itineraries, accommodation options, and airport transfer planning for Irish golfers.',
  metaKeywords: ['GolfSol Ireland contact', 'Costa del Sol golf quote', 'Irish golf holiday enquiry'],
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
  formContextLabel: 'Trip focus',
  bestTimeToCallLabel: 'Preferred reply window',
  bestTimeToCallOptions: ['Any time', 'Morning reply', 'Afternoon reply', 'Evening reply', 'Email only']
}

const termsPage: GeContentPageData = {
  metaTitle: 'Terms & Conditions | GolfSol Ireland',
  metaDescription:
    'Read the GolfSol Ireland terms and conditions overview before booking Costa del Sol golf packages, transfers, accommodation, or group travel services.',
  metaKeywords: ['GolfSol Ireland terms', 'Costa del Sol golf booking terms', 'Irish golf holiday conditions'],
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
  formContextLabel: 'Legal topic',
  bestTimeToCallLabel: 'Preferred response method',
  bestTimeToCallOptions: ['Email reply', 'Phone call', 'WhatsApp reply']
}

const privacyPage: GeContentPageData = {
  metaTitle: 'Privacy Policy | GolfSol Ireland',
  metaDescription:
    'Review how GolfSol Ireland handles customer enquiry details, trip preferences, and communications for Costa del Sol golf travel planning.',
  metaKeywords: ['GolfSol Ireland privacy', 'golf holiday privacy policy', 'Costa del Sol travel data'],
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
  formContextLabel: 'Privacy topic',
  bestTimeToCallLabel: 'Preferred response method',
  bestTimeToCallOptions: ['Email reply', 'Phone call', 'WhatsApp reply']
}

const golfClubRentalPage: GeContentPageData = {
  metaTitle: 'Golf Club Rental | GolfSol Ireland',
  metaDescription:
    'Book Costa del Sol golf club rental with GolfSol Ireland and have quality sets coordinated around your flights, hotel, and tee times.',
  metaKeywords: ['golf club rental Costa del Sol', 'GolfSol Ireland rental clubs', 'Malaga golf club hire'],
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
  formContextLabel: 'Rental requirement',
  bestTimeToCallLabel: 'Best time to discuss rental',
  bestTimeToCallOptions: ['Any time', 'Morning call', 'Afternoon call', 'Evening call', 'Email only']
}

const teeTimeOnlyPage: GeContentPageData = {
  metaTitle: 'Tee Time Bookings Only | GolfSol Ireland',
  metaDescription:
    'Get Costa del Sol tee-time bookings only from GolfSol Ireland when your hotel is already arranged and you want Irish-led course recommendations.',
  metaKeywords: ['Costa del Sol tee times', 'GolfSol Ireland tee time booking', 'Irish golf groups Spain'],
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
  formContextLabel: 'Golf requirement',
  bestTimeToCallLabel: 'Best time to discuss tee times',
  bestTimeToCallOptions: ['Any time', 'Morning call', 'Afternoon call', 'Evening call', 'Email only']
}

const familyHolidaysPage: GeContentPageData = {
  metaTitle: 'Family Golf Holidays | GolfSol Ireland',
  metaDescription:
    'Plan family golf holidays on the Costa del Sol with GolfSol Ireland, combining golf, family-friendly stays, transfers, and balanced itineraries.',
  metaKeywords: ['family golf holidays Spain', 'Costa del Sol family golf', 'GolfSol Ireland family trips'],
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
  formContextLabel: 'Family trip focus',
  bestTimeToCallLabel: 'Best time to discuss your family trip',
  bestTimeToCallOptions: ['Any time', 'Morning call', 'Afternoon call', 'Evening call', 'Email only']
}

const aboutPage: GeContentPageData = {
  metaTitle: 'About GolfSol Ireland',
  metaDescription:
    'Learn about GolfSol Ireland, an Irish-owned Costa del Sol golf travel specialist focused on golf packages, hotels, transfers, and group planning.',
  metaKeywords: ['about GolfSol Ireland', 'Irish golf travel specialist', 'Costa del Sol golf experts'],
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
  formContextLabel: 'Question type',
  bestTimeToCallLabel: 'Preferred contact method',
  bestTimeToCallOptions: ['Email reply', 'Phone call', 'WhatsApp reply']
}

const bookingPage: GeContentPageData = {
  metaTitle: 'Booking | GolfSol Ireland',
  metaDescription:
    'Understand the GolfSol Ireland booking flow for Costa del Sol golf holidays, including quotes, confirmations, deposits, and organiser support.',
  metaKeywords: ['GolfSol Ireland booking', 'Costa del Sol golf booking', 'golf holiday organiser support'],
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
  formContextLabel: 'Booking focus',
  bestTimeToCallLabel: 'Best time to discuss booking',
  bestTimeToCallOptions: ['Any time', 'Morning call', 'Afternoon call', 'Evening call', 'Email only']
}

const transportOverviewPage: GeContentPageData = {
  metaTitle: 'Transport | GolfSol Ireland',
  metaDescription:
    'Arrange Costa del Sol golf transport with GolfSol Ireland, including Malaga airport pickups, hotel shuttles, and golf-day transfers for Irish groups.',
  metaKeywords: ['Costa del Sol golf transport', 'Malaga golf transfers', 'GolfSol Ireland transport'],
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
  formContextLabel: 'Transport focus',
  bestTimeToCallLabel: 'Best time to discuss transport',
  bestTimeToCallOptions: ['Any time', 'Morning call', 'Afternoon call', 'Evening call', 'Email only']
}

const coursesPage: GeContentPageData = {
  metaTitle: 'Costa del Sol Golf Courses | GolfSol Ireland',
  metaDescription:
    'Explore Costa del Sol golf courses with GolfSol Ireland and get Irish-led help choosing the right championship and value rounds for your trip.',
  metaKeywords: ['Costa del Sol golf courses', 'GolfSol Ireland courses', 'Spanish golf trip planning'],
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
  formContextLabel: 'Course planning focus',
  bestTimeToCallLabel: 'Best time to discuss courses',
  bestTimeToCallOptions: ['Any time', 'Morning call', 'Afternoon call', 'Evening call', 'Email only']
}

const accommodationPage: GeContentPageData = {
  metaTitle: 'Accommodation | GolfSol Ireland',
  metaDescription:
    'Compare Costa del Sol accommodation with GolfSol Ireland and get hotel recommendations that match your golf schedule, budget, and group style.',
  metaKeywords: ['Costa del Sol golf accommodation', 'GolfSol Ireland hotels', 'Marbella golf stays'],
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
  formContextLabel: 'Stay requirement',
  bestTimeToCallLabel: 'Best time to discuss accommodation',
  bestTimeToCallOptions: ['Any time', 'Morning call', 'Afternoon call', 'Evening call', 'Email only']
}

const testimonialsPage: GeContentPageData = {
  metaTitle: 'Testimonials | GolfSol Ireland',
  metaDescription:
    'Read GolfSol Ireland testimonials from Irish golfers and share feedback on Costa del Sol golf trips, transfers, hotels, and itinerary planning.',
  metaKeywords: ['GolfSol Ireland testimonials', 'Irish golfer reviews Spain', 'Costa del Sol golf feedback'],
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
  formContextLabel: 'Feedback type',
  bestTimeToCallLabel: 'Preferred follow-up',
  bestTimeToCallOptions: ['Email reply', 'Phone call', 'WhatsApp reply']
}

const faqPage: GeContentPageData = {
  metaTitle: 'FAQ | GolfSol Ireland',
  metaDescription:
    'See the GolfSol Ireland FAQ covering Costa del Sol golf packages, deposits, transport, organiser questions, and booking timelines for Irish groups.',
  metaKeywords: ['GolfSol Ireland FAQ', 'Costa del Sol golf questions', 'Irish golf holiday FAQ'],
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
  formContextLabel: 'Question category',
  bestTimeToCallLabel: 'Preferred reply window',
  bestTimeToCallOptions: ['Email reply', 'Morning call', 'Afternoon call', 'Evening call', 'WhatsApp reply']
}

const newsPage: GeContentPageData = {
  metaTitle: 'Sol Insider News | GolfSol Ireland',
  metaDescription:
    'Get Costa del Sol golf travel updates from GolfSol Ireland, including course notes, seasonal planning reminders, and useful organiser guidance.',
  metaKeywords: ['GolfSol Ireland news', 'Costa del Sol golf updates', 'Irish golf travel news'],
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
  formContextLabel: 'Update category',
  bestTimeToCallLabel: 'Preferred response method',
  bestTimeToCallOptions: ['Email reply', 'WhatsApp reply', 'Phone call']
}

const newsletterPage: GeContentPageData = {
  metaTitle: 'Newsletter | GolfSol Ireland',
  metaDescription:
    'Join the GolfSol Ireland newsletter for Costa del Sol golf travel updates, planning tips, and useful information for Irish golfers.',
  metaKeywords: ['GolfSol Ireland newsletter', 'Costa del Sol golf newsletter', 'Irish golf travel updates'],
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
  formContextLabel: 'Update preference',
  bestTimeToCallLabel: 'Preferred contact method',
  bestTimeToCallOptions: ['Email only', 'WhatsApp updates', 'Phone call if needed']
}

const geContentPages: Record<string, GeContentPageData> = {
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
    metaDescription:
      'Explore Sotogrande golf course options with GolfSol Ireland, including premium routing, marquee rounds, and group-friendly planning on the western Costa del Sol.',
    eyebrow: 'Golf Courses',
    title: 'Sotogrande golf courses for standout Costa del Sol trips',
    subtitle: 'Build around marquee western-Costa rounds without wasting time on poor routing or mismatched course mixes.',
    interestPreset: 'Sotogrande golf courses'
  },
  '/golf-courses/marbella-golf-valley': {
    ...coursesPage,
    metaTitle: 'Marbella Golf Valley | GolfSol Ireland',
    metaDescription:
      'See Marbella Golf Valley course ideas from GolfSol Ireland and get a cleaner shortlist for Irish golf groups staying near Marbella or Nueva Andalucia.',
    eyebrow: 'Golf Courses',
    title: 'Marbella Golf Valley rounds with easier trip planning',
    subtitle: 'Shortlist the right Marbella-area courses by travel time, pace, and how they fit the rest of your week.',
    interestPreset: 'Marbella Golf Valley'
  },
  '/golf-courses/mijas-fuengirola': {
    ...coursesPage,
    metaTitle: 'Mijas & Fuengirola Golf | GolfSol Ireland',
    metaDescription:
      'Compare Mijas and Fuengirola golf options with GolfSol Ireland and build a Costa del Sol itinerary that suits lively bases and shorter transfer windows.',
    eyebrow: 'Golf Courses',
    title: 'Mijas and Fuengirola golf options for practical, social trips',
    subtitle: 'Ideal for groups who want easier logistics, busy resort bases, and strong golf without long transfer days.',
    interestPreset: 'Mijas and Fuengirola golf'
  },
  '/accommodation': accommodationPage,
  '/accommodation/fuengirola-hotels': {
    ...accommodationPage,
    metaTitle: 'Fuengirola Hotels for Golf Trips | GolfSol Ireland',
    metaDescription:
      'Browse Fuengirola hotel guidance from GolfSol Ireland and find Costa del Sol stays that work for golf groups, nightlife access, and easier transfer planning.',
    eyebrow: 'Accommodation',
    title: 'Fuengirola hotels that work for Irish golf groups',
    subtitle: 'Stay near the promenade, dining, and transfer links while keeping golf-day logistics practical across the week.',
    interestPreset: 'Fuengirola hotels'
  },
  '/accommodation/torremolinos-hotels': {
    ...accommodationPage,
    metaTitle: 'Torremolinos Hotels for Golf Trips | GolfSol Ireland',
    metaDescription:
      'See Torremolinos hotel recommendations from GolfSol Ireland and choose Costa del Sol accommodation suited to short airport transfers and flexible golf bases.',
    eyebrow: 'Accommodation',
    title: 'Torremolinos hotel options with easier airport access',
    subtitle: 'Useful for golfers who want a shorter first-day transfer and a resort base that keeps the trip simple.',
    interestPreset: 'Torremolinos hotels'
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
  '/services/golf-club-rental': golfClubRentalPage,
  '/services/tee-time-bookings': teeTimeOnlyPage,
  '/services/family-holidays': familyHolidaysPage,
  '/services/society-group-trips': bookingPage
}

export { geContentPages }

export const isGeContentPagePath = (path: string): boolean => path in geContentPages

export const getGeContentPage = (path: string): GeContentPageData | null => geContentPages[path] ?? null
