/**
 * Print-ready business cards — unified “Aurora” family: cotton stock, forest accents,
 * `golfsol.png` photo plate. Crest uses the hosted Golf Sol shield PNG.
 */
import { m, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Globe, Mail, Phone } from 'lucide-react'
import type { BusinessCardRenderMode, BusinessCardSpec } from '../lib/business-cards-catalog-types'
import { GOLFSOL_BRAND_LOGO_HOSTED, GOLFSOL_BRAND_LOGO_INTRINSIC } from '../lib/brand-logo-assets'
import type { BusinessCardPersonBlurb } from '../lib/business-cards-config'
import { businessCardContact, businessCardPerson, businessCardPersonGreg } from '../lib/business-cards-config'

const CARD_PHOTO_SRC = '/images/fpf-cover-ba19c50a-8f84-4a1c-89ce-60aa6278573f.webp'

/** Comfortable inset — keeps type and crest inside trim without clipping the logo */
const INSET_SCREEN = 'clamp(12px,3vmin,22px)'
const INSET_PDF = '14px'
function inset(mode: BusinessCardRenderMode) { return mode === 'pdf' ? INSET_PDF : INSET_SCREEN }

const LW = 850
const LH = Math.round((LW * 55) / 85)
const PW = 550
const PH = Math.round((PW * 85) / 55)

function assetUrl(publicPath: string): string {
  if (/^https?:\/\//i.test(publicPath)) return publicPath
  const path = publicPath.startsWith('/') ? publicPath.slice(1) : publicPath
  const base = import.meta.env.BASE_URL
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${path}`
}

function CardBrandLogo({
  mode,
  placement
}: {
  readonly mode: BusinessCardRenderMode
  readonly placement: 'portraitFront' | 'portraitBack' | 'landscapeFront' | 'landscapeBack'
}) {
  const isPdf = mode === 'pdf'
  const src = assetUrl(GOLFSOL_BRAND_LOGO_HOSTED)
  /**
   * PDF: tight bounds in print pixels (cq units match fixed figure size).
   * Preview: add **min** height/width so logos stay legible on phones when `cqh`/`cqw` are missing
   * or resolve tiny (older WebKit / narrow containers).
   */
  const sizesPdf = {
    portraitFront: 'h-auto max-h-[min(56cqh,11rem)] w-auto max-w-[min(98cqw,17rem)]',
    portraitBack: 'h-auto max-h-[min(52cqh,10.5rem)] w-auto max-w-[min(96cqw,16rem)]',
    landscapeFront: 'h-auto max-h-[min(32cqh,5.5rem)] w-auto max-w-[min(48cqw,12rem)]',
    landscapeBack: 'h-auto max-h-[min(34cqh,6.25rem)] w-auto max-w-[min(48cqw,13rem)]'
  } as const
  const sizesPreview = {
    portraitFront:
      'h-auto w-auto max-h-[46%] min-h-[5.75rem] max-w-[92%] min-w-[9.5rem] sm:max-h-[min(56cqh,11rem)] sm:min-h-0 sm:min-w-0 sm:max-w-[min(98cqw,17rem)]',
    portraitBack:
      'h-auto w-auto max-h-[42%] min-h-[5.25rem] max-w-[90%] min-w-[9rem] sm:max-h-[min(52cqh,10.5rem)] sm:min-h-0 sm:min-w-0 sm:max-w-[min(96cqw,16rem)]',
    landscapeFront:
      'h-auto w-auto max-h-[32%] min-h-[3.5rem] max-w-[80%] min-w-[7.5rem] sm:max-h-[min(32cqh,5.5rem)] sm:min-h-0 sm:min-w-0 sm:max-w-[min(48cqw,12rem)]',
    landscapeBack:
      'h-auto w-auto max-h-[34%] min-h-[3.75rem] max-w-[82%] min-w-[8rem] sm:max-h-[min(34cqh,6.25rem)] sm:min-h-0 sm:min-w-0 sm:max-w-[min(48cqw,13rem)]'
  } as const
  const sizes = isPdf ? sizesPdf : sizesPreview

  const filter =
    placement === 'portraitFront'
      ? 'drop-shadow(0 2px 4px rgba(3,21,15,0.12)) drop-shadow(0 6px 16px rgba(3,21,15,0.28)) drop-shadow(0 14px 36px rgba(6,59,42,0.22))'
      : placement === 'portraitBack'
        ? 'drop-shadow(0 3px 8px rgba(0,0,0,0.55)) drop-shadow(0 8px 22px rgba(0,0,0,0.65)) drop-shadow(0 18px 42px rgba(0,0,0,0.45))'
        : placement === 'landscapeFront'
          ? 'drop-shadow(0 1px 5px rgba(6,59,42,0.14))'
          : 'drop-shadow(0 1px 4px rgba(6,59,42,0.1))'

  return (
    <img
      src={src}
      alt=""
      width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
      height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
      className={`shrink-0 select-none object-contain object-center ${sizes[placement]}`}
      decoding="async"
      draggable={false}
      fetchPriority={isPdf ? 'high' : 'auto'}
      loading={isPdf ? 'eager' : 'lazy'}
      style={{ filter }}
    />
  )
}

function PrintCardFigure({
  mode,
  orientation,
  children,
  outerClass
}: {
  readonly mode: BusinessCardRenderMode
  readonly orientation: 'landscape' | 'portrait'
  readonly children: ReactNode
  readonly outerClass?: string
}) {
  const isPdf = mode === 'pdf'
  const w = orientation === 'landscape' ? LW : PW
  const h = orientation === 'landscape' ? LH : PH

  return (
    <figure
      className={
        isPdf
          ? `relative overflow-hidden [container-type:size] ${outerClass ?? ''}`
          : `relative mx-auto overflow-hidden rounded-sm bg-[#e8e4dc] shadow-[0_40px_100px_rgba(0,0,0,0.35),0_0_0_1px_rgba(0,0,0,0.08)] [container-type:size] ${orientation === 'landscape' ? 'aspect-[85/55] w-full max-w-[720px]' : 'aspect-[55/85] w-full max-w-[420px]'} ${outerClass ?? ''}`
      }
      style={isPdf ? { width: w, height: h } : undefined}
    >
      {children}
    </figure>
  )
}

