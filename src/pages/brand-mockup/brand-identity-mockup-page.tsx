import { useEffect } from 'react'
import { m } from 'framer-motion'
import {
  Check,
  Clock,
  Flag,
  Globe,
  Mail,
  MapPin,
  Menu,
  Phone,
  Plane
} from 'lucide-react'
import { BrandLogoPicture } from '../../components/brand-logo-picture'
import { GOLFSOL_BRAND_LOGO_INTRINSIC } from '../../lib/brand-logo-assets'
import { BRAND_FLEET_LINEUP_IMAGE_SRC } from '../../lib/brand-visual-assets'
import { contactInfo } from '../golf-experience/data/copy'
import { cx } from '../../lib/utils'

const SITE = 'https://www.golfsolirl.com'

const FEATURES = [
  'Meet & Greet at Malaga AGP',
  'Golf-Bag Friendly Mercedes V-Class',
  'Irish-Owned Operator Support',
  'Pre-Booked Tee Times & Resort Transfers'
] as const

const goldBar =
  'bg-gradient-to-r from-[#e6cf26] via-[#136047] to-[#d9be7a] shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_12px_40px_rgba(0,0,0,0.18)]'

function FeatureRow({ compact }: { readonly compact?: boolean }) {
  return (
    <ul className={cx('grid gap-2.5', compact ? 'grid-cols-1 text-left' : 'grid-cols-1')}>
      {FEATURES.map((line) => (
        <li key={line} className="flex items-start gap-2.5 text-[0.68rem] font-semibold leading-snug text-forest-950/90">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-950 text-[#d9be7a] shadow-sm">
            <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
          </span>
          <span>{line}</span>
        </li>
      ))}
    </ul>
  )
}

function PhoneHeroMockup() {
  return (
    <div className="mx-auto w-full max-w-[380px]">
      <p className="mb-4 text-center text-[0.65rem] font-bold uppercase tracking-[0.28em] text-white/72">Mobile hero</p>
      <div
        className="relative rounded-[2.85rem] border border-white/10 bg-gradient-to-b from-zinc-800 via-zinc-900 to-black p-[11px] shadow-[0_40px_100px_rgba(0,0,0,0.65)]"
        aria-hidden
      >
        <div className="pointer-events-none absolute inset-x-1/2 top-2 z-20 h-6 w-[34%] -translate-x-1/2 rounded-full bg-black/80" />
        <div className="relative overflow-hidden rounded-[2.35rem] bg-black">
          <div className={cx('relative max-h-[min(78vh,720px)] overflow-y-auto', goldBar)}>
            <header className="flex items-center justify-between gap-2 border-b border-black/10 bg-white px-3 py-2.5">
              <Menu className="h-5 w-5 text-forest-950/70" aria-hidden />
              <BrandLogoPicture
                alt="GolfSol Ireland"
                width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
                height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
                className="h-[52px] w-auto object-contain"
                decoding="async"
              />
              <span className="w-5" aria-hidden />
            </header>

            <div className="flex flex-wrap justify-center gap-2 px-3 pt-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-forest-950 shadow-sm">
                <Plane className="h-3.5 w-3.5 text-gs-green" aria-hidden />
                Malaga arrivals
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-forest-950 shadow-sm">
                <Flag className="h-3.5 w-3.5 text-gs-green" aria-hidden />
                Costa del Sol tee-off
              </span>
            </div>

            <div className="relative mx-3 mt-3 overflow-hidden rounded-2xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
              <img
                src={BRAND_FLEET_LINEUP_IMAGE_SRC}
                alt=""
                className="h-[200px] w-full object-cover object-[center_45%]"
                loading="lazy"
                decoding="async"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute left-2 top-2 rounded-full border-2 border-dashed border-[#d9be7a] bg-white px-2 py-1.5 text-center shadow-lg">
                <Clock className="mx-auto h-3.5 w-3.5 text-forest-950" aria-hidden />
                <p className="text-[0.5rem] font-extrabold uppercase leading-tight text-forest-950">24/7</p>
                <p className="text-[0.45rem] font-bold uppercase text-forest-900/80">Service</p>
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-10 text-left">
                <p className="text-[0.55rem] font-bold uppercase tracking-[0.18em] text-white/90">We meet you at the gate and off to the course.</p>
                <p className="mt-1.5 font-display text-[1.35rem] font-black leading-[0.98] tracking-tight text-white drop-shadow-lg">
                  FROM PLANE
                  <br />
                  TO <span className="text-[#d9be7a]">FAIRWAY.</span>
                </p>
              </div>
            </div>

            <p className="mx-3 mt-3 rounded-xl border border-white/30 bg-cream px-3 py-2.5 text-[0.7rem] leading-relaxed text-forest-950/90 shadow-inner">
              Meet-and-greet at Malaga, golf-bag friendly Mercedes transfers, tee times pre-booked. Your group is taken
              care of from the carousel to the first cut.
            </p>

            <div className="mx-3 my-3 rounded-2xl border border-white/25 bg-offwhite p-3 shadow-inner">
              <FeatureRow compact />
            </div>

            <a
              href={`tel:${contactInfo.phoneTel}`}
              className="mx-3 mb-4 flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-forest-950 px-4 text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-[#d9be7a] shadow-[0_16px_40px_rgba(0,0,0,0.35)] ring-1 ring-white/30 transition hover:bg-forest-900"
            >
              <Phone className="h-4 w-4" aria-hidden />
              Call {contactInfo.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

type CardFace = 'portrait-front' | 'portrait-back' | 'landscape-front' | 'landscape-back'

function BusinessCard({
  name,
  title,
  face,
  className
}: {
  readonly name: string
  readonly title: string
  readonly face: CardFace
  readonly className?: string
}) {
  const contactBlock = (
    <div className="space-y-1.5 text-[0.62rem] leading-relaxed text-forest-950/85">
      <p className="flex items-center gap-2">
        <Phone className="h-3.5 w-3.5 shrink-0 text-[#8a7210]" aria-hidden />
        {contactInfo.phoneDisplay}
      </p>
      <p className="flex items-center gap-2">
        <Globe className="h-3.5 w-3.5 shrink-0 text-[#8a7210]" aria-hidden />
        www.golfsolirl.com
      </p>
      <p className="flex items-center gap-2">
        <Mail className="h-3.5 w-3.5 shrink-0 text-[#8a7210]" aria-hidden />
        {contactInfo.email}
      </p>
      <p className="flex items-start gap-2">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8a7210]" aria-hidden />
        Costa del Sol, Spain
      </p>
    </div>
  )

  if (face === 'portrait-front') {
    return (
      <div
        className={cx(
          'flex flex-col overflow-hidden rounded-[1.35rem] border border-black/10 bg-white shadow-[0_28px_70px_rgba(0,0,0,0.2)] ring-1 ring-white/60',
          'aspect-[55/85] w-[260px] sm:w-[280px]',
          className
        )}
      >
        <div className="flex flex-1 flex-col px-4 pb-3 pt-4">
          <BrandLogoPicture
            alt="GolfSol Ireland"
            width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
            height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
            className="mx-auto h-[72px] w-auto object-contain"
            decoding="async"
          />
          <p className="mt-3 text-center font-display text-lg font-black tracking-tight text-forest-950">{name}</p>
          <p className="mt-0.5 text-center text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#8a7210]">{title}</p>
          <div className="mt-4 border-t border-black/10 pt-3">{contactBlock}</div>
        </div>
        <div className="relative h-[32%] min-h-[88px] shrink-0">
          <img src={BRAND_FLEET_LINEUP_IMAGE_SRC} alt="" className="h-full w-full object-cover object-center" loading="lazy" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        </div>
      </div>
    )
  }

  if (face === 'portrait-back') {
    return (
      <div
        className={cx(
          'flex flex-col justify-between rounded-[1.35rem] border border-black/15 p-4 text-cream shadow-[0_28px_70px_rgba(0,0,0,0.25)] ring-1 ring-white/25',
          'aspect-[55/85] w-[260px] bg-gradient-to-b from-[#d9be7a] via-[#136047] to-[#e6cf26] sm:w-[280px]',
          className
        )}
      >
        <div>
          <BrandLogoPicture
            alt="GolfSol Ireland"
            width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
            height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
            className="mx-auto h-16 w-auto object-contain drop-shadow-md"
            decoding="async"
          />
          <p className="mt-3 text-center font-display text-lg font-black leading-tight tracking-tight">
            FROM PLANE
            <br />
            TO <span className="text-white drop-shadow-sm">FAIRWAY.</span>
          </p>
        </div>
        <div className="rounded-xl border border-black/10 bg-offwhite p-2.5 shadow-inner">
          <FeatureRow compact />
        </div>
        <a
          href={SITE}
          className="block rounded-xl bg-forest-950 py-2.5 text-center text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[#d9be7a] shadow-lg ring-1 ring-white/20"
        >
          www.golfsolirl.com
        </a>
      </div>
    )
  }

  if (face === 'landscape-front') {
    return (
      <div
        className={cx(
          'flex overflow-hidden rounded-[1.2rem] border border-black/10 bg-white shadow-[0_22px_55px_rgba(0,0,0,0.18)] ring-1 ring-white/50',
          'aspect-[85/55] w-[min(100%,420px)]',
          className
        )}
      >
        <div className="flex w-[58%] flex-col justify-between p-3">
          <div>
            <BrandLogoPicture
              alt="GolfSol Ireland"
              width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
              height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
              className="h-14 w-auto object-contain"
              decoding="async"
            />
            <p className="mt-2 font-display text-base font-black leading-tight text-forest-950">{name}</p>
            <p className="mt-0.5 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#8a7210]">{title}</p>
          </div>
          <div className="text-[0.58rem]">{contactBlock}</div>
        </div>
        <div className="relative min-w-0 flex-1">
          <img src={BRAND_FLEET_LINEUP_IMAGE_SRC} alt="" className="h-full w-full object-cover object-[60%_center]" loading="lazy" />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white to-transparent" />
        </div>
      </div>
    )
  }

  /* landscape-back */
  return (
    <div
      className={cx(
        'flex flex-col justify-between rounded-[1.2rem] border border-black/15 p-3 text-cream shadow-[0_22px_55px_rgba(0,0,0,0.2)] ring-1 ring-white/30',
        'aspect-[85/55] w-[min(100%,420px)] bg-gradient-to-br from-[#fdfbde] via-[#136047] to-[#e6cf26]',
        className
      )}
    >
      <div className="text-center">
        <p className="font-display text-sm font-black leading-tight">
          FROM PLANE TO <span className="text-white drop-shadow">FAIRWAY.</span>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[0.52rem] font-semibold leading-tight">
        {FEATURES.map((f) => (
          <div key={f} className="flex items-start gap-1 rounded-lg bg-offwhite px-1.5 py-1">
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-forest-950" aria-hidden />
            <span>{f}</span>
          </div>
        ))}
      </div>
      <a href={SITE} className="block rounded-lg bg-forest-950 py-2 text-center text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-[#d9be7a]">
        www.golfsolirl.com
      </a>
    </div>
  )
}

function PersonDeck({
  personName,
  personTitle
}: {
  readonly personName: string
  readonly personTitle: string
}) {
  const faces: { face: CardFace; label: string }[] = [
    { face: 'portrait-front', label: 'Portrait · front' },
    { face: 'portrait-back', label: 'Portrait · back' },
    { face: 'landscape-front', label: 'Landscape · front' },
    { face: 'landscape-back', label: 'Landscape · back' }
  ]
  return (
    <section className="rounded-3xl border border-white/10 bg-forest-950 p-6 shadow-2xl sm:p-10">
      <h2 className="text-center font-display text-2xl font-bold text-white sm:text-3xl">{personName}</h2>
      <p className="mt-1 text-center text-sm font-semibold uppercase tracking-[0.2em] text-[#d9be7a]/90">{personTitle}</p>
      <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {faces.map(({ face, label }) => (
          <div key={face} className="flex flex-col items-center gap-3">
            <m.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <BusinessCard name={personName} title={personTitle} face={face} />
            </m.div>
            <p className="text-center text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/70">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/**
 * Internal design / stakeholder page — premium GolfSol Ireland + Transfers identity board.
 * Open `/brand-mockup` in the browser; full-page screenshot or print for PDF.
 */
export function BrandIdentityMockupPage() {
  useEffect(() => {
    document.title = 'Brand mockup | GolfSol Ireland'
    return () => {
      document.title = 'Golf Sol Ireland'
    }
  }, [])

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(217,190,122,0.18),transparent_50%),linear-gradient(180deg,#0a0a0b_0%,#121214_40%,#0c0c0d_100%)] px-4 py-12 text-white sm:px-8 sm:py-16">
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-12 text-center">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-[#d9be7a]/80">GolfSol Ireland · GolfSol Transfers</p>
          <h1 className="mt-2 font-display text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
            Premium brand identity
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/65">
            Live mockup for review — mustard gold, white, and forest accents. Uses the official crest and fleet photography.
            For print-ready exports at ultra-high resolution, place screenshots or use your design tool; this page is optimised
            for clarity in the browser.
          </p>
          <a href="/" className="mt-5 inline-block text-sm font-semibold text-[#d9be7a] underline-offset-4 hover:underline">
            ← Live site
          </a>
        </header>

        <section className="mb-20">
          <PhoneHeroMockup />
        </section>

        <div className="space-y-16">
          <PersonDeck personName="Greg McDonald" personTitle="Operations Manager" />
          <PersonDeck personName="Martin Kelly" personTitle="Operations" />
        </div>

        <footer className="mt-16 border-t border-white/10 pt-8 text-center text-xs text-white/72">
          Mockup only — not the production homepage. Assets: crest + {BRAND_FLEET_LINEUP_IMAGE_SRC}
        </footer>
      </div>
    </div>
  )
}
