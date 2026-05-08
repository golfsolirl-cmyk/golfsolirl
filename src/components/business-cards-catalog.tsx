import { useCallback, useState, type ReactNode } from 'react'
import { FileDown, Globe, Mail, Phone } from 'lucide-react'
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa6'
import { SiWhatsapp } from 'react-icons/si'
import { cx } from '../lib/utils'
import { saveSingleBusinessCardPdf } from '../lib/save-business-cards-pdf'
import { BRAND_FLEET_LINEUP_ALT, BRAND_FLEET_LINEUP_IMAGE_SRC } from '../lib/brand-visual-assets'
import {
  businessCardAssets,
  businessCardContact,
  businessCardPerson,
  businessCardSocial
} from '../lib/business-cards-config'

/** Matches `server/branded-email-shell.mjs` / enquiry-customer email */
const GS_BG = '#F4F7F5'
const GS_DARK = '#063B2A'
const GS_GOLD = '#FFC72C'

const OFF_WHITE = '#FFFFFF'
const CREAM = '#fffcf6'
const FOREST = GS_DARK
const INK = GS_DARK

/**
 * Taller than ISO so contact blocks + fleet panels rarely clip; still reads “business card” in grid.
 */
const CARD_PREVIEW = 'aspect-[3.5/3.12] w-full max-w-[min(100%,600px)]'

/** Premium duplex fronts — room for larger wordmark */
const CARD_FACE_PREMIUM_FRONT = 'w-full max-w-[min(100%,600px)] aspect-[3.5/3.42] sm:aspect-[3.5/3.38]'

/** Premium duplex backs — extra vertical canvas so name + contact + social never clip */
const CARD_FACE_PREMIUM_BACK =
  'w-full max-w-[min(100%,600px)] aspect-[3.5/3.95] sm:aspect-[3.5/3.82] min-h-[280px] sm:min-h-0'

/** Warm gold edge + optional soft “sunny” glow (premium card trim language). */
function SunnyHairline({ glow = 'top-right' }: { readonly glow?: 'top-right' | 'none' }) {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-[2px]"
        style={{
          background:
            'linear-gradient(90deg, transparent 2%, rgba(255,220,150,0.35) 14%, rgba(255,199,44,0.95) 42%, rgba(255,242,200,1) 50%, rgba(255,199,44,0.95) 58%, rgba(255,220,150,0.35) 86%, transparent 98%)',
          boxShadow: '0 1px 12px rgba(255,199,44,0.35)'
        }}
      />
      {glow !== 'none' ? (
        <div
          aria-hidden
          className={cx(
            'pointer-events-none absolute z-[1] h-36 w-36 rounded-full opacity-80 blur-3xl',
            glow === 'top-right' ? '-right-12 -top-10' : ''
          )}
          style={{
            background:
              'radial-gradient(circle at 50% 40%, rgba(255,226,140,0.55) 0%, rgba(255,199,44,0.22) 42%, transparent 72%)'
          }}
        />
      ) : null}
    </>
  )
}

function SunnyHairlineBottom() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[1px]"
      style={{
        background:
          'linear-gradient(90deg, transparent 5%, rgba(255,199,44,0.55) 50%, transparent 95%)',
        boxShadow: '0 -1px 10px rgba(255,199,44,0.2)'
      }}
    />
  )
}

function FlagIE({ className }: { readonly className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 16" aria-hidden>
      <rect fill="#169b62" height="16" width="8" x="0" y="0" />
      <rect fill="#ffffff" height="16" width="8" x="8" y="0" />
      <rect fill="#ff883e" height="16" width="8" x="16" y="0" />
    </svg>
  )
}

function FlagES({ className }: { readonly className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 16" aria-hidden>
      <rect fill="#aa151b" height="4" width="24" y="0" />
      <rect fill="#f1bf00" height="8" width="24" y="4" />
      <rect fill="#aa151b" height="4" width="24" y="12" />
    </svg>
  )
}

function FlagPair({ className }: { readonly className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-white/50 px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]',
        className
      )}
    >
      <FlagIE className="h-4 w-6 rounded-[3px] shadow-sm ring-1 ring-black/[0.06]" />
      <span className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-forest-900/45">·</span>
      <FlagES className="h-4 w-6 rounded-[3px] shadow-sm ring-1 ring-black/[0.06]" />
    </span>
  )
}

function CrestLockup({ className }: { readonly className?: string }) {
  const [src, setSrc] = useState<string>(businessCardAssets.crestWidePng)
  return (
    <img
      alt=""
      className={className}
      decoding="async"
      src={src}
      onError={() => {
        if (src !== businessCardAssets.crestSvg) {
          setSrc(businessCardAssets.crestSvg)
        }
      }}
    />
  )
}

function SiteLogoMark({ className }: { readonly className?: string }) {
  return <img alt="" className={className} decoding="async" src={businessCardAssets.siteLogoSvg} />
}

function SocialIconRow({ variant, size = 'md' }: { readonly variant: 'light' | 'dark'; readonly size?: 'sm' | 'md' }) {
  const isSm = size === 'sm'
  const ring =
    variant === 'light'
      ? 'border border-[#063B2A]/12 bg-white text-[#063B2A] shadow-sm hover:border-[#0B6B45]/25 hover:shadow-md'
      : 'border border-white/30 bg-white/12 text-white shadow-sm hover:bg-white/20'

  const items = [
    { href: businessCardSocial.whatsapp, label: 'WhatsApp', Icon: SiWhatsapp },
    { href: businessCardSocial.facebook, label: 'Facebook', Icon: FaFacebookF },
    { href: businessCardSocial.instagram, label: 'Instagram', Icon: FaInstagram },
    { href: businessCardSocial.linkedin, label: 'LinkedIn', Icon: FaLinkedinIn }
  ] as const

  return (
    <div className={cx('flex flex-nowrap items-center', isSm ? 'gap-2' : 'gap-2.5')}>
      {items.map(({ href, label, Icon }) => (
        <a
          key={label}
          aria-label={label}
          className={cx(
            'inline-flex items-center justify-center rounded-full transition duration-200',
            isSm ? 'h-8 w-8' : 'h-9 w-9',
            ring
          )}
          href={href}
          rel="noreferrer"
          target="_blank"
        >
          <Icon className={isSm ? 'h-[15px] w-[15px]' : 'h-[17px] w-[17px]'} aria-hidden />
        </a>
      ))}
    </div>
  )
}

/** Professional contact stack: email, web URL, phones, Co. Reg. — generous leading; bold where it aids scanability. */
function ContactBlock({
  className,
  coRegStyle = 'single-line',
  tone = 'light',
  coRegClassName,
  omitWebsite = false
}: {
  readonly className?: string
  readonly coRegStyle?: 'single-line' | 'stacked'
  readonly tone?: 'light' | 'dark'
  readonly coRegClassName?: string
  readonly omitWebsite?: boolean
}) {
  const dark = tone === 'dark'
  const ink = dark ? 'text-emerald-50/95' : 'text-[#063B2A]/90'
  const muted = dark ? 'text-emerald-100/55' : 'text-[#4e4e4e]'
  const border = dark ? 'border-white/15' : 'border-[#063B2A]/10'
  const borderTop = dark ? 'border-white/15' : 'border-[#063B2A]/10'
  const label = dark ? 'text-emerald-100/70' : 'text-[#0B6B45]/90'

  return (
    <div className={cx('font-ge text-[0.78rem] leading-[1.5] sm:text-[0.8rem]', ink, className)}>
      <a
        className={cx('group flex items-start gap-2.5 border-b pb-2 text-left transition', border, dark ? 'hover:text-white' : 'hover:text-[#063B2A]')}
        href={`mailto:${businessCardContact.email}`}
      >
        <Mail className={cx('mt-[3px] h-3.5 w-3.5 shrink-0', muted)} aria-hidden />
        <span className="min-w-0 break-words font-semibold tracking-[-0.01em] underline-offset-2 group-hover:underline">
          {businessCardContact.email}
        </span>
      </a>
      {omitWebsite ? null : (
        <a
          className={cx('mt-2 flex items-start gap-2.5 border-b pb-2 text-left font-bold tracking-[-0.01em] transition', border, dark ? 'hover:text-white' : 'hover:text-[#063B2A]')}
          href={businessCardContact.websiteUrl}
          rel="noreferrer"
          target="_blank"
        >
          <Globe className={cx('mt-[3px] h-3.5 w-3.5 shrink-0', muted)} aria-hidden />
          <span className="min-w-0 break-all">{businessCardContact.websiteDisplay}</span>
        </a>
      )}
      <div className="mt-2 space-y-1.5">
        <a
          className={cx('flex min-w-0 items-start gap-2.5 text-left font-semibold tracking-[-0.01em] transition', dark ? 'hover:text-white' : 'hover:text-[#063B2A]')}
          href={`tel:${businessCardContact.phoneIe.replace(/\s/g, '')}`}
        >
          <Phone className={cx('mt-[3px] h-3.5 w-3.5 shrink-0', muted)} aria-hidden />
          <span className="min-w-0 break-words">
            <span className={cx('mr-2 text-[0.65rem] font-bold uppercase tracking-[0.14em]', label)}>Ireland</span>
            {businessCardContact.phoneIe}
          </span>
        </a>
        <a
          className={cx('flex min-w-0 items-start gap-2.5 text-left font-semibold tracking-[-0.01em] transition', dark ? 'hover:text-white' : 'hover:text-[#063B2A]')}
          href={`tel:${businessCardContact.phoneEs.replace(/\s/g, '')}`}
        >
          <Phone className={cx('mt-[3px] h-3.5 w-3.5 shrink-0', muted)} aria-hidden />
          <span className="min-w-0 break-words">
            <span className={cx('mr-2 text-[0.65rem] font-bold uppercase tracking-[0.14em]', label)}>Spain</span>
            {businessCardContact.phoneEs}
          </span>
        </a>
      </div>
      {coRegStyle === 'stacked' ? (
        <div className={cx('mt-2.5 border-t pt-2.5', borderTop)}>
          <span className={cx('block font-ge text-[0.58rem] font-bold uppercase leading-tight tracking-[0.14em]', dark ? 'text-emerald-100/75' : 'text-forest-700/78')}>
            Co. Reg.
          </span>
          <span className={cx('mt-0.5 block font-ge text-[0.68rem] font-bold uppercase tracking-[0.12em]', dark ? 'text-white' : 'text-forest-800/95')}>
            Ireland {businessCardContact.companyRegIreland}
          </span>
        </div>
      ) : (
        <p
          className={cx(
            'mt-2.5 border-t pt-2.5 font-bold leading-snug tracking-[0.06em] normal-case',
            dark ? 'border-white/15 text-[0.62rem] text-emerald-100/95' : 'border-black/[0.06] text-[0.62rem] text-forest-900/92 sm:text-[0.66rem]',
            coRegClassName
          )}
        >
          Co. Reg. Ireland {businessCardContact.companyRegIreland}
        </p>
      )}
    </div>
  )
}

