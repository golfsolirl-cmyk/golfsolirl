/** Clears persisted Supabase session keys for this project (fallback if signOut fails or throws). */
export function clearSupabaseBrowserAuthStorage() {
  const url = import.meta.env.VITE_SUPABASE_URL
  if (typeof url !== 'string' || url.trim() === '') {
    return
  }

  try {
    const host = new URL(url.trim()).hostname
    const ref = host.split('.')[0]
    if (!ref) {
      return
    }

    const prefix = `sb-${ref}-`
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(prefix)) {
        keys.push(key)
      }
    }

    for (const key of keys) {
      localStorage.removeItem(key)
    }
  } catch {
    /* ignore */
  }
}
