import { CreditCard, FileText, LayoutDashboard, MapPin, MessageCircle, UserRound, type LucideIcon } from 'lucide-react'
import { BrandLogoPicture } from './brand-logo-picture'
import { GOLFSOL_BRAND_LOGO_INTRINSIC } from '../lib/brand-logo-assets'
import { cx } from '../lib/utils'

export type ClientPortalSectionId = 'home' | 'trip' | 'payments' | 'messages' | 'contact' | 'documents'

export type ClientSidebarItem = {
  readonly id: ClientPortalSectionId
  readonly label: string
  readonly description: string
  readonly icon: LucideIcon
}

export const CLIENT_SIDEBAR_ITEMS: readonly ClientSidebarItem[] = [
  { id: 'home', label: 'Your trip', description: 'Account, transfers, add-ons', icon: LayoutDashboard },
  { id: 'trip', label: 'Trip planner', description: 'Build on your enquiry', icon: MapPin },
  { id: 'payments', label: 'Payments', description: 'Pay transfers & invoices', icon: CreditCard },
  { id: 'messages', label: 'Messages', description: 'Tickets & team replies', icon: MessageCircle },
  { id: 'contact', label: 'Contact', description: 'Name, phone, account ref', icon: UserRound },
  { id: 'documents', label: 'Documents', description: 'Proposals & PDFs', icon: FileText }
] as const

type ClientSidebarProps = {
  readonly activeSection: ClientPortalSectionId
  readonly onSectionChange: (id: ClientPortalSectionId) => void
  readonly mobileOpen: boolean
  readonly onMobileClose: () => void
  readonly unreadMessages?: boolean
}

function NavButton({
  item,
  active,
  badge,
  onSelect
}: {
  readonly item: ClientSidebarItem
  readonly active: boolean
  readonly badge?: boolean
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
        <span className="flex flex-wrap items-center gap-2">
          <span className={cx('block text-sm font-semibold', active ? 'text-forest-950' : 'text-forest-900')}>
            {item.label}
          </span>
          {badge ? (
            <span className="inline-flex h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" title="New reply" />
          ) : null}
        </span>
        <span className="mt-0.5 block text-xs leading-snug text-forest-600">{item.description}</span>
      </span>
    </button>
  )
}

export function ClientSidebar({
  activeSection,
  onSectionChange,
  mobileOpen,
  onMobileClose,
  unreadMessages = false
}: ClientSidebarProps) {
  const select = (id: ClientPortalSectionId) => {
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
          'fixed inset-y-0 left-0 z-50 flex w-[min(100vw-2rem,280px)] flex-col border-r border-forest-100/90 bg-white shadow-xl transition-transform duration-300 lg:static lg:z-auto lg:w-60 lg:shrink-0 lg:translate-x-0 lg:shadow-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center gap-2.5 border-b border-forest-100/80 px-4 py-4">
          <BrandLogoPicture
            alt="Golf Sol Ireland"
            className="h-10 w-auto object-contain"
            height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
            width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
          />
          <div className="min-w-0">
            <p className="font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-brand-600">Your trip desk</p>
            <p className="truncate text-sm font-bold text-forest-950">Client portal</p>
          </div>
        </div>
        <nav aria-label="Client portal sections" className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {CLIENT_SIDEBAR_ITEMS.map((item) => (
            <NavButton
              active={activeSection === item.id}
              badge={item.id === 'messages' && unreadMessages}
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
