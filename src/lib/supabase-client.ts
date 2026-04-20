import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

/** One in-tab queue for all GoTrue lock callbacks — avoids Navigator Lock "stolen" when refresh, listeners, and signOut overlap */
let authLockTail: Promise<void> = Promise.resolve()

const serializedAuthLock = <R,>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> => {
  const run = authLockTail.then(() => fn())
  authLockTail = run.then(
    () => undefined,
    () => undefined
  )
  return run
}

const isAuthCallbackPathname = (pathname: string) => {
  const path = pathname.replace(/\/+$/, '') || '/'
  return path === '/auth/callback'
}

/** Clears persisted Supabase session keys for this project (fallback if signOut fails or throws). */
export const clearSupabaseBrowserAuthStorage = () => {
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

export const getSupabaseBrowserClient = (): SupabaseClient | null => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (typeof url !== 'string' || url.trim() === '' || typeof key !== 'string' || key.trim() === '') {
    return null
  }

  if (!browserClient) {
    browserClient = createClient(url.trim(), key.trim(), {
      auth: {
        // Implicit works when the user opens the magic link on another device or mail client
        // in-app browser; PKCE requires the same browser tab that requested the link.
        flowType: 'implicit',
        lock: serializedAuthLock,
        detectSessionInUrl: (link) => isAuthCallbackPathname(link.pathname),
        persistSession: true,
        storage: localStorage
      }
    })
  }

  return browserClient
}
