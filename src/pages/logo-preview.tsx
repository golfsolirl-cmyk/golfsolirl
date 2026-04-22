import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles } from 'lucide-react'
import logoIcon from '../golf-sol-ireland-logo.svg'
import { PageIdentityBar } from '../components/page-identity-bar'
import { cx } from '../lib/utils'

const wordmarkToneMap = {
  forest: {
    golfSol: 'text-neutral-950',
    ireland: 'text-[#dc5801]',
    tagline: 'text-neutral-700',
    shamrockDark: false
  },
  light: {
    golfSol: 'text-white',
    ireland: 'text-gold-300',
    tagline: 'text-white/70',
    shamrockDark: true
  },
  mist: {
    golfSol: 'text-slate-800',
    ireland: 'text-cyan-700',
    tagline: 'text-slate-500',
    shamrockDark: false
  },
  sunset: {
    golfSol: 'text-[#fff2dd]',
    ireland: 'text-[#ff9c54]',
    tagline: 'text-[#fff2dd]/72',
    shamrockDark: true
  },
  neon: {
    golfSol: 'text-white',
    ireland: 'text-white',
    tagline: 'text-white/90',
    shamrockDark: true
  },
  ink: {
    golfSol: 'text-slate-950',
    ireland: 'text-amber-600',
    tagline: 'text-slate-500',
    shamrockDark: false
  },
  rose: {
    golfSol: 'text-rose-50',
    ireland: 'text-orange-300',
    tagline: 'text-rose-100/70',
    shamrockDark: true
  },
  gold: {
    golfSol: 'text-[#f9e6b3]',
    ireland: 'text-[#f2a65a]',
    tagline: 'text-[#f9e6b3]/68',
    shamrockDark: true
  }
} as const

export function LogoPreviewPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#051006] text-white">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(80,163,45,0.2),_transparent_30%),radial-gradient(circle_at_85%_18%,_rgba(220,88,1,0.18),_transparent_24%),linear-gradient(180deg,_#09200b_0%,_#051006_52%,_#030803_100%)]" />
      <div aria-hidden="true" className="absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-fairway-500/15 blur-3xl" />
      <div aria-hidden="true" className="absolute bottom-[-6rem] right-[-4rem] h-80 w-80 rounded-full bg-gold-400/10 blur-3xl" />
      <AnimatedBlobGolfBall />
      <div className="relative z-20">
        <PageIdentityBar
          compact
          description="Logo concept studies and creative directions."
          eyebrow="Design lab"
          label="Logo Preview"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-8 md:px-8 md:pb-24">
        <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <a
            aria-label="Return to the main GolfSol Ireland landing page"
            className="inline-flex items-center gap-3 self-start rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-300/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#051006]"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to landing page
          </a>

          <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-white">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {logoStudies.length} artistic directions
          </div>
        </header>

        <main className="pt-10 md:pt-14">
          <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.34em] text-gold-300/85">Logo Preview Lab</p>
              <h1 className="mt-4 max-w-4xl font-display text-5xl font-black leading-none text-white md:text-7xl">
                {logoStudies.length} fresh logo samples built from your current GolfSol Ireland identity
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/68 md:text-lg">
                Every study now uses the same elongated ellipse shamrock family, so the exploration stays focused on lockup, atmosphere, and art direction
                instead of switching between different clover geometries.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Creative brief baked in</p>
              <div className="mt-4 grid gap-3 text-sm text-white/72">
                <p>Based on the current script-led identity, not a brand reset.</p>
                <p>Mix of luxury, editorial, resort, badge, and premium travel aesthetics.</p>
                <p>Built as a proper page so you can compare directions side by side at a glance.</p>
              </div>
            </div>
          </section>

          <section className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {logoStudies.map((study, index) => (
              <LogoStudyCard key={study.title} index={index} study={study} />
            ))}
          </section>
        </main>
      </div>
    </div>
  )
}

