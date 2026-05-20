/** Human-readable admin feedback after POST /api/sync-website-quote-payment */
export const syncWebsiteQuotePaymentNote = async (
  packageBuildId: string,
  token: string | undefined
): Promise<string> => {
  if (!token) {
    return ' Sign in again to publish Pay buttons on the client dashboard.'
  }
  try {
    const res = await fetch('/api/sync-website-quote-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ packageBuildId })
    })
    const data = (await res.json().catch(() => ({}))) as {
      message?: string
      mode?: string
      reason?: string
    }
    if (!res.ok) {
      return ` Payment link not updated: ${data.message ?? res.statusText}.`
    }
    if (data.mode === 'transfer') {
      return ' Pay deposit or balance is now live on their dashboard (Pay for your trip).'
    }
    if (data.mode === 'portal_invoice') {
      return ' Pay now (invoice) is on their dashboard under Payments.'
    }
    if (data.reason === 'already_paid') {
      return ' Transfer is already marked paid — no new payment buttons.'
    }
    if (data.reason === 'deposit_on_file' || data.reason === 'payment_locked') {
      return ` ${data.message ?? 'Transfer already has payment activity — existing payment buttons were left unchanged.'}`
    }
    if (data.reason === 'no_stripe') {
      return ' STRIPE_SECRET_KEY is missing — quote saved but no Stripe checkout link.'
    }
    if (data.mode === 'quote_only') {
      return ' Quote saved on the package; no transfer or invoice row was linked (check enquiry reference).'
    }
    return ''
  } catch {
    return ' Payment sync failed (network) — ask the client to refresh their dashboard.'
  }
}
