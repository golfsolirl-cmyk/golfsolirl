import type { SupabaseClient } from '@supabase/supabase-js'

/** PostgREST / Postgres when `client_details` was never migrated */
export const isMissingClientDetailsColumnError = (error: { message?: string } | null): boolean => {
  if (!error?.message) {
    return false
  }

  const m = error.message.toLowerCase()
  return m.includes('client_details') && (m.includes('does not exist') || m.includes('could not find'))
}

export const fetchPackageBuildsClientList = async (supabase: SupabaseClient, limit: number) => {
  const withCol = await supabase
    .from('package_builds')
    .select('id, label, source, config, client_details, created_at, updated_at, linked_proposal_id')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!withCol.error) {
    return withCol
  }

  if (!isMissingClientDetailsColumnError(withCol.error)) {
    return withCol
  }

  const legacy = await supabase
    .from('package_builds')
    .select('id, label, source, config, created_at, updated_at, linked_proposal_id')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (legacy.error) {
    return legacy
  }

  return {
    data: (legacy.data ?? []).map((row) => ({ ...row, client_details: {}, linked_proposal_id: row.linked_proposal_id ?? null })),
    error: null
  }
}

export const fetchPackageBuildsAdminList = async (supabase: SupabaseClient, limit: number) => {
  const withCol = await supabase
    .from('package_builds')
    .select('id, owner_id, label, source, config, client_details, created_at, updated_at, linked_proposal_id, profiles(email, full_name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!withCol.error) {
    return withCol
  }

  if (!isMissingClientDetailsColumnError(withCol.error)) {
    return withCol
  }

  const legacy = await supabase
    .from('package_builds')
    .select('id, owner_id, label, source, config, created_at, updated_at, linked_proposal_id, profiles(email, full_name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (legacy.error) {
    return legacy
  }

  return {
    data: (legacy.data ?? []).map((row) => ({
      ...row,
      client_details: {},
      linked_proposal_id: row.linked_proposal_id ?? null
    })),
    error: null
  }
}
