import type { GeContentPageData } from '../pages/golf-experience/data/content-pages'
import { SEO_CONTACT } from '../lib/seo/seo-contact'

const fairway = '/images/ge-premium-golf-fairway-coastal.webp'
const agp = '/images/transfers/malaga-airport-golf-transfers.webp'
const marbella = '/images/destinations/marbella-golf-holiday-costa-del-sol.webp'
const trip = (file: string) => `/images/customer-trips/${file}.jpg`

const contactLine = `Irish support ${SEO_CONTACT.irishPhoneDisplay} · Spanish line ${SEO_CONTACT.spanishPhoneDisplay} · ${SEO_CONTACT.email}`

const sharedHighlights = [
  'Private vehicles sized for golfers and golf bags',
  'Arrival and return runs along the Costa del Sol',
  contactLine
] as const

const routeLinks = [
  ['Transfer time guide', '/guides/malaga-airport-golf-transfer-times'],
  ['Torremolinos', '/transfers/malaga-airport-to-torremolinos'],
  ['Benalmádena', '/transfers/malaga-airport-to-benalmadena'],
  ['Fuengirola', '/transfers/malaga-airport-to-fuengirola'],
  ['Mijas', '/transfers/malaga-airport-to-mijas'],
  ['Marbella', '/transfers/malaga-airport-to-marbella'],
  ['Estepona', '/transfers/malaga-airport-to-estepona'],
  ['Sotogrande', '/transfers/malaga-airport-to-sotogrande'],
  ['Return to Málaga Airport', '/transfers/return-to-malaga-airport'],
  ['Meet and greet', '/transfers/malaga-airport-meet-and-greet'],
  ['All AGP golf transfers', '/transfers/malaga-airport-golf-transfers']
] as const

function relatedRoutes(except: string): readonly string[] {
  return routeLinks.filter(([, href]) => href !== except).map(([label, href]) => `${label} — ${href}`)
}

function page(
  partial: Omit<GeContentPageData, 'highlights' | 'formTitle' | 'formLead' | 'interestPreset' | 'enquiryType'> & {
    readonly highlights?: readonly string[]
    readonly formTitle?: string
    readonly formLead?: string
    readonly interestPreset?: string
  }
): GeContentPageData {
  const { highlights, formTitle, formLead, interestPreset, ...rest } = partial
  return {
    ...rest,
    highlights: highlights ?? sharedHighlights,
    formTitle: formTitle ?? 'Price this transfer',
    formLead:
      formLead ??
      'Send the flight, hotel area, number of people, and how many golf bags. We will come back with a vehicle plan.',
    interestPreset: interestPreset ?? rest.title,
    enquiryType: 'booking'
  }
}

