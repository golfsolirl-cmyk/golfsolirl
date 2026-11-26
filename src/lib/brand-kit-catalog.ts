import { GOLFSOL_BRAND_LOGO } from './brand-logo-assets'
import { BRAND_ASSET_PACK_ZIP } from './brand-logo-kit'
import {
  BRAND_ADMIN_OPERATIONS_HERO_ALT,
  BRAND_CLIENT_PORTAL_HERO_ILLUSTRATION_SRC,
  BRAND_FLEET_HERO_IMAGE_SRC,
  BRAND_MARKETING_HERO_DESKTOP,
  BRAND_MARKETING_HERO_FLEET_ON_FAIRWAY_SRC,
  BRAND_MARKETING_RASTER_HERO_SRC,
  BRAND_PORTAL_HERO_GOLF_BACKDROP_SRC
} from './brand-visual-assets'

export type BrandKitCategory =
  | 'logos'
  | 'social'
  | 'favicons'
  | 'og'
  | 'heroes'
  | 'email'
  | 'cards'
  | 'packs'

export type BrandKitAsset = {
  readonly id: string
  readonly category: BrandKitCategory
  readonly name: string
  readonly description: string
  readonly href: string
  readonly downloadName: string
  readonly format: string
  /**
   * Preview surface for gallery cards.
   * - `forest` / `charcoal`: light / white / silver logos (crest lockups)
   * - `cream` / `white` / `checker`: dark logos and photo plates
   */
  readonly previewBg: 'cream' | 'white' | 'forest' | 'charcoal' | 'checker'
}

export const BRAND_KIT_CATEGORY_LABELS: Record<BrandKitCategory, string> = {
  logos: 'Logos & crests',
  social: 'Social media accounts',
  favicons: 'Favicons & app icons',
  og: 'OG & link previews',
  heroes: 'Hero & brand photography',
  email: 'Email',
  cards: 'Business cards',
  packs: 'Download packs'
}

/** Social pack files live under public/downloads/golfsol-ireland-asset-pack/ */
const SOCIAL_PACK = '/downloads/golfsol-ireland-asset-pack' as const

