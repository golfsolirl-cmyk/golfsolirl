import { Barcode, CreditCard, FileText, Gift, LayoutDashboard, MapPin, MessageCircle, UserRound, type LucideIcon } from 'lucide-react'
import { BrandLogoPicture } from './brand-logo-picture'
import { GOLFSOL_BRAND_LOGO_INTRINSIC } from '../lib/brand-logo-assets'
import { cx } from '../lib/utils'

export type ClientPortalSectionId = 'home' | 'trip' | 'payments' | 'messages' | 'contact' | 'documents' | 'pass' | 'perks'

export type ClientSidebarItem = {
  readonly id: ClientPortalSectionId
  readonly label: string
  readonly description: string
  readonly icon: LucideIcon
}

export const CLIENT_SIDEBAR_ITEMS: readonly ClientSidebarItem[] = [
  { id: 'home', label: 'Your trip', description: 'What is booked and what you can add', icon: LayoutDashboard },
  { id: 'payments', label: 'Pay', description: 'Pay by card or bank transfer', icon: CreditCard },
  { id: 'messages', label: 'Messages', description: 'Ask us about the trip', icon: MessageCircle },
  { id: 'trip', label: 'Add to trip', description: 'Transfers, golf, and hotel', icon: MapPin },
  { id: 'pass', label: 'Trip pass', description: 'Show this to the driver', icon: Barcode },
  { id: 'documents', label: 'Documents', description: 'Quotes and letters', icon: FileText },
  { id: 'contact', label: 'Your details', description: 'Name, phone, and account number', icon: UserRound },
  { id: 'perks', label: 'Extras', description: 'Deals on the Costa', icon: Gift }
] as const

const CLIENT_NAV_GROUPS: readonly { readonly label: string; readonly ids: readonly ClientPortalSectionId[] }[] = [
  { label: 'Start here', ids: ['home', 'payments', 'messages'] },
  { label: 'The trip', ids: ['trip', 'pass', 'documents'] },
  { label: 'Account', ids: ['contact', 'perks'] }
]

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
      aria-current={active ? 'page' : undefined}
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
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition',
          active ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-600'
        )}
      >
        <Icon aria-hidden className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 pt-0.5">
        <span className="flex flex-wrap items-center gap-2">
          <span className={cx('block text-base font-semibold leading-snug', active ? 'text-forest-950' : 'text-forest-900')}>
            {item.label}
          </span>
          {active ? (
            <span className="rounded-full bg-forest-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
              Viewing
            </span>
          ) : null}
          {badge ? (
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-white" title="New reply" />
          ) : null}
        </span>
        <span className={cx('mt-0.5 block text-sm leading-snug', active ? 'text-forest-700' : 'text-ge-gray500')}>
          {item.description}
        </span>
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
          className="fixed inset-0 z-40 bg-forest-950/40 lg:hidden"
          onClick={onMobileClose}
          type="button"
        />
      ) : null}

      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-50 flex w-[min(100vw-2rem,300px)] flex-col border-r border-black/[0.06] bg-white shadow-2xl transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-64 lg:shrink-0 lg:translate-x-0 lg:shadow-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-5">
          <BrandLogoPicture
            alt="Golf Sol Ireland"
            className="h-10 w-auto object-contain"
            height={GOLFSOL_BRAND_LOGO_INTRINSIC.height}
            width={GOLFSOL_BRAND_LOGO_INTRINSIC.width}
          />
          <div className="min-w-0">
            <p className="font-ge text-sm font-extrabold uppercase tracking-[0.16em] text-brand-600">Golf Sol Ireland</p>
            <p className="truncate text-base font-bold text-forest-950">Your trip desk</p>
          </div>
        </div>
        <nav aria-label="Client portal sections" className="flex flex-1 flex-col gap-4 overflow-y-auto p-3" role="tablist">
          {CLIENT_NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-1.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-forest-700">{group.label}</p>
              <div className="flex flex-col gap-1">
                {group.ids.map((id) => {
                  const item = CLIENT_SIDEBAR_ITEMS.find((row) => row.id === id)
                  if (!item) return null
                  return (
                    <NavButton
                      active={activeSection === item.id}
                      badge={item.id === 'messages' && unreadMessages}
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
