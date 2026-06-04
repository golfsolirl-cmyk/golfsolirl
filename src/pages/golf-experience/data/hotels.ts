/**
 * Curated Costa del Sol hotels — the seven properties most popular with
 * Irish golf groups travelling to Fuengirola, Torremolinos, Marbella and
 * the wider Sol corridor. All cards link to #enquire so visitors can
 * request a tailored stay-and-play quote per property.
 */

export interface GeHotel {
  readonly name: string
  readonly area: string
  /** Star rating shown beneath the hotel photo on the card. */
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

/** Card art — Costa del Sol resort / stay photography (`public/images/hotels/`). Regenerate: `node scripts/generate-hotel-card-images.mjs` */
export const hotelsSpain: readonly GeHotel[] = [
  {
    name: 'Hotel Angela',
    area: 'Fuengirola',
    stars: 4,
    tagline: 'Beachfront 4★ on Paseo Marítimo · adults-friendly buzz',
    nearestCourse: '15 min · Mijas Golf',
    image: '/images/hotels/hotel-angela.webp',
    href: '/contact'
  },
  {
    name: 'Hotel Yaramar',
    area: 'Fuengirola',
    stars: 4,
    tagline: 'Adults-only seafront retreat with rooftop pool',
    nearestCourse: '15 min · Mijas Golf',
    image: '/images/hotels/hotel-yaramar.webp',
    href: '/contact'
  },
  {
    name: 'Ilunion Fuengirola',
    area: 'Fuengirola',
    stars: 4,
    tagline: 'Modern 4★ steps from the marina and Sohail castle',
    nearestCourse: '12 min · Santana Golf',
    image: '/images/hotels/hotel-ilunion-fuengirola.webp',
    href: '/contact'
  },
  {
    name: 'Hotel Riu Costa del Sol',
    area: 'Torremolinos',
    stars: 4,
    tagline: 'All-inclusive favourite right on La Carihuela beach',
    nearestCourse: '8 min · Parador Málaga Golf',
    image: '/images/hotels/hotel-riu-costa-del-sol.webp',
    href: '/contact'
  },
  {
    name: 'Hotel Don Pablo',
    area: 'Torremolinos',
    stars: 4,
    tagline: 'Iconic palm-fringed pool deck · group rates that work',
    nearestCourse: '10 min · Parador Málaga Golf',
    image: '/images/hotels/hotel-don-pablo.webp',
    href: '/contact'
  },
  {
    name: 'Sol Timor Apartamentos',
    area: 'Torremolinos',
    stars: 3,
    tagline: 'Apartment-style stays for societies and big groups',
    nearestCourse: '10 min · Parador Málaga Golf',
    image: '/images/hotels/hotel-sol-timor.webp',
    href: '/contact'
  },
  {
    name: 'Ocean House Costa del Sol',
    area: 'Torremolinos',
    stars: 4,
    tagline: 'Boutique adults-only on the seafront promenade',
    nearestCourse: '8 min · Parador Málaga Golf',
    image: '/images/hotels/hotel-ocean-house.webp',
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
    image: '/images/hotels/hotel-sunset-beach-club.webp',
    href: 'https://www.sunsetbeachclub.com/en'
  }
] as const satisfies readonly GeHotel[]
