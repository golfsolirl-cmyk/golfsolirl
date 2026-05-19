import { Menu } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { AdminSidebar, ADMIN_SIDEBAR_ITEMS, type AdminPortalSectionId } from './admin-sidebar'
import { cx } from '../lib/utils'

export type { AdminPortalSectionId }

type AdminPortalShellProps = {
  readonly activeSection: AdminPortalSectionId
  readonly onSectionChange: (id: AdminPortalSectionId) => void
  readonly children: ReactNode
}

export function AdminPortalShell({ activeSection, onSectionChange, children }: AdminPortalShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const activeLabel = ADMIN_SIDEBAR_ITEMS.find((i) => i.id === activeSection)?.label ?? 'Section'

  return (
    <div className="flex min-h-[min(70vh,900px)] gap-0">
      <AdminSidebar
        activeSection={activeSection}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
        onSectionChange={onSectionChange}
      />

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 mb-4 flex items-center gap-3 border-b border-forest-100/80 bg-white/95 px-1 py-3 backdrop-blur-sm lg:hidden">
          <button
            aria-expanded={mobileNavOpen}
            className={cx(
              'inline-flex h-11 w-11 items-center justify-center rounded-xl border border-forest-200/90 bg-white',
              'text-forest-800 shadow-sm'
            )}
            onClick={() => setMobileNavOpen((o) => !o)}
            type="button"
          >
            <Menu aria-hidden className="h-5 w-5" />
          </button>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-forest-950">{activeLabel}</p>
        </div>

        <div className="min-w-0">{children}</div>
      </div>
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

