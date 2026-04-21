import { useMemo, useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { GeButton } from './ge-button'
import { contactInfo } from '../data/copy'

interface GeQuickEnquiryFormProps {
  readonly title: string
  readonly lead: string
  readonly interestPreset: string
  readonly enquiryType?: 'booking' | 'legal' | 'newsletter' | 'testimonial' | 'support'
}

const labelClass =
  'mb-1 block font-ge text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-gray500'
const inputClass =
  'h-12 w-full rounded-xl border border-ge-gray200 bg-white px-3.5 font-ge text-[1rem] text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-gs-green focus:ring-2 focus:ring-gs-green/25'

export function GeQuickEnquiryForm({
  title,
  lead,
  interestPreset,
  enquiryType
}: GeQuickEnquiryFormProps) {
  const preset = interestPreset.toLowerCase()
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
  const [preferredArea, setPreferredArea] = useState('Marbella')
  const [hotelTier, setHotelTier] = useState('4-star')
  const [rentalSets, setRentalSets] = useState('4')
  const [rentalProfile, setRentalProfile] = useState('Mixed standard sets')
  const [teeTimeArea, setTeeTimeArea] = useState('Marbella / Nueva Andalucia')
  const [teeTimeRounds, setTeeTimeRounds] = useState('3')
  const [familyPartyMix, setFamilyPartyMix] = useState('2 adults / 2 children')
  const [familyStayStyle, setFamilyStayStyle] = useState('Beach resort with golf access')
  const [courseFocus, setCourseFocus] = useState('Best-value mix')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isLegalPage = enquiryType === 'legal'
  const isFaqPage = preset.includes('faq')
  const isNewsletterPage = enquiryType === 'newsletter'
  const isTestimonialPage = enquiryType === 'testimonial'
  const isGuidePage = preset.includes('guidance') || preset.includes('travel to')
  const isBookingPage = enquiryType === 'booking'
  const isSupportPage = enquiryType === 'support' || isFaqPage
  const isClubRentalPage = preset.includes('club rental')
  const isTeeTimePage = preset.includes('tee time')
  const isFamilyHolidayPage = preset.includes('family')
  const isAccommodationPage = preset.includes('accommodation') || preset.includes('hotel')
  const isCoursePage = preset.includes('course') || preset.includes('golf map')
  const isPackagePage = preset.includes('package:')
  const showPhoneField = !isNewsletterPage
  const phoneRequired = isBookingPage || isClubRentalPage || isTeeTimePage || isFamilyHolidayPage || isAccommodationPage || isCoursePage
  const nameRequired = !isNewsletterPage

  const notesPlaceholder = useMemo(() => {
    if (isLegalPage) return 'Tell us your legal/privacy question.'
    if (isFaqPage) return 'Tell us the exact question you need answered.'
    if (isNewsletterPage) return 'Tell us what kind of updates or offers you want to receive.'
    if (isTestimonialPage) return 'Share key highlights from your trip.'
    if (isGuidePage) return 'Tell us what travel guidance you need.'
    if (isClubRentalPage) return 'Tell us preferred brands, shaft types, or anything specific your group needs.'
    if (isTeeTimePage) return 'Tell us tee-time preferences, handicap spread, or must-play rounds.'
    if (isFamilyHolidayPage) return 'Tell us ages, school-holiday dates, or what balance of golf and downtime you want.'
    if (isAccommodationPage) return 'Tell us budget, board basis, nightlife preferences, or any must-have hotel features.'
    if (isCoursePage) return 'Tell us the type of courses you want to prioritise and any must-play venues.'
    if (isBookingPage) return 'Tell us what you need help booking.'
    return 'Tell us what matters most for your trip.'
  }, [
    isAccommodationPage,
    isBookingPage,
    isClubRentalPage,
    isCoursePage,
    isFaqPage,
    isFamilyHolidayPage,
    isGuidePage,
    isLegalPage,
    isNewsletterPage,
    isTeeTimePage,
    isTestimonialPage
  ])

  const notesLabel = useMemo(() => {
    if (isLegalPage || isFaqPage || isGuidePage) return 'Question details'
    if (isNewsletterPage) return 'Update request details'
    if (isTestimonialPage) return 'Testimonial details'
    if (isClubRentalPage) return 'Rental notes'
    if (isTeeTimePage) return 'Tee-time notes'
    if (isFamilyHolidayPage) return 'Family trip notes'
    if (isAccommodationPage) return 'Stay notes'
    if (isCoursePage) return 'Course notes'
    if (isBookingPage) return 'Booking notes'
    return 'Notes (optional)'
  }, [
    isAccommodationPage,
    isBookingPage,
    isClubRentalPage,
    isCoursePage,
    isFaqPage,
    isFamilyHolidayPage,
    isGuidePage,
    isLegalPage,
    isNewsletterPage,
    isTeeTimePage,
    isTestimonialPage
  ])

  const contextSummary = useMemo(() => {
    if (isLegalPage) {
      return `Legal topic: ${legalTopic}`
    }
    if (isFaqPage || isSupportPage) {
      return `FAQ category: ${questionType}`
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
      return `Rental sets: ${rentalSets} | Rental profile: ${rentalProfile}`
    }
    if (isTeeTimePage) {
      return `Golf area: ${teeTimeArea} | Preferred rounds: ${teeTimeRounds}`
    }
    if (isFamilyHolidayPage) {
      return `Party mix: ${familyPartyMix} | Stay style: ${familyStayStyle}`
    }
    if (isAccommodationPage) {
      return `Preferred area: ${preferredArea} | Hotel tier: ${hotelTier}`
    }
    if (isCoursePage) {
      return `Golf area: ${preferredArea} | Course focus: ${courseFocus}`
    }
    if (isBookingPage) {
      const details = []
      if (travelDates.trim()) details.push(`Travel dates: ${travelDates.trim()}`)
      if (groupSize.trim()) details.push(`Group size: ${groupSize.trim()}`)
      return details.length ? details.join(' | ') : 'Booking context: awaiting dates/group size'
    }
    return ''
  }, [
    isBookingPage,
    isFaqPage,
    isGuidePage,
    isLegalPage,
    isNewsletterPage,
    isSupportPage,
    isTestimonialPage,
    legalTopic,
    questionType,
    updateType,
    travelPartyType,
    travelDates,
    groupSize,
    visitMonth,
    rentalSets,
    rentalProfile,
    teeTimeArea,
    teeTimeRounds,
    familyPartyMix,
    familyStayStyle,
    preferredArea,
    hotelTier,
    courseFocus,
    isClubRentalPage,
    isTeeTimePage,
    isFamilyHolidayPage,
    isAccommodationPage,
    isCoursePage
  ])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('idle')
    setErrorMessage(null)

    const name = fullName.trim()
    const mail = email.trim().toLowerCase()
    const phone = phoneWhatsApp.trim()

    if ((nameRequired && !name) || !mail || (phoneRequired && !phone)) {
      setErrorMessage(
        phoneRequired
          ? 'Please add the details needed here: name, email, and phone/WhatsApp.'
          : 'Please add the required contact details for this request.'
      )
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
        contextSummary || null,
        !isLegalPage && !isSupportPage && !isNewsletterPage && !isTestimonialPage && !isGuidePage && travelDates.trim()
          ? `Travel dates: ${travelDates.trim()}`
          : null,
        !isLegalPage && !isSupportPage && !isNewsletterPage && !isTestimonialPage && !isGuidePage && groupSize.trim()
          ? `Group size: ${groupSize.trim()}`
          : null,
        notes.trim() ? `Notes: ${notes.trim()}` : null
      ].filter(Boolean)

      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name || 'Newsletter subscriber',
          email: mail,
          phoneWhatsApp: phone || 'Not supplied',
          interest: interestLines.join('\n'),
          bestTimeToCall: phoneRequired ? 'Any time' : 'Email preferred'
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
      setPreferredArea('Marbella')
      setHotelTier('4-star')
      setRentalSets('4')
      setRentalProfile('Mixed standard sets')
      setTeeTimeArea('Marbella / Nueva Andalucia')
      setTeeTimeRounds('3')
      setFamilyPartyMix('2 adults / 2 children')
      setFamilyStayStyle('Beach resort with golf access')
      setCourseFocus('Best-value mix')
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
              required={nameRequired}
              placeholder={isNewsletterPage ? 'Optional' : 'Your name'}
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
          {showPhoneField ? (
            <label className="block">
              <span className={labelClass}>{phoneRequired ? 'Phone / WhatsApp' : 'Phone / WhatsApp (optional)'}</span>
              <input
                className={inputClass}
                value={phoneWhatsApp}
                onChange={(e) => setPhoneWhatsApp(e.target.value)}
                autoComplete="tel"
                type="tel"
                required={phoneRequired}
                placeholder={contactInfo.phoneDisplay}
              />
            </label>
          ) : null}
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
          {isFaqPage || isSupportPage ? (
            <label className="block">
              <span className={labelClass}>Question category</span>
              <select className={inputClass} value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                <option>General question</option>
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
          {isClubRentalPage ? (
            <>
              <label className="block">
                <span className={labelClass}>How many rental sets?</span>
                <select className={inputClass} value={rentalSets} onChange={(e) => setRentalSets(e.target.value)}>
                  <option>1</option>
                  <option>2</option>
                  <option>4</option>
                  <option>8</option>
                  <option>12+</option>
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Rental profile</span>
                <select className={inputClass} value={rentalProfile} onChange={(e) => setRentalProfile(e.target.value)}>
                  <option>Mixed standard sets</option>
                  <option>Premium men&apos;s sets</option>
                  <option>Ladies&apos; sets</option>
                  <option>Left-handed sets</option>
                  <option>Mixed requirement</option>
                </select>
              </label>
            </>
          ) : null}
          {isTeeTimePage ? (
            <>
              <label className="block">
                <span className={labelClass}>Preferred golf area</span>
                <select className={inputClass} value={teeTimeArea} onChange={(e) => setTeeTimeArea(e.target.value)}>
                  <option>Marbella / Nueva Andalucia</option>
                  <option>Mijas / Fuengirola</option>
                  <option>Estepona / Sotogrande</option>
                  <option>Open to suggestions</option>
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Preferred number of rounds</span>
                <select className={inputClass} value={teeTimeRounds} onChange={(e) => setTeeTimeRounds(e.target.value)}>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4+</option>
                </select>
              </label>
            </>
          ) : null}
          {isFamilyHolidayPage ? (
            <>
              <label className="block">
                <span className={labelClass}>Family party mix</span>
                <input
                  className={inputClass}
                  value={familyPartyMix}
                  onChange={(e) => setFamilyPartyMix(e.target.value)}
                  placeholder="e.g. 4 adults / 2 children"
                />
              </label>
              <label className="block">
                <span className={labelClass}>Preferred stay style</span>
                <select className={inputClass} value={familyStayStyle} onChange={(e) => setFamilyStayStyle(e.target.value)}>
                  <option>Beach resort with golf access</option>
                  <option>Quiet luxury hotel</option>
                  <option>Apartment-style stay</option>
                  <option>Open to suggestions</option>
                </select>
              </label>
            </>
          ) : null}
          {isAccommodationPage ? (
            <>
              <label className="block">
                <span className={labelClass}>Preferred hotel area</span>
                <select className={inputClass} value={preferredArea} onChange={(e) => setPreferredArea(e.target.value)}>
                  <option>Marbella</option>
                  <option>Fuengirola</option>
                  <option>Torremolinos</option>
                  <option>Estepona</option>
                  <option>Open to suggestions</option>
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Hotel tier</span>
                <select className={inputClass} value={hotelTier} onChange={(e) => setHotelTier(e.target.value)}>
                  <option>3-star</option>
                  <option>4-star</option>
                  <option>5-star</option>
                  <option>Best-value shortlist</option>
                </select>
              </label>
            </>
          ) : null}
          {isCoursePage ? (
            <>
              <label className="block">
                <span className={labelClass}>Preferred golf area</span>
                <select className={inputClass} value={preferredArea} onChange={(e) => setPreferredArea(e.target.value)}>
                  <option>Marbella</option>
                  <option>Mijas / Fuengirola</option>
                  <option>Estepona / Sotogrande</option>
                  <option>Open to suggestions</option>
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Course focus</span>
                <select className={inputClass} value={courseFocus} onChange={(e) => setCourseFocus(e.target.value)}>
                  <option>Best-value mix</option>
                  <option>Championship highlights</option>
                  <option>Easier social golf</option>
                  <option>Balance of all three</option>
                </select>
              </label>
            </>
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
          {!isLegalPage && !isSupportPage && !isNewsletterPage && !isTestimonialPage && !isGuidePage ? (
            <>
              <label className="block">
                <span className={labelClass}>{isPackagePage ? 'Preferred travel dates' : 'Travel dates (optional)'}</span>
                <input
                  className={inputClass}
                  value={travelDates}
                  onChange={(e) => setTravelDates(e.target.value)}
                  placeholder="e.g. 15–19 Sept 2026"
                />
              </label>
              <label className="block">
                <span className={labelClass}>{isPackagePage ? 'Group size you are pricing for' : 'Group size (optional)'}</span>
                <input
                  className={inputClass}
                  value={groupSize}
                  onChange={(e) => setGroupSize(e.target.value)}
                  placeholder="e.g. 8 golfers"
                />
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
