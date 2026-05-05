import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { isAuthEmailBlocked } from './email-address-registry.mjs'
import { createEnquiryReferenceId } from '../shared/document-templates.mjs'
import { buildBrandedPortalMagicLinkEmailHtml } from './branded-client-portal-email.mjs'
import { finalizeGsolEmailHtml } from './email-layout.mjs'
import { getTransactionalEmailImageAttachments } from './enquiry-service.mjs'

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const normalizeAccountRefInput = (raw) =>
  typeof raw === 'string' ? raw.trim().replace(/\s+/g, '').toUpperCase() : ''

/**
 * Inbox rows use `profiles.id` from the recipient email when we send studio mail.
 * Admins often paste the enquiry ref from a quote (GSI-…) which may not equal `account_reference_id`.
 * Resolve: client email (best) → account_reference_id → package_builds.config.enquiryReferenceId.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {{ accountReferenceId?: string; clientEmail?: string }} payload
 */
const resolveOwnerIdForPortalClear = async (admin, payload) => {
  const emailRaw = typeof payload.clientEmail === 'string' ? payload.clientEmail.trim().toLowerCase() : ''
  if (emailRaw && isValidEmail(emailRaw)) {
    const { data, error } = await admin.from('profiles').select('id').ilike('email', emailRaw).maybeSingle()
    if (error) {
      throwStatus(error.message, 500)
    }
    if (data?.id) {
      return data.id
    }
  }

  const normalized = normalizeAccountRefInput(payload.accountReferenceId ?? '')
  if (normalized.length >= 8) {
    const { data: byRef, error: rErr } = await admin
      .from('profiles')
      .select('id')
      .ilike('account_reference_id', normalized)
      .maybeSingle()
    if (rErr) {
      throwStatus(rErr.message, 500)
    }
    if (byRef?.id) {
      return byRef.id
    }

    const { data: fuzzy, error: fErr } = await admin
      .from('profiles')
      .select('id')
      .ilike('account_reference_id', `%${normalized}%`)
      .limit(5)
    if (fErr) {
      throwStatus(fErr.message, 500)
    }
    const fuzzIds = [...new Set((fuzzy ?? []).map((r) => r.id).filter(Boolean))]
    if (fuzzIds.length === 1) {
      return fuzzIds[0]
    }

    const { data: builds, error: bErr } = await admin
      .from('package_builds')
      .select('owner_id')
      .ilike('config->>enquiryReferenceId', normalized)
      .limit(40)
    if (bErr) {
      throwStatus(bErr.message, 500)
    }
    const ownerIds = [...new Set((builds ?? []).map((r) => r.owner_id).filter(Boolean))]
    if (ownerIds.length === 1) {
      return ownerIds[0]
    }
    if (ownerIds.length > 1) {
      throwStatus('Multiple client accounts share that reference — enter the client login email and try again.', 409)
    }
  }

  return null
}

const throwStatus = (message, statusCode) => {
  const err = new Error(message)
  err.statusCode = statusCode
  throw err
}

const defaultMagicRedirectTo = (env) => {
  const site = env.SITE_URL?.trim()
  if (site) {
    const base = site.startsWith('http') ? site : `https://${site}`
    return `${base.replace(/\/$/, '')}/auth/callback`
  }
  const vercel = env.VERCEL_URL?.trim()
  if (vercel) {
    const base = vercel.startsWith('http') ? vercel : `https://${vercel}`
    return `${base.replace(/\/$/, '')}/auth/callback`
  }
  return 'http://localhost:5173/auth/callback'
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} emailLower
 * @param {string} redirectTo
 * @param {NodeJS.ProcessEnv} env
 */
