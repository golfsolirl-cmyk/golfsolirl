import {
  PORTAL_ADD_ON_ICON_STROKE,
  portalAddOnPremiumIcon,
  portalAddOnPremiumTileClass
} from '../lib/portal-add-on-premium-icons'
import type { PortalInterestCategory } from '../lib/portal-interest-tickets'
import { cx } from '../lib/utils'

/** Branded transfers / golf / hotels tile used on client & admin dashboards (portal interest). */
export function PortalInterestCategoryGlyph(props: {
  readonly category: PortalInterestCategory
  readonly size: 'md' | 'sm'
}) {
  const Icon = portalAddOnPremiumIcon(props.category)
  const sm = props.size === 'sm'
  return (
    <span
      className={cx(
        'flex shrink-0 items-center justify-center rounded-xl',
        portalAddOnPremiumTileClass(props.category),
        sm ? 'h-7 w-7 rounded-lg' : 'h-10 w-10'
      )}
    >
      <Icon
        aria-hidden
        className={cx('text-white', sm ? 'h-3.5 w-3.5' : 'h-4 w-4')}
        strokeWidth={sm ? 2 : PORTAL_ADD_ON_ICON_STROKE}
      />
    </span>
  )
}
