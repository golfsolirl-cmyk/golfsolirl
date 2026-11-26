export async function towAdmin<T = Record<string, unknown>>(
  action: string,
  body: Record<string, unknown> = {}
): Promise<T> {
  const res = await fetch('/api/tow-admin', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...body })
  })
  const data = (await res.json().catch(() => ({}))) as T & { message?: string }
  if (!res.ok) {
    throw new Error(data.message || 'Request failed.')
  }
  return data
}

export async function ensureAdminSession(nextPath: string): Promise<boolean> {
  const res = await fetch('/api/admin-session-check', { method: 'GET', credentials: 'include' })
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean }
  if (!data.ok) {
    window.location.replace(`/admin/login?next=${encodeURIComponent(nextPath)}`)
    return false
  }
  return true
}
