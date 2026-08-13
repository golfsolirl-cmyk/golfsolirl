import { useEffect, useMemo, useState } from 'react'
import { ClipboardList, Mail, MessageSquare, Wallet } from 'lucide-react'
import { EnquiryTripStageStrip } from './enquiry-trip-stage-strip'
import { AdminEnquiryTripBuilder } from './admin-enquiry-trip-builder'
import { LuxuryButton } from './ui/button'
import { cx } from '../lib/utils'
import { websiteFormDisplayLabel, parseClientEnquiryFormPayload } from '../lib/client-data-card'
import {
  formatWebsiteFormFieldValueForDisplay,
  getWebsiteFormFieldLabel,
  orderedWebsiteFormFieldEntries
} from '../lib/package-build'
import type { PortalInterestTicketMessageRow } from '../lib/portal-interest-tickets'
import { getSupabaseBrowserClient } from '../lib/supabase-client'

export type AdminEnquiryCardRow = {
  id: string
  reference_id: string
  email: string
  full_name: string
  interest: string | null
  phone_whatsapp: string | null
  best_time_to_call: string | null
  created_at: string
  form_payload?: unknown
  client_portal_account_ref?: string | null
  admin_viewed_at?: string | null
}

type FormAnswerRow = {
  readonly label: string
  readonly value: string
  readonly wide?: boolean
}

function humanizeTripTiming(value: string): string {
  const v = value.trim().toLowerCase()
  if (v === 'planned') {
    return 'Planned travel dates'
  }
  if (v === 'already_at_agp' || v === 'already at agp' || v === 'already at málaga') {
    return 'Already at Málaga (AGP)'
  }
  return value.trim()
}

function buildOpenCardFormAnswers(row: AdminEnquiryCardRow): {
  readonly formLabel: string
  readonly rows: readonly FormAnswerRow[]
  readonly brief: string | null
} {
  const { form, fields } = parseClientEnquiryFormPayload(row.form_payload)
  const formLabel = websiteFormDisplayLabel(form)
  const entries = orderedWebsiteFormFieldEntries(fields)
  const briefKey = entries.find(([k]) => getWebsiteFormFieldLabel(k).toLowerCase() === 'trip brief')
  const brief = briefKey ? String(briefKey[1]).trim() || null : null

  const skipNorm = new Set(['tripbrief', 'page', 'termsaccepted', 'publicform'])
  const byLabel = new Map<string, FormAnswerRow>()

  const startEntry = entries.find(([k]) => getWebsiteFormFieldLabel(k) === 'Travel start date')
  const endEntry = entries.find(([k]) => getWebsiteFormFieldLabel(k) === 'Travel end date')
  const startDisp = startEntry ? formatWebsiteFormFieldValueForDisplay(startEntry[0], startEntry[1]).trim() : ''
  const endDisp = endEntry ? formatWebsiteFormFieldValueForDisplay(endEntry[0], endEntry[1]).trim() : ''
  if (startDisp || endDisp) {
    byLabel.set('Travel dates', {
      label: 'Travel dates',
      value: startDisp && endDisp ? `${startDisp} → ${endDisp}` : startDisp || endDisp
    })
  }
  const skipTravel = new Set(
    [startEntry?.[0], endEntry?.[0]].filter((k): k is string => Boolean(k)).map((k) => k.toLowerCase())
  )

  for (const [key, raw] of entries) {
    const label = getWebsiteFormFieldLabel(key)
    const norm = label.toLowerCase().replace(/[^a-z0-9]+/g, '')
    if (skipNorm.has(norm) || skipTravel.has(key.toLowerCase())) {
      continue
    }
    let value = formatWebsiteFormFieldValueForDisplay(key, raw).trim()
    if (!value) {
      continue
    }
    if (norm === 'alreadyatmalagaagp' && /^(no|false|0)$/i.test(value)) {
      continue
    }
    if (norm === 'triptiming') {
      value = humanizeTripTiming(value)
    }
    if (!byLabel.has(label)) {
      byLabel.set(label, {
        label,
        value,
        wide: value.length > 80 || /notes|request|also/i.test(label)
      })
    }
  }

  if (row.best_time_to_call?.trim() && !byLabel.has('Best time to call')) {
    byLabel.set('Best time to call', { label: 'Best time to call', value: row.best_time_to_call.trim() })
  }

  const page = fields.Page?.trim()
  if (page) {
    byLabel.set('Submitted from', { label: 'Submitted from', value: page })
  }

  const preferredOrder = [
    'Submitted from',
    'Topic',
    'Interest',
    'Group size',
    'Passengers',
    'Party size',
    'Travel dates',
    'Trip timing',
    'Preferred location',
    'Destination',
    'Already at Málaga (AGP)',
    'Best time to call'
  ]
  const rows: FormAnswerRow[] = []
  for (const label of preferredOrder) {
    const item = byLabel.get(label)
    if (item) {
      rows.push(item)
      byLabel.delete(label)
    }
  }
  for (const item of byLabel.values()) {
    rows.push(item)
  }

  return { formLabel, rows, brief }
}

