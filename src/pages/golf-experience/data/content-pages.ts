import { footerArticlePages, type FooterArticleContent } from '../../../data/footer-article-pages'
import { seoLandingPages } from '../../../data/seo-landing-pages'
import { seoSearchClusterPages } from '../../../data/seo-search-cluster-pages'
import { seoIrelandSearchPages } from '../../../data/seo-ireland-search-pages'
import { GSOL_BUSINESS } from '../../../lib/business-details'

const companyIdentityBody = `${GSOL_BUSINESS.brandName} — ${GSOL_BUSINESS.addressOneLine}. Ireland ${GSOL_BUSINESS.irishPhoneDisplay} · Spain ${GSOL_BUSINESS.spanishPhoneDisplay}. ${GSOL_BUSINESS.email} · ${GSOL_BUSINESS.websiteDisplay}. ${GSOL_BUSINESS.registeredInLabel}.`

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
  /** Shown on legal pages (privacy / cookies / terms). */
  readonly lastUpdated?: string
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
  if (path === '/airport-transfers') {
    return '/images/transfers/malaga-airport-golf-transfers.webp'
  }
  if (path.includes('airport') || path.includes('transfer') || path.includes('routing')) {
    return '/images/transport-hero-coastal-drive.webp'
  }
  if (path.includes('hotel') || path.includes('accommodation')) {
    return '/images/ge-premium-resort-hotel-hero.webp'
  }
  if (path.includes('course')) {
    return '/images/ge-premium-golf-fairway-coastal.webp'
  }
  if (
    path.includes('package') ||
    path.includes('itinerary') ||
    path.includes('group') ||
    path.includes('deposit') ||
    path.includes('balance') ||
    path.includes('enquiry')
  ) {
    return '/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.webp'
  }
  return '/images/ge-premium-golf-fairway-coastal.webp'
}

function getFooterArticleHeroAlt(path: string, content: FooterArticleContent) {
  if (path === '/airport-transfers') {
    return 'Málaga Airport golf transfers with Meet & Greet by Irish Drivers and golf-bag-friendly vans.'
  }
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
    return 'Get a transfer quote'
  }
  if (path.includes('hotel') || path.includes('accommodation')) {
    return 'Get a hotel quote'
  }
  if (path.includes('course')) {
    return 'Ask about these courses'
  }
  if (path.includes('terms')) {
    return 'Ask about terms'
  }
  return 'Get a quote'
}

function getFooterArticleFormLead(path: string) {
  if (path.includes('airport') || path.includes('transfer') || path.includes('routing')) {
    return 'Send the flight date, the hotel and how many are travelling.'
  }
  if (path.includes('hotel') || path.includes('accommodation')) {
    return 'Send the dates and the town you want. We’ll reply with stay options.'
  }
  if (path.includes('course')) {
    return 'Send the dates and how many are playing. We’ll suggest the rounds.'
  }
  if (path.includes('terms')) {
    return 'Send the clause or question you want clarified and we will answer directly.'
  }
  return 'Send the dates and the group size. We’ll come back with a plan.'
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
  metaTitle: 'Get a Quote | GolfSol Ireland',
  eyebrow: 'GolfSol Ireland',
  title: 'Get a quote',
  subtitle: 'Dates, golfers, and a phone number — we reply from Ireland with clear options.',
  heroImage: '/images/quote-hero-costa-golf-golden-hour.webp',
  heroAlt: 'Calm Costa del Sol golf fairway at golden hour — open sky for a quiet quote request.',
  highlights: trustHighlights,
  sections: [
    {
      title: 'What to send us',
      body: 'Your dates and group size are enough to start. We refine hotels, courses and transfers from there.',
      bullets: ['Quick first response', 'Clear choices to compare', 'Practical next actions']
    },
    {
      title: 'Company details',
      body: companyIdentityBody,
      bullets: [
        `Ireland ${GSOL_BUSINESS.irishPhoneDisplay}`,
        `Spain ${GSOL_BUSINESS.spanishPhoneDisplay}`,
        GSOL_BUSINESS.email,
        GSOL_BUSINESS.registeredInLabel
      ]
    }
  ],
  formTitle: 'Start your quote request',
  formLead: 'Short form — we come back with clear, actionable options.',
  interestPreset: 'General quote request',
  enquiryType: 'booking'
}

