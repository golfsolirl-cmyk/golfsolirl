import type { SVGProps } from 'react'
import { getTripadvisorListingHref } from '../lib/tripadvisor'

type IconProps = SVGProps<SVGSVGElement>

/** Tripadvisor owl mark — brand accent #34E0A1, no rating claim. */
export function TripadvisorOwlMark({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <circle cx="16" cy="16" r="15" fill="#34E0A1" />
      <ellipse cx="11.2" cy="14" rx="4.2" ry="5" fill="#fff" />
      <ellipse cx="20.8" cy="14" rx="4.2" ry="5" fill="#fff" />
      <ellipse cx="11.2" cy="14" rx="2" ry="2.4" fill="#000a12" />
      <ellipse cx="20.8" cy="14" rx="2" ry="2.4" fill="#000a12" />
      <path
        d="M10.5 22.2c1.6 1.4 3.4 2.1 5.5 2.1s3.9-.7 5.5-2.1"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

type TripadvisorFindUsBadgeProps = {
  className?: string
  tone?: 'dark' | 'light'
}

/**
 * Subtle “Find us on Tripadvisor” badge — static link only (no third-party widgets).
 */
export function TripadvisorFindUsBadge({ className = '', tone = 'dark' }: TripadvisorFindUsBadgeProps) {
  const href = getTripadvisorListingHref()
  const isDark = tone === 'dark'

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Find us on Tripadvisor"
      className={[
        'group inline-flex items-center gap-2.5 rounded-full border px-3.5 py-2 transition-colors',
        isDark
          ? 'border-white/25 bg-white/10 text-white hover:border-[#34E0A1]/70 hover:bg-white/15'
          : 'border-forest-200 bg-white text-forest-950 hover:border-[#34E0A1] hover:bg-[#f4fdf9]',
        className
      ].join(' ')}
    >
      <TripadvisorOwlMark className="h-7 w-7 shrink-0" />
      <span className="flex flex-col items-start leading-tight">
        <span
          className={[
            'font-ge text-[0.65rem] font-bold uppercase tracking-[0.14em]',
            isDark ? 'text-white/70' : 'text-forest-600'
          ].join(' ')}
        >
          Find us on
        </span>
        <span
          className={[
            'font-ge text-[0.92rem] font-extrabold tracking-tight',
            isDark ? 'text-white group-hover:text-[#34E0A1]' : 'text-[#000a12]'
          ].join(' ')}
        >
          Tripadvisor
        </span>
      </span>
    </a>
  )
}
