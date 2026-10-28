import type { GeContentPageData } from '../pages/golf-experience/data/content-pages'
import { SEO_CONTACT } from '../lib/seo/seo-contact'

const fairway = '/images/ge-premium-golf-fairway-coastal.webp'
const valley = '/images/courses/marbella-golf-valley-corridor.webp'
const sotogrande = '/images/courses/sotogrande-golf-corridor.webp'
const mijas = '/images/courses/mijas-fuengirola-golf-corridor.webp'
const estepona = '/images/destinations/estepona-golf-holiday-costa-del-sol.webp'
const malaga = '/images/destinations/malaga-golf-holiday-costa-del-sol.webp'
const marbellaStay = '/images/destinations/marbella-golf-holiday-costa-del-sol.webp'
const fromIreland = '/images/departures/golf-holidays-spain-from-ireland.webp'
const fromDublin = '/images/departures/golf-holidays-spain-from-dublin.webp'
const fromShannon = '/images/departures/golf-holidays-spain-from-shannon.webp'
const fromBelfast = '/images/departures/golf-holidays-spain-from-belfast.webp'
const group = '/images/ge-premium-golf-group-testimonial.webp'
const resort = '/images/ge-premium-resort-hotel-hero.webp'
const agp = '/images/transfers/malaga-airport-golf-transfers.webp'

const contactLine = `Irish support ${SEO_CONTACT.irishPhoneDisplay} · Spanish line ${SEO_CONTACT.spanishPhoneDisplay} · ${SEO_CONTACT.email}`

type Section = GeContentPageData['sections'][number]

function page(partial: {
  readonly metaTitle: string
  readonly eyebrow: string
  readonly title: string
  readonly subtitle: string
  readonly heroImage: string
  readonly heroAlt: string
  readonly formTitle: string
  readonly formLead: string
  readonly highlights?: readonly string[]
  readonly sections: readonly Section[]
}): GeContentPageData {
  return {
    ...partial,
    highlights: partial.highlights ?? [
      'Planned for golfers travelling from Ireland',
      'Courses, hotels and Málaga Airport transfers',
      contactLine
    ],
    interestPreset: partial.title,
    enquiryType: 'booking'
  }
}

function course(input: {
  readonly path: string
  readonly name: string
  readonly metaTitle: string
  readonly title: string
  readonly subtitle: string
  readonly image: string
  readonly alt: string
  readonly blurb: string
  readonly suits: string
  readonly watch: string
  readonly baseLabel: string
  readonly basePath: string
  readonly transferLabel: string
  readonly transferPath: string
  readonly alsoLabel: string
  readonly alsoPath: string
  readonly q1: string
  readonly a1: string
  readonly q2: string
  readonly a2: string
}): [string, GeContentPageData] {
  return [
    input.path,
    page({
      metaTitle: input.metaTitle,
      eyebrow: 'Course guide',
      title: input.title,
      subtitle: input.subtitle,
      heroImage: input.image,
      heroAlt: input.alt,
      formTitle: `Ask about ${input.name}`,
      formLead: `Tell us your dates from Ireland, group size, and whether ${input.name} is a must or a maybe. We will say if it fits the rest of the week.`,
      sections: [
        { title: `Where ${input.name} sits`, body: input.blurb },
        { title: 'Who should put it on the list', body: input.suits },
        { title: 'What to check before you promise the group', body: input.watch },
        {
          title: 'Pages that belong with this course',
          body: 'Open the base, the airport run, and one neighbouring course before you lock the week.',
          bullets: [
            `${input.baseLabel} — ${input.basePath}`,
            `${input.transferLabel} — ${input.transferPath}`,
            `${input.alsoLabel} — ${input.alsoPath}`,
            'Course shortlist guide — /guides/best-golf-courses-costa-del-sol'
          ]
        },
        { title: input.q1, body: input.a1 },
        { title: input.q2, body: input.a2 }
      ]
    })
  ]
}

function origin(input: {
  readonly path: string
  readonly name: string
  readonly metaTitle: string
  readonly title: string
  readonly subtitle: string
  readonly image: string
  readonly alt: string
  readonly airport: string
  readonly plan: string
  readonly bags: string
  readonly airportLabel: string
  readonly airportPath: string
  readonly q1: string
  readonly a1: string
  readonly q2: string
  readonly a2: string
}): [string, GeContentPageData] {
  return [
    input.path,
    page({
      metaTitle: input.metaTitle,
      eyebrow: `From ${input.name}`,
      title: input.title,
      subtitle: input.subtitle,
      heroImage: input.image,
      heroAlt: input.alt,
      formTitle: `Plan a trip from ${input.name}`,
      formLead: `Send your town, preferred dates, group size, and whether you expect to fly via ${input.airport}. We plan the Costa del Sol side around the flight that is actually on sale.`,
      sections: [
        { title: `Getting from ${input.name} to Málaga`, body: input.airport },
        { title: 'Build the golf week after the flight is real', body: input.plan },
        { title: 'Clubs on an Irish departure', body: input.bags },
        {
          title: 'Plan the Irish side and the Costa del Sol side together',
          body: 'Use the airport page for the flight, then the transfer guide for the far end.',
          bullets: [
            `${input.airportLabel} — ${input.airportPath}`,
            'All Ireland departures — /golf-holidays-spain-from-ireland',
            'Málaga transfer times — /guides/malaga-airport-golf-transfer-times',
            'Holiday with transfers — /golf-holidays/with-airport-transfers'
          ]
        },
        { title: input.q1, body: input.a1 },
        { title: input.q2, body: input.a2 }
      ]
    })
  ]
}

function style(input: {
  readonly path: string
  readonly metaTitle: string
  readonly eyebrow: string
  readonly title: string
  readonly subtitle: string
  readonly image: string
  readonly alt: string
  readonly formTitle: string
  readonly lead: string
  readonly first: string
  readonly second: string
  readonly third: string
  readonly links: readonly string[]
  readonly q1: string
  readonly a1: string
  readonly q2: string
  readonly a2: string
}): [string, GeContentPageData] {
  return [
    input.path,
    page({
      metaTitle: input.metaTitle,
      eyebrow: input.eyebrow,
      title: input.title,
      subtitle: input.subtitle,
      heroImage: input.image,
      heroAlt: input.alt,
      formTitle: input.formTitle,
      formLead: input.lead,
      sections: [
        { title: 'What this trip is actually for', body: input.first },
        { title: 'Where on the Costa del Sol it works', body: input.second },
        { title: 'How an Irish group should start', body: input.third },
        {
          title: 'Pages that match this kind of week',
          body: 'These are the next reads, not a package you have to take whole.',
          bullets: input.links
        },
        { title: input.q1, body: input.a1 },
        { title: input.q2, body: input.a2 }
      ]
    })
  ]
}

