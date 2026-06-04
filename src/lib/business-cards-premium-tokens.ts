/** Luxury business card design tokens — Golf Sol Ireland premium showcase. */
export const BC_PREMIUM = {
  forest: '#0F3D2E',
  forestDeep: '#081A12',
  gold: '#C8A75D',
  goldLight: '#E5C76B',
  cream: '#F7F3EA',
  white: '#FFFFFF',
  chrome: '#D9D9D9',
  qrUrl: 'https://www.golfsolirl.com',
  email: 'info@golfsolirl.com',
  website: 'www.golfsolirl.com',
  websiteHref: 'https://www.golfsolirl.com'
} as const

export const BC_PREMIUM_BACK_SERVICES = [
  'Airport Transfers',
  'Golf Course Transfers',
  'Golf Holiday Packages',
  'Corporate Golf Trips',
  'Golf Society Travel',
  'Premium Concierge Service'
] as const

export const BC_PREMIUM_FRONT_BADGES = [
  'Irish Drivers',
  'Costa del Sol Specialists',
  'Luxury Transfers'
] as const

/** 85×55mm landscape at export scale */
export const BC_CARD_LW = 850
export const BC_CARD_LH = Math.round((BC_CARD_LW * 55) / 85)

export const BC_PRINT_SPEC = {
  trimMm: '85 × 55 mm (landscape)',
  bleedMm: '3 mm each edge (91 × 61 mm full art)',
  dpi: '300 DPI recommended',
  finish: 'Soft-touch laminate · spot UV crest · gold foil accents'
} as const
