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
}

const transferHighlights = [
  'Irish-owned support from first call',
  'Clear next steps in plain English',
  'Fast replies for group organisers'
] as const

export const geContentPages: Record<string, GeContentPageData> = {
  '/services/excursions': {
    metaTitle: 'Excursions | GolfSol Ireland',
    eyebrow: 'Services',
    title: 'Costa del Sol excursions that fit around your golf',
    subtitle:
      'Add one or two smart off-course moments without wrecking tee-time rhythm. We keep transfer timing, group pace, and return plans joined up.',
    heroImage: '/images/transport-moment-resort.jpg',
    heroAlt: 'Costa del Sol marina and promenade at golden hour near golf resorts.',
    highlights: transferHighlights,
    sections: [
      {
        title: 'Built for golf groups, not generic coach tours',
        body:
          'We plan excursions as short, clean add-ons with realistic departure and return windows so your group keeps energy for the golf days that matter most.',
        bullets: ['Half-day options for rest days', 'Dinner transfers included on request', 'Group-size pricing before you commit']
      },
      {
        title: 'Popular options',
        body:
          'Old-town Marbella, Puerto Banus evenings, coastal dining runs, and simple scenic days with no rushed itinerary. We can keep it premium but easy.',
        bullets: ['WhatsApp-friendly timing plans', 'One contact for all moving parts', 'No last-minute confusion for captains']
      }
    ],
    formTitle: 'Get your excursions plan',
    formLead: 'Tell us dates and group size. We reply with practical options that fit your golf itinerary.',
    interestPreset: 'Excursions planning'
  },
  '/services/golf-club-rental': {
    metaTitle: 'Golf Club Rental | GolfSol Ireland',
    eyebrow: 'Services',
    title: 'Golf club rental on the Sol, ready when you land',
    subtitle:
      'Skip airline stress and rent quality sets that match your handicap range. We coordinate drop-off and collection around your hotel and tee schedule.',
    heroImage: '/images/transport-moment-arrivals.jpg',
    heroAlt: 'Golf bags prepared for arriving players at Malaga airport.',
    highlights: transferHighlights,
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
    interestPreset: 'Golf club rental'
  },
  '/services/tee-time-bookings': {
    metaTitle: 'Tee Time Bookings | GolfSol Ireland',
    eyebrow: 'Services',
    title: 'Tee-time bookings only, if your hotel is already sorted',
    subtitle:
      'Need golf only? We can shortlist and secure the right rounds without repackaging your whole trip. Fast, clear, and suited to Irish groups.',
    heroImage: '/images/about-golfsol-hero.jpg',
    heroAlt: 'Costa del Sol golf fairway in warm sunlight.',
    highlights: transferHighlights,
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
    interestPreset: 'Tee time bookings only'
  },
  '/services/family-holidays': {
    metaTitle: 'Family Golf Holidays | GolfSol Ireland',
    eyebrow: 'Services',
    title: 'Family golf holidays with less friction and better pacing',
    subtitle:
      'Some play every day, some do not. We design plans that keep golfers happy while giving non-golfers easy, enjoyable options.',
    heroImage: '/images/transport-moment-resort.jpg',
    heroAlt: 'Luxury Costa del Sol resort suitable for family golf holidays.',
    highlights: transferHighlights,
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
    interestPreset: 'Family golf holidays'
  },
  '/services/society-group-trips': {
    metaTitle: 'Society & Group Trips | GolfSol Ireland',
    eyebrow: 'Services',
    title: 'Society and group golf trips made easy to organise',
    subtitle:
      'We help captains and organisers keep everything clear: golf, hotel, transfers, payments, and communication with the full group.',
    heroImage: '/images/transport-fleet-lineup.jpg',
    heroAlt: 'Mercedes fleet prepared for group golf transfers.',
    highlights: transferHighlights,
    sections: [
      {
        title: 'Built for organisers',
        body:
          'The group lead gets clear milestones and concise updates so decisions happen quickly and everyone knows what is booked.',
        bullets: ['Committee-friendly summaries', 'Group-size pricing clarity', 'Deposit and deadline guidance']
      },
      {
        title: 'Joined-up delivery',
        body:
          'We align your golf-day timings and transfer windows so the week runs smoothly from arrival to final round.',
        bullets: ['Large-group transport support', 'Course mix by ability range', 'Fast issue handling on trip week']
      }
    ],
    formTitle: 'Organise your group trip',
    formLead: 'Tell us your society size and dates. We will map a clean plan and next steps.',
    interestPreset: 'Society and group trips'
  },
  '/golf-courses': {
    metaTitle: 'Costa del Sol Golf Courses | GolfSol Ireland',
    eyebrow: 'Golf Courses',
    title: 'Costa del Sol course options, narrowed to what matters',
    subtitle:
      'No endless scrolling. We help you choose courses that match your group, base, and trip rhythm so every round has purpose.',
    heroImage: '/images/about-golfsol-hero.jpg',
    heroAlt: 'Wide Costa del Sol golf course with mountain and sea backdrop.',
    highlights: transferHighlights,
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
    interestPreset: 'Costa del Sol courses'
  },
  '/golf-courses/sotogrande': {
    metaTitle: 'Sotogrande Golf Cluster | GolfSol Ireland',
    eyebrow: 'Golf Courses',
    title: 'Sotogrande cluster for premium, championship golf weeks',
    subtitle:
      'If your group wants high-calibre rounds and polished surroundings, Sotogrande is often the right anchor for the trip.',
    heroImage: '/images/transport-hero-coastal-drive.jpg',
    heroAlt: 'Driving route toward Sotogrande and Costa del Sol courses.',
    highlights: transferHighlights,
    sections: [
      {
        title: 'Best for quality-first groups',
        body:
          'Sotogrande routing suits groups prioritising flagship rounds and calmer evenings over town-centre nightlife.',
        bullets: ['Top-end course concentration', 'Strong transfer flow to key venues', 'Premium stay options nearby']
      },
      {
        title: 'How we structure the week',
        body:
          'We pair marquee rounds with practical movement times so you get quality without exhausting travel days.',
        bullets: ['Smart sequencing of headline courses', 'Dinner and downtime built in', 'Clear daily plans for captains']
      }
    ],
    formTitle: 'Build a Sotogrande plan',
    formLead: 'Tell us your preferred level and dates and we will draft the right route.',
    interestPreset: 'Sotogrande course cluster'
  },
  '/golf-courses/marbella-golf-valley': {
    metaTitle: 'Marbella Golf Valley | GolfSol Ireland',
    eyebrow: 'Golf Courses',
    title: 'Marbella Golf Valley for lively, high-quality golf breaks',
    subtitle:
      'A strong mix of quality golf, vibrant bases, and easy social evenings. Ideal for many Irish groups looking for balance.',
    heroImage: '/images/transport-moment-resort.jpg',
    heroAlt: 'Marbella resort area near golf valley courses.',
    highlights: transferHighlights,
    sections: [
      {
        title: 'Balanced by design',
        body:
          'Marbella Golf Valley works well when groups want solid golf and a bit more evening energy without losing convenience.',
        bullets: ['Great base options nearby', 'Course variety across ability levels', 'Efficient transfer planning']
      },
      {
        title: 'Group-friendly rhythm',
        body:
          'We map days so tee times, meals, and return runs feel straightforward and low stress.',
        bullets: ['Early and late slot planning', 'Clear travel windows', 'Simple communication for all players']
      }
    ],
    formTitle: 'Plan a Marbella Golf Valley trip',
    formLead: 'Send your dates and group details and we will return practical options.',
    interestPreset: 'Marbella Golf Valley'
  },
  '/golf-courses/mijas-fuengirola': {
    metaTitle: 'Mijas & Fuengirola Courses | GolfSol Ireland',
    eyebrow: 'Golf Courses',
    title: 'Mijas and Fuengirola courses for value and easy logistics',
    subtitle:
      'Great for groups wanting strong golf access, straightforward transfer times, and lively accommodation choices.',
    heroImage: '/images/about-golfsol-hero.jpg',
    heroAlt: 'Golf course near Mijas and Fuengirola on Costa del Sol.',
    highlights: transferHighlights,
    sections: [
      {
        title: 'Smart value without compromise',
        body:
          'This corridor can deliver excellent golf and accommodation options with cleaner budgets for societies and repeat groups.',
        bullets: ['Strong 3-4 star hotel access', 'Good course density nearby', 'Predictable airport transfer windows']
      },
      {
        title: 'Practical for organisers',
        body:
          'We keep routing simple so the full group can follow the plan without endless updates.',
        bullets: ['Easy day-by-day structure', 'Course and stay pairings that make sense', 'Reliable week flow']
      }
    ],
    formTitle: 'Get Mijas/Fuengirola options',
    formLead: 'Tell us your group profile and we will prepare a concise shortlist.',
    interestPreset: 'Mijas and Fuengirola courses'
  },
  '/accommodation': {
    metaTitle: 'Accommodation | GolfSol Ireland',
    eyebrow: 'Accommodation',
    title: 'Costa del Sol accommodation matched to your golf trip',
    subtitle:
      'We help you choose the right base fast, with clear trade-offs between location, budget, and group style.',
    heroImage: '/images/transport-moment-resort.jpg',
    heroAlt: 'Costa del Sol hotel and resort accommodation for golfers.',
    highlights: transferHighlights,
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
    interestPreset: 'Accommodation matching'
  },
  '/accommodation/fuengirola-hotels': {
    metaTitle: 'Fuengirola Hotels | GolfSol Ireland',
    eyebrow: 'Accommodation',
    title: 'Fuengirola hotels Irish golf groups keep coming back to',
    subtitle:
      'Fuengirola is a reliable base for mixed groups: easy coastal vibe, practical transfer links, and strong hotel selection.',
    heroImage: '/images/transport-moment-resort.jpg',
    heroAlt: 'Fuengirola beachfront hotels and promenade.',
    highlights: transferHighlights,
    sections: [
      {
        title: 'Great for social, easy-going weeks',
        body:
          'The town combines straightforward logistics with enough nightlife and dining choice for groups who want options after golf.',
        bullets: ['Beachfront and central options', 'Good access to nearby courses', 'Strong value in peak windows']
      },
      {
        title: 'Simple to run',
        body:
          'We keep your daily movements tight so transfer time stays low and evenings stay flexible.',
        bullets: ['Practical routing from AGP', 'Clear hotel comparisons', 'Group booking support']
      }
    ],
    formTitle: 'Get Fuengirola hotel options',
    formLead: 'Tell us your preferred style and we will return a focused shortlist.',
    interestPreset: 'Fuengirola hotels'
  },
  '/accommodation/torremolinos-hotels': {
    metaTitle: 'Torremolinos Hotels | GolfSol Ireland',
    eyebrow: 'Accommodation',
    title: 'Torremolinos hotels with fast airport access and easy golf days',
    subtitle:
      'Ideal for shorter breaks and groups wanting quick transfer times from Málaga Airport with plenty of local energy.',
    heroImage: '/images/transport-moment-arrivals.jpg',
    heroAlt: 'Arrivals and coastal route toward Torremolinos hotels.',
    highlights: transferHighlights,
    sections: [
      {
        title: 'Efficient start and finish',
        body:
          'Torremolinos works well when airport proximity matters and you want to maximise time on course, not on the motorway.',
        bullets: ['Short AGP transfer windows', 'Good hotel mix by budget', 'Reliable base for golf movement']
      },
      {
        title: 'Group comfort first',
        body:
          'We match hotels by board basis, room configuration, and evening style so your full group stays aligned.',
        bullets: ['Adults-only and group-friendly picks', 'Practical rooming guidance', 'Simple booking flow']
      }
    ],
    formTitle: 'Get Torremolinos hotel options',
    formLead: 'Share your dates and we will send suitable options quickly.',
    interestPreset: 'Torremolinos hotels'
  },
  '/testimonials': {
    metaTitle: 'Testimonials | GolfSol Ireland',
    eyebrow: 'Trust',
    title: 'Why Irish golfers trust GolfSol Ireland',
    subtitle:
      'Groups choose us because we keep the trip clear, calm, and joined up from enquiry through travel week.',
    heroImage: '/images/about-golfsol-hero.jpg',
    heroAlt: 'Irish golf group enjoying Costa del Sol fairways and sunshine.',
    highlights: transferHighlights,
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
    interestPreset: 'Testimonials and feedback'
  },
  '/golf-map': {
    metaTitle: 'Costa del Sol Golf Map | GolfSol Ireland',
    eyebrow: 'Planning',
    title: 'Costa del Sol golf map guidance without the noise',
    subtitle:
      'We help you read the map quickly: where to stay, where to play, and how to avoid unnecessary back-and-forth travel.',
    heroImage: '/images/transport-hero-coastal-drive.jpg',
    heroAlt: 'Coastal motorway and golf corridor map context on Costa del Sol.',
    highlights: transferHighlights,
    sections: [
      {
        title: 'Map clarity for organisers',
        body:
          'Instead of random plotting, we explain the practical clusters and what each one means for transfer times and overall trip flow.',
        bullets: ['Cluster-by-cluster guidance', 'Drive-time reality checks', 'Better pairing of courses and hotels']
      },
      {
        title: 'Use map logic to save the week',
        body:
          'A well-routed trip saves energy and avoids late arrivals. We structure around that from day one.',
        bullets: ['Less dead mileage', 'More relaxed golf days', 'Cleaner plans for larger groups']
      }
    ],
    formTitle: 'Get map-based planning help',
    formLead: 'Tell us your preferred area and we will recommend the strongest route.',
    interestPreset: 'Costa del Sol golf map'
  },
  '/news': {
    metaTitle: 'Sol Insider News | GolfSol Ireland',
    eyebrow: 'Updates',
    title: 'Sol Insider news for Irish golf travellers',
    subtitle:
      'Quick, useful updates: course notes, seasonal windows, and practical travel guidance that helps you decide faster.',
    heroImage: '/images/about-golfsol-hero.jpg',
    heroAlt: 'Costa del Sol golf travel updates and seasonal conditions.',
    highlights: transferHighlights,
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
    interestPreset: 'Sol insider news'
  },
  '/faq': {
    metaTitle: 'FAQ | GolfSol Ireland',
    eyebrow: 'Help',
    title: 'Frequently asked questions, answered clearly',
    subtitle:
      'The key answers most Irish groups need before committing: payments, timing, transfers, and how the booking process actually works.',
    heroImage: '/images/transport-moment-arrivals.jpg',
    heroAlt: 'Airport arrivals and transfer coordination for frequently asked travel questions.',
    highlights: transferHighlights,
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
    interestPreset: 'FAQ request'
  },
  '/contact': {
    metaTitle: 'Contact | GolfSol Ireland',
    eyebrow: 'Contact',
    title: 'Get your golf holiday quote quickly',
    subtitle:
      'Tell us the basics and we come back with clear options. No pressure, no long forms, no wasted time.',
    heroImage: '/images/transport-fleet-lineup.jpg',
    heroAlt: 'GolfSol Ireland transport fleet and premium Costa del Sol travel service.',
    highlights: transferHighlights,
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
    interestPreset: 'General quote request'
  },
  '/newsletter': {
    metaTitle: 'Newsletter | GolfSol Ireland',
    eyebrow: 'Stay Updated',
    title: 'Join our newsletter for useful golf travel updates',
    subtitle:
      'Get concise updates when they are relevant: no constant emails, just practical insights for Irish golfers planning the Sol.',
    heroImage: '/images/about-golfsol-hero.jpg',
    heroAlt: 'Costa del Sol golf travel newsletter and planning updates.',
    highlights: transferHighlights,
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
    interestPreset: 'Newsletter signup'
  },
  '/guides/dress-code-costa-del-sol': {
    metaTitle: 'Dress Code Guide | GolfSol Ireland',
    eyebrow: 'Travel Guide',
    title: 'Dress code guide for Costa del Sol golf courses',
    subtitle:
      'Avoid awkward surprises at check-in. This quick guide helps groups pack right for typical course and clubhouse expectations.',
    heroImage: '/images/about-golfsol-hero.jpg',
    heroAlt: 'Golf attire guidance for Costa del Sol courses.',
    highlights: transferHighlights,
    sections: [
      {
        title: 'On-course essentials',
        body:
          'Most courses expect collared tops, tailored shorts/trousers, and proper golf shoes. We advise by venue when your itinerary is set.',
        bullets: ['No denim on most premium tracks', 'Check spike policy in advance', 'Layering for early/late rounds']
      },
      {
        title: 'Clubhouse expectations',
        body:
          'Some venues relax codes post-round, others do not. We flag stricter policies so the whole group stays comfortable and compliant.',
        bullets: ['Dinner dress notes where relevant', 'Fast reminders before travel', 'Simple checklist for captains']
      }
    ],
    formTitle: 'Get dress-code guidance',
    formLead: 'Share your planned courses and we can send quick dress-code pointers.',
    interestPreset: 'Dress code guidance'
  },
  '/guides/travelling-to-malaga-agp': {
    metaTitle: 'Travelling to Málaga (AGP) | GolfSol Ireland',
    eyebrow: 'Travel Guide',
    title: 'Travelling to Málaga AGP for golf groups',
    subtitle:
      'From flight timings to arrival flow, this guide keeps first-day logistics easy so your group starts calm.',
    heroImage: '/images/transport-moment-arrivals.jpg',
    heroAlt: 'Málaga airport arrivals and transfer pickup zone for golf groups.',
    highlights: transferHighlights,
    sections: [
      {
        title: 'Arrival flow',
        body:
          'Share flight details early and we coordinate pickup timing, bag handling expectations, and onward transfer routing.',
        bullets: ['Meet-and-greet planning', 'Golf bag loading guidance', 'Simple contact plan on arrival day']
      },
      {
        title: 'Departure day',
        body:
          'We reverse the route with practical pickup windows based on airport timing and group size.',
        bullets: ['Buffer for security and baggage', 'Hotel checkout timing support', 'Clear final-day schedule']
      }
    ],
    formTitle: 'Get AGP travel help',
    formLead: 'Send your flight details and we will guide the cleanest transfer plan.',
    interestPreset: 'Travel to Malaga AGP'
  },
  '/privacy-policy': {
    metaTitle: 'Privacy Policy | GolfSol Ireland',
    eyebrow: 'Legal',
    title: 'Privacy policy summary in plain language',
    subtitle:
      'We use your enquiry details to plan and communicate about your trip. We keep this practical, transparent, and respectful.',
    heroImage: '/images/about-golfsol-hero.jpg',
    heroAlt: 'Secure and trusted handling of customer enquiry information.',
    highlights: transferHighlights,
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
    interestPreset: 'Privacy policy enquiry'
  },
  '/terms-and-conditions': {
    metaTitle: 'Terms & Conditions | GolfSol Ireland',
    eyebrow: 'Legal',
    title: 'Terms and conditions overview before you book',
    subtitle:
      'We keep terms practical and readable so organisers understand key points before deposits are made.',
    heroImage: '/images/transport-fleet-lineup.jpg',
    heroAlt: 'Clear terms and reliable service for golf travel planning.',
    highlights: transferHighlights,
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
    interestPreset: 'Terms and conditions enquiry'
  }
}

export const isGeContentPagePath = (path: string): boolean => path in geContentPages

export const getGeContentPage = (path: string): GeContentPageData | null => geContentPages[path] ?? null