const termsPage: GeContentPageData = {
  metaTitle: 'Terms & Conditions | GolfSol Ireland',
  eyebrow: 'Legal',
  title: 'Terms and conditions for GolfSol Ireland bookings',
  subtitle:
    'Clear booking terms for deposits, supplier changes, golf course issues, accommodation problems, cancellations and liability before your group commits.',
  heroImage: '/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.webp',
  heroAlt: 'GolfSol Ireland private transfers on the Costa del Sol — terms and conditions.',
  highlights: trustHighlights,
  lastUpdated: 'November 2026',
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
    },
    {
      title: 'Company identity',
      body: `${GSOL_BUSINESS.brandName} is registered in Ireland (Co. ${GSOL_BUSINESS.companyRegistrationNumber}). Registered office: ${GSOL_BUSINESS.addressOneLine}. Contact: Ireland ${GSOL_BUSINESS.irishPhoneDisplay} · Spain ${GSOL_BUSINESS.spanishPhoneDisplay} · ${GSOL_BUSINESS.email} · ${GSOL_BUSINESS.websiteDisplay}.`,
      bullets: [
        GSOL_BUSINESS.registeredInLabel,
        GSOL_BUSINESS.addressOneLine,
        `Ireland ${GSOL_BUSINESS.irishPhoneDisplay} · Spain ${GSOL_BUSINESS.spanishPhoneDisplay}`
      ]
    }
  ],
  formTitle: 'Ask about terms',
  formLead: 'Send your question and we will clarify terms before you proceed.',
  interestPreset: 'Terms and conditions enquiry',
  enquiryType: 'legal'
}

