import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

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
        detectSessionInUrl: true,
        persistSession: true,
        storage: localStorage
      }
    })
  }

  return browserClient
}
