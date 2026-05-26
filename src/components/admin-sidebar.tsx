import {
  Calendar,
  Car,
  FileText,
  Inbox,
  Mail,
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
  | 'testimonials'
  | 'transfers'
  | 'packages'
  | 'proposals'
  | 'portal'
  | 'emails'
  | 'drivers'
  | 'scan'

export type AdminSidebarItem = {
  readonly id: AdminPortalSectionId
  readonly label: string
  readonly description: string
  readonly icon: LucideIcon
}

export const ADMIN_SIDEBAR_ITEMS: readonly AdminSidebarItem[] = [
  { id: 'desk', label: 'Desk & inbox', description: 'Tickets, Stripe, publish lines', icon: Inbox },
  { id: 'scan', label: 'Scan trip pass', description: 'Verify guest payment barcode', icon: ScanLine },
  { id: 'forms', label: 'Website forms', description: 'Enquiry submissions', icon: FileText },
  { id: 'testimonials', label: 'Testimonials', description: 'Homepage guest reviews', icon: Star },
  { id: 'transfers', label: 'Transfer pipeline', description: 'Account lookup & drivers', icon: Car },
  { id: 'packages', label: 'Packages', description: 'Client package builds', icon: Package },
  { id: 'proposals', label: 'Proposals & workspace', description: 'PDF builders & CRM records', icon: PenLine },
  { id: 'portal', label: 'Portal & clients', description: 'Accounts, access, resets', icon: Users },
  { id: 'emails', label: 'Emails & comms', description: 'Branded sends & PDF access', icon: Mail },
  { id: 'drivers', label: 'Driver calendar', description: 'Capacity & assignments', icon: Calendar }
] as const

type AdminSidebarProps = {
  readonly activeSection: AdminPortalSectionId
  readonly onSectionChange: (id: AdminPortalSectionId) => void
  readonly mobileOpen: boolean
  readonly onMobileClose: () => void
}

function NavButton({
  item,
  active,
  onSelect
}: {
  readonly item: AdminSidebarItem
  readonly active: boolean
  readonly onSelect: () => void
}) {
  const Icon = item.icon
  return (
    <button
      className={cx(
        'group relative flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition',
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
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          active ? 'bg-fairway-800 text-white' : 'bg-forest-100/80 text-forest-700 group-hover:bg-fairway-100'
        )}
      >
        <Icon aria-hidden className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 pt-0.5">
        <span className={cx('block text-sm font-semibold', active ? 'text-forest-950' : 'text-forest-900')}>
          {item.label}
        </span>
        <span className="mt-0.5 block text-xs leading-snug text-ge-gray500">{item.description}</span>
      </span>
    </button>
  )
}

export function AdminSidebar({ activeSection, onSectionChange, mobileOpen, onMobileClose }: AdminSidebarProps) {
  const select = (id: AdminPortalSectionId) => {
    onSectionChange(id)
    onMobileClose()
  }

  return (
    <>
      {mobileOpen ? (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-forest-950/40 backdrop-blur-[1px] lg:hidden"
          onClick={onMobileClose}
          type="button"
        />
      ) : null}

      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-50 flex w-[min(100vw-2rem,280px)] flex-col border-r border-forest-100/90 bg-white shadow-xl transition-transform duration-300 lg:static lg:z-auto lg:-ml-2 lg:mr-1 lg:w-60 lg:shrink-0 lg:translate-x-0 lg:shadow-none xl:-ml-3',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center gap-2.5 border-b border-forest-100/80 px-4 py-4">
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
        <nav aria-label="Admin portal sections" className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {ADMIN_SIDEBAR_ITEMS.map((item) => (
            <NavButton
              active={activeSection === item.id}
              item={item}
              key={item.id}
              onSelect={() => select(item.id)}
            />
          ))}
        </nav>
      </aside>
    </>
  )
}
