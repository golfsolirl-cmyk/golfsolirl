export type CustomerTripPhoto = {
  readonly src: string
  readonly caption: string
  readonly alt: string
}

/** Real Golf Sol Ireland trip photos — hotel kerbs, vans, courses, and stays. */
export const CUSTOMER_TRIP_PHOTOS: readonly CustomerTripPhoto[] = [
  {
    src: '/images/customer-trips/bags-at-the-kerb.jpg',
    caption: 'Bags at the kerb',
    alt: 'Three golfers with travel bags beside the Golf Sol van on a Costa del Sol street.'
  },
  {
    src: '/images/customer-trips/sol-don-pablo.jpg',
    caption: 'Sol Don Pablo',
    alt: 'Golfers with their bags outside the Sol Don Pablo hotel entrance.'
  },
  {
    src: '/images/customer-trips/la-reserva-group.jpg',
    caption: 'La Reserva Club',
    alt: 'An Irish golf group beside the white van at La Reserva Club.'
  },
  {
    src: '/images/customer-trips/van-to-buggy.jpg',
    caption: 'Van to buggy',
    alt: 'Golf bags moving from the van onto a buggy at the clubhouse.'
  },
  {
    src: '/images/customer-trips/van-doors-open.jpg',
    caption: 'Doors open',
    alt: 'The white group van with the doors open at La Reserva Club.'
  },
  {
    src: '/images/customer-trips/van-at-la-reserva.jpg',
    caption: 'The group van',
    alt: 'Front of the white Golf Sol van parked at La Reserva Club.'
  },
  {
    src: '/images/customer-trips/sunset-bag-drop.jpg',
    caption: 'Last light drop-off',
    alt: 'Golfers unloading bags from the van beside a clubhouse at sunset.'
  },
  {
    src: '/images/customer-trips/evening-range.jpg',
    caption: 'Evening range',
    alt: 'A Costa del Sol driving range in the evening, with the course beyond.'
  },
  {
    src: '/images/customer-trips/la-reserva-gates.jpg',
    caption: 'Through the gates',
    alt: 'The entrance gates and sign at La Reserva Club.'
  },
  {
    src: '/images/customer-trips/sotogrande.jpg',
    caption: 'Sotogrande',
    alt: 'The white Sotogrande hotel entrance under a clear blue sky.'
  },
  {
    src: '/images/customer-trips/hotel-terrace.jpg',
    caption: 'The stay',
    alt: 'A sunny hotel terrace with planting and a small fountain.'
  },
  {
    src: '/images/customer-trips/resort-gardens.jpg',
    caption: 'Resort gardens',
    alt: 'A long reflecting pool through resort gardens on the Costa del Sol.'
  }
]

/** Featured hero tile for the homepage mosaic (group at La Reserva). */
export const CUSTOMER_TRIP_FEATURED_INDEX = 2
