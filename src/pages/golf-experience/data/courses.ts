/**
 * Costa del Sol courses we send Irish groups to most often.
 * Strictly the Málaga – Sotogrande corridor — no destinations outside
 * the Sol. Each card opens an enquiry to design a tee-time package.
 */

export interface GeCourse {
  readonly name: string
  /** Short marketing line for the card. */
  readonly description: string
  /** Town / area shown in a green chip on the upgraded card. */
  readonly area: string
  /** Difficulty / character chip — drives the second small badge. */
  readonly badge: string
  readonly image: string
  readonly href: string
}

/** Card art — hosted brand photography in `public/images/` (CSP-safe on production). */
export const coursesSpain: readonly GeCourse[] = [
  {
    name: 'Real Club Valderrama',
    area: 'Sotogrande',
    badge: 'Tournament-tough',
    description:
      'Routinely ranked Europe’s number-one course and host of the 1997 Ryder Cup. A bucket-list round and a story you’ll dine out on for years.',
    image: '/images/ge-premium-golf-fairway-coastal.png',
    href: '/contact'
  },
  {
    name: 'Finca Cortesín',
    area: 'Casares',
    badge: '2023 Solheim Cup',
    description:
      'Cabell Robinson masterpiece of width, elevation and pure Bermuda greens. Hosted the 2023 Solheim Cup and three Volvo World Match Plays.',
    image: '/images/twilight-golf-hero.jpg',
    href: '/contact'
  },
  {
    name: 'La Reserva de Sotogrande',
    area: 'Sotogrande',
    badge: 'Resort luxury',
    description:
      'A Cabell Robinson layout draped over rolling Andalusian hills with sea and mountain views from almost every tee. Pristine conditioning year-round.',
    image: '/images/hero-fleet-golf-golden-hour.png',
    href: '/contact'
  },
  {
    name: 'Real Club de Golf Sotogrande',
    area: 'Sotogrande',
    badge: 'Trent Jones classic',
    description:
      'The original Robert Trent Jones Sr. design that put the Costa del Sol on the golfing map back in 1964. Tree-lined, classical, demanding.',
    image: '/images/ge-premium-golf-group-testimonial.png',
    href: '/contact'
  },
  {
    name: 'Los Naranjos Golf Club',
    area: 'Marbella',
    badge: 'Group favourite',
    description:
      'Stunning orange-tree lined fairways in the heart of Nueva Andalucía’s “Golf Valley”. A long-time favourite with Irish societies — fair and fun.',
    image: '/images/hero-malaga-fleet-golden-hour.png',
    href: '/contact'
  },
  {
    name: 'La Quinta Golf & Country Club',
    area: 'Benahavís · Marbella',
    badge: 'Manuel Piñero design',
    description:
      'Three loops of nine wandering through the foothills above Puerto Banús — flexible itineraries, dramatic mountain backdrops, top-tier conditioning.',
    image: '/images/ge-premium-golf-club-rental-hero.png',
    href: '/contact'
  }
] as const
