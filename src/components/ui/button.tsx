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
  'inline-flex items-center justify-center gap-2 rounded-[var(--button-radius)] px-[var(--button-padding-x)] py-[var(--button-padding-y)] text-[1.02rem] font-semibold tracking-[0.015em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'

const variantClasses = {
  primary:
    'bg-[linear-gradient(135deg,rgb(var(--color-gold-500)),rgb(var(--color-gold-400)))] text-white shadow-[var(--button-shadow)] hover:-translate-y-0.5 hover:brightness-105',
  secondary:
    'bg-[linear-gradient(135deg,rgb(var(--color-fairway-600)),rgb(var(--color-fairway-500)))] text-white shadow-[var(--button-shadow)] hover:-translate-y-0.5 hover:brightness-105',
  outline:
    'border border-white/55 bg-[#5a2e20] text-white hover:bg-[#7a3f26] hover:border-white/70 shadow-[0_10px_24px_rgba(58,29,22,0.22)]',
  white:
    'border border-forest-100 bg-white text-forest-900 shadow-[0_10px_24px_rgba(58,29,22,0.14)] hover:bg-forest-50 hover:-translate-y-0.5'
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
