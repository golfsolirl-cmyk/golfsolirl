import { NEARBY_HOTELS, type NearbyHotel } from './coastal-golf-data'

export type CorridorHotelEntry = {
  readonly slug: string
  readonly name: string
  readonly stars: number
  readonly rating: number
}

const slugify = (name: string): string => {
  const s = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72)
  return s || 'hotel'
}

/**
 * Deduped hotels across all course “nearby” lists — Costa corridor picks for airport / transfer dropdowns.
 */
export const AIRPORT_CORRIDOR_HOTELS: readonly CorridorHotelEntry[] = (() => {
  const byName = new Map<string, CorridorHotelEntry>()
  for (const list of Object.values(NEARBY_HOTELS)) {
    for (const h of list) {
      const key = h.name.trim().toLowerCase()
      const prev = byName.get(key)
      if (!prev || h.rating > prev.rating) {
        byName.set(key, { slug: slugify(h.name), name: h.name, stars: h.stars, rating: h.rating })
      }
    }
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name, 'en'))
})()

export const corridorHotelBySlug = (slug: string): CorridorHotelEntry | undefined =>
  AIRPORT_CORRIDOR_HOTELS.find((h) => h.slug === slug)
