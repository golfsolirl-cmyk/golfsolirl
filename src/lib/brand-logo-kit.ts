import { GOLFSOL_BRAND_LOGO, GOLFSOL_BRAND_LOGO_HOSTED } from './brand-logo-assets'

export type BrandLogoKitItem = {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly href: string
  readonly downloadName: string
  readonly format: string
  readonly useFor: string
  readonly previewBg: 'cream' | 'white' | 'forest' | 'checker'
}

/** Curated official files — printers & profiles should start here. */
export const BRAND_LOGO_KIT: readonly BrandLogoKitItem[] = [
  {
    id: 'master-crest-png',
    name: 'Primary crest (PNG)',
    description: 'Canonical shield crest — transparent background. Use for print, web, and social crops.',
    href: GOLFSOL_BRAND_LOGO.png,
    downloadName: 'golfsol-ireland-crest-master.png',
    format: 'PNG · transparent',
    useFor: 'Print · web · Google / Facebook crop source',
    previewBg: 'checker'
  },
  {
    id: 'master-crest-webp',
    name: 'Primary crest (WebP)',
    description: 'Same crest, smaller file for websites and email.',
    href: GOLFSOL_BRAND_LOGO.webp,
    downloadName: 'golfsol-ireland-crest-master.webp',
    format: 'WebP · transparent',
    useFor: 'Web & email',
    previewBg: 'checker'
  },
  {
    id: 'crest-brand-png',
    name: 'Crest brand PNG',
    description: 'High-quality transparent crest used in the social asset pack.',
    href: '/golfsol-crest-brand.png',
    downloadName: 'golfsol-crest-brand.png',
    format: 'PNG · transparent',
    useFor: 'Print & social pack',
    previewBg: 'checker'
  },
  {
    id: 'crest-brand-svg',
    name: 'Crest brand SVG',
    description: 'Vector crest when printers ask for scalable artwork.',
    href: '/golfsol-crest-brand.svg',
    downloadName: 'golfsol-crest-brand.svg',
    format: 'SVG · vector',
    useFor: 'Print / large format',
    previewBg: 'cream'
  },
  {
    id: 'ireland-logo-svg',
    name: 'Golf Sol Ireland logo SVG',
    description: 'Full logo SVG for documents and large print.',
    href: '/golf-sol-ireland-logo.svg',
    downloadName: 'golf-sol-ireland-logo.svg',
    format: 'SVG · vector',
    useFor: 'Print · letterheads',
    previewBg: 'cream'
  },
  {
    id: 'gsol-transparent',
    name: 'G-Sol logo (transparent)',
    description: 'Alternate lockup with transparent background.',
    href: '/images/g-sol-logo.png',
    downloadName: 'g-sol-logo.png',
    format: 'PNG · transparent',
    useFor: 'Web overlays',
    previewBg: 'checker'
  },
  {
    id: 'gsol-white-bg',
    name: 'G-Sol logo (white background)',
    description: 'Same lockup on a solid white plate — useful when transparency is not supported.',
    href: '/images/g-sol-logo-white-bg.png',
    downloadName: 'g-sol-logo-white-bg.png',
    format: 'PNG · white bg',
    useFor: 'Forms · docs · directories that reject transparency',
    previewBg: 'white'
  },
  {
    id: 'header-logo',
    name: 'Header logo (wide)',
    description: 'Wide header lockup used on the website chrome.',
    href: '/images/golfsol-header-logo-w1440.png',
    downloadName: 'golfsol-header-logo-w1440.png',
    format: 'PNG',
    useFor: 'Website header · email banners',
    previewBg: 'cream'
  },
  {
    id: 'og-share-crest',
    name: 'Share image — crest',
    description: 'Square-friendly crest crop for link previews and profile-style uses.',
    href: '/images/og-share-crest.jpg',
    downloadName: 'golfsol-og-share-crest.jpg',
    format: 'JPG',
    useFor: 'Link previews · quick profile upload',
    previewBg: 'forest'
  }
] as const

export const BRAND_ASSET_PACK_ZIP = {
  href: '/downloads/golfsol-ireland-asset-pack.zip',
  downloadName: 'golfsol-ireland-asset-pack.zip',
  label: 'Full social & print asset pack (ZIP)'
} as const

export type SocialLogoExport = {
  readonly id: string
  readonly platform: string
  readonly size: number
  readonly note: string
  readonly bg: 'transparent' | 'white' | 'forest'
}

/** Ready-to-download square PNGs for Google, Facebook, and similar. */
export const SOCIAL_LOGO_EXPORTS: readonly SocialLogoExport[] = [
  { id: 'google-250', platform: 'Google Business / profile', size: 250, note: 'Recommended square', bg: 'white' },
  { id: 'google-512', platform: 'Google / high-res square', size: 512, note: 'Crisp upload master', bg: 'white' },
  { id: 'facebook-180', platform: 'Facebook profile', size: 180, note: 'Minimum profile size', bg: 'white' },
  { id: 'facebook-320', platform: 'Facebook / Instagram profile', size: 320, note: 'Retina-friendly', bg: 'white' },
  { id: 'instagram-320', platform: 'Instagram profile', size: 320, note: 'Circle crop safe', bg: 'white' },
  { id: 'linkedin-400', platform: 'LinkedIn profile', size: 400, note: 'Company / personal', bg: 'white' },
  { id: 'app-512-forest', platform: 'App icon / dark tile', size: 512, note: 'Forest plate', bg: 'forest' },
  { id: 'app-512-clear', platform: 'Transparent square', size: 512, note: 'Keep transparency', bg: 'transparent' }
] as const

export const BRAND_LOGO_KIT_PAGE_PATH = '/brand-logos' as const

export const BRAND_LOGO_KIT_CANONICAL_URL = `https://www.golfsolirl.com${BRAND_LOGO_KIT_PAGE_PATH}` as const

export const BRAND_LOGO_MASTER_SRC = GOLFSOL_BRAND_LOGO.png

export const BRAND_LOGO_MASTER_HOSTED = GOLFSOL_BRAND_LOGO_HOSTED
