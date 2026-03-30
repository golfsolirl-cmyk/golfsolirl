import { useEffect, useState } from 'react'
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

export function AuthCallbackPage() {
  const [message, setMessage] = useState('Completing sign-in…')

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    if (!supabase) {
      window.location.replace('/login?error=config')
      return
    }

    const search = new URLSearchParams(window.location.search)
    const oauthError = search.get('error')
    const oauthDescription = search.get('error_description')

    if (oauthError) {
      const hint = oauthDescription ? `&hint=${encodeURIComponent(oauthDescription)}` : ''
      window.location.replace(`/login?error=auth${hint}`)
      return
    }

    const finish = async () => {
      await supabase.auth.initialize()

      const readSession = async () => (await supabase.auth.getSession()).data.session

      let session = await readSession()
      if (session) {
        window.location.replace('/dashboard')
        return
      }

      const code = search.get('code')
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          console.error('[auth-callback] exchangeCodeForSession:', exchangeError.message)
        }
        session = await readSession()
        if (session) {
          window.location.replace('/dashboard')
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
        session = await readSession()
        if (session) {
          window.location.replace('/dashboard')
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
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
        session = await readSession()
        if (session) {
          window.location.replace('/dashboard')
          return
        }
      }

      setMessage('Still checking…')
      await new Promise((r) => setTimeout(r, 500))
      session = await readSession()
      if (session) {
        window.location.replace('/dashboard')
        return
      }

      window.location.replace('/login?error=no_session')
    }

    void finish()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        window.location.replace('/dashboard')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-forest-950 px-4 text-sm text-white/80">
      <p>{message}</p>
    </div>
  )
}
