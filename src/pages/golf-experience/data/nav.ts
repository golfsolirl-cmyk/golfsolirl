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
  { label: 'Home', href: '#top' },
  {
    label: 'Services',
    href: '#extras',
    children: [
      { label: 'Transport', href: '#extras' },
      { label: 'Excursions', href: '#extras' },
      { label: 'Golf Club Rental', href: '#extras' },
      { label: 'Tee Time Bookings only', href: '#enquire' },
      { label: 'Family Holidays', href: '#enquire' }
    ]
  },
  {
    label: 'Golf Courses',
    href: '#golf-courses-spain',
    children: [
      { label: 'Sotogrande Cluster', href: '#golf-courses-spain' },
      { label: 'Marbella Golf Valley', href: '#golf-courses-spain' },
      { label: 'Mijas & Fuengirola', href: '#golf-courses-spain' }
    ]
  },
  {
    label: 'Accommodation',
    href: '#accommodation-spain',
    children: [
      { label: 'Fuengirola Hotels', href: '#accommodation-spain' },
      { label: 'Torremolinos Hotels', href: '#accommodation-spain' }
    ]
  },
  { label: 'Transport', href: '#extras' },
  {
    label: 'More',
    href: '#enquire',
    children: [
      { label: 'Excursions', href: '#extras' },
      { label: 'Testimonials', href: '#enquire' },
      { label: 'Golf Map', href: '#enquire' },
      { label: 'News', href: '#enquire' },
      { label: 'FAQ', href: '#enquire' },
      { label: 'Contact', href: '#enquire' }
    ]
  }
] as const

export const footerColumns = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Golf Club Rental – Costa del Sol', href: '#extras' },
      { label: 'Tee Time Bookings Only', href: '#enquire' },
      { label: 'Society & Group Trips', href: '#enquire' },
      { label: 'Family Golf Holidays', href: '#enquire' },
      { label: 'Dress Code on the Costa del Sol', href: '#enquire' },
      { label: 'Travelling to Málaga (AGP)', href: '#enquire' },
      { label: 'Excursions on the Sol', href: '#extras' },
      { label: 'Costa del Sol Golf Map', href: '#golf-courses-spain' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms & Conditions', href: '#' }
    ]
  },
  {
    title: 'Navigation',
    links: [
      { label: 'Home', href: '#top' },
      { label: 'Costa del Sol Courses', href: '#golf-courses-spain' },
      { label: 'Málaga Airport Transfers', href: '#extras' },
      { label: 'Hotels Irish Groups Love', href: '#accommodation-spain' },
      { label: 'Get a Quote', href: '#enquire' },
      { label: 'Sol Insider News', href: '#enquire' },
      { label: 'Terms & Conditions', href: '#' },
      { label: 'Join our newsletter', href: '#enquire' },
      { label: 'Give a Testimonial', href: '#enquire' }
    ]
  }
] as const
