import { useRef, useState, type FormEvent } from 'react'
import {
  EnquirySpamGuardFields,
  useEnquirySpamGuardState
} from '../../../components/enquiry-spam-guard-fields'
import { RECAPTCHA_ACTIONS } from '../../../lib/enquiry-spam-guard'
import {
  ENQUIRY_STRUCTURED_FIELD_KEYS,
  PICKUP_DROPOFF_TYPES,
  QUOTE_INTENTS,
  WEBSITE_ENQUIRY_FORM
} from '../../../lib/enquiry-form-registry'
import { ENQUIRY_CONFLICT_EXISTING_PHONE, postWebsiteEnquiry } from '../../../lib/post-enquiry-client'
import { validateMobilePhoneInput } from '../../../lib/phone-mobile'
import { TERMS_ACCEPTANCE_ERROR, termsAcceptanceFormFields } from '../../../lib/terms-acceptance'
import { travelStartMinIso } from '../../../lib/travel-date-bounds'
import { passengerCountSelectOptions } from '../data/form-people-options'
import { GeButton } from './ge-button'
import { GeTermsAcceptanceField } from './ge-terms-acceptance-field'

const labelClass =
  'mb-1.5 block font-ge text-[0.82rem] font-bold uppercase tracking-[0.12em] text-forest-800'
const inputClass =
  'min-h-[52px] h-13 w-full rounded-xl border border-ge-gray200 bg-white px-4 font-ge text-[1.06rem] text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25'

const golfBagOptions = [
  { label: '0 golf bags', value: '0' },
  { label: '1 golf bag', value: '1' },
  ...Array.from({ length: 7 }, (_, i) => {
    const n = i + 2
    return { label: `${n} golf bags`, value: String(n) }
  })
]

/**
 * Dedicated homepage form — Transfers from Málaga Airport.
 * Creates an enquiry + transfer booking via existing enquiry pipeline.
 */
