import { COURSES, NEARBY_HOTELS } from '../data/coastal-golf-data'

export type TransferPlaceOption = {
  readonly label: string
  readonly lat: number
  readonly lng: number
}

const AGP_LAT = 36.6752
const AGP_LNG = -4.4988

/** Airports with coordinates for map + typeahead resolution. */
const AIRPORT_PLACES: readonly TransferPlaceOption[] = [
  { label: 'Málaga Airport (AGP) — Costa del Sol', lat: AGP_LAT, lng: AGP_LNG },
  { label: 'Málaga Airport — Terminal 3 arrivals', lat: AGP_LAT, lng: AGP_LNG },
  { label: 'Málaga Airport — T2 / T3 meet', lat: AGP_LAT, lng: AGP_LNG },
  { label: 'Gibraltar Airport (GIB)', lat: 36.1512, lng: -5.3497 },
  { label: 'Jerez Airport (XRY)', lat: 36.7448, lng: -6.06 },
  { label: 'Almería Airport (LEI)', lat: 36.8439, lng: -2.3701 }
]

let optionsCache: readonly TransferPlaceOption[] | null = null

const normalizeKey = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')

/**
 * All known pickup / drop-off / via places with coordinates (hotels, courses, airports).
 */
export const getTransferPlaceOptions = (): readonly TransferPlaceOption[] => {
  if (optionsCache) {
    return optionsCache
  }
  const byKey = new Map<string, TransferPlaceOption>()

  const add = (label: string, lat: number, lng: number) => {
    const t = label.trim()
    if (!t || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return
    }
    const k = normalizeKey(t)
    if (!byKey.has(k)) {
      byKey.set(k, { label: t, lat, lng })
    }
  }

  for (const c of COURSES) {
    add(`${c.name} (${c.region})`, c.lat, c.lng)
    add(c.name, c.lat, c.lng)
  }

  for (const hotels of Object.values(NEARBY_HOTELS)) {
    for (const h of hotels) {
      add(h.name, h.lat, h.lng)
    }
  }

  for (const a of AIRPORT_PLACES) {
    add(a.label, a.lat, a.lng)
  }

  optionsCache = [...byKey.values()].sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' }))
  return optionsCache
}

/**
 * Prefix / substring filter for typeahead (no native datalist).
 */
export const filterTransferPlaceOptions = (query: string, limit = 10): readonly TransferPlaceOption[] => {
  const q = normalizeKey(query)
  if (q.length < 2) {
    return []
  }
  const opts = getTransferPlaceOptions()
  const starts: TransferPlaceOption[] = []
  const includes: TransferPlaceOption[] = []
  for (const o of opts) {
    const nk = normalizeKey(o.label)
    if (nk.startsWith(q)) {
      starts.push(o)
    } else if (nk.includes(q)) {
      includes.push(o)
    }
  }
  return [...starts, ...includes].slice(0, limit)
}
