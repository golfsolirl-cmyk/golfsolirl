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
      { label: 'Spain', href: '#golf-courses-spain' },
      { label: 'Portugal', href: '#golf-courses-portugal' }
    ]
  },
  {
    label: 'Accommodation',
    href: '#accommodation-spain',
    children: [
      { label: 'Spain', href: '#accommodation-spain' },
      { label: 'Portugal', href: '#accommodation-portugal' }
    ]
  },
  { label: 'Transport', href: '#extras' },
  { label: 'Excursions', href: '#extras' },
  {
    label: 'More',
    href: '#enquire',
    children: [
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
      { label: 'Golf Club Rental – Costa del Sol Only', href: '#extras' },
      { label: 'Tee Time Bookings only', href: '#enquire' },
      { label: 'Family Holidays', href: '#enquire' },
      { label: 'Incentive Packages', href: '#enquire' },
      { label: 'Dress Code for Golf in Spain', href: '#enquire' },
      { label: 'Travelling to Spain', href: '#enquire' },
      { label: 'Excursions', href: '#extras' },
      { label: 'Golf in Portugal', href: '#golf-courses-portugal' }
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
      { label: 'Golf Courses', href: '#golf-courses-spain' },
      { label: 'Transport', href: '#extras' },
      { label: 'Accommodation', href: '#accommodation-spain' },
      { label: 'Golf Holiday Enquiry Form', href: '#enquire' },
      { label: 'News', href: '#enquire' },
      { label: 'Terms & Conditions', href: '#' },
      { label: 'Join our newsletter', href: '#enquire' },
      { label: 'Give a Testimonial', href: '#enquire' }
    ]
  }
] as const
