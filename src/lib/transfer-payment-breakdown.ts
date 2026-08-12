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

/** Short label for badges in client + admin dashboards (e.g. "20% deposit paid", "Paid in full"). */
export const transferPaymentBadgeLabel = (t: {
  readonly payment_status?: string | null
  readonly deposit_percent?: number | null
}): string => {
  const status = resolveTransferPaymentBadgeStatus(t)
  if (status === 'paid_in_full') {
    return 'Paid in full'
  }
  if (status === 'deposit_paid') {
    return `${normalizedDepositPercent(t.deposit_percent)}% deposit paid`
  }
  return 'Awaiting payment'
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
