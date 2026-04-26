import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, LoaderCircle } from 'lucide-react'
import { PdfSiteShell } from '../components/pdf-site-shell'
import { PageIdentityBar } from '../components/page-identity-bar'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import { saveElementAsPdf } from '../lib/save-element-as-pdf'
import { useAuth } from '../providers/auth-provider'

type DocumentVariant = 'terms' | 'welcome'

const resolveVariant = (): DocumentVariant => {
  const path = window.location.pathname.replace(/\/+$/, '')
  if (path.endsWith('welcome')) {
    return 'welcome'
  }

  return 'terms'
}

export function ClientDocumentPage() {
  const { session, isLoading: authLoading } = useAuth()
  const variant = useMemo(() => resolveVariant(), [])
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'saving' | 'error'>('idle')
  const [pdfMessage, setPdfMessage] = useState<string | null>(null)
  const [accessGate, setAccessGate] = useState<'loading' | 'denied' | 'ok'>('loading')

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!session?.user) {
      const next = encodeURIComponent(window.location.pathname)
      window.location.replace(`/login?next=${next}`)
      return
    }

    const kind = variant === 'welcome' ? 'welcome' : 'terms'

    const run = async () => {
      const supabase = getSupabaseBrowserClient()

      if (!supabase) {
        setAccessGate('denied')
        return
      }

      const { data, error } = await supabase
        .from('client_document_access')
        .select('id')
        .eq('owner_id', session.user.id)
        .eq('document_kind', kind)
        .maybeSingle()

      if (error || !data) {
        setAccessGate('denied')
        return
      }

      setAccessGate('ok')
    }

    void run()
  }, [authLoading, session?.user?.id, variant])

  const meta = useMemo(() => {
    if (variant === 'welcome') {
      return {
        title: 'Thank you for choosing Golf Sol Ireland',
        filename: 'golf-sol-ireland-thank-you',
        kicker: 'A note from our team'
      }
    }

    return {
      title: 'Terms & conditions',
      filename: 'golf-sol-ireland-terms-and-conditions',
      kicker: 'Important information'
    }
  }, [variant])

  const handleSavePdf = async () => {
    const node = rootRef.current
    if (!node) {
      return
    }

    try {
      setPdfStatus('saving')
      setPdfMessage(null)
      await saveElementAsPdf(node, meta.filename)
      setPdfMessage('PDF saved.')
      setPdfStatus('idle')
    } catch (e) {
      setPdfMessage(e instanceof Error ? e.message : 'Could not create PDF.')
      setPdfStatus('error')
    }
  }

  if (authLoading || accessGate === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-offwhite px-6">
        <p className="text-sm font-medium text-forest-700">Checking access…</p>
      </div>
    )
  }

  if (accessGate === 'denied') {
    return (
      <div className="min-h-screen bg-offwhite px-6 py-16 text-forest-900">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="font-display text-[2.1rem] font-semibold text-forest-950 md:text-[2.35rem]">This document is not shared with your account</h1>
          <p className="mt-4 text-base leading-8 text-forest-600 md:text-[1.05rem]">
            Golf Sol Ireland enables the terms and thank-you PDFs from the admin dashboard. Once we email you access, the link
            will appear on your client dashboard after you sign in.
          </p>
          <a
            className="mt-8 inline-flex text-base font-semibold text-gold-600 underline-offset-2 hover:text-gold-700 hover:underline"
            href="/dashboard"
          >
            Back to your dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#eef2eb] pdf-page-shell">
      <PageIdentityBar
        label={meta.title}
        eyebrow={meta.kicker}
        description="Read, save, and keep a clean PDF copy from your dashboard."
        compact
      />
      <div
        className="mx-auto mb-6 max-w-7xl px-4 pt-6 md:px-8 pdf-screen-only"
        data-html2canvas-ignore="true"
      >
        <div className="flex flex-wrap items-center gap-3">
          <button
            aria-label="Save as PDF"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-forest-900 px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 disabled:opacity-70"
            disabled={pdfStatus === 'saving'}
            onClick={handleSavePdf}
            type="button"
          >
            {pdfStatus === 'saving' ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
            {pdfStatus === 'saving' ? 'Preparing PDF…' : 'Save PDF'}
          </button>
          <a
            className="text-base font-semibold text-gold-600 underline-offset-2 hover:text-gold-700 hover:underline"
            href="/dashboard"
          >
            Back to dashboard
          </a>
          {pdfMessage ? (
            <p className="text-base text-forest-700" role="status">
              {pdfMessage}
            </p>
          ) : null}
        </div>
      </div>

      <div ref={rootRef} className="mx-auto max-w-7xl px-4 pb-10 md:px-8">
        <PdfSiteShell>
          <main className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
            {variant === 'terms' ? <TermsBody kicker={meta.kicker} title={meta.title} /> : <WelcomeBody kicker={meta.kicker} title={meta.title} />}
          </main>
        </PdfSiteShell>
      </div>
    </div>
  )
}

const termsClauses = [
  {
    title: '1. Who we are and what we arrange',
    body:
      'Golf Sol Ireland arranges Costa del Sol golf travel services for Irish groups, including golf course bookings, accommodation introductions or reservations, airport transfers, itinerary planning and related concierge support. Unless we expressly state otherwise in writing, we act as a booking coordinator and disclosed agent for third-party suppliers rather than the owner or operator of hotels, golf courses, transport companies, airlines or resorts.',
    points: [
      'We use reasonable care and skill when preparing quotes, requesting reservations and passing information between you and suppliers.',
      'The actual delivery of hotel stays, golf rounds, buggies, transfers and venue services remains the responsibility of the relevant supplier.',
      'Flights are not arranged by Golf Sol Ireland unless a written proposal specifically says otherwise.'
    ]
  },
  {
    title: '2. Quotes, availability and confirmation',
    body:
      'Quotes are based on the information supplied by you and availability/pricing available to us at the time. A quote is not a confirmed booking. A booking becomes confirmed only when we confirm in writing that the relevant supplier space has been secured and the required payment has been received.',
    points: [
      'Prices, tee times, room types, transfer costs and package inclusions can change before written confirmation.',
      'Once your deposit is accepted and the booking is confirmed, we will not change the Golf Sol Ireland package price unless taxes, supplier charges, group numbers or requested itinerary changes alter the confirmed arrangement.',
      'If a supplier cannot confirm part of your requested trip, we may offer alternatives; you are not obliged to accept an alternative unless you approve it in writing.'
    ]
  },
  {
    title: '3. Deposit and balance payment',
    body:
      'Unless your proposal states a different written payment schedule, a 20% deposit is payable upfront to proceed with the booking and the remaining 80% balance is due within five days of booking confirmation. Bookings close to travel may require full payment immediately.',
    points: [
      'The 20% deposit is used to secure supplier space and cover administration, planning and booking work.',
      'If you cancel within 48 hours of paying the deposit, the deposit will be refunded provided we have not already committed non-refundable supplier costs on your instruction.',
      'After 48 hours, the 20% deposit is non-refundable. Balance payments may also become non-refundable to the extent suppliers have applied charges or released no refund terms.',
      'If the balance is not paid on time, suppliers may release rooms, tee times or vehicles. We will try to warn you, but we cannot guarantee availability after missed payment deadlines.'
    ]
  },
  {
    title: '4. Cancellations by you',
    body:
      'If you need to cancel, tell us in writing immediately. We will then check the supplier rules that apply to your hotel, golf, transport and package elements and will try to reduce loss where possible.',
    points: [
      'Cancellations made within 48 hours of deposit payment qualify for a deposit refund unless non-refundable supplier costs have already been committed.',
      'Cancellations after 48 hours may result in loss of the 20% deposit plus any supplier cancellation charges, no-show fees or non-refundable balances.',
      'Any refund depends on the rules of the hotels, golf courses, transport providers and other suppliers used for your booking.',
      'Travel insurance should be your first protection for illness, flight disruption, family emergencies, injury, bereavement or other cancellation reasons.'
    ]
  },
  {
    title: '5. Reductions in group numbers and itinerary changes',
    body:
      'Group prices are normally based on the number of travellers, golfers, rooms, vehicles, tee times and nights requested. If numbers reduce, the cost for remaining travellers may increase because fixed costs are shared by fewer people and some suppliers remove group discounts.',
    points: [
      'Name changes, room changes, golf changes and transfer changes are subject to supplier approval.',
      'We will help modify a booking where possible, but any supplier fees, rate increases or lost discounts are payable by the group.',
      'The group organiser is responsible for collecting accurate names, dates, flight details, room requirements, golf handicaps and other information from travellers.'
    ]
  },
  {
    title: '6. Hotels and accommodation failures',
    body:
      'Accommodation is provided by third-party hotels, resorts, apartments or accommodation suppliers. We are not responsible for their acts, omissions, overbooking, maintenance failures, room allocation decisions, service issues, facility closures, staffing problems or changes to amenities.',
    points: [
      'If an accommodation provider fails to deliver the confirmed service, we will assist with escalation and, where practical, seek an alternative or supplier remedy.',
      'Room views, adjoining rooms, floors, bed types and special requests are never guaranteed unless the supplier confirms them as guaranteed in writing.',
      'Local taxes, deposits, city charges, resort rules and damage policies may be payable locally where applied by the accommodation provider.'
    ]
  },
  {
    title: '7. Golf course bookings, tee times and buggies',
    body:
      'Golf courses control their own tee sheets, course condition, buggy rules, dress codes, handicap requirements, pace-of-play decisions, grouping, closures and refund policies. We cannot guarantee that a course will never alter a tee time, pairing, buggy allocation or operational rule.',
    points: [
      'If a golf course changes a tee time, we will try to minimise disruption and adjust the wider itinerary where possible.',
      'If a course officially closes because of weather or course conditions, the available remedy is the refund, credit, voucher or replacement round offered by that course.',
      'If the course remains open and your group does not attend, the round will normally be treated as a no-show and charged in full.',
      'Buggy inclusion varies by course and by even/odd player numbers. Extra buggies may need to be paid locally and are subject to availability.'
    ]
  },
  {
    title: '8. Transfers, flight delays and missed services',
    body:
      'Transfers are delivered by licensed third-party transport providers. We request vehicles suitable for the group details supplied, including golf bags where notified, but the transport provider is responsible for vehicle operation and driver performance.',
    points: [
      'You must provide accurate flight numbers, arrival times, collection points, passenger numbers and luggage/golf bag details.',
      'Late passengers, incorrect flight details, missed flights, excessive waiting time or last-minute changes may create extra charges.',
      'If a supplier vehicle issue occurs, we will assist with replacement arrangements where practical, but we are not liable for the transport provider’s failure beyond any remedy legally recoverable from that provider.'
    ]
  },
  {
    title: '9. Supplier responsibility and limitation of liability',
    body:
      'Golf Sol Ireland is not liable for mistakes, failures, delays, cancellations, overbooking, negligence or service issues caused by hotels, accommodation providers, golf courses, transport providers, airlines, restaurants, venues or other third-party suppliers. We remain responsible only for our own proven failure to use reasonable care and skill in arranging the services.',
    points: [
      'We are not liable for indirect loss, loss of enjoyment, loss of profit, consequential loss, missed flights, unused services, personal decisions not to travel, or costs not approved by us in advance.',
      'Where Golf Sol Ireland is legally liable, our liability is limited to the amount paid to us for the affected service, except where Irish law does not allow such a limitation.',
      'Nothing in these terms excludes liability for fraud, deliberate wrongdoing, death or personal injury caused by negligence, or any rights that cannot legally be excluded.'
    ]
  },
  {
    title: '10. Force majeure and events outside our control',
    body:
      'We are not liable for events outside our reasonable control, including severe weather, natural disaster, strike, airport disruption, flight cancellation, war, civil unrest, terrorism, pandemic, government restriction, supplier insolvency, utility failure, course closure or emergency safety decisions.',
    points: [
      'In these cases, supplier terms and available remedies will apply.',
      'We will try to help rearrange the affected parts of the trip, but extra costs may be payable by the group.',
      'Travel insurance is essential for disruption outside any company’s control.'
    ]
  },
  {
    title: '11. Behaviour, damage and local rules',
    body:
      'Travellers must behave respectfully towards hotel staff, drivers, golf course staff, other guests and local residents. Suppliers may refuse service or remove guests for unsafe, abusive, intoxicated, destructive or unlawful behaviour.',
    points: [
      'No refund is due where a supplier refuses service because of traveller misconduct.',
      'The group is responsible for damage, fines, cleaning charges, lost keys, buggy damage or other costs caused by its members.',
      'Golf dress codes, handicap rules, buggy safety rules and hotel house rules must be followed.'
    ]
  },
  {
    title: '12. Questions and written terms',
    body:
      'These terms should be read with your written quote, invoice, confirmation email and any supplier-specific terms we send you. If there is a conflict, supplier-specific terms or the written proposal for your trip may apply to that specific service.',
    points: [
      'Ask us to explain anything before paying a deposit.',
      'Keep copies of your proposal, confirmation, payment records and travel insurance documents.',
      'These terms are drafted for practical clarity and should be reviewed by a qualified solicitor for formal legal reliance.'
    ]
  }
] as const

function TermsBody({ kicker, title }: { readonly kicker: string; readonly title: string }) {
  return (
    <article className="rounded-[2rem] border border-forest-100 bg-white p-8 shadow-soft md:p-12">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">{kicker}</p>
      <h1 className="font-display mt-3 text-3xl font-bold text-forest-950 md:text-4xl">{title}</h1>
      <p className="mt-4 text-sm leading-relaxed text-forest-600">
        Plain-language booking terms for Golf Sol Ireland groups. They explain deposits, balance payments, cancellations,
        supplier responsibility, hotel issues, golf course changes, transfers and the limits of our liability where another
        company controls the service.
      </p>

      <div className="mt-10 space-y-8">
        {termsClauses.map((clause) => (
          <section key={clause.title} className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-forest-900">{clause.title}</h2>
            <p className="text-sm leading-relaxed text-forest-700">{clause.body}</p>
            <ul className="space-y-2.5">
              {clause.points.map((point) => (
                <li key={point} className="flex gap-3 text-sm leading-relaxed text-forest-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-gold-200/60 bg-gold-50/40 p-6">
        <h2 className="font-display text-xl font-semibold text-forest-900">Important legal note</h2>
        <p className="mt-3 text-sm leading-relaxed text-forest-700">
          This document is a practical business draft for customer clarity. Before relying on it as your final enforceable
          terms, have an Irish solicitor review it against your exact business model, licensing position, insurance cover and
          supplier contracts.
        </p>
      </section>

      <p className="mt-10 text-xs text-forest-500">Last updated {new Date().toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
    </article>
  )
}

function WelcomeBody({ kicker, title }: { readonly kicker: string; readonly title: string }) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-soft">
      <div className="bg-gradient-to-br from-forest-950 via-forest-900 to-[#0f2a0c] px-8 py-10 text-white md:px-12 md:py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-300">{kicker}</p>
        <h1 className="font-display mt-4 max-w-xl text-[2.35rem] font-bold leading-[1.02] tracking-[-0.03em] md:text-[3rem]">{title}</h1>
        <p className="mt-5 max-w-lg text-base leading-8 text-white/78">
          You did not choose the nearest brochure — you chose a crew who lose sleep over tee sheets so you do not have to.
        </p>
      </div>

      <div className="space-y-8 px-8 py-10 md:px-12 md:py-12">
        <p className="font-display text-[1.25rem] font-semibold leading-8 text-forest-800 md:text-[1.4rem]">
          “From the first handshake in Ireland to the last putt in the Spanish sun — thank you for trusting us with your
          trip.”
        </p>

        <div className="space-y-4 text-base leading-8 text-forest-700">
          <p>
            Your dashboard is now home base: saved builds, formal proposals when we issue them, and the documents you need
            along the way.
          </p>
          <p>
            <strong className="text-forest-900">What happens next:</strong> we refine dates, lock the courses that suit your
            handicap mix, and stitch transfers so nobody is left at the airport wondering which coach is theirs.
          </p>
          <p>
            <strong className="text-forest-900">A small promise:</strong> if something can be simpler, clearer, or calmer, we
            will say so — even when it is easier not to.
          </p>
        </div>

        <div className="grid gap-4 rounded-2xl border border-forest-200 bg-white p-6 md:grid-cols-3">
          {[
            { t: 'Courses', d: 'Hand-picked for pace, condition, and the craic in the clubhouse.' },
            { t: 'Stays', d: 'Hotels that understand golfers — early breakfast, club storage, late arrivals.' },
            { t: 'Calm', d: 'One thread, one team — fewer spreadsheets, more fairways.' }
          ].map((item) => (
            <div key={item.t}>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold-600">{item.t}</p>
              <p className="mt-2 text-base leading-7 text-forest-700">{item.d}</p>
            </div>
          ))}
        </div>

        <p className="text-center font-display text-[1.25rem] font-semibold text-forest-900">See you on the Costa del Sol.</p>
        <p className="text-center text-base text-forest-600">— The Golf Sol Ireland team</p>
      </div>
    </article>
  )
}
