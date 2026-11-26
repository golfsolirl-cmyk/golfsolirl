/**
 * HH:mm helpers for arrival / pickup / collection times.
 * Prefer hour+minute selects on mobile — native type="time" is unreliable under custom CSS.
 */

const HHMM_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

/**
 * @param {unknown} raw
 * @returns {string} Normalized `HH:mm` or `''`
 */
export function normalizeTimeOfDay(raw) {
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

/**
 * @param {unknown} raw
 * @returns {boolean}
 */
export function isValidTimeOfDay(raw) {
  return HHMM_RE.test(normalizeTimeOfDay(raw))
}

/**
 * @param {string} value HH:mm or ''
 * @returns {{ hour: string, minute: string }}
 */
export function splitTimeOfDay(value) {
  const n = normalizeTimeOfDay(value)
  if (!n) return { hour: '', minute: '' }
  const [hour, minute] = n.split(':')
  return { hour: hour ?? '', minute: minute ?? '' }
}

/**
 * @param {string} hour
 * @param {string} minute
 * @returns {string} HH:mm or ''
 */
export function joinTimeOfDay(hour, minute) {
  if (hour === '' || minute === '') return ''
  return normalizeTimeOfDay(`${hour}:${minute}`)
}

/**
 * @param {number} [step=5]
 * @returns {string[]}
 */
export function timeOfDayHourOptions() {
  return Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
}

/**
 * @param {number} [step=5]
 * @param {string} [includeExact=''] minute (`23`) or full `HH:mm` to keep in the list
 * @returns {string[]}
 */
export function timeOfDayMinuteOptions(step = 5, includeExact = '') {
  const safeStep = Number.isFinite(step) && step > 0 ? Math.min(30, Math.floor(step)) : 5
  const opts = []
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

/**
 * Build enquiry/admin display payload fragment for an arrival time.
 * @param {string} arrivalTime
 * @returns {Record<string, string>}
 */
export function arrivalTimeFormFields(arrivalTime) {
  const n = normalizeTimeOfDay(arrivalTime)
  if (!n) return {}
  return { 'Arrival time': n }
}
