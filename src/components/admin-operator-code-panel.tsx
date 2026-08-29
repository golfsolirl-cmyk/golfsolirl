import { useCallback, useEffect, useState } from 'react'
import { Copy, Eye, EyeOff, KeyRound } from 'lucide-react'
import { cx } from '../lib/utils'

type AdminOperatorCodePanelProps = {
  readonly accessToken: string | null
}

export function AdminOperatorCodePanel({ accessToken }: AdminOperatorCodePanelProps) {
  const [code, setCode] = useState('')
  const [configured, setConfigured] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    if (!accessToken) {
      setError('Sign in again as admin.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/admin-portal-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ action: 'operator_code' })
      })
      const data = (await res.json().catch(() => ({}))) as {
        message?: string
        configured?: boolean
        operatorCode?: string
      }
      if (!res.ok) {
        throw new Error(data.message || 'Unable to load the operator code.')
      }
      setConfigured(Boolean(data.configured))
      setCode(typeof data.operatorCode === 'string' ? data.operatorCode : '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load the operator code.')
      setConfigured(false)
      setCode('')
    } finally {
      setBusy(false)
    }
  }, [accessToken])

  useEffect(() => {
    void load()
  }, [load])

  const copyCode = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Unable to copy the code.')
    }
  }

  return (
    <section className="rounded-[1.75rem] border-2 border-brand-700/35 bg-white p-5 shadow-soft sm:p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-white">
          <KeyRound aria-hidden className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">Admin sign-in</p>
          <h3 className="font-display mt-1 text-xl font-semibold text-forest-950">Operator code</h3>
          <p className="mt-1 text-sm leading-relaxed text-forest-600">
            Needed on <span className="font-medium text-forest-800">/dashboard/admin/login</span> with the operator inbox.
            Hidden until you choose to view it.
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-sm font-medium text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-4 rounded-2xl border border-forest-100 bg-offwhite/80 px-4 py-3">
        {busy && !code && !error ? (
          <p className="text-sm text-forest-600">Loading…</p>
        ) : !configured ? (
          <p className="text-sm text-forest-700">No operator code is set on the server.</p>
        ) : (
          <p className="break-all font-mono text-lg font-semibold tracking-wide text-forest-950">
            {revealed ? code : '•'.repeat(Math.min(Math.max(code.length, 8), 24))}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className={cx(
            'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold',
            'bg-forest-900 text-white hover:bg-forest-800 disabled:opacity-50'
          )}
          disabled={busy || !configured}
          onClick={() => setRevealed((open) => !open)}
          type="button"
        >
          {revealed ? <EyeOff aria-hidden className="h-4 w-4" /> : <Eye aria-hidden className="h-4 w-4" />}
          {revealed ? 'Hide code' : 'Show code'}
        </button>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-forest-200 bg-white px-5 py-2.5 text-sm font-semibold text-forest-900 hover:bg-cream disabled:opacity-50"
          disabled={busy || !configured || !code}
          onClick={() => void copyCode()}
          type="button"
        >
          <Copy aria-hidden className="h-4 w-4" />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </section>
  )
}