type TransferSnap = {
  id: string
  admin_price_eur: number | null
  payment_status: string | null
  deposit_percent: number | null
}

type InvoiceSnap = {
  status: string | null
  amount_cents: number | null
}

type AdminEnquiryCardQueueProps = {
  readonly rows: readonly AdminEnquiryCardRow[]
  readonly accessToken: string | null
  readonly emptyLabel: string
  /** @deprecated Form answers now render from `form_payload` directly; kept optional for call-site compat. */
  readonly buildDetailPairs?: (row: AdminEnquiryCardRow) => readonly (readonly [string, string])[]
  readonly onOpen: (row: AdminEnquiryCardRow) => void
  readonly onRemove: (row: AdminEnquiryCardRow) => void
  readonly removingId: string | null
}

const formatWhen = (iso: string) => {
  try {
    return new Intl.DateTimeFormat('en-IE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

const formatEur = (n: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(n)

export function AdminEnquiryCardQueue({
  rows,
  accessToken,
  emptyLabel,
  onOpen,
  onRemove,
  removingId
}: AdminEnquiryCardQueueProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [priceById, setPriceById] = useState<Record<string, string>>({})
  const [busyById, setBusyById] = useState<Record<string, string | null>>({})
  const [noteById, setNoteById] = useState<Record<string, string | null>>({})
  const [messageById, setMessageById] = useState<Record<string, string>>({})
  const [threadById, setThreadById] = useState<Record<string, PortalInterestTicketMessageRow[]>>({})
  const [transfersByRef, setTransfersByRef] = useState<Record<string, TransferSnap>>({})
  const [invoicesByEnquiry, setInvoicesByEnquiry] = useState<Record<string, InvoiceSnap>>({})

  const refs = useMemo(() => rows.map((r) => r.reference_id).filter(Boolean), [rows])
  const enquiryIds = useMemo(() => rows.map((r) => r.id), [rows])

  useEffect(() => {
    if (refs.length === 0) {
      return
    }
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      return
    }
    let cancelled = false
    void (async () => {
      const { data } = await supabase
        .from('transfer_bookings')
        .select('id, enquiry_reference_id, admin_price_eur, payment_status, deposit_percent')
        .in('enquiry_reference_id', refs)
        .order('created_at', { ascending: false })
      if (cancelled || !data) {
        return
      }
      const map: Record<string, TransferSnap> = {}
      for (const row of data as Array<TransferSnap & { enquiry_reference_id?: string | null }>) {
        const ref = String(row.enquiry_reference_id ?? '').trim()
        if (!ref || map[ref]) {
          continue
        }
        map[ref] = {
          id: row.id,
          admin_price_eur: row.admin_price_eur,
          payment_status: row.payment_status,
          deposit_percent: row.deposit_percent
        }
      }
      setTransfersByRef(map)
    })()
    return () => {
      cancelled = true
    }
  }, [refs.join('|')])

  useEffect(() => {
    if (enquiryIds.length === 0) {
      return
    }
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      return
    }
    let cancelled = false
    void (async () => {
      const { data } = await supabase
        .from('portal_invoices')
        .select('enquiry_id, status, amount_cents')
        .in('enquiry_id', enquiryIds)
        .order('created_at', { ascending: false })
      if (cancelled || !data) {
        return
      }
      const map: Record<string, InvoiceSnap> = {}
      for (const row of data as Array<InvoiceSnap & { enquiry_id?: string | null }>) {
        const id = String(row.enquiry_id ?? '').trim()
        if (!id || map[id]) {
          continue
        }
        map[id] = { status: row.status, amount_cents: row.amount_cents }
      }
      setInvoicesByEnquiry(map)
    })()
    return () => {
      cancelled = true
    }
  }, [enquiryIds.join('|')])

  const loadThread = async (row: AdminEnquiryCardRow) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      return
    }
    const email = row.email.trim().toLowerCase()
    const { data: profile } = await supabase.from('profiles').select('id').ilike('email', email).maybeSingle()
    if (!profile?.id) {
      setThreadById((prev) => ({ ...prev, [row.id]: [] }))
      return
    }
    const { data: tickets } = await supabase
      .from('portal_interest_tickets')
      .select('id')
      .eq('owner_id', profile.id)
      .order('updated_at', { ascending: false })
      .limit(1)
    const ticketId = Array.isArray(tickets) && tickets[0]?.id ? tickets[0].id : null
    if (!ticketId) {
      setThreadById((prev) => ({ ...prev, [row.id]: [] }))
      return
    }
    const { data: msgs } = await supabase
      .from('portal_interest_ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })
    setThreadById((prev) => ({ ...prev, [row.id]: (msgs ?? []) as PortalInterestTicketMessageRow[] }))
  }

  const sendPrice = async (row: AdminEnquiryCardRow, mode: 'deposit' | 'full') => {
    if (!accessToken) {
      setNoteById((prev) => ({ ...prev, [row.id]: 'Sign in again as admin.' }))
      return
    }
    const existingPay = String(transfersByRef[row.reference_id]?.payment_status ?? '').toLowerCase()
    if (existingPay === 'paid' || existingPay === 'deposit') {
      setNoteById((prev) => ({
        ...prev,
        [row.id]:
          existingPay === 'paid'
            ? 'This trip is already fully paid. Do not re-quote from this card — use Transfers & drivers.'
            : 'A deposit is already on file. Do not re-quote from this card — collect the balance from Transfers & drivers.'
      }))
      return
    }
    const parsed = Number(String(priceById[row.id] ?? '').replace(/,/g, '.').trim())
    if (!Number.isFinite(parsed) || parsed < 0.5) {
      setNoteById((prev) => ({ ...prev, [row.id]: 'Enter a valid total in euros (min €0.50).' }))
      return
    }
    setBusyById((prev) => ({ ...prev, [row.id]: mode }))
    setNoteById((prev) => ({ ...prev, [row.id]: null }))
    try {
      const res = await fetch('/api/enquiry-admin-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ enquiryId: row.id, amountEur: parsed, mode })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string; bookingId?: string }
      if (!res.ok) {
        setNoteById((prev) => ({ ...prev, [row.id]: data.message ?? res.statusText }))
        return
      }
      const listed =
        data.message ??
        'Price sent. Open Transfers & drivers — the job is under Quoted until they pay, then Ready to dispatch.'
      setNoteById((prev) => ({ ...prev, [row.id]: listed }))
      setTransfersByRef((prev) => ({
        ...prev,
        [row.reference_id]: {
          id: data.bookingId ?? prev[row.reference_id]?.id ?? 'pending',
          admin_price_eur: parsed,
          payment_status: 'unpaid',
          deposit_percent: 20
        }
      }))
    } catch (e) {
      setNoteById((prev) => ({ ...prev, [row.id]: e instanceof Error ? e.message : 'Request failed.' }))
    } finally {
      setBusyById((prev) => ({ ...prev, [row.id]: null }))
    }
  }

  const sendMessage = async (row: AdminEnquiryCardRow) => {
    if (!accessToken) {
      setNoteById((prev) => ({ ...prev, [row.id]: 'Sign in again as admin.' }))
      return
    }
    const text = (messageById[row.id] ?? '').trim()
    if (!text) {
      setNoteById((prev) => ({ ...prev, [row.id]: 'Type a message for the guest first.' }))
      return
    }
    setBusyById((prev) => ({ ...prev, [row.id]: 'message' }))
    setNoteById((prev) => ({ ...prev, [row.id]: null }))
    try {
      const res = await fetch('/api/enquiry-admin-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ enquiryId: row.id, body: text, category: 'transfers' })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      if (!res.ok) {
        setNoteById((prev) => ({ ...prev, [row.id]: data.message ?? res.statusText }))
        return
      }
      setMessageById((prev) => ({ ...prev, [row.id]: '' }))
      setNoteById((prev) => ({ ...prev, [row.id]: data.message ?? 'Message sent.' }))
      await loadThread(row)
    } catch (e) {
      setNoteById((prev) => ({ ...prev, [row.id]: e instanceof Error ? e.message : 'Message failed.' }))
    } finally {
      setBusyById((prev) => ({ ...prev, [row.id]: null }))
    }
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-forest-200 bg-offwhite px-6 py-10 text-center text-sm text-forest-900">
        {emptyLabel}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {rows.map((row) => {
        const transfer = transfersByRef[row.reference_id]
        const invoice = invoicesByEnquiry[row.id]
        const hasQuote =
          (typeof transfer?.admin_price_eur === 'number' && transfer.admin_price_eur > 0) ||
          (typeof invoice?.amount_cents === 'number' && invoice.amount_cents > 0)
        const expanded = expandedId === row.id
        const formAnswers = buildOpenCardFormAnswers(row)
        const thread = threadById[row.id] ?? []
        const busy = busyById[row.id]
        const quoteLocked =
          String(transfer?.payment_status ?? '').toLowerCase() === 'paid' ||
          String(transfer?.payment_status ?? '').toLowerCase() === 'deposit'

        return (
          <article
            key={row.id}
            className="overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-soft ring-1 ring-forest-900/5"
          >
            <header className="border-b border-forest-50 bg-gradient-to-br from-fairway-50/90 to-white px-5 py-5 sm:px-7">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">Website form</p>
                  <h3 className="font-display mt-1 text-xl font-semibold text-forest-950 sm:text-2xl">
                    {row.full_name}
                  </h3>
                  <p className="mt-1 font-mono text-sm font-semibold text-forest-800">{row.reference_id}</p>
                  <p className="mt-2 text-sm text-forest-700">
                    <span className="break-all">{row.email}</span>
                    {row.phone_whatsapp ? (
                      <>
                        {' · '}
                        <span>{row.phone_whatsapp}</span>
                      </>
                    ) : null}
                  </p>
                  <p className="mt-1 text-xs text-ge-gray500">
                    Submitted {formatWhen(row.created_at)}
                    {row.client_portal_account_ref ? ` · Portal ${row.client_portal_account_ref}` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <LuxuryButton
                    className="!px-4 !py-2 !text-xs"
                    onClick={() => {
                      onOpen(row)
                      setExpandedId((id) => (id === row.id ? null : row.id))
                      void loadThread(row)
                    }}
                    type="button"
                    variant="primary"
                  >
                    {expanded ? 'Hide details' : 'Open card'}
                  </LuxuryButton>
                  <LuxuryButton
                    className="!border-red-300 !px-4 !py-2 !text-xs !text-red-800 hover:!bg-red-50"
                    disabled={removingId === row.id}
                    onClick={() => onRemove(row)}
                    type="button"
                    variant="outline"
                  >
                    {removingId === row.id ? 'Removing…' : 'Remove'}
                  </LuxuryButton>
                </div>
              </div>
              <div className="mt-4">
                <EnquiryTripStageStrip
                  input={{
                    adminViewedAt: row.admin_viewed_at,
                    hasQuotePrice: hasQuote,
                    paymentStatus: transfer?.payment_status,
                    invoicePaid: String(invoice?.status ?? '').toLowerCase() === 'paid'
                  }}
                  variant="admin"
                />
              </div>
            </header>

            {expanded ? (
              <div className="space-y-6 px-5 py-6 sm:px-7">
                <section className="rounded-[1.5rem] border border-forest-200 bg-offwhite/90 px-4 py-5 sm:px-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-white">
                      <ClipboardList aria-hidden className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display text-lg font-semibold text-forest-950">What they asked for</h4>
                      <p className="mt-1 text-sm text-forest-600">
                        Answers from their website form ({formAnswers.formLabel}). Contact details are above.
                      </p>
                    </div>
                  </div>

                  {formAnswers.brief ? (
                    <div className="mt-4 rounded-2xl border border-fairway-200 bg-white px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">Trip brief</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-forest-900">
                        {formAnswers.brief}
                      </p>
                    </div>
                  ) : null}

                  {formAnswers.rows.length > 0 ? (
                    <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                      {formAnswers.rows.map((item) => (
                        <div
                          className={cx(
                            'rounded-2xl border border-forest-100 bg-white px-4 py-3',
                            item.wide ? 'sm:col-span-2' : null
                          )}
                          key={`${item.label}-${item.value.slice(0, 24)}`}
                        >
                          <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-600">
                            {item.label}
                          </dt>
                          <dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-forest-900">
                            {item.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="mt-4 text-sm text-forest-600">No extra trip answers were stored on this form.</p>
                  )}
                </section>

                <section className="rounded-[1.5rem] border border-emerald-200/90 bg-gradient-to-br from-fairway-50/90 to-white px-4 py-5 shadow-sm sm:px-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-white">
                      <Wallet aria-hidden className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display text-lg font-semibold text-forest-950">Add a price</h4>
                      <p className="mt-1 text-sm text-forest-700">
                        Enter the total first — used when you save the trip below, and when you send a deposit or full
                        Stripe quote.
                      </p>
                      {hasQuote ? (
                        <p className="mt-2 text-sm font-semibold text-emerald-900">
                          Current price:{' '}
                          {typeof transfer?.admin_price_eur === 'number'
                            ? formatEur(transfer.admin_price_eur)
                            : invoice?.amount_cents
                              ? formatEur(invoice.amount_cents / 100)
                              : '—'}
                          {transfer?.payment_status ? ` · ${transfer.payment_status}` : ''}
                        </p>
                      ) : null}
                      {quoteLocked ? (
                        <p className="mt-2 text-sm font-semibold text-forest-900">
                          Payment is already on file ({transfer?.payment_status}). Use Transfers &amp; drivers to collect
                          a balance or send receipts — sending a new quote from this card would reset the paid state.
                        </p>
                      ) : null}
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                        <div className="min-w-[10rem] flex-1">
                          <label
                            className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700"
                            htmlFor={`price-${row.id}`}
                          >
                            Total (EUR, inc. VAT as you intend)
                          </label>
                          <input
                            className="w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm font-medium text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60 disabled:cursor-not-allowed disabled:bg-offwhite disabled:text-forest-500"
                            disabled={quoteLocked}
                            id={`price-${row.id}`}
                            inputMode="decimal"
                            onChange={(e) => setPriceById((prev) => ({ ...prev, [row.id]: e.target.value }))}
                            placeholder="e.g. 1200"
                            type="text"
                            value={priceById[row.id] ?? ''}
                          />
                          {(() => {
                            const parsed = Number(String(priceById[row.id] ?? '').replace(/,/g, '.').trim())
                            if (!Number.isFinite(parsed) || parsed < 0.5) return null
                            const dep = Math.round(parsed * 0.2 * 100) / 100
                            return (
                              <p className="mt-2 text-xs leading-relaxed text-forest-600">
                                Deposit quote charges <span className="font-semibold text-forest-900">{formatEur(dep)}</span>{' '}
                                (20%). Full amount charges <span className="font-semibold text-forest-900">{formatEur(parsed)}</span>.
                              </p>
                            )
                          })()}
                        </div>
                        <LuxuryButton
                          className="!px-5 !py-2.5"
                          disabled={Boolean(busy) || quoteLocked}
                          onClick={() => void sendPrice(row, 'deposit')}
                          type="button"
                          variant="primary"
                        >
                          {busy === 'deposit' ? 'Sending…' : '1 · Send 20% deposit'}
                        </LuxuryButton>
                        <LuxuryButton
                          className="!px-5 !py-2.5"
                          disabled={Boolean(busy) || quoteLocked}
                          onClick={() => void sendPrice(row, 'full')}
                          type="button"
                          variant="outline"
                        >
                          {busy === 'full' ? 'Sending…' : '2 · Send full amount'}
                        </LuxuryButton>
                      </div>
                    </div>
                  </div>
                </section>

                <AdminEnquiryTripBuilder
                  accessToken={accessToken}
                  onNote={(message) => setNoteById((prev) => ({ ...prev, [row.id]: message }))}
                  priceEurInput={priceById[row.id] ?? ''}
                  row={row}
                />

                <section className="rounded-[1.5rem] border border-forest-100 bg-offwhite/80 px-4 py-5 sm:px-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white">
                      <MessageSquare aria-hidden className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display text-lg font-semibold text-forest-950">Message guest</h4>
                      <p className="mt-1 text-sm text-forest-700">
                        Two-way thread in the client portal (and email notify). Guest can reply from their dashboard.
                      </p>
                      {thread.length > 0 ? (
                        <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto rounded-xl border border-forest-100 bg-white p-3">
                          {thread.map((m) => (
                            <li
                              className={cx(
                                'rounded-lg px-3 py-2 text-sm',
                                m.author_kind === 'admin'
                                  ? 'bg-forest-900 text-white'
                                  : 'bg-fairway-50 text-forest-900'
                              )}
                              key={m.id}
                            >
                              <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
                                {m.author_kind === 'admin' ? 'You' : 'Guest'}
                              </p>
                              <p className="mt-0.5 whitespace-pre-wrap">{m.body}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-xs text-ge-gray500">No messages yet on this guest’s desk thread.</p>
                      )}
                      <label className="mt-3 mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700" htmlFor={`msg-${row.id}`}>
                        Your message
                      </label>
                      <textarea
                        className="min-h-[88px] w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
                        id={`msg-${row.id}`}
                        onChange={(e) => setMessageById((prev) => ({ ...prev, [row.id]: e.target.value }))}
                        placeholder="e.g. Thanks — here is what we can do for your dates…"
                        value={messageById[row.id] ?? ''}
                      />
                      <LuxuryButton
                        className="!mt-3 !px-5 !py-2.5"
                        disabled={Boolean(busy)}
                        onClick={() => void sendMessage(row)}
                        type="button"
                        variant="primary"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Mail aria-hidden className="h-4 w-4" />
                          {busy === 'message' ? 'Sending…' : 'Send message'}
                        </span>
                      </LuxuryButton>
                    </div>
                  </div>
                </section>

                {noteById[row.id] ? (
                  <p className="rounded-2xl border border-forest-200 bg-white px-4 py-3 text-sm text-forest-800" role="status">
                    {noteById[row.id]}
                  </p>
                ) : null}
              </div>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}
