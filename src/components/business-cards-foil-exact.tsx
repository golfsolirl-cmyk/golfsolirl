/**
 * Golf Sol Ireland — exact foil luxury business card (reference mockup).
 * Landscape 85×55mm: centred brand front; split contact + QR back.
 */
import type { ReactNode } from 'react'
import { FaBluesky, FaFacebookF, FaLinkedinIn, FaPhone, FaWhatsapp } from 'react-icons/fa6'
import { BusinessCardQr } from './business-card-qr'
import type { BusinessCardRenderMode } from '../lib/business-cards-catalog-types'
import { GOLFSOL_BRAND_LOGO_INTRINSIC, GOLFSOL_BRAND_LOGO_SOURCE } from '../lib/brand-logo-assets'
import { BRAND_BUSINESS_CARD_HERO_BG_SRC } from '../lib/brand-visual-assets'
import { businessCardContact, businessCardLuxuryPalette, businessCardSocialLinks } from '../lib/business-cards-config'

export const FOIL_CARD_LW = 850
export const FOIL_CARD_LH = Math.round((FOIL_CARD_LW * 55) / 85)
export const FOIL_CARD_PW = 550
export const FOIL_CARD_PH = Math.round((FOIL_CARD_PW * 85) / 55)

const P = businessCardLuxuryPalette

/** Inset at native card width (550 / 850) — same for preview + export. */
const FOIL_INSET = 'clamp(12px,2.55cqw,18px)'
const FOIL_FRONT_PAD = 'clamp(6px,1.45cqw,10px) clamp(7px,1.6cqw,11px)'

/** QR at print resolution — sized to leave room for label + contact on back. */
const FOIL_QR_PORTRAIT = Math.round(FOIL_CARD_PW * 0.276)
/** Landscape back hero QR — sized for right column (~42% card width). */
const FOIL_QR_LANDSCAPE = Math.round(FOIL_CARD_LW * 0.168)

/** Card type — white primary, cream off-white secondary/muted. */
const FOIL_COLORS = {
  white: '#FFFFFF',
  cream: '#F7F3E9',
  muted: 'rgba(255,255,255,0.88)'
} as const

const FOIL_TYPE = {
  shadow: 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.52)]',
  shadowSoft: 'drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]'
} as const

/** Mustard gold accents — avoid `transparent` gradient stops (fade to white in some engines). */
const FOIL_NAME_OUTLINE_FOREST = '#031a12'
const FOIL_GOLD = '#E8BC55'
const FOIL_GOLD_DIVIDER_H = `linear-gradient(90deg, rgba(4,20,12,0) 0%, ${FOIL_GOLD} 50%, rgba(4,20,12,0) 100%)`
const FOIL_GOLD_DIVIDER_V = `linear-gradient(180deg, rgba(4,20,12,0) 0%, ${FOIL_GOLD} 50%, rgba(4,20,12,0) 100%)`

export type FoilCardPerson = {
  readonly name: string
  readonly roleTitle: string
  readonly phone: string
  readonly phoneTel?: string
  readonly email: string
  readonly websiteDisplay: string
  readonly websiteUrl: string
  readonly location: string
  readonly qrUrl: string
}

function foilInset(_mode: BusinessCardRenderMode) {
  return FOIL_INSET
}

/** Foil card front — centred lockup; crest, type, and vertical rhythm. */
function foilFrontType(_mode: BusinessCardRenderMode, orientation: 'landscape' | 'portrait') {
  const landscape = orientation === 'landscape'
  return {
    crest: landscape
      ? 'mb-[clamp(10px,2.5cqh,18px)] max-h-[min(54cqh,11rem)] w-auto object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)]'
      : 'mb-[clamp(12px,2.8cqh,22px)] max-h-[min(52cqh,12rem)] w-auto object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)]',
    title: 'text-[clamp(1.85rem,13.5cqw,2.95rem)] leading-[0.96]',
    ireland: 'text-[clamp(12px,4.2cqw,1.05rem)] leading-[1.08] tracking-[0.1em]',
    titleToIreland: landscape
      ? 'mt-[clamp(8px,1.85cqh,14px)]'
      : 'mt-[clamp(8px,2cqh,16px)]',
    sub: landscape
      ? 'text-[clamp(11px,3.65cqh,1.05rem)] leading-[1.12] tracking-[0.03em]'
      : 'text-[clamp(12px,4.85cqw,1.08rem)] leading-[1.12] tracking-[0.03em]',
    tag: landscape
      ? 'text-[clamp(10px,3.2cqh,0.9rem)] leading-[1.12] tracking-[0.02em]'
      : 'text-[clamp(11px,4.25cqw,0.92rem)] leading-[1.12] tracking-[0.02em]',
    subToTag: landscape
      ? 'mt-[clamp(6px,1.35cqh,11px)]'
      : 'mt-[clamp(7px,1.5cqh,12px)]',
    taglineGap: landscape
      ? 'mt-[clamp(26px,6.2cqh,40px)]'
      : 'mt-[clamp(30px,7.2cqh,48px)]'
  }
}

function foilFrontPad(_mode: BusinessCardRenderMode) {
  return FOIL_FRONT_PAD
}

/** @deprecated alias */
function foilPortraitPad(mode: BusinessCardRenderMode) {
  return foilFrontPad(mode)
}

type FoilBackTypeScale = ReturnType<typeof foilBackType>

