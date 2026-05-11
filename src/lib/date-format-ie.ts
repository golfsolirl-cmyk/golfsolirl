/**
 * Irish-style short dates for client + admin dashboards (dd/mm/yy).
 */

const pad2 = (n: number) => String(n).padStart(2, '0')

/** Calendar date only → `dd/mm/yy` (UK ordering). */
export const formatDateDdMmYy = (input: string | Date): string => {
  const d = input instanceof Date ? input : parseIsoOrYmd(input)
  if (!d) {
    return typeof input === 'string' ? input : ''
  }
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`
}

/** Date + time → `dd/mm/yy, HH:MM` (24h). */
export const formatDateTimeDdMmYy = (input: string | Date): string => {
  const d = input instanceof Date ? input : new Date(typeof input === 'string' ? input : '')
  if (Number.isNaN(d.getTime())) {
    return typeof input === 'string' ? input : ''
  }
  return `${formatDateDdMmYy(d)}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

const parseIsoOrYmd = (raw: string): Date | null => {
  const s = raw.trim()
  if (!s) {
    return null
  }
  // yyyy-mm-dd or yyyy-mm-ddTHH:MM
  const ymd = s.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    const [y, m, d] = ymd.split('-').map(Number)
    const dt = new Date(y, m - 1, d)
    if (!Number.isNaN(dt.getTime())) {
      if (s.includes('T')) {
        const t = new Date(s)
        return Number.isNaN(t.getTime()) ? dt : t
      }
      return dt
    }
  }
  const t = new Date(s)
  return Number.isNaN(t.getTime()) ? null : t
}

/** True when value looks like a date we should shorten (ISO instant or yyyy-mm-dd). */
export const looksLikeIsoOrYmdDate = (raw: string): boolean => {
  const s = raw.trim()
  if (!s) {
    return false
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    return true
  }
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    return true
  }
  const t = Date.parse(s)
  return Number.isFinite(t) && s.length >= 8
}