export function MalagaTransferRequestForm() {
  const [arrivalDate, setArrivalDate] = useState('')
  const [arrivalTime, setArrivalTime] = useState('')
  const [flightNo, setFlightNo] = useState('')
  const [passengers, setPassengers] = useState('')
  const [golfBags, setGolfBags] = useState('0')
  const [destination, setDestination] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneWhatsApp, setPhoneWhatsApp] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const { spamGuard, fieldsProps: spamFieldsProps } = useEnquirySpamGuardState(
    RECAPTCHA_ACTIONS.malagaTransfer
  )
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const confirmationRef = useRef<HTMLDivElement>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setErrorCode(null)

    const name = fullName.trim()
    const mail = email.trim()
    const phone = phoneWhatsApp.trim()
    const dest = destination.trim()
    if (!name || !mail || !phone || !dest || !arrivalDate || !passengers) {
      setErrorMessage('Arrival date, passengers, destination, name, email and mobile are required.')
      setStatus('error')
      return
    }
    const phoneCheck = validateMobilePhoneInput(phone)
    if (!phoneCheck.ok) {
      setErrorMessage(phoneCheck.message)
      setStatus('error')
      return
    }
    if (!termsAccepted) {
      setErrorMessage(TERMS_ACCEPTANCE_ERROR)
      setStatus('error')
      return
    }

    setStatus('submitting')
    const pickupLabel = `Málaga Airport (AGP)${flightNo.trim() ? ` · Flight ${flightNo.trim()}` : ''}${
      arrivalTime ? ` · ${arrivalTime}` : ''
    }`
    const formFields: Record<string, string> = {
      Page: '/',
      Topic: 'Transfers from Málaga Airport',
      'Arrival date': arrivalDate,
      Passengers: passengers,
      'Golf bags': golfBags,
      Destination: dest,
      [ENQUIRY_STRUCTURED_FIELD_KEYS.quoteIntent]: QUOTE_INTENTS.airportOnly,
      [ENQUIRY_STRUCTURED_FIELD_KEYS.pickupType]: PICKUP_DROPOFF_TYPES.malagaAirport,
      [ENQUIRY_STRUCTURED_FIELD_KEYS.pickupLabel]: pickupLabel,
      [ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffType]: PICKUP_DROPOFF_TYPES.hotel,
      [ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffLabel]: dest,
      [ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateFrom]: arrivalDate,
      [ENQUIRY_STRUCTURED_FIELD_KEYS.addTransfers]: 'yes'
    }
    if (arrivalTime) formFields['Arrival time'] = arrivalTime
    if (flightNo.trim()) formFields['Flight number'] = flightNo.trim()
    const paxMatch = passengers.match(/^(\d+)/)
    if (paxMatch) formFields[ENQUIRY_STRUCTURED_FIELD_KEYS.pax] = paxMatch[1] ?? ''

    const result = await postWebsiteEnquiry({
      fullName: name,
      email: mail,
      phoneWhatsApp: phone,
      interest: [
        'Transfers from Málaga Airport',
        `Arrival: ${arrivalDate}${arrivalTime ? ` ${arrivalTime}` : ''}`,
        flightNo.trim() ? `Flight: ${flightNo.trim()}` : null,
        `Passengers: ${passengers}`,
        `Golf bags: ${golfBags}`,
        `Destination: ${dest}`
      ]
        .filter(Boolean)
        .join('\n'),
      bestTimeToCall: 'Any time',
      spamGuard: await spamGuard(),
      formPayload: {
        form: WEBSITE_ENQUIRY_FORM.malagaAirportTransfer,
        fields: { ...formFields, ...termsAcceptanceFormFields() }
      }
    })

    if (!result.ok) {
      setStatus('error')
      setErrorMessage(result.message)
      setErrorCode(result.code ?? null)
      return
    }

    setStatus('success')
    setErrorCode(null)
    setArrivalDate('')
    setArrivalTime('')
    setFlightNo('')
    setPassengers('')
    setGolfBags('0')
    setDestination('')
    setFullName('')
    setEmail('')
    setPhoneWhatsApp('')
    setTermsAccepted(false)
      }

  return (
    <div
      id="malaga-transfer-form"
      className="rounded-[1.75rem] border border-gs-dark/10 bg-white p-5 shadow-[0_24px_60px_rgba(6,59,42,0.12)] sm:p-6"
    >
      <p className="font-ge text-[0.85rem] font-bold uppercase tracking-[0.14em] text-brand-700">Airport transfers</p>
      <h2 className="mt-2.5 font-ge text-[1.55rem] font-extrabold leading-tight tracking-[-0.01em] text-gs-green sm:text-[1.75rem]">
        Transfers from Málaga Airport
      </h2>
      <p className="mt-2 font-ge text-[1.02rem] leading-7 text-ge-gray500">
        Arrival details and destination — we confirm a private, golf-bag-friendly vehicle.
      </p>

      {status === 'success' ? (
        <div ref={confirmationRef} className="mt-6 rounded-xl border border-gs-green/30 bg-gs-green/5 px-4 py-4">
          <p className="font-ge text-[0.92rem] font-bold uppercase tracking-[0.12em] text-gs-green">Transfer request received</p>
          <p className="mt-2 font-ge text-[1.04rem] leading-7 text-gs-dark">
            Thanks — we will confirm your Málaga Airport transfer from Ireland.
          </p>
        </div>
      ) : (
        <form className="mt-4 flex max-w-xl flex-col gap-4" noValidate onSubmit={(e) => void handleSubmit(e)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Arrival date</span>
              <input
                className={inputClass}
                type="date"
                required
                min={travelStartMinIso()}
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Arrival time</span>
              <input
                className={inputClass}
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
              />
            </label>
          </div>

          <label className="block">
            <span className={labelClass}>Flight number</span>
            <input
              className={inputClass}
              placeholder="e.g. EI582"
              value={flightNo}
              onChange={(e) => setFlightNo(e.target.value)}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Passengers</span>
              <select
                className={inputClass}
                required
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
              >
                <option value="">Select</option>
                {passengerCountSelectOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Golf bags</span>
              <select className={inputClass} value={golfBags} onChange={(e) => setGolfBags(e.target.value)}>
                {golfBagOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className={labelClass}>Destination hotel / area</span>
            <input
              className={inputClass}
              required
              placeholder="Hotel name or area (e.g. Marbella)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </label>

          <label className="block">
            <span className={labelClass}>Name</span>
            <input
              className={inputClass}
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Email</span>
            <input
              className={inputClass}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                              }}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Mobile / WhatsApp</span>
            <input
              className={inputClass}
              type="tel"
              autoComplete="tel"
              required
              value={phoneWhatsApp}
              onChange={(e) => {
                setPhoneWhatsApp(e.target.value)
                              }}
            />
          </label>
          <EnquirySpamGuardFields {...spamFieldsProps} />

          <GeTermsAcceptanceField checked={termsAccepted} onChange={setTermsAccepted} id="malaga-transfer-terms" />

          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-ge text-sm text-red-800">
              <p>{errorMessage}</p>
              {errorCode === ENQUIRY_CONFLICT_EXISTING_PHONE ? (
                <a className="mt-2 inline-block font-bold underline" href="/login">
                  Sign in to continue
                </a>
              ) : null}
            </div>
          ) : null}

          <GeButton type="submit" variant="gs-green" size="lg" className="w-full" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Sending…' : 'Request transfer'}
          </GeButton>
        </form>
      )}
    </div>
  )
}
