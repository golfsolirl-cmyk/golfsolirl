import { useId, type CSSProperties } from 'react'
import { useReducedMotion, useScroll, useTransform, m } from 'framer-motion'
import { brandLogoAssetUrl } from '../../lib/brand-logo-assets'
import { cx } from '../../lib/utils'
import '../../styles/home-creative-canvas.css'

const CREST_MARKS = [
  { top: '14%', left: '6%', scale: 1 },
  { top: '48%', left: '90%', scale: 0.85 },
  { top: '72%', left: '12%', scale: 0.75 }
] as const

function HorizonSilhouette({ uid }: { readonly uid: string }) {
  const sky = `canvas-sky-${uid}`
  const hills = `canvas-hills-${uid}`

  return (
    <svg viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,200,130,0.28)" />
          <stop offset="100%" stopColor="rgba(11,77,59,0)" />
        </linearGradient>
        <linearGradient id={hills} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(6,47,36,0.55)" />
          <stop offset="100%" stopColor="rgba(4,25,19,0)" />
        </linearGradient>
      </defs>
      <rect width="1440" height="220" fill={`url(#${sky})`} />
      <path
        d="M0,140 C180,95 320,118 480,102 C640,86 820,62 980,78 C1140,94 1280,88 1440,96 L1440,220 L0,220 Z"
        fill={`url(#${hills})`}
      />
      <path
        d="M0,168 C220,148 420,172 640,158 C860,144 1080,150 1440,162"
        fill="none"
        stroke="rgba(199,154,59,0.22)"
        strokeWidth="1.2"
      />
    </svg>
  )
}

function FairwayContours({ uid }: { readonly uid: string }) {
  const stroke = `canvas-fairway-${uid}`

  return (
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={stroke} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(199,154,59,0)" />
          <stop offset="20%" stopColor="rgba(199,154,59,0.35)" />
          <stop offset="50%" stopColor="rgba(233,207,123,0.55)" />
          <stop offset="80%" stopColor="rgba(199,154,59,0.3)" />
          <stop offset="100%" stopColor="rgba(199,154,59,0)" />
        </linearGradient>
      </defs>
      <path
        d="M-40,68 C220,42 480,88 720,58 C960,28 1180,72 1480,46"
        fill="none"
        stroke={`url(#${stroke})`}
        strokeWidth="1.4"
      />
      <path
        d="M-20,92 C260,78 520,102 760,86 C1000,70 1220,96 1460,80"
        fill="none"
        stroke="rgba(11,77,59,0.45)"
        strokeWidth="1"
        opacity="0.6"
      />
    </svg>
  )
}

function JourneyArc({ uid }: { readonly uid: string }) {
  const arc = `canvas-arc-${uid}`

  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={arc} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(233,207,123,0)" />
          <stop offset="35%" stopColor="rgba(233,207,123,0.45)" />
          <stop offset="68%" stopColor="rgba(11,77,59,0.35)" />
          <stop offset="100%" stopColor="rgba(247,230,163,0)" />
        </linearGradient>
      </defs>
      <path
        d="M80,120 C320,80 520,280 720,340 S1120,520 1360,680"
        fill="none"
        stroke={`url(#${arc})`}
        strokeWidth="2"
        strokeDasharray="6 14"
        strokeLinecap="round"
      />
    </svg>
  )
}

export type CanvasSectionMorphTone = 'cream-forest' | 'soft-white'

const MORPH_TONES: Record<CanvasSectionMorphTone, { readonly from: string; readonly to: string }> = {
  'cream-forest': { from: '#faf8f3', to: '#062016' },
  'soft-white': { from: '#f3efe6', to: '#ffffff' }
}

export type CanvasSectionMorphProps = {
  readonly tone: CanvasSectionMorphTone
  readonly className?: string
}

/** Organic fairway swell between sections — colour morph, no ribbon chrome. */
export function CanvasSectionMorph({ tone, className }: CanvasSectionMorphProps) {
  const uid = useId().replace(/:/g, '')
  const { from, to } = MORPH_TONES[tone]
  const grad = `canvas-morph-${uid}`

  return (
    <m.div
      aria-hidden
      className={cx('canvas-section-morph w-full', className)}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <svg viewBox="0 0 1440 88" preserveAspectRatio="none">
        <defs>
          <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <path
          d="M0,0 H1440 V88 C1080,28 900,62 720,44 C540,26 360,58 0,22 Z"
          fill={`url(#${grad})`}
        />
      </svg>
    </m.div>
  )
}

export type HomeCreativeCanvasProps = {
  readonly className?: string
}

/**
 * Scroll-reactive homepage atmosphere — golden fairway canvas with horizon depth.
 * Fixed behind content; warms as you scroll (Ireland departure → Costa del Sol arrival).
 */
export function HomeCreativeCanvas({ className }: HomeCreativeCanvasProps) {
  const uid = useId().replace(/:/g, '')
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()

  const scrollWarmth = useTransform(scrollYProgress, [0, 0.45, 1], [0, 0.55, 1])
  const horizonShift = useTransform(scrollYProgress, [0, 1], [0, -12])

  const canvasStyle = reduceMotion
    ? ({ '--scroll-warmth': 0.35, '--horizon-shift': 0 } as CSSProperties)
    : ({
        '--scroll-warmth': scrollWarmth,
        '--horizon-shift': horizonShift
      } as CSSProperties)

  return (
    <m.div aria-hidden className={cx('creative-canvas-root', className)} style={canvasStyle}>
      <div className="creative-canvas__grain" />

      <div className="creative-canvas__light-sweep" />

      <div className="creative-canvas__horizon">
        <HorizonSilhouette uid={uid} />
      </div>

      <div className="creative-canvas__fairway">
        <FairwayContours uid={`${uid}-a`} />
        <FairwayContours uid={`${uid}-b`} />
        <FairwayContours uid={`${uid}-c`} />
      </div>

      <div className="creative-canvas__journey">
        <JourneyArc uid={uid} />
      </div>

      <div className="creative-canvas__crest-field">
        {CREST_MARKS.map((mark) => (
          <img
            key={`${mark.top}-${mark.left}`}
            src={brandLogoAssetUrl()}
            alt=""
            className="creative-canvas__crest"
            style={{
              top: mark.top,
              left: mark.left,
              transform: `scale(${mark.scale})`
            }}
            decoding="async"
          />
        ))}
      </div>
    </m.div>
  )
}

/** @deprecated Use HomeCreativeCanvas */
export const LuxuryBackground = HomeCreativeCanvas

/** @deprecated Use CanvasSectionMorph */
export const LuxurySectionBridge = CanvasSectionMorph

export type LuxurySectionBridgeTone = CanvasSectionMorphTone
