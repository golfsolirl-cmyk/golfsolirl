/**
 * Admin utility: regenerate all stored paper-trail PDFs with current branding.
 * Re-runs the publish function for every transfer booking that already has documents.
 */
import { createClient } from '@supabase/supabase-js'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import { publishTransferAdminPricePortalPdfs } from './transfer-portal-publish-admin-price-pdfs.mjs'

export const handleRegeneratePortalPdfs = async (payload, env, { authHeader }) => {
  const auth = await requireAdminFromBearer(authHeader, env)
  if (!auth.ok) return auth

  const supabaseUrl = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  const { data: docs, error } = await admin
    .from('portal_client_transfer_documents')
    .select('transfer_booking_id')

  if (error) {
    return { ok: false, message: error.message }
  }

  const bookingIds = [...new Set((docs ?? []).map((d) => d.transfer_booking_id).filter(Boolean))]

  if (bookingIds.length === 0) {
    return { ok: true, regenerated: 0, message: 'No existing documents to regenerate.' }
  }

  let success = 0
  let failed = 0
  const errors = []

  for (const bookingId of bookingIds) {
    try {
      const result = await publishTransferAdminPricePortalPdfs(admin, env, bookingId)
      if (result.ok) {
        success++
      } else {
        failed++
        errors.push({ bookingId, reason: result.reason })
      }
    } catch (e) {
      failed++
      errors.push({ bookingId, reason: e.message })
    }
  }

  return { ok: true, regenerated: success, failed, errors: errors.slice(0, 10) }
}