function AnimatedBlobGolfBall() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 flex justify-end overflow-hidden"
    >
      <div className="relative h-[28rem] w-full max-w-[42rem] md:h-[34rem] md:max-w-[48rem]">
        <motion.div
          animate={{
            scale: [1, 1.08, 0.96, 1],
            rotate: [0, 12, -10, 0],
            x: [0, 18, -12, 0],
            y: [0, -14, 10, 0]
          }}
          className="absolute right-[-5rem] top-[-2rem] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.28),rgba(255,255,255,0.06)_34%,rgba(80,163,45,0.34)_58%,rgba(220,88,1,0.28)_82%,transparent)] blur-3xl md:h-96 md:w-96"
          transition={{ duration: 14, ease: 'easeInOut', repeat: Infinity }}
        />
        <motion.div
          animate={{
            scale: [0.94, 1.06, 1],
            rotate: [0, -16, 10, 0],
            x: [0, -20, 10, 0],
            y: [0, 18, -10, 0]
          }}
          className="absolute right-12 top-12 h-56 w-56 rounded-[42%_58%_60%_40%/40%_44%_56%_60%] bg-[linear-gradient(140deg,rgba(255,255,255,0.12),rgba(110,191,71,0.28),rgba(220,88,1,0.2))] blur-[70px] md:h-72 md:w-72"
          transition={{ duration: 12, ease: 'easeInOut', repeat: Infinity }}
        />
        <motion.div
          animate={{
            y: [0, -10, 0, 12, 0],
            x: [0, -8, 10, -6, 0]
          }}
          className="absolute right-20 top-16 flex h-40 w-40 items-center justify-center md:right-24 md:top-20 md:h-56 md:w-56"
          transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
        >
          <div className="absolute inset-[-16%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.28),rgba(255,255,255,0.02)_58%,transparent)] blur-2xl" />
          <div className="absolute bottom-[-9%] left-1/2 h-[18%] w-[72%] -translate-x-1/2 rounded-full bg-black/30 blur-[18px] md:blur-[22px]" />
          <motion.div
            animate={{ rotate: [0, -5, 4, 0] }}
            className="relative h-full w-full drop-shadow-[0_34px_80px_rgba(0,0,0,0.3)]"
            transition={{ duration: 12, ease: 'easeInOut', repeat: Infinity }}
          >
            <svg className="h-full w-full" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="golf-ball-fill" cx="32%" cy="24%" r="72%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="26%" stopColor="#fbfbfa" />
                  <stop offset="58%" stopColor="#e6ebef" />
                  <stop offset="82%" stopColor="#cfd6df" />
                  <stop offset="100%" stopColor="#aeb8c5" />
                </radialGradient>
                <radialGradient id="golf-ball-highlight" cx="28%" cy="22%" r="42%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.98)" />
                  <stop offset="38%" stopColor="rgba(255,255,255,0.52)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
                <radialGradient id="golf-ball-shadow" cx="70%" cy="76%" r="44%">
                  <stop offset="0%" stopColor="rgba(98,110,128,0.26)" />
                  <stop offset="100%" stopColor="rgba(98,110,128,0)" />
                </radialGradient>
                <clipPath id="golf-ball-clip">
                  <circle cx="120" cy="120" r="108" />
                </clipPath>
              </defs>

              <circle cx="120" cy="120" fill="url(#golf-ball-fill)" r="108" stroke="rgba(255,255,255,0.72)" strokeWidth="2.5" />
              <circle cx="120" cy="120" fill="url(#golf-ball-highlight)" r="108" />
              <circle cx="120" cy="120" fill="url(#golf-ball-shadow)" r="108" />
              <ellipse cx="120" cy="210" fill="rgba(30,41,59,0.14)" rx="62" ry="14" />

              <g clipPath="url(#golf-ball-clip)">
                {golfBallDimpleRows.map((row, rowIndex) => (
                  <g key={rowIndex} opacity={row.opacity}>
                    {row.dimples.map((dimple, dimpleIndex) => (
                      <ellipse
                        key={dimpleIndex}
                        cx={dimple.cx}
                        cy={dimple.cy}
                        fill="rgba(120,130,150,0.18)"
                        rx={dimple.rx}
                        ry={dimple.ry}
                        stroke="rgba(255,255,255,0.44)"
                        strokeWidth="0.65"
                      />
                    ))}
                  </g>
                ))}
              </g>

              <circle cx="120" cy="120" fill="none" r="101" stroke="rgba(255,255,255,0.38)" strokeWidth="1.4" />
              <path
                d="M76 55C95 36 131 33 156 49"
                fill="none"
                opacity="0.85"
                stroke="rgba(255,255,255,0.82)"
                strokeLinecap="round"
                strokeWidth="8"
              />
              <path
                d="M78 58C101 42 132 42 151 53"
                fill="none"
                opacity="0.45"
                stroke="rgba(255,255,255,0.98)"
                strokeLinecap="round"
                strokeWidth="3"
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

function LogoStudyCard({ index, study }: LogoStudyCardProps) {
  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-soft backdrop-blur-sm"
      initial={{ opacity: 0, y: 28 }}
      transition={{ delay: index * 0.03, duration: 0.55, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">Study {String(index + 1).padStart(2, '0')}</p>
          <h2 className="mt-1 text-lg font-semibold text-white">{study.title}</h2>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-white/55">
            {study.layout}
          </span>
        </div>
      </div>

      <div className="p-5">
        <LogoArtwork study={study} />
        <p className="mt-5 text-sm font-medium text-white/86">{study.direction}</p>
        <p className="mt-2 text-sm leading-relaxed text-white/60">{study.note}</p>
      </div>
    </motion.article>
  )
}

function LogoArtwork({ study }: LogoArtworkProps) {
  return (
    <div className={cx('relative isolate min-h-[17.5rem] overflow-hidden rounded-[1.75rem] border p-6', study.surfaceClassName)}>
      <ArtworkOrnament ornament={study.ornament} />

      <div className="relative z-10 flex h-full items-center justify-center">
        <LogoLockup study={study} />
      </div>
    </div>
  )
}

function ArtworkOrnament({ ornament }: ArtworkOrnamentProps) {
  if (ornament === 'grid') {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:34px_34px]"
      />
    )
  }

  if (ornament === 'halos') {
    return (
      <>
        <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/18" />
        <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/8" />
      </>
    )
  }

  if (ornament === 'beam') {
    return <div aria-hidden="true" className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),transparent)]" />
  }

  if (ornament === 'ribbon') {
    return (
      <>
        <div aria-hidden="true" className="absolute -left-10 top-10 h-24 w-52 rotate-[-14deg] rounded-full bg-white/18 blur-xl" />
        <div aria-hidden="true" className="absolute -right-10 bottom-8 h-24 w-56 rotate-[16deg] rounded-full bg-gold-300/16 blur-xl" />
      </>
    )
  }

  if (ornament === 'rings') {
    return (
      <>
        <div aria-hidden="true" className="absolute right-6 top-6 h-28 w-28 rounded-full border border-white/18" />
        <div aria-hidden="true" className="absolute bottom-6 left-8 h-16 w-16 rounded-full border border-white/18" />
      </>
    )
  }

  return (
    <>
      <div aria-hidden="true" className="absolute left-[-2rem] top-[-1.5rem] h-24 w-24 rounded-full bg-white/15 blur-2xl" />
      <div aria-hidden="true" className="absolute bottom-[-1rem] right-[-1rem] h-28 w-28 rounded-full bg-gold-300/18 blur-2xl" />
    </>
  )
}

