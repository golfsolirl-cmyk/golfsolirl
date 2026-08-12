/**
 * After admin saves a website_form package quote (adminQuote on package_builds.config),
 * mirror the VAT-inclusive total into what the client dashboard uses to pay:
 * - transfer_bookings.admin_price_eur (deposit / balance Stripe checkout), or
 * - portal_invoices + Stripe Checkout when no unpaid transfer row exists.
 */
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { publishTransferAdminPricePortalPdfs } from './transfer-portal-publish-admin-price-pdfs.mjs'

const TOURISM_VAT_RATE = 0.135

const throwStatus = (message, statusCode = 400) => {
  const e = new Error(message)
  e.statusCode = statusCode
  throw e
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

const getCheckoutReturnOrigin = (env) => {
  const raw = env.TRANSFER_CHECKOUT_ORIGIN?.trim() || env.TRANSFER_CHECKOUT_SITE_URL?.trim()
  if (raw) {
    try {
      return new URL(raw.startsWith('http') ? raw : `https://${raw}`).origin
    } catch {
      /* fall through */
    }
  }
  return getSiteOrigin(env)
}

/** @param {unknown} raw */
const parseAdminQuote = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return null
  }
  const o = raw
  const gross = Number(o.grossTotalEur)
  const rate = Number(o.vatRate)
  if (!Number.isFinite(gross) || gross < 0.5 || !Number.isFinite(rate) || rate < 0 || rate >= 1) {
    return null
  }
  return {
    grossTotalEur: Math.round(gross * 100) / 100,
    vatRate: rate
  }
}

/** @param {number} vatRate */
const vatTreatmentFromRate = (vatRate) =>
  Math.abs(vatRate - TOURISM_VAT_RATE) < 0.02 ? 'tourism' : 'services'

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {import('node:process').ProcessEnv} env
 * @param {{ profileId: string, enquiryId: string, referenceId: string, clientEmail: string, grossEur: number, sentBy: string }} ctx
 */
