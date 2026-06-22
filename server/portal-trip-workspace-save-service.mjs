import { createClient } from '@supabase/supabase-js'

export const PENDING_TRIP_WORKSPACE_REFERENCE_ID = 'GSI-PENDING'

export const isLikelyEnquiryReferenceId = (value) => {
  const ref = String(value ?? '').trim()
  return /^GSI-[A-Z0-9-]+$/i.test(ref) && ref.toUpperCase() !== PENDING_TRIP_WORKSPACE_REFERENCE_ID
}

const defaultStages = () => ({ transfer: true, golf: true, hotel: false })

const normalizeTransferStops = (raw) => {
  const list = Array.isArray(raw) && raw.length > 0 ? raw : [{ kind: 'malaga_airport', ref: 'agp' }]
  return list
    .slice(0, 8)
    .map((s) => {
      if (!s || typeof s !== 'object') {
        return null
      }
      const kind = s.kind
      const ref = typeof s.ref === 'string' ? s.ref.trim() : ''
      if (!ref || (kind !== 'malaga_airport' && kind !== 'hotel' && kind !== 'golf_course')) {
        return null
      }
      const row = { kind, ref }
      const pt = typeof s.pickupAtLocal === 'string' ? s.pickupAtLocal.trim() : ''
      if (pt) {
        row.pickupAtLocal = pt
      }
      return row
    })
    .filter(Boolean)
}

const parseTripWorkspaceDraft = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    const err = new Error('Invalid trip workspace draft.')
    err.statusCode = 400
    throw err
  }

  const o = raw
  const referenceId = typeof o.referenceId === 'string' ? o.referenceId.trim() : ''
  const stagesRaw = o.stages && typeof o.stages === 'object' && !Array.isArray(o.stages) ? o.stages : {}
  const def = defaultStages()

  let partySize = 4
  if (typeof o.partySize === 'number' && Number.isFinite(o.partySize)) {
    partySize = Math.min(8, Math.max(1, Math.round(o.partySize)))
  }

  const courseIds = Array.isArray(o.courseIds) ? o.courseIds.filter((c) => typeof c === 'string') : []
  const hotelNotes = typeof o.hotelNotes === 'string' ? o.hotelNotes : ''
  const transferContactPhone = typeof o.transferContactPhone === 'string' ? o.transferContactPhone : ''
  const updatedAt = typeof o.updatedAt === 'string' && o.updatedAt.trim() ? o.updatedAt.trim() : new Date().toISOString()

  return {
    referenceId: isLikelyEnquiryReferenceId(referenceId) ? referenceId : PENDING_TRIP_WORKSPACE_REFERENCE_ID,
    stages: {
      transfer: typeof stagesRaw.transfer === 'boolean' ? stagesRaw.transfer : def.transfer,
      golf: typeof stagesRaw.golf === 'boolean' ? stagesRaw.golf : def.golf,
      hotel: typeof stagesRaw.hotel === 'boolean' ? stagesRaw.hotel : def.hotel
    },
    partySize,
    courseIds,
    hotelNotes,
    transferStops: normalizeTransferStops(o.transferStops),
    transferContactPhone,
    updatedAt
  }
}

const mergePortalTripWorkspaceIntoConfig = (existingRaw, draft, enquiryReferenceId) => {
  const base =
    existingRaw && typeof existingRaw === 'object' && !Array.isArray(existingRaw)
      ? { ...existingRaw }
      : { version: 3, fields: {} }

  const ref = enquiryReferenceId.trim()
  if (ref && isLikelyEnquiryReferenceId(ref)) {
    base.enquiryReferenceId = ref
  }

  base.portalTripWorkspace = {
    stages: { ...draft.stages },
    partySize: draft.partySize,
    courseIds: [...draft.courseIds],
    hotelNotes: draft.hotelNotes,
    transferStops: draft.transferStops.map((s) => {
      const row = { kind: s.kind, ref: s.ref }
      if (s.pickupAtLocal) {
        row.pickupAtLocal = s.pickupAtLocal
      }
      return row
    }),
    transferContactPhone: draft.transferContactPhone ?? '',
    updatedAt: draft.updatedAt
  }

  return base
}