const sendMagicLinkEmail = async (admin, emailLower, redirectTo, env) => {
  const resendKey = env.RESEND_API_KEY?.trim()
  const fromEmail = env.RESEND_FROM_EMAIL?.trim()
  if (!resendKey || !fromEmail) {
    return { sent: false, reason: 'RESEND_API_KEY / RESEND_FROM_EMAIL not set' }
  }

  const { data, error: genError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: emailLower,
    options: { redirectTo }
  })

  if (genError || !data?.properties?.action_link) {
    return { sent: false, reason: genError?.message ?? 'Could not create sign-in link.' }
  }

  const actionLink = data.properties.action_link
  const requestedAtDisplay = new Intl.DateTimeFormat('en-IE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date())

  const rawHtml = buildBrandedPortalMagicLinkEmailHtml({
    actionLink,
    email: emailLower,
    requestedAtDisplay
  })
  const html = finalizeGsolEmailHtml(rawHtml)
  const imageAttachments = await getTransactionalEmailImageAttachments()
  const resend = new Resend(resendKey)
  const { error: sendError } = await resend.emails.send({
    from: fromEmail,
    to: [emailLower],
    subject: 'Sign in to Golf Sol Ireland — your secure link',
    html,
    attachments: imageAttachments
  })

  if (sendError) {
    return { sent: false, reason: sendError.message ?? 'Resend failed' }
  }
  return { sent: true }
}

