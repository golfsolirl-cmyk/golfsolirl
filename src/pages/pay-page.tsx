import { useEffect, useMemo, useState } from 'react'
import { GeFooter } from './golf-experience/sections/ge-footer'
import { GeNavbar } from './golf-experience/sections/ge-navbar'

type PayPayload = {
  ok?: boolean
  reference?: string
  title?: string
  amountLabel?: string
  status?: string
  monzo?: {
    accountName: string
    bankName: string
    iban: string
    ibanDisplay: string
    bic: string
    paymentReference?: string | null
  } | null
  secondary?: { revolutUrl?: string | null; bankNote?: string | null }
  stripeCheckoutUrl?: string | null
  message?: string
}

async function payApi(token: string, action: string) {
  const res = await fetch('/api/monzo-pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, action })
  })
  const data = (await res.json().catch(() => ({}))) as PayPayload & { message?: string }
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

/**
 * Public Monzo pay page (TOW Revolut pay-page replica).
 * Booking reference is the payment reference.
 */
export function PayPage() {
  const token = useMemo(() => {
    const path = window.location.pathname.replace(/\/+$/, '')
    return path.startsWith('/pay/') ? path.slice('/pay/'.length).split('/')[0] : ''
  }, [])
  const [data, setData] = useState<PayPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState('')
  const [flash, setFlash] = useState<string | null>(null)
  const paidParam = useMemo(() => new URLSearchParams(window.location.search).get('paid') === '1', [])

  useEffect(() => {
    document.title = 'Pay · Golf Sol Ireland'
    if (!token) {
      setError('This pay link is not valid.')
      return
    }
    let cancelled = false
    void (async () => {
      try {
        const payload = await payApi(token, 'get')
        if (!cancelled) setData(payload)
        void payApi(token, 'opened').catch(() => {})
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load pay details.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  const reportPaid = async () => {
    setBusy('report')
    setFlash(null)
    try {
      const res = await payApi(token, 'report_paid')
      setFlash(res.message || 'Thanks — we told the desk.')
      setData((d) => (d ? { ...d, status: 'customer_reported' } : d))
    } catch (e) {
      setFlash(e instanceof Error ? e.message : 'Could not send.')
    } finally {
      setBusy('')
    }
  }

  const emailDetails = async () => {
    setBusy('email')
    setFlash(null)
    try {
      const res = await payApi(token, 'email_details')
      setFlash(res.message || 'Details emailed.')
    } catch (e) {
      setFlash(e instanceof Error ? e.message : 'Could not email details.')
    } finally {
      setBusy('')
    }
  }

  const m = data?.monzo

  return (
    <div className="ge-page flex min-h-screen flex-col bg-[#F4F7F5] text-gs-dark">
      <GeNavbar />
      <main
        id="main"
        className="ge-pad-under-fixed-header mx-auto w-full max-w-lg flex-1 px-4 pb-8 sm:px-6 sm:pb-10"
      >
        <p className="font-ge text-[0.75rem] font-extrabold uppercase tracking-[0.14em] text-brand-700">
          Golf Sol Ireland · Pay
        </p>
        <h1 className="mt-1 font-ge text-3xl font-extrabold text-gs-dark">How to pay</h1>
        {paidParam ? (
          <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            If your card payment went through, your receipt is on its way by email.
          </p>
        ) : null}
        {error ? <p className="mt-4 text-rose-700">{error}</p> : null}
        {!data && !error ? <p className="mt-6 text-slate-500">Loading payment details…</p> : null}
        {data ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{data.title}</p>
              <p className="mt-1 font-ge text-3xl font-extrabold">{data.amountLabel}</p>
              <p className="mt-2 font-mono text-sm text-slate-600">Ref {data.reference}</p>
              <p className="mt-1 text-sm capitalize text-slate-500">{(data.status || '').replace(/_/g, ' ')}</p>
            </div>

            {m ? (
              <div className="rounded-2xl border border-gs-green/20 bg-white p-5 shadow-sm">
                <p className="font-ge text-sm font-extrabold uppercase tracking-[0.12em] text-gs-green">
                  Monzo bank transfer
                </p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="text-slate-500">Account name</dt>
                    <dd className="font-semibold">{m.accountName}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Bank</dt>
                    <dd className="font-semibold">{m.bankName}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">IBAN</dt>
                    <dd className="font-mono font-semibold">{m.ibanDisplay || m.iban}</dd>
                  </div>
                  {m.bic ? (
                    <div>
                      <dt className="text-slate-500">BIC</dt>
                      <dd className="font-mono font-semibold">{m.bic}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="text-slate-500">Payment reference</dt>
                    <dd className="font-mono font-extrabold text-gs-dark">{data.reference}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-sm text-slate-600">
                  Use the reference exactly so we can match your payment. All payments are handled in Ireland.
                </p>
              </div>
            ) : (
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950">
                Monzo details are not configured yet. WhatsApp the desk and quote reference {data.reference}.
              </p>
            )}

            {data.secondary?.revolutUrl ? (
              <a
                href={data.secondary.revolutUrl}
                className="block rounded-xl border border-slate-300 bg-white px-4 py-3 text-center font-semibold text-gs-dark"
              >
                Pay with Revolut (optional)
              </a>
            ) : null}
            {data.stripeCheckoutUrl ? (
              <a
                href={data.stripeCheckoutUrl}
                className="block rounded-xl bg-gs-dark px-4 py-3 text-center font-semibold text-white"
              >
                Pay by card (optional)
              </a>
            ) : null}

            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={busy !== '' || data.status === 'paid'}
                onClick={() => void reportPaid()}
                className="min-h-[52px] rounded-xl bg-gs-green px-4 font-ge font-extrabold text-white disabled:opacity-50"
              >
                {busy === 'report' ? 'Sending…' : 'I’ve paid'}
              </button>
              <button
                type="button"
                disabled={busy !== ''}
                onClick={() => void emailDetails()}
                className="min-h-[48px] rounded-xl border border-slate-300 bg-white px-4 font-semibold text-gs-dark disabled:opacity-50"
              >
                {busy === 'email' ? 'Sending…' : 'Email me these details'}
              </button>
            </div>
            {flash ? <p className="text-sm text-emerald-800">{flash}</p> : null}
          </div>
        ) : null}
      </main>
      <GeFooter />
    </div>
  )
}
