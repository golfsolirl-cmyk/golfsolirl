import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BedDouble,
  Bus,
  CalendarRange,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react'
import { Navbar } from '../components/home/navbar'
import { LuxuryButton } from '../components/ui/button'
import { SiteFooter } from '../components/site-footer'
import { AmbientGolfBall } from '../components/ui/ambient-golf-ball'
import { Logo, ShamrockIcon } from '../components/ui/logo'
import { AnimatedStepKicker, SectionHeader } from '../components/ui/section-header'
import { WaveDivider } from '../components/ui/wave-divider'
import { integrationRegistry } from '../config/integrations'
import { footerSocialLinks, heroBackgroundImage } from '../data/site-content'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import { buildPackageConfig, defaultLabelForBuild } from '../lib/package-build'
import { cx } from '../lib/utils'
import { useAuth } from '../providers/auth-provider'
import { CookieBanner, FloatingWhatsAppButton, formatEuro } from './packages'

const packagePageLinks = ['Packages', 'Stays', 'Calculator', 'Enquire'] as const

const packageStyles = [
  {
    name: 'Social Escape',
    badge: 'Easy-going premium',
    summary: 'A polished Costa del Sol golf trip with strong value, smart transfers, and everything lined up cleanly.',
    roundPrice: 118,
    planningFee: 105,
    included: ['Golf planning', 'Airport transfer setup', 'Stay matching', 'Ideal for shorter trips']
  },
  {
    name: 'Premium Fairway',
    badge: 'Most popular',
    summary: 'The sweet spot for Irish groups who want better hotels, cleaner routing, and a more premium overall trip feel.',
    roundPrice: 145,
    planningFee: 145,
    included: ['Premium accommodation fit', 'Smoother transfer plan', 'Stronger course shortlist', 'Best all-round choice']
  },
  {
    name: 'Signature Costa',
    badge: 'Luxury build',
    summary: 'A stronger high-end package for groups that want marquee golf, luxury stays, and a more elevated travel setup.',
    roundPrice: 182,
    planningFee: 210,
    included: ['Luxury routing', 'Marquee course mix', 'Higher-touch package setup', 'Best for standout trips']
  }
] as const

const stayOptions = [
  {
    name: 'Coastal 3-star',
    area: 'La Cala',
    pricePerNight: 92,
    singleSupplementPerNight: 26,
    summary: 'Smart, social, and ideal for golfers who want the package to feel clean without overreaching on hotel spend.'
  },
  {
    name: 'Premium 4-star',
    area: 'Marbella',
    pricePerNight: 148,
    singleSupplementPerNight: 34,
    summary: 'The strongest all-round hotel option for most groups: better rooms, better feel, and a more premium stay rhythm.'
  },
  {
    name: 'Luxury 5-star',
    area: 'Estepona',
    pricePerNight: 248,
    singleSupplementPerNight: 56,
    summary: 'A more refined, elevated stay level for golfers who want the hotel to feel as premium as the courses.'
  }
] as const

const transferOptions = [
  {
    name: 'Shared arrival and golf transfers',
    tripCost: 120,
    summary: 'The lightest transport setup for smaller groups who still want airport and golf-day movements covered.'
  },
  {
    name: 'Private return transfers',
    tripCost: 260,
    summary: 'A cleaner, more private transport option that suits most premium golf groups very well.'
  },
  {
    name: 'Dedicated driver support',
    tripCost: 520,
    summary: 'The smoothest premium option, with driver support across the trip rather than just the airport runs.'
  }
] as const

const transferNameByParam = {
  shared: 'Shared arrival and golf transfers',
  private: 'Private return transfers',
  driver: 'Dedicated driver support'
} as const

const routeStops = [
  'Choose your group size',
  'Pick the stay level',
  'Add rounds and transfers',
  'See the live package total'
] as const

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

  if (raw && packageStyles.some((item) => item.name === raw)) {
    return raw
  }

  return packageStyles[1].name
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

  return stayOptions[1].name
}

