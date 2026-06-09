import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { m, type Variants } from 'framer-motion'
import {
  ArrowRight,
  BedDouble,
  Bus,
  CalendarRange,
  CheckCircle2,
  Sparkles,
  Users
} from 'lucide-react'
import { PremiumPageHero } from '../components/home/premium-page-hero'
import { NAMED_HERO_IMAGE_SETS } from '../lib/page-hero-images'
import { usePageMeta } from '../lib/use-page-meta'
import { TripServiceBookingCta } from '../components/trip-service-booking-cta'
import { GeButton } from './golf-experience/components/ge-button'
import { GeSection } from './golf-experience/components/ge-section'
import { WhatsappFab } from './golf-experience/components/whatsapp-fab'
import { GeFooter } from './golf-experience/sections/ge-footer'
import { GeNavbar } from './golf-experience/sections/ge-navbar'
import { integrationRegistry } from '../config/integrations'
import {
  COURSES,
  parseCourseHotelSearch,
  type CourseHotelPickerValue
} from '../data/coastal-golf-data'
import { footerSocialLinks, heroBackgroundImage } from '../data/site-content'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import { WEBSITE_ENQUIRY_FORM } from '../lib/enquiry-form-registry'
import { ENQUIRY_CONFLICT_EXISTING_PHONE, postWebsiteEnquiry } from '../lib/post-enquiry-client'
import { TERMS_ACCEPTANCE_ERROR, termsAcceptanceFormFields } from '../lib/terms-acceptance'
import { GeTermsAcceptanceField } from './golf-experience/components/ge-terms-acceptance-field'
import { buildPackageConfig, defaultLabelForBuild } from '../lib/package-build'
import { usePackageCalculatorPricing } from '../lib/use-package-calculator-pricing'
import { cx } from '../lib/utils'
import { useAuth } from '../providers/auth-provider'
import { CookieBanner, formatEuro } from './packages'

const CourseHotelMapPicker = lazy(async () => {
  const mod = await import('../components/course-hotel-map-picker')
  return { default: mod.CourseHotelMapPicker }
})

const PACKAGE_HERO_TRUST = [
  { icon: Users, label: '1 to 8 golfers' },
  { icon: CalendarRange, label: 'Live trip estimate' },
  { icon: BedDouble, label: 'Stay levels priced in' },
  { icon: Bus, label: 'Transfer options included' }
] as const

const sectionHeaderContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } }
}

const sectionHeaderItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.48, ease: 'easeOut' } }
}

const packageCardSelected =
  'ge-on-dark border-brand-700 bg-gradient-to-br from-gs-green to-brand-800 text-white shadow-[0_18px_48px_rgba(6,59,42,0.28)]'
const packageCardDefault =
  'border-forest-800/15 bg-gradient-to-b from-white to-[#f5f1e8] text-gs-dark shadow-[0_10px_28px_rgba(6,32,22,0.09)]'

const packageFieldLabel =
  'mb-1.5 block font-ge text-[0.72rem] font-bold uppercase tracking-[0.14em] text-gs-dark/72'
const packageFieldInput =
  'h-12 w-full rounded-xl border border-ge-gray200 bg-white px-3.5 font-ge text-sm text-gs-dark shadow-sm outline-none ring-brand-700/40 transition-shadow placeholder:text-ge-gray300 focus:border-brand-700 focus:ring-2'

const PACKAGE_STYLE_META = [
  {
    name: 'Social Escape',
    badge: 'Easy-going premium',
    summary: 'A polished Costa del Sol golf trip with strong value, smart transfers, and everything lined up cleanly.',
    included: ['Golf planning', 'Airport transfer setup', 'Stay matching', 'Ideal for shorter trips']
  },
  {
    name: 'Premium Fairway',
    badge: 'Most popular',
    summary: 'The sweet spot for Irish groups who want better hotels, cleaner routing, and a more premium overall trip feel.',
    included: ['Premium accommodation fit', 'Smoother transfer plan', 'Stronger course shortlist', 'Best all-round choice']
  },
  {
    name: 'Signature Costa',
    badge: 'Luxury build',
    summary: 'A stronger high-end package for groups that want marquee golf, luxury stays, and a more elevated travel setup.',
    included: ['Luxury routing', 'Marquee course mix', 'Higher-touch package setup', 'Best for standout trips']
  }
] as const

const STAY_META = [
  {
    name: 'Coastal 3-star',
    area: 'La Cala',
    summary: 'Smart, social, and ideal for golfers who want the package to feel clean without overreaching on hotel spend.'
  },
  {
    name: 'Premium 4-star',
    area: 'Marbella',
    summary: 'The strongest all-round hotel option for most groups: better rooms, better feel, and a more premium stay rhythm.'
  },
  {
    name: 'Luxury 5-star',
    area: 'Estepona',
    summary: 'A more refined, elevated stay level for golfers who want the hotel to feel as premium as the courses.'
  }
] as const

const TRANSFER_META = [
  {
    name: 'Shared arrival and golf transfers',
    summary: 'The lightest transport setup for smaller groups who still want airport and golf-day movements covered.'
  },
  {
    name: 'Private return transfers',
    summary: 'A cleaner, more private transport option that suits most premium golf groups very well.'
  },
  {
    name: 'Dedicated driver support',
    summary: 'The smoothest premium option, with driver support across the trip rather than just the airport runs.'
  }
] as const

const DEFAULT_PACKAGE_STYLE_NAME = PACKAGE_STYLE_META[1].name
const DEFAULT_STAY_NAME = STAY_META[1].name
const DEFAULT_TRANSFER_NAME = TRANSFER_META[1].name

const transferNameByParam = {
  shared: 'Shared arrival and golf transfers',
  private: 'Private return transfers',
  driver: 'Dedicated driver support'
} as const

const revealUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: 'easeOut' }
} as const

const selectedHotelTierStorageKey = 'gsol-selected-hotel-tier'

const stayNameByTier = {
  3: 'Coastal 3-star',
  4: 'Premium 4-star',
  5: 'Luxury 5-star'
} as const

const getInitialSelectedPackageName = () => {
  const searchParams = new URLSearchParams(window.location.search)
  const raw = searchParams.get('package')

  if (raw && PACKAGE_STYLE_META.some((item) => item.name === raw)) {
    return raw
  }

  return DEFAULT_PACKAGE_STYLE_NAME
}

