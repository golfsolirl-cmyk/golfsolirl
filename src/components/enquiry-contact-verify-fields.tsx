import { useState } from 'react'
import { validateMobilePhoneInput } from '../lib/phone-mobile'
import { cx } from '../lib/utils'

type EnquiryContactVerifyFieldsProps = {
  readonly email: string
  readonly phoneWhatsApp: string
  readonly contactVerifyToken: string | null
  readonly onVerified: (token: string) => void
  readonly onTokenCleared: () => void
  readonly labelClassName?: string
  readonly inputClassName?: string
  readonly className?: string
}

export function EnquiryContactVerifyFields({
  email,
  phoneWhatsApp,
  contactVerifyToken,
  onVerified,
  onTokenCleared,
  labelClassName,
  inputClassName,
  className
}: EnquiryContactVerifyFieldsProps) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState<'idle' | 'send' | 'check'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const labelClass =
    labelClassName ??
    'mb-1.5 block font-ge text-[0.88rem] font-bold uppercase tracking-[0.14em] text-ge-gray500'
  const inputClass =
    inputClassName ??
    'h-12 w-full rounded-xl border border-ge-gray200 bg-white px-3.5 font-ge text-[1.02rem] text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25'

  const sendCode = async () => {
    setError(null)
    setMessage(null)
    onTokenCleared()
    const phoneCheck = validateMobilePhoneInput(phoneWhatsApp)
    if (!phoneCheck.ok) {
      setError(phoneCheck.message)
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Enter your email first, then request a code.')
      return
    }
    setBusy('send')
    try {
      const res = await fetch('/api/enquiry-contact-verify-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), phoneWhatsApp: phoneWhatsApp.trim() })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string; code?: string }
      if (!res.ok) {
        if (data.code === 'CONTACT_VERIFY_DISABLED') {
          setMessage('Email verification is off for this environment — you can submit without a code.')
          return
        }
        setError(data.message ?? 'Could not send the code.')
        return
      }
      setMessage(data.message ?? 'Code sent — check your email.')
    } catch {
      setError('Could not send the code (network error).')
    } finally {
      setBusy('idle')
    }
  }

  const checkCode = async () => {
    setError(null)
    setMessage(null)
    setBusy('check')
    try {
      const res = await fetch('/api/enquiry-contact-verify-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          phoneWhatsApp: phoneWhatsApp.trim(),
          code: code.trim()
        })
      })
      const data = (await res.json().catch(() => ({}))) as {
        message?: string
        contactVerifyToken?: string
        code?: string
      }
      if (!res.ok) {
        setError(data.message ?? 'Could not verify that code.')
        return
      }
      if (!data.contactVerifyToken) {
        setError('Verification succeeded but no token was returned. Try again.')
        return
      }
      onVerified(data.contactVerifyToken)
      setMessage(data.message ?? 'Contact confirmed.')
    } catch {
      setError('Could not verify the code (network error).')
    } finally {
      setBusy('idle')
    }
  }

  return (
    <div className={cx('space-y-3 rounded-2xl border border-ge-gray200 bg-ge-gray50/50 p-4', className)}>
      <div>
        <p className={labelClass}>Confirm mobile by email code</p>
        <p className="mt-1 font-ge text-sm leading-relaxed text-ge-gray500">
          We email a 6-digit code to prove this contact is real (SMS OTP needs a separate SMS provider later).
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <button
          className="h-12 rounded-xl bg-forest-900 px-4 font-ge text-sm font-semibold text-white transition hover:bg-forest-800 disabled:opacity-60"
          disabled={busy !== 'idle' || Boolean(contactVerifyToken)}
          onClick={() => void sendCode()}
          type="button"
        >
          {busy === 'send' ? 'Sending…' : contactVerifyToken ? 'Code confirmed' : 'Email me a code'}
        </button>
      </div>
      {!contactVerifyToken ? (
        <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label className={labelClass} htmlFor="enquiry-verify-code">
              6-digit code
            </label>
            <input
              autoComplete="one-time-code"
              className={inputClass}
              id="enquiry-verify-code"
              inputMode="numeric"
              maxLength={6}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              type="text"
              value={code}
            />
          </div>
          <button
            className="h-12 rounded-xl border-2 border-gs-green bg-white px-4 font-ge text-sm font-semibold text-gs-dark transition hover:bg-gs-green/10 disabled:opacity-60"
            disabled={busy !== 'idle' || code.trim().length !== 6}
            onClick={() => void checkCode()}
            type="button"
          >
            {busy === 'check' ? 'Checking…' : 'Confirm code'}
          </button>
        </div>
      ) : (
        <p className="font-ge text-sm font-semibold text-emerald-800">Mobile and email confirmed for this form.</p>
      )}
      {message ? <p className="font-ge text-sm text-forest-800">{message}</p> : null}
      {error ? (
        <p className="font-ge text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
