import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { buildBrandedHotelReservationEmailHtml } from './branded-hotel-brief-email.mjs'
import { buildBrandedProposalAttachedEmailHtml } from './branded-client-portal-email.mjs'
import { finalizeGsolEmailHtml, getGsolSiteUrl } from './email-layout.mjs'
import { getTransactionalEmailImageAttachments } from './enquiry-service.mjs'
import { normalizeProposalPayload } from '../shared/document-templates.mjs'
import { createProposalFilename, createProposalPdf } from './proposal-service.mjs'

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const throwStatus = (message, statusCode) => {
  const err = new Error(message)
  err.statusCode = statusCode
  throw err
}

const assertAdmin = async (authHeader, env) => {
  const auth = await requireAdminFromBearer(authHeader, env)
  if (!auth.ok) {
    throwStatus(auth.message, auth.statusCode)
  }
  return auth.user
}

const bookingRefPattern = /^GSI-[A-Z0-9-]+$/i

const uuidLike = (value) =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim())

const parseLinkPackageBuildIds = (body) => {
  const raw = body.linkPackageBuildIds
  if (!Array.isArray(raw)) {
    return []
  }

  const out = []
  for (const item of raw) {
    if (uuidLike(item)) {
      out.push(item.trim())
    }
  }

  return [...new Set(out)]
}

/**
 * @param {unknown} rawBody
 * @param {Record<string, string | undefined>} env
 * @param {{ authHeader?: string }} meta
 */
