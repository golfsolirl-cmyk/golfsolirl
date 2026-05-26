import { Barcode, CreditCard, Gift, Home, Car, ScanLine, Inbox, LayoutDashboard, type LucideIcon } from 'lucide-react'
import type { ClientPortalSectionId } from '../components/client-sidebar'
import type { AdminPortalSectionId } from '../components/admin-sidebar'
import type { PortalBottomNavItem } from '../components/portal-bottom-nav'

export const CLIENT_MOBILE_TAB_ITEMS: readonly PortalBottomNavItem<ClientPortalSectionId>[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'pass', label: 'Trip pass', icon: Barcode },
  { id: 'perks', label: 'Perks', icon: Gift },
  { id: 'payments', label: 'Pay', icon: CreditCard }
] as const

export const ADMIN_MOBILE_TAB_ITEMS: readonly PortalBottomNavItem<AdminPortalSectionId>[] = [
  { id: 'desk', label: 'Home', icon: LayoutDashboard },
  { id: 'transfers', label: 'Transfers', icon: Car },
  { id: 'scan', label: 'Scan', icon: ScanLine },
  { id: 'forms', label: 'Forms', icon: Inbox }
] as const

/** Sidebar-only sections reachable from mobile “More” menu. */
export const CLIENT_MORE_SECTIONS: readonly ClientPortalSectionId[] = [
  'trip',
  'messages',
  'contact',
  'documents'
]

export const ADMIN_MORE_SECTIONS: readonly AdminPortalSectionId[] = [
  'testimonials',
  'packages',
  'proposals',
  'portal',
  'emails',
  'drivers'
]

export type PortalMobileTabItem<T extends string> = PortalBottomNavItem<T> & { readonly icon: LucideIcon }
