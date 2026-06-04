import type { CSSProperties, ReactNode } from 'react'
import { brandLogoAssetUrl } from '../lib/brand-logo-assets'
import { BRAND_BUSINESS_CARD_HERO_BG_SRC } from '../lib/brand-visual-assets'
import { BusinessCardQr } from '../components/business-card-qr'
import {
  CARD_LANDSCAPE_H,
  CARD_LANDSCAPE_W,
  CARD_PERSON,
  CARD_PORTRAIT_H,
  CARD_PORTRAIT_W,
  cardFont,
  cardNameFont,
  cardPublicUrl,
  cardRoleFont,
  type CardRenderMode
} from './tokens'

const SHAMROCK = '/shamrock-from-logo.webp'

export function CardShell({
  mode,
  orientation,
  children,
  className = ''
}: {
  readonly mode: CardRenderMode
  readonly orientation: 'landscape' | 'portrait'
  readonly children: ReactNode
  readonly className?: string
}) {
  const isPdf = mode === 'pdf'
  const w = orientation === 'landscape' ? CARD_LANDSCAPE_W : CARD_PORTRAIT_W
  const h = orientation === 'landscape' ? CARD_LANDSCAPE_H : CARD_PORTRAIT_H

  return (
    <figure
      className={
        isPdf
          ? `relative overflow-hidden rounded-[18px] [container-type:size] ${className}`
          : `relative mx-auto overflow-hidden rounded-[18px] shadow-[0_32px_88px_rgba(0,0,0,0.5),0_0_0_1px_rgba(217,190,122,0.3)] [container-type:size] ${className} ${
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

export function GoldText({
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
        backgroundImage: 'linear-gradient(135deg, #fff5cf 0%, #f4dfa6 48%, #d9be7a 100%)',
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

export function FleetBackdrop({ mode }: { readonly mode: CardRenderMode }) {
  const src = cardPublicUrl(BRAND_BUSINESS_CARD_HERO_BG_SRC)
  return (
    <>
      <img
        src={src}
        alt=""
        aria-hidden
        draggable={false}
        decoding="async"
        className="absolute inset-0 h-full w-full scale-[1.1] object-cover object-[center_40%]"
        style={{ filter: 'blur(4px) brightness(0.68) saturate(1.08)' }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(165deg, rgba(4,20,12,0.9) 0%, rgba(11,77,59,0.5) 45%, rgba(4,20,12,0.94) 100%)'
        }}
        aria-hidden
      />
    </>
  )
}

export function CardCrest({
  mode,
  sizePdf = 80,
  sizePreview = '24%',
  className = ''
}: {
  readonly mode: CardRenderMode
  readonly sizePdf?: number
  readonly sizePreview?: string
  readonly className?: string
}) {
  const isPdf = mode === 'pdf'
  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={isPdf ? { width: sizePdf, height: sizePdf } : { width: sizePreview, aspectRatio: '1' }}
    >
      <div className="absolute inset-[-10%] rounded-full bg-[#136047]/30 blur-md" aria-hidden />
      <img
        src={brandLogoAssetUrl()}
        alt=""
        draggable={false}
        decoding="async"
        className="relative h-full w-full object-contain drop-shadow-[0_10px_28px_rgba(0,0,0,0.45)]"
      />
    </div>
  )
}

export function CardQr({
  mode,
  sizePdf,
  sizePreview,
  variant = 'light',
  labelStyle = 'foil-button' as const
}: {
  readonly mode: CardRenderMode
  readonly sizePdf: number
  readonly sizePreview: number
  readonly variant?: 'dark' | 'light'
  readonly labelStyle?: 'below' | 'foil-button' | 'none'
}) {
  const size = mode === 'pdf' ? sizePdf : sizePreview
  return (
    <BusinessCardQr
      mode={mode}
      value="https://www.golfsolirl.com"
      size={size}
      variant={variant}
      label="Scan to book your transfer"
      labelStyle={labelStyle}
      centerLogoSrc={brandLogoAssetUrl()}
      centerLogoSize={Math.round(size * 0.22)}
    />
  )
}

export function GoldRule({ className = '' }: { readonly className?: string }) {
  return (
    <div
      className={`h-[2px] bg-gradient-to-r from-transparent via-[#d9be7a] to-transparent opacity-90 ${className}`}
      aria-hidden
    />
  )
}

export function CornerBracket({ corner }: { readonly corner: 'bl' | 'br' | 'tl' | 'tr' }) {
  const pos =
    corner === 'tl'
      ? 'left-[3%] top-[3%]'
      : corner === 'tr'
        ? 'right-[3%] top-[3%] rotate-90'
        : corner === 'bl'
          ? 'left-[3%] bottom-[3%] -rotate-90'
          : 'right-[3%] bottom-[3%] rotate-180'

  return (
    <svg
      viewBox="0 0 40 40"
      className={`pointer-events-none absolute ${pos} h-[12%] w-[12%] min-h-[24px] min-w-[24px] text-[#d9be7a]/70`}
      aria-hidden
    >
      <path fill="none" stroke="currentColor" strokeWidth="1.2" d="M2 38 V2 H38" />
    </svg>
  )
}

export function CardGrain() {
  return (
    <div
      className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.09]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
      }}
      aria-hidden
    />
  )
}

