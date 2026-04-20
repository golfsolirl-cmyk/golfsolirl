import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, LoaderCircle } from 'lucide-react'
import { PdfSiteShell } from '../components/pdf-site-shell'
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
          <h1 className="font-display text-2xl font-semibold text-forest-950">This document is not shared with your account</h1>
          <p className="mt-4 text-sm leading-relaxed text-forest-600">
            Golf Sol Ireland enables the terms and thank-you PDFs from the admin dashboard. Once we email you access, the link
            will appear on your client dashboard after you sign in.
          </p>
          <a
            className="mt-8 inline-flex text-sm font-semibold text-gold-600 underline-offset-2 hover:text-gold-700 hover:underline"
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
      <div
        className="mx-auto mb-6 max-w-7xl px-4 pt-6 md:px-8 pdf-screen-only"
        data-html2canvas-ignore="true"
      >
        <div className="flex flex-wrap items-center gap-3">
          <button
            aria-label="Save as PDF"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-forest-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 disabled:opacity-70"
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
            className="text-sm font-semibold text-gold-600 underline-offset-2 hover:text-gold-700 hover:underline"
            href="/dashboard"
          >
            Back to dashboard
          </a>
          {pdfMessage ? (
            <p className="text-sm text-forest-700" role="status">
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

function TermsBody({ kicker, title }: { readonly kicker: string; readonly title: string }) {
  return (
    <article className="rounded-[2rem] border border-forest-100 bg-white p-8 shadow-soft md:p-12">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">{kicker}</p>
      <h1 className="font-display mt-3 text-3xl font-bold text-forest-950 md:text-4xl">{title}</h1>
      <p className="mt-4 text-sm leading-relaxed text-forest-600">
        Plain-language terms for travelling with Golf Sol Ireland. They protect both your group and our ability to deliver
        the courses, hotels, and transfers you expect on the Costa del Sol.
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="font-display text-xl font-semibold text-forest-900">1. Who we are</h2>
        <p className="text-sm leading-relaxed text-forest-700">
          Golf Sol Ireland arranges golf travel experiences in partnership with vetted suppliers. We act as your planning
          partner — not the hotel, airline, or golf club operator — unless a document explicitly states otherwise.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-display text-xl font-semibold text-forest-900">2. Quotes and proposals</h2>
        <p className="text-sm leading-relaxed text-forest-700">
          Indicative pricing depends on availability, seasonality, and supplier rates at the time of issue. A formal quote
          becomes binding only after you confirm in writing and we confirm supplier space in return.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-display text-xl font-semibold text-forest-900">3. Deposits and payment</h2>
        <p className="text-sm leading-relaxed text-forest-700">
          Deposits secure tee times, rooms, and transport. Balance due dates follow the schedule on your proposal. Late
          payment may mean released inventory — we will always try to warn you first.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-display text-xl font-semibold text-forest-900">4. Changes and cancellations</h2>
        <p className="text-sm leading-relaxed text-forest-700">
          Supplier rules apply. Where we can move dates or names without penalty, we will. Where suppliers charge fees,
          those pass through unless we agree otherwise in writing.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-display text-xl font-semibold text-forest-900">5. Travel insurance and conduct</h2>
        <p className="text-sm leading-relaxed text-forest-700">
          Adequate travel insurance is strongly recommended. Respectful conduct toward staff, venues, and other guests is
          expected; providers may refuse service for serious misconduct without refund.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-display text-xl font-semibold text-forest-900">6. Liability</h2>
        <p className="text-sm leading-relaxed text-forest-700">
          We are not liable for events outside our reasonable control (weather, closures, industrial action, pandemics, etc.).
          Our liability is limited to fees paid to us for our planning service except where Irish law does not allow that
          limit.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-gold-200/60 bg-gold-50/40 p-6">
        <h2 className="font-display text-xl font-semibold text-forest-900">7. Questions</h2>
        <p className="mt-3 text-sm leading-relaxed text-forest-700">
          Prefer a conversation to a PDF? Reach us through the contact details in the footer — we actually answer.
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