export const handleSendWorkspaceProposalToClient = async (rawBody, env, meta = {}) => {
  await assertAdmin(meta.authHeader, env)

  const resendKey = env.RESEND_API_KEY?.trim()
  const fromEmail = env.RESEND_FROM_EMAIL?.trim()
  if (!resendKey || !fromEmail) {
    throwStatus('Resend is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.', 500)
  }

  const body = typeof rawBody === 'object' && rawBody !== null ? rawBody : {}
  const clientEmail = typeof body.clientEmail === 'string' ? body.clientEmail.trim().toLowerCase() : ''
  const greetingName =
    typeof body.greetingName === 'string' ? body.greetingName.trim() : typeof body.clientName === 'string' ? body.clientName.trim() : ''
  const proposalPayload = body.proposalPayload && typeof body.proposalPayload === 'object' ? body.proposalPayload : null

  if (!clientEmail || !isValidEmail(clientEmail)) {
    throwStatus('A valid client email is required.', 400)
  }

  if (!proposalPayload) {
    throwStatus('proposalPayload is required.', 400)
  }

  const normalized = { ...normalizeProposalPayload(proposalPayload), variant: 'public' }
  const { pdfBytes, proposal } = await createProposalPdf(normalized)
  const filename = createProposalFilename(proposal.proposalId)

  /** When false, email the PDF only — no proposals row or package_build links. Default true (existing behaviour). */
  const saveToPortal = body.saveToPortal !== false

  const supabaseUrl = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  let savedToPortal = false
  let linkedBuildCount = 0
  const linkBuildIds = saveToPortal ? parseLinkPackageBuildIds(body) : []

  if (saveToPortal && supabaseUrl && serviceKey) {
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })

    const { data: clientProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .ilike('email', clientEmail)
      .maybeSingle()

    if (!profileError && clientProfile?.id) {
      const titleFromPackage =
        typeof normalized.packageName === 'string' && normalized.packageName.trim()
          ? normalized.packageName.trim()
          : `Proposal ${proposal.proposalId}`

      const { data: insertedProposal, error: insertError } = await supabase
        .from('proposals')
        .insert({
          proposal_id: proposal.proposalId,
          owner_id: clientProfile.id,
          title: titleFromPackage,
          status: 'sent',
          payload: normalized,
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (insertError) {
        if (insertError.code === '23505') {
          throwStatus('That proposal ID already exists in the portal. Use a different proposal ID and try again.', 409)
        }
        throwStatus(insertError.message || 'Unable to save proposal to the client portal.', 500)
      }

      savedToPortal = true

      const proposalRowId = insertedProposal && typeof insertedProposal.id === 'string' ? insertedProposal.id : null

      if (proposalRowId && linkBuildIds.length > 0) {
        const { data: ownedRows, error: ownedErr } = await supabase
          .from('package_builds')
          .select('id')
          .in('id', linkBuildIds)
          .eq('owner_id', clientProfile.id)

        if (ownedErr) {
          throwStatus(ownedErr.message || 'Unable to verify package builds for linking.', 500)
        }

        const validIds = (ownedRows ?? []).map((r) => r.id).filter(Boolean)

        if (validIds.length > 0) {
          const { error: linkErr } = await supabase
            .from('package_builds')
            .update({
              linked_proposal_id: proposalRowId,
              updated_at: new Date().toISOString()
            })
            .in('id', validIds)
            .eq('owner_id', clientProfile.id)

          if (!linkErr) {
            linkedBuildCount = validIds.length
          }
        }
      }
    }
  }

  const site = getGsolSiteUrl()
  const dashboardLoginUrl = `${site}/login?next=${encodeURIComponent('/dashboard')}`
  const rawHtml = buildBrandedProposalAttachedEmailHtml({
    greetingName: greetingName || '',
    proposalId: proposal.proposalId,
    dashboardLoginUrl
  })
  const html = finalizeGsolEmailHtml(rawHtml)
  const imageAttachments = await getTransactionalEmailImageAttachments()
  const pdfAttachment = {
    filename,
    content: Buffer.from(pdfBytes).toString('base64'),
    contentType: 'application/pdf'
  }

  const resend = new Resend(resendKey)
  const { error: sendError } = await resend.emails.send({
    from: fromEmail,
    to: [clientEmail],
    subject: `Your Golf Sol Ireland proposal — ${proposal.proposalId}`,
    html,
    attachments: [...imageAttachments, pdfAttachment]
  })

  if (sendError) {
    throwStatus(sendError.message || 'Email could not be sent.', 502)
  }

  return { ok: true, proposalId: proposal.proposalId, savedToPortal, linkedBuildCount }
}

/**
 * @param {unknown} rawBody
 * @param {Record<string, string | undefined>} env
 * @param {{ authHeader?: string }} meta
 */
export const handleSendHotelReservationBrief = async (rawBody, env, meta = {}) => {
  await assertAdmin(meta.authHeader, env)

  const resendKey = env.RESEND_API_KEY?.trim()
  const fromEmail = env.RESEND_FROM_EMAIL?.trim()
  if (!resendKey || !fromEmail) {
    throwStatus('Resend is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.', 500)
  }

  const body = typeof rawBody === 'object' && rawBody !== null ? rawBody : {}
  const hotelEmail = typeof body.hotelEmail === 'string' ? body.hotelEmail.trim().toLowerCase() : ''
  const bookingReference = typeof body.bookingReference === 'string' ? body.bookingReference.trim().toUpperCase() : ''
  const guestCount = Number(body.guestCount)
  const nights = Number(body.nights)
  const preferencesNote = typeof body.preferencesNote === 'string' ? body.preferencesNote : ''

  if (!hotelEmail || !isValidEmail(hotelEmail)) {
    throwStatus('A valid hotel email address is required.', 400)
  }

  if (!bookingReference || !bookingRefPattern.test(bookingReference)) {
    throwStatus('A valid booking reference (e.g. GSI-XXXX-1234) is required.', 400)
  }

  if (!Number.isFinite(guestCount) || guestCount < 1 || guestCount > 99) {
    throwStatus('guestCount must be between 1 and 99.', 400)
  }

  if (!Number.isFinite(nights) || nights < 1 || nights > 90) {
    throwStatus('nights must be between 1 and 90.', 400)
  }

  const rawHtml = buildBrandedHotelReservationEmailHtml({
    bookingReference,
    guestCount: Math.floor(guestCount),
    nights: Math.floor(nights),
    preferencesNote
  })
  const html = finalizeGsolEmailHtml(rawHtml)
  const imageAttachments = await getTransactionalEmailImageAttachments()

  const resend = new Resend(resendKey)
  const { error: sendError } = await resend.emails.send({
    from: fromEmail,
    to: [hotelEmail],
    subject: `Reservation courtesy — partner ref ${bookingReference} (Golf Sol Ireland)`,
    html,
    attachments: imageAttachments
  })

  if (sendError) {
    throwStatus(sendError.message || 'Email could not be sent.', 502)
  }

  return { ok: true }
}
