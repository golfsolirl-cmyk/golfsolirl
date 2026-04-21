import { useMemo, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Send } from 'lucide-react'
import { GeButton } from './ge-button'
import { contactInfo } from '../data/copy'
import { buildWhatsAppHref, createTransportFormWhatsAppMessage } from '../lib/whatsapp'
import { transportEnquiryFormCopy } from '../data/transport-service'

const labelClass =
  'mb-1 block font-ge text-sm font-bold uppercase tracking-[0.18em] text-ge-gray500 sm:text-[0.85rem]'

const inputClass =
  'h-11 w-full rounded-lg border border-ge-gray200 bg-white px-3 font-ge text-base text-gs-dark shadow-sm outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25'

function buildMailtoFallback(body: Record<string, string>) {
  const lines = Object.entries(body).map(([k, v]) => `${k}: ${v}`)
  const subject = encodeURIComponent('GolfSol Ireland — transport request')
  const mailBody = encodeURIComponent(lines.join('\n'))
  return `mailto:${contactInfo.email}?subject=${subject}&body=${mailBody}`
}

/**
 * Solid light enquiry card — sits inside {@link TransportEnquireBlock} at the
 * bottom of the transport service page. Posts to the same /api/enquiry route
 * as the homepage form.
 */
export function TransportHeroEnquiryForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneWhatsApp, setPhoneWhatsApp] = useState('')
  const [passengers, setPassengers] = useState(4)
  const [collectionPoint, setCollectionPoint] = useState('')
  const [destination, setDestination] = useState('')
  const [collectionTime, setCollectionTime] = useState('')
  const [asap, setAsap] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const resetIdle = () => {
    setStatus('idle')
    setErrorMessage(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetIdle()

    const name = fullName.trim()
    const mail = email.trim().toLowerCase()
    const phone = phoneWhatsApp.trim()
    const from = collectionPoint.trim()
    const to = destination.trim()

    if (!name || !mail || !phone || !from || !to) {
      setErrorMessage(transportEnquiryFormCopy.validationRequired)
      setStatus('error')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      setErrorMessage(transportEnquiryFormCopy.validationEmail)
      setStatus('error')
      return
    }
    if (passengers < 1 || passengers > 16) {
      setErrorMessage(transportEnquiryFormCopy.validationPassengers)
      setStatus('error')
      return
    }
    if (!asap && !collectionTime.trim()) {
      setErrorMessage(transportEnquiryFormCopy.validationTime)
      setStatus('error')
      return
    }

    const timing = asap ? 'ASAP (first available driver)' : collectionTime.trim()
    const interest = [
      'TRANSPORT PAGE — transfer request',
      `Passengers: ${passengers}`,
      `Collection point: ${from}`,
      `Destination: ${to}`,
      `Collection timing: ${timing}`
    ].join('\n')

    const bestTimeToCall = asap ? 'ASAP — transfer' : `Collection: ${collectionTime.trim()}`

    setStatus('submitting')
    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name,
          email: mail,
          phoneWhatsApp: phone,
          interest,
          bestTimeToCall
        })
      })
      const data = (await response.json().catch(() => ({}))) as { message?: string }
      if (!response.ok) {
        throw new Error(data.message ?? transportEnquiryFormCopy.errorBody)
      }
      setStatus('success')
    } catch (e) {
      setStatus('error')
      setErrorMessage(e instanceof Error ? e.message : transportEnquiryFormCopy.errorBody)
    }
  }

  const mailtoHref = buildMailtoFallback({
    Name: fullName.trim(),
    Email: email.trim(),
    Phone: phoneWhatsApp.trim(),
    Passengers: String(passengers),
    'Collection point': collectionPoint.trim(),
    Destination: destination.trim(),
    'Collection time / ASAP': asap ? 'ASAP' : collectionTime.trim()
  })
  const whatsappHref = useMemo(
    () =>
      buildWhatsAppHref(
        createTransportFormWhatsAppMessage({
          fullName,
          phoneWhatsApp,
          passengers,
          collectionPoint,
          destination,
          collectionTime,
          asap
        })
      ),
    [asap, collectionPoint, collectionTime, destination, fullName, passengers, phoneWhatsApp]
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut', delay: 0.12 }}
      className="w-full shrink-0 lg:max-w-none"
    >
      <div
        id="transport-enquiry"
        className="relative rounded-2xl border-2 border-gs-dark/10 bg-white shadow-[0_20px_50px_rgba(6,59,42,0.12)]"
      >
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-gs-gold via-gs-gold-light to-gs-gold" aria-hidden />

        {status === 'success' ? (
          <div className="px-5 py-8 text-center sm:px-7 sm:py-9">
            <p className="font-ge text-sm font-bold uppercase tracking-[0.18em] text-gs-green sm:text-[0.85rem]">
              {transportEnquiryFormCopy.successTitle}
            </p>
            <p className="mt-3 font-ge text-base leading-7 text-ge-gray500 sm:text-[1rem]">{transportEnquiryFormCopy.successBody}</p>
            <GeButton href={`mailto:${contactInfo.email}`} variant="outline-gs-green" size="sm" className="mt-6">
              Email us directly
            </GeButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-5 py-6 sm:px-6 sm:py-7" noValidate>
            <header className="border-b border-ge-gray100 pb-4">
              <p className="font-ge text-sm font-bold uppercase tracking-[0.18em] text-ge-orange sm:text-[0.85rem]">
                {transportEnquiryFormCopy.sheetEyebrow}
              </p>
              <h2 className="mt-3 font-ge text-[1.85rem] font-extrabold leading-tight tracking-[0.02em] text-gs-green sm:text-[2.2rem]">
                {transportEnquiryFormCopy.title}
              </h2>
              <p className="mt-3 font-ge text-base leading-7 text-ge-gray500 sm:text-[1rem]">{transportEnquiryFormCopy.subtitle}</p>
            </header>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-3 md:gap-y-4">
              <label className="block min-w-0 md:col-span-1">
                <span className={labelClass}>{transportEnquiryFormCopy.nameLabel}</span>
                <input
                  name="fullName"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                  placeholder="Your name"
                  required
                />
              </label>

              <label className="block min-w-0 md:col-span-1">
                <span className={labelClass}>{transportEnquiryFormCopy.emailLabel}</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="block min-w-0 md:col-span-2">
                <span className={labelClass}>{transportEnquiryFormCopy.phoneLabel}</span>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={phoneWhatsApp}
                  onChange={(e) => setPhoneWhatsApp(e.target.value)}
                  className={inputClass}
                  placeholder={contactInfo.phoneDisplay}
                  required
                />
              </label>

              <label className="block min-w-0 md:col-span-2">
                <span className={labelClass}>{transportEnquiryFormCopy.passengersLabel}</span>
                <select
                  name="passengers"
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  className={inputClass}
                >
                  {Array.from({ length: 16 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'person' : 'people'}
                    </option>
                  ))}
                  <option value={20}>16+ — let’s talk</option>
                </select>
              </label>

              <label className="block min-w-0 md:col-span-2">
                <span className={labelClass}>{transportEnquiryFormCopy.collectionLabel}</span>
                <input
                  name="collectionPoint"
                  autoComplete="street-address"
                  value={collectionPoint}
                  onChange={(e) => setCollectionPoint(e.target.value)}
                  className={inputClass}
                  placeholder="Where we collect you"
                  required
                />
                <span className="mt-1 block font-ge text-sm leading-snug text-ge-gray400 sm:text-[0.95rem]">
                  {transportEnquiryFormCopy.collectionHint}
                </span>
              </label>

              <label className="block min-w-0 md:col-span-2">
                <span className={labelClass}>{transportEnquiryFormCopy.destinationLabel}</span>
                <input
                  name="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className={inputClass}
                  placeholder="Where you’re heading"
                  required
                />
                <span className="mt-1 block font-ge text-sm leading-snug text-ge-gray400 sm:text-[0.95rem]">
                  {transportEnquiryFormCopy.destinationHint}
                </span>
              </label>

              <fieldset className="min-w-0 space-y-2 border-0 p-0 md:col-span-2">
                <legend className={`${labelClass} w-full`}>{transportEnquiryFormCopy.timeLabel}</legend>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-ge-gray200 bg-ge-gray50 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={asap}
                    onChange={(e) => {
                      setAsap(e.target.checked)
                      if (e.target.checked) setCollectionTime('')
                    }}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-ge-gray300 text-gs-green focus:ring-gs-green"
                  />
                  <span>
                    <span className="block font-ge text-base font-semibold text-gs-dark">{transportEnquiryFormCopy.asapLabel}</span>
                    <span className="mt-0.5 block font-ge text-base leading-snug text-ge-gray500 sm:text-[0.95rem]">
                      {transportEnquiryFormCopy.asapHint}
                    </span>
                  </span>
                </label>
                <input
                  type="datetime-local"
                  name="collectionTime"
                  value={collectionTime}
                  onChange={(e) => setCollectionTime(e.target.value)}
                  disabled={asap}
                  className={`${inputClass} disabled:cursor-not-allowed disabled:bg-ge-gray100 disabled:text-ge-gray400`}
                />
              </fieldset>
            </div>

            {status === 'error' && errorMessage ? (
              <p
                className="rounded-lg border border-ge-orange/50 bg-orange-50 px-3 py-2 font-ge text-base text-gs-dark"
                role="alert"
              >
                {errorMessage}{' '}
                <a href={mailtoHref} className="font-bold text-gs-green underline underline-offset-2 hover:text-gs-electric">
                  Open email draft
                </a>
              </p>
            ) : null}

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <GeButton type="submit" variant="gs-green" size="md" className="w-full" disabled={status === 'submitting'}>
                <Send className="h-4 w-4" aria-hidden />
                {status === 'submitting' ? transportEnquiryFormCopy.sending : transportEnquiryFormCopy.submit}
              </GeButton>
              <GeButton
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline-gs-green"
                size="md"
                className="w-full"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp this route
              </GeButton>
            </div>
            <p className="font-ge text-sm leading-6 text-ge-gray500">
              This WhatsApp button updates live with your route, passenger count, and preferred collection timing.
            </p>
          </form>
        )}
      </div>
    </motion.div>
  )
}
