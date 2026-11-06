import { useEffect, useState } from 'react'
import { Lock, LockOpen } from 'lucide-react'
import { maskEmail, maskPhone } from '../lib/mask-contact'
import { cx } from '../lib/utils'

const REVEAL_MS = 20_000

export function LockedContactValue(props: {
  readonly value: string
  readonly kind: 'email' | 'phone'
  readonly tone: 'onDark' | 'onLight'
  readonly size?: 'md' | 'lg'
}) {
  const [open, setOpen] = useState(false)
  const full = props.value.trim()
  const masked = props.kind === 'email' ? maskEmail(full) : maskPhone(full)
  const shown = open ? full : masked
  const label = props.kind === 'email' ? 'email' : 'phone number'

  useEffect(() => {
    if (!open) {
      return
    }
    const timer = window.setTimeout(() => setOpen(false), REVEAL_MS)
    return () => window.clearTimeout(timer)
  }, [open])

  if (!full) {
    return null
  }

  const onDark = props.tone === 'onDark'
  const large = props.size === 'lg'

  return (
    <div className="mt-4">
      <p
        className={cx(
          'break-all font-semibold leading-snug',
          large ? 'font-ge text-2xl tracking-tight sm:text-3xl' : 'font-ge text-base',
          onDark ? 'text-white' : 'text-forest-950'
        )}
      >
        {shown}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={cx(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-ge text-xs font-bold uppercase tracking-[0.12em]',
            onDark ? 'bg-white/12 text-emerald-100 ring-1 ring-white/25' : 'bg-forest-950 text-white'
          )}
        >
          {open ? <LockOpen className="h-3.5 w-3.5" aria-hidden /> : <Lock className="h-3.5 w-3.5" aria-hidden />}
          {open ? 'Visible for a moment' : 'Locked'}
        </span>
        <button
          aria-pressed={open}
          className={cx(
            'inline-flex min-h-11 items-center rounded-xl px-3 py-2 font-ge text-sm font-bold',
            onDark
              ? 'border border-white/35 bg-white/10 text-white hover:bg-white/20'
              : 'border border-forest-300 bg-white text-forest-950 hover:bg-offwhite'
          )}
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          {open ? `Hide ${label}` : `Show ${label}`}
        </button>
      </div>
    </div>
  )
}