const privacyPage: GeContentPageData = {
  metaTitle: 'Privacy Policy | Golf Sol Ireland',
  eyebrow: 'Legal',
  title: 'Privacy policy',
  subtitle:
    'How Golf Sol Ireland collects, uses, and protects your personal data under the EU GDPR and Irish Data Protection Act 2018.',
  heroImage: '/images/about-golfsol-hero.webp',
  heroAlt: 'Secure and trusted handling of customer enquiry information.',
  highlights: trustHighlights,
  lastUpdated: 'November 2026',
  sections: [
    {
      title: 'Who we are (data controller)',
      body: `${GSOL_BUSINESS.legalName} is the data controller for personal data processed through ${GSOL_BUSINESS.websiteDisplay}. We are registered in Ireland (Co. ${GSOL_BUSINESS.companyRegistrationNumber}). Registered office: ${GSOL_BUSINESS.addressOneLine}.`,
      bullets: [
        `Email (privacy & DSARs): ${GSOL_BUSINESS.email}`,
        `Ireland ${GSOL_BUSINESS.irishPhoneDisplay} · Spain ${GSOL_BUSINESS.spanishPhoneDisplay}`,
        `WhatsApp (messages only): ${GSOL_BUSINESS.whatsappDisplay}`,
        GSOL_BUSINESS.registeredInLabel
      ]
    },
    {
      title: 'What we collect',
      body:
        'We collect personal data you give us when you request a quote, leave a callback request, subscribe to updates, create a trip-desk (portal) account, pay a deposit or balance, or contact us by email, phone, or WhatsApp.',
      bullets: [
        'Identity & contact: name, email, phone / WhatsApp number (we treat the mobile number as the unique customer key after normalisation)',
        'Trip details: dates, group size, golf courses, hotels / accommodation, transfers, package preferences, and free-text notes',
        'Portal account data: login email, profile, enquiry reference, interest tickets (transfers, golf, accommodation), and messages with our desk',
        'Payment records: amounts, invoices / proposals, and bank-transfer references (for example Monzo IBAN details we share for payment). We do not store full card numbers on this website',
        'Technical: IP address and security signals via Google reCAPTCHA v3 on public forms; essential cookie / browser storage for consent and login sessions; server logs from our hosting provider'
      ]
    },
    {
      title: 'Why we use your data (purposes & lawful bases)',
      body:
        'Under GDPR Article 6 we rely on the following lawful bases. We do not sell your personal data.',
      bullets: [
        'Art. 6(1)(b) contract / pre-contractual steps — respond to enquiries and quotes, arrange golf, hotels, and transfers, operate your trip desk, and deliver the booking you requested',
        'Art. 6(1)(f) legitimate interests — run and secure the website, prevent spam and fraud (including reCAPTCHA), improve service quality, and keep basic records of past trips for continuity — balanced against your rights',
        'Art. 6(1)(a) consent — optional newsletter / marketing emails (unticked checkbox; withdraw any time) and any future optional analytics or marketing cookies (none are used today)',
        'Art. 6(1)(c) legal obligation — tax, accounting, and company-law record keeping where Irish or EU law requires it'
      ]
    },
    {
      title: 'Who we share data with (processors & recipients)',
      body:
        'We use carefully chosen service providers and trip partners. They may only process your data on our instructions or as needed to deliver the service you asked for.',
      bullets: [
        'Hosting & delivery: Vercel (website hosting)',
        'Database, authentication & storage: Supabase (EU-region configuration where available)',
        'Transactional & newsletter email: our email provider (Resend) and our business mailbox for replies',
        'Spam protection: Google reCAPTCHA v3 on public enquiry forms',
        'Payments: bank transfer details (e.g. Monzo) shown for settlement; card processors only if / when a checkout is used for your booking',
        'Trip suppliers in Spain / Portugal (and elsewhere as needed): golf courses, hotels / resorts, and transfer partners — only the details needed to confirm tee times, rooms, and transport',
        'Professional advisers (accountant, solicitor) where required for the business'
      ]
    },
    {
      title: 'International transfers',
      body:
        'Some processors (for example US-based cloud or security providers) may process data outside the EEA. Where that happens we rely on appropriate safeguards such as the European Commission’s Standard Contractual Clauses (SCCs) and / or the EU–US Data Privacy Framework for certified organisations, plus the provider’s own GDPR commitments.'
    },
    {
      title: 'How long we keep your data',
      body:
        'We keep personal data only as long as needed for the purpose it was collected, including legal retention.',
      bullets: [
        'Open enquiries & active trips: while we are quoting, booking, or delivering your trip, plus a short follow-up period',
        'Completed bookings & invoices: typically up to 7 years for Irish tax / accounting obligations',
        'Newsletter subscribers: until you unsubscribe or ask us to delete the address',
        'Cookie consent record: up to 6 months (then we ask again)',
        'Portal login sessions: until you sign out or the session expires',
        'Ask us any time if you want a shorter retention where the law allows'
      ]
    },
    {
      title: 'Cookies and similar technologies',
      body:
        'We use essential cookies and browser storage only (consent choice and login sessions). We do not load Google Analytics, Google Ads, Meta Pixel, or similar marketing / analytics cookies. See the cookie policy for the full table and to change your choice.',
      bullets: ['Cookie policy — /cookie-policy']
    },
    {
      title: 'Your rights under the GDPR',
      body:
        'You can exercise your rights free of charge by emailing us. We will respond within one month (GDPR Article 12), or tell you if we need more time for a complex request.',
      bullets: [
        'Access — a copy of the personal data we hold about you',
        'Rectification — correct inaccurate or incomplete data',
        'Erasure — ask us to delete data where the law allows (“right to be forgotten”)',
        'Restriction — limit how we use your data in certain cases',
        'Portability — receive data you provided in a structured, commonly used format where applicable',
        'Objection — object to processing based on legitimate interests',
        'Withdraw consent — for marketing emails or optional cookies, at any time, without affecting prior lawful processing'
      ]
    },
    {
      title: 'How to make a data request (DSAR)',
      body: `Email ${GSOL_BUSINESS.email} with “Data request” in the subject and enough detail for us to find your records (name, email, phone, and approximate enquiry dates help). We may need to verify your identity. Our admin tools can export or delete individual enquiry records and portal accounts when we process a valid request.`
    },
    {
      title: 'Complaints — Irish Data Protection Commission (DPC)',
      body:
        'If you are unhappy with how we handle your data, you have the right to lodge a complaint with the Irish supervisory authority.',
      bullets: [
        'Data Protection Commission — https://www.dataprotection.ie',
        '21 Fitzwilliam Square South, Dublin 2, D02 RD28, Ireland'
      ]
    },
    {
      title: 'Children',
      body:
        'Our services are aimed at adults arranging golf travel. We do not knowingly collect personal data from children under 16 for marketing. If you believe a child has provided data, contact us and we will delete it where appropriate.'
    },
    {
      title: 'Changes to this policy',
      body:
        'We may update this privacy policy when our services or legal requirements change. The “Last updated” date at the top of this page shows the latest revision. Material changes will be reflected on this page.'
    }
  ],
  formTitle: 'Ask a privacy question',
  formLead: 'If you need clarification on data handling, send a quick request here.',
  interestPreset: 'Privacy policy enquiry',
  enquiryType: 'legal'
}

