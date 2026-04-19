import { cx } from '../../../lib/utils'

interface BondedBadgeProps {
  readonly className?: string
  readonly size?: number
}

/**
 * Generic "Fully Bonded Tour Operator" badge. Replaces the IAGTO logo on the
 * source site so we make no false accreditation claim.
 */
export function BondedBadge({ className, size = 110 }: BondedBadgeProps) {
  return (
    <svg
      aria-hidden="true"
      className={cx(className)}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <path id="bonded-curve-top" d="M 12 60 a 48 48 0 0 1 96 0" fill="none" />
        <path id="bonded-curve-bottom" d="M 14 64 a 46 46 0 0 0 92 0" fill="none" />
      </defs>
      <circle cx="60" cy="60" r="56" fill="#ffffff" stroke="#007C69" strokeWidth="3" />
      <circle cx="60" cy="60" r="46" fill="none" stroke="#007C69" strokeWidth="1" strokeDasharray="2 3" />
      {/* Wreath leaves */}
      <g fill="#007C69" opacity="0.9">
        <ellipse cx="22" cy="60" rx="3" ry="7" transform="rotate(-30 22 60)" />
        <ellipse cx="98" cy="60" rx="3" ry="7" transform="rotate(30 98 60)" />
        <ellipse cx="28" cy="42" rx="3" ry="7" transform="rotate(-60 28 42)" />
        <ellipse cx="92" cy="42" rx="3" ry="7" transform="rotate(60 92 42)" />
        <ellipse cx="28" cy="78" rx="3" ry="7" transform="rotate(-120 28 78)" />
        <ellipse cx="92" cy="78" rx="3" ry="7" transform="rotate(120 92 78)" />
      </g>
      {/* Center mark */}
      <g transform="translate(60 62)">
        <circle r="20" fill="#007C69" />
        <text
          textAnchor="middle"
          y="-3"
          fill="#ffffff"
          fontFamily="Open Sans, sans-serif"
          fontWeight="800"
          fontSize="9"
          letterSpacing="1"
        >
          FULLY
        </text>
        <text
          textAnchor="middle"
          y="9"
          fill="#ffffff"
          fontFamily="Open Sans, sans-serif"
          fontWeight="800"
          fontSize="9"
          letterSpacing="1"
        >
          BONDED
        </text>
      </g>
      {/* Top arc text */}
      <text fontFamily="Open Sans, sans-serif" fontWeight="700" fontSize="9" fill="#007C69" letterSpacing="2">
        <textPath href="#bonded-curve-top" startOffset="50%" textAnchor="middle">
          TOUR OPERATOR
        </textPath>
      </text>
      {/* Bottom arc text */}
      <text fontFamily="Open Sans, sans-serif" fontWeight="700" fontSize="8" fill="#007C69" letterSpacing="2">
        <textPath href="#bonded-curve-bottom" startOffset="50%" textAnchor="middle">
          INSURED · LICENSED
        </textPath>
      </text>
    </svg>
  )
}