const rowEnquiryReferenceId = (row) => {
  const cfg = row?.config
  if (!cfg || typeof cfg !== 'object' || Array.isArray(cfg)) {
    return ''
  }
  return typeof cfg.enquiryReferenceId === 'string' ? cfg.enquiryReferenceId.trim() : ''
}

export const selectPortalTripWorkspacePackageBuild = (rows, referenceId) => {
  const list = Array.isArray(rows) ? rows : []
  const ref = String(referenceId ?? '').trim()

  if (isLikelyEnquiryReferenceId(ref)) {
    return list.find((row) => rowEnquiryReferenceId(row) === ref) ?? null
  }

  return list.find((row) => !isLikelyEnquiryReferenceId(rowEnquiryReferenceId(row))) ?? null
}

/**
 * @param {Record<string, unknown>} payload
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handlePortalTripWorkspaceSave = async (payload, env = process.env, meta = {}) => {
  const raw = typeof meta.authHeader === 'string' ? meta.authHeader.trim() : ''
  const token = raw.toLowerCase().startsWith('bearer ') ? raw.slice(7).trim() : ''

  if (!token) {
    const err = new Error('Sign in required.')
    err.statusCode = 401
    throw err
  }

  const url = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    const err = new Error('Server is not configured for profile saves.')
    err.statusCode = 500
    throw err
  }

  const draft = parseTripWorkspaceDraft(payload?.draft)

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const { data: userData, error: userErr } = await admin.auth.getUser(token)
  if (userErr || !userData?.user?.id) {
    const err = new Error(userErr?.message ?? 'Invalid or expired session.')
    err.statusCode = 401
    throw err
  }

  const userId = userData.user.id
  const ref = draft.referenceId

  const { data: rows, error: listErr } = await admin
    .from('package_builds')
    .select('id, config')
    .eq('owner_id', userId)
    .eq('source', 'website_form')
    .order('created_at', { ascending: false })
    .limit(12)

  if (listErr) {
    const err = new Error(listErr.message)
    err.statusCode = 500
    throw err
  }

  const target = selectPortalTripWorkspacePackageBuild(rows, ref)

  const now = new Date().toISOString()

  if (target) {
    const merged = mergePortalTripWorkspaceIntoConfig(target.config, draft, ref)
    const { error: updErr } = await admin
      .from('package_builds')
      .update({ config: merged, updated_at: now })
      .eq('id', target.id)
      .eq('owner_id', userId)

    if (updErr) {
      const err = new Error(updErr.message)
      err.statusCode = 500
      throw err
    }

    return { ok: true, packageBuildId: target.id }
  }

  const config = mergePortalTripWorkspaceIntoConfig(
    {
      version: 3,
      formKey: 'trip_service_cta',
      enquiryReferenceId: isLikelyEnquiryReferenceId(ref) ? ref : PENDING_TRIP_WORKSPACE_REFERENCE_ID,
      submittedAt: now,
      fields: {}
    },
    draft,
    ref
  )

  const label = isLikelyEnquiryReferenceId(ref) ? `trip service cta · ${ref}` : 'trip service cta · saved preferences'

  const { data: inserted, error: insErr } = await admin
    .from('package_builds')
    .insert({
      owner_id: userId,
      source: 'website_form',
      label,
      config,
      client_details: {},
      updated_at: now
    })
    .select('id')
    .single()

  if (insErr || !inserted?.id) {
    const err = new Error(insErr?.message ?? 'Could not save preferences.')
    err.statusCode = 500
    throw err
  }

  return { ok: true, packageBuildId: inserted.id }
}