/** Distinct search intents for golf holidays and Málaga Airport transfers. Not doorway swaps. */
export const seoSearchClusterPages: Record<string, GeContentPageData> = {
  '/guides/malaga-airport-golf-transfer-times': page({
    metaTitle: 'Málaga Airport to Costa del Sol Golf Transfer Times | GolfSol Ireland',
    eyebrow: 'Transfer times',
    title: 'Málaga Airport golf transfer times along the Costa del Sol',
    subtitle:
      'Typical private-transfer times from Málaga Airport (AGP) to Torremolinos, Benalmádena, Fuengirola, Mijas, Marbella, Estepona and Sotogrande, with golf bags on board.',
    heroImage: agp,
    heroAlt: 'Private golf transfer vehicle prepared for a Málaga Airport pickup.',
    formTitle: 'Get a transfer price',
    sections: [
      {
        title: 'How to read these times',
        body: 'These are typical private-car ranges for a golf group leaving Málaga Airport, not a promise for a single afternoon. The AP-7, a hotel up a hill, and a late Friday arrival all change the clock. We price the real address and flight, then tell you the pickup plan.'
      },
      {
        title: 'East of the airport is the short run',
        body: 'Torremolinos is usually the shortest of the main golf bases, often about 15 to 30 minutes. Benalmádena sits just beyond it, commonly about 20 to 35 minutes. Fuengirola is often about 25 to 40 minutes. Mijas can match the coast time until the hotel or course is up the hill, when 30 to 50 minutes is a fairer planning range.'
      },
      {
        title: 'West is where the week is won or lost',
        body: 'Marbella and Nueva Andalucía commonly take about 45 to 70 minutes. Estepona is often about 70 to 90 minutes. Sotogrande is the long private run, often about 90 to 120 minutes, and it suits a multi-night base rather than a same-day loop back to the airport.'
      },
      {
        title: 'What golf luggage does to the plan',
        body: 'A four-ball with four travel covers needs a different vehicle from a society of sixteen. The time on the road stays similar. The time at the terminal does not. Meet-and-greet, a name board, and space for clubs matter more than shaving five minutes off the motorway.',
        bullets: [
          'Meet and greet — /transfers/malaga-airport-meet-and-greet',
          'Group course runs — /transfers/golf-group-transfers',
          'Holiday with transfers included — /golf-holidays/with-airport-transfers'
        ]
      },
      {
        title: 'How long is the transfer from Málaga Airport to Marbella with golf clubs?',
        body: 'Plan on about 45 to 70 minutes for most Marbella and Nueva Andalucía hotels, longer if you land into heavy weekend traffic or the hotel is west of San Pedro. Send the flight and the hotel and we will price that exact run.'
      },
      {
        title: 'Should a Sotogrande golf week still use Málaga Airport?',
        body: 'Yes. Most Irish flights land at AGP. The transfer is long, so book it as a private arrival and a private departure, then stay put and play the Sotogrande courses. Do not treat it as a day trip from a Torremolinos hotel.'
      },
      {
        title: 'Open the route that matches your hotel',
        body: 'Each page covers who the run suits, what to send us, and the golf base at the other end.',
        bullets: relatedRoutes('/guides/malaga-airport-golf-transfer-times')
      }
    ]
  }),

  '/transfers/malaga-airport-to-torremolinos': page({
    metaTitle: 'Málaga Airport to Torremolinos Golf Transfer | GolfSol Ireland',
    eyebrow: 'Torremolinos',
    title: 'Málaga Airport to Torremolinos golf transfers',
    subtitle:
      'A short private run from AGP to Torremolinos hotels, with room for golf bags. Useful when the group wants to be on the coast quickly and play further west through the week.',
    heroImage: trip('sol-don-pablo'),
    heroAlt: 'Golfers with travel covers outside the Sol Don Pablo hotel after a Costa del Sol transfer.',
    sections: [
      {
        title: 'The shortest main-base arrival',
        body: 'Torremolinos is the first large resort west of Málaga Airport. Many hotel drops land in about 15 to 30 minutes once you are in the vehicle. That makes it a calm first hour after an Irish flight, especially when people are travelling with hard travel covers.'
      },
      {
        title: 'Who should base here',
        body: 'Groups who want a simple promenade hotel and are happy to drive to Mijas, La Cala or Marbella for the rounds. It is less ideal if every tee time is in Sotogrande or western Estepona. Say where you want to play and we will tell you if Torremolinos is the right pillow.'
      },
      {
        title: 'What we need for the price',
        body: 'Flight number when you have it, hotel name, headcount, and how many golf bags. Non-golfers count as seats. A Sol Don Pablo style drop is a normal job for this run. We also bring the same vehicle logic back to the airport on departure day.',
        bullets: ['Return to AGP — /transfers/return-to-malaga-airport', 'Torremolinos holidays — /golf-holidays/torremolinos']
      },
      {
        title: 'How long is Málaga Airport to Torremolinos?',
        body: 'Often about 15 to 30 minutes in a private vehicle, before you add waiting time in arrivals. A delayed Dublin or Cork flight changes the pickup, not the road time.'
      },
      {
        title: 'Can the van take a full set of golf travel covers?',
        body: 'Yes, when the vehicle is chosen for the bag count. Tell us the number of covers, not only the number of people. Four people with four full-size covers is a different job from four people with hand luggage.'
      },
      {
        title: 'Other airport runs',
        body: 'If the hotel is one town further west, use the matching page so the time estimate stays honest.',
        bullets: relatedRoutes('/transfers/malaga-airport-to-torremolinos')
      }
    ]
  }),

  '/transfers/malaga-airport-to-benalmadena': page({
    metaTitle: 'Málaga Airport to Benalmádena Golf Transfer | GolfSol Ireland',
    eyebrow: 'Benalmádena',
    title: 'Málaga Airport to Benalmádena golf transfers',
    subtitle:
      'Private AGP pickups for Benalmádena hotels and the marina, planned around golf bags and Irish flight times.',
    heroImage: trip('hotel-terrace'),
    heroAlt: 'A sunny Costa del Sol hotel terrace of the kind used as a golf-week base.',
    sections: [
      {
        title: 'Just past Torremolinos, still a short arrival',
        body: 'Benalmádena sits on the next headland. Most private drops are about 20 to 35 minutes from Málaga Airport. The marina and pueblo feel different from Torremolinos, but the airport logic is the same: meet the flight, load the covers, and finish the day at the hotel rather than on a bus with loose clubs.'
      },
      {
        title: 'Golf from this base',
        body: 'The courses are not at the end of the promenade. Mijas, La Cala and the courses toward Fuengirola are the usual morning drives. If the group wants walk-to-the-first-tee golf, look at La Cala or a Marbella valley hotel instead, and we will move the transfer plan with you.'
      },
      {
        title: 'Arrival and the ride home',
        body: 'Send both flight times if you already have the return. A Benalmádena departure is still a short run, so the constraint is airline check-in and bag drop, not a two-hour motorway.',
        bullets: ['Benalmádena holidays — /golf-holidays/benalmadena', 'Meet and greet — /transfers/malaga-airport-meet-and-greet']
      },
      {
        title: 'How long is the transfer from Málaga Airport to Benalmádena?',
        body: 'About 20 to 35 minutes for most hotels, depending on the exact street and traffic leaving the airport.'
      },
      {
        title: 'Do you collect from both terminals?',
        body: 'We meet the flight you send us. Put the flight number on the enquiry so the pickup matches arrivals, including a late inbound from Ireland.'
      },
      {
        title: 'Compare the next town',
        body: 'Fuengirola is the next resort west if you want to be closer to Mijas mornings.',
        bullets: relatedRoutes('/transfers/malaga-airport-to-benalmadena')
      }
    ]
  }),

  '/transfers/malaga-airport-to-fuengirola': page({
    metaTitle: 'Málaga Airport to Fuengirola Golf Transfer | GolfSol Ireland',
    eyebrow: 'Fuengirola',
    title: 'Málaga Airport to Fuengirola golf transfers',
    subtitle:
      'Door-to-door AGP transfers for Fuengirola hotels, sized for Irish golf groups and their travel covers.',
    heroImage: trip('van-to-buggy'),
    heroAlt: 'Golf bags moving between a white group van and a buggy at a Costa del Sol club.',
    sections: [
      {
        title: 'A practical middle base',
        body: 'Fuengirola is often about 25 to 40 minutes from Málaga Airport by private vehicle. It is far enough west to make Mijas and La Cala mornings shorter, and still an easy return to AGP at the end of the week.'
      },
      {
        title: 'Why groups pick this run',
        body: 'The town has a long promenade, a train if someone wants a non-golf day, and hotels that suit mixed groups. The transfer itself is straightforward. The useful decision is whether your courses are in the Mijas corridor or an hour further west in Marbella.'
      },
      {
        title: 'Bags, buggies, and the days after arrival',
        body: 'Airport day is one journey. If the hotel is not on a course, the same desk can plan hotel-to-course runs so a society is not splitting into several taxis every morning.',
        bullets: ['Fuengirola holidays — /golf-holidays/fuengirola', 'Course transfers — /transfers/golf-group-transfers', 'La Cala holidays — /golf-holidays/la-cala']
      },
      {
        title: 'How long is Málaga Airport to Fuengirola?',
        body: 'Most private transfers take about 25 to 40 minutes. A hotel on the west edge of town is not the same minute-count as one by the castle, so send the property name.'
      },
      {
        title: 'Is Fuengirola close enough to Marbella courses?',
        body: 'It can work for one or two Marbella days. If most rounds are in Nueva Andalucía, a Marbella hotel usually wastes less of the morning. Tell us the course list and we will say which base fits.'
      },
      {
        title: 'Nearby airport pages',
        body: 'Use these when the hotel pin sits in the next town.',
        bullets: relatedRoutes('/transfers/malaga-airport-to-fuengirola')
      }
    ]
  }),

  '/transfers/malaga-airport-to-mijas': page({
    metaTitle: 'Málaga Airport to Mijas Golf Transfer | GolfSol Ireland',
    eyebrow: 'Mijas',
    title: 'Málaga Airport to Mijas golf transfers',
    subtitle:
      'Private transfers from AGP to Mijas and Mijas Costa hotels and courses, including the hill roads a coast-only estimate leaves out.',
    heroImage: trip('evening-range'),
    heroAlt: 'An evening driving range on the Costa del Sol with the course beyond the bays.',
    sections: [
      {
        title: 'The hill is the detail that matters',
        body: 'Mijas Costa along the sea can be a similar clock to Fuengirola, often about 30 to 45 minutes from the airport. Mijas pueblo and hotels higher up add road time. A quote that only says “Mijas” without the property is a guess. Send the hotel or course name.'
      },
      {
        title: 'Playing and staying in the same corridor',
        body: 'This is the right run when the week is built around the Mijas and La Cala courses and you do not want a Marbella commute every dawn. It is the wrong run if the group has already booked a beach hotel in Torremolinos and only fancies one Mijas day.'
      },
      {
        title: 'Vehicles for covers on a climb',
        body: 'Travel covers take boot space. On a hill arrival that matters as much as the motorway. We match the vehicle to people plus bags, then you are not rearranging clubs in a hotel car park in the dark.',
        bullets: ['Mijas holidays — /golf-holidays/mijas', 'Mijas and Fuengirola courses — /golf-courses/mijas-fuengirola']
      },
      {
        title: 'How long is the airport transfer to Mijas?',
        body: 'Plan about 30 to 50 minutes for most golf stays. The top of that range is for hillside addresses, not the airport road itself.'
      },
      {
        title: 'Can you drop at the course and then the hotel?',
        body: 'On arrival day that is sometimes right and sometimes a wasted hour. If tee times are the next morning, go to the hotel. If you have an afternoon round on landing day, say so and we will sequence the stops.'
      },
      {
        title: 'The rest of the coast',
        body: 'Marbella is the next serious step west if the shortlist moves.',
        bullets: relatedRoutes('/transfers/malaga-airport-to-mijas')
      }
    ]
  }),

  '/transfers/malaga-airport-to-marbella': page({
    metaTitle: 'Málaga Airport to Marbella Golf Transfer | GolfSol Ireland',
    eyebrow: 'Marbella',
    title: 'Málaga Airport to Marbella golf transfers',
    subtitle:
      'Private AGP transfers to Marbella, Puerto Banús and Nueva Andalucía, with space for golf bags and a realistic eye on weekend traffic.',
    heroImage: trip('van-doors-open'),
    heroAlt: 'A white group van with the side and rear doors open, ready for golfers and travel covers.',
    sections: [
      {
        title: 'The run most Irish golf weeks actually book',
        body: 'Marbella is the usual west-coast base. A private transfer from Málaga Airport is often about 45 to 70 minutes. Puerto Banús, San Pedro and hotels in Nueva Andalucía sit in that same band. Golden-hour Friday traffic can push the upper end. We would rather tell you that before you promise the group a 40-minute fairy tale.'
      },
      {
        title: 'Golf valley, not only the beach',
        body: 'If the rounds are in the golf valley, the hotel should be too. An old-town Marbella pin looks close on a map and still adds a morning crawl. Pair this transfer with a Nueva Andalucía stay when the courses are the point of the trip.',
        bullets: ['Marbella holidays — /golf-holidays/marbella', 'Nueva Andalucía — /golf-holidays/nueva-andalucia', 'Golf valley courses — /golf-courses/marbella-golf-valley']
      },
      {
        title: 'How a group should brief the arrival',
        body: 'One flight or two, how many travel covers, and whether anyone needs a child seat or extra room for non-golfers. Split arrivals can use two vehicles. Stuffing two flights into one van an hour apart usually does not.',
        bullets: ['Meet and greet — /transfers/malaga-airport-meet-and-greet', 'Holiday including transfers — /golf-holidays/with-airport-transfers']
      },
      {
        title: 'How long is a golf transfer from Málaga Airport to Marbella?',
        body: 'About 45 to 70 minutes for most golf hotels around Marbella and Nueva Andalucía. Send the property. A hotel west of San Pedro is not the same job as one on the east edge of town.'
      },
      {
        title: 'Do you run back to Málaga Airport at the end of the week?',
        body: 'Yes. Departure day needs the flight time and a checkout that leaves room for golf-bag check-in. Use the return page if that is the only leg you still need.'
      },
      {
        title: 'If Marbella is too far east or west',
        body: 'Estepona adds time. Fuengirola saves time. Pick the page that matches the hotel, not the town you fly over.',
        bullets: relatedRoutes('/transfers/malaga-airport-to-marbella')
      }
    ]
  }),

  '/transfers/malaga-airport-to-estepona': page({
    metaTitle: 'Málaga Airport to Estepona Golf Transfer | GolfSol Ireland',
    eyebrow: 'Estepona',
    title: 'Málaga Airport to Estepona golf transfers',
    subtitle:
      'A longer private run from AGP to Estepona for golf groups who want a quieter western base and room for every travel cover.',
    heroImage: trip('sunset-bag-drop'),
    heroAlt: 'Golfers unloading travel bags from a van beside a white clubhouse at sunset.',
    sections: [
      {
        title: 'West, on purpose',
        body: 'Estepona is not a quick hop from Málaga Airport. Most private transfers take about 70 to 90 minutes. That is a fair trade when the group wants a calmer town and courses that sit in this western stretch, and a poor trade when someone booked Estepona only because the hotel photo looked quiet.'
      },
      {
        title: 'When the extra road time is worth it',
        body: 'Five and seven night trips absorb a 90 minute arrival. A two-night break feels the road twice and plays less golf. If you are unsure, start with the Estepona holiday page and the transfer time guide before you pay a deposit on the rooms.'
      },
      {
        title: 'One vehicle, the whole four-ball or society',
        body: 'The value on this route is staying together with the clubs. A line of small cars down the AP-7 splits the group and the luggage. Tell us the bag count and we will keep it to the right number of vans.',
        bullets: ['Estepona holidays — /golf-holidays/estepona', 'Time guide — /guides/malaga-airport-golf-transfer-times']
      },
      {
        title: 'How long is Málaga Airport to Estepona?',
        body: 'About 70 to 90 minutes is the honest planning range for most Estepona hotels. Match day traffic and the exact urbanisation can add time. We confirm against the address you send.'
      },
      {
        title: 'Is Estepona close enough to Sotogrande courses?',
        body: 'It can cover a Sotogrande day. If several rounds are in Sotogrande, stay there and accept the longer airport transfer once, rather than driving the extra distance every morning.'
      },
      {
        title: 'The neighbouring runs',
        body: 'Marbella is shorter. Sotogrande is longer. Both have their own pages.',
        bullets: relatedRoutes('/transfers/malaga-airport-to-estepona')
      }
    ]
  }),

  '/transfers/malaga-airport-to-sotogrande': page({
    metaTitle: 'Málaga Airport to Sotogrande Golf Transfer | GolfSol Ireland',
    eyebrow: 'Sotogrande',
    title: 'Málaga Airport to Sotogrande golf transfers',
    subtitle:
      'The long private transfer from AGP to Sotogrande and La Reserva, for Irish groups basing the week in the west.',
    heroImage: trip('van-at-la-reserva'),
    heroAlt: 'A white group van parked at La Reserva Club in Sotogrande with the passenger door open.',
    sections: [
      {
        title: 'The long arrival, taken once',
        body: 'Sotogrande is the far end of a Costa del Sol golf week that still flies into Málaga. Private transfers often take about 90 to 120 minutes. Do that journey on arrival day and departure day. Do not add it again every time someone fancies a different town.'
      },
      {
        title: 'La Reserva and the western courses',
        body: 'This is the transfer for a Sotogrande base: La Reserva, the local courses, and hotels inside the gates or just outside them. If the itinerary is mostly Marbella valley golf, you are paying for a scenic mistake. We would rather move the hotel plan than pretend the road is short.',
        bullets: ['Sotogrande holidays — /golf-holidays/sotogrande', 'Sotogrande courses — /golf-courses/sotogrande']
      },
      {
        title: 'Bags on a two-hour run',
        body: 'A long transfer with clubs in a too-small car is how covers get crushed and tempers go. The vehicle is chosen for the bag count first. Flight delays from Ireland are planned into the pickup so the driver is not guessing in arrivals.',
        bullets: ['Meet and greet — /transfers/malaga-airport-meet-and-greet', 'Return leg — /transfers/return-to-malaga-airport']
      },
      {
        title: 'How long is Málaga Airport to Sotogrande?',
        body: 'About 90 to 120 minutes for most Sotogrande addresses, including La Reserva. It is the longest of the usual Costa del Sol golf bases.'
      },
      {
        title: 'Is a Sotogrande transfer worth it for a long weekend?',
        body: 'Rarely. Three nights can work if the group accepts that two half-days are spent on the road. Five nights and longer is where the west starts to feel worth the arrival.'
      },
      {
        title: 'Shorter bases if the west is too far',
        body: 'Estepona and Marbella keep you on the same airport and cut the first journey.',
        bullets: relatedRoutes('/transfers/malaga-airport-to-sotogrande')
      }
    ]
  }),

  '/transfers/return-to-malaga-airport': page({
    metaTitle: 'Golf Hotel to Málaga Airport Transfer | GolfSol Ireland',
    eyebrow: 'Departure day',
    title: 'Return transfers to Málaga Airport',
    subtitle:
      'Private departure-day runs from Costa del Sol golf hotels back to AGP, timed for flight check-in and a boot full of travel covers.',
    heroImage: trip('la-reserva-group'),
    heroAlt: 'An Irish golf group with the van and golf bags, the same style of private run used back to Málaga Airport.',
    formTitle: 'Price the airport return',
    sections: [
      {
        title: 'The flight decides the pickup, not the other way round',
        body: 'A return to Málaga Airport fails when the group leaves on “about ten” and the airline wanted the bags earlier. Send the flight time, the hotel checkout, and the bag count. We suggest a pickup that leaves room for check-in. We do not invent a single rule for every airline.'
      },
      {
        title: 'Where you start changes the clock',
        body: 'A Torremolinos checkout is a short final run. A Sotogrande checkout needs a much earlier leave. Use the same town pages as the arrival so the group sees the road time before someone books a late breakfast.'
      },
      {
        title: 'Clubs on the way home',
        body: 'Covers are bulky on departure as well as arrival. The vehicle is the one that fitted them on day one, unless the group size changed. Tell us if anyone is leaving early on a different flight.',
        bullets: ['Arrival transfers — /transfers/malaga-airport-golf-transfers', 'Time guide — /guides/malaga-airport-golf-transfer-times']
      },
      {
        title: 'How early should a golf group leave for Málaga Airport?',
        body: 'It depends on the hotel and the airline. A western base needs the road time plus the check-in window your carrier publishes for golf bags. Send the flight and we will put a pickup time on the plan.'
      },
      {
        title: 'Can you collect from the course on the last morning?',
        body: 'Sometimes, if the last round finishes with enough margin for the airport. If the tee sheet is tight, go back via the hotel and leave the clubs packed the night before. We will say which is safer once we see the times.'
      },
      {
        title: 'Match the hotel town',
        body: 'The return is the same road in reverse. Open the arrival page for your base.',
        bullets: relatedRoutes('/transfers/return-to-malaga-airport')
      }
    ]
  }),

  '/transfers/malaga-airport-meet-and-greet': page({
    metaTitle: 'Málaga Airport Meet and Greet for Golf Groups | GolfSol Ireland',
    eyebrow: 'Meet and greet',
    title: 'Málaga Airport meet and greet for golf groups',
    subtitle:
      'A named pickup in AGP arrivals for Irish golf flights, then a private vehicle that actually fits the travel covers.',
    heroImage: trip('bags-at-the-kerb'),
    heroAlt: 'Three golfers with travel covers and hold luggage beside the group van on a Costa del Sol street.',
    sections: [
      {
        title: 'Arrivals, then the bags, then the road',
        body: 'Meet and greet means someone is there for your flight, not a taxi rank guess after a three-hour delay from Dublin. You get a clear meeting point, the vehicle waits for the group you named, and the covers go in before anyone starts walking to a car park with a trolley.'
      },
      {
        title: 'Late flights are normal on this route',
        body: 'Irish arrivals move. The plan uses the flight number so a delay changes the pickup time. Tell us if two flights are an hour apart. We will either hold one vehicle or send two. Standing in arrivals with sixteen covers and no instructions is the outcome we are avoiding.'
      },
      {
        title: 'Where the greeting ends',
        body: 'The same booking continues to the hotel: Torremolinos through to Sotogrande. Meet and greet is the airport piece. The town pages are the road piece. You can ask for both in one enquiry.',
        bullets: ['All airport transfers — /transfers/malaga-airport-golf-transfers', 'Transport desk — /services/transport']
      },
      {
        title: 'Where do you meet at Málaga Airport?',
        body: 'In arrivals for the flight you send. The enquiry confirmation spells out the meeting point so the group is not hunting a bay. If your airline uses a different door, the flight number is what we follow.'
      },
      {
        title: 'Is meet and greet different from a normal airport transfer?',
        body: 'The road is the same. The difference is a planned greeting for your flight and a vehicle chosen for golf bags, instead of the first car that happens to be free when you walk out.'
      },
      {
        title: 'Then choose the hotel run',
        body: 'Add the town so the price matches the distance.',
        bullets: relatedRoutes('/transfers/malaga-airport-meet-and-greet')
      }
    ]
  }),

  '/golf-holidays/sotogrande': page({
    metaTitle: 'Sotogrande Golf Holidays from Ireland | GolfSol Ireland',
    eyebrow: 'Sotogrande',
    title: 'Sotogrande golf holidays from Ireland',
    subtitle:
      'A western Costa del Sol base for Irish groups: longer Málaga Airport transfer, then courses and hotels around Sotogrande and La Reserva.',
    heroImage: trip('sotogrande'),
    heroAlt: 'The white Sotogrande hotel entrance under a clear sky.',
    formTitle: 'Plan a Sotogrande week',
    formLead: 'Send dates, group size, and how many rounds you want in the west. We will say if Sotogrande beats Estepona or Marbella for that list.',
    highlights: [
      'Western courses without a daily trek from Marbella',
      'One long airport transfer, then you stay put',
      contactLine
    ],
    sections: [
      {
        title: 'Stay in the west if you are playing in the west',
        body: 'Sotogrande is a different holiday from a Fuengirola week with one famous course bolted on. The airport run is about 90 to 120 minutes. After that, the courses and the hotels are neighbours. La Reserva is the sort of gate this trip is built around.'
      },
      {
        title: 'Who it suits',
        body: 'Societies and four-balls with five nights or more, who want a quieter finish to the coast and do not need to be back in Marbella every evening. It suits less well for a Friday-to-Monday where the road eats two sessions.'
      },
      {
        title: 'What we line up',
        body: 'The arrival and departure transfers, a shortlist of courses in the Sotogrande corridor, and a hotel that matches the bag drops. We do not pretend every famous club has a tee sheet waiting. Availability is checked against your dates.',
        bullets: ['Sotogrande courses — /golf-courses/sotogrande', 'Airport transfer — /transfers/malaga-airport-to-sotogrande', 'Estepona alternative — /golf-holidays/estepona']
      },
      {
        title: 'Is Sotogrande worth the transfer from Málaga?',
        body: 'For a proper week, yes, if the rounds are here. For a short break, usually no. The transfer time guide puts the road next to the other bases so you can compare before you enquire.'
      },
      {
        title: 'Can non-golfers come?',
        body: 'Yes. Count them in the vehicle and the rooms. Sotogrande has a beach and a quieter pace, which is often why partners join this particular base.'
      }
    ]
  }),

  '/golf-holidays/la-cala': page({
    metaTitle: 'La Cala Golf Holiday from Ireland | GolfSol Ireland',
    eyebrow: 'La Cala',
    title: 'La Cala golf holidays from Ireland',
    subtitle:
      'A resort-style Costa del Sol break built around the La Cala courses, with a mid-length private transfer from Málaga Airport.',
    heroImage: fairway,
    heroAlt: 'A Costa del Sol fairway of the kind played on a La Cala golf holiday.',
    formTitle: 'Plan a La Cala trip',
    formLead: 'Tell us dates, how many rounds, and whether you want to stay on the resort or in Fuengirola or Mijas nearby.',
    highlights: [
      'Three courses on one resort, less hotel-hopping',
      'A mid-length private run from Málaga Airport',
      contactLine
    ],
    sections: [
      {
        title: 'Play more than one course without changing hotel',
        body: 'La Cala sits between Fuengirola and Marbella and is known for three courses on the resort: America, Asia and Europa. That is the reason to choose it. You are not collecting a new urbanisation every morning. You are choosing which course suits the group that day.'
      },
      {
        title: 'The airport piece',
        body: 'Most stays here are about 35 to 55 minutes from Málaga Airport by private transfer, depending on the exact gate and traffic. It is longer than Torremolinos and shorter than Marbella. Golf bags are the reason to book the van rather than hope a standard car has the boot.'
      },
      {
        title: 'How Irish groups usually shape the week',
        body: 'Three or four rounds across the resort courses, one dinner that is not a buffet after 18 holes, and a transfer both ways. If you want a Marbella night as well, say so. We will not hide the extra road in the middle of the itinerary.',
        bullets: ['Mijas corridor — /golf-holidays/mijas', 'Fuengirola base — /golf-holidays/fuengirola', 'Mijas transfer — /transfers/malaga-airport-to-mijas']
      },
      {
        title: 'Is La Cala a good society base?',
        body: 'Yes when the group is happy to stay on one resort and vary the course rather than chase a new postcard every day. Mixed handicaps usually find a kinder and a harder layout without a coach transfer between towns.'
      },
      {
        title: 'Do we have to stay on the resort?',
        body: 'No. Some groups sleep in Fuengirola and play La Cala. That adds a short morning transfer and a livelier town at night. Tell us which evening you actually want.'
      }
    ]
  }),

  '/golf-holidays/nueva-andalucia': page({
    metaTitle: 'Nueva Andalucía Golf Holiday | GolfSol Ireland',
    eyebrow: 'Nueva Andalucía',
    title: 'Nueva Andalucía golf holidays',
    subtitle:
      'The Marbella golf valley for Irish groups: hotels among the courses, and a private Málaga Airport transfer of about 45 to 70 minutes.',
    heroImage: marbella,
    heroAlt: 'Marbella coast and golf country used for Nueva Andalucía golf holidays.',
    formTitle: 'Plan a golf valley week',
    formLead: 'Send dates, group size, and whether you care more about walking to courses or about being in Puerto Banús at night.',
    highlights: [
      'Courses clustered in the golf valley',
      'Private AGP transfer into Marbella',
      contactLine
    ],
    sections: [
      {
        title: 'A base chosen for the tee sheet, not the postcard',
        body: 'Nueva Andalucía is the golf valley between Puerto Banús and San Pedro. Irish groups use it when several rounds should sit within a short hop of the hotel. It is more specific than “Marbella”, which can mean a beach hotel with a 30 minute start every morning.'
      },
      {
        title: 'The transfer from Málaga',
        body: 'Count on about 45 to 70 minutes in a private vehicle, the same band as most Marbella golf hotels. Weekend traffic is the variable. The bag count chooses the van. Meet and greet is worth it when more than one flight is landing.',
        bullets: ['Marbella transfer — /transfers/malaga-airport-to-marbella', 'Marbella holidays — /golf-holidays/marbella', 'Valley courses — /golf-courses/marbella-golf-valley']
      },
      {
        title: 'What to decide before you enquire',
        body: 'How many rounds, whether non-golfers want Banús or a quieter urbanisation, and whether a society dinner needs a room that can hear itself. We shortlist courses against the dates. We do not promise a named tee time until it is held.'
      },
      {
        title: 'Is Nueva Andalucía better than Marbella old town for golf?',
        body: 'For the golf, usually yes. For a group that wants the old town every night, maybe not. Tell us which one the captain actually cares about and the hotel choice gets simple.'
      },
      {
        title: 'Can a four-ball use this as easily as a society?',
        body: 'Yes. The valley works for four people and for twenty. The vehicle and the rooming change. The reason for the base does not.'
      }
    ]
  }),

  '/golf-holidays/with-airport-transfers': page({
    metaTitle: 'Costa del Sol Golf Holidays with Airport Transfers | GolfSol Ireland',
    eyebrow: 'Golf and transfers',
    title: 'Costa del Sol golf holidays with airport transfers',
    subtitle:
      'Courses, a hotel base, and private Málaga Airport transfers in one plan for Irish golfers, so the bags and the tee times are not on different inboxes.',
    heroImage: trip('van-doors-open'),
    heroAlt: 'Group van with the doors open, ready for a Costa del Sol golf holiday transfer.',
    formTitle: 'Build the week with transfers',
    formLead: 'Dates, departure airport in Ireland, group size, preferred base, and how many rounds. We will come back with the shape of the trip.',
    highlights: [
      'One Irish desk for golf, stay and AGP transfers',
      'Both the arrival and the flight home',
      contactLine
    ],
    sections: [
      {
        title: 'The holiday people are actually searching for',
        body: 'Most enquiries are not “a hotel” or “a transfer” on their own. They are a golf week that starts when the flight lands at Málaga and ends when the covers are back on the belt. This page is that request: rounds, a sensible base, and private transfers both ways.'
      },
      {
        title: 'What is included in the thinking, before anyone talks price',
        body: 'We pick the coast to match the courses, not the other way round. Torremolinos and Benalmádena keep the airport short. Fuengirola, Mijas and La Cala sit in the middle. Marbella and Nueva Andalucía are the valley. Estepona and Sotogrande are the long west. Transfers are priced off that choice, with the real bag count.'
      },
      {
        title: 'How to start',
        body: 'You do not need every name filled in. Dates, rough headcount, and “we want four rounds near Marbella” is enough for a first plan. Flight numbers can follow.',
        bullets: [
          'All golf holidays — /golf-holidays',
          'Transfer times — /guides/malaga-airport-golf-transfer-times',
          'Society packages — /golf-packages/golf-society-packages',
          'From Ireland — /golf-holidays-spain-from-ireland'
        ]
      },
      {
        title: 'Do your golf holidays include Málaga Airport transfers?',
        body: 'They can. Ask for arrival, departure, and any hotel-to-course days in the same enquiry. We confirm what is in the price before you pay anything.'
      },
      {
        title: 'Can a society book golf and transfers together?',
        body: 'Yes. One captain, one brief, one set of vehicles. Split suppliers are how clubs get left in the wrong car. If you already have the hotel, we can still take the transfers and the tee-time chase.'
      }
    ]
  })
}
