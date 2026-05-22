import { cx } from '../../../lib/utils'

type GeTermsAcceptanceFieldProps = {
  readonly checked: boolean
  readonly onChange: (checked: boolean) => void
  readonly id?: string
  readonly className?: string
  readonly tone?: 'light' | 'dark'
}

export function GeTermsAcceptanceField({
  checked,
  onChange,
  id = 'ge-terms-acceptance',
  className,
  tone = 'light'
}: GeTermsAcceptanceFieldProps) {
  const isDark = tone === 'dark'

  return (
    <label
      htmlFor={id}
      className={cx(
        'flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 font-ge text-[0.98rem] leading-relaxed sm:text-[1rem]',
        isDark
          ? 'border-white/15 bg-white/[0.06] text-white/92'
          : 'border-ge-gray200 bg-ge-gray50/80 text-gs-dark',
        className
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required
        className={cx(
          'mt-0.5 h-4 w-4 shrink-0 rounded border focus:ring-2',
          isDark
            ? 'border-white/40 bg-forest-950 text-brand-600 focus:ring-brand-500/40'
            : 'border-ge-gray300 text-gs-green focus:ring-gs-green/25'
        )}
      />
      <span>
        I agree to the{' '}
        <a
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className={cx(
            'font-bold underline underline-offset-2',
            isDark ? 'text-[#f4dfa6] hover:text-white' : 'text-gs-green hover:text-brand-800'
          )}
        >
          terms and conditions
        </a>{' '}
        for Golf Sol Ireland bookings.
      </span>
    </label>
  )
}
