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

/** Card art: Unsplash “golf course” hits — fairways, greens, or on-course play; one distinct image per card. */
export const coursesSpain: readonly GeCourse[] = [
  {
    name: 'Real Club Valderrama',
    area: 'Sotogrande',
    badge: 'Tournament-tough',
    description:
      'Routinely ranked Europe’s number-one course and host of the 1997 Ryder Cup. A bucket-list round and a story you’ll dine out on for years.',
    image:
      'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1200&q=80',
    href: '/contact'
  },
  {
    name: 'Finca Cortesín',
    area: 'Casares',
    badge: '2023 Solheim Cup',
    description:
      'Cabell Robinson masterpiece of width, elevation and pure Bermuda greens. Hosted the 2023 Solheim Cup and three Volvo World Match Plays.',
    image:
      'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80',
    href: '/contact'
  },
  {
    name: 'La Reserva de Sotogrande',
    area: 'Sotogrande',
    badge: 'Resort luxury',
    description:
      'A Cabell Robinson layout draped over rolling Andalusian hills with sea and mountain views from almost every tee. Pristine conditioning year-round.',
    image:
      'https://images.unsplash.com/photo-1623567341691-1f47b5cf949e?auto=format&fit=crop&w=1200&q=80',
    href: '/contact'
  },
  {
    name: 'Real Club de Golf Sotogrande',
    area: 'Sotogrande',
    badge: 'Trent Jones classic',
    description:
      'The original Robert Trent Jones Sr. design that put the Costa del Sol on the golfing map back in 1964. Tree-lined, classical, demanding.',
    image:
      'https://images.unsplash.com/photo-1592937238247-cd0090e02f65?auto=format&fit=crop&w=1200&q=80',
    href: '/contact'
  },
  {
    name: 'Los Naranjos Golf Club',
    area: 'Marbella',
    badge: 'Group favourite',
    description:
      'Stunning orange-tree lined fairways in the heart of Nueva Andalucía’s “Golf Valley”. A long-time favourite with Irish societies — fair and fun.',
    image:
      'https://images.unsplash.com/photo-1587205476864-4a5a195167b4?auto=format&fit=crop&w=1200&q=80',
    href: '/contact'
  },
  {
    name: 'La Quinta Golf & Country Club',
    area: 'Benahavís · Marbella',
    badge: 'Manuel Piñero design',
    description:
      'Three loops of nine wandering through the foothills above Puerto Banús — flexible itineraries, dramatic mountain backdrops, top-tier conditioning.',
    image:
      'https://images.unsplash.com/photo-1709525616662-8d9f9a995ceb?auto=format&fit=crop&w=1200&q=80',
    href: '/contact'
  }
] as const
