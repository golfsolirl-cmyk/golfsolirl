import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa6'
import {
  BadgeEuro,
  BedDouble,
  Bus,
  CalendarRange,
  CarFront,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react'
import { Navbar } from '../components/home/navbar'
import { PageIdentityBar } from '../components/page-identity-bar'
import { LuxuryButton } from '../components/ui/button'
import { SiteFooter } from '../components/site-footer'
import { AmbientGolfBall } from '../components/ui/ambient-golf-ball'
import { Logo, ShamrockIcon } from '../components/ui/logo'
import { AnimatedStepKicker, SectionHeader } from '../components/ui/section-header'
import { WaveDivider } from '../components/ui/wave-divider'
import { footerSocialLinks, heroBackgroundImage } from '../data/site-content'
import { cx } from '../lib/utils'

const packagePageLinks = ['Packages', 'Stays', 'Pricing', 'Enquire'] as const

const routeOrigins = [
  {
    title: 'Dublin groups',
    note: 'Best for fast long weekends and premium society trips'
  },
  {
    title: 'Shannon groups',
    note: 'Ideal for west-of-Ireland foursomes and smaller golf groups'
  },
  {
    title: 'Cork groups',
    note: 'Strong fit for southern groups who want everything lined up cleanly'
  }
] as const

const packageOptions = [
  {
    name: 'Coastal Fourball',
    label: 'Best for 4 golfers',
    summary: 'A polished long-weekend package with strong golf, smart transfers, and a four-star base close to the action.',
    duration: '4 nights / 3 rounds',
    price: 1395,
    includes: ['4-star stay', '3 rounds', 'Driver support priced in', 'Airport and course transfers']
  },
  {
    name: 'Society Midweek',
    label: 'Best for 6 golfers',
    summary: 'Built for smaller Irish groups who want the rounds, the nightlife access, and the logistics handled properly.',
    duration: '5 nights / 4 rounds',
    price: 1645,
    includes: ['Central stay', '4 rounds', 'Private driver cover', 'Diesel and routing allowed for']
  },
  {
    name: 'Signature Escape',
    label: 'Best for 8 golfers',
    summary: 'A stronger premium package with better hotels, tighter routing, and more margin room without feeling overpriced.',
    duration: '5 nights / 4 rounds',
    price: 1895,
    includes: ['5-star stay', '4 marquee rounds', 'Private vehicle throughout', 'Premium buffer built in']
  }
] as const

const accommodationOptions = [
  {
    name: 'Coastal 3-star',
    area: 'La Cala base',
    pricePerPersonPerNight: 89,
    summary: 'Clean, social, and good for value-led groups that still want the trip to feel well put together.',
    perks: ['Breakfast included', 'Walkable dining', 'Good transfer access']
  },
  {
    name: 'Premium 4-star',
    area: 'Marbella base',
    pricePerPersonPerNight: 145,
    summary: 'The sweet spot for most groups: better room quality, cleaner arrival experience, and stronger overall feel.',
    perks: ['Sea-view upgrade potential', 'Better breakfast window', 'Higher-margin package fit']
  },
  {
    name: 'Luxury 5-star',
    area: 'Estepona or Sotogrande',
    pricePerPersonPerNight: 245,
    summary: 'A true flagship stay level for groups that want the hotel to feel as premium as the golf.',
    perks: ['Concierge feel', 'Spa and resort facilities', 'Ideal for signature packages']
  }
] as const

const planningPoints = [
  'Room cost per person and per night',
  'Golf cost per round and total rounds',
  'Driver wages across the trip',
  'Diesel and transfer running costs',
  'Extra admin or contingency cover',
  'Profit per person before you quote'
] as const

const revealUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: 'easeOut' }
} as const

const adminSessionStorageKey = 'gsol-package-admin-authenticated'
const adminAccessKey = (import.meta.env.VITE_PACKAGE_ADMIN_KEY ?? 'gsol-admin').trim()

