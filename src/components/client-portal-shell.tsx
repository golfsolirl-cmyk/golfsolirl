import { Menu } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
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
  const didMountSectionRef = useRef(false)
  const activeItem = CLIENT_SIDEBAR_ITEMS.find((i) => i.id === activeSection)
  const activeLabel = activeItem?.label ?? 'Section'
  const activeDescription = activeItem?.description ?? ''

  useEffect(() => {
    if (!didMountSectionRef.current) {
      didMountSectionRef.current = true
      return
    }
    const el = document.getElementById('client-trip-desk-active-section')
    if (!el) return
    const reduceMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }, [activeSection])

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
        <div className="sticky top-0 z-30 mb-4 border-b border-forest-200 bg-white/95 px-1 py-3 backdrop-blur-sm lg:hidden">
          <div className="flex items-center gap-3">
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
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Now viewing</p>
              <p className="truncate text-base font-semibold text-forest-950">{activeLabel}</p>
            </div>
          </div>
          {activeDescription ? (
            <p className="mt-1.5 pl-[3.75rem] text-sm leading-snug text-forest-600">{activeDescription}</p>
          ) : null}
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
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      aria-labelledby={`client-section-heading-${section}`}
      className="space-y-8 md:space-y-10"
      initial={{ opacity: 0, y: 12 }}
      key={section}
      role="tabpanel"
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
