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
  sm: 'min-h-[44px] px-5 py-2.5 text-base',
  md: 'min-h-[48px] px-6 py-3 text-base sm:text-[1rem]',
  lg: 'min-h-[56px] px-8 py-4 text-lg sm:text-[1.0625rem]'
}

const variants: Record<Variant, string> = {
  blue: 'gsol-cta-primary',
  orange: 'gsol-cta-primary',
  teal: 'gsol-cta-primary',
  'outline-teal': 'gsol-cta-secondary',
  'outline-blue': 'gsol-cta-secondary',
  'outline-white':
    'border-2 border-white/80 bg-transparent text-white hover:bg-white/10 hover:border-brand-500/60',
  'ghost-white': 'bg-transparent text-white hover:text-chrome-200',
  'gs-green': 'gsol-cta-primary',
  'gs-gold': 'gsol-cta-primary',
  'gs-electric': 'gsol-cta-secondary',
  'outline-gs-white':
    'border-2 border-white/80 bg-transparent text-white hover:bg-white/10 hover:border-brand-500/60',
  'outline-gs-green': 'gsol-cta-secondary',
  ink: 'gsol-cta-primary',
  'outline-ink': 'gsol-cta-secondary'
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-md font-ge font-bold uppercase tracking-[0.14em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fairway-400 focus-visible:ring-offset-2'

interface GeButtonAnchorProps extends CommonProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> {
  readonly href: string
}

interface GeButtonButtonProps extends CommonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {
  readonly href?: undefined
}

export function GeButton(props: GeButtonAnchorProps | GeButtonButtonProps) {
  const { children, variant = 'gs-green', size = 'md', className, ...rest } = props
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
