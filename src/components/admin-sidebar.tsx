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
  | 'customers'
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
  { id: 'customers', label: 'Customers', description: 'Quotes, invoices, and payments', icon: Users },
  { id: 'forms', label: 'New quotes', description: 'Website forms waiting for a price', icon: FileText },
  { id: 'desk', label: 'Pay & replies', description: 'Money in and guest messages', icon: Inbox },
  { id: 'mail', label: 'Email inbox', description: 'Read and reply to customer email', icon: Mails },
  { id: 'proposals', label: 'Send a PDF', description: 'Email a document', icon: PenLine },
  { id: 'transfers', label: 'Transfers', description: 'Paid trips and sending a driver', icon: Car },
  { id: 'packages', label: 'Trip prices', description: 'Guest builds that need a price', icon: Package },
  { id: 'drivers', label: 'Driver diary', description: 'Busy days and the printed day sheet', icon: Calendar },
  { id: 'scan', label: 'Check a pass', description: 'Scan a guest barcode before travel', icon: ScanLine },
  { id: 'clientDocs', label: 'Letters', description: 'Preview a PDF and write a letter', icon: ClipboardList },
  { id: 'emails', label: 'Trip emails', description: 'Short branded notes to a guest', icon: Mail },
  { id: 'portal', label: 'Guest logins', description: 'Create a dashboard login', icon: Users },
  { id: 'testimonials', label: 'Reviews', description: 'Choose what shows on the homepage', icon: Star }
] as const

const ADMIN_NAV_GROUPS: readonly { readonly label: string; readonly ids: readonly AdminPortalSectionId[] }[] = [
  { label: 'Start here', ids: ['customers', 'forms', 'desk', 'mail'] },
  { label: 'On the day', ids: ['transfers', 'packages', 'drivers', 'scan'] },
  { label: 'Now and then', ids: ['proposals', 'clientDocs', 'emails', 'portal', 'testimonials'] }
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
        'group relative flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200',
        active
          ? 'bg-emerald-50 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ring-1 ring-emerald-200'
          : 'hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400'
      )}
      onClick={onSelect}
      type="button"
    >
      {active ? (
        <span aria-hidden className="absolute bottom-2 left-0 top-2 w-1 rounded-full bg-emerald-600" />
      ) : null}
      <span
        className={cx(
          'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          active ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-600'
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
        <span className={cx('mt-1 block text-sm leading-snug', active ? 'font-medium text-forest-800' : 'text-forest-600')}>
          {item.description}
        </span>
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
          'fixed inset-y-0 left-0 z-50 flex w-[min(100vw-2.5rem,20rem)] flex-col border-r border-black/[0.06] bg-white shadow-2xl transition-transform duration-300 ease-out lg:sticky lg:top-6 lg:z-auto lg:max-h-[calc(100vh-3rem)] lg:w-[18.5rem] lg:shrink-0 lg:translate-x-0 lg:self-start lg:rounded-2xl lg:border lg:border-black/[0.04] lg:shadow-[0_4px_16px_rgba(0,0,0,0.06)]',
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