const getInitialSelectedTransferName = () => {
  const searchParams = new URLSearchParams(window.location.search)
  const transferParam = searchParams.get('transfer')

  if (transferParam === 'shared' || transferParam === 'private' || transferParam === 'driver') {
    return transferNameByParam[transferParam]
  }

  return transferOptions[1].name
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
  const { session, isLoading: authLoading } = useAuth()
  const [selectedPackageName, setSelectedPackageName] = useState<string>(getInitialSelectedPackageName)
  const [selectedStayName, setSelectedStayName] = useState<string>(getInitialSelectedStayName)
  const [selectedTransferName, setSelectedTransferName] = useState<string>(getInitialSelectedTransferName)
  const [groupSize, setGroupSize] = useState(() => getInitialNumberParam({ paramName: 'groupSize', min: 1, max: 8, fallback: 4 }))
  const [nights, setNights] = useState(() => getInitialNumberParam({ paramName: 'nights', min: 3, max: 7, fallback: 4 }))
  const [rounds, setRounds] = useState(() => getInitialNumberParam({ paramName: 'rounds', min: 2, max: 5, fallback: 3 }))
  const [hasAcceptedCookies, setHasAcceptedCookies] = useState(true)
  const [isFooterInView, setIsFooterInView] = useState(false)
  const [isSavingBuild, setIsSavingBuild] = useState(false)
  const [saveBuildError, setSaveBuildError] = useState<string | null>(null)
  const [saveBuildOk, setSaveBuildOk] = useState(false)
  const footerRef = useRef<HTMLElement | null>(null)
  const whatsAppHref = footerSocialLinks.find((link) => link.label === 'WhatsApp')?.href ?? 'https://www.whatsapp.com/'

  const selectedPackage = packageStyles.find((item) => item.name === selectedPackageName) ?? packageStyles[1]
  const selectedStay = stayOptions.find((item) => item.name === selectedStayName) ?? stayOptions[1]
  const selectedTransfer = transferOptions.find((item) => item.name === selectedTransferName) ?? transferOptions[1]

  const fromLanding = useMemo(
    () => new URLSearchParams(window.location.search).get('from') === 'landing',
    []
  )

  const loginHrefForSave = useMemo(
    () => `/login?next=${encodeURIComponent(`${window.location.pathname}${window.location.search}`)}`,
    []
  )

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

    return `/proposal-template?${searchParams.toString()}`
  }, [
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
      }
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

  useEffect(() => {
    setSaveBuildOk(false)
  }, [selectedPackageName, selectedStayName, selectedTransferName, groupSize, nights, rounds])

  const handleAcceptCookies = () => {
    localStorage.setItem('gsol-cookie-banner-dismissed', 'true')
    setHasAcceptedCookies(true)
  }

  useEffect(() => {
    const dismissed = localStorage.getItem('gsol-cookie-banner-dismissed')
    setHasAcceptedCookies(dismissed === 'true')
  }, [])

  useEffect(() => {
    if (!footerRef.current) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterInView(entry.isIntersecting)
      },
      {
        threshold: 0.2
      }
    )

    observer.observe(footerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div className="overflow-x-hidden bg-offwhite">
      <Navbar links={packagePageLinks} primaryCta="Make enquiry" />
      <FloatingWhatsAppButton hidden={isFooterInView} href={whatsAppHref} />
      <CookieBanner hidden={hasAcceptedCookies} onAccept={handleAcceptCookies} />

      <main>
        <section className="relative min-h-screen overflow-hidden bg-forest-900 px-6 pb-28 pt-36 md:pt-40" id="home">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center opacity-45"
            style={{ backgroundImage: `url(${heroBackgroundImage})` }}
          />
          <div aria-hidden="true" className="absolute inset-0 bg-hero-overlay" />
          <div aria-hidden="true" className="absolute inset-0 bg-hero-bottom" />
          <div aria-hidden="true" className="absolute left-[-120px] top-[8%] h-72 w-72 rounded-full bg-fairway-500/18 blur-3xl md:h-96 md:w-96" />
          <div aria-hidden="true" className="absolute right-[-90px] top-[-30px] h-72 w-72 rounded-full bg-gold-400/18 blur-3xl md:h-80 md:w-80" />
          <AmbientGolfBall className="right-[4%] top-[16%] opacity-90 lg:right-[7%]" size="lg" tone="hero" variant="hero" />

          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <p className="mb-4 font-accent text-lg italic tracking-wide text-gold-200 drop-shadow-[0_4px_18px_rgba(8,27,8,0.35)]">
                Costa del Sol golf packages for Irish travellers
              </p>
              <h1 className="max-w-3xl font-display text-5xl font-black leading-none tracking-tight text-white md:text-7xl lg:text-[5.2rem]">
                Choose the package style, size the group, and see the trip cost live
              </h1>
              <p className="mt-5 max-w-xl font-accent text-xl italic text-white/75">
                Built for solo golfers, couples, and groups all the way up to 8 players.
              </p>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-white md:text-base">
                Pick the stay level, transfer style, number of rounds, and group size. The page updates instantly so customers can understand the package price before they enquire.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <LuxuryButton href="#calculator" showArrow>
                  Build your package
                </LuxuryButton>
                <LuxuryButton href="#packages" variant="outline">
                  Explore package styles
                </LuxuryButton>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <HeroStat label="Works from solo travel to full 8-person groups" value="1-8" />
                <HeroStat label="Deposit shown clearly in the live estimate" value="20%" />
                <HeroStat label="Flights are not included in package pricing" value="FYI" />
              </div>
            </motion.div>

            <CustomerRouteMapShowcase />
          </div>
        </section>

        <section className="section-shell bg-white pb-24" id="packages">
          <div className="section-inner">
            <SectionHeader
              body="Start with the package style that suits the trip best, then fine-tune the stay, group size, and trip shape in the live calculator."
              kicker="Package styles"
              title="Choose the kind of Costa del Sol golf trip that fits your group"
            />

            <div className="grid gap-6 lg:grid-cols-3">
              {packageStyles.map((item) => {
                const isSelected = item.name === selectedPackage.name

                return (
                  <motion.button
                    key={item.name}
                    aria-label={`Choose ${item.name} package style`}
                    className={cx(
                      'group relative overflow-hidden rounded-[2rem] border p-7 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
                      isSelected
                        ? 'border-gold-300 bg-forest-900 text-white'
                        : 'border-forest-100 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(247,244,237,0.94))] text-forest-900'
                    )}
                    onClick={() => setSelectedPackageName(item.name)}
                    type="button"
                    {...revealUp}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span
                          className={cx(
                            'inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]',
                            isSelected
                              ? 'border-gold-300/30 bg-gold-400/15 text-gold-300'
                              : 'border-fairway-100 bg-fairway-50 text-fairway-700'
                          )}
                        >
                          {item.badge}
                        </span>
                        <h2 className="mt-4 font-display text-3xl font-bold tracking-tight">{item.name}</h2>
                      </div>
                      <Sparkles className={cx('h-7 w-7', isSelected ? 'text-gold-300' : 'text-gold-500')} aria-hidden="true" />
                    </div>

                    <p className={cx('mt-5 text-sm leading-relaxed', isSelected ? 'text-white/72' : 'text-forest-900/66')}>{item.summary}</p>

                    <div className={cx('mt-6 space-y-3 rounded-[1.5rem] border p-4', isSelected ? 'border-white/10 bg-white/6' : 'border-forest-100 bg-white/72')}>
                      {item.included.map((entry) => (
                        <div key={entry} className={cx('flex items-center gap-3 text-sm', isSelected ? 'text-white/82' : 'text-forest-900/72')}>
                          <CheckCircle2 className={cx('h-4 w-4 shrink-0', isSelected ? 'text-gold-300' : 'text-fairway-600')} aria-hidden="true" />
                          <span>{entry}</span>
                        </div>
                      ))}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </section>

        <section className="section-shell bg-[#f7f4ed] py-24" id="stays">
          <div className="section-inner">
            <SectionHeader
              body="Accommodation is priced per person, per night. Choose the stay level that fits the trip and the calculator will update instantly."
              kicker="Stay options"
              title="Choose the hotel level that feels right for the trip"
            />

            <div className="grid gap-6 lg:grid-cols-3">
              {stayOptions.map((item) => {
                const isSelected = item.name === selectedStay.name

                return (
                  <motion.button
                    key={item.name}
                    aria-label={`Choose ${item.name} stay option`}
                    className={cx(
                      'rounded-[2rem] border p-7 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
                      isSelected ? 'border-gold-300 bg-forest-900 text-white' : 'border-forest-100 bg-white text-forest-900'
                    )}
                    onClick={() => setSelectedStayName(item.name)}
                    type="button"
                    {...revealUp}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className={cx('text-[11px] font-semibold uppercase tracking-[0.16em]', isSelected ? 'text-gold-300' : 'text-fairway-700')}>
                          {item.area}
                        </p>
                        <h3 className="mt-3 font-display text-3xl font-bold tracking-tight">{item.name}</h3>
                      </div>
                      <BedDouble className={cx('h-8 w-8', isSelected ? 'text-gold-300' : 'text-gold-500')} aria-hidden="true" />
                    </div>

                    <div className="mt-6 rounded-[1.5rem] border border-current/10 bg-current/5 p-4">
                      <p className={cx('text-[11px] font-semibold uppercase tracking-[0.16em]', isSelected ? 'text-white/55' : 'text-forest-900/42')}>
                        Per person / per night
                      </p>
                      <p className="mt-2 font-display text-4xl font-bold">{formatEuro(item.pricePerNight)}</p>
                    </div>

                    <p className={cx('mt-5 text-sm leading-relaxed', isSelected ? 'text-white/72' : 'text-forest-900/65')}>{item.summary}</p>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </section>

        <section className="section-shell bg-white py-24" id="calculator">
          <div className="absolute top-0" id="plan-trip" />
          <div className="section-inner">
            <SectionHeader
              body="Choose the group size, trip length, number of rounds, and transfer style. The estimate updates from a customer point of view and keeps the pricing easy to understand."
              kicker="Live calculator"
              title="Build the trip and see the package estimate"
            />

            {fromLanding ? (
              <div
                className="mb-8 rounded-[1.75rem] border border-fairway-200 bg-fairway-50/90 px-5 py-4 text-sm text-forest-800 shadow-sm"
                role="status"
              >
                <p className="font-semibold text-forest-950">Started from the homepage calculator</p>
                <p className="mt-2 text-forest-700">
                  Adjust anything below, then save the build to your account or open it as a printable proposal for your group.
                </p>
              </div>
            ) : null}

            <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
              <motion.div className="rounded-[2rem] border border-forest-100 bg-[#f7f4ed] p-6 shadow-sm md:p-7" {...revealUp}>
                <div className="rounded-[1.6rem] border border-white/80 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-fairway-50 text-fairway-700">
                      <Users className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-forest-900">Group size</p>
                      <p className="text-xs text-forest-900/52">Choose anywhere from 1 golfer up to 8 golfers</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
                    {Array.from({ length: 8 }, (_, index) => index + 1).map((value) => {
                      const isActive = value === groupSize

                      return (
                        <button
                          key={value}
                          className={cx(
                            'rounded-2xl border px-3 py-3 text-sm font-semibold transition-all',
                            isActive
                              ? 'border-gold-400 bg-forest-900 text-white'
                              : 'border-forest-100 bg-offwhite text-forest-900 hover:border-gold-300 hover:bg-white'
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
                  <SelectorCard
                    label="Nights"
                    options={[3, 4, 5, 6, 7]}
                    value={nights}
                    onSelect={setNights}
                    suffix="nights"
                  />
                  <SelectorCard
                    label="Rounds"
                    options={[2, 3, 4, 5]}
                    value={rounds}
                    onSelect={setRounds}
                    suffix="rounds"
                  />
                </div>

                <div className="mt-5 rounded-[1.6rem] border border-white/80 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-forest-900">Transfer style</p>
                  <p className="mt-1 text-xs text-forest-900/52">Choose the level of transport support that suits the trip</p>

                  <div className="mt-4 space-y-3">
                    {transferOptions.map((item) => {
                      const isSelected = item.name === selectedTransfer.name

                      return (
                        <button
                          key={item.name}
                          aria-label={`Choose ${item.name}`}
                          className={cx(
                            'flex w-full items-start justify-between gap-4 rounded-[1.4rem] border p-4 text-left transition-all',
                            isSelected
                              ? 'border-gold-300 bg-forest-900 text-white'
                              : 'border-forest-100 bg-offwhite text-forest-900 hover:bg-white'
                          )}
                          onClick={() => setSelectedTransferName(item.name)}
                          type="button"
                        >
                          <div>
                            <p className="text-sm font-semibold">{item.name}</p>
                            <p className={cx('mt-1 text-xs leading-relaxed', isSelected ? 'text-white/65' : 'text-forest-900/52')}>{item.summary}</p>
                          </div>
                          <Bus className={cx('mt-0.5 h-5 w-5 shrink-0', isSelected ? 'text-gold-300' : 'text-gold-500')} aria-hidden="true" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </motion.div>

              <motion.div className="rounded-[2rem] border border-white/10 bg-forest-950 p-6 text-white shadow-soft md:p-7" {...revealUp}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-300">Your live estimate</p>
                    <h3 className="mt-3 font-display text-4xl font-bold tracking-tight">Built from a customer point of view</h3>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72">
                    {groupSize} golfer{groupSize > 1 ? 's' : ''}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <SummaryTile label="Package style" value={selectedPackage.name} />
                  <SummaryTile label="Stay level" value={selectedStay.name} />
                  <SummaryTile label="Trip shape" value={`${nights} nights / ${rounds} rounds`} />
                  <SummaryTile label="Transfer style" value={selectedTransfer.name} />
                </div>

                <div className="mt-6 space-y-3 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <BreakdownRow label="Accommodation per person" value={formatEuro(pricingSummary.accommodationPerPerson)} />
                  <BreakdownRow label="Golf per person" value={formatEuro(pricingSummary.golfPerPerson)} />
                  <BreakdownRow label="Transfer share per person" value={formatEuro(pricingSummary.transferPerPerson)} />
                  <BreakdownRow label="Planning and package setup" value={formatEuro(pricingSummary.planningPerPerson)} />
                  {pricingSummary.singleRoomAdjustment > 0 ? (
                    <BreakdownRow label="Single room adjustment" value={formatEuro(pricingSummary.singleRoomAdjustment)} />
                  ) : null}
                  <BreakdownRow label="Estimated total per person" strong value={formatEuro(pricingSummary.estimatedPerPerson)} />
                </div>

                <div className="mt-6 rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(220,88,1,0.18),rgba(253,186,116,0.1),rgba(80,163,45,0.12))] p-[1px]">
                  <div className="rounded-[1.7rem] bg-forest-950/96 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">Estimated group total</p>
                    <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <p className="font-display text-5xl font-black leading-none text-white">{formatEuro(pricingSummary.estimatedGroupTotal)}</p>
                        <p className="mt-2 text-sm text-white/68">for the full group</p>
                      </div>
                      <div className="rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/74">
                        Flights not included
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <MiniSummaryCard label="Deposit upfront" value={formatEuro(pricingSummary.depositAmount)} />
                  <MiniSummaryCard label="Remaining balance" value={formatEuro(pricingSummary.remainingBalance)} />
                </div>

                <p className="mt-5 text-sm leading-relaxed text-white/62">
                  Indicative pricing only. Final package price depends on live hotel rates, golf availability, and the transfer route across your dates.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <LuxuryButton href={proposalTemplateHref} showArrow variant="white">
                    View as proposal (print / PDF)
                  </LuxuryButton>
                  {integrationRegistry.supabase.enabled ? (
                    <LuxuryButton
                      className="border-white/25 bg-white/10 text-white hover:bg-white/15"
                      disabled={authLoading || isSavingBuild}
                      onClick={handleSavePackageToAccount}
                      type="button"
                      variant="outline"
                    >
                      {isSavingBuild ? 'Saving…' : session ? 'Save to my account' : 'Sign in to save this package'}
                    </LuxuryButton>
                  ) : null}
                  {integrationRegistry.supabase.enabled && session ? (
                    <LuxuryButton className="border-white/20 text-white/90" href="/dashboard" variant="outline">
                      My saved packages
                    </LuxuryButton>
                  ) : null}
                </div>
                {saveBuildError ? (
                  <p className="mt-3 text-sm font-medium text-red-300" role="alert">
                    {saveBuildError}
                  </p>
                ) : null}
                {saveBuildOk ? (
                  <p className="mt-3 text-sm font-medium text-fairway-300" role="status">
                    Saved. You can review it anytime under your dashboard.
                  </p>
                ) : null}
              </motion.div>
            </div>
          </div>
        </section>

        <section className="section-shell bg-forest-900 py-24" id="enquire">
          <div aria-hidden="true" className="absolute left-[-80px] top-[10%] h-72 w-72 rounded-full bg-fairway-500/12 blur-3xl" />
          <div aria-hidden="true" className="absolute bottom-[-60px] right-[-30px] h-72 w-72 rounded-full bg-gold-400/12 blur-3xl" />

          <div className="section-inner">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.92fr] lg:items-center">
              <div>
                <AnimatedStepKicker className="mb-3" dark kicker="Make the enquiry" />
                <h2 className="max-w-2xl font-display text-4xl font-bold leading-tight text-white md:text-5xl">
                  Found a package shape you like? Send the enquiry and we can tailor it properly
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/68 md:text-base">
                  The live figure gives your group a clear starting point. From there we can refine hotels, golf days, transfer style, and the exact routing around your dates.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <LuxuryButton href={whatsAppHref} rel="noreferrer" target="_blank">
                    WhatsApp enquiry
                  </LuxuryButton>
                  <LuxuryButton href={proposalTemplateHref} variant="white">
                    View proposal (print / PDF)
                  </LuxuryButton>
                  <LuxuryButton href="mailto:hello@golfsolireland.com" variant="outline">
                    Email package request
                  </LuxuryButton>
                </div>
              </div>

              <motion.div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 text-white backdrop-blur-sm" {...revealUp}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-300">What customers can do here</p>
                <div className="mt-5 space-y-4">
                  {[
                    'Price the trip from 1 to 8 golfers',
                    'Compare package style, stay level, and transfers',
                    'See a deposit estimate before enquiring',
                    'Understand the package before speaking to you'
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm text-white/78">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-fairway-400" aria-hidden="true" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          <WaveDivider fill="#0a2008" />
        </section>
      </main>

      <SiteFooter
        copyrightNote="Public-facing package selector for Irish golfers travelling to the Costa del Sol."
        footerRef={footerRef}
        intro="Golf Sol Ireland creates premium Costa del Sol golf packages for Irish golfers who want a cleaner route from first enquiry to final round."
      />
    </div>
  )
}

function CustomerRouteMapShowcase() {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="relative"
      initial={{ opacity: 0, y: 36 }}
      transition={{ delay: 0.18, duration: 0.85, ease: 'easeOut' }}
    >
      <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))] p-5 shadow-soft backdrop-blur-md md:p-7">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(80,163,45,0.22),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(220,88,1,0.22),transparent_22%),radial-gradient(circle_at_70%_70%,rgba(253,186,116,0.16),transparent_26%)]" />
        <div className="relative z-10 grid gap-6 md:grid-cols-[0.9fr_1.2fr]">
          <div className="space-y-3">
            {routeStops.map((item, index) => (
              <motion.div
                key={item}
                animate={{ x: [0, 6, 0] }}
                className="rounded-[1.6rem] border border-white/10 bg-forest-950/58 p-4 text-white shadow-lg backdrop-blur-sm"
                transition={{ delay: index * 0.24, duration: 4.4, ease: 'easeInOut', repeat: Infinity }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-fairway-500/14 text-fairway-300">
                    <ShamrockIcon className="h-6 w-6" dark />
                  </div>
                  <p className="text-sm font-semibold">{item}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="relative min-h-[24rem] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:44px_44px] opacity-25" />

            <svg aria-hidden="true" className="absolute inset-0 h-full w-full" fill="none" viewBox="0 0 560 420">
              <defs>
                <linearGradient id="customer-package-route-line" x1="60" x2="500" y1="120" y2="280">
                  <stop offset="0%" stopColor="rgba(80,163,45,0.95)" />
                  <stop offset="52%" stopColor="rgba(253,186,116,0.95)" />
                  <stop offset="100%" stopColor="rgba(220,88,1,0.95)" />
                </linearGradient>
              </defs>
              <path
                d="M68 92C150 44 236 58 298 130C346 186 398 206 494 176"
                opacity="0.34"
                stroke="rgba(255,255,255,0.34)"
                strokeDasharray="8 12"
                strokeLinecap="round"
                strokeWidth="2"
              />
              <motion.path
                animate={{ pathLength: [0.2, 1, 0.2] }}
                d="M68 92C150 44 236 58 298 130C346 186 398 206 494 176"
                pathLength={1}
                stroke="url(#customer-package-route-line)"
                strokeLinecap="round"
                strokeWidth="5"
                transition={{ duration: 5.8, ease: 'easeInOut', repeat: Infinity }}
              />
            </svg>

            <motion.div
              animate={{
                x: [0, 108, 216, 306, 382, 0],
                y: [0, -36, 12, 64, 84, 0],
                rotate: [0, 16, 42, 70, 95, 0]
              }}
              className="absolute left-[10%] top-[18%] flex h-16 w-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.98),rgba(247,247,247,0.92)_48%,rgba(212,216,223,0.9)_100%)] shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
              transition={{ duration: 6.6, ease: 'easeInOut', repeat: Infinity }}
            >
              <div className="absolute inset-[18%] rounded-full border border-slate-300/28" />
              <div className="absolute inset-[35%] rounded-full border border-slate-300/22" />
            </motion.div>

            <div className="absolute left-[8%] top-[9%] rounded-[1.4rem] border border-fairway-300/22 bg-fairway-500/10 px-4 py-3 text-white backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fairway-300">Choose your group</p>
              <p className="mt-2 text-sm font-semibold">1 to 8 golfers</p>
            </div>

            <div className="absolute bottom-[11%] right-[8%] rounded-[1.5rem] border border-[#dc5801]/26 bg-forest-950/62 px-4 py-4 text-white backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f7a24f]">Live package view</p>
              <p className="mt-2 text-sm font-semibold">Stay, golf, transfers</p>
              <p className="mt-1 text-xs text-white/56">A clearer way to price the trip</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function HeroStat({ value, label }: { readonly value: string; readonly label: string }) {
  return (
    <div className="min-w-[110px] rounded-[1.6rem] border border-white/12 bg-white/8 px-4 py-4 backdrop-blur-sm shadow-[0_14px_30px_rgba(8,27,8,0.16)]">
      <p className="font-display text-3xl font-bold text-[#f7a24f]">{value}</p>
      <p className="mt-1 text-xs leading-relaxed text-white">{label}</p>
    </div>
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
    <div className="rounded-[1.6rem] border border-white/80 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-forest-900">{label}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = option === value

          return (
            <button
              key={option}
              className={cx(
                'rounded-full border px-4 py-2 text-sm font-semibold transition-all',
                isActive
                  ? 'border-gold-400 bg-forest-900 text-white'
                  : 'border-forest-100 bg-offwhite text-forest-900 hover:border-gold-300 hover:bg-white'
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
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-white/45">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
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
    <div className={cx('flex items-center justify-between gap-4 border-b border-white/8 pb-3 text-sm', strong && 'pt-2')}>
      <span className={cx(strong ? 'font-semibold text-white' : 'text-white/68')}>{label}</span>
      <span className={cx('text-right', strong ? 'font-semibold text-gold-300' : 'text-white')}>{value}</span>
    </div>
  )
}

function MiniSummaryCard({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-white/42">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

export { CustomerPackagePage }
