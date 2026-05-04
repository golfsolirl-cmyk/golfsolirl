import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { clearSupabaseBrowserAuthStorage, getSupabaseBrowserClient } from '../lib/supabase-client'

export type ProfileRole = 'client' | 'admin'

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  /** Phone / WhatsApp; may be synced from enquiries or OAuth metadata. */
  phone: string | null
  role: ProfileRole
  /** Enquiry-style reference shown as “account number” on the client portal. */
  account_reference_id: string | null
  /** Admin enables the formal proposals list on the client dashboard. */
  portal_proposals_enabled: boolean
  /** Admin enables the “Your PDF library” (terms / thank-you) block when access rows exist. */
  portal_pdf_library_enabled: boolean
  /** After client completes one-time “How we reach you” on the dashboard; blocks enquiry auto-overwrite of name/phone. */
  portal_contact_completed_at: string | null
  created_at: string
  updated_at: string
}

interface AuthContextValue {
  readonly session: Session | null
  readonly user: User | null
  readonly profile: Profile | null
  readonly isLoading: boolean
  readonly isSupabaseConfigured: boolean
  readonly signInWithMagicLink: (
    email: string,
    options?: { readonly redirectTo?: string }
  ) => Promise<{ error: Error | null }>
  readonly signOut: () => Promise<void>
  readonly refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const profilesEqual = (a: Profile | null, b: Profile | null): boolean => {
  if (a === b) {
    return true
  }
  if (!a || !b) {
    return false
  }
  return (
    a.id === b.id &&
    a.email === b.email &&
    a.full_name === b.full_name &&
    a.phone === b.phone &&
    a.role === b.role &&
    a.account_reference_id === b.account_reference_id &&
    a.portal_proposals_enabled === b.portal_proposals_enabled &&
    a.portal_pdf_library_enabled === b.portal_pdf_library_enabled &&
    a.portal_contact_completed_at === b.portal_contact_completed_at &&
    a.created_at === b.created_at &&
    a.updated_at === b.updated_at
  )
}

const isAuthCallbackPath = () => {
  if (typeof window === 'undefined') {
    return false
  }

  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  return path === '/auth/callback'
}

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const sessionUserId = session?.user?.id

  const fetchProfileRow = useCallback(
    async (userId: string) => {
      if (!supabase) {
        return null
      }

      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

      if (error || !data) {
        return null
      }

      const row = data as Record<string, unknown>
      return {
        id: String(row.id),
        email: (row.email as string | null) ?? null,
        full_name: (row.full_name as string | null) ?? null,
        phone: (row.phone as string | null | undefined) ?? null,
        role: row.role as Profile['role'],
        account_reference_id: (row.account_reference_id as string | null | undefined) ?? null,
        portal_proposals_enabled: Boolean(row.portal_proposals_enabled),
        portal_pdf_library_enabled:
          typeof row.portal_pdf_library_enabled === 'boolean'
            ? Boolean(row.portal_pdf_library_enabled)
            : Boolean(row.portal_proposals_enabled),
        portal_contact_completed_at:
          row.portal_contact_completed_at != null ? String(row.portal_contact_completed_at) : null,
        created_at: String(row.created_at),
        updated_at: String(row.updated_at)
      }
    },
    [supabase]
  )

  const refreshProfile = useCallback(async () => {
    if (!supabase || !sessionUserId) {
      setProfile(null)
      return
    }

    const row = await fetchProfileRow(sessionUserId)
    setProfile((prev) => (profilesEqual(prev, row) ? prev : row))
  }, [sessionUserId, supabase, fetchProfileRow])

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    if (isAuthCallbackPath()) {
      return
    }

    let cancelled = false

    const settleProfile = async (nextSession: Session | null) => {
      if (!nextSession?.user) {
        setProfile(null)
        return
      }

      const row = await fetchProfileRow(nextSession.user.id)
      if (!cancelled) {
        setProfile((prev) => (profilesEqual(prev, row) ? prev : row))
      }
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (event === 'INITIAL_SESSION') {
        if (cancelled) {
          return
        }

        setSession(nextSession)

        if (!nextSession?.user) {
          setProfile(null)
          setIsLoading(false)
          return
        }

        await settleProfile(nextSession)
        if (!cancelled) {
          setIsLoading(false)
        }

        return
      }

      if (event === 'TOKEN_REFRESHED') {
        setSession(nextSession)
        return
      }

      if (event === 'SIGNED_OUT') {
        if (!cancelled) {
          setSession(null)
          setProfile(null)
          setIsLoading(false)
        }
        return
      }

      /**
       * SIGNED_IN, USER_UPDATED, MFA, etc. — never flip global `isLoading` here: that remounts the
       * whole dashboard behind `DashboardLoadingShell` and causes a visible jump after magic-link login.
       */
      if (!cancelled) {
        setSession(nextSession)
      }

      if (cancelled) {
        return
      }

      if (!nextSession?.user) {
        setProfile(null)
        setIsLoading(false)
        return
      }

      await settleProfile(nextSession)
      if (!cancelled) {
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfileRow])

  const signInWithMagicLink = useCallback(async (email: string, options?: { readonly redirectTo?: string }) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).') }
    }

    const fallback = `${window.location.origin}/auth/callback`
    const redirectTo =
      typeof options?.redirectTo === 'string' && options.redirectTo.trim() !== ''
        ? options.redirectTo.trim()
        : fallback

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
      try {
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.warn('[auth] signOut:', error.message)
        }
      } catch (err) {
        console.warn('[auth] signOut failed:', err)
      }
    }

    clearSupabaseBrowserAuthStorage()
    setProfile(null)

    if (typeof window !== 'undefined') {
      window.location.href = '/logged-out'
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
