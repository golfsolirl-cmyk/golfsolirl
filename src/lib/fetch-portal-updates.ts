import type { SupabaseClient } from '@supabase/supabase-js'

export interface PortalClientUpdateRow {
  id: string
  title: string
  summary: string | null
  email_subject: string
  template_key: string
  attachment_filenames: unknown
  created_at: string
}

export const isMissingPortalUpdatesTableError = (error: { message?: string } | null): boolean => {
  if (!error?.message) {
    return false
  }
  const m = error.message.toLowerCase()
  return m.includes('portal_client_updates') && (m.includes('does not exist') || m.includes('schema cache'))
}

export const fetchPortalClientUpdates = async (supabase: SupabaseClient, limit: number) => {
  return supabase
    .from('portal_client_updates')
    .select('id, title, summary, email_subject, template_key, attachment_filenames, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
}
