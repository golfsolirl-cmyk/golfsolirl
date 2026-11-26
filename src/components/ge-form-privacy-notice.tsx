import { PRIVACY_POLICY_PATH } from '../lib/cookie-consent'
import { cx } from '../lib/utils'

type GeFormPrivacyNoticeProps = {
  readonly className?: string
  readonly tone?: 'light' | 'dark'
  /** Short purpose line — defaults to enquiry / quote wording. */
  readonly purpose?: string
}

const DEFAULT_PURPOSE =
  'We use your details to respond to this request and arrange your trip. We do not sell your data or send spam.'

/**
 * Concise GDPR Art. 13 notice for public forms — place near the submit button.
 */
export function GeFormPrivacyNotice({
  className,
  tone = 'light',
  purpose = DEFAULT_PURPOSE
}: GeFormPrivacyNoticeProps) {
  const isDark = tone === 'dark'
  return (
    <p
      className={cx(
        'font-ge text-[0.88rem] leading-relaxed sm:text-[0.92rem]',
        isDark ? 'text-white/75' : 'text-ge-gray500',
        className
      )}
    >
      {purpose}{' '}
      <a
        href={PRIVACY_POLICY_PATH}
        target="_blank"
        rel="noopener noreferrer"
        className={cx(
          'font-semibold underline underline-offset-2',
          isDark ? 'text-[#f4dfa6] hover:text-white' : 'text-gs-green hover:text-brand-800'
        )}
      >
        Privacy policy
      </a>
      .
    </p>
  )
}
