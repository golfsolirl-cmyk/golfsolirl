/**
 * Golf Sol Ireland business cards — homepage hero background, crest left,
 * gold divider, name + Operations Manager right, creative contact dock below.
 */
import { m, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6'
import { Globe, Mail, Phone } from 'lucide-react'
import type { BusinessCardRenderMode, BusinessCardSpec } from '../lib/business-cards-catalog-types'
import { BRAND_MARKETING_HERO_DESKTOP } from '../lib/brand-visual-assets'
import { GOLFSOL_BRAND_LOGO_HOSTED, GOLFSOL_BRAND_LOGO_INTRINSIC } from '../lib/brand-logo-assets'
import type { BusinessCardPersonBlurb } from '../lib/business-cards-config'
import {
  businessCardContact,
  businessCardPerson,
  businessCardPersonGreg,
  businessCardSocial
} from '../lib/business-cards-config'

/** Homepage desktop hero — same plate as marketing homepage banner. */
const CARD_HERO_SRC = BRAND_MARKETING_HERO_DESKTOP.webp

const LW = 850
const LH = Math.round((LW * 55) / 85)
const PW = 550
const PH = Math.round((PW * 85) / 55)

const INSET_SCREEN = 'clamp(12px,3vmin,22px)'
const INSET_PDF = '16px'
function inset(mode: BusinessCardRenderMode) {
  return mode === 'pdf' ? INSET_PDF : INSET_SCREEN
}

function assetUrl(publicPath: string): string {
  if (/^https?:\/\//i.test(publicPath)) return publicPath
  const path = publicPath.startsWith('/') ? publicPath.slice(1) : publicPath
  const base = import.meta.env.BASE_URL
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${path}`
}

function CardBrandLogo({ mode }: { readonly mode: BusinessCardRenderMode }) {
  const isPdf = mode === 'pdf'
  const src = assetUrl(GOLFSOL_BRAND_LOGO_HOSTED)
  return (
    <img
      src={src}
      alt=""
      width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
      height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
      className={
        isPdf
          ? 'h-auto max-h-[min(78cqh,9.5rem)] w-auto max-w-[min(42cqw,11rem)] object-contain object-left drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]'
          : 'h-auto min-h-[4.5rem] w-auto min-w-[5rem] max-h-[min(78cqh,9.5rem)] max-w-[min(42cqw,11rem)] object-contain object-left drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:min-h-0 sm:min-w-0'
      }
      decoding="async"
      draggable={false}
      fetchPriority={isPdf ? 'high' : 'auto'}
      loading={isPdf ? 'eager' : 'lazy'}
    />
  )
}

function FancyDivider({ mode }: { readonly mode: BusinessCardRenderMode }) {
  const isPdf = mode === 'pdf'
  return (
    <div
      aria-hidden
      className={`relative shrink-0 self-stretch ${isPdf ? 'w-[3px]' : 'w-[3px] sm:w-1'}`}
    >
      <div className="absolute inset-y-[8%] left-0 w-full rounded-full bg-gradient-to-b from-transparent via-[#d9be7a] to-transparent opacity-90" />
      <div className="absolute inset-y-[12%] left-1/2 w-px -translate-x-1/2 bg-white/35" />
    </div>
  )
}

function ContactDock({ mode }: { readonly mode: BusinessCardRenderMode }) {
  const isPdf = mode === 'pdf'
  const socials = [
    { label: 'Facebook', href: businessCardSocial.facebook, Icon: FaFacebookF },
    { label: 'Instagram', href: businessCardSocial.instagram, Icon: FaInstagram },
    { label: 'X', href: 'https://x.com/', Icon: FaXTwitter },
    { label: 'LinkedIn', href: businessCardSocial.linkedin, Icon: FaLinkedinIn }
  ] as const

  const textSize = isPdf ? 'text-[0.52rem]' : 'text-[clamp(9px,2.6vw,0.52rem)] sm:text-[0.52rem]'
  const iconSize = isPdf ? 'size-3' : 'size-3 sm:size-3.5'

  return (
    <div
      className={`relative z-[2] shrink-0 border-t border-[#d9be7a]/35 bg-[#03150f]/88 backdrop-blur-[2px] ${
        isPdf ? 'px-3 py-2' : 'px-3 py-2.5 sm:px-4'
      }`}
      style={{ paddingLeft: inset(mode), paddingRight: inset(mode) }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {socials.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/25 bg-[#0a3024] text-[#fbe8b5] shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition hover:border-[#d9be7a]/60 hover:bg-[#136047]"
            >
              <Icon className={iconSize} aria-hidden />
            </a>
          ))}
        </div>
        <p
          className={`font-ge font-black uppercase tracking-[0.2em] text-[#d9be7a] ${
            isPdf ? 'text-[0.38rem]' : 'text-[clamp(7px,2vw,0.38rem)]'
          }`}
        >
          Costa del Sol · Irish-owned
        </p>
      </div>

      <div className={`mt-2 grid gap-1.5 ${isPdf ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'}`}>
        <a
          href={`tel:${businessCardContact.phoneIe.replace(/\s/g, '')}`}
          className={`flex items-center gap-1.5 font-ge font-bold text-white ${textSize}`}
        >
          <Phone className="size-3 shrink-0 text-[#d9be7a]" strokeWidth={2.5} aria-hidden />
          <span>
            <span className="text-[#d9be7a]/90">IE </span>
            {businessCardContact.phoneIe}
          </span>
        </a>
        <a
          href={`mailto:${businessCardContact.email}`}
          className={`flex items-center gap-1.5 font-ge font-semibold text-[#f4f1ea] ${textSize}`}
        >
          <Mail className="size-3 shrink-0 text-[#d9be7a]" strokeWidth={2.5} aria-hidden />
          {businessCardContact.email}
        </a>
        <a
          href={businessCardContact.websiteUrl}
          className={`flex items-center gap-1.5 font-ge font-bold uppercase tracking-[0.08em] text-white ${textSize}`}
        >
          <Globe className="size-3 shrink-0 text-[#d9be7a]" strokeWidth={2.5} aria-hidden />
          {businessCardContact.websiteDisplay}
        </a>
      </div>
    </div>
  )
}

function PrintCardFigure({
  mode,
  orientation,
  children
}: {
  readonly mode: BusinessCardRenderMode
  readonly orientation: 'landscape' | 'portrait'
  readonly children: ReactNode
}) {
  const isPdf = mode === 'pdf'
  const w = orientation === 'landscape' ? LW : PW
  const h = orientation === 'landscape' ? LH : PH

  return (
    <figure
      className={
        isPdf
          ? 'relative overflow-hidden [container-type:size]'
          : `relative mx-auto overflow-hidden rounded-sm shadow-[0_40px_100px_rgba(0,0,0,0.35),0_0_0_1px_rgba(0,0,0,0.08)] [container-type:size] ${
              orientation === 'landscape' ? 'aspect-[85/55] w-full max-w-[720px]' : 'aspect-[55/85] w-full max-w-[420px]'
            }`
      }
      style={isPdf ? { width: w, height: h } : undefined}
    >
      {children}
    </figure>
  )
}

function HeroBackdrop({ mode }: { readonly mode: BusinessCardRenderMode }) {
  const img = assetUrl(CARD_HERO_SRC)
  const isPdf = mode === 'pdf'
  return (
    <>
      <img
        src={img}
        alt=""
        className="absolute inset-0 h-full w-full scale-[1.03] object-cover object-[50%_42%]"
        draggable={false}
        decoding="async"
        fetchPriority={isPdf ? 'high' : 'auto'}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-[#03150f]/72 via-[#03150f]/55 to-[#03150f]/88"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-[#03150f]/65 via-transparent to-[#03150f]/40"
      />
    </>
  )
}

function IdentityRow({
  mode,
  person,
  layout
}: {
  readonly mode: BusinessCardRenderMode
  readonly person: BusinessCardPersonBlurb
  readonly layout: 'portrait' | 'landscape'
}) {
  const isPdf = mode === 'pdf'
  const isLandscape = layout === 'landscape'

  return (
    <div
      className={`relative z-[1] flex min-h-0 flex-1 items-center gap-3 ${
        isLandscape ? 'flex-row' : 'flex-row'
      } ${isPdf ? 'overflow-hidden' : ''}`}
      style={{ padding: inset(mode), paddingBottom: isPdf ? '8px' : undefined }}
    >
      <div className={`flex shrink-0 items-center justify-center ${isLandscape ? 'w-[38%]' : 'w-[36%]'}`}>
        <CardBrandLogo mode={mode} />
      </div>
      <FancyDivider mode={mode} />
      <div className="flex min-w-0 flex-1 flex-col justify-center py-1">
        <p
          className={`font-ge font-black uppercase tracking-[0.06em] text-white ${
            isPdf
              ? isLandscape
                ? 'text-[1.05rem]'
                : 'text-[1.18rem]'
              : isLandscape
                ? 'text-[clamp(0.9rem,2.4vw,1.05rem)]'
                : 'text-[clamp(1rem,3.4vw,1.22rem)]'
          }`}
        >
          {person.name}
        </p>
        <p
          className={`mt-1 font-ge font-bold uppercase tracking-[0.18em] text-[#d9be7a] ${
            isPdf ? 'text-[0.56rem]' : 'text-[clamp(9px,2.7vw,0.56rem)]'
          }`}
        >
          {person.roleTitle}
        </p>
        <p
          className={`mt-1.5 font-ge font-semibold leading-snug text-[#e8f5ef] ${
            isPdf ? 'text-[0.46rem]' : 'text-[clamp(8px,2.4vw,0.46rem)]'
          }`}
        >
          {person.premiumDescriptor}
        </p>
        <p
          className={`mt-1 font-ge font-bold uppercase tracking-[0.14em] text-white/75 ${
            isPdf ? 'text-[0.4rem]' : 'text-[clamp(7.5px,2.2vw,0.4rem)]'
          }`}
        >
          {person.corridorLine}
        </p>
      </div>
    </div>
  )
}

function UnifiedBusinessCard({
  mode,
  person,
  orientation
}: {
  readonly mode: BusinessCardRenderMode
  readonly person: BusinessCardPersonBlurb
  readonly orientation: 'portrait' | 'landscape'
}) {
  const reduce = useReducedMotion()
  const isPdf = mode === 'pdf'

  return (
    <PrintCardFigure mode={mode} orientation={orientation}>
      <m.div
        className="absolute inset-0 flex min-h-0 flex-col"
        initial={reduce || isPdf ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
      >
        <HeroBackdrop mode={mode} />
        <IdentityRow mode={mode} person={person} layout={orientation} />
        <ContactDock mode={mode} />
      </m.div>
      <figcaption className="sr-only">
        {orientation} card — {person.name}
      </figcaption>
    </PrintCardFigure>
  )
}

function specsForPerson(
  person: BusinessCardPersonBlurb,
  ids: readonly [string, string, string, string]
): readonly BusinessCardSpec[] {
  const [idPf, idPb, idLf, idLb] = ids
  const short = person.name.split(' ')[0] ?? person.name

  return [
    {
      id: idPf,
      title: `Portrait front — ${short}`,
      subtitle: 'Homepage hero background · crest left · gold rule · Operations Manager.',
      orientation: 'portrait',
      side: 'front',
      imageSrc: CARD_HERO_SRC,
      width: PW,
      height: PH,
      render: (mode = 'preview') => <UnifiedBusinessCard mode={mode} person={person} orientation="portrait" />
    },
    {
      id: idPb,
      title: `Portrait back — ${short}`,
      subtitle: 'Same branded layout — contact dock with social, Irish phone, email, and web.',
      orientation: 'portrait',
      side: 'back',
      imageSrc: CARD_HERO_SRC,
      width: PW,
      height: PH,
      render: (mode = 'preview') => <UnifiedBusinessCard mode={mode} person={person} orientation="portrait" />
    },
    {
      id: idLf,
      title: `Landscape front — ${short}`,
      subtitle: 'Wide press layout with homepage hero plate and legible contact strip.',
      orientation: 'landscape',
      side: 'front',
      imageSrc: CARD_HERO_SRC,
      width: LW,
      height: LH,
      render: (mode = 'preview') => <UnifiedBusinessCard mode={mode} person={person} orientation="landscape" />
    },
    {
      id: idLb,
      title: `Landscape back — ${short}`,
      subtitle: 'Matching landscape back — identical contact system for print consistency.',
      orientation: 'landscape',
      side: 'back',
      imageSrc: CARD_HERO_SRC,
      width: LW,
      height: LH,
      render: (mode = 'preview') => <UnifiedBusinessCard mode={mode} person={person} orientation="landscape" />
    }
  ] as const
}

/** Eight faces — Martin Kelly + Greg McDonald, portrait and landscape. */
export const BUSINESS_CARD_PRESS_SPECS: readonly BusinessCardSpec[] = [
  ...specsForPerson(businessCardPerson, ['portrait-front', 'portrait-back', 'landscape-front', 'landscape-back']),
  ...specsForPerson(businessCardPersonGreg, [
    'greg-portrait-front',
    'greg-portrait-back',
    'greg-landscape-front',
    'greg-landscape-back'
  ])
]