/** Existing repo assets only — no invented files. */
export const BRAND_KIT_ASSETS: readonly BrandKitAsset[] = [
  {
    id: 'crest-master-png',
    category: 'logos',
    name: 'Primary crest (PNG)',
    description: 'Canonical shield crest — transparent. Site chrome, email, and PDF.',
    href: GOLFSOL_BRAND_LOGO.png,
    downloadName: 'golfsol-ireland-crest-master.png',
    format: 'PNG · transparent',
    previewBg: 'forest'
  },
  {
    id: 'crest-master-webp',
    category: 'logos',
    name: 'Primary crest (WebP)',
    description: 'Same crest, smaller file for web and email.',
    href: GOLFSOL_BRAND_LOGO.webp,
    downloadName: 'golfsol-ireland-crest-master.webp',
    format: 'WebP · transparent',
    previewBg: 'forest'
  },
  {
    id: 'crest-brand-png',
    category: 'logos',
    name: 'Crest brand PNG',
    description: 'High-quality transparent crest used in the social asset pack.',
    href: '/golfsol-crest-brand.png',
    downloadName: 'golfsol-crest-brand.png',
    format: 'PNG · transparent',
    previewBg: 'forest'
  },
  {
    id: 'crest-brand-svg',
    category: 'logos',
    name: 'Crest brand SVG',
    description: 'Vector crest for print and large format.',
    href: '/golfsol-crest-brand.svg',
    downloadName: 'golfsol-crest-brand.svg',
    format: 'SVG · vector',
    previewBg: 'forest'
  },
  {
    id: 'crest-brand-webp',
    category: 'logos',
    name: 'Crest brand WebP',
    description: 'Web-optimised crest brand file.',
    href: '/golfsol-crest-brand.webp',
    downloadName: 'golfsol-crest-brand.webp',
    format: 'WebP · transparent',
    previewBg: 'forest'
  },
  {
    id: 'crest-header-png',
    category: 'logos',
    name: 'Crest header PNG',
    description: 'Header-sized crest crop.',
    href: '/golfsol-crest-header.png',
    downloadName: 'golfsol-crest-header.png',
    format: 'PNG',
    previewBg: 'charcoal'
  },
  {
    id: 'crest-footer-png',
    category: 'logos',
    name: 'Crest footer PNG',
    description: 'Footer-sized crest crop.',
    href: '/golfsol-crest-footer.png',
    downloadName: 'golfsol-crest-footer.png',
    format: 'PNG',
    previewBg: 'charcoal'
  },
  {
    id: 'ireland-logo-svg',
    category: 'logos',
    name: 'Golf Sol Ireland logo SVG',
    description: 'Full logo SVG for documents and large print.',
    href: '/golf-sol-ireland-logo.svg',
    downloadName: 'golf-sol-ireland-logo.svg',
    format: 'SVG · vector',
    previewBg: 'forest'
  },
  {
    id: 'golf-sol-irl-png',
    category: 'logos',
    name: 'Golf Sol Irl lockup PNG',
    description: 'Alternate lockup matching header crest sizing.',
    href: '/golf-sol-irl.png',
    downloadName: 'golf-sol-irl.png',
    format: 'PNG',
    previewBg: 'charcoal'
  },
  {
    id: 'gsol-transparent',
    category: 'logos',
    name: 'G-Sol logo (transparent)',
    description: 'Alternate lockup with transparent background.',
    href: '/images/g-sol-logo.png',
    downloadName: 'g-sol-logo.png',
    format: 'PNG · transparent',
    previewBg: 'forest'
  },
  {
    id: 'gsol-svg',
    category: 'logos',
    name: 'G-Sol logo SVG',
    description: 'Vector G-Sol lockup.',
    href: '/images/g-sol-logo.svg',
    downloadName: 'g-sol-logo.svg',
    format: 'SVG · vector',
    previewBg: 'forest'
  },
  {
    id: 'gsol-white-bg',
    category: 'logos',
    name: 'G-Sol logo (white background)',
    description: 'Solid white plate when transparency is not supported.',
    href: '/images/g-sol-logo-white-bg.png',
    downloadName: 'g-sol-logo-white-bg.png',
    format: 'PNG · white bg',
    previewBg: 'checker'
  },
  {
    id: 'header-logo-1440',
    category: 'logos',
    name: 'Header logo (wide 1440)',
    description: 'Wide header lockup used on website chrome.',
    href: '/images/golfsol-header-logo-w1440.png',
    downloadName: 'golfsol-header-logo-w1440.png',
    format: 'PNG',
    previewBg: 'cream'
  },
  {
    id: 'fb-cover',
    category: 'social',
    name: 'Facebook cover',
    description: 'Facebook page cover / banner.',
    href: `${SOCIAL_PACK}/Facebook/facebook-cover.png`,
    downloadName: 'golfsol-facebook-cover.png',
    format: 'PNG · cover',
    previewBg: 'cream'
  },
  {
    id: 'fb-profile',
    category: 'social',
    name: 'Facebook profile',
    description: 'Facebook page profile picture. Also works for WhatsApp display photo.',
    href: `${SOCIAL_PACK}/Facebook/facebook-profile.png`,
    downloadName: 'golfsol-facebook-profile.png',
    format: 'PNG · square',
    previewBg: 'forest'
  },
  {
    id: 'ig-profile',
    category: 'social',
    name: 'Instagram profile',
    description: 'Instagram avatar (circle-safe). Also suits TikTok / WhatsApp profile uploads.',
    href: `${SOCIAL_PACK}/Instagram/instagram-profile.png`,
    downloadName: 'golfsol-instagram-profile.png',
    format: 'PNG · square',
    previewBg: 'forest'
  },
  {
    id: 'ig-post',
    category: 'social',
    name: 'Instagram post',
    description: 'Square Instagram feed post.',
    href: `${SOCIAL_PACK}/Instagram/instagram-post.png`,
    downloadName: 'golfsol-instagram-post.png',
    format: 'PNG · 1:1',
    previewBg: 'cream'
  },
  {
    id: 'ig-story',
    category: 'social',
    name: 'Instagram story',
    description: 'Vertical Instagram / TikTok story frame.',
    href: `${SOCIAL_PACK}/Instagram/instagram-story.png`,
    downloadName: 'golfsol-instagram-story.png',
    format: 'PNG · 9:16',
    previewBg: 'cream'
  },
  {
    id: 'li-banner',
    category: 'social',
    name: 'LinkedIn banner',
    description: 'LinkedIn company / personal cover banner.',
    href: `${SOCIAL_PACK}/LinkedIn/linkedin-banner.png`,
    downloadName: 'golfsol-linkedin-banner.png',
    format: 'PNG · banner',
    previewBg: 'cream'
  },
  {
    id: 'li-profile',
    category: 'social',
    name: 'LinkedIn profile',
    description: 'LinkedIn profile / company logo square.',
    href: `${SOCIAL_PACK}/LinkedIn/linkedin-profile.png`,
    downloadName: 'golfsol-linkedin-profile.png',
    format: 'PNG · square',
    previewBg: 'forest'
  },
  {
    id: 'x-header',
    category: 'social',
    name: 'X (Twitter) header',
    description: 'X / Twitter profile header banner.',
    href: `${SOCIAL_PACK}/X - Twitter/twitter-header.png`,
    downloadName: 'golfsol-x-twitter-header.png',
    format: 'PNG · header',
    previewBg: 'cream'
  },
  {
    id: 'x-profile',
    category: 'social',
    name: 'X (Twitter) profile',
    description: 'X / Twitter profile avatar.',
    href: `${SOCIAL_PACK}/X - Twitter/twitter-profile.png`,
    downloadName: 'golfsol-x-twitter-profile.png',
    format: 'PNG · square',
    previewBg: 'forest'
  },
  {
    id: 'yt-banner',
    category: 'social',
    name: 'YouTube banner',
    description: 'YouTube channel art / banner.',
    href: `${SOCIAL_PACK}/YouTube/youtube-banner.png`,
    downloadName: 'golfsol-youtube-banner.png',
    format: 'PNG · banner',
    previewBg: 'cream'
  },
  {
    id: 'yt-profile',
    category: 'social',
    name: 'YouTube profile',
    description: 'YouTube channel profile image.',
    href: `${SOCIAL_PACK}/YouTube/youtube-profile.png`,
    downloadName: 'golfsol-youtube-profile.png',
    format: 'PNG · square',
    previewBg: 'forest'
  },
  {
    id: 'google-cover',
    category: 'social',
    name: 'Google Business cover',
    description: 'Google Business Profile cover photo.',
    href: `${SOCIAL_PACK}/Google Business/google-cover.png`,
    downloadName: 'golfsol-google-business-cover.png',
    format: 'PNG · cover',
    previewBg: 'cream'
  },
  {
    id: 'google-profile',
    category: 'social',
    name: 'Google Business profile',
    description: 'Google Business Profile logo / avatar.',
    href: `${SOCIAL_PACK}/Google Business/google-profile.png`,
    downloadName: 'golfsol-google-business-profile.png',
    format: 'PNG · square',
    previewBg: 'forest'
  },
  {
    id: 'social-source-logo',
    category: 'social',
    name: 'Source logo (transparent)',
    description: 'Master transparent logo from the social pack — crop for any network.',
    href: `${SOCIAL_PACK}/Source assets/logo-transparent.png`,
    downloadName: 'golfsol-source-logo-transparent.png',
    format: 'PNG · transparent',
    previewBg: 'forest'
  },
  {
    id: 'social-source-hero',
    category: 'social',
    name: 'Source hero banner',
    description: 'Full hero plate used to build covers and posts.',
    href: `${SOCIAL_PACK}/Source assets/hero-banner-full.png`,
    downloadName: 'golfsol-source-hero-banner-full.png',
    format: 'PNG',
    previewBg: 'cream'
  },
  {
    id: 'favicon-ico',
    category: 'favicons',
    name: 'Favicon ICO',
    description: 'Classic browser favicon.',
    href: '/favicon.ico',
    downloadName: 'favicon.ico',
    format: 'ICO',
    previewBg: 'charcoal'
  },
  {
    id: 'favicon-svg',
    category: 'favicons',
    name: 'Favicon SVG',
    description: 'Scalable favicon.',
    href: '/favicon.svg',
    downloadName: 'favicon.svg',
    format: 'SVG',
    previewBg: 'forest'
  },
  {
    id: 'favicon-96',
    category: 'favicons',
    name: 'Favicon 96×96',
    description: 'PNG favicon.',
    href: '/favicon-96x96.png',
    downloadName: 'favicon-96x96.png',
    format: 'PNG · 96×96',
    previewBg: 'charcoal'
  },
  {
    id: 'apple-touch',
    category: 'favicons',
    name: 'Apple touch icon',
    description: 'iOS home-screen icon.',
    href: '/apple-touch-icon.png',
    downloadName: 'apple-touch-icon.png',
    format: 'PNG',
    previewBg: 'cream'
  },
  {
    id: 'android-192',
    category: 'favicons',
    name: 'Android Chrome 192',
    description: 'PWA / Android icon 192×192.',
    href: '/android-chrome-192x192.png',
    downloadName: 'android-chrome-192x192.png',
    format: 'PNG · 192×192',
    previewBg: 'charcoal'
  },
  {
    id: 'android-512',
    category: 'favicons',
    name: 'Android Chrome 512',
    description: 'PWA / Android icon 512×512.',
    href: '/android-chrome-512x512.png',
    downloadName: 'android-chrome-512x512.png',
    format: 'PNG · 512×512',
    previewBg: 'charcoal'
  },
  {
    id: 'manifest-192',
    category: 'favicons',
    name: 'Web app manifest 192',
    description: 'Manifest icon 192×192.',
    href: '/web-app-manifest-192x192.png',
    downloadName: 'web-app-manifest-192x192.png',
    format: 'PNG · 192×192',
    previewBg: 'cream'
  },
  {
    id: 'manifest-512',
    category: 'favicons',
    name: 'Web app manifest 512',
    description: 'Manifest icon 512×512.',
    href: '/web-app-manifest-512x512.png',
    downloadName: 'web-app-manifest-512x512.png',
    format: 'PNG · 512×512',
    previewBg: 'cream'
  },
  {
    id: 'og-fleet',
    category: 'og',
    name: 'OG share — fleet',
    description: 'Default Open Graph share image.',
    href: '/images/og-share-fleet.jpg',
    downloadName: 'golfsol-og-share-fleet.jpg',
    format: 'JPG',
    previewBg: 'cream'
  },
  {
    id: 'og-crest',
    category: 'og',
    name: 'OG share — crest',
    description: 'Crest crop for link previews and profile-style uses.',
    href: '/images/og-share-crest.jpg',
    downloadName: 'golfsol-og-share-crest.jpg',
    format: 'JPG',
    previewBg: 'cream'
  },
  {
    id: 'hero-fpf-cover',
    category: 'heroes',
    name: 'Default fleet cover hero',
    description: 'Primary branded hero / fleet lineup (WebP).',
    href: BRAND_FLEET_HERO_IMAGE_SRC,
    downloadName: 'fpf-cover-fleet-hero.webp',
    format: 'WebP',
    previewBg: 'charcoal'
  },
  {
    id: 'hero-fpf-cover-png',
    category: 'heroes',
    name: 'Default fleet cover hero (PNG)',
    description: 'Same cover plate as PNG.',
    href: '/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.png',
    downloadName: 'fpf-cover-fleet-hero.png',
    format: 'PNG',
    previewBg: 'charcoal'
  },
  {
    id: 'hero-homepage-desktop',
    category: 'heroes',
    name: 'Homepage desktop marketing hero',
    description: 'Desktop editorial banner.',
    href: BRAND_MARKETING_HERO_DESKTOP.webp,
    downloadName: 'homepage-desktop-hero.webp',
    format: 'WebP',
    previewBg: 'charcoal'
  },
  {
    id: 'hero-fleet-fairway',
    category: 'heroes',
    name: 'Fleet on fairway (golden hour)',
    description: 'Marketing fleet-on-fairway plate.',
    href: BRAND_MARKETING_HERO_FLEET_ON_FAIRWAY_SRC,
    downloadName: 'hero-fleet-golf-golden-hour.webp',
    format: 'WebP',
    previewBg: 'charcoal'
  },
  {
    id: 'hero-twilight',
    category: 'heroes',
    name: 'Twilight golf backdrop',
    description: 'Portal / marketing twilight plate.',
    href: BRAND_PORTAL_HERO_GOLF_BACKDROP_SRC,
    downloadName: 'twilight-golf-hero.webp',
    format: 'WebP',
    previewBg: 'cream'
  },
  {
    id: 'hero-raster',
    category: 'heroes',
    name: 'Raster marketing hero',
    description: 'Full-width marketing raster hero.',
    href: BRAND_MARKETING_RASTER_HERO_SRC,
    downloadName: 'himage.webp',
    format: 'WebP',
    previewBg: 'charcoal'
  },
  {
    id: 'hero-admin-ops',
    category: 'heroes',
    name: 'Admin operations hero',
    description: BRAND_ADMIN_OPERATIONS_HERO_ALT || 'Decorative admin portal hero.',
    href: '/images/admin-operations-hero.webp',
    downloadName: 'admin-operations-hero.webp',
    format: 'WebP',
    previewBg: 'charcoal'
  },
  {
    id: 'hero-client-portal',
    category: 'heroes',
    name: 'Client portal illustration',
    description: 'Wide client-area illustration.',
    href: BRAND_CLIENT_PORTAL_HERO_ILLUSTRATION_SRC,
    downloadName: 'client-portal-hero-illustration.webp',
    format: 'WebP',
    previewBg: 'charcoal'
  },
  {
    id: 'email-crest',
    category: 'email',
    name: 'Transactional email crest',
    description: 'Same master crest used in branded email headers.',
    href: GOLFSOL_BRAND_LOGO.png,
    downloadName: 'golfsol-email-crest.png',
    format: 'PNG · transparent',
    previewBg: 'forest'
  },
  {
    id: 'email-transfer-banner',
    category: 'email',
    name: 'Email / newsletter transfer banner',
    description: 'Wide Costa del Sol transfer banner for email headers and newsletters.',
    href: '/images/hero-costa-del-sol-transfer-banner.png',
    downloadName: 'golfsol-email-transfer-banner.png',
    format: 'PNG · banner',
    previewBg: 'cream'
  },
  {
    id: 'email-signature-html',
    category: 'email',
    name: 'Email signature HTML',
    description: 'Hosted Gmail-ready signature template (open, then copy into Gmail Settings).',
    href: '/email-signature.html',
    downloadName: 'golfsol-email-signature.html',
    format: 'HTML',
    previewBg: 'cream'
  },
  {
    id: 'bc-pdf',
    category: 'cards',
    name: 'Business card PDF',
    description: 'Print-ready business card PDF.',
    href: '/business-cards/Golf-Sol-Ireland-Business-Card.pdf',
    downloadName: 'Golf-Sol-Ireland-Business-Card.pdf',
    format: 'PDF',
    previewBg: 'cream'
  },
  {
    id: 'bc-front',
    category: 'cards',
    name: 'Business card front',
    description: 'Front PNG preview.',
    href: '/images/business-cards/golfsol-business-card-front.png',
    downloadName: 'golfsol-business-card-front.png',
    format: 'PNG',
    previewBg: 'cream'
  },
  {
    id: 'bc-front-landscape',
    category: 'cards',
    name: 'Business card front (landscape)',
    description: 'Landscape front PNG.',
    href: '/images/business-cards/golfsol-business-card-front-landscape.png',
    downloadName: 'golfsol-business-card-front-landscape.png',
    format: 'PNG',
    previewBg: 'cream'
  },
  {
    id: 'asset-pack-zip',
    category: 'packs',
    name: BRAND_ASSET_PACK_ZIP.label,
    description: 'Pre-built social & print pack (Google, Meta, LinkedIn, X, YouTube, source assets).',
    href: BRAND_ASSET_PACK_ZIP.href,
    downloadName: BRAND_ASSET_PACK_ZIP.downloadName,
    format: 'ZIP',
    previewBg: 'cream'
  }
] as const

export const BRAND_KIT_ADMIN_PATH = '/admin/brand' as const
export const BRAND_KIT_PUBLIC_BASE_PATH = '/brand' as const

export function brandKitSharePath(token: string): string {
  return `${BRAND_KIT_PUBLIC_BASE_PATH}/${encodeURIComponent(token)}`
}

export function parseBrandKitTokenFromPath(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, '') || '/'
  const prefix = `${BRAND_KIT_PUBLIC_BASE_PATH}/`
  if (!path.startsWith(prefix)) {
    return null
  }
  const rest = path.slice(prefix.length)
  if (!rest || rest.includes('/')) {
    return null
  }
  try {
    return decodeURIComponent(rest)
  } catch {
    return rest
  }
}
