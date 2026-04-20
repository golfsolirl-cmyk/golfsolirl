import { cx } from '../../../lib/utils'

interface IrishOwnedSealProps {
  readonly className?: string
  readonly size?: number
}

/**
 * Circular brand seal used in the "Why GolfSol Ireland" section.
 *
 * IMPORTANT: this replaces the previous "Fully Bonded Tour Operator" badge —
 * we are NOT a bonded operator and must never imply that. This seal only
 * states things we know to be true:
 *   • Irish owned
 *   • Costa del Sol focused
 *   • Plane → Fairway 24/7 care
 *
 * Visual: dark forest-green disc with two concentric gold rings, arched
 * copy top + bottom in gold caps, a small gold star divider, and a centre
 * emblem of a shamrock layered behind a golf flag with sun rays — ties
 * directly into the gold + green brand palette.
 */
export function IrishOwnedSeal({ className, size = 180 }: IrishOwnedSealProps) {
  return (
    <svg
      role="img"
      aria-label="Irish owned · Costa del Sol golf specialists · Plane to fairway 24/7 care"
      className={cx(className)}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Arched text paths */}
        <path id="seal-arc-top" d="M 22 100 a 78 78 0 0 1 156 0" fill="none" />
        {/* Bottom arc: traced RIGHT→LEFT along the bottom so the textPath
            baseline rests on the inside of the curve and the letters sit
            upright (rather than upside-down on the outside). */}
        <path id="seal-arc-bottom" d="M 172 100 a 72 72 0 0 1 -144 0" fill="none" />

        {/* Gold gradient */}
        <linearGradient id="seal-gold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE27A" />
          <stop offset="50%" stopColor="#FFC72C" />
          <stop offset="100%" stopColor="#E2A300" />
        </linearGradient>

        {/* Sunburst */}
        <radialGradient id="seal-sun" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#FFE27A" stopOpacity="0.65" />
          <stop offset="60%" stopColor="#FFC72C" stopOpacity="0.0" />
        </radialGradient>

        <filter id="seal-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>

      {/* Outer dark disc */}
      <circle cx="100" cy="100" r="96" fill="#063B2A" />

      {/* Outer gold ring */}
      <circle
        cx="100"
        cy="100"
        r="93"
        fill="none"
        stroke="url(#seal-gold)"
        strokeWidth="3"
      />

      {/* Inner gold hairline ring */}
      <circle
        cx="100"
        cy="100"
        r="84"
        fill="none"
        stroke="url(#seal-gold)"
        strokeWidth="1.2"
        opacity="0.85"
      />

      {/* Soft sunburst behind centre emblem */}
      <circle cx="100" cy="92" r="55" fill="url(#seal-sun)" />

      {/* Top arched text */}
      <text
        fill="url(#seal-gold)"
        fontFamily="Oswald, Open Sans, sans-serif"
        fontWeight="700"
        fontSize="11"
        letterSpacing="3"
      >
        <textPath href="#seal-arc-top" startOffset="50%" textAnchor="middle">
          IRISH OWNED · COSTA DEL SOL
        </textPath>
      </text>

      {/* Bottom arched text (path is rotated 180°, so text reads correctly) */}
      <text
        fill="url(#seal-gold)"
        fontFamily="Oswald, Open Sans, sans-serif"
        fontWeight="700"
        fontSize="9.5"
        letterSpacing="2.6"
      >
        <textPath href="#seal-arc-bottom" startOffset="50%" textAnchor="middle">
          PLANE TO FAIRWAY · 24/7 CARE
        </textPath>
      </text>

      {/* Star dividers between top/bottom arcs */}
      <g fill="url(#seal-gold)">
        <polygon points="14,100 19,97 18,103" />
        <polygon points="186,100 181,97 182,103" />
      </g>

      {/* Centre emblem — golf flag pole rising behind a clean shamrock */}
      <g transform="translate(100 100)">
        {/* Golf flag pole + pennant (drawn FIRST so the shamrock sits in front) */}
        <g>
          <line
            x1="0"
            y1="-44"
            x2="0"
            y2="32"
            stroke="url(#seal-gold)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M 0 -44 L 22 -38 L 0 -30 Z"
            fill="url(#seal-gold)"
            stroke="#E2A300"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          {/* Tee disc / hole at base */}
          <ellipse cx="0" cy="34" rx="14" ry="3" fill="#0B6B45" opacity="0.7" />
        </g>

        {/* Shamrock — three round leaves + stem */}
        <g
          fill="#1ED760"
          stroke="#0B6B45"
          strokeWidth="1.3"
          strokeLinejoin="round"
          filter="url(#seal-soft)"
        >
          {/* Top leaf */}
          <circle cx="0" cy="-12" r="11" />
          {/* Left leaf */}
          <circle cx="-11" cy="4" r="11" />
          {/* Right leaf */}
          <circle cx="11" cy="4" r="11" />
          {/* Centre disc to fuse the three leaves cleanly */}
          <circle cx="0" cy="-2" r="5.5" />
          {/* Subtle leaf highlights */}
          <ellipse cx="-3" cy="-15" rx="2.6" ry="1.4" fill="#7CF59E" stroke="none" opacity="0.85" />
          <ellipse cx="-14" cy="0" rx="2.6" ry="1.4" fill="#7CF59E" stroke="none" opacity="0.85" />
          <ellipse cx="8" cy="0" rx="2.6" ry="1.4" fill="#7CF59E" stroke="none" opacity="0.85" />
        </g>
        {/* Stem */}
        <path
          d="M 0 8 Q 2 18 -3 28"
          stroke="#0B6B45"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* Tiny gold caption block under emblem */}
      <g transform="translate(100 162)">
        <rect x="-32" y="-8" width="64" height="16" rx="3" fill="#0B6B45" stroke="url(#seal-gold)" strokeWidth="0.8" />
        <text
          textAnchor="middle"
          y="3"
          fill="url(#seal-gold)"
          fontFamily="Oswald, Open Sans, sans-serif"
          fontWeight="800"
          fontSize="8"
          letterSpacing="2.2"
        >
          EST. 2025
        </text>
      </g>
    </svg>
  )
}