/** Foil card back — large type scale (portrait). */
function foilBackType(_mode: BusinessCardRenderMode) {
  return {
    name: 'text-[clamp(1.65rem,11cqw,2.15rem)] leading-[1.02] tracking-[0.03em]',
    role: 'text-[clamp(12px,4.2cqw,1.02rem)] leading-[1.1] tracking-[0.12em]',
    line: 'text-[clamp(10px,3.4cqw,0.82rem)] leading-[1.18] tracking-[0.03em]',
    lineBold: 'text-[clamp(10px,3.5cqw,0.86rem)] leading-[1.16] tracking-[0.04em]',
    reg: 'text-[clamp(7px,2.1cqw,0.48rem)] leading-[1.2] tracking-[0.06em]',
    qrLabel: 'text-[clamp(8px,2.4cqw,0.58rem)] leading-[1.12] tracking-[0.1em]'
  }
}

/** Portrait back — name hero, contact under QR (type + vertical rhythm). */
function portraitBackType(_mode: BusinessCardRenderMode) {
  return {
    name: 'text-[clamp(1.62rem,10.5cqw,2.2rem)] leading-[1.02] tracking-[0.05em]',
    role: 'text-[clamp(11px,3.45cqw,0.94rem)] leading-[1.1] tracking-[0.14em]',
    nameToRole: 'mt-[clamp(8px,2cqh,14px)]',
    phoneIcon: 'h-[clamp(13px,3cqh,18px)] w-[clamp(13px,3cqh,18px)]',
    phoneCode: 'text-[clamp(0.98rem,4.5cqw,1.2rem)] leading-none tracking-[0.22em]',
    phone: 'text-[clamp(0.88rem,3.75cqw,1.1rem)] leading-[1.15] tracking-[0.01em]',
    line: 'text-[clamp(1rem,4.9cqw,1.26rem)] leading-[1.14] tracking-[0.04em]',
    lineBold: 'text-[clamp(1.05rem,5.1cqw,1.3rem)] leading-[1.12] tracking-[0.03em]',
    reg: 'text-[clamp(0.68rem,2.95cqw,0.84rem)] leading-[1.14] tracking-[0.1em]',
    qrLabel: 'text-[clamp(0.62rem,3.6cqw,0.82rem)] leading-[1.08] tracking-[0.16em]',
    identityToQr: 'pt-[clamp(12px,3cqh,22px)]',
    qrToContact: 'pb-[clamp(10px,2.2cqh,16px)]',
    contactStackGap: 'gap-[clamp(6px,1.35cqh,11px)]',
    phonesToDetails: 'my-[clamp(8px,1.75cqh,14px)]',
    socialDivider: 'my-[clamp(10px,2.2cqh,18px)]'
  }
}

type FoilEditorialBackTypeScale = ReturnType<typeof portraitBackType>

/** Landscape back — larger type with tight cqh/cqw caps to avoid clip. */
function landscapeBackType(_mode: BusinessCardRenderMode): FoilEditorialBackTypeScale {
  return {
    name: 'text-[clamp(1.28rem,9.2cqh,1.68rem)] leading-[1.03] tracking-[0.05em]',
    role: 'text-[clamp(10px,3.4cqh,0.88rem)] leading-[1.1] tracking-[0.14em]',
    nameToRole: 'mt-[clamp(5px,1.2cqh,9px)]',
    phoneIcon: 'h-[clamp(11px,2.45cqh,14px)] w-[clamp(11px,2.45cqh,14px)]',
    phoneCode: 'text-[clamp(0.94rem,4.55cqw,1.14rem)] leading-none tracking-[0.2em]',
    phone: 'text-[clamp(0.84rem,3.45cqw,1.04rem)] leading-[1.12] tracking-[0.01em]',
    line: 'text-[clamp(0.9rem,3.85cqh,1.12rem)] leading-[1.14] tracking-[0.04em]',
    lineBold: 'text-[clamp(0.94rem,4cqh,1.16rem)] leading-[1.12] tracking-[0.03em]',
    reg: 'text-[clamp(0.58rem,2.85cqh,0.76rem)] leading-[1.14] tracking-[0.1em]',
    qrLabel: 'text-[clamp(0.64rem,3.25cqh,0.86rem)] leading-[1.1] tracking-[0.18em]',
    identityToContact: 'mt-[clamp(6px,1.35cqh,10px)]',
    contactStackGap: 'gap-[clamp(3px,0.75cqh,6px)]',
    phonesToDetails: 'my-[clamp(5px,1.1cqh,8px)]',
    socialDivider: 'my-[clamp(5px,1.25cqh,9px)]',
    detailRowPad: 'py-[clamp(2px,0.45cqh,4px)]'
  }
}

/** Portrait back socials — LinkedIn, Facebook, WhatsApp only. */
const PORTRAIT_CARD_SOCIALS = [
  { label: 'LinkedIn' as const, href: 'https://www.linkedin.com/' },
  { label: 'Facebook' as const, href: 'https://www.facebook.com/' },
  { label: 'WhatsApp' as const, href: 'https://wa.me/353874464766' }
]

const FOIL_SOCIAL_ICON = {
  LinkedIn: FaLinkedinIn,
  Facebook: FaFacebookF,
  WhatsApp: FaWhatsapp,
  Bluesky: FaBluesky
} as const

type FoilPortraitContactVariant = 'email' | 'location' | 'phone-es' | 'phone-ie' | 'reg' | 'web'

