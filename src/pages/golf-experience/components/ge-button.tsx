import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../../lib/utils'

type Variant =
  | 'blue'
  | 'orange'
  | 'teal'
  | 'outline-teal'
  | 'outline-blue'
  | 'outline-white'
  | 'ghost-white'
  // GolfSol sport-energy palette variants (clone home /)
  | 'gs-green'
  | 'gs-gold'
  | 'gs-electric'
  | 'outline-gs-white'
  | 'outline-gs-green'
  /** Neutral editorial CTAs */
  | 'ink'
  | 'outline-ink'
type Size = 'sm' | 'md' | 'lg'

interface CommonProps {
  readonly children: ReactNode
  readonly variant?: Variant
  readonly size?: Size
  readonly className?: string
}

// Touch-friendly sizing: all sizes meet the 44x44 minimum touch target on
// mobile. Mobile button text is at least 16px / 0.95rem; sm:+ tightens
// for desktop density without sacrificing legibility.
const sizes: Record<Size, string> = {
  sm: 'min-h-[44px] px-5 py-2 text-base sm:text-[0.85rem]',
  md: 'min-h-[48px] px-6 py-3 text-base sm:text-[0.9rem]',
  lg: 'min-h-[56px] px-8 py-4 text-lg sm:text-[1rem]'
}

const variants: Record<Variant, string> = {
  // Legacy "blue" variant repointed to GolfSol gold so any unmigrated
  // call-sites pick up the brand palette automatically — no blue ever.
  blue: 'bg-gradient-to-br from-gs-gold to-gs-gold-light text-gs-dark hover:shadow-gs-gold-hover shadow-gs-gold',
  orange: 'bg-ge-orange text-white hover:bg-ge-orange-hover shadow-[0_8px_22px_rgba(255,91,45,0.32)]',
  // Legacy "teal" repointed to GolfSol green
  teal: 'bg-gs-green text-white hover:bg-gs-electric hover:text-gs-dark shadow-gs-green',
  'outline-teal':
    'border-2 border-gs-green bg-transparent text-gs-green hover:bg-gs-green hover:text-white',
  'outline-blue':
    'border-2 border-ge-orange bg-transparent text-ge-orange hover:bg-ge-orange hover:text-white',
  'outline-white':
    'border-2 border-white bg-transparent text-white hover:bg-gs-gold hover:text-gs-dark hover:border-gs-gold',
  'ghost-white': 'bg-transparent text-white hover:text-gs-gold',
  // === GolfSol sport-energy palette ===
  // Primary CTA — fresh sport green, lifts to electric green on hover
  'gs-green':
    'bg-gs-green text-white hover:bg-gs-electric hover:text-gs-dark shadow-gs-green',
  // Loud secondary — gold gradient
  'gs-gold':
    'bg-gs-gold bg-gradient-to-br from-gs-gold to-gs-gold-light text-gs-dark hover:shadow-gs-gold-hover shadow-gs-gold',
  // Energy pop — bright electric on dark surfaces
  'gs-electric':
    'bg-gs-electric text-gs-dark hover:bg-gs-gold hover:text-gs-dark shadow-gs-green',
  // Outline on dark hero
  'outline-gs-white':
    'border-2 border-white bg-transparent text-white hover:bg-gs-gold hover:text-gs-dark hover:border-gs-gold',
  'outline-gs-green':
    'border-2 border-gs-green bg-transparent text-gs-green hover:bg-gs-green hover:text-white',
  ink: 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-sm',
  'outline-ink':
    'border-2 border-neutral-900 bg-transparent text-neutral-900 hover:bg-neutral-900 hover:text-white'
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-md font-ge font-bold uppercase tracking-[0.14em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gs-electric focus-visible:ring-offset-2'

interface GeButtonAnchorProps extends CommonProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> {
  readonly href: string
}

interface GeButtonButtonProps extends CommonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {
  readonly href?: undefined
}

export function GeButton(props: GeButtonAnchorProps | GeButtonButtonProps) {
  const { children, variant = 'orange', size = 'md', className, ...rest } = props
  const classes = cx(baseClasses, sizes[size], variants[variant], className)

  if ('href' in rest && rest.href) {
    const { href, ...anchorRest } = rest as GeButtonAnchorProps
    return (
      <a href={href} className={classes} {...anchorRest}>
        {children}
      </a>
    )
  }

  const { href: _ignored, type: buttonType = 'button', ...buttonRest } = rest as GeButtonButtonProps & {
    href?: string
  }
  return (
    <button type={buttonType} className={classes} {...buttonRest}>
      {children}
    </button>
  )
}
