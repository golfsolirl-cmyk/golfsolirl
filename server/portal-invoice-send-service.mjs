import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { handleSendClientPortalEmail } from './client-portal-email-service.mjs'
import { buildPortalInvoicePdfBytes } from './portal-invoice-pdf.mjs'

const throwStatus = (message, statusCode) => {
  const err = new Error(message)
  err.statusCode = statusCode
  throw err
}

const getSiteOrigin = (env) => {
  const site = env.SITE_URL?.trim()
  if (site) {
    try {
      return new URL(site.startsWith('http') ? site : `https://${site}`).origin
    } catch {
      /* continue */
    }
  }
  const vercel = env.VERCEL_URL?.trim()
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, '')
    return `https://${host}`
  }
  return 'http://localhost:5173'
}

const fmtEur = (n) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(
    Number(n) || 0
  )

/**
 * Admin: price an enquiry → Stripe Checkout + portal row + branded email with invoice PDF.
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handlePortalInvoiceSend = async (body, env = process.env, meta = {}) => {
  const auth = await requireAdminFromBearer(meta.authHeader, env)
  if (!auth.ok) {
    throwStatus(auth.message, auth.statusCode)
  }

  const stripeKey = env.STRIPE_SECRET_KEY?.trim()
  if (!stripeKey) {
    throwStatus('STRIPE_SECRET_KEY is not set.', 500)
  }

  const url = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    throwStatus('Supabase is not configured on the server.', 500)
  }

  const enquiryId = typeof body?.enquiryId === 'string' ? body.enquiryId.trim() : ''
  const amountRaw = body?.amountEur
  const amountEur = typeof amountRaw === 'number' ? amountRaw : typeof amountRaw === 'string' ? Number(amountRaw) : NaN
  if (!enquiryId) {
    throwStatus('enquiryId is required.', 400)
  }
  if (!Number.isFinite(amountEur) || amountEur < 0.5) {
    throwStatus('amountEur must be at least €0.50.', 400)
  }

  const amountCents = Math.round(amountEur * 100)
  if (amountCents < 50) {
    throwStatus('amountEur must be at least €0.50.', 400)
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { data: enquiry, error: enqErr } = await supabase
    .from('enquiries')
    .select('id, reference_id, email, full_name')
    .eq('id', enquiryId)
    .maybeSingle()

  if (enqErr || !enquiry?.email?.trim()) {
    throwStatus(enqErr?.message ?? 'Enquiry not found.', 404)
  }

  const enquiryEmail = enquiry.email.trim().toLowerCase()
  const referenceId = typeof enquiry.reference_id === 'string' ? enquiry.reference_id.trim() : ''
  const fullName = typeof enquiry.full_name === 'string' ? enquiry.full_name.trim() : ''

  const { data: clientProfile, error: profErr } = await supabase
    .from('profiles')
    .select('id, email, account_reference_id, full_name')
    .ilike('email', enquiryEmail)
    .maybeSingle()

  if (profErr || !clientProfile?.id) {
    throwStatus(
      'No portal profile exists for this enquiry email. Create the client under Admin → portal clients first, then they must sign in once.',
      400
    )
  }

  const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  const accountRef =
    typeof clientProfile.account_reference_id === 'string' && clientProfile.account_reference_id.trim()
      ? clientProfile.account_reference_id.trim()
      : `GSOL-${clientProfile.id.slice(0, 8).toUpperCase()}`

  const issuedAtIso = new Date().toISOString()

  const { data: inserted, error: insErr } = await supabase
    .from('portal_invoices')
    .insert({
      profile_id: clientProfile.id,
      enquiry_id: enquiry.id,
      enquiry_reference_id: referenceId || enquiry.id.slice(0, 12),
      amount_cents: amountCents,
      currency: 'eur',
      status: 'sent',
      invoice_number: invoiceNumber,
      sent_by: auth.user.id
    })
    .select('id')
    .single()

  if (insErr || !inserted?.id) {
    throwStatus(insErr?.message ?? 'Could not create invoice record.', 500)
  }

  const invoiceRowId = inserted.id
  const origin = getSiteOrigin(env)
  const successUrl = `${origin}/dashboard?invoice_paid=1&checkout_session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${origin}/dashboard?invoice_cancel=1`

  const stripe = new Stripe(stripeKey)
  let session
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: enquiryEmail,
      client_reference_id: invoiceRowId,
      metadata: { portal_invoice_id: invoiceRowId },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: amountCents,
            product_data: {
              name: `Golf Sol trip — ${referenceId || 'enquiry'}`,
              description: `Invoice ${invoiceNumber}`
            }
          }
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl
    })
  } catch (e) {
    await supabase.from('portal_invoices').delete().eq('id', invoiceRowId)
    const msg = e instanceof Error ? e.message : 'Stripe Checkout failed.'
    throwStatus(msg, 502)
  }

  const checkoutUrl = session.url
  const sessionId = session.id
  if (!checkoutUrl || !sessionId) {
    await supabase.from('portal_invoices').delete().eq('id', invoiceRowId)
    throwStatus('Stripe did not return a checkout URL.', 502)
  }

  const { error: upErr } = await supabase
    .from('portal_invoices')
    .update({
      stripe_checkout_session_id: sessionId,
      stripe_checkout_url: checkoutUrl
    })
    .eq('id', invoiceRowId)

  if (upErr) {
    await supabase.from('portal_invoices').delete().eq('id', invoiceRowId)
    throwStatus(upErr.message, 500)
  }

  const pdfBytes = await buildPortalInvoicePdfBytes({
    invoiceNumber,
    enquiryReferenceId: referenceId || enquiry.id.slice(0, 12),
    accountReferenceDisplay: accountRef,
    clientName: fullName || (typeof clientProfile.full_name === 'string' ? clientProfile.full_name.trim() : '') || 'Client',
    clientEmail: enquiryEmail,
    amountCents,
    issuedAtIso
  })

  const filename = `golf-sol-invoice-${invoiceNumber.replace(/[^\w.-]+/g, '-')}.pdf`
  const contentBase64 = Buffer.from(pdfBytes).toString('base64')

  const subject = `Your trip invoice — ${referenceId || invoiceNumber}`
  const message = [
    `We have prepared your trip invoice (${invoiceNumber}) for ${fmtEur(amountEur)}.`,
    '',
    `Your account reference on file: ${accountRef}.`,
    '',
    'Sign in to your client dashboard to review your submitted itinerary and pay securely with Pay now (Stripe).',
    '',
    `If the button in the portal does not open, use this checkout link once: ${checkoutUrl}`
  ].join('\n')

  const emailResult = await handleSendClientPortalEmail(
    {
      clientEmail: enquiryEmail,
      subject,
      message,
      attachments: [{ filename, contentBase64, contentType: 'application/pdf' }]
    },
    env,
    meta
  )

  return {
    ok: true,
    invoiceId: invoiceRowId,
    invoiceNumber,
    checkoutUrl,
    email: emailResult
  }
}
