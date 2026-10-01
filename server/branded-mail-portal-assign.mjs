/**
 * After a branded admin email: one account number per recipient, a portal inbox row,
 * and a Stripe payment on their dashboard when the quote includes a price.
 */
import Stripe from 'stripe'
import { ensureEmailAccountAnchor } from './email-address-registry.mjs'
import { quotePayableEuros } from '../shared/admin-mail-quotation.mjs'

const normalizeEmail = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '')

const getCheckoutReturnOrigin = (env) => {
  const raw = env.TRANSFER_CHECKOUT_ORIGIN?.trim() || env.TRANSFER_CHECKOUT_SITE_URL?.trim() || env.SITE_URL?.trim()
  if (raw) {
    try {
      return new URL(raw.startsWith('http') ? raw : `https://${raw}`).origin
    } catch {
      /* fall through */
    }
  }
  const vercel = env.VERCEL_URL?.trim()
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, '')}`
  return 'http://localhost:5173'
}

const ensureProfile = async (admin, email, fullName, accountRef) => {
  const { data: existing, error } = await admin
    .from('profiles')
    .select('id, email, full_name, account_reference_id')
    .ilike('email', email)
    .maybeSingle()
  if (error) {
    return { profileId: null, accountReferenceId: accountRef, note: 'Could not look up their portal account.' }
  }
  if (existing?.id) {
    const current = String(existing.account_reference_id ?? '').trim()
    if (!current && accountRef) {
      await admin
        .from('profiles')
        .update({ account_reference_id: accountRef, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
    }
    return {
      profileId: existing.id,
      accountReferenceId: current || accountRef,
      note: ''
    }
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName || email }
  })
  if (createErr || !created?.user?.id) {
    const msg = createErr?.message ?? 'Could not open a portal account.'
    return { profileId: null, accountReferenceId: accountRef, note: msg }
  }

  const now = new Date().toISOString()
  const { error: upErr } = await admin
    .from('profiles')
    .update({
      full_name: fullName || email.split('@')[0],
      email,
      account_reference_id: accountRef,
      updated_at: now
    })
    .eq('id', created.user.id)
  if (upErr) {
    return { profileId: created.user.id, accountReferenceId: accountRef, note: 'Account number saved. Portal name could not be updated.' }
  }
  return { profileId: created.user.id, accountReferenceId: accountRef, note: '' }
}

const logPortalUpdate = async (admin, profileId, { subject, summary, templateId }) => {
  const { error } = await admin.from('portal_client_updates').insert({
    owner_id: profileId,
    title: 'Message from Golf Sol Ireland',
    summary: summary.slice(0, 500),
    email_subject: subject.slice(0, 240),
    template_key: (templateId || 'branded').slice(0, 80),
    attachment_filenames: []
  })
  if (error) {
    console.error('[branded-mail-portal] portal update', error.message)
  }
}

const openPortalPayment = async (admin, env, { profileId, email, fullName, accountRef, enquiryId, amountEur, sentBy }) => {
  const stripeKey = env.STRIPE_SECRET_KEY?.trim()
  if (!stripeKey) {
    return { checkoutUrl: null, note: 'Price noted. Set STRIPE_SECRET_KEY to open the portal payment link.' }
  }
  const amountCents = Math.round(Number(amountEur) * 100)
  if (amountCents < 50) return { checkoutUrl: null, note: '' }

  const enquiryReferenceId = accountRef || 'GMAIL'
  const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  const { data: inserted, error: insErr } = await admin
    .from('portal_invoices')
    .insert({
      profile_id: profileId,
      enquiry_id: enquiryId || null,
      enquiry_reference_id: enquiryReferenceId,
      amount_cents: amountCents,
      currency: 'eur',
      status: 'sent',
      invoice_number: invoiceNumber,
      sent_by: sentBy || null
    })
    .select('id')
    .single()
  if (insErr || !inserted?.id) {
    console.error('[branded-mail-portal] invoice', insErr?.message)
    return { checkoutUrl: null, note: 'Account assigned. The portal payment could not be opened.' }
  }

  const origin = getCheckoutReturnOrigin(env)
  const stripe = new Stripe(stripeKey)
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      client_reference_id: inserted.id,
      metadata: { portal_invoice_id: inserted.id },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: amountCents,
            product_data: {
              name: `Golf Sol Ireland — ${enquiryReferenceId}`,
              description: `Invoice ${invoiceNumber}`
            }
          }
        }
      ],
      success_url: `${origin}/dashboard?invoice_paid=1&checkout_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?invoice_cancel=1`
    })
    if (!session.url || !session.id) {
      await admin.from('portal_invoices').delete().eq('id', inserted.id)
      return { checkoutUrl: null, note: 'Account assigned. Stripe did not return a payment link.' }
    }
    const { error: upErr } = await admin
      .from('portal_invoices')
      .update({ stripe_checkout_session_id: session.id, stripe_checkout_url: session.url })
      .eq('id', inserted.id)
    if (upErr) {
      await admin.from('portal_invoices').delete().eq('id', inserted.id)
      return { checkoutUrl: null, note: 'Account assigned. The payment link could not be saved.' }
    }
    return { checkoutUrl: session.url, invoiceNumber, note: '' }
  } catch (error) {
    await admin.from('portal_invoices').delete().eq('id', inserted.id)
    console.error('[branded-mail-portal] stripe', error instanceof Error ? error.message : error)
    return { checkoutUrl: null, note: 'Account assigned. The payment link could not be created.' }
  }
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {NodeJS.ProcessEnv} env
 * @param {{
 *   email: string
 *   fullName?: string
 *   subject: string
 *   summary?: string
 *   templateId?: string
 *   enquiryId?: string | null
 *   quotation?: unknown
 *   openPayment?: boolean
 *   sentBy?: string | null
 * }} input
 */
export const assignBrandedMailPortal = async (admin, env, input) => {
  const email = normalizeEmail(input.email)
  const empty = { accountReferenceId: null, checkoutUrl: null, portalNote: '', profileId: null }
  if (!email.includes('@')) return empty

  try {
    const accountRef = await ensureEmailAccountAnchor(admin, email)
    if (!accountRef) {
      return { ...empty, portalNote: 'Email sent. An account number could not be assigned.' }
    }

    if (input.enquiryId) {
      await admin.from('enquiries').update({ account_anchor_ref: accountRef }).eq('id', input.enquiryId)
    }

    const profile = await ensureProfile(admin, email, String(input.fullName ?? '').trim(), accountRef)
    const notes = [profile.note].filter(Boolean)

    if (profile.profileId) {
      await logPortalUpdate(admin, profile.profileId, {
        subject: input.subject,
        summary: String(input.summary ?? input.subject ?? 'Branded email'),
        templateId: input.templateId
      })
    } else {
      notes.push('They can sign in with this email to open the same account number.')
    }

    let checkoutUrl = null
    const amount = quotePayableEuros(input.quotation)
    const wantPayment = input.openPayment !== false && amount >= 0.5
    if (wantPayment && profile.profileId) {
      const payment = await openPortalPayment(admin, env, {
        profileId: profile.profileId,
        email,
        fullName: String(input.fullName ?? '').trim(),
        accountRef: profile.accountReferenceId || accountRef,
        enquiryId: input.enquiryId || null,
        amountEur: amount,
        sentBy: input.sentBy
      })
      checkoutUrl = payment.checkoutUrl
      if (payment.note) notes.push(payment.note)
    } else if (wantPayment && !profile.profileId) {
      notes.push('Price was not opened on the portal because their account could not be created.')
    }

    return {
      accountReferenceId: profile.accountReferenceId || accountRef,
      checkoutUrl,
      portalNote: notes.filter(Boolean).join(' '),
      profileId: profile.profileId
    }
  } catch (error) {
    console.error('[branded-mail-portal]', error instanceof Error ? error.message : error)
    return { ...empty, portalNote: 'Email sent. Their portal account could not be updated.' }
  }
}

export const brandedMailPortalCopy = ({ accountReferenceId, checkoutUrl, golfBlock }) => {
  const parts = []
  if (golfBlock) parts.push(golfBlock)
  if (accountReferenceId) {
    parts.push(
      `Your Golf Sol Ireland account number is ${accountReferenceId}. Sign in with this email address to see this message on your portal.`
    )
  }
  if (checkoutUrl) {
    parts.push(`Pay from your portal with Pay now, or use this payment link: ${checkoutUrl}`)
  }
  return parts.filter(Boolean).join('\n\n')
}