function NameBlock({
  centered,
  large,
  compact,
  boldTagline,
  tone = 'dark'
}: {
  readonly centered?: boolean
  readonly large?: boolean
  /** Slightly smaller type for dense / photo-backed cards. */
  readonly compact?: boolean
  readonly boldTagline?: boolean
  /** `light` = white type on fleet / nocturne photography. */
  readonly tone?: 'dark' | 'light'
}) {
  const onPhoto = tone === 'light'
  return (
    <div className={cx(centered && 'text-center')}>
      <p
        className={cx(
          'font-display font-black tracking-[-0.025em]',
          compact
            ? 'text-[1.28rem] leading-[1.14] sm:text-[1.38rem]'
            : large
              ? 'text-[1.65rem] leading-[1.12] sm:text-[1.85rem]'
              : 'text-[1.45rem] leading-[1.15] sm:text-[1.6rem]',
          onPhoto && 'text-white [text-shadow:0_2px_22px_rgba(0,0,0,0.65)]'
        )}
        style={onPhoto ? undefined : { color: INK }}
      >
        {businessCardPerson.name}
      </p>
      <p
        className={cx(
          'mt-1.5 font-ge uppercase tracking-[0.26em] sm:tracking-[0.26em]',
          compact ? 'text-[0.62rem] leading-snug sm:text-[0.64rem]' : 'mt-2 text-[0.68rem] sm:text-[0.72rem]',
          boldTagline ? 'font-bold' : 'font-semibold',
          onPhoto ? 'text-emerald-50/95 [text-shadow:0_1px_14px_rgba(0,0,0,0.5)]' : 'text-[#0B6B45]/85'
        )}
      >
        {businessCardPerson.tagline}
      </p>
    </div>
  )
}

const cardShell =
  'relative min-h-0 overflow-hidden rounded-[2rem] shadow-[0_26px_70px_rgba(40,33,19,0.12)] ring-1 ring-black/[0.06]'

/** Luxury duplex suite — softer radius, print-depth shadow, minimal ring */
const premiumShell =
  'relative isolate min-h-0 overflow-hidden rounded-[1.35rem] shadow-[0_22px_56px_rgba(12,12,14,0.09),0_1px_0_rgba(255,255,255,0.8)_inset] ring-1 ring-black/[0.045]'

const LUX_PAPER = '#FAFAF8'
const LUX_LINEN = '#EFEBE4'
const LUX_NOIR = '#0B1210'
const LUX_ANTIQUE_GOLD = '#B8A06E'

function DuplexSideLabel({ side }: { readonly side: 'Front' | 'Back' }) {
  return (
    <p
      data-html2canvas-ignore="true"
      className="mb-2 font-premium text-[0.58rem] font-semibold uppercase tracking-[0.42em] text-[#063B2A]/38"
    >
      {side}
    </p>
  )
}

/** Fine grain overlay — suggests matte laminate / soft-touch stock */
function MatteGrainOverlay({ opacity = 0.22 }: { readonly opacity?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
        mixBlendMode: 'multiply'
      }}
    />
  )
}

/** Minimal contact stack — premium backs (no icons, strong hierarchy) */
function PremiumContactMinimal({
  tone = 'light',
  className
}: {
  readonly tone?: 'light' | 'dark'
  readonly className?: string
}) {
  const dark = tone === 'dark'
  const ink = dark ? 'text-emerald-50/97' : 'text-[#0D0D0D]'
  const soft = dark ? 'text-emerald-100/58' : 'text-[#7a7f7c]'
  const rule = dark ? 'border-white/12' : 'border-black/[0.06]'
  return (
    <div
      className={cx(
        'font-premium text-[0.82rem] leading-[1.58] break-words sm:text-[0.85rem] sm:leading-[1.55]',
        ink,
        className
      )}
    >
      <a
        className={cx('block font-bold tracking-[-0.018em] transition', dark ? 'hover:text-white' : 'hover:opacity-80')}
        href={`mailto:${businessCardContact.email}`}
      >
        {businessCardContact.email}
      </a>
      <a
        className={cx(
          'mt-3 block font-bold tracking-[-0.018em] transition break-all sm:break-words',
          dark ? 'hover:text-white' : 'hover:opacity-80'
        )}
        href={businessCardContact.websiteUrl}
        rel="noreferrer"
        target="_blank"
      >
        {businessCardContact.websiteDisplay}
      </a>
      <div className={cx('my-4 h-px w-full bg-gradient-to-r from-transparent via-current to-transparent opacity-[0.18]', soft)} aria-hidden />
      <div className="space-y-2.5">
        <p className="min-w-0">
          <span className={cx('mr-2 text-[0.6rem] font-bold uppercase tracking-[0.16em]', soft)}>Ireland</span>
          <a className={cx('font-semibold tracking-[-0.012em]', dark ? 'hover:text-white' : 'hover:opacity-80')} href={`tel:${businessCardContact.phoneIe.replace(/\s/g, '')}`}>
            {businessCardContact.phoneIe}
          </a>
        </p>
        <p className="min-w-0">
          <span className={cx('mr-2 text-[0.6rem] font-bold uppercase tracking-[0.16em]', soft)}>Spain</span>
          <a className={cx('font-semibold tracking-[-0.012em]', dark ? 'hover:text-white' : 'hover:opacity-80')} href={`tel:${businessCardContact.phoneEs.replace(/\s/g, '')}`}>
            {businessCardContact.phoneEs}
          </a>
        </p>
      </div>
      <p className={cx('mt-5 border-t pt-4 text-[0.6rem] font-semibold uppercase tracking-[0.18em]', rule, soft)}>
        Co. Reg. Ireland {businessCardContact.companyRegIreland}
      </p>
    </div>
  )
}

function CardPremium01IvoryDuplex() {
  return (
    <div className="w-full max-w-[min(100%,600px)]">
      <DuplexSideLabel side="Front" />
      <div className={cx(CARD_FACE_PREMIUM_FRONT, premiumShell)} style={{ backgroundColor: LUX_PAPER }}>
        <MatteGrainOverlay />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B8A06E]/55 to-transparent"
        />
        <div className="relative flex h-full min-h-0 flex-col px-8 py-10 sm:px-10 sm:py-11">
          <SiteLogoMark className="h-[76px] w-auto max-w-[min(94%,340px)] object-contain object-left opacity-[0.96] sm:h-[84px]" />
          <div className="mt-8 h-[2px] w-14 rounded-full" style={{ backgroundColor: LUX_ANTIQUE_GOLD }} aria-hidden />
          <p className="mt-8 font-premium text-[0.76rem] font-bold uppercase tracking-[0.22em] text-[#141414] sm:text-[0.8rem]">{businessCardPerson.tagline}</p>
          <p className="mt-3 max-w-[18rem] font-premium text-[0.66rem] font-semibold uppercase leading-relaxed tracking-[0.14em] text-[#5a605c] sm:text-[0.68rem]">
            {businessCardPerson.premiumDescriptor}
          </p>
          <div className="mt-auto border-t border-black/[0.055] pt-5">
            <p className="font-premium text-[0.56rem] font-bold uppercase tracking-[0.3em] text-[#8e908c] sm:text-[0.58rem]">{businessCardPerson.corridorLine}</p>
          </div>
        </div>
      </div>

      <div className="h-8" data-html2canvas-ignore="true" aria-hidden />

      <DuplexSideLabel side="Back" />
      <div className={cx(CARD_FACE_PREMIUM_BACK, premiumShell)} style={{ backgroundColor: LUX_PAPER }}>
        <MatteGrainOverlay opacity={0.18} />
        <div className="relative flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain px-8 py-9 sm:px-10 sm:py-10">
          <div className="shrink-0">
            <h3 className="font-premium text-[1.52rem] font-bold leading-[1.08] tracking-[-0.038em] text-[#0a0a0a] sm:text-[1.68rem]">
              {businessCardPerson.name}
            </h3>
            <p className="mt-2 font-premium text-[0.68rem] font-bold uppercase leading-snug tracking-[0.18em] text-[#2d3d36] sm:text-[0.72rem]">{businessCardPerson.roleTitle}</p>
          </div>
          <div
            className="my-6 h-px w-full shrink-0 bg-gradient-to-r from-[#063B2A]/18 via-[#B8A06E]/35 to-transparent"
            aria-hidden
          />
          <PremiumContactMinimal className="min-h-0 shrink pb-2" />
          <div className="mt-auto flex shrink-0 justify-center border-t border-black/[0.06] pt-4">
            <SocialIconRow size="sm" variant="light" />
          </div>
        </div>
      </div>
    </div>
  )
}

