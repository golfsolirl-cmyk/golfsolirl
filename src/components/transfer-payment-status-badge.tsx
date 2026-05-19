import { BadgeCheck, Clock, Wallet } from 'lucide-react'
import {
  resolveTransferPaymentBadgeStatus,
  transferPaymentBadgeLabel,
  type TransferPaymentBadgeStatus
} from '../lib/transfer-payment-breakdown'
import { cx } from '../lib/utils'

const BADGE_STYLES: Record<
  TransferPaymentBadgeStatus,
  { readonly pill: string; readonly icon: string }
> = {
  unpaid: {
    pill: 'border-forest-200/90 bg-forest-50 text-forest-800 ring-1 ring-forest-100/80',
    icon: 'text-forest-600'
  },
  deposit_paid: {
    pill: 'border-brand-500/55 bg-brand-50 text-brand-950 ring-1 ring-brand-300/40',
    icon: 'text-brand-800'
  },
  paid_in_full: {
    pill: 'border-fairway-500/55 bg-fairway-50 text-forest-950 ring-1 ring-fairway-300/45',
    icon: 'text-fairway-800'
  }
}

const BADGE_STYLES_ON_DARK: Record<TransferPaymentBadgeStatus, { readonly pill: string; readonly icon: string }> = {
  unpaid: {
    pill: 'border-white/20 bg-white/10 text-emerald-100/95 ring-1 ring-white/10',
    icon: 'text-emerald-200/90'
  },
  deposit_paid: {
    pill: 'border-brand-300/50 bg-brand-400/20 text-brand-100 ring-1 ring-brand-300/30',
    icon: 'text-brand-200'
  },
  paid_in_full: {
    pill: 'border-emerald-300/55 bg-fairway-500/25 text-fairway-50 ring-1 ring-emerald-400/35',
    icon: 'text-emerald-100'
  }
}

function StatusIcon({ status, className }: { readonly status: TransferPaymentBadgeStatus; readonly className?: string }) {
  const props = { className: cx('h-3.5 w-3.5 shrink-0', className), 'aria-hidden': true as const }
  if (status === 'paid_in_full') {
    return <BadgeCheck {...props} />
  }
  if (status === 'deposit_paid') {
    return <Wallet {...props} />
  }
  return <Clock {...props} />
}

export function TransferPaymentStatusBadge(props: {
  readonly payment_status?: string | null
  readonly deposit_percent?: number | null
  /** `onDark` for forest-green hero panels; default for white cards */
  readonly tone?: 'default' | 'onDark'
  readonly size?: 'sm' | 'md'
  readonly className?: string
  /** Hide badge when still unpaid (client list rows may prefer no pill until paid) */
  readonly hideWhenUnpaid?: boolean
}) {
  const status = resolveTransferPaymentBadgeStatus(props)
  if (props.hideWhenUnpaid && status === 'unpaid') {
    return null
  }

  const label = transferPaymentBadgeLabel(props)
  const styles = props.tone === 'onDark' ? BADGE_STYLES_ON_DARK[status] : BADGE_STYLES[status]
  const size = props.size ?? 'md'

  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border font-ge font-extrabold uppercase tracking-[0.1em]',
        size === 'sm' ? 'px-2 py-0.5 text-[0.62rem]' : 'px-2.5 py-1 text-xs',
        styles.pill,
        props.className
      )}
      title={label}
    >
      <StatusIcon className={styles.icon} status={status} />
      {label}
    </span>
  )
}
