export type PortalInterestCategory = 'transfers' | 'golf_courses' | 'hotels'

export const PORTAL_INTEREST_LABELS: Record<PortalInterestCategory, string> = {
  transfers: 'Transfers',
  golf_courses: 'Golf Courses',
  hotels: 'Hotels'
}

export interface PortalInterestTicketRow {
  id: string
  owner_id: string
  category: PortalInterestCategory
  status: string
  created_at: string
  updated_at: string
  /** When the client last opened the thread (RPC); unread if latest admin message is newer. */
  client_last_read_at?: string | null
  /** Admin-set EUR quote for this add-on request (optional). */
  admin_quote_eur?: number | null
}

export interface PortalInterestTicketMessageRow {
  id: string
  ticket_id: string
  author_kind: 'client' | 'admin'
  body: string
  created_at: string
}

export const isMissingPortalInterestTicketsError = (error: { message?: string } | null): boolean => {
  if (!error?.message) {
    return false
  }
  const m = error.message.toLowerCase()
  return (
    (m.includes('portal_interest_tickets') || m.includes('portal_interest_ticket_messages')) &&
    (m.includes('does not exist') || m.includes('schema cache'))
  )
}
