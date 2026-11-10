import { Barcode, CreditCard, Home, Car, Inbox, LayoutDashboard, MessageCircle, Users, type LucideIcon } from 'lucide-react'
import type { ClientPortalSectionId } from '../components/client-sidebar'
import type { AdminPortalSectionId } from '../components/admin-sidebar'
import type { PortalBottomNavItem } from '../components/portal-bottom-nav'

export const CLIENT_MOBILE_TAB_ITEMS: readonly PortalBottomNavItem<ClientPortalSectionId>[] = [
  { id: 'home', label: 'Trip', icon: Home },
  { id: 'payments', label: 'Pay', icon: CreditCard },
  { id: 'messages', label: 'Messages', icon: MessageCircle },
  { id: 'pass', label: 'Pass', icon: Barcode }
] as const

export const ADMIN_MOBILE_TAB_ITEMS: readonly PortalBottomNavItem<AdminPortalSectionId>[] = [
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'forms', label: 'Quotes', icon: Inbox },
  { id: 'desk', label: 'Pay', icon: LayoutDashboard },
  { id: 'transfers', label: 'Trips', icon: Car }
] as const

/** Sidebar-only sections reachable from mobile “More” menu. */
export const CLIENT_MORE_SECTIONS: readonly ClientPortalSectionId[] = [
  'trip',
  'documents',
  'contact',
  'perks'
]

export const ADMIN_MORE_SECTIONS: readonly AdminPortalSectionId[] = [
  'scan',
  'mail',
  'clientDocs',
  'testimonials',
  'packages',
  'proposals',
  'portal',
  'emails',
  'drivers'
]

export type PortalMobileTabItem<T extends string> = PortalBottomNavItem<T> & { readonly icon: LucideIcon }
