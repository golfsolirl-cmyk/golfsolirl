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

/** Re-export for legacy imports; prefer `./supabase-clear-storage` in new code. */
export { clearSupabaseBrowserAuthStorage } from './supabase-clear-storage'

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
        // Must be true (or match any path that carries #access_token): Supabase often redirects
        // to Site URL root with tokens in the hash; a pathname-only check misses those.
        detectSessionInUrl: true,
        persistSession: true,
        storage: localStorage
      }
    })
  }

  return browserClient
}