const coursePages = [
  course({
    path: '/golf-courses/valderrama',
    name: 'Valderrama',
    metaTitle: 'Valderrama Golf Holiday from Ireland | GolfSol Ireland',
    title: 'Valderrama for Irish golf holidays',
    subtitle: 'How Irish groups should treat Real Club Valderrama: one requested round in a Sotogrande week, not the whole itinerary.',
    image: sotogrande,
    alt: 'Western Costa del Sol golf country used when planning a Valderrama request.',
    blurb: 'Real Club Valderrama is in Sotogrande and is the course people mean when they say they want a bucket-list day. It hosted the 1997 Ryder Cup. Trees, slope, and pace of play make it a poor choice as the friendly opening round of a mixed society.',
    suits: 'Use it for a lower-handicap day, a captain’s match, or a four-ball that already knows tournament golf. Pair it with an easier Sotogrande or Estepona course so the rest of the party still enjoys the week.',
    watch: 'A Valderrama tee time is a request, not a promise. Dress rules and the clock are strict. Do not tell the WhatsApp group it is booked until we have a hold. The airport run from Málaga is the long western transfer, so the hotel should already be in Sotogrande.',
    baseLabel: 'Sotogrande holidays',
    basePath: '/golf-holidays/sotogrande',
    transferLabel: 'AGP to Sotogrande',
    transferPath: '/transfers/malaga-airport-to-sotogrande',
    alsoLabel: 'Finca Cortesin',
    alsoPath: '/golf-courses/finca-cortesin',
    q1: 'Can an Irish society book Valderrama?',
    a1: 'Sometimes, for the right date and group size. Send the dates before you sell the trip internally. If the sheet is closed we will put a serious western course in its place rather than pretend.',
    q2: 'Is Valderrama a sensible first Costa del Sol trip?',
    a2: 'Only if the group wants one hard day and already plays to a standard that will enjoy it. First-time societies are usually happier with La Cala, El Chaparral, or a Nueva Andalucía mix.'
  }),
  course({
    path: '/golf-courses/finca-cortesin',
    name: 'Finca Cortesin',
    metaTitle: 'Finca Cortesin Golf Holiday from Ireland | GolfSol Ireland',
    title: 'Finca Cortesin golf holidays from Ireland',
    subtitle: 'A luxury Casares round for Irish visitors, beside the 2023 Solheim Cup venue, with an Estepona or Sotogrande base.',
    image: estepona,
    alt: 'Estepona and Casares coast used for Finca Cortesin golf holiday planning.',
    blurb: 'Finca Cortesin sits above Casares, between Estepona and Sotogrande. It staged the 2023 Solheim Cup. The course is polished, the setting is resort-quiet, and the day feels like an occasion rather than a standard society roll-up.',
    suits: 'Couples and small groups who want one elevated round, and societies who have budget for a marquee day plus simpler golf around it. It is a long way from a Torremolinos hotel, so do not bolt it onto an eastern base.',
    watch: 'Green fees here sit at the top of the coast. We will not hide that in a “from” price. Ask early, keep the hotel in Estepona or Sotogrande, and use a private transfer that can take the covers.',
    baseLabel: 'Estepona holidays',
    basePath: '/golf-holidays/estepona',
    transferLabel: 'AGP to Estepona',
    transferPath: '/transfers/malaga-airport-to-estepona',
    alsoLabel: 'Valderrama',
    alsoPath: '/golf-courses/valderrama',
    q1: 'How far is Finca Cortesin from Málaga Airport?',
    a1: 'Treat it as a western arrival, in the same band as Estepona and often close to 70 to 90 minutes depending on the hotel you sleep in. The course itself is not an airport day trip.',
    q2: 'Is Finca Cortesin only for single-figure players?',
    a2: 'No, but it is not the place to discover competition golf. Forward tees and a caddie or buggy plan help a mixed four-ball. Tell us the handicap spread.'
  }),
  course({
    path: '/golf-courses/la-reserva-club',
    name: 'La Reserva Club',
    metaTitle: 'La Reserva Club Golf Holiday | GolfSol Ireland',
    title: 'La Reserva Club for Irish golf groups',
    subtitle: 'Sotogrande golf at La Reserva Club, the western base we already drive groups to from Málaga Airport.',
    image: '/images/customer-trips/van-at-la-reserva.jpg',
    alt: 'Golf Sol van parked at La Reserva Club in Sotogrande.',
    blurb: 'La Reserva Club is inside Sotogrande, with the white gates and the long Málaga arrival our own groups already use. It works as a stay-and-play base, not as a quick add-on to a Marbella hotel.',
    suits: 'Irish groups who want the west for several nights: one club, a quiet finish to the coast, and rounds that do not start with an hour in the van. Non-golfers tend to prefer this pace to a busy promenade.',
    watch: 'The airport transfer is about 90 to 120 minutes. That is worth it for five nights or more. For a weekend, pick Marbella or La Cala and leave La Reserva for the longer trip.',
    baseLabel: 'Sotogrande holidays',
    basePath: '/golf-holidays/sotogrande',
    transferLabel: 'AGP to Sotogrande',
    transferPath: '/transfers/malaga-airport-to-sotogrande',
    alsoLabel: 'Alcaidesa',
    alsoPath: '/golf-courses/alcaidesa',
    q1: 'Do you already transfer to La Reserva?',
    a1: 'Yes. Arrival and departure for a Sotogrande stay, including La Reserva, is a normal private run when the bag count is clear.',
    q2: 'Can we play other Sotogrande courses the same week?',
    a2: 'That is the point of the base. Alcaidesa and a Valderrama request can sit around a La Reserva stay if the dates allow. We will not stack three famous clubs and hope.'
  }),
  course({
    path: '/golf-courses/la-cala-campo-america',
    name: 'La Cala Campo America',
    metaTitle: 'La Cala Campo America Golf | GolfSol Ireland',
    title: 'La Cala Campo America for Irish golfers',
    subtitle: 'The long La Cala layout, for Irish groups who want the harder of the three resort courses between Fuengirola and Marbella.',
    image: fairway,
    alt: 'Costa del Sol fairway used to illustrate La Cala golf.',
    blurb: 'Campo America is the La Cala course Irish visitors usually meet when they ask for the bigger test of the three. It sits on the same resort as Asia and Europa, so you can sleep once and change layout rather than change town.',
    suits: 'The middle day of a La Cala week, or the day the lower handicaps want something longer. It is a better society round than Valderrama and a sterner one than Europa.',
    watch: 'Book the resort, or a Fuengirola hotel plus a short morning transfer. Do not assume America is available just because Asia is. Each course has its own sheet.',
    baseLabel: 'La Cala holidays',
    basePath: '/golf-holidays/la-cala',
    transferLabel: 'AGP toward Mijas',
    transferPath: '/transfers/malaga-airport-to-mijas',
    alsoLabel: 'Campo Asia',
    alsoPath: '/golf-courses/la-cala-campo-asia',
    q1: 'Is Campo America harder than the other La Cala courses?',
    a1: 'It is the one we suggest when the group wants length. Asia is tighter and more of a target test. Europa is the kinder layout. A mixed society can play all three without moving hotel.',
    q2: 'How long from Málaga Airport to La Cala?',
    a2: 'Most stays are about 35 to 55 minutes by private transfer. Send the hotel name if you are not sleeping on the resort.'
  }),
  course({
    path: '/golf-courses/la-cala-campo-asia',
    name: 'La Cala Campo Asia',
    metaTitle: 'La Cala Campo Asia Golf | GolfSol Ireland',
    title: 'La Cala Campo Asia for Irish golf trips',
    subtitle: 'The tighter La Cala course, with water and target golf, for Irish groups who want a thinking round on the same resort.',
    image: mijas,
    alt: 'Mijas and La Cala golf country between Fuengirola and Marbella.',
    blurb: 'Campo Asia is the La Cala layout that punishes a loose swing more than a short one. Water and narrower landing areas make it the “think your way round” day. It is still one resort, so the logistics stay simple for a group from Ireland.',
    suits: 'Players who like a scorecard that asks for placement, and captains who want one different day without hiring a coach to another town. High handicaps can play it from the forward tees if you tell us that is the brief.',
    watch: 'Buggies matter more here if the group walks slowly. Summer midday is the wrong slot. Ask for an earlier tee when the dates are June to early September.',
    baseLabel: 'La Cala holidays',
    basePath: '/golf-holidays/la-cala',
    transferLabel: 'Fuengirola transfer',
    transferPath: '/transfers/malaga-airport-to-fuengirola',
    alsoLabel: 'Campo Europa',
    alsoPath: '/golf-courses/la-cala-campo-europa',
    q1: 'Should a mixed society play Campo Asia?',
    a1: 'Yes, as one of the three, not as the only round if half the group is new to holiday golf. Put Europa or a Mijas course beside it.',
    q2: 'Do we need three separate hotel moves?',
    a2: 'No. America, Asia, and Europa share the resort. One check-in covers the golf. The airport transfer is a single arrival and a single departure.'
  }),
  course({
    path: '/golf-courses/la-cala-campo-europa',
    name: 'La Cala Campo Europa',
    metaTitle: 'La Cala Campo Europa Golf | GolfSol Ireland',
    title: 'La Cala Campo Europa for Irish groups',
    subtitle: 'The friendlier La Cala course, a sound first round for Irish societies and higher handicaps on the resort.',
    image: fairway,
    alt: 'Open Costa del Sol fairway of the kind played on Campo Europa.',
    blurb: 'Campo Europa is the La Cala course we point mixed and newer groups toward first. It is wider and less punishing than Asia, and it still feels like a proper resort round rather than a pay-and-play field.',
    suits: 'Opening day after a travel morning, four-balls with a wide handicap spread, and anyone who wants golf without a silent buggy. Follow it with America if the better players want a longer second day.',
    watch: 'Friendly does not mean empty. Easter and October fill the resort. Send dates before the society commits deposits to members.',
    baseLabel: 'La Cala holidays',
    basePath: '/golf-holidays/la-cala',
    transferLabel: 'Mijas airport run',
    transferPath: '/transfers/malaga-airport-to-mijas',
    alsoLabel: 'El Chaparral',
    alsoPath: '/golf-courses/el-chaparral',
    q1: 'Is Campo Europa too easy?',
    a1: 'Not for a 18 to 28 handicap on holiday tees. Single-figure players can still score, then move to America the next morning. Easy and pointless are different things.',
    q2: 'Can beginners start here?',
    a2: 'Yes, if they already play 18 holes at home. Brand new golfers are happier with a shorter first day. Tell us that honestly.'
  }),
  course({
    path: '/golf-courses/santana',
    name: 'Santana Golf',
    metaTitle: 'Santana Golf Costa del Sol | GolfSol Ireland',
    title: 'Santana Golf for Irish holiday groups',
    subtitle: 'Santana, on the Mijas Costa side, as a parkland day for Irish groups based between Benalmádena and Marbella.',
    image: mijas,
    alt: 'Mijas Costa golf landscape near Santana.',
    blurb: 'Santana sits inland from the Mijas Costa strip, with a parkland feel rather than a dune or clifftop one. Irish groups use it as a solid middle round when the hotel is in Fuengirola, Benalmádena, or the lower Mijas hills.',
    suits: 'Societies who want a maintained course without the green fee of the valley marquee clubs, and four-balls who like trees and a calm routing. It is not the postcard for people who only want sea views.',
    watch: 'The approach road is not the promenade. Put the course name on the transfer, not just “Mijas”. A buggy is worth asking about for anyone who walked 36 holes the day before.',
    baseLabel: 'Mijas holidays',
    basePath: '/golf-holidays/mijas',
    transferLabel: 'AGP to Mijas',
    transferPath: '/transfers/malaga-airport-to-mijas',
    alsoLabel: 'El Chaparral',
    alsoPath: '/golf-courses/el-chaparral',
    q1: 'Is Santana close to Málaga Airport?',
    a1: 'Closer than Marbella. Most Mijas Costa arrivals are about 30 to 50 minutes. Santana itself is off the coast road, so send the pin you are actually using.',
    q2: 'Does Santana suit a mixed handicap day?',
    a2: 'Yes. It is one of the courses we use when the group is not trying to collect famous names. Tell us if you still want one harder day elsewhere.'
  }),
  course({
    path: '/golf-courses/cabopino',
    name: 'Cabopino',
    metaTitle: 'Cabopino Golf Holiday from Ireland | GolfSol Ireland',
    title: 'Cabopino golf for Irish visitors',
    subtitle: 'Dune golf at Cabopino, east of Marbella, for Irish groups who want a different day from the valley parkland.',
    image: marbellaStay,
    alt: 'East Marbella coast near the Cabopino dunes.',
    blurb: 'Cabopino plays through the Artola dunes on the east side of Marbella. It does not feel like Los Naranjos or Las Brisas. Wind, sand, and a links-style walk are the reason to add it.',
    suits: 'Four-balls and societies who have already played two valley courses and want a change of scenery. A Marbella or Elviria hotel is a better pillow than Sotogrande.',
    watch: 'Wind off the sea changes the same hole hour by hour. It is a poor pick in a howling Levant if the group hates exposed golf. We will say so if the week looks like that.',
    baseLabel: 'Marbella holidays',
    basePath: '/golf-holidays/marbella',
    transferLabel: 'AGP to Marbella',
    transferPath: '/transfers/malaga-airport-to-marbella',
    alsoLabel: 'Rio Real',
    alsoPath: '/golf-courses/rio-real',
    q1: 'Is Cabopino a links course?',
    a1: 'It is dune golf beside the beach, which is as close as this stretch of coast gets. It is not an Irish links. Expect sand and wind, not a parkland tree tunnel.',
    q2: 'Which hotel works with Cabopino?',
    a2: 'East Marbella or a central Marbella base. Nueva Andalucía is fine for one Cabopino day. A Fuengirola hotel makes the morning longer than it needs to be.'
  }),
  course({
    path: '/golf-courses/el-chaparral',
    name: 'El Chaparral',
    metaTitle: 'El Chaparral Golf Costa del Sol | GolfSol Ireland',
    title: 'El Chaparral for Irish golf societies',
    subtitle: 'A friendly Mijas Costa course Irish groups use when the week needs an enjoyable round, not a ranking.',
    image: mijas,
    alt: 'Mijas Costa golf country around El Chaparral.',
    blurb: 'El Chaparral is on the Mijas Costa side and has a reputation among visiting groups for being playable and well kept without the ceremony of the big valley names. That is a compliment for a mixed Irish society.',
    suits: 'First-time Costa del Sol trips, higher handicaps, and the “nobody should go home miserable” day. Pair it with one harder course if the single-figure players need a test.',
    watch: 'Friendly courses still fill in October and at Easter. It is not a secret that only we know. Send dates and headcount early if the society is over twelve.',
    baseLabel: 'Fuengirola holidays',
    basePath: '/golf-holidays/fuengirola',
    transferLabel: 'AGP to Fuengirola',
    transferPath: '/transfers/malaga-airport-to-fuengirola',
    alsoLabel: 'Campo Europa',
    alsoPath: '/golf-courses/la-cala-campo-europa',
    q1: 'Is El Chaparral good value?',
    a1: 'It is one of the courses we suggest when the brief says enjoyable golf before a famous green fee. The final number depends on the date. We confirm it before you collect money.',
    q2: 'Can a 24 handicap enjoy El Chaparral?',
    a2: 'Yes, from the right tees, with a buggy if the walks at home are shorter than a holiday round. Tell us that when you enquire.'
  }),
  course({
    path: '/golf-courses/mijas-golf',
    name: 'Mijas Golf',
    metaTitle: 'Mijas Golf Los Lagos and Los Olivos | GolfSol Ireland',
    title: 'Mijas Golf for Irish holiday groups',
    subtitle: 'Los Lagos and Los Olivos at Mijas Golf, two hill courses for Irish groups who want variety without leaving the town.',
    image: mijas,
    alt: 'Hill golf above the Mijas and Fuengirola coast.',
    blurb: 'Mijas Golf gives an Irish group two layouts, Los Lagos and Los Olivos, in the hills above the coast. You can play both and still use one hotel in Mijas or Fuengirola. The views are the selling point. The climb is the detail people forget.',
    suits: 'Societies based in the middle of the coast who do not want a Marbella commute. A buggy is the default conversation, especially for anyone playing 36 holes or walking badly in heat.',
    watch: 'Hill times are not coast-road times. “Twenty minutes from Fuengirola” can be optimistic at school-run hour. We schedule the transfer for the tee, not for a map screenshot.',
    baseLabel: 'Mijas holidays',
    basePath: '/golf-holidays/mijas',
    transferLabel: 'AGP to Mijas',
    transferPath: '/transfers/malaga-airport-to-mijas',
    alsoLabel: 'Santana',
    alsoPath: '/golf-courses/santana',
    q1: 'Do we play both Mijas courses?',
    a1: 'You can. Many Irish weeks do Lagos one day and Olivos the next. They are separate tee sheets, so say if you want both.',
    q2: 'Are buggies needed at Mijas?',
    a2: 'Not by rule for every player. For a society with a mix of ages, yes, ask. Summer afternoons on the hill are the days people regret walking.'
  }),
  course({
    path: '/golf-courses/la-quinta',
    name: 'La Quinta',
    metaTitle: 'La Quinta Golf Benahavis | GolfSol Ireland',
    title: 'La Quinta golf for Irish visitors',
    subtitle: 'La Quinta in Benahavís, a view-led round above the Marbella valley for Irish groups who do not mind a climb.',
    image: valley,
    alt: 'Marbella golf valley country below the Benahavís hills.',
    blurb: 'La Quinta sits in the Benahavís hills above the golf valley. The views are the memory. The slopes are the reason a buggy belongs in the enquiry. It is a different day from the flat valley courses ten minutes down the road.',
    suits: 'Four-balls and societies sleeping in Nueva Andalucía or Benahavís who want one scenic round. Less ideal as the only course if several players cannot walk and buggies are tight that week.',
    watch: 'Mountain weather can mist in when the beach is clear. Build a valley backup in the same week rather than a single La Quinta pilgrimage.',
    baseLabel: 'Nueva Andalucía',
    basePath: '/golf-holidays/nueva-andalucia',
    transferLabel: 'AGP to Marbella',
    transferPath: '/transfers/malaga-airport-to-marbella',
    alsoLabel: 'Los Arqueros',
    alsoPath: '/golf-courses/los-arqueros',
    q1: 'Is La Quinta in Marbella?',
    a1: 'It is in the Benahavís hills, just inland of the Marbella golf valley. A Nueva Andalucía hotel is the practical base. A beach hotel in Torremolinos is not.',
    q2: 'Should we walk La Quinta?',
    a2: 'Only if the group walks hilly courses at home. Otherwise put buggies in the brief before the tee time is requested.'
  }),
  course({
    path: '/golf-courses/los-naranjos',
    name: 'Los Naranjos',
    metaTitle: 'Los Naranjos Golf Nueva Andalucia | GolfSol Ireland',
    title: 'Los Naranjos for Irish golf weeks',
    subtitle: 'Los Naranjos in Nueva Andalucía, a tree-lined valley course Irish groups use in the middle of a Marbella stay.',
    image: valley,
    alt: 'Golf valley fairways in Nueva Andalucía near Los Naranjos.',
    blurb: 'Los Naranjos is in the heart of Nueva Andalucía. Trees, water, and a members-club feel make it a proper round rather than a resort filler. Irish four-balls like it because the hotel can be a few minutes away.',
    suits: 'Anyone basing the week in the golf valley. It pairs cleanly with Las Brisas or Aloha so the group sees more than one valley style without a motorway.',
    watch: 'Valley traffic on a Saturday morning is real. The transfer from a Puerto Banús hotel can look short and still need margin. We plan that into the pickup.',
    baseLabel: 'Nueva Andalucía holidays',
    basePath: '/golf-holidays/nueva-andalucia',
    transferLabel: 'AGP to Marbella',
    transferPath: '/transfers/malaga-airport-to-marbella',
    alsoLabel: 'Las Brisas',
    alsoPath: '/golf-courses/las-brisas',
    q1: 'Is Los Naranjos walkable from a valley hotel?',
    a1: 'Some pins are a short hop. Do not assume a stroll with four travel covers. A private course transfer is still the calm option for a society.',
    q2: 'Does Los Naranjos suit high handicaps?',
    a2: 'From forward tees, yes. It is not a wide-open beginner field. If half the group is new, put El Chaparral or Campo Europa on another day.'
  }),
  course({
    path: '/golf-courses/aloha',
    name: 'Aloha Golf',
    metaTitle: 'Aloha Golf Nueva Andalucia | GolfSol Ireland',
    title: 'Aloha Golf for Irish visitors',
    subtitle: 'Aloha in Nueva Andalucía, a classic valley members course Irish groups request beside Las Brisas and Los Naranjos.',
    image: valley,
    alt: 'Nueva Andalucía golf valley, the setting for Aloha Golf.',
    blurb: 'Aloha is one of the established Nueva Andalucía clubs, associated with Javier Arana’s design era on this coast. Narrower driving and a traditional club atmosphere are why captains ask for it by name.',
    suits: 'Groups who already know holiday golf and want a valley name with history, not a soft opening round. Sleep in Nueva Andalucía so the morning is a short transfer.',
    watch: 'Member clubs keep tighter tee sheets and dress codes. We request. We do not tattoo the name onto the flyer until the time is held.',
    baseLabel: 'Golf valley holidays',
    basePath: '/golf-holidays/nueva-andalucia',
    transferLabel: 'AGP to Marbella',
    transferPath: '/transfers/malaga-airport-to-marbella',
    alsoLabel: 'Los Naranjos',
    alsoPath: '/golf-courses/los-naranjos',
    q1: 'Is Aloha the same as Las Brisas?',
    a1: 'No. They are neighbours in spirit and a short drive apart, and they feel different on the day. Playing both is a good valley week. Playing only one is also fine.',
    q2: 'Can a large society get Aloha?',
    a2: 'Size and date decide it. Sixteen people in October is a different ask from a four-ball in February. Send the number with the dates.'
  }),
  course({
    path: '/golf-courses/las-brisas',
    name: 'Las Brisas',
    metaTitle: 'Las Brisas Golf Marbella | GolfSol Ireland',
    title: 'Las Brisas golf holidays from Ireland',
    subtitle: 'Las Brisas in Nueva Andalucía, a classic valley round Irish golfers ask for by name.',
    image: valley,
    alt: 'Marbella golf valley, home of Las Brisas.',
    blurb: 'Las Brisas is the Nueva Andalucía course many Irish golfers can already name. Water, trees, and a reputation that arrived before the group did. It earns a place as a feature day, then the rest of the week can breathe.',
    suits: 'Societies and four-balls on a Marbella week who want one course everyone has heard of. It is wasted if the hotel is in Estepona and the morning transfer eats the reason you came.',
    watch: 'Famous means busy in the Irish society months of September, October, and Easter. Request it first, then wrap easier golf around whatever time comes back.',
    baseLabel: 'Marbella holidays',
    basePath: '/golf-holidays/marbella',
    transferLabel: 'AGP to Marbella',
    transferPath: '/transfers/malaga-airport-to-marbella',
    alsoLabel: 'Aloha',
    alsoPath: '/golf-courses/aloha',
    q1: 'Is Las Brisas suitable for a 20 handicap?',
    a1: 'From the right tees, with a realistic expectation of the water. It should not be the first 18 holes someone has played that year.',
    q2: 'Which transfer do we book with Las Brisas?',
    a2: 'The Marbella airport run on arrival day, then a short valley transfer on golf mornings if the hotel is not beside the club.'
  }),
  course({
    path: '/golf-courses/guadalmina',
    name: 'Guadalmina',
    metaTitle: 'Guadalmina Golf San Pedro | GolfSol Ireland',
    title: 'Guadalmina golf for Irish groups',
    subtitle: 'Guadalmina North and South at San Pedro, two courses Irish groups can split across one Marbella week.',
    image: valley,
    alt: 'San Pedro and the golf country around Guadalmina.',
    blurb: 'Guadalmina, at San Pedro de Alcántara, gives you a north course and a south course on the doorstep of the valley. Irish groups use the pair when they want two days of golf without a new hotel and without driving to Sotogrande.',
    suits: 'A Marbella or San Pedro base. Split the society if the tees work that way, or play South one morning and North the next. It is a practical heart-of-the-week venue.',
    watch: 'Say which course you mean. “Guadalmina” on its own is how the wrong nine ends up on the sheet. We will ask.',
    baseLabel: 'Marbella holidays',
    basePath: '/golf-holidays/marbella',
    transferLabel: 'AGP to Marbella',
    transferPath: '/transfers/malaga-airport-to-marbella',
    alsoLabel: 'Los Naranjos',
    alsoPath: '/golf-courses/los-naranjos',
    q1: 'Are Guadalmina North and South different?',
    a1: 'Yes. Treat them as two rounds, not a duplicate. Tell us if you want both or only the one that suits the handicap mix.',
    q2: 'Is San Pedro a good hotel base?',
    a2: 'Yes for golf. It sits between the valley and the west. Puerto Banús nights are close. Sotogrande is still a long extra hop, so do not pretend otherwise.'
  }),
  course({
    path: '/golf-courses/dona-julia',
    name: 'Doña Julia',
    metaTitle: 'Dona Julia Golf Casares | GolfSol Ireland',
    title: 'Doña Julia golf for Irish societies',
    subtitle: 'Doña Julia at Casares, a newer western course Irish groups use when they want golf without a marquee green fee.',
    image: estepona,
    alt: 'Western Costa del Sol hills around Casares and Doña Julia.',
    blurb: 'Doña Julia is in the Casares hills, inland of the Estepona side. It is newer than the valley names and it is one of the courses we suggest when an Irish society wants a proper layout and a calmer invoice.',
    suits: 'Value-minded societies based in Estepona, and four-balls who are happy in a buggy with a view. It can be the workhorse round beside one Finca Cortesin day.',
    watch: 'It is not a beach club. The transfer from an Estepona hotel is short. The transfer from Fuengirola is not. Pick the base first.',
    baseLabel: 'Estepona holidays',
    basePath: '/golf-holidays/estepona',
    transferLabel: 'AGP to Estepona',
    transferPath: '/transfers/malaga-airport-to-estepona',
    alsoLabel: 'Valle Romano',
    alsoPath: '/golf-courses/valle-romano',
    q1: 'Is Doña Julia a budget course?',
    a1: 'It is often the better-value western option next to the famous names. “Budget” changes with the month. We price the date you send, not a brochure from last spring.',
    q2: 'Can we reach Doña Julia from Sotogrande?',
    a2: 'Yes for one day. If most rounds are here, Estepona is the simpler hotel. If most rounds are inside Sotogrande, stay there instead.'
  }),
  course({
    path: '/golf-courses/valle-romano',
    name: 'Valle Romano',
    metaTitle: 'Valle Romano Golf Estepona | GolfSol Ireland',
    title: 'Valle Romano golf holidays from Ireland',
    subtitle: 'Valle Romano in Estepona, a resort course that suits Irish groups who want the town and the golf in one place.',
    image: estepona,
    alt: 'Estepona, the town base for Valle Romano golf.',
    blurb: 'Valle Romano is an Estepona resort course, which means the apartment or hotel and the first tee can live in the same plan. For an Irish group that is often worth more than chasing a famous name an hour away.',
    suits: 'Societies and four-balls who want a walkable-to-buggy golf life and a town that is quieter than Marbella. Mixed handicaps usually find it fairer than the hill courses.',
    watch: 'A resort course still needs a tee time. “We are staying there” is not a booking. Send dates and the number of buggies in the same note.',
    baseLabel: 'Estepona holidays',
    basePath: '/golf-holidays/estepona',
    transferLabel: 'AGP to Estepona',
    transferPath: '/transfers/malaga-airport-to-estepona',
    alsoLabel: 'Doña Julia',
    alsoPath: '/golf-courses/dona-julia',
    q1: 'Is Valle Romano good for a first Estepona trip?',
    a1: 'Yes. It lets the group learn the town without a dawn transfer. Add Doña Julia or a Casares day if you want a second, different course.',
    q2: 'How long is the airport transfer?',
    a2: 'Estepona is usually about 70 to 90 minutes from Málaga Airport in a private vehicle. That is the arrival cost of a quieter base.'
  }),
  course({
    path: '/golf-courses/alcaidesa',
    name: 'Alcaidesa',
    metaTitle: 'Alcaidesa Golf Sotogrande | GolfSol Ireland',
    title: 'Alcaidesa golf for Irish visitors',
    subtitle: 'Alcaidesa Links and Heathland, near Sotogrande, for Irish groups who want two styles at the western end.',
    image: sotogrande,
    alt: 'Sotogrande golf country near Alcaidesa.',
    blurb: 'Alcaidesa has a links layout and a heathland layout close to Sotogrande and the bay toward Gibraltar. Irish groups who already accepted the long airport run can play both without another hotel.',
    suits: 'A Sotogrande week that should not be only one club. The links day is the one to give people who like wind. The heathland day is the contrast.',
    watch: 'This is the far west. A Marbella hotel makes every Alcaidesa morning a slog. Stay in Sotogrande or accept a single day trip, not three.',
    baseLabel: 'Sotogrande holidays',
    basePath: '/golf-holidays/sotogrande',
    transferLabel: 'AGP to Sotogrande',
    transferPath: '/transfers/malaga-airport-to-sotogrande',
    alsoLabel: 'La Reserva',
    alsoPath: '/golf-courses/la-reserva-club',
    q1: 'Which Alcaidesa course should we play?',
    a1: 'If you can play once, say whether the group prefers a links feel or a heathland feel. If you can play twice, book both and stop choosing.',
    q2: 'Is Alcaidesa near Gibraltar?',
    a2: 'It is at the western end, yes. Flying into Gibraltar instead of Málaga is a different plan and often worse for Irish golf-bag flights. We still start most groups at AGP.'
  }),
  course({
    path: '/golf-courses/lauro',
    name: 'Lauro Golf',
    metaTitle: 'Lauro Golf near Malaga Airport | GolfSol Ireland',
    title: 'Lauro Golf for Irish arrivals',
    subtitle: 'Lauro and its 27 holes at Alhaurin de la Torre, the course Irish groups use when they want golf close to Málaga Airport.',
    image: malaga,
    alt: 'Málaga side of the Costa del Sol, the short side for Lauro Golf.',
    blurb: 'Lauro Golf is at Alhaurín de la Torre, on the airport side of the coast, with 27 holes so a group can vary the nines. It is the right conversation when the flight lands late and nobody wants a 90 minute van before the first pint.',
    suits: 'Short breaks, arrival-day golf, and societies based in Torremolinos or Málaga who will travel west for only one or two bigger days. It is not a substitute for a Marbella valley week.',
    watch: 'Close to the airport means warmer inland afternoons and a different view from the beach courses. Say if the group cares more about the sea than the tee sheet.',
    baseLabel: 'Málaga holidays',
    basePath: '/golf-holidays/malaga',
    transferLabel: 'Short AGP runs',
    transferPath: '/transfers/malaga-airport-to-torremolinos',
    alsoLabel: 'Transfer time guide',
    alsoPath: '/guides/malaga-airport-golf-transfer-times',
    q1: 'Can we play Lauro on arrival day?',
    a1: 'Often, if the Irish flight is a morning arrival and the tee is late enough for bags to clear. An evening landing is a hotel night, not a twilight hero story.',
    q2: 'Is Lauro worth a whole week?',
    a2: 'As the only course, no. As the near-airport round inside a week that also goes to Mijas or Cabopino, yes.'
  }),
  course({
    path: '/golf-courses/los-arqueros',
    name: 'Los Arqueros',
    metaTitle: 'Los Arqueros Golf Benahavis | GolfSol Ireland',
    title: 'Los Arqueros for Irish golf groups',
    subtitle: 'Los Arqueros in the Benahavís hills, a scenic and sloping round for Irish visitors based in the Marbella valley.',
    image: valley,
    alt: 'Hills above the Marbella golf valley, the setting for Los Arqueros.',
    blurb: 'Los Arqueros is a hill course in Benahavís. The views sell the afternoon. The gradient is why we ask about buggies before we ask about the tee. It gives a Marbella week a day that does not feel like another valley parkland.',
    suits: 'Confident holiday golfers who are happy in a buggy. Less suitable for a group that wants to walk every yard or that tires on back-to-back rounds.',
    watch: 'Mist and a steeper cart path are normal notes, not a surprise. Keep a valley course as the other day so a weather shift does not wipe the week.',
    baseLabel: 'Nueva Andalucía',
    basePath: '/golf-holidays/nueva-andalucia',
    transferLabel: 'AGP to Marbella',
    transferPath: '/transfers/malaga-airport-to-marbella',
    alsoLabel: 'La Quinta',
    alsoPath: '/golf-courses/la-quinta',
    q1: 'Do we need buggies at Los Arqueros?',
    a1: 'For almost every Irish society we take there, yes. Walkers should say so early because the hill is the course.',
    q2: 'Is Los Arqueros far from Puerto Banús?',
    a2: 'It is a hill drive, not a neighbouring fairway. A private transfer from a valley or Banús hotel is the sane way to arrive with four bags.'
  }),
  course({
    path: '/golf-courses/atalaya',
    name: 'Atalaya',
    metaTitle: 'Atalaya Golf Old and New Course | GolfSol Ireland',
    title: 'Atalaya Old and New for Irish groups',
    subtitle: 'Two Atalaya courses in the Benahavís and Estepona hills, so an Irish group can vary the week without a new town.',
    image: estepona,
    alt: 'Western hills between Benahavís and Estepona, where Atalaya sits.',
    blurb: 'Atalaya has an Old Course and a New Course in the hills between Benahavís and Estepona. Irish groups use the pair when they want two proper rounds from one western base and do not need both days to be famous names.',
    suits: 'Estepona and Benahavís stays. The Old and the New are different enough to count as two days. Say which one the stronger players should get.',
    watch: 'Hill courses and summer heat are a poor mix at 1pm. Morning tees, buggies, and water in the buggy are the adult plan.',
    baseLabel: 'Estepona holidays',
    basePath: '/golf-holidays/estepona',
    transferLabel: 'AGP to Estepona',
    transferPath: '/transfers/malaga-airport-to-estepona',
    alsoLabel: 'La Quinta',
    alsoPath: '/golf-courses/la-quinta',
    q1: 'Which Atalaya course is harder?',
    a1: 'Tell us the handicap mix and we will point the tougher morning at the lower handicaps. Booking “Atalaya” without Old or New is how the wrong layout gets held.',
    q2: 'Can we play Atalaya from a Marbella hotel?',
    a2: 'For one day, yes. For both courses, an Estepona or Benahavís base wastes less of the morning.'
  }),
  course({
    path: '/golf-courses/rio-real',
    name: 'Rio Real',
    metaTitle: 'Rio Real Golf Marbella | GolfSol Ireland',
    title: 'Rio Real golf for Irish visitors',
    subtitle: 'Rio Real on the east side of Marbella, a flatter course Irish groups use when they want golf near the beach hotels.',
    image: marbellaStay,
    alt: 'East Marbella, the beach side used with Rio Real.',
    blurb: 'Rio Real runs on the east side of Marbella, with the river and a flatter feel than the Benahavís hills. It suits Irish groups in beach hotels who still want a real course without a mountain transfer.',
    suits: 'Marbella weeks where the hotel is east or central, and mixed groups who walked a hill course the day before. It also pairs with Cabopino for two east-Marbella days.',
    watch: 'Flat is not the same as empty. Palm-season weeks still need a request. If the hotel is in Nueva Andalucía, Rio Real is a cross-town morning, so say which matters more.',
    baseLabel: 'Marbella holidays',
    basePath: '/golf-holidays/marbella',
    transferLabel: 'AGP to Marbella',
    transferPath: '/transfers/malaga-airport-to-marbella',
    alsoLabel: 'Cabopino',
    alsoPath: '/golf-courses/cabopino',
    q1: 'Is Rio Real a good society course?',
    a1: 'Yes for a mixed day on the east side of town. It should not be the only name on a flyer if the group came specifically for the valley clubs.',
    q2: 'Can non-golfers stay busy nearby?',
    a2: 'East Marbella and the beach are the point of this base. It is an easier partner day than a hill resort with one restaurant.'
  })
] as const

