import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '../lib/supabase-client'

export type ProfileRole = 'client' | 'admin'

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  role: ProfileRole
  created_at: string
  updated_at: string
}

interface AuthContextValue {
  readonly session: Session | null
  readonly user: User | null
  readonly profile: Profile | null
  readonly isLoading: boolean
  readonly isSupabaseConfigured: boolean
  readonly signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>
  readonly signOut: () => Promise<void>
  readonly refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!supabase || !session?.user) {
      setProfile(null)
      return
    }

    const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()

    if (error || !data) {
      setProfile(null)
      return
    }

    setProfile(data as Profile)
  }, [session?.user, supabase])

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!cancelled) {
        setSession(data.session ?? null)
        setIsLoading(false)
      }
    }

    void init()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    void refreshProfile()
  }, [refreshProfile])

  const signInWithMagicLink = useCallback(async (email: string) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).') }
    }

    const redirectTo = `${window.location.origin}/auth/callback`

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), redirectTo })
      })

      const json = (await response.json().catch(() => ({}))) as { message?: string }

      if (!response.ok) {
        return { error: new Error(json.message ?? 'Could not send sign-in email.') }
      }

      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Network error') }
    }
  }, [supabase])

  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }

    setProfile(null)

    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }, [supabase])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isLoading,
      isSupabaseConfigured: Boolean(supabase),
      signInWithMagicLink,
      signOut,
      refreshProfile
    }),
    [session, profile, isLoading, supabase, signInWithMagicLink, signOut, refreshProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return ctx
}
