/**
 * Admin payment request mode: 20% deposit vs full remaining balance.
 * Stored on desk_quotes.trip_details.paymentRequest (JSONB — no migration).
 * Enquiry tracking uses amount_due_eur + deposit_eur + amount_received_eur.
 */

export const PAYMENT_REQUEST_MODES = /** @type {const} */ (['deposit_20', 'full'])

/** @typedef {'deposit_20' | 'full'} PaymentRequestMode */

/**
 * @param {unknown} raw
 * @returns {number | null}
 */
export const roundMoney2 = (raw) => {
  if (raw === null || raw === undefined || raw === '') return null
  const n = typeof raw === 'number' ? raw : Number(String(raw).replace(/,/g, '').trim())
  if (!Number.isFinite(n) || n < 0) return null
  return Math.round(n * 100) / 100
}

/**
 * @param {unknown} raw
 * @returns {PaymentRequestMode}
 */
export const normalizePaymentRequestMode = (raw) => {
  const s = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  if (s === 'deposit_20' || s === 'deposit' || s === '20' || s === 'deposit20') return 'deposit_20'
  if (s === 'full' || s === 'full_amount' || s === '100' || s === 'balance') return 'full'
  return 'deposit_20'
}

/**
 * @param {number | null | undefined} tripTotalEur
 * @returns {number | null}
 */
export const calcDeposit20Eur = (tripTotalEur) => {
  const total = roundMoney2(tripTotalEur)
  if (total == null || total <= 0) return null
  return roundMoney2(total * 0.2)
}

/**
 * @param {{
 *   mode?: unknown
 *   tripTotalEur?: unknown
 *   depositEur?: unknown
 *   amountReceivedEur?: unknown
 * }} input
 */
export const resolvePaymentRequestAmounts = (input = {}) => {
  const mode = normalizePaymentRequestMode(input.mode)
  const tripTotalEur = roundMoney2(input.tripTotalEur) ?? 0
  const received = roundMoney2(input.amountReceivedEur) ?? 0
  const outstanding = roundMoney2(Math.max(0, tripTotalEur - received)) ?? 0
  const autoDeposit = calcDeposit20Eur(tripTotalEur)
  const depositRaw = roundMoney2(input.depositEur)
  const depositEur =
    depositRaw != null && depositRaw > 0
      ? depositRaw
      : autoDeposit != null
        ? autoDeposit
        : 0

  let amountNowEur = 0
  if (mode === 'deposit_20') {
    // Request remaining deposit if partially paid toward deposit; else full deposit (capped by outstanding).
    const towardDeposit = Math.min(received, depositEur)
    const depositStillDue = roundMoney2(Math.max(0, depositEur - towardDeposit)) ?? 0
    amountNowEur = Math.min(depositStillDue, outstanding)
  } else {
    amountNowEur = outstanding
  }

  const remainingAfterNowEur = roundMoney2(Math.max(0, outstanding - amountNowEur)) ?? 0

  return {
    mode,
    tripTotalEur,
    depositEur,
    amountReceivedEur: received,
    outstandingEur: outstanding,
    amountNowEur,
    remainingAfterNowEur
  }
}

/**
 * Persistable blob for desk_quotes.trip_details.paymentRequest (no DB migration).
 * @param {ReturnType<typeof resolvePaymentRequestAmounts>} resolved
 */
export const buildPaymentRequestMeta = (resolved) => ({
  mode: resolved.mode,
  tripTotalEur: resolved.tripTotalEur,
  depositEur: resolved.depositEur,
  amountNowEur: resolved.amountNowEur,
  amountReceivedEur: resolved.amountReceivedEur,
  remainingAfterNowEur: resolved.remainingAfterNowEur
})

/**
 * @param {unknown} tripDetails
 * @returns {ReturnType<typeof buildPaymentRequestMeta> | null}
 */
