import type { Session } from '@supabase/supabase-js'
import { mergePortalTripWorkspaceIntoWebsiteFormConfig } from './package-build'
import { getSupabaseBrowserClient } from './supabase-client'
import { isLikelyEnquiryReferenceId, type TripWorkspaceDraft } from './trip-workspace-draft'

export type PersistPortalTripWorkspaceResult =
  | { ok: true; packageBuildId: string }
  | { ok: false; error: string }

const isRealEnquiryReferenceId = (value: string): boolean => {
  const ref = value.trim()
  return isLikelyEnquiryReferenceId(ref) && ref.toUpperCase() !== 'GSI-PENDING'
}

const isReusablePendingTripWorkspaceRow = (row: { config: unknown }): boolean => {
  const cfg = row.config as { enquiryReferenceId?: unknown; formKey?: unknown; portalTripWorkspace?: unknown } | null
  if (!cfg || typeof cfg !== 'object') {
    return false
  }
  const ref = typeof cfg.enquiryReferenceId === 'string' ? cfg.enquiryReferenceId.trim() : ''
  return cfg.formKey === 'trip_service_cta' && (!ref || ref.toUpperCase() === 'GSI-PENDING')
}

const findTargetPackageBuild = async (userId: string, enquiryReferenceId: string) => {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) {
    return { supabase: null, row: null, error: 'Could not connect to your account.' }
  }

  const ref = enquiryReferenceId.trim()
  const { data: rows, error } = await supabase
    .from('package_builds')
    .select('id, config, source, created_at')
    .eq('owner_id', userId)
    .eq('source', 'website_form')
    .order('created_at', { ascending: false })
    .limit(12)

  if (error) {
    return { supabase, row: null, error: error.message }
  }

  const list = rows ?? []
  if (isRealEnquiryReferenceId(ref)) {
    const normalizedRef = ref.toUpperCase()
    const matched = list.find((row) => {
      const cfg = row.config as { enquiryReferenceId?: string } | null
      return typeof cfg?.enquiryReferenceId === 'string' && cfg.enquiryReferenceId.trim().toUpperCase() === normalizedRef
    })
    if (matched) {
      return { supabase, row: matched, error: null }
    }

    return { supabase, row: null, error: null }
  }

  return { supabase, row: list.find(isReusablePendingTripWorkspaceRow) ?? null, error: null }
}

/**
 * Saves trip workspace preferences onto the signed-in client's `package_builds` profile row.
 * Creates a `website_form` build when none exists yet.
 */
export const persistPortalTripWorkspace = async (
  session: Session,
  draft: TripWorkspaceDraft
): Promise<PersistPortalTripWorkspaceResult> => {
  const userId = session.user.id
  const enquiryReferenceId = draft.referenceId.trim()
  const { supabase, row, error: lookupError } = await findTargetPackageBuild(userId, enquiryReferenceId)

  if (!supabase) {
    return { ok: false, error: lookupError ?? 'Could not connect to your account.' }
  }
  if (lookupError) {
    return { ok: false, error: lookupError }
  }

  const now = new Date().toISOString()

  if (row) {
    const mergedConfig = mergePortalTripWorkspaceIntoWebsiteFormConfig(row.config, draft, enquiryReferenceId)
    const { error } = await supabase
      .from('package_builds')
      .update({ config: mergedConfig, updated_at: now })
      .eq('id', row.id)
      .eq('owner_id', userId)

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true, packageBuildId: row.id }
  }

  const config = mergePortalTripWorkspaceIntoWebsiteFormConfig(
    {
      version: 3,
      formKey: 'trip_service_cta',
      enquiryReferenceId: isRealEnquiryReferenceId(enquiryReferenceId) ? enquiryReferenceId : '',
      submittedAt: now,
      fields: {}
    },
    draft,
    isRealEnquiryReferenceId(enquiryReferenceId) ? enquiryReferenceId : 'GSI-PENDING'
  )

  const label = isRealEnquiryReferenceId(enquiryReferenceId)
    ? `trip service cta · ${enquiryReferenceId}`
    : 'trip service cta · saved preferences'

  const { data: inserted, error: insertError } = await supabase
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

  if (insertError || !inserted?.id) {
    return { ok: false, error: insertError?.message ?? 'Could not save your preferences.' }
  }

  return { ok: true, packageBuildId: inserted.id }
}

/** Authenticated save via gateway (service role) — used when direct RLS update is blocked. */
export const persistPortalTripWorkspaceViaApi = async (
  accessToken: string,
  draft: TripWorkspaceDraft
): Promise<PersistPortalTripWorkspaceResult> => {
  const response = await fetch('/api/portal-trip-workspace-save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({ draft })
  })

  const data = (await response.json().catch(() => ({}))) as {
    ok?: boolean
    packageBuildId?: string
    message?: string
  }

  if (!response.ok || !data.ok || !data.packageBuildId) {
    return { ok: false, error: data.message ?? 'Could not save your preferences right now.' }
  }

  return { ok: true, packageBuildId: data.packageBuildId }
}