function PressPortraitFront({
  mode,
  person
}: {
  readonly mode: BusinessCardRenderMode
  readonly person: BusinessCardPersonBlurb
}) {
  const reduce = useReducedMotion()
  const isPdf = mode === 'pdf'
  const img = assetUrl(CARD_PHOTO_SRC)

  return (
    <PrintCardFigure mode={mode} orientation="portrait" outerClass="bg-[#f4f1ea]">
      <m.div
        className="absolute inset-0 flex min-h-0 flex-col bg-[#f4f1ea]"
        initial={reduce || isPdf ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
      >
        <div className="relative h-[42%] min-h-[38%] max-h-[48%] shrink-0 overflow-hidden bg-[#0f1f18]">
          <img
            src={img}
            alt=""
            className="h-full w-full scale-[1.04] object-cover object-[50%_48%]"
            draggable={false}
            decoding="async"
            fetchPriority={isPdf ? 'high' : 'auto'}
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#03150f]/35 via-transparent to-[#f4f1ea]/90" />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[22%] min-h-[3.5rem] bg-[#f4f1ea]"
            style={{ clipPath: 'ellipse(125% 100% at 50% 100%)' }}
          />
        </div>

        <div
          className={`relative flex min-h-0 flex-1 flex-col items-center px-4 pb-3 pt-1 sm:px-6 ${
            isPdf ? 'overflow-hidden' : 'overflow-x-clip overflow-y-visible'
          }`}
          style={{ paddingLeft: inset(mode), paddingRight: inset(mode), paddingBottom: inset(mode) }}
        >
          <div className="flex max-h-[48%] min-h-0 w-full shrink-0 flex-col items-center justify-center py-0">
            <CardBrandLogo mode={mode} placement="portraitFront" />
          </div>
          <div className="mx-auto mb-0.5 h-1 w-14 shrink-0 rounded-full bg-[#08120d]" aria-hidden />
          <h2 className="shrink-0 text-center font-ge text-[clamp(1rem,3.5vw,1.42rem)] font-black uppercase leading-[1.1] tracking-[-0.02em] text-[#03150f]">
            {person.name}
          </h2>
          <p
            className={`mt-1 shrink-0 text-center font-ge font-bold uppercase leading-relaxed tracking-[0.14em] text-[#0a4d34] ${
              isPdf ? 'text-[0.5rem]' : 'text-[clamp(9px,2.7vw,0.5rem)] sm:text-[0.5rem]'
            }`}
          >
            {person.roleTitle}
          </p>
          <p
            className={`mt-0.5 shrink-0 text-center font-ge font-semibold leading-snug text-[#1a2a24] ${
              isPdf ? 'text-[0.44rem]' : 'text-[clamp(8.5px,2.5vw,0.44rem)] sm:text-[0.44rem]'
            }`}
          >
            {person.premiumDescriptor}
          </p>
          <div className="mt-auto flex shrink-0 items-center justify-center gap-2 pt-2">
            <span className="h-px w-7 bg-[#b8941f]" aria-hidden />
            <p
              className={`font-ge font-black uppercase tracking-[0.24em] text-[#0a3024] ${
                isPdf ? 'text-[0.54rem]' : 'text-[clamp(9.5px,2.8vw,0.54rem)] sm:text-[0.54rem]'
              }`}
            >
              {person.corridorLine}
            </p>
            <span className="h-px w-7 bg-[#b8941f]" aria-hidden />
          </div>
        </div>
      </m.div>
      <figcaption className="sr-only">Portrait front — {person.name}</figcaption>
    </PrintCardFigure>
  )
}

function PressPortraitBack({
  mode,
  person
}: {
  readonly mode: BusinessCardRenderMode
  readonly person: BusinessCardPersonBlurb
}) {
  const reduce = useReducedMotion()
  const isPdf = mode === 'pdf'
  const wash = assetUrl(CARD_PHOTO_SRC)

  return (
    <PrintCardFigure mode={mode} orientation="portrait" outerClass="bg-[#042818]">
      <m.div
        className="absolute inset-0 flex flex-col bg-[#042818]"
        initial={reduce || isPdf ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.04 }}
        style={{ padding: inset(mode) }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: `url(${wash})`, backgroundSize: 'cover', backgroundPosition: 'center 40%' }}
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#08120d] via-[#052a1c] to-[#010c08]" />

        <div className="relative z-[1] flex flex-col items-center text-center">
          <CardBrandLogo mode={mode} placement="portraitBack" />
          <h2 className="mt-3 font-ge text-[1.55rem] font-black uppercase tracking-[0.04em] sm:text-[1.48rem]" style={{ color: '#ffffff' }}>{person.name}</h2>
          <p className="mt-2 max-w-[15rem] font-ge text-[0.6rem] font-bold uppercase leading-relaxed tracking-[0.14em]" style={{ color: '#dff7ea' }}>
            {person.roleTitle}
          </p>
        </div>

        <div className="relative z-[1] mt-2 min-h-0 flex-1 space-y-1 border-t border-[#136047]/35 pt-2">
          <a
            href={`tel:${businessCardContact.phoneIe.replace(/\s/g, '')}`}
            className="block rounded-md bg-[#136047] px-2 py-1.5 text-center font-ge text-[0.58rem] font-black shadow-[0_4px_0_rgba(0,0,0,0.25)]"
            style={{ color: '#ffffff' }}
          >
            {businessCardContact.phoneIe}
          </a>
          <a
            href={`tel:${businessCardContact.phoneEs.replace(/\s/g, '')}`}
            className="block rounded-md border-2 border-white/35 bg-[#0a3024]/80 px-2 py-1.5 text-center font-ge text-[0.54rem] font-bold"
            style={{ color: '#ffffff' }}
          >
            {businessCardContact.phoneEs}
          </a>
          <a
            href={`mailto:${businessCardContact.email}`}
            className="block text-center font-ge text-[0.5rem] font-bold underline decoration-[#fbe8b5]/70 underline-offset-[3px]"
            style={{ color: '#fbe8b5' }}
          >
            {businessCardContact.email}
          </a>
          <a
            href={businessCardContact.websiteUrl}
            className="block text-center font-ge text-[0.46rem] font-black uppercase tracking-[0.14em]"
            style={{ color: '#ffffff' }}
          >
            {businessCardContact.websiteDisplay}
          </a>
        </div>
      </m.div>
      <figcaption className="sr-only">Portrait back — {person.name}</figcaption>
    </PrintCardFigure>
  )
}