export function ShamrockWatermark({ className = '' }: { readonly className?: string }) {
  return (
    <img
      src={cardPublicUrl(SHAMROCK)}
      alt=""
      aria-hidden
      draggable={false}
      className={`pointer-events-none absolute left-1/2 top-[42%] h-[45%] w-auto -translate-x-1/2 opacity-[0.06] ${className}`}
    />
  )
}

/** Diagonal gold chrome beam — luxury accent. */
export function DiagonalGoldBeam() {
  return (
    <div
      className="pointer-events-none absolute -left-[20%] top-[18%] h-[140%] w-[38%] rotate-[24deg] opacity-40"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(217,190,122,0.35), transparent)'
      }}
      aria-hidden
    />
  )
}

export function GoldDoubleFrame({ inset }: { readonly inset: string }) {
  return (
    <>
      <div
        className="pointer-events-none absolute rounded-[14px] border border-[#d9be7a]/45"
        style={{ inset }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute rounded-[10px] border border-[#fff5cf]/12"
        style={{ inset: `calc(${inset} + 3px)` }}
        aria-hidden
      />
    </>
  )
}

export function ChromeSideStrip({ side = 'left' }: { readonly side?: 'left' | 'right' }) {
  return (
    <div
      className={`pointer-events-none absolute ${side === 'left' ? 'left-0' : 'right-0'} top-[8%] h-[84%] w-[4px]`}
      style={{
        background: 'linear-gradient(180deg, transparent, #d9be7a 20%, #fff5cf 50%, #d9be7a 80%, transparent)'
      }}
      aria-hidden
    />
  )
}

/** Hero name block — Martin Kelly + Operations, foil plate. */
export function PersonNamePlate({
  mode,
  orientation,
  align = 'center',
  compact = false
}: {
  readonly mode: CardRenderMode
  readonly orientation: 'landscape' | 'portrait'
  readonly align?: 'center' | 'left'
  readonly compact?: boolean
}) {
  const textAlign = align === 'center' ? 'text-center' : 'text-left'

  return (
    <div
      className={`relative overflow-hidden rounded-[10px] border border-[#d9be7a]/50 bg-[#04140c]/75 px-[6%] py-[4%] shadow-[inset_0_1px_0_rgba(255,245,207,0.25),0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-[2px] ${textAlign} ${
        compact ? 'py-[3%]' : ''
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,245,207,0.15) 50%, transparent 60%)'
        }}
        aria-hidden
      />
      <p
        className={`relative font-ge font-black uppercase leading-[0.92] tracking-[-0.02em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] ${textAlign}`}
        style={{ fontSize: cardNameFont(mode, orientation) }}
      >
        {CARD_PERSON.name.split(' ').map((part, i) => (
          <span key={part} className={i === 1 ? 'block' : undefined}>
            {part}
          </span>
        ))}
      </p>
      <div
        className={`relative mt-[0.35em] inline-block w-full border-y border-[#d9be7a]/40 bg-gradient-to-r from-[#0b4d3b]/90 via-[#136047]/80 to-[#0b4d3b]/90 px-[4%] py-[0.28em] ${align === 'center' ? 'mx-auto' : ''}`}
      >
        <p
          className="font-ge font-black uppercase tracking-[0.22em] text-[#fff5cf]"
          style={{
            fontSize: cardRoleFont(mode, orientation),
            textShadow: '0 0 20px rgba(217,190,122,0.35)'
          }}
        >
          {CARD_PERSON.role}
        </p>
      </div>
    </div>
  )
}

export function FoilBadge({
  mode,
  children
}: {
  readonly mode: CardRenderMode
  readonly children: ReactNode
}) {
  return (
    <span
      className="inline-block rounded-full border border-[#d9be7a]/45 bg-[#062016]/80 px-[0.65em] py-[0.2em] font-ge font-extrabold uppercase tracking-[0.16em] text-[#f4dfa6] shadow-[0_0_12px_rgba(217,190,122,0.2)]"
      style={{ fontSize: cardFont(mode, '0.32rem', 'clamp(6px,2cqw,0.36rem)') }}
    >
      {children}
    </span>
  )
}

export { cardFont, cardNameFont, cardRoleFont, CARD_PERSON }
