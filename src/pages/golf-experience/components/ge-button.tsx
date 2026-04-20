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
  // New sport-energy design system variants
  | 'sport'
  | 'gold'
  | 'outline-sport'
type Size = 'sm' | 'md' | 'lg'

interface CommonProps {
  readonly children: ReactNode
  readonly variant?: Variant
  readonly size?: Size
  readonly className?: string
}

// Touch-friendly sizing: md/lg meet the 44x44 minimum touch target on mobile.
const sizes: Record<Size, string> = {
  sm: 'min-h-[40px] px-5 py-2 text-[0.8rem]',
  md: 'min-h-[44px] px-6 py-3 text-[0.85rem]',
  lg: 'min-h-[52px] px-8 py-4 text-[0.95rem]'
}

const variants: Record<Variant, string> = {
  blue: 'bg-ge-blue text-white hover:bg-[#1f7fc6] shadow-[0_8px_22px_rgba(38,146,224,0.32)]',
  orange: 'bg-ge-orange text-white hover:bg-ge-orange-hover shadow-[0_8px_22px_rgba(255,91,45,0.32)]',
  teal: 'bg-ge-teal text-white hover:bg-ge-teal-dark shadow-[0_8px_22px_rgba(0,124,105,0.28)]',
  'outline-teal':
    'border-2 border-ge-teal bg-transparent text-ge-teal hover:bg-ge-teal hover:text-white',
  'outline-blue':
    'border-2 border-ge-blue bg-transparent text-ge-blue hover:bg-ge-blue hover:text-white',
  'outline-white':
    'border-2 border-white bg-transparent text-white hover:bg-white hover:text-ge-blue',
  'ghost-white': 'bg-transparent text-white hover:text-ge-orange',
  // Primary action — sport green, lifts to brighter primary-accent on hover
  sport:
    'bg-primary text-white hover:bg-primary-accent hover:text-primary-dark shadow-soft hover:shadow-medium',
  // Loud secondary — gold gradient, big presence
  gold:
    'bg-gold-gradient text-primary-dark hover:shadow-gold-hover shadow-gold',
  'outline-sport':
    'border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary'
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-md font-heading font-semibold uppercase tracking-[0.14em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2'

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

  const { href: _ignored, ...buttonRest } = rest as GeButtonButtonProps & { href?: string }
  return (
    <button type="button" className={classes} {...buttonRest}>
      {children}
    </button>
  )
}
