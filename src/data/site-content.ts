import {
  BedDouble,
  BadgeEuro,
  Bus,
  CalendarRange,
  CarFront,
  CheckCircle2,
  Flag,
  type LucideIcon,
  Mail,
  MapPinned,
  Phone,
  Plane,
  ShieldCheck,
  Sparkles,
  Trophy
} from 'lucide-react'

export interface StatItem {
  readonly value: string
  readonly label: string
}

export interface PackageItem {
  readonly name: string
  readonly description: string
  readonly price: string
  readonly duration: string
  readonly highlight: string
  readonly includes: readonly string[]
}

export interface CourseItem {
  readonly name: string
  readonly location: string
  readonly distance: string
  readonly badge: string
  readonly description: string
  readonly rate: string
  readonly image: string
  readonly tags: readonly string[]
}

export interface HotelItem {
  readonly name: string
  readonly tier: 3 | 4 | 5
  readonly area: string
  readonly image: string
  readonly description: string
  readonly perks: readonly string[]
  readonly price: string
}

export interface TransferFeature {
  readonly title: string
  readonly description: string
  readonly icon: LucideIcon
}

export interface PlanningStep {
  readonly step: string
  readonly title: string
  readonly description: string
  readonly image: string
}

export interface TestimonialItem {
  readonly quote: string
  readonly name: string
  readonly meta: string
}

export interface TrustSignal {
  readonly title: string
  readonly description: string
  readonly icon: LucideIcon
}

export interface IrishDepartureRoute {
  readonly departure: string
  readonly arrival: string
  readonly note: string
}

export interface FooterLinkItem {
  readonly label: string
  readonly href: string
}

export interface FooterLinkGroup {
  readonly title: string
  readonly links: readonly FooterLinkItem[]
}

export interface FooterSocialLink {
  readonly label: 'LinkedIn' | 'Facebook' | 'WhatsApp' | 'Bluesky'
  readonly href: string
}

export interface CompanyContact {
  readonly addressLines: readonly string[]
  readonly eircode: string
  readonly phoneDisplay: string
  readonly phoneTel: string
  readonly whatsappHref: string
  readonly mapsQuery: string
}

export const companyContact = {
  addressLines: ['6 Richmond Road', 'Drumcondra', 'Dublin 3'],
  eircode: 'D03 C434',
  phoneDisplay: '087 446 4766',
  phoneTel: '+353874464766',
  whatsappHref: 'https://wa.me/353874464766',
  mapsQuery: '6 Richmond Road, Drumcondra, Dublin 3, D03 C434, Ireland'
} as const satisfies CompanyContact

export const navLinks = [
  'Packages',
  'Courses',
  'Hotels',
  'Transfers',
  'Testimonials'
] as const

export const heroStats: readonly StatItem[] = [
  { value: '70+', label: 'Costa del Sol courses, chosen with Irish groups in mind' },
  { value: '4.9/5', label: 'Average satisfaction from Irish travellers' },
  { value: '100%', label: 'Irish-led planning from first call to final round' }
]

export const irishDepartureRoutes: readonly IrishDepartureRoute[] = [
  {
    departure: 'Dublin',
    arrival: 'Malaga',
    note: 'Best for societies, long-weekend groups, and direct-flight convenience'
  },
  {
    departure: 'Shannon',
    arrival: 'Costa del Sol',
    note: 'Ideal for west-of-Ireland groups who want the admin handled properly'
  },
  {
    departure: 'Cork',
    arrival: 'Malaga',
    note: 'Perfect for southern groups looking for polished golf without patchwork logistics'
  }
] as const

export const packageItems: readonly PackageItem[] = [
  {
    name: 'Society Escape',
    description: 'Built for Irish societies and groups who want premium golf, easy logistics, and a lively Costa del Sol base.',
    price: 'From EUR 995 pp',
    duration: '4 nights / 3 rounds',
    highlight: 'Best for 4-8 golfers',
    includes: ['Preferred tee times', 'Airport transfers', 'Shared buggy options']
  },
  {
    name: 'Couples Fairway Retreat',
    description: 'A slower, more polished itinerary for Irish couples who want championship golf without losing the relaxed holiday feel.',
    price: 'From EUR 1,280 pp',
    duration: '5 nights / 3 rounds',
    highlight: 'Luxury without overplanning',
    includes: ['Boutique hotel stay', 'Private resort transfers', 'Sunset dinner recommendations']
  },
  {
    name: 'Five-Star Signature Week',
    description: 'The flagship Irish-led itinerary: marquee courses, five-star accommodation, concierge transfers, and zero admin stress.',
    price: 'From EUR 1,890 pp',
    duration: '7 nights / 5 rounds',
    highlight: 'Most requested itinerary',
    includes: ['VIP meet and greet', 'Premium practice access', 'Private transport throughout']
  }
] as const

