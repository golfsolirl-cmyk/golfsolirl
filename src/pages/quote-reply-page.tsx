import { useMemo, useState } from 'react'
import { GeFooter } from './golf-experience/sections/ge-footer'
import { GeNavbar } from './golf-experience/sections/ge-navbar'

export function QuoteReplyPage() {
  const { token, choice, paid } = useMemo(() => {
    const path = window.location.pathname.replace(/\/+$/, '')
    const tokenPart = path.startsWith('/quote-reply/') ? path.slice('/quote-reply/'.length).split('/')[0] : ''
    const params = new URLSearchParams(window.location.search)
    const rawChoice = params.get('choice')
    return {
      token: tokenPart,
      choice: rawChoice === 'accept' || rawChoice === 'decline' ? rawChoice : null,
      paid: params.get('paid') === '1'
    }
  }, [])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(
    paid ? 'Thank you. If the payment went through, your receipt is on its way by email.' : null
  )

  const confirm = async () => {
    if (!token || !choice) return
    setBusy(true)
    setMessage(null)
    try {
      const res = await fetch('/api/desk-quote-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, decision: choice })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      setMessage(data.message || (res.ok ? 'Saved.' : 'Could not save that choice.'))
    } catch {
      setMessage('Could not reach the desk. Please try the email button again.')
    } finally {
      setBusy(false)
    }
  }

  const heading = paid
    ? 'Payment received'
    : choice === 'decline'
      ? 'Decline this quote?'
      : choice === 'accept'
        ? 'Accept this quote?'
        : 'Your Golf Sol quote'

  const lead = paid
    ? 'Keep an eye on your inbox for the receipt PDF.'
    : choice === 'decline'
      ? 'We will email a seven-day hold on this price, and a WhatsApp line if you want the week reshaped. The quote PDF stays attached.'
      : choice === 'accept'
        ? 'We will email a Pay now button and the invoice PDF. Nothing is charged on this page.'
        : 'Open the Accept or Decline button in your quote email.'

  return (
    <div className="ge-page flex min-h-screen flex-col bg-[#F4F7F5] text-forest-950">
      <GeNavbar />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-16" id="main">
        <section className="rounded-[2rem] border border-forest-100 bg-white p-7 shadow-soft sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Golf Sol Ireland</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-forest-950">{heading}</h1>
          <p className="mt-3 text-base leading-relaxed text-forest-800">{message || lead}</p>
          {choice && !paid && !message ? (
            <button
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-forest-900 px-6 py-3 text-base font-bold text-white hover:bg-forest-800 disabled:opacity-60"
              disabled={busy || !token}
              onClick={() => void confirm()}
              type="button"
            >
              {busy ? 'Sending…' : choice === 'accept' ? 'Yes, accept and email me the pay link' : 'Decline and hold the price for 7 days'}
            </button>
          ) : null}
        </section>
      </main>
      <GeFooter />
    </div>
  )
}
