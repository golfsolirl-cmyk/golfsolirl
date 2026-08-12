import type { GeContentPageData } from '../pages/golf-experience/data/content-pages'
import { SEO_CONTACT } from '../lib/seo/seo-contact'

const imgFairway = '/images/ge-premium-golf-fairway-coastal.webp'
const imgFleet = '/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.webp'
const imgHotel = '/images/ge-premium-resort-hotel-hero.webp'
const imgTransfer = '/images/hero-costa-del-sol-transfer-banner.webp'
const imgGroup = '/images/ge-premium-golf-group-testimonial.webp'

const contactLine = `Irish support ${SEO_CONTACT.irishPhoneDisplay} · Spanish line ${SEO_CONTACT.spanishPhoneDisplay} · ${SEO_CONTACT.email}`

const sharedHighlights = [
  'Irish-owned Costa del Sol specialists',
  'Golf courses, hotels, tee times & transfers',
  contactLine
] as const

function page(
  partial: Omit<GeContentPageData, 'highlights' | 'formTitle' | 'formLead' | 'interestPreset' | 'enquiryType'> & {
    readonly highlights?: readonly string[]
    readonly formTitle?: string
    readonly formLead?: string
    readonly interestPreset?: string
  }
): GeContentPageData {
  const {
    highlights,
    formTitle,
    formLead,
    interestPreset,
    ...rest
  } = partial
  return {
    ...rest,
    highlights: highlights ?? sharedHighlights,
    formTitle: formTitle ?? 'Plan my Costa del Sol golf trip',
    formLead:
      formLead ??
      'Share dates, group size, preferred area, and departure airport — we will come back with a clear next step.',
    interestPreset: interestPreset ?? rest.title,
    enquiryType: 'booking'
  }
}

