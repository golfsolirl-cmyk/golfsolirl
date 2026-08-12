/**
 * Transfer deposit vs full-upfront rules (mirrors src/lib/transfer-payment-breakdown.ts).
 */

/**
 * Full upfront (no deposit/balance split) when the job is flagged next-available / ASAP.
 * Admin “Send deposit quote” clears `next_available_driver` so a 20% deposit can apply
 * even before a pickup datetime is set.
 *
 * @param {{ next_available_driver?: unknown; scheduled_at?: unknown }} booking
 */
export const isTransferFullUpfront = (booking) => booking.next_available_driver === true

/** @param {unknown} raw */
export const normalizedDepositPercent = (raw) => {
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n)) {
    return 20
  }
  return Math.min(99, Math.max(1, Math.round(n)))
}

/**
 * When `balance_remind_at` is stored (balance reminder email queue time).
 *
 * **Production (default):** 48 hours before `scheduledAtIso` (pickup). If that instant is already in the past,
 * use at least 5 minutes from now so the sweep can still send.
 *
 * **Dev / testing:** set `TRANSFER_BALANCE_REMINDER_AFTER_MINUTES` (e.g. `2`) to ignore pickup date and schedule
 * N minutes after the deposit event instead. Omit or empty on production.
 *
 * @param {unknown} scheduledAtIso
 */
export const balanceDueReminderIso = (scheduledAtIso) => {
  const env = typeof process !== 'undefined' && process.env ? process.env : {}
  const rawMin = env.TRANSFER_BALANCE_REMINDER_AFTER_MINUTES?.trim()
  if (rawMin !== undefined && rawMin !== '') {
    const n = Number(rawMin)
    if (Number.isFinite(n) && n >= 0 && n <= 20160) {
      const ms = (n <= 0 ? 1 : n) * 60 * 1000
      return new Date(Date.now() + ms).toISOString()
    }
  }

  const s = scheduledAtIso == null ? '' : String(scheduledAtIso).trim()
  if (!s) {
    return new Date(Date.now() + 60 * 60 * 1000).toISOString()
  }
  const trip = new Date(s)
  if (Number.isNaN(trip.getTime())) {
    return new Date(Date.now() + 60 * 60 * 1000).toISOString()
  }
  const due = new Date(trip.getTime() - 2 * 24 * 60 * 60 * 1000)
  const min = new Date(Date.now() + 5 * 60 * 1000)
  return (due.getTime() < min.getTime() ? min : due).toISOString()
}

const round2 = (n) => Math.round(n * 100) / 100

/** pct of gross (e.g. 20 → 20% of gross in EUR). */
export const depositAmountEur = (gross, pct) => round2((gross * pct) / 100)

/** Remainder of gross after deposit pct. */
export const balanceAmountEur = (gross, pct) => round2((gross * (100 - pct)) / 100)
