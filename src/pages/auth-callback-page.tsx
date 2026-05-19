import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { PageIdentityBar } from '../components/page-identity-bar'
import { GeFooter } from '../pages/golf-experience/sections/ge-footer'
import { GeNavbar } from '../pages/golf-experience/sections/ge-navbar'
import { AUTH_NEXT_STORAGE_KEY, isSafeInternalPath } from '../lib/internal-redirect'
import { getSupabaseBrowserClient } from '../lib/supabase-client'

const emailOtpTypes = ['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email'] as const

const isEmailOtpType = (value: string): value is (typeof emailOtpTypes)[number] =>
  (emailOtpTypes as readonly string[]).includes(value)

const parseHashParams = (): Record<string, string> => {
  const raw = window.location.hash.replace(/^#/, '')
  if (!raw) {
    return {}
  }

  return Object.fromEntries(new URLSearchParams(raw))
}

const resolvePostLoginPath = (search: URLSearchParams): string => {
  const fromQuery = search.get('next') ?? ''
  let fromStorage = ''
  try {
    fromStorage = sessionStorage.getItem(AUTH_NEXT_STORAGE_KEY) ?? ''
    sessionStorage.removeItem(AUTH_NEXT_STORAGE_KEY)
  } catch {
    /* private mode */
  }

  const candidate = fromQuery || fromStorage
  if (candidate && isSafeInternalPath(candidate)) {
    return candidate
  }

  return '/dashboard'
}

/** Copy enquiry name/phone onto the profile before the dashboard renders (magic-link after form submit). */
const syncPortalProfileAfterLogin = async (session: Session) => {
  try {
    await fetch('/api/sync-portal-profile', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
  } catch {
    /* offline or API unavailable */
  }
}

export function AuthCallbackPage() {
  const [message, setMessage] = useState('Completing sign-in…')

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    if (!supabase) {
      window.location.replace('/dashboard/login?error=config')
      return
    }

    let cancelled = false

    const search = new URLSearchParams(window.location.search)
    const postLoginPath = resolvePostLoginPath(search)
    const oauthError = search.get('error')
    const oauthDescription = search.get('error_description')

    if (oauthError) {
      const hint = oauthDescription ? `&hint=${encodeURIComponent(oauthDescription)}` : ''
      window.location.replace(`/dashboard/login?error=auth${hint}`)
      return
    }

    const replaceIfActive = (path: string) => {
      if (!cancelled) {
        window.location.replace(path)
      }
    }

    const redirectAfterSession = async (session: Session, path: string) => {
      await syncPortalProfileAfterLogin(session)
      replaceIfActive(path)
    }

    const finish = async () => {
      const readSession = async () => (await supabase.auth.getSession()).data.session

      let session = await readSession()
      if (cancelled) {
        return
      }

      if (session) {
        await redirectAfterSession(session, postLoginPath)
        return
      }

      const code = search.get('code')
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          console.error('[auth-callback] exchangeCodeForSession:', exchangeError.message)
        }
        if (cancelled) {
          return
        }
        session = await readSession()
        if (session) {
          await redirectAfterSession(session, postLoginPath)
          return
        }
      }

      const tokenHash = search.get('token_hash')
      const typeParam = search.get('type')
      if (tokenHash && typeParam && isEmailOtpType(typeParam)) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: typeParam
        })
        if (verifyError) {
          console.error('[auth-callback] verifyOtp:', verifyError.message)
        }
        if (cancelled) {
          return
        }
        session = await readSession()
        if (session) {
          await redirectAfterSession(session, postLoginPath)
          return
        }
      }

      const hashParams = parseHashParams()
      const accessToken = hashParams.access_token
      const refreshToken = hashParams.refresh_token
      if (accessToken && refreshToken) {
        const { error: setError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })
        if (setError) {
          console.error('[auth-callback] setSession:', setError.message)
        }
        if (cancelled) {
          return
        }
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
        session = await readSession()
        if (session) {
          await redirectAfterSession(session, postLoginPath)
          return
        }
      }

      setMessage('Still checking…')
      await new Promise((r) => setTimeout(r, 500))
      if (cancelled) {
        return
      }
      session = await readSession()
      if (session) {
        await redirectAfterSession(session, postLoginPath)
        return
      }

      replaceIfActive('/dashboard/login?error=no_session')
    }

    void finish()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="ge-page flex min-h-screen flex-col overflow-x-hidden bg-white font-ge text-gs-dark">
      <GeNavbar />
      <PageIdentityBar
        compact
        label="Signing you in"
        eyebrow="Account access"
        description="We are completing your secure login and sending you to the right page."
        offsetHeader
        tone="ge"
      />
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
        <p className="max-w-md font-ge text-base font-medium leading-8 text-ge-gray600 sm:text-lg">{message}</p>
      </div>
      <GeFooter />
    </div>
  )
}