const getInitialSelectedStayName = () => {
  const searchParams = new URLSearchParams(window.location.search)
  const stayTierParam = searchParams.get('stay')

  if (stayTierParam === '3' || stayTierParam === '4' || stayTierParam === '5') {
    return stayNameByTier[Number(stayTierParam) as 3 | 4 | 5]
  }

  const storedTier = sessionStorage.getItem(selectedHotelTierStorageKey)

  if (storedTier === '3' || storedTier === '4' || storedTier === '5') {
    return stayNameByTier[Number(storedTier) as 3 | 4 | 5]
  }

  return DEFAULT_STAY_NAME
}

const getInitialSelectedTransferName = () => {
  const searchParams = new URLSearchParams(window.location.search)
  const transferParam = searchParams.get('transfer')

  if (transferParam === 'shared' || transferParam === 'private' || transferParam === 'driver') {
    return transferNameByParam[transferParam]
  }

  return DEFAULT_TRANSFER_NAME
}

const getInitialNumberParam = ({
  paramName,
  min,
  max,
  fallback
}: {
  readonly paramName: string
  readonly min: number
  readonly max: number
  readonly fallback: number
}) => {
  const searchParams = new URLSearchParams(window.location.search)
  const rawValue = Number(searchParams.get(paramName))

  if (Number.isNaN(rawValue)) {
    return fallback
  }

  return Math.min(Math.max(rawValue, min), max)
}