export const featuredCourses: readonly CourseItem[] = [
  {
    name: 'Finca Cortesin',
    location: 'Casares, Costa del Sol',
    distance: '55 mins from Malaga',
    badge: 'Tour-calibre',
    description: 'A world-class layout with immaculate conditioning, dramatic valleys, and the kind of service serious golf travellers remember.',
    rate: 'Signature package upgrade',
    image:
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
    tags: ['Championship', 'Luxury clubhouse', 'Private resort feel']
  },
  {
    name: 'La Reserva Club',
    location: 'Sotogrande',
    distance: '65 mins from Malaga',
    badge: 'Members-style luxury',
    description: 'Broad fairways, elevated greens, and a polished Sotogrande atmosphere that suits premium group trips perfectly.',
    rate: 'From EUR 185 green fee',
    image:
      'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80',
    tags: ['Sotogrande', 'Wide fairways', 'Excellent practice']
  },
  {
    name: 'Marbella Club Golf Resort',
    location: 'Benahavis',
    distance: '45 mins from Malaga',
    badge: 'Hidden gem',
    description: 'Exclusive, scenic, and beautifully paced for couples or smaller groups who want something more refined than busy resort golf.',
    rate: 'From EUR 160 green fee',
    image:
      'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=1200&q=80',
    tags: ['Boutique', 'Sea views', 'Quiet luxury']
  }
] as const

export const hotels: readonly HotelItem[] = [
  {
    name: 'Sol Riviera Suites',
    tier: 3,
    area: 'La Cala',
    image:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    description: 'Smart, stylish, and close to nightlife and fairways. Ideal for value-conscious groups that still want polish.',
    perks: ['Breakfast included', 'Pool terrace', 'Walkable marina'],
    price: 'From EUR 129 / night'
  },
  {
    name: 'Mediterraneo Grand',
    tier: 4,
    area: 'Marbella',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    description: 'A balanced four-star base with strong dining, beach access, and easy positioning for marquee western Costa rounds.',
    perks: ['Sea-view rooms', 'Golf breakfast timings', 'Resort shuttle'],
    price: 'From EUR 189 / night'
  },
  {
    name: 'Andalusian Reserve',
    tier: 5,
    area: 'Estepona',
    image:
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    description: 'Five-star calm with spa access, private transfers, and a discreet concierge feel for your flagship trip.',
    perks: ['Private transfer desk', 'Spa circuit', 'Late checkout support'],
    price: 'From EUR 319 / night'
  }
] as const

export const transferFeatures: readonly TransferFeature[] = [
  {
    title: 'Airport-to-hotel routing',
    description: 'Timed around Irish arrivals, club luggage, and awkward group flight splits.',
    icon: Plane
  },
  {
    title: 'Course-day transfers',
    description: 'Reliable tee-time transport that keeps the day relaxed, not rushed.',
    icon: Bus
  },
  {
    title: 'Private driver upgrades',
    description: 'For premium packages, we can keep the same driver and vehicle with your group throughout.',
    icon: CarFront
  },
  {
    title: 'Real itinerary support',
    description: 'The frontend is already structured for later live itinerary, payment, and email integrations.',
    icon: ShieldCheck
  }
] as const

export const planningSteps: readonly PlanningStep[] = [
  {
    step: '01',
    title: 'Tell us your group style',
    description: 'Dates, budget band, handicap mix, preferred base, and the kind of trip energy you want.',
    image:
      'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=80'
  },
  {
    step: '02',
    title: 'Receive a tailored route',
    description: 'We shape the golf, hotel tier, and transfer plan around your priorities instead of forcing a rigid template.',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'
  },
  {
    step: '03',
    title: 'Confirm the details',
    description: 'Payment, tee times, and rooming can plug into Stripe and Supabase later without reworking the UI foundation.',
    image:
      'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=1200&q=80'
  },
  {
    step: '04',
    title: 'Travel light and play',
    description: 'Flights from Ireland, transfers, golf days, and local guidance are lined up before you land in Spain.',
    image:
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80'
  }
] as const

export const testimonials: readonly TestimonialItem[] = [
  {
    quote:
      'Golf Sol Ireland sorted the trip the way an Irish organiser actually would. Flights out of Dublin, proper tee-time spacing, a premium hotel, and not one messy handoff all week.',
    name: 'Declan Walsh',
    meta: 'Dublin golf society, Marbella four-night trip'
  },
  {
    quote:
      'The difference was the Irish judgement behind it. We did not get a generic package, we got the right courses for our group and the right base for evenings out.',
    name: 'Niamh and Ciaran',
    meta: 'Cork couple, Costa del Sol spring break'
  },
  {
    quote:
      'You could tell it was built for Irish golfers. The timings worked, the hotel recommendation made sense, and even the recovery day between rounds felt like it had been planned by someone who knows our groups.',
    name: 'Aidan Kelleher',
    meta: 'Limerick fourball, five-night Costa trip'
  }
] as const