function CardPremium02NoirDuplex() {
  return (
    <div className="w-full max-w-[min(100%,600px)]">
      <DuplexSideLabel side="Front" />
      <div className={cx(CARD_FACE_PREMIUM_FRONT, premiumShell)} style={{ backgroundColor: LUX_NOIR }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(184,160,110,0.12)_0%,transparent_50%)]"
        />
        <div className="relative flex h-full min-h-0 flex-col px-8 py-10 sm:px-10 sm:py-11">
          <SiteLogoMark className="h-[74px] w-auto max-w-[min(94%,340px)] object-contain object-left brightness-0 invert opacity-[0.95] sm:h-[82px]" />
          <div className="mt-8 h-[2px] w-14 rounded-full bg-[#c4a86a]/90" aria-hidden />
          <p className="mt-8 font-premium text-[0.74rem] font-bold uppercase tracking-[0.24em] text-white/95 sm:text-[0.78rem]">{businessCardPerson.tagline}</p>
          <p className="mt-3 max-w-[18rem] font-premium text-[0.64rem] font-semibold uppercase leading-relaxed tracking-[0.13em] text-white/55 sm:text-[0.66rem]">
            {businessCardPerson.premiumDescriptor}
          </p>
          <div className="mt-auto border-t border-white/[0.08] pt-5">
            <p className="font-premium text-[0.54rem] font-bold uppercase tracking-[0.3em] text-white/42 sm:text-[0.56rem]">{businessCardPerson.corridorLine}</p>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-10 bottom-8 h-px bg-gradient-to-r from-transparent via-[#B8A06E]/75 to-transparent" aria-hidden />
      </div>

      <div className="h-8" data-html2canvas-ignore="true" aria-hidden />

      <DuplexSideLabel side="Back" />
      <div className={cx(CARD_FACE_PREMIUM_BACK, premiumShell)} style={{ backgroundColor: LUX_PAPER }}>
        <MatteGrainOverlay opacity={0.2} />
        <div className="relative flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain px-8 py-9 sm:px-10 sm:py-10">
          <div className="shrink-0">
            <h3 className="font-premium text-[1.52rem] font-bold leading-[1.08] tracking-[-0.038em] text-[#0a0a0a] sm:text-[1.68rem]">{businessCardPerson.name}</h3>
            <p className="mt-2 font-premium text-[0.68rem] font-bold uppercase leading-snug tracking-[0.18em] text-[#2d3d36] sm:text-[0.72rem]">{businessCardPerson.roleTitle}</p>
          </div>
          <div className="my-6 h-px w-full shrink-0 bg-gradient-to-r from-[#063B2A]/14 via-[#B8A06E]/32 to-transparent" aria-hidden />
          <PremiumContactMinimal className="min-h-0 shrink pb-2" />
          <div className="mt-auto flex shrink-0 justify-center border-t border-black/[0.06] pt-4">
            <SocialIconRow size="sm" variant="light" />
          </div>
        </div>
      </div>
    </div>
  )
}

function CardPremium03LinenDuplex() {
  return (
    <div className="w-full max-w-[min(100%,600px)]">
      <DuplexSideLabel side="Front" />
      <div className={cx(CARD_FACE_PREMIUM_FRONT, premiumShell)} style={{ backgroundColor: LUX_LINEN }}>
        <div className="pointer-events-none absolute inset-y-6 left-0 z-[2] w-[3px] rounded-full bg-gradient-to-b from-[#B8A06E] via-[#063B2A]/55 to-[#B8A06E]/90" aria-hidden />
        <MatteGrainOverlay opacity={0.28} />
        <div className="relative flex h-full min-h-0 flex-col py-10 pl-10 pr-8 sm:py-11 sm:pl-12 sm:pr-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <SiteLogoMark className="h-[72px] w-auto max-w-[min(94%,300px)] shrink-0 object-contain object-left opacity-[0.94] sm:h-[80px]" />
            <p className="max-w-[12.5rem] text-right font-premium text-[0.56rem] font-bold uppercase leading-relaxed tracking-[0.18em] text-[#4f5552] sm:pt-1 sm:text-[0.58rem]">
              Irish-owned
              <br />
              international golf travel
            </p>
          </div>
          <div className="mt-auto space-y-2.5 border-t border-[#063B2A]/10 pt-6">
            <p className="font-premium text-[0.76rem] font-bold uppercase tracking-[0.2em] text-[#121816] sm:text-[0.78rem]">{businessCardPerson.tagline}</p>
            <p className="font-premium text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-[#5c6360] sm:text-[0.66rem]">{businessCardPerson.premiumDescriptor}</p>
          </div>
        </div>
      </div>

      <div className="h-8" data-html2canvas-ignore="true" aria-hidden />

      <DuplexSideLabel side="Back" />
      <div className={cx(CARD_FACE_PREMIUM_BACK, premiumShell)} style={{ backgroundColor: LUX_LINEN }}>
        <MatteGrainOverlay opacity={0.22} />
        <div className="relative flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain px-8 py-9 sm:px-10 sm:py-10">
          <div className="shrink-0">
            <h3 className="font-premium text-[1.52rem] font-bold leading-[1.08] tracking-[-0.038em] text-[#0a0a0a] sm:text-[1.68rem]">{businessCardPerson.name}</h3>
            <p className="mt-2 font-premium text-[0.68rem] font-bold uppercase leading-snug tracking-[0.18em] text-[#2d3d36] sm:text-[0.72rem]">{businessCardPerson.roleTitle}</p>
          </div>
          <div className="my-6 h-px w-full shrink-0 bg-gradient-to-r from-[#063B2A]/15 via-[#B8A06E]/32 to-transparent" aria-hidden />
          <PremiumContactMinimal className="min-h-0 shrink pb-2" />
          <div className="mt-auto flex shrink-0 justify-center border-t border-[#063B2A]/10 pt-4">
            <SocialIconRow size="sm" variant="light" />
          </div>
        </div>
      </div>
    </div>
  )
}

export type BusinessCardSpec = {
  readonly id: string
  readonly title: string
  readonly subtitle: string
  readonly render: () => ReactNode
}

function Card01IvoryLedger() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell)} style={{ backgroundColor: OFF_WHITE }}>
      <SunnyHairline />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-4 left-0 z-[2] w-[5px] rounded-full shadow-[0_0_22px_rgba(255,199,44,0.55)]"
        style={{
          background: 'linear-gradient(180deg, #fffbeb 0%, #fde68a 18%, #ffc738 42%, #d97706 72%, #92400e 100%)'
        }}
      />
      <div className="relative z-[2] flex h-full gap-5 px-5 py-6 pl-6 sm:gap-6 sm:px-7 sm:py-7 sm:pl-8">
        <div className="flex w-[41%] max-w-[220px] shrink-0 flex-col items-center justify-center gap-4 border-r border-black/[0.07] pr-4 sm:pr-6">
          <CrestLockup className="max-h-[156px] min-h-[128px] w-full object-contain object-center drop-shadow-[0_8px_24px_rgba(15,45,30,0.12)]" />
          <FlagPair />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <NameBlock boldTagline />
          <ContactBlock
            className="flex-1 text-[0.72rem] leading-[1.48] sm:text-[0.75rem]"
            coRegClassName="!text-[0.52rem] !font-extrabold !tracking-[0.04em] !leading-tight sm:!text-[0.58rem] md:!text-[0.6rem]"
          />
          <div className="mt-auto border-t border-black/[0.06] pt-3 sm:pt-4">
            <SocialIconRow size="sm" variant="light" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Card02CreamStudio() {
  return (
    <div
      className={cx(
        CARD_PREVIEW,
        cardShell,
        'relative ring-2 ring-amber-200/45 ring-offset-[3px] ring-offset-[#f3ece0]'
      )}
      style={{
        backgroundColor: CREAM,
        boxShadow:
          '0 20px 56px rgba(15,45,30,0.14), 0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.85), inset 0 -1px 0 rgba(201,162,39,0.12)'
      }}
    >
      <SunnyHairline />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.4]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          mixBlendMode: 'multiply'
        }}
      />
      <div className="pointer-events-none absolute -right-10 top-0 z-[1] h-48 w-48 rounded-full bg-amber-200/35 blur-3xl" />
      <p
        aria-hidden
        className="pointer-events-none absolute left-5 top-5 z-[2] font-ge text-[0.5rem] font-extrabold uppercase tracking-[0.42em] text-forest-800/35 sm:left-6 sm:top-6"
      >
        Dublin print · matt laminate
      </p>
      <div className="relative z-[2] flex min-h-0 h-full flex-col gap-5 px-6 pb-6 pt-9 sm:flex-row sm:gap-8 sm:px-7 sm:pb-7 sm:pt-7">
        <div className="flex shrink-0 flex-col justify-center sm:w-[40%]">
          <SiteLogoMark className="mx-auto h-[132px] w-auto max-w-[min(100%,200px)] object-contain object-center drop-shadow-[0_12px_32px_rgba(15,45,30,0.18)] sm:mx-0 sm:h-[148px] sm:max-w-none" />
        </div>
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col gap-5 border-black/[0.08] sm:border-l sm:pl-8">
          <div aria-hidden className="pointer-events-none absolute -left-px top-8 hidden h-[62%] w-px bg-gradient-to-b from-amber-200/20 via-amber-400/80 to-amber-700/40 sm:block" />
          <NameBlock boldTagline />
          <ContactBlock />
          <div className="mt-auto border-t border-black/[0.08] pt-4">
            <SocialIconRow size="sm" variant="light" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Card03CentreSummit() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative flex flex-col')} style={{ backgroundColor: OFF_WHITE }}>
      <SunnyHairline glow="top-right" />
      <div className="relative z-[2] flex flex-col items-center px-6 pt-6 sm:px-7 sm:pt-7">
        <FlagPair />
        <div className="mt-5 w-full max-w-[min(100%,360px)]">
          <CrestLockup className="mx-auto max-h-[124px] w-full object-contain drop-shadow-[0_12px_32px_rgba(15,45,30,0.12)]" />
        </div>
      </div>
      <div className="relative z-[2] flex flex-1 flex-col gap-6 px-6 pb-6 pt-5 text-center sm:px-7 sm:pb-7 sm:pt-6">
        <NameBlock boldTagline centered large />
        <ContactBlock className="text-left" />
        <div className="mt-auto flex justify-center border-t border-black/[0.06] pt-5">
          <SocialIconRow size="sm" variant="light" />
        </div>
      </div>
    </div>
  )
}