const originPages = [
  origin({
    path: '/golf-holidays-spain-from-galway',
    name: 'Galway',
    metaTitle: 'Costa del Sol Golf Holidays from Galway | GolfSol Ireland',
    title: 'Costa del Sol golf holidays from Galway',
    subtitle: 'Galway golfers heading to the Costa del Sol, usually via Shannon or Dublin, with the Málaga week planned before the clubs are packed.',
    image: fromShannon,
    alt: 'Planning a Costa del Sol golf trip for golfers leaving via Shannon.',
    airport: 'Shannon is the nearer major airport for most Galway golfers. Dublin is the backup when the Shannon week has no sensible Málaga seat. We do not publish a live timetable. Check the dates, then tell us which airport won.',
    plan: 'Once the flight is real, choose the coast to match the courses. A short Torremolinos arrival suits a late Shannon landing. A Sotogrande week needs an earlier touchdown because the van is a long one.',
    bags: 'Golf-bag rules are the airline’s, not ours. Confirm the fare from Shannon or Dublin before the society collects deposits. We meet the covers at Málaga.',
    airportLabel: 'Shannon departures',
    airportPath: '/golf-holidays-spain-from-shannon',
    q1: 'Is there a direct flight from Galway to Málaga?',
    a1: 'Plan on Shannon or Dublin. A connecting ticket can work for people. It is a worse day for travel covers. If a direct seasonal seat appears, send it and we will time the pickup.',
    q2: 'Which Costa del Sol base suits a Galway society?',
    a2: 'Marbella or La Cala for a first week. Sotogrande only if you have five nights and a morning arrival. Send the handicap mix and we will narrow it.'
  }),
  origin({
    path: '/golf-holidays-spain-from-limerick',
    name: 'Limerick',
    metaTitle: 'Costa del Sol Golf Holidays from Limerick | GolfSol Ireland',
    title: 'Costa del Sol golf holidays from Limerick',
    subtitle: 'Limerick golf clubs and four-balls flying from Shannon to Málaga, with transfers and courses arranged on the far side.',
    image: fromShannon,
    alt: 'Shannon departure planning for Limerick golfers going to Málaga.',
    airport: 'Limerick’s practical airport is Shannon, usually well under an hour from the city. This page is for the group in Limerick. The Shannon page is the flight briefing. Use both, then send one enquiry.',
    plan: 'Limerick societies often travel as one club. Rooming, buggies, and a single transfer company matter more than a sixth course. Pick three or four rounds and a base you can live with at night.',
    bags: 'A full Limerick society means a lot of covers. Tell us the number. The van on the Costa del Sol is chosen from that, not from a headcount alone.',
    airportLabel: 'From Shannon',
    airportPath: '/golf-holidays-spain-from-shannon',
    q1: 'Should Limerick groups fly from Dublin instead?',
    a1: 'Only when Shannon has no seat on the dates. Dublin adds a road or a connection and more ways to lose a travel cover. Start with Shannon.',
    q2: 'Can one person organise the Limerick trip with you?',
    a2: 'Yes. One captain, dates, numbers, and a preferred base. We reply with the coast plan. Members can still pay the club the way you already do.'
  }),
  origin({
    path: '/golf-holidays-spain-from-knock',
    name: 'Knock',
    metaTitle: 'Costa del Sol Golf Holidays from Knock | GolfSol Ireland',
    title: 'Costa del Sol golf holidays from Knock',
    subtitle: 'Ireland West Airport golfers researching Málaga: use a seasonal Knock flight when it exists, and Dublin or Shannon when it does not.',
    image: fromIreland,
    alt: 'Irish golfers planning a Málaga holiday from the west of Ireland.',
    airport: 'Ireland West Airport (Knock) sometimes has seasonal sun flights. It does not have a Málaga departure every week of the year. Check the exact week before anyone pays a hotel deposit. If Knock is empty, Dublin or Shannon is the honest backup.',
    plan: 'A Knock morning arrival into Málaga can still start a Marbella week the next day. A late or indirect arrival should not be promised an evening tee. We time the van to the flight that is booked, not the one you hoped for.',
    bags: 'Seasonal charters and scheduled airlines treat golf bags differently. Read the ticket. We only take responsibility once the covers reach Málaga arrivals.',
    airportLabel: 'From Shannon',
    airportPath: '/golf-holidays-spain-from-shannon',
    q1: 'Does Knock fly direct to Málaga all year?',
    a1: 'No. Treat a direct as a bonus for that week. If it is not on sale, position to Dublin or Shannon rather than waiting.',
    q2: 'Is Knock a bad start for a golf trip?',
    a2: 'Not when the flight exists and lands with enough day left. The Costa del Sol plan is the same. Only the Irish airport changes.'
  }),
  origin({
    path: '/golf-holidays-spain-from-kerry',
    name: 'Kerry',
    metaTitle: 'Costa del Sol Golf Holidays from Kerry | GolfSol Ireland',
    title: 'Costa del Sol golf holidays from Kerry',
    subtitle: 'Kerry golfers bound for the Costa del Sol, usually via Shannon or Dublin rather than a hope of a local Málaga flight.',
    image: fromShannon,
    alt: 'West of Ireland golfers routing toward a Málaga golf holiday.',
    airport: 'Kerry Airport is not the dependable Málaga departure. Most club trips position to Shannon or Dublin. Check Kerry first in case a useful seat exists, then book the airport that lets the travel covers travel with you.',
    plan: 'Add the road to Shannon into the story you tell members. A 6am Kerry leave for a Shannon flight is a long day before a Marbella van. Morning arrivals cope. Night arrivals should sleep in Torremolinos or Fuengirola before a west-coast base the next day.',
    bags: 'The fragile moment is the Irish connection, not the Costa del Sol road. One airline, one ticket, clubs in the same booking, is kinder than a self-connect with a tight window.',
    airportLabel: 'From Shannon',
    airportPath: '/golf-holidays-spain-from-shannon',
    q1: 'Can we fly Kerry to Málaga with golf clubs?',
    a1: 'Only if that week’s schedule and the airline’s bag rules say yes. Do not design the society around a route you have not seen on sale.',
    q2: 'What if half the Kerry group flies from Dublin?',
    a2: 'Tell us both flight numbers. We either hold one van or send two. Guessing in Málaga arrivals is the failure mode.'
  }),
  origin({
    path: '/golf-holidays-spain-from-waterford',
    name: 'Waterford',
    metaTitle: 'Costa del Sol Golf Holidays from Waterford | GolfSol Ireland',
    title: 'Costa del Sol golf holidays from Waterford',
    subtitle: 'Waterford golfers flying to Málaga from Dublin, with the Costa del Sol hotel and transfers planned as one job.',
    image: fromDublin,
    alt: 'Dublin departure planning for Waterford golfers going to Spain.',
    airport: 'Waterford Airport is not a Málaga base. Dublin is the normal departure, roughly a two-hour road depending on the town. Cork is the other look if a Munster seat suits the dates better. Check both, then lock one.',
    plan: 'Waterford clubs often want a straightforward society: four rounds, one hotel, one WhatsApp. Marbella or La Cala does that better than a new town every night. We will say which matches the handicaps.',
    bags: 'Leave margin for the Dublin bag drop. A tight road from Waterford plus a strict golf-bag desk is how people miss flights. The Málaga van is the easy half if the flight is calm.',
    airportLabel: 'From Dublin',
    airportPath: '/golf-holidays-spain-from-dublin',
    q1: 'Is Cork easier than Dublin from Waterford?',
    a1: 'Sometimes on the road, sometimes not on the fare. Compare the actual Málaga flight and the bag rule. Send us the winner.',
    q2: 'Do you only take people who live in Dublin?',
    a2: 'No. The ground arrangements in Spain are the same. The Irish airport is just how you arrive.'
  }),
  origin({
    path: '/golf-holidays-spain-from-sligo',
    name: 'Sligo',
    metaTitle: 'Costa del Sol Golf Holidays from Sligo | GolfSol Ireland',
    title: 'Costa del Sol golf holidays from Sligo',
    subtitle: 'Sligo golfers researching a Costa del Sol week, with Knock as the maybe and Dublin or Shannon as the reliable way to Málaga.',
    image: fromIreland,
    alt: 'Irish west-coast golfers planning a Costa del Sol trip.',
    airport: 'Knock is the nearest airport to Sligo, and it is only useful when that week has a Málaga flight worth taking. Dublin and Shannon are the scheduled fallbacks. The drive to either is part of the trip, so do not pretend it is a dawn hop.',
    plan: 'Sligo groups who already play links golf at home often want one dune day on the Costa del Sol, such as Cabopino, plus valley golf. Say that in the enquiry. We will not send you to five identical parklands.',
    bags: 'A long Irish positioning drive plus a connection is hard on travel covers. Prefer one ticket through to Málaga when you can.',
    airportLabel: 'From Knock',
    airportPath: '/golf-holidays-spain-from-knock',
    q1: 'What is the simplest Sligo routing?',
    a1: 'The one with a direct Málaga seat from Knock, Shannon, or Dublin on your dates. Simple beats clever. Send the option that keeps the clubs on the same booking.',
    q2: 'Is a Sligo society too far to bother?',
    a2: 'No. The Spain side does not care which county paid for the flights. Build a rest night if the Irish road plus the flight is brutal.'
  }),
  origin({
    path: '/golf-holidays-spain-from-donegal',
    name: 'Donegal',
    metaTitle: 'Costa del Sol Golf Holidays from Donegal | GolfSol Ireland',
    title: 'Costa del Sol golf holidays from Donegal',
    subtitle: 'Donegal golfers heading for Málaga, with an honest note on the long Irish road and a Costa del Sol plan that does not add another dawn transfer.',
    image: fromDublin,
    alt: 'Dublin connections used by Donegal golfers travelling to Málaga.',
    airport: 'Donegal groups usually reach Málaga through Dublin. Knock is worth a look if a seasonal flight matches the week. Either way, the day before the flight is long. Do not also book a Sotogrande tee for the evening you land.',
    plan: 'Sleep near the airport end of the Costa del Sol on night one if the landing is late, then move west the next morning. Or pick La Cala or Fuengirola and stay there. Donegal travellers have already done enough road.',
    bags: 'Label every cover. A Donegal-to-Dublin positioning leg is where bags get separated if people travel on different tickets. One booking, one flight number for us at Málaga.',
    airportLabel: 'From Dublin',
    airportPath: '/golf-holidays-spain-from-dublin',
    q1: 'Should Donegal groups overnight in Dublin?',
    a1: 'If the Málaga flight is early, yes. A 2am leave from Letterkenny to make a bag drop is how the trip starts badly. The Costa del Sol can wait half a day.',
    q2: 'What base saves a Donegal group from more driving?',
    a2: 'Fuengirola, La Cala, or a Torremolinos first night. Marbella is fine once you have slept. Sotogrande on a late landing is the one to avoid.'
  }),
  origin({
    path: '/golf-holidays-spain-from-derry',
    name: 'Derry',
    metaTitle: 'Costa del Sol Golf Holidays from Derry | GolfSol Ireland',
    title: 'Costa del Sol golf holidays from Derry',
    subtitle: 'Derry golfers flying to Málaga via Belfast or Dublin, then a private Costa del Sol transfer with the clubs.',
    image: fromBelfast,
    alt: 'Northern departure planning for Derry golfers going to the Costa del Sol.',
    airport: 'City of Derry Airport is not your Málaga departure. Belfast International or Dublin is. Belfast is often the shorter road. Dublin sometimes has the better fare or the better golf-bag rule. Compare both for the week you want.',
    plan: 'The Spain plan does not change because you started in Derry. Pick a base, a number of rounds, and one person to talk to us. Split arrivals from Belfast and Dublin are fine if we have both flight numbers.',
    bags: 'Read the Belfast or Dublin ticket for clubs. Two airlines in one day is where covers go missing. We collect whatever actually lands at AGP.',
    airportLabel: 'From Belfast',
    airportPath: '/golf-holidays-spain-from-belfast',
    q1: 'Is Belfast or Dublin better from Derry?',
    a1: 'Whichever flight keeps the group and the bags together at a civilised hour. There is no permanent winner. Send the one you can buy.',
    q2: 'Can a Derry four-ball book without a society?',
    a2: 'Yes. Four people, four covers, one vehicle, three or four nights. Use the four-ball page if that is the shape.'
  }),
  origin({
    path: '/golf-holidays-spain-from-wexford',
    name: 'Wexford',
    metaTitle: 'Costa del Sol Golf Holidays from Wexford | GolfSol Ireland',
    title: 'Costa del Sol golf holidays from Wexford',
    subtitle: 'Wexford clubs and four-balls leaving for Málaga via Dublin, with the golf week organised before you hit the M50.',
    image: fromDublin,
    alt: 'Dublin flights used by Wexford golfers for a Costa del Sol holiday.',
    airport: 'Wexford’s Málaga trip starts with a Dublin flight. Allow about two hours to the airport before you even think about a bag drop, and more if you are coming from the far south of the county. There is no useful local jet to AGP.',
    plan: 'Wexford societies like a clear four-round card. La Cala’s three courses plus one Mijas day does that from a single hotel. Marbella does it if the valley is the point. Tell us which photograph the captain keeps sending.',
    bags: 'The Dublin golf-bag desk in the morning is the stress. Arrive with time. Once you land, the private transfer is the calm part.',
    airportLabel: 'From Dublin',
    airportPath: '/golf-holidays-spain-from-dublin',
    q1: 'How early should Wexford golfers leave for Dublin Airport?',
    a1: 'Early enough for the road you actually have plus the airline’s bag cut-off. A Rosslare dawn is not a Gorey dawn. Build the leave time before you pick an 18:00 tee in Spain.',
    q2: 'Can partners who do not play come from Wexford too?',
    a2: 'Yes. Count them in the rooms and the van. A beach base makes their day easier than a hill resort.'
  }),
  origin({
    path: '/golf-holidays-spain-from-kilkenny',
    name: 'Kilkenny',
    metaTitle: 'Costa del Sol Golf Holidays from Kilkenny | GolfSol Ireland',
    title: 'Costa del Sol golf holidays from Kilkenny',
    subtitle: 'Kilkenny golfers on a Dublin-to-Málaga week, with courses and a private airport transfer set up before departure.',
    image: fromDublin,
    alt: 'Dublin Airport routing for Kilkenny golf holidays in Spain.',
    airport: 'Kilkenny to Dublin Airport is a straightforward road, often around an hour and a half depending on the town and the M9. That is your Málaga path. Cork is rarely the win from here unless the fare is wildly better.',
    plan: 'A Kilkenny four-ball can travel lighter than a 20-person society. You still need the same decisions: how many rounds, which coast, one hotel. We would rather plan three good courses than five rushed ones.',
    bags: 'Four covers fit a private van without drama. Twenty covers from a Kilkenny society need a proper count. Do not round down.',
    airportLabel: 'From Dublin',
    airportPath: '/golf-holidays-spain-from-dublin',
    q1: 'Is Dublin Airport the right call from Kilkenny?',
    a1: 'Almost always for Málaga. Check the bag rule on the fare, then send us the flight once it exists.',
    q2: 'What if our Kilkenny group is only four?',
    a2: 'Book it as a four-ball. You do not need society paperwork to get a transfer, a hotel shortlist, and tee-time requests.'
  }),
  origin({
    path: '/golf-holidays-spain-from-athlone',
    name: 'Athlone',
    metaTitle: 'Costa del Sol Golf Holidays from Athlone | GolfSol Ireland',
    title: 'Costa del Sol golf holidays from Athlone',
    subtitle: 'Athlone and midlands golfers choosing Shannon or Dublin for Málaga, then a Costa del Sol base that matches the landing time.',
    image: fromShannon,
    alt: 'Midlands golfers choosing between Shannon and Dublin for Málaga.',
    airport: 'Athlone can reach Shannon or Dublin in a similar kind of morning. Pick the airport with the better Málaga flight and the clearer golf-bag rule, not the one that is ten minutes closer on a map. Both work.',
    plan: 'Midlands groups sometimes split, half toward Shannon and half toward Dublin. That is allowed. It needs two flight numbers and a pickup plan that does not leave the first four standing outside AGP for ninety minutes.',
    bags: 'If you self-connect, leave a gap a golf bag can survive. Missed connections are how covers spend a night in Dublin while you are in Marbella.',
    airportLabel: 'From Shannon',
    airportPath: '/golf-holidays-spain-from-shannon',
    q1: 'Shannon or Dublin from Athlone?',
    a1: 'Whichever direct Málaga flight fits the group. Send us both options if you are stuck and we will tell you which landing time makes the Spain day easier.',
    q2: 'Can you meet two flights?',
    a2: 'Yes, if we know them. One van only works when the landings are close. Otherwise it is two vehicles.'
  }),
  origin({
    path: '/golf-holidays-spain-from-dundalk',
    name: 'Dundalk',
    metaTitle: 'Costa del Sol Golf Holidays from Dundalk | GolfSol Ireland',
    title: 'Costa del Sol golf holidays from Dundalk',
    subtitle: 'Dundalk golfers with Dublin on the doorstep and Belfast as the other Málaga option.',
    image: fromDublin,
    alt: 'East-coast Irish golfers leaving for a Costa del Sol holiday.',
    airport: 'Dundalk is close to Dublin Airport, so that is the default Málaga departure. Belfast is the alternative when the fare or the time is better. You should not need a positioning overnight for either.',
    plan: 'Because the Irish leg is short, you can spend the effort on the golf. A Nueva Andalucía week or a La Cala resort week is easier to explain to a Dundalk group than a moving coach tour.',
    bags: 'Proximity makes people late. The bag drop still closes when it closes. Leave Dundalk for the airline rule, not for a hopeful traffic guess.',
    airportLabel: 'From Dublin',
    airportPath: '/golf-holidays-spain-from-dublin',
    q1: 'Is Belfast worth it from Dundalk?',
    a1: 'Only for a clearly better flight. Dublin is the simple golf-bag day. Compare, then commit.',
    q2: 'What should a Dundalk four-ball ask for first?',
    a2: 'Dates, a coast (valley or La Cala), and whether you want three rounds or four. The transfer follows the hotel.'
  }),
  origin({
    path: '/golf-holidays-spain-from-mayo',
    name: 'Mayo',
    metaTitle: 'Costa del Sol Golf Holidays from Mayo | GolfSol Ireland',
    title: 'Costa del Sol golf holidays from Mayo',
    subtitle: 'Mayo golfers using Knock when a Málaga flight exists, and Shannon or Dublin when the week is ordinary.',
    image: fromIreland,
    alt: 'West of Ireland golf holiday planning for Mayo clubs.',
    airport: 'Knock is in Mayo, which sounds perfect and sometimes is. If Ireland West has no Málaga flight that week, Shannon or Dublin is the real plan. Castlebar, Ballina, and Westport do not all share the same dawn, so the leave time is local.',
    plan: 'Mayo clubs are used to weather. They still deserve a Costa del Sol week with a rain gap in the schedule, not seven rounds in six days. Three or four games is plenty if the Irish travel day was heavy.',
    bags: 'A seasonal Knock ticket can be stricter on sports equipment than a Dublin scheduled fare. Read it before you announce the trip in the club.',
    airportLabel: 'From Knock',
    airportPath: '/golf-holidays-spain-from-knock',
    q1: 'Do Mayo groups have to use Knock?',
    a1: 'No. Use Knock when the flight is there. Use Shannon or Dublin without apology when it is not.',
    q2: 'How many rounds should a Mayo society play?',
    a2: 'Four is a full week after a long travel day. Five is for people who asked for five. Tell us which you are.'
  }),
  origin({
    path: '/golf-holidays-spain-from-clare',
    name: 'Clare',
    metaTitle: 'Costa del Sol Golf Holidays from Clare | GolfSol Ireland',
    title: 'Costa del Sol golf holidays from Clare',
    subtitle: 'Clare golfers beside Shannon Airport, using that airport for Málaga and a single Costa del Sol plan on the other side.',
    image: fromShannon,
    alt: 'Shannon Airport departures for Clare golfers flying to Málaga.',
    airport: 'Shannon is in Clare. Ennis and the east of the county have the simplest golf-bag departure in Ireland when a Málaga flight is on the board. North and west Clare should still check the road time before booking a 6am bag drop. This page is the county note. The Shannon page is the flight note.',
    plan: 'Clare groups who play links at home often want one exposed day, then parkland. Cabopino plus the valley is a clean ask. La Cala is the resort version. Say which mood you want.',
    bags: 'You are close to the airport. The airline rule still applies. A Shannon fare that excludes a travel cover is not a bargain.',
    airportLabel: 'From Shannon',
    airportPath: '/golf-holidays-spain-from-shannon',
    q1: 'Is the Shannon page enough for Clare?',
    a1: 'For the flight, yes. Use this page if you want the golf shaped for a Clare group, then enquire once.',
    q2: 'Can Lahinch golfers skip a Costa del Sol links day?',
    a2: 'Yes. You already have wind at home. Many Clare groups prefer tree-lined valley golf and a warm evening. We will not force a dune course on you.'
  }),
  origin({
    path: '/golf-holidays-spain-from-tipperary',
    name: 'Tipperary',
    metaTitle: 'Costa del Sol Golf Holidays from Tipperary | GolfSol Ireland',
    title: 'Costa del Sol golf holidays from Tipperary',
    subtitle: 'Tipperary golfers split between Shannon and Dublin for Málaga, with one Costa del Sol itinerary either way.',
    image: fromShannon,
    alt: 'Shannon or Dublin routing for Tipperary golf trips to Spain.',
    airport: 'South and west Tipperary usually looks at Shannon. The north and east often look at Dublin. Neither is wrong. The wrong move is half the club on each flight with no one telling the transfer desk.',
    plan: 'Pick the airport, then pick the base. A Tipperary society of sixteen needs rooming and buggies more than a seventh course. We will keep the week readable.',
    bags: 'If the group splits across Shannon and Dublin, the bag rules may differ by airline. Check both. We can meet both landings at AGP when the times are known.',
    airportLabel: 'From Shannon',
    airportPath: '/golf-holidays-spain-from-shannon',
    q1: 'Which Tipperary towns should use Shannon?',
    a1: 'Closer to the west and south, Shannon is the natural bag day. Clonmel and the east should price Dublin as well. Send the town.',
    q2: 'Can you take a split group?',
    a2: 'Yes. Two flight numbers, one hotel, one set of tee requests. The vans follow the landings.'
  }),
  origin({
    path: '/golf-holidays-spain-from-westmeath',
    name: 'Westmeath',
    metaTitle: 'Costa del Sol Golf Holidays from Westmeath | GolfSol Ireland',
    title: 'Costa del Sol golf holidays from Westmeath',
    subtitle: 'Mullingar and Westmeath golfers choosing Dublin or Shannon for a Málaga golf week.',
    image: fromDublin,
    alt: 'Midlands to Dublin routing for a Costa del Sol golf holiday.',
    airport: 'Westmeath sits between the two useful airports. Mullingar often leans Dublin. Athlone leans either way, which is why Athlone has its own note. For the rest of the county, compare the actual Málaga flight rather than the habit of one airport.',
    plan: 'A Westmeath four-ball can decide faster than a committee. Dates, three or four rounds, valley or resort. We answer with a base and a transfer, not a 12-page brochure.',
    bags: 'Dublin’s bag drop is busy on society Saturdays. Shannon can be calmer and still wrong if the flight is indirect. Read the connection before you choose calm.',
    airportLabel: 'From Dublin',
    airportPath: '/golf-holidays-spain-from-dublin',
    q1: 'Is Westmeath different from the Athlone page?',
    a1: 'Athlone is the town that can truly choose either airport in one morning. The rest of Westmeath should start with Dublin unless Shannon’s flight is clearly better.',
    q2: 'What do you need from a Mullingar group?',
    a2: 'Dates, names or at least a headcount, handicap spread, and the flight once it exists. Course names can be a wish list.'
  })
] as const

