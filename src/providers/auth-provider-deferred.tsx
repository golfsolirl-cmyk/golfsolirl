import type { SupabaseClient } from '@supabase/supabase-js'
import { useEffect, useState, type ReactNode } from 'react'
import { AuthProviderImpl } from './auth-state'

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = (): void => {
      void import('../lib/supabase-client').then((m) => {
        if (!cancelled) {
          setSupabase(m.getSupabaseBrowserClient())
        }
      })
    }

    if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(load, { timeout: 2200 })
      return () => {
        cancelled = true
        window.cancelIdleCallback(id)
      }
    }

    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      const id = window.requestAnimationFrame(load)
      return () => {
        cancelled = true
        window.cancelAnimationFrame(id)
      }
    }

    const timeoutId = setTimeout(load, 0)
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [])

  return <AuthProviderImpl supabase={supabase}>{children}</AuthProviderImpl>
}