/**
 * Admin-only: create auth user + profile (trigger) with account reference, or delete client by email.
 * @param {Record<string, unknown>} payload
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleAdminPortalClient = async (payload = {}, env = process.env, meta = {}) => {
  const auth = await requireAdminFromBearer(meta.authHeader, env)
  if (!auth.ok) {
    throwStatus(auth.message, auth.statusCode)
  }

  const url = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    throwStatus('Supabase is not configured on the server.', 500)
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const action = typeof payload.action === 'string' ? payload.action.trim().toLowerCase() : ''

  if (action === 'delete') {
    const emailRaw = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : ''
    if (!emailRaw || !isValidEmail(emailRaw)) {
      throwStatus('Valid client email is required.', 400)
    }

    const { data: prof, error: pErr } = await admin.from('profiles').select('id, role').ilike('email', emailRaw).maybeSingle()

    if (pErr) {
      throwStatus(pErr.message, 500)
    }
    if (!prof?.id) {
      throwStatus('No portal profile found for that email.', 404)
    }
    if (prof.role === 'admin') {
      throwStatus('Cannot delete an admin account.', 403)
    }

    const { error: delErr } = await admin.auth.admin.deleteUser(prof.id)
    if (delErr) {
      throwStatus(delErr.message ?? 'Delete failed.', 500)
    }

    return { ok: true, deleted: true }
  }

  if (action === 'reset_portal_onboarding') {
    const emailRaw = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : ''
    if (!emailRaw || !isValidEmail(emailRaw)) {
      throwStatus('Valid email is required.', 400)
    }

    const { data: target, error: tErr } = await admin
      .from('profiles')
      .select('id, role')
      .ilike('email', emailRaw)
      .maybeSingle()

    if (tErr) {
      throwStatus(tErr.message, 500)
    }
    if (!target?.id) {
      throwStatus('No profile for that email.', 404)
    }
    if (target.role === 'admin' && target.id !== auth.user.id) {
      throwStatus('Cannot reset another admin’s portal contact this way.', 403)
    }

    const now = new Date().toISOString()
    const { error: uErr } = await admin
      .from('profiles')
      .update({
        full_name: null,
        phone: null,
        account_reference_id: null,
        portal_contact_completed_at: null,
        portal_enquiry_autofill_disabled: true,
        portal_pdf_library_enabled: false,
        updated_at: now
      })
      .eq('id', target.id)

    if (uErr) {
      throwStatus(uErr.message, 500)
    }

    const { error: authUpErr } = await admin.auth.admin.updateUserById(target.id, {
      user_metadata: {
        full_name: '',
        given_name: '',
        family_name: '',
        name: '',
        display_name: '',
        phone: '',
        phone_number: '',
        phone_whatsapp: ''
      }
    })
    if (authUpErr) {
      throwStatus(authUpErr.message ?? 'Profile reset but could not clear sign-in profile fields.', 500)
    }

    return { ok: true, reset: true }
  }

  if (action === 'clear_dashboard_by_account_ref') {
    const refRaw = typeof payload.accountReferenceId === 'string' ? payload.accountReferenceId.trim() : ''
    const normalized = refRaw.replace(/\s+/g, '').toUpperCase()
    if (!normalized || normalized.length < 8) {
      throwStatus('Enter a valid account number (e.g. GSI-XXXX-1234).', 400)
    }

    const { data: target, error: findErr } = await admin
      .from('profiles')
      .select('id')
      .ilike('account_reference_id', normalized)
      .maybeSingle()

    if (findErr) {
      throwStatus(findErr.message, 500)
    }
    if (!target?.id) {
      throwStatus('No profile found with that account number.', 404)
    }

    const ownerId = target.id

    const { error: tixErr } = await admin.from('portal_interest_tickets').delete().eq('owner_id', ownerId)
    if (tixErr) {
      throwStatus(tixErr.message, 500)
    }

    const { error: updErr } = await admin.from('portal_client_updates').delete().eq('owner_id', ownerId)
    if (updErr) {
      throwStatus(updErr.message, 500)
    }

    const { error: buildErr } = await admin.from('package_builds').delete().eq('owner_id', ownerId)
    if (buildErr) {
      throwStatus(buildErr.message, 500)
    }

    const { error: propErr } = await admin.from('proposals').delete().eq('owner_id', ownerId)
    if (propErr) {
      throwStatus(propErr.message, 500)
    }

    const { error: docErr } = await admin.from('client_document_access').delete().eq('owner_id', ownerId)
    if (docErr) {
      throwStatus(docErr.message, 500)
    }

    const now = new Date().toISOString()
    const { error: upErr } = await admin
      .from('profiles')
      .update({
        full_name: null,
        phone: null,
        account_reference_id: null,
        portal_contact_completed_at: null,
        portal_enquiry_autofill_disabled: true,
        portal_proposals_enabled: false,
        portal_pdf_library_enabled: false,
        updated_at: now
      })
      .eq('id', ownerId)

    if (upErr) {
      throwStatus(upErr.message, 500)
    }

    // Client dashboard resolves name/phone from auth user_metadata when profile columns are empty — clear those too.
    const { error: authUpErr } = await admin.auth.admin.updateUserById(ownerId, {
      user_metadata: {
        full_name: '',
        given_name: '',
        family_name: '',
        name: '',
        display_name: '',
        phone: '',
        phone_number: '',
        phone_whatsapp: ''
      }
    })
    if (authUpErr) {
      throwStatus(authUpErr.message ?? 'Profile cleared but could not refresh sign-in profile fields.', 500)
    }

    return { ok: true, cleared: true, profileId: ownerId }
  }

  if (action === 'clear_portal_messages_by_account_ref') {
    const emailRaw = typeof payload.clientEmail === 'string' ? payload.clientEmail.trim().toLowerCase() : ''
    const normalized = normalizeAccountRefInput(payload.accountReferenceId ?? '')
    if ((!emailRaw || !isValidEmail(emailRaw)) && normalized.length < 8) {
      throwStatus('Enter the client login email and/or an account or enquiry reference (e.g. GSI-XXXX-1234).', 400)
    }

    const ownerId = await resolveOwnerIdForPortalClear(admin, payload)
    if (!ownerId) {
      throwStatus(
        'No profile matched. Add the client’s **login email** (the address they sign in with) — that is how inbox rows are keyed when we send a quote.',
        404
      )
    }

    const { data: deletedRows, error: inboxErr } = await admin
      .from('portal_client_updates')
      .delete()
      .eq('owner_id', ownerId)
      .select('id')
    if (inboxErr) {
      throwStatus(inboxErr.message, 500)
    }

    return { ok: true, clearedPortalMessages: true, deletedCount: deletedRows?.length ?? 0 }
  }

  if (action === 'list_auth_email_blocks') {
    const { data, error } = await admin
      .from('auth_email_blocks')
      .select('email, blocked_at, reason')
      .order('blocked_at', { ascending: false })
      .limit(200)
    if (error) {
      throwStatus(error.message, 500)
    }
    return { ok: true, blocks: data ?? [] }
  }

  if (action === 'block_auth_email') {
    const emailRaw = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : ''
    if (!emailRaw || !isValidEmail(emailRaw)) {
      throwStatus('Valid email is required.', 400)
    }
    const reason = typeof payload.reason === 'string' ? payload.reason.trim().slice(0, 500) : ''
    const { error } = await admin.from('auth_email_blocks').upsert(
      {
        email: emailRaw,
        reason: reason || null,
        blocked_at: new Date().toISOString()
      },
      { onConflict: 'email' }
    )
    if (error) {
      throwStatus(error.message, 500)
    }
    return { ok: true, blocked: true }
  }

  if (action === 'unblock_auth_email') {
    const emailRaw = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : ''
    if (!emailRaw || !isValidEmail(emailRaw)) {
      throwStatus('Valid email is required.', 400)
    }
    const { error } = await admin.from('auth_email_blocks').delete().eq('email', emailRaw)
    if (error) {
      throwStatus(error.message, 500)
    }
    return { ok: true, unblocked: true }
  }

  if (action !== 'create') {
    throwStatus(
      'Unknown action. Use "create", "delete", "reset_portal_onboarding", "clear_dashboard_by_account_ref", "clear_portal_messages_by_account_ref", "list_auth_email_blocks", "block_auth_email", or "unblock_auth_email".',
      400
    )
  }

  const fullName = typeof payload.fullName === 'string' ? payload.fullName.trim() : ''
  const emailRaw = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : ''
  if (!fullName) {
    throwStatus('Full name is required.', 400)
  }
  if (!emailRaw || !isValidEmail(emailRaw)) {
    throwStatus('Valid email is required.', 400)
  }

  if (await isAuthEmailBlocked(admin, emailRaw)) {
    throwStatus('That email is blocked from magic links, enquiries, and new portal accounts.', 403)
  }

  const { data: existingProf, error: exErr } = await admin.from('profiles').select('id').ilike('email', emailRaw).maybeSingle()
  if (exErr) {
    throwStatus(exErr.message, 500)
  }
  if (existingProf?.id) {
    throwStatus('A client account already exists for this email.', 409)
  }

  const accountReferenceId = createEnquiryReferenceId()
  const sendInvite = payload.sendMagicLink !== false

  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email: emailRaw,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  })

  if (cErr || !created?.user?.id) {
    const msg = cErr?.message ?? 'Could not create user.'
    if (/already|registered|exists/i.test(msg)) {
      throwStatus('That email is already registered in authentication.', 409)
    }
    throwStatus(msg, 400)
  }

  const userId = created.user.id
  const now = new Date().toISOString()

  const { error: upErr } = await admin
    .from('profiles')
    .update({
      full_name: fullName,
      email: emailRaw,
      account_reference_id: accountReferenceId,
      portal_contact_completed_at: now,
      portal_pdf_library_enabled: false,
      updated_at: now
    })
    .eq('id', userId)

  if (upErr) {
    await admin.auth.admin.deleteUser(userId).catch(() => {})
    throwStatus(upErr.message, 500)
  }

  let magicLink = { sent: false, reason: '' }
  if (sendInvite) {
    const redirectTo = defaultMagicRedirectTo(env)
    magicLink = await sendMagicLinkEmail(admin, emailRaw, redirectTo, env)
  }

  return {
    ok: true,
    userId,
    accountReferenceId,
    magicLinkSent: magicLink.sent,
    magicLinkMessage: magicLink.sent ? '' : magicLink.reason ?? ''
  }
}
