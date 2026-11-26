export interface GeNavLink {
  readonly label: string
  readonly href: string
  readonly children?: readonly GeNavLink[]
}

/**
 * Top-level desktop nav — kept to five clear items (no mega-menus).
 * Secondary links live in the footer only.
 */
export const primaryNav: readonly GeNavLink[] = [
  { label: 'Golf Bundles', href: '/bundles' },
  { label: 'Hotels', href: '/accommodation' },
  { label: 'Golf Courses', href: '/golf-courses' },
  { label: 'Transfers', href: '/services/transport' },
  { label: 'Contact', href: '/contact' }
] as const

export const footerColumns = [
  {
    title: 'Plan your trip',
    links: [
      { label: 'Golf holiday bundles', href: '/bundles' },
      { label: 'Hotels', href: '/accommodation' },
      { label: 'Golf courses', href: '/golf-courses' },
      { label: 'Málaga airport transfers', href: '/services/transport' },
      { label: 'Get a quote', href: '/quote' }
    ]
  },
  {
    title: 'Help',
    links: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Testimonials', href: '/testimonials' },
      { label: 'Leave us a review', href: '/leave-a-review' },
      { label: 'Golf map', href: '/golf-map' },
      { label: 'Client sign-in', href: '/portal' },
      { label: 'Admin sign-in', href: '/admin/login' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Cookie Policy', href: '/cookie-policy' },
      { label: 'Terms & Conditions', href: '/terms-and-conditions' }
    ]
  }
] as const