/** Styled contact row — pills, gold accents, bold hierarchy. */
function FoilStyledContactRow({
  variant,
  children,
  sizeClass,
  align = 'center',
  compact = false,
  dense = false
}: {
  readonly variant: FoilPortraitContactVariant
  readonly children: ReactNode
  readonly sizeClass: string
  readonly align?: 'center' | 'left'
  readonly compact?: boolean
  readonly dense?: boolean
}) {
  const gold = '#E8BC55'
  const cream = FOIL_COLORS.cream
  const rowAlign = align === 'left' ? 'justify-start' : 'justify-center'
  const textAlign = align === 'left' ? 'text-left' : 'text-center'
  const rowPad = dense ? 'py-px' : 'py-0.5'

  if (variant === 'phone-ie' || variant === 'phone-es') {
    const badge = variant === 'phone-ie' ? 'IE' : 'ES'
    return (
      <div className={`flex ${rowPad} ${rowAlign}`}>
        <span
          data-keep-color
          className={`inline-flex max-w-full items-center ${compact ? 'gap-1.5 px-2 py-0.5' : 'gap-2 px-3 py-1'} rounded-full border font-ge font-extrabold tracking-[0.02em] ${FOIL_TYPE.shadowSoft} ${sizeClass}`}
          style={{
            color: FOIL_COLORS.white,
            borderColor: 'rgba(232,188,85,0.55)',
            background: 'linear-gradient(135deg, rgba(232,188,85,0.22) 0%, rgba(255,255,255,0.06) 100%)',
            boxShadow: '0 2px 14px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)'
          }}
        >
          <span
            className="shrink-0 rounded-sm px-1.5 py-0.5 font-ge text-[0.62em] font-black leading-none tracking-[0.2em]"
            style={{ color: gold, backgroundColor: 'rgba(232,188,85,0.2)' }}
          >
            {badge}
          </span>
          <span className="min-w-0">{children}</span>
        </span>
      </div>
    )
  }

  if (variant === 'web') {
    return (
      <div className={`${rowPad} ${textAlign}`}>
        <span
          data-keep-color
          className={`inline-block border-b-2 font-ge font-extrabold tracking-[0.05em] ${FOIL_TYPE.shadowSoft} ${sizeClass}`}
          style={{
            color: cream,
            borderColor: gold
          }}
        >
          {children}
        </span>
      </div>
    )
  }

  if (variant === 'email') {
    return (
      <p className={`${rowPad} ${textAlign}`}>
        <span
          data-keep-color
          className={`font-ge font-extrabold tracking-[0.02em] ${FOIL_TYPE.shadowSoft} ${sizeClass}`}
          style={{ color: FOIL_COLORS.white }}
        >
          {children}
        </span>
      </p>
    )
  }

  if (variant === 'location') {
    return (
      <p className={`${rowPad} ${textAlign}`}>
        <span
          data-keep-color
          className={`font-ge font-extrabold tracking-[0.05em] ${FOIL_TYPE.shadowSoft} ${sizeClass}`}
          style={{ color: cream }}
        >
          {children}
        </span>
      </p>
    )
  }

  return (
    <p className={`${rowPad} ${textAlign}`}>
      <span
        data-keep-color
        className={`font-ge font-extrabold uppercase tracking-[0.14em] ${FOIL_TYPE.shadowSoft} ${sizeClass}`}
        style={{ color: gold }}
      >
        {children}
      </span>
    </p>
  )
}

function FoilBackCrestWatermark({ crestSrc }: { readonly crestSrc: string }) {
  return (
    <>
      <img
        src={crestSrc}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 max-h-[min(72cqh,11rem)] w-auto -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.1]"
        decoding="async"
        draggable={false}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(64cqh,10rem)] w-[min(64cqh,10rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.04]"
      />
    </>
  )
}

