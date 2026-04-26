export interface GeNavLink {
  readonly label: string
  readonly href: string
  readonly children?: readonly GeNavLink[]
}

/**
 * Top-level desktop nav. Kept to a maximum of 7 visible items so the bar
 * never wraps at 1024px+. Secondary links live under the "More" dropdown.
 */
export const primaryNav: readonly GeNavLink[] = [
  { label: 'Home', href: '/#top' },
  {
    label: 'Services',
    href: '/services/transport',
    children: [
      { label: 'Transport', href: '/services/transport' },
      { label: 'Golf Club Rental', href: '/golf-club-rental' },
      { label: 'Tee Time Bookings only', href: '/tee-time-bookings-only' },
      { label: 'Family Holidays', href: '/family-holidays' }
    ]
  },
  {
    label: 'Golf Courses',
    href: '/golf-courses',
    children: [
      { label: 'Sotogrande Cluster', href: '/golf-courses/sotogrande' },
      { label: 'Marbella Golf Valley', href: '/golf-courses/marbella-golf-valley' },
      { label: 'Mijas & Fuengirola', href: '/golf-courses/mijas-fuengirola' }
    ]
  },
  {
    label: 'Accommodation',
    href: '/accommodation',
    children: [
      { label: 'Fuengirola Hotels', href: '/accommodation/fuengirola-hotels' },
      { label: 'Torremolinos Hotels', href: '/accommodation/torremolinos-hotels' }
    ]
  },
  { label: 'Transport', href: '/services/transport' },
  {
    label: 'More',
    href: '/contact',
    children: [
      { label: 'Testimonials', href: '/testimonials' },
      { label: 'Golf Map', href: '/golf-map' },
      { label: 'News', href: '/news' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Contact', href: '/contact' }
    ]
  }
] as const

export const footerColumns = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Golf Club Rental – Costa del Sol', href: '/golf-club-rental' },
      { label: 'Tee Time Bookings Only', href: '/tee-time-bookings-only' },
      { label: 'Society & Group Trips', href: '/booking' },
      { label: 'Family Golf Holidays', href: '/family-holidays' },
      { label: 'Dress Code on the Costa del Sol', href: '/guides/dress-code-costa-del-sol' },
      { label: 'Travelling to Málaga (AGP)', href: '/guides/travelling-to-malaga-agp' },
      { label: 'Costa del Sol Golf Map', href: '/golf-map' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms & Conditions', href: '/terms-and-conditions' }
    ]
  },
  {
    title: 'Docs',
    links: [
      { label: 'Terms & Conditions PDF', href: '/docs/terms-and-conditions.pdf' },
      { label: 'Traveller Contacts PDF', href: '/docs/traveller-contacts.pdf' },
      { label: 'Packing Checklist PDF', href: '/docs/packing-checklist.pdf' }
    ]
  },
  {
    title: 'Navigation',
    links: [
      { label: 'Home', href: '/#top' },
      { label: 'Costa del Sol Courses', href: '/golf-courses' },
      { label: 'Málaga Airport Transfers', href: '/transport' },
      { label: 'Hotels Irish Groups Love', href: '/accommodation' },
      { label: 'Get a Quote', href: '/contact' },
      { label: 'Sol Insider News', href: '/news' },
      { label: 'Terms & Conditions', href: '/terms-conditions' },
      { label: 'Join our newsletter', href: '/newsletter' },
      { label: 'Give a Testimonial', href: '/contact/give-a-testimonial' }
    ]
  }
] as const