function LogoLockup({ study }: LogoLockupProps) {
  if (study.layout === 'monogram') {
    return <MonogramLockup study={study} />
  }

  if (study.layout === 'crest') {
    return <CrestLockup study={study} />
  }

  if (study.layout === 'seal') {
    return <SealLockup study={study} />
  }

  if (study.layout === 'editorial') {
    return <EditorialLockup study={study} />
  }

  return <SignatureLockup study={study} />
}

function PreviewShamrock({ className, dark = false, variant = 'classic' }: PreviewShamrockProps) {
  return (
    <svg
      aria-hidden="true"
      className={cx(className, dark ? 'text-white' : 'text-fairway-600')}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="12" cy="6" rx="5" ry="7" transform="rotate(-10 12 6)" />
      <ellipse cx="6.5" cy="14" rx="5" ry="7" transform="rotate(50 6.5 14)" />
      <ellipse cx="17.5" cy="14" rx="5" ry="7" transform="rotate(-50 17.5 14)" />
      <path
        d="M11 14v6c0 .5.4 1 1 1s1-.5 1-1v-6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.2"
      />
    </svg>
  )
}

function SignatureLockup({ study }: LogoLockupProps) {
  const tone = wordmarkToneMap[study.tone]

  return (
    <div className={cx('flex w-full items-center gap-4', study.layout === 'stacked' && 'flex-col text-center')}>
      <div className={cx('relative flex shrink-0 items-center justify-center overflow-hidden border', study.iconShellClassName)}>
        <img alt="" aria-hidden="true" className="h-[78%] w-[78%] object-contain" src={logoIcon} />
      </div>

      <div className={cx('min-w-0', study.layout === 'stacked' && 'flex flex-col items-center')}>
        <div className={cx('flex flex-wrap items-center gap-2.5', study.layout === 'stacked' && 'justify-center')}>
          <span className={cx('font-brand-script text-[2.5rem] font-bold leading-none md:text-[2.8rem]', tone.golfSol)}>GolfSol</span>
          <PreviewShamrock className="h-6 w-6 shrink-0 md:h-7 md:w-7" dark={tone.shamrockDark} variant={study.shamrockVariant} />
          <span className={cx('font-brand-script text-[1.45rem] font-semibold leading-none md:text-[1.6rem]', tone.ireland)}>Ireland</span>
        </div>
        <p className={cx('mt-2 text-xs uppercase tracking-[0.26em]', tone.tagline)}>The future of your golf trip</p>
      </div>
    </div>
  )
}

