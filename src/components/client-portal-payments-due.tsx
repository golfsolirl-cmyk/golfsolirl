import { CreditCard, FileText } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  balanceAmountEur,
  clientTransferOperationalStatusLabel,
  depositAmountEur,
  formatBalanceDueLine,
  normalizedDepositPercent,
  transferPaymentFullUpfront
} from '../lib/transfer-payment-breakdown'
import { TransferPaymentStatusBadge } from './transfer-payment-status-badge'
import { LuxuryButton } from './ui/button'
import type { ClientPortalTransferHeroRow } from './client-portal-identity-hero'
import { cx } from '../lib/utils'

const formatEurInline = (n: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const formatEurFromCents = (cents: number) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(cents / 100)

type InvoiceDueRow = {
  readonly id: string
  readonly invoice_number: string
  readonly amount_cents: number
  readonly status: string
  readonly stripe_checkout_url: string | null
  readonly enquiry_reference_id: string
  readonly paid_at?: string | null
  readonly created_at?: string | null
}

type PaymentHistoryItem =
  | {
      kind: 'transfer'
      id: string
      sortAt: string
      title: string
      subtitle: string
      amountDisplay: string
      paymentStatus: string
      depositPercent: number | null
      transfer: ClientPortalTransferHeroRow
    }
  | {
      kind: 'invoice'
      id: string
      sortAt: string
      title: string
      subtitle: string
      amountDisplay: string
      invoiceId: string
    }

const formatWhen = (iso: string | null | undefined) => {
  if (!iso) {
    return '—'
  }
  try {
    return new Intl.DateTimeFormat('en-IE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

const transferCollectedDisplay = (t: ClientPortalTransferHeroRow) => {
  const pay = (t.payment_status ?? 'unpaid').toLowerCase()
  const gross = typeof t.admin_price_eur === 'number' && Number.isFinite(t.admin_price_eur) ? t.admin_price_eur : null
  if (gross === null) {
    return null
  }
  const pct = normalizedDepositPercent(t.deposit_percent)
  if (pay === 'paid') {
    return gross
  }
  if (pay === 'deposit') {
    return depositAmountEur(gross, pct)
  }
  return null
}

export function ClientPortalPaymentsDue(props: {
  readonly transfers: readonly ClientPortalTransferHeroRow[]
  readonly supabase: SupabaseClient | null
  readonly userId: string | null
  readonly onPayTransfer?: (
    transfer: ClientPortalTransferHeroRow,
    phase: 'deposit' | 'balance' | 'full'
  ) => void | Promise<void>
  readonly onGoToPaymentsTab?: () => void
  readonly onViewInvoice?: (invoiceId: string) => void
  readonly onDownloadTransferReceipt?: (transfer: ClientPortalTransferHeroRow) => void | Promise<void>
  readonly className?: string
  /** Set on the primary instance only (scroll target from menu / hero). */
  readonly anchorId?: string
  /** Scroll target for “All payments” history block (payments tab). */
  readonly historyAnchorId?: string
  /** Show completed payment history (default true on payments tab). */
  readonly showPaymentHistory?: boolean
}) {
  const [invoices, setInvoices] = useState<InvoiceDueRow[]>([])
  const [payBusyId, setPayBusyId] = useState<string | null>(null)
  const [payBusyPhase, setPayBusyPhase] = useState<'deposit' | 'balance' | 'full' | null>(null)

  const loadInvoices = useCallback(async () => {
    if (!props.supabase || !props.userId) {
      setInvoices([])
      return
    }
    const { data, error } = await props.supabase
      .from('portal_invoices')
      .select('id, invoice_number, amount_cents, status, stripe_checkout_url, enquiry_reference_id, paid_at, created_at')
      .eq('profile_id', props.userId)
      .order('created_at', { ascending: false })
    if (error) {
      setInvoices([])
      return
    }
    setInvoices((data ?? []) as InvoiceDueRow[])
  }, [props.supabase, props.userId])

  useEffect(() => {
    void loadInvoices()
  }, [loadInvoices])

  useEffect(() => {
    if (!props.supabase || !props.userId) {
      return undefined
    }
    const channel = props.supabase
      .channel(`client-portal-invoices-${props.userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'portal_invoices', filter: `profile_id=eq.${props.userId}` },
        () => {
          void loadInvoices()
        }
      )
      .subscribe()
    return () => {
      void props.supabase?.removeChannel(channel)
    }
  }, [props.supabase, props.userId, loadInvoices])

  const unpaidTransfers = useMemo(
    () =>
      props.transfers.filter((t) => {
        const pay = (t.payment_status ?? 'unpaid').toLowerCase()
        return pay !== 'paid'
      }),
    [props.transfers]
  )

  const pricedUnpaidTransfers = useMemo(
    () =>
      unpaidTransfers.filter(
        (t) => typeof t.admin_price_eur === 'number' && Number.isFinite(t.admin_price_eur) && t.admin_price_eur >= 0.5
      ),
    [unpaidTransfers]
  )

  const unpaidInvoices = useMemo(
    () =>
      invoices.filter(
        (row) => row.status.toLowerCase() !== 'paid' && row.stripe_checkout_url
      ),
    [invoices]
  )

  const paidInvoices = useMemo(
    () => invoices.filter((row) => row.status.toLowerCase() === 'paid'),
    [invoices]
  )

  const paidTransfers = useMemo(
    () =>
      props.transfers.filter((t) => {
        const pay = (t.payment_status ?? 'unpaid').toLowerCase()
        return pay === 'deposit' || pay === 'paid'
      }),
    [props.transfers]
  )

  const paymentHistory = useMemo((): PaymentHistoryItem[] => {
    const items: PaymentHistoryItem[] = []
    for (const t of paidTransfers) {
      const pay = (t.payment_status ?? 'unpaid').toLowerCase()
      const collected = transferCollectedDisplay(t)
      items.push({
        kind: 'transfer',
        id: `transfer-${t.id}`,
        sortAt: t.updated_at ?? t.created_at ?? '',
        title: `${t.pickup_label} → ${t.dropoff_label}`,
        subtitle: `Transfer · ${formatWhen(t.updated_at ?? t.created_at)}${t.enquiry_reference_id ? ` · Ref ${t.enquiry_reference_id}` : ''}`,
        amountDisplay: collected !== null ? formatEurInline(collected) : 'See receipt PDF',
        paymentStatus: pay,
        depositPercent: t.deposit_percent ?? null,
        transfer: t
      })
    }
    for (const row of paidInvoices) {
      items.push({
        kind: 'invoice',
        id: `invoice-${row.id}`,
        sortAt: row.paid_at ?? row.created_at ?? '',
        title: `Trip invoice ${row.invoice_number}`,
        subtitle: `Invoice · ${formatWhen(row.paid_at ?? row.created_at)} · Ref ${row.enquiry_reference_id}`,
        amountDisplay: formatEurFromCents(row.amount_cents),
        invoiceId: row.id
      })
    }
    return items.sort((a, b) => String(b.sortAt).localeCompare(String(a.sortAt)))
  }, [paidInvoices, paidTransfers])

  const showHistory = props.showPaymentHistory !== false

  const awaitingQuoteCount = unpaidTransfers.length - pricedUnpaidTransfers.length
  const hasPayActions = pricedUnpaidTransfers.length > 0 || unpaidInvoices.length > 0
  const showSection =
    hasPayActions ||
    paymentHistory.length > 0 ||
    awaitingQuoteCount > 0 ||
    props.transfers.length > 0 ||
    invoices.length > 0

  if (!showSection) {
    return null
  }

  return (
    <section
      className={cx(
        'scroll-mt-28 rounded-[2rem] border-2 border-fairway-300/80 bg-gradient-to-br from-fairway-50 via-white to-offwhite p-5 shadow-soft sm:p-7',
        props.className
      )}
      id={props.anchorId}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-600">Pay</p>
          <h2 className="font-display mt-1 text-2xl font-semibold text-forest-950 sm:text-3xl">What’s due</h2>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-forest-700">
            Pay transfers and trip invoices by card. Finished payments stay under{' '}
            <strong className="font-semibold text-forest-900">All payments</strong>.
          </p>
        </div>
        {props.onGoToPaymentsTab ? (
          <LuxuryButton className="shrink-0 !px-5 !py-2.5 !text-xs" onClick={props.onGoToPaymentsTab} type="button" variant="outlineOnLight">
            All payments{paymentHistory.length > 0 ? ` (${paymentHistory.length})` : ''}
          </LuxuryButton>
        ) : null}
      </div>

      {pricedUnpaidTransfers.length > 0 ? (
        <ul className="mt-6 space-y-3" aria-label="Transfer payments due">
          {pricedUnpaidTransfers.map((t) => {
            const pay = (t.payment_status ?? 'unpaid').toLowerCase()
            const gross = t.admin_price_eur as number
            const fullUpfront = transferPaymentFullUpfront(t)
            const pct = normalizedDepositPercent(t.deposit_percent)
            const depEur = depositAmountEur(gross, pct)
            const balEur = balanceAmountEur(gross, pct)
            const dueLine = !fullUpfront ? formatBalanceDueLine(t.scheduled_at) : null
            const payBusy = payBusyId === t.id

            return (
              <li
                className="rounded-2xl border border-forest-200/90 bg-white px-4 py-4 shadow-sm sm:px-5"
                key={t.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-ge text-lg font-semibold text-forest-950">
                      {t.pickup_label} → {t.dropoff_label}
                    </p>
                    <p className="mt-1 text-sm text-forest-600">
                      {clientTransferOperationalStatusLabel(t)}
                      {t.scheduled_at
                        ? ` · ${new Date(t.scheduled_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}`
                        : ' · ASAP'}
                    </p>
                    <p className="mt-2 text-sm text-forest-800">
                      Total <span className="font-semibold">{formatEurInline(gross)}</span> (VAT incl.)
                      {!fullUpfront ? (
                        <>
                          {' '}
                          · {pct}% deposit {formatEurInline(depEur)} · balance {formatEurInline(balEur)}
                        </>
                      ) : null}
                    </p>
                    {dueLine ? <p className="mt-1 text-xs text-forest-600">{dueLine}</p> : null}
                    <p className="mt-2">
                      <TransferPaymentStatusBadge
                        deposit_percent={t.deposit_percent}
                        payment_status={t.payment_status}
                        size="sm"
                      />
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:max-w-xs sm:justify-end">
                    {fullUpfront ? (
                      <LuxuryButton
                        className="!px-5 !py-2.5"
                        disabled={payBusy || !props.onPayTransfer}
                        onClick={() => {
                          if (!props.onPayTransfer) {
                            return
                          }
                          setPayBusyId(t.id)
                          setPayBusyPhase('full')
                          void Promise.resolve(props.onPayTransfer(t, 'full')).finally(() => {
                            setPayBusyId(null)
                            setPayBusyPhase(null)
                          })
                        }}
                        type="button"
                        variant="primary"
                      >
                        <CreditCard className="mr-2 h-4 w-4" aria-hidden />
                        {payBusy && payBusyPhase === 'full' ? 'Redirecting…' : `Pay in full ${formatEurInline(gross)}`}
                      </LuxuryButton>
                    ) : pay === 'unpaid' ? (
                      <LuxuryButton
                        className="!px-5 !py-2.5"
                        disabled={payBusy || !props.onPayTransfer}
                        onClick={() => {
                          if (!props.onPayTransfer) {
                            return
                          }
                          setPayBusyId(t.id)
                          setPayBusyPhase('deposit')
                          void Promise.resolve(props.onPayTransfer(t, 'deposit')).finally(() => {
                            setPayBusyId(null)
                            setPayBusyPhase(null)
                          })
                        }}
                        type="button"
                        variant="primary"
                      >
                        <CreditCard className="mr-2 h-4 w-4" aria-hidden />
                        {payBusy && payBusyPhase === 'deposit' ? 'Redirecting…' : `Pay deposit ${formatEurInline(depEur)}`}
                      </LuxuryButton>
                    ) : (
                      <LuxuryButton
                        className="!px-5 !py-2.5"
                        disabled={payBusy || !props.onPayTransfer}
                        onClick={() => {
                          if (!props.onPayTransfer) {
                            return
                          }
                          setPayBusyId(t.id)
                          setPayBusyPhase('balance')
                          void Promise.resolve(props.onPayTransfer(t, 'balance')).finally(() => {
                            setPayBusyId(null)
                            setPayBusyPhase(null)
                          })
                        }}
                        type="button"
                        variant="primary"
                      >
                        <CreditCard className="mr-2 h-4 w-4" aria-hidden />
                        {payBusy && payBusyPhase === 'balance' ? 'Redirecting…' : `Pay balance ${formatEurInline(balEur)}`}
                      </LuxuryButton>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}

      {unpaidInvoices.length > 0 ? (
        <ul className={cx('space-y-3', pricedUnpaidTransfers.length > 0 ? 'mt-4' : 'mt-6')} aria-label="Trip invoice payments due">
          {unpaidInvoices.map((row) => (
            <li className="rounded-2xl border border-violet-200/80 bg-white px-4 py-4 shadow-sm sm:px-5" key={row.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-ge text-lg font-semibold text-forest-950">Trip invoice {row.invoice_number}</p>
                  <p className="mt-1 text-sm text-forest-600">
                    Ref <span className="font-mono">{row.enquiry_reference_id}</span> ·{' '}
                    <span className="font-semibold text-forest-900">{formatEurFromCents(row.amount_cents)}</span>
                  </p>
                </div>
                <LuxuryButton
                  className="shrink-0 !px-6 !py-2.5"
                  href={row.stripe_checkout_url!}
                  rel="noopener noreferrer"
                  target="_blank"
                  variant="primary"
                >
                  <CreditCard className="mr-2 h-4 w-4" aria-hidden />
                  Pay invoice
                </LuxuryButton>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {awaitingQuoteCount > 0 ? (
        <p className="mt-4 rounded-xl border border-forest-200/80 bg-offwhite/90 px-4 py-3 text-sm leading-relaxed text-forest-700">
          {awaitingQuoteCount === 1 ? 'One transfer' : `${awaitingQuoteCount} transfers`} on your account{' '}
          {awaitingQuoteCount === 1 ? 'is' : 'are'} waiting for a price from our team — pay buttons appear here as soon as
          your quote is saved.
        </p>
      ) : null}

      {showHistory && paymentHistory.length > 0 ? (
        <section
          aria-labelledby="client-all-payments-heading"
          className={cx(hasPayActions || awaitingQuoteCount > 0 ? 'mt-8 border-t border-forest-200/80 pt-8' : 'mt-6')}
          id={props.historyAnchorId ?? 'client-all-payments'}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-600">Payment history</p>
              <h3 className="font-display mt-1 text-xl font-semibold text-forest-950 sm:text-2xl" id="client-all-payments-heading">
                All payments
              </h3>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-forest-600">
                Every card payment recorded on your account — deposits, balances, full transfers, and trip invoices.
              </p>
            </div>
          </div>
          <ul className="mt-5 space-y-3" aria-label="All payments">
            {paymentHistory.map((item) => (
              <li
                className="rounded-2xl border border-emerald-200/90 bg-white px-4 py-4 shadow-sm sm:px-5"
                key={item.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-ge text-lg font-semibold text-forest-950">{item.title}</p>
                    <p className="mt-1 text-sm text-forest-600">{item.subtitle}</p>
                    <p className="mt-2 font-display text-xl font-bold text-brand-800">{item.amountDisplay}</p>
                    {item.kind === 'transfer' ? (
                      <p className="mt-2">
                        <TransferPaymentStatusBadge
                          deposit_percent={item.depositPercent}
                          payment_status={item.paymentStatus}
                          size="sm"
                        />
                      </p>
                    ) : (
                      <span className="mt-2 inline-flex rounded-full bg-emerald-200/80 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-950">
                        Paid
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {item.kind === 'transfer' && props.onDownloadTransferReceipt ? (
                      <LuxuryButton
                        className="!px-5 !py-2.5"
                        onClick={() => void props.onDownloadTransferReceipt?.(item.transfer)}
                        type="button"
                        variant="outlineOnLight"
                      >
                        <FileText className="mr-2 h-4 w-4" aria-hidden />
                        Receipt PDF
                      </LuxuryButton>
                    ) : null}
                    {item.kind === 'invoice' && props.onViewInvoice ? (
                      <LuxuryButton
                        className="!px-5 !py-2.5"
                        onClick={() => props.onViewInvoice?.(item.invoiceId)}
                        type="button"
                        variant="outlineOnLight"
                      >
                        <FileText className="mr-2 h-4 w-4" aria-hidden />
                        View invoice
                      </LuxuryButton>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : showHistory ? (
        <section
          className={cx(hasPayActions ? 'mt-8 border-t border-forest-200/80 pt-8' : 'mt-6')}
          id={props.historyAnchorId ?? 'client-all-payments'}
        >
          <p className="text-sm text-forest-600">No completed payments yet — they will appear here after your first Stripe checkout.</p>
        </section>
      ) : null}

      {!hasPayActions && props.transfers.length === 0 && invoices.length === 0 ? (
        <p className="mt-4 text-sm text-forest-600">
          When Golf Sol Ireland sends a transfer price or trip invoice, payment buttons will show here and under{' '}
          <strong className="font-medium text-forest-800">Payments</strong> in the menu.
        </p>
      ) : null}
    </section>
  )
}