/** New SEO landing pages — unique intent, no doorway thin copies. */
export const seoLandingPages: Record<string, GeContentPageData> = {
  '/golf-holidays': page({
    metaTitle: 'Costa del Sol Golf Holidays from Ireland | GolfSol Ireland',
    eyebrow: 'Golf holidays',
    title: 'Costa del Sol golf holidays from Ireland',
    subtitle:
      'Handpicked courses, hotels, tee times and Málaga airport transfers — planned for Irish golfers, societies, four-balls and groups.',
    heroImage: imgFairway,
    heroAlt: 'Costa del Sol golf fairway for Irish golf holiday travellers.',
    sections: [
      {
        title: 'Built for Irish golf travellers',
        body: 'Golf Sol Ireland focuses on Costa del Sol golf holidays for customers travelling from Ireland. We coordinate the pieces that usually get scattered across different inboxes: course shortlists, tee times, accommodation areas, and golf-bag-friendly transfers from Málaga Airport (AGP).'
      },
      {
        title: 'Who these holidays suit',
        body: 'Societies, four-balls, groups of friends, corporate groups, couples and small parties all use the same core building blocks — with logistics sized to your group. Tell us your dates and how many rounds you want; we shape the corridor around that.',
        bullets: [
          'Societies and golf clubs organising a group trip',
          'Four-balls and friends wanting a clean week of golf',
          'Corporate groups needing clearer logistics',
          'Couples and smaller parties combining golf and stay'
        ]
      },
      {
        title: 'What we typically coordinate',
        body: 'A Costa del Sol golf holiday usually combines rounds, stay, and airport transfers. We help you choose the right area first — then match courses and hotels so driving time stays sensible.',
        bullets: [
          'Course shortlists across the Sol corridor',
          'Tee-time direction (including twilight where suitable)',
          'Hotels and accommodation areas near your rounds',
          'Málaga Airport meet-and-greet transfers'
        ]
      },
      {
        title: 'Explore destinations',
        body: 'Start with the Costa del Sol hub, then open the area that matches your group style.',
        bullets: [
          'Costa del Sol overview — /golf-holidays/costa-del-sol',
          'Málaga — /golf-holidays/malaga',
          'Marbella — /golf-holidays/marbella',
          'Mijas — /golf-holidays/mijas',
          'Fuengirola — /golf-holidays/fuengirola',
          'Torremolinos — /golf-holidays/torremolinos',
          'Benalmádena — /golf-holidays/benalmadena',
          'Estepona — /golf-holidays/estepona'
        ]
      },
      {
        title: 'Travelling from Ireland',
        body: 'Most Irish groups arrive into Málaga Airport. We have planning pages for Ireland overall and for common departure airports.',
        bullets: [
          'From Ireland — /golf-holidays-spain-from-ireland',
          'From Dublin — /golf-holidays-spain-from-dublin',
          'From Cork — /golf-holidays-spain-from-cork',
          'From Shannon — /golf-holidays-spain-from-shannon',
          'From Belfast — /golf-holidays-spain-from-belfast'
        ]
      },
      {
        title: 'Popular questions',
        body: 'How many nights should we stay? How many rounds? Where should a society base itself? Start with our guides and FAQ, then send an enquiry with your dates.',
        bullets: [
          'Trip guide — /guides/costa-del-sol-golf-trip-guide',
          'Best time of year — /guides/best-time-golf-costa-del-sol',
          'Society planning — /guides/how-to-organise-golf-society-trip-spain',
          'FAQ — /faq'
        ]
      }
    ]
  }),

  '/golf-holidays/costa-del-sol': page({
    metaTitle: 'Costa del Sol Golf Holidays | GolfSol Ireland',
    eyebrow: 'Destination',
    title: 'Costa del Sol golf holidays',
    subtitle:
      'The main corridor for Irish golf trips to Spain — Málaga Airport arrivals, a dense course network, and bases from Torremolinos to Estepona.',
    heroImage: imgFairway,
    heroAlt: 'Costa del Sol golf holidays — coastal fairway scenery for Irish groups.',
    sections: [
      {
        title: 'Why Irish golfers choose the Costa del Sol',
        body: 'The Costa del Sol combines a high concentration of courses with straightforward airport access via Málaga (AGP). For Irish groups, that means fewer logistics compromises: you can base near your rounds, keep transfer times practical, and still reach restaurants and resort facilities.'
      },
      {
        title: 'How the corridor fits together',
        body: 'Think of the Sol as a chain of golf bases linked by the coastal road network. Eastern bases sit closer to the airport; western bases sit deeper into classic resort golf country. We help you pick a base that matches your group’s pace — not just a famous name.',
        bullets: [
          'Closer to AGP: Torremolinos, Benalmádena, Fuengirola, Mijas corridor',
          'Central resort belt: Marbella and surrounding golf valleys',
          'Further west: Estepona and approaches toward Sotogrande'
        ]
      },
      {
        title: 'Suggested trip structures',
        body: 'Trip length depends on rounds, rest days, and travel days. These are planning patterns — not fixed packages with published prices.',
        bullets: [
          '3 nights: arrival transfer, 2–3 rounds, compact base near courses',
          '4 nights: room for a rest afternoon or twilight option',
          '5–7 nights: society-friendly pace with mixed courses and one lighter day'
        ]
      },
      {
        title: 'Transfers and golf bags',
        body: 'Most groups fly into Málaga Airport. Golf Sol Ireland can arrange golf-bag-friendly private transfers to your hotel, then support course runs where needed. Bring club travel cases as advised by your airline; we focus on ground logistics once you land.',
        bullets: ['Airport transfers — /airport-transfers', 'Transport desk — /services/transport']
      },
      {
        title: 'Next steps',
        body: 'Browse area pages for Marbella, Mijas, Málaga and nearby towns, or jump straight to an enquiry with dates and group size.',
        bullets: [
          'Marbella — /golf-holidays/marbella',
          'Mijas — /golf-holidays/mijas',
          'Courses hub — /golf-courses',
          'Enquiry — /contact'
        ]
      }
    ]
  }),

  '/golf-holidays/malaga': page({
    metaTitle: 'Málaga Golf Holidays from Ireland | GolfSol Ireland',
    eyebrow: 'Málaga',
    title: 'Málaga golf holidays',
    subtitle:
      'Arrive at AGP and base near the eastern Costa del Sol — practical for shorter trips and groups who want airport convenience with strong course access.',
    heroImage: imgTransfer,
    heroAlt: 'Málaga airport and Costa del Sol transfer planning for golf holidays.',
    sections: [
      {
        title: 'Why base near Málaga',
        body: 'Málaga is the gateway for almost every Irish Costa del Sol golf trip. Basing closer to the airport can shorten arrival and departure days — useful for long weekends, first-time organisers, and groups who prefer less road time after a flight.'
      },
      {
        title: 'Golf and stay pattern',
        body: 'Many groups stay a short transfer from AGP and play courses along the eastern and central Sol corridor. Exact course choice depends on dates, handicap mix, and how many rounds you want — we shortlist rather than push a fixed menu.',
        bullets: [
          'Good for 3–5 night trips with efficient transfers',
          'Pairs well with Fuengirola, Torremolinos and Benalmádena stays',
          'Course shortlist — /golf-courses'
        ]
      },
      {
        title: 'Example 3-night shape',
        body: 'Day 1: land AGP, transfer to hotel, optional twilight if timings work. Day 2: full round. Day 3: second round or lighter activity. Day 4: transfer to AGP. Exact tee times depend on season and availability.'
      },
      {
        title: 'Example 5-night shape',
        body: 'Space for three rounds with a rest afternoon, dinner plans, and less rushing between flights and first tee. Societies often prefer this pace.'
      },
      {
        title: 'Plan from Ireland',
        body: 'See departure pages for Dublin, Cork, Shannon and Belfast, then send dates and headcount.',
        bullets: [
          'From Ireland — /golf-holidays-spain-from-ireland',
          'Transfers — /transfers/malaga-airport-golf-transfers',
          'Enquire — /contact'
        ]
      }
    ]
  }),

  '/golf-holidays/marbella': page({
    metaTitle: 'Marbella Golf Holidays from Ireland | GolfSol Ireland',
    eyebrow: 'Marbella',
    title: 'Marbella golf holidays',
    subtitle:
      'A classic Costa del Sol golf base for Irish societies and four-balls — resort energy, nearby golf valleys, and transfers from Málaga Airport.',
    heroImage: imgFairway,
    heroAlt: 'Marbella golf holiday planning for Irish golfers on the Costa del Sol.',
    sections: [
      {
        title: 'Why golfers choose Marbella',
        body: 'Marbella sits in the heart of the Costa del Sol resort belt. Irish groups often choose it when they want a recognised base with strong dining options and access to multiple course clusters without relocating hotels mid-week.'
      },
      {
        title: 'Courses and valleys nearby',
        body: 'Marbella works as a hub for rounds in surrounding golf valleys. We shortlist courses based on your dates, group ability mix, and how much daily driving you will tolerate — see our Marbella golf valley page for corridor context.',
        bullets: ['Marbella Golf Valley — /golf-courses/marbella-golf-valley', 'All courses — /golf-courses']
      },
      {
        title: 'Society and four-ball fit',
        body: 'Societies like Marbella for evening atmosphere after golf. Four-balls often like the same base with a tighter round count. Tell us whether dinners and nightlife matter as much as pure golf logistics.'
      },
      {
        title: 'Suggested itineraries',
        body: '3 nights: two rounds and one flexible slot. 4 nights: three rounds with one lighter afternoon. 5 nights: three to four rounds with a recovery day — especially useful for larger societies.',
        bullets: [
          'Society packages — /golf-packages/golf-society-packages',
          'Trip guide — /guides/costa-del-sol-golf-trip-guide'
        ]
      },
      {
        title: 'Airport transfers',
        body: 'Málaga Airport to Marbella is a standard Costa del Sol transfer route. Golf-bag-friendly vehicles matter when the group travels with full sets.',
        bullets: ['AGP transfers — /transfers/malaga-airport-golf-transfers', 'Enquire — /contact']
      }
    ]
  }),

  '/golf-holidays/mijas': page({
    metaTitle: 'Mijas Golf Holidays | GolfSol Ireland',
    eyebrow: 'Mijas',
    title: 'Mijas golf holidays',
    subtitle:
      'A practical Costa del Sol golf base between Fuengirola and the hills — popular with Irish groups who want course access without living on the busiest strip.',
    heroImage: imgFairway,
    heroAlt: 'Mijas area golf holiday planning on the Costa del Sol.',
    sections: [
      {
        title: 'Why Mijas works for Irish groups',
        body: 'Mijas (and the wider Mijas–Fuengirola golf corridor) suits groups who want solid course density with a calmer residential/resort feel than the busiest seafront strips. It is also a sensible middle ground for transfer time from Málaga Airport.'
      },
      {
        title: 'Courses nearby',
        body: 'Use our Mijas & Fuengirola courses page for corridor context, then ask us to shortlist rounds that match your dates and handicap mix.',
        bullets: ['Mijas & Fuengirola courses — /golf-courses/mijas-fuengirola']
      },
      {
        title: 'Stay and pace',
        body: 'Many groups combine Mijas-area golf with hotels in Fuengirola or nearby resorts. We match stay to rounds so you are not crossing the coast unnecessarily every morning.'
      },
      {
        title: 'Trip shapes',
        body: '3–4 nights suit four-balls. 5–7 nights suit societies who want mixed courses and one softer day. Send preferred dates and we will propose a clean structure.',
        bullets: ['Society planning guide — /guides/how-to-organise-golf-society-trip-spain', 'Enquire — /contact']
      }
    ]
  }),

  '/golf-holidays/estepona': page({
    metaTitle: 'Estepona Golf Holidays | GolfSol Ireland',
    eyebrow: 'Estepona',
    title: 'Estepona golf holidays',
    subtitle:
      'A western Costa del Sol base for Irish golfers who want a slightly quieter town feel with access toward classic western corridor courses.',
    heroImage: imgFairway,
    heroAlt: 'Estepona Costa del Sol golf holiday base for Irish travellers.',
    sections: [
      {
        title: 'Why consider Estepona',
        body: 'Estepona sits further west than Marbella. Groups choose it when they want a calmer base and are happy with a longer transfer from Málaga Airport in exchange for the western corridor’s golf options.'
      },
      {
        title: 'Planning reality check',
        body: 'Longer AGP transfers mean arrival and departure days need honest planning — especially with golf bags and larger societies. We flag timing clearly before you lock hotels.'
      },
      {
        title: 'Who it suits',
        body: 'Four-balls and societies who prefer a quieter evening base, and groups combining western courses with a multi-night stay rather than hotel-hopping.',
        bullets: ['Costa del Sol hub — /golf-holidays/costa-del-sol', 'Sotogrande corridor — /golf-courses/sotogrande']
      },
      {
        title: 'Next step',
        body: 'Share dates, group size, and whether you want to play west of Marbella. We will confirm whether Estepona or a more central base is the cleaner fit.',
        bullets: ['Enquire — /contact']
      }
    ]
  }),

  '/golf-holidays/fuengirola': page({
    metaTitle: 'Fuengirola Golf Holidays | GolfSol Ireland',
    eyebrow: 'Fuengirola',
    title: 'Fuengirola golf holidays',
    subtitle:
      'A practical eastern Costa del Sol base for Irish groups — strong hotel choice, nearby golf corridors, and a manageable transfer from Málaga Airport.',
    heroImage: imgHotel,
    heroAlt: 'Fuengirola hotels and golf holiday stays for Irish groups.',
    sections: [
      {
        title: 'Why Fuengirola',
        body: 'Fuengirola is popular with Irish travellers who want plentiful accommodation options and access to the Mijas–Fuengirola golf corridor without sitting on the longest western transfer.'
      },
      {
        title: 'Hotels and golf pairing',
        body: 'We match hotel areas to your rounds. See Fuengirola hotels for stay context, then ask us to align tee times and transfers.',
        bullets: [
          'Fuengirola hotels — /accommodation/fuengirola-hotels',
          'Mijas & Fuengirola courses — /golf-courses/mijas-fuengirola'
        ]
      },
      {
        title: 'Society notes',
        body: 'Larger groups often like Fuengirola for room availability and evening options. We still plan course order carefully so mornings stay calm.',
        bullets: ['Society packages — /golf-packages/golf-society-packages', 'Enquire — /contact']
      }
    ]
  }),

  '/golf-holidays/benalmadena': page({
    metaTitle: 'Benalmádena Golf Holidays | GolfSol Ireland',
    eyebrow: 'Benalmádena',
    title: 'Benalmádena golf holidays',
    subtitle:
      'An eastern Costa del Sol option close to Málaga Airport — useful for shorter Irish golf breaks and groups who value transfer efficiency.',
    heroImage: imgHotel,
    heroAlt: 'Benalmádena stay options for Costa del Sol golf holidays.',
    sections: [
      {
        title: 'Why Benalmádena',
        body: 'Benalmádena sits close to the airport end of the coast. That can make arrival and departure days easier — especially for 3–4 night trips where every hour matters.'
      },
      {
        title: 'Golf planning',
        body: 'Rounds are typically arranged along the eastern and central corridor. We shortlist based on your dates rather than assuming one fixed course list.',
        bullets: ['Courses hub — /golf-courses', 'Costa del Sol hub — /golf-holidays/costa-del-sol']
      },
      {
        title: 'Best for',
        body: 'Long-weekend four-balls, first-time organisers, and groups who want less road time after landing at AGP.',
        bullets: ['From Ireland — /golf-holidays-spain-from-ireland', 'Enquire — /contact']
      }
    ]
  }),

  '/golf-holidays/torremolinos': page({
    metaTitle: 'Torremolinos Golf Holidays | GolfSol Ireland',
    eyebrow: 'Torremolinos',
    title: 'Torremolinos golf holidays',
    subtitle:
      'Airport-convenient Costa del Sol stays for Irish golf groups who want a straightforward base with access to eastern corridor golf.',
    heroImage: imgHotel,
    heroAlt: 'Torremolinos hotels for Irish Costa del Sol golf travellers.',
    sections: [
      {
        title: 'Why Torremolinos',
        body: 'Torremolinos is among the closest resort bases to Málaga Airport. That convenience helps groups with early/late flights and organisers who want to reduce transfer stress.'
      },
      {
        title: 'Stay context',
        body: 'Hotel choice varies widely. We focus on properties that work for golf groups — luggage space, group breakfasts, and sensible access to your rounds.',
        bullets: ['Torremolinos hotels — /accommodation/torremolinos-hotels', 'Accommodation hub — /accommodation']
      },
      {
        title: 'Pair with golf',
        body: 'Plan rounds in the wider eastern corridor and keep daily transfers honest. Send dates and we will propose a clean course order.',
        bullets: ['Enquire — /contact']
      }
    ]
  }),

  '/golf-holidays-spain-from-ireland': page({
    metaTitle: 'Golf Holidays Spain from Ireland | GolfSol Ireland',
    eyebrow: 'From Ireland',
    title: 'Golf holidays in Spain from Ireland',
    subtitle:
      'Costa del Sol golf trips planned for Irish travellers — from first enquiry to Málaga Airport transfers, courses, hotels and tee times.',
    heroImage: imgGroup,
    heroAlt: 'Irish golfers planning Costa del Sol golf holidays from Ireland.',
    sections: [
      {
        title: 'Ireland to the Costa del Sol',
        body: 'Most Irish golf holidays to this region arrive at Málaga Airport (AGP). Golf Sol Ireland coordinates the ground side: private transfers, course shortlists, accommodation areas, and tee-time planning — so the organiser is not juggling five suppliers alone.'
      },
      {
        title: 'Departure airports we commonly plan around',
        body: 'Flight schedules change by season and airline. We do not publish live timetables here — check current flights for your dates — then use our departure pages for planning context.',
        bullets: [
          'Dublin — /golf-holidays-spain-from-dublin',
          'Cork — /golf-holidays-spain-from-cork',
          'Shannon — /golf-holidays-spain-from-shannon',
          'Belfast — /golf-holidays-spain-from-belfast'
        ]
      },
      {
        title: 'Golf luggage from Ireland',
        body: 'Travelling with clubs usually means airline golf-bag policies and weight limits. Rules vary by carrier and fare. Confirm with your airline before travel; we handle meet-and-greet and golf-bag-friendly vehicles after you land.'
      },
      {
        title: 'How booking works with us',
        body: 'Send dates, headcount, preferred area, and how many rounds you want. We reply with a practical structure and next steps — courses, stay area, and transfers.',
        bullets: ['Booking overview — /booking', 'Enquiry — /contact', contactLine]
      }
    ]
  }),

  '/golf-holidays-spain-from-dublin': page({
    metaTitle: 'Golf Holidays Spain from Dublin | GolfSol Ireland',
    eyebrow: 'From Dublin',
    title: 'Costa del Sol golf holidays from Dublin',
    subtitle:
      'Plan a Málaga-bound golf trip from Dublin with clear transfers, course shortlists, and Irish support before and after you fly.',
    heroImage: imgGroup,
    heroAlt: 'Golf holidays from Dublin to the Costa del Sol with Golf Sol Ireland.',
    sections: [
      {
        title: 'Dublin → Málaga planning',
        body: 'Dublin is a common departure point for Irish societies and four-balls heading to the Costa del Sol. Once you choose dates, we plan the ground itinerary around your arrival into AGP — not the other way around.'
      },
      {
        title: 'What to lock early',
        body: 'Group size, number of rounds, and preferred base (Marbella, Mijas corridor, eastern coast, or further west). Flights and club-bag fees should be confirmed with your airline for those dates.',
        bullets: [
          'Costa del Sol hub — /golf-holidays/costa-del-sol',
          'AGP transfers — /transfers/malaga-airport-golf-transfers'
        ]
      },
      {
        title: 'Society tip',
        body: 'Dublin-origin societies often need one organiser channel for deposits, rooming, and tee-time changes. We keep communication simple in plain English.',
        bullets: ['Society guide — /guides/how-to-organise-golf-society-trip-spain', 'Enquire — /contact']
      }
    ]
  }),

  '/golf-holidays-spain-from-cork': page({
    metaTitle: 'Golf Holidays Spain from Cork | GolfSol Ireland',
    eyebrow: 'From Cork',
    title: 'Costa del Sol golf holidays from Cork',
    subtitle:
      'Southern Irish groups heading to Málaga — we coordinate courses, hotels and golf-bag-friendly transfers once your flights are set.',
    heroImage: imgGroup,
    heroAlt: 'Golf holidays from Cork to Málaga and the Costa del Sol.',
    sections: [
      {
        title: 'Cork groups on the Sol',
        body: 'Cork departures work well for southern clubs and friend groups. Availability and routing change by season — confirm flights for your dates, then let us build the Costa del Sol side.'
      },
      {
        title: 'Ground logistics',
        body: 'After AGP arrival we can arrange private transfers and a course/hotel plan that fits your round count. Eastern and central bases often keep transfer times comfortable for shorter trips.',
        bullets: ['Málaga area — /golf-holidays/malaga', 'Fuengirola — /golf-holidays/fuengirola', 'Enquire — /contact']
      }
    ]
  }),

  '/golf-holidays-spain-from-shannon': page({
    metaTitle: 'Golf Holidays Spain from Shannon | GolfSol Ireland',
    eyebrow: 'From Shannon',
    title: 'Costa del Sol golf holidays from Shannon',
    subtitle:
      'West-of-Ireland golf groups travelling to Málaga — practical trip structures with Irish-led planning and Costa del Sol transfers.',
    heroImage: imgGroup,
    heroAlt: 'Golf holidays from Shannon Airport to the Costa del Sol.',
    sections: [
      {
        title: 'Shannon → Costa del Sol',
        body: 'Shannon departures suit west-of-Ireland societies and groups who want the admin handled properly. Check current flight options for your dates; we focus on what happens after you land in Málaga.'
      },
      {
        title: 'Recommended planning order',
        body: '1) Agree dates and headcount. 2) Confirm flights and golf-bag policies. 3) Choose a Sol base. 4) Shortlist rounds and transfers with us.',
        bullets: ['From Ireland hub — /golf-holidays-spain-from-ireland', 'Enquire — /contact']
      }
    ]
  }),

  '/golf-holidays-spain-from-belfast': page({
    metaTitle: 'Golf Holidays Spain from Belfast | GolfSol Ireland',
    eyebrow: 'From Belfast',
    title: 'Costa del Sol golf holidays from Belfast',
    subtitle:
      'Plan a Spain golf trip from Belfast with Costa del Sol courses, hotels and Málaga Airport transfers coordinated in one place.',
    heroImage: imgGroup,
    heroAlt: 'Golf holidays from Belfast to the Costa del Sol for Irish golfers.',
    sections: [
      {
        title: 'Belfast travellers',
        body: 'Groups departing from Belfast still land into the same Costa del Sol planning problem: courses, stay area, and AGP transfers. We coordinate that ground story while you confirm flights for your dates.'
      },
      {
        title: 'What we need from you',
        body: 'Travel dates, group size, rough round count, and whether you prefer a quieter base or a busier resort town. We come back with a clear structure.',
        bullets: ['Costa del Sol — /golf-holidays/costa-del-sol', 'Society packages — /golf-packages/golf-society-packages', 'Enquire — /contact']
      }
    ]
  }),

  '/golf-packages/3-night-golf-breaks': page({
    metaTitle: '3-Night Golf Breaks Costa del Sol | GolfSol Ireland',
    eyebrow: 'Packages',
    title: '3-night Costa del Sol golf breaks',
    subtitle:
      'Short, efficient golf trips for Irish four-balls and small groups — built around arrival transfers, a compact base, and 2–3 rounds.',
    heroImage: imgFleet,
    heroAlt: '3-night Costa del Sol golf break planning for Irish travellers.',
    sections: [
      {
        title: 'Who 3 nights suits',
        body: 'Long-weekend groups, four-balls with limited time off, and organisers who want a sharp itinerary without a long society schedule.'
      },
      {
        title: 'Typical shape',
        body: 'Arrive AGP → transfer to hotel → optional twilight → one or two full rounds → return transfer. Exact tee times depend on season and availability — we do not publish fixed prices here.',
        bullets: ['Eastern bases often help with transfer time', 'Confirm airline golf-bag rules before you fly']
      },
      {
        title: 'Related',
        body: 'Compare with 4-night and 5-night structures if you want a less rushed pace.',
        bullets: [
          '4-night breaks — /golf-packages/4-night-golf-breaks',
          '5-night holidays — /golf-packages/5-night-golf-holidays',
          'Enquire — /contact'
        ]
      }
    ]
  }),

  '/golf-packages/4-night-golf-breaks': page({
    metaTitle: '4-Night Golf Breaks Costa del Sol | GolfSol Ireland',
    eyebrow: 'Packages',
    title: '4-night Costa del Sol golf breaks',
    subtitle:
      'A balanced Irish golf break length — room for three rounds or two rounds plus a softer afternoon.',
    heroImage: imgFleet,
    heroAlt: '4-night golf breaks on the Costa del Sol for Irish groups.',
    sections: [
      {
        title: 'Why 4 nights',
        body: 'Four nights often feels more comfortable than a compressed 3-night dash, especially if flights arrive later in the day. You can protect the first evening and still fit meaningful golf.'
      },
      {
        title: 'Planning notes',
        body: 'Choose whether dinners and rest matter as much as maximum rounds. Societies sometimes use 4 nights as a taster before a longer annual trip.',
        bullets: ['Golf holidays hub — /golf-holidays', 'Enquire — /contact']
      }
    ]
  }),

  '/golf-packages/5-night-golf-holidays': page({
    metaTitle: '5-Night Golf Holidays Costa del Sol | GolfSol Ireland',
    eyebrow: 'Packages',
    title: '5-night Costa del Sol golf holidays',
    subtitle:
      'A popular length for Irish societies and friend groups — enough days for mixed courses without living on the first tee.',
    heroImage: imgFleet,
    heroAlt: '5-night Costa del Sol golf holidays for Irish societies.',
    sections: [
      {
        title: 'Society-friendly pace',
        body: 'Five nights typically supports three to four rounds with one lighter day. That pacing reduces fatigue and keeps the trip enjoyable for mixed handicaps.'
      },
      {
        title: 'Build yours',
        body: 'Tell us dates, headcount, and preferred area. We propose courses, stay options, and transfers as one itinerary.',
        bullets: [
          'Society packages — /golf-packages/golf-society-packages',
          '7-night option — /golf-packages/7-night-golf-holidays',
          'Enquire — /contact'
        ]
      }
    ]
  }),

  '/golf-packages/7-night-golf-holidays': page({
    metaTitle: '7-Night Golf Holidays Costa del Sol | GolfSol Ireland',
    eyebrow: 'Packages',
    title: '7-night Costa del Sol golf holidays',
    subtitle:
      'Full-week structures for Irish societies and groups who want multiple courses, a rest day, and calmer logistics.',
    heroImage: imgFleet,
    heroAlt: '7-night golf holidays on the Costa del Sol.',
    sections: [
      {
        title: 'When a full week helps',
        body: 'Larger societies, mixed-ability groups, and travellers who want dinners and downtime without sacrificing golf. A seven-night stay also absorbs flight timing better.'
      },
      {
        title: 'What we coordinate',
        body: 'Course order, hotel area, AGP transfers, and tee-time direction — still bespoke to your dates rather than a one-price brochure package.',
        bullets: ['Bespoke packages — /golf-packages/bespoke-golf-packages', 'Enquire — /contact']
      }
    ]
  }),

  '/golf-packages/golf-society-packages': page({
    metaTitle: 'Golf Society Packages Costa del Sol | GolfSol Ireland',
    eyebrow: 'Societies',
    title: 'Golf society packages — Costa del Sol',
    subtitle:
      'Irish golf society trips with clearer logistics: courses, accommodation areas, tee times, and Málaga Airport transfers.',
    heroImage: imgGroup,
    heroAlt: 'Golf society packages on the Costa del Sol for Irish clubs.',
    sections: [
      {
        title: 'Built for organisers',
        body: 'Society trips fail when too many people own too many moving parts. We give the organiser one planning channel for the Costa del Sol ground story.'
      },
      {
        title: 'What societies usually need',
        body: 'A base that fits the group size, a realistic round count, transfers that handle golf bags, and plain-English updates when tee times shift.',
        bullets: [
          'How to organise a society trip — /guides/how-to-organise-golf-society-trip-spain',
          'Group holidays — /golf-packages/group-golf-holidays',
          'Society service page — /services/society-group-trips'
        ]
      },
      {
        title: 'Start the brief',
        body: 'Send month of travel, headcount, number of rounds, and preferred town. We reply with a workable structure.',
        bullets: ['Enquire — /contact', contactLine]
      }
    ]
  }),

  '/golf-packages/group-golf-holidays': page({
    metaTitle: 'Group Golf Holidays Spain | GolfSol Ireland',
    eyebrow: 'Groups',
    title: 'Group golf holidays on the Costa del Sol',
    subtitle:
      'Four-balls, friends’ trips and larger parties — coordinated courses, stays and transfers for Irish groups.',
    heroImage: imgGroup,
    heroAlt: 'Group golf holidays on the Costa del Sol for Irish travellers.',
    sections: [
      {
        title: 'Groups of every size',
        body: 'From four golfers to larger parties, the planning questions are the same: where to stay, how many rounds, and how to move people and clubs without chaos.'
      },
      {
        title: 'Related options',
        body: 'Societies may prefer the dedicated society page; smaller groups may prefer 3–5 night breaks.',
        bullets: [
          'Society packages — /golf-packages/golf-society-packages',
          '3-night breaks — /golf-packages/3-night-golf-breaks',
          'Enquire — /contact'
        ]
      }
    ]
  }),

  '/golf-packages/bespoke-golf-packages': page({
    metaTitle: 'Bespoke Golf Packages Costa del Sol | GolfSol Ireland',
    eyebrow: 'Bespoke',
    title: 'Bespoke Costa del Sol golf packages',
    subtitle:
      'No fixed brochure price list — we build course, hotel and transfer combinations around your dates and group.',
    heroImage: imgFleet,
    heroAlt: 'Bespoke golf package planning for Costa del Sol trips.',
    sections: [
      {
        title: 'Why bespoke',
        body: 'Season, group size, handicap mix and flight timings change what “good” looks like. We design around your constraints instead of forcing a generic package template.'
      },
      {
        title: 'What you can include',
        body: 'Multi-course itineraries, twilight options where suitable, hotel matching, and AGP transfers — confirmed as availability allows.',
        bullets: ['Packages overview — /golf-packages', 'Tailored itinerary — /tailored-itinerary', 'Enquire — /contact']
      }
    ]
  }),

  '/guides/best-golf-courses-costa-del-sol': page({
    metaTitle: 'Best Golf Courses Costa del Sol | GolfSol Ireland',
    eyebrow: 'Guide',
    title: 'Best golf courses in the Costa del Sol',
    subtitle:
      'A practical shortlist framework for Irish golfers — how we choose courses by area, ability mix and trip length (not a paid ranking).',
    heroImage: imgFairway,
    heroAlt: 'Guide to choosing golf courses on the Costa del Sol.',
    formTitle: 'Get a course shortlist',
    sections: [
      {
        title: 'How to use this guide',
        body: '“Best” depends on handicap range, preferred scenery, buggy needs, and how far you will travel from the hotel each morning. We do not invent rankings or claim exclusive partnerships here.'
      },
      {
        title: 'Start by corridor',
        body: 'Use our course hubs, then ask us to shortlist for your dates.',
        bullets: [
          'All courses — /golf-courses',
          'Marbella Golf Valley — /golf-courses/marbella-golf-valley',
          'Mijas & Fuengirola — /golf-courses/mijas-fuengirola',
          'Sotogrande corridor — /golf-courses/sotogrande'
        ]
      },
      {
        title: 'Society tip',
        body: 'Mixed-ability societies often need a blend of more forgiving and more demanding days. Tell us the spread of handicaps when you enquire.'
      }
    ]
  }),

  '/guides/best-time-golf-costa-del-sol': page({
    metaTitle: 'Best Time for Golf Costa del Sol | GolfSol Ireland',
    eyebrow: 'Guide',
    title: 'Best time of year for golf in the Costa del Sol',
    subtitle:
      'Seasonal planning notes for Irish golfers — weather patterns, crowding tendencies, and how trip length interacts with the calendar.',
    heroImage: imgFairway,
    heroAlt: 'Best time of year to play golf on the Costa del Sol.',
    sections: [
      {
        title: 'General pattern',
        body: 'Spring and autumn are popular with many Irish groups for comfortable playing temperatures. Summer can be hotter for midday rounds; winter can still play well but daylight and occasional weather interruptions matter. Always check forecasts closer to travel.'
      },
      {
        title: 'What changes by season',
        body: 'Tee-time demand, hotel availability, and flight options all move through the year. We plan around your chosen dates rather than promising a single “perfect month” for every group.'
      },
      {
        title: 'Practical advice',
        body: 'If your group dislikes heat, avoid peak midday summer tee times. If you need maximum daylight for societies, shoulder seasons often feel easier. Send preferred months and we will advise.',
        bullets: ['Trip guide — /guides/costa-del-sol-golf-trip-guide', 'Enquire — /contact']
      }
    ]
  }),

  '/guides/costa-del-sol-golf-trip-guide': page({
    metaTitle: 'Costa del Sol Golf Trip Guide | GolfSol Ireland',
    eyebrow: 'Guide',
    title: 'Complete Costa del Sol golf holiday guide',
    subtitle:
      'End-to-end planning for Irish golfers: bases, rounds, transfers, luggage, and how to brief us for a clean quote.',
    heroImage: imgFairway,
    heroAlt: 'Complete guide to planning a Costa del Sol golf holiday from Ireland.',
    sections: [
      {
        title: 'Step 1 — Choose your base',
        body: 'Eastern bases favour airport convenience. Central bases favour resort golf access. Western bases favour quieter town feels with longer AGP transfers.',
        bullets: ['Destinations — /golf-holidays/costa-del-sol']
      },
      {
        title: 'Step 2 — Decide rounds vs rest',
        body: 'Three rounds in three days feels different to three rounds in five nights. Be honest about fitness and handicap mix.'
      },
      {
        title: 'Step 3 — Transfers and clubs',
        body: 'Plan AGP meet-and-greet if you want private vehicles for golf bags. Confirm airline club policies separately.',
        bullets: ['AGP transfers — /transfers/malaga-airport-golf-transfers']
      },
      {
        title: 'Step 4 — Enquire with the right details',
        body: 'Dates, headcount, departure airport, preferred area, rounds wanted, and any must-have hotel needs.',
        bullets: ['Enquiry — /contact', 'FAQ — /guides/costa-del-sol-golf-faq']
      }
    ]
  }),

  '/guides/how-to-organise-golf-society-trip-spain': page({
    metaTitle: 'How to Organise a Golf Society Trip to Spain | GolfSol Ireland',
    eyebrow: 'Guide',
    title: 'How to organise a golf society trip to Spain',
    subtitle:
      'A practical checklist for Irish society captains — Costa del Sol focus, clearer logistics, fewer WhatsApp threads.',
    heroImage: imgGroup,
    heroAlt: 'Organising a golf society trip to the Costa del Sol from Ireland.',
    sections: [
      {
        title: 'Captain’s checklist',
        body: 'Lock provisional dates, survey headcount, agree rough budget bands internally, then brief one specialist for the Sol ground plan. Do not book random hotels before you know course geography.'
      },
      {
        title: 'Information to collect early',
        body: 'Number of golfers, non-golfers, rooming preferences, handicap spread, and whether dinners are part of the brief.',
        bullets: [
          'Society packages — /golf-packages/golf-society-packages',
          'Irish group planning — /irish-group-planning'
        ]
      },
      {
        title: 'Common pitfalls',
        body: 'Over-ambitious round counts, underestimating transfer time with bags, and splitting bookings across too many suppliers. We help you avoid those.',
        bullets: ['Enquire — /contact']
      }
    ]
  }),

  '/guides/costa-del-sol-golf-faq': page({
    metaTitle: 'Costa del Sol Golf Holiday FAQ | GolfSol Ireland',
    eyebrow: 'FAQ',
    title: 'Costa del Sol golf holiday FAQ',
    subtitle:
      'Straight answers for Irish golfers researching Spain and the Costa del Sol — with links to deeper pages.',
    heroImage: imgFairway,
    heroAlt: 'FAQ for Costa del Sol golf holidays from Ireland.',
    sections: [
      {
        title: 'What is the best area for a golf holiday in the Costa del Sol?',
        body: 'It depends on transfer tolerance and trip style. Eastern bases favour airport convenience; Marbella suits resort-centred weeks; Estepona suits quieter western stays. See /golf-holidays/costa-del-sol.'
      },
      {
        title: 'How do Málaga Airport golf transfers work?',
        body: 'Private vehicles meet you at AGP and run to your hotel with golf bags in mind. Details depend on flight times and group size — start at /transfers/malaga-airport-golf-transfers.'
      },
      {
        title: 'Can golf clubs travel on flights from Ireland?',
        body: 'Usually yes, subject to each airline’s golf-bag rules and fees. Confirm with your carrier for your tickets; we handle ground logistics after landing.'
      },
      {
        title: 'How many nights should we stay?',
        body: '3 nights suits short breaks; 5–7 nights suits most societies. See /golf-packages/3-night-golf-breaks and /golf-packages/5-night-golf-holidays.'
      },
      {
        title: 'More questions',
        body: 'Browse the main FAQ or send a direct enquiry.',
        bullets: ['FAQ — /faq', 'Contact — /contact', contactLine]
      }
    ]
  }),

  '/transfers/malaga-airport-golf-transfers': page({
    metaTitle: 'Málaga Airport Golf Transfers | GolfSol Ireland',
    eyebrow: 'Transfers',
    title: 'Málaga Airport golf transfers',
    subtitle:
      'Golf-bag-friendly private transfers from Málaga Airport (AGP) to Costa del Sol hotels — planned for Irish golf groups.',
    heroImage: imgTransfer,
    heroAlt: 'Málaga Airport golf transfers with golf-bag-friendly vehicles.',
    formTitle: 'Request airport transfer help',
    sections: [
      {
        title: 'Built around golf luggage',
        body: 'Standard taxis are not always ideal when multiple sets of clubs arrive together. We arrange private vehicles matched to passengers and bags.'
      },
      {
        title: 'Typical routes',
        body: 'AGP to Torremolinos, Benalmádena, Fuengirola, Mijas corridor, Marbella, Estepona and other Sol bases — timing depends on traffic and exact hotel location.',
        bullets: ['Transport desk — /services/transport', 'Airport transfers article — /airport-transfers']
      },
      {
        title: 'How to brief us',
        body: 'Flight timings (when known), hotel area, headcount, and number of golf bags. We confirm the cleanest vehicle plan.',
        bullets: ['Enquire — /contact', contactLine]
      }
    ]
  }),

  '/transfers/golf-group-transfers': page({
    metaTitle: 'Golf Group Transfers Costa del Sol | GolfSol Ireland',
    eyebrow: 'Transfers',
    title: 'Golf group transfers on the Costa del Sol',
    subtitle:
      'Move societies and four-balls between hotel and course with vehicles that respect clubs, trolleys and group timing.',
    heroImage: imgTransfer,
    heroAlt: 'Golf group transfers on the Costa del Sol for Irish societies.',
    sections: [
      {
        title: 'Hotel ↔ course runs',
        body: 'Airport day is only half the logistics. Daily course transfers keep larger groups on schedule when people and bags need to move together.'
      },
      {
        title: 'When groups need this',
        body: 'Societies, split tee times, and hotels that are not walkable to the first tee. We plan vehicle size around your headcount.',
        bullets: [
          'AGP transfers — /transfers/malaga-airport-golf-transfers',
          'Society packages — /golf-packages/golf-society-packages',
          'Enquire — /contact'
        ]
      }
    ]
  })
}

export { SEO_LANDING_PAGE_PATHS } from './seo-landing-page-paths'
