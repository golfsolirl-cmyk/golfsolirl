import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Mail, ShieldCheck } from 'lucide-react'
import { GeButton } from '../components/ge-button'

export function TermsEmailRequest() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const messageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [status])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const mail = email.trim().toLowerCase()
    setStatus('idle')
    setMessage(null)

    if (!mail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      setStatus('error')
      setMessage('Please enter a valid email address.')
      return
    }

    try {
      setStatus('submitting')
      const response = await fetch('/api/terms-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: mail })
      })
      const data = (await response.json().catch(() => null)) as { message?: string } | null

      if (!response.ok) {
        throw new Error(data?.message ?? 'Unable to send the terms email right now.')
      }

      setStatus('success')
      setMessage(data?.message ?? 'Terms sent. Check your inbox for the email and PDF.')
      setEmail('')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Unable to send the terms email right now.')
    }
  }

  return (
    <section className="bg-[linear-gradient(180deg,_#FAF8F4_0%,_#FFFFFF_100%)] px-5 py-12 sm:px-8 sm:py-14">
      <div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="rounded-[2rem] border border-gs-green/15 bg-white p-6 shadow-[0_20px_50px_rgba(6,59,42,0.08)] sm:p-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gs-green text-white shadow-[0_14px_28px_rgba(6,59,42,0.2)]">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-5 font-ge text-[0.82rem] font-extrabold uppercase tracking-[0.18em] text-gs-gold">
            Email terms copy
          </p>
          <h2 className="mt-3 font-ge text-[2rem] font-extrabold leading-tight text-gs-green sm:text-[2.45rem]">
            Send yourself the terms and conditions PDF.
          </h2>
          <p className="mt-4 font-ge text-base leading-8 text-ge-gray500">
            Enter your email and we will send a branded terms email with the detailed GolfSol Ireland terms PDF attached.
          </p>
        </div>

        <form
          className="rounded-[2rem] border border-gs-dark/10 bg-gs-dark p-5 shadow-[0_24px_60px_rgba(1,16,12,0.24)] sm:p-7"
          onSubmit={handleSubmit}
          noValidate
        >
          <label className="block">
            <span className="mb-2 block font-ge text-[0.82rem] font-extrabold uppercase tracking-[0.16em] text-gs-gold">
              Email address
            </span>
            <span className="relative block">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/45" aria-hidden="true" />
              <input
                autoComplete="email"
                className="h-14 w-full rounded-2xl border border-white/15 bg-white/10 pl-12 pr-4 font-ge text-base text-white outline-none transition placeholder:text-white/35 focus:border-gs-gold focus:ring-2 focus:ring-gs-gold/25"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </span>
          </label>

          <GeButton className="mt-4 w-full" disabled={status === 'submitting'} type="submit" variant="gs-gold" size="lg">
            {status === 'submitting' ? 'Sending terms...' : 'Email me the terms'}
          </GeButton>

          {message ? (
            <div
              ref={messageRef}
              className={`mt-4 rounded-2xl border px-4 py-3 font-ge text-sm leading-6 ${
                status === 'success'
                  ? 'border-gs-gold/40 bg-gs-gold/10 text-white'
                  : 'border-red-300/50 bg-red-500/10 text-red-100'
              }`}
              role={status === 'error' ? 'alert' : 'status'}
            >
              {message}
            </div>
          ) : null}
        </form>
      </div>
    </section>
  )
}
