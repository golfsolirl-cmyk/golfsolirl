const VIEWED_REFS_KEY = 'gsol-admin-viewed-enquiry-refs'

export const isEnquiryAdminViewed = (row: {
  readonly admin_viewed_at?: string | null
  readonly reference_id: string
}): boolean => {
  if (row.admin_viewed_at) {
    return true
  }
  if (typeof window === 'undefined') {
    return false
  }
  try {
    const raw = window.localStorage.getItem(VIEWED_REFS_KEY)
    if (!raw) {
      return false
    }
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return false
    }
    return parsed.includes(row.reference_id)
  } catch {
    return false
  }
}

export const rememberEnquiryViewedLocally = (referenceId: string) => {
  if (typeof window === 'undefined' || !referenceId.trim()) {
    return
  }
  try {
    const raw = window.localStorage.getItem(VIEWED_REFS_KEY)
    const prev = raw ? (JSON.parse(raw) as unknown) : []
    const list = Array.isArray(prev) ? prev.filter((x): x is string => typeof x === 'string') : []
    if (!list.includes(referenceId)) {
      list.push(referenceId)
    }
    window.localStorage.setItem(VIEWED_REFS_KEY, JSON.stringify(list.slice(-500)))
  } catch {
    /* ignore */
  }
}
