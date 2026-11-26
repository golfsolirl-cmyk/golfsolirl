import { getSupabaseBrowserClient } from './supabase-client'

async function adminAuthHeader(): Promise<string | undefined> {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) return undefined
  try {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    return token ? `Bearer ${token}` : undefined
  } catch {
    return undefined
  }
}

export async function towAdmin<T = Record<string, unknown>>(
  action: string,
  body: Record<string, unknown> = {}
): Promise<T> {
  const authHeader = await adminAuthHeader()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (authHeader) {
    headers.Authorization = authHeader
  }

  const res = await fetch('/api/tow-admin', {
    method: 'POST',
    credentials: 'include',
    headers,
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
  if (data.ok) {
    return true
  }

  // Magic-link / Supabase operator sessions are also accepted by tow-admin APIs.
  const authHeader = await adminAuthHeader()
  if (authHeader) {
    return true
  }

  window.location.replace(`/admin/login?next=${encodeURIComponent(nextPath)}`)
  return false
}