function Card04CreamRail() {
  return (
    <div
      className={cx(CARD_PREVIEW, cardShell, 'relative')}
      style={{
        backgroundColor: CREAM,
        boxShadow: '0 18px 52px rgba(15,45,30,0.13), inset 0 1px 0 rgba(255,255,255,0.75)'
      }}
    >
      <SunnyHairline glow="none" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[44%] bg-gradient-to-br from-white via-[#faf8f3] to-[#e8dfd2]" />
      <div className="pointer-events-none absolute left-0 top-0 z-[2] h-32 w-[44%] bg-gradient-to-br from-amber-50/90 to-transparent" />
      {/* Foil spine between panels */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-6 left-[44%] z-[4] w-[5px] -translate-x-1/2 rounded-full"
        style={{
          background: 'linear-gradient(180deg, #fff9eb 0%, #fde68a 15%, #eab308 42%, #b45309 78%, #78350f 100%)',
          boxShadow: '0 0 20px rgba(234,179,8,0.35), inset 0 1px 0 rgba(255,255,255,0.5)'
        }}
      />
      <p
        aria-hidden
        className="pointer-events-none absolute bottom-5 left-[22%] z-[5] hidden max-w-[38%] text-center font-ge text-[0.48rem] font-bold uppercase leading-snug tracking-[0.28em] text-forest-800/40 sm:block"
      >
        Spot foil rail · Irish studio proof
      </p>
      <div className="absolute inset-y-0 left-0 z-[2] w-[44%] shadow-[inset_-8px_0_24px_rgba(15,45,30,0.06)]">
        <div className="flex h-full flex-col items-center justify-center gap-5 px-4 py-7 sm:gap-6 sm:px-5">
          <SiteLogoMark className="h-[138px] w-auto max-w-[94%] object-contain object-center drop-shadow-[0_14px_32px_rgba(15,45,30,0.14)]" />
          <FlagPair />
        </div>
      </div>
      <div className="absolute inset-y-0 right-0 z-[2] flex w-[56%] flex-col gap-5 bg-gradient-to-bl from-[#faf7f2]/98 to-transparent py-7 pl-6 pr-6 sm:pl-7 sm:pr-8">
        <NameBlock boldTagline />
        <ContactBlock className="flex-1" />
        <div className="mt-auto border-t border-black/[0.08] pt-4">
          <SocialIconRow size="sm" variant="light" />
        </div>
      </div>
    </div>
  )
}

function Card05DiagonalSol() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative')} style={{ backgroundColor: OFF_WHITE }}>
      <SunnyHairline />
      <div
        aria-hidden
        className="absolute -left-[20%] top-0 z-[1] h-[145%] w-[55%] rotate-[17deg] bg-gradient-to-br from-amber-50/95 via-gs-gold/30 to-transparent"
      />
      <div className="relative z-[2] flex h-full gap-5 px-6 py-6 sm:gap-6 sm:px-7 sm:py-7">
        <div className="flex w-[39%] max-w-[192px] shrink-0 flex-col justify-center gap-4 sm:gap-5">
          <CrestLockup className="max-h-[140px] min-h-[120px] w-full object-contain object-left drop-shadow-[0_10px_28px_rgba(15,45,30,0.15)]" />
          <FlagPair />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <NameBlock boldTagline />
          <ContactBlock />
          <div className="mt-auto border-t border-black/[0.06] pt-4">
            <SocialIconRow size="sm" variant="light" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Card06ForestBand() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative flex flex-col')}>
      <div className="relative flex min-h-0 flex-1 flex-col gap-5 px-6 pb-6 pt-6 sm:px-7 sm:pt-7" style={{ backgroundColor: CREAM }}>
        <SunnyHairline glow="top-right" />
        <div className="relative z-[2] flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
          <SiteLogoMark className="h-[124px] w-auto max-w-[46%] shrink-0 object-contain object-left drop-shadow-[0_10px_24px_rgba(15,45,30,0.12)] sm:h-[136px] sm:max-w-none" />
          <div className="min-w-0 flex-1 space-y-4">
            <NameBlock boldTagline />
            <ContactBlock />
          </div>
        </div>
        <SunnyHairlineBottom />
      </div>
      <div
        className="relative z-[2] flex shrink-0 items-center justify-between gap-4 px-6 py-5 sm:px-7"
        style={{ backgroundColor: FOREST }}
      >
        <SocialIconRow size="sm" variant="dark" />
        <span className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5">
          <FlagIE className="h-4 w-[26px] rounded-[3px] shadow-md ring-1 ring-white/40" />
          <FlagES className="h-4 w-[26px] rounded-[3px] shadow-md ring-1 ring-white/40" />
        </span>
      </div>
    </div>
  )
}

