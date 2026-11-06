/** Mirrors server/transfer-payment-amounts.mjs for client UI. */

export type TransferPaymentBreakdownInput = {
  readonly next_available_driver?: boolean | null
  readonly scheduled_at?: string | null
  readonly admin_price_eur?: number | null
  readonly deposit_percent?: number | null
  readonly payment_status?: string | null
}

/** Matches server `isTransferFullUpfront` — ASAP / next-available only (deposit quotes clear that flag). */
export const transferPaymentFullUpfront = (t: TransferPaymentBreakdownInput): boolean =>
  t.next_available_driver === true

export const normalizedDepositPercent = (raw: number | null | undefined): number => {
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n)) {
    return 20
  }
  return Math.min(99, Math.max(1, Math.round(n)))
}

const round2 = (n: number) => Math.round(n * 100) / 100

/** pct of gross (e.g. 20 → 20% of gross in EUR). */
export const depositAmountEur = (gross: number, pct: number): number => round2((gross * pct) / 100)

/** Remainder of gross after deposit pct (e.g. 80% when pct is 20). */
export const balanceAmountEur = (gross: number, pct: number): number => round2((gross * (100 - pct)) / 100)

/** Human-readable instant: 48 hours before scheduled pickup (Europe/Málaga display via local browser). */
export const balanceDueInstant = (scheduledAtIso: string | null | undefined): Date | null => {
  const s = scheduledAtIso == null ? '' : String(scheduledAtIso).trim()
  if (!s) {
    return null
  }
  const trip = new Date(s)
  if (Number.isNaN(trip.getTime())) {
    return null
  }
  return new Date(trip.getTime() - 2 * 24 * 60 * 60 * 1000)
}

export const formatBalanceDueLine = (scheduledAtIso: string | null | undefined): string | null => {
  const d = balanceDueInstant(scheduledAtIso)
  if (!d) {
    return null
  }
  return `Balance due by ${d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} (48 hours before pickup).`
}

/** Ops row still `pending` but Stripe is fully settled — show “confirmed” in the client portal. */
export const clientTransferOperationalStatusLabel = (t: {
  readonly status: string
  readonly payment_status?: string | null
}): string => {
  const pay = String(t.payment_status ?? 'unpaid').toLowerCase()
  const st = String(t.status ?? '').toLowerCase()
  if (pay === 'paid' && st === 'pending') {
    return 'confirmed'
  }
  return String(t.status ?? '').replace(/_/g, ' ')
}

export type TransferPaymentBadgeStatus = 'unpaid' | 'deposit_paid' | 'paid_in_full'

/** @deprecated Use `resolveTransferPaymentBadgeStatus` */
export type ClientTransferPaymentBadgeKind = 'deposit_paid' | 'paid_in_full'

export const resolveTransferPaymentBadgeStatus = (t: {
  readonly payment_status?: string | null
}): TransferPaymentBadgeStatus => {
  const pay = String(t.payment_status ?? 'unpaid').toLowerCase()
  if (pay === 'paid') {
    return 'paid_in_full'
  }
  if (pay === 'deposit') {
    return 'deposit_paid'
  }
  return 'unpaid'
}

/** Short label for badges in client + admin dashboards: Unpaid, Deposit paid, or Paid in full. */
export const transferPaymentBadgeLabel = (t: {
  readonly payment_status?: string | null
  readonly deposit_percent?: number | null
}): string => {
  const status = resolveTransferPaymentBadgeStatus(t)
  if (status === 'paid_in_full') {
    return 'Paid in full'
  }
  if (status === 'deposit_paid') {
    return 'Deposit paid'
  }
  return 'Unpaid'
}

const formatTripMoney = (n: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

/** Euros already received. Uses the stored amount when the desk or Stripe recorded one. */
export const transferAmountReceivedEur = (t: {
  readonly payment_status?: string | null
  readonly admin_price_eur?: number | null
  readonly deposit_percent?: number | null
  readonly amount_received_eur?: number | null
}): number => {
  const pay = String(t.payment_status ?? 'unpaid').toLowerCase()
  const recorded = Number(t.amount_received_eur)
  if ((pay === 'paid' || pay === 'deposit') && Number.isFinite(recorded) && recorded > 0) {
    return Math.round(recorded * 100) / 100
  }
  const gross = typeof t.admin_price_eur === 'number' && Number.isFinite(t.admin_price_eur) ? t.admin_price_eur : 0
  if (pay === 'paid' && gross > 0) {
    return gross
  }
  if (pay === 'deposit' && gross > 0) {
    return depositAmountEur(gross, normalizedDepositPercent(t.deposit_percent))
  }
  return 0
}

/** One line for the client: unpaid, deposit paid, or paid in full, with the amount received. */
export const transferPaymentStory = (t: {
  readonly payment_status?: string | null
  readonly admin_price_eur?: number | null
  readonly deposit_percent?: number | null
  readonly amount_received_eur?: number | null
}): string => {
  const status = resolveTransferPaymentBadgeStatus(t)
  const gross = typeof t.admin_price_eur === 'number' && Number.isFinite(t.admin_price_eur) && t.admin_price_eur > 0 ? t.admin_price_eur : null
  const received = transferAmountReceivedEur(t)
  if (status === 'unpaid') {
    return gross != null ? `Unpaid. Nothing received yet. Trip total ${formatTripMoney(gross)}.` : 'Unpaid. Nothing received yet.'
  }
  if (status === 'deposit_paid') {
    if (gross != null) {
      const balance = Math.max(0, Math.round((gross - received) * 100) / 100)
      return `Deposit paid. You have paid ${formatTripMoney(received)} of ${formatTripMoney(gross)}. Balance ${formatTripMoney(balance)}.`
    }
    return `Deposit paid. You have paid ${formatTripMoney(received)}.`
  }
  return gross != null
    ? `Paid in full. You have paid ${formatTripMoney(received || gross)}.`
    : 'Paid in full.'
}

export const clientTransferPaymentBadgeKind = (t: {
  readonly payment_status?: string | null
}): ClientTransferPaymentBadgeKind | null => {
  const status = resolveTransferPaymentBadgeStatus(t)
  if (status === 'deposit_paid') {
    return 'deposit_paid'
  }
  if (status === 'paid_in_full') {
    return 'paid_in_full'
  }
  return null
}
