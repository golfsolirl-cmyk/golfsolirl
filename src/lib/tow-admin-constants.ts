/** TOW-style enquiry / customer constants — Golf Sol labels. */

export const ENQUIRY_ADMIN_STATUSES = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'quoted', label: 'Quote sent' },
  { id: 'won', label: 'Won / paid' },
  { id: 'lost', label: 'Declined' },
  { id: 'spam', label: 'Spam' },
  { id: 'bad-lead', label: 'Unpaid – bad lead' }
] as const

export type EnquiryAdminStatus = (typeof ENQUIRY_ADMIN_STATUSES)[number]['id']

export const ENQUIRY_PAYMENT_UI = [
  { id: 'awaiting_payment', label: 'Awaiting payment' },
  { id: 'customer_reported', label: 'Payment reported by customer' },
  { id: 'paid_in_full', label: 'Paid' },
  { id: 'deposit_received', label: 'Deposit received' },
  { id: 'refunded', label: 'Refunded' },
  { id: 'none', label: 'No payment due' }
] as const

export const PAID_VIA_OPTIONS = [
  { id: 'monzo', label: 'Monzo' },
  { id: 'revolut', label: 'Revolut' },
  { id: 'bank_transfer', label: 'Bank transfer' },
  { id: 'cash', label: 'Cash' },
  { id: 'other', label: 'Other' }
] as const

export const TRIP_TRACKER_STEPS = [
  { id: 'enquiry_received', label: 'Enquiry received' },
  { id: 'quote_sent', label: 'Quote sent' },
  { id: 'deposit_paid', label: 'Deposit paid' },
  { id: 'flights_confirmed', label: 'Flights confirmed' },
  { id: 'hotel_booked', label: 'Hotel booked' },
  { id: 'tee_times_booked', label: 'Tee times booked' },
  { id: 'transfers_booked', label: 'Transfers booked' },
  { id: 'balance_paid', label: 'Balance paid' },
  { id: 'documents_sent', label: 'Documents sent' },
  { id: 'trip_complete', label: 'Trip complete' }
] as const

export type TripStepId = (typeof TRIP_TRACKER_STEPS)[number]['id']
export type TripStepStatus = 'todo' | 'doing' | 'done' | 'skip'

export const TRIP_STEP_STATUSES: { id: TripStepStatus; label: string }[] = [
  { id: 'todo', label: 'To do' },
  { id: 'doing', label: 'Doing' },
  { id: 'done', label: 'Done' },
  { id: 'skip', label: 'Skip' }
]

export const STATUS_BADGE_CLASS: Record<string, string> = {
  new: 'bg-emerald-100 text-emerald-900',
  contacted: 'bg-sky-100 text-sky-900',
  quoted: 'bg-amber-100 text-amber-900',
  won: 'bg-emerald-200 text-emerald-950',
  lost: 'bg-slate-200 text-slate-700',
  spam: 'bg-rose-100 text-rose-800',
  'bad-lead': 'bg-rose-600 text-white'
}

export const PAY_BADGE_CLASS: Record<string, string> = {
  awaiting_payment: 'bg-amber-100 text-amber-900',
  customer_reported: 'bg-sky-100 text-sky-900',
  deposit_received: 'bg-teal-100 text-teal-900',
  paid_in_full: 'bg-emerald-100 text-emerald-900',
  refunded: 'bg-slate-200 text-slate-700',
  none: 'bg-slate-100 text-slate-500'
}

/** Canonical enquiry form types (must match shared/enquiry-form-type.mjs). */
export const ENQUIRY_FORM_TYPES = [
  { id: 'quote', label: 'Quote request', shortLabel: 'Quote', badgeClass: 'bg-emerald-100 text-emerald-900' },
  { id: 'booking', label: 'Booking', shortLabel: 'Booking', badgeClass: 'bg-sky-100 text-sky-900' },
  { id: 'trip_builder', label: 'Trip builder', shortLabel: 'Trip builder', badgeClass: 'bg-violet-100 text-violet-900' },
  { id: 'package_bundle', label: 'Package / bundle', shortLabel: 'Package', badgeClass: 'bg-amber-100 text-amber-950' },
  { id: 'golf_map', label: 'Golf map course', shortLabel: 'Golf map', badgeClass: 'bg-lime-100 text-lime-900' },
  { id: 'contact', label: 'Contact', shortLabel: 'Contact', badgeClass: 'bg-slate-200 text-slate-800' },
  { id: 'callback', label: 'Callback', shortLabel: 'Callback', badgeClass: 'bg-orange-100 text-orange-950' },
  { id: 'seo_landing', label: 'SEO landing page', shortLabel: 'SEO', badgeClass: 'bg-indigo-100 text-indigo-900' },
  { id: 'unknown', label: 'Unknown', shortLabel: 'Unknown', badgeClass: 'bg-slate-100 text-slate-500' }
] as const

export type EnquiryFormTypeId = (typeof ENQUIRY_FORM_TYPES)[number]['id']

export const FORM_TYPE_BADGE_CLASS: Record<string, string> = Object.fromEntries(
  ENQUIRY_FORM_TYPES.map((t) => [t.id, t.badgeClass])
)

export function formTypeLabel(id: string | null | undefined, fallbackLabel?: string | null): string {
  if (fallbackLabel?.trim()) return fallbackLabel.trim()
  const found = ENQUIRY_FORM_TYPES.find((t) => t.id === id)
  return found?.label || 'Unknown'
}

export function formatIrishDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-IE', {
      timeZone: 'Europe/Dublin',
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  } catch {
    return iso
  }
}

export function formatEuro(amount: number | null | undefined): string {
  if (amount == null || !Number.isFinite(amount)) return '—'
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount)
}

export function defaultTripTracker(): Record<TripStepId, TripStepStatus> {
  const out = {} as Record<TripStepId, TripStepStatus>
  for (const step of TRIP_TRACKER_STEPS) {
    out[step.id] = step.id === 'enquiry_received' ? 'done' : 'todo'
  }
  return out
}
