import type { SupabaseClient } from '@supabase/supabase-js'

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

/** Pull yyyy-mm-dd from PostgREST RPC payloads (scalar rows, composite rows, or odd column names). */
export function addDriverBookedRpcRowsToSet(data: unknown, out: Set<string>): void {
  if (data == null) {
    return
  }

  const rows = Array.isArray(data) ? data : [data]

  for (const row of rows) {
    if (typeof row === 'string') {
      const head = row.trim().slice(0, 10)
      if (ISO_DAY.test(head)) {
        out.add(head)
      }
      continue
    }

    if (row && typeof row === 'object' && !Array.isArray(row)) {
      const record = row as Record<string, unknown>
      for (const v of Object.values(record)) {
        const d = normalizeIsoDayFromRpcValue(v)
        if (d) {
          out.add(d)
        }
      }
    }
  }
}

function normalizeIsoDayFromRpcValue(value: unknown): string | null {
  if (value == null) {
    return null
  }
  if (typeof value === 'string') {
    const m = value.trim().match(/^(\d{4}-\d{2}-\d{2})/)
    return m && ISO_DAY.test(m[1]) ? m[1] : null
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getUTCFullYear()
    const mo = value.getUTCMonth() + 1
    const d = value.getUTCDate()
    const s = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return ISO_DAY.test(s) ? s : null
  }
  return null
}

/** ISO yyyy-mm-dd strings for days that are fully booked (no new transport / trip starts). */
export async function loadBookedServiceDayIsoSet(client: SupabaseClient | null): Promise<Set<string>> {
  if (!client) {
    return new Set()
  }

  const { data, error } = await client.rpc('get_driver_booked_service_days')

  if (error || data == null) {
    return new Set()
  }

  const out = new Set<string>()
  addDriverBookedRpcRowsToSet(data, out)
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