export const readPaymentRequestMeta = (tripDetails) => {
  const trip = tripDetails && typeof tripDetails === 'object' ? tripDetails : null
  const raw = trip && typeof trip === 'object' && 'paymentRequest' in trip ? trip.paymentRequest : null
  if (!raw || typeof raw !== 'object') return null
  const mode = normalizePaymentRequestMode(/** @type {{ mode?: unknown }} */ (raw).mode)
  const tripTotalEur = roundMoney2(/** @type {{ tripTotalEur?: unknown }} */ (raw).tripTotalEur) ?? 0
  const depositEur = roundMoney2(/** @type {{ depositEur?: unknown }} */ (raw).depositEur) ?? 0
  const amountNowEur = roundMoney2(/** @type {{ amountNowEur?: unknown }} */ (raw).amountNowEur) ?? 0
  const amountReceivedEur = roundMoney2(/** @type {{ amountReceivedEur?: unknown }} */ (raw).amountReceivedEur) ?? 0
  const remainingAfterNowEur =
    roundMoney2(/** @type {{ remainingAfterNowEur?: unknown }} */ (raw).remainingAfterNowEur) ??
    Math.max(0, tripTotalEur - amountReceivedEur - amountNowEur)
  return {
    mode,
    tripTotalEur,
    depositEur,
    amountNowEur,
    amountReceivedEur,
    remainingAfterNowEur: remainingAfterNowEur ?? 0
  }
}

/**
 * @param {number} n
 */
export const formatEurIe = (n) =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number.isFinite(n) ? n : 0)

/**
 * Short admin / customer copy for the amount being requested now.
 * @param {ReturnType<typeof resolvePaymentRequestAmounts>} resolved
 */
export const paymentRequestSummaryLabel = (resolved) => {
  const now = formatEurIe(resolved.amountNowEur)
  const total = formatEurIe(resolved.tripTotalEur)
  if (resolved.mode === 'deposit_20') {
    return `Requesting 20% deposit: ${now} (of ${total} total)`
  }
  if (resolved.amountReceivedEur > 0) {
    return `Requesting remaining balance: ${now} (of ${total} total)`
  }
  return `Requesting full amount: ${now}`
}

/**
 * Customer-facing rows for pay page / emails.
 * @param {ReturnType<typeof resolvePaymentRequestAmounts> | ReturnType<typeof buildPaymentRequestMeta>} resolved
 * @param {{ amountCentsFallback?: number }} [opts]
 */
/**
 * Card checkout for a 20% deposit invoice must not settle the trip.
 * Full invoices, and a deposit-mode charge that actually covers the trip total,
 * keep the historical paid-in-full settlement. Missing meta stays full settlement
 * so older invoices are unchanged.
 *
 * @param {{ mode?: string, tripTotalEur?: number } | null | undefined} meta
 * @param {number | null | undefined} amountEur
 */
export const portalInvoiceSettlesTripInFull = (meta, amountEur) => {
  if (!meta || meta.mode !== 'deposit_20') return true
  const total = Number(meta.tripTotalEur)
  const paid = Number(amountEur)
  if (!Number.isFinite(total) || total <= 0) return true
  if (!Number.isFinite(paid) || paid <= 0) return true
  return paid + 0.009 >= total
}

/**
 * Fields written onto transfer_bookings when a portal invoice is paid.
 * Deposit requests keep the trip price and do not clear the balance chase.
 * @param {{
 *   settlesFull: boolean
 *   amountEur?: number | null
 *   adminPriceEur?: number | null
 *   tripTotalEur?: number | null
 * }} input
 */
