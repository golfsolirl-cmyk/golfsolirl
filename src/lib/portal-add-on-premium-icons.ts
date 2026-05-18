import type { LucideIcon } from 'lucide-react'
import { Building2, PlaneLanding, Trophy } from 'lucide-react'
import type { PortalInterestCategory } from './portal-interest-tickets'

/** Premium Lucide glyphs shared by Add to your trip, interest tickets, and messaging. */
export function portalAddOnPremiumIcon(category: PortalInterestCategory): LucideIcon {
  switch (category) {
    case 'transfers':
      return PlaneLanding
    case 'golf_courses':
      return Trophy
    case 'hotels':
      return Building2
  }
}

/** Solid greens for ticket rows / modal chips (white icon on top). */
export function portalAddOnPremiumTileClass(category: PortalInterestCategory): string {
  switch (category) {
    case 'transfers':
      return 'bg-fairway-600 ring-1 ring-white/25 shadow-inner'
    case 'golf_courses':
      return 'bg-fairway-700 ring-1 ring-white/25 shadow-inner'
    case 'hotels':
      return 'bg-forest-800 ring-1 ring-white/20 shadow-inner'
  }
}

export const PORTAL_ADD_ON_ICON_STROKE = 2.25 as const
