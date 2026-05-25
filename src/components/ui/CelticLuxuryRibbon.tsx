import { useId } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { cx } from '../../lib/utils'

/** Hero-matched palette — forest foundation + chrome gold trim. */
const FOREST = {
  edge: 'rgb(5,30,22)',
  mid: 'rgb(11,77,59)',
  deep: 'rgb(6,47,36)'
} as const

const GOLD = {
  shadow: '#9E762A',
  base: '#C79A3B',
  mid: '#E9CF7B',
  hi: '#F7E6A3'
} as const

export type CelticLuxuryRibbonTone = 'light' | 'dark' | 'transparent'

export type CelticLuxuryRibbonProps = {
  readonly className?: string
  /** Pull ribbon over the section above (negative margin). */
  readonly overlap?: boolean
  readonly tone?: CelticLuxuryRibbonTone
  /** Section colour above — soft edge blend. */
  readonly blendFrom?: string
  /** Section colour below — soft edge blend. */
  readonly blendTo?: string
}

/** Asymmetric ribbon paths — high left/right wings, centre valley (hero footer geometry). */
const RIBBON = {
  /** Deepest shadow band — offset for stacked depth. */
  shadow:
    'M0,200 L0,52 C198,94 368,22 518,44 C668,66 742,92 836,108 C930,92 1004,66 1154,44 C1304,22 1420,58 1440,48 L1440,200 Z',
  /** Mid band — darker secondary layer. */
  mid:
    'M0,200 L0,44 C192,88 362,16 528,38 C694,60 768,86 836,102 C904,86 978,60 1144,38 C1310,16 1420,52 1440,40 L1440,200 Z',
  /** Primary ribbon face — substantial thickness. */
  main:
    'M0,200 L0,36 C186,82 356,10 524,32 C692,54 776,80 836,96 C896,80 980,54 1148,32 C1316,10 1420,46 1440,34 L1440,200 Z',
  /** Gold trims trace ribbon curvature. */
  trimMain:
    'M0,36 C186,82 356,10 524,32 C692,54 776,80 836,96 C896,80 980,54 1148,32 C1316,10 1486,82 1440,34',
  trimMid:
    'M0,44 C192,88 362,16 528,38 C694,60 768,86 836,102 C904,86 978,60 1144,38 C1310,16 1480,88 1440,40',
  trimInner:
    'M248,78 C468,108 668,74 836,88 C1004,74 1204,108 1424,78',
  trimWhisper:
    'M0,118 C280,148 520,102 836,122 C1152,102 1392,148 1440,128'
} as const

const MOTION_EASE: [number, number, number, number] = [0.45, 0, 0.55, 1]

function MetallicShamrock({
  uid,
  cx,
  cy
}: {
  readonly uid: string
  readonly cx: number
  readonly cy: number
}) {
  const gDeep = `clr-gdeep-${uid}`
  const gMid = `clr-gmid-${uid}`
  const gHi = `clr-ghi-${uid}`

  return (
    <g transform={`translate(${cx} ${cy})`}>
      <ellipse cx="0" cy="-8" rx="8" ry="10.5" fill={`url(#${gDeep})`} transform="rotate(-11)" />
      <ellipse cx="-10" cy="5.5" rx="8" ry="10.5" fill={`url(#${gDeep})`} transform="rotate(49)" />
      <ellipse cx="10" cy="5.5" rx="8" ry="10.5" fill={`url(#${gDeep})`} transform="rotate(-49)" />
      <ellipse cx="0" cy="-8.5" rx="5.5" ry="7" fill={`url(#${gHi})`} opacity="0.42" transform="rotate(-11)" />
      <ellipse cx="-6.5" cy="4.5" rx="5.5" ry="7" fill={`url(#${gMid})`} opacity="0.35" transform="rotate(49)" />
      <ellipse cx="6.5" cy="4.5" rx="5.5" ry="7" fill={`url(#${gMid})`} opacity="0.35" transform="rotate(-49)" />
      <path
        d="M0 6v8"
        stroke={`url(#${gMid})`}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </g>
  )
}

