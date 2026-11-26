import { useEffect, useMemo, useState } from 'react'
import { TowAdminShell } from '../../components/tow-admin/tow-admin-bar'
import { ensureAdminSession } from '../../lib/tow-admin-api'

const TEMPLATES: { id: string; label: string }[] = [
  { id: 'enquiry-customer', label: 'Enquiry confirmation (client)' },
  { id: 'enquiry-admin', label: 'New enquiry (admin)' },
  { id: 'offer-transfers', label: 'Quote — transfers' },
  { id: 'offer-accommodation', label: 'Quote — accommodation' },
  { id: 'offer-golf', label: 'Quote — golf' },
  { id: 'payment-request', label: 'Payment request (Monzo)' },
  { id: 'payment-receipt', label: 'Payment received receipt' },
  { id: 'portal-access', label: 'Portal access link' },
  { id: 'trip-step-update', label: 'Trip tracker step update' },
  { id: 'invoice-receipt', label: 'Invoice / receipt' },
  { id: 'form-autoresponse', label: 'Form auto-response' },
  { id: 'sign-in', label: 'Sign-in / magic link' }
]

export function TowAdminEmailsPage() {
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState(TEMPLATES[0].id)
  const [width, setWidth] = useState<'desktop' | 'mobile'>('desktop')

  useEffect(() => {
    document.title = 'Email templates · Admin · Golf Sol Ireland'
    let cancelled = false
    void (async () => {
      const ok = await ensureAdminSession('/admin/emails')
      if (!cancelled) setReady(Boolean(ok))
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const src = useMemo(() => `/api/email-preview-html?t=${encodeURIComponent(active)}`, [active])
  const meta = TEMPLATES.find((t) => t.id === active) || TEMPLATES[0]

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">Loading…</div>
  }

  return (
    <TowAdminShell active="emails">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-ge text-3xl font-extrabold text-gs-dark">Email templates</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            TOW-style lean layout, Golf Sol crest and greens. Sample data only — no invented live prices.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setWidth('desktop')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${width === 'desktop' ? 'bg-gs-dark text-white' : 'border border-slate-300'}`}
          >
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setWidth('mobile')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${width === 'mobile' ? 'bg-gs-dark text-white' : 'border border-slate-300'}`}
          >
            390px
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="space-y-1" aria-label="Email templates">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${
                active === t.id ? 'bg-gs-green text-white' : 'bg-white text-gs-dark ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
          <p className="font-ge text-sm font-bold text-slate-500">{meta.label}</p>
          <div className="mt-4 flex justify-center overflow-auto rounded-xl bg-slate-100 p-4">
            <iframe
              title={meta.label}
              src={src}
              className="min-h-[720px] rounded-lg border-0 bg-white shadow"
              style={{ width: width === 'mobile' ? 390 : '100%', maxWidth: width === 'desktop' ? 680 : 390 }}
            />
          </div>
        </section>
      </div>
    </TowAdminShell>
  )
}
