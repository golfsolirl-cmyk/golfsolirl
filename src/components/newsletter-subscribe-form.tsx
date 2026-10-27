import { FormEvent, useState } from 'react'
import { GeButton } from '../pages/golf-experience/components/ge-button'

const labelClass =
  'mb-1.5 block font-ge text-[0.88rem] font-bold uppercase tracking-[0.14em] text-ge-gray500 sm:text-[0.92rem]'
const inputClass =
  'h-12 w-full rounded-xl border border-ge-gray200 bg-white px-3.5 font-ge text-[1.02rem] text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25 sm:text-[1.04rem]'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function NewsletterSubscribeForm({
  title,
  lead
}: {
  readonly title: string
  readonly lead: string
}) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const mail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      setStatus('error')
      setMessage('Enter a valid email address.')
      return
    }
    if (!consent) {
      setStatus('error')
      setMessage('Tick the box so we can email you updates.')
      return
    }

    setStatus('submitting')
    setMessage(null)
    try {
      const response = await fetch('/api/newsletter-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: mail,
          fullName: fullName.trim(),
          consent: true,
          sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/newsletter'
        })
      })
      const data = (await response.json().catch(() => ({}))) as { message?: string }
      if (!response.ok) {
        setStatus('error')
        setMessage(data.message ?? 'Could not subscribe just now. Try again in a moment.')
        return
      }
      setStatus('success')
      setMessage(data.message ?? 'You are subscribed.')
      setEmail('')
      setFullName('')
      setConsent(false)
    } catch {
      setStatus('error')
      setMessage('Could not subscribe just now. Try again in a moment.')
    }
  }

  return (
    <div
      id="ge-enquiry-form"
      className="rounded-[1.75rem] border border-gs-dark/10 bg-white p-5 shadow-[0_24px_60px_rgba(6,59,42,0.12)] sm:p-6"
    >
      <p className="font-ge text-[0.9rem] font-bold uppercase tracking-[0.14em] text-brand-700 sm:text-[0.95rem]">
        Free list
      </p>
      <h2 className="mt-3 font-ge text-[1.95rem] font-extrabold leading-tight tracking-[-0.01em] text-gs-green sm:text-[2.1rem]">
        {title}
      </h2>
      <p className="mt-3 font-ge text-[1.06rem] leading-8 text-ge-gray500 sm:text-[1.1rem]">{lead}</p>

      {status === 'success' && message ? (
        <div className="mt-6 rounded-xl border border-gs-green/30 bg-gs-green/5 px-4 py-4" role="status">
          <p className="font-ge text-[1.04rem] leading-8 text-gs-dark">{message}</p>
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <label className="block">
            <span className={labelClass}>Email</span>
            <input
              className={inputClass}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              type="email"
              inputMode="email"
              required
              autoFocus
              placeholder="you@example.com"
              aria-label="Email"
            />
          </label>
          <label className="block">
            <span className={labelClass}>Name (optional)</span>
            <input
              className={inputClass}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="given-name"
              placeholder="First name"
              aria-label="Name, optional"
            />
          </label>
          <label className="flex items-start gap-3 font-ge text-[1.02rem] leading-7 text-gs-dark">
            <input
              className="mt-1.5 h-5 w-5 shrink-0 accent-[#136047]"
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              required
            />
            <span>Email me occasional Costa del Sol golf updates. I can unsubscribe any time.</span>
          </label>
          {status === 'error' && message ? (
            <p className="font-ge text-[1rem] leading-7 text-red-800" role="alert">
              {message}
            </p>
          ) : null}
          <GeButton type="submit" variant="gs-gold" size="lg" className="w-full" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
          </GeButton>
        </form>
      )}
    </div>
  )
}
