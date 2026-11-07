/**
 * `payment_source` and `amount_received_eur` were added in
 * 20261106140000_transfer_bookings_manual_payment.sql.
 * Card checkout and the admin desk must still record `payment_status` when that
 * migration is not on the database yet (PostgREST schema cache included).
 */

/** @param {unknown} error */
export const isMissingPaymentLedgerColumnError = (error) =>
  /payment_source|amount_received_eur/i.test(String(error && typeof error === 'object' && 'message' in error ? error.message : error ?? ''))

/** @param {Record<string, unknown>} patch */
export const omitPaymentLedgerColumns = (patch) => {
  const next = { ...patch }
  delete next.payment_source
  delete next.amount_received_eur
  return next
}

/** @param {string} columns */
export const omitPaymentLedgerSelect = (columns) =>
  columns
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part && part !== 'payment_source' && part !== 'amount_received_eur')
    .join(', ')

/**
 * Run a transfer_bookings write. If PostgREST rejects the new ledger columns,
 * repeat the write without them so payment_status is not left unchanged.
 *
 * @template T
 * @param {(patch: Record<string, unknown>) => Promise<{ data?: T, error?: { message?: string } | null }>} run
 * @param {Record<string, unknown>} patch
 */
export const writeTransferPaymentPatch = async (run, patch) => {
  const first = await run(patch)
  if (first?.error && isMissingPaymentLedgerColumnError(first.error)) {
    return run(omitPaymentLedgerColumns(patch))
  }
  return first
}
