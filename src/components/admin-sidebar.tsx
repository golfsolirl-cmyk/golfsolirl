import {
  Calendar,
  Car,
  ClipboardList,
  FileText,
  Inbox,
  Mail,
  Mails,
  Package,
  PenLine,
  ScanLine,
  Star,
  Users,
  type LucideIcon
} from 'lucide-react'
import { BrandLogoPicture } from './brand-logo-picture'
import { GOLFSOL_BRAND_LOGO_INTRINSIC } from '../lib/brand-logo-assets'
import { cx } from '../lib/utils'

export type AdminPortalSectionId =
  | 'desk'
  | 'forms'
  | 'clientDocs'
  | 'testimonials'
  | 'transfers'
  | 'packages'
  | 'proposals'
  | 'portal'
  | 'emails'
  | 'mail'
  | 'drivers'
  | 'scan'

export type AdminSidebarItem = {
  readonly id: AdminPortalSectionId
  readonly label: string
  readonly description: string
  readonly icon: LucideIcon
}

export const ADMIN_SIDEBAR_ITEMS: readonly AdminSidebarItem[] = [
  { id: 'desk', label: 'Desk', description: 'Payments, messages, and publish', icon: Inbox },
  { id: 'mail', label: 'Gmail', description: 'Inbox, open, and reply', icon: Mails },
  { id: 'forms', label: 'Website forms', description: 'New quotes to price', icon: FileText },
  { id: 'clientDocs', label: 'Client documents', description: 'PDFs, quotes, and letters', icon: ClipboardList },
  { id: 'proposals', label: 'Proposals', description: 'Send a PDF to a guest', icon: PenLine },
  { id: 'emails', label: 'Guest emails', description: 'Branded trip messages', icon: Mail },
  { id: 'transfers', label: 'Transfers', description: 'Quotes, paid trips, drivers', icon: Car },
  { id: 'packages', label: 'Packages', description: 'Trip builds that need a price', icon: Package },
  { id: 'drivers', label: 'Run calendar', description: 'Busy days and day sheets', icon: Calendar },
  { id: 'scan', label: 'Scan trip pass', description: 'Check a guest barcode', icon: ScanLine },
  { id: 'portal', label: 'Client accounts', description: 'Logins and account numbers', icon: Users },
  { id: 'testimonials', label: 'Guest reviews', description: 'Approve homepage reviews', icon: Star }
] as const

const ADMIN_NAV_GROUPS: readonly { readonly label: string; readonly ids: readonly AdminPortalSectionId[] }[] = [
  { label: 'Today', ids: ['desk', 'mail', 'forms'] },
  { label: 'Write', ids: ['clientDocs', 'proposals', 'emails'] },
  { label: 'Trips', ids: ['transfers', 'packages', 'drivers', 'scan'] },
  { label: 'Guests', ids: ['portal', 'testimonials'] }
]

type AdminSidebarProps = {
  readonly activeSection: AdminPortalSectionId
  readonly onSectionChange: (id: AdminPortalSectionId) => void
  readonly mobileOpen: boolean
  readonly onMobileClose: () => void
  /** Count of client trip builds waiting for admin pricing. */
  readonly packagesNeedsReviewCount?: number
}

function NavButton({
  item,
  active,
  badgeCount,
  onSelect
}: {
  readonly item: AdminSidebarItem
  readonly active: boolean
  readonly badgeCount?: number
  readonly onSelect: () => void
}) {
  const Icon = item.icon
  const showBadge = typeof badgeCount === 'number' && badgeCount > 0
  return (
    <button
      className={cx(
        'group relative flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition',
        active
          ? 'bg-fairway-50/90 ring-1 ring-fairway-200/80'
          : 'hover:bg-forest-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fairway-400'
      )}
      onClick={onSelect}
      type="button"
    >
      {active ? (
        <span aria-hidden className="absolute bottom-2 left-0 top-2 w-1 rounded-full bg-fairway-700" />
      ) : null}
      <span
        className={cx(
          'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          active ? 'bg-fairway-800 text-white' : 'bg-forest-100/80 text-forest-700 group-hover:bg-fairway-100'
        )}
      >
        <Icon aria-hidden className="h-4 w-4" />
        {showBadge ? (
          <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        ) : null}
      </span>
      <span className="min-w-0 flex-1 pt-0.5">
        <span className={cx('block text-base font-semibold leading-tight', active ? 'text-forest-950' : 'text-forest-900')}>
          {item.label}
        </span>
        {active ? (
          <span className="mt-1 block text-sm font-medium leading-snug text-forest-700">{item.description}</span>
        ) : null}
      </span>
    </button>
  )
}

export function AdminSidebar({
  activeSection,
  onSectionChange,
  mobileOpen,
  onMobileClose,
  packagesNeedsReviewCount = 0
}: AdminSidebarProps) {
  const select = (id: AdminPortalSectionId) => {
    onSectionChange(id)
    onMobileClose()
  }

  return (
    <>
      {mobileOpen ? (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-forest-950/40 lg:hidden"
          onClick={onMobileClose}
          type="button"
        />
      ) : null}

      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-50 flex w-[min(100vw-2.5rem,20rem)] flex-col border-r border-forest-100 bg-offwhite shadow-xl transition-transform duration-300 lg:sticky lg:top-6 lg:z-auto lg:max-h-[calc(100vh-3rem)] lg:w-[18.5rem] lg:shrink-0 lg:translate-x-0 lg:self-start lg:rounded-[1.75rem] lg:border lg:shadow-soft',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center gap-3 border-b border-forest-100 px-5 py-5">
          <BrandLogoPicture
            alt="GolfSol Ireland"
            className="h-10 w-auto object-contain"
            height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
            width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
          />
          <div className="min-w-0">
            <p className="font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-brand-600">Operations</p>
            <p className="truncate text-sm font-bold text-forest-950">Admin portal</p>
          </div>
        </div>
        <nav aria-label="Admin portal sections" className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-2 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-forest-500">{group.label}</p>
              <div className="flex flex-col gap-1">
                {group.ids.map((id) => {
                  const item = ADMIN_SIDEBAR_ITEMS.find((row) => row.id === id)
                  if (!item) return null
                  return (
                    <NavButton
                      active={activeSection === item.id}
                      badgeCount={item.id === 'packages' ? packagesNeedsReviewCount : undefined}
                      item={item}
                      key={item.id}
                      onSelect={() => select(item.id)}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
