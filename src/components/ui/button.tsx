import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { cx } from '../../lib/utils'

interface SharedButtonProps {
  readonly children: ReactNode
  readonly variant?: 'primary' | 'secondary' | 'outline' | 'white'
  readonly showArrow?: boolean
  readonly className?: string
}

type ButtonProps = SharedButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    readonly href?: never
  }

type LinkProps = SharedButtonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    readonly href: string
  }

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[0.98rem] font-semibold uppercase tracking-[0.08em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'

const variantClasses = {
  primary: 'bg-gold-500 text-white shadow-[0_12px_26px_rgba(217,119,6,0.24)] hover:-translate-y-0.5 hover:bg-gold-600',
  secondary: 'bg-forest-800 text-white shadow-soft hover:bg-forest-900',
  outline: 'border border-forest-300 bg-white text-forest-900 hover:border-gold-500 hover:text-gold-600',
  white: 'border border-forest-200 bg-white text-forest-900 shadow-sm hover:border-forest-300 hover:bg-forest-50'
} as const

function isLinkProps(props: ButtonProps | LinkProps): props is LinkProps {
  return typeof (props as LinkProps).href === 'string'
}

export function LuxuryButton(props: ButtonProps | LinkProps) {
  if (isLinkProps(props)) {
    const { children, variant = 'primary', showArrow = false, className, href, ...anchorProps } = props
    const classes = cx(baseClasses, variantClasses[variant], className)

    return (
      <a className={classes} href={href} {...anchorProps}>
        <span>{children}</span>
        {showArrow ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
      </a>
    )
  }

  const { children, variant = 'primary', showArrow = false, className, type, ...buttonProps } = props
  const classes = cx(baseClasses, variantClasses[variant], className)

  return (
    <button className={classes} type={type ?? 'button'} {...buttonProps}>
      <span>{children}</span>
      {showArrow ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
    </button>
  )
}