const upsertPortalInvoiceCheckout = async (admin, env, ctx) => {
  const stripeKey = env.STRIPE_SECRET_KEY?.trim()
  if (!stripeKey) {
    return { ok: false, reason: 'no_stripe' }
  }

  const amountCents = Math.round(ctx.grossEur * 100)
  if (amountCents < 50) {
    return { ok: false, reason: 'amount_too_low' }
  }

  const { data: existing } = await admin
    .from('portal_invoices')
    .select('id, status, invoice_number')
    .eq('enquiry_id', ctx.enquiryId)
    .eq('profile_id', ctx.profileId)
    .neq('status', 'paid')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let invoiceRowId = existing?.id ? String(existing.id) : ''
  let invoiceNumber =
    typeof existing?.invoice_number === 'string' && existing.invoice_number.trim()
      ? existing.invoice_number.trim()
      : `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

  if (!invoiceRowId) {
    const { data: inserted, error: insErr } = await admin
      .from('portal_invoices')
      .insert({
        profile_id: ctx.profileId,
        enquiry_id: ctx.enquiryId,
        enquiry_reference_id: ctx.referenceId || ctx.enquiryId.slice(0, 12),
        amount_cents: amountCents,
        currency: 'eur',
        status: 'sent',
        invoice_number: invoiceNumber,
        sent_by: ctx.sentBy
      })
      .select('id')
      .single()

    if (insErr || !inserted?.id) {
      throwStatus(insErr?.message ?? 'Could not create invoice record.', 500)
    }
    invoiceRowId = String(inserted.id)
  } else {
    const { error: upAmtErr } = await admin
      .from('portal_invoices')
      .update({ amount_cents: amountCents })
      .eq('id', invoiceRowId)
    if (upAmtErr) {
      throwStatus(upAmtErr.message, 500)
    }
  }

  const origin = getCheckoutReturnOrigin(env)
  const stripe = new Stripe(stripeKey)
  let session
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: ctx.clientEmail,
      client_reference_id: invoiceRowId,
      metadata: { portal_invoice_id: invoiceRowId },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: amountCents,
            product_data: {
              name: `Golf Sol trip — ${ctx.referenceId || 'enquiry'}`,
              description: `Invoice ${invoiceNumber}`
            }
          }
        }
      ],
      success_url: `${origin}/dashboard?invoice_paid=1&checkout_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?invoice_cancel=1`
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Stripe Checkout failed.'
    throwStatus(msg, 502)
  }

  const checkoutUrl = session.url
  const sessionId = session.id
  if (!checkoutUrl || !sessionId) {
    throwStatus('Stripe did not return a checkout URL.', 502)
  }

  const { error: upErr } = await admin
    .from('portal_invoices')
    .update({
      stripe_checkout_session_id: sessionId,
      stripe_checkout_url: checkoutUrl
    })
    .eq('id', invoiceRowId)

  if (upErr) {
    throwStatus(upErr.message, 500)
  }

  return { ok: true, invoiceId: invoiceRowId, checkoutUrl }
}

/**
 * @param {unknown} body
 * @param {import('node:process').ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleSyncWebsiteQuotePortalPayment = async (body, env = process.env, meta = {}) => {
  const auth = await requireAdminFromBearer(meta.authHeader, env)
  if (!auth.ok) {
    throwStatus(auth.message, auth.statusCode)
  }

  const url = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    throwStatus('Supabase is not configured on the server.', 500)
  }

  const packageBuildId = typeof body?.packageBuildId === 'string' ? body.packageBuildId.trim() : ''
  if (!packageBuildId) {
    throwStatus('packageBuildId is required.', 400)
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: build, error: bErr } = await admin
    .from('package_builds')
    .select('id, owner_id, config, source')
    .eq('id', packageBuildId)
    .maybeSingle()

  if (bErr || !build?.id) {
    throwStatus(bErr?.message ?? 'Package build not found.', 404)
  }

  const cfg = build.config && typeof build.config === 'object' ? build.config : {}
  const enquiryRef =
    typeof cfg.enquiryReferenceId === 'string' && cfg.enquiryReferenceId.trim()
      ? cfg.enquiryReferenceId.trim()
      : ''
  const quote = parseAdminQuote(cfg.adminQuote)
  if (!quote) {
    throwStatus('No saved admin quote on this package — save the VAT-inclusive total first.', 400)
  }

  const ownerId = build.owner_id ? String(build.owner_id) : ''
  if (!ownerId) {
    throwStatus('Package has no client owner — link a portal profile first.', 400)
  }

  const gross = quote.grossTotalEur
  const vatTreatment = vatTreatmentFromRate(quote.vatRate)
  const now = new Date().toISOString()

  /** @type {{ id: string, payment_status: string | null } | null} */
  let transferRow = null

  if (enquiryRef) {
    const { data: byRef } = await admin
      .from('transfer_bookings')
      .select('id, payment_status, package_build_id')
      .eq('enquiry_reference_id', enquiryRef)
      .maybeSingle()
    transferRow = byRef ?? null
  }

  if (!transferRow) {
    const { data: byPkg } = await admin
      .from('transfer_bookings')
      .select('id, payment_status, package_build_id')
      .eq('package_build_id', packageBuildId)
      .maybeSingle()
    transferRow = byPkg ?? null
  }

  const payStatus = String(transferRow?.payment_status ?? 'unpaid').toLowerCase()

  if (transferRow?.id && payStatus !== 'paid') {
    const patch = {
      admin_price_eur: gross,
      admin_price_vat_treatment: vatTreatment,
      deposit_percent: 20,
      updated_at: now
    }
    if (!transferRow.package_build_id) {
      patch.package_build_id = packageBuildId
    }

    const { error: tErr } = await admin.from('transfer_bookings').update(patch).eq('id', transferRow.id)
    if (tErr) {
      throwStatus(tErr.message, 500)
    }

    let pdfPortal = null
    try {
      pdfPortal = await publishTransferAdminPricePortalPdfs(admin, env, String(transferRow.id))
    } catch (e) {
      console.error('[sync-website-quote-payment] portal PDFs', e)
      pdfPortal = { ok: false, reason: 'exception' }
    }

    return {
      ok: true,
      mode: 'transfer',
      bookingId: transferRow.id,
      adminPriceEur: gross,
      pdfPortal
    }
  }

  if (transferRow?.id && payStatus === 'paid') {
    return { ok: true, mode: 'skipped', reason: 'already_paid', bookingId: transferRow.id }
  }

  if (!enquiryRef) {
    return {
      ok: true,
      mode: 'quote_only',
      reason: 'no_enquiry_ref',
      message: 'Quote saved on package; no enquiry reference to attach a payment row.'
    }
  }

  const { data: enquiry, error: enqErr } = await admin
    .from('enquiries')
    .select('id, reference_id, email')
    .eq('reference_id', enquiryRef)
    .maybeSingle()

  if (enqErr || !enquiry?.id) {
    return {
      ok: true,
      mode: 'quote_only',
      reason: 'enquiry_not_found',
      message: 'Quote saved; enquiry row not found for a portal invoice.'
    }
  }

  const clientEmail = typeof enquiry.email === 'string' ? enquiry.email.trim().toLowerCase() : ''
  if (!clientEmail) {
    throwStatus('Enquiry has no email — cannot create a payment link.', 400)
  }

  const { data: profile, error: profErr } = await admin
    .from('profiles')
    .select('id, email')
    .eq('id', ownerId)
    .maybeSingle()

  if (profErr || !profile?.id) {
    throwStatus('Client profile not found for this package.', 404)
  }

  const invoiceResult = await upsertPortalInvoiceCheckout(admin, env, {
    profileId: ownerId,
    enquiryId: String(enquiry.id),
    referenceId: enquiryRef,
    clientEmail,
    grossEur: gross,
    sentBy: auth.user.id
  })

  if (!invoiceResult.ok) {
    return {
      ok: true,
      mode: 'quote_only',
      reason: invoiceResult.reason ?? 'invoice_failed',
      message: 'Quote saved on package; configure STRIPE_SECRET_KEY to enable Pay now.'
    }
  }

  return {
    ok: true,
    mode: 'portal_invoice',
    invoiceId: invoiceResult.invoiceId,
    checkoutUrl: invoiceResult.checkoutUrl
  }
}