export const trustSignals: readonly TrustSignal[] = [
  {
    title: 'Irish-first judgement',
    description: 'Advice shaped around how Irish groups actually travel, split budgets, organise WhatsApp chats, and want the days to flow.',
    icon: ShieldCheck
  },
  {
    title: 'No patchwork logistics',
    description: 'Flights from Ireland, hotel base, tee times, and transfers are thought through as one trip, not four separate bookings.',
    icon: Plane
  },
  {
    title: 'Premium without brochure fluff',
    description: 'Stronger course choices, smarter routing, and cleaner pacing instead of generic one-size-fits-all packages sold from a brochure.',
    icon: Sparkles
  }
] as const

export const trustMarkers = [
  'Costa del Sol expertise with a distinctly Irish lens',
  'Clear planning before Dublin, Shannon, or Cork flights are booked',
  'Hotels, golf, and transfers aligned from day one'
] as const

export const footerGroups: readonly FooterLinkGroup[] = [
  {
    title: 'Explore',
    links: [
      { label: 'Golf packages', href: '/golf-packages' },
      { label: 'Featured courses', href: '/featured-courses' },
      { label: 'Accommodation tiers', href: '/accommodation-tiers' },
      { label: 'Airport transfers', href: '/airport-transfers' }
    ]
  },
  {
    title: 'Plan your trip',
    links: [
      { label: 'Tailored itinerary', href: '/tailored-itinerary' },
      { label: 'Course shortlist', href: '/course-shortlist' },
      { label: 'Hotel matching', href: '/hotel-matching' },
      { label: 'Group preferences', href: '/group-preferences' }
    ]
  },
  {
    title: 'Travel support',
    links: [
      { label: 'Irish group planning', href: '/irish-group-planning' },
      { label: 'Costa del Sol routing', href: '/costa-del-sol-routing' },
      { label: 'Transfer coordination', href: '/transfer-coordination' },
      { label: 'Booking follow-up', href: '/booking-follow-up' }
    ]
  },
  {
    title: 'Booking details',
    links: [
      { label: '20% deposit upfront', href: '/deposit-upfront' },
      { label: 'Final balance terms', href: '/final-balance-terms' },
      { label: 'No-obligation enquiry', href: '/no-obligation-enquiry' },
      { label: 'T&Cs apply', href: '/terms-and-conditions' }
    ]
  }
] as const

export const footerSocialLinks: readonly FooterSocialLink[] = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/'
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/'
  },
  {
    label: 'WhatsApp',
    href: companyContact.whatsappHref
  },
  {
    label: 'Bluesky',
    href: 'https://bsky.app/'
  }
] as const

export const newsletterBenefits = [
  {
    title: 'First look at limited tee times',
    icon: Trophy
  },
  {
    title: 'Seasonal Costa del Sol offers',
    icon: BadgeEuro
  },
  {
    title: 'Travel notes for Irish golfers',
    icon: Mail
  }
] as const

/** Left column tiles beside the homepage enquiry form (not newsletter signup). */
export const landingEnquiryHighlights = [
  {
    title: 'Tell us your dates, group size, and how you travel — we read every enquiry and reply properly.',
    icon: Mail
  },
  {
    title: 'Add phone or WhatsApp and your best time to call — we reach out in that window, not as a mailing list.',
    icon: Phone
  },
  {
    title: 'No obligation: if the trip is a fit, you get a clear next step — not a generic brochure drop.',
    icon: Sparkles
  }
] as const

export const packageFeatureRows = [
  {
    title: 'Flights, golf, stay, seamlessly aligned',
    description: 'Everything is shaped to work as one smooth itinerary, so the trip feels joined-up, well judged, and easy from departure to final round.',
    icon: CalendarRange
  },
  {
    title: 'Course-first curation',
    description: 'The golf leads the planning. From there, hotel style, transfer flow, and downtime are arranged around the kind of week your group actually wants.',
    icon: Flag
  },
  {
    title: 'Costa del Sol knowledge',
    description: 'From Marbella to Sotogrande, the difference is knowing where to stay, when to move, and how to get the best golf without wasting time or budget.',
    icon: MapPinned
  },
  {
    title: 'Premium without pretence',
    description: 'Luxury here means cleaner decisions, calmer pacing, and a more polished experience throughout, without tipping into brochure fluff or overdone excess.',
    icon: Sparkles
  }
] as const

export const heroCardHighlights = [
  'Marbella and Sotogrande itineraries for Irish groups',
  '3 to 5-star accommodation tiers',
  'Private and shared transfer options',
  'Irish-led support before you ever board the flight'
] as const

export const costaMetrics = [
  { label: 'Courses across the coast', value: '70+' },
  { label: 'Best seasons for Irish golfers', value: 'Sep-May' },
  { label: 'Average group stay', value: '4-7 nights' }
] as const

export const primaryActions = {
  planTrip: 'Plan Your Trip',
  viewPackages: 'View Packages',
  enquire: 'Start Your Enquiry'
} as const

export const heroBackgroundImage =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1800&q=80'
