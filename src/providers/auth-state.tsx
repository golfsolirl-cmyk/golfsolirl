import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, SupabaseClient, User } from '@supabase/supabase-js'
import { IdleSessionLogout } from '../components/idle-session-logout'
import { clearSupabaseBrowserAuthStorage } from '../lib/supabase-clear-storage'

export type ProfileRole = 'client' | 'admin' | 'driver'

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  /** Phone / WhatsApp; may be synced from enquiries or OAuth metadata. */
  phone: string | null
  /** Normalized mobile key for dedupe (server); optional until migration applied. */
  phone_e164?: string | null
  role: ProfileRole
  /** Enquiry-style reference shown as “account number” on the client portal. */
  account_reference_id: string | null
  /** Admin enables the formal proposals list on the client portal. */
  portal_proposals_enabled: boolean
  /** Admin enables the “Your PDF library” (terms / thank-you) block when access rows exist. */
  portal_pdf_library_enabled: boolean
  /** Admin unlocks Club Concierge (hotel fitting desk) in Perks & deals. */
  portal_club_concierge_enabled: boolean
  /** After client completes one-time “How we reach you” on the dashboard; blocks enquiry auto-overwrite of name/phone. */
  portal_contact_completed_at: string | null
  /** After admin clears portal — hide enquiry snapshots / form echo on the dashboard until re-enabled. */
  portal_enquiry_autofill_disabled?: boolean
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
    options?: {
      readonly redirectTo?: string
      readonly portal?: 'client' | 'admin' | 'driver'
      readonly operatorCode?: string
    }
  ) => Promise<{ error: Error | null }>
  readonly signOut: (options?: { readonly reason?: 'idle' | 'manual' }) => Promise<void>
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
    a.portal_club_concierge_enabled === b.portal_club_concierge_enabled &&
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

export function AuthProviderImpl({
  supabase,
  children
}: {
  readonly supabase: SupabaseClient | null
  readonly children: ReactNode
}) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const sessionUserId = session?.user?.id

  useEffect(() => {
    if (!supabase) return
    setIsLoading(true)
  }, [supabase])

  const mapProfileRow = useCallback((row: Record<string, unknown>): Profile => {
    const rawRole = row.role
    const role: Profile['role'] =
      rawRole === 'admin' || rawRole === 'client' || rawRole === 'driver' ? rawRole : 'client'
    return {
      id: String(row.id),
      email: (row.email as string | null) ?? null,
      full_name: (row.full_name as string | null) ?? null,
      phone: (row.phone as string | null | undefined) ?? null,
      role,
      account_reference_id: (row.account_reference_id as string | null | undefined) ?? null,
      portal_proposals_enabled: Boolean(row.portal_proposals_enabled),
      portal_pdf_library_enabled:
        typeof row.portal_pdf_library_enabled === 'boolean'
          ? Boolean(row.portal_pdf_library_enabled)
          : Boolean(row.portal_proposals_enabled),
      portal_club_concierge_enabled: Boolean(row.portal_club_concierge_enabled),
      portal_contact_completed_at:
        row.portal_contact_completed_at != null ? String(row.portal_contact_completed_at) : null,
      portal_enquiry_autofill_disabled:
        typeof row.portal_enquiry_autofill_disabled === 'boolean'
          ? Boolean(row.portal_enquiry_autofill_disabled)
          : false,
      created_at: String(row.created_at),
      updated_at: String(row.updated_at)
    }
  }, [])

  const fetchProfileRow = useCallback(
    async (userId: string, accessToken?: string | null) => {
      if (!supabase) {
        return null
      }

      if (accessToken) {
        try {
          const response = await fetch('/api/profile-me', {
            headers: { Authorization: `Bearer ${accessToken}` }
          })
          if (response.ok) {
            const json = (await response.json()) as { profile?: Record<string, unknown> }
            if (json.profile && String(json.profile.id) === userId) {
              return mapProfileRow(json.profile)
            }
          }
        } catch {
          /* fall back to direct Supabase read */
        }
      }

      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()

      if (error || !data) {
        return null
      }

      return mapProfileRow(data as Record<string, unknown>)
    },
    [supabase, mapProfileRow]
  )

  const refreshProfile = useCallback(async () => {
    if (!supabase || !sessionUserId) {
      setProfile(null)
      return
    }

    const row = await fetchProfileRow(sessionUserId, session?.access_token)
    setProfile((prev) => (profilesEqual(prev, row) ? prev : row))
  }, [sessionUserId, session?.access_token, supabase, fetchProfileRow])

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

      const row = await fetchProfileRow(nextSession.user.id, nextSession.access_token)
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

  const signInWithMagicLink = useCallback(
    async (
      email: string,
      options?: {
        readonly redirectTo?: string
        readonly portal?: 'client' | 'admin' | 'driver'
        readonly operatorCode?: string
      }
    ) => {
      if (!supabase) {
        return { error: new Error('Supabase is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).') }
      }

      const fallback = `${window.location.origin}/auth/callback`
      const redirectTo =
        typeof options?.redirectTo === 'string' && options.redirectTo.trim() !== ''
          ? options.redirectTo.trim()
          : fallback

      try {
        const portal = options?.portal
        const operatorCode = options?.operatorCode
        const body: Record<string, string> = {
          email: email.trim().toLowerCase(),
          redirectTo
        }
        if (portal) {
          body.portal = portal
        }
        if (portal === 'admin') {
          body.operatorCode = typeof operatorCode === 'string' ? operatorCode.trim() : ''
        }
        const response = await fetch('/api/auth/magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })

        const json = (await response.json().catch(() => ({}))) as { message?: string }

        if (!response.ok) {
          return { error: new Error(json.message ?? 'Could not send sign-in email.') }
        }

        return { error: null }
      } catch (err) {
        return { error: err instanceof Error ? err : new Error('Network error') }
      }
    },
    [supabase]
  )

  const signOut = useCallback(async (options?: { readonly reason?: 'idle' | 'manual' }) => {
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
      const reason = options?.reason === 'idle' ? 'idle' : ''
      window.location.href = reason ? `/logged-out?reason=${encodeURIComponent(reason)}` : '/logged-out'
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

  return (
    <AuthContext.Provider value={value}>
      <IdleSessionLogout />
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return ctx
}