const stylePages = [
  style({
    path: '/golf-holidays/for-couples',
    metaTitle: 'Costa del Sol Golf Holidays for Couples | GolfSol Ireland',
    eyebrow: 'Couples',
    title: 'Costa del Sol golf holidays for couples',
    subtitle: 'A Málaga golf break for two, whether you both play or one of you would rather have the morning off.',
    image: resort,
    alt: 'A Costa del Sol resort terrace suited to a couples golf holiday.',
    formTitle: 'Plan a couples break',
    lead: 'Tell us if both of you play, the dates, and whether you want resort quiet or a town at night.',
    first: 'A couples trip is not a society with two people. The pace is two rounds or three, a later breakfast if you want it, and a hotel that does not feel like a tour coach park. One private transfer from Málaga is enough. You do not need a convoy.',
    second: 'La Cala suits two players who both want golf on the doorstep. East Marbella and Rio Real suit a beach hotel. Nueva Andalucía suits two people who came to play. Sotogrande is the quiet luxury version if the longer van is acceptable.',
    third: 'Say who plays. If only one of you golfs, we will not fill every dawn. The non-golfer page is the longer version of that idea.',
    links: [
      'Non-golfers in the group — /golf-holidays/with-non-golfers',
      'La Cala — /golf-holidays/la-cala',
      'Luxury weeks — /golf-holidays/luxury',
      'Airport transfers — /transfers/malaga-airport-golf-transfers'
    ],
    q1: 'Can one person golf while the other does not?',
    a1: 'Yes. Book the rounds for one, the hotel for two, and the van for both plus one travel cover. A promenade or resort with a spa beats a hillside with nothing else.',
    q2: 'How many nights do couples usually stay?',
    a2: 'Four or five nights is the sweet spot from Ireland. Three can work with a morning flight. Seven is a holiday, not a break.'
  }),
  style({
    path: '/golf-holidays/for-seniors',
    metaTitle: 'Costa del Sol Golf Holidays for Seniors | GolfSol Ireland',
    eyebrow: 'Seniors',
    title: 'Costa del Sol golf holidays for seniors',
    subtitle: 'Irish senior groups who want buggies, earlier tees, fewer rounds, and a private transfer that does not involve a bus step.',
    image: group,
    alt: 'A small Irish golf group with bags, the pace senior weeks are planned around.',
    formTitle: 'Plan a senior week',
    lead: 'Send the age mix, who needs a buggy, the dates, and how many rounds feel right. Four is a fair starting answer.',
    first: 'Senior weeks fail when someone copies a 28-year-old society card: five rounds, hill walks, and a 1pm summer tee. We plan fewer games, buggies as a default question, and courses that do not require a mountain goat.',
    second: 'Campo Europa, El Chaparral, Valle Romano, and the flatter valley courses are kinder lists. La Quinta and Los Arqueros are optional scenic days, not the backbone. Avoid midday in July and August.',
    third: 'The airport van should be a step-in, not a climb with a travel cover. Tell us about knees and walking before we request tees, not after.',
    links: [
      'Campo Europa — /golf-courses/la-cala-campo-europa',
      'El Chaparral — /golf-courses/el-chaparral',
      'Summer planning — /golf-holidays/summer',
      'Good value weeks — /golf-holidays/good-value'
    ],
    q1: 'Do seniors have to take buggies?',
    a1: 'No. Many still walk. The question has to be asked per person. A hill course with no buggies left is a bad surprise at 8am.',
    q2: 'How many rounds are enough?',
    a2: 'Three or four in a week is a proper golf holiday. Five is for groups who asked for five and mean it.'
  }),
  style({
    path: '/golf-holidays/for-ladies',
    metaTitle: 'Ladies Costa del Sol Golf Holidays | GolfSol Ireland',
    eyebrow: 'Ladies golf',
    title: 'Ladies golf holidays on the Costa del Sol',
    subtitle: 'Irish ladies fours and societies, with forward tees, a sane round count, and transfers that treat travel covers properly.',
    image: group,
    alt: 'Golfers travelling as a group, the setup used for ladies society weeks.',
    formTitle: 'Plan a ladies trip',
    lead: 'Tell us if this is a four, a society, or a mixed group with a ladies day. Dates and handicap spread are enough to start.',
    first: 'A ladies week is a golf trip, not a themed weekend. The useful details are forward tees, a buggy option, a hotel that feels safe walking back after dinner, and a captain who is not translating five websites.',
    second: 'La Cala works because three courses sit together. El Chaparral and Campo Europa are friendly competition days. Las Brisas or Aloha can be the “we played that” day if the handicaps want it. We will not book Valderrama as a joke.',
    third: 'One person should enquire. We reply in plain English with the base, the courses we can request, and the van size for the covers.',
    links: [
      'La Cala — /golf-holidays/la-cala',
      'El Chaparral — /golf-courses/el-chaparral',
      'Society packages — /golf-packages/golf-society-packages',
      'From Ireland — /golf-holidays-spain-from-ireland'
    ],
    q1: 'Can a ladies four travel without a big society?',
    a1: 'Yes. Four players is a normal booking. You get the same airport meet and a smaller vehicle.',
    q2: 'Will tee times be on forward tees?',
    a2: 'Ask and we request them. Courses differ in what they hold. We will tell you what came back rather than assume.'
  }),
  style({
    path: '/golf-holidays/for-beginners',
    metaTitle: 'Beginner Friendly Costa del Sol Golf | GolfSol Ireland',
    eyebrow: 'Newer golfers',
    title: 'Costa del Sol golf for newer Irish golfers',
    subtitle: 'A first Costa del Sol trip for Irish players who can already get round 18 holes and do not want a championship lecture.',
    image: fairway,
    alt: 'An open Costa del Sol fairway suited to a first golf holiday.',
    formTitle: 'Plan a first golf trip',
    lead: 'Say how long you have been playing and whether 18 holes is comfortable. We will not put you on Valderrama to be impressive.',
    first: 'Beginner, on this page, means you can play 18 holes and keep up. It does not mean a first lesson. Holiday golf still has a tee time and other people behind you. If that is too much, say so and we will cut the rounds.',
    second: 'Start at Campo Europa, El Chaparral, or Valle Romano. Add one prettier or harder course only if the group wants the story. Lauro is the easy airport-side option if the flight lands and you want a gentle first day.',
    third: 'Travel covers, a buggy, and a hotel with a simple dinner matter more than a famous logo. Bring the handicap honestly, including 36.',
    links: [
      'Campo Europa — /golf-courses/la-cala-campo-europa',
      'El Chaparral — /golf-courses/el-chaparral',
      'Lauro — /golf-courses/lauro',
      'Value weeks — /golf-holidays/good-value'
    ],
    q1: 'What if someone has never played?',
    a1: 'Do not build their first 18 holes into a society tee sheet. A lesson at home first is kinder. They can still come and not play every day.',
    q2: 'Are buggies allowed for new golfers?',
    a2: 'On most holiday courses, yes, if you request them. Walking a strange course for five hours is how people stop enjoying it.'
  }),
  style({
    path: '/golf-holidays/with-non-golfers',
    metaTitle: 'Costa del Sol Golf Holiday with Non-Golfers | GolfSol Ireland',
    eyebrow: 'Mixed groups',
    title: 'Costa del Sol golf holidays with non-golfers',
    subtitle: 'Irish trips where some people play and some people do not, with a base that gives the non-golfers a day of their own.',
    image: resort,
    alt: 'A resort setting where non-golfers can spend the day while the group plays.',
    formTitle: 'Plan a mixed trip',
    lead: 'Tell us how many play, how many do not, and whether the non-golfers want a beach, a pool, or a town.',
    first: 'The mistake is booking a hill course with a locked resort and calling that a holiday for everyone else. Non-golfers need a pool, a beach, or a town they can walk. Golfers need a tee time that does not abandon them until dinner with no plan.',
    second: 'Fuengirola, Torremolinos, Benalmádena, and east Marbella are the easy mixed bases. La Cala can work if the resort itself is the entertainment. Sotogrande is quiet in a way some partners love and some find dull. Ask them.',
    third: 'Count every person in the van and only the players in the tee request. One enquiry covers both.',
    links: [
      'Couples — /golf-holidays/for-couples',
      'Fuengirola — /golf-holidays/fuengirola',
      'Torremolinos transfer — /transfers/malaga-airport-to-torremolinos',
      'Marbella — /golf-holidays/marbella'
    ],
    q1: 'Do non-golfers pay for the transfer?',
    a1: 'They take a seat, so yes, they are part of the vehicle price. They are not part of the green fee. We split the quote so that is obvious.',
    q2: 'Can the group play four days if partners are with them?',
    a2: 'You can. Many mixed trips play three and leave a full day free. Tell us which version your group will still be speaking after.'
  }),
  style({
    path: '/golf-holidays/luxury',
    metaTitle: 'Luxury Costa del Sol Golf Holidays | GolfSol Ireland',
    eyebrow: 'Luxury',
    title: 'Luxury Costa del Sol golf holidays from Ireland',
    subtitle: 'Private transfers, a serious hotel, and courses such as Finca Cortesin or a Valderrama request, without a coach tour.',
    image: resort,
    alt: 'A higher-end Costa del Sol stay used for luxury golf weeks.',
    formTitle: 'Plan a luxury week',
    lead: 'Dates, numbers, and whether the luxury is the hotel, the golf, or both. Those are different bills.',
    first: 'Luxury here means a private van, a hotel you would book anyway, and golf that is requested rather than grabbed. It does not mean a gold logo on a normal package. Finca Cortesin, a Sotogrande stay, or a Nueva Andalucía hotel beside Las Brisas are the real versions.',
    second: 'The long western transfer is part of a luxury week, not a surprise at the end of the quote. If you want the airport close, say so and we will keep the quality in the hotel instead of in a two-hour arrival.',
    third: 'Tell us the ceiling. We would rather shape a week you will pay for than send a fantasy and a discount.',
    links: [
      'Finca Cortesin — /golf-courses/finca-cortesin',
      'Sotogrande — /golf-holidays/sotogrande',
      'Valderrama — /golf-courses/valderrama',
      'Nueva Andalucía — /golf-holidays/nueva-andalucia'
    ],
    q1: 'Does luxury mean Valderrama every day?',
    a1: 'No. One requested marquee round is the grown-up version. The other days should still be good golf you can get.',
    q2: 'Are the transfers private?',
    a2: 'Yes for this brief. Shared shuttles and a luxury hotel are a mismatch when you are travelling with covers.'
  }),
  style({
    path: '/golf-holidays/good-value',
    metaTitle: 'Affordable Golf Holidays Spain | Great Value Golf Breaks',
    eyebrow: 'Good value',
    title: 'Affordable golf holidays in Spain',
    subtitle:
      'Good-value Costa del Sol golf holidays for Irish groups: a sensible hotel, real courses, and a private transfer, without a fake cheap famous club.',
    image: fairway,
    alt: 'A Costa del Sol course suited to a good-value Irish golf week.',
    formTitle: 'Request a golf holiday quote',
    lead: 'Send dates, headcount, and a rough budget per person if you have one. We will not invent a cheap famous club.',
    first: 'Cheap, on this coast, means a shorter airport run, a hotel that is comfortable rather than famous, and courses such as El Chaparral, Doña Julia, Campo Europa, or Lauro. It does not mean Valderrama at a made-up price, and it does not mean a shared shuttle with a pile of travel covers.',
    second: 'Torremolinos, Benalmádena, and Fuengirola keep the transfer shorter, so more of the money stays in the golf and the hotel. A three-night break with two or three rounds is a different bill from a seven-night week of marquee names. Estepona can still be good value when Doña Julia and Valle Romano are the card and the hotel is sensible.',
    third: 'Say what you refuse to cut. Some groups will drop a course. Some will not drop a buggy. A larger group can share one private vehicle. That is the saving. It is not an automatic half-price society rate.',
    links: [
      '3-night breaks — /golf-packages/3-night-golf-breaks',
      'Group holidays — /golf-packages/group-golf-holidays',
      'Costa del Sol — /golf-holidays/costa-del-sol',
      'All inclusive, explained — /golf-holidays/spain-all-inclusive'
    ],
    q1: 'What is a realistic way to spend less?',
    a1: 'Fewer marquee names, a base closer to the airport, and three or four rounds instead of five. The private transfer is rarely the line to delete if you have a pile of covers.',
    q2: 'Do you discount societies?',
    a2: 'The price follows dates and availability. A larger group can be easier to move, not automatically half price. We show the number before you commit.'
  }),
  style({
    path: '/golf-holidays/winter-sun',
    metaTitle: 'Winter Sun Golf Costa del Sol from Ireland | GolfSol Ireland',
    eyebrow: 'Winter sun',
    title: 'Winter sun golf holidays from Ireland',
    subtitle: 'November to February Costa del Sol golf for Irish players who want daylight and a realistic rain plan, not a summer promise.',
    image: fairway,
    alt: 'Cool-season light on a Costa del Sol fairway.',
    formTitle: 'Plan a winter trip',
    lead: 'Send the month, not just “winter”. November and February play differently. Include the group size.',
    first: 'Winter sun is a fair hope and a bad guarantee. The Costa del Sol in November to February is milder than Ireland and it still rains. Daylight is shorter. A four-round card with a spare half-day is smarter than a dawn-to-dark society.',
    second: 'You do not need Sotogrande’s two-hour van in January unless the courses are the point. La Cala, Mijas, and the valley are easier winter bases. Buggies still matter. Waterproofs still go in the bag.',
    third: 'Flights from Dublin and Shannon are often the simple ones. Check the fare’s golf-bag rule. Winter deals that ban a travel cover are not deals.',
    links: [
      'Best time of year — /guides/best-time-golf-costa-del-sol',
      'Autumn trips — /golf-holidays/autumn',
      'La Cala — /golf-holidays/la-cala',
      'From Dublin — /golf-holidays-spain-from-dublin'
    ],
    q1: 'Will it definitely be sunny?',
    a1: 'No. It is often pleasant and sometimes wet. Pack for both. We will not sell you a blue-sky contract.',
    q2: 'Is winter quieter for tee times?',
    a2: 'Often quieter than Easter and October, not empty. Christmas week and some February breaks still fill. Send the dates.'
  }),
  style({
    path: '/golf-holidays/easter',
    metaTitle: 'Easter Golf Holidays Costa del Sol | GolfSol Ireland',
    eyebrow: 'Easter',
    title: 'Easter golf holidays on the Costa del Sol',
    subtitle: 'Irish Easter breaks to Málaga, when schools are off, flights fill, and tee sheets need an earlier ask.',
    image: group,
    alt: 'A golf group travelling in a busy holiday week such as Easter.',
    formTitle: 'Plan an Easter break',
    lead: 'Send the Easter dates as soon as you know them, plus headcount. This week moves earlier than a random fortnight in November.',
    first: 'Easter is a real Irish travel week. Flights, hotel rooms, and the friendly courses all notice. It is a good time to play, with mild days more often than high summer, and a bad time to start planning in Holy Week.',
    second: 'La Cala and the valley courses are the ones that disappear first. Have a second course you will accept. A Torremolinos or Fuengirola hotel can still work if Marbella rooms have gone.',
    third: 'One organiser should enquire with dates and a rough number before members pay the club. We would rather say “too late for that course” in March than in the arrivals hall.',
    links: [
      'Spring and seasons — /guides/best-time-golf-costa-del-sol',
      'La Cala — /golf-holidays/la-cala',
      '4-night breaks — /golf-packages/4-night-golf-breaks',
      'From Ireland — /golf-holidays-spain-from-ireland'
    ],
    q1: 'How early should we ask for Easter?',
    a1: 'As soon as the group is real. Months, not days. Easter week is not a last-minute four-ball on the famous courses.',
    q2: 'Is Easter too busy to enjoy?',
    a2: 'Busy, not impossible. The groups who enjoy it picked a base and two backup courses. The groups who hate it wanted one specific tee and nothing else.'
  }),
  style({
    path: '/golf-holidays/autumn',
    metaTitle: 'Autumn Costa del Sol Golf Holidays | GolfSol Ireland',
    eyebrow: 'Autumn',
    title: 'Autumn golf holidays on the Costa del Sol',
    subtitle: 'September and October trips from Ireland, the months most societies mean when they say the best time to play.',
    image: fairway,
    alt: 'Autumn light on Costa del Sol golf country.',
    formTitle: 'Plan an autumn week',
    lead: 'Say September or October, the group size, and whether you need a society dinner. Those months fill.',
    first: 'September and October are the Irish society months for a reason. The heat has eased, the light is still decent, and the courses are in season. They are also when everyone else in Ireland has the same idea.',
    second: 'Marbella, La Cala, and Mijas all work. Book the marquee name first if you need one, then the hotel, then the friendly courses around it. A five-night stay fits four rounds without a forced fifth.',
    third: 'Dublin, Shannon, Cork, and Belfast pages cover the flight side. This page is the reason to travel in autumn rather than August.',
    links: [
      'Best time of year — /guides/best-time-golf-costa-del-sol',
      'Society packages — /golf-packages/golf-society-packages',
      '5-night holidays — /golf-packages/5-night-golf-holidays',
      'Marbella transfer — /transfers/malaga-airport-to-marbella'
    ],
    q1: 'Is October better than September?',
    a1: 'Both are strong. September can still be warm at midday. Late October has a shorter evening. Send the week you can actually fill with people.',
    q2: 'Do autumn trips need to be booked early?',
    a2: 'The well-known courses and the good hotels, yes. A flexible group can still move later. A named Las Brisas morning cannot.'
  }),
  style({
    path: '/golf-holidays/summer',
    metaTitle: 'Summer Costa del Sol Golf Holidays | GolfSol Ireland',
    eyebrow: 'Summer',
    title: 'Summer golf holidays on the Costa del Sol',
    subtitle: 'June to August golf from Ireland, built around early tees, buggies, and a plan for the heat.',
    image: fairway,
    alt: 'Bright summer conditions on a Costa del Sol fairway.',
    formTitle: 'Plan a summer trip',
    lead: 'Tell us the month. June and late August are not the same heat as the middle of July. Include who struggles in it.',
    first: 'Summer golf on this coast is an early-morning sport. A 1pm tee in July is how a holiday becomes an ordeal. We ask for the first wave, buggies, and a base where the afternoon can be a pool rather than another 18.',
    second: 'Twilight can work for a second game if the group wants it and the course allows it. It is not a magic fix for a badly timed week. Hill courses at noon are the ones to refuse.',
    third: 'Irish summer flights are busy because of families as well as golfers. Fix the flight, then the early tees, then the hotel with air conditioning you have actually asked about.',
    links: [
      'Twilight golf — /twilight-golf',
      'Best time of year — /guides/best-time-golf-costa-del-sol',
      'Senior pacing — /golf-holidays/for-seniors',
      'Transfer times — /guides/malaga-airport-golf-transfer-times'
    ],
    q1: 'Is July a bad idea?',
    a1: 'It is a bad idea at midday. It can be a good idea at 7:30am with a buggy and the afternoon off. If the group will not start early, choose June, September, or October.',
    q2: 'Do we need twilight?',
    a2: 'Only if you want two slots or a cooler evening round. One proper morning game is enough for most summer days.'
  }),
  style({
    path: '/golf-holidays/four-ball',
    metaTitle: 'Costa del Sol Four-Ball Golf Holidays | GolfSol Ireland',
    eyebrow: 'Four-ball',
    title: 'Four-ball golf holidays on the Costa del Sol',
    subtitle: 'Four Irish golfers, four travel covers, one private transfer, and a short list of courses instead of a society machine.',
    image: '/images/customer-trips/bags-at-the-kerb.jpg',
    alt: 'Three golfers with travel covers beside a van, the scale of a small-group Costa del Sol trip.',
    formTitle: 'Plan our four-ball',
    lead: 'Dates, the four names if you have them, and whether you want Marbella, La Cala, or “you tell us”.',
    first: 'A four-ball does not need a society constitution. It needs a vehicle that takes four covers, a hotel with two twins or two doubles, and three or four tee times. We plan that without pretending you are a party of twenty.',
    second: 'Nueva Andalucía is the easy golf base. La Cala is the easy resort base. Estepona is the quieter version. One airport meet at Málaga and one return is the whole transfer story unless you want course-to-course help.',
    third: 'Send the flight when you have it. If two of you fly from Dublin and two from Cork, say so at the start.',
    links: [
      'Holiday with transfers — /golf-holidays/with-airport-transfers',
      'Nueva Andalucía — /golf-holidays/nueva-andalucia',
      'La Cala — /golf-holidays/la-cala',
      'Meet and greet — /transfers/malaga-airport-meet-and-greet'
    ],
    q1: 'Is a four-ball too small to bother you with?',
    a1: 'No. Four covers are exactly why a normal taxi is the wrong tool. It is one of the cleanest trips we run.',
    q2: 'How many rounds should four people play?',
    a2: 'Three or four. Leave an afternoon free. You will use it, even if the group chat says you will not.'
  }),
  style({
    path: '/golf-holidays/spain-all-inclusive',
    metaTitle: 'All Inclusive Golf Holidays Spain | GolfSol Ireland',
    eyebrow: 'All inclusive',
    title: 'All inclusive golf holidays in Spain',
    subtitle:
      'What all inclusive means for an Irish golf trip to Spain, and what GolfSol Ireland actually arranges: hotels, requested tee times, and Málaga transfers.',
    image: resort,
    alt: 'A Costa del Sol hotel used when planning a golf stay with breakfast and transfers.',
    formTitle: 'Request a golf holiday quote',
    lead: 'Dates, how many of you, and whether you want breakfast with the golf and the transfer. We will say what is in the quote and what is not.',
    first: 'We do not sell a resort wristband holiday with unlimited meals, drinks, and flights. That is a different product. What we build is a golf package: a place to stay, the rounds you want requested, and a private transfer from Málaga Airport that can take the covers. If a hotel includes breakfast, we say breakfast. If dinner is on you, we say that too.',
    second: 'Torremolinos, Benalmádena, Fuengirola, and La Cala are the bases where a hotel breakfast and a shorter transfer keep the week simple. Marbella and Sotogrande can still include golf and a transfer, but that bill is not an all-inclusive rate. Drinks, buggies, and the flight stay out of the package unless a hotel rate we have actually checked includes them.',
    third: 'Send the dates and the headcount, and say if breakfast matters. We would rather send a clear stay-and-play quote than dress a normal week up as all inclusive.',
    links: [
      'Affordable weeks — /golf-holidays/good-value',
      'Holiday with transfers — /golf-holidays/with-airport-transfers',
      'Costa del Sol — /golf-holidays/costa-del-sol',
      'Flights, booked by you — /golf-holidays/spain-including-flights'
    ],
    q1: 'Does all inclusive include flights?',
    a1: 'No. You book the flight. We meet you at Málaga and run the hotel, the golf requests, and the transfer.',
    q2: 'Are meals included?',
    a2: 'Only when the hotel rate in the quote includes them, usually breakfast. We do not sell unlimited food and drink. If you want dinner included, say so, and we will only promise it when the hotel offers it.'
  }),
  style({
    path: '/golf-holidays/spain-including-flights',
    metaTitle: 'Golf Holidays Spain Including Flights | Options for Irish Golfers',
    eyebrow: 'Flights',
    title: 'Golf holidays in Spain, with flights booked by you',
    subtitle:
      'GolfSol Ireland does not sell flights. Irish golfers book the airline ticket, then we arrange the Costa del Sol hotel, golf, and airport transfer.',
    image: fromIreland,
    alt: 'Irish golfers planning a Costa del Sol trip after they have booked their own flights.',
    formTitle: 'Request a golf holiday quote',
    lead: 'Send your dates, group size, and the airport you expect to leave from. Do not send us a fare to book. We plan the Costa del Sol side.',
    first: 'Flights are not included. We are not an airline and we do not sell tickets. A golf holiday from Ireland still starts with a seat into Málaga. You buy that ticket. We plan what happens after you land: the meet, the hotel, the courses, and the vehicle that takes the bags.',
    second: 'Dublin, Cork, Shannon, and Belfast are the usual departures. Galway, Limerick, and Clare often use Shannon. Knock, Kerry, and several other counties do not have a local Málaga flight every week, so the Ireland pages say which airport is real. We do not publish fares, timetables, or airline partnerships. Check the golf-bag rule before you pay for a fare that will not take a travel cover.',
    third: 'When the flight is real, send the landing time, the group size, and how many rounds. We build the ground package around that arrival. If two of you fly from Dublin and two from Cork, say so at the start.',
    links: [
      'From Ireland — /golf-holidays-spain-from-ireland',
      'From Dublin — /golf-holidays-spain-from-dublin',
      'Málaga transfers — /transfers/malaga-airport-golf-transfers',
      'Enquire — /contact'
    ],
    q1: 'Can you add flights to the package?',
    a1: 'No. Book the flight yourself. Tell us the arrival time and we will be at Málaga with a vehicle that takes the covers.',
    q2: 'Which airport do we fly into?',
    a2: 'Málaga, AGP, for a Costa del Sol golf week. We will not route you through a different Spanish airport and call it the same trip.'
  }),
  style({
    path: '/golf-holidays/best-spain',
    metaTitle: 'Best Golf Holidays Spain | Costa del Sol Golf Breaks',
    eyebrow: 'Compare',
    title: 'The best golf holiday in Spain is the week that fits',
    subtitle:
      'How Irish golfers compare a Spain golf holiday: base, courses, group size, and trip length, on the Costa del Sol coast we actually plan.',
    image: fairway,
    alt: 'A Costa del Sol fairway used to compare different kinds of golf holiday.',
    formTitle: 'Request a golf holiday quote',
    lead: 'Tell us who is travelling, how many nights you have, and whether the priority is the courses, the hotel, or a short airport run.',
    first: 'Best is the week the people going will still enjoy on day four. It is not a league table, and it is not a claim that we are the best operator in Spain. A four-ball that wants Nueva Andalucía is a different trip from a society that wants La Cala, or a couple that wants one serious round and a quiet hotel.',
    second: 'Marbella and the golf valley suit several courses close together. Fuengirola, Benalmádena, and Torremolinos suit a shorter run from Málaga Airport. Estepona and Sotogrande suit a quieter week if you accept the longer transfer. Luxury and a good-value week are different bills, not different slogans.',
    third: 'Pick the length before the course names. Three nights for a long weekend, five for most societies, seven if you want rest days. Then send dates and numbers. We shortlist a hotel area and request the tee times. A request is not a confirmed tee.',
    links: [
      'Marbella — /golf-holidays/marbella',
      'Fuengirola — /golf-holidays/fuengirola',
      'Course guide — /guides/best-golf-courses-costa-del-sol',
      'Packages — /golf-packages'
    ],
    q1: 'Are you the best golf holiday company in Spain?',
    a1: 'We will not say that. We are an Irish team for Costa del Sol trips. The useful question is whether the week we propose fits your group.',
    q2: 'Is the Costa del Sol the only good golf in Spain?',
    a2: 'No. It is the coast we know, and the one most Irish groups mean when they ask for Spain. If you want a different region, we are the wrong desk.'
  }),
  style({
    path: '/golf-holidays/spain-2027',
    metaTitle: 'Golf Holidays Spain 2027 | Late 2026 Dates Still Open',
    eyebrow: '2027',
    title: 'Golf holidays in Spain for 2027, and what is left of 2026',
    subtitle:
      'Plan a Costa del Sol golf holiday for 2027, or a November and December 2026 trip. Dates, courses, and transfers for Irish groups. No invented fares.',
    image: fairway,
    alt: 'Costa del Sol golf country in the kind of light Irish groups plan a winter or spring trip around.',
    formTitle: 'Request a golf holiday quote',
    lead: 'Send the month and the year, the group size, and whether the dates are fixed or still a hope.',
    first: '2026 is nearly done. What is still worth planning is November and December: shorter days, a real chance of rain, and often a quieter sheet than Easter. That can be a sound winter trip if the group will not demand sunshine. 2027 is the year to plan properly. Easter, early summer, and September and October are the weeks Irish societies actually fill.',
    second: 'Do not wait until the month of travel for a named course in a busy 2027 week. For late 2026, a base closer to Málaga Airport is kinder than a long Sotogrande run after dark. La Cala, Mijas, and the valley still make sense. We request tee times. We do not guarantee them, and we do not publish flight prices.',
    third: 'One page covers both years on purpose. A separate 2026 copy would repeat the winter and autumn pages with a different title. Use this page to pick the year, then the season page if you need the detail.',
    links: [
      'Winter sun — /golf-holidays/winter-sun',
      'Easter — /golf-holidays/easter',
      'Autumn — /golf-holidays/autumn',
      'Best time of year — /guides/best-time-golf-costa-del-sol'
    ],
    q1: 'Is it too late for 2026?',
    a1: 'For a famous course at Easter 2026, that week has gone. For November or December 2026, send the dates. Some weeks still work. Some do not. We will say which.',
    q2: 'Should we book 2027 now?',
    a2: 'If the group has dates, yes, especially Easter and September or October. If you only have a wish, send the month and the size and we will tell you what is realistic.'
  })
] as const

export const seoIrelandSearchPages: Record<string, GeContentPageData> = Object.fromEntries([
  ...coursePages,
  ...originPages,
  ...stylePages
])