function Card07WatermarkClassic() {
  return (
    <div
      className={cx(CARD_PREVIEW, cardShell, 'relative')}
      style={{
        backgroundColor: OFF_WHITE,
        boxShadow: '0 16px 48px rgba(15,45,30,0.11), inset 0 0 0 1px rgba(15,61,36,0.06)'
      }}
    >
      <SunnyHairline />
      <CrestLockup className="pointer-events-none absolute left-1/2 top-[40%] z-0 max-h-[300px] w-[130%] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.11]" />
      {/* Blind emboss frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[10px] z-[1] rounded-[16px] border border-double border-forest-900/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
      />
      <p
        aria-hidden
        className="pointer-events-none absolute right-5 top-4 z-[3] max-w-[45%] text-right font-ge text-[0.48rem] font-extrabold uppercase leading-tight tracking-[0.32em] text-forest-800/40"
      >
        Deboss crest · 300gsm
      </p>
      <div className="relative z-[2] flex h-full flex-col gap-5 px-6 py-6 sm:gap-6 sm:px-7 sm:py-7">
        <div className="flex items-start justify-between gap-4">
          <SiteLogoMark className="relative z-[1] h-[102px] w-auto max-w-[55%] object-contain drop-shadow-[0_10px_24px_rgba(15,45,30,0.12)] sm:h-[112px] sm:max-w-none" />
          <FlagPair className="relative z-[1] shrink-0" />
        </div>
        <div className="relative z-[1] pt-1 text-center">
          <NameBlock boldTagline centered large />
        </div>
        <div className="relative z-[1] mt-auto flex flex-col gap-5 border-t border-forest-900/10 pt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <ContactBlock className="flex-1 sm:max-w-[62%]" />
          <div className="shrink-0 sm:pt-1">
            <SocialIconRow size="sm" variant="light" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Card08RibbonFlags() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative flex flex-col')} style={{ backgroundColor: CREAM }}>
      <div
        className="relative flex shrink-0 items-center justify-center gap-3 px-4 py-3"
        style={{
          background: `linear-gradient(90deg, #0a3020 0%, #143d28 50%, #0a2818 100%)`,
          boxShadow: `inset 0 -1px 0 rgba(201,162,39,0.45)`
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[2px]"
          style={{
            background:
              'linear-gradient(90deg, transparent 4%, rgba(255,236,180,0.9) 48%, rgba(255,199,44,0.95) 50%, rgba(255,236,180,0.9) 52%, transparent 96%)',
            boxShadow: '0 2px 14px rgba(255,199,44,0.35)'
          }}
        />
        <FlagIE className="relative z-[1] h-4 w-7 shrink-0 rounded-[3px] shadow-lg ring-1 ring-white/25" />
        <span className="relative z-[1] text-center font-ge text-[0.62rem] font-bold uppercase leading-snug tracking-[0.22em] text-white/95 sm:text-[0.68rem] sm:tracking-[0.28em]">
          Irish · Costa del Sol · Spain
        </span>
        <FlagES className="relative z-[1] h-4 w-7 shrink-0 rounded-[3px] shadow-lg ring-1 ring-white/25" />
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col gap-6 px-6 py-6 sm:px-7 sm:py-7">
        <SunnyHairline glow="top-right" />
        <div className="relative z-[2] flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
          <CrestLockup className="max-h-[124px] min-h-[100px] w-[min(100%,220px)] shrink-0 object-contain object-left drop-shadow-[0_10px_24px_rgba(15,45,30,0.12)]" />
          <div className="min-w-0 flex-1">
            <NameBlock boldTagline />
          </div>
        </div>
        <div className="relative z-[2]">
          <ContactBlock />
        </div>
        <div className="relative z-[2] mt-auto flex justify-center border-t border-black/[0.07] pt-5">
          <SocialIconRow size="sm" variant="light" />
        </div>
      </div>
    </div>
  )
}

function Card09Letterpress() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative p-1.5')} style={{ backgroundColor: CREAM }}>
      <SunnyHairline />
      <div
        className="relative z-[2] flex h-full flex-col gap-6 rounded-[14px] border border-black/[0.12] px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),inset_0_-8px_24px_rgba(15,61,36,0.05)] sm:px-7 sm:py-7"
        style={{
          backgroundImage: `linear-gradient(165deg, ${OFF_WHITE} 0%, ${CREAM} 55%, #e8dfc8 100%)`
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <CrestLockup className="max-h-[104px] min-h-[88px] w-[min(100%,200px)] object-contain object-left drop-shadow-sm" />
          <FlagPair />
        </div>
        <div className="flex flex-1 flex-col justify-center py-1 text-center">
          <NameBlock boldTagline centered large />
        </div>
        <div className="flex flex-col gap-5 border-t border-black/[0.1] pt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <ContactBlock className="flex-1 text-left sm:max-w-[70%]" />
          <SocialIconRow size="sm" variant="light" />
        </div>
      </div>
    </div>
  )
}

function Card10DualIdentity() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative')} style={{ backgroundColor: OFF_WHITE }}>
      <SunnyHairline glow="top-right" />
      <div className="absolute inset-x-0 top-0 z-[1] h-[52%] border-b border-black/[0.08]">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[2px] bg-gradient-to-r from-transparent via-amber-200/90 to-transparent opacity-90" />
        <div className="absolute inset-y-0 left-0 w-1/2 border-r border-black/[0.07] bg-gradient-to-br from-white to-[#f2ebe3] px-4 py-5 sm:px-5 sm:py-6">
          <p className="font-ge text-[0.58rem] font-bold uppercase tracking-[0.28em] text-forest-700/65">Crest lockup</p>
          <CrestLockup className="mx-auto mt-3 max-h-[118px] min-h-[96px] w-full object-contain drop-shadow-[0_8px_20px_rgba(15,45,30,0.1)] sm:mt-4" />
          <div className="mt-3 flex justify-center sm:mt-4">
            <FlagPair />
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-bl from-[#f7f9f5] to-[#e8efe9] px-4 py-5 sm:px-5 sm:py-6">
          <p className="font-ge text-[0.58rem] font-bold uppercase tracking-[0.28em] text-forest-700/65">Site wordmark</p>
          <SiteLogoMark className="mx-auto mt-4 h-[118px] w-auto max-w-[95%] object-contain drop-shadow-[0_8px_20px_rgba(15,45,30,0.1)] sm:mt-5 sm:h-[128px]" />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 top-[52%] z-[2] bg-white/98 px-5 py-4 backdrop-blur-[2px] sm:px-6 sm:py-5">
        <div className="flex h-full flex-col justify-between gap-4">
          <div className="text-center">
            <p className="font-display text-[1.35rem] font-black leading-tight tracking-[-0.03em] text-black sm:text-[1.5rem]">
              {businessCardPerson.name}
            </p>
            <p className="mt-1.5 font-ge text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-forest-800/72">
              {businessCardPerson.tagline}
            </p>
          </div>
          <div className="space-y-2 text-center font-ge text-[0.72rem] leading-relaxed text-forest-900/90">
            <p>
              <a className="font-semibold underline-offset-2 hover:underline" href={`mailto:${businessCardContact.email}`}>
                {businessCardContact.email}
              </a>
            </p>
            <p>
              <a className="font-bold text-forest-950 hover:underline" href={businessCardContact.websiteUrl} rel="noreferrer" target="_blank">
                {businessCardContact.websiteDisplay}
              </a>
            </p>
            <p className="text-[0.76rem] font-semibold">{businessCardContact.phoneIe}</p>
            <p className="text-[0.76rem] font-semibold">{businessCardContact.phoneEs}</p>
            <p className="pt-1 text-[0.64rem] font-semibold leading-snug text-forest-800/90 normal-case">
              Co. Reg. Ireland {businessCardContact.companyRegIreland}
            </p>
          </div>
          <div className="flex justify-center border-t border-black/[0.06] pt-3">
            <SocialIconRow size="sm" variant="light" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Card11NocturneEmbassy() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell)} style={{ backgroundColor: FOREST }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent 5%, rgba(255,220,150,0.95) 50%, transparent 95%)',
          boxShadow: '0 2px 16px rgba(255,199,44,0.45)'
        }}
      />
      <div className="relative z-[2] flex h-full flex-col gap-5 px-6 py-6 sm:px-7 sm:py-7">
        <div className="rounded-xl bg-white/[0.07] p-4 ring-1 ring-white/15 backdrop-blur-[2px]">
          <CrestLockup className="mx-auto max-h-[112px] w-full max-w-[240px] object-contain" />
        </div>
        <div>
          <p className="font-display text-[1.5rem] font-black tracking-[-0.02em] text-white sm:text-[1.65rem]">{businessCardPerson.name}</p>
          <p className="mt-2 font-ge text-[0.7rem] font-bold uppercase tracking-[0.26em] text-emerald-100/88">
            {businessCardPerson.tagline}
          </p>
        </div>
        <ContactBlock className="flex-1" tone="dark" />
        <div className="mt-auto flex justify-center border-t border-white/15 pt-4">
          <SocialIconRow size="sm" variant="dark" />
        </div>
      </div>
    </div>
  )
}

function Card12TieredHarbour() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative flex flex-col')} style={{ backgroundColor: OFF_WHITE }}>
      <SunnyHairline glow="none" />
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/[0.06] bg-gradient-to-r from-white via-offwhite to-[#eef4ef] px-6 py-4">
        <SiteLogoMark className="h-[80px] w-auto object-contain drop-shadow-sm" />
        <FlagPair />
      </div>
      <div className="h-2 bg-gradient-to-r from-transparent via-amber-300/80 to-transparent shadow-[0_2px_12px_rgba(255,199,44,0.35)]" aria-hidden />
      <div className="relative flex flex-1 flex-col gap-5 px-6 py-6 sm:px-7">
        <NameBlock boldTagline />
        <ContactBlock />
        <div className="mt-auto flex justify-center border-t border-black/[0.07] pt-4">
          <SocialIconRow size="sm" variant="light" />
        </div>
      </div>
    </div>
  )
}

function Card13GoldFlume() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative')} style={{ backgroundColor: CREAM }}>
      <SunnyHairline />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-3 bottom-3 left-3 top-3 z-[1] w-2 rounded-full shadow-[0_0_24px_rgba(255,199,44,0.35)]"
        style={{ background: 'linear-gradient(180deg, #fffbeb, #fbbf24 45%, #b45309)' }}
      />
      <div className="relative z-[2] flex h-full gap-6 pl-8 pr-6 sm:pl-10 sm:pr-8">
        <div className="flex w-[38%] shrink-0 flex-col justify-center gap-5">
          <CrestLockup className="max-h-[132px] w-full object-contain object-center drop-shadow-lg" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-5 py-2">
          <NameBlock />
          <ContactBlock />
          <div className="mt-auto border-t border-black/[0.07] pt-4">
            <SocialIconRow size="sm" variant="light" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Card14CantileverCrest() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative flex flex-col')} style={{ backgroundColor: OFF_WHITE }}>
      <div className="relative shrink-0 border-b border-black/[0.08] bg-gradient-to-br from-[#f0f7f2] to-[#dfeadf] px-6 pb-5 pt-6">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
        <CrestLockup className="mx-auto max-h-[128px] w-full max-w-[min(100%,320px)] object-contain drop-shadow-md" />
      </div>
      <div className="relative flex flex-1 flex-col gap-6 px-6 py-6 sm:px-7">
        <div className="text-center">
          <NameBlock boldTagline centered />
        </div>
        <ContactBlock className="text-left" />
        <div className="mt-auto flex justify-center border-t border-black/[0.06] pt-4">
          <SocialIconRow size="sm" variant="light" />
        </div>
      </div>
    </div>
  )
}

function Card15WebHero() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative flex flex-col')}>
      {/* Letterboxed fleet photo — object-contain avoids stretched / squashed vans */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-[#050d0a] via-[#0a1812] to-black" />
      <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center p-2 sm:p-3">
        <img
          alt={BRAND_FLEET_LINEUP_ALT}
          className="max-h-full max-w-full object-contain object-center"
          decoding="async"
          src={BRAND_FLEET_LINEUP_IMAGE_SRC}
        />
      </div>
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/94 via-gs-dark/55 to-gs-dark/25" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-amber-400/15 via-transparent to-emerald-950/45 mix-blend-soft-light" />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[18%] top-[-20%] z-[2] h-[140%] w-[72%] rotate-[19deg] bg-gradient-to-r from-white/[0.18] via-white/[0.05] to-transparent opacity-75"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-1/2 bg-gradient-to-t from-black/88 to-transparent" />
      <div className="relative z-[3] flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-3.5 pb-3 pt-3.5 sm:gap-2.5 sm:px-5 sm:pb-4 sm:pt-4">
        <div className="rounded-2xl border border-white/25 bg-white/[0.13] px-3 py-3 shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-md ring-1 ring-white/12 sm:px-4 sm:py-3.5">
          <p className="font-ge text-[0.48rem] font-extrabold uppercase leading-snug tracking-[0.28em] text-amber-200 sm:text-[0.5rem] sm:tracking-[0.32em]">
            Private Mercedes fleet · Costa del Sol
          </p>
          <p className="mt-1.5 font-ge text-[0.58rem] font-semibold leading-snug text-emerald-50/95 sm:text-[0.6rem]">
            E-Class · V-Class · Sprinter — gloss laminate proof
          </p>
          <div className="mt-3 text-center">
            <NameBlock boldTagline centered compact tone="light" />
          </div>
        </div>
        <div className="rounded-2xl border border-amber-300/45 bg-gradient-to-br from-amber-50/96 via-white to-amber-50/90 px-3 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_36px_rgba(0,0,0,0.35)] ring-2 ring-amber-400/40 sm:px-4 sm:py-3.5">
          <p className="font-ge text-[0.52rem] font-extrabold uppercase tracking-[0.28em] text-forest-800/75 sm:text-[0.54rem] sm:tracking-[0.3em]">
            Book transfers online
          </p>
          <a
            className="mt-1 block break-all font-ge text-[1rem] font-black tracking-tight text-forest-950 sm:text-[1.08rem]"
            href={businessCardContact.websiteUrl}
            rel="noreferrer"
            target="_blank"
          >
            {businessCardContact.websiteDisplay}
          </a>
        </div>
        <div className="rounded-xl border border-white/15 bg-black/40 px-3 py-3 backdrop-blur-sm sm:px-4">
          <ContactBlock className="text-[0.68rem] leading-[1.45] sm:text-[0.7rem]" omitWebsite tone="dark" />
        </div>
        <div className="flex shrink-0 justify-center border-t border-white/12 pt-2">
          <SocialIconRow size="sm" variant="dark" />
        </div>
      </div>
    </div>
  )
}

function Card16StampFrame() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative p-2')} style={{ backgroundColor: CREAM }}>
      <div className="relative flex h-full flex-col gap-5 rounded-[18px] border-[3px] border-double border-forest-900/25 bg-[#faf8f4] px-5 py-6 shadow-inner sm:px-6 sm:py-7">
        <div className="flex items-start justify-between gap-3">
          <SiteLogoMark className="h-[88px] w-auto object-contain" />
          <FlagPair />
        </div>
        <div className="text-center">
          <NameBlock centered />
        </div>
        <ContactBlock />
        <div className="mt-auto flex justify-center border-t border-dashed border-forest-900/20 pt-4">
          <SocialIconRow size="sm" variant="light" />
        </div>
      </div>
    </div>
  )
}

