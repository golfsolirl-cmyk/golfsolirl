import { useEffect, useState } from 'react'
import { PageIdentityBar } from '../components/page-identity-bar'
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

export function AuthCallbackPage() {
  const [message, setMessage] = useState('Completing sign-in…')

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    if (!supabase) {
      window.location.replace('/login?error=config')
      return
    }

    let cancelled = false

    const search = new URLSearchParams(window.location.search)
    const postLoginPath = resolvePostLoginPath(search)
    const oauthError = search.get('error')
    const oauthDescription = search.get('error_description')

    if (oauthError) {
      const hint = oauthDescription ? `&hint=${encodeURIComponent(oauthDescription)}` : ''
      window.location.replace(`/login?error=auth${hint}`)
      return
    }

    const replaceIfActive = (path: string) => {
      if (!cancelled) {
        window.location.replace(path)
      }
    }

    const finish = async () => {
      const readSession = async () => (await supabase.auth.getSession()).data.session

      let session = await readSession()
      if (cancelled) {
        return
      }

      if (session) {
        replaceIfActive(postLoginPath)
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
          replaceIfActive(postLoginPath)
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
          replaceIfActive(postLoginPath)
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
          replaceIfActive(postLoginPath)
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
        replaceIfActive(postLoginPath)
        return
      }

      replaceIfActive('/login?error=no_session')
    }

    void finish()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-forest-950 text-white">
      <PageIdentityBar
        compact
        label="Signing you in"
        eyebrow="Account access"
        description="We are completing your secure login and sending you to the right page."
      />
      <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center px-4 text-center">
        <p className="text-base font-medium tracking-[0.02em] text-white/84 sm:text-lg">{message}</p>
      </div>
    </div>
  )
}
