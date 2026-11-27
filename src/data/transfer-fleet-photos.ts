export type TransferFleetPhoto = {
  readonly src: string
  readonly caption: string
  readonly alt: string
  /** True when the frame clearly shows a passenger van / people carrier / minibus. */
  readonly showsVan: boolean
}

/**
 * Real Golf Sol Ireland transfer & fleet photos found under `public/images/`.
 * Prefer customer-trip vans and verified fleet stills — skip composite “sample” banners
 * that bake marketing copy into the image.
 */
export const TRANSFER_FLEET_PHOTOS: readonly TransferFleetPhoto[] = [
  {
    src: '/images/customer-trips/van-doors-open.jpg',
    caption: '8-seater ready',
    alt: 'White Golf Sol Ireland group van with passenger and rear doors open at La Reserva Club.',
    showsVan: true
  },
  {
    src: '/images/customer-trips/van-at-la-reserva.jpg',
    caption: 'At the clubhouse',
    alt: 'White Golf Sol Ireland passenger van parked at La Reserva Club with doors open.',
    showsVan: true
  },
  {
    src: '/images/customer-trips/bags-at-the-kerb.jpg',
    caption: 'Bags at the kerb',
    alt: 'Three golfers with travel covers beside the Golf Sol van on a Costa del Sol street.',
    showsVan: true
  },
  {
    src: '/images/customer-trips/van-to-buggy.jpg',
    caption: 'Van to buggy',
    alt: 'Golf bags moving from the transfer van onto a buggy at the clubhouse.',
    showsVan: true
  },
  {
    src: '/images/customer-trips/sunset-bag-drop.jpg',
    caption: 'Last-light drop-off',
    alt: 'Golfers unloading bags from the transfer van beside a clubhouse at sunset.',
    showsVan: true
  },
  {
    src: '/images/customer-trips/la-reserva-group.jpg',
    caption: 'Irish group van',
    alt: 'An Irish golf group beside the white Golf Sol van at La Reserva Club.',
    showsVan: true
  },
  {
    src: '/images/homepage-hero-van.jpg',
    caption: 'Arrivals pickup',
    alt: 'Branded Golf Sol Ireland Mercedes van waiting outside an Arrivals terminal with luggage ready.',
    showsVan: true
  },
  {
    src: '/images/golfsol-fleet-sunny-costa-del-sol.webp',
    caption: 'Sunny fleet lineup',
    alt: 'Golf Sol Ireland Mercedes V-Class, saloon and Sprinter minibus lined up beside a Costa del Sol fairway.',
    showsVan: true
  },
  {
    src: '/images/fleet-golden-hour-rebranded.png',
    caption: 'Golden-hour fleet',
    alt: 'Branded Golf Sol Ireland fleet — people carrier, executive car and group minibus — at golden hour.',
    showsVan: true
  },
  {
    src: '/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.webp',
    caption: 'Fairway fleet',
    alt: 'Golf Sol Ireland transfer vehicles lined up on a Costa del Sol fairway with mountain backdrop.',
    showsVan: true
  },
  {
    src: '/images/hero-malaga-fleet-golden-hour.png',
    caption: 'Málaga corridor',
    alt: 'Golf Sol Ireland transfer fleet photographed at golden hour for the Málaga airport corridor.',
    showsVan: true
  },
  {
    src: '/images/transfers/golf-group-transfers.webp',
    caption: 'Group transfers',
    alt: 'Golf group transfer vehicles ready for Costa del Sol hotel and course runs.',
    showsVan: true
  },
  {
    src: '/images/transfers/malaga-airport-golf-transfers.webp',
    caption: 'AGP golf transfers',
    alt: 'Málaga Airport golf transfer vehicle for Irish groups heading to the Costa del Sol.',
    showsVan: true
  }
] as const

/** Meet & greet arrivals still — professional waiting in the hall with golf bags. */
export const MEET_AND_GREET_FEATURE_PHOTO = {
  src: '/images/transport-moment-arrivals.webp',
  caption: 'Met in arrivals',
  alt: 'Smartly dressed chauffeur waiting in Málaga AGP arrivals with a luggage trolley loaded with golf bags.'
} as const

/** Primary kerbside proof photo for the Meet & Greet band. */
export const MEET_AND_GREET_KERB_PHOTO = {
  src: '/images/customer-trips/bags-at-the-kerb.jpg',
  caption: 'Friendly Irish crew',
  alt: 'Three golfers with travel bags beside the Golf Sol van on a Costa del Sol street.'
} as const

/** Compact set for the homepage Meet & Greet feature mosaic. */
export const MEET_AND_GREET_HOME_FLEET_PHOTOS = TRANSFER_FLEET_PHOTOS.filter((photo) =>
  [
    '/images/customer-trips/van-doors-open.jpg',
    '/images/customer-trips/van-at-la-reserva.jpg',
    '/images/customer-trips/bags-at-the-kerb.jpg',
    '/images/homepage-hero-van.jpg',
    '/images/golfsol-fleet-sunny-costa-del-sol.webp',
    '/images/fleet-golden-hour-rebranded.png'
  ].includes(photo.src)
)

/** Full strip for the airport transfers / transport pages. */
export const TRANSFER_FLEET_STRIP_PHOTOS = TRANSFER_FLEET_PHOTOS
