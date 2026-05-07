/** Uses publishable key (test vs live) to pick the correct Stripe Dashboard slice. */

const stripePkIsTestMode = (): boolean => {
  const pk =
    typeof import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY === 'string'
      ? import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
      : ''
  return pk.includes('test')
}

/** Payment detail / receipt in Stripe Dashboard */
export function stripePaymentDashboardUrl(paymentIntentId: string | null | undefined): string | null {
  const id = typeof paymentIntentId === 'string' ? paymentIntentId.trim() : ''
  if (!id.startsWith('pi_')) {
    return null
  }
  return stripePkIsTestMode()
    ? `https://dashboard.stripe.com/test/payments/${id}`
    : `https://dashboard.stripe.com/payments/${id}`
}

/** Checkout session detail (session metadata, line items) */
export function stripeCheckoutSessionDashboardUrl(sessionId: string | null | undefined): string | null {
  const id = typeof sessionId === 'string' ? sessionId.trim() : ''
  if (!id.startsWith('cs_')) {
    return null
  }
  return stripePkIsTestMode()
    ? `https://dashboard.stripe.com/test/workbench/checkout/sessions/${id}`
    : `https://dashboard.stripe.com/workbench/checkout/sessions/${id}`
}
