import type { SupabaseClient } from '@supabase/supabase-js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { buildEnquiryItinerarySection, type ClientEnquiryRowLite } from '../lib/client-data-card'
import { LuxuryButton } from './ui/button'
import { cx } from '../lib/utils'

export type PortalInvoiceEnquiryJoin = {
  id: string
  reference_id: string
  form_payload: unknown
  full_name: string | null
  created_at: string
}

export interface PortalInvoiceRow {
  id: string
  enquiry_id: string | null
  enquiry_reference_id: string
  amount_cents: number
  currency: string
  status: string
  invoice_number: string
  stripe_checkout_url: string | null
  created_at: string
  paid_at: string | null
  enquiries?: PortalInvoiceEnquiryJoin | PortalInvoiceEnquiryJoin[] | null
}

const isMissingInvoicesTable = (msg: string) => {
  const m = msg.toLowerCase()
  return m.includes('portal_invoices') && (m.includes('does not exist') || m.includes('schema cache'))
}

const formatEurFromCents = (cents: number) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(cents / 100)

const normalizeEnquiryJoin = (raw: PortalInvoiceRow['enquiries']): PortalInvoiceEnquiryJoin | null => {
  if (!raw) {
    return null
  }
  if (Array.isArray(raw)) {
    return raw[0] ?? null
  }
  return raw
}

