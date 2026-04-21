import { MessageCircle } from 'lucide-react'
import { cx } from '../../../lib/utils'
import {
  buildSmartWhatsAppUrl,
  getSmartEnquiryMeta,
  type SmartEnquiryDetails,
  type SmartEnquiryIntent
} from '../data/smart-enquiry'
import { GeButton, type GeButtonSize, type GeButtonVariant } from './ge-button'

interface SmartEnquiryButtonProps extends SmartEnquiryDetails {
  readonly intent: SmartEnquiryIntent
  readonly sourceLabel?: string
  readonly label?: string
  readonly helperText?: string
  readonly showHelperText?: boolean
  readonly variant?: GeButtonVariant
  readonly size?: GeButtonSize
  readonly className?: string
  readonly containerClassName?: string
}

export function SmartEnquiryButton({
  intent,
  sourceLabel,
  label,
  helperText,
  showHelperText = false,
  variant = 'outline-gs-green',
  size = 'md',
  className,
  containerClassName,
  ...details
}: SmartEnquiryButtonProps) {
  const meta = getSmartEnquiryMeta(intent)
  const href = buildSmartWhatsAppUrl({
    intent,
    sourceLabel,
    ...details
  })

  return (
    <div className={cx('space-y-2', containerClassName)}>
      <GeButton
        href={href}
        target="_blank"
        rel="noreferrer"
        variant={variant}
        size={size}
        className={className}
        aria-label={`Open WhatsApp with a prefilled ${meta.title.toLowerCase()} enquiry`}
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        {label ?? meta.whatsappLabel}
      </GeButton>
      {showHelperText ? (
        <p className="font-ge text-sm leading-6 text-ge-gray500">{helperText ?? meta.helperText}</p>
      ) : null}
    </div>
  )
}
