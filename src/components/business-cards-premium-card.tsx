/**
 * Golf Sol Ireland — premium luxury business card (company showcase).
 * Large Playfair + Inter typography, QR on front and back, 85×55mm landscape.
 */
import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { BusinessCardQr } from './business-card-qr'
import type { BusinessCardRenderMode } from '../lib/business-cards-catalog-types'
import { GOLFSOL_BRAND_LOGO_HOSTED, GOLFSOL_BRAND_LOGO_INTRINSIC } from '../lib/brand-logo-assets'
import {
  BC_CARD_LH,
  BC_CARD_LW,
  BC_PREMIUM,
  BC_PREMIUM_BACK_SERVICES,
  BC_PREMIUM_FRONT_BADGES
} from '../lib/business-cards-premium-tokens'
import { BRAND_BUSINESS_CARD_HERO_BG_SRC } from '../lib/brand-visual-assets'

const SHAMROCK = '/shamrock-from-logo.webp'

function bcAssetUrl(publicPath: string): string {
  if (/^https?:\/\//i.test(publicPath)) return publicPath
  const path = publicPath.startsWith('/') ? publicPath.slice(1) : publicPath
  const base = import.meta.env.BASE_URL
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${path}`
}

export function PremiumCardFigure({
  mode,
  children,
  className = ''
}: {
  readonly mode: BusinessCardRenderMode
  readonly children: ReactNode
  readonly className?: string
}) {
  const isPdf = mode === 'pdf'
  return (
    <figure
      className={
        isPdf
          ? `relative overflow-hidden rounded-[20px] [container-type:size] ${className}`
          : `relative mx-auto aspect-[85/55] w-full max-w-[720px] overflow-hidden rounded-[20px] shadow-[0_40px_100px_rgba(0,0,0,0.5),0_0_0_1px_rgba(200,167,93,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] [container-type:size] ${className}`
      }
      style={isPdf ? { width: BC_CARD_LW, height: BC_CARD_LH } : undefined}
    >
      {children}
    </figure>
  )
}

function GoldGradientText({
  children,
  className
}: {
  readonly children: ReactNode
  readonly className?: string
}) {
  return (
    <span
      className={className}
      style={{
        background: `linear-gradient(180deg, ${BC_PREMIUM.cream} 0%, ${BC_PREMIUM.gold} 50%, #a8894a 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}
    >
      {children}
    </span>
  )
}

/** Front — aerial fleet bg, large brand, email, QR, badges. */
export function PremiumCardFront({ mode }: { readonly mode: BusinessCardRenderMode }) {
  const isPdf = mode === 'pdf'
  const bg = bcAssetUrl(BRAND_BUSINESS_CARD_HERO_BG_SRC)
  const crest = bcAssetUrl(GOLFSOL_BRAND_LOGO_HOSTED)
  const shamrock = bcAssetUrl(SHAMROCK)
  const qrSize = isPdf ? 96 : 84

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[20px]">
      <img
        src={bg}
        alt=""
        className="absolute inset-0 h-full w-full scale-[1.06] object-cover object-[center_42%]"
        style={{ filter: 'blur(4px) brightness(0.55)' }}
        draggable={false}
        decoding="async"
        fetchPriority={isPdf ? 'high' : 'auto'}
        loading={isPdf ? 'eager' : 'lazy'}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(8,26,18,0.55) 0%, rgba(15,61,46,0.82) 45%, rgba(8,26,18,0.92) 100%)`
        }}
      />
      <img
        src={shamrock}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
        draggable={false}
      />

      <div className="relative z-[1] flex h-full flex-col items-center justify-between px-5 py-4 text-center sm:px-6 sm:py-5">
        <div className="flex flex-1 flex-col items-center justify-center pt-1">
          <img
            src={crest}
            alt=""
            width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
            height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
            className="mb-2 max-h-[min(24cqh,3.8rem)] w-auto object-contain drop-shadow-[0_6px_24px_rgba(200,167,93,0.45)]"
            decoding="async"
            draggable={false}
            fetchPriority={isPdf ? 'high' : 'auto'}
            loading={isPdf ? 'eager' : 'lazy'}
          />
          <GoldGradientText
            className={`font-bc-display font-black uppercase tracking-[0.06em] ${
              isPdf ? 'text-[1.35rem]' : 'text-[clamp(1.05rem,3.2vw,1.35rem)]'
            }`}
          >
            Golf Sol Ireland
          </GoldGradientText>
          <p
            className={`mt-1.5 max-w-[92%] font-bc-body font-semibold uppercase leading-snug tracking-[0.12em] text-[#F7F3EA] ${
              isPdf ? 'text-[0.48rem]' : 'text-[clamp(8px,2.2vw,0.48rem)]'
            }`}
          >
            Luxury Golf Transfers &amp; Golf Experiences
          </p>
          <a
            href={`mailto:${BC_PREMIUM.email}`}
            className={`mt-2 font-bc-body font-bold text-[#C8A75D] underline-offset-2 hover:underline ${
              isPdf ? 'text-[0.52rem]' : 'text-[clamp(9px,2.4vw,0.52rem)]'
            }`}
          >
            {BC_PREMIUM.email}
          </a>
          <div className="mt-2.5">
            <BusinessCardQr
              value={BC_PREMIUM.qrUrl}
              mode={mode}
              size={qrSize}
              label="Scan To Book Your Golf Transfer"
              labelStyle="below"
              variant="light"
              centerLogoSrc={crest}
              centerLogoSize={Math.round(qrSize * 0.22)}
              className="[&_p]:text-[#F7F3EA] [&_p]:tracking-[0.14em]"
            />
          </div>
        </div>

        <div
          className={`flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-[#C8A75D]/35 pt-2 font-bc-body font-bold uppercase tracking-[0.1em] text-[#F7F3EA] ${
            isPdf ? 'text-[0.3rem]' : 'text-[clamp(6px,1.6vw,0.3rem)]'
          }`}
        >
          {BC_PREMIUM_FRONT_BADGES.map((badge) => (
            <span key={badge} className="inline-flex items-center gap-0.5">
              <Check className="size-2 text-[#C8A75D]" strokeWidth={3} aria-hidden />
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Back — forest field, services, QR, contact. */
export function PremiumCardBack({ mode }: { readonly mode: BusinessCardRenderMode }) {
  const isPdf = mode === 'pdf'
  const crest = bcAssetUrl(GOLFSOL_BRAND_LOGO_HOSTED)
  const qrSize = isPdf ? 104 : 92

  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[20px]"
      style={{
        background: `linear-gradient(165deg, ${BC_PREMIUM.forestDeep} 0%, ${BC_PREMIUM.forest} 50%, #0a2a20 100%)`
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.4\'/%3E%3C/svg%3E")'
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(200,167,93,0.12),transparent_55%)]"
      />

      <div className="relative z-[1] flex h-full flex-col px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex shrink-0 flex-col items-center text-center">
          <img
            src={crest}
            alt=""
            width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
            height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
            className="max-h-[min(22cqh,3.2rem)] w-auto object-contain drop-shadow-[0_4px_20px_rgba(200,167,93,0.4)]"
            decoding="async"
            draggable={false}
            fetchPriority={isPdf ? 'high' : 'auto'}
            loading={isPdf ? 'eager' : 'lazy'}
          />
          <GoldGradientText
            className={`mt-2 font-bc-display font-bold uppercase tracking-[0.08em] ${
              isPdf ? 'text-[0.72rem]' : 'text-[clamp(0.58rem,1.8vw,0.72rem)]'
            }`}
          >
            Your Golf Journey Starts Here
          </GoldGradientText>
        </div>

        <ul
          className={`mt-3 grid flex-1 grid-cols-2 gap-x-3 gap-y-1.5 font-bc-body font-semibold text-[#F7F3EA] ${
            isPdf ? 'text-[0.38rem]' : 'text-[clamp(7px,1.9vw,0.38rem)]'
          }`}
        >
          {BC_PREMIUM_BACK_SERVICES.map((item) => (
            <li key={item} className="flex items-start gap-1">
              <span className="mt-0.5 size-1 shrink-0 rounded-full bg-[#C8A75D]" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-2 flex shrink-0 flex-col items-center gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div
            className={`text-center font-bc-body font-semibold text-[#F7F3EA] sm:text-left ${
              isPdf ? 'text-[0.38rem]' : 'text-[clamp(7px,1.9vw,0.38rem)]'
            }`}
          >
            <a href={`mailto:${BC_PREMIUM.email}`} className="block text-[#C8A75D] hover:underline">
              {BC_PREMIUM.email}
            </a>
            <a href={BC_PREMIUM.websiteHref} className="mt-0.5 block text-[#F7F3EA]/90 hover:text-[#C8A75D]">
              {BC_PREMIUM.website}
            </a>
          </div>
          <BusinessCardQr
            value={BC_PREMIUM.qrUrl}
            mode={mode}
            size={qrSize}
            label=""
            labelStyle="none"
            variant="light"
            centerLogoSrc={crest}
            centerLogoSize={Math.round(qrSize * 0.22)}
          />
        </div>
      </div>
    </div>
  )
}

export function PremiumCardFace({
  mode,
  side
}: {
  readonly mode: BusinessCardRenderMode
  readonly side: 'back' | 'front'
}) {
  return (
    <PremiumCardFigure mode={mode}>
      {side === 'front' ? <PremiumCardFront mode={mode} /> : <PremiumCardBack mode={mode} />}
      <figcaption className="sr-only">{side} — Golf Sol Ireland premium card</figcaption>
    </PremiumCardFigure>
  )
}
