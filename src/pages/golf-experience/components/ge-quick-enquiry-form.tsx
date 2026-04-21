import { useMemo, useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { GeButton } from './ge-button'
import { contactInfo } from '../data/copy'
import type { MarketingEnquiryType, MarketingFormVariant } from '../../../data/marketing-page-types'

interface GeQuickEnquiryFormProps {
  readonly title: string
  readonly lead: string
  readonly interestPreset: string
  readonly enquiryType?: MarketingEnquiryType
  readonly formVariant?: MarketingFormVariant
}

const labelClass =
  'mb-1 block font-ge text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-gray500'
const inputClass =
  'h-12 w-full rounded-xl border border-ge-gray200 bg-white px-3.5 font-ge text-[1rem] text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25'

const compactLines = (lines: Array<string | null>) =>
  lines.filter((line): line is string => Boolean(line && line.trim()))

export function GeQuickEnquiryForm({
  title,
  lead,
  interestPreset,
  enquiryType,
  formVariant
}: GeQuickEnquiryFormProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneWhatsApp, setPhoneWhatsApp] = useState('')
  const [travelDates, setTravelDates] = useState('')
  const [groupSize, setGroupSize] = useState('')
  const [notes, setNotes] = useState('')
  const [questionType, setQuestionType] = useState('General question')
  const [legalTopic, setLegalTopic] = useState('Privacy policy')
  const [updateType, setUpdateType] = useState('Course updates')
  const [visitMonth, setVisitMonth] = useState('')
  const [travelPartyType, setTravelPartyType] = useState('Golf group')
  const [tripStyle, setTripStyle] = useState('Group golf holiday')
  const [preferredArea, setPreferredArea] = useState('Open to suggestions')
  const [accommodationTier, setAccommodationTier] = useState('4-star hotel')
  const [courseArea, setCourseArea] = useState('Open to suggestions')
  const [handicapMix, setHandicapMix] = useState('')
  const [playersNeedingClubs, setPlayersNeedingClubs] = useState('')
  const [rentalTier, setRentalTier] = useState('Standard sets')
  const [handedness, setHandedness] = useState('Mostly right-handed')
  const [deliveryPoint, setDeliveryPoint] = useState('')
  const [pickupPoint, setPickupPoint] = useState('')
  const [destinationPoint, setDestinationPoint] = useState('')
  const [passengerCount, setPassengerCount] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const resolvedVariant = useMemo<MarketingFormVariant>(() => {
    if (formVariant) {
      return formVariant
    }

    if (enquiryType === 'legal') return 'legal'
    if (enquiryType === 'newsletter') return 'newsletter'
    if (enquiryType === 'testimonial') return 'testimonial'
    if (enquiryType === 'support') return 'support'

    const preset = interestPreset.toLowerCase()
    if (preset.includes('golf club rental')) return 'club-rental'
    if (preset.includes('accommodation') || preset.includes('hotel')) return 'accommodation'
    if (preset.includes('transport')) return 'transport'
    if (preset.includes('course') || preset.includes('tee time')) return 'courses'
    if (preset.includes('guidance') || preset.includes('travel to')) return 'guide'
    return 'quote'
  }, [enquiryType, formVariant, interestPreset])

  const isLegalPage = resolvedVariant === 'legal'
  const isNewsletterPage = resolvedVariant === 'newsletter'
  const isTestimonialPage = resolvedVariant === 'testimonial'
  const isGuidePage = resolvedVariant === 'guide'
  const isSupportPage = resolvedVariant === 'support'
  const isClubRentalPage = resolvedVariant === 'club-rental'
  const isCoursesPage = resolvedVariant === 'courses'
  const isAccommodationPage = resolvedVariant === 'accommodation'
  const isTransportPage = resolvedVariant === 'transport'
  const isItineraryPage = resolvedVariant === 'itinerary'
  const isQuotePage = resolvedVariant === 'quote'
  const isPlanningVariant =
    isQuotePage || isItineraryPage || isClubRentalPage || isCoursesPage || isAccommodationPage || isTransportPage

  const notesPlaceholder = useMemo(() => {
    if (isLegalPage) return 'Tell us your legal/privacy question.'
    if (isSupportPage) return 'Tell us exactly what you need help with.'
    if (isNewsletterPage) return 'Tell us what updates you care about most.'
    if (isTestimonialPage) return 'Share key highlights from your trip.'
    if (isGuidePage) return 'Tell us what travel guidance you need.'
    if (isClubRentalPage) {
      return 'Delivery hotel, preferred brands, left-handed players, or anything else we should factor into the rental.'
    }
    if (isCoursesPage) {
      return 'Tell us if you want marquee rounds, strong-value golf, buggy access, society-friendly pacing, or specific tee-time windows.'
    }
    if (isAccommodationPage) {
      return 'Share room mix, nightlife vs quiet, board basis, location must-haves, or any hotel you already like.'
    }
    if (isTransportPage) {
      return 'Add flight details, golf bag count, child seats, multiple stops, or anything else that affects the transfer plan.'
    }
    if (isItineraryPage || isQuotePage) {
      return 'Tell us the must-play courses, hotel ideas, transfer needs, or how you want the week to feel.'
    }
    return 'Tell us what matters most for your trip.'
  }, [
    isAccommodationPage,
    isClubRentalPage,
    isCoursesPage,
    isGuidePage,
    isItineraryPage,
    isLegalPage,
    isNewsletterPage,
    isQuotePage,
    isSupportPage,
    isTestimonialPage,
    isTransportPage
  ])

  const notesLabel = useMemo(() => {
    if (isLegalPage || isSupportPage || isGuidePage) return 'Question details'
    if (isNewsletterPage) return 'Update request details'
    if (isTestimonialPage) return 'Testimonial details'
    if (isClubRentalPage) return 'Rental notes'
    if (isCoursesPage) return 'Course brief'
    if (isAccommodationPage) return 'Stay notes'
    if (isTransportPage) return 'Transport notes'
    if (isItineraryPage || isQuotePage) return 'Trip notes'
    return 'Notes (optional)'
  }, [
    isAccommodationPage,
    isClubRentalPage,
    isCoursesPage,
    isGuidePage,
    isItineraryPage,
    isLegalPage,
    isNewsletterPage,
    isQuotePage,
    isSupportPage,
    isTestimonialPage,
    isTransportPage
  ])

  const travelDatesLabel = isTransportPage ? 'Travel date / time' : 'Travel dates'
  const travelDatesPlaceholder = isTransportPage ? 'e.g. 15 Sept 2026, 14:20 arrival' : 'e.g. 15–19 Sept 2026'

  const contextSummary = useMemo(() => {
    if (isLegalPage) {
      return `Legal topic: ${legalTopic}`
    }
    if (isSupportPage) {
      return `Support topic: ${questionType}`
    }
    if (isNewsletterPage) {
      return `Update preference: ${updateType}`
    }
    if (isTestimonialPage) {
      return `Trip type: ${travelPartyType}`
    }
    if (isGuidePage) {
      return visitMonth.trim() ? `Planned travel month: ${visitMonth.trim()}` : 'Guide context: general'
    }
    if (isClubRentalPage) {
      return compactLines([
        travelDates.trim() ? `Travel dates: ${travelDates.trim()}` : null,
        playersNeedingClubs.trim() ? `Players needing clubs: ${playersNeedingClubs.trim()}` : null,
        `Rental tier: ${rentalTier}`,
        `Handedness mix: ${handedness}`,
        deliveryPoint.trim() ? `Delivery / handover point: ${deliveryPoint.trim()}` : null
      ]).join(' | ')
    }
    if (isCoursesPage) {
      return compactLines([
        travelDates.trim() ? `Travel dates: ${travelDates.trim()}` : null,
        groupSize.trim() ? `Group size: ${groupSize.trim()}` : null,
        `Preferred course area: ${courseArea}`,
        handicapMix.trim() ? `Handicap mix: ${handicapMix.trim()}` : null
      ]).join(' | ')
    }
    if (isAccommodationPage) {
      return compactLines([
        travelDates.trim() ? `Travel dates: ${travelDates.trim()}` : null,
        groupSize.trim() ? `Group size: ${groupSize.trim()}` : null,
        `Stay level: ${accommodationTier}`,
        `Preferred base: ${preferredArea}`
      ]).join(' | ')
    }
    if (isTransportPage) {
      return compactLines([
        passengerCount.trim() ? `Passengers: ${passengerCount.trim()}` : null,
        pickupPoint.trim() ? `Pickup point: ${pickupPoint.trim()}` : null,
        destinationPoint.trim() ? `Destination: ${destinationPoint.trim()}` : null,
        travelDates.trim() ? `Travel timing: ${travelDates.trim()}` : null
      ]).join(' | ')
    }
    if (isItineraryPage || isQuotePage) {
      return compactLines([
        travelDates.trim() ? `Travel dates: ${travelDates.trim()}` : null,
        groupSize.trim() ? `Group size: ${groupSize.trim()}` : null,
        `Preferred base: ${preferredArea}`,
        `Trip style: ${tripStyle}`
      ]).join(' | ')
    }
    return ''
  }, [
    accommodationTier,
    courseArea,
    deliveryPoint,
    destinationPoint,
    groupSize,
    handicapMix,
    handedness,
    isAccommodationPage,
    isClubRentalPage,
    isCoursesPage,
    isGuidePage,
    isItineraryPage,
    isLegalPage,
    isNewsletterPage,
    isQuotePage,
    isSupportPage,
    isTestimonialPage,
    isTransportPage,
    legalTopic,
    passengerCount,
    pickupPoint,
    playersNeedingClubs,
    preferredArea,
    questionType,
    rentalTier,
    travelDates,
    tripStyle,
    updateType,
    travelPartyType,
    visitMonth
  ])

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
    if ((isQuotePage || isItineraryPage) && (!travelDates.trim() || !groupSize.trim())) {
      setErrorMessage('Please add your travel dates and group size so we can shape the trip properly.')
      setStatus('error')
      return
    }
    if (isClubRentalPage && (!travelDates.trim() || !playersNeedingClubs.trim())) {
      setErrorMessage('Please add the travel window and how many players need rental clubs.')
      setStatus('error')
      return
    }
    if (isCoursesPage && (!travelDates.trim() || !groupSize.trim())) {
      setErrorMessage('Please add your dates and group size so we can send the right course shortlist.')
      setStatus('error')
      return
    }
    if (isAccommodationPage && (!travelDates.trim() || !groupSize.trim())) {
      setErrorMessage('Please add your dates and group size so we can match the right hotels.')
      setStatus('error')
      return
    }
    if (isTransportPage && (!passengerCount.trim() || !pickupPoint.trim() || !destinationPoint.trim())) {
      setErrorMessage('Please add passenger count, pickup point, and destination for transport planning.')
      setStatus('error')
      return
    }
    if ((isLegalPage || isSupportPage || isGuidePage || isTestimonialPage) && !notes.trim()) {
      setErrorMessage('Please add a few details so we can respond properly.')
      setStatus('error')
      return
    }

    setStatus('submitting')
    try {
      const interestLines = compactLines([
        `Page intent: ${interestPreset}`,
        contextSummary || null,
        isPlanningVariant && travelDates.trim() ? `${travelDatesLabel}: ${travelDates.trim()}` : null,
        isPlanningVariant && groupSize.trim() ? `Group size: ${groupSize.trim()}` : null,
        isClubRentalPage && playersNeedingClubs.trim() ? `Players needing clubs: ${playersNeedingClubs.trim()}` : null,
        isClubRentalPage ? `Rental tier: ${rentalTier}` : null,
        isClubRentalPage ? `Handedness mix: ${handedness}` : null,
        isClubRentalPage && deliveryPoint.trim() ? `Delivery / handover point: ${deliveryPoint.trim()}` : null,
        isCoursesPage ? `Preferred course area: ${courseArea}` : null,
        isCoursesPage && handicapMix.trim() ? `Handicap mix: ${handicapMix.trim()}` : null,
        isAccommodationPage ? `Stay level: ${accommodationTier}` : null,
        isAccommodationPage ? `Preferred base: ${preferredArea}` : null,
        isTransportPage && passengerCount.trim() ? `Passengers: ${passengerCount.trim()}` : null,
        isTransportPage && pickupPoint.trim() ? `Pickup point: ${pickupPoint.trim()}` : null,
        isTransportPage && destinationPoint.trim() ? `Destination: ${destinationPoint.trim()}` : null,
        (isQuotePage || isItineraryPage) ? `Preferred base: ${preferredArea}` : null,
        (isQuotePage || isItineraryPage) ? `Trip style: ${tripStyle}` : null,
        notes.trim() ? `Notes: ${notes.trim()}` : null
      ])

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
      setQuestionType('General question')
      setLegalTopic('Privacy policy')
      setUpdateType('Course updates')
      setVisitMonth('')
      setTravelPartyType('Golf group')
      setTripStyle('Group golf holiday')
      setPreferredArea('Open to suggestions')
      setAccommodationTier('4-star hotel')
      setCourseArea('Open to suggestions')
      setHandicapMix('')
      setPlayersNeedingClubs('')
      setRentalTier('Standard sets')
      setHandedness('Mostly right-handed')
      setDeliveryPoint('')
      setPickupPoint('')
      setDestinationPoint('')
      setPassengerCount('')
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
          {isLegalPage ? (
            <label className="block">
              <span className={labelClass}>Legal topic</span>
              <select className={inputClass} value={legalTopic} onChange={(e) => setLegalTopic(e.target.value)}>
                <option>Privacy policy</option>
                <option>Terms and conditions</option>
                <option>Data removal request</option>
                <option>Consent and communications</option>
              </select>
            </label>
          ) : null}
          {isSupportPage ? (
            <label className="block">
              <span className={labelClass}>Question category</span>
              <select className={inputClass} value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                <option>General question</option>
                <option>Quote and planning support</option>
                <option>Existing booking help</option>
                <option>Payments and deposits</option>
                <option>Course availability</option>
                <option>Transfers and logistics</option>
              </select>
            </label>
          ) : null}
          {isNewsletterPage ? (
            <label className="block">
              <span className={labelClass}>Update preference</span>
              <select className={inputClass} value={updateType} onChange={(e) => setUpdateType(e.target.value)}>
                <option>Course updates</option>
                <option>Planning tips</option>
                <option>Special offers</option>
                <option>All newsletter updates</option>
              </select>
            </label>
          ) : null}
          {isClubRentalPage ? (
            <>
              <label className="block">
                <span className={labelClass}>Travel dates</span>
                <input
                  className={inputClass}
                  value={travelDates}
                  onChange={(e) => setTravelDates(e.target.value)}
                  placeholder="e.g. 15–19 Sept 2026"
                  required
                />
              </label>
              <label className="block">
                <span className={labelClass}>Players needing clubs</span>
                <input
                  className={inputClass}
                  value={playersNeedingClubs}
                  onChange={(e) => setPlayersNeedingClubs(e.target.value)}
                  placeholder="e.g. 4 players"
                  required
                />
              </label>
              <label className="block">
                <span className={labelClass}>Rental tier</span>
                <select className={inputClass} value={rentalTier} onChange={(e) => setRentalTier(e.target.value)}>
                  <option>Standard sets</option>
                  <option>Premium sets</option>
                  <option>Mix of standard and premium</option>
                  <option>Open to recommendation</option>
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Handedness mix</span>
                <select className={inputClass} value={handedness} onChange={(e) => setHandedness(e.target.value)}>
                  <option>Mostly right-handed</option>
                  <option>Includes left-handed players</option>
                  <option>Women’s sets needed</option>
                  <option>Mixed player profiles</option>
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Delivery / handover point (optional)</span>
                <input
                  className={inputClass}
                  value={deliveryPoint}
                  onChange={(e) => setDeliveryPoint(e.target.value)}
                  placeholder="Hotel, resort, or arrival point"
                />
              </label>
            </>
          ) : null}
          {isCoursesPage ? (
            <>
              <label className="block">
                <span className={labelClass}>Travel dates</span>
                <input
                  className={inputClass}
                  value={travelDates}
                  onChange={(e) => setTravelDates(e.target.value)}
                  placeholder="e.g. 15–19 Sept 2026"
                  required
                />
              </label>
              <label className="block">
                <span className={labelClass}>Group size</span>
                <input
                  className={inputClass}
                  value={groupSize}
                  onChange={(e) => setGroupSize(e.target.value)}
                  placeholder="e.g. 8 golfers"
                  required
                />
              </label>
              <label className="block">
                <span className={labelClass}>Preferred course area</span>
                <select className={inputClass} value={courseArea} onChange={(e) => setCourseArea(e.target.value)}>
                  <option>Open to suggestions</option>
                  <option>Marbella Golf Valley</option>
                  <option>Sotogrande cluster</option>
                  <option>Mijas and Fuengirola</option>
                  <option>Mix across the coast</option>
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Handicap mix (optional)</span>
                <input
                  className={inputClass}
                  value={handicapMix}
                  onChange={(e) => setHandicapMix(e.target.value)}
                  placeholder="e.g. 8–20 handicap mix"
                />
              </label>
            </>
          ) : null}
          {isAccommodationPage ? (
            <>
              <label className="block">
                <span className={labelClass}>Travel dates</span>
                <input
                  className={inputClass}
                  value={travelDates}
                  onChange={(e) => setTravelDates(e.target.value)}
                  placeholder="e.g. 15–19 Sept 2026"
                  required
                />
              </label>
              <label className="block">
                <span className={labelClass}>Group size</span>
                <input
                  className={inputClass}
                  value={groupSize}
                  onChange={(e) => setGroupSize(e.target.value)}
                  placeholder="e.g. 8 golfers"
                  required
                />
              </label>
              <label className="block">
                <span className={labelClass}>Stay level</span>
                <select
                  className={inputClass}
                  value={accommodationTier}
                  onChange={(e) => setAccommodationTier(e.target.value)}
                >
                  <option>3-star hotel</option>
                  <option>4-star hotel</option>
                  <option>5-star hotel</option>
                  <option>Apartment-style stay</option>
                  <option>Open to recommendation</option>
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Preferred base</span>
                <select className={inputClass} value={preferredArea} onChange={(e) => setPreferredArea(e.target.value)}>
                  <option>Open to suggestions</option>
                  <option>Fuengirola</option>
                  <option>Torremolinos</option>
                  <option>Marbella / Nueva Andalucía</option>
                  <option>Estepona / Sotogrande</option>
                </select>
              </label>
            </>
          ) : null}
          {isTransportPage ? (
            <>
              <label className="block">
                <span className={labelClass}>Passengers</span>
                <input
                  className={inputClass}
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(e.target.value)}
                  placeholder="e.g. 8 passengers with golf bags"
                  required
                />
              </label>
              <label className="block">
                <span className={labelClass}>Pickup point</span>
                <input
                  className={inputClass}
                  value={pickupPoint}
                  onChange={(e) => setPickupPoint(e.target.value)}
                  placeholder="Málaga Airport, hotel, or golf club"
                  required
                />
              </label>
              <label className="block">
                <span className={labelClass}>Destination</span>
                <input
                  className={inputClass}
                  value={destinationPoint}
                  onChange={(e) => setDestinationPoint(e.target.value)}
                  placeholder="Hotel, resort, or course"
                  required
                />
              </label>
              <label className="block">
                <span className={labelClass}>{travelDatesLabel} (optional)</span>
                <input
                  className={inputClass}
                  value={travelDates}
                  onChange={(e) => setTravelDates(e.target.value)}
                  placeholder={travelDatesPlaceholder}
                />
              </label>
            </>
          ) : null}
          {isTestimonialPage ? (
            <label className="block">
              <span className={labelClass}>Trip type</span>
              <select className={inputClass} value={travelPartyType} onChange={(e) => setTravelPartyType(e.target.value)}>
                <option>Golf group</option>
                <option>Society trip</option>
                <option>Family holiday</option>
                <option>Corporate incentive</option>
              </select>
            </label>
          ) : null}
          {isGuidePage ? (
            <label className="block">
              <span className={labelClass}>Planned travel month (optional)</span>
              <input
                className={inputClass}
                value={visitMonth}
                onChange={(e) => setVisitMonth(e.target.value)}
                placeholder="e.g. September 2026"
              />
            </label>
          ) : null}
          {isQuotePage || isItineraryPage ? (
            <>
              <label className="block">
                <span className={labelClass}>{travelDatesLabel}</span>
                <input
                  className={inputClass}
                  value={travelDates}
                  onChange={(e) => setTravelDates(e.target.value)}
                  placeholder={travelDatesPlaceholder}
                  required
                />
              </label>
              <label className="block">
                <span className={labelClass}>Group size</span>
                <input
                  className={inputClass}
                  value={groupSize}
                  onChange={(e) => setGroupSize(e.target.value)}
                  placeholder="e.g. 8 golfers"
                  required
                />
              </label>
              <label className="block">
                <span className={labelClass}>Preferred base</span>
                <select className={inputClass} value={preferredArea} onChange={(e) => setPreferredArea(e.target.value)}>
                  <option>Open to suggestions</option>
                  <option>Fuengirola</option>
                  <option>Torremolinos</option>
                  <option>Marbella / Nueva Andalucía</option>
                  <option>Estepona / Sotogrande</option>
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Trip style</span>
                <select className={inputClass} value={tripStyle} onChange={(e) => setTripStyle(e.target.value)}>
                  <option>Group golf holiday</option>
                  <option>Society trip</option>
                  <option>Family golf holiday</option>
                  <option>Corporate / incentive trip</option>
                  <option>Open to recommendation</option>
                </select>
              </label>
            </>
          ) : null}
          <label className="block">
            <span className={labelClass}>{notesLabel}</span>
            <textarea
              className="min-h-[120px] w-full rounded-xl border border-ge-gray200 bg-white px-3.5 py-3 font-ge text-[1rem] leading-7 text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={notesPlaceholder}
              required={isLegalPage || isSupportPage || isGuidePage || isTestimonialPage}
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
