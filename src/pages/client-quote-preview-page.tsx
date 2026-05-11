import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LuxuryButton } from '../components/ui/button'
import { BRAND_FLEET_HERO_ALT, BRAND_FLEET_HERO_IMAGE_SRC } from '../lib/brand-visual-assets'
import { addCanvasPagedToPdf } from '../lib/quote-pdf-canvas'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import {
  buildWebsiteFormAdminQuote,
  formatWebsiteFormFieldValueForDisplay,
  getWebsiteFormFieldLabel,
  orderedWebsiteFormFieldEntries,
  parseAnyPackageBuildRowConfig,
  type WebsiteFormPackageConfig
} from '../lib/package-build'
import { COURSES } from '../data/coastal-golf-data'
import { useAuth } from '../providers/auth-provider'

const formatEur = (value: number) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

const vatPct = (rate: number) => `${Math.round(rate * 1000) / 10}%`

const courseById = new Map(COURSES.map((c) => [c.id, c]))

export function ClientQuotePreviewPage() {
  const { session, isLoading } = useAuth()
  const sessionUserId = session?.user?.id
  const [err, setErr] = useState<string | null>(null)
  const [cfg, setCfg] = useState<WebsiteFormPackageConfig | null>(null)
  const [buildLabel, setBuildLabel] = useState<string | null>(null)
  const [pdfBusy, setPdfBusy] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const buildId = useMemo(() => {
    const path = window.location.pathname.replace(/\/+$/, '')
    const parts = path.split('/').filter(Boolean)
    const idx = parts.indexOf('quote')
    if (idx >= 0 && parts[idx + 1]) {
      return parts[idx + 1]
    }
    return ''
  }, [])

  const load = useCallback(async () => {
    if (!sessionUserId || !buildId) {
      setErr(!buildId ? 'Missing quote id in URL.' : 'Sign in required.')
      return
    }
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setErr('Supabase is not configured.')
      return
    }
    const { data, error } = await supabase
      .from('package_builds')
      .select('id, label, config')
      .eq('id', buildId)
      .eq('owner_id', sessionUserId)
      .maybeSingle()

    if (error) {
      setErr(error.message)
      return
    }
    if (!data) {
      setErr('This quote is not on your account or the link is wrong.')
      return
    }
    const parsed = parseAnyPackageBuildRowConfig(data.config)
    if (parsed?.type !== 'website_form' || !parsed.config.adminQuote) {
      setErr('No published quote is available for this package yet.')
      return
    }
    setCfg(parsed.config)
    setBuildLabel(typeof data.label === 'string' ? data.label : null)
  }, [buildId, sessionUserId])

  useEffect(() => {
    if (isLoading || !sessionUserId) {
      return
    }
    void load()
  }, [isLoading, sessionUserId, load])

  const orderedEntries = useMemo(() => {
    if (!cfg) {
      return []
    }
    return orderedWebsiteFormFieldEntries(cfg.fields)
  }, [cfg])

  const portalHotelLegs = useMemo(() => {
    const legs = cfg?.portalTransferPlan?.hotelLegs ?? []
    return legs.filter((l) => l.hotelName.trim().length > 0)
  }, [cfg?.portalTransferPlan?.hotelLegs])

  const portalGolfLegs = useMemo(() => {
    const legs = cfg?.portalTransferPlan?.golfLegs ?? []
    return legs.filter((l) => l.courseId.trim().length > 0)
  }, [cfg?.portalTransferPlan?.golfLegs])

  const handlePdf = async () => {
    const el = printRef.current
    if (!el || !cfg?.adminQuote) {
      return
    }
    setPdfBusy(true)
    try {
      const canvas = await html2canvas(el, {
        scale: 2.75,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#F7F0E2',
        width: el.scrollWidth,
        height: el.scrollHeight,
        windowWidth: el.scrollWidth,
        logging: false
      })
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      addCanvasPagedToPdf(pdf, canvas, 10)
      pdf.save(`golf-sol-quote-${cfg.enquiryReferenceId.replace(/[^\w.-]+/g, '-')}.pdf`)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not build PDF.')
    } finally {
      setPdfBusy(false)
    }
  }

  if (isLoading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F0E2] font-ge text-gs-green">
        <p className="text-base font-semibold">Loading…</p>
      </div>
    )
  }

  if (err || !cfg?.adminQuote) {
    return (
      <div className="ge-page min-h-screen bg-[#F7F0E2] px-5 py-16 text-center text-gs-dark">
        <p className="font-display text-xl font-semibold text-gs-green">{err ?? 'Unavailable'}</p>
        <LuxuryButton className="mt-8" href="/dashboard" variant="outline">
          Back to dashboard
        </LuxuryButton>
      </div>
    )
  }

  const q = cfg.adminQuote
  const quoteLive = buildWebsiteFormAdminQuote(q.grossTotalEur, q.vatRate)

  return (
    <div className="ge-page min-h-screen bg-[#F7F0E2] px-3 py-8 pb-14 font-ge text-gs-dark sm:px-5">
      <div className="mx-auto w-full max-w-[210mm]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 text-base">
          <LuxuryButton href="/dashboard" variant="outline">
            ← Dashboard
          </LuxuryButton>
          <LuxuryButton disabled={pdfBusy} onClick={() => void handlePdf()} type="button" variant="primary">
            {pdfBusy ? 'Preparing PDF…' : 'Download PDF'}
          </LuxuryButton>
        </div>

        <div
          className="overflow-hidden rounded-[1.5rem] border-2 border-[#E9D9B6] bg-white text-[15px] leading-relaxed shadow-[0_28px_80px_rgba(6,59,42,0.14)] ring-1 ring-white/80 sm:text-[16px] sm:leading-relaxed"
          ref={printRef}
        >
          <div className="flex flex-wrap items-center gap-2 border-b-2 border-[#E9D9B6]/90 bg-[#FFFBF3] px-5 py-3.5 sm:px-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-gs-green/25 bg-white px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-gs-green sm:text-[0.72rem]">
              <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Trip quote
            </span>
            <span className="inline-flex rounded-full border border-gs-gold/45 bg-gs-gold/15 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-gs-dark sm:text-[0.72rem]">
              AGP · Costa del Sol
            </span>
          </div>

          <div className="relative border-b-2 border-[#E9D9B6] bg-[#0a2008]">
            <img
              alt={BRAND_FLEET_HERO_ALT}
              className="h-[min(22rem,52vw)] w-full min-h-[14rem] object-cover object-center sm:h-[26rem] md:h-[28rem]"
              decoding="async"
              height={900}
              src={BRAND_FLEET_HERO_IMAGE_SRC}
              width={1400}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a2008] via-[#0a2008]/88 to-transparent px-5 pb-6 pt-20 sm:px-8 sm:pb-8 sm:pt-24">
              <img
                alt="GolfSol Ireland"
                className="h-14 w-auto max-w-[260px] object-contain object-left drop-shadow-[0_6px_20px_rgba(0,0,0,0.45)] sm:h-[4.25rem] md:h-[4.75rem]"
                height={140}
                src="/golfsol-crest.svg"
                width={360}
              />
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.22em] text-gs-gold sm:text-[0.8rem]">
                Irish-owned golf travel
              </p>
              <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-[2.6rem]">
                Your trip quote
              </h1>
              <p className="mt-3 text-base font-semibold text-emerald-50/95 sm:text-lg">
                {buildLabel?.trim() || `Enquiry ${cfg.enquiryReferenceId}`}
              </p>
              <p className="mt-1.5 font-mono text-sm text-white/75 sm:text-base">{cfg.enquiryReferenceId}</p>
            </div>
          </div>

          <div className="h-1.5 w-full bg-gs-gold" aria-hidden />

          <div className="bg-[#F7F0E2]/90 px-5 py-8 sm:px-8 sm:py-10">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-gs-green sm:text-base">Itinerary &amp; request</p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5">
              {orderedEntries.map(([key, val]) => (
                <div
                  className="rounded-2xl border-2 border-[#E9D9B6] bg-white px-4 py-4 shadow-[0_10px_28px_rgba(6,59,42,0.07)] sm:px-5 sm:py-4"
                  key={key}
                >
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#A59D13] sm:text-sm">
                    {getWebsiteFormFieldLabel(key)}
                  </dt>
                  <dd className="mt-2 whitespace-pre-wrap text-base font-semibold leading-snug text-gs-dark sm:text-lg">
                    {formatWebsiteFormFieldValueForDisplay(key, val.trim()).trim() || '—'}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid border-t-2 border-[#E9D9B6] bg-white lg:grid-cols-2 lg:items-stretch">
            <div className="flex flex-col justify-center px-5 py-8 sm:px-8 sm:py-10">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-gs-green sm:text-base">Hotel accommodation</p>
              <p className="mt-3 text-base text-forest-700 sm:text-lg">
                Tell us where you are staying — or pick from the hotels you saved in your portal. We match transfers to
                your base across the Costa del Sol.
              </p>
              {portalHotelLegs.length > 0 ? (
                <ul className="mt-5 space-y-3 rounded-2xl border-2 border-[#E9D9B6] bg-[#FFFBF7] p-4 sm:p-5">
                  {portalHotelLegs.map((leg, i) => (
                    <li className="text-base font-semibold text-gs-dark sm:text-lg" key={`${leg.hotelName}-${String(i)}`}>
                      <span className="text-gs-green">·</span> {leg.hotelName.trim()}
                      {leg.notes.trim() ? (
                        <span className="mt-1 block text-sm font-normal text-forest-600 sm:text-base">{leg.notes.trim()}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 rounded-2xl border border-dashed border-gs-green/35 bg-gs-green/5 px-4 py-4 text-base text-forest-600 sm:text-lg">
                  No hotel saved on your portal yet. Open <strong className="text-gs-dark">Dashboard → Golf &amp; hotel transfers</strong>{' '}
                  to add your base hotel, then download this PDF again.
                </p>
              )}
              {portalGolfLegs.length > 0 ? (
                <div className="mt-8">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-gs-green sm:text-base">Golf-day legs</p>
                  <ul className="mt-3 space-y-2 text-base text-forest-800 sm:text-lg">
                    {portalGolfLegs.map((leg, i) => {
                      const c = courseById.get(leg.courseId.trim())
                      return (
                        <li key={`${leg.courseId}-${String(i)}`}>
                          <span className="font-semibold text-gs-dark">{c?.name ?? leg.courseId}</span>
                          {c?.region ? <span className="text-forest-500"> — {c.region}</span> : null}
                          {leg.notes.trim() ? (
                            <span className="mt-0.5 block text-sm text-forest-600 sm:text-base">{leg.notes.trim()}</span>
                          ) : null}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ) : null}
            </div>
            <div className="relative min-h-[14rem] border-t-2 border-[#E9D9B6] bg-[#0a2008] lg:min-h-0 lg:border-l-2 lg:border-t-0">
              <img
                alt="Mercedes transfer fleet on the Costa del Sol"
                className="h-full min-h-[14rem] w-full object-cover object-center lg:absolute lg:inset-0 lg:min-h-full"
                height={640}
                src="/images/hero-sample-sunny-mercedes-01.png"
                width={960}
              />
            </div>
          </div>

          <div className="border-t-2 border-[#E9D9B6] bg-[#FFF9EA] px-5 py-8 sm:px-8 sm:py-10">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-gs-green sm:text-base">Pricing (Ireland)</p>
            <p className="mt-3 text-base leading-relaxed text-forest-700 sm:text-lg">
              Services shown ex-VAT; Irish VAT at {vatPct(quoteLive.vatRate)} is added to reach the total you pay. Deposit 20% /
              balance 80% of the VAT-inclusive total.
            </p>
            <ul className="mt-6 space-y-4 rounded-2xl border-2 border-[#E9D9B6] bg-white p-5 text-base shadow-[0_12px_32px_rgba(6,59,42,0.06)] sm:p-6 sm:text-lg">
              <li className="flex justify-between gap-4 border-b border-[#E9D9B6]/80 pb-4">
                <span className="text-forest-600">Services (ex VAT)</span>
                <span className="font-bold text-gs-dark">{formatEur(quoteLive.netServicesEur)}</span>
              </li>
              <li className="flex justify-between gap-4 border-b border-[#E9D9B6]/80 pb-4">
                <span className="text-forest-600">VAT ({vatPct(quoteLive.vatRate)})</span>
                <span className="font-bold text-gs-dark">{formatEur(quoteLive.vatAmountEur)}</span>
              </li>
              <li className="flex justify-between gap-4 border-t-2 border-gs-gold/40 pt-4 text-lg sm:text-xl">
                <span className="font-display font-bold text-gs-dark">Total (inc VAT)</span>
                <span className="font-display text-xl font-bold text-gs-green sm:text-2xl">{formatEur(quoteLive.grossTotalEur)}</span>
              </li>
              <li className="flex justify-between gap-4 border-t border-[#E9D9B6]/80 pt-4 text-base sm:text-lg">
                <span className="text-forest-600">Deposit (20%)</span>
                <span className="font-bold text-gs-dark">{formatEur(quoteLive.deposit20Eur)}</span>
              </li>
              <li className="flex justify-between gap-4 text-base sm:text-lg">
                <span className="text-forest-600">Remaining balance</span>
                <span className="font-bold text-gs-dark">{formatEur(quoteLive.balance80Eur)}</span>
              </li>
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-forest-600 sm:text-base">
              Quote saved {new Date(q.savedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}. Subject to
              availability and final confirmation from Golf Sol Ireland.
            </p>
            <p className="mt-5 text-center text-xs font-bold uppercase tracking-[0.14em] text-forest-600 sm:text-sm">
              golfsolirl.com · +353 87 446 4766 · +34 641 81 53 66
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
