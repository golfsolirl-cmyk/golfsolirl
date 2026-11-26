import { useState, type FormEvent } from 'react'
import {
  EnquirySpamGuardFields,
  useEnquirySpamGuardState
} from '../enquiry-spam-guard-fields'
import { RECAPTCHA_ACTIONS } from '../../lib/enquiry-spam-guard'
import { ENQUIRY_STRUCTURED_FIELD_KEYS, WEBSITE_ENQUIRY_FORM } from '../../lib/enquiry-form-registry'
import { postWebsiteEnquiry } from '../../lib/post-enquiry-client'
import { validateMobilePhoneInput } from '../../lib/phone-mobile'
import { Phone } from 'lucide-react'

const inputClass =
  'min-h-[48px] w-full rounded-xl border border-white/20 bg-white/10 px-3.5 font-ge text-base text-white outline-none placeholder:text-white/45 focus:border-[#d4a843] focus:ring-2 focus:ring-[#d4a843]/30'

const BEST_TIMES = [
  { id: 'Morning', label: 'Morning' },
  { id: 'Afternoon', label: 'Afternoon' },
  { id: 'Evening', label: 'Evening' }
] as const

type RequestCallbackCardProps = {
  readonly sourcePage?: string
}

/**
 * Compact callback request — paired with the WhatsApp card.
 * Name, phone, best time, optional note (+ optional email). reCAPTCHA v3.
 */
export function RequestCallbackCard({ sourcePage }: RequestCallbackCardProps) {
  const path =
    sourcePage ||
    (typeof window !== 'undefined' ? window.location.pathname.replace(/\/+$/, '') || '/' : '/')
  const { spamGuard, fieldsProps: spamFieldsProps } = useEnquirySpamGuardState(
    RECAPTCHA_ACTIONS.callbackRequest
  )
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [bestTime, setBestTime] = useState<(typeof BEST_TIMES)[number]['id']>('Morning')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setMessage(null)
    const name = fullName.trim()
    const tel = phone.trim()
    if (!name || !tel) {
      setStatus('error')
      setMessage('Please leave your name and phone number.')
      return
    }
    const phoneCheck = validateMobilePhoneInput(tel)
    if (!phoneCheck.ok) {
      setStatus('error')
      setMessage(phoneCheck.message)
      return
    }
    setStatus('submitting')
    const interestLines = [
      'Callback request — not tech savvy / prefer a call',
      `Best time: ${bestTime}`,
      `Page: ${path}`,
      note.trim() ? `Note: ${note.trim()}` : null
    ].filter(Boolean)

    const result = await postWebsiteEnquiry({
      fullName: name,
      email: email.trim() || undefined,
      phoneWhatsApp: tel,
      interest: interestLines.join('\n'),
      bestTimeToCall: bestTime,
      spamGuard: await spamGuard(),
      formPayload: {
        form: WEBSITE_ENQUIRY_FORM.callbackRequest,
        fields: {
          Page: path,
          Topic: 'Callback request',
          'Best time': bestTime,
          ...(note.trim() ? { Note: note.trim() } : {}),
          [ENQUIRY_STRUCTURED_FIELD_KEYS.sourcePage]: path
        }
      }
    })

    if (!result.ok) {
      setStatus('error')
      setMessage(result.message)
      return
    }
    setStatus('success')
    setMessage(result.message)
    setFullName('')
    setPhone('')
    setEmail('')
    setNote('')
  }

  return (
    <div className="flex h-full flex-col rounded-[1.75rem] border border-white/15 bg-[#0a2f24]/85 p-5 text-white shadow-lg sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-[#d4a843] text-[#062016]">
          <Phone className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <p className="font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-[#f0d78c]">
            Request a callback
          </p>
          <h3 className="font-ge text-xl font-extrabold leading-tight text-white" data-keep-color>
            Not tech savvy? We’ll do it for you
          </h3>
        </div>
      </div>
      <p className="font-ge text-[0.98rem] leading-6 text-white/80" data-keep-color>
        Not great with forms? Leave your number and we’ll ring you to sort your trip.
      </p>

      {status === 'success' ? (
        <p className="mt-5 rounded-xl bg-white/10 px-4 py-3 font-ge text-sm text-[#6ee7b7]" data-keep-color>
          {message || 'Thanks — we’ll call you.'}
        </p>
      ) : (
        <form className="mt-4 flex flex-1 flex-col gap-3" noValidate onSubmit={(e) => void onSubmit(e)}>
          <label className="block">
            <span className="mb-1 block font-ge text-[0.72rem] font-bold uppercase tracking-[0.12em] text-white/70">
              Name
            </span>
            <input
              className={inputClass}
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-ge text-[0.72rem] font-bold uppercase tracking-[0.12em] text-white/70">
              Phone
            </span>
            <input
              className={inputClass}
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+353…"
            />
          </label>
          <fieldset>
            <legend className="mb-1.5 font-ge text-[0.72rem] font-bold uppercase tracking-[0.12em] text-white/70">
              Best time to call
            </legend>
            <div className="flex flex-wrap gap-2">
              {BEST_TIMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setBestTime(t.id)}
                  className={
                    bestTime === t.id
                      ? 'min-h-[44px] rounded-full bg-[#d4a843] px-4 py-2 font-ge text-sm font-extrabold text-[#062016]'
                      : 'min-h-[44px] rounded-full border border-white/25 bg-white/5 px-4 py-2 font-ge text-sm font-semibold text-white'
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className="mb-1 block font-ge text-[0.72rem] font-bold uppercase tracking-[0.12em] text-white/70">
              Note <span className="normal-case tracking-normal text-white/45">(optional)</span>
            </span>
            <textarea
              className={`${inputClass} min-h-[72px] py-2.5`}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything we should know…"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-ge text-[0.72rem] font-bold uppercase tracking-[0.12em] text-white/70">
              Email <span className="normal-case tracking-normal text-white/45">(optional)</span>
            </span>
            <input
              className={inputClass}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="If you’d like a short confirmation"
            />
          </label>
          <EnquirySpamGuardFields {...spamFieldsProps} />
          {message && status === 'error' ? (
            <p className="rounded-lg bg-rose-500/20 px-3 py-2 font-ge text-sm text-rose-100">{message}</p>
          ) : null}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="mt-auto inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#d4a843] px-5 font-ge text-base font-extrabold text-[#062016] transition hover:bg-[#e0b84f] disabled:opacity-60"
          >
            {status === 'submitting' ? 'Sending…' : 'Request a callback'}
          </button>
        </form>
      )}
    </div>
  )
}
