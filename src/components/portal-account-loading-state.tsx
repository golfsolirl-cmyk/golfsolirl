import { m  } from 'framer-motion'
import { Building2, PlaneLanding, Sparkles, Trophy } from 'lucide-react'

const pulseRing = {
  scale: [1, 1.35, 1],
  opacity: [0.45, 0, 0.45]
}

type PortalAccountLoadingStateProps = {
  /** Shorter copy and layout for overlays (e.g. client dashboard data fetch). */
  readonly compact?: boolean
}

export function PortalAccountLoadingState({ compact = false }: PortalAccountLoadingStateProps) {
  if (compact) {
    return (
      <div
        className="relative mx-auto flex max-w-sm flex-col items-center rounded-2xl border border-forest-200/70 bg-white/90 px-8 py-10 shadow-soft backdrop-blur-sm"
        role="status"
        aria-live="polite"
      >
        <span className="sr-only">Loading your dashboard.</span>
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-10 h-32 w-32 rounded-full bg-gold-200/25 blur-2xl" />
        <div className="relative flex h-16 w-16 items-center justify-center">
          <m.span
            className="absolute inset-0 rounded-xl border-2 border-emerald-500/45"
            animate={pulseRing}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
          <Sparkles className="relative h-7 w-7 text-emerald-800" strokeWidth={1.75} aria-hidden />
        </div>
        <p className="font-display relative mt-5 text-center text-base font-semibold text-forest-800 md:text-lg">Loading your trip…</p>
        <div className="relative mt-5 flex w-full max-w-[10rem] gap-2">
          {[0, 1, 2].map((i) => (
            <m.div
              key={i}
              className="h-1 flex-1 rounded-full bg-gradient-to-r from-forest-200 via-fairway-300 to-forest-200"
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative mx-auto max-w-xl overflow-hidden rounded-[2rem] border border-forest-200/80 bg-[linear-gradient(165deg,#fffefb_0%,#eef6f0_45%,#e8f4ec_100%)] px-8 py-12 shadow-soft md:px-10 md:py-14"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">
        Loading. Transfers, Golf Courses and Accommodation from the Golf Sol Ireland Trip Desk. Your packages, transfers, and
        messages will appear shortly.
      </span>
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gold-300/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-16 h-56 w-56 rounded-full bg-fairway-500/15 blur-3xl" />

      <div className="relative flex flex-col items-center">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <m.span
            className="absolute inset-0 rounded-2xl border-2 border-gold-400/60"
            animate={pulseRing}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
          />
          <m.span
            className="absolute inset-[-6px] rounded-[1.35rem] border border-emerald-600/30"
            animate={pulseRing}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 0.35 }}
          />
          <m.div
            className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-gradient-to-br from-forest-950 via-emerald-950 to-[#0a2416] shadow-[0_12px_40px_rgba(11,73,52,0.35)] ring-1 ring-white/10"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <m.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="h-9 w-9 text-gold-300" strokeWidth={1.75} aria-hidden />
            </m.div>
          </m.div>
        </div>

        <m.p
          className="font-display mt-8 text-center text-lg font-semibold tracking-tight text-forest-950 md:text-xl"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.45 }}
        >
          Transfers, Golf Courses &amp; Accommodation
        </m.p>
        <m.p
          className="mt-2 text-center text-sm font-medium tracking-wide text-forest-800"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
        >
          from the Golf Sol Ireland Trip Desk
        </m.p>
        <m.p
          className="mt-3 text-center text-sm leading-relaxed text-forest-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Your packages, transfers, and messages will appear shortly.
        </m.p>

        <div className="mt-10 flex w-full max-w-[17rem] flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <m.div
              key={i}
              className="h-2.5 w-full rounded-full bg-gradient-to-r from-forest-200/90 via-fairway-200/95 to-forest-200/90"
              initial={{ opacity: 0.35, scaleX: 0.88 }}
              animate={{
                opacity: [0.35, 0.95, 0.35],
                scaleX: [0.88, 1, 0.88]
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.22
              }}
              style={{ transformOrigin: 'center' }}
            />
          ))}
        </div>

        <m.div
          className="mt-10 flex items-center gap-6 text-forest-700/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <m.span
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-forest-200/80 bg-white/90 shadow-sm"
          >
            <PlaneLanding className="h-5 w-5 text-emerald-800" strokeWidth={2} aria-hidden />
          </m.span>
          <m.span
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.25 }}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-forest-200/80 bg-white/90 shadow-sm"
          >
            <Trophy className="h-5 w-5 text-gold-600" strokeWidth={2} aria-hidden />
          </m.span>
          <m.span
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-forest-200/80 bg-white/90 shadow-sm"
          >
            <Building2 className="h-5 w-5 text-fairway-700" strokeWidth={2} aria-hidden />
          </m.span>
        </m.div>
      </div>
    </div>
  )
}
