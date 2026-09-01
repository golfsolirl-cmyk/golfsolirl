/**
 * Re-quoting from the enquiry desk must not clobber a transfer that already collected money.
 * Checkout only blocks `paid`; resetting `deposit`/`paid` → `unpaid` lets the guest pay again.
 *
 * @param {unknown} paymentStatus
 * @returns {string | null} user-facing lock reason, or null when a new quote is allowed
 */
export const enquiryAdminQuoteCollectedPaymentLockMessage = (paymentStatus) => {
  const st = String(paymentStatus ?? 'unpaid').trim().toLowerCase()
  if (st === 'paid') {
    return 'This enquiry already has a fully paid transfer. Re-quoting here would mark it unpaid and let the guest pay again. Adjust the job from Transfers & drivers.'
  }
  if (st === 'deposit') {
    return 'This enquiry already has a deposit on file. Re-quoting here would reset it to unpaid and charge the guest again. Collect the balance from Transfers & drivers.'
  }
  return null
}