function PressLandscapeFront({
  mode,
  person
}: {
  readonly mode: BusinessCardRenderMode
  readonly person: BusinessCardPersonBlurb
}) {
  const reduce = useReducedMotion()
  const isPdf = mode === 'pdf'
  const img = assetUrl(CARD_PHOTO_SRC)

  return (
    <PrintCardFigure mode={mode} orientation="landscape" outerClass="bg-[#f4f1ea]">
      <m.div
        className="absolute inset-0 flex min-h-0 bg-[#f4f1ea]"
        initial={reduce || isPdf ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
      >
        <div className="relative h-full w-[min(50%,420px)] shrink-0 overflow-hidden bg-[#0f1f18]">
          <img
            src={img}
            alt=""
            className="h-full w-full scale-[1.06] object-cover object-[48%_45%]"
            draggable={false}
            decoding="async"
            fetchPriority={isPdf ? 'high' : 'auto'}
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#03150f]/25 via-transparent to-[#f4f1ea]/98" />
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 w-[20%] min-w-[2.75rem] bg-[#f4f1ea]"
            style={{ clipPath: 'ellipse(95% 72% at 100% 50%)' }}
          />
        </div>

        <div
          className={`relative flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center ${
            isPdf ? 'overflow-hidden' : 'overflow-x-clip overflow-y-visible'
          }`}
          style={{ padding: inset(mode) }}
        >
          <div className="flex min-h-0 w-full shrink items-center justify-center">
            <CardBrandLogo mode={mode} placement="landscapeFront" />
          </div>
          <p
            className={`mt-0.5 shrink-0 text-center font-ge font-black uppercase tracking-[0.24em] text-[#0a4d34] ${
              isPdf ? 'text-[0.38rem]' : 'text-[clamp(9px,2.8vw,0.42rem)] sm:text-[0.38rem]'
            }`}
          >
            Golf Sol Ireland
          </p>
          <div className="mx-auto mt-1 h-[2px] w-8 shrink-0 rounded-full bg-[#b8941f]" aria-hidden />
          <h2 className="mt-1 shrink-0 text-center font-ge text-[clamp(0.78rem,2vw,1.1rem)] font-black uppercase leading-[1.05] tracking-[-0.01em] text-[#03150f]">
            {person.name}
          </h2>
          <p
            className={`mt-0.5 shrink-0 text-center font-ge font-bold uppercase leading-normal tracking-[0.1em] text-[#0f241c] ${
              isPdf ? 'text-[0.38rem]' : 'text-[clamp(8.5px,2.6vw,0.4rem)] sm:text-[0.38rem]'
            }`}
          >
            {person.roleTitle}
          </p>
          <p
            className={`shrink-0 text-center font-ge font-semibold leading-snug text-[#1e3229] ${
              isPdf ? 'text-[0.32rem]' : 'text-[clamp(8px,2.4vw,0.36rem)] sm:text-[0.32rem]'
            }`}
          >
            {person.premiumDescriptor}
          </p>
          <p
            className={`mt-0.5 shrink-0 text-center font-ge font-black uppercase tracking-[0.16em] text-[#0a3024] ${
              isPdf ? 'text-[0.3rem]' : 'text-[clamp(7.5px,2.2vw,0.34rem)] sm:text-[0.3rem]'
            }`}
          >
            {person.corridorLine}
          </p>
        </div>
      </m.div>
      <figcaption className="sr-only">Landscape front — {person.name}</figcaption>
    </PrintCardFigure>
  )
}

function PressLandscapeBack({
  mode,
  person
}: {
  readonly mode: BusinessCardRenderMode
  readonly person: BusinessCardPersonBlurb
}) {
  const reduce = useReducedMotion()
  const isPdf = mode === 'pdf'

  const rows = [
    { Icon: Phone, label: 'Ireland', value: businessCardContact.phoneIe, href: `tel:${businessCardContact.phoneIe.replace(/\s/g, '')}` },
    { Icon: Phone, label: 'Spain', value: businessCardContact.phoneEs, href: `tel:${businessCardContact.phoneEs.replace(/\s/g, '')}` },
    { Icon: Mail, label: 'Email', value: businessCardContact.email, href: `mailto:${businessCardContact.email}` },
    { Icon: Globe, label: 'Web', value: businessCardContact.websiteDisplay, href: businessCardContact.websiteUrl }
  ] as const

  return (
    <PrintCardFigure mode={mode} orientation="landscape" outerClass="bg-[#f4f1ea]">
      <m.div
        className={`absolute inset-0 flex min-h-0 flex-col bg-[#f4f1ea] ${
          isPdf ? 'overflow-hidden' : 'overflow-x-clip overflow-y-visible'
        }`}
        initial={reduce || isPdf ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.04 }}
        style={{ padding: inset(mode) }}
      >
        <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#08120d] via-[#136047] to-[#08120d]" />

        <div className="relative z-[1] flex shrink-0 flex-col items-center border-b border-[#08120d]/18 pb-1 pt-0.5">
          <CardBrandLogo mode={mode} placement="landscapeBack" />
          <p
            className={`mt-0.5 font-ge font-black uppercase tracking-[0.2em] text-[#03150f] ${
              isPdf ? 'text-[0.42rem]' : 'text-[clamp(9.5px,2.9vw,0.46rem)] sm:text-[0.42rem]'
            }`}
          >
            {person.name}
          </p>
        </div>

        <div className="relative z-[1] mt-1 grid min-h-0 flex-1 grid-cols-2 gap-x-2 gap-y-0.5">
          {rows.map((row, i) => (
            <m.a
              key={`${person.name}-${row.label}`}
              href={row.href}
              className="group flex min-h-0 min-w-0 gap-1 rounded-md border border-[#08120d]/14 bg-white/90 px-1.5 py-1 transition-colors hover:border-[#c9a227]/55 hover:bg-white"
              initial={reduce || isPdf ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 + i * 0.03, duration: 0.3 }}
            >
              <row.Icon className="mt-0.5 size-2.5 shrink-0 text-[#0b4d3b]" strokeWidth={2.25} aria-hidden />
              <span className="min-w-0">
                <span
                  className={`block font-ge font-black uppercase tracking-[0.12em] text-[#3d5249] ${
                    isPdf ? 'text-[0.28rem]' : 'text-[clamp(7.5px,2.2vw,0.31rem)] sm:text-[0.28rem]'
                  }`}
                >
                  {row.label}
                </span>
                <span
                  className={`block break-all font-ge font-bold leading-snug text-[#021208] underline-offset-2 group-hover:underline ${
                    isPdf ? 'text-[0.38rem]' : 'text-[clamp(8.5px,2.5vw,0.42rem)] sm:text-[0.38rem]'
                  }`}
                >
                  {row.value}
                </span>
              </span>
            </m.a>
          ))}
        </div>

        <p
          className={`relative z-[1] shrink-0 pt-1 text-center font-ge font-black uppercase tracking-[0.18em] text-[#2d453c] ${
            isPdf ? 'text-[0.34rem]' : 'text-[clamp(8px,2.3vw,0.36rem)] sm:text-[0.34rem]'
          }`}
        >
          Private fleet · Málaga AGP · Golf bags welcome
        </p>
      </m.div>
      <figcaption className="sr-only">Landscape back — {person.name}</figcaption>
    </PrintCardFigure>
  )
}

