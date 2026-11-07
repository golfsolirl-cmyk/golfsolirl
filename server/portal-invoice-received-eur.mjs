const positiveEur = (raw) => {
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.round(n * 100) / 100
}

/**
 * Euros received after a portal invoice is paid.
 * A smaller invoice must not erase a deposit already stored on the transfer.
 *
 * @param {Record<string, unknown> | null | undefined} booking
 * @param {number | null | undefined} amountEur
 * @returns {number | null}
 */
export const recordedEurAfterPortalInvoicePayment = (booking, amountEur) => {
  const prior = positiveEur(booking?.amount_received_eur)
  const incoming = positiveEur(amountEur)
  if (prior > 0 && incoming > 0) return Math.max(prior, incoming)
  if (incoming > 0) return incoming
  if (prior > 0) return prior
  const quoted = positiveEur(booking?.admin_price_eur)
  return quoted > 0 ? quoted : null
}
