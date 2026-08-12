import { useMemo, useState } from 'react'
import { CheckCircle2, Clock3, Trash2 } from 'lucide-react'
import { PortalAddToYourTripStrip } from './portal-add-to-your-trip-strip'
import { PortalInterestCategoryGlyph } from './portal-interest-category-glyph'
import {
  PORTAL_INTEREST_LABELS,
  type PortalInterestCategory,
  type PortalInterestTicketRow
} from '../lib/portal-interest-tickets'
import {
  balanceAmountEur,
  depositAmountEur,
  normalizedDepositPercent,
  resolveTransferPaymentBadgeStatus,
  transferPaymentBadgeLabel,
  transferPaymentFullUpfront,
  type TransferPaymentBreakdownInput
} from '../lib/transfer-payment-breakdown'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import { cx } from '../lib/utils'

const formatEur = (n: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

export type TripBuilderTransferLine = TransferPaymentBreakdownInput & {
  readonly id: string
  readonly pickup_label: string
  readonly dropoff_label: string
}

const paidAndAwaitingForTransfer = (t: TripBuilderTransferLine): { paid: number; awaiting: number; gross: number } => {
  const gross =
    typeof t.admin_price_eur === 'number' && Number.isFinite(t.admin_price_eur) && t.admin_price_eur > 0
      ? t.admin_price_eur
      : 0
  if (gross <= 0) {
    return { paid: 0, awaiting: 0, gross: 0 }
  }
  const badge = resolveTransferPaymentBadgeStatus(t)
  if (badge === 'paid_in_full') {
    return { paid: gross, awaiting: 0, gross }
  }
  if (badge === 'deposit_paid') {
    const pct = normalizedDepositPercent(t.deposit_percent)
    const dep = depositAmountEur(gross, pct)
    const bal = balanceAmountEur(gross, pct)
    return { paid: dep, awaiting: bal, gross }
  }
  // unpaid — full amount awaiting (even if ASAP full-upfront)
  void transferPaymentFullUpfront(t)
  return { paid: 0, awaiting: gross, gross }
}

export function PortalTripBuilderRequests(props: {
  readonly tickets: readonly PortalInterestTicketRow[]
  readonly transfers: readonly TripBuilderTransferLine[]
  readonly onAdd: (category: PortalInterestCategory) => void
  readonly onTicketsChange: (next: readonly PortalInterestTicketRow[]) => void
  readonly onOpenThread?: (ticketId: string) => void
}) {
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [removeError, setRemoveError] = useState<string | null>(null)

  const activeTickets = props.tickets.filter((t) => t.status !== 'closed')

  const money = useMemo(() => {
    let paid = 0
    let awaiting = 0
    let tripTotal = 0

    for (const t of props.transfers) {
      const row = paidAndAwaitingForTransfer(t)
      paid += row.paid
      awaiting += row.awaiting
      tripTotal += row.gross
    }

    for (const t of activeTickets) {
      const q = typeof t.admin_quote_eur === 'number' && Number.isFinite(t.admin_quote_eur) ? t.admin_quote_eur : 0
      if (q > 0) {
        tripTotal += q
        // Interest-ticket quotes are not Stripe-paid yet — count as awaiting.
        awaiting += q
      }
    }

    return {
      paid: Math.round(paid * 100) / 100,
      awaiting: Math.round(awaiting * 100) / 100,
      tripTotal: Math.round(tripTotal * 100) / 100
    }
  }, [props.transfers, activeTickets])

  const pendingCount = activeTickets.filter(
    (t) => !(typeof t.admin_quote_eur === 'number' && t.admin_quote_eur > 0)
  ).length

  const pricedTransfers = props.transfers.filter(
    (t) => typeof t.admin_price_eur === 'number' && Number.isFinite(t.admin_price_eur) && t.admin_price_eur > 0
  )

  const removeTicket = async (ticketId: string) => {
    setRemoveError(null)
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setRemoveError('Connection unavailable.')
      return
    }
    setRemovingId(ticketId)
    try {
      const { error } = await supabase.rpc('close_my_portal_interest_ticket', { p_ticket_id: ticketId })
      if (error) {
        throw new Error(error.message)
      }
      props.onTicketsChange(
        props.tickets.map((t) => (t.id === ticketId ? { ...t, status: 'closed' } : t))
      )
    } catch (e) {
      setRemoveError(e instanceof Error ? e.message : 'Could not remove this request.')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PortalAddToYourTripStrip onSelect={props.onAdd} />

      <section className="rounded-[1.75rem] border border-forest-100 bg-white p-5 shadow-soft sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Your trip requests</p>
            <h3 className="mt-1 font-display text-2xl font-semibold text-forest-950">Add, remove, then we price</h3>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-forest-600">
              Each request goes to Golf Sol Ireland. When we add a price, it joins your trip total with airport and hotel
              transfers.
            </p>
          </div>
        </div>

        {money.tripTotal > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-forest-200 bg-offwhite/80 px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-forest-600">Trip total so far</p>
              <p className="mt-1 font-display text-2xl font-bold text-forest-950">{formatEur(money.tripTotal)}</p>
            </div>
            <div className="rounded-2xl border border-emerald-300/70 bg-emerald-50/90 px-4 py-4">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                Paid
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-emerald-950">{formatEur(money.paid)}</p>
              <p className="mt-1 text-sm text-emerald-900/80">
                {money.paid > 0 ? 'Settled on card (incl. deposits).' : 'Nothing paid yet.'}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-300/80 bg-[#fff9e8] px-4 py-4">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-900">
                <Clock3 className="h-3.5 w-3.5" aria-hidden />
                Awaiting payment
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-forest-950">{formatEur(money.awaiting)}</p>
              <p className="mt-1 text-sm text-forest-700">
                {money.awaiting > 0 ? 'Still to pay on this trip.' : 'All quoted amounts are paid.'}
              </p>
            </div>
          </div>
        ) : null}

        {removeError ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {removeError}
          </p>
        ) : null}

        {pricedTransfers.length > 0 ? (
          <div className="mt-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-forest-700">Transfers on this trip</p>
            <ul className="mt-3 space-y-3">
              {pricedTransfers.map((t) => {
                const row = paidAndAwaitingForTransfer(t)
                const badge = resolveTransferPaymentBadgeStatus(t)
                return (
                  <li
                    className="rounded-2xl border border-forest-100 bg-offwhite/60 px-4 py-4"
                    key={t.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display text-lg font-semibold text-forest-950">
                          {t.pickup_label} → {t.dropoff_label}
                        </p>
                        <p className="mt-1 text-sm text-forest-600">Quoted {formatEur(row.gross)}</p>
                      </div>
                      <span
                        className={cx(
                          'inline-flex rounded-full px-3 py-1 text-sm font-bold',
                          badge === 'paid_in_full' && 'bg-emerald-700 text-white',
                          badge === 'deposit_paid' && 'bg-amber-100 text-amber-950 ring-1 ring-amber-300/80',
                          badge === 'unpaid' && 'bg-white text-forest-800 ring-1 ring-forest-200'
                        )}
                      >
                        {transferPaymentBadgeLabel(t)}
                      </span>
                    </div>
                    <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                      <div className="rounded-xl bg-white/90 px-3 py-2 ring-1 ring-forest-100">
                        <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-800">Paid</dt>
                        <dd className="mt-0.5 font-semibold text-forest-950">{formatEur(row.paid)}</dd>
                      </div>
                      <div className="rounded-xl bg-white/90 px-3 py-2 ring-1 ring-forest-100">
                        <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-amber-900">Awaiting payment</dt>
                        <dd className="mt-0.5 font-semibold text-forest-950">{formatEur(row.awaiting)}</dd>
                      </div>
                    </dl>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-forest-700">Open requests</p>
          {activeTickets.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-dashed border-forest-200 bg-offwhite/70 px-4 py-5 text-base text-forest-600">
              No open requests yet. Use the three buttons above to add transfers, golf, or accommodation.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {activeTickets.map((t) => {
                const quoted =
                  typeof t.admin_quote_eur === 'number' && Number.isFinite(t.admin_quote_eur) && t.admin_quote_eur > 0
                    ? t.admin_quote_eur
                    : null
                return (
                  <li
                    className="flex flex-col gap-3 rounded-2xl border border-forest-100 bg-offwhite/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                    key={t.id}
                  >
                    <button
                      className="flex min-w-0 flex-1 items-start gap-3 text-left"
                      onClick={() => props.onOpenThread?.(t.id)}
                      type="button"
                    >
                      <PortalInterestCategoryGlyph category={t.category} size="md" />
                      <span className="min-w-0">
                        <span className="block font-display text-lg font-semibold text-forest-950">
                          {PORTAL_INTEREST_LABELS[t.category]}
                        </span>
                        <span className="mt-0.5 block text-sm text-forest-600">
                          {t.status === 'answered' ? 'Golf Sol replied' : 'Awaiting quote'} ·{' '}
                          {new Date(t.created_at).toLocaleString(undefined, {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {quoted != null ? (
                          <span className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex rounded-full bg-forest-900 px-3 py-1 text-sm font-bold text-white">
                              Quoted {formatEur(quoted)}
                            </span>
                            <span className="inline-flex rounded-full bg-[#fff9e8] px-3 py-1 text-sm font-bold text-amber-950 ring-1 ring-amber-300/80">
                              Awaiting payment
                            </span>
                          </span>
                        ) : (
                          <span className="mt-2 inline-flex rounded-full border border-forest-200 bg-white px-3 py-1 text-sm font-semibold text-forest-700">
                            Price pending
                          </span>
                        )}
                      </span>
                    </button>
                    <button
                      className={cx(
                        'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-forest-200 bg-white px-4 py-2 text-sm font-semibold text-forest-800 transition hover:border-red-300 hover:bg-red-50 hover:text-red-800',
                        removingId === t.id && 'opacity-60'
                      )}
                      disabled={removingId === t.id}
                      onClick={() => void removeTicket(t.id)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                      {removingId === t.id ? 'Removing…' : 'Remove'}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {pendingCount > 0 ? (
          <p className="mt-4 text-sm text-forest-600">
            {pendingCount} request{pendingCount === 1 ? '' : 's'} waiting for a Golf Sol price.
          </p>
        ) : null}
      </section>
    </div>
  )
}