function Card17DuneMist() {
  return (
    <div
      className={cx(CARD_PREVIEW, cardShell, 'relative')}
      style={{
        backgroundImage: 'linear-gradient(165deg, #faf6ee 0%, #ebe2d3 38%, #f5efe4 100%)'
      }}
    >
      <SunnyHairline />
      <div className="relative z-[2] flex h-full flex-col gap-6 px-7 py-7">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:justify-between">
          <CrestLockup className="max-h-[120px] w-[200px] object-contain drop-shadow-md" />
          <NameBlock />
        </div>
        <ContactBlock />
        <div className="mt-auto flex justify-center border-t border-black/[0.07] pt-4">
          <SocialIconRow size="sm" variant="light" />
        </div>
      </div>
    </div>
  )
}

function Card18FairwayGrid() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative')} style={{ backgroundColor: OFF_WHITE }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.42]"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(15,61,36,0.12) 1px, transparent 1px), radial-gradient(circle at center, rgba(201,162,39,0.08) 1px, transparent 1px)',
          backgroundSize: '14px 14px, 14px 14px',
          backgroundPosition: '0 0, 7px 7px'
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,248,220,0.5)_0%,transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_115%,rgba(15,61,36,0.09)_0%,transparent_45%)]"
      />
      <p
        aria-hidden
        className="pointer-events-none absolute left-6 top-5 z-[3] font-ge text-[0.48rem] font-extrabold uppercase tracking-[0.38em] text-forest-800/38"
      >
        Duplex UV grid · premium sheet
      </p>
      <div className="relative z-[2] flex min-h-0 h-full flex-col gap-5 px-7 pb-7 pt-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <SiteLogoMark className="h-[118px] w-auto shrink-0 object-contain drop-shadow-[0_8px_28px_rgba(15,45,30,0.14)]" />
          <NameBlock boldTagline />
        </div>
        <ContactBlock />
        <div className="mt-auto flex justify-center border-t border-forest-900/12 pt-4">
          <SocialIconRow size="sm" variant="light" />
        </div>
      </div>
    </div>
  )
}

function Card19AtlanticPins() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative')} style={{ backgroundColor: CREAM }}>
      <div className="relative flex h-full gap-4 px-5 py-6 sm:gap-6 sm:px-7">
        <div className="flex w-[22%] shrink-0 flex-col items-center justify-center gap-4 border-r border-black/[0.08] pr-3">
          <FlagIE className="h-14 w-[88px] rounded-md shadow-md ring-1 ring-black/10" />
          <FlagES className="h-14 w-[88px] rounded-md shadow-md ring-1 ring-black/10" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <CrestLockup className="max-h-[96px] w-full object-contain object-left" />
          <NameBlock />
          <ContactBlock />
          <div className="mt-auto border-t border-black/[0.07] pt-3">
            <SocialIconRow size="sm" variant="light" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Card20MonolithSplit() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative')} style={{ backgroundColor: OFF_WHITE }}>
      <SunnyHairline />
      <div className="relative z-[2] flex h-full gap-5 px-6 py-7 sm:gap-8">
        <div className="flex w-[46%] shrink-0 flex-col justify-center border-r border-black/[0.08] pr-5">
          <SiteLogoMark className="mx-auto h-[168px] w-auto max-w-full object-contain object-center drop-shadow-xl" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-5">
          <div>
            <NameBlock boldTagline />
          </div>
          <ContactBlock className="text-[0.74rem] leading-[1.5] sm:text-[0.76rem]" />
          <SocialIconRow size="sm" variant="light" />
        </div>
      </div>
    </div>
  )
}

function Card21PinstripeClubhouse() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative')} style={{ backgroundColor: OFF_WHITE }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 11px, rgba(15,61,36,0.06) 11px, rgba(15,61,36,0.06) 12px)'
        }}
      />
      <SunnyHairline glow="none" />
      <div className="relative z-[2] flex h-full flex-col gap-6 px-7 py-7">
        <div className="text-center">
          <CrestLockup className="mx-auto max-h-[132px] w-full max-w-[300px] object-contain drop-shadow-md" />
          <div className="mt-5">
            <NameBlock boldTagline centered />
          </div>
        </div>
        <ContactBlock className="text-[0.74rem]" />
        <div className="mt-auto flex justify-center border-t border-black/[0.07] pt-4">
          <SocialIconRow size="sm" variant="light" />
        </div>
      </div>
    </div>
  )
}

function Card22CopperBaseline() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative flex flex-col')} style={{ backgroundColor: OFF_WHITE }}>
      <div className="relative flex flex-1 flex-col gap-6 px-7 py-7">
        <SunnyHairline />
        <div className="relative z-[2] flex flex-col gap-5 sm:flex-row sm:items-center">
          <SiteLogoMark className="h-[124px] w-auto shrink-0 object-contain drop-shadow-md" />
          <NameBlock boldTagline />
        </div>
        <div className="relative z-[2] flex-1">
          <ContactBlock />
        </div>
      </div>
      <div
        className="relative shrink-0 px-7 py-6 sm:py-7"
        style={{
          backgroundImage: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 38%, #fbbf24 100%)',
          boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.25)'
        }}
      >
        <div className="flex justify-center border-t border-white/25 pt-4">
          <SocialIconRow size="sm" variant="dark" />
        </div>
      </div>
    </div>
  )
}

