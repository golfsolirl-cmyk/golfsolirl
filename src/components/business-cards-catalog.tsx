import { useCallback, useState, type ReactNode } from 'react'
import { Download, Globe, Mail, Phone } from 'lucide-react'
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa6'
import { SiWhatsapp } from 'react-icons/si'
import { cx } from '../lib/utils'
import { saveElementAsPdf } from '../lib/save-element-as-pdf'
import {
  businessCardAssets,
  businessCardContact,
  businessCardPerson,
  businessCardSocial
} from '../lib/business-cards-config'

const OFF_WHITE = '#faf9f6'
const CREAM = '#f6efe4'
const FOREST = '#0f3d24'
const GOLD = '#c9a227'
const INK = '#0c0c0c'

/**
 * Extra height vs standard 3.5×2 so email, www, two phones, Co. Reg., and icon row never clip.
 */
const CARD_PREVIEW = 'aspect-[3.5/2.82] w-full max-w-[min(100%,600px)]'

/** Homepage-style warm gold edge + optional soft “sunny” glow (navbar crest shimmer language). */
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
      ? 'border border-black/[0.1] bg-white/95 text-forest-900 shadow-sm hover:border-amber-800/25 hover:shadow-md'
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
  const ink = dark ? 'text-emerald-50/95' : 'text-forest-900/[0.88]'
  const muted = dark ? 'text-emerald-100/55' : 'text-forest-800/50'
  const border = dark ? 'border-white/15' : 'border-black/[0.05]'
  const borderTop = dark ? 'border-white/15' : 'border-black/[0.06]'
  const label = dark ? 'text-emerald-100/70' : 'text-forest-700/55'

  return (
    <div className={cx('font-ge text-[0.78rem] leading-[1.55] sm:text-[0.8rem]', ink, className)}>
      <a
        className={cx('group flex items-start gap-2.5 border-b pb-2.5 text-left transition', border, dark ? 'hover:text-white' : 'hover:text-forest-950')}
        href={`mailto:${businessCardContact.email}`}
      >
        <Mail className={cx('mt-[3px] h-3.5 w-3.5 shrink-0', muted)} aria-hidden />
        <span className="min-w-0 break-words font-semibold tracking-[-0.01em] underline-offset-2 group-hover:underline">
          {businessCardContact.email}
        </span>
      </a>
      {omitWebsite ? null : (
        <a
          className={cx('mt-2.5 flex items-start gap-2.5 border-b pb-2.5 text-left font-bold tracking-[-0.01em] transition', border, dark ? 'hover:text-white' : 'hover:text-forest-950')}
          href={businessCardContact.websiteUrl}
          rel="noreferrer"
          target="_blank"
        >
          <Globe className={cx('mt-[3px] h-3.5 w-3.5 shrink-0', muted)} aria-hidden />
          <span className="min-w-0 break-all">{businessCardContact.websiteDisplay}</span>
        </a>
      )}
      <div className="mt-2.5 space-y-1.5">
        <a
          className={cx('flex items-start gap-2.5 text-left font-semibold tracking-[-0.01em] transition', dark ? 'hover:text-white' : 'hover:text-forest-950')}
          href={`tel:${businessCardContact.phoneIe.replace(/\s/g, '')}`}
        >
          <Phone className={cx('mt-[3px] h-3.5 w-3.5 shrink-0', muted)} aria-hidden />
          <span>
            <span className={cx('mr-2 text-[0.65rem] font-bold uppercase tracking-[0.14em]', label)}>Ireland</span>
            {businessCardContact.phoneIe}
          </span>
        </a>
        <a
          className={cx('flex items-start gap-2.5 text-left font-semibold tracking-[-0.01em] transition', dark ? 'hover:text-white' : 'hover:text-forest-950')}
          href={`tel:${businessCardContact.phoneEs.replace(/\s/g, '')}`}
        >
          <Phone className={cx('mt-[3px] h-3.5 w-3.5 shrink-0', muted)} aria-hidden />
          <span>
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
            'mt-3 border-t pt-3 font-bold leading-none tracking-[0.06em] normal-case',
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

function NameBlock({ centered, large, boldTagline }: { readonly centered?: boolean; readonly large?: boolean; readonly boldTagline?: boolean }) {
  return (
    <div className={cx(centered && 'text-center')}>
      <p
        className={cx(
          'font-display font-black tracking-[-0.025em]',
          large ? 'text-[1.65rem] leading-[1.12] sm:text-[1.85rem]' : 'text-[1.45rem] leading-[1.15] sm:text-[1.6rem]'
        )}
        style={{ color: INK }}
      >
        {businessCardPerson.name}
      </p>
      <p
        className={cx(
          'mt-2 font-ge text-[0.68rem] uppercase tracking-[0.26em] text-forest-800/72 sm:text-[0.72rem]',
          boldTagline ? 'font-bold' : 'font-semibold'
        )}
      >
        {businessCardPerson.tagline}
      </p>
    </div>
  )
}

const cardShell =
  'relative overflow-hidden rounded-2xl shadow-[0_16px_48px_rgba(15,45,30,0.12),0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.06]'

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
    <div className={cx(CARD_PREVIEW, cardShell, 'relative')} style={{ backgroundColor: CREAM }}>
      <SunnyHairline />
      <div className="pointer-events-none absolute -right-10 top-0 z-[1] h-44 w-44 rounded-full bg-amber-200/30 blur-3xl" />
      <div className="relative z-[2] flex h-full flex-col gap-6 px-6 py-6 sm:flex-row sm:gap-8 sm:px-7 sm:py-7">
        <div className="flex shrink-0 flex-col justify-center sm:w-[40%]">
          <SiteLogoMark className="mx-auto h-[132px] w-auto max-w-[min(100%,200px)] object-contain object-center drop-shadow-[0_10px_28px_rgba(15,45,30,0.14)] sm:mx-0 sm:h-[148px] sm:max-w-none" />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5 border-black/[0.08] sm:border-l sm:pl-8">
          <NameBlock boldTagline />
          <ContactBlock />
          <div className="mt-auto border-t border-black/[0.07] pt-4">
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
    <div className={cx(CARD_PREVIEW, cardShell, 'relative')} style={{ backgroundColor: CREAM }}>
      <SunnyHairline glow="none" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[44%] bg-gradient-to-br from-white via-[#faf7f2] to-[#ebe4d9]" />
      <div className="pointer-events-none absolute left-0 top-0 z-[2] h-28 w-[44%] bg-gradient-to-br from-amber-100/50 to-transparent" />
      <div className="absolute inset-y-0 left-0 z-[2] w-[44%]">
        <div className="flex h-full flex-col items-center justify-center gap-5 px-4 py-7 sm:gap-6 sm:px-5">
          <SiteLogoMark className="h-[138px] w-auto max-w-[94%] object-contain object-center drop-shadow-[0_12px_28px_rgba(15,45,30,0.12)]" />
          <FlagPair />
        </div>
      </div>
      <div className="absolute inset-y-0 right-0 z-[2] flex w-[56%] flex-col gap-5 py-7 pl-5 pr-6 sm:pl-6 sm:pr-7">
        <NameBlock boldTagline />
        <ContactBlock className="flex-1" />
        <div className="mt-auto border-t border-black/[0.07] pt-4">
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
    <div className={cx(CARD_PREVIEW, cardShell, 'relative')} style={{ backgroundColor: OFF_WHITE }}>
      <SunnyHairline />
      <CrestLockup className="pointer-events-none absolute left-1/2 top-[40%] z-0 max-h-[280px] w-[125%] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.07]" />
      <div className="relative z-[2] flex h-full flex-col gap-5 px-6 py-6 sm:gap-6 sm:px-7 sm:py-7">
        <div className="flex items-start justify-between gap-4">
          <SiteLogoMark className="relative z-[1] h-[102px] w-auto max-w-[55%] object-contain drop-shadow-[0_8px_20px_rgba(15,45,30,0.1)] sm:h-[112px] sm:max-w-none" />
          <FlagPair className="relative z-[1] shrink-0" />
        </div>
        <div className="relative z-[1] pt-1 text-center">
          <NameBlock boldTagline centered large />
        </div>
        <div className="relative z-[1] mt-auto flex flex-col gap-5 border-t border-black/[0.07] pt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
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
          <p className="font-ge text-[0.58rem] font-bold uppercase tracking-[0.28em] text-forest-700/65">Homepage crest</p>
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
    <div className={cx(CARD_PREVIEW, cardShell, 'relative')} style={{ backgroundColor: OFF_WHITE }}>
      <SunnyHairline glow="top-right" />
      <div className="relative z-[2] flex h-full flex-col justify-between gap-6 px-7 py-8">
        <div className="text-center">
          <NameBlock centered large />
        </div>
        <div className="rounded-2xl border border-amber-400/35 bg-gradient-to-br from-amber-50/90 to-white px-5 py-5 text-center shadow-inner ring-1 ring-amber-200/40">
          <p className="font-ge text-[0.58rem] font-bold uppercase tracking-[0.28em] text-forest-700/65">Website</p>
          <a
            className="mt-2 block font-ge text-[1.05rem] font-black tracking-tight text-forest-950 hover:text-gs-green sm:text-[1.15rem]"
            href={businessCardContact.websiteUrl}
            rel="noreferrer"
            target="_blank"
          >
            {businessCardContact.websiteDisplay}
          </a>
        </div>
        <ContactBlock className="text-[0.74rem]" omitWebsite />
        <div className="flex justify-center border-t border-black/[0.06] pt-4">
          <SocialIconRow size="sm" variant="light" />
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
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(15,61,36,0.14) 1px, transparent 1px)',
          backgroundSize: '14px 14px'
        }}
      />
      <div className="relative z-[2] flex h-full flex-col gap-6 px-7 py-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <SiteLogoMark className="h-[118px] w-auto shrink-0 object-contain drop-shadow-sm" />
          <NameBlock boldTagline />
        </div>
        <ContactBlock />
        <div className="mt-auto flex justify-center border-t border-forest-900/10 pt-4">
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
    <div className={cx(CARD_PREVIEW, cardShell, 'relative')} style={{ backgroundColor: '#fff8f0' }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-2/5 bg-gradient-to-b from-amber-200/70 via-orange-100/40 to-transparent"
      />
      <SunnyHairline glow="top-right" />
      <div className="relative z-[2] flex h-full flex-col gap-6 px-7 py-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <CrestLockup className="max-h-[128px] w-[200px] shrink-0 object-contain drop-shadow-lg" />
          <NameBlock boldTagline />
        </div>
        <ContactBlock />
        <div className="mt-auto flex justify-center border-t border-orange-200/60 pt-4">
          <SocialIconRow size="sm" variant="light" />
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
    id: '01',
    title: 'Ivory ledger',
    subtitle: 'Crest column · gold spine · editorial spacing',
    render: () => <Card01IvoryLedger />
  },
  {
    id: '02',
    title: 'Cream atelier',
    subtitle: 'Wordmark · warm stock · calm vertical rhythm',
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
    subtitle: 'Classic two-panel · rail balance',
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
    subtitle: 'Ghost crest · centred name · tiered footer',
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
    title: 'Web hero',
    subtitle: 'Bold www panel · supporting contact stack',
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
    subtitle: 'Micro fairway texture · wordmark forward',
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
    title: 'Málaga sunrise',
    subtitle: 'Soft dawn wash · corridor crest',
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
  const [pdfBusy, setPdfBusy] = useState(false)

  const handlePdf = useCallback(async () => {
    const root = document.getElementById('business-cards-pdf-export-root')
    if (!root) {
      return
    }
    setPdfBusy(true)
    try {
      await saveElementAsPdf(root, 'golfsol-business-cards-martin-kelly-catalogue')
    } finally {
      setPdfBusy(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f0ea] via-[#f5f0e6] to-[#e5dfd4]">
      <header className="relative overflow-hidden border-b border-black/[0.06] bg-gradient-to-br from-[#0f3d24] via-[#143d28] to-[#0a2416] px-5 py-16 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-amber-400/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl">
          <p className="font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.38em] text-emerald-200/95">
            Golf Sol Ireland · brand studio
          </p>
          <h1 className="font-display mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Luxury business card catalogue
          </h1>
          <p className="mt-5 max-w-2xl font-ge text-lg leading-[1.65] text-emerald-50/95">
            Thirty production-ready concepts for <span className="font-semibold text-white">{businessCardPerson.name}</span>
            — taller canvas so email, <span className="font-semibold text-white">www.golfsolirl.com</span>, phones, and Co. Reg. never clip.
            Bold accents where they help scanning; waves 01–10, 11–20, 21–30. Export the full set as PDF for print review.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3.5 font-ge text-sm font-bold uppercase tracking-[0.14em] text-white backdrop-blur transition hover:bg-white/18 disabled:opacity-60"
              data-html2canvas-ignore="true"
              disabled={pdfBusy}
              type="button"
              onClick={() => void handlePdf()}
            >
              <Download className="h-4 w-4" aria-hidden />
              {pdfBusy ? 'Building PDF…' : 'Download PDF catalogue'}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-16 lg:grid-cols-2">
          {BUSINESS_CARD_SPECS.map((spec) => (
            <article
              key={spec.id}
              className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,61,36,0.09)] backdrop-blur-md"
            >
              <div className="border-b border-forest-900/[0.08] pb-5">
                <p className="font-ge text-[0.62rem] font-extrabold uppercase tracking-[0.3em] text-gs-gold">{spec.id}</p>
                <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-forest-950">{spec.title}</h2>
                <p className="mt-2 max-w-lg font-ge text-[0.95rem] leading-relaxed text-forest-700">{spec.subtitle}</p>
              </div>
              <div className="mt-10 flex justify-center px-1">
                <div className="w-full max-w-[600px]">{spec.render()}</div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="fixed -left-[9999px] top-0 w-[640px] bg-white p-12" id="business-cards-pdf-export-root">
        <div className="space-y-14">
          <div className="border-b border-black/10 pb-8">
            <p className="font-ge text-xs font-bold uppercase tracking-[0.22em] text-forest-700">Golf Sol Ireland</p>
            <p className="font-display mt-3 text-3xl font-bold tracking-tight text-forest-950">
              Business card catalogue — {businessCardPerson.name}
            </p>
            <p className="mt-4 font-ge text-base leading-relaxed text-forest-700">
              {businessCardContact.websiteDisplay} · {businessCardContact.email} · {businessCardContact.phoneIe} ·{' '}
              {businessCardContact.phoneEs} · Co. Reg. Ireland {businessCardContact.companyRegIreland}
            </p>
          </div>
          {BUSINESS_CARD_SPECS.map((spec) => (
            <div key={`pdf-${spec.id}`}>
              <p className="mb-5 font-ge text-[0.7rem] font-bold uppercase tracking-[0.26em] text-forest-600">
                {spec.id} · {spec.title}
              </p>
              <div className="max-w-[600px]">{spec.render()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
