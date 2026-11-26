import { cx } from '../lib/utils'

export const IRELAND_PAYMENTS_TRUST = 'All payments handled in Ireland'

type IrelandPaymentsTrustProps = {
  readonly tone?: 'light' | 'dark' | 'muted'
  readonly className?: string
  readonly as?: 'p' | 'span'
}

/** Short, high-contrast trust line — keep copy identical everywhere. */
export function IrelandPaymentsTrust({
  tone = 'light',
  className,
  as: Tag = 'p'
}: IrelandPaymentsTrustProps) {
  return (
    <Tag
      className={cx(
        'font-ge text-[0.82rem] font-semibold tracking-[0.04em]',
        tone === 'dark' && 'text-[#f4dfa6]',
        tone === 'light' && 'text-forest-900',
        tone === 'muted' && 'text-forest-700',
        className
      )}
    >
      {IRELAND_PAYMENTS_TRUST}
    </Tag>
  )
}
