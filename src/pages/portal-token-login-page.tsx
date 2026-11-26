import { useMemo, useState, type FormEvent } from 'react'
import { Mail, ShieldCheck } from 'lucide-react'
import { PremiumHero, PremiumCard, PremiumPageShell } from '../components/premium'
import { GeButton } from '../pages/golf-experience/components/ge-button'

export function PortalTokenLoginPage() {
  const token = useMemo(() => {
    const parts = window.location.pathname.replace(/\/+$/, '').split('/')
    const idx = parts.indexOf('portal')
    return idx >= 0 && parts[idx + 1] ? decodeURIComponent(parts[idx + 1]) : ''
  }, [])

  const [sentTo, setSentTo] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const sendCode = async () => {
    setError(null)
    setBusy(true)
    try {
      const res = await fetch('/api/portal-otp-send', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string; sentTo?: string }
      if (!res.ok) {
        setError(data.message || 'Could not send a code just now.')
        return
      }
      setSentTo(data.sentTo ?? 'your inbox')
      setSent(true)
    } catch {
      setError('Network error. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const onVerify = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const res = await fetch('/api/portal-otp-verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, code: code.trim() })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      if (!res.ok) {
        setError(data.message || 'That code did not work.')
        return
      }
      window.location.replace('/dashboard')
    } catch {
      setError('Network error. Try again.')
    } finally {
      setBusy(false)
    }
  }

  if (!token) {
    return (
      <PremiumPageShell identityLabel="Trip desk" identityDescription="Personal Golf Sol Ireland trip desk link.">
        <main className="mx-auto max-w-xl px-6 py-24 text-center font-ge text-gs-dark">
          <p>This link is not valid.</p>
          <GeButton className="mt-6" href="/dashboard/login" variant="gs-green">
            Go to sign-in
          </GeButton>
        </main>
      </PremiumPageShell>
    )
  }

  return (
    <PremiumPageShell identityLabel="Trip desk" identityDescription="Open your Costa del Sol trip desk.">
      <PremiumHero
        body="We will email a short code to the address on your enquiry. Enter it here to open your trip desk."
        headlineAccent="desk."
        headlinePrimary="Your trip"
        kicker="Client"
        kickerIcon={ShieldCheck}
        lead="Private link · Email code · Secure session"
        variant="login"
      />
      <main className="relative z-[1] mx-auto w-full max-w-2xl flex-1 px-5 pb-20 pt-12 sm:px-8">
        <PremiumCard tone="light">
          {error ? (
            <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
              {error}
            </p>
          ) : null}

          {!sent ? (
            <div className="space-y-5">
              <p className="font-ge text-base leading-relaxed text-ge-gray600">
                Tap below and we will send a 6-digit code. It expires in 10 minutes.
              </p>
              <GeButton className="w-full gap-2" disabled={busy} onClick={() => void sendCode()} variant="gs-green">
                <Mail className="h-4 w-4" aria-hidden />
                {busy ? 'Sending…' : 'Email me a sign-in code'}
              </GeButton>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={onVerify}>
              <p className="font-ge text-sm text-ge-gray600">
                Code sent to <span className="font-semibold text-gs-dark">{sentTo}</span>. Check spam if needed.
              </p>
              <div>
                <label className="mb-2 block font-ge text-sm font-bold uppercase tracking-[0.14em] text-gs-dark" htmlFor="portal-code">
                  6-digit code
                </label>
                <input
                  autoComplete="one-time-code"
                  className="w-full rounded-xl border-2 border-ge-gray200 bg-white px-4 py-3.5 font-mono text-xl tracking-[0.35em] text-gs-dark outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-600/20"
                  id="portal-code"
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  value={code}
                />
              </div>
              <GeButton className="w-full" disabled={busy || code.length !== 6} type="submit" variant="gs-green">
                {busy ? 'Checking…' : 'Open my trip desk'}
              </GeButton>
              <button
                className="w-full font-ge text-sm font-semibold text-forest-800 underline underline-offset-2"
                disabled={busy}
                onClick={() => void sendCode()}
                type="button"
              >
                Send another code
              </button>
            </form>
          )}

          <div className="mt-8 border-t border-gs-green/15 pt-6">
            <GeButton href="/" size="sm" variant="outline-gs-green">
              Back to the homepage
            </GeButton>
          </div>
        </PremiumCard>
      </main>
    </PremiumPageShell>
  )
}