export function PortalInvoicesPanel(props: {
  readonly supabase: SupabaseClient
  readonly userId: string
  readonly accountReferenceLabel: string | null
  readonly refreshTrigger: number
}) {
  const [rows, setRows] = useState<PortalInvoiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const initialListLoad = useRef(true)

  const load = useCallback(async () => {
    if (initialListLoad.current) {
      setLoading(true)
    }
    setError(null)
    const { data, error: qErr } = await props.supabase
      .from('portal_invoices')
      .select(
        'id, enquiry_id, enquiry_reference_id, amount_cents, currency, status, invoice_number, stripe_checkout_url, created_at, paid_at, enquiries(id, reference_id, form_payload, full_name, created_at)'
      )
      .eq('profile_id', props.userId)
      .order('created_at', { ascending: false })

    if (qErr) {
      if (isMissingInvoicesTable(qErr.message)) {
        setRows([])
        setError(null)
      } else {
        setRows([])
        setError(qErr.message)
      }
      initialListLoad.current = false
      setLoading(false)
      return
    }

    const list = (data ?? []) as unknown as PortalInvoiceRow[]
    setRows(list)
    setSelectedId((prev) => {
      if (prev && list.some((r) => r.id === prev)) {
        return prev
      }
      return list[0]?.id ?? null
    })
    initialListLoad.current = false
    setLoading(false)
  }, [props.supabase, props.userId])

  useEffect(() => {
    void load()
  }, [load, props.refreshTrigger])

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        void load()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [load])

  const selected = rows.find((r) => r.id === selectedId) ?? null

  const joinedEnquiry = selected ? normalizeEnquiryJoin(selected.enquiries) : null

  const enquiryLite: ClientEnquiryRowLite | null = selected
    ? joinedEnquiry?.id
      ? {
          id: joinedEnquiry.id,
          reference_id: joinedEnquiry.reference_id,
          created_at: joinedEnquiry.created_at,
          form_payload: joinedEnquiry.form_payload
        }
      : {
          id: selected.enquiry_id ?? selected.id,
          reference_id: selected.enquiry_reference_id,
          created_at: selected.created_at,
          form_payload: null
        }
    : null

  const itinerarySection = enquiryLite ? buildEnquiryItinerarySection(enquiryLite) : null

  if (loading && rows.length === 0) {
    return <p className="text-base font-medium text-forest-600 md:text-lg">Loading trip invoices…</p>
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-chrome-200/90 bg-chrome-50/90 px-5 py-4 text-base text-brand-950 shadow-soft md:text-lg">
        <p className="font-medium">Could not load invoices.</p>
        <p className="mt-2 text-brand-900/85">{error}</p>
      </div>
    )
  }

  if (rows.length === 0) {
    return null
  }

  return (
    <section className="rounded-[2rem] border border-fairway-200/80 bg-gradient-to-br from-white via-offwhite/40 to-fairway-50/30 p-6 shadow-soft md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600 sm:text-base">Trip invoices</p>
          <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950 sm:text-[2rem]">Your itinerary &amp; payment</h2>
          <p className="mt-2 max-w-2xl text-base text-forest-600 md:text-lg">
            Each row below is a priced response from Golf Sol. Open one to see what you submitted and your invoice-style summary. Pay
            securely with Stripe when status shows due.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {rows.map((row) => (
          <button
            className={cx(
              'rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors',
              row.id === selectedId
                ? 'border-fairway-600 bg-fairway-700 text-white shadow-sm'
                : 'border-forest-200 bg-white text-forest-800 hover:border-fairway-400'
            )}
            key={row.id}
            onClick={() => setSelectedId(row.id)}
            type="button"
          >
            {row.invoice_number}
            <span className="ml-2 font-mono normal-case tracking-normal text-xs opacity-90 sm:text-sm">
              {row.status === 'paid' ? '· Paid' : '· Due'}
            </span>
          </button>
        ))}
      </div>

      {selected ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-forest-100 bg-white p-5 shadow-inner md:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600 sm:text-base">Card 1 — Your submission</p>
            <h3 className="font-display mt-2 text-xl font-semibold text-forest-950 sm:text-2xl">
              {itinerarySection?.title ?? `Enquiry ${selected.enquiry_reference_id}`}
            </h3>
            {itinerarySection?.subtitle ? <p className="mt-1 text-sm text-forest-500 sm:text-base">{itinerarySection.subtitle}</p> : null}
            {itinerarySection && itinerarySection.rows.length > 0 ? (
              <dl className="mt-4 grid gap-3 sm:grid-cols-1">
                {itinerarySection.rows.map((r) => (
                  <div className="rounded-xl border border-forest-100 bg-offwhite/60 px-3 py-2.5" key={r.label}>
                    <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-600 sm:text-sm">{r.label}</dt>
                    <dd className="mt-1 whitespace-pre-wrap break-words text-base font-medium text-forest-900 sm:text-lg">{r.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-4 text-base text-forest-600 md:text-lg">
                We linked this invoice to reference <span className="font-mono">{selected.enquiry_reference_id}</span>
                {joinedEnquiry?.full_name ? (
                  <>
                    {' '}
                    ({joinedEnquiry.full_name})
                  </>
                ) : null}
                . Detailed form answers are not on file for this row; check your confirmation email or message the team.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-forest-900/15 bg-forest-950 p-5 text-white shadow-lg md:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-300 sm:text-base">Card 2 — Invoice summary</p>
            <h3 className="font-display mt-2 text-xl font-semibold text-white sm:text-2xl">{selected.invoice_number}</h3>
            <p className="mt-3 text-base text-white/80 md:text-lg">
              Account reference:{' '}
              <span className="font-mono font-semibold text-brand-200">
                {props.accountReferenceLabel?.trim() || '— assign in portal / ask admin'}
              </span>
            </p>
            <p className="mt-2 text-base text-white/80 md:text-lg">
              Trip reference: <span className="font-mono text-white">{selected.enquiry_reference_id}</span>
            </p>
            <p className="mt-4 font-display text-3xl font-bold text-brand-300">{formatEurFromCents(selected.amount_cents)}</p>
            <p className="mt-1 text-sm uppercase tracking-[0.14em] text-white/55">
              {selected.status === 'paid' ? 'Paid — thank you' : 'Payment due'}
            </p>
            {selected.status !== 'paid' && selected.stripe_checkout_url ? (
              <LuxuryButton
                className="!mt-6 !w-full sm:!w-auto"
                href={selected.stripe_checkout_url}
                rel="noopener noreferrer"
                target="_blank"
                variant="primary"
              >
                Pay now
              </LuxuryButton>
            ) : selected.status !== 'paid' ? (
              <p className="mt-4 text-base text-brand-200/90 md:text-lg">Checkout link is not ready — refresh the page or contact Golf Sol.</p>
            ) : (
              <p className="mt-4 text-base text-emerald-200/90 md:text-lg">This invoice is marked paid. Keep the PDF from your email for records.</p>
            )}
            <p className="mt-6 text-xs leading-relaxed text-white/45 sm:text-sm">
              A matching PDF was attached to your email. Card totals are inclusive of the amount we quoted for this trip row.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  )
}
