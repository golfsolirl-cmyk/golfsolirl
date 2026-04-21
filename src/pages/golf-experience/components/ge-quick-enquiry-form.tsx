import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { GeButton } from './ge-button'
import { contactInfo } from '../data/copy'

interface GeQuickEnquiryFormProps {
  readonly title: string
  readonly lead: string
  readonly interestPreset: string
}

const labelClass =
  'mb-1 block font-ge text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-gray500'
const inputClass =
  'h-12 w-full rounded-xl border border-ge-gray200 bg-white px-3.5 font-ge text-[1rem] text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25'

export function GeQuickEnquiryForm({
  title,
  lead,
  interestPreset
}: GeQuickEnquiryFormProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneWhatsApp, setPhoneWhatsApp] = useState('')
  const [travelDates, setTravelDates] = useState('')
  const [groupSize, setGroupSize] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('idle')
    setErrorMessage(null)

    const name = fullName.trim()
    const mail = email.trim().toLowerCase()
    const phone = phoneWhatsApp.trim()

    if (!name || !mail || !phone) {
      setErrorMessage('Please add your name, email, and phone/WhatsApp.')
      setStatus('error')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      setErrorMessage('Please enter a valid email address.')
      setStatus('error')
      return
    }

    setStatus('submitting')
    try {
      const interestLines = [
        interestPreset,
        travelDates.trim() ? `Travel dates: ${travelDates.trim()}` : null,
        groupSize.trim() ? `Group size: ${groupSize.trim()}` : null,
        notes.trim() ? `Notes: ${notes.trim()}` : null
      ].filter(Boolean)

      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name,
          email: mail,
          phoneWhatsApp: phone,
          interest: interestLines.join('\n'),
          bestTimeToCall: 'Any time'
        })
      })
      const data = (await response.json().catch(() => ({}))) as { message?: string }
      if (!response.ok) {
        throw new Error(data.message ?? 'Could not send your request right now.')
      }

      setStatus('success')
      setFullName('')
      setEmail('')
      setPhoneWhatsApp('')
      setTravelDates('')
      setGroupSize('')
      setNotes('')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Could not send your request right now.')
    }
  }

  return (
    <div className="rounded-2xl border border-gs-dark/10 bg-white p-5 shadow-[0_20px_50px_rgba(6,59,42,0.12)] sm:p-6">
      <p className="font-ge text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-orange">
        Quick form
      </p>
      <h2 className="mt-3 font-ge text-[1.8rem] font-extrabold leading-tight tracking-[-0.01em] text-gs-green">
        {title}
      </h2>
      <p className="mt-3 font-ge text-[1rem] leading-7 text-ge-gray500">{lead}</p>

      {status === 'success' ? (
        <div className="mt-6 rounded-xl border border-gs-green/30 bg-gs-green/5 px-4 py-4">
          <p className="font-ge text-[0.82rem] font-bold uppercase tracking-[0.14em] text-gs-green">
            Request received
          </p>
          <p className="mt-2 font-ge text-[1rem] leading-7 text-gs-dark">
            Thanks — we will reply shortly from Ireland.
          </p>
          <GeButton href={`mailto:${contactInfo.email}`} variant="outline-gs-green" size="sm" className="mt-4">
            Email us directly
          </GeButton>
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <label className="block">
            <span className={labelClass}>Full name</span>
            <input
              className={inputClass}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              required
              placeholder="Your name"
            />
          </label>
          <label className="block">
            <span className={labelClass}>Email</span>
            <input
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              type="email"
              required
              placeholder="you@example.com"
            />
          </label>
          <label className="block">
            <span className={labelClass}>Phone / WhatsApp</span>
            <input
              className={inputClass}
              value={phoneWhatsApp}
              onChange={(e) => setPhoneWhatsApp(e.target.value)}
              autoComplete="tel"
              type="tel"
              required
              placeholder={contactInfo.phoneDisplay}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Travel dates (optional)</span>
            <input
              className={inputClass}
              value={travelDates}
              onChange={(e) => setTravelDates(e.target.value)}
              placeholder="e.g. 15–19 Sept 2026"
            />
          </label>
          <label className="block">
            <span className={labelClass}>Group size (optional)</span>
            <input
              className={inputClass}
              value={groupSize}
              onChange={(e) => setGroupSize(e.target.value)}
              placeholder="e.g. 8 golfers"
            />
          </label>
          <label className="block">
            <span className={labelClass}>Notes (optional)</span>
            <textarea
              className="min-h-[120px] w-full rounded-xl border border-ge-gray200 bg-white px-3.5 py-3 font-ge text-[1rem] leading-7 text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tell us what matters most for your trip."
            />
          </label>

          {status === 'error' && errorMessage ? (
            <p className="rounded-lg border border-ge-orange/50 bg-orange-50 px-3 py-2 font-ge text-[1rem] text-gs-dark">
              {errorMessage}
            </p>
          ) : null}

          <GeButton className="w-full" type="submit" variant="gs-gold" size="lg" disabled={status === 'submitting'}>
            <Send className="h-4 w-4" aria-hidden />
            {status === 'submitting' ? 'Sending...' : 'Send request'}
          </GeButton>
        </form>
      )}
    </div>
  )
}
