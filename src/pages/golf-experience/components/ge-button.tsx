import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../../lib/utils'

type Variant = 'orange' | 'teal' | 'outline-teal' | 'outline-white' | 'ghost-white'
type Size = 'sm' | 'md' | 'lg'

interface CommonProps {
  readonly children: ReactNode
  readonly variant?: Variant
  readonly size?: Size
  readonly className?: string
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-[0.78rem]',
  md: 'px-6 py-3 text-[0.85rem]',
  lg: 'px-8 py-4 text-[0.95rem]'
}

const variants: Record<Variant, string> = {
  orange:
    'bg-ge-orange text-white hover:bg-ge-orange-hover shadow-[0_8px_22px_rgba(255,91,45,0.32)]',
  teal: 'bg-ge-teal text-white hover:bg-ge-teal-dark shadow-[0_8px_22px_rgba(0,124,105,0.28)]',
  'outline-teal':
    'border-2 border-ge-teal bg-transparent text-ge-teal hover:bg-ge-teal hover:text-white',
  'outline-white':
    'border-2 border-white bg-transparent text-white hover:bg-white hover:text-ge-teal',
  'ghost-white': 'bg-transparent text-white hover:text-ge-orange'
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-[2px] font-ge font-bold uppercase tracking-[0.14em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ge-orange focus-visible:ring-offset-2'

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