const cookiePolicyPage: GeContentPageData = {
  metaTitle: 'Cookie Policy | Golf Sol Ireland',
  eyebrow: 'Legal',
  title: 'Cookie policy',
  subtitle:
    'What cookies and browser storage Golf Sol Ireland uses, why, and how to change your choice under Irish ePrivacy / DPC guidance.',
  heroImage: '/images/about-golfsol-hero.webp',
  heroAlt: 'Golf Sol Ireland crest, used on the cookie policy page.',
  highlights: trustHighlights,
  lastUpdated: 'November 2026',
  sections: [
    {
      title: 'What this page covers',
      body:
        'This is a plain-English list of the cookies and browser storage the public site uses today. If we add a new optional tool, we will update this page and ask for consent before it is switched on.'
    },
    {
      title: 'How we ask for consent',
      body:
        'On your first visit we show a cookie banner with equally prominent Accept All and Reject All buttons, plus Manage preferences. Closing the banner is treated as Reject All (essential cookies only). Your choice is stored for six months. Use Cookie settings in the footer any time to open the preferences panel again.'
    },
    {
      title: 'Cookie and storage table',
      body:
        'Name · Category · Provider · Purpose · Duration — listed below as bullets for clarity on mobile.',
      bullets: [
        'gsol_consent — Strictly necessary — Golf Sol Ireland (first-party) — Stores your cookie choice (version, timestamp, preferences) — 6 months',
        'gsol-cookie-consent (localStorage) — Strictly necessary — Golf Sol Ireland — Same consent record so the banner does not nag every page — 6 months (cleared with browser data)',
        'Supabase auth session (localStorage) — Strictly necessary — Supabase / Golf Sol Ireland — Keeps you signed in to the trip desk or admin desk after login — Until sign-out or session expiry'
      ]
    },
    {
      title: 'Related technologies (not advertising cookies)',
      body:
        'These are not marketing or analytics cookies, but they involve third parties when you use certain features.',
      bullets: [
        'Google reCAPTCHA v3 — loaded on public enquiry / callback forms to reduce spam (security / legitimate interests). Google may set its own cookies when the widget runs',
        'Bunny Fonts — we load fonts from fonts.bunny.net for site typography (no advertising profile)',
        'OpenStreetMap / Carto map tiles — loaded only on pages that show a map (e.g. golf map / transfer maps); the tile provider may see your IP for that request',
        'WhatsApp / social links — outbound links only; we do not embed Meta or other advertising pixels'
      ]
    },
    {
      title: 'What we do not use',
      body:
        'This site does not load Google Analytics, Google Tag Manager, Google Ads, Meta Pixel, Vercel Analytics, Speed Insights, or PostHog. There is currently no analytics or marketing cookie category to turn on. Accept All and Reject All therefore both leave optional categories off.'
    },
    {
      title: 'How to change or withdraw consent',
      body:
        'Open Cookie settings from the footer (or the button on this page). We ask again after six months, or sooner if we change optional cookies. Clearing site cookies / storage in your browser also brings the banner back.',
      bullets: ['Privacy policy — /privacy-policy']
    },
    {
      title: 'Do you use Google Analytics?',
      body:
        'No. Not on this website, and not through Tag Manager, Google Ads, or a Meta pixel. If that changes, the banner will ask with equal Accept All / Reject All choices and unticked preference toggles before any optional cookie is set.'
    }
  ],
  formTitle: 'Ask about this policy',
  formLead: 'If something here is unclear, send a short note and we will explain it.',
  interestPreset: 'Cookie policy enquiry',
  enquiryType: 'legal'
}