function PackageAdminPage() {
  const [selectedAccommodationName, setSelectedAccommodationName] = useState<string>(accommodationOptions[1].name)
  const [groupSize, setGroupSize] = useState(4)
  const [nights, setNights] = useState(4)
  const [rounds, setRounds] = useState(3)
  const [greenFeePerRound, setGreenFeePerRound] = useState(135)
  const [driverDailyRate, setDriverDailyRate] = useState(140)
  const [driverDays, setDriverDays] = useState(5)
  const [dieselTotal, setDieselTotal] = useState(180)
  const [transferExtrasTotal, setTransferExtrasTotal] = useState(120)
  const [adminBufferTotal, setAdminBufferTotal] = useState(90)
  const [profitPerPerson, setProfitPerPerson] = useState(125)
  const [hasAcceptedCookies, setHasAcceptedCookies] = useState(true)
  const [isFooterInView, setIsFooterInView] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [adminAccessCode, setAdminAccessCode] = useState('')
  const [loginError, setLoginError] = useState('')
  const footerRef = useRef<HTMLElement | null>(null)
  const whatsAppHref = footerSocialLinks.find((link) => link.label === 'WhatsApp')?.href ?? 'https://www.whatsapp.com/'

  const selectedAccommodation =
    accommodationOptions.find((option) => option.name === selectedAccommodationName) ?? accommodationOptions[1]

  const pricingSummary = useMemo(() => {
    const accommodationPerPerson = selectedAccommodation.pricePerPersonPerNight * nights
    const golfPerPerson = greenFeePerRound * rounds
    const driverTotal = driverDailyRate * driverDays
    const transferPoolTotal = driverTotal + dieselTotal + transferExtrasTotal + adminBufferTotal
    const transferPerPerson = transferPoolTotal / Math.max(groupSize, 1)
    const hardCostPerPerson = accommodationPerPerson + golfPerPerson + transferPerPerson
    const sellPricePerPerson = hardCostPerPerson + profitPerPerson
    const hardCostForGroup = hardCostPerPerson * groupSize
    const revenueForGroup = sellPricePerPerson * groupSize
    const totalProfit = profitPerPerson * groupSize
    const marginPercent = revenueForGroup === 0 ? 0 : (totalProfit / revenueForGroup) * 100

    return {
      accommodationPerPerson,
      golfPerPerson,
      driverTotal,
      transferPoolTotal,
      transferPerPerson,
      hardCostPerPerson,
      sellPricePerPerson,
      hardCostForGroup,
      revenueForGroup,
      totalProfit,
      marginPercent
    }
  }, [
    adminBufferTotal,
    dieselTotal,
    driverDailyRate,
    driverDays,
    greenFeePerRound,
    groupSize,
    nights,
    profitPerPerson,
    rounds,
    selectedAccommodation.pricePerPersonPerNight,
    transferExtrasTotal
  ])

  const handleAcceptCookies = () => {
    localStorage.setItem('gsol-cookie-banner-dismissed', 'true')
    setHasAcceptedCookies(true)
  }

  const handleSelectAccommodation = (name: string) => {
    setSelectedAccommodationName(name)
  }

  const handleUnlockAdminPage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (adminAccessCode.trim() !== adminAccessKey) {
      setLoginError('Incorrect admin access code')
      return
    }

    sessionStorage.setItem(adminSessionStorageKey, 'true')
    setLoginError('')
    setIsUnlocked(true)
  }

  useEffect(() => {
    const dismissed = localStorage.getItem('gsol-cookie-banner-dismissed')
    setHasAcceptedCookies(dismissed === 'true')
  }, [])

  useEffect(() => {
    setIsUnlocked(sessionStorage.getItem(adminSessionStorageKey) === 'true')
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

  if (!isUnlocked) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-forest-950 px-6 pb-16 pt-32 text-white">
        <Navbar links={packagePageLinks} primaryCta="Admin access" />
        <PageIdentityBar
          label="Admin Package Studio"
          eyebrow="Internal page"
          description="Protected pricing workspace for building premium golf packages, checking margins, and shaping quotes with confidence."
          offsetHeader
        />
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-base font-semibold uppercase tracking-[0.18em] text-gold-200 drop-shadow-[0_4px_18px_rgba(8,27,8,0.35)] md:text-lg">
              Protected pricing studio
            </p>
            <h1 className="mt-4 max-w-2xl font-display text-5xl font-black leading-none tracking-tight text-white md:text-7xl">
              Admin package calculator for internal pricing and margin checks
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/68 md:text-base">
              This is the internal version of the package page. Use it to price accommodation, golf, driver cost, diesel, and margin before publishing numbers to customers.
            </p>
          </div>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-6 shadow-soft backdrop-blur-md md:p-8"
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-300">Admin login</p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white">Unlock the internal package page</h2>
            <p className="mt-3 text-base leading-7 text-white/72">
              Enter your admin access code to open the private pricing studio.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleUnlockAdminPage}>
              <label className="block">
                <span className="mb-2 block text-base font-medium text-white/80">Access code</span>
                <input
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3.5 text-lg text-white outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-300/30"
                  onChange={(event) => {
                    setAdminAccessCode(event.target.value)
                    if (loginError) {
                      setLoginError('')
                    }
                  }}
                  placeholder="Enter admin code"
                  type="password"
                  value={adminAccessCode}
                />
              </label>

              {loginError ? <p className="text-base text-[#f7a24f]">{loginError}</p> : null}

              <div className="flex flex-wrap gap-3">
                <button
                  className="inline-flex items-center justify-center rounded-full bg-gold-400 px-6 py-3.5 text-base font-semibold text-forest-950 transition-colors hover:bg-gold-300"
                  type="submit"
                >
                  Unlock admin page
                </button>
                <a
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-base font-semibold text-white/82 transition-colors hover:bg-white/10"
                  href="/packages"
                >
                  Go to customer packages
                </a>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-hidden bg-offwhite">
      <Navbar links={packagePageLinks} primaryCta="Make Enquiry" />
      <FloatingWhatsAppButton hidden={isFooterInView} href={whatsAppHref} />
      <CookieBanner hidden={hasAcceptedCookies} onAccept={handleAcceptCookies} />
      <PageIdentityBar
        label="Admin Package Studio"
        eyebrow="Internal page"
        description="Live pricing, clearer inputs, and margin visibility for package planning."
        offsetHeader
      />

      <main>
        <section className="relative min-h-screen overflow-hidden bg-forest-900 px-6 pb-28 pt-24 md:pt-28" id="home">
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

          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <p className="mb-4 text-[1.05rem] font-semibold uppercase tracking-[0.12em] text-gold-200 md:text-[1.16rem]">
                Costa del Sol package pricing for Irish golf groups
              </p>
              <h1 className="max-w-3xl font-display text-5xl font-black leading-[1.02] tracking-[-0.015em] text-white md:text-7xl lg:text-[5.2rem]">
                Build packages that feel premium and still protect your margin
              </h1>
              <p className="mt-5 max-w-2xl text-[1.32rem] font-medium leading-9 text-white/86 md:text-[1.48rem]">
                Price the stay, the golf, the driver, the diesel, and the profit properly before you ever send the quote.
              </p>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 md:text-[1.08rem]">
                This package page is built for smaller Irish groups heading to the Costa del Sol. It keeps the visual tone of the main site, but gives you a cleaner way to shape real packages and quote with confidence.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <LuxuryButton href="#pricing" showArrow>
                  Shape the trip properly
                </LuxuryButton>
                <LuxuryButton href="#packages" variant="outline">
                  View package ideas
                </LuxuryButton>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <HeroStat label="Packages tuned for 4-8 golfers" value="4-8" />
                <HeroStat label="Driver and diesel already counted" value="100%" />
                <HeroStat label="Profit shown before you quote" value="EUR" />
              </div>
            </motion.div>

            <RouteMapShowcase />
          </div>
        </section>

        <section className="section-shell bg-white pb-24" id="packages">
          <div className="section-inner">
            <SectionHeader
              body="Three strong package directions to start with. Each one is shaped around smaller Irish groups, cleaner logistics, and a quote that still leaves room for profit."
              kicker="Package ideas"
              title="Packages that look polished on the page and make sense in the numbers"
            />

            <div className="grid gap-6 lg:grid-cols-3">
              {packageOptions.map((option) => (
                <motion.article
                  key={option.name}
                  className="group relative overflow-hidden rounded-[2rem] border border-forest-100 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(247,244,237,0.94))] p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  {...revealUp}
                >
                  <div aria-hidden="true" className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(220,88,1,0.14),transparent_72%)]" />
                  <div className="relative z-10 flex h-full flex-col">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex rounded-full border border-gold-200 bg-gold-50 px-3 py-1.5 text-sm font-semibold uppercase tracking-[0.12em] text-forest-950">
                          {option.label}
                        </span>
                        <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-forest-900">{option.name}</h2>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-forest-900/40">From</p>
                        <p className="mt-2 font-display text-3xl font-bold text-forest-900">{formatEuro(option.price)} pp</p>
                      </div>
                    </div>

                    <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-forest-100 bg-white/85 px-3 py-1.5 text-sm text-forest-900/64">
                      <CalendarRange className="h-3.5 w-3.5 text-gold-500" aria-hidden="true" />
                      <span>{option.duration}</span>
                    </div>

                    <p className="text-base leading-relaxed text-forest-900/68">{option.summary}</p>

                    <div className="mt-6 space-y-3 rounded-[1.5rem] border border-forest-100 bg-white/72 p-4">
                      {option.includes.map((item) => (
                        <div key={item} className="flex items-center gap-3 text-[0.98rem] text-forest-900/74">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-gold-500" aria-hidden="true" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-6">
                      <LuxuryButton className="w-full justify-center" href="#enquire">
                        Enquire on this format
                      </LuxuryButton>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell bg-[#f7f4ed] py-24" id="stays">
          <div className="section-inner">
            <SectionHeader
              body="These accommodation levels are priced per person, per night, so you can quickly shape the stay side of the package before adding golf, transport, and profit."
              kicker="Accommodation"
              title="Accommodation prices per person that can drop straight into the quote"
            />

            <div className="grid gap-6 lg:grid-cols-3">
              {accommodationOptions.map((option) => {
                const isSelected = option.name === selectedAccommodation.name

                return (
                  <motion.button
                    key={option.name}
                    aria-label={`Use ${option.name} pricing in the package calculator`}
                    className={cx(
                      'group overflow-hidden rounded-[2rem] border p-7 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
                      isSelected
                        ? 'border-gold-300 bg-forest-900 text-white'
                        : 'border-forest-100 bg-white text-forest-900'
                    )}
                    onClick={() => handleSelectAccommodation(option.name)}
                    type="button"
                    {...revealUp}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className={cx('text-sm font-semibold uppercase tracking-[0.12em]', isSelected ? 'text-gold-300' : 'text-forest-900')}>
                          {option.area}
                        </p>
                        <h3 className="mt-3 font-display text-3xl font-bold tracking-tight">{option.name}</h3>
                      </div>
                      <BedDouble className={cx('h-8 w-8', isSelected ? 'text-gold-300' : 'text-gold-500')} aria-hidden="true" />
                    </div>

                    <div className="mt-6 rounded-[1.5rem] border border-current/10 bg-current/5 p-4">
                        <p className={cx('text-sm font-semibold uppercase tracking-[0.12em]', isSelected ? 'text-white' : 'text-forest-900/62')}>
                        Per person / per night
                      </p>
                      <p className="mt-2 font-display text-4xl font-bold">{formatEuro(option.pricePerPersonPerNight)}</p>
                    </div>

                    <p className={cx('mt-5 text-base leading-relaxed', isSelected ? 'text-white/76' : 'text-forest-900/68')}>{option.summary}</p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {option.perks.map((perk) => (
                        <span
                          key={perk}
                          className={cx(
                            'rounded-full border px-3 py-1.5 text-sm',
                            isSelected ? 'border-white/12 bg-white/8 text-white' : 'border-forest-200 bg-forest-900 text-white'
                          )}
                        >
                          {perk}
                        </span>
                      ))}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </section>

        <section className="section-shell bg-white py-24" id="pricing">
          <div className="section-inner">
            <SectionHeader
              body="This is the part that keeps the quote honest. Shape the stay, add the golf, account for driver wages and diesel, then layer on the profit you want before the number goes to the client."
              kicker="Pricing studio"
              title="Shape the trip properly"
            />

            <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
              <motion.div className="rounded-[2rem] border border-forest-100 bg-[#f7f4ed] p-6 shadow-sm md:p-7" {...revealUp}>
                <div className="mb-6 flex flex-wrap gap-3">
                  {planningPoints.map((item) => (
                    <span key={item} className="rounded-full border border-white/80 bg-white px-3 py-1.5 text-sm text-forest-900/68 shadow-sm">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <PricingInput
                    description="Smaller Irish group pricing sweet spot"
                    label="Group size"
                    max={8}
                    min={4}
                    onChange={setGroupSize}
                    step={1}
                    value={groupSize}
                  />
                  <PricingInput
                    description="How many nights the group is staying"
                    label="Nights"
                    max={10}
                    min={2}
                    onChange={setNights}
                    step={1}
                    value={nights}
                  />
                  <PricingInput
                    description="Rounds included in the package"
                    label="Rounds"
                    max={6}
                    min={1}
                    onChange={setRounds}
                    step={1}
                    value={rounds}
                  />
                  <PricingInput
                    description="Average green fee cost per round"
                    label="Green fee per round"
                    min={50}
                    onChange={setGreenFeePerRound}
                    prefix="EUR"
                    step={5}
                    value={greenFeePerRound}
                  />
                  <PricingInput
                    description="Cost to employ the driver per day"
                    label="Driver daily rate"
                    min={0}
                    onChange={setDriverDailyRate}
                    prefix="EUR"
                    step={10}
                    value={driverDailyRate}
                  />
                  <PricingInput
                    description="How many days you need driver cover"
                    label="Driver days"
                    max={10}
                    min={1}
                    onChange={setDriverDays}
                    step={1}
                    value={driverDays}
                  />
                  <PricingInput
                    description="Whole-trip diesel budget"
                    label="Diesel total"
                    min={0}
                    onChange={setDieselTotal}
                    prefix="EUR"
                    step={10}
                    value={dieselTotal}
                  />
                  <PricingInput
                    description="Airport, local, or late-night transfer extras"
                    label="Transfer extras"
                    min={0}
                    onChange={setTransferExtrasTotal}
                    prefix="EUR"
                    step={10}
                    value={transferExtrasTotal}
                  />
                  <PricingInput
                    description="Admin, buffer, or contingency across the group"
                    label="Admin buffer"
                    min={0}
                    onChange={setAdminBufferTotal}
                    prefix="EUR"
                    step={10}
                    value={adminBufferTotal}
                  />
                  <PricingInput
                    description="Your profit target per golfer"
                    label="Profit per person"
                    min={0}
                    onChange={setProfitPerPerson}
                    prefix="EUR"
                    step={10}
                    value={profitPerPerson}
                  />
                </div>
              </motion.div>

              <motion.div className="rounded-[2rem] border border-white/10 bg-forest-950 p-6 text-white shadow-soft md:p-7" {...revealUp}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-300">Live quote view</p>
                    <h3 className="mt-3 font-display text-4xl font-bold tracking-tight">Simple, detailed, margin-safe</h3>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-base text-white/76">
                    {selectedAccommodation.name}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <SummaryTile icon={BedDouble} label="Accommodation pp" value={formatEuro(pricingSummary.accommodationPerPerson)} />
                  <SummaryTile icon={BadgeEuro} label="Golf pp" value={formatEuro(pricingSummary.golfPerPerson)} />
                  <SummaryTile icon={Bus} label="Driver cost total" value={formatEuro(pricingSummary.driverTotal)} />
                  <SummaryTile icon={CarFront} label="Transfer share pp" value={formatEuro(pricingSummary.transferPerPerson)} />
                </div>

                <div className="mt-6 space-y-3 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <BreakdownRow label="Accommodation cost per person" value={formatEuro(pricingSummary.accommodationPerPerson)} />
                  <BreakdownRow label="Golf cost per person" value={formatEuro(pricingSummary.golfPerPerson)} />
                  <BreakdownRow label="Driver wages total" value={formatEuro(pricingSummary.driverTotal)} />
                  <BreakdownRow label="Diesel total" value={formatEuro(dieselTotal)} />
                  <BreakdownRow label="Transfer extras total" value={formatEuro(transferExtrasTotal)} />
                  <BreakdownRow label="Admin / contingency total" value={formatEuro(adminBufferTotal)} />
                  <BreakdownRow label="Total transport pool" value={formatEuro(pricingSummary.transferPoolTotal)} />
                  <BreakdownRow label="Hard cost per person" strong value={formatEuro(pricingSummary.hardCostPerPerson)} />
                  <BreakdownRow label="Profit per person" value={formatEuro(profitPerPerson)} />
                </div>

                <div className="mt-6 rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(220,88,1,0.18),rgba(253,186,116,0.1),rgba(80,163,45,0.12))] p-[1px]">
                  <div className="rounded-[1.7rem] bg-forest-950/96 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/45">Recommended sell price</p>
                    <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <p className="font-display text-5xl font-black leading-none text-white">{formatEuro(pricingSummary.sellPricePerPerson)}</p>
                        <p className="mt-2 text-base text-white/70">per person for the quote</p>
                      </div>
                      <div className="rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-3 text-base text-white/76">
                        Margin {pricingSummary.marginPercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <MiniSummaryCard label="Group hard cost" value={formatEuro(pricingSummary.hardCostForGroup)} />
                  <MiniSummaryCard label="Group revenue" value={formatEuro(pricingSummary.revenueForGroup)} />
                  <MiniSummaryCard label="Total profit" value={formatEuro(pricingSummary.totalProfit)} />
                  <MiniSummaryCard label="Room rate used" value={`${formatEuro(selectedAccommodation.pricePerPersonPerNight)} / night`} />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="section-shell bg-forest-900 py-24" id="enquire">
          <div className="absolute top-0" id="plan-trip" />
          <div aria-hidden="true" className="absolute left-[-80px] top-[10%] h-72 w-72 rounded-full bg-gold-300/12 blur-3xl" />
          <div aria-hidden="true" className="absolute bottom-[-60px] right-[-30px] h-72 w-72 rounded-full bg-gold-400/12 blur-3xl" />

          <div className="section-inner">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.92fr] lg:items-center">
              <div>
                <AnimatedStepKicker className="mb-3" dark kicker="Make the enquiry" />
                <h2 className="max-w-2xl font-display text-4xl font-bold leading-tight text-white md:text-5xl">
                  Use the calculator to protect the margin, then send a package enquiry with confidence
                </h2>
                <p className="mt-5 max-w-xl text-base leading-8 text-white/72 md:text-lg">
                  Flights are not included. The page is focused on the parts you control: accommodation, golf, driver support, diesel, routing, and the number you need to make the trip worthwhile.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <LuxuryButton href={whatsAppHref} rel="noreferrer" target="_blank">
                    WhatsApp enquiry
                  </LuxuryButton>
                  <LuxuryButton href="mailto:info@golfsolirl.com" variant="outline">
                    Email package request
                  </LuxuryButton>
                </div>
              </div>

              <motion.div
                className="rounded-[2rem] border border-white/10 bg-white/6 p-6 text-white backdrop-blur-sm"
                {...revealUp}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-300">What this page already solves</p>
                <div className="mt-5 space-y-4">
                  {[
                    'Gives you a clean starting price per person',
                    'Makes sure driver wages and diesel are not forgotten',
                    'Shows the profit before the quote is sent',
                    'Keeps the package looking premium instead of cheap or patchy'
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 text-base text-white/80">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden="true" />
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
        copyrightNote="Package planning and pricing for Irish golf groups travelling to the Costa del Sol."
        footerRef={footerRef}
        intro="Golf Sol Ireland creates premium Costa del Sol golf packages for Irish groups who want better planning, smarter pricing, and a smoother trip from first enquiry to final round."
      />
    </div>
  )
}

function RouteMapShowcase() {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="relative"
      initial={{ opacity: 0, y: 36 }}
      transition={{ delay: 0.18, duration: 0.85, ease: 'easeOut' }}
    >
      <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))] p-5 shadow-soft backdrop-blur-md md:p-7">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(80,163,45,0.22),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(220,88,1,0.22),transparent_22%),radial-gradient(circle_at_70%_70%,rgba(253,186,116,0.16),transparent_26%)]" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.06),transparent_32%,transparent_68%,rgba(255,255,255,0.04))]" />

        <div className="relative z-10 grid gap-6 md:grid-cols-[0.9fr_1.2fr]">
          <div className="space-y-3">
            {routeOrigins.map((route, index) => (
              <motion.div
                key={route.title}
                animate={{ x: [0, 6, 0] }}
                className="rounded-[1.6rem] border border-white/10 bg-forest-950/58 p-4 text-white shadow-lg backdrop-blur-sm"
                transition={{ delay: index * 0.24, duration: 4.4, ease: 'easeInOut', repeat: Infinity }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-forest-950 shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
                    <ShamrockIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-base font-semibold">{route.title}</p>
                    <p className="text-sm leading-relaxed text-white/62">{route.note}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="relative min-h-[24rem] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:44px_44px] opacity-25" />

            <motion.div
              animate={{ scale: [1, 1.04, 1], opacity: [0.32, 0.42, 0.32] }}
              className="absolute left-[14%] top-[18%] h-16 w-16 rounded-full border border-white/18"
              transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity }}
            />

            <svg aria-hidden="true" className="absolute inset-0 h-full w-full" fill="none" viewBox="0 0 560 420">
              <defs>
                <linearGradient id="package-route-line" x1="60" x2="500" y1="120" y2="280">
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
                stroke="url(#package-route-line)"
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

            <div className="absolute left-[8%] top-[9%] rounded-[1.4rem] border border-gold-300/26 bg-forest-950/76 px-4 py-3 text-white backdrop-blur-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold-300">Departing from Ireland</p>
              <p className="mt-2 text-base font-semibold">Smaller golf groups</p>
            </div>

            <div className="absolute bottom-[11%] right-[8%] rounded-[1.5rem] border border-[#dc5801]/26 bg-forest-950/62 px-4 py-4 text-white backdrop-blur-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f7a24f]">Costa del Sol arrival</p>
              <p className="mt-2 text-base font-semibold">Hotel, golf, driver, quote</p>
              <p className="mt-1 text-sm text-white/60">All costed before you sell it</p>
            </div>

            <div className="absolute right-[12%] top-[12%] rounded-[1.25rem] border border-white/10 bg-white/8 px-4 py-3 text-white backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-gold-300">
                <BadgeEuro className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Profit protected</span>
              </div>
              <p className="mt-2 text-base text-white/76">Quote the full trip, not just the obvious bits</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function HeroStat({ value, label }: { readonly value: string; readonly label: string }) {
  return (
    <div className="min-w-[110px] rounded-[1.6rem] border border-white/10 bg-white/6 px-4 py-4 backdrop-blur-sm">
      <p className="font-display text-[2rem] font-bold text-gold-300">{value}</p>
      <p className="mt-1 text-sm leading-relaxed text-white/62">{label}</p>
    </div>
  )
}

function PricingInput({
  label,
  description,
  value,
  onChange,
  min,
  max,
  step,
  prefix
}: {
  readonly label: string
  readonly description: string
  readonly value: number
  readonly onChange: (value: number) => void
  readonly min?: number
  readonly max?: number
  readonly step?: number
  readonly prefix?: string
}) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value)

    if (Number.isNaN(nextValue)) {
      return
    }

    onChange(nextValue)
  }

  return (
    <label className="rounded-[1.5rem] border border-forest-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-forest-900">{label}</p>
          <p className="mt-1 text-sm leading-relaxed text-forest-900/56">{description}</p>
        </div>
        {prefix ? <span className="rounded-full bg-gold-50 px-2.5 py-1 text-sm font-semibold uppercase text-forest-950">{prefix}</span> : null}
      </div>
      <input
        className="mt-4 w-full rounded-2xl border border-forest-100 bg-offwhite px-4 py-3 text-base font-semibold text-forest-900 outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-200"
        max={max}
        min={min}
        onChange={handleChange}
        step={step}
        type="number"
        value={value}
      />
    </label>
  )
}

function SummaryTile({
  icon: Icon,
  label,
  value
}: {
  readonly icon: typeof BedDouble
  readonly label: string
  readonly value: string
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-forest-950 shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.1em] text-white/76">{label}</p>
          <p className="mt-1 text-xl font-semibold text-white">{value}</p>
        </div>
      </div>
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
    <div className={cx('flex items-center justify-between gap-4 border-b border-white/8 pb-3 text-base', strong && 'pt-2')}>
      <span className={cx(strong ? 'font-semibold text-white' : 'text-white/68')}>{label}</span>
      <span className={cx('text-right', strong ? 'font-semibold text-gold-300' : 'text-white')}>{value}</span>
    </div>
  )
}

function MiniSummaryCard({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
      <p className="text-sm font-semibold uppercase tracking-[0.1em] text-white/74">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  )
}

export function FloatingWhatsAppButton({
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

export function CookieBanner({
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

export const formatEuro = (value: number) =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value)

export { PackageAdminPage }