function CustomerPackagePage() {
  usePageMeta({
    title: 'Costa del Sol golf packages for Irish travellers',
    description:
      'Build a Costa del Sol golf package live — choose stay level, group size, rounds, and transfers. Instant estimate for Irish golfers.',
    canonicalPath: '/packages'
  })

  const { session, isLoading: authLoading } = useAuth()
  const calculatorPricing = usePackageCalculatorPricing()

  const packageStyles = useMemo(
    () =>
      PACKAGE_STYLE_META.map((meta) => {
        const rates = calculatorPricing.packages.find((item) => item.name === meta.name)
        return {
          ...meta,
          roundPrice: rates?.roundPrice ?? 145,
          planningFee: rates?.planningFee ?? 145
        }
      }),
    [calculatorPricing.packages]
  )

  const stayOptions = useMemo(
    () =>
      STAY_META.map((meta) => {
        const rates = calculatorPricing.stays.find((item) => item.name === meta.name)
        return {
          ...meta,
          pricePerNight: rates?.pricePerNight ?? 148,
          singleSupplementPerNight: rates?.singleSupplementPerNight ?? 34
        }
      }),
    [calculatorPricing.stays]
  )

  const transferOptions = useMemo(
    () =>
      TRANSFER_META.map((meta) => {
        const rates = calculatorPricing.transfers.find((item) => item.name === meta.name)
        return {
          ...meta,
          tripCost: rates?.tripCost ?? 260
        }
      }),
    [calculatorPricing.transfers]
  )

  const [selectedPackageName, setSelectedPackageName] = useState<string>(getInitialSelectedPackageName)
  const [selectedStayName, setSelectedStayName] = useState<string>(getInitialSelectedStayName)
  const [selectedTransferName, setSelectedTransferName] = useState<string>(getInitialSelectedTransferName)
  const [groupSize, setGroupSize] = useState(() => getInitialNumberParam({ paramName: 'groupSize', min: 1, max: 8, fallback: 4 }))
  const [nights, setNights] = useState(() => getInitialNumberParam({ paramName: 'nights', min: 3, max: 7, fallback: 4 }))
  const [rounds, setRounds] = useState(() => getInitialNumberParam({ paramName: 'rounds', min: 2, max: 5, fallback: 3 }))
  const [courseHotelPick, setCourseHotelPick] = useState<CourseHotelPickerValue>(() =>
    parseCourseHotelSearch(window.location.search)
  )
  const [hasAcceptedCookies, setHasAcceptedCookies] = useState(true)
  const [isSavingBuild, setIsSavingBuild] = useState(false)
  const [saveBuildError, setSaveBuildError] = useState<string | null>(null)
  const [saveBuildOk, setSaveBuildOk] = useState(false)
  const [enquiryName, setEnquiryName] = useState('')
  const [enquiryEmail, setEnquiryEmail] = useState('')
  const [enquiryPhone, setEnquiryPhone] = useState('')
  const [enquiryBestTime, setEnquiryBestTime] = useState('Any time')
  const [enquiryStatus, setEnquiryStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [enquiryError, setEnquiryError] = useState<string | null>(null)
  const [enquiryErrorCode, setEnquiryErrorCode] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const enquiryConfirmationRef = useRef<HTMLDivElement>(null)
  const whatsAppHref = footerSocialLinks.find((link) => link.label === 'WhatsApp')?.href ?? 'https://www.whatsapp.com/'

  const selectedPackage = packageStyles.find((item) => item.name === selectedPackageName) ?? packageStyles[1]
  const selectedStay = stayOptions.find((item) => item.name === selectedStayName) ?? stayOptions[1]
  const selectedTransfer = transferOptions.find((item) => item.name === selectedTransferName) ?? transferOptions[1]

  const fromLanding = useMemo(
    () => new URLSearchParams(window.location.search).get('from') === 'landing',
    []
  )

  const loginHrefForSave = useMemo(() => {
    const returnParams = new URLSearchParams(window.location.search)
    returnParams.set('save', '1')
    const returnPath = `${window.location.pathname}?${returnParams.toString()}`
    return `/dashboard/login?next=${encodeURIComponent(returnPath)}`
  }, [])

  const pendingAutoSave = useMemo(() => new URLSearchParams(window.location.search).get('save') === '1', [])
  const autoSaveAttemptedRef = useRef(false)

  const pricingSummary = useMemo(() => {
    const accommodationPerPerson = selectedStay.pricePerNight * nights
    const singleRoomAdjustment = groupSize === 1 ? selectedStay.singleSupplementPerNight * nights : 0
    const golfPerPerson = selectedPackage.roundPrice * rounds
    const transferPerPerson = selectedTransfer.tripCost / Math.max(groupSize, 1)
    const planningPerPerson = selectedPackage.planningFee
    const estimatedPerPerson = accommodationPerPerson + singleRoomAdjustment + golfPerPerson + transferPerPerson + planningPerPerson
    const estimatedGroupTotal = estimatedPerPerson * groupSize
    const depositAmount = estimatedGroupTotal * 0.2
    const remainingBalance = estimatedGroupTotal * 0.8

    return {
      accommodationPerPerson,
      singleRoomAdjustment,
      golfPerPerson,
      transferPerPerson,
      planningPerPerson,
      estimatedPerPerson,
      estimatedGroupTotal,
      depositAmount,
      remainingBalance
    }
  }, [
    groupSize,
    nights,
    rounds,
    selectedPackage.planningFee,
    selectedPackage.roundPrice,
    selectedStay.pricePerNight,
    selectedStay.singleSupplementPerNight,
    selectedTransfer.tripCost
  ])

  const proposalTemplateHref = useMemo(() => {
    const searchParams = new URLSearchParams({
      package: selectedPackage.name,
      stayName: selectedStay.name,
      transferName: selectedTransfer.name,
      groupSize: String(groupSize),
      nights: String(nights),
      rounds: String(rounds),
      perPersonPrice: formatEuro(pricingSummary.estimatedPerPerson),
      groupTotal: formatEuro(pricingSummary.estimatedGroupTotal),
      depositAmount: formatEuro(pricingSummary.depositAmount),
      remainingBalance: formatEuro(pricingSummary.remainingBalance)
    })

    const { selectedCourse, selectedHotel } = courseHotelPick
    if (selectedCourse) {
      searchParams.set('courseId', selectedCourse)
      const course = COURSES.find((c) => c.id === selectedCourse)
      if (course) {
        searchParams.set('courseName', course.name)
      }
    }
    if (selectedHotel) {
      searchParams.set('hotelName', selectedHotel.name)
      searchParams.set('hotelStars', String(selectedHotel.stars))
      searchParams.set('hotelDist', selectedHotel.dist)
    }

    return `/proposal-template?${searchParams.toString()}`
  }, [
    courseHotelPick,
    groupSize,
    nights,
    pricingSummary.depositAmount,
    pricingSummary.estimatedGroupTotal,
    pricingSummary.estimatedPerPerson,
    pricingSummary.remainingBalance,
    rounds,
    selectedPackage.name,
    selectedStay.name,
    selectedTransfer.name
  ])

  const packageEnquirySummary = useMemo(() => {
    const lines = [
      'Hi Golf Sol Ireland,',
      '',
      "I'm interested in a Costa del Sol golf package. Here's my calculator selection:",
      '',
      `Package style: ${selectedPackage.name}`,
      `Stay level: ${selectedStay.name}`,
      `Transfer: ${selectedTransfer.name}`,
      `Group size: ${groupSize} golfers`,
      `Trip: ${nights} nights / ${rounds} rounds`,
      `Indicative per person: ${formatEuro(pricingSummary.estimatedPerPerson)}`,
      `Indicative group total: ${formatEuro(pricingSummary.estimatedGroupTotal)}`,
      `Deposit (20%): ${formatEuro(pricingSummary.depositAmount)}`
    ]

    const { selectedCourse, selectedHotel } = courseHotelPick
    if (selectedCourse) {
      const courseName = COURSES.find((c) => c.id === selectedCourse)?.name
      lines.push(`Preferred course: ${courseName ?? selectedCourse}`)
    }
    if (selectedHotel) {
      lines.push(`Preferred hotel: ${selectedHotel.name} (${selectedHotel.stars}★) · ${selectedHotel.dist}`)
    }

    lines.push('', 'Please get in touch to tailor this.')
    return lines.join('\n')
  }, [
    courseHotelPick,
    groupSize,
    nights,
    pricingSummary.depositAmount,
    pricingSummary.estimatedGroupTotal,
    pricingSummary.estimatedPerPerson,
    rounds,
    selectedPackage.name,
    selectedStay.name,
    selectedTransfer.name
  ])

  const packageEnquiryFormFields = useMemo(() => {
    const fields: Record<string, string> = {
      'Package style': selectedPackage.name,
      'Stay level': selectedStay.name,
      Transfer: selectedTransfer.name,
      'Group size': `${groupSize} golfers`,
      Trip: `${nights} nights / ${rounds} rounds`,
      'Indicative per person': formatEuro(pricingSummary.estimatedPerPerson),
      'Indicative group total': formatEuro(pricingSummary.estimatedGroupTotal),
      'Deposit (20%)': formatEuro(pricingSummary.depositAmount)
    }
    const { selectedCourse, selectedHotel } = courseHotelPick
    if (selectedCourse) {
      fields['Preferred course'] = COURSES.find((c) => c.id === selectedCourse)?.name ?? selectedCourse
    }
    if (selectedHotel) {
      fields['Preferred hotel'] = `${selectedHotel.name} (${selectedHotel.stars}★) · ${selectedHotel.dist}`
    }
    return fields
  }, [
    courseHotelPick,
    groupSize,
    nights,
    rounds,
    pricingSummary.depositAmount,
    pricingSummary.estimatedGroupTotal,
    pricingSummary.estimatedPerPerson,
    selectedPackage.name,
    selectedStay.name,
    selectedTransfer.name
  ])

  const packageEnquiryWhatsAppHref = useMemo(() => {
    const WHATSAPP_TEXT_LIMIT = 1800
    let text = packageEnquirySummary
    if (text.length > WHATSAPP_TEXT_LIMIT) {
      text = `${text.slice(0, WHATSAPP_TEXT_LIMIT - 3)}...`
    }
    try {
      const u = new URL(whatsAppHref)
      u.searchParams.set('text', text)
      return u.toString()
    } catch {
      const sep = whatsAppHref.includes('?') ? '&' : '?'
      return `${whatsAppHref}${sep}text=${encodeURIComponent(text)}`
    }
  }, [packageEnquirySummary, whatsAppHref])

  const packageEnquiryMailtoHref = useMemo(() => {
    const subject = `Costa del Sol package enquiry — ${selectedPackage.name}`
    const params = new URLSearchParams({
      subject,
      body: packageEnquirySummary
    })
    return `mailto:info@golfsolirl.com?${params.toString()}`
  }, [packageEnquirySummary, selectedPackage.name])

  const handlePackageEnquirySubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setEnquiryStatus('idle')
      setEnquiryError(null)
      setEnquiryErrorCode(null)

      const name = enquiryName.trim()
      const email = enquiryEmail.trim().toLowerCase()
      const phone = enquiryPhone.trim()

      if (!name || !email || !phone) {
        setEnquiryStatus('error')
        setEnquiryError('Please add your name, email and phone / WhatsApp.')
        return
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEnquiryStatus('error')
        setEnquiryError('Please enter a valid email address.')
        return
      }

      if (!termsAccepted) {
        setEnquiryStatus('error')
        setEnquiryError(TERMS_ACCEPTANCE_ERROR)
        return
      }

      setEnquiryStatus('submitting')
      setEnquiryErrorCode(null)
      try {
        const result = await postWebsiteEnquiry({
          fullName: name,
          email,
          phoneWhatsApp: phone,
          interest: `PACKAGE BUILDER — customer package enquiry\n${packageEnquirySummary}`,
          bestTimeToCall: enquiryBestTime.trim() || 'Any time',
          formPayload: {
            form: WEBSITE_ENQUIRY_FORM.packageBuilder,
            fields: { ...packageEnquiryFormFields, ...termsAcceptanceFormFields() }
          }
        })

        if (!result.ok) {
          setEnquiryStatus('error')
          setEnquiryError(result.message)
          setEnquiryErrorCode(result.code ?? null)
          return
        }

        setEnquiryStatus('success')
        setEnquiryErrorCode(null)
        setEnquiryName('')
        setEnquiryEmail('')
        setEnquiryPhone('')
        setEnquiryBestTime('Any time')
      } catch (error) {
        setEnquiryStatus('error')
        setEnquiryErrorCode(null)
        setEnquiryError(error instanceof Error ? error.message : 'Could not send your package enquiry right now.')
      }
    },
    [enquiryBestTime, enquiryEmail, enquiryName, enquiryPhone, packageEnquiryFormFields, packageEnquirySummary, termsAccepted]
  )

  const handleSavePackageToAccount = useCallback(async () => {
    setSaveBuildError(null)
    setSaveBuildOk(false)

    if (!integrationRegistry.supabase.enabled) {
      setSaveBuildError('Account sign-in is not available on this deployment yet.')
      return
    }

    if (!session?.user) {
      window.location.href = loginHrefForSave
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setSaveBuildError('Could not connect to your account.')
      return
    }

    setIsSavingBuild(true)
    const courseId = courseHotelPick.selectedCourse
    const courseName = courseId ? (COURSES.find((c) => c.id === courseId)?.name ?? null) : null

    const config = buildPackageConfig({
      source: fromLanding ? 'landing' : 'packages',
      packageStyle: selectedPackage.name,
      stayName: selectedStay.name,
      transferName: selectedTransfer.name,
      groupSize,
      nights,
      rounds,
      totals: {
        estimatedPerPerson: pricingSummary.estimatedPerPerson,
        estimatedGroupTotal: pricingSummary.estimatedGroupTotal,
        depositAmount: pricingSummary.depositAmount,
        remainingBalance: pricingSummary.remainingBalance
      },
      courseId,
      courseName,
      hotelName: courseHotelPick.selectedHotel?.name ?? null,
      hotelStars: courseHotelPick.selectedHotel?.stars ?? null,
      hotelDist: courseHotelPick.selectedHotel?.dist ?? null
    })

    const { error } = await supabase.from('package_builds').insert({
      owner_id: session.user.id,
      source: fromLanding ? 'landing' : 'packages',
      label: defaultLabelForBuild(config),
      config
    })

    setIsSavingBuild(false)

    if (error) {
      setSaveBuildError(error.message)
      return
    }

    setSaveBuildOk(true)
  }, [
    courseHotelPick.selectedCourse,
    courseHotelPick.selectedHotel,
    fromLanding,
    loginHrefForSave,
    session?.user,
    groupSize,
    nights,
    rounds,
    selectedPackage.name,
    selectedStay.name,
    selectedTransfer.name,
    pricingSummary.depositAmount,
    pricingSummary.estimatedGroupTotal,
    pricingSummary.estimatedPerPerson,
    pricingSummary.remainingBalance
  ])

  const handleCourseHotelMapChange = useCallback((value: CourseHotelPickerValue) => {
    setCourseHotelPick(value)
  }, [])

  useEffect(() => {
    const stars = courseHotelPick.selectedHotel?.stars
    if (stars === 3 || stars === 4 || stars === 5) {
      setSelectedStayName(stayNameByTier[stars])
    }
  }, [courseHotelPick.selectedHotel])

  useEffect(() => {
    setSaveBuildOk(false)
  }, [
    selectedPackageName,
    selectedStayName,
    selectedTransferName,
    groupSize,
    nights,
    rounds,
    courseHotelPick.selectedCourse,
    courseHotelPick.selectedHotel?.name
  ])

  useEffect(() => {
    if (!pendingAutoSave || autoSaveAttemptedRef.current) {
      return
    }
    if (authLoading || !session?.user || isSavingBuild) {
      return
    }

    autoSaveAttemptedRef.current = true

    const sp = new URLSearchParams(window.location.search)
    sp.delete('save')
    const q = sp.toString()
    window.history.replaceState(null, '', `${window.location.pathname}${q ? `?${q}` : ''}`)

    void handleSavePackageToAccount()
  }, [authLoading, handleSavePackageToAccount, isSavingBuild, pendingAutoSave, session?.user])

  const handleAcceptCookies = () => {
    localStorage.setItem('gsol-cookie-banner-dismissed', 'true')
    setHasAcceptedCookies(true)
  }

  useEffect(() => {
    const dismissed = localStorage.getItem('gsol-cookie-banner-dismissed')
    setHasAcceptedCookies(dismissed === 'true')
  }, [])

  useEffect(() => {
    if (enquiryStatus === 'success') {
      enquiryConfirmationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [enquiryStatus])

  return (
    <div className="ge-page min-h-screen overflow-x-hidden bg-cream">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-brand-700 focus:px-4 focus:py-2 focus:font-ge focus:text-sm focus:font-bold focus:uppercase focus:tracking-[0.14em] focus:text-white"
      >
        Skip to content
      </a>
      <GeNavbar />
      <CookieBanner hidden={hasAcceptedCookies} onAccept={handleAcceptCookies} />

      <main id="main">
        <PremiumPageHero
          images={NAMED_HERO_IMAGE_SETS.packages}
          kicker="Costa del Sol packages"
          titleLine1="Choose your package style,"
          titleLine2="size the group, see the cost live"
          lead="Built for solo golfers, couples, and groups up to 8. Pick the stay level, transfer style, and number of rounds — the estimate updates instantly before you enquire."
          primaryCta={{ label: 'Build your package', href: '#calculator', variant: 'gs-gold' }}
          secondaryCta={{ label: 'Explore package styles', href: '#packages', variant: 'outline-gs-green' }}
          trustBadges={PACKAGE_HERO_TRUST}
          trustSectionTitle="Package builder"
          formScrollTarget="#calculator"
          formScrollLabel="Open the live calculator"
          formScrollSublabel="Estimate updates as you choose"
          formScrollShellTone="solid-light"
          srTitle="Costa del Sol golf packages for Irish travellers"
        />

        <GeSection id="packages" background="white" innerClassName="!pt-14 !pb-16 sm:!pt-16 sm:!pb-20 scroll-mt-28">
          <PackageSectionHeader
            kicker="Package styles"
            title="Choose the kind of Costa del Sol golf trip that fits your group"
            body="Start with the package style that suits the trip best, then fine-tune the stay, group size, and trip shape in the live calculator."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {packageStyles.map((item) => {
              const isSelected = item.name === selectedPackage.name

              return (
                <m.button
                  key={item.name}
                  aria-label={`Choose ${item.name} package style`}
                  className={cx(
                    'group relative overflow-hidden rounded-[1.75rem] border p-7 text-left transition-all duration-300 hover:-translate-y-0.5',
                    isSelected ? packageCardSelected : packageCardDefault
                  )}
                  onClick={() => setSelectedPackageName(item.name)}
                  type="button"
                  {...revealUp}
                >
                  <span
                    aria-hidden="true"
                    className={cx(
                      'pointer-events-none absolute inset-x-4 top-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#d4a843] to-transparent',
                      isSelected ? 'opacity-100' : 'opacity-70'
                    )}
                  />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span
                        className={cx(
                          'inline-flex rounded-full border px-3 py-1.5 font-ge text-[0.68rem] font-extrabold uppercase tracking-[0.14em]',
                          isSelected
                            ? 'border-white/25 bg-forest-900 text-white'
                            : 'border-brand-700/25 bg-white text-gs-green'
                        )}
                      >
                        {item.badge}
                      </span>
                      <h2 className="mt-4 font-ge text-[1.65rem] font-extrabold leading-tight tracking-[-0.02em] sm:text-[1.85rem]">
                        {item.name}
                      </h2>
                    </div>
                    <Sparkles className={cx('h-7 w-7 shrink-0', isSelected ? 'text-[#d4a843]' : 'text-brand-700')} aria-hidden="true" />
                  </div>

                  <p className={cx('mt-5 font-ge text-base leading-relaxed', isSelected ? 'text-white/82' : 'text-gs-dark/72')}>
                    {item.summary}
                  </p>

                  <div
                    className={cx(
                      'mt-6 space-y-3 rounded-[1.35rem] border p-4',
                      isSelected ? 'border-white/12 bg-forest-900' : 'border-forest-800/10 bg-white'
                    )}
                  >
                    {item.included.map((entry) => (
                      <div key={entry} className={cx('flex items-center gap-3 font-ge text-[0.98rem]', isSelected ? 'text-white/88' : 'text-gs-dark/78')}>
                        <CheckCircle2 className={cx('h-4 w-4 shrink-0', isSelected ? 'text-[#d4a843]' : 'text-brand-700')} aria-hidden="true" />
                        <span>{entry}</span>
                      </div>
                    ))}
                  </div>
                </m.button>
              )
            })}
          </div>
        </GeSection>

        <GeSection id="stays" background="soft" innerClassName="!pt-14 !pb-16 sm:!pt-16 sm:!pb-20 scroll-mt-28">
          <PackageSectionHeader
            kicker="Stay options"
            title="Choose the hotel level that feels right for the trip"
            body="Accommodation is priced per person, per night. Choose the stay level that fits the trip and the calculator will update instantly."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {stayOptions.map((item) => {
              const isSelected = item.name === selectedStay.name

              return (
                <m.button
                  key={item.name}
                  aria-label={`Choose ${item.name} stay option`}
                    className={cx(
                      'rounded-[1.75rem] border p-7 text-left transition-all duration-300 hover:-translate-y-0.5',
                      isSelected ? `${packageCardSelected}` : 'border-forest-800/15 bg-white text-gs-dark shadow-[0_10px_28px_rgba(6,32,22,0.08)]'
                    )}
                  onClick={() => setSelectedStayName(item.name)}
                  type="button"
                  {...revealUp}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={cx('font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.18em]', isSelected ? 'text-[#d4a843]' : 'text-gs-green')}>
                        {item.area}
                      </p>
                      <h3 className="mt-3 font-ge text-[1.65rem] font-extrabold leading-tight tracking-[-0.02em]">{item.name}</h3>
                    </div>
                    <BedDouble className={cx('h-8 w-8 shrink-0', isSelected ? 'text-[#d4a843]' : 'text-brand-700')} aria-hidden="true" />
                  </div>

                  <div className="mt-6 rounded-[1.35rem] border border-current/10 bg-current/5 p-4">
                    <p className={cx('font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.16em]', isSelected ? 'text-white/78' : 'text-gs-dark/62')}>
                      Per person / per night
                    </p>
                    <p className="mt-2 font-ge text-[2rem] font-extrabold leading-none">{formatEuro(item.pricePerNight)}</p>
                  </div>

                  <p className={cx('mt-5 font-ge text-base leading-relaxed', isSelected ? 'text-white/80' : 'text-gs-dark/72')}>{item.summary}</p>
                </m.button>
              )
            })}
          </div>
        </GeSection>

        <GeSection
          id="calculator"
          background="white"
          innerClassName="relative !pt-14 !pb-16 sm:!pt-16 sm:!pb-20 scroll-mt-28"
          className="relative isolate overflow-hidden bg-[linear-gradient(180deg,_#FFFFFF_0%,_#FAF8F4_100%)]"
        >
          <div className="absolute top-0" id="plan-trip" />
          <PackageSectionHeader
            kicker="Live calculator"
            title="Build the trip and see the package estimate"
            body="Choose the group size, trip length, number of rounds, and transfer style. The estimate updates from a customer point of view and keeps the pricing easy to understand."
          />

          {fromLanding ? (
            <div
              className="mt-8 rounded-[1.35rem] border border-brand-700/20 bg-white px-5 py-4 font-ge text-base text-gs-dark shadow-[0_10px_28px_rgba(6,32,22,0.08)]"
              role="status"
            >
              <p className="font-extrabold text-gs-dark">Started from the homepage calculator</p>
              <p className="mt-2 text-ge-gray500">
                Adjust anything below, then save the build to your account or open it as a printable proposal for your group.
              </p>
            </div>
          ) : null}

          <div className="mt-10 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <m.div
              className="rounded-[1.75rem] border border-forest-800/10 bg-cream p-6 shadow-[0_10px_28px_rgba(6,32,22,0.06)] md:p-7"
              {...revealUp}
            >
              <div className="rounded-[1.35rem] border border-ge-gray200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-forest-800 to-brand-700 text-white shadow-[0_6px_18px_rgba(11,77,59,0.28)]">
                    <Users className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-ge text-base font-extrabold text-gs-dark">Group size</p>
                    <p className="font-ge text-sm text-ge-gray500">Choose anywhere from 1 golfer up to 8 golfers</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {Array.from({ length: 8 }, (_, index) => index + 1).map((value) => {
                    const isActive = value === groupSize

                    return (
                      <button
                        key={value}
                        className={cx(
                          'rounded-xl border px-3 py-3 font-ge text-base font-bold transition-all',
                          isActive
                            ? 'border-brand-700 bg-gs-green text-white shadow-[0_8px_20px_rgba(6,59,42,0.22)]'
                            : 'border-ge-gray200 bg-cream text-gs-dark hover:border-brand-700/40 hover:bg-white'
                        )}
                        onClick={() => setGroupSize(value)}
                        type="button"
                      >
                        {value}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <SelectorCard label="Nights" options={[3, 4, 5, 6, 7]} value={nights} onSelect={setNights} suffix="nights" />
                <SelectorCard label="Rounds" options={[2, 3, 4, 5]} value={rounds} onSelect={setRounds} suffix="rounds" />
              </div>

              <div className="mt-5 rounded-[1.35rem] border border-ge-gray200 bg-white p-5 shadow-sm">
                <p className="font-ge text-base font-extrabold text-gs-dark">Choose a golf course & hotel</p>
                <p className="mt-1 font-ge text-sm text-ge-gray500">
                  Optional — same map as the homepage. Your picks stay with this estimate and are included when you save or open the proposal.
                </p>
                <div className="mt-4">
                  <Suspense
                    fallback={
                      <div className="flex h-[400px] items-center justify-center rounded-xl border border-ge-gray200 bg-cream font-ge text-sm text-ge-gray500">
                        Loading map…
                      </div>
                    }
                  >
                    <CourseHotelMapPicker
                      initialCourseId={courseHotelPick.selectedCourse}
                      initialHotel={courseHotelPick.selectedHotel}
                      onSelectionChange={handleCourseHotelMapChange}
                    />
                  </Suspense>
                </div>
              </div>

              <div className="mt-5 rounded-[1.35rem] border border-ge-gray200 bg-white p-5 shadow-sm">
                <p className="font-ge text-base font-extrabold text-gs-dark">Transfer style</p>
                <p className="mt-1 font-ge text-sm text-ge-gray500">Choose the level of transport support that suits the trip</p>

                <div className="mt-4 space-y-3">
                  {transferOptions.map((item) => {
                    const isSelected = item.name === selectedTransfer.name

                    return (
                      <button
                        key={item.name}
                        aria-label={`Choose ${item.name}`}
                        className={cx(
                          'flex w-full items-start justify-between gap-4 rounded-[1.2rem] border p-4 text-left transition-all',
                          isSelected
                            ? 'ge-on-dark border-brand-700 bg-gs-green text-white shadow-[0_10px_24px_rgba(6,59,42,0.2)]'
                            : 'border-ge-gray200 bg-cream text-gs-dark hover:border-brand-700/35 hover:bg-white'
                        )}
                        onClick={() => setSelectedTransferName(item.name)}
                        type="button"
                      >
                        <div>
                          <p className="font-ge text-base font-extrabold">{item.name}</p>
                          <p className={cx('mt-1 font-ge text-sm leading-relaxed', isSelected ? 'text-white/85' : 'text-ge-gray500')}>
                            {item.summary}
                          </p>
                        </div>
                        <Bus className={cx('mt-0.5 h-5 w-5 shrink-0', isSelected ? 'text-[#d4a843]' : 'text-brand-700')} aria-hidden="true" />
                      </button>
                    )
                  })}
                </div>
              </div>
            </m.div>

            <m.div
              className="ge-on-dark rounded-[1.75rem] border border-forest-800/20 bg-gs-dark p-6 text-white shadow-[0_24px_60px_rgba(6,32,22,0.28)] md:p-7"
              {...revealUp}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-[#d4a843]">Your live estimate</p>
                  <h3 className="mt-3 font-ge text-[1.85rem] font-extrabold leading-tight tracking-[-0.02em] sm:text-[2.1rem]">
                    Built from a customer point of view
                  </h3>
                </div>
                <div className="rounded-full border border-white/12 bg-forest-900 px-4 py-2.5 font-ge text-sm font-bold text-white/90">
                  {groupSize} golfer{groupSize > 1 ? 's' : ''}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <SummaryTile label="Package style" value={selectedPackage.name} />
                <SummaryTile label="Stay level" value={selectedStay.name} />
                <SummaryTile label="Trip shape" value={`${nights} nights / ${rounds} rounds`} />
                <SummaryTile label="Transfer style" value={selectedTransfer.name} />
                {courseHotelPick.selectedCourse ? (
                  <SummaryTile
                    label="Golf course"
                    value={COURSES.find((c) => c.id === courseHotelPick.selectedCourse)?.name ?? courseHotelPick.selectedCourse}
                  />
                ) : null}
                {courseHotelPick.selectedHotel ? (
                  <SummaryTile
                    label="Hotel pick"
                    value={`${courseHotelPick.selectedHotel.name} · ${'★'.repeat(courseHotelPick.selectedHotel.stars)} · ${courseHotelPick.selectedHotel.dist}`}
                  />
                ) : null}
              </div>

              <div className="mt-6 space-y-3 rounded-[1.35rem] border border-white/10 bg-forest-950 p-5">
                <BreakdownRow label="Accommodation per person" value={formatEuro(pricingSummary.accommodationPerPerson)} />
                <BreakdownRow label="Golf per person" value={formatEuro(pricingSummary.golfPerPerson)} />
                <BreakdownRow label="Transfer share per person" value={formatEuro(pricingSummary.transferPerPerson)} />
                <BreakdownRow label="Planning and package setup" value={formatEuro(pricingSummary.planningPerPerson)} />
                {pricingSummary.singleRoomAdjustment > 0 ? (
                  <BreakdownRow label="Single room adjustment" value={formatEuro(pricingSummary.singleRoomAdjustment)} />
                ) : null}
                <BreakdownRow label="Estimated total per person" strong value={formatEuro(pricingSummary.estimatedPerPerson)} />
              </div>

              <div className="mt-6 rounded-[1.35rem] bg-[linear-gradient(135deg,rgba(212,168,67,0.35),rgba(19,96,71,0.22))] p-[1px]">
                <div className="rounded-[1.3rem] bg-gs-dark/96 p-5">
                  <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-white/75">Estimated group total</p>
                  <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="font-ge text-[2.75rem] font-extrabold leading-none text-white sm:text-[3rem]">
                        {formatEuro(pricingSummary.estimatedGroupTotal)}
                      </p>
                      <p className="mt-2 font-ge text-base text-white/72">for the full group</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-forest-950 px-4 py-3 font-ge text-sm font-semibold text-white/88">
                      Flights not included
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <MiniSummaryCard label="Deposit upfront" value={formatEuro(pricingSummary.depositAmount)} />
                <MiniSummaryCard label="Remaining balance" value={formatEuro(pricingSummary.remainingBalance)} />
              </div>

              <p className="mt-5 font-ge text-base leading-8 text-white/85">
                Indicative pricing only. Final package price depends on live hotel rates, golf availability, and the transfer route across your dates.
              </p>
              {courseHotelPick.selectedCourse || courseHotelPick.selectedHotel ? (
                <p className="mt-4 rounded-xl border border-white/10 bg-forest-950 px-4 py-3 font-ge text-sm leading-7 text-white/88">
                  <span className="font-semibold text-[#d4a843]">Course & hotel:</span> Shown on the proposal PDF / print view and saved with your package when you sign in and use{' '}
                  <span className="font-medium text-white">Save to my account</span>.
                </p>
              ) : null}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <GeButton className="package-dark-panel-cta" href={proposalTemplateHref} size="md" variant="gs-gold">
                  View proposal (print / PDF)
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </GeButton>
                {integrationRegistry.supabase.enabled ? (
                  session ? (
                    <GeButton
                      disabled={authLoading || isSavingBuild}
                      onClick={handleSavePackageToAccount}
                      size="md"
                      type="button"
                      variant="outline-gs-white"
                    >
                      {isSavingBuild ? 'Saving…' : 'Save to my account'}
                    </GeButton>
                  ) : (
                    <GeButton href={loginHrefForSave} size="md" variant="outline-gs-white">
                      Sign in to save this package
                    </GeButton>
                  )
                ) : null}
                {integrationRegistry.supabase.enabled && session ? (
                  <GeButton href="/dashboard" size="md" variant="outline-gs-white">
                    My saved packages
                  </GeButton>
                ) : null}
              </div>
              {saveBuildError ? (
                <p className="mt-3 font-ge text-base font-semibold text-red-300" role="alert">
                  {saveBuildError}
                </p>
              ) : null}
              {saveBuildOk ? (
                <p className="mt-3 font-ge text-base font-semibold text-[#d4a843]" role="status">
                  Saved. You can review it anytime under your dashboard.
                </p>
              ) : null}
            </m.div>
          </div>
        </GeSection>

        <GeSection background="soft" innerClassName="!py-12 sm:!py-14 scroll-mt-28">
          <TripServiceBookingCta
            pageLabel="Packages calculator"
            variant="inline"
            sectionLead="Need transfers, tee times, or a hotel as well? Book any combination — saved to your profile when you sign in."
          />
        </GeSection>

        <GeSection
          id="enquire"
          background="white"
          innerClassName="relative !pt-20 !pb-20 sm:!pt-24 sm:!pb-24 scroll-mt-28"
          className="relative isolate overflow-hidden bg-[linear-gradient(180deg,_#FAF8F4_0%,_#FFFFFF_62%)]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 -translate-y-1/2 rounded-full bg-gs-green/[0.07] blur-[100px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-brand-700/[0.1] blur-[90px]"
          />

          <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-14">
            <m.div variants={sectionHeaderContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
              <m.span
                variants={sectionHeaderItem}
                className="inline-flex items-center gap-2 rounded-full border border-brand-700/35 bg-white px-4 py-1.5 font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.24em] text-gs-green shadow-[0_8px_22px_rgba(6,59,42,0.08)] sm:text-[0.74rem]"
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden />
                Make the enquiry
              </m.span>
              <m.span
                aria-hidden="true"
                variants={sectionHeaderItem}
                className="mt-5 mx-auto h-px w-[min(100%,14rem)] bg-gradient-to-r from-transparent via-[#d9be7a]/60 to-transparent"
              />
              <m.h2
                variants={sectionHeaderItem}
                className="mt-5 max-w-[20ch] font-ge text-[2.15rem] font-extrabold leading-[1.04] tracking-[-0.005em] text-gs-dark sm:max-w-3xl sm:text-[2.85rem] lg:text-[3.05rem]"
              >
                <span className="text-gs-dark">Found a package shape you like?</span>{' '}
                <span className="text-gs-green">Send the enquiry and we will tailor it properly.</span>
              </m.h2>
              <m.p variants={sectionHeaderItem} className="mt-5 max-w-xl font-ge text-[1.06rem] leading-[1.7] text-gs-dark/85 sm:text-[1.12rem] sm:leading-8">
                The live figure gives your group a clear starting point. From there we can refine hotels, golf days, transfer style, and the exact routing around your dates.
              </m.p>

              <m.div variants={sectionHeaderItem} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <GeButton href={packageEnquiryWhatsAppHref} rel="noreferrer" size="lg" target="_blank" variant="gs-green">
                  WhatsApp enquiry
                </GeButton>
                <GeButton href={proposalTemplateHref} size="lg" variant="gs-gold">
                  View proposal (print / PDF)
                </GeButton>
                <GeButton href={packageEnquiryMailtoHref} size="lg" variant="outline-gs-green">
                  Email fallback
                </GeButton>
              </m.div>
            </m.div>

            <m.div {...revealUp} className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-2 rounded-[2.15rem] bg-gradient-to-br from-brand-700/10 via-transparent to-[#d9be7a]/10"
              />
              <div className="relative rounded-[1.75rem] border border-ge-gray200 bg-white p-6 shadow-[0_26px_70px_rgba(40,33,19,0.12)] sm:p-7">
                {enquiryStatus === 'success' ? (
                  <div ref={enquiryConfirmationRef} className="rounded-[1.35rem] border border-brand-700/25 bg-brand-700/8 p-5 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-brand-700" aria-hidden="true" />
                    <p className="mt-4 font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-gs-green">Package enquiry sent</p>
                    <p className="mt-3 font-ge text-base leading-7 text-gs-dark/78">
                      Check your inbox for the branded GolfSol confirmation and PDF. We will reply with the next step.
                    </p>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={handlePackageEnquirySubmit} noValidate>
                    <div>
                      <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-gs-green">Send package request</p>
                      <p className="mt-2 font-ge text-base leading-7 text-ge-gray500">
                        This sends your selected package shape through the same branded email and PDF workflow as the main enquiry forms.
                      </p>
                    </div>

                    <label className="block">
                      <span className={packageFieldLabel}>Full name</span>
                      <input
                        autoComplete="name"
                        className={packageFieldInput}
                        onChange={(event) => setEnquiryName(event.target.value)}
                        placeholder="Your name"
                        required
                        value={enquiryName}
                      />
                    </label>
                    <label className="block">
                      <span className={packageFieldLabel}>Email</span>
                      <input
                        autoComplete="email"
                        className={packageFieldInput}
                        onChange={(event) => setEnquiryEmail(event.target.value)}
                        placeholder="you@example.com"
                        required
                        type="email"
                        value={enquiryEmail}
                      />
                    </label>
                    <label className="block">
                      <span className={packageFieldLabel}>Phone / WhatsApp</span>
                      <input
                        autoComplete="tel"
                        className={packageFieldInput}
                        onChange={(event) => setEnquiryPhone(event.target.value)}
                        placeholder="+353 87 000 0000"
                        required
                        type="tel"
                        value={enquiryPhone}
                      />
                    </label>
                    <label className="block">
                      <span className={packageFieldLabel}>Best time to call</span>
                      <input
                        className={packageFieldInput}
                        onChange={(event) => setEnquiryBestTime(event.target.value)}
                        placeholder="Any time"
                        value={enquiryBestTime}
                      />
                    </label>

                    {enquiryStatus === 'error' && enquiryError ? (
                      <div className="rounded-xl border border-brand-700/25 bg-brand-700/8 px-3 py-2.5 font-ge text-sm leading-6 text-gs-dark" role="alert">
                        <p>{enquiryError}</p>
                        {enquiryErrorCode === ENQUIRY_CONFLICT_EXISTING_PHONE ? (
                          <p className="mt-2 font-semibold text-gs-green">
                            <a className="underline underline-offset-2" href="/dashboard/login">
                              Sign in to your trip desk
                            </a>
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    <GeTermsAcceptanceField checked={termsAccepted} onChange={setTermsAccepted} id="terms-package-builder" tone="light" />

                    <GeButton className="w-full" disabled={enquiryStatus === 'submitting' || !termsAccepted} size="lg" type="submit" variant="gs-green">
                      {enquiryStatus === 'submitting' ? 'Sending package...' : 'Send branded enquiry'}
                    </GeButton>
                  </form>
                )}
              </div>
            </m.div>
          </div>
        </GeSection>
      </main>

      <GeFooter />
      <WhatsappFab />
    </div>
  )
}

function PackageSectionHeader({
  kicker,
  title,
  body
}: {
  readonly kicker: string
  readonly title: string
  readonly body: string
}) {
  return (
    <m.div variants={sectionHeaderContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
      <m.span
        variants={sectionHeaderItem}
        className="inline-flex items-center gap-2 rounded-full border border-brand-700/35 bg-white px-4 py-1.5 font-ge text-[0.7rem] font-extrabold uppercase tracking-[0.24em] text-gs-green shadow-[0_8px_22px_rgba(6,59,42,0.08)] sm:text-[0.74rem]"
      >
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden />
        {kicker}
      </m.span>
      <m.span
        aria-hidden="true"
        variants={sectionHeaderItem}
        className="mt-5 mx-auto h-px w-[min(100%,14rem)] bg-gradient-to-r from-transparent via-[#d9be7a]/60 to-transparent"
      />
      <m.h2
        variants={sectionHeaderItem}
        className="mt-5 max-w-3xl font-ge text-[2rem] font-extrabold leading-[1.06] tracking-[-0.02em] text-gs-dark sm:text-[2.45rem] lg:text-[2.75rem]"
      >
        {title}
      </m.h2>
      <m.p variants={sectionHeaderItem} className="mt-4 max-w-3xl font-ge text-[1.04rem] leading-[1.72] text-gs-dark/82 sm:text-[1.08rem] sm:leading-8">
        {body}
      </m.p>
    </m.div>
  )
}

function SelectorCard({
  label,
  options,
  value,
  onSelect,
  suffix
}: {
  readonly label: string
  readonly options: readonly number[]
  readonly value: number
  readonly onSelect: (value: number) => void
  readonly suffix: string
}) {
  return (
    <div className="rounded-[1.35rem] border border-ge-gray200 bg-white p-5 shadow-sm">
      <p className="font-ge text-base font-extrabold text-gs-dark">{label}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = option === value

          return (
            <button
              key={option}
              className={cx(
                'rounded-full border px-4 py-2.5 font-ge text-base font-bold transition-all',
                isActive
                  ? 'border-brand-700 bg-gs-green text-white shadow-[0_8px_20px_rgba(6,59,42,0.22)]'
                  : 'border-ge-gray200 bg-cream text-gs-dark hover:border-brand-700/40 hover:bg-white'
              )}
              onClick={() => onSelect(option)}
              type="button"
            >
              {option} {suffix}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SummaryTile({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-forest-950 p-4">
      <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-white/76">{label}</p>
      <p className="mt-2 font-ge text-[1.05rem] font-bold text-white">{value}</p>
    </div>
  )
}

function BreakdownRow({
  label,
  value,
  strong = false
}: {
  readonly label: string
  readonly value: string
  readonly strong?: boolean
}) {
  return (
    <div className={cx('flex items-center justify-between gap-4 border-b border-white/8 pb-3 font-ge text-base', strong && 'pt-2')}>
      <span className={cx(strong ? 'font-extrabold text-white' : 'text-white/85')}>{label}</span>
      <span className={cx('text-right', strong ? 'font-extrabold text-[#d4a843]' : 'text-white')}>{value}</span>
    </div>
  )
}

function MiniSummaryCard({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-forest-950 p-4">
      <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-white/74">{label}</p>
      <p className="mt-2 font-ge text-[1.05rem] font-bold text-white">{value}</p>
    </div>
  )
}

export { CustomerPackagePage }