const teeTimeOnlyPage: GeContentPageData = {
  metaTitle: 'Tee Time Bookings Only | GolfSol Ireland',
  eyebrow: 'Tee-time bookings',
  title: 'Tee-time bookings only, if your hotel is already sorted',
  subtitle:
    'Need golf only? We can shortlist and secure the right rounds without repackaging your whole trip. Fast, clear, and suited to Irish groups.',
  heroImage: '/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.webp',
  heroAlt: 'GolfSol Ireland private transfers on the Costa del Sol — tee-time booking service.',
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
  eyebrow: 'Twilight golf',
  title: 'Twilight golf on the Costa del Sol — golden-hour rounds, smarter pacing',
  subtitle:
    'Late-afternoon tee times pair softer green fees with forgiving light and an easier run to dinner in Marbella, Fuengirola or Puerto Banús. We shortlist courses that run twilight sheets well for Irish groups.',
  heroImage: '/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.webp',
  heroAlt:
    'GolfSol Ireland private transfers on the Costa del Sol — twilight golf service.',
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
  heroImage: '/images/about-golfsol-hero.webp',
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
  heroImage: '/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.webp',
  heroAlt: 'GolfSol Ireland private transfers on the Costa del Sol — booking service.',
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
  heroImage: '/images/transport-hero-coastal-drive.webp',
  heroAlt: 'Private transfer on the Costa del Sol motorway.',
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
  eyebrow: 'GolfSol Ireland',
  title: 'Find your course',
  subtitle: 'Filter by area and level, add courses to your trip, then build a clear quote.',
  heroImage: '/images/ge-premium-golf-fairway-coastal.webp',
  heroAlt: 'Wide Costa del Sol golf course with mountain and sea backdrop.',
  highlights: trustHighlights,
  sections: [],
  formTitle: 'Get a course shortlist',
  formLead: 'Share your dates, group size, and the course(s) you want — or ask us to shortlist — and we will reply with clear options.',
  interestPreset: 'Costa del Sol courses',
  enquiryType: 'booking'
}

