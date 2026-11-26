/**
 * HH:mm helpers — keep in sync with `shared/time-of-day.mjs`.
 */

const HHMM_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

/** Normalized `HH:mm` or empty string. */
export function normalizeTimeOfDay(raw: unknown): string {
  if (raw == null) return ''
  const s = String(raw).trim()
  if (!s) return ''
  const match = s.match(/^(\d{1,2}):(\d{1,2})(?::\d{1,2})?$/)
  if (!match) return ''
  const h = Number(match[1])
  const m = Number(match[2])
  if (!Number.isInteger(h) || !Number.isInteger(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    return ''
  }
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function isValidTimeOfDay(raw: unknown): boolean {
  return HHMM_RE.test(normalizeTimeOfDay(raw))
}

export function splitTimeOfDay(value: string): { hour: string; minute: string } {
  const n = normalizeTimeOfDay(value)
  if (!n) return { hour: '', minute: '' }
  const [hour, minute] = n.split(':')
  return { hour: hour ?? '', minute: minute ?? '' }
}

export function joinTimeOfDay(hour: string, minute: string): string {
  if (hour === '' || minute === '') return ''
  return normalizeTimeOfDay(`${hour}:${minute}`)
}

export function timeOfDayHourOptions(): string[] {
  return Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
}

/** Minute options for selects; keeps an off-step value so controlled state never blanks. */
export function timeOfDayMinuteOptions(step = 5, includeExact = ''): string[] {
  const safeStep = Number.isFinite(step) && step > 0 ? Math.min(30, Math.floor(step)) : 5
  const opts: string[] = []
  for (let m = 0; m < 60; m += safeStep) {
    opts.push(String(m).padStart(2, '0'))
  }
  const raw = String(includeExact ?? '').trim()
  let exactMin = ''
  if (/^\d{1,2}$/.test(raw)) {
    const m = Number(raw)
    if (m >= 0 && m <= 59) exactMin = String(m).padStart(2, '0')
  } else if (raw) {
    const n = normalizeTimeOfDay(raw.includes(':') ? raw : `00:${raw}`)
    exactMin = n ? n.slice(3) : ''
  }
  if (exactMin && !opts.includes(exactMin)) {
    opts.push(exactMin)
    opts.sort()
  }
  return opts
}

export function arrivalTimeFormFields(arrivalTime: string): Record<string, string> {
  const n = normalizeTimeOfDay(arrivalTime)
  if (!n) return {}
  return { 'Arrival time': n }
}