/** Hero name — dark outline + white fill (minimal gold; sharp on foil backs). */
function FoilHeroName({
  children,
  className,
  align
}: {
  readonly children: ReactNode
  readonly className: string
  readonly align: 'center' | 'left'
}) {
  const wrapAlign = align === 'left' ? 'text-left' : 'text-center'
  const letterClass = `font-ge-display font-black uppercase ${wrapAlign} ${className}`
  const strokeOnly = {
    color: 'transparent',
    paintOrder: 'stroke fill' as const
  }

  return (
    <span
      data-keep-color
      className={`relative isolate block w-full overflow-visible ${wrapAlign}`}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute left-0 top-0 w-full ${letterClass}`}
        style={{
          ...strokeOnly,
          WebkitTextStroke: `3.5px ${FOIL_NAME_OUTLINE_FOREST}`
        }}
      >
        {children}
      </span>
      <span
        aria-hidden
        className={`pointer-events-none absolute left-0 top-0 w-full ${letterClass}`}
        style={{
          ...strokeOnly,
          WebkitTextStroke: '1.25px rgba(255,255,255,0.65)'
        }}
      >
        {children}
      </span>
      <span
        data-keep-color
        className={`relative block ${letterClass}`}
        style={{
          color: FOIL_COLORS.white,
          textShadow: '0 1px 0 rgba(0,0,0,0.65)'
        }}
      >
        {children}
      </span>
    </span>
  )
}

function FoilBackIdentityBlock({
  person,
  type,
  align,
  showDivider = true
}: {
  readonly person: FoilCardPerson
  readonly type: FoilBackTypeScale | FoilEditorialBackTypeScale
  readonly align: 'center' | 'left'
  readonly showDivider?: boolean
}) {
  const textAlign = align === 'left' ? 'text-left' : 'text-center'
  const barClass = align === 'left' ? 'mr-auto' : 'mx-auto'
  const nameToRole =
    'nameToRole' in type && typeof type.nameToRole === 'string' ? type.nameToRole : 'mt-[clamp(6px,1.4cqh,11px)]'

  return (
    <>
      <FoilHeroName align={align} className={type.name}>
        {person.name}
      </FoilHeroName>
      <FoilWhiteText
        tone="cream"
        block
        className={`${nameToRole} font-ge font-bold uppercase ${textAlign} ${FOIL_TYPE.shadowSoft} ${type.role}`}
      >
        {person.roleTitle}
      </FoilWhiteText>
      {showDivider ? (
        <div
          aria-hidden
          className={`my-1 h-[2px] w-[min(88%,12rem)] rounded-full opacity-90 ${barClass}`}
          style={{ background: FOIL_GOLD_DIVIDER_H }}
        />
      ) : null}
    </>
  )
}

/** Editorial back phones — IE | ES side-by-side, high emphasis. */
function FoilEditorialPhoneRows({
  person,
  type,
  align,
  layout = 'portrait'
}: {
  readonly person: FoilCardPerson
  readonly type: FoilEditorialBackTypeScale
  readonly align: 'center' | 'left'
  readonly layout?: 'landscape' | 'portrait'
}) {
  const landscape = layout === 'landscape'
  const rowAlign = align === 'left' ? 'items-start text-left' : 'items-center text-center'
  const colClass = `flex min-w-0 flex-1 flex-col gap-[clamp(3px,0.85cqh,6px)] ${
    landscape ? 'px-[clamp(2px,0.85cqw,6px)]' : 'px-[clamp(4px,1.15cqw,8px)]'
  } ${rowAlign}`
  const panelPy = landscape ? 'py-[clamp(7px,1.6cqh,11px)]' : 'py-[clamp(9px,2cqh,15px)]'
  const phoneIconClass =
    'phoneIcon' in type && typeof type.phoneIcon === 'string'
      ? type.phoneIcon
      : 'h-[clamp(14px,3.2cqh,18px)] w-[clamp(14px,3.2cqh,18px)]'

  const numberRowJustify = align === 'left' ? 'justify-start' : 'justify-center'

  const renderChannel = (code: 'ES' | 'IE', number: string) => (
    <>
      <span
        data-keep-color
        className={`font-ge-display font-black uppercase ${type.phoneCode} ${FOIL_TYPE.shadowSoft}`}
        style={{ color: FOIL_GOLD }}
      >
        {code}
      </span>
      <div
        data-keep-color
        className={`inline-flex max-w-full items-center gap-[clamp(4px,0.9cqw,7px)] ${numberRowJustify}`}
      >
        <FaPhone
          className={`${phoneIconClass} shrink-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]`}
          aria-hidden
          style={{ color: FOIL_GOLD, fill: 'currentColor' }}
        />
        <span
          className={`min-w-0 font-ge font-black tabular-nums leading-[1.15] ${type.phone} ${FOIL_TYPE.shadow} [overflow-wrap:anywhere]`}
          style={{
            color: FOIL_COLORS.white,
            textShadow: '0 1px 0 rgba(255,255,255,0.15), 0 2px 10px rgba(0,0,0,0.55)'
          }}
        >
          {number}
        </span>
      </div>
    </>
  )

  return (
    <div
      className="w-full max-w-full overflow-visible"
      data-keep-color
    >
      <div
        className={`grid w-full grid-cols-[1fr_auto_1fr] items-stretch overflow-visible rounded-[8px] border border-[#E8BC55]/40 bg-gradient-to-b from-white/[0.08] to-white/[0.02] ${panelPy} shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_20px_rgba(0,0,0,0.28)]`}
      >
        <div className={colClass}>{renderChannel('IE', person.phone)}</div>
        <div
          aria-hidden
          className="mx-0.5 w-[2px] shrink-0 self-stretch rounded-full opacity-90"
          style={{ background: FOIL_GOLD_DIVIDER_V }}
        />
        <div className={colClass}>{renderChannel('ES', businessCardContact.phoneEs)}</div>
      </div>
    </div>
  )
}