const accommodationPage: GeContentPageData = {
  metaTitle: 'Hotels | GolfSol Ireland',
  eyebrow: 'GolfSol Ireland',
  title: 'Find your hotel',
  subtitle: 'Area, level, and nearby courses — then build a clear quote from Ireland.',
  heroImage: '/images/ge-premium-resort-hotel-hero.webp',
  heroAlt: 'Costa del Sol hotel and resort accommodation for golfers.',
  highlights: trustHighlights,
  sections: [],
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
  heroImage: '/images/about-golfsol-hero.webp',
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
  heroImage: '/images/transport-moment-arrivals.webp',
  heroAlt: 'Airport arrivals and transfer coordination for frequently asked travel questions.',
  highlights: trustHighlights,
  sections: [
    {
      title: 'How do deposits and balances work?',
      body:
        'Unless your written proposal says otherwise, expect a deposit to hold supplier space and a balance before travel. We confirm milestones in writing so the group knows what is locked.',
      bullets: ['Simple payment milestones', 'What is confirmed and when', 'How changes are handled']
    },
    {
      title: 'When are tee times and hotels confirmed?',
      body:
        'We hold preferred options while suppliers confirm. Nothing is final until you have written confirmation and the required payment steps are complete.'
    },
    {
      title: 'Do you arrange Málaga Airport golf transfers?',
      body:
        'Yes — private, golf-bag-friendly transfers from AGP to your hotel or resort base. See /transfers/malaga-airport-golf-transfers for the full transfer story.'
    },
    {
      title: 'How many nights should our group stay?',
      body:
        '3 nights suits short breaks; 5–7 nights suits most societies. Compare /golf-packages/3-night-golf-breaks, /golf-packages/5-night-golf-holidays, and /golf-packages/7-night-golf-holidays.'
    },
    {
      title: 'Need a direct answer for your dates?',
      body:
        'If your question is specific to your dates or group, send it through and we will answer directly from Ireland.',
      bullets: [
        'Fast response from Ireland',
        'Costa del Sol FAQ — /guides/costa-del-sol-golf-faq',
        'Get a quote — /quote'
      ]
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
  heroImage: '/images/about-golfsol-hero.webp',
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
  eyebrow: 'Stay updated',
  title: 'Costa del Sol golf notes for Irish travellers',
  subtitle: 'A short email when there is something useful. No weekly blast, and you can leave the list any time.',
  heroImage: '/images/about-golfsol-hero.webp',
  heroAlt: 'Costa del Sol golf travel newsletter and planning updates.',
  highlights: ['A few emails a year', 'Tee times, travel, and seasonal notes', 'Unsubscribe in one reply'],
  sections: [
    {
      title: 'What you get',
      body: 'Course timing notes, travel reminders, and the occasional offer that helps a captain plan the next Costa del Sol week.'
    },
    {
      title: 'Easy to leave',
      body: 'Reply to any email and we take you off. We do not pass the list to anyone else.'
    }
  ],
  formTitle: 'Subscribe',
  formLead: 'Add your email. That is the whole signup.',
  interestPreset: 'Newsletter signup',
  enquiryType: 'newsletter'
}

const coreGeContentPages: Record<string, GeContentPageData> = {
  '/about': aboutPage,
  '/booking': bookingPage,
  '/transport': transportOverviewPage,
  '/tee-time-bookings-only': teeTimeOnlyPage,
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
  '/cookie-policy': cookiePolicyPage,
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
    heroImage: '/images/courses/sotogrande-golf-corridor.webp',
    heroAlt: 'Championship coastal golf fairways in the Sotogrande corridor on the western Costa del Sol.',
    interestPreset: 'Sotogrande golf cluster'
  },
  '/golf-courses/marbella-golf-valley': {
    ...coursesPage,
    metaTitle: 'Marbella Golf Valley | GolfSol Ireland',
    eyebrow: 'Golf Courses',
    title: 'Marbella Golf Valley options with clear routing logic',
    subtitle:
      'Build a smarter week around Marbella Golf Valley with practical travel times, pace balance, and cleaner day flow.',
    heroImage: '/images/courses/marbella-golf-valley-corridor.webp',
    heroAlt: 'Marbella golf valley fairways between Mediterranean hills and resort ridges.',
    interestPreset: 'Marbella Golf Valley'
  },
  '/golf-courses/mijas-fuengirola': {
    ...coursesPage,
    metaTitle: 'Mijas & Fuengirola Golf Courses | GolfSol Ireland',
    eyebrow: 'Golf Courses',
    title: 'Mijas and Fuengirola golf routes made straightforward',
    subtitle:
      'Compare Mijas and Fuengirola clusters with simple guidance on course mix, transfer rhythm, and group-friendly sequencing.',
    heroImage: '/images/courses/mijas-fuengirola-golf-corridor.webp',
    heroAlt: 'Rolling Mijas and Fuengirola golf corridor with mountain backdrop on the Costa del Sol.',
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
    title: 'Costa del Sol golf map',
    subtitle: 'Browse courses as a simple list or map — tap one to plan transfers, hotel and tee times.',
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
  '/twilight-golf': twilightGolfPage,
  '/services/society-group-trips': bookingPage
}

const geContentPages: Record<string, GeContentPageData> = {
  ...convertedFooterArticlePages,
  ...coreGeContentPages,
  ...seoLandingPages,
  ...seoSearchClusterPages,
  ...seoIrelandSearchPages
}

export { geContentPages }

export { isGeContentPagePath } from './ge-content-page-paths'

export const getGeContentPage = (path: string): GeContentPageData | null => geContentPages[path] ?? null
