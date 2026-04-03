import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa6'
import logoIcon from './golf-sol-ireland-logo.svg'
import {
  BedDouble,
  Bus,
  CalendarRange,
  CheckCircle2,
  CreditCard,
  Mail,
  MapPinned,
  Phone,
  Plane,
  Quote,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react'
import { Navbar } from './components/home/navbar'
import {
  CourseCard,
  FeatureTile,
  HotelCard,
  PackageCard,
  StepCard,
  TestimonialCard,
  TrustStat
} from './components/home/cards'
import { LuxuryButton } from './components/ui/button'
import { SiteFooter } from './components/site-footer'
import { AmbientGolfBall } from './components/ui/ambient-golf-ball'
import { Logo, ShamrockIcon } from './components/ui/logo'
import { AnimatedStepKicker, SectionHeader } from './components/ui/section-header'
import { WaveDivider } from './components/ui/wave-divider'
import { integrationRegistry } from './config/integrations'
import {
  costaMetrics,
  featuredCourses,
  footerSocialLinks,
  heroBackgroundImage,
  heroCardHighlights,
  heroStats,
  hotels,
  navLinks,
  landingEnquiryHighlights,
  packageFeatureRows,
  packageItems,
  planningSteps,
  primaryActions,
  testimonials,
  trustMarkers,
  trustSignals,
  transferFeatures
} from './data/site-content'
import { cx } from './lib/utils'

type HotelFilter = 'all' | 3 | 4 | 5

const selectedHotelTierStorageKey = 'gsol-selected-hotel-tier'
const transferParamOptions = ['shared', 'private', 'driver'] as const

type TransferParamOption = (typeof transferParamOptions)[number]

const quickTransferOptions: readonly {
  readonly label: string
  readonly value: TransferParamOption
  readonly description: string
}[] = [
  {
    label: 'Shared arrival and golf transfers',
    value: 'shared',
    description: 'The lightest transport setup for smaller groups who still want airport and golf-day movements covered.'
  },
  {
    label: 'Private return transfers',
    value: 'private',
    description: 'A cleaner, more private transport option that suits most premium golf groups very well.'
  },
  {
    label: 'Dedicated driver support',
    value: 'driver',
    description: 'The smoothest premium option, with driver support across the trip rather than just the airport runs.'
  }
]

const transferServiceMoments = [
  {
    title: 'Airport pickups and drop-offs',
    description: 'Malaga arrivals, luggage handling, and direct hotel routing are all organised around your Irish flight times.',
    icon: Plane
  },
  {
    title: 'Hotel-to-course movements',
    description: 'From morning tee times to dinner transfers, the full week moves on one joined-up Irish-led plan.',
    icon: Bus
  },
  {
    title: 'Irish drivers throughout',
    description: 'Airport transfers, hotel runs, and golf-course transport are handled by Irish drivers who know the trip rhythm.',
    icon: ShieldCheck
  }
] as const

const revealUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: 'easeOut' }
} as const

