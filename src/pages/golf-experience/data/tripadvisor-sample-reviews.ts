import { TRIPADVISOR_DEFAULT_LISTING_URL } from '../../../lib/tripadvisor'

/** Sample review cards for layout — not a live Tripadvisor feed (no invented ratings). */
export const tripadvisorReviewsSectionCopy = {
  eyebrow: 'Traveller proof',
  title: 'Reviews from the road',
  lead:
    'Sample quotes in the style of Tripadvisor traveller reviews — same energy as the feedback we hear from Irish groups on the Sol.',
  disclaimer: 'Sample reviews shown for layout — not pulled from Tripadvisor.',
  ctaLabel: 'Find us on Tripadvisor',
  ctaHref: TRIPADVISOR_DEFAULT_LISTING_URL,
  ctaNote: 'Opens our live Tripadvisor listing.'
} as const

export interface TripadvisorSampleReview {
  readonly quote: string
  readonly name: string
  readonly context: string
  readonly tripType: string
}

export const tripadvisorSampleReviews: readonly TripadvisorSampleReview[] = [
  {
    quote:
      'Met at Málaga exactly when promised, clubs in the back of a spotless people carrier, and tee times that actually matched what we were sold in Dublin. Captain’s job was easy for once.',
    name: 'Liam O’C.',
    context: 'Cork · 12-handicap society',
    tripType: 'Sample review'
  },
  {
    quote:
      'We had the hotel booked ourselves and only needed courses + twilights. Clear WhatsApp updates, no fluff, and the late rounds lined up with dinners in Fuengirola — brilliant pacing.',
    name: 'Sarah M.',
    context: 'Dublin · Four-ball',
    tripType: 'Sample review'
  },
  {
    quote:
      'Third time using the Irish team on the ground. Flight delayed out of Shannon; driver was already tracking it. Same gold standard as 2024 — already talking about Sotogrande next.',
    name: 'Declan F.',
    context: 'Galway · Repeat visitor',
    tripType: 'Sample review'
  }
] as const