function specsForPerson(person: BusinessCardPersonBlurb, ids: readonly [string, string, string, string]): readonly BusinessCardSpec[] {
  const [idPf, idPb, idLf, idLb] = ids
  const short = person.name.split(' ')[0] ?? person.name

  return [
    {
      id: idPf,
      title: `Portrait front — ${short}`,
      subtitle: `Cotton stock, golfsol.png plate with soft forest-to-cream gradient, large WebP crest — ${person.roleTitle}.`,
      orientation: 'portrait',
      side: 'front',
      imageSrc: CARD_PHOTO_SRC,
      width: PW,
      height: PH,
      render: (mode = 'preview') => <PressPortraitFront mode={mode} person={person} />
    },
    {
      id: idPb,
      title: `Portrait back — ${short}`,
      subtitle: 'Forest panel, gold Ireland CTA, high-contrast contacts — ghosted golfsol.png wash. Same numbers and web as all staff cards.',
      orientation: 'portrait',
      side: 'back',
      imageSrc: CARD_PHOTO_SRC,
      width: PW,
      height: PH,
      render: (mode = 'preview') => <PressPortraitBack mode={mode} person={person} />
    },
    {
      id: idLf,
      title: `Landscape front — ${short}`,
      subtitle: 'Wide layout: golfsol.png column + cream slab, large hosted crest bounded to the short edge.',
      orientation: 'landscape',
      side: 'front',
      imageSrc: CARD_PHOTO_SRC,
      width: LW,
      height: LH,
      render: (mode = 'preview') => <PressLandscapeFront mode={mode} person={person} />
    },
    {
      id: idLb,
      title: `Landscape back — ${short}`,
      subtitle: 'Warm stock, 2×2 contacts, legible ink — matches portrait back details.',
      orientation: 'landscape',
      side: 'back',
      imageSrc: CARD_PHOTO_SRC,
      width: LW,
      height: LH,
      render: (mode = 'preview') => <PressLandscapeBack mode={mode} person={person} />
    }
  ] as const
}

