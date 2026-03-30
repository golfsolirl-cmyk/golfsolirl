/** Session backup when Supabase drops ?next= on the callback URL after hash redirects */
export const AUTH_NEXT_STORAGE_KEY = 'gsol_auth_next'

/** Only allow same-origin path+query redirects after auth (open redirect hardening). */
export const isSafeInternalPath = (value: string): boolean => {
  const v = value.trim()
  if (!v.startsWith('/') || v.startsWith('//') || v.includes('\\')) {
    return false
  }

  if (v.length > 2048) {
    return false
  }

  try {
    const resolved = new URL(v, 'https://example.com')
    if (resolved.origin !== 'https://example.com') {
      return false
    }

    return true
  } catch {
    return false
  }
}
