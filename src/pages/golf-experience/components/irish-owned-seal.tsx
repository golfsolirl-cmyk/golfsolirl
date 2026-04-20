import { cx } from '../../../lib/utils'

interface IrishOwnedSealProps {
  readonly className?: string
  readonly size?: number
}

/**
 * Clean, premium circular brand seal for the "Why GolfSol Ireland" section.
 *
 * Replaces the old "Fully Bonded" badge — we are NOT a bonded operator.
 * This seal only states things we know to be true:
 *   • Irish owned
 *   • Costa del Sol focused
 *
 * Design language:
 *   • Single dark forest-green disc with one bold gold ring border.
 *   • Inner thin gold hairline ring with breathing room.
 *   • Two arched lines of caps text in gold (top + bottom, both upright).
 *   • Two small gold "fleur" dividers at 9 and 3 o'clock to separate
 *     the top and bottom arcs.
 *   • Centre: a single, geometric shamrock — three perfectly round leaves
 *     in bright green with a darker green outline and a small gold crown
 *     dot above. No competing flag/sun/text.
 *   • Generous negative space throughout. Premium wax-stamp feel rather
 *     than crowded medallion.
 */
export function IrishOwnedSeal({ className, size = 180 }: IrishOwnedSealProps) {
  return (
    <svg
      role="img"
      aria-label="GolfSol Ireland — Irish owned, Costa del Sol golf specialists"
      className={cx(className)}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Top arc — left→right across the upper half. Curve bulges UP and
            the text baseline rides along it reading upright. */}
        <path id="seal-arc-top" d="M 28 100 a 72 72 0 0 1 144 0" fill="none" />
        {/* Bottom arc — left→right across the LOWER half (sweep=0 so the
            arc bulges DOWN). Path direction at the bottom is left→right,
            which means text characters stand upright above the curve. */}
        <path id="seal-arc-bottom" d="M 28 100 a 72 72 0 0 0 144 0" fill="none" />

        {/* Gold gradient — soft top-down */}
        <linearGradient id="seal-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE27A" />
          <stop offset="55%" stopColor="#FFC72C" />
          <stop offset="100%" stopColor="#D89A00" />
        </linearGradient>

        {/* Shamrock leaf gradient — bright top, deeper at base */}
        <radialGradient id="seal-leaf" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#34E37A" />
          <stop offset="100%" stopColor="#0F8A48" />
        </radialGradient>
      </defs>

      {/* Outer disc */}
      <circle cx="100" cy="100" r="96" fill="#063B2A" />

      {/* Bold gold ring border */}
      <circle
        cx="100"
        cy="100"
        r="92"
        fill="none"
        stroke="url(#seal-gold)"
        strokeWidth="3.5"
      />

      {/* Inner hairline ring (gives the band of arched text room to breathe) */}
      <circle
        cx="100"
        cy="100"
        r="78"
        fill="none"
        stroke="url(#seal-gold)"
        strokeWidth="0.9"
        opacity="0.55"
      />

      {/* Top arched text */}
      <text
        fill="url(#seal-gold)"
        fontFamily="Oswald, 'Open Sans', sans-serif"
        fontWeight="700"
        fontSize="13"
        letterSpacing="3.4"
      >
        <textPath href="#seal-arc-top" startOffset="50%" textAnchor="middle">
          IRISH OWNED
        </textPath>
      </text>

      {/* Bottom arched text */}
      <text
        fill="url(#seal-gold)"
        fontFamily="Oswald, 'Open Sans', sans-serif"
        fontWeight="700"
        fontSize="11.5"
        letterSpacing="3.2"
      >
        <textPath href="#seal-arc-bottom" startOffset="50%" textAnchor="middle">
          COSTA DEL SOL
        </textPath>
      </text>

      {/* Star dividers at 9 and 3 o'clock — small, evenly spaced */}
      <g fill="url(#seal-gold)">
        <circle cx="14" cy="100" r="2.4" />
        <circle cx="186" cy="100" r="2.4" />
        <circle cx="20" cy="100" r="1.2" opacity="0.7" />
        <circle cx="180" cy="100" r="1.2" opacity="0.7" />
      </g>

      {/* Centre shamrock — clean geometric three-leaf */}
      <g transform="translate(100 102)">
        {/* Optional small gold crown dot above (premium accent) */}
        <circle cx="0" cy="-44" r="2.2" fill="url(#seal-gold)" />

        {/* Three round leaves */}
        <g
          fill="url(#seal-leaf)"
          stroke="#0B6B45"
          strokeWidth="1.4"
          strokeLinejoin="round"
        >
          {/* Top */}
          <circle cx="0" cy="-15" r="14" />
          {/* Bottom-left */}
          <circle cx="-14" cy="6" r="14" />
          {/* Bottom-right */}
          <circle cx="14" cy="6" r="14" />
          {/* Tiny centre disc to make the three leaves feel fused */}
          <circle cx="0" cy="-2" r="6" />
        </g>

        {/* Soft highlights on each leaf for dimension */}
        <g fill="#A8F5C2" opacity="0.55">
          <ellipse cx="-4" cy="-19" rx="3" ry="1.6" />
          <ellipse cx="-18" cy="2" rx="3" ry="1.6" />
          <ellipse cx="11" cy="2" rx="3" ry="1.6" />
        </g>

        {/* Stem — short, clean curve */}
        <path
          d="M 0 14 Q 1 24 -3 32"
          stroke="#0B6B45"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  )
}