function EditorialLockup({ study }: LogoLockupProps) {
  const tone = wordmarkToneMap[study.tone]

  return (
    <div className="relative w-full">
      <div className={cx('absolute right-0 top-0 flex items-center justify-center overflow-hidden border shadow-2xl', study.iconShellClassName)}>
        <img alt="" aria-hidden="true" className="h-[78%] w-[78%] object-contain" src={logoIcon} />
      </div>

      <div className="pr-20">
        <p className={cx('text-xs uppercase tracking-[0.32em]', tone.tagline)}>Curated Costa del Sol golf travel</p>
        <div className="mt-3">
          <span className={cx('block font-brand-script text-[3rem] font-bold leading-[0.9] md:text-[3.6rem]', tone.golfSol)}>GolfSol</span>
          <div className="mt-2 flex items-center gap-2">
            <PreviewShamrock className="h-6 w-6 shrink-0" dark={tone.shamrockDark} variant={study.shamrockVariant} />
            <span className={cx('font-brand-script text-[1.8rem] font-semibold leading-none md:text-[2rem]', tone.ireland)}>Ireland</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function CrestLockup({ study }: LogoLockupProps) {
  const tone = wordmarkToneMap[study.tone]

  return (
    <div className="flex flex-col items-center text-center">
      <div className={cx('flex items-center justify-center overflow-hidden border shadow-2xl', study.iconShellClassName)}>
        <img alt="" aria-hidden="true" className="h-[76%] w-[76%] object-contain" src={logoIcon} />
      </div>
      <span className={cx('mt-5 font-brand-script text-[2.5rem] font-bold leading-none', tone.golfSol)}>GolfSol</span>
      <div className="mt-2 flex items-center gap-2">
        <PreviewShamrock className="h-5 w-5 shrink-0" dark={tone.shamrockDark} variant={study.shamrockVariant} />
        <span className={cx('font-brand-script text-[1.5rem] font-semibold leading-none', tone.ireland)}>Ireland</span>
      </div>
      <p className={cx('mt-3 text-[11px] uppercase tracking-[0.3em]', tone.tagline)}>Tailored fairways for Irish golfers</p>
    </div>
  )
}

function SealLockup({ study }: LogoLockupProps) {
  const tone = wordmarkToneMap[study.tone]

  return (
    <div className="flex flex-col items-center text-center">
      <div className={cx('relative flex items-center justify-center overflow-hidden border shadow-2xl', study.iconShellClassName)}>
        <div aria-hidden="true" className="absolute inset-3 rounded-full border border-white/18" />
        <img alt="" aria-hidden="true" className="relative z-10 h-[48%] w-[48%] object-contain" src={logoIcon} />
      </div>
      <p className={cx('mt-5 text-[11px] uppercase tracking-[0.42em]', tone.tagline)}>Signature Collection</p>
      <div className="mt-2 flex items-center gap-2">
        <span className={cx('font-brand-script text-[2.2rem] font-bold leading-none', tone.golfSol)}>GolfSol</span>
        <PreviewShamrock className="h-5 w-5 shrink-0" dark={tone.shamrockDark} variant={study.shamrockVariant} />
        <span className={cx('font-brand-script text-[1.4rem] font-semibold leading-none', tone.ireland)}>Ireland</span>
      </div>
    </div>
  )
}

function MonogramLockup({ study }: LogoLockupProps) {
  const tone = wordmarkToneMap[study.tone]

  return (
    <div className="flex w-full flex-col items-center text-center">
      <div className={cx('relative flex items-center justify-center overflow-hidden border shadow-2xl', study.iconShellClassName)}>
        <img alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-contain opacity-20" src={logoIcon} />
        <span className={cx('relative z-10 font-display text-[3.1rem] font-black uppercase tracking-[0.22em]', tone.golfSol)}>GSI</span>
      </div>
      <div className="mt-5 flex items-center gap-2">
        <span className={cx('font-brand-script text-[2rem] font-bold leading-none', tone.golfSol)}>GolfSol</span>
        <PreviewShamrock className="h-5 w-5 shrink-0" dark={tone.shamrockDark} variant={study.shamrockVariant} />
        <span className={cx('font-brand-script text-[1.35rem] font-semibold leading-none', tone.ireland)}>Ireland</span>
      </div>
      <p className={cx('mt-2 text-[11px] uppercase tracking-[0.28em]', tone.tagline)}>Luxury golf journeys south</p>
    </div>
  )
}

const logoStudies: readonly LogoStudy[] = [
  {
    title: 'Emerald Luxe',
    direction: 'Polished hero lockup with soft gold light and deep club-house greens',
    note: 'Closest to your current premium identity, but with a more gallery-like presentation and richer contrast.',
    layout: 'signature',
    tone: 'forest',
    ornament: 'mesh',
    surfaceClassName:
      'border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.34),_transparent_26%),linear-gradient(135deg,_#f9f6ec_0%,_#edf6e6_42%,_#d9efd3_100%)]',
    iconShellClassName: 'h-20 w-20 rounded-[1.8rem] border-white/30 bg-white/60'
  },
  {
    title: 'Midnight Club',
    direction: 'A dark luxury treatment for signage, premium merch, or a closing hero frame',
    note: 'The icon sits in a jewel-box shell while the script lockup reads like a members club identity.',
    layout: 'signature',
    tone: 'light',
    ornament: 'beam',
    surfaceClassName:
      'border-white/10 bg-[linear-gradient(145deg,_rgba(5,16,6,0.96),_rgba(22,58,19,0.92)_55%,_rgba(54,40,18,0.88))]',
    iconShellClassName: 'h-20 w-20 rounded-[1.8rem] border-white/15 bg-white/10'
  },
  {
    title: 'Sea Glass',
    direction: 'Resort-forward and airy, with a fresher coastal read',
    note: 'Useful if you want the brand to lean more Marbella than clubhouse without losing the shamrock cue.',
    layout: 'signature',
    tone: 'mist',
    ornament: 'rings',
    surfaceClassName:
      'border-cyan-100/60 bg-[linear-gradient(135deg,_#f6fffe_0%,_#dff7f7_48%,_#cfe8f6_100%)]',
    iconShellClassName: 'h-20 w-20 rounded-[1.9rem] border-cyan-200/60 bg-white/75'
  },
  {
    title: 'Sunset Fairway',
    direction: 'Warm destination energy with a slightly more lifestyle-led finish',
    note: 'The palette pushes the Costa del Sol story harder while keeping your signature script cadence.',
    layout: 'signature',
    tone: 'sunset',
    ornament: 'ribbon',
    surfaceClassName:
      'border-orange-100/20 bg-[linear-gradient(145deg,_#46220d_0%,_#8b3d12_42%,_#d97706_100%)]',
    iconShellClassName: 'h-20 w-20 rounded-[1.85rem] border-white/20 bg-white/10'
  },
  {
    title: 'Neon Fairway',
    direction: 'Bold digital-first version for campaign artwork, socials, and motion pieces',
    note: 'This one intentionally pushes the brand into a more experimental high-contrast lane.',
    layout: 'signature',
    tone: 'neon',
    ornament: 'grid',
    surfaceClassName:
      'border-[#75ff8a]/20 bg-[linear-gradient(160deg,_#07150a_0%,_#0d2412_45%,_#091b0d_100%)]',
    iconShellClassName: 'h-20 w-20 rounded-[1.85rem] border-[#75ff8a]/35 bg-[#75ff8a]/8'
  },
  {
    title: 'Editorial Reserve',
    direction: 'A magazine-style composition with the mark treated like a premium stamp',
    note: 'Reads more like a luxury travel editorial brand while still staying recognisably yours.',
    layout: 'editorial',
    tone: 'ink',
    ornament: 'beam',
    surfaceClassName:
      'border-stone-200 bg-[linear-gradient(145deg,_#fffdf8_0%,_#f4efe2_44%,_#ece6d7_100%)]',
    iconShellClassName: 'h-16 w-16 rounded-full border-stone-300 bg-white/90'
  },
  {
    title: 'Rose Gold Escape',
    direction: 'Romantic luxury with a softer hospitality-led atmosphere',
    note: 'This is useful if the brand ever wants to feel more boutique hotel than tournament brochure.',
    layout: 'editorial',
    tone: 'rose',
    ornament: 'ribbon',
    surfaceClassName:
      'border-rose-100/20 bg-[linear-gradient(145deg,_#2b1220_0%,_#5b2438_44%,_#8a3b4f_100%)]',
    iconShellClassName: 'h-16 w-16 rounded-full border-white/20 bg-white/10'
  },
  {
    title: 'White Label',
    direction: 'Minimal and expensive, stripped down for stationery and premium touchpoints',
    note: 'The restraint here makes the script and shamrock do more work, which gives it confidence.',
    layout: 'editorial',
    tone: 'forest',
    ornament: 'halos',
    surfaceClassName:
      'border-slate-200 bg-[linear-gradient(145deg,_#ffffff_0%,_#f6f7f4_44%,_#eef1ea_100%)]',
    iconShellClassName: 'h-16 w-16 rounded-full border-slate-200 bg-white'
  },
  {
    title: 'Championship Crest',
    direction: 'A more formal badge direction that could live on apparel or event collateral',
    note: 'The current icon becomes the centrepiece and the script turns into a ceremonial signature.',
    layout: 'crest',
    tone: 'gold',
    ornament: 'halos',
    surfaceClassName:
      'border-amber-200/20 bg-[linear-gradient(160deg,_#141414_0%,_#23211b_45%,_#41351b_100%)]',
    iconShellClassName: 'h-36 w-36 rounded-full border-white/12 bg-white/5'
  },
  {
    title: 'Emerald Stamp',
    direction: 'A compact crest for small applications where the full horizontal lockup is too wide',
    note: 'This keeps the luxury story but becomes much easier to drop onto print and packaging.',
    layout: 'crest',
    tone: 'forest',
    ornament: 'rings',
    surfaceClassName:
      'border-fairway-200/50 bg-[linear-gradient(145deg,_#f8fdf5_0%,_#eaf4e3_50%,_#dbeccf_100%)]',
    iconShellClassName: 'h-36 w-36 rounded-full border-fairway-300/60 bg-white/80'
  },
  {
    title: 'Azure Crest',
    direction: 'A brighter destination-focused crest with more travel-poster energy',
    note: 'It feels sunny and premium without becoming too generic or too beach-club.',
    layout: 'crest',
    tone: 'mist',
    ornament: 'beam',
    surfaceClassName:
      'border-cyan-100/50 bg-[linear-gradient(145deg,_#eefcff_0%,_#ddf2fb_48%,_#d3e7ff_100%)]',
    iconShellClassName: 'h-36 w-36 rounded-full border-cyan-200/60 bg-white/80'
  },
  {
    title: 'Poster Club',
    direction: 'A bold crest for campaign art, event invites, and high-impact launch pieces',
    note: 'This one is intentionally louder and slightly more fashion-led than the core site branding.',
    layout: 'crest',
    tone: 'rose',
    ornament: 'mesh',
    surfaceClassName:
      'border-fuchsia-100/10 bg-[linear-gradient(145deg,_#1a0712_0%,_#44122d_46%,_#73274b_100%)]',
    iconShellClassName: 'h-36 w-36 rounded-full border-white/15 bg-white/10'
  },
  {
    title: 'Founders Seal',
    direction: 'Classic circular stamp treatment with premium travel-club vibes',
    note: 'Strong option for membership cards, luggage tags, or a more heritage-flavoured sub-brand.',
    layout: 'seal',
    tone: 'light',
    ornament: 'rings',
    surfaceClassName:
      'border-white/10 bg-[linear-gradient(145deg,_#07100a_0%,_#102915_45%,_#173c1e_100%)]',
    iconShellClassName: 'h-40 w-40 rounded-full border-white/16 bg-white/8'
  },
  {
    title: 'Copper Seal',
    direction: 'Warm metallic version for gift cards, sleeves, and print details',
    note: 'The round composition makes the existing icon feel official without becoming stiff.',
    layout: 'seal',
    tone: 'sunset',
    ornament: 'beam',
    surfaceClassName:
      'border-orange-100/15 bg-[linear-gradient(145deg,_#241108_0%,_#653014_52%,_#aa5a21_100%)]',
    iconShellClassName: 'h-40 w-40 rounded-full border-white/18 bg-white/8'
  },
  {
    title: 'Ivory Seal',
    direction: 'Soft premium seal treatment for stationery or embossed packaging systems',
    note: 'This direction feels expensive in a quieter way and would translate beautifully to print finishes.',
    layout: 'seal',
    tone: 'ink',
    ornament: 'halos',
    surfaceClassName:
      'border-stone-200 bg-[linear-gradient(145deg,_#fffef9_0%,_#f6f0e3_52%,_#efe7d8_100%)]',
    iconShellClassName: 'h-40 w-40 rounded-full border-stone-300 bg-white/80'
  },
  {
    title: 'Monogram Tee',
    direction: 'Compact monogram for caps, bag tags, favicons, and avatars',
    note: 'It abstracts the existing identity without throwing away the current logo asset underneath.',
    layout: 'monogram',
    tone: 'forest',
    ornament: 'grid',
    surfaceClassName:
      'border-fairway-200/40 bg-[linear-gradient(145deg,_#f8fbf4_0%,_#eaf3e2_50%,_#d9ecd2_100%)]',
    iconShellClassName: 'h-32 w-32 rounded-[2rem] border-fairway-300/60 bg-white/85'
  },
  {
    title: 'Night Monogram',
    direction: 'Dark monogram with strong premium-sport energy',
    note: 'Feels modern, compact, and highly usable across digital surfaces where the full script is too fine.',
    layout: 'monogram',
    tone: 'gold',
    ornament: 'rings',
    surfaceClassName:
      'border-white/10 bg-[linear-gradient(145deg,_#060808_0%,_#121818_48%,_#1e1c12_100%)]',
    iconShellClassName: 'h-32 w-32 rounded-[2rem] border-white/14 bg-white/8'
  },
  {
    title: 'Coastal Monogram',
    direction: 'Travel-forward monogram with airy resort energy',
    note: 'Useful if you want a secondary mark that feels lighter, younger, and more social-native.',
    layout: 'monogram',
    tone: 'mist',
    ornament: 'ribbon',
    surfaceClassName:
      'border-cyan-100/50 bg-[linear-gradient(145deg,_#f6ffff_0%,_#dff5f8_46%,_#d6e8ff_100%)]',
    iconShellClassName: 'h-32 w-32 rounded-[2rem] border-cyan-200/60 bg-white/80'
  },
  {
    title: 'Afterglow Monogram',
    direction: 'A campaign monogram that feels built for motion graphics and launch assets',
    note: 'The palette is bolder, but the icon silhouette keeps it tied to the existing brand system.',
    layout: 'monogram',
    tone: 'rose',
    ornament: 'beam',
    surfaceClassName:
      'border-rose-100/10 bg-[linear-gradient(145deg,_#18060e_0%,_#42132a_48%,_#8a3454_100%)]',
    iconShellClassName: 'h-32 w-32 rounded-[2rem] border-white/15 bg-white/10'
  },
  {
    title: 'Stacked Resort',
    direction: 'A vertical signature for tighter panels, mobile headers, and social covers',
    note: 'This is the most practical alternate lockup in the set because it compresses the current brand cleanly.',
    layout: 'stacked',
    tone: 'light',
    ornament: 'mesh',
    surfaceClassName:
      'border-white/10 bg-[linear-gradient(160deg,_#0a170b_0%,_#153417_54%,_#234d1e_100%)]',
    iconShellClassName: 'h-24 w-24 rounded-[2rem] border-white/15 bg-white/8'
  },
  {
    title: 'Linen Stacked',
    direction: 'Print-friendly vertical lockup with a softer, tactile premium feel',
    note: 'Feels like a boutique travel journal or welcome pack cover rather than a website logo.',
    layout: 'stacked',
    tone: 'ink',
    ornament: 'halos',
    surfaceClassName:
      'border-stone-200 bg-[linear-gradient(145deg,_#fffdfa_0%,_#f3ecde_46%,_#ece4d3_100%)]',
    iconShellClassName: 'h-24 w-24 rounded-[2rem] border-stone-300 bg-white/90'
  },
  {
    title: 'Round Clover Club',
    direction: 'A softer circular shamrock for luxury hospitality and welcome-pack applications',
    note: 'This keeps the brand warm and approachable while making the shamrock feel more classic and friendly.',
    layout: 'signature',
    tone: 'forest',
    ornament: 'halos',
    shamrockVariant: 'round',
    surfaceClassName:
      'border-fairway-200/50 bg-[linear-gradient(145deg,_#fdfef9_0%,_#eef7e7_48%,_#e1efd6_100%)]',
    iconShellClassName: 'h-20 w-20 rounded-[1.9rem] border-fairway-300/50 bg-white/80'
  },
  {
    title: 'Heartleaf Escape',
    direction: 'Romantic shamrock treatment with a boutique, destination-led softness',
    note: 'The heart-shaped leaves make the identity feel more emotional without drifting into generic travel branding.',
    layout: 'editorial',
    tone: 'rose',
    ornament: 'ribbon',
    shamrockVariant: 'heart',
    surfaceClassName:
      'border-rose-100/15 bg-[linear-gradient(145deg,_#200a13_0%,_#4f1831_46%,_#7a2f46_100%)]',
    iconShellClassName: 'h-16 w-16 rounded-full border-white/15 bg-white/10'
  },
  {
    title: 'Cut Diamond Clover',
    direction: 'Sharper geometric shamrock for a more elevated, premium-sport posture',
    note: 'This one feels especially suited to apparel embroidery, bag tags, or high-end event branding.',
    layout: 'crest',
    tone: 'gold',
    ornament: 'grid',
    shamrockVariant: 'diamond',
    surfaceClassName:
      'border-amber-100/15 bg-[linear-gradient(145deg,_#12110e_0%,_#292319_46%,_#4f3e1f_100%)]',
    iconShellClassName: 'h-36 w-36 rounded-full border-white/15 bg-white/6'
  },
  {
    title: 'Spade Fairway',
    direction: 'A slightly more heraldic shamrock with stronger golf-club symbolism',
    note: 'The spade-like leaves give the mark a more assertive, almost tournament-grade presence.',
    layout: 'seal',
    tone: 'light',
    ornament: 'rings',
    shamrockVariant: 'spade',
    surfaceClassName:
      'border-white/10 bg-[linear-gradient(145deg,_#07110a_0%,_#123017_48%,_#1b4820_100%)]',
    iconShellClassName: 'h-40 w-40 rounded-full border-white/16 bg-white/8'
  },
  {
    title: 'Outline Atelier',
    direction: 'Minimal outlined shamrock for editorial systems and print-first luxury touches',
    note: 'This makes the shamrock feel more refined and less mascot-like, especially on lighter surfaces.',
    layout: 'stacked',
    tone: 'ink',
    ornament: 'beam',
    shamrockVariant: 'outlined',
    surfaceClassName:
      'border-stone-200 bg-[linear-gradient(145deg,_#fffef8_0%,_#f4eee0_46%,_#ede4d3_100%)]',
    iconShellClassName: 'h-24 w-24 rounded-[2rem] border-stone-300 bg-white/90'
  },
  {
    title: 'Pinwheel Coast',
    direction: 'A wind-swept shamrock direction with more movement and resort energy',
    note: 'It feels breezier and more Mediterranean, which helps connect the Irish cue to the destination story.',
    layout: 'signature',
    tone: 'mist',
    ornament: 'ribbon',
    shamrockVariant: 'pinwheel',
    surfaceClassName:
      'border-cyan-100/50 bg-[linear-gradient(145deg,_#f7ffff_0%,_#def6f8_48%,_#d6e6fb_100%)]',
    iconShellClassName: 'h-20 w-20 rounded-[1.9rem] border-cyan-200/60 bg-white/80'
  },
  {
    title: 'Dewdrop Clover',
    direction: 'Liquid, glossy shamrock treatment for a more modern resort-luxury mood',
    note: 'This one feels contemporary and polished, especially if the brand leans into motion or glassmorphism later.',
    layout: 'monogram',
    tone: 'neon',
    ornament: 'mesh',
    shamrockVariant: 'dew',
    surfaceClassName:
      'border-[#8dfcab]/20 bg-[linear-gradient(160deg,_#06130a_0%,_#0a2010_46%,_#12331b_100%)]',
    iconShellClassName: 'h-32 w-32 rounded-[2rem] border-[#8dfcab]/30 bg-[#8dfcab]/8'
  },
  {
    title: 'Lucky Four',
    direction: 'Four-leaf clover variant for a more iconic and souvenir-friendly direction',
    note: 'This pushes the Irish symbolism harder and could work well for merchandise or a campaign sub-mark.',
    layout: 'crest',
    tone: 'forest',
    ornament: 'halos',
    shamrockVariant: 'four-leaf',
    surfaceClassName:
      'border-fairway-200/50 bg-[linear-gradient(145deg,_#fbfff8_0%,_#edf8e5_48%,_#dcefd1_100%)]',
    iconShellClassName: 'h-36 w-36 rounded-full border-fairway-300/60 bg-white/80'
  },
  {
    title: 'Compass Clover',
    direction: 'A directional shamrock for travel-led storytelling and route-planning narratives',
    note: 'The leaves read like points of navigation, which ties neatly into curated travel and trip design.',
    layout: 'editorial',
    tone: 'sunset',
    ornament: 'beam',
    shamrockVariant: 'compass',
    surfaceClassName:
      'border-orange-100/15 bg-[linear-gradient(145deg,_#33190d_0%,_#6c3216_46%,_#c06218_100%)]',
    iconShellClassName: 'h-16 w-16 rounded-full border-white/18 bg-white/10'
  },
  {
    title: 'Petal Clover',
    direction: 'Organic petal-style shamrock for a softer handcrafted premium direction',
    note: 'It feels artisanal and elevated, like a mark that belongs on stationery, menus, or gift packaging.',
    layout: 'seal',
    tone: 'gold',
    ornament: 'ribbon',
    shamrockVariant: 'petal',
    surfaceClassName:
      'border-amber-100/15 bg-[linear-gradient(145deg,_#15120d_0%,_#2b2418_46%,_#52401f_100%)]',
    iconShellClassName: 'h-40 w-40 rounded-full border-white/16 bg-white/8'
  }
] as const

interface LogoStudyCardProps {
  readonly index: number
  readonly study: LogoStudy
}

interface LogoArtworkProps {
  readonly study: LogoStudy
}

interface ArtworkOrnamentProps {
  readonly ornament: LogoStudy['ornament']
}

interface LogoLockupProps {
  readonly study: LogoStudy
}

interface LogoStudy {
  readonly title: string
  readonly direction: string
  readonly note: string
  readonly layout: 'signature' | 'editorial' | 'crest' | 'seal' | 'monogram' | 'stacked'
  readonly tone: keyof typeof wordmarkToneMap
  readonly ornament: 'mesh' | 'grid' | 'halos' | 'beam' | 'ribbon' | 'rings'
  readonly shamrockVariant?: ShamrockVariant
  readonly surfaceClassName: string
  readonly iconShellClassName: string
}

type ShamrockVariant =
  | 'classic'
  | 'round'
  | 'heart'
  | 'diamond'
  | 'spade'
  | 'outlined'
  | 'pinwheel'
  | 'dew'
  | 'four-leaf'
  | 'compass'
  | 'petal'

interface PreviewShamrockProps {
  readonly className?: string
  readonly dark?: boolean
  readonly variant?: ShamrockVariant
}

const golfBallDimpleRows = [
  {
    opacity: 0.34,
    dimples: [
      { cx: 84, cy: 62, rx: 8, ry: 6 },
      { cx: 106, cy: 56, rx: 8, ry: 6 },
      { cx: 130, cy: 55, rx: 8, ry: 6 },
      { cx: 154, cy: 60, rx: 8, ry: 6 }
    ]
  },
  {
    opacity: 0.32,
    dimples: [
      { cx: 67, cy: 81, rx: 8.5, ry: 6.4 },
      { cx: 91, cy: 76, rx: 8.5, ry: 6.4 },
      { cx: 117, cy: 73, rx: 8.5, ry: 6.4 },
      { cx: 143, cy: 74, rx: 8.5, ry: 6.4 },
      { cx: 168, cy: 79, rx: 8.5, ry: 6.4 }
    ]
  },
  {
    opacity: 0.28,
    dimples: [
      { cx: 53, cy: 104, rx: 9, ry: 6.8 },
      { cx: 79, cy: 98, rx: 9, ry: 6.8 },
      { cx: 106, cy: 95, rx: 9, ry: 6.8 },
      { cx: 134, cy: 95, rx: 9, ry: 6.8 },
      { cx: 161, cy: 98, rx: 9, ry: 6.8 },
      { cx: 187, cy: 105, rx: 9, ry: 6.8 }
    ]
  },
  {
    opacity: 0.24,
    dimples: [
      { cx: 48, cy: 130, rx: 9, ry: 7 },
      { cx: 76, cy: 124, rx: 9, ry: 7 },
      { cx: 104, cy: 121, rx: 9, ry: 7 },
      { cx: 133, cy: 121, rx: 9, ry: 7 },
      { cx: 162, cy: 124, rx: 9, ry: 7 },
      { cx: 190, cy: 131, rx: 9, ry: 7 }
    ]
  },
  {
    opacity: 0.2,
    dimples: [
      { cx: 60, cy: 156, rx: 8.6, ry: 6.6 },
      { cx: 88, cy: 151, rx: 8.6, ry: 6.6 },
      { cx: 118, cy: 148, rx: 8.6, ry: 6.6 },
      { cx: 148, cy: 150, rx: 8.6, ry: 6.6 },
      { cx: 176, cy: 157, rx: 8.6, ry: 6.6 }
    ]
  },
  {
    opacity: 0.16,
    dimples: [
      { cx: 82, cy: 178, rx: 8, ry: 6.2 },
      { cx: 109, cy: 174, rx: 8, ry: 6.2 },
      { cx: 137, cy: 174, rx: 8, ry: 6.2 },
      { cx: 164, cy: 179, rx: 8, ry: 6.2 }
    ]
  }
] as const
