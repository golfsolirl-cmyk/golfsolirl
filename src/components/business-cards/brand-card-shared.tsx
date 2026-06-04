/**
 * Shared primitives — homepage brand (forest, cream, gold chrome, fleet imagery).
 */
import type { CSSProperties, ReactNode } from 'react'
import type { BusinessCardRenderMode } from '../../lib/business-cards-catalog-types'
import { brandLogoAssetUrl } from '../../lib/brand-logo-assets'
import { BRAND_BUSINESS_CARD_HERO_BG_SRC } from '../../lib/brand-visual-assets'

/** Landscape 85×55mm @ ~850px wide */
export const CARD_LW = 850
export const CARD_LH = Math.round((CARD_LW * 55) / 85)

/** Portrait 55×85mm */
export const CARD_PW = 550
export const CARD_PH = Math.round((CARD_PW * 85) / 55)

export const CARD_BRAND = {
  forest950: '#04140c',
  forest900: '#062016',
  forest800: '#0b4d3b',
  forest700: '#136047',
  forest600: '#1e7558',
  cream: '#f7f4ec',
  chrome: '#eef2ef',
  goldLight: '#fff5cf',
  goldMid: '#f4dfa6',
  goldDeep: '#d9be7a',
  goldFoil: '#d4af37',
  textDark: '#08120d',
  silver: '#d9d9d9'
} as const

export const CARD_SERVICES = [
  'Airport Transfers',
  'Golf Course Transfers',
  'Golf Holiday Packages',
  'Corporate Golf Trips',
  'Golf Society Travel',
  'Premium Concierge Service'
] as const

export const CARD_BADGES = ['Irish Drivers', 'Costa del Sol Specialists', 'Luxury Mercedes Fleet'] as const

const SHAMROCK = '/shamrock-from-logo.webp'

export function cardAssetUrl(publicPath: string): string {
  if (/^https?:\/\//i.test(publicPath)) return publicPath
  const path = publicPath.startsWith('/') ? publicPath.slice(1) : publicPath
  const base = import.meta.env.BASE_URL
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${path}`
}

export function cardInset(mode: BusinessCardRenderMode): string {
  return mode === 'pdf' ? '14px' : 'clamp(10px,2.6vmin,18px)'
}

export function CardFrame({
  mode,
  orientation,
  children,
  className = ''
}: {
  readonly mode: BusinessCardRenderMode
  readonly orientation: 'landscape' | 'portrait'
  readonly children: ReactNode
  readonly className?: string
}) {
  const isPdf = mode === 'pdf'
  const w = orientation === 'landscape' ? CARD_LW : CARD_PW
  const h = orientation === 'landscape' ? CARD_LH : CARD_PH

  return (
    <figure
      className={
        isPdf
          ? `relative overflow-hidden rounded-[18px] [container-type:size] ${className}`
          : `relative mx-auto overflow-hidden rounded-[18px] shadow-[0_32px_80px_rgba(0,0,0,0.48),0_0_0_1px_rgba(217,190,122,0.28),inset_0_1px_0_rgba(255,255,255,0.06)] [container-type:size] ${className} ${
              orientation === 'landscape'
                ? 'aspect-[85/55] w-full max-w-[760px]'
                : 'aspect-[55/85] w-full max-w-[440px]'
            }`
      }
      style={isPdf ? { width: w, height: h } : undefined}
    >
      {children}
    </figure>
  )
}

export function GoldGradientText({
  children,
  className = '',
  style
}: {
  readonly children: ReactNode
  readonly className?: string
  readonly style?: CSSProperties
}) {
  return (
    <span
      className={className}
      style={{
        backgroundImage: `linear-gradient(135deg, ${CARD_BRAND.goldLight} 0%, ${CARD_BRAND.goldMid} 48%, ${CARD_BRAND.goldDeep} 100%)`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
        ...style
      }}
    >
      {children}
    </span>
  )
}

export function FleetPhotoLayer({ mode, blur = 6 }: { readonly mode: BusinessCardRenderMode; readonly blur?: number }) {
  const src = cardAssetUrl(BRAND_BUSINESS_CARD_HERO_BG_SRC)
  return (
    <>
      <img
        src={src}
        alt=""
        aria-hidden
        draggable={false}
        decoding="async"
        className="absolute inset-0 h-full w-full scale-[1.12] object-cover object-[center_42%]"
        style={{ filter: mode === 'pdf' ? `blur(${blur}px) brightness(0.72) saturate(1.08)` : `blur(${blur}px) brightness(0.7) saturate(1.1)` }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(165deg, rgba(4,20,12,0.88) 0%, rgba(11,77,59,0.55) 42%, rgba(4,20,12,0.92) 100%)'
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#04140c]/90 via-[#04140c]/35 to-transparent"
        aria-hidden
      />
    </>
  )
}

export function CardGrain({ opacity = 0.08 }: { readonly opacity?: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 mix-blend-overlay"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
      }}
      aria-hidden
    />
  )
}

export function CelticCorner({ position }: { readonly position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const pos =
    position === 'tl'
      ? 'left-0 top-0'
      : position === 'tr'
        ? 'right-0 top-0 rotate-90'
        : position === 'bl'
          ? 'left-0 bottom-0 -rotate-90'
          : 'right-0 bottom-0 rotate-180'

  return (
    <svg
      viewBox="0 0 48 48"
      className={`gsol-card-deco pointer-events-none absolute ${pos} h-[14%] w-[14%] min-h-[28px] min-w-[28px]`}
      aria-hidden
    >
      <path
        fill="none"
        stroke="#e8bc55"
        strokeWidth="1.2"
        d="M4 44 V4 H44 M4 4 Q18 4 28 14 M4 20 Q12 20 18 26"
      />
    </svg>
  )
}

export function GoldInsetBorder({ inset }: { readonly inset: string }) {
  return (
    <div
      className="pointer-events-none absolute rounded-[14px] border border-[#d9be7a]/35 shadow-[inset_0_0_0_1px_rgba(255,245,207,0.12)]"
      style={{ inset }}
      aria-hidden
    />
  )
}

export function ShamrockWatermark({ mode }: { readonly mode: BusinessCardRenderMode }) {
  return (
    <img
      src={cardAssetUrl(SHAMROCK)}
      alt=""
      aria-hidden
      draggable={false}
      className="pointer-events-none absolute left-1/2 top-[58%] h-[38%] w-auto -translate-x-1/2 opacity-[0.07]"
      style={{ filter: mode === 'pdf' ? 'none' : 'blur(0.3px)' }}
    />
  )
}

export function BrandCrest({
  mode,
  className = '',
  sizePdf = 88,
  sizePreview = '22%'
}: {
  readonly mode: BusinessCardRenderMode
  readonly className?: string
  readonly sizePdf?: number
  readonly sizePreview?: string
}) {
  const src = brandLogoAssetUrl()
  const isPdf = mode === 'pdf'
  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={isPdf ? { width: sizePdf, height: sizePdf } : { width: sizePreview, aspectRatio: '1' }}
    >
      <div
        className="absolute inset-[-8%] rounded-full bg-[#136047]/25 blur-md"
        aria-hidden
      />
      <img
        src={src}
        alt=""
        draggable={false}
        decoding="async"
        className="relative h-full w-full object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
      />
    </div>
  )
}

export function ChromeRule({ className = '' }: { readonly className?: string }) {
  return (
    <div
      className={`h-[2px] w-full bg-gradient-to-r from-transparent via-[#d9be7a] to-transparent opacity-80 ${className}`}
      aria-hidden
    />
  )
}