function Card23MalagaSunrise() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative flex min-h-0 overflow-hidden')}>
      {/* Fleet column — desktop (contain = correct van proportions) */}
      <div className="relative hidden w-[38%] shrink-0 flex-col overflow-hidden bg-[#050a08] sm:flex sm:flex-col">
        <div className="relative flex min-h-0 flex-1 items-center justify-center px-1.5 py-2">
          <img
            alt={BRAND_FLEET_LINEUP_ALT}
            className="max-h-full max-w-full object-contain object-center"
            decoding="async"
            src={BRAND_FLEET_LINEUP_IMAGE_SRC}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pt-10">
          <div className="px-3 pb-3 pt-6">
            <p className="font-ge text-[0.48rem] font-extrabold uppercase leading-snug tracking-[0.22em] text-amber-100 sm:text-[0.5rem]">
              Fleet lineup photo
            </p>
            <p className="mt-1 font-ge text-[0.58rem] font-semibold leading-snug text-white/93">
              Vans & cars · Málaga transfers
            </p>
          </div>
        </div>
      </div>
      {/* Ivory content */}
      <div
        className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-gradient-to-br from-[#fffbf7] via-[#f5ebe2] to-[#e8dfd4]"
        style={{ boxShadow: 'inset 8px 0 24px rgba(15,45,30,0.07)' }}
      >
        {/* Mobile fleet strip */}
        <div className="relative flex h-[7.25rem] shrink-0 items-center justify-center overflow-hidden bg-[#050a08] sm:hidden">
          <img
            alt={BRAND_FLEET_LINEUP_ALT}
            className="max-h-[92%] max-w-[96%] object-contain object-center"
            src={BRAND_FLEET_LINEUP_IMAGE_SRC}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/55 to-gs-dark/35" />
          <p className="absolute bottom-2 left-3 right-3 text-center font-ge text-[0.52rem] font-bold uppercase leading-tight tracking-[0.18em] text-white drop-shadow-md">
            Fleet vans · Málaga corridor
          </p>
        </div>
        <SunnyHairline glow="top-right" />
        <p
          aria-hidden
          className="pointer-events-none absolute right-4 top-4 z-[5] hidden max-w-[48%] text-right font-ge text-[0.45rem] font-extrabold uppercase leading-tight tracking-[0.22em] text-forest-800/38 sm:right-5 sm:top-5 sm:block sm:text-[0.48rem]"
        >
          Trade print finish
        </p>
        <div className="relative z-[2] flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-5 py-6 sm:gap-5 sm:px-7 sm:py-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <CrestLockup className="max-h-[118px] w-[176px] shrink-0 object-contain drop-shadow-[0_14px_36px_rgba(15,45,30,0.18)] sm:max-h-[124px] sm:w-[188px]" />
            <NameBlock boldTagline compact />
          </div>
          <ContactBlock className="text-[0.76rem] leading-[1.48]" />
          <div className="mt-auto flex shrink-0 justify-center border-t border-amber-900/15 pt-3">
            <SocialIconRow size="sm" variant="light" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Card24CrestMedallion() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative')} style={{ backgroundColor: CREAM }}>
      <SunnyHairline />
      <div className="relative z-[2] flex h-full gap-6 px-6 py-7 sm:px-8">
        <div className="flex shrink-0 flex-col items-center justify-center">
          <div className="rounded-full bg-white p-4 shadow-[0_12px_40px_rgba(15,45,30,0.12)] ring-2 ring-amber-200/80 ring-offset-2 ring-offset-[#f6efe4]">
            <CrestLockup className="h-[132px] w-[132px] object-contain object-center" />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
          <NameBlock boldTagline />
          <ContactBlock className="text-[0.74rem]" />
          <SocialIconRow size="sm" variant="light" />
        </div>
      </div>
    </div>
  )
}

function Card25TypographicHalo() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative')} style={{ backgroundColor: OFF_WHITE }}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[18%] z-[1] h-[52%] w-[78%] -translate-x-1/2 rounded-full bg-gradient-to-br from-amber-100/60 to-transparent blur-2xl"
      />
      <div className="relative z-[2] flex h-full flex-col px-7 py-8">
        <p className="font-display text-center text-[2rem] font-black leading-[0.95] tracking-[-0.04em] text-black sm:text-[2.15rem]">
          {businessCardPerson.name.split(' ').map((w) => (
            <span key={w} className="block">
              {w}
            </span>
          ))}
        </p>
        <p className="mt-4 text-center font-ge text-[0.62rem] font-bold uppercase tracking-[0.32em] text-forest-800/75">
          {businessCardPerson.tagline}
        </p>
        <div className="mt-8">
          <ContactBlock className="text-[0.76rem]" />
        </div>
        <div className="mt-auto flex justify-center pt-5">
          <SocialIconRow size="sm" variant="light" />
        </div>
      </div>
    </div>
  )
}

function Card26WaveTerrain() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative')} style={{ backgroundColor: OFF_WHITE }}>
      <SunnyHairline glow="none" />
      <div className="relative z-[2] flex h-full flex-col px-7 pt-8">
        <div className="flex items-start justify-between gap-4">
          <SiteLogoMark className="h-[112px] w-auto object-contain drop-shadow-md" />
          <FlagPair />
        </div>
        <NameBlock boldTagline />
        <svg aria-hidden className="my-5 h-8 w-full text-forest-900/12" preserveAspectRatio="none" viewBox="0 0 400 24">
          <path d="M0 18 Q100 4 200 14 T400 10" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        <ContactBlock />
        <div className="mt-auto flex justify-center border-t border-black/[0.06] pb-6 pt-5">
          <SocialIconRow size="sm" variant="light" />
        </div>
      </div>
    </div>
  )
}

function Card27FrostedHarbour() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative')} style={{ backgroundImage: 'linear-gradient(145deg, #e8f5ec 0%, #cfe8d8 45%, #b8d4c8 100%)' }}>
      <SunnyHairline />
      <div className="relative z-[2] flex h-full flex-col gap-6 p-6 sm:p-7">
        <div className="rounded-2xl border border-white/40 bg-white/55 px-5 py-6 shadow-lg backdrop-blur-md">
          <CrestLockup className="mx-auto max-h-[120px] w-full max-w-[260px] object-contain" />
          <div className="mt-5 text-center">
            <NameBlock boldTagline centered />
          </div>
        </div>
        <ContactBlock />
        <div className="mt-auto flex justify-center border-t border-white/40 pt-4">
          <SocialIconRow size="sm" variant="light" />
        </div>
      </div>
    </div>
  )
}

function Card28EmeraldUrlBanner() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative flex flex-col')} style={{ backgroundColor: OFF_WHITE }}>
      <div className="relative flex flex-1 flex-col gap-6 px-7 py-7">
        <NameBlock boldTagline />
        <ContactBlock omitWebsite />
      </div>
      <a
        className="flex shrink-0 items-center justify-center px-5 py-5 text-center font-ge text-[0.95rem] font-black tracking-tight text-white shadow-inner sm:text-[1.05rem]"
        href={businessCardContact.websiteUrl}
        rel="noreferrer"
        style={{
          background: `linear-gradient(90deg, #0a3020 0%, ${FOREST} 45%, #0f5c38 100%)`,
          boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.12)'
        }}
        target="_blank"
      >
        {businessCardContact.websiteDisplay}
      </a>
      <div className="flex shrink-0 justify-center border-t border-black/[0.06] bg-offwhite/90 px-6 py-4">
        <SocialIconRow size="sm" variant="light" />
      </div>
    </div>
  )
}

function Card29BevelPlate() {
  return (
    <div
      className={cx(
        CARD_PREVIEW,
        cardShell,
        'shadow-[inset_0_2px_0_rgba(255,255,255,0.65),inset_0_-4px_14px_rgba(15,61,36,0.07)]'
      )}
      style={{ backgroundColor: CREAM }}
    >
      <SunnyHairline glow="none" />
      <div className="relative z-[2] flex h-full flex-col gap-6 px-7 py-8">
        <div className="flex items-center justify-between gap-4">
          <CrestLockup className="max-h-[108px] w-[180px] object-contain" />
          <NameBlock boldTagline />
        </div>
        <ContactBlock />
        <div className="mt-auto flex justify-center border-t border-black/[0.08] pt-4">
          <SocialIconRow size="sm" variant="light" />
        </div>
      </div>
    </div>
  )
}

function Card30AscentPortrait() {
  return (
    <div className={cx(CARD_PREVIEW, cardShell, 'relative flex flex-col')} style={{ backgroundColor: OFF_WHITE }}>
      <div className="relative flex flex-[1.15] flex-col items-center justify-end bg-gradient-to-b from-[#eef6f0] to-white px-7 pb-6 pt-8">
        <SunnyHairline />
        <SiteLogoMark className="relative z-[2] h-[168px] w-auto max-w-[88%] object-contain drop-shadow-xl" />
        <FlagPair className="relative z-[2] mt-5" />
      </div>
      <div className="relative flex flex-1 flex-col gap-5 border-t border-black/[0.07] bg-white px-7 py-7">
        <NameBlock boldTagline />
        <ContactBlock className="text-[0.74rem]" />
        <div className="mt-auto flex justify-center pt-2">
          <SocialIconRow size="sm" variant="light" />
        </div>
      </div>
    </div>
  )
}