function App() {
  const [selectedHotelTier, setSelectedHotelTier] = useState<HotelFilter>('all')
  const [quickGroupSize, setQuickGroupSize] = useState(4)
  const [quickNights, setQuickNights] = useState(4)
  const [quickRounds, setQuickRounds] = useState(3)
  const [quickTransfer, setQuickTransfer] = useState<TransferParamOption>('private')
  const [enquiryFormStatus, setEnquiryFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [enquiryFormMessage, setEnquiryFormMessage] = useState('')
  const [hasAcceptedCookies, setHasAcceptedCookies] = useState(true)
  const [isFooterInView, setIsFooterInView] = useState(false)
  const footerRef = useRef<HTMLElement | null>(null)
  const whatsAppHref = footerSocialLinks.find((link) => link.label === 'WhatsApp')?.href ?? 'https://www.whatsapp.com/'

  const filteredHotels = useMemo(() => {
    if (selectedHotelTier === 'all') {
      return hotels
    }

    return hotels.filter((hotel) => hotel.tier === selectedHotelTier)
  }, [selectedHotelTier])

  const quickPackagesHref = useMemo(() => {
    const searchParams = new URLSearchParams({
      groupSize: String(quickGroupSize),
      nights: String(quickNights),
      rounds: String(quickRounds),
      transfer: quickTransfer,
      from: 'landing'
    })

    if (selectedHotelTier !== 'all') {
      searchParams.set('stay', String(selectedHotelTier))
    }

    return `/packages?${searchParams.toString()}`
  }, [quickGroupSize, quickNights, quickRounds, quickTransfer, selectedHotelTier])

  const handleHotelFilterChange = (tier: HotelFilter) => {
    setSelectedHotelTier(tier)

    if (tier === 'all') {
      sessionStorage.removeItem(selectedHotelTierStorageKey)
      return
    }

    sessionStorage.setItem(selectedHotelTierStorageKey, String(tier))
  }

  const handleNewsletterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formElement = event.currentTarget
    const formData = new FormData(formElement)
    const payload = {
      fullName: String(formData.get('fullName') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      phoneWhatsApp: String(formData.get('phoneWhatsApp') ?? '').trim(),
      bestTimeToCall: String(formData.get('bestTimeToCall') ?? '').trim(),
      interest: String(formData.get('interest') ?? '').trim()
    }

    if (
      !payload.fullName ||
      !payload.email ||
      !payload.phoneWhatsApp ||
      !payload.bestTimeToCall ||
      !payload.interest
    ) {
      setEnquiryFormStatus('error')
      setEnquiryFormMessage(
        'Please complete your name, email, phone / WhatsApp, best time to call, and trip interest before sending.'
      )
      return
    }

    setEnquiryFormStatus('submitting')
    setEnquiryFormMessage('')

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = (await response.json()) as { readonly message?: string }

      if (!response.ok) {
        throw new Error(result.message ?? 'Unable to send your enquiry right now.')
      }

      formElement.reset()
      setEnquiryFormStatus('success')
      setEnquiryFormMessage(result.message ?? 'Your enquiry has been sent successfully.')
    } catch (error) {
      setEnquiryFormStatus('error')
      setEnquiryFormMessage(error instanceof Error ? error.message : 'Unable to send your enquiry right now.')
    }
  }

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
      <Navbar links={navLinks} primaryCta={primaryActions.planTrip} />
      <FloatingWhatsAppButton hidden={isFooterInView} href={whatsAppHref} />
      <CookieBanner hidden={hasAcceptedCookies} onAccept={handleAcceptCookies} />

      <main>
        <section
          className="relative min-h-screen overflow-hidden bg-forest-900 px-6 pb-28 pt-36 md:pt-40"
          id="home"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroBackgroundImage})` }}
          />
          <div aria-hidden="true" className="absolute inset-0 bg-hero-overlay" />
          <div aria-hidden="true" className="absolute inset-0 bg-hero-bottom" />

          <div aria-hidden="true" className="absolute right-[-120px] top-[-96px] h-80 w-80 rounded-full bg-fairway-500/20 blur-3xl md:h-96 md:w-96" />
          <div aria-hidden="true" className="absolute right-[12%] top-[18%] hidden h-56 w-56 rounded-full border-2 border-white/20 animate-float md:block" />
          <div aria-hidden="true" className="absolute bottom-[24%] right-[8%] hidden h-72 w-72 rounded-full border-4 border-fairway-400/30 animate-float-slow md:block" />
          <div aria-hidden="true" className="absolute right-[16%] top-[24%] h-40 w-40 rounded-full bg-gold-400/15 blur-2xl md:h-44 md:w-44" />
          <AmbientGolfBall className="right-[3%] top-[18%] opacity-95 lg:right-[6%]" size="lg" tone="hero" variant="hero" />

          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-2 md:gap-16">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <motion.p
                className="mb-4 text-[1.02rem] font-semibold uppercase tracking-[0.14em] text-gold-300 md:text-[1.14rem]"
                initial={{ opacity: 0, y: 30 }}
                transition={{ delay: 0.1, duration: 0.7 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Costa del Sol golf holidays designed around Irish travellers
              </motion.p>

              <motion.h1
                className="max-w-3xl font-display text-5xl font-black leading-tight tracking-tight text-white md:text-7xl lg:text-[5rem]"
                initial={{ opacity: 0, y: 30 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                An Irish way to book Costa del Sol golf without the usual noise
              </motion.h1>

              <motion.p
                className="mt-5 max-w-2xl text-[1.28rem] font-medium leading-8 text-white md:text-[1.42rem]"
                initial={{ opacity: 0, y: 30 }}
                transition={{ delay: 0.32, duration: 0.7 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Premium Costa del Sol packages, handpicked stays, smooth transfers, and Irish-led judgement from first enquiry to final round.
              </motion.p>

              <motion.p
                className="mt-6 max-w-xl text-base leading-8 text-white md:text-lg"
                initial={{ opacity: 0, y: 30 }}
                transition={{ delay: 0.44, duration: 0.7 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-gold-300">Golf Sol Ireland</span> is the premium shortcut for Irish golfers heading south: no generic package feel, no piecing things together, just a cleaner route from Irish departure lounge to{' '}
                <span className="text-gold-300">Spanish fairway</span>.
              </motion.p>

              <motion.div
                className="mt-7 max-w-2xl rounded-[1.8rem] border border-[#fdba74]/35 bg-[linear-gradient(135deg,rgba(8,27,8,0.68),rgba(22,58,19,0.84),rgba(220,88,1,0.16))] p-[1px] shadow-[0_20px_60px_rgba(10,32,8,0.24)]"
                initial={{ opacity: 0, y: 30 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="rounded-[1.72rem] bg-forest-950/92 px-5 py-5 backdrop-blur-md md:px-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-xl">
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold-300">Payments handled properly</p>
                      <p className="mt-3 text-[1.12rem] font-semibold leading-8 text-white md:text-[1.2rem]">
                        All customer payments are made in Ireland{' '}
                        <span className="text-gold-300">directly to Golf Sol Ireland</span> — not to a Spanish middleman, not to a mystery operator, and not offshore.
                      </p>
                      <p className="mt-3 text-base leading-7 text-white">
                        It keeps the booking cleaner, more familiar, and easier to trust from the first deposit onwards.
                      </p>
                    </div>
                    <div className="inline-flex min-h-12 items-center gap-3 self-start rounded-full border border-white/20 bg-white/8 px-4 py-2.5 text-sm font-semibold text-white">
                      <CreditCard className="h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                      <span>Ireland-based payment flow</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="mt-8 flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 30 }}
                transition={{ delay: 0.56, duration: 0.7 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <LuxuryButton href="/packages" showArrow>
                  {primaryActions.planTrip}
                </LuxuryButton>
                <LuxuryButton href="#courses" variant="outline">
                  Explore Courses
                </LuxuryButton>
              </motion.div>

              <motion.div
                className="mt-10 flex flex-wrap gap-6"
                initial={{ opacity: 0, y: 30 }}
                transition={{ delay: 0.68, duration: 0.7 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                {heroStats.map((item) => (
                  <TrustStat key={item.label} {...item} />
                ))}
              </motion.div>
            </motion.div>

            <motion.aside
              className="relative hidden max-w-md justify-self-end rounded-[2rem] border border-white/20 bg-forest-950/75 p-6 shadow-2xl backdrop-blur-md md:block"
              initial={{ opacity: 0, y: 24 }}
              transition={{ delay: 0.25, duration: 0.8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="overflow-hidden rounded-[1.5rem]">
                <img
                  alt="Luxury golf resort in Costa del Sol"
                  className="h-48 w-full object-cover"
                  src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80"
                />
              </div>
              <div className="mt-5">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold-300">Signature route</p>
                <h2 className="mt-2 font-display text-[2rem] font-bold leading-tight text-white md:text-[2.2rem]">Marbella to Sotogrande</h2>
                <p className="mt-3 text-[1.02rem] leading-8 text-white">
                  Championship golf, polished stays, and transfer rhythm designed for Irish golfers who want the trip to feel effortless.
                </p>
                <motion.p
                  className="mt-5 max-w-sm font-display text-[2.85rem] font-black leading-[1] tracking-[-0.02em] text-gold-300 md:text-[3.1rem]"
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  initial={{ opacity: 0, y: 16 }}
                  transition={{
                    opacity: { delay: 0.32, duration: 0.6, ease: 'easeOut' },
                    y: { delay: 0.32, duration: 0.6, ease: 'easeOut' },
                    backgroundPosition: { delay: 0.9, duration: 4.2, ease: 'easeInOut', repeat: Infinity }
                  }}
                  viewport={{ once: true }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  Trade grey skies for golden fairways
                </motion.p>
              </div>
              <div className="mt-5 space-y-3">
                {heroCardHighlights.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-base text-white">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/20 pt-4 text-sm">
                <span className="text-white">Irish-owned planning</span>
                <span className="text-gold-300">Luxury, not generic</span>
              </div>
            </motion.aside>
          </div>

          <WaveDivider fill="#ffffff" />
        </section>

        <section className="relative overflow-hidden border-b border-forest-100 bg-white px-6 py-14 md:py-18">
          <div aria-hidden="true" className="absolute left-[-80px] top-10 h-56 w-56 rounded-full bg-fairway-400/12 blur-3xl" />
          <div aria-hidden="true" className="absolute right-[-40px] top-[-30px] h-64 w-64 rounded-full bg-gold-300/12 blur-3xl" />
          <div className="section-inner">
            <motion.div
              className="overflow-hidden rounded-[2.25rem] border border-forest-100 bg-[linear-gradient(135deg,#ffffff_0%,#f6faf3_42%,#fff8ef_100%)] p-5 shadow-soft md:p-7"
              initial={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              viewport={{ once: true, amount: 'some', margin: '0px 0px 80px 0px' }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-forest-900 bg-forest-950 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_14px_30px_rgba(10,32,8,0.14)]">
                      <span className="h-2 w-2 rounded-full bg-gold-300" />
                      Irish driver transfer service
                    </span>
                    <span className="rounded-full border border-gold-300/45 bg-gold-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-gold-700">
                      Airport, hotel, and golf-course lines covered
                    </span>
                  </div>

                  <h2 className="mt-5 max-w-3xl font-display text-[2.5rem] font-black leading-[1.05] tracking-[-0.02em] text-forest-900 md:text-[3.25rem]">
                    New Mercedes transfer vans, Golf Sol branding on the side, and Irish drivers handling the full route
                  </h2>
                  <p className="mt-4 max-w-3xl text-[1.03rem] leading-8 text-forest-900/72 md:text-[1.1rem]">
                    From Malaga airport arrivals to hotel check-in runs and every golf-course movement in between, the transport side of the trip is handled for you by Irish drivers who understand the pace, the luggage, and the group dynamic.
                  </p>

                  <div className="mt-6 overflow-hidden rounded-[1.8rem] border border-forest-900 bg-forest-950 shadow-[0_18px_42px_rgba(10,32,8,0.12)]">
                    <div className="flex flex-col gap-3 px-4 py-4 md:px-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white text-forest-950 shadow-sm">
                            <img alt="" aria-hidden="true" className="h-9 w-9 object-contain" src={logoIcon} />
                          </div>
                          <div>
                            <p className="text-[0.76rem] font-semibold uppercase tracking-[0.22em] text-gold-300">Golf Sol Ireland</p>
                            <p className="font-display text-[1.35rem] font-black uppercase tracking-[-0.03em] text-white">Mercedes Fleet</p>
                          </div>
                        </div>
                        <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-white">
                          <span className="h-2 w-2 shrink-0 rounded-full bg-gold-300" />
                          Branded transfer service
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 border-t border-white/10 pt-3">
                        {[
                          'Irish-driver operated',
                          'Premium Costa del Sol routing',
                          'Airport, hotel, and golf-course coverage'
                        ].map((item) => (
                          <span
                            key={item}
                            className="inline-flex min-h-11 items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {transferServiceMoments.map(({ title, description, icon: Icon }) => (
                      <div key={title} className="rounded-[1.6rem] border border-forest-100 bg-white/88 p-4 shadow-sm">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-forest-950 text-gold-300">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <p className="mt-4 text-base font-semibold text-forest-900">{title}</p>
                        <p className="mt-2 text-[1.02rem] leading-8 text-forest-900/72">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[2rem] border border-forest-100 bg-forest-950 p-5 text-white shadow-[0_28px_80px_rgba(22,58,19,0.16)] md:p-6">
                  <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.08),transparent_20%),radial-gradient(circle_at_82%_12%,rgba(220,88,1,0.22),transparent_20%)]" />
                  <div className="relative z-10">
                    <div className="overflow-hidden rounded-[1.5rem]">
                      <img
                        alt="Premium Golf Sol Ireland Mercedes transfer van ready for Costa del Sol airport and golf transfers"
                        className="h-[19rem] w-full object-cover"
                        src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=80"
                      />
                    </div>

                    <div className="mt-5 space-y-5 rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur-sm md:p-6">
                      <div className="rounded-[1.45rem] border border-white/12 bg-[linear-gradient(135deg,#ffffff_0%,#f7f9f5_100%)] p-5 text-forest-950 shadow-[0_18px_40px_rgba(0,0,0,0.2)] md:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3 gap-y-2">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-700">Mock vehicle livery</p>
                          <span className="shrink-0 rounded-full border border-forest-900 bg-forest-950 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.16em] text-white sm:px-5">
                            Fleet spec
                          </span>
                        </div>
                        <div className="mt-5 w-full overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-inner">
                          <div className="grid w-full grid-cols-1 items-stretch gap-6 bg-white px-5 py-7 sm:min-h-[12rem] sm:grid-cols-[minmax(12.5rem,42%)_minmax(0,1fr)] sm:items-center sm:gap-0 sm:px-0 sm:py-0">
                            <div className="flex min-w-0 items-center justify-center gap-3 sm:justify-start sm:gap-4 sm:px-7 sm:py-7">
                              <img alt="" aria-hidden="true" className="h-12 w-12 shrink-0 object-contain sm:h-12 sm:w-12" src={logoIcon} />
                              <div className="min-w-0 text-left">
                                <p className="font-display text-[1.35rem] font-black uppercase tracking-[-0.05em] text-[#003805] sm:text-[1.35rem]">GolfSol</p>
                                <p className="text-[0.8rem] font-bold uppercase tracking-[0.2em] text-[#dc5801] sm:text-[0.8rem]">Ireland</p>
                              </div>
                            </div>
                            <div className="min-w-0 rounded-xl bg-[#0a2008] px-5 py-6 text-left sm:rounded-none sm:border-l-[3px] sm:border-gold-400/90 sm:px-8 sm:py-7 sm:pl-7">
                              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-300 sm:text-[0.8rem] sm:tracking-[0.2em]">
                                Mercedes fleet
                              </p>
                              <p className="mt-3 text-base font-semibold leading-8 text-white sm:mt-4 sm:text-base sm:leading-8">
                                Airport, hotel, and golf-course transfers handled by Irish drivers
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 md:gap-4">
                        <span className="rounded-full border border-gold-300/35 bg-gold-400/12 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-gold-200 md:px-5">
                          Mercedes van service
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/8 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-white/88 md:px-5">
                          Golf bag and luggage ready
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/8 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-white/88 md:px-5">
                          Irish-driver coordinated
                        </span>
                      </div>

                      <div className="space-y-4 pt-1">
                        {[
                          'Airport pickups from Malaga timed around Irish arrivals',
                          'Hotel shuttles and golf-course runs coordinated by Irish drivers',
                          'Golf bags, luggage, and group timing all handled as one joined-up service'
                        ].map((item) => (
                          <div key={item} className="flex items-start gap-3 text-base text-white/82">
                            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-gold-300" aria-hidden="true" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="mt-6 overflow-hidden rounded-[2rem] border border-forest-100 bg-[linear-gradient(135deg,#ffffff_0%,#f7f9f5_36%,#eef5e7_70%,#fff7ef_100%)] p-5 shadow-sm md:p-6"
              initial={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              viewport={{ once: true, amount: 'some', margin: '0px 0px 80px 0px' }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold-500">Departing from Ireland</p>
                  <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold leading-tight text-forest-900 md:text-4xl">
                    Quick package start for Irish golfers heading to the Costa del Sol
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-8 text-forest-900/72 md:text-lg">
                    Set the group size, trip length, rounds, and transfer style here, then jump straight into the full package page with those choices already selected.
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-full border border-gold-300/35 bg-white/80 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-forest-900/72">
                  <span className="h-2 w-2 rounded-full bg-fairway-500" />
                  <span>Quick calculator</span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <motion.div
                  className="grid gap-4"
                  initial={{ opacity: 0, y: 18 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  viewport={{ once: true, amount: 'some' }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  <QuickSelectorCard
                    description="Choose anywhere from 1 golfer up to 8 golfers"
                    icon={Users}
                    label="Group size"
                    options={([1, 2, 3, 4, 5, 6, 7, 8] as const).map((value) => ({
                      label: String(value),
                      value
                    }))}
                    selectedValue={quickGroupSize}
                    onSelect={setQuickGroupSize}
                    columnsClassName="grid-cols-4 sm:grid-cols-8"
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <QuickSelectorCard
                      description=""
                      icon={CalendarRange}
                      label="Nights"
                      options={([3, 4, 5, 6, 7] as const).map((value) => ({
                        label: `${value} nights`,
                        value
                      }))}
                      selectedValue={quickNights}
                      onSelect={setQuickNights}
                    />
                    <QuickSelectorCard
                      description=""
                      icon={CalendarRange}
                      label="Rounds"
                      options={([2, 3, 4, 5] as const).map((value) => ({
                        label: `${value} rounds`,
                        value
                      }))}
                      selectedValue={quickRounds}
                      onSelect={setQuickRounds}
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="rounded-[1.75rem] border border-forest-100 bg-white/88 p-5 shadow-sm backdrop-blur-sm"
                  initial={{ opacity: 0, y: 18 }}
                  transition={{ delay: 0.08, duration: 0.5, ease: 'easeOut' }}
                  viewport={{ once: true, amount: 'some' }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-forest-900 text-white">
                      <Bus className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-forest-900">Transfer style</p>
                      <p className="text-sm leading-relaxed text-forest-900/60">
                        Choose the level of transport support that suits the trip
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {quickTransferOptions.map((option) => {
                      const isActive = quickTransfer === option.value

                      return (
                        <button
                          key={option.value}
                          className={cx(
                            'w-full rounded-[1.35rem] border p-4 text-left transition-all',
                            isActive
                              ? 'border-gold-300 bg-forest-900 text-white shadow-soft'
                              : 'border-forest-100 bg-offwhite/85 text-forest-900 hover:bg-white'
                          )}
                          onClick={() => setQuickTransfer(option.value)}
                          type="button"
                        >
                          <p className="text-sm font-semibold">{option.label}</p>
                          <p className={cx('mt-1 text-sm leading-relaxed', isActive ? 'text-white' : 'text-forest-900/62')}>
                            {option.description}
                          </p>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <LuxuryButton href={quickPackagesHref} showArrow>
                      Open full package page
                    </LuxuryButton>
                    <div className="rounded-full border border-forest-100 bg-offwhite px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-forest-900/68">
                      {quickGroupSize} golfers • {quickNights} nights • {quickRounds} rounds
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-forest-900/62">
                    Continue on the packages page to save this build to your account (magic-link sign-in) or open a printable proposal for your group.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative bg-white px-6 pb-24 pt-10 md:pt-14">
          <AmbientGolfBall className="left-[3%] top-10 opacity-80 xl:left-[6%]" size="sm" tone="light" />
          <div className="section-inner">
            <motion.div
              className="mb-8 text-center"
              initial={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              viewport={{ once: true, amount: 'some' }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-center">
                <h2 className="flex flex-col items-center gap-1 text-center">
                  <span className="text-sm font-semibold uppercase tracking-[0.28em] text-gold-500">
                    Why groups trust
                  </span>
                  <span className="flex flex-wrap items-center justify-center gap-2 leading-none">
                    <span className="font-display text-[2.9rem] font-black tracking-[-0.05em] text-[#003805] md:text-[3.8rem]">
                      GolfSol
                    </span>
                    <ShamrockIcon className="h-7 w-7 self-center md:h-9 md:w-9" />
                    <span className="pb-1 font-display text-[1.55rem] font-bold uppercase tracking-[0.12em] text-gold-500 md:pb-1.5 md:text-[1.95rem]">
                      Ireland
                    </span>
                  </span>
                </h2>
              </div>
              <p className="mx-auto mt-3 max-w-2xl text-base leading-8 text-forest-900/60 md:text-lg">
                Because the best Irish golf trips are not held together by guesswork. GolfSol Ireland gives Irish golfers smarter course picks, cleaner
                logistics, and the kind of local judgement that makes the whole week feel effortless before you ever board the flight.
              </p>
            </motion.div>
            <motion.div
              className="relative overflow-hidden rounded-[2.5rem] border border-forest-100 bg-gradient-to-br from-white via-cream to-offwhite px-6 py-8 text-forest-900 shadow-soft md:px-8 md:py-10"
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              viewport={{ once: true, amount: 0.2 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div aria-hidden="true" className="absolute left-[-40px] top-[-48px] h-40 w-40 rounded-full bg-gold-400/12 blur-3xl" />
              <div aria-hidden="true" className="absolute bottom-[-60px] right-[-10px] h-48 w-48 rounded-full bg-fairway-500/10 blur-3xl" />

              <div className="relative z-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
                <div>
                  <motion.div
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.12em]"
                    initial={{ opacity: 0, x: -16, scale: 0.96 }}
                    transition={{
                      opacity: { delay: 0.08, duration: 0.5, ease: 'easeOut' },
                      x: { delay: 0.08, duration: 0.5, ease: 'easeOut' },
                      scale: { delay: 0.62, duration: 4.8, ease: 'easeInOut', repeat: Infinity },
                      boxShadow: { delay: 0.62, duration: 4.8, ease: 'easeInOut', repeat: Infinity },
                      backgroundColor: { delay: 0.62, duration: 4.8, ease: 'easeInOut', repeat: Infinity },
                      borderColor: { delay: 0.62, duration: 4.8, ease: 'easeInOut', repeat: Infinity },
                      color: { delay: 0.62, duration: 4.8, ease: 'easeInOut', repeat: Infinity }
                    }}
                    viewport={{ once: true }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                      scale: [1, 1.012, 1],
                      backgroundColor: [
                        'rgba(240,247,238,0.96)',
                        'rgba(255,255,255,0.98)',
                        'rgba(255,247,237,0.98)',
                        'rgba(240,247,238,0.96)'
                      ],
                      borderColor: [
                        'rgba(80,163,45,0.18)',
                        'rgba(255,255,255,0.9)',
                        'rgba(253,186,116,0.32)',
                        'rgba(80,163,45,0.18)'
                      ],
                      color: [
                        'rgba(31,87,26,0.92)',
                        'rgba(54,69,79,0.82)',
                        'rgba(217,119,6,0.92)',
                        'rgba(31,87,26,0.92)'
                      ],
                      boxShadow: [
                        '0 0 0 0 rgba(80,163,45,0)',
                        '0 8px 24px rgba(255,255,255,0.16)',
                        '0 10px 28px rgba(245,158,11,0.1)',
                        '0 0 0 0 rgba(80,163,45,0)'
                      ]
                    }}
                  >
                    Chosen by Irish golfers who know the difference
                  </motion.div>

                  <motion.h2
                    className="mt-5 max-w-2xl font-display text-[2.5rem] font-black leading-[1.05] tracking-[-0.02em] text-forest-900 md:text-[3.25rem]"
                    initial={{ opacity: 0, y: 20 }}
                    transition={{ delay: 0.14, duration: 0.6, ease: 'easeOut' }}
                    viewport={{ once: true }}
                    whileInView={{ opacity: 1, y: 0 }}
                  >
                    Confidence before the booking. Clarity before the spend.
                  </motion.h2>

                  <motion.p
                    className="mt-4 max-w-xl text-[1.03rem] leading-8 text-forest-900/72 md:text-[1.1rem]"
                    initial={{ opacity: 0, y: 20 }}
                    transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
                    viewport={{ once: true }}
                    whileInView={{ opacity: 1, y: 0 }}
                  >
                    GolfSol Ireland is for travellers who want more than a nice hotel and a tee sheet. It is for groups who want the
                    right base, the right course rhythm, and the kind of planning judgement that makes the whole trip feel smoother,
                    sharper, and worth the investment from day one.
                  </motion.p>

                  <motion.div
                    className="mt-6 rounded-[2rem] border border-forest-100 bg-white/90 p-5 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    transition={{ delay: 0.28, duration: 0.6, ease: 'easeOut' }}
                    viewport={{ once: true }}
                    whileInView={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-start gap-3">
                      <Quote className="mt-1 h-5 w-5 shrink-0 text-gold-300" aria-hidden="true" />
                      <div>
                        <p className="text-base leading-relaxed text-forest-900/82 md:text-lg">
                          For Irish golfers who want every detail to feel considered, every transfer to make sense, and every round to land exactly where it should.
                        </p>
                        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-forest-900/62">Smarter planning. Better golf. Zero noise.</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="mt-6 grid gap-3 sm:grid-cols-3"
                    initial={{ opacity: 0, y: 20 }}
                    transition={{ delay: 0.34, duration: 0.6, ease: 'easeOut' }}
                    viewport={{ once: true }}
                    whileInView={{ opacity: 1, y: 0 }}
                  >
                    {heroStats.map((item) => (
                      <div key={item.label} className="rounded-[1.75rem] border border-forest-100 bg-white/80 p-4 shadow-sm">
                        <p className="font-display text-3xl font-bold text-gold-300">{item.value}</p>
                        <p className="mt-2 text-sm leading-7 text-forest-900/62">{item.label}</p>
                      </div>
                    ))}
                  </motion.div>
                </div>

                <div className="grid gap-4">
                  {trustSignals.map(({ title, description, icon: Icon }, index) => (
                    <motion.article
                      key={title}
                      className="group rounded-[2rem] border border-forest-100 bg-white/85 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                      initial={{ opacity: 0, x: 18 }}
                      transition={{ delay: 0.12 * index, duration: 0.55, ease: 'easeOut' }}
                      viewport={{ once: true, amount: 0.25 }}
                      whileInView={{ opacity: 1, x: 0 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold-300/35 bg-gold-50 text-gold-500 transition-transform duration-300 group-hover:scale-105">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-forest-900">{title}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-forest-900/62">{description}</p>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>

              <motion.div
                className="relative z-10 mt-8 border-t border-forest-100 pt-6"
                initial={{ opacity: 0, y: 18 }}
                transition={{ delay: 0.22, duration: 0.55, ease: 'easeOut' }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap gap-3">
                    {trustMarkers.map((marker) => (
                      <div
                        key={marker}
                        className="inline-flex items-center gap-2 rounded-full border border-forest-100 bg-white/80 px-4 py-2.5 text-sm font-medium text-forest-900/74"
                      >
                        <CheckCircle2 className="h-4 w-4 text-gold-300" aria-hidden="true" />
                        <span>{marker}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <LuxuryButton href="/packages">See What Is Included</LuxuryButton>
                    <LuxuryButton
                      className="border border-gold-300/40 bg-white text-forest-900 shadow-sm hover:-translate-y-0.5 hover:border-gold-400 hover:bg-gold-50"
                      href="#testimonials"
                      showArrow
                      variant="white"
                    >
                      Read Traveller Reviews
                    </LuxuryButton>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="section-shell bg-white pb-28" id="packages">
          <div className="section-inner grid items-start gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
            <div>
              <SectionHeader
                body="The best Costa del Sol trips do not come from stuffing in more. They come from choosing the right courses, the right base, and the right pace, so every day feels polished, effortless, and worth looking forward to."
                kicker="Step 1 — Shape the trip properly"
                title="Luxury golf packages shaped around how Irish groups actually travel"
              />

              <div className="space-y-4">
                {packageFeatureRows.map(({ title, description, icon: Icon }, index) => (
                  <motion.div
                    key={title}
                    className="group rounded-[2rem] border border-forest-100 bg-offwhite p-5"
                    {...revealUp}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.28, 1],
                        y: [0, -3, 0]
                      }}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-forest-950 transition-colors group-hover:bg-gold-50"
                      transition={{
                        duration: 1.4,
                        ease: 'easeInOut',
                        delay: index * 1.6,
                        repeat: Infinity,
                        repeatDelay: 7
                      }}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </motion.div>
                    <div>
                      <h3 className="mb-1 text-[1.02rem] font-semibold text-forest-900">{title}</h3>
                      <p className="text-[1.02rem] leading-8 text-forest-900/72">{description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {packageItems.map((item) => (
                <PackageCard key={item.name} {...item} />
              ))}
            </div>
          </div>

          <WaveDivider fill="#f2f5ef" />
        </section>

        <section className="section-shell bg-cream pb-28" id="costa-del-sol">
          <AmbientGolfBall className="right-[4%] top-14 opacity-85 xl:right-[7%]" size="md" tone="cream" />
          <div className="section-inner grid items-center gap-12 md:grid-cols-2 md:gap-16">
            <motion.div className="relative" {...revealUp}>
              <div aria-hidden="true" className="absolute -left-12 top-10 h-52 w-52 rounded-full bg-fairway-500/10 blur-3xl" />
              <div className="relative grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2 overflow-hidden rounded-[2rem]">
                  <img
                    alt="Aerial golf course view on the Costa del Sol"
                    className="h-72 w-full object-cover transition-transform duration-500 hover:scale-105"
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80"
                  />
                </div>
                <div className="overflow-hidden rounded-[2rem]">
                  <img
                    alt="Golfers walking fairway in the Spanish sunshine"
                    className="h-52 w-full object-cover transition-transform duration-500 hover:scale-105"
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
                  />
                </div>
                <div className="relative overflow-hidden rounded-[2rem]">
                  <img
                    alt="Costa del Sol luxury hotel pool"
                    className="h-52 w-full object-cover transition-transform duration-500 hover:scale-105"
                    src="https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80"
                  />
                  <div className="absolute bottom-4 right-4 rounded-[1.5rem] border border-white/10 bg-forest-900/85 px-4 py-3 text-white shadow-soft backdrop-blur-md">
                    <p className="font-display text-2xl font-bold text-gold-400">70+</p>
                    <p className="text-sm text-white/74">Courses across the coast</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div>
              <SectionHeader
                body="The Costa del Sol gives Irish golfers something rare: championship courses, polished stays, lively bases, and enough choice to shape the trip around the group rather than forcing the group around the trip."
                kicker="Step 2 — Pick the right Costa base"
                title="One destination, endless fairways, and a warmer kind of luxury"
              />

              <motion.div className="grid gap-4 sm:grid-cols-3" {...revealUp}>
                {costaMetrics.map((metric) => (
                  <div key={metric.label} className="rounded-[2rem] border border-white/60 bg-white/70 p-5 backdrop-blur-sm">
                    <p className="font-display text-3xl font-bold text-forest-900">{metric.value}</p>
                    <p className="mt-2 text-[1.02rem] leading-8 text-forest-900/68">{metric.label}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div className="mt-8 flex flex-wrap gap-4" {...revealUp}>
                <LuxuryButton href="#courses" showArrow>
                  See Featured Courses
                </LuxuryButton>
                <LuxuryButton className="border-forest-200 text-forest-900 hover:bg-forest-50" href="#hotels" variant="white">
                  Compare Hotel Tiers
                </LuxuryButton>
              </motion.div>
            </div>
          </div>

          <WaveDivider fill="#cce8f4" />
        </section>

        <section className="section-shell bg-sky-section pb-24 pt-16">
          <motion.div className="section-inner text-center" {...revealUp}>
            <AnimatedStepKicker centered kicker="Step 3 — Let the week feel effortless" />
            <h2 className="mx-auto mt-3 max-w-4xl font-display text-[2.5rem] font-black leading-[1.05] tracking-[-0.02em] text-forest-900 md:text-[3.25rem]">
              Costa del Sol golf should feel effortless, elegant, and worth talking about on the flight home
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[1.03rem] leading-8 text-forest-900/72 md:text-[1.1rem]">
              Sun on your back, great golf ahead, and none of the usual trip friction in the middle. This is the kind of break that feels easy to say yes to and even better to talk about on the flight home.
            </p>
          </motion.div>

          <WaveDivider fill="#e8f4fb" />
        </section>

        <section className="section-shell bg-sky-muted pb-28" id="courses">
          <AmbientGolfBall className="left-[4%] top-14 opacity-80 xl:left-[7%]" size="sm" tone="sky" />
          <div className="section-inner">
            <SectionHeader
              body="Some courses sell the trip on their own. These are the layouts that give your week its shape, its stories, and the kind of golf that makes the whole journey feel worth the effort."
              centered
              kicker="Step 4 — Choose the headline courses"
              title="Featured Costa del Sol layouts worth building a trip around"
            />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.map((course) => (
                <CourseCard key={course.name} {...course} />
              ))}
            </div>
          </div>

          <WaveDivider fill="#f0f7ee" />
        </section>

        <section className="section-shell bg-forest-50 pb-28" id="hotels">
          <div className="section-inner">
            <SectionHeader
              body="Not every group wants the same base. Some want lively and central, some want polished and relaxed, and some want the full five-star switch-off from the moment they arrive."
              centered
              kicker="Step 5 — Match the stay to the group"
              title="Accommodation tiers for different budgets, all kept within the same premium visual language"
            />

            <div className="mb-8 flex flex-wrap justify-center gap-3">
              {(['all', 3, 4, 5] as const).map((tier) => {
                const isActive = selectedHotelTier === tier
                const label = tier === 'all' ? 'All stays' : `${tier}-star`

                return (
                  <button
                    key={String(tier)}
                    aria-label={`Filter accommodation by ${label}`}
                    className={cx(
                      'rounded-full border px-5 py-2 text-sm font-medium transition-all',
                      isActive
                        ? 'border-forest-900 bg-forest-900 text-white shadow-md'
                        : 'border-forest-200 bg-white text-forest-700 hover:border-forest-400'
                    )}
                    onClick={() => handleHotelFilterChange(tier)}
                    type="button"
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredHotels.map((hotel) => (
                <HotelCard key={hotel.name} {...hotel} />
              ))}
            </div>
          </div>

          <WaveDivider fill="#163a13" />
        </section>

        <section className="section-shell bg-forest-900 pb-28" id="transfers">
          <div aria-hidden="true" className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-fairway-500/10 blur-3xl" />
          <div aria-hidden="true" className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl" />
          <AmbientGolfBall className="right-[5%] top-16 opacity-90 xl:right-[8%]" size="md" tone="dark" />

          <div className="section-inner grid items-start gap-12 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
            <div>
              <SectionHeader
                body="The best golf trips keep moving without ever feeling rushed. From airport arrivals to hotel check-ins and first-tee departures, the right transfer plan makes the whole week feel smoother, calmer, and far more premium."
                dark
                kicker="Step 6 — Keep every transfer seamless"
                title="Airport, hotel, and course transfers designed around real golf itineraries"
              />

              <motion.div className="space-y-4" {...revealUp}>
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-orange-700">From enquiry to confirmed itinerary</p>
                  <div className="mb-4 max-w-lg rounded-[1.4rem] border border-gold-300/18 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(253,186,116,0.08))] px-4 py-3 shadow-[0_12px_28px_rgba(10,32,8,0.16)]">
                    <p className="text-[1.02rem] leading-8 text-white">
                      The goal is simple: once a group enquires, everything from transfers and stay details to payment and confirmations should feel joined-up,
                      calm, and easy to trust.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {Object.values(integrationRegistry).map((integration) => (
                      <div key={integration.label} className="flex items-start gap-3 text-sm text-white/70">
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                        <span>{integration.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div className="mt-8 flex flex-wrap gap-4" {...revealUp}>
                <LuxuryButton href="/packages" showArrow>
                  Build My Route
                </LuxuryButton>
                <LuxuryButton href="#testimonials" variant="outline">
                  Read Reviews
                </LuxuryButton>
              </motion.div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {transferFeatures.map((feature) => (
                <FeatureTile key={feature.title} {...feature} />
              ))}
            </div>
          </div>

          <WaveDivider fill="#ffffff" />
        </section>

        <section className="section-shell bg-white pb-28" id="plan-trip">
          <div className="section-inner">
            <SectionHeader
              body="Tell us your dates, group style, preferred courses, and stay level. We shape the route, confirm the details, and make the whole planning process feel straightforward from first enquiry to final itinerary."
              centered
              kicker="Step 7 — Build the itinerary"
              title="Plan your Costa del Sol trip in four clear, well-paced steps"
            />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {planningSteps.map((step) => (
                <StepCard key={step.step} {...step} />
              ))}
            </div>
          </div>

          <WaveDivider fill="#ffffff" />
        </section>

        <section className="section-shell bg-white pb-28" id="testimonials">
          <div className="section-inner">
            <SectionHeader
              body="The social proof is intentionally premium and restrained: enough to signal trust, without turning the page into a hard-sell brochure."
              centered
              kicker="Step 8 — Hear it from Irish golfers"
              title="Testimonials from Irish golfers who wanted the planning done properly"
            />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.name} {...testimonial} />
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell bg-forest-900 pb-20">
          <div aria-hidden="true" className="absolute left-[-100px] top-[-40px] h-72 w-72 rounded-full bg-fairway-500/10 blur-3xl" />
          <div aria-hidden="true" className="absolute bottom-[-40px] right-[-60px] h-72 w-72 rounded-full bg-gold-400/10 blur-3xl" />

          <div className="section-inner grid items-start gap-12 md:grid-cols-[1fr_0.95fr] md:gap-16">
            <div>
              <AnimatedStepKicker className="mb-3" dark kicker="Step 9 — Get in touch" />
              <h2 className="mt-3 max-w-xl font-display text-4xl font-bold leading-tight text-white md:text-5xl">
                Tell us about your trip — we’ll come back with a clear, tailored next step
              </h2>
              <p className="mt-5 max-w-lg text-lg leading-8 text-white/75 md:text-xl md:leading-9">
                This is your enquiry form, not a newsletter. Share who you are, how to reach you, and what you’re planning for the Costa del Sol. We use that to respond with real advice and a sensible follow-up — usually by email, phone, or WhatsApp.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {landingEnquiryHighlights.map(({ title, icon: Icon }) => (
                  <motion.div
                    key={title}
                    className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                    {...revealUp}
                  >
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-gold-300">
                      <Icon className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
                    </div>
                    <p className="text-base leading-relaxed text-white md:text-lg">{title}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              className="rounded-[2rem] border border-white/10 bg-white/10 p-7 shadow-2xl backdrop-blur-md md:p-8"
              {...revealUp}
            >
              <form className="space-y-6 md:space-y-7" onSubmit={handleNewsletterSubmit}>
                <div>
                  <label className="mb-2.5 block text-base font-medium tracking-wide text-white/85 md:text-lg" htmlFor="full-name">
                    Full name
                  </label>
                  <input
                    className="w-full rounded-full border border-white/20 bg-white/10 px-6 py-4 text-lg text-white placeholder:text-white/45 focus:border-gold-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/40 md:py-[1.15rem] md:text-xl"
                    id="full-name"
                    name="fullName"
                    placeholder="Patrick Murphy"
                    required
                    type="text"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-base font-medium tracking-wide text-white/85 md:text-lg" htmlFor="email">
                    Email address
                  </label>
                  <input
                    className="w-full rounded-full border border-white/20 bg-white/10 px-6 py-4 text-lg text-white placeholder:text-white/45 focus:border-gold-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/40 md:py-[1.15rem] md:text-xl"
                    id="email"
                    name="email"
                    placeholder="patrick@example.ie"
                    required
                    type="email"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-base font-medium tracking-wide text-white/85 md:text-lg" htmlFor="phone-whatsapp">
                    Phone / WhatsApp
                  </label>
                  <input
                    className="w-full rounded-full border border-white/20 bg-white/10 px-6 py-4 text-lg text-white placeholder:text-white/45 focus:border-gold-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/40 md:py-[1.15rem] md:text-xl"
                    id="phone-whatsapp"
                    name="phoneWhatsApp"
                    placeholder="+353 87 000 0000"
                    required
                    type="tel"
                    autoComplete="tel"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-base font-medium tracking-wide text-white/85 md:text-lg" htmlFor="best-time-to-call">
                    Best time to call
                  </label>
                  <select
                    className="w-full rounded-full border border-white/20 bg-white/10 px-6 py-4 text-lg text-white focus:border-gold-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/40 md:py-[1.15rem] md:text-xl"
                    id="best-time-to-call"
                    name="bestTimeToCall"
                    required
                    defaultValue=""
                  >
                    <option className="bg-forest-900 text-white" disabled value="">
                      Select a time window
                    </option>
                    <option className="bg-forest-900 text-white" value="Weekday mornings (9:00–12:00)">
                      Weekday mornings (9:00–12:00)
                    </option>
                    <option className="bg-forest-900 text-white" value="Weekday afternoons (12:00–17:00)">
                      Weekday afternoons (12:00–17:00)
                    </option>
                    <option className="bg-forest-900 text-white" value="Evenings (after 17:00)">
                      Evenings (after 17:00)
                    </option>
                    <option className="bg-forest-900 text-white" value="Any time">
                      Any time
                    </option>
                    <option className="bg-forest-900 text-white" value="Weekends only">
                      Weekends only
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2.5 block text-base font-medium tracking-wide text-white/85 md:text-lg" htmlFor="interest">
                    Trip interest
                  </label>
                  <input
                    className="w-full rounded-full border border-white/20 bg-white/10 px-6 py-4 text-lg text-white placeholder:text-white/45 focus:border-gold-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/40 md:py-[1.15rem] md:text-xl"
                    id="interest"
                    name="interest"
                    placeholder="5-star week in Marbella for 8 golfers"
                    required
                    type="text"
                  />
                </div>

                <LuxuryButton className="w-full justify-center !py-4 !text-lg" disabled={enquiryFormStatus === 'submitting'} type="submit">
                  {enquiryFormStatus === 'submitting' ? 'Sending enquiry...' : 'Register Interest'}
                </LuxuryButton>

                {enquiryFormMessage ? (
                  <div
                    aria-live="polite"
                    className={cx(
                      'rounded-[1.4rem] border px-5 py-4 text-lg leading-relaxed md:text-xl',
                      enquiryFormStatus === 'success'
                        ? 'border-gold-300/30 bg-gold-400/12 text-white'
                        : 'border-[#f7a24f]/35 bg-[#dc5801]/12 text-white'
                    )}
                  >
                    {enquiryFormMessage}
                  </div>
                ) : null}

                <div className="rounded-[1.5rem] border border-white/10 bg-black/10 p-5 md:p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white md:text-base">What happens next</p>
                  <div className="mt-4 space-y-4 text-base leading-relaxed text-white md:text-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 shrink-0 text-gold-400" aria-hidden="true" />
                      <span>We’ll use your phone or WhatsApp and your preferred call window when we reach out.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 shrink-0 text-gold-400" aria-hidden="true" />
                      <span>We review your enquiry and come back with the right course, stay, and transfer fit for your group.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <BedDouble className="h-5 w-5 shrink-0 text-gold-400" aria-hidden="true" />
                      <span>You get a clear, tailored trip outline instead of a generic off-the-shelf package.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPinned className="h-5 w-5 shrink-0 text-gold-400" aria-hidden="true" />
                      <span>No obligation, no hard sell, just a cleaner route to planning the trip properly.</span>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </section>
      </main>

      <SiteFooter
        copyrightNote="Golf travel planning for Irish groups heading to the Costa del Sol."
        footerRef={footerRef}
        intro="Golf Sol Ireland exists for golfers who want the Costa del Sol done properly: better courses, smarter stays, and a smoother trip from first enquiry to final round."
      />
    </div>
  )
}

function QuickSelectorCard({
  label,
  description,
  icon: Icon,
  options,
  selectedValue,
  onSelect,
  columnsClassName = 'grid-cols-2'
}: {
  readonly label: string
  readonly description: string
  readonly icon: typeof Users
  readonly options: readonly { readonly label: string; readonly value: number }[]
  readonly selectedValue: number
  readonly onSelect: (value: number) => void
  readonly columnsClassName?: string
}) {
  return (
    <div className="rounded-[1.75rem] border border-forest-100 bg-white/88 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-forest-900 text-white">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-forest-900">{label}</p>
          {description ? <p className="text-xs leading-relaxed text-forest-900/52">{description}</p> : null}
        </div>
      </div>

      <div className={cx('mt-4 grid gap-2', columnsClassName)}>
        {options.map((option) => {
          const isActive = selectedValue === option.value

          return (
            <button
              key={option.value}
              className={cx(
                'rounded-2xl border px-3 py-3 text-sm font-semibold transition-all',
                isActive
                  ? 'border-gold-300 bg-forest-900 text-white shadow-soft'
                  : 'border-forest-100 bg-offwhite/85 text-forest-900 hover:bg-white'
              )}
              onClick={() => onSelect(option.value)}
              type="button"
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function FloatingWhatsAppButton({
  href,
  hidden
}: {
  readonly href: string
  readonly hidden: boolean
}) {
  return (
    <motion.a
      animate={{
        y: [0, -5, 0],
        rotate: [0, -3, 2, 0],
        opacity: hidden ? 0 : 1,
        scale: hidden ? 0.92 : 1,
        filter: [
          'drop-shadow(0 14px 28px rgba(22,58,19,0.18))',
          'drop-shadow(0 18px 32px rgba(22,58,19,0.24))',
          'drop-shadow(0 14px 28px rgba(22,58,19,0.18))'
        ]
      }}
      aria-label="Chat with us on WhatsApp"
      className={cx(
        'group fixed bottom-4 right-3 z-[60] inline-flex items-center gap-2 overflow-hidden rounded-full bg-white/72 px-2.5 py-2.5 pr-2 shadow-soft backdrop-blur-md transition-all duration-300 hover:bg-white/82 sm:bottom-5 sm:right-4 sm:pr-4',
        hidden && 'pointer-events-none'
      )}
      href={href}
      rel="noreferrer"
      target="_blank"
      transition={{
        y: { duration: 3.8, ease: 'easeInOut', repeat: Infinity },
        rotate: { duration: 3.8, ease: 'easeInOut', repeat: Infinity },
        filter: { duration: 3.8, ease: 'easeInOut', repeat: Infinity },
        opacity: { duration: 0.35, ease: 'easeOut' },
        scale: { duration: 0.35, ease: 'easeOut' }
      }}
      whileHover={{ scale: 1.03, x: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <span aria-hidden="true" className="absolute inset-0 rounded-full bg-white/18" />
      <span aria-hidden="true" className="absolute inset-0 rounded-full border border-white/25" />
      <span aria-hidden="true" className="absolute inset-[1px] rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.48),rgba(255,255,255,0.12))]" />
      <span aria-hidden="true" className="absolute inset-[1.5px] rounded-full bg-[rgba(255,255,255,0.58)]" />
      <span aria-hidden="true" className="absolute inset-[2px] rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(255,255,255,0.42))]" />
      <motion.span
        aria-hidden="true"
        animate={{ rotate: [0, 360] }}
        className="absolute inset-[-35%] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_235deg,rgba(255,255,255,0.04)_255deg,rgba(37,211,102,0.8)_290deg,rgba(255,255,255,0.92)_320deg,rgba(18,140,74,0.7)_345deg,transparent_360deg)]"
        transition={{ duration: 5.8, ease: 'linear', repeat: Infinity }}
      />
      <span aria-hidden="true" className="absolute inset-[2.5px] rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(248,252,250,0.72))] backdrop-blur-md" />

      <span className="relative z-10 flex h-[3.85rem] w-[3.85rem] items-center justify-center sm:h-[4.15rem] sm:w-[4.15rem]">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[#25d366]/25 blur-xl transition-all duration-300 group-hover:scale-110 group-hover:opacity-100"
        />
        <span
          aria-hidden="true"
          className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.9),rgba(255,255,255,0.14)_34%,rgba(37,211,102,0.18)_62%,transparent)] blur-[6px]"
        />
        <ShamrockIcon className="h-[3.8rem] w-[3.8rem] drop-shadow-[0_10px_18px_rgba(61,129,32,0.34)] transition-all duration-300 group-hover:scale-[1.08] group-hover:drop-shadow-[0_16px_24px_rgba(61,129,32,0.42)] sm:h-[4.1rem] sm:w-[4.1rem]" />
        <span
          aria-hidden="true"
          className="absolute left-[17%] top-[13%] h-[28%] w-[26%] rounded-full bg-white/70 blur-[7px]"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white text-[#128c4a] shadow-[0_10px_24px_rgba(18,140,74,0.28)] transition-transform duration-300 group-hover:scale-110 sm:h-11 sm:w-11">
            <FaWhatsapp className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
          </span>
        </span>
      </span>
      <span className="relative z-10 hidden pr-1 text-sm font-semibold text-forest-900 transition-colors duration-300 group-hover:text-forest-950 sm:inline">
        WhatsApp
      </span>
    </motion.a>
  )
}

function CookieBanner({
  hidden,
  onAccept
}: {
  readonly hidden: boolean
  readonly onAccept: () => void
}) {
  if (hidden) {
    return null
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-3 right-3 z-[55] rounded-[1.75rem] border border-white/15 bg-forest-950/92 p-4 text-white shadow-2xl backdrop-blur-md sm:left-4 sm:right-auto sm:max-w-md"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div aria-hidden="true" className="absolute inset-0 rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(220,88,1,0.06),rgba(80,163,45,0.06))]" />
      <div className="relative z-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-gold-300">Cookie notice</p>
        <p className="mt-2 text-sm leading-relaxed text-white">
          We use cookies to improve the browsing experience, understand site traffic, and keep the journey smooth.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="rounded-full bg-[#dc5801] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#c84f01]"
            onClick={onAccept}
            type="button"
          >
            Accept cookies
          </button>
          <button
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            onClick={onAccept}
            type="button"
          >
            Dismiss
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default App