function RibbonSvg({
  uid,
  blendFrom,
  blendTo,
  tone,
  goldShimmer,
  shamrockPulse
}: {
  readonly uid: string
  readonly blendFrom?: string
  readonly blendTo?: string
  readonly tone: CelticLuxuryRibbonTone
  readonly goldShimmer: Record<string, unknown>
  readonly shamrockPulse: Record<string, unknown>
}) {
  const forestBase = `clr-fbase-${uid}`
  const forestCentre = `clr-fcentre-${uid}`
  const forestShadow = `clr-fshad-${uid}`
  const forestMid = `clr-fmid-${uid}`
  const forestMain = `clr-fmain-${uid}`
  const goldChrome = `clr-gold-${uid}`
  const goldBright = `clr-goldb-${uid}`
  const goldDeep = `clr-gdeep-${uid}`
  const goldMid = `clr-gmid-${uid}`
  const goldHi = `clr-ghi-${uid}`
  const celtic = `clr-celtic-${uid}`
  const heroGlow = `clr-glow-${uid}`
  const clipMain = `clr-clip-${uid}`
  const fadeTop = `clr-ftop-${uid}`
  const fadeBottom = `clr-fbot-${uid}`

  const showTopFade = tone !== 'dark' && blendFrom
  const showBottomFade = tone !== 'dark' && blendTo

  return (
    <svg
      viewBox="0 0 1440 200"
      preserveAspectRatio="xMidYMax slice"
      className="block h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={forestBase} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={FOREST.edge} />
          <stop offset="48%" stopColor={FOREST.deep} />
          <stop offset="100%" stopColor={FOREST.edge} />
        </linearGradient>
        <radialGradient id={forestCentre} cx="50%" cy="38%" r="58%">
          <stop offset="0%" stopColor={FOREST.mid} stopOpacity="0.22" />
          <stop offset="100%" stopColor={FOREST.edge} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={forestShadow} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#041810" />
          <stop offset="100%" stopColor={FOREST.edge} />
        </linearGradient>
        <linearGradient id={forestMid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a3d2e" />
          <stop offset="100%" stopColor={FOREST.edge} />
        </linearGradient>
        <linearGradient id={forestMain} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f5240" />
          <stop offset="55%" stopColor={FOREST.deep} />
          <stop offset="100%" stopColor="#051811" />
        </linearGradient>

        <linearGradient id={goldChrome} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={GOLD.shadow} stopOpacity="0.45" />
          <stop offset="22%" stopColor={GOLD.base} />
          <stop offset="48%" stopColor={GOLD.hi} />
          <stop offset="72%" stopColor={GOLD.mid} />
          <stop offset="100%" stopColor={GOLD.shadow} stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={goldBright} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={GOLD.base} stopOpacity="0" />
          <stop offset="42%" stopColor={GOLD.hi} />
          <stop offset="58%" stopColor={GOLD.hi} />
          <stop offset="100%" stopColor={GOLD.base} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={goldDeep} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GOLD.mid} />
          <stop offset="100%" stopColor={GOLD.shadow} />
        </linearGradient>
        <linearGradient id={goldMid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={GOLD.hi} />
          <stop offset="100%" stopColor={GOLD.base} />
        </linearGradient>
        <linearGradient id={goldHi} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff8e8" />
          <stop offset="100%" stopColor={GOLD.mid} stopOpacity="0" />
        </linearGradient>

        <radialGradient id={heroGlow} cx="50%" cy="72%" r="42%">
          <stop offset="0%" stopColor={GOLD.mid} stopOpacity="0.16" />
          <stop offset="55%" stopColor={FOREST.mid} stopOpacity="0.05" />
          <stop offset="100%" stopColor={FOREST.edge} stopOpacity="0" />
        </radialGradient>

        <pattern id={celtic} width="96" height="96" patternUnits="userSpaceOnUse">
          <path
            d="M12 48 C28 12, 44 12, 60 28 C76 44, 76 60, 60 76 C44 92, 28 92, 12 56 C28 40, 44 40, 60 56 C76 72, 92 72, 84 48"
            fill="none"
            stroke="#000000"
            strokeOpacity="0.55"
            strokeWidth="1.35"
          />
          <path
            d="M60 12 C76 28, 76 44, 60 60 C44 76, 28 76, 12 60"
            fill="none"
            stroke="#d4a843"
            strokeOpacity="0.12"
            strokeWidth="0.9"
          />
        </pattern>

        <clipPath id={clipMain}>
          <path d={RIBBON.main} />
        </clipPath>

        {showTopFade ? (
          <linearGradient id={fadeTop} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={blendFrom} />
            <stop offset="24%" stopColor={blendFrom} stopOpacity="0" />
          </linearGradient>
        ) : null}

        {showBottomFade ? (
          <linearGradient id={fadeBottom} x1="0" y1="0" x2="0" y2="1">
            <stop offset="76%" stopColor={blendTo} stopOpacity="0" />
            <stop offset="100%" stopColor={blendTo} />
          </linearGradient>
        ) : null}
      </defs>

      {/* Layer 1 — foundation */}
      <rect x="0" y="0" width="1440" height="200" fill={`url(#${forestBase})`} />
      <rect x="0" y="0" width="1440" height="200" fill={`url(#${forestCentre})`} />

      {showTopFade ? <rect x="0" y="0" width="1440" height="200" fill={`url(#${fadeTop})`} /> : null}
      {showBottomFade ? <rect x="0" y="0" width="1440" height="200" fill={`url(#${fadeBottom})`} /> : null}

      {/* Layer 3 — shadow depth (behind main) */}
      <path d={RIBBON.shadow} fill={`url(#${forestShadow})`} opacity="0.92" />

      {/* Layer 2 mid + Layer 3 stack */}
      <path d={RIBBON.mid} fill={`url(#${forestMid})`} opacity="0.94" />
      <path d={RIBBON.mid} fill={`url(#${celtic})`} opacity="0.06" />

      {/* Layer 2 — main ribbon */}
      <path d={RIBBON.main} fill={`url(#${forestMain})`} />

      {/* Layer 5 — embossed Celtic (clipped to ribbon) */}
      <g clipPath={`url(#${clipMain})`}>
        <rect x="0" y="0" width="1440" height="200" fill={`url(#${celtic})`} opacity="0.07" />
      </g>

      {/* Layer 6 — centre glow */}
      <ellipse cx="720" cy="142" rx="200" ry="58" fill={`url(#${heroGlow})`} />

      {/* Layer 4 — metallic trim */}
      <m.g {...goldShimmer}>
        <path
          d={RIBBON.trimMain}
          fill="none"
          stroke={`url(#${goldChrome})`}
          strokeWidth="2.1"
          strokeLinecap="round"
          opacity="0.92"
        />
        <path
          d={RIBBON.trimMid}
          fill="none"
          stroke={`url(#${goldChrome})`}
          strokeWidth="1.35"
          strokeLinecap="round"
          opacity="0.62"
        />
        <path
          d={RIBBON.trimInner}
          fill="none"
          stroke={`url(#${goldBright})`}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.48"
        />
        <path
          d={RIBBON.trimWhisper}
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.75"
          strokeLinecap="round"
          opacity="0.07"
        />
      </m.g>

      {/* Layer 7 — shamrock + separators */}
      <m.g {...shamrockPulse}>
        <path
          d="M588,168 H852"
          stroke={`url(#${goldChrome})`}
          strokeWidth="0.9"
          opacity="0.42"
          strokeLinecap="round"
        />
        <MetallicShamrock uid={uid} cx={720} cy={162} />
      </m.g>
    </svg>
  )
}

/**
 * Premium Celtic luxury ribbon — hero footer recreation.
 * Seven-layer branded overlay: forest foundation, stacked ribbons,
 * chrome gold trim, embossed knot texture, centre glow, shamrock crest.
 */
export function CelticLuxuryRibbon({
  className,
  overlap = true,
  tone = 'light',
  blendFrom = '#faf8f3',
  blendTo = '#faf8f3'
}: CelticLuxuryRibbonProps) {
  const uid = useId().replace(/:/g, '')
  const reduceMotion = useReducedMotion()

  const ribbonFloat = reduceMotion
    ? {}
    : {
        animate: { y: [0, -3, 0] },
        transition: { duration: 10, ease: MOTION_EASE, repeat: Infinity }
      }

  const goldShimmer = reduceMotion
    ? {}
    : {
        animate: { opacity: [0.55, 0.95, 0.6, 0.9, 0.55] },
        transition: { duration: 11, ease: 'easeInOut', repeat: Infinity }
      }

  const shamrockPulse = reduceMotion
    ? {}
    : {
        animate: { opacity: [0.86, 1, 0.92, 1] },
        transition: { duration: 9, ease: 'easeInOut', repeat: Infinity }
      }

  return (
    <m.div
      aria-hidden
      className={cx(
        'pointer-events-none relative z-40 w-full overflow-visible',
        'h-[clamp(5rem,11vw,7.5rem)] sm:h-[clamp(6.5rem,13vw,9rem)] md:h-[clamp(7.5rem,14vw,11.25rem)]',
        overlap && '-mt-[clamp(3.5rem,8vw,5.5rem)] sm:-mt-[clamp(4rem,9vw,6rem)] md:-mt-[clamp(4.5rem,10vw,6.5rem)]',
        'drop-shadow-[0_10px_32px_rgba(4,24,16,0.28)]',
        className
      )}
      {...ribbonFloat}
    >
      <RibbonSvg
        uid={uid}
        blendFrom={blendFrom}
        blendTo={blendTo}
        tone={tone}
        goldShimmer={goldShimmer}
        shamrockPulse={shamrockPulse}
      />
    </m.div>
  )
}