export const BUSINESS_CARD_SPECS: readonly BusinessCardSpec[] = [
  {
    id: 'P1',
    title: 'Executive ivory duplex',
    subtitle: 'Front identity · back credentials · antique gold rule · soft-touch grain — embassy stationery',
    render: () => <CardPremium01IvoryDuplex />
  },
  {
    id: 'P2',
    title: 'Noir signature duplex',
    subtitle: 'Deep charcoal face · foil-line restraint · ivory reverse — private club / concierge desk',
    render: () => <CardPremium02NoirDuplex />
  },
  {
    id: 'P3',
    title: 'Linen column duplex',
    subtitle: 'Vertical bullion accent · asymmetric front · warm linen stock — hospitality brand systems',
    render: () => <CardPremium03LinenDuplex />
  },
  {
    id: '01',
    title: 'Ivory ledger',
    subtitle: 'Crest column · gold spine · editorial spacing',
    render: () => <Card01IvoryLedger />
  },
  {
    id: '02',
    title: 'Cream atelier',
    subtitle: 'Noise grain · foil ring · Dublin laminate caption',
    render: () => <Card02CreamStudio />
  },
  {
    id: '03',
    title: 'Summit crest',
    subtitle: 'Centred hierarchy · ceremony · breathing room',
    render: () => <Card03CentreSummit />
  },
  {
    id: '04',
    title: 'Split rail',
    subtitle: 'Gold foil spine · embossed left tray · studio wash',
    render: () => <Card04CreamRail />
  },
  {
    id: '05',
    title: 'Sol diagonal',
    subtitle: 'Gold plane · confident margins',
    render: () => <Card05DiagonalSol />
  },
  {
    id: '06',
    title: 'Forest band',
    subtitle: 'Stacked identity · forest utility strip',
    render: () => <Card06ForestBand />
  },
  {
    id: '07',
    title: 'Watermark',
    subtitle: 'Heavier deboss crest · double-rule passepartout · gsm callout',
    render: () => <Card07WatermarkClassic />
  },
  {
    id: '08',
    title: 'Corridor ribbon',
    subtitle: 'Corridor band · crest + name · open body',
    render: () => <Card08RibbonFlags />
  },
  {
    id: '09',
    title: 'Letterpress',
    subtitle: 'Inset plate · museum margins',
    render: () => <Card09Letterpress />
  },
  {
    id: '10',
    title: 'Dual identity',
    subtitle: 'Compare marks · dedicated contact deck',
    render: () => <Card10DualIdentity />
  },
  {
    id: '11',
    title: 'Nocturne embassy',
    subtitle: 'Forest ground · frosted crest · light-on-dark type',
    render: () => <Card11NocturneEmbassy />
  },
  {
    id: '12',
    title: 'Tiered harbour',
    subtitle: 'Brand strip · sunny divider · structured bands',
    render: () => <Card12TieredHarbour />
  },
  {
    id: '13',
    title: 'Gold flume',
    subtitle: 'Vertical bullion bar · crest column',
    render: () => <Card13GoldFlume />
  },
  {
    id: '14',
    title: 'Cantilever crest',
    subtitle: 'Landscape crest tray · centred identity',
    render: () => <Card14CantileverCrest />
  },
  {
    id: '15',
    title: 'Fleet gloss hero',
    subtitle: 'Fleet lineup shot · foil www strip · glass panels',
    render: () => <Card15WebHero />
  },
  {
    id: '16',
    title: 'Stamp frame',
    subtitle: 'Double-rule passepartout · archival',
    render: () => <Card16StampFrame />
  },
  {
    id: '17',
    title: 'Dune mist',
    subtitle: 'Warm limestone gradient · soft luxury',
    render: () => <Card17DuneMist />
  },
  {
    id: '18',
    title: 'Fairway grid',
    subtitle: 'Duplex UV dot grid · gold vignette wash · sheet caption',
    render: () => <Card18FairwayGrid />
  },
  {
    id: '19',
    title: 'Atlantic pins',
    subtitle: 'Large corridor flags · crest + stack',
    render: () => <Card19AtlanticPins />
  },
  {
    id: '20',
    title: 'Monolith split',
    subtitle: 'Maximum logo scale · editorial rail',
    render: () => <Card20MonolithSplit />
  },
  {
    id: '21',
    title: 'Pinstripe clubhouse',
    subtitle: 'Fine pinstripe ground · crest keynote',
    render: () => <Card21PinstripeClubhouse />
  },
  {
    id: '22',
    title: 'Copper baseline',
    subtitle: 'Warm metallic footer · copper sunset strip',
    render: () => <Card22CopperBaseline />
  },
  {
    id: '23',
    title: 'Fleet spine sunrise',
    subtitle: 'Van lineup column · ivory duplex · trade-print captions',
    render: () => <Card23MalagaSunrise />
  },
  {
    id: '24',
    title: 'Crest medallion',
    subtitle: 'Circular seal · jewellery-scale lockup',
    render: () => <Card24CrestMedallion />
  },
  {
    id: '25',
    title: 'Typographic halo',
    subtitle: 'Statement name stack · luminous halo',
    render: () => <Card25TypographicHalo />
  },
  {
    id: '26',
    title: 'Wave terrain',
    subtitle: 'Terrain divider · wordmark + crest band',
    render: () => <Card26WaveTerrain />
  },
  {
    id: '27',
    title: 'Frosted harbour',
    subtitle: 'Glass panel · misted harbour greens',
    render: () => <Card27FrostedHarbour />
  },
  {
    id: '28',
    title: 'Emerald URL banner',
    subtitle: 'Forest band for www · duplicate-safe layout',
    render: () => <Card28EmeraldUrlBanner />
  },
  {
    id: '29',
    title: 'Bevel plate',
    subtitle: 'Inset bevel · pressed plaque feel',
    render: () => <Card29BevelPlate />
  },
  {
    id: '30',
    title: 'Ascent portrait',
    subtitle: 'Hero logo field · stacked credentials',
    render: () => <Card30AscentPortrait />
  }
]

export function BusinessCardsCatalog() {
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [singlePdfBusyId, setSinglePdfBusyId] = useState<string | null>(null)

  const handleSingleCardPdf = useCallback(async (spec: BusinessCardSpec) => {
    const root = document.getElementById('business-cards-pdf-export-root')
    const slide = root?.querySelector<HTMLElement>(`[data-pdf-card-id="${CSS.escape(spec.id)}"]`)
    if (!slide) {
      setPdfError('Could not find print layout for this card. Refresh and try again.')
      return
    }
    setPdfError(null)
    setSinglePdfBusyId(spec.id)
    try {
      const filenameBase = `golfsol-business-card-${spec.id}-${spec.title}`
      await saveSingleBusinessCardPdf(slide, filenameBase)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not build the PDF.'
      setPdfError(message)
      console.error(e)
    } finally {
      setSinglePdfBusyId(null)
    }
  }, [])

  return (
    <div className="bg-[#F4F7F5]">
      <div className="mx-auto max-w-6xl px-5 pb-6 pt-12">
        {pdfError ? (
          <div className="mb-8 rounded-[1.25rem] border border-[#FFC72C]/35 bg-white px-4 py-3 font-ge text-sm text-[#063B2A] shadow-[0_12px_32px_rgba(6,59,42,0.08)]">
            {pdfError}
          </div>
        ) : null}
        <p className="max-w-3xl font-ge text-[1.05rem] font-medium leading-relaxed text-[#4e4e4e]">
          Lead concepts <span className="font-extrabold text-[#063B2A]">P1–P3</span> are duplex executive layouts (Manrope
          typography, front/back separation). Thirty-three production-ready concepts for{' '}
          <span className="font-extrabold text-[#063B2A]">{businessCardPerson.name}</span> — taller canvas so email,{' '}
          <span className="font-extrabold text-[#063B2A]">www.golfsolirl.com</span>, phones, and Co. Reg. never clip.
          Colours and rhythm follow the same GolfSol enquiry mail system (turf background{' '}
          <span className="font-mono text-[0.85em] text-[#0B6B45]">{GS_BG}</span>, emerald{' '}
          <span className="font-mono text-[0.85em] text-[#0B6B45]">{GS_DARK}</span>, gold{' '}
          <span className="font-mono text-[0.85em] text-[#0B6B45]">{GS_GOLD}</span>). Use{' '}
          <span className="font-extrabold text-[#063B2A]">Card PDF</span> on each tile for a one-page print proof.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-16 pt-0">
        <div className="grid gap-16 lg:grid-cols-2">
          {BUSINESS_CARD_SPECS.map((spec) => (
            <article
              key={spec.id}
              className="rounded-[2.5rem] border border-[#d9d2c1]/90 bg-white p-8 shadow-[0_26px_70px_rgba(40,33,19,0.12)]"
            >
              <div className="flex flex-col gap-4 border-b border-[#063B2A]/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.3em] text-[#0B6B45]">{spec.id}</p>
                  <h2 className="font-ge mt-2 text-2xl font-extrabold tracking-tight text-[#063B2A]">{spec.title}</h2>
                  <p className="mt-2 max-w-lg font-ge text-[0.95rem] font-medium leading-relaxed text-[#4e4e4e]">
                    {spec.subtitle}
                  </p>
                </div>
                <button
                  className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-2xl bg-gradient-to-br from-[#FFC72C] to-[#FFE27A] px-5 py-2.5 font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-[#063B2A] shadow-[0_8px_22px_rgba(255,199,44,0.35)] transition hover:brightness-105 disabled:opacity-60"
                  data-html2canvas-ignore="true"
                  type="button"
                  aria-label={
                    singlePdfBusyId === spec.id
                      ? 'Building PDF for this card'
                      : 'Download this card as a one-page PDF'
                  }
                  disabled={singlePdfBusyId !== null}
                  onClick={() => void handleSingleCardPdf(spec)}
                >
                  <FileDown className="h-4 w-4" aria-hidden />
                  {singlePdfBusyId === spec.id ? 'Building…' : 'Card PDF'}
                </button>
              </div>
              <div className="mt-10 flex justify-center px-1">
                <div className="w-full max-w-[600px]">{spec.render()}</div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="fixed -left-[9999px] top-0 w-[640px]" id="business-cards-pdf-export-root">
        {/* One block per card PDF page (save-business-cards-pdf.ts). */}
        {BUSINESS_CARD_SPECS.map((spec) => (
          <div
            key={`pdf-${spec.id}`}
            className="bg-white px-10 pb-14 pt-12"
            data-pdf-card-id={spec.id}
            data-pdf-page
          >
            <p className="mb-6 font-ge text-[0.72rem] font-bold uppercase tracking-[0.26em] text-forest-600">
              {spec.id} · {spec.title}
            </p>
            <div className="mx-auto max-w-[600px]">{spec.render()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
