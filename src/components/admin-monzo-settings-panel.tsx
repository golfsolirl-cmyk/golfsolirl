import { useCallback, useEffect, useState } from 'react'
import { Building2, Save } from 'lucide-react'
import { LuxuryButton } from './ui/button'

type AdminMonzoSettingsPanelProps = {
  readonly accessToken: string | null
}

type RawSettings = {
  monzo_account_name: string
  monzo_bank_name: string
  monzo_iban: string
  monzo_bic: string
  monzo_iban_display: string
}

export function AdminMonzoSettingsPanel({ accessToken }: AdminMonzoSettingsPanelProps) {
  const [form, setForm] = useState<RawSettings>({
    monzo_account_name: 'Gregory Mc Donald',
    monzo_bank_name: 'Monzo Bank',
    monzo_iban: 'IE07MONZ91004078972387',
    monzo_bic: 'MONZIE22',
    monzo_iban_display: 'IE07 MONZ 9100 4078 9723 87'
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    if (!accessToken) {
      setError('Sign in again as admin.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/site-payment-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ action: 'get' })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string; raw?: RawSettings }
      if (!res.ok) {
        throw new Error(data.message || 'Unable to load Monzo settings.')
      }
      if (data.raw) {
        setForm({
          monzo_account_name: data.raw.monzo_account_name ?? '',
          monzo_bank_name: data.raw.monzo_bank_name?.trim() || 'Monzo Bank',
          monzo_iban: data.raw.monzo_iban ?? '',
          monzo_bic: data.raw.monzo_bic ?? '',
          monzo_iban_display: data.raw.monzo_iban_display ?? ''
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load Monzo settings.')
    } finally {
      setBusy(false)
    }
  }, [accessToken])

  useEffect(() => {
    void load()
  }, [load])

  const save = async () => {
    if (!accessToken) {
      setError('Sign in again as admin.')
      return
    }
    setBusy(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch('/api/site-payment-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          action: 'update',
          monzoAccountName: form.monzo_account_name,
          monzoBankName: form.monzo_bank_name,
          monzoIban: form.monzo_iban,
          monzoBic: form.monzo_bic,
          monzoIbanDisplay: form.monzo_iban_display
        })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string; raw?: RawSettings }
      if (!res.ok) {
        throw new Error(data.message || 'Save failed.')
      }
      if (data.raw) {
        setForm({
          monzo_account_name: data.raw.monzo_account_name ?? '',
          monzo_bank_name: data.raw.monzo_bank_name?.trim() || 'Monzo Bank',
          monzo_iban: data.raw.monzo_iban ?? '',
          monzo_bic: data.raw.monzo_bic ?? '',
          monzo_iban_display: data.raw.monzo_iban_display ?? ''
        })
      }
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-[1.75rem] border-2 border-brand-700/35 bg-white p-5 shadow-soft sm:p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-white">
          <Building2 aria-hidden className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">Bank transfer</p>
          <h3 className="font-display mt-1 text-xl font-semibold text-forest-950">Monzo payment details</h3>
          <p className="mt-1 text-sm leading-relaxed text-forest-600">
            Shown to guests on the client portal when filled in. Leave blank until you are ready — the pay card stays hidden.
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-sm font-medium text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="mt-4 text-sm font-medium text-fairway-900" role="status">
          Saved. Client bank-transfer card updates on next load.
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700" htmlFor="monzo-account-name">
            Account name
          </label>
          <input
            className="w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
            id="monzo-account-name"
            onChange={(e) => setForm((f) => ({ ...f, monzo_account_name: e.target.value }))}
            value={form.monzo_account_name}
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700" htmlFor="monzo-bank-name">
            Bank name
          </label>
          <input
            className="w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
            id="monzo-bank-name"
            onChange={(e) => setForm((f) => ({ ...f, monzo_bank_name: e.target.value }))}
            value={form.monzo_bank_name}
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700" htmlFor="monzo-bic">
            BIC
          </label>
          <input
            className="w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 font-mono text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
            id="monzo-bic"
            onChange={(e) => setForm((f) => ({ ...f, monzo_bic: e.target.value }))}
            value={form.monzo_bic}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700" htmlFor="monzo-iban">
            IBAN (no spaces)
          </label>
          <input
            className="w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 font-mono text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
            id="monzo-iban"
            onChange={(e) => setForm((f) => ({ ...f, monzo_iban: e.target.value }))}
            spellCheck={false}
            value={form.monzo_iban}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700" htmlFor="monzo-iban-display">
            IBAN display (optional spacing for guests)
          </label>
          <input
            className="w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 font-mono text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
            id="monzo-iban-display"
            onChange={(e) => setForm((f) => ({ ...f, monzo_iban_display: e.target.value }))}
            placeholder="Auto-generated from IBAN if left blank"
            spellCheck={false}
            value={form.monzo_iban_display}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <LuxuryButton disabled={busy} onClick={() => void save()} type="button" variant="primary">
          <span className="inline-flex items-center gap-2">
            <Save aria-hidden className="h-4 w-4" />
            {busy ? 'Saving…' : 'Save Monzo details'}
          </span>
        </LuxuryButton>
      </div>
    </section>
  )
}