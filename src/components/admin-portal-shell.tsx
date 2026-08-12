import { Bell, Menu } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { AdminSidebar, ADMIN_SIDEBAR_ITEMS, type AdminPortalSectionId } from './admin-sidebar'
import { PortalBottomNav } from './portal-bottom-nav'
import { ADMIN_MOBILE_TAB_ITEMS } from '../lib/portal-mobile-nav'
import { cx } from '../lib/utils'

export type { AdminPortalSectionId }

type AdminPortalShellProps = {
  readonly activeSection: AdminPortalSectionId
  readonly onSectionChange: (id: AdminPortalSectionId) => void
  readonly children: ReactNode
  /** Client trip builds waiting for a price (Packages bell). */
  readonly packagesNeedsReviewCount?: number
}

export function AdminPortalShell({
  activeSection,
  onSectionChange,
  children,
  packagesNeedsReviewCount = 0
}: AdminPortalShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const activeLabel = ADMIN_SIDEBAR_ITEMS.find((i) => i.id === activeSection)?.label ?? 'Section'
  const needsReview = packagesNeedsReviewCount > 0

  return (
    <div className="portal-ui-root flex min-h-[min(70vh,900px)] gap-5 pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:gap-10 lg:pb-0">
      <AdminSidebar
        activeSection={activeSection}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
        onSectionChange={onSectionChange}
        packagesNeedsReviewCount={packagesNeedsReviewCount}
      />

      <div className="min-w-0 flex-1 lg:pl-1">
        <div className="sticky top-0 z-30 mb-4 flex items-center gap-3 border-b border-forest-200 bg-white px-1 py-3">
          <button
            aria-expanded={mobileNavOpen}
            className={cx(
              'inline-flex h-12 w-12 items-center justify-center rounded-xl border border-forest-200/90 bg-white lg:hidden',
              'text-forest-800 shadow-sm'
            )}
            onClick={() => setMobileNavOpen((o) => !o)}
            type="button"
          >
            <Menu aria-hidden className="h-5 w-5" />
          </button>
          <p className="min-w-0 flex-1 truncate text-base font-semibold text-forest-950 lg:pl-1">{activeLabel}</p>
          <button
            aria-label={
              needsReview
                ? `${packagesNeedsReviewCount} client trip builds need a price`
                : 'No new client trip builds'
            }
            className={cx(
              'relative inline-flex h-11 w-11 items-center justify-center rounded-xl border shadow-sm transition',
              needsReview
                ? 'border-brand-300 bg-brand-50 text-brand-800'
                : 'border-forest-200 bg-white text-forest-600'
            )}
            onClick={() => onSectionChange('packages')}
            title="Client package builds"
            type="button"
          >
            <Bell aria-hidden className="h-5 w-5" />
            {needsReview ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                {packagesNeedsReviewCount > 9 ? '9+' : packagesNeedsReviewCount}
              </span>
            ) : null}
          </button>
        </div>

        <div className="min-w-0">{children}</div>
      </div>

      <PortalBottomNav
        activeId={ADMIN_MOBILE_TAB_ITEMS.some((t) => t.id === activeSection) ? activeSection : 'desk'}
        ariaLabel="Admin operations primary navigation"
        items={ADMIN_MOBILE_TAB_ITEMS}
        onChange={onSectionChange}
      />
    </div>
  )
}

export function AdminPortalSection({
  section,
  activeSection,
  children
}: {
  readonly section: AdminPortalSectionId
  readonly activeSection: AdminPortalSectionId
  readonly children: ReactNode
}) {
  if (activeSection !== section) {
    return null
  }
  return <div className="space-y-8 md:space-y-10">{children}</div>
}
