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
  { id: 'home', label: 'Your trip', description: 'Overview · add-ons', icon: LayoutDashboard },
  { id: 'pass', label: 'Trip pass', description: 'Show the driver', icon: Barcode },
  { id: 'perks', label: 'Perks & deals', description: 'Costa extras', icon: Gift },
  { id: 'trip', label: 'Trip builder', description: 'Transfers · golf · stay', icon: MapPin },
  { id: 'payments', label: 'Pay', description: 'Transfers & invoices', icon: CreditCard },
  { id: 'messages', label: 'Messages', description: 'Ask us · replies', icon: MessageCircle },
  { id: 'contact', label: 'Your details', description: 'Name · phone · account', icon: UserRound },
  { id: 'documents', label: 'Documents', description: 'Quotes & letters', icon: FileText }
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
      aria-current={active ? 'page' : undefined}
      className={cx(
        'group relative flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition duration-200',
        active
          ? 'bg-fairway-100 shadow-sm ring-2 ring-fairway-600/70'
          : 'hover:bg-forest-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fairway-400'
      )}
      onClick={onSelect}
      type="button"
    >
      {active ? (
        <span aria-hidden className="absolute bottom-2 left-0 top-2 w-1.5 rounded-full bg-fairway-800" />
      ) : null}
      <span
        className={cx(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition',
          active ? 'bg-fairway-800 text-white shadow-sm' : 'bg-forest-100/80 text-forest-700 group-hover:bg-fairway-100'
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
            <p className="font-ge text-sm font-extrabold uppercase tracking-[0.16em] text-brand-600">Golf Sol Ireland</p>
            <p className="truncate text-base font-bold text-forest-950">Your trip desk</p>
          </div>
        </div>
        <nav aria-label="Client portal sections" className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" role="tablist">
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
