import { Menu } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { ClientSidebar, CLIENT_SIDEBAR_ITEMS, type ClientPortalSectionId } from './client-sidebar'
import { PortalBottomNav } from './portal-bottom-nav'
import { CLIENT_MOBILE_TAB_ITEMS } from '../lib/portal-mobile-nav'
import { cx } from '../lib/utils'

export type { ClientPortalSectionId }

type ClientPortalShellProps = {
  readonly activeSection: ClientPortalSectionId
  readonly onSectionChange: (id: ClientPortalSectionId) => void
  readonly unreadMessages?: boolean
  readonly children: ReactNode
}

export function ClientPortalShell({
  activeSection,
  onSectionChange,
  unreadMessages = false,
  children
}: ClientPortalShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const activeLabel = CLIENT_SIDEBAR_ITEMS.find((i) => i.id === activeSection)?.label ?? 'Section'

  const mobileTabs = CLIENT_MOBILE_TAB_ITEMS.map((item) =>
    item.id === 'home' && unreadMessages ? { ...item, badge: true } : item
  )

  return (
    <div className="portal-ui-root flex min-h-[min(70vh,900px)] gap-0 pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:pb-0">
      <ClientSidebar
        activeSection={activeSection}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
        onSectionChange={onSectionChange}
        unreadMessages={unreadMessages}
      />

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 mb-4 flex items-center gap-3 border-b border-forest-100/80 bg-white/95 px-1 py-3 backdrop-blur-sm lg:hidden">
          <button
            aria-expanded={mobileNavOpen}
            className={cx(
              'inline-flex h-12 w-12 items-center justify-center rounded-xl border border-forest-200/90 bg-white',
              'text-forest-800 shadow-sm'
            )}
            onClick={() => setMobileNavOpen((o) => !o)}
            type="button"
          >
            <Menu aria-hidden className="h-5 w-5" />
          </button>
          <p className="min-w-0 flex-1 truncate text-base font-semibold text-forest-950">{activeLabel}</p>
        </div>

        <div className="min-w-0">{children}</div>
      </div>

      <PortalBottomNav
        activeId={
          CLIENT_MOBILE_TAB_ITEMS.some((t) => t.id === activeSection) ? activeSection : 'home'
        }
        ariaLabel="Client portal primary navigation"
        items={mobileTabs}
        onChange={onSectionChange}
      />
    </div>
  )
}

export function ClientPortalSection({
  section,
  activeSection,
  children
}: {
  readonly section: ClientPortalSectionId
  readonly activeSection: ClientPortalSectionId
  readonly children: ReactNode
}) {
  if (activeSection !== section) {
    return null
  }
  return <div className="space-y-8 md:space-y-10">{children}</div>
}
