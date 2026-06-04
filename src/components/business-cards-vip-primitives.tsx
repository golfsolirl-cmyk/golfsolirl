/**
 * Shared VIP chauffeur-style business card primitives — Golf Sol Ireland.
 * Matches premium reference: gold fleet panel front, centred crest + QR back.
 */
import type { ComponentType, ReactNode } from 'react'
import { FaBluesky, FaFacebookF, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa6'
import { Mail, MapPin, Phone } from 'lucide-react'
import { BusinessCardQr } from './business-card-qr'
import type { BusinessCardRenderMode } from '../lib/business-cards-catalog-types'
import { BRAND_BUSINESS_CARD_HERO_BG_SRC } from '../lib/brand-visual-assets'
import { GOLFSOL_BRAND_LOGO_HOSTED, GOLFSOL_BRAND_LOGO_INTRINSIC } from '../lib/brand-logo-assets'
import {
  businessCardContact,
  businessCardSocialLinks
} from '../lib/business-cards-config'
import type { FooterSocialLink } from '../data/site-content'

export const VIP_CARD_LW = 850
export const VIP_CARD_LH = Math.round((VIP_CARD_LW * 55) / 85)
export const VIP_CARD_PW = 550
export const VIP_CARD_PH = Math.round((VIP_CARD_PW * 85) / 55)

export const VIP_FOREST = '#0E3B2E'
export const VIP_FOREST_DEEP = '#063528'
export const VIP_GOLD = '#D4AF37'
export const VIP_CHAMPAGNE = '#E5C76B'

const CARD_BG_SRC = BRAND_BUSINESS_CARD_HERO_BG_SRC

const INSET_SCREEN = 'clamp(14px,3.2vmin,24px)'
const INSET_PDF = '18px'

export function vipInset(mode: BusinessCardRenderMode) {
  return mode === 'pdf' ? INSET_PDF : INSET_SCREEN
}

export function vipAssetUrl(publicPath: string): string {
  if (/^https?:\/\//i.test(publicPath)) return publicPath
  const path = publicPath.startsWith('/') ? publicPath.slice(1) : publicPath
  const base = import.meta.env.BASE_URL
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${path}`
}

const SOCIAL_ICON_MAP: Record<
  FooterSocialLink['label'],
  ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
> = {
  LinkedIn: FaLinkedinIn,
  Facebook: FaFacebookF,
  WhatsApp: FaWhatsapp,
  Bluesky: FaBluesky
}

export function VipPrintCardFigure({
  mode,
  orientation,
  children
}: {
  readonly mode: BusinessCardRenderMode
  readonly orientation: 'landscape' | 'portrait'
  readonly children: ReactNode
}) {
  const isPdf = mode === 'pdf'
  const w = orientation === 'landscape' ? VIP_CARD_LW : VIP_CARD_PW
  const h = orientation === 'landscape' ? VIP_CARD_LH : VIP_CARD_PH

  return (
    <figure
      className={
        isPdf
          ? 'relative overflow-hidden rounded-[14px] [container-type:size]'
          : `relative mx-auto overflow-hidden rounded-[14px] shadow-[0_32px_90px_rgba(0,0,0,0.38),0_0_0_1px_rgba(212,175,55,0.12)] [container-type:size] ${
              orientation === 'landscape' ? 'aspect-[85/55] w-full max-w-[720px]' : 'aspect-[55/85] w-full max-w-[420px]'
            }`
      }
      style={isPdf ? { width: w, height: h, backgroundColor: VIP_FOREST } : undefined}
    >
      {children}
    </figure>
  )
}

export function VipCrest({
  mode,
  size = 'small'
}: {
  readonly mode: BusinessCardRenderMode
  readonly size?: 'large' | 'small'
}) {
  const isPdf = mode === 'pdf'
  const src = vipAssetUrl(GOLFSOL_BRAND_LOGO_HOSTED)
  const sizeClass =
    size === 'large'
      ? 'max-h-[min(36cqh,5.25rem)] max-w-[min(52cqw,5.25rem)]'
      : 'max-h-[min(14cqh,2.2rem)] max-w-[min(20cqw,2.2rem)]'

  return (
    <img
      src={src}
      alt=""
      width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
      height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
      className={`h-auto w-auto object-contain drop-shadow-[0_4px_16px_rgba(212,175,55,0.35)] ${sizeClass}`}
      decoding="async"
      draggable={false}
      fetchPriority={isPdf ? 'high' : 'auto'}
      loading={isPdf ? 'eager' : 'lazy'}
    />
  )
}

/** Blurred golden-hour fleet plate — full card background with readable overlay. */
export function VipBlurredFleetBackground({
  mode,
  variant = 'front'
}: {
  readonly mode: BusinessCardRenderMode
  readonly variant?: 'back' | 'front'
}) {
  const isPdf = mode === 'pdf'
  const src = vipAssetUrl(CARD_BG_SRC)
  const isBack = variant === 'back'

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[14px]">
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full scale-[1.08] object-cover object-[center_42%]"
        style={{ filter: isPdf ? 'blur(5px) brightness(0.72)' : 'blur(6px) brightness(0.7)' }}
        draggable={false}
        decoding="async"
        fetchPriority={isPdf ? 'high' : 'auto'}
        loading={isPdf ? 'eager' : 'lazy'}
      />
      <div
        className="absolute inset-0"
        style={{
          background: isBack
            ? `linear-gradient(180deg, rgba(6,53,40,0.92) 0%, rgba(10,10,10,0.88) 55%, rgba(14,59,46,0.94) 100%)`
            : `linear-gradient(115deg, rgba(6,53,40,0.55) 0%, rgba(10,10,10,0.82) 48%, rgba(14,59,46,0.92) 100%)`
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_30%,rgba(212,175,55,0.12),transparent_55%)]" />
    </div>
  )
}

function VipTextPanel({
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
    <div
      className={`rounded-lg border border-[#D4AF37]/25 shadow-[0_8px_32px_rgba(0,0,0,0.45)] ${
        isPdf
          ? 'bg-[#0E3B2E]/92'
          : 'bg-[#0E3B2E]/78 backdrop-blur-[6px]'
      } ${className}`}
    >
      {children}
    </div>
  )
}

function GoldRule({ vertical }: { readonly vertical?: boolean }) {
  if (vertical) {
    return (
      <div aria-hidden className="mx-2 w-px shrink-0 self-stretch bg-gradient-to-b from-transparent via-[#D4AF37]/70 to-transparent" />
    )
  }
  return (
    <div
      aria-hidden
      className="my-2 h-px w-full max-w-[140px] bg-gradient-to-r from-[#D4AF37]/85 via-[#E5C76B]/50 to-transparent"
    />
  )
}

export function VipSocialRow({ mode }: { readonly mode: BusinessCardRenderMode }) {
  const isPdf = mode === 'pdf'
  const iconSize = isPdf ? 'size-3' : 'size-3'

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {businessCardSocialLinks.map(({ label, href }) => {
        const Icon = SOCIAL_ICON_MAP[label]
        return (
          <a
            key={label}
            href={href}
            aria-label={label}
            className="inline-flex h-5 w-5 items-center justify-center text-[#D4AF37] transition hover:text-[#E5C76B]"
          >
            <Icon className={iconSize} aria-hidden />
          </a>
        )
      })}
    </div>
  )
}

export type VipFrontProps = {
  readonly mode: BusinessCardRenderMode
  readonly orientation: 'landscape' | 'portrait'
  readonly name: string
  readonly roleTitle: string
  readonly phone?: string
  readonly phoneTel?: string
  readonly location?: string
  readonly email?: string
}

/** VIP reference front — gold fleet panel, crest, angled brand, clean contact. */
export function VipProfessionalFront({
  mode,
  orientation,
  name,
  roleTitle,
  phone = businessCardContact.phoneIe,
  phoneTel,
  location = 'Dublin · Costa del Sol',
  email
}: VipFrontProps) {
  const isPdf = mode === 'pdf'
  const isLandscape = orientation === 'landscape'
  const tel = phoneTel ?? phone.replace(/\s/g, '')

  const brandClass = isPdf
    ? isLandscape
      ? 'text-[0.88rem]'
      : 'text-[0.98rem]'
    : isLandscape
      ? 'text-[clamp(0.72rem,2.1vw,0.88rem)]'
      : 'text-[clamp(0.82rem,2.7vw,0.98rem)]'

  const nameClass = isPdf
    ? isLandscape
      ? 'text-[0.78rem]'
      : 'text-[0.88rem]'
    : isLandscape
      ? 'text-[clamp(0.68rem,1.9vw,0.78rem)]'
      : 'text-[clamp(0.74rem,2.4vw,0.88rem)]'

  const detailClass = isPdf ? 'text-[0.46rem]' : 'text-[clamp(7.5px,2.1vw,0.46rem)]'

  const identityBlock = (
    <>
      <div className="flex items-start gap-2">
        <VipCrest mode={mode} size="small" />
        <p
          className={`origin-top-left -rotate-[8deg] font-ge-display font-black uppercase leading-[0.92] tracking-[0.04em] text-[#E5C76B] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] ${brandClass}`}
        >
          Golf Sol
          <br />
          Ireland
        </p>
      </div>
      <GoldRule />
      <p className={`font-ge-display font-semibold text-[#F7F3E9] drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)] ${nameClass}`}>{name}</p>
      <p className={`mt-0.5 font-ge font-bold uppercase tracking-[0.16em] text-[#E5C76B] ${detailClass}`}>
        {roleTitle}
      </p>
      <div className={`mt-2.5 space-y-1.5 ${detailClass}`}>
        <a href={`tel:${tel}`} className="flex items-center gap-1.5 font-ge text-[#F7F3E9]/95">
          <Phone className="size-2.5 shrink-0 text-[#D4AF37]" strokeWidth={2.5} aria-hidden />
          <span>{phone}</span>
        </a>
        {email ? (
          <a href={`mailto:${email}`} className="flex items-center gap-1.5 font-ge text-[#F7F3E9]/90">
            <Mail className="size-2.5 shrink-0 text-[#D4AF37]" strokeWidth={2.5} aria-hidden />
            <span className="truncate">{email}</span>
          </a>
        ) : null}
        <p className="flex items-center gap-1.5 font-ge text-[#F7F3E9]/85">
          <MapPin className="size-2.5 shrink-0 text-[#D4AF37]" strokeWidth={2.5} aria-hidden />
          <span>{location}</span>
        </p>
      </div>
    </>
  )

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[14px]">
      <VipBlurredFleetBackground mode={mode} variant="front" />
      <div
        className={`relative z-[1] flex h-full ${isLandscape ? 'flex-row items-center justify-end' : 'flex-col justify-end'}`}
        style={{ padding: vipInset(mode) }}
      >
        {isLandscape ? (
          <VipTextPanel mode={mode} className="max-w-[58%] px-3.5 py-3">
            {identityBlock}
          </VipTextPanel>
        ) : (
          <VipTextPanel mode={mode} className="mb-[2%] w-full max-w-[92%] px-3 py-2.5">
            {identityBlock}
          </VipTextPanel>
        )}
      </div>
    </div>
  )
}

export type VipBackProps = {
  readonly mode: BusinessCardRenderMode
  readonly orientation: 'landscape' | 'portrait'
  readonly qrUrl?: string
  readonly qrLabel?: string
}

/** VIP reference back — centred crest, brand, social, large scannable QR. */
export function VipProfessionalBack({
  mode,
  orientation,
  qrUrl = businessCardContact.websiteUrl,
  qrLabel = 'SCAN TO BOOK'
}: VipBackProps) {
  const isPdf = mode === 'pdf'
  const isLandscape = orientation === 'landscape'

  const brandClass = isPdf
    ? isLandscape
      ? 'text-[0.68rem]'
      : 'text-[0.76rem]'
    : isLandscape
      ? 'text-[clamp(0.58rem,1.7vw,0.68rem)]'
      : 'text-[clamp(0.64rem,2vw,0.76rem)]'

  const qrSize = isLandscape ? (isPdf ? 118 : 100) : isPdf ? 132 : 112

  const centreBlock = (
    <>
      <VipCrest mode={mode} size="large" />
      <p
        className={`mt-2 text-center font-ge-display font-black uppercase leading-tight tracking-[0.1em] text-[#E5C76B] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] ${brandClass}`}
      >
        Golf Sol Ireland
      </p>
      <p
        className={`mt-1 text-center font-ge font-medium uppercase tracking-[0.14em] text-[#E5C76B]/70 ${
          isPdf ? 'text-[0.32rem]' : 'text-[clamp(6px,1.6vw,0.32rem)]'
        }`}
      >
        Luxury golf transfers · Costa del Sol
      </p>
      <div className="my-2.5">
        <VipSocialRow mode={mode} />
      </div>
      <BusinessCardQr value={qrUrl} mode={mode} label={qrLabel} size={qrSize} variant="light" />
    </>
  )

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[14px]">
      <VipBlurredFleetBackground mode={mode} variant="back" />
      <div
        className="relative z-[1] flex w-full max-w-[88%] flex-col items-center"
        style={{ padding: vipInset(mode) }}
      >
        <VipTextPanel mode={mode} className="w-full px-4 py-3.5">
          {centreBlock}
        </VipTextPanel>
      </div>
    </div>
  )
}
