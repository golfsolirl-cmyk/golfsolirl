/**
 * Portal invoices opened for a branded email must stay 1:1 with a completed send.
 * A retry after success, or after the provider rejects the message, must not leave
 * a second payable invoice on the customer dashboard.
 */

const IN_FLIGHT_SEND_MS = 120_000

/** A live send with this idempotency key must not open a second invoice. */
export const inFlightSendBlocksRetry = (prior, now = Date.now()) => {
  if (prior?.status !== 'sending') return false
  const started = new Date(prior.created_at).getTime()
  if (!Number.isFinite(started)) return true
  return now - started < IN_FLIGHT_SEND_MS
}

/** Delete only an unpaid invoice. A row already marked paid stays so the charge is not lost. */
export const discardUnsentPortalInvoice = async (db, invoiceId) => {
  if (!invoiceId || !db) return
  const { error } = await db.from('portal_invoices').delete().eq('id', invoiceId).eq('status', 'sent')
  if (error) console.error('[admin-mail] discard portal invoice', error.message)
}

/**
 * @param {{
 *   priorStatus?: string | null
 *   openInvoice: () => Promise<{ invoiceId?: string | null }>
 *   work: (opened: { invoiceId?: string | null }) => Promise<{ duplicateCompleted?: boolean } | undefined>
 *   discardInvoice: (invoiceId: string | null | undefined) => Promise<void>
 * }} input
 */
export const runOncePortalSideEffect = async ({ priorStatus, openInvoice, work, discardInvoice }) => {
  if (priorStatus === 'sent') {
    return { skipped: true, duplicateCompleted: false, opened: null, result: null }
  }

  const opened = await openInvoice()
  try {
    const result = await work(opened)
    if (result?.duplicateCompleted) {
      await discardInvoice(opened?.invoiceId)
      return { skipped: true, duplicateCompleted: true, opened, result }
    }
    return { skipped: false, duplicateCompleted: false, opened, result }
  } catch (error) {
    await discardInvoice(opened?.invoiceId)
    throw error
  }
}
