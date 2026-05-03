import type { SupabaseClient } from '@supabase/supabase-js'

type RpcRow = { service_day?: string }

/** ISO yyyy-mm-dd strings for days that are fully booked (no new transport / trip starts). */
export async function loadBookedServiceDayIsoSet(client: SupabaseClient | null): Promise<Set<string>> {
  if (!client) {
    return new Set()
  }

  const { data, error } = await client.rpc('get_driver_booked_service_days')

  if (error || !data) {
    return new Set()
  }

  const out = new Set<string>()
  for (const row of data as unknown[]) {
    if (typeof row === 'string' && row.length >= 10) {
      out.add(row.slice(0, 10))
      continue
    }
    if (row && typeof row === 'object' && 'service_day' in row) {
      const d = String((row as RpcRow).service_day ?? '').slice(0, 10)
      if (d.length === 10) {
        out.add(d)
      }
    }
  }

  return out
}

export function bookedDayUserMessage(isoDay: string): string {
  try {
    const d = new Date(`${isoDay}T12:00:00`)
    const label = Number.isNaN(d.getTime()) ? isoDay : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    return `We’re fully booked on ${label}. Please choose another date or contact us and we’ll check options.`
  } catch {
    return 'That date is fully booked. Please choose another date.'
  }
}

export function assertDatesNotBooked(
  booked: Set<string>,
  dates: readonly (string | undefined | null)[]
): string | null {
  for (const raw of dates) {
    const d = typeof raw === 'string' ? raw.trim().slice(0, 10) : ''
    if (d.length === 10 && booked.has(d)) {
      return bookedDayUserMessage(d)
    }
  }
  return null
}

/** Human label for an ISO day (e.g. Fri 15 May 2026). */
export function formatBookedDayShortLabel(isoDay: string): string {
  try {
    const d = new Date(`${isoDay.slice(0, 10)}T12:00:00`)
    return Number.isNaN(d.getTime())
      ? isoDay.slice(0, 10)
      : d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return isoDay.slice(0, 10)
  }
}

/** Booked ISO days on or after `fromIso`, sorted ascending, capped. */
export function upcomingBookedDaysSorted(booked: ReadonlySet<string>, fromIso: string, limit: number): string[] {
  const from = fromIso.trim().slice(0, 10)
  if (from.length !== 10) {
    return []
  }
  return [...booked].filter((d) => d >= from).sort().slice(0, Math.max(0, limit))
}
