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
  'inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-[1.02rem] font-semibold tracking-[0.015em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gs-gold focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'

const variantClasses = {
  primary:
    'bg-gradient-to-br from-gs-gold to-gs-gold-light text-gs-dark shadow-gs-gold hover:-translate-y-0.5 hover:shadow-gs-gold-hover',
  secondary: 'bg-gs-green text-white shadow-gs-green hover:bg-gs-electric hover:text-gs-dark',
  outline: 'border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:border-gs-gold/50',
  white: 'border border-gs-dark/10 bg-white text-gs-dark shadow-[0_10px_28px_rgba(6,59,42,0.08)] hover:bg-gs-bg'
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