function FoilBackContactStack({
  person,
  type,
  align,
  compact = false,
  dense = false,
  presentation = 'default'
}: {
  readonly person: FoilCardPerson
  readonly type: FoilBackTypeScale
  readonly align: 'center' | 'left'
  readonly compact?: boolean
  readonly dense?: boolean
  readonly presentation?: 'default' | 'portrait-editorial' | 'landscape-editorial'
}) {
  const textAlign = align === 'left' ? 'text-left' : 'text-center'
  const rowPad = dense ? 'py-px' : 'py-0.5'

  if (presentation === 'portrait-editorial' || presentation === 'landscape-editorial') {
    const editorialType = type as FoilEditorialBackTypeScale
    const isLandscape = presentation === 'landscape-editorial'
    const blockAlign = isLandscape || align === 'center' ? 'items-center' : 'items-start'
    const phonesAlign = isLandscape ? 'center' : align
    const detailsAlign = isLandscape ? 'center' : align
    const detailsTextAlign = detailsAlign === 'left' ? 'text-left' : 'text-center'
    const stackGap =
      'contactStackGap' in editorialType && typeof editorialType.contactStackGap === 'string'
        ? editorialType.contactStackGap
        : 'gap-[clamp(5px,1.2cqh,9px)]'
    const phonesDivider =
      'phonesToDetails' in editorialType && typeof editorialType.phonesToDetails === 'string'
        ? editorialType.phonesToDetails
        : 'my-[clamp(6px,1.3cqh,10px)]'
    const detailRowPad =
      isLandscape &&
      'detailRowPad' in editorialType &&
      typeof editorialType.detailRowPad === 'string'
        ? editorialType.detailRowPad
        : 'py-[clamp(3px,0.65cqh,6px)]'

    return (
      <div className={`flex w-full max-w-full flex-col ${blockAlign} ${stackGap} overflow-visible`}>
        <FoilEditorialPhoneRows
          person={person}
          type={editorialType}
          align={phonesAlign}
          layout={isLandscape ? 'landscape' : 'portrait'}
        />
        <div
          aria-hidden
          className={`${phonesDivider} h-px opacity-60 ${isLandscape ? 'mx-auto w-[min(88%,11rem)]' : 'mx-auto w-[min(64%,8.5rem)]'}`}
          style={{ background: FOIL_GOLD_DIVIDER_H }}
        />
        <div className={`w-full max-w-full ${detailRowPad} ${detailsTextAlign}`}>
          <span
            data-keep-color
            className={`inline-block max-w-full font-ge font-bold ${FOIL_TYPE.shadowSoft} ${editorialType.line}`}
            style={{ color: FOIL_COLORS.cream }}
          >
            {person.websiteDisplay}
          </span>
        </div>
        <p className={`w-full max-w-full ${detailRowPad} ${detailsTextAlign}`}>
          <span
            data-keep-color
            className={`inline-block max-w-full font-ge font-bold ${FOIL_TYPE.shadowSoft} ${editorialType.lineBold}`}
            style={{ color: FOIL_COLORS.white }}
          >
            {person.email}
          </span>
        </p>
        <p className={`w-full max-w-full ${detailRowPad} ${detailsTextAlign}`}>
          <span
            data-keep-color
            className={`inline-block max-w-full font-ge font-semibold ${FOIL_TYPE.shadowSoft} ${editorialType.line}`}
            style={{ color: FOIL_COLORS.cream }}
          >
            {person.location}
          </span>
        </p>
        <p className={`w-full max-w-full ${detailRowPad} ${detailsTextAlign}`}>
          <span
            data-keep-color
            className={`inline-block max-w-full font-ge font-bold uppercase ${FOIL_TYPE.shadowSoft} ${editorialType.reg}`}
            style={{ color: FOIL_GOLD }}
          >
            Co. Reg. Ireland · {businessCardContact.companyRegIreland}
          </span>
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-0">
      <FoilStyledContactRow variant="phone-ie" sizeClass={type.lineBold} align={align} compact={compact} dense={dense}>
        {person.phone}
      </FoilStyledContactRow>
      <FoilStyledContactRow variant="phone-es" sizeClass={type.lineBold} align={align} compact={compact} dense={dense}>
        {businessCardContact.phoneEs}
      </FoilStyledContactRow>
      <FoilStyledContactRow variant="web" sizeClass={type.line} align={align} dense={dense}>
        {person.websiteDisplay}
      </FoilStyledContactRow>
      <FoilStyledContactRow variant="email" sizeClass={type.lineBold} align={align} dense={dense}>
        {person.email}
      </FoilStyledContactRow>
      <FoilStyledContactRow variant="location" sizeClass={type.line} align={align} dense={dense}>
        {person.location}
      </FoilStyledContactRow>
      <FoilStyledContactRow variant="reg" sizeClass={type.reg} align={align} dense={dense}>
        Co. Reg. Ireland · {businessCardContact.companyRegIreland}
      </FoilStyledContactRow>
    </div>
  )
}

function FoilBackGoldQr({
  person,
  mode,
  crestSrc,
  qrSize,
  labelClassName,
  hero = false,
  heroFrameClass
}: {
  readonly person: FoilCardPerson
  readonly mode: BusinessCardRenderMode
  readonly crestSrc: string
  readonly qrSize: number
  readonly labelClassName: string
  readonly hero?: boolean
  readonly heroFrameClass?: string
}) {
  /** ~42% of QR — bold crest; H error correction keeps scans reliable. */
  const qrLogoSize = Math.round(qrSize * 0.42)
  const qr = (
    <BusinessCardQr
      value={person.qrUrl}
      mode={mode}
      size={qrSize}
      label="SCAN TO BOOK"
      labelStyle="foil-button"
      labelClassName={`font-black ${labelClassName}`}
      centerLogoSrc={crestSrc}
      centerLogoSize={qrLogoSize}
      variant="gold"
    />
  )

  if (!hero) {
    return qr
  }

  return (
    <div
      className={
        heroFrameClass ??
        'mx-auto w-full max-w-[min(88%,13rem)] overflow-visible rounded-[12px] border border-[#E8BC55]/55 bg-gradient-to-b from-white/[0.1] to-white/[0.02] px-2.5 py-2 shadow-[0_14px_44px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.14)]'
      }
      data-keep-color
    >
      <div className="flex w-full flex-col items-center overflow-visible">{qr}</div>
    </div>
  )
}

function FoilSocialIconRow({
  mode,
  large = false,
  align = 'center',
  chipScale = 'portrait'
}: {
  readonly mode: BusinessCardRenderMode
  readonly large?: boolean
  readonly align?: 'center' | 'left'
  /** Landscape back uses card height (cqh), not width (cqw), for chip sizing. */
  readonly chipScale?: 'landscape-back' | 'portrait' | 'landscape' | 'portrait-back'
}) {
  const landscapeLarge = large && chipScale === 'landscape'
  const landscapeBack = large && chipScale === 'landscape-back'
  const portraitBack = large && chipScale === 'portrait-back'
  const chip = landscapeLarge
    ? 'h-[clamp(26px,5.5cqh,32px)] w-[clamp(26px,5.5cqh,32px)]'
    : landscapeBack
      ? 'h-[clamp(34px,6.2cqh,42px)] w-[clamp(34px,6.2cqh,42px)]'
      : portraitBack
        ? 'h-[clamp(38px,6.8cqh,46px)] w-[clamp(38px,6.8cqh,46px)]'
        : large
          ? 'h-[clamp(36px,6.5cqh,44px)] w-[clamp(36px,6.5cqh,44px)]'
          : 'h-[clamp(22px,5.5cqw,28px)] w-[clamp(22px,5.5cqw,28px)]'
  const icon = landscapeLarge
    ? 'h-[clamp(14px,3.2cqh,18px)] w-[clamp(14px,3.2cqh,18px)]'
    : landscapeBack
      ? 'h-[clamp(17px,3.1cqh,21px)] w-[clamp(17px,3.1cqh,21px)]'
      : portraitBack
        ? 'h-[clamp(19px,3.4cqh,23px)] w-[clamp(19px,3.4cqh,23px)]'
        : large
          ? 'h-[clamp(18px,4.2cqh,22px)] w-[clamp(18px,4.2cqh,22px)]'
          : 'h-[clamp(9px,2.2cqw,11px)] w-[clamp(9px,2.2cqw,11px)]'
  const links = large ? PORTRAIT_CARD_SOCIALS : businessCardSocialLinks
  const justify = align === 'left' ? 'justify-start' : 'justify-center'

  return (
    <div
      className={`relative z-[3] flex shrink-0 flex-wrap items-center ${justify} ${landscapeLarge ? 'mt-1 gap-2.5' : landscapeBack ? 'mt-0 gap-3.5' : portraitBack ? 'mt-0 gap-4' : large ? 'mt-1.5 gap-3' : 'mt-2 gap-2'}`}
      aria-label="Social media"
      data-keep-color
    >
      {links.map(({ label, href }) => {
        const Icon = FOIL_SOCIAL_ICON[label as keyof typeof FOIL_SOCIAL_ICON]
        if (!Icon) return null
        return (
          <span
            key={label}
            data-keep-color
            title={`${label}: ${href}`}
            className={`inline-flex ${chip} items-center justify-center rounded-full border border-white/35 bg-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.4)]`}
            style={{ color: FOIL_COLORS.cream }}
          >
            <Icon
              className={`${icon} shrink-0`}
              aria-hidden
              style={{ color: FOIL_COLORS.cream, fill: 'currentColor' }}
            />
            <span className="sr-only">
              {label}: {href}
            </span>
          </span>
        )
      })}
    </div>
  )
}

/** Portrait back — identity (nudged), hero QR, contact, social strip. */
function FoilPortraitBack({
  mode,
  person
}: {
  readonly mode: BusinessCardRenderMode
  readonly person: FoilCardPerson
}) {
  const crestSrc = foilAssetUrl(GOLFSOL_BRAND_LOGO_SOURCE)
  const type = portraitBackType(mode)
  const qrSize = FOIL_QR_PORTRAIT

  return (
    <div className="absolute inset-0 rounded-[18px]">
      <div className="absolute inset-0 overflow-hidden rounded-[18px]">
        <FoilFleetGradientBackground variant="back" />
        <CelticCorner flip="tl" />
        <CelticCorner flip="br" />
        <FoilBackCrestWatermark crestSrc={crestSrc} />
      </div>

      <div
        className="relative z-[1] flex h-full min-h-0 flex-col items-center overflow-visible text-center [container-type:size]"
        style={{ padding: foilPortraitPad(mode) }}
      >
        {/* Name + role — below top edge, no divider (QR is the break) */}
        <header className="relative z-[2] w-full shrink-0 pt-[clamp(12px,3cqh,20px)]">
          <FoilBackIdentityBlock person={person} type={type} align="center" showDivider={false} />
        </header>

        {/* Hero QR — below name/role */}
        <section className={`relative z-[2] w-full shrink-0 ${type.identityToQr} ${type.qrToContact}`}>
          <FoilBackGoldQr
            person={person}
            mode={mode}
            crestSrc={crestSrc}
            qrSize={qrSize}
            labelClassName={type.qrLabel}
            hero
          />
        </section>

        {/* Contact + social — natural height (no flex squeeze / clip) */}
        <footer className="relative z-[2] flex w-full shrink-0 flex-col items-center overflow-visible pb-[clamp(4px,1cqh,8px)]">
          <div className="w-full max-w-[min(98%,19rem)] overflow-visible px-0.5">
            <FoilBackContactStack person={person} type={type} align="center" dense presentation="portrait-editorial" />
          </div>

          <div
            aria-hidden
            className={`mx-auto ${type.socialDivider} h-[1px] w-[min(72%,9rem)] opacity-80`}
            style={{ background: FOIL_GOLD_DIVIDER_H }}
          />

          <FoilSocialIconRow mode={mode} large chipScale="portrait-back" />
        </footer>
      </div>
    </div>
  )
}

/** Landscape back — editorial left column (portrait look) | hero QR right. */
function FoilLandscapeBack({
  mode,
  person
}: {
  readonly mode: BusinessCardRenderMode
  readonly person: FoilCardPerson
}) {
  const crestSrc = foilAssetUrl(GOLFSOL_BRAND_LOGO_SOURCE)
  const type = landscapeBackType(mode)
  const qrSize = FOIL_QR_LANDSCAPE

  return (
    <div className="absolute inset-0 rounded-[18px]">
      <div className="absolute inset-0 overflow-hidden rounded-[18px]">
        <FoilFleetGradientBackground variant="back" />
        <CelticCorner flip="tl" />
        <CelticCorner flip="br" />
        <FoilBackCrestWatermark crestSrc={crestSrc} />
      </div>

      <div
        className="relative z-[1] flex h-full min-h-0 flex-col overflow-visible [container-type:size]"
        style={{ padding: foilFrontPad(mode) }}
      >
        <div className="flex min-h-0 flex-1 items-stretch gap-0 overflow-visible">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center overflow-visible py-0.5 pr-1">
            <div className="relative z-[2] flex w-full min-w-0 max-w-full flex-col gap-0 overflow-visible">
              <div className="w-full shrink-0 text-left">
                <FoilBackIdentityBlock person={person} type={type} align="left" showDivider={false} />
              </div>
              <div
                className={`${type.identityToContact} flex w-full min-w-0 max-w-full shrink-0 flex-col items-center overflow-visible px-0.5 text-center`}
              >
                <FoilBackContactStack
                  person={person}
                  type={type}
                  align="center"
                  presentation="landscape-editorial"
                />
                <div
                  aria-hidden
                  className={`${type.socialDivider} h-px w-[min(92%,12rem)] opacity-80`}
                  style={{ background: FOIL_GOLD_DIVIDER_H }}
                />
                <FoilSocialIconRow mode={mode} large align="center" chipScale="landscape-back" />
              </div>
            </div>
          </div>

          <div
            aria-hidden
            className="mx-0.5 w-[2px] shrink-0 self-stretch rounded-full opacity-90"
            style={{ background: FOIL_GOLD_DIVIDER_V }}
          />

          <div className="flex w-[min(44%,372px)] shrink-0 flex-col items-center justify-center overflow-visible pl-1.5 pr-0.5">
            <div className="relative z-[2] flex max-h-full flex-col items-center overflow-visible">
              <FoilBackGoldQr
                person={person}
                mode={mode}
                crestSrc={crestSrc}
                qrSize={qrSize}
                labelClassName={type.qrLabel}
                hero
                heroFrameClass="mx-auto w-full max-w-[min(98%,16.5rem)] overflow-visible rounded-[12px] border border-[#E8BC55]/55 bg-gradient-to-b from-white/[0.1] to-white/[0.02] px-3 py-3 shadow-[0_14px_44px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.14)]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function foilAssetUrl(publicPath: string): string {
  if (/^https?:\/\//i.test(publicPath)) return publicPath
  const path = publicPath.startsWith('/') ? publicPath.slice(1) : publicPath
  const base = import.meta.env.BASE_URL
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${path}`
}

export function FoilPrintCardFigure({
  mode,
  orientation,
  children
}: {
  readonly mode: BusinessCardRenderMode
  readonly orientation: 'landscape' | 'portrait'
  readonly children: ReactNode
}) {
  const isPdf = mode === 'pdf'
  const w = orientation === 'landscape' ? FOIL_CARD_LW : FOIL_CARD_PW
  const h = orientation === 'landscape' ? FOIL_CARD_LH : FOIL_CARD_PH
  const landscape = orientation === 'landscape'

  const figure = (
    <figure
      data-keep-color
      className="gsol-business-card relative overflow-hidden rounded-[18px] [container-type:size]"
      style={{
        width: w,
        height: h,
        backgroundColor: '#013220',
        color: FOIL_COLORS.white
      }}
    >
      {children}
    </figure>
  )

  if (isPdf) {
    return figure
  }

  /** Preview: always lay out at print pixels, scale down to fit — matches PNG/PDF export. */
  return (
    <div
      className={`foil-card-preview-host relative mx-auto w-full [container-type:inline-size] ${
        landscape ? 'max-w-[720px] aspect-[85/55]' : 'max-w-[420px] aspect-[55/85]'
      }`}
    >
      <div
        className="absolute left-1/2 top-0 overflow-hidden rounded-[18px] shadow-[0_28px_70px_rgba(0,0,0,0.45),0_0_0_1px_rgba(212,175,55,0.2)]"
        style={{
          width: w,
          height: h,
          transform: `translateX(-50%) scale(calc(100cqw / ${w}px))`,
          transformOrigin: 'top center'
        }}
      >
        {figure}
      </div>
    </div>
  )
}

/** Mercedes fleet photo with deep forest gradient — white type reads clearly on top. */
function FoilFleetGradientBackground({ variant = 'front' }: { readonly variant?: 'back' | 'front' }) {
  const src = foilAssetUrl(BRAND_BUSINESS_CARD_HERO_BG_SRC)
  const isFront = variant === 'front'

  return (
    <>
      <img
        src={src}
        alt=""
        aria-hidden
        draggable={false}
        decoding="async"
        className="absolute inset-0 h-full w-full scale-[1.12] object-cover object-[center_42%]"
        style={{
          filter: isFront ? 'brightness(0.72) saturate(1.08) contrast(1.05)' : 'brightness(0.45) saturate(0.95) blur(1px)'
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: isFront
            ? 'linear-gradient(165deg, rgba(1,50,32,0.88) 0%, rgba(4,20,12,0.52) 38%, rgba(2,22,16,0.9) 72%, rgba(1,38,28,0.94) 100%)'
            : 'linear-gradient(168deg, rgba(1,50,32,0.94) 0%, rgba(14,59,46,0.9) 45%, rgba(2,22,16,0.96) 100%)'
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(4,20,12,0.75) 0%, transparent 35%, transparent 65%, rgba(4,20,12,0.7) 100%)'
        }}
      />
      {!isFront ? null : (
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.5\'/%3E%3C/svg%3E")'
          }}
        />
      )}
    </>
  )
}

function CelticCorner({ flip }: { readonly flip?: 'br' | 'tl' }) {
  const pos =
    flip === 'br'
      ? 'bottom-0 right-0 scale-x-[-1] scale-y-[-1]'
      : flip === 'tl'
        ? 'left-0 top-0'
        : 'left-0 top-0'
  return (
    <svg
      aria-hidden
      className={`gsol-card-deco pointer-events-none absolute ${pos} h-[22%] w-[22%] opacity-[0.42]`}
      viewBox="0 0 80 80"
      fill="none"
    >
      <path
        d="M4 4c12 8 20 8 28 0 8 12 8 20 0 28 12 8 20 8 28 0 8 12 8 20 0 28"
        fill="none"
        stroke={FOIL_GOLD}
        strokeWidth="1.2"
      />
      <circle cx="12" cy="12" r="2" fill={FOIL_GOLD} opacity="0.65" />
    </svg>
  )
}

function CornerGoldArc({ corner }: { readonly corner: 'bl' | 'br' | 'tl' | 'tr' }) {
  const paths: Record<string, string> = {
    tl: 'M8 52 Q8 8 52 8',
    br: 'M72 28 Q72 72 28 72'
  }
  const pos: Record<string, string> = {
    tl: 'left-0 top-0',
    br: 'bottom-0 right-0'
  }
  if (corner !== 'tl' && corner !== 'br') return null
  return (
    <svg
      aria-hidden
      className={`gsol-card-deco pointer-events-none absolute ${pos[corner]} h-[38%] w-[38%]`}
      viewBox="0 0 80 80"
      fill="none"
    >
      <path
        d={paths[corner]}
        fill="none"
        stroke={FOIL_GOLD}
        strokeWidth="2.2"
        opacity="0.9"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** White / off-white card typography — inline color beats `.ge-page p` dark defaults. */
function FoilWhiteText({
  children,
  className = '',
  tone = 'primary',
  block = false
}: {
  readonly children: ReactNode
  readonly className?: string
  readonly tone?: 'cream' | 'muted' | 'primary'
  readonly block?: boolean
}) {
  const color =
    tone === 'cream' ? FOIL_COLORS.cream : tone === 'muted' ? FOIL_COLORS.muted : FOIL_COLORS.white
  return (
    <span
      data-keep-color
      className={`${FOIL_TYPE.shadow} leading-[1.2] ${block ? 'block' : ''} ${className}`}
      style={{ color }}
    >
      {children}
    </span>
  )
}

function FoilFrontBrandLockup({
  mode,
  orientation
}: {
  readonly mode: BusinessCardRenderMode
  readonly orientation: 'landscape' | 'portrait'
}) {
  const isPdf = mode === 'pdf'
  const crestSrc = foilAssetUrl(GOLFSOL_BRAND_LOGO_SOURCE)
  const type = foilFrontType(mode, orientation)

  return (
    <>
      <img
        src={crestSrc}
        alt=""
        width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
        height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
        className={type.crest}
        decoding="async"
        draggable={false}
        fetchPriority={isPdf ? 'high' : 'auto'}
        loading={isPdf ? 'eager' : 'lazy'}
      />
      <div className="w-full max-w-[99%] overflow-visible">
        <FoilWhiteText block className={`font-ge-display font-black uppercase tracking-[0.04em] ${type.title}`}>
          Golf Sol
        </FoilWhiteText>
        <FoilWhiteText
          tone="cream"
          block
          className={`${type.titleToIreland} font-ge-display font-semibold uppercase ${FOIL_TYPE.shadowSoft} ${type.ireland}`}
        >
          — Ireland —
        </FoilWhiteText>
        <div className={`${type.taglineGap} w-full`}>
          <FoilWhiteText block className={`font-ge font-bold uppercase ${FOIL_TYPE.shadowSoft} ${type.sub}`}>
            Luxury Golf Transfers &amp; Experiences
          </FoilWhiteText>
          <FoilWhiteText
            tone="cream"
            block
            className={`${type.subToTag} font-ge font-semibold uppercase ${FOIL_TYPE.shadowSoft} ${type.tag}`}
          >
            Irish Drivers • Mercedes Fleet • Costa del Sol
          </FoilWhiteText>
        </div>
      </div>
    </>
  )
}

/** Reference front — taglines larger and nudged down on portrait + landscape. */
export function FoilExactFront({
  mode,
  orientation
}: {
  readonly mode: BusinessCardRenderMode
  readonly orientation: 'landscape' | 'portrait'
}) {
  const landscape = orientation === 'landscape'

  return (
    <div className="absolute inset-0 rounded-[18px]">
      <div className="absolute inset-0 overflow-hidden rounded-[18px]">
        <FoilFleetGradientBackground variant="front" />
        <CelticCorner flip="tl" />
        <CelticCorner flip="br" />
        <CornerGoldArc corner="tl" />
        <CornerGoldArc corner="br" />
      </div>

      <div
        className={`relative z-[1] flex h-full min-h-0 flex-col items-center justify-center overflow-visible px-0.5 text-center ${
          landscape ? 'pt-[clamp(10px,2.6cqh,20px)]' : 'pt-[clamp(14px,3.2cqh,24px)]'
        }`}
        style={{ padding: foilFrontPad(mode) }}
      >
        <div className="flex w-full max-w-full flex-col items-center justify-center">
          <FoilFrontBrandLockup mode={mode} orientation={orientation} />
        </div>
      </div>
    </div>
  )
}

/** Reference back — portrait centred, landscape split (shared foil styling). */
export function FoilExactBack({
  mode,
  orientation,
  person
}: {
  readonly mode: BusinessCardRenderMode
  readonly orientation: 'landscape' | 'portrait'
  readonly person: FoilCardPerson
  readonly nameScale?: 'default' | 'hero'
}) {
  if (orientation === 'portrait') {
    return <FoilPortraitBack mode={mode} person={person} />
  }

  return <FoilLandscapeBack mode={mode} person={person} />
}

export function foilPersonFromContact(
  person: { name: string; roleTitle: string },
  overrides?: Partial<FoilCardPerson>
): FoilCardPerson {
  return {
    name: person.name.toUpperCase(),
    roleTitle: person.roleTitle.toUpperCase(),
    phone: businessCardContact.phoneIe,
    phoneTel: businessCardContact.phoneIe.replace(/\s/g, ''),
    email: businessCardContact.email,
    websiteDisplay: businessCardContact.websiteDisplay,
    websiteUrl: businessCardContact.websiteUrl,
    location: 'Costa del Sol, Spain',
    qrUrl: businessCardContact.websiteUrl,
    ...overrides
  }
}

export function foilPersonTommy(): FoilCardPerson {
  return {
    name: "TOMMY O'SHEA",
    roleTitle: 'FOUNDER & GOLF TRAVEL SPECIALIST',
    phone: '+353 87 446 4766',
    phoneTel: '+353874464766',
    email: 'info@golfsolirl.com',
    websiteDisplay: 'www.golfsolirl.com',
    websiteUrl: 'https://golfsolirl.com',
    location: 'Costa del Sol, Spain',
    qrUrl: 'https://golfsolirl.com'
  }
}
