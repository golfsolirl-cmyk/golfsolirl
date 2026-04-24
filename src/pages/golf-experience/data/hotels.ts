/**
 * Curated Costa del Sol hotels — the seven properties most popular with
 * Irish golf groups travelling to Fuengirola, Torremolinos, Marbella and
 * the wider Sol corridor. All cards link to #enquire so visitors can
 * request a tailored stay-and-play quote per property.
 */

export interface GeHotel {
  readonly name: string
  readonly area: string
  /** Star rating shown as a small gold pill on the card. */
  readonly stars: 3 | 4 | 5
  /** Optional editorial badge for standout properties. */
  readonly badge?: string
  /** Strong green frame on the card (homepage / listings). */
  readonly highlight?: boolean
  /** One-line USP shown beneath the area on the upgraded card. */
  readonly tagline: string
  /** Distance to nearest Costa del Sol golf cluster, shown as a chip. */
  readonly nearestCourse: string
  readonly image: string
  readonly href: string
}

export const hotelsSpain: readonly GeHotel[] = [
  {
    name: 'Hotel Angela',
    area: 'Fuengirola',
    stars: 4,
    tagline: 'Beachfront 4★ on Paseo Marítimo · adults-friendly buzz',
    nearestCourse: '15 min · Mijas Golf',
    image:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    href: '/contact'
  },
  {
    name: 'Hotel Yaramar',
    area: 'Fuengirola',
    stars: 4,
    tagline: 'Adults-only seafront retreat with rooftop pool',
    nearestCourse: '15 min · Mijas Golf',
    image:
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    href: '/contact'
  },
  {
    name: 'Ilunion Fuengirola',
    area: 'Fuengirola',
    stars: 4,
    tagline: 'Modern 4★ steps from the marina and Sohail castle',
    nearestCourse: '12 min · Santana Golf',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    href: '/contact'
  },
  {
    name: 'Hotel Riu Costa del Sol',
    area: 'Torremolinos',
    stars: 4,
    tagline: 'All-inclusive favourite right on La Carihuela beach',
    nearestCourse: '8 min · Parador Málaga Golf',
    image:
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
    href: '/contact'
  },
  {
    name: 'Hotel Don Pablo',
    area: 'Torremolinos',
    stars: 4,
    tagline: 'Iconic palm-fringed pool deck · group rates that work',
    nearestCourse: '10 min · Parador Málaga Golf',
    image:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    href: '/contact'
  },
  {
    name: 'Sol Timor Apartamentos',
    area: 'Torremolinos',
    stars: 3,
    tagline: 'Apartment-style stays for societies and big groups',
    nearestCourse: '10 min · Parador Málaga Golf',
    image:
      'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=1200&q=80',
    href: '/contact'
  },
  {
    name: 'Ocean House Costa del Sol',
    area: 'Torremolinos',
    stars: 4,
    tagline: 'Boutique adults-only on the seafront promenade',
    nearestCourse: '8 min · Parador Málaga Golf',
    image:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    href: '/contact'
  },
  {
    name: 'Sunset Beach Club',
    area: 'Benalmadena',
    stars: 4,
    badge: 'Highly recommended',
    highlight: true,
    tagline: 'Seafront 4* hotel-apartments with spacious suites for golf groups',
    nearestCourse: '20 min · Torrequebrada Golf',
    image:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    href: 'https://www.sunsetbeachclub.com/en'
  }
] as const satisfies readonly GeHotel[]