/* ─── Dark Edition variants ─── */

function DarkPortraitFront({
  mode,
  person
}: {
  readonly mode: BusinessCardRenderMode
  readonly person: BusinessCardPersonBlurb
}) {
  const reduce = useReducedMotion()
  const isPdf = mode === 'pdf'
  const img = assetUrl(CARD_PHOTO_SRC)

  return (
    <PrintCardFigure mode={mode} orientation="portrait" outerClass="bg-[#08120d]">
      <m.div
        className="absolute inset-0 flex min-h-0 flex-col bg-[#08120d]"
        initial={reduce || isPdf ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
      >
        <div className="relative h-[36%] min-h-[32%] max-h-[42%] shrink-0 overflow-hidden">
          <img src={img} alt="" className="h-full w-full scale-[1.06] object-cover object-[50%_48%]" draggable={false} decoding="async" fetchPriority={isPdf ? 'high' : 'auto'} />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#08120d]/40 via-transparent to-[#08120d]" />
        </div>

        <div
          className={`relative flex min-h-0 flex-1 flex-col items-center ${
            isPdf ? 'overflow-hidden' : 'overflow-x-clip overflow-y-visible'
          }`}
          style={{ paddingLeft: inset(mode), paddingRight: inset(mode), paddingBottom: inset(mode) }}
        >
          <div className="flex min-h-0 w-full shrink items-center justify-center py-0.5">
            <CardBrandLogo mode={mode} placement="portraitFront" />
          </div>
          <div className="mx-auto mb-1 h-[2px] w-10 shrink-0 rounded-full bg-gradient-to-r from-transparent via-[#d9be7a] to-transparent" aria-hidden />
          <h2 className="shrink-0 text-center font-ge text-[clamp(0.92rem,3.2vw,1.28rem)] font-black uppercase leading-[1.1] tracking-[0.04em]" style={{ color: '#ffffff' }}>
            {person.name}
          </h2>
          <p className="mt-0.5 shrink-0 text-center font-ge text-[0.44rem] font-bold uppercase leading-relaxed tracking-[0.14em]" style={{ color: '#d9be7a' }}>
            {person.roleTitle}
          </p>
          <p className="mt-0.5 shrink-0 text-center font-ge text-[0.38rem] font-semibold leading-snug" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {person.premiumDescriptor}
          </p>
          <div className="mt-auto flex shrink-0 items-center justify-center gap-2 pt-1">
            <span className="h-px w-6 bg-[#d9be7a]/50" aria-hidden />
            <p className="font-ge text-[0.36rem] font-black uppercase tracking-[0.18em]" style={{ color: 'rgba(217,190,122,0.85)' }}>{person.corridorLine}</p>
            <span className="h-px w-6 bg-[#d9be7a]/50" aria-hidden />
          </div>
        </div>
      </m.div>
      <figcaption className="sr-only">Dark portrait front — {person.name}</figcaption>
    </PrintCardFigure>
  )
}

function DarkPortraitBack({
  mode,
  person
}: {
  readonly mode: BusinessCardRenderMode
  readonly person: BusinessCardPersonBlurb
}) {
  const reduce = useReducedMotion()
  const isPdf = mode === 'pdf'

  return (
    <PrintCardFigure mode={mode} orientation="portrait" outerClass="bg-[#08120d]">
      <m.div
        className="absolute inset-0 flex flex-col bg-[#08120d]"
        initial={reduce || isPdf ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.04 }}
        style={{ padding: inset(mode) }}
      >
        <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#d9be7a] to-transparent" />

        <div className="relative z-[1] flex flex-col items-center text-center">
          <CardBrandLogo mode={mode} placement="portraitBack" />
          <h2 className="mt-2 font-ge text-[1.34rem] font-black uppercase tracking-[0.06em] sm:text-[1.3rem]" style={{ color: '#ffffff' }}>{person.name}</h2>
          <p className="mt-1 max-w-[15rem] font-ge text-[0.52rem] font-bold uppercase leading-relaxed tracking-[0.14em]" style={{ color: '#d9be7a' }}>
            {person.roleTitle}
          </p>
        </div>

        <div className="relative z-[1] mt-2 min-h-0 flex-1 space-y-1 border-t border-[#d9be7a]/25 pt-2">
          <a href={`tel:${businessCardContact.phoneIe.replace(/\s/g, '')}`} className="block rounded-md border border-[#d9be7a]/40 bg-[#d9be7a]/10 px-2 py-1.5 text-center font-ge text-[0.52rem] font-black" style={{ color: '#fbe8b5' }}>
            {businessCardContact.phoneIe}
          </a>
          <a href={`tel:${businessCardContact.phoneEs.replace(/\s/g, '')}`} className="block rounded-md border border-white/20 bg-white/5 px-2 py-1.5 text-center font-ge text-[0.48rem] font-bold" style={{ color: 'rgba(255,255,255,0.92)' }}>
            {businessCardContact.phoneEs}
          </a>
          <a href={`mailto:${businessCardContact.email}`} className="block text-center font-ge text-[0.46rem] font-bold underline decoration-[#d9be7a]/50 underline-offset-[3px]" style={{ color: '#d9be7a' }}>
            {businessCardContact.email}
          </a>
          <a href={businessCardContact.websiteUrl} className="block text-center font-ge text-[0.42rem] font-black uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {businessCardContact.websiteDisplay}
          </a>
        </div>

        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-transparent via-[#d9be7a]/50 to-transparent" />
      </m.div>
      <figcaption className="sr-only">Dark portrait back — {person.name}</figcaption>
    </PrintCardFigure>
  )
}

function DarkLandscapeFront({
  mode,
  person
}: {
  readonly mode: BusinessCardRenderMode
  readonly person: BusinessCardPersonBlurb
}) {
  const reduce = useReducedMotion()
  const isPdf = mode === 'pdf'
  const img = assetUrl(CARD_PHOTO_SRC)

  return (
    <PrintCardFigure mode={mode} orientation="landscape" outerClass="bg-[#08120d]">
      <m.div
        className="absolute inset-0 flex min-h-0 bg-[#08120d]"
        initial={reduce || isPdf ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
      >
        <div className="relative h-full w-[min(48%,400px)] shrink-0 overflow-hidden">
          <img src={img} alt="" className="h-full w-full scale-[1.04] object-cover object-[50%_48%]" draggable={false} decoding="async" fetchPriority={isPdf ? 'high' : 'auto'} />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#08120d]/20 via-transparent to-[#08120d]" />
        </div>

        <div
          className={`relative flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center ${
            isPdf ? 'overflow-hidden' : 'overflow-x-clip overflow-y-visible'
          }`}
          style={{ padding: inset(mode) }}
        >
          <div className="flex min-h-0 w-full shrink items-center justify-center">
            <CardBrandLogo mode={mode} placement="landscapeFront" />
          </div>
          <div className="mx-auto mt-1 h-[2px] w-8 shrink-0 rounded-full bg-gradient-to-r from-transparent via-[#d9be7a] to-transparent" aria-hidden />
          <h2 className="mt-1 shrink-0 text-center font-ge text-[clamp(0.82rem,2vw,1.1rem)] font-black uppercase leading-[1.05] tracking-[0.02em]" style={{ color: '#ffffff' }}>
            {person.name}
          </h2>
          <p
            className={`mt-0.5 shrink-0 text-center font-ge font-bold uppercase leading-normal tracking-[0.1em] ${
              isPdf ? 'text-[0.38rem]' : 'text-[clamp(8.5px,2.6vw,0.4rem)] sm:text-[0.38rem]'
            }`}
            style={{ color: '#d9be7a' }}
          >
            {person.roleTitle}
          </p>
          <p
            className={`shrink-0 text-center font-ge font-semibold leading-snug ${
              isPdf ? 'text-[0.32rem]' : 'text-[clamp(8px,2.4vw,0.36rem)] sm:text-[0.32rem]'
            }`}
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            {person.premiumDescriptor}
          </p>
          <p
            className={`mt-0.5 shrink-0 text-center font-ge font-black uppercase tracking-[0.16em] ${
              isPdf ? 'text-[0.3rem]' : 'text-[clamp(7.5px,2.2vw,0.34rem)] sm:text-[0.3rem]'
            }`}
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            {person.corridorLine}
          </p>
        </div>
      </m.div>
      <figcaption className="sr-only">Dark landscape front — {person.name}</figcaption>
    </PrintCardFigure>
  )
}

function DarkLandscapeBack({
  mode,
  person
}: {
  readonly mode: BusinessCardRenderMode
  readonly person: BusinessCardPersonBlurb
}) {
  const reduce = useReducedMotion()
  const isPdf = mode === 'pdf'

  const rows = [
    { Icon: Phone, label: 'Ireland', value: businessCardContact.phoneIe, href: `tel:${businessCardContact.phoneIe.replace(/\s/g, '')}` },
    { Icon: Phone, label: 'Spain', value: businessCardContact.phoneEs, href: `tel:${businessCardContact.phoneEs.replace(/\s/g, '')}` },
    { Icon: Mail, label: 'Email', value: businessCardContact.email, href: `mailto:${businessCardContact.email}` },
    { Icon: Globe, label: 'Web', value: businessCardContact.websiteDisplay, href: businessCardContact.websiteUrl }
  ] as const

  return (
    <PrintCardFigure mode={mode} orientation="landscape" outerClass="bg-[#08120d]">
      <m.div
        className={`absolute inset-0 flex min-h-0 flex-col bg-[#08120d] ${
          isPdf ? 'overflow-hidden' : 'overflow-x-clip overflow-y-visible'
        }`}
        initial={reduce || isPdf ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.04 }}
        style={{ padding: inset(mode) }}
      >
        <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#d9be7a] to-transparent" />

        <div className="relative z-[1] flex shrink-0 flex-col items-center border-b border-[#d9be7a]/25 pb-1 pt-0.5">
          <CardBrandLogo mode={mode} placement="landscapeBack" />
          <p
            className={`mt-0.5 font-ge font-black uppercase tracking-[0.2em] ${
              isPdf ? 'text-[0.42rem]' : 'text-[clamp(9.5px,2.9vw,0.46rem)] sm:text-[0.42rem]'
            }`}
            style={{ color: '#ffffff' }}
          >
            {person.name}
          </p>
        </div>

        <div className="relative z-[1] mt-1 grid min-h-0 flex-1 grid-cols-2 gap-x-2 gap-y-0.5">
          {rows.map((row, i) => (
            <m.a
              key={`dark-${person.name}-${row.label}`}
              href={row.href}
              className="group flex min-h-0 min-w-0 gap-1 rounded-md border border-[#d9be7a]/20 bg-white/[0.04] px-1.5 py-1 transition-colors hover:border-[#d9be7a]/45 hover:bg-white/[0.08]"
              initial={reduce || isPdf ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 + i * 0.03, duration: 0.3 }}
            >
              <row.Icon className="mt-0.5 size-2.5 shrink-0" style={{ color: '#d9be7a' }} strokeWidth={2.25} aria-hidden />
              <span className="min-w-0">
                <span
                  className={`block font-ge font-black uppercase tracking-[0.12em] ${
                    isPdf ? 'text-[0.28rem]' : 'text-[clamp(7.5px,2.2vw,0.31rem)] sm:text-[0.28rem]'
                  }`}
                  style={{ color: 'rgba(217,190,122,0.75)' }}
                >
                  {row.label}
                </span>
                <span
                  className={`block break-all font-ge font-bold leading-snug underline-offset-2 group-hover:underline ${
                    isPdf ? 'text-[0.38rem]' : 'text-[clamp(8.5px,2.5vw,0.42rem)] sm:text-[0.38rem]'
                  }`}
                  style={{ color: 'rgba(255,255,255,0.92)' }}
                >
                  {row.value}
                </span>
              </span>
            </m.a>
          ))}
        </div>

        <p
          className={`relative z-[1] shrink-0 pt-0.5 text-center font-ge font-black uppercase tracking-[0.18em] ${
            isPdf ? 'text-[0.32rem]' : 'text-[clamp(8px,2.3vw,0.36rem)] sm:text-[0.32rem]'
          }`}
          style={{ color: 'rgba(217,190,122,0.6)' }}
        >
          Private fleet · Málaga AGP · Golf bags welcome
        </p>

        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-transparent via-[#d9be7a]/50 to-transparent" />
      </m.div>
      <figcaption className="sr-only">Dark landscape back — {person.name}</figcaption>
    </PrintCardFigure>
  )
}

function darkSpecsForPerson(person: BusinessCardPersonBlurb, ids: readonly [string, string, string, string]): readonly BusinessCardSpec[] {
  const [idPf, idPb, idLf, idLb] = ids
  const short = person.name.split(' ')[0] ?? person.name

  return [
    {
      id: idPf,
      title: `Dark portrait front — ${short}`,
      subtitle: 'Charcoal stock, fleet photo plate with gold accent bar and white type — premium dark edition.',
      orientation: 'portrait',
      side: 'front',
      imageSrc: CARD_PHOTO_SRC,
      width: PW,
      height: PH,
      render: (mode = 'preview') => <DarkPortraitFront mode={mode} person={person} />
    },
    {
      id: idPb,
      title: `Dark portrait back — ${short}`,
      subtitle: 'Charcoal panel, gold accent dividers, high-contrast contact stack — matches dark front.',
      orientation: 'portrait',
      side: 'back',
      imageSrc: CARD_PHOTO_SRC,
      width: PW,
      height: PH,
      render: (mode = 'preview') => <DarkPortraitBack mode={mode} person={person} />
    },
    {
      id: idLf,
      title: `Dark landscape front — ${short}`,
      subtitle: 'Wide dark layout: fleet photo column + charcoal slab with gold-accent type.',
      orientation: 'landscape',
      side: 'front',
      imageSrc: CARD_PHOTO_SRC,
      width: LW,
      height: LH,
      render: (mode = 'preview') => <DarkLandscapeFront mode={mode} person={person} />
    },
    {
      id: idLb,
      title: `Dark landscape back — ${short}`,
      subtitle: 'Charcoal stock, 2×2 gold-accent contacts, legible white type — matches dark front.',
      orientation: 'landscape',
      side: 'back',
      imageSrc: CARD_PHOTO_SRC,
      width: LW,
      height: LH,
      render: (mode = 'preview') => <DarkLandscapeBack mode={mode} person={person} />
    }
  ] as const
}

export const BUSINESS_CARD_PRESS_SPECS: readonly BusinessCardSpec[] = [
  ...specsForPerson(businessCardPerson, ['portrait-front', 'portrait-back', 'landscape-front', 'landscape-back']),
  ...specsForPerson(businessCardPersonGreg, ['greg-portrait-front', 'greg-portrait-back', 'greg-landscape-front', 'greg-landscape-back']),
  ...darkSpecsForPerson(businessCardPerson, ['dark-portrait-front', 'dark-portrait-back', 'dark-landscape-front', 'dark-landscape-back']),
  ...darkSpecsForPerson(businessCardPersonGreg, ['dark-greg-portrait-front', 'dark-greg-portrait-back', 'dark-greg-landscape-front', 'dark-greg-landscape-back'])
]