export const buildPortalInvoiceTransferPatch = (input) => {
  const settlesFull = input.settlesFull !== false
  const amountEur = input.amountEur
  const adminPriceEur = Number(input.adminPriceEur)
  const tripTotalEur = Number(input.tripTotalEur)
  /** @type {Record<string, unknown>} */
  const patch = {
    payment_status: settlesFull ? 'paid' : 'deposit',
    payment_source: 'stripe',
    balance_remind_sent_at: null
  }
  if (settlesFull) patch.balance_remind_at = null

  const recorded =
    amountEur != null && amountEur > 0 ? amountEur : Number.isFinite(adminPriceEur) && adminPriceEur > 0 ? adminPriceEur : null
  if (recorded != null) patch.amount_received_eur = recorded

  if (
    !settlesFull &&
    Number.isFinite(tripTotalEur) &&
    tripTotalEur > 0 &&
    (!Number.isFinite(adminPriceEur) || adminPriceEur <= 0)
  ) {
    patch.admin_price_eur = tripTotalEur
  } else if (settlesFull && amountEur != null && amountEur > 0 && (!Number.isFinite(adminPriceEur) || adminPriceEur <= 0)) {
    patch.admin_price_eur = amountEur
  }
  return patch
}

/**
 * Price and status for a transfer row created from a paid portal invoice.
 * @param {{ settlesFull?: boolean, amountEur?: number | null, tripTotalEur?: number | null }} input
 */
export const newTransferPriceAndStatus = (input) => {
  const settlesFull = input.settlesFull !== false
  const amountEur = input.amountEur
  const tripTotal = Number(input.tripTotalEur)
  const priceEur =
    !settlesFull && Number.isFinite(tripTotal) && tripTotal > 0
      ? tripTotal
      : amountEur != null && amountEur > 0
        ? amountEur
        : null
  return {
    admin_price_eur: priceEur,
    payment_status: settlesFull ? 'paid' : 'deposit',
    amount_received_eur: amountEur != null && amountEur > 0 ? amountEur : null
  }
}

export const paymentRequestCustomerCopy = (resolved, opts = {}) => {
  const amountNow =
    resolved.amountNowEur > 0
      ? resolved.amountNowEur
      : typeof opts.amountCentsFallback === 'number'
        ? (opts.amountCentsFallback || 0) / 100
        : 0
  const tripTotal = resolved.tripTotalEur > 0 ? resolved.tripTotalEur : amountNow
  const remainingLater =
    typeof resolved.remainingAfterNowEur === 'number'
      ? resolved.remainingAfterNowEur
      : Math.max(0, tripTotal - (resolved.amountReceivedEur || 0) - amountNow)

  if (resolved.mode === 'deposit_20') {
    return {
      mode: /** @type {PaymentRequestMode} */ ('deposit_20'),
      headline: '20% deposit due now',
      amountNowLabel: formatEurIe(amountNow),
      amountNowEur: amountNow,
      rows: [
        ['Due now (20% deposit)', formatEurIe(amountNow)],
        ['Trip total', formatEurIe(tripTotal)],
        ...(remainingLater > 0.001 ? [['Remaining balance (later)', formatEurIe(remainingLater)]] : [])
      ],
      leadExtra:
        remainingLater > 0.001
          ? `Pay the ${formatEurIe(amountNow)} deposit now. The remaining ${formatEurIe(remainingLater)} is due later.`
          : `Pay the ${formatEurIe(amountNow)} deposit now.`
    }
  }

  return {
    mode: /** @type {PaymentRequestMode} */ ('full'),
    headline: resolved.amountReceivedEur > 0 ? 'Remaining balance due now' : 'Full amount due now',
    amountNowLabel: formatEurIe(amountNow),
    amountNowEur: amountNow,
    rows: [
      [resolved.amountReceivedEur > 0 ? 'Balance due now' : 'Amount due now', formatEurIe(amountNow)],
      ...(tripTotal > amountNow + 0.001 ? [['Trip total', formatEurIe(tripTotal)]] : []),
      ...(resolved.amountReceivedEur > 0.001
        ? [['Already received', formatEurIe(resolved.amountReceivedEur)]]
        : [])
    ],
    leadExtra: `Pay ${formatEurIe(amountNow)} now to settle this request.`
  }
}
