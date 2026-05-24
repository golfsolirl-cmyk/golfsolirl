import { UserRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { PortalInterestCategoryGlyph } from '../components/portal-interest-category-glyph'
import { FocusTrapDialog } from '../components/focus-trap-dialog'
import { AdminOperationsHubHero } from '../components/admin-operations-hub-hero'
import { AdminPortalShell, AdminPortalSection, type AdminPortalSectionId } from '../components/admin-portal-shell'
import { AdminOperationsSectionShell } from '../components/admin-operations-section-shell'
import {
  AdminAccountTransfersHub,
  type AdminAccountLookupSeed
} from '../components/admin-account-transfers-hub'
import { AdminDriverCalendarPanel } from '../components/admin-driver-calendar-panel'
import { AdminTransferPipeline } from '../components/admin-transfer-pipeline'
import { AdminTestimonialsPanel } from '../components/admin-testimonials-panel'
import { TransferPaymentStatusBadge } from '../components/transfer-payment-status-badge'
import { PortalClientDataCard } from '../components/portal-client-data-card'
import { DashboardLayout, DashboardLoadingShell } from '../components/dashboard-layout'
import { buildClientDataCardSections, type AccountDeskDisplay } from '../lib/client-data-card'
import { contactInfo } from '../pages/golf-experience/data/copy'
import { formatDateTimeDdMmYy } from '../lib/date-format-ie'
import { LuxuryButton } from '../components/ui/button'
import { fetchPackageBuildsAdminList, isMissingClientDetailsColumnError } from '../lib/fetch-package-builds'
import {
  buildWebsiteFormAdminQuote,
  emptyTripDetailsForm,
  formatWebsiteFormFieldValueForDisplay,
  getWebsiteFormFieldLabel,
  hasMeaningfulTripDetails,
  IRISH_VAT_REDUCED_TOURISM_RATE,
  IRISH_VAT_STANDARD_RATE,
  mergeTripDetailsWithSaved,
  mergeAdminQuoteIntoWebsiteFormConfig,
  packageBuildDbSourceLabel,
  parseAnyPackageBuildRowConfig,
  serializeTripDetailsForDb,
  TRIP_DETAILS_DASHBOARD_EXCLUDED_SECTION_TITLES,
  TRIP_DETAILS_MULTILINE_KEYS,
  TRIP_DETAILS_SECTIONS,
  tripDefaultsForPackageRow,
  humanizeFormKey,
  orderedWebsiteFormFieldEntries,
  type AdminManualPackageKind,
  type PackageTripDetailsForm,
  type TripDetailsFieldKey
} from '../lib/package-build'
import { AIRPORT_CORRIDOR_HOTELS, corridorHotelBySlug } from '../data/airport-corridor-hotels'
import { COURSES, NEARBY_HOTELS } from '../data/coastal-golf-data'
import {
  buildAdminWorkspaceProposalPdfPayload,
  computeManualGroupPriceAllocation
} from '../lib/build-admin-workspace-proposal-payload'
import {
  buildAdminTransferLegsPreviewHtml,
  hydrateAdminWorkspaceDraftFromClientPackages,
  resolveAdminWorkspaceClientTransferSnapshot,
  type CostaMapBookingPreviewRow
} from '../lib/admin-trip-workspace-hydrate'
import { integrationRegistry } from '../config/integrations'
import { GOLFSOL_BRAND_LOGO } from '../lib/brand-logo-assets'
import { getSupabaseBrowserClient } from '../lib/supabase-client'
import { formatTravelDateInput } from '../lib/format-travel-date'
import { createProposalId, formatDocumentDate } from '../lib/document-templates'
import {
  buildClientLoginUrlForEnquiry,
  illustrativeTripPriceRangeEur,
  normalizeTransferStops,
  type TripStageKey,
  type TripWorkspaceDraft
} from '../lib/trip-workspace-draft'
import { useAuth } from '../providers/auth-provider'
import {
  ENQUIRY_STRUCTURED_FIELD_KEYS,
  PICKUP_DROPOFF_TYPES,
  QUOTE_INTENTS,
  WEBSITE_ENQUIRY_FORM
} from '../lib/enquiry-form-registry'
import { stripeCheckoutSessionDashboardUrl, stripePaymentDashboardUrl } from '../lib/stripe-dashboard-url'
import { isEnquiryAdminViewed, rememberEnquiryViewedLocally } from '../lib/admin-enquiry-viewed'
import { syncWebsiteQuotePaymentNote } from '../lib/sync-website-quote-payment-note'
import { cx } from '../lib/utils'
import {
  isMissingPortalInterestTicketsError,
  PORTAL_INTEREST_LABELS,
  type PortalInterestCategory,
  type PortalInterestTicketMessageRow,
  type PortalInterestTicketRow
} from '../lib/portal-interest-tickets'

interface EnquiryRow {
  id: string
  reference_id: string
  email: string
  full_name: string
  interest: string | null
  phone_whatsapp: string | null
  best_time_to_call: string | null
  created_at: string
  /** Structured answers from the submitting form; requires `form_payload` column in Supabase. */
  form_payload?: unknown
  /** Set after join with profiles on submitter email — dashboard account number */
  client_portal_account_ref?: string | null
  /** When an admin opened submission detail (shared across admins). */
  admin_viewed_at?: string | null
}

type AdminInterestTicketRow = PortalInterestTicketRow & {
  client_email: string | null
  client_name: string | null
  client_phone: string | null
  client_account_ref: string | null
}

const ADMIN_OPERATIONS_DESK_CARD: AccountDeskDisplay = {
  sectionTitle: 'Admin',
  fullName: 'Greg McDonald',
  phone: contactInfo.phoneDisplay
}

const MANUAL_OFFER_PORTAL_CATEGORY: Record<AdminManualPackageKind, PortalInterestCategory> = {
  transfer: 'transfers',
  golf: 'golf_courses',
  hotel: 'hotels'
}

/** Set `VITE_SHOW_ADMIN_WORKSPACE=true` in `.env.local` to show workflow, builders, and trip workspace (default: hidden everywhere). */
const SHOW_ADMIN_WORKSPACE_UI = import.meta.env.VITE_SHOW_ADMIN_WORKSPACE === 'true'

type StoredFormPayload = { form: string; fields: Record<string, string> }

function parseStoredFormPayload(raw: unknown): StoredFormPayload | null {
  if (raw === null || raw === undefined) {
    return null
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return null
  }
  const o = raw as Record<string, unknown>
  const form = typeof o.form === 'string' ? o.form.trim() : ''
  const fieldsRaw = o.fields
  if (!form || !fieldsRaw || typeof fieldsRaw !== 'object' || Array.isArray(fieldsRaw)) {
    return null
  }
  const fields: Record<string, string> = {}
  for (const [k, v] of Object.entries(fieldsRaw as Record<string, unknown>)) {
    const key = typeof k === 'string' ? k.trim() : ''
    if (!key) {
      continue
    }
    fields[key] =
      typeof v === 'string' ? v : typeof v === 'number' && Number.isFinite(v) ? String(v) : v === true ? 'yes' : v === false ? 'no' : ''
  }
  return Object.keys(fields).length ? { form, fields } : null
}

const normalizeFormFieldKey = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '')

const STRUCTURED_FORM_FIELD_LABELS: Record<string, string> = {
  [ENQUIRY_STRUCTURED_FIELD_KEYS.pax]: 'Party size (structured)',
  [ENQUIRY_STRUCTURED_FIELD_KEYS.pickupType]: 'Pickup type',
  [ENQUIRY_STRUCTURED_FIELD_KEYS.pickupId]: 'Pickup ID',
  [ENQUIRY_STRUCTURED_FIELD_KEYS.pickupLabel]: 'Pickup label',
  [ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffType]: 'Drop-off type',
  [ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffId]: 'Drop-off ID',
  [ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffLabel]: 'Drop-off label',
  [ENQUIRY_STRUCTURED_FIELD_KEYS.quoteIntent]: 'Quote intent',
  [ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateFrom]: 'Travel start date',
  [ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateTo]: 'Travel end date',
  [ENQUIRY_STRUCTURED_FIELD_KEYS.alreadyAtMalagaAgp]: 'Already at Málaga (AGP)'
}

function humanizeSubmissionPayloadFieldKey(key: string): string {
  const mapped = STRUCTURED_FORM_FIELD_LABELS[key]
  if (mapped) {
    return mapped
  }
  if (key.startsWith('_')) {
    return key
      .replace(/^_/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }
  return key
}

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

/**
 * DB timestamps are UTC (`created_at`, etc.). Show day–month–year + 24h time in Irish local time
 * so the admin view matches how you run the business (not the browser’s default locale).
 */
function formatAdminDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return iso
  }
  return d.toLocaleString('en-GB', {
    timeZone: 'Europe/Dublin',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

const formatIsoTravelHint = (iso: string) => {
  try {
    const d = new Date(`${iso}T12:00:00`)
    return Number.isNaN(d.getTime())
      ? iso
      : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return iso
  }
}

/** Admin enquiry detail: show stored `yyyy-mm-dd` as day–month–year for travel fields (and mirrored human labels). */
function formatSubmissionFieldDisplayValue(fieldKey: string, value: string): string {
  const v = value.trim()
  if (!v) {
    return '—'
  }
  if (!ISO_DATE_ONLY.test(v)) {
    return v
  }
  const nk = normalizeFormFieldKey(fieldKey)
  const isTravelDateField =
    fieldKey === ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateFrom ||
    fieldKey === ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateTo ||
    nk === 'traveldatefrom' ||
    nk === 'traveldateto' ||
    nk === 'travelstartdate' ||
    nk === 'travelenddate'
  return isTravelDateField ? formatIsoTravelHint(v) : v
}

/** Map stored enquiry `form_payload` labels into manual proposal fields where we can infer them. */
function extractManualHintsFromFormPayload(row: EnquiryRow): Partial<ManualProposalForm> {
  const parsed = parseStoredFormPayload(row.form_payload)
  const out: Partial<ManualProposalForm> = {}
  if (!parsed) {
    return out
  }
  const { fields } = parsed
  for (const [rawLabel, rawVal] of Object.entries(fields)) {
    const v = rawVal.trim()
    if (!v) {
      continue
    }
    const k = normalizeFormFieldKey(rawLabel)
    if (k.includes('travel') && k.includes('date')) {
      out.travelDates = ISO_DATE_ONLY.test(v) ? formatIsoTravelHint(v) : v
    } else if (k.includes('night') && !k.includes('day')) {
      const n = parseInt(v.replace(/[^\d]/g, ''), 10)
      if (Number.isFinite(n) && n > 0) {
        out.nights = String(n)
      }
    } else if (k.includes('round')) {
      const n = parseInt(v.replace(/[^\d]/g, ''), 10)
      if (Number.isFinite(n) && n > 0) {
        out.rounds = String(n)
      }
    } else if (
      k.includes('golfer') ||
      k.includes('partysize') ||
      (k.includes('party') && !k.includes('priority')) ||
      k.includes('guest') ||
      k.includes('people') ||
      k.includes('player') ||
      k === 'passengers' ||
      k.includes('pax')
    ) {
      const n = parseInt(v.replace(/[^\d]/g, ''), 10)
      if (Number.isFinite(n) && n > 0) {
        out.groupSize = String(n)
      }
    } else if (k.includes('course') && !out.courseName) {
      out.courseName = v
    } else if (k.includes('hotel') && !k.includes('distance')) {
      out.hotelName = v
    } else if (k.includes('airport') || k.includes('departure') || (k.includes('route') && !k.includes('course'))) {
      out.departureAirportRoute = v
    } else if (k.includes('collection') && k.includes('point')) {
      out.airportTransfersDetail = v.length > 200 ? v.slice(0, 200) + '…' : v
    } else if (k === 'destination' || k.includes('resort')) {
      out.resortArea = v
    } else if (k === 'pax') {
      const n = parseInt(v.replace(/[^\d]/g, ''), 10)
      if (Number.isFinite(n) && n > 0) {
        out.groupSize = String(Math.min(8, n))
      }
    }
  }

  const qi = fields[ENQUIRY_STRUCTURED_FIELD_KEYS.quoteIntent]?.trim()
  if (qi === QUOTE_INTENTS.airportOnly) {
    out.pdfProductKind = 'airport_transfer'
  }

  const pl = fields[ENQUIRY_STRUCTURED_FIELD_KEYS.pickupLabel]?.trim()
  const dl = fields[ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffLabel]?.trim()
  const pt = fields[ENQUIRY_STRUCTURED_FIELD_KEYS.pickupType]?.trim()
  const dt = fields[ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffType]?.trim()
  if (pl || dl) {
    const lines: string[] = []
    if (pl) {
      lines.push(`Pickup (${pt || 'detail'}): ${pl}`)
    }
    if (dl) {
      lines.push(`Destination (${dt || 'detail'}): ${dl}`)
    }
    const merged = lines.join(' · ')
    if (merged) {
      out.airportTransfersDetail = merged.length > 220 ? `${merged.slice(0, 217)}…` : merged
    }
  }

  const did = fields[ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffId]?.trim()
  if (fields[ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffType] === PICKUP_DROPOFF_TYPES.golfCourse && did) {
    const cn = COURSES.find((c) => c.id === did)?.name
    if (cn && !out.courseName) {
      out.courseName = cn
    }
  }

  const atAgp = fields[ENQUIRY_STRUCTURED_FIELD_KEYS.alreadyAtMalagaAgp]?.trim() === 'yes'
  const isoFrom = fields[ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateFrom]?.trim()
  const isoTo = fields[ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateTo]?.trim()
  if (atAgp) {
    let line = 'Already at Málaga (AGP) — need ground transport.'
    if (isoFrom || isoTo) {
      line += ` (${[isoFrom, isoTo].filter(Boolean).map(formatIsoTravelHint).join(' → ')})`
    }
    out.travelDates = line
  } else if (isoFrom && isoTo) {
    out.travelDates = `${formatIsoTravelHint(isoFrom)} – ${formatIsoTravelHint(isoTo)}`
  } else if (isoFrom || isoTo) {
    out.travelDates = [isoFrom, isoTo].filter(Boolean).map(formatIsoTravelHint).join(' → ')
  }

  return out
}

function submissionDetailRows(row: EnquiryRow): [string, string][] {
  const parsed = parseStoredFormPayload(row.form_payload)
  const rows: [string, string][] = [
    ['Reference ID', row.reference_id],
    ['Full name', row.full_name],
    ['Email', row.email],
    ['Phone / WhatsApp', row.phone_whatsapp ?? '—'],
    ['Best time to call', row.best_time_to_call ?? '—'],
    ['Submitted', formatAdminDateTime(row.created_at)]
  ]
  if (parsed) {
    rows.push(['Form source', parsed.form])
    const f = parsed.fields
    const atAgp = f[ENQUIRY_STRUCTURED_FIELD_KEYS.alreadyAtMalagaAgp]?.trim() === 'yes'
    const isoFrom = f[ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateFrom]?.trim()
    const isoTo = f[ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateTo]?.trim()
    if (atAgp || isoFrom || isoTo) {
      const summary = atAgp
        ? `Already at Málaga (AGP)${isoFrom || isoTo ? ` · ${[isoFrom, isoTo].filter(Boolean).map(formatIsoTravelHint).join(' → ')}` : ''}`
        : isoFrom && isoTo
          ? `${formatIsoTravelHint(isoFrom)} – ${formatIsoTravelHint(isoTo)}`
          : [isoFrom, isoTo].filter(Boolean).map(formatIsoTravelHint).join(' → ')
      rows.push(['Travel timing (summary)', summary || '—'])
    }
    for (const [label, value] of Object.entries(parsed.fields)) {
      rows.push([
        humanizeSubmissionPayloadFieldKey(label),
        formatSubmissionFieldDisplayValue(label, value)
      ])
    }
  }
  rows.push(['Trip interest (combined text)', row.interest ?? '—'])
  return rows
}

interface ProposalRow {
  id: string
  proposal_id: string
  title: string | null
  status: string
  created_at: string
}

interface ProfileEmbed {
  email: string | null
  full_name: string | null
}

interface PackageBuildAdminRow {
  id: string
  owner_id: string
  label: string | null
  source: string
  config: unknown
  client_details: unknown
  created_at: string
  updated_at?: string
  linked_proposal_id?: string | null
  profiles: ProfileEmbed | ProfileEmbed[] | null
}

interface ManualLinkBuildChoice {
  id: string
  label: string | null
  created_at: string
}

const profileFromRow = (row: PackageBuildAdminRow): ProfileEmbed | null => {
  const p = row.profiles
  if (!p) {
    return null
  }

  return Array.isArray(p) ? p[0] ?? null : p
}

const readPdfDataUrlBase64Payload = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result ?? '')
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })

const formatEur = (value: number) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)

const proposalStatusStyles: Record<string, string> = {
  draft: 'bg-forest-800 text-white',
  sent: 'bg-fairway-700 text-white',
  accepted: 'bg-brand-50 text-brand-700',
  archived: 'bg-forest-800 text-white'
}

const adminTripLabelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600'

const adminTripInputClass =
  'w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm text-forest-900 outline-none transition-[border-color,box-shadow] focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/70'

/** Manual customer proposal form — consistent mustard-green outline on every field. */
const manualProposalInputClass =
  'w-full rounded-xl border-2 border-chrome-400 bg-white px-3 py-2.5 text-sm text-forest-900 outline-none transition-[border-color,box-shadow] focus:border-chrome-500 focus:ring-2 focus:ring-yellow-200/90 focus:ring-offset-0'

interface ManualProposalForm {
  clientFullName: string
  clientEmail: string
  clientPhone: string
  clientInterest: string
  enquiryReferenceId: string
  proposalId: string
  proposalDate: string
  packageName: string
  stayName: string
  transferName: string
  groupSize: string
  nights: string
  rounds: string
  courseName: string
  hotelName: string
  hotelDist: string
  perPersonPrice: string
  groupTotal: string
  depositAmount: string
  remainingBalance: string
  quoteScopeSummary: string
  extraNotes: string
  /** PDF “Trip shape” / “Proposal details” / “Logistics and inclusions” cards */
  travelDates: string
  departureAirportRoute: string
  leadTravellerContact: string
  resortArea: string
  proposalSpecialRequests: string
  airportTransfersDetail: string
  golfDayTransportDetail: string
  boardBasis: string
  upgradeNotes: string
  /** When set, overrides nights/rounds for the PDF trip-shape line and pricing summary. */
  tripShapeCustom: string
  /** First-page PDF hero; `default` keeps legacy “Costa del Sol golf proposal” copy. */
  pdfProductKind: 'default' | 'airport_transfer' | 'golf_transfer' | 'hotel_accommodation'
}

const createEmptyManualProposalForm = (): ManualProposalForm => ({
  clientFullName: '',
  clientEmail: '',
  clientPhone: '',
  clientInterest: '',
  enquiryReferenceId: '',
  proposalId: createProposalId(),
  proposalDate: formatDocumentDate(),
  packageName: 'Custom Costa del Sol golf proposal',
  stayName: '',
  transferName: '',
  groupSize: '4',
  nights: '4',
  rounds: '3',
  courseName: '',
  hotelName: '',
  hotelDist: '',
  perPersonPrice: '',
  groupTotal: '',
  depositAmount: '',
  remainingBalance: '',
  quoteScopeSummary: 'Transfers · Golf · Hotel',
  extraNotes: '',
  travelDates: '',
  departureAirportRoute: '',
  leadTravellerContact: '',
  resortArea: '',
  proposalSpecialRequests: '',
  airportTransfersDetail: '',
  golfDayTransportDetail: '',
  boardBasis: '',
  upgradeNotes: '',
  tripShapeCustom: '',
  pdfProductKind: 'default'
})

type ManualProposalFieldKey = keyof ManualProposalForm

export function AdminDashboardPage() {
  const { session, profile, isLoading, refreshProfile } = useAuth()
  const [crmDocEmail, setCrmDocEmail] = useState('')
  const [crmDocSending, setCrmDocSending] = useState<'idle' | 'terms' | 'welcome'>('idle')
  const [crmDocMessage, setCrmDocMessage] = useState<string | null>(null)
  const [portalClientEmail, setPortalClientEmail] = useState('')
  const [portalAccountRef, setPortalAccountRef] = useState('')
  const [portalProposalsEnabled, setPortalProposalsEnabled] = useState(false)
  const [portalPdfLibraryEnabled, setPortalPdfLibraryEnabled] = useState(false)
  const [portalSettingsBusy, setPortalSettingsBusy] = useState<'idle' | 'load' | 'save'>('idle')
  const [portalSettingsMessage, setPortalSettingsMessage] = useState<string | null>(null)
  const [manualPortalCreateName, setManualPortalCreateName] = useState('')
  const [manualPortalCreateEmail, setManualPortalCreateEmail] = useState('')
  const [manualPortalCreateSendLink, setManualPortalCreateSendLink] = useState(true)
  const [manualPortalCreateBusy, setManualPortalCreateBusy] = useState(false)
  const [manualPortalCreateMessage, setManualPortalCreateMessage] = useState<string | null>(null)
  const [manualPortalDeleteEmail, setManualPortalDeleteEmail] = useState('')
  const [manualPortalDeleteBusy, setManualPortalDeleteBusy] = useState(false)
  const [portalOnboardingResetEmail, setPortalOnboardingResetEmail] = useState('')
  const [portalOnboardingResetBusy, setPortalOnboardingResetBusy] = useState(false)
  const [portalOnboardingResetMsg, setPortalOnboardingResetMsg] = useState<string | null>(null)
  const [clearDashboardAccountRef, setClearDashboardAccountRef] = useState('')
  const [clearDashboardBusy, setClearDashboardBusy] = useState(false)
  const [clearDashboardMessage, setClearDashboardMessage] = useState<string | null>(null)
  const [clearPortalInboxBusy, setClearPortalInboxBusy] = useState(false)
  const [clearPortalInboxMessage, setClearPortalInboxMessage] = useState<string | null>(null)
  /** Used with portal clear actions: inbox rows are keyed by profile id from this email when studio sends mail. */
  const [clearPortalClientEmail, setClearPortalClientEmail] = useState('')
  const [authBlockList, setAuthBlockList] = useState<{ email: string; blocked_at: string; reason: string | null }[]>([])
  const [authBlockListLoading, setAuthBlockListLoading] = useState(false)
  const [authBlockEmailInput, setAuthBlockEmailInput] = useState('')
  const [authBlockReasonInput, setAuthBlockReasonInput] = useState('')
  const [authBlockBusy, setAuthBlockBusy] = useState(false)
  const [authBlockMessage, setAuthBlockMessage] = useState<string | null>(null)
  const [portalLinkCopyMessage, setPortalLinkCopyMessage] = useState<string | null>(null)
  const [portalLinkCopyBusy, setPortalLinkCopyBusy] = useState<'idle' | 'client' | 'admin'>('idle')
  const [interestAdminTickets, setInterestAdminTickets] = useState<AdminInterestTicketRow[]>([])
  const [interestAdminTicketsError, setInterestAdminTicketsError] = useState<string | null>(null)
  const [selectedAdminTicketId, setSelectedAdminTicketId] = useState<string | null>(null)
  const [adminTicketMessages, setAdminTicketMessages] = useState<PortalInterestTicketMessageRow[]>([])
  const [adminTicketMessagesLoading, setAdminTicketMessagesLoading] = useState(false)
  const [adminTicketReply, setAdminTicketReply] = useState('')
  const [adminTicketReplyBusy, setAdminTicketReplyBusy] = useState(false)
  const [adminTicketReplyMessage, setAdminTicketReplyMessage] = useState<string | null>(null)
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([])
  const [enquiriesSectionVisible, setEnquiriesSectionVisible] = useState(true)
  const [adminShowTransferBuilder, setAdminShowTransferBuilder] = useState(false)
  const [adminShowManualProposal, setAdminShowManualProposal] = useState(false)
  const [enquiryDeletingId, setEnquiryDeletingId] = useState<string | null>(null)
  const [enquiryDeletingAll, setEnquiryDeletingAll] = useState(false)
  const [enquiryDeleteMessage, setEnquiryDeleteMessage] = useState<string | null>(null)
  const [enquirySearchQuery, setEnquirySearchQuery] = useState('')
  const [selectedEnquiryDetailRef, setSelectedEnquiryDetailRef] = useState<string | null>(null)
  const [accountLookupSeedFromTable, setAccountLookupSeedFromTable] = useState<AdminAccountLookupSeed | null>(null)
  const [portalInvoiceAmountInput, setPortalInvoiceAmountInput] = useState('')
  const [portalInvoiceSendBusy, setPortalInvoiceSendBusy] = useState(false)
  const [portalInvoiceSendMessage, setPortalInvoiceSendMessage] = useState<string | null>(null)
  const [workspaceEnquiryRef, setWorkspaceEnquiryRef] = useState('')
  const [workspaceDraft, setWorkspaceDraft] = useState<TripWorkspaceDraft | null>(null)
  const [workspaceCopyMessage, setWorkspaceCopyMessage] = useState<string | null>(null)
  const [workspacePdfUrl, setWorkspacePdfUrl] = useState<string | null>(null)
  const [workspacePdfLoading, setWorkspacePdfLoading] = useState(false)
  const [workspacePdfError, setWorkspacePdfError] = useState<string | null>(null)
  const workspacePdfObjectUrlRef = useRef<string | null>(null)
  const [workspaceManualTotalInput, setWorkspaceManualTotalInput] = useState('')
  const [workspaceUseManualTotal, setWorkspaceUseManualTotal] = useState(false)
  const [workspaceTripNights, setWorkspaceTripNights] = useState(4)
  const [workspaceTripShapeCustom, setWorkspaceTripShapeCustom] = useState('')
  const [workspaceClientEmail, setWorkspaceClientEmail] = useState('')
  const [workspaceHotelEmail, setWorkspaceHotelEmail] = useState('')
  const [workspaceHotelNotes, setWorkspaceHotelNotes] = useState('')
  const [workspaceEmailBusy, setWorkspaceEmailBusy] = useState<'idle' | 'client' | 'hotel'>('idle')
  const [workspaceEmailMessage, setWorkspaceEmailMessage] = useState<string | null>(null)
  const [workspaceCostaMapBookings, setWorkspaceCostaMapBookings] = useState<CostaMapBookingPreviewRow[]>([])
  /** Bumped on window focus so desk transfer rows refetch after client Stripe payment. */
  const [workspaceTransferPollTick, setWorkspaceTransferPollTick] = useState(0)
  const [workspaceTransferPayBusyId, setWorkspaceTransferPayBusyId] = useState<string | null>(null)
  const [workspaceTransferPayMsg, setWorkspaceTransferPayMsg] = useState<string | null>(null)
  const [workspaceTransferReminderBusy, setWorkspaceTransferReminderBusy] = useState(false)
  const [workspaceTransferSendCustomerEmails, setWorkspaceTransferSendCustomerEmails] = useState(true)
  const [workspacePkgQuoteGross, setWorkspacePkgQuoteGross] = useState('')
  const [workspacePkgQuoteVat, setWorkspacePkgQuoteVat] = useState(IRISH_VAT_STANDARD_RATE)
  const [workspacePkgQuoteBusy, setWorkspacePkgQuoteBusy] = useState(false)
  const [workspacePkgQuoteMessage, setWorkspacePkgQuoteMessage] = useState<string | null>(null)
  const [manualProposalForm, setManualProposalForm] = useState<ManualProposalForm>(() => createEmptyManualProposalForm())
  const [manualProposalPdfUrl, setManualProposalPdfUrl] = useState<string | null>(null)
  const [manualProposalPdfLoading, setManualProposalPdfLoading] = useState(false)
  const [manualProposalSending, setManualProposalSending] = useState(false)
  const [manualProposalMessage, setManualProposalMessage] = useState<string | null>(null)
  const manualProposalPdfObjectUrlRef = useRef<string | null>(null)
  const [manualLinkBuildChoices, setManualLinkBuildChoices] = useState<ManualLinkBuildChoice[]>([])
  const [manualLinkBuildLoading, setManualLinkBuildLoading] = useState(false)
  const [manualLinkBuildNotice, setManualLinkBuildNotice] = useState<string | null>(null)
  const [manualLinkBuildSelectedIds, setManualLinkBuildSelectedIds] = useState<Record<string, boolean>>({})
  const [manualPortalSnapshot, setManualPortalSnapshot] = useState<{
    loading: boolean
    hasProfile: boolean
    accountRef: string | null
    proposalsEnabled: boolean
    pdfLibraryEnabled: boolean
  }>({ loading: false, hasProfile: false, accountRef: null, proposalsEnabled: false, pdfLibraryEnabled: false })
  const [manualSaveProposalToPortal, setManualSaveProposalToPortal] = useState(true)
  /** When set, manual proposal was loaded from this enquiry ref — show compact layout until admin expands. */
  const [manualProposalFromEnquiryRef, setManualProposalFromEnquiryRef] = useState<string | null>(null)
  const [manualProposalExpanded, setManualProposalExpanded] = useState(true)
  const [manualProposalAdminTab, setManualProposalAdminTab] = useState<'transfers' | 'golf'>('golf')
  const [manualGolfPickerQuery, setManualGolfPickerQuery] = useState('')
  const [proposals, setProposals] = useState<ProposalRow[]>([])
  const [packageBuilds, setPackageBuilds] = useState<PackageBuildAdminRow[]>([])
  const [manualOfferEmail, setManualOfferEmail] = useState('')
  const [manualOfferKind, setManualOfferKind] = useState<AdminManualPackageKind>('transfer')
  const [manualOfferTitle, setManualOfferTitle] = useState('')
  const [manualOfferSummary, setManualOfferSummary] = useState('')
  const [manualOfferPrice, setManualOfferPrice] = useState('')
  const [manualOfferBusy, setManualOfferBusy] = useState(false)
  const [manualOfferMessage, setManualOfferMessage] = useState<string | null>(null)
  const [tbTemplate, setTbTemplate] = useState<'airport_only' | 'golf_leg'>('airport_only')
  const [tbPassengers, setTbPassengers] = useState(4)
  const [tbDestTab, setTbDestTab] = useState<'hotels' | 'golf'>('hotels')
  const [tbHotelSlug, setTbHotelSlug] = useState('')
  const [tbCourseIdAirDest, setTbCourseIdAirDest] = useState('')
  const [tbPickupTab, setTbPickupTab] = useState<'airport' | 'hotel'>('airport')
  const [tbPickupHotelSlug, setTbPickupHotelSlug] = useState('')
  const [tbGolfDropCourseId, setTbGolfDropCourseId] = useState('')
  const [tbApplyMessage, setTbApplyMessage] = useState<string | null>(null)
  /** Transfer builder: client from Details enquiry vs Reference ID lookup vs typed portal email. */
  const [tbClientMode, setTbClientMode] = useState<'enquiry' | 'reference' | 'manual'>('enquiry')
  const [tbManualClientEmail, setTbManualClientEmail] = useState('')
  const [tbManualClientDisplayName, setTbManualClientDisplayName] = useState('')
  const [tbManualTripRef, setTbManualTripRef] = useState('')
  const [tbReferenceIdInput, setTbReferenceIdInput] = useState('')
  const [tbReferenceResolvedRow, setTbReferenceResolvedRow] = useState<EnquiryRow | null>(null)
  const [tbReferenceLookupMessage, setTbReferenceLookupMessage] = useState<string | null>(null)
  const [studioEmailTo, setStudioEmailTo] = useState('')
  const [studioEmailSubject, setStudioEmailSubject] = useState('')
  const [studioEmailBody, setStudioEmailBody] = useState('')
  const [studioEmailBusy, setStudioEmailBusy] = useState(false)
  const [studioEmailMessage, setStudioEmailMessage] = useState<string | null>(null)
  const studioAttachmentsRef = useRef<HTMLInputElement>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [buildsLoadError, setBuildsLoadError] = useState<string | null>(null)
  const [packageBuildDeletingId, setPackageBuildDeletingId] = useState<string | null>(null)
  const [packageBuildDeleteMessage, setPackageBuildDeleteMessage] = useState<string | null>(null)
  const [listLoading, setListLoading] = useState(true)
  const [detailBuildId, setDetailBuildId] = useState<string | null>(null)
  const [adminTripForm, setAdminTripForm] = useState<PackageTripDetailsForm>(() => emptyTripDetailsForm())
  const [adminSaveStatus, setAdminSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [adminSaveMessage, setAdminSaveMessage] = useState<string | null>(null)
  const adminSaveMessageRef = useRef<HTMLParagraphElement>(null)
  /** Avoid treating post-save `packageBuilds` updates as a new modal open (prevents save banner reset / disruptive re-sync). */
  const prevAdminDetailOpenBuildIdRef = useRef<string | null>(null)
  const [websiteQuoteGross, setWebsiteQuoteGross] = useState('')
  const [websiteQuoteVatRate, setWebsiteQuoteVatRate] = useState(IRISH_VAT_STANDARD_RATE)
  const [websiteQuoteBusy, setWebsiteQuoteBusy] = useState(false)
  const [websiteQuoteMessage, setWebsiteQuoteMessage] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!session?.user) {
      window.location.replace('/dashboard/login')
      return
    }

    /** Only redirect once profile row is known; `null` means fetch failed / no row — do not send real admins to the client dashboard during a race or RLS glitch. */
    if (profile !== null && profile.role !== 'admin') {
      window.location.replace('/dashboard')
    }
  }, [isLoading, session?.user?.id, profile])

  useEffect(() => {
    if (!session?.user || !profile || profile.role !== 'admin') {
      return
    }

    const supabase = getSupabaseBrowserClient()

    if (!supabase) {
      setListLoading(false)
      setLoadError('Supabase is not configured.')
      return
    }

    let cancelled = false

    const load = async () => {
      setListLoading(true)
      setPackageBuildDeleteMessage(null)
      try {
        const [enqRes, propRes, buildRes, tkRes] = await Promise.all([
          supabase.from('enquiries').select('*').order('created_at', { ascending: false }).limit(100),
          supabase.from('proposals').select('id, proposal_id, title, status, created_at').order('created_at', { ascending: false }).limit(100),
          fetchPackageBuildsAdminList(supabase, 100),
          supabase
            .from('portal_interest_tickets')
            .select('id, owner_id, category, status, created_at, updated_at')
            .order('created_at', { ascending: false })
            .limit(100)
        ])

        if (cancelled) {
          return
        }

        const errMsg = enqRes.error?.message ?? propRes.error?.message ?? null
        setLoadError(errMsg)
        let enquiryRows = (enqRes.data ?? []) as EnquiryRow[]
        if (!enqRes.error && enquiryRows.length > 0 && supabase) {
          const emails = [...new Set(enquiryRows.map((e) => e.email?.trim().toLowerCase()).filter(Boolean))]
          if (emails.length > 0) {
            const pr = await supabase.from('profiles').select('email, account_reference_id').in('email', emails)
            if (!pr.error && pr.data) {
              const accountByEmail: Record<string, string | null> = {}
              for (const row of pr.data as { email: string; account_reference_id: string | null }[]) {
                const em = row.email.trim().toLowerCase()
                accountByEmail[em] =
                  typeof row.account_reference_id === 'string' ? row.account_reference_id.trim() : null
              }
              enquiryRows = enquiryRows.map((row) => ({
                ...row,
                client_portal_account_ref: accountByEmail[row.email.trim().toLowerCase()] ?? null
              }))
            }
          }
        }
        setEnquiries(enquiryRows)
        setProposals((propRes.data ?? []) as ProposalRow[])

        if (buildRes.error) {
          setBuildsLoadError(buildRes.error.message)
          setPackageBuilds([])
        } else {
          setBuildsLoadError(null)
          setPackageBuilds((buildRes.data ?? []) as PackageBuildAdminRow[])
        }

        if (tkRes.error) {
          if (isMissingPortalInterestTicketsError(tkRes.error)) {
            setInterestAdminTickets([])
            setInterestAdminTicketsError(null)
          } else {
            setInterestAdminTickets([])
            setInterestAdminTicketsError(tkRes.error.message)
          }
        } else {
          const rawTickets = (tkRes.data ?? []) as PortalInterestTicketRow[]
          const ownerIds = [...new Set(rawTickets.map((t) => t.owner_id).filter(Boolean))]
          const profBy: Record<
            string,
            { email: string | null; full_name: string | null; phone: string | null; account_reference_id: string | null }
          > = {}
          if (ownerIds.length > 0) {
            const pr = await supabase
              .from('profiles')
              .select('id, email, full_name, phone, account_reference_id')
              .in('id', ownerIds)
            if (!pr.error && pr.data) {
              for (const p of pr.data as {
                id: string
                email: string | null
                full_name: string | null
                phone: string | null
                account_reference_id: string | null
              }[]) {
                profBy[p.id] = {
                  email: p.email ?? null,
                  full_name: p.full_name ?? null,
                  phone: p.phone ?? null,
                  account_reference_id: p.account_reference_id ?? null
                }
              }
            }
          }
          setInterestAdminTicketsError(null)
          const merged = rawTickets.map((t) => {
            const pr = profBy[t.owner_id]
            return {
              ...t,
              client_email: pr?.email ?? null,
              client_name: pr?.full_name ?? null,
              client_phone: pr?.phone?.trim() ? pr.phone.trim() : null,
              client_account_ref: pr?.account_reference_id?.trim() ? pr.account_reference_id.trim() : null
            }
          })
          merged.sort((a, b) => {
            const ao = a.status === 'open' ? 0 : 1
            const bo = b.status === 'open' ? 0 : 1
            if (ao !== bo) {
              return ao - bo
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          })
          setInterestAdminTickets(merged)
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load admin data.')
        }
      } finally {
        setListLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [session?.user?.id, profile?.id, profile?.role])

  const filterEnquiriesByQuery = useCallback(
    (list: EnquiryRow[]) => {
      const q = enquirySearchQuery.trim().toLowerCase()
      if (!q) {
        return list
      }
      return list.filter((row) => {
        const hay =
          `${row.reference_id} ${row.full_name} ${row.email} ${row.interest ?? ''} ${row.phone_whatsapp ?? ''} ${row.client_portal_account_ref ?? ''}`.toLowerCase()
        return hay.includes(q)
      })
    },
    [enquirySearchQuery]
  )

  const unviewedEnquiries = useMemo(
    () => filterEnquiriesByQuery(enquiries.filter((row) => !isEnquiryAdminViewed(row))),
    [enquiries, filterEnquiriesByQuery]
  )

  const viewedEnquiries = useMemo(
    () => filterEnquiriesByQuery(enquiries.filter((row) => isEnquiryAdminViewed(row))),
    [enquiries, filterEnquiriesByQuery]
  )

  const markEnquiryViewed = useCallback(async (row: EnquiryRow) => {
    if (isEnquiryAdminViewed(row)) {
      return
    }
    const viewedAt = new Date().toISOString()
    rememberEnquiryViewedLocally(row.reference_id)
    setEnquiries((prev) => prev.map((e) => (e.id === row.id ? { ...e, admin_viewed_at: viewedAt } : e)))
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      return
    }
    const { error } = await supabase.from('enquiries').update({ admin_viewed_at: viewedAt }).eq('id', row.id)
    if (error?.message?.includes('admin_viewed_at')) {
      return
    }
  }, [])

  const selectedEnquiryDetail = useMemo(
    () => enquiries.find((row) => row.reference_id === selectedEnquiryDetailRef) ?? null,
    [enquiries, selectedEnquiryDetailRef]
  )

  useEffect(() => {
    if (!selectedEnquiryDetail) {
      return
    }
    void markEnquiryViewed(selectedEnquiryDetail)
  }, [selectedEnquiryDetail, markEnquiryViewed])

  /** Website-form package rows mirror signed-in submissions; pricing is edited on that build, not on the enquiry card. */
  const websiteFormPackageBuildForSelectedEnquiry = useMemo(() => {
    if (!selectedEnquiryDetailRef) {
      return null
    }
    const matches = packageBuilds.filter((row) => {
      const cfg = parseAnyPackageBuildRowConfig(row.config)
      return cfg?.type === 'website_form' && cfg.config.enquiryReferenceId === selectedEnquiryDetailRef
    })
    if (matches.length === 0) {
      return null
    }
    const sorted = [...matches].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return sorted[0] ?? null
  }, [packageBuilds, selectedEnquiryDetailRef])

  const activeWorkspaceEnquiry = useMemo(
    () => enquiries.find((row) => row.reference_id === workspaceEnquiryRef) ?? null,
    [enquiries, workspaceEnquiryRef]
  )

  const workspaceWebsiteFormBuildSig = useMemo(() => {
    if (!workspaceEnquiryRef) {
      return ''
    }
    const rows = packageBuilds.filter((row) => {
      const cfg = parseAnyPackageBuildRowConfig(row.config)
      return cfg?.type === 'website_form' && cfg.config.enquiryReferenceId === workspaceEnquiryRef
    })
    const newest = [...rows].sort(
      (a, b) =>
        new Date(b.updated_at ?? b.created_at).getTime() - new Date(a.updated_at ?? a.created_at).getTime()
    )[0]
    if (!newest) {
      return `_none:${workspaceEnquiryRef}`
    }
    return `${newest.id}:${newest.updated_at ?? newest.created_at}`
  }, [packageBuilds, workspaceEnquiryRef])

  const workspaceEnquiryFieldsSig = useMemo(() => {
    const row = enquiries.find((e) => e.reference_id === workspaceEnquiryRef)
    if (!row?.form_payload) {
      return ''
    }
    const fields = parseStoredFormPayload(row.form_payload)?.fields
    return fields ? JSON.stringify(fields) : ''
  }, [enquiries, workspaceEnquiryRef])

  const workspaceClientTransferSnap = useMemo(() => {
    if (!workspaceEnquiryRef) {
      return null
    }
    const enq = enquiries.find((e) => e.reference_id === workspaceEnquiryRef)
    const fields = parseStoredFormPayload(enq?.form_payload)?.fields ?? null
    return resolveAdminWorkspaceClientTransferSnapshot(workspaceEnquiryRef, fields, packageBuilds)
  }, [workspaceEnquiryRef, enquiries, packageBuilds])

  const workspaceTransferPreviewSrcDoc = useMemo(
    () =>
      workspaceClientTransferSnap || workspaceCostaMapBookings.length > 0
        ? buildAdminTransferLegsPreviewHtml(
            workspaceClientTransferSnap,
            workspaceEnquiryRef.trim() || workspaceClientTransferSnap?.referenceId || '',
            workspaceCostaMapBookings
          )
        : '',
    [workspaceClientTransferSnap, workspaceCostaMapBookings, workspaceEnquiryRef]
  )

  const workspaceLinkedWebsiteFormBuild = useMemo((): PackageBuildAdminRow | null => {
    if (!workspaceEnquiryRef.trim()) {
      return null
    }
    const rows = packageBuilds.filter((row) => {
      const cfg = parseAnyPackageBuildRowConfig(row.config)
      return cfg?.type === 'website_form' && cfg.config.enquiryReferenceId === workspaceEnquiryRef.trim()
    })
    const newest = [...rows].sort(
      (a, b) =>
        new Date(b.updated_at ?? b.created_at).getTime() - new Date(a.updated_at ?? a.created_at).getTime()
    )[0]
    return newest ?? null
  }, [packageBuilds, workspaceEnquiryRef])

  const workspacePkgQuotePreview = useMemo(() => {
    const g = Number(workspacePkgQuoteGross.replace(/,/g, ''))
    if (!Number.isFinite(g) || g <= 0) {
      return null
    }
    return buildWebsiteFormAdminQuote(g, workspacePkgQuoteVat)
  }, [workspacePkgQuoteGross, workspacePkgQuoteVat])

  const openInterestTicketCount = useMemo(
    () => interestAdminTickets.filter((t) => t.status === 'open').length,
    [interestAdminTickets]
  )

  const selectedAdminInterestTicket = useMemo(
    () => interestAdminTickets.find((t) => t.id === selectedAdminTicketId) ?? null,
    [interestAdminTickets, selectedAdminTicketId]
  )

  useEffect(() => {
    if (!workspaceEnquiryRef) {
      setWorkspaceDraft(null)
      return
    }

    const enq = enquiries.find((e) => e.reference_id === workspaceEnquiryRef)
    const fields = parseStoredFormPayload(enq?.form_payload)?.fields ?? null
    setWorkspaceDraft(hydrateAdminWorkspaceDraftFromClientPackages(workspaceEnquiryRef, fields, packageBuilds))
  }, [workspaceEnquiryRef, workspaceWebsiteFormBuildSig, workspaceEnquiryFieldsSig])

  useEffect(() => {
    const row = workspaceLinkedWebsiteFormBuild
    if (!row) {
      setWorkspacePkgQuoteGross('')
      setWorkspacePkgQuoteVat(IRISH_VAT_STANDARD_RATE)
      return
    }
    const p = parseAnyPackageBuildRowConfig(row.config)
    if (p?.type === 'website_form' && p.config.adminQuote) {
      setWorkspacePkgQuoteGross(String(p.config.adminQuote.grossTotalEur))
      setWorkspacePkgQuoteVat(p.config.adminQuote.vatRate)
    } else {
      setWorkspacePkgQuoteGross('')
      setWorkspacePkgQuoteVat(IRISH_VAT_STANDARD_RATE)
    }
  }, [workspaceLinkedWebsiteFormBuild, workspaceWebsiteFormBuildSig])

  useEffect(() => {
    const ref = workspaceEnquiryRef.trim()
    const email = activeWorkspaceEnquiry?.email?.trim().toLowerCase()
    if (!ref && !email) {
      setWorkspaceCostaMapBookings([])
      return
    }

    let cancelled = false
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setWorkspaceCostaMapBookings([])
      return
    }

    void (async () => {
      let uid: string | null = null
      if (email) {
        const pr = await supabase.from('profiles').select('id').ilike('email', email).maybeSingle()
        if (cancelled) {
          return
        }
        uid = pr.data?.id ?? null
      }
      const orParts: string[] = []
      if (ref) {
        orParts.push(`enquiry_reference_id.eq.${ref}`)
      }
      if (uid) {
        orParts.push(`client_user_id.eq.${uid}`)
      }
      if (orParts.length === 0) {
        if (!cancelled) {
          setWorkspaceCostaMapBookings([])
        }
        return
      }
      const tb = await supabase
        .from('transfer_bookings')
        .select(
          'id,pickup_label,dropoff_label,scheduled_at,status,created_at,booking_source,enquiry_reference_id,client_email,payment_status,deposit_percent,balance_remind_at,balance_remind_sent_at,admin_price_eur,admin_price_vat_treatment,stripe_payment_intent_id,stripe_checkout_session_id'
        )
        .or(orParts.join(','))
        .order('created_at', { ascending: false })
        .limit(40)
      if (cancelled) {
        return
      }
      if (tb.error) {
        setWorkspaceCostaMapBookings([])
        return
      }
      const dedup = new Map<string, CostaMapBookingPreviewRow>()
      for (const row of tb.data ?? []) {
        dedup.set(row.id, row as CostaMapBookingPreviewRow)
      }
      setWorkspaceCostaMapBookings([...dedup.values()])
    })()

    return () => {
      cancelled = true
    }
  }, [workspaceEnquiryRef, activeWorkspaceEnquiry?.email, session?.user?.id, workspaceTransferPollTick])

  useEffect(() => {
    const bump = () => {
      if (document.visibilityState === 'visible') {
        setWorkspaceTransferPollTick((n) => n + 1)
      }
    }
    window.addEventListener('focus', bump)
    document.addEventListener('visibilitychange', bump)
    return () => {
      window.removeEventListener('focus', bump)
      document.removeEventListener('visibilitychange', bump)
    }
  }, [])

  useEffect(() => {
    setWorkspaceTransferPayMsg(null)
    setWorkspaceTransferSendCustomerEmails(true)
  }, [workspaceEnquiryRef])

  useEffect(() => {
    const email = manualProposalForm.clientEmail.trim().toLowerCase()
    if (!email.includes('@') || !session || profile?.role !== 'admin') {
      setManualLinkBuildChoices([])
      setManualLinkBuildNotice(null)
      setManualLinkBuildSelectedIds({})
      setManualPortalSnapshot({
        loading: false,
        hasProfile: false,
        accountRef: null,
        proposalsEnabled: false,
        pdfLibraryEnabled: false
      })
      return
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      void (async () => {
        const supabase = getSupabaseBrowserClient()
        if (!supabase) {
          return
        }

        setManualLinkBuildLoading(true)
        setManualLinkBuildNotice(null)
        setManualPortalSnapshot({
          loading: true,
          hasProfile: false,
          accountRef: null,
          proposalsEnabled: false,
          pdfLibraryEnabled: false
        })

        const { data: prof, error: profileErr } = await supabase
          .from('profiles')
          .select('id, account_reference_id, portal_proposals_enabled, portal_pdf_library_enabled')
          .ilike('email', email)
          .maybeSingle()

        if (cancelled) {
          return
        }

        if (profileErr) {
          setManualLinkBuildChoices([])
          setManualLinkBuildNotice(profileErr.message)
          setManualPortalSnapshot({
        loading: false,
        hasProfile: false,
        accountRef: null,
        proposalsEnabled: false,
        pdfLibraryEnabled: false
      })
          setManualLinkBuildLoading(false)
          return
        }

        if (!prof?.id) {
          setManualLinkBuildChoices([])
          setManualLinkBuildNotice(
            'No account with this email yet — package builds appear here after the client signs up with the same address. You can still email the PDF.'
          )
          setManualPortalSnapshot({
        loading: false,
        hasProfile: false,
        accountRef: null,
        proposalsEnabled: false,
        pdfLibraryEnabled: false
      })
          setManualSaveProposalToPortal(false)
          setManualLinkBuildLoading(false)
          return
        }

        const accountRef = typeof prof.account_reference_id === 'string' ? prof.account_reference_id.trim() : ''
        const proposalsEnabled = Boolean(prof.portal_proposals_enabled)
        const pdfLibraryEnabled =
          typeof prof.portal_pdf_library_enabled === 'boolean'
            ? Boolean(prof.portal_pdf_library_enabled)
            : proposalsEnabled
        setManualPortalSnapshot({
          loading: false,
          hasProfile: true,
          accountRef: accountRef || null,
          proposalsEnabled,
          pdfLibraryEnabled
        })
        setManualSaveProposalToPortal(true)

        const { data: builds, error: buildErr } = await supabase
          .from('package_builds')
          .select('id, label, created_at')
          .eq('owner_id', prof.id)
          .order('created_at', { ascending: false })
          .limit(40)

        if (cancelled) {
          return
        }

        if (buildErr) {
          setManualLinkBuildChoices([])
          setManualLinkBuildNotice(
            buildErr.message.includes('linked_proposal') || buildErr.message.includes('column')
              ? 'Database is missing linked_proposal_id on package_builds. Apply supabase/migrations/20260429180000_package_builds_linked_proposal.sql (or the run-in-SQL helper) in Supabase.'
              : buildErr.message
          )
        } else {
          const list = (builds ?? []) as ManualLinkBuildChoice[]
          setManualLinkBuildChoices(list)
          const allow = new Set(list.map((b) => b.id))
          setManualLinkBuildSelectedIds((prev) => {
            const next: Record<string, boolean> = {}
            for (const [id, on] of Object.entries(prev)) {
              if (on && allow.has(id)) {
                next[id] = true
              }
            }
            return next
          })
          setManualLinkBuildNotice(
            list.length === 0
              ? 'This client has no package rows yet. Publish transfers / golf / hotel quotes from the admin tool below, or they can still save from the packages calculator; linking is optional.'
              : null
          )
        }

        setManualLinkBuildLoading(false)
      })()
    }, 450)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [manualProposalForm.clientEmail, profile?.role, session?.user?.id])

  useEffect(() => {
    if (workspacePdfObjectUrlRef.current) {
      URL.revokeObjectURL(workspacePdfObjectUrlRef.current)
      workspacePdfObjectUrlRef.current = null
    }
    setWorkspacePdfUrl(null)
    setWorkspacePdfError(null)
    setWorkspaceEmailMessage(null)
  }, [workspaceEnquiryRef])

  useEffect(() => {
    const row = enquiries.find((e) => e.reference_id === workspaceEnquiryRef)
    setWorkspaceClientEmail(row?.email ?? '')
  }, [workspaceEnquiryRef, enquiries])

  useEffect(() => {
    return () => {
      if (workspacePdfObjectUrlRef.current) {
        URL.revokeObjectURL(workspacePdfObjectUrlRef.current)
        workspacePdfObjectUrlRef.current = null
      }
      if (manualProposalPdfObjectUrlRef.current) {
        URL.revokeObjectURL(manualProposalPdfObjectUrlRef.current)
        manualProposalPdfObjectUrlRef.current = null
      }
    }
  }, [])

  const detailRow = detailBuildId ? packageBuilds.find((b) => b.id === detailBuildId) ?? null : null
  const detailRowParsed = detailRow ? parseAnyPackageBuildRowConfig(detailRow.config) : null
  const detailCalc = detailRowParsed?.type === 'calculator' ? detailRowParsed.config : null
  const detailManual = detailRowParsed?.type === 'manual' ? detailRowParsed.config : null
  const detailWebsite = detailRowParsed?.type === 'website_form' ? detailRowParsed.config : null

  const detailMergedTrip = useMemo(() => {
    if (!detailRow) {
      return emptyTripDetailsForm()
    }

    const defaults = tripDefaultsForPackageRow(detailRow.config)
    return mergeTripDetailsWithSaved(detailRow.client_details, defaults)
  }, [detailRow])

  const websiteQuotePreview = useMemo(() => {
    const g = Number(websiteQuoteGross.replace(/,/g, ''))
    if (!detailWebsite || !Number.isFinite(g) || g <= 0) {
      return null
    }
    return buildWebsiteFormAdminQuote(g, websiteQuoteVatRate)
  }, [detailWebsite, websiteQuoteGross, websiteQuoteVatRate])

  useEffect(() => {
    if (!detailRow) {
      return
    }
    const parsed = parseAnyPackageBuildRowConfig(detailRow.config)
    if (parsed?.type !== 'website_form') {
      setWebsiteQuoteGross('')
      setWebsiteQuoteVatRate(IRISH_VAT_STANDARD_RATE)
      setWebsiteQuoteMessage(null)
      return
    }
    const q = parsed.config.adminQuote
    if (q) {
      setWebsiteQuoteGross(String(q.grossTotalEur))
      setWebsiteQuoteVatRate(q.vatRate)
    } else {
      setWebsiteQuoteGross('')
      setWebsiteQuoteVatRate(IRISH_VAT_STANDARD_RATE)
    }
    setWebsiteQuoteMessage(null)
  }, [detailRow])

  const normalizeEnquiryReferenceKey = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '')

  const handleTbReferenceLookup = () => {
    setTbReferenceLookupMessage(null)
    setTbApplyMessage(null)
    const raw = tbReferenceIdInput.trim()
    if (!raw) {
      setTbReferenceLookupMessage('Enter a Reference ID (e.g. GSI-3TY1-2719).')
      setTbReferenceResolvedRow(null)
      return
    }
    const needle = normalizeEnquiryReferenceKey(raw)
    const row = enquiries.find((e) => normalizeEnquiryReferenceKey(e.reference_id) === needle)
    if (!row) {
      setTbReferenceResolvedRow(null)
      setTbReferenceLookupMessage(
        `No enquiry “${raw}” in the loaded list (latest 100). Check spelling, use the list search, or try “Enter client login email”.`
      )
      return
    }
    setTbReferenceResolvedRow(row)
    setSelectedEnquiryDetailRef(row.reference_id)
    setTbReferenceLookupMessage(`Loaded ${row.reference_id} — ${row.full_name}.`)
  }

  const applyTransferBuilderToManualPublish = () => {
    setTbApplyMessage(null)

    const resolvedClient =
      tbClientMode === 'enquiry'
        ? (() => {
            const row = selectedEnquiryDetail
            if (!row) {
              return {
                ok: false as const,
                message:
                  'Open an enquiry first (use “Details” in the list), use “Load by Reference ID”, or switch to “Enter client login email”.'
              }
            }
            const email = row.email.trim().toLowerCase()
            if (!email.includes('@')) {
              return { ok: false as const, message: 'Selected enquiry has no valid email — switch to “Enter email” or fix the enquiry.' }
            }
            return {
              ok: true as const,
              email,
              fullName: row.full_name,
              phone: row.phone_whatsapp ?? '',
              referenceId: row.reference_id,
              interest: row.interest
            }
          })()
        : tbClientMode === 'reference'
          ? (() => {
              const raw = tbReferenceIdInput.trim()
              const needle = raw ? normalizeEnquiryReferenceKey(raw) : ''
              const row =
                (needle ? enquiries.find((e) => normalizeEnquiryReferenceKey(e.reference_id) === needle) : null) ??
                tbReferenceResolvedRow
              if (!row) {
                return {
                  ok: false as const,
                  message:
                    'Enter the enquiry Reference ID and click Load enquiry, or switch client source. If it still fails, the row may be outside the latest 100 loaded.'
                }
              }
              const email = row.email.trim().toLowerCase()
              if (!email.includes('@')) {
                return { ok: false as const, message: 'That enquiry has no valid email — use “Enter client login email” or fix the enquiry.' }
              }
              return {
                ok: true as const,
                email,
                fullName: row.full_name,
                phone: row.phone_whatsapp ?? '',
                referenceId: row.reference_id,
                interest: row.interest
              }
            })()
        : (() => {
            const email = tbManualClientEmail.trim().toLowerCase()
            if (!email.includes('@')) {
              return { ok: false as const, message: 'Enter the client’s login email (same as their portal sign-in).' }
            }
            const dn = tbManualClientDisplayName.trim()
            const fullName =
              dn ||
              (() => {
                const local = email.split('@')[0] ?? ''
                const spaced = local.replace(/[._-]+/g, ' ').trim()
                return spaced ? spaced.replace(/\b\w/g, (c) => c.toUpperCase()) : 'Client'
              })()
            return {
              ok: true as const,
              email,
              fullName,
              phone: '',
              referenceId: tbManualTripRef.trim(),
              interest: undefined as string | undefined
            }
          })()

    if (!resolvedClient.ok) {
      setTbApplyMessage(resolvedClient.message)
      return
    }

    const { email, fullName, phone, referenceId, interest } = resolvedClient
    const pax = Math.min(8, Math.max(1, tbPassengers))

    if (tbTemplate === 'airport_only') {
      if (tbDestTab === 'hotels') {
        const h = corridorHotelBySlug(tbHotelSlug)
        if (!h) {
          setTbApplyMessage('Choose a hotel from the dropdown.')
          return
        }
        setManualOfferEmail(email)
        setManualOfferKind('transfer')
        setManualOfferTitle(`Airport transfer — Málaga (AGP) → ${h.name}`)
        setManualOfferSummary(
          `Private Málaga Airport (AGP) transfer for ${pax} passenger${pax === 1 ? '' : 's'} (1–8 max) to ${h.name}. Costa del Sol corridor.`
        )
        setManualProposalForm((prev) => ({
          ...prev,
          pdfProductKind: 'airport_transfer',
          clientFullName: fullName,
          clientEmail: email,
          clientPhone: tbClientMode === 'manual' ? '' : phone || prev.clientPhone,
          enquiryReferenceId: referenceId,
          clientInterest: tbClientMode === 'manual' ? '' : (interest ?? prev.clientInterest),
          groupSize: String(pax),
          airportTransfersDetail: `Málaga Airport (AGP) → ${h.name}. Passengers: ${pax}.`,
          transferName: `Airport · AGP → ${h.name}`,
          golfDayTransportDetail: '',
          courseName: '',
          hotelName: h.name
        }))
      } else {
        const course = COURSES.find((c) => c.id === tbCourseIdAirDest)
        if (!course) {
          setTbApplyMessage('Choose a golf course as destination.')
          return
        }
        setManualOfferEmail(email)
        setManualOfferKind('transfer')
        setManualOfferTitle(`Airport transfer — Málaga (AGP) → ${course.name}`)
        setManualOfferSummary(
          `Private Málaga Airport (AGP) transfer for ${pax} passenger${pax === 1 ? '' : 's'} (1–8 max) to ${course.name} (${course.region}).`
        )
        setManualProposalForm((prev) => ({
          ...prev,
          pdfProductKind: 'airport_transfer',
          clientFullName: fullName,
          clientEmail: email,
          clientPhone: tbClientMode === 'manual' ? '' : phone || prev.clientPhone,
          enquiryReferenceId: referenceId,
          clientInterest: tbClientMode === 'manual' ? '' : (interest ?? prev.clientInterest),
          groupSize: String(pax),
          airportTransfersDetail: `Málaga Airport (AGP) → ${course.name}. Passengers: ${pax}.`,
          transferName: `Airport · AGP → ${course.name}`,
          courseName: course.name,
          resortArea: course.region,
          hotelName: ''
        }))
      }
      setTbApplyMessage(
        'Filled “Publish client packages” and manual proposal fields (Airport Transfers PDF header). Add your EUR price, then publish or preview the PDF.'
      )
    } else {
      const course = COURSES.find((c) => c.id === tbGolfDropCourseId)
      if (!course) {
        setTbApplyMessage('Choose a drop-off golf course.')
        return
      }
      let pickupLabel = ''
      if (tbPickupTab === 'airport') {
        pickupLabel = 'Málaga Airport (AGP)'
      } else {
        const h = corridorHotelBySlug(tbPickupHotelSlug)
        if (!h) {
          setTbApplyMessage('Choose a pickup hotel, or switch pickup to Málaga Airport.')
          return
        }
        pickupLabel = h.name
      }
      setManualOfferEmail(email)
      setManualOfferKind('transfer')
      setManualOfferTitle(`Golf course transfer — ${pickupLabel} → ${course.name}`)
      setManualOfferSummary(
        `Point-to-point transfer for ${pax} passenger${pax === 1 ? '' : 's'} (1–8 max) from ${pickupLabel} to ${course.name} (${course.region}).`
      )
      setManualProposalForm((prev) => ({
        ...prev,
        pdfProductKind: 'golf_transfer',
        clientFullName: fullName,
        clientEmail: email,
        clientPhone: tbClientMode === 'manual' ? '' : phone || prev.clientPhone,
        enquiryReferenceId: referenceId,
        clientInterest: tbClientMode === 'manual' ? '' : (interest ?? prev.clientInterest),
        groupSize: String(pax),
        airportTransfersDetail:
          tbPickupTab === 'airport' ? `Airport leg: ${pickupLabel} → ${course.name}` : `Hotel pickup: ${pickupLabel} → ${course.name}`,
        golfDayTransportDetail: `Golf-day leg: ${pickupLabel} to ${course.name}.`,
        transferName: `${pickupLabel} → ${course.name}`,
        courseName: course.name,
        resortArea: course.region
      }))
      setTbApplyMessage(
        'Filled publish form + manual proposal (Golf Transfers PDF header). Add EUR price, then publish or preview the PDF.'
      )
    }
    revokeManualProposalPdfObjectUrl()
  }

  const handlePublishManualPackage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setManualOfferMessage(null)

    const email = manualOfferEmail.trim().toLowerCase()
    const title = manualOfferTitle.trim()
    const summary = manualOfferSummary.trim()
    const priceRaw = manualOfferPrice.trim().replace(/,/g, '')
    const price = Number(priceRaw)

    if (!email.includes('@')) {
      setManualOfferMessage('Enter the client’s login email.')
      return
    }
    if (!title) {
      setManualOfferMessage('Enter a short title for this package.')
      return
    }
    if (!Number.isFinite(price) || price <= 0) {
      setManualOfferMessage('Enter a valid price in EUR (greater than zero).')
      return
    }

    if (!session?.access_token) {
      setManualOfferMessage('Session expired. Sign in again.')
      return
    }

    setManualOfferBusy(true)
    try {
      const res = await fetch('/api/package-build-admin-publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          clientEmail: email,
          kind: manualOfferKind,
          title,
          summary,
          priceEur: price
        })
      })
      const data = (await res.json().catch(() => ({}))) as {
        message?: string
        row?: PackageBuildAdminRow
        pdfPortal?: { ok?: boolean; reason?: string; message?: string }
      }
      if (!res.ok) {
        const msg = data.message ?? res.statusText
        setManualOfferMessage(
          /policy|rls|42501|check|booking_source/i.test(msg)
            ? `${msg} — apply supabase/migrations/20260430120000_package_builds_admin_manual.sql (and 20260511210000_transfer_bookings_admin_package_quote_source.sql for transfer desk rows) in Supabase.`
            : msg
        )
        return
      }
      if (data.row) {
        setPackageBuilds((prev) => [data.row as PackageBuildAdminRow, ...prev])
      }
      const pdfOk = data.pdfPortal?.ok !== false
      setManualOfferMessage(
        pdfOk
          ? 'Published — the client will see the package, a Transfer requests row, Trip details, and quote PDFs on their dashboard.'
          : `Published package and transfer desk row, but PDF upload failed (${data.pdfPortal?.message ?? data.pdfPortal?.reason ?? 'unknown'}). Fix Storage/env and re-save the price on that row in Account transfers if needed.`
      )
      setManualOfferTitle('')
      setManualOfferSummary('')
      setManualOfferPrice('')
    } finally {
      setManualOfferBusy(false)
    }
  }

  const handleSendStudioClientEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStudioEmailMessage(null)

    if (!session?.access_token) {
      setStudioEmailMessage('Session expired. Sign in again.')
      return
    }

    const to = studioEmailTo.trim().toLowerCase()
    const subject = studioEmailSubject.trim()
    const message = studioEmailBody.trim()

    if (!to.includes('@')) {
      setStudioEmailMessage('Enter the client’s login email.')
      return
    }
    if (!subject) {
      setStudioEmailMessage('Enter an email subject.')
      return
    }
    if (!message) {
      setStudioEmailMessage('Enter the message body (use blank lines between paragraphs).')
      return
    }

    const files = studioAttachmentsRef.current?.files
    /** @type {{ filename: string; contentBase64: string; contentType: string }[]} */
    const attachments = []

    if (files && files.length > 0) {
      if (files.length > 4) {
        setStudioEmailMessage('Attach at most four PDF files.')
        return
      }
      for (let i = 0; i < files.length; i += 1) {
        const f = files[i]
        if (!f.name.toLowerCase().endsWith('.pdf')) {
          setStudioEmailMessage(`"${f.name}" is not a PDF — only PDF attachments are supported in this flow.`)
          return
        }
        if (f.size > 4 * 1024 * 1024) {
          setStudioEmailMessage(`"${f.name}" is larger than 4 MB.`)
          return
        }
        try {
          const contentBase64 = await readPdfDataUrlBase64Payload(f)
          attachments.push({ filename: f.name, contentBase64, contentType: 'application/pdf' })
        } catch {
          setStudioEmailMessage(`Could not read "${f.name}".`)
          return
        }
      }
    }

    setStudioEmailBusy(true)
    try {
      const res = await fetch('/api/send-client-portal-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          clientEmail: to,
          subject,
          message,
          attachments
        })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      if (!res.ok) {
        throw new Error(data.message ?? 'Could not send email.')
      }
      setStudioEmailMessage('Sent. The client receives the real email with PDFs; their dashboard logs it under Messages & files.')
      setStudioEmailSubject('')
      setStudioEmailBody('')
      if (studioAttachmentsRef.current) {
        studioAttachmentsRef.current.value = ''
      }
    } catch (err) {
      setStudioEmailMessage(err instanceof Error ? err.message : 'Could not send email.')
    } finally {
      setStudioEmailBusy(false)
    }
  }

  useEffect(() => {
    if (!detailBuildId) {
      prevAdminDetailOpenBuildIdRef.current = null
      return
    }

    if (!detailRow) {
      return
    }

    const openedDifferentBuild = prevAdminDetailOpenBuildIdRef.current !== detailBuildId
    if (openedDifferentBuild) {
      prevAdminDetailOpenBuildIdRef.current = detailBuildId
      setAdminSaveStatus('idle')
      setAdminSaveMessage(null)
    }

    setAdminTripForm(detailMergedTrip)
  }, [detailBuildId, detailMergedTrip, detailRow])

  const handleAdminTripFieldChange = (field: TripDetailsFieldKey) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = field === 'preferredTravelDates' ? formatTravelDateInput(event.target.value) : event.target.value
    setAdminTripForm((prev) => ({ ...prev, [field]: value }))
    setAdminSaveStatus('idle')
    setAdminSaveMessage(null)
  }

  const handleAdminSaveBuildDetails = async (event: FormEvent) => {
    event.preventDefault()
    if (!detailRow) {
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setAdminSaveMessage('Supabase is not configured.')
      setAdminSaveStatus('error')
      return
    }

    setAdminSaveStatus('saving')
    setAdminSaveMessage(null)

    const payload = serializeTripDetailsForDb(adminTripForm)
    const { error } = await supabase
      .from('package_builds')
      .update({
        client_details: payload,
        updated_at: new Date().toISOString()
      })
      .eq('id', detailRow.id)

    if (error) {
      setAdminSaveStatus('error')
      setAdminSaveMessage(
        isMissingClientDetailsColumnError(error)
          ? 'Database is missing client_details. Run supabase/run-in-sql-editor-add-client-details.sql in Supabase SQL.'
          : error.message
      )
      return
    }

    setAdminSaveStatus('saved')
    setAdminSaveMessage('Trip details saved.')
    setPackageBuilds((prev) =>
      prev.map((b) => (b.id === detailRow.id ? { ...b, client_details: payload } : b))
    )
  }

  const handleSaveWebsiteFormQuote = async () => {
    if (!detailRow || !session?.user) {
      return
    }
    const parsed = parseAnyPackageBuildRowConfig(detailRow.config)
    if (parsed?.type !== 'website_form') {
      return
    }
    const gross = Number(websiteQuoteGross.replace(/,/g, ''))
    if (!Number.isFinite(gross) || gross <= 0) {
      setWebsiteQuoteMessage('Enter a VAT-inclusive total in EUR (greater than zero).')
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setWebsiteQuoteMessage('Supabase is not configured.')
      return
    }

    const quote = buildWebsiteFormAdminQuote(gross, websiteQuoteVatRate)
    const nextConfig = mergeAdminQuoteIntoWebsiteFormConfig(detailRow.config, quote)

    setWebsiteQuoteBusy(true)
    setWebsiteQuoteMessage(null)

    const { error } = await supabase
      .from('package_builds')
      .update({
        config: nextConfig,
        updated_at: new Date().toISOString()
      })
      .eq('id', detailRow.id)

    if (error) {
      setWebsiteQuoteBusy(false)
      setWebsiteQuoteMessage(error.message)
      return
    }

    setPackageBuilds((prev) => prev.map((b) => (b.id === detailRow.id ? { ...b, config: nextConfig } : b)))

    const token = session.access_token
    const payNote = await syncWebsiteQuotePaymentNote(detailRow.id, token)

    let emailNote = ''
    if (token) {
      try {
        const res = await fetch('/api/send-website-quote-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ packageBuildId: detailRow.id })
        })
        const data = (await res.json().catch(() => ({}))) as { message?: string }
        if (!res.ok) {
          emailNote = ` The branded PDF email did not send: ${data.message ?? res.statusText}.`
        } else {
          emailNote = ' We also emailed them a branded copy with the quote PDF attached.'
        }
      } catch {
        emailNote = ' The branded PDF email did not send (network error).'
      }
    } else {
      emailNote = ' Sign in again to trigger the branded PDF email automatically.'
    }

    setWebsiteQuoteMessage(
      `Saved — the client dashboard shows this quote, itinerary iframe, and PDF download.${payNote}${emailNote}`
    )
    setWebsiteQuoteBusy(false)
  }

  const handleWorkspaceSavePackageQuote = async () => {
    const row = workspaceLinkedWebsiteFormBuild
    if (!row || !session?.user) {
      setWorkspacePkgQuoteMessage('No website package is linked to this enquiry, or you are not signed in.')
      return
    }
    const gross = Number(workspacePkgQuoteGross.replace(/,/g, ''))
    if (!Number.isFinite(gross) || gross <= 0) {
      setWorkspacePkgQuoteMessage('Enter a VAT-inclusive total in EUR (greater than zero).')
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setWorkspacePkgQuoteMessage('Supabase is not configured.')
      return
    }

    const quote = buildWebsiteFormAdminQuote(gross, workspacePkgQuoteVat)
    const nextConfig = mergeAdminQuoteIntoWebsiteFormConfig(row.config, quote)

    setWorkspacePkgQuoteBusy(true)
    setWorkspacePkgQuoteMessage(null)

    const { error } = await supabase
      .from('package_builds')
      .update({
        config: nextConfig,
        updated_at: new Date().toISOString()
      })
      .eq('id', row.id)

    if (error) {
      setWorkspacePkgQuoteBusy(false)
      setWorkspacePkgQuoteMessage(error.message)
      return
    }

    setPackageBuilds((prev) => prev.map((b) => (b.id === row.id ? { ...b, config: nextConfig } : b)))

    const token = session.access_token
    const payNote = await syncWebsiteQuotePaymentNote(row.id, token)

    let emailNote = ''
    if (token) {
      try {
        const res = await fetch('/api/send-website-quote-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ packageBuildId: row.id })
        })
        const data = (await res.json().catch(() => ({}))) as { message?: string }
        if (!res.ok) {
          emailNote = ` The branded PDF email did not send: ${data.message ?? res.statusText}.`
        } else {
          emailNote = ' We also emailed them a branded copy with the quote PDF attached.'
        }
      } catch {
        emailNote = ' The branded PDF email did not send (network error).'
      }
    } else {
      emailNote = ' Sign in again to trigger the branded PDF email automatically.'
    }

    setWorkspacePkgQuoteMessage(`Quote saved to the linked package.${payNote}${emailNote}`)
    setWorkspacePkgQuoteBusy(false)
  }

  const handleCloseBuildDetail = useCallback(() => {
    setDetailBuildId(null)
    setAdminSaveStatus('idle')
    setAdminSaveMessage(null)
    setWebsiteQuoteMessage(null)
  }, [])

  const handleRemovePackageBuildRow = async (row: PackageBuildAdminRow) => {
    const prof = profileFromRow(row)
    const label = row.label?.trim() || 'Package build'
    const who =
      prof?.email && prof?.full_name?.trim()
        ? `${prof.full_name.trim()} (${prof.email})`
        : prof?.email
          ? prof.email
          : `Account ${row.owner_id.slice(0, 8)}…`
    if (
      !window.confirm(
        `Remove this package build from the client portal list?\n\nCustomer: ${who}\nBuild: ${label}\n\nThis cannot be undone.`
      )
    ) {
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setPackageBuildDeleteMessage('Supabase is not configured.')
      return
    }

    setPackageBuildDeleteMessage(null)
    setPackageBuildDeletingId(row.id)
    const { error } = await supabase.from('package_builds').delete().eq('id', row.id)
    setPackageBuildDeletingId(null)

    if (error) {
      const msg = error.message
      const hint =
        /permission|policy|rls|42501/i.test(msg) || msg.toLowerCase().includes('row-level security')
          ? ' Ensure policy package_builds_delete_own_or_admin exists (supabase/migrations/20260330200000_package_builds_details_delete.sql).'
          : ''
      setPackageBuildDeleteMessage(`${msg}${hint}`)
      return
    }

    if (detailBuildId === row.id) {
      handleCloseBuildDetail()
    }

    setPackageBuilds((prev) => prev.filter((b) => b.id !== row.id))
    setManualLinkBuildSelectedIds((prev) => {
      const next = { ...prev }
      delete next[row.id]
      return next
    })
    setPackageBuildDeleteMessage(`Removed “${label}”.`)
  }

  useEffect(() => {
    if (adminSaveStatus === 'saved') {
      adminSaveMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [adminSaveStatus])

  useEffect(() => {
    if (!detailBuildId) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseBuildDetail()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [detailBuildId, handleCloseBuildDetail])

  const handleSendCrmDocument = async (documentKind: 'terms' | 'welcome') => {
    if (!integrationRegistry.supabase.enabled) {
      setCrmDocMessage('Supabase is not configured.')
      return
    }

    if (!session?.access_token) {
      setCrmDocMessage('Session expired. Sign in again.')
      return
    }

    const email = crmDocEmail.trim().toLowerCase()

    if (!email.includes('@')) {
      setCrmDocMessage('Enter the client account email (same as their magic-link login).')
      return
    }

    try {
      setCrmDocSending(documentKind)
      setCrmDocMessage(null)

      const res = await fetch('/api/send-client-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ clientEmail: email, documentKind })
      })

      const data = (await res.json().catch(() => ({}))) as { message?: string; alreadyHadAccess?: boolean }

      if (!res.ok) {
        throw new Error(data.message || 'Send failed.')
      }

      const label = documentKind === 'terms' ? 'Terms and conditions' : 'Thank-you'

      setCrmDocMessage(
        data.alreadyHadAccess
          ? `${label}: email sent again (they already had access).`
          : `${label}: access granted and email sent. They will see it on their dashboard after sign-in.`
      )
    } catch (e) {
      setCrmDocMessage(e instanceof Error ? e.message : 'Send failed.')
    } finally {
      setCrmDocSending('idle')
    }
  }

  const handleLoadPortalProfile = async () => {
    setPortalSettingsMessage(null)
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setPortalSettingsMessage('Supabase is not configured.')
      return
    }

    const email = portalClientEmail.trim().toLowerCase()
    if (!email.includes('@')) {
      setPortalSettingsMessage('Enter the client login email.')
      return
    }

    setPortalSettingsBusy('load')
    const { data, error } = await supabase
      .from('profiles')
      .select('account_reference_id, portal_proposals_enabled, portal_pdf_library_enabled, email')
      .eq('email', email)
      .maybeSingle()

    setPortalSettingsBusy('idle')

    if (error) {
      setPortalSettingsMessage(error.message)
      return
    }

    if (!data) {
      setPortalSettingsMessage('No profile with that exact email. Check spelling or confirm the client has signed in once.')
      return
    }

    setPortalAccountRef((data.account_reference_id as string | null)?.trim() ?? '')
    setPortalProposalsEnabled(Boolean(data.portal_proposals_enabled))
    setPortalPdfLibraryEnabled(
      typeof data.portal_pdf_library_enabled === 'boolean'
        ? Boolean(data.portal_pdf_library_enabled)
        : Boolean(data.portal_proposals_enabled)
    )
    setPortalSettingsMessage('Loaded current portal settings for this email.')
  }

  const handleSavePortalProfile = async () => {
    setPortalSettingsMessage(null)
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setPortalSettingsMessage('Supabase is not configured.')
      return
    }

    const email = portalClientEmail.trim().toLowerCase()
    if (!email.includes('@')) {
      setPortalSettingsMessage('Enter the client login email.')
      return
    }

    setPortalSettingsBusy('save')
    const { data: row, error: findError } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle()

    if (findError) {
      setPortalSettingsBusy('idle')
      setPortalSettingsMessage(findError.message)
      return
    }

    if (!row) {
      setPortalSettingsBusy('idle')
      setPortalSettingsMessage('No profile with that exact email.')
      return
    }

    const refTrim = portalAccountRef.trim()
    const { error: upError } = await supabase
      .from('profiles')
      .update({
        account_reference_id: refTrim || null,
        portal_proposals_enabled: portalProposalsEnabled,
        portal_pdf_library_enabled: portalPdfLibraryEnabled,
        ...(refTrim ? { portal_enquiry_autofill_disabled: false } : {}),
        updated_at: new Date().toISOString()
      })
      .eq('id', row.id)

    setPortalSettingsBusy('idle')

    if (upError) {
      setPortalSettingsMessage(
        /policy|rls|42501/i.test(upError.message)
          ? `${upError.message} — apply migration supabase/migrations/20260429140000_profiles_portal_account.sql (profiles_update_admin policy).`
          : upError.message
      )
      return
    }

    setPortalSettingsMessage('Saved. The client will see changes after their next page load (or sign-in).')
  }

  const handleCreateManualPortalClient = async () => {
    setManualPortalCreateMessage(null)
    if (!session?.access_token) {
      setManualPortalCreateMessage('Sign in again as admin.')
      return
    }
    const fullName = manualPortalCreateName.trim()
    const email = manualPortalCreateEmail.trim().toLowerCase()
    if (!fullName || !email.includes('@')) {
      setManualPortalCreateMessage('Enter full name and a valid email.')
      return
    }

    setManualPortalCreateBusy(true)
    try {
      const res = await fetch('/api/admin-portal-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'create',
          fullName,
          email,
          sendMagicLink: manualPortalCreateSendLink
        })
      })
      const data = (await res.json().catch(() => ({}))) as {
        message?: string
        accountReferenceId?: string
        magicLinkSent?: boolean
        magicLinkMessage?: string
      }

      if (!res.ok) {
        throw new Error(data.message || 'Create failed.')
      }

      const ref = typeof data.accountReferenceId === 'string' ? data.accountReferenceId : ''
      const parts = [
        `Created portal login for ${email}. Account number ${ref || '(assigned)'} is saved on their profile.`
      ]
      if (manualPortalCreateSendLink) {
        parts.push(
          data.magicLinkSent
            ? 'Sign-in link emailed to the client.'
            : `Sign-in link was not sent${data.magicLinkMessage ? ` (${data.magicLinkMessage})` : ''}. They can use “Forgot password” / magic link from the login page.`
        )
      }
      setManualPortalCreateMessage(parts.join(' '))
      setPortalClientEmail(email)
      if (ref) {
        setPortalAccountRef(ref)
      }
      setManualPortalCreateName('')
      setManualPortalCreateEmail('')
    } catch (e) {
      setManualPortalCreateMessage(e instanceof Error ? e.message : 'Create failed.')
    } finally {
      setManualPortalCreateBusy(false)
    }
  }

  const handleDeleteManualPortalClient = async () => {
    setManualPortalCreateMessage(null)
    if (!session?.access_token) {
      setManualPortalCreateMessage('Sign in again as admin.')
      return
    }
    const email = manualPortalDeleteEmail.trim().toLowerCase()
    if (!email.includes('@')) {
      setManualPortalCreateMessage('Enter the client email to remove.')
      return
    }
    if (
      !window.confirm(
        `Permanently delete the client login for ${email}?\n\nThis removes their dashboard account, saved package builds, and document access. It does not delete enquiry rows in the admin list.`
      )
    ) {
      return
    }

    setManualPortalDeleteBusy(true)
    try {
      const res = await fetch('/api/admin-portal-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ action: 'delete', email })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string }

      if (!res.ok) {
        throw new Error(data.message || 'Delete failed.')
      }

      setManualPortalCreateMessage(`Removed client account for ${email}.`)
      setManualPortalDeleteEmail('')
      if (portalClientEmail.trim().toLowerCase() === email) {
        setPortalClientEmail('')
        setPortalAccountRef('')
      }
    } catch (e) {
      setManualPortalCreateMessage(e instanceof Error ? e.message : 'Delete failed.')
    } finally {
      setManualPortalDeleteBusy(false)
    }
  }

  const handleResetPortalOnboarding = async () => {
    setPortalOnboardingResetMsg(null)
    if (!session?.access_token) {
      setPortalOnboardingResetMsg('Sign in again as admin.')
      return
    }

    const email = portalOnboardingResetEmail.trim().toLowerCase()
    if (!email.includes('@')) {
      setPortalOnboardingResetMsg('Enter the login email to reset.')
      return
    }

    if (
      !window.confirm(
        `Reset portal contact and account for ${email}?\n\nThis clears saved name/phone, account number, trip invoices, transfer bookings, and the email→account anchor (so a new GSI account can be issued). They will see the one-time contact form again. Does not delete the user or enquiry submissions.`
      )
    ) {
      return
    }

    setPortalOnboardingResetBusy(true)
    try {
      const res = await fetch('/api/admin-portal-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ action: 'reset_portal_onboarding', email })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string }

      if (!res.ok) {
        throw new Error(data.message || 'Reset failed.')
      }

      setPortalOnboardingResetMsg(
        `Reset portal for ${email}. Invoices and transfers on their dashboard are cleared; after refresh or sign-in they get the contact form again and a fresh account number when they (re)complete it or when profile sync runs.`
      )
      setPortalOnboardingResetEmail('')
    } catch (e) {
      setPortalOnboardingResetMsg(e instanceof Error ? e.message : 'Reset failed.')
    } finally {
      setPortalOnboardingResetBusy(false)
    }
  }

  const handleClearDashboardByAccountRef = async () => {
    setClearDashboardMessage(null)
    if (!session?.access_token) {
      setClearDashboardMessage('Sign in again as admin.')
      return
    }

    const ref = clearDashboardAccountRef.trim().toUpperCase().replace(/\s+/g, '')
    const clientEmail = clearPortalClientEmail.trim().toLowerCase()
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)
    if (!emailOk && (!ref || ref.length < 8)) {
      setClearDashboardMessage('Enter the client login email and/or account / enquiry reference (e.g. GSI-3TY1-2719).')
      return
    }

    const who = emailOk ? clientEmail : ref

    if (
      !window.confirm(
        `Clear the entire client portal dashboard for ${who}?\n\nThis permanently deletes their package builds, formal proposals, portal message log, interest tickets, and terms/thank-you access rows. It turns off formal proposals and the PDF library for that login. The Supabase user is not deleted (works even when this email is also an admin).\n\nContinue?`
      )
    ) {
      return
    }

    setClearDashboardBusy(true)
    try {
      const res = await fetch('/api/admin-portal-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'clear_dashboard_by_account_ref',
          accountReferenceId: ref,
          ...(emailOk ? { clientEmail } : {})
        })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string }

      if (!res.ok) {
        throw new Error(data.message || 'Clear failed.')
      }

      setClearDashboardMessage(`Dashboard cleared for ${who}.`)
      setClearDashboardAccountRef('')
      setClearPortalClientEmail('')
    } catch (e) {
      setClearDashboardMessage(e instanceof Error ? e.message : 'Clear failed.')
    } finally {
      setClearDashboardBusy(false)
    }
  }

  const handleClearPortalMessagesOnly = async () => {
    setClearPortalInboxMessage(null)
    if (!session?.access_token) {
      setClearPortalInboxMessage('Sign in again as admin.')
      return
    }

    const ref = clearDashboardAccountRef.trim().toUpperCase().replace(/\s+/g, '')
    const clientEmail = clearPortalClientEmail.trim().toLowerCase()
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)
    if (!emailOk && (!ref || ref.length < 8)) {
      setClearPortalInboxMessage('Enter the client login email and/or account / enquiry reference (e.g. GSI-3TY1-2719).')
      return
    }

    const who = emailOk ? clientEmail : ref

    if (
      !window.confirm(
        `Clear only the client “Messages & files” log (studio emails / quote rows) for ${who}?\n\nPackages, proposals, interest tickets, and profile settings are not changed.`
      )
    ) {
      return
    }

    setClearPortalInboxBusy(true)
    try {
      const res = await fetch('/api/admin-portal-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'clear_portal_messages_by_account_ref',
          accountReferenceId: ref,
          ...(emailOk ? { clientEmail } : {})
        })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string; deletedCount?: number }

      if (!res.ok) {
        throw new Error(data.message || 'Clear failed.')
      }

      const n = data.deletedCount
      setClearPortalInboxMessage(
        typeof n === 'number'
          ? n === 0
            ? `Matched client but removed 0 inbox rows (already empty). If the list still shows on their dashboard, have them refresh — or use their login email above.`
            : `Removed ${n} inbox row(s) for ${who}.`
          : `Messages & files cleared for ${who}.`
      )
    } catch (e) {
      setClearPortalInboxMessage(e instanceof Error ? e.message : 'Clear failed.')
    } finally {
      setClearPortalInboxBusy(false)
    }
  }

  const loadAuthEmailBlocks = useCallback(async () => {
    if (!session?.access_token) {
      return
    }
    setAuthBlockListLoading(true)
    try {
      const res = await fetch('/api/admin-portal-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ action: 'list_auth_email_blocks' })
      })
      const data = (await res.json().catch(() => ({}))) as {
        message?: string
        blocks?: { email: string; blocked_at: string; reason: string | null }[]
      }
      if (!res.ok) {
        throw new Error(data.message || 'Could not load block list.')
      }
      setAuthBlockList(data.blocks ?? [])
    } catch (e) {
      setAuthBlockMessage(e instanceof Error ? e.message : 'Could not load block list.')
    } finally {
      setAuthBlockListLoading(false)
    }
  }, [session?.access_token])

  useEffect(() => {
    if (profile?.role === 'admin' && session?.access_token) {
      void loadAuthEmailBlocks()
    }
  }, [profile?.role, session?.access_token, loadAuthEmailBlocks])

  const handleBlockAuthEmail = async () => {
    setAuthBlockMessage(null)
    if (!session?.access_token) {
      setAuthBlockMessage('Sign in again as admin.')
      return
    }
    const email = authBlockEmailInput.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAuthBlockMessage('Enter a valid email to block.')
      return
    }
    if (!window.confirm(`Block ${email} from magic links, website enquiries, and creating a portal account via admin?`)) {
      return
    }
    setAuthBlockBusy(true)
    try {
      const res = await fetch('/api/admin-portal-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'block_auth_email',
          email,
          reason: authBlockReasonInput.trim() || undefined
        })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      if (!res.ok) {
        throw new Error(data.message || 'Block failed.')
      }
      setAuthBlockMessage(`Blocked ${email}.`)
      setAuthBlockEmailInput('')
      setAuthBlockReasonInput('')
      await loadAuthEmailBlocks()
    } catch (e) {
      setAuthBlockMessage(e instanceof Error ? e.message : 'Block failed.')
    } finally {
      setAuthBlockBusy(false)
    }
  }

  const handleUnblockAuthEmail = async (email: string) => {
    setAuthBlockMessage(null)
    if (!session?.access_token) {
      setAuthBlockMessage('Sign in again as admin.')
      return
    }
    if (!window.confirm(`Remove the block so ${email} can sign in and submit forms again?`)) {
      return
    }
    setAuthBlockBusy(true)
    try {
      const res = await fetch('/api/admin-portal-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ action: 'unblock_auth_email', email: email.trim().toLowerCase() })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string }
      if (!res.ok) {
        throw new Error(data.message || 'Unblock failed.')
      }
      setAuthBlockMessage(`Unblocked ${email}.`)
      await loadAuthEmailBlocks()
    } catch (e) {
      setAuthBlockMessage(e instanceof Error ? e.message : 'Unblock failed.')
    } finally {
      setAuthBlockBusy(false)
    }
  }

  const handleCopySignedPortalLoginLink = async (portal: 'client' | 'admin') => {
    setPortalLinkCopyMessage(null)
    if (!session?.access_token) {
      setPortalLinkCopyMessage('Sign in again as admin.')
      return
    }

    const ref = clearDashboardAccountRef.trim().toUpperCase().replace(/\s+/g, '')
    if (!ref || ref.length < 6) {
      setPortalLinkCopyMessage('Enter the client account number first (e.g. GSI-3TY1-2719).')
      return
    }

    setPortalLinkCopyBusy(portal)
    try {
      const res = await fetch('/api/portal-link-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          accountReferenceId: ref,
          portal,
          siteOrigin: window.location.origin
        })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string; loginUrl?: string }
      if (!res.ok) {
        throw new Error(data.message || 'Could not build link.')
      }
      const url = data.loginUrl
      if (!url) {
        throw new Error('Server did not return a login URL.')
      }
      await navigator.clipboard.writeText(url)
      setPortalLinkCopyMessage(
        portal === 'admin'
          ? `Copied admin sign-in link for ${ref}. Paste into email to golfsolirl@gmail.com (or any admin inbox).`
          : `Copied client sign-in link for ${ref}. Paste into your resend email — it opens /dashboard/login with a signed context.`
      )
    } catch (e) {
      setPortalLinkCopyMessage(e instanceof Error ? e.message : 'Copy failed.')
    } finally {
      setPortalLinkCopyBusy('idle')
    }
  }

  const handleSendAdminTicketReply = async () => {
    setAdminTicketReplyMessage(null)
    if (!selectedAdminTicketId) {
      return
    }
    if (!session?.access_token) {
      setAdminTicketReplyMessage('Sign in again as admin.')
      return
    }

    const text = adminTicketReply.trim()
    if (!text) {
      setAdminTicketReplyMessage('Enter a reply.')
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setAdminTicketReplyMessage('Supabase is not configured.')
      return
    }

    setAdminTicketReplyBusy(true)
    try {
      const res = await fetch('/api/portal-interest-ticket-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ ticketId: selectedAdminTicketId, body: text })
      })
      const payload = (await res.json().catch(() => ({}))) as {
        message?: string
        emailed?: boolean
        emailError?: string
      }

      if (!res.ok) {
        throw new Error(payload.message || 'Reply failed.')
      }

      setAdminTicketReply('')

      const { data: msgs } = await supabase
        .from('portal_interest_ticket_messages')
        .select('*')
        .eq('ticket_id', selectedAdminTicketId)
        .order('created_at', { ascending: true })

      setAdminTicketMessages((msgs ?? []) as PortalInterestTicketMessageRow[])

      const { data: row } = await supabase
        .from('portal_interest_tickets')
        .select('id, owner_id, category, status, created_at, updated_at')
        .eq('id', selectedAdminTicketId)
        .maybeSingle()

      if (row) {
        const updated = row as PortalInterestTicketRow
        setInterestAdminTickets((prev) =>
          prev.map((t) =>
            t.id === selectedAdminTicketId
              ? {
                  ...t,
                  ...updated,
                  client_email: t.client_email,
                  client_name: t.client_name,
                  client_phone: t.client_phone,
                  client_account_ref: t.client_account_ref
                }
              : t
          )
        )
      }

      const emailNote =
        payload.emailed === false && payload.emailError
          ? ` Saved; email not sent (${payload.emailError}).`
          : payload.emailed === false
            ? ' Saved; email not sent (check Resend env).'
            : ' Customer notified by email.'
      setAdminTicketReplyMessage(`Reply sent.${emailNote}`)
    } catch (e) {
      setAdminTicketReplyMessage(e instanceof Error ? e.message : 'Send failed.')
    } finally {
      setAdminTicketReplyBusy(false)
    }
  }

  useEffect(() => {
    if (!selectedAdminTicketId || !session || profile?.role !== 'admin') {
      setAdminTicketMessages([])
      return
    }

    let cancelled = false
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      return
    }

    setAdminTicketMessagesLoading(true)

    void (async () => {
      const { data, error } = await supabase
        .from('portal_interest_ticket_messages')
        .select('*')
        .eq('ticket_id', selectedAdminTicketId)
        .order('created_at', { ascending: true })

      if (cancelled) {
        return
      }

      setAdminTicketMessagesLoading(false)

      if (error) {
        setAdminTicketMessages([])
        return
      }

      setAdminTicketMessages((data ?? []) as PortalInterestTicketMessageRow[])
    })()

    return () => {
      cancelled = true
    }
  }, [selectedAdminTicketId, session?.user?.id, profile?.role])

  const handleManualProposalFieldChange =
    (field: ManualProposalFieldKey) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value
      setManualProposalForm((prev) => ({ ...prev, [field]: value }))
      setManualProposalMessage(null)

      if (field === 'proposalId' || field === 'enquiryReferenceId') {
        const submittedRef = value.trim().toLowerCase()
        const matchingEnquiry = enquiries.find((row) => row.reference_id.toLowerCase() === submittedRef)
        if (matchingEnquiry) {
          const matchingDraft =
            workspaceDraft?.referenceId.toLowerCase() === submittedRef ? workspaceDraft : null
          window.setTimeout(() => prefillManualProposalFromEnquiry(matchingEnquiry, matchingDraft), 0)
        }
      }
    }

  const resetManualProposal = () => {
    setManualProposalForm(createEmptyManualProposalForm())
    setManualProposalMessage(null)
    setManualLinkBuildSelectedIds({})
    setManualProposalFromEnquiryRef(null)
    setManualProposalExpanded(true)
    setManualGolfPickerQuery('')
    revokeManualProposalPdfObjectUrl()
  }

  const prefillManualProposalFromEnquiry = (row: EnquiryRow, draft?: TripWorkspaceDraft | null) => {
    const courseLabels =
      draft?.courseIds
        .map((id) => COURSES.find((course) => course.id === id)?.name ?? id)
        .filter(Boolean)
        .join(', ') ?? ''
    const range = draft ? illustrativeTripPriceRangeEur(draft) : null
    const activeStages = draft
      ? ([
          draft.stages.transfer ? 'Transfers' : '',
          draft.stages.golf ? 'Golf' : '',
          draft.stages.hotel ? 'Hotel' : ''
        ].filter(Boolean) as string[])
      : []
    const formHints = extractManualHintsFromFormPayload(row)

    setManualProposalForm((prev) => ({
      ...prev,
      clientFullName: row.full_name,
      clientEmail: row.email,
      clientPhone: row.phone_whatsapp ?? '',
      clientInterest: row.interest ?? '',
      enquiryReferenceId: row.reference_id,
      proposalId: createProposalId(),
      proposalDate: formatDocumentDate(),
      packageName: activeStages.length ? `${activeStages.join(' · ')} proposal` : prev.packageName,
      stayName: draft?.stages.hotel ? draft.hotelNotes || prev.stayName : prev.stayName,
      transferName: draft?.stages.transfer ? 'Private AGP & golf-day transfers' : prev.transferName,
      groupSize: draft ? String(draft.partySize) : formHints.groupSize ?? prev.groupSize,
      nights: draft ? String(workspaceTripNights) : formHints.nights ?? prev.nights,
      rounds: draft?.stages.golf ? String(Math.max(1, draft.courseIds.length || 2)) : formHints.rounds ?? prev.rounds,
      courseName: courseLabels || formHints.courseName || prev.courseName,
      hotelName: formHints.hotelName ?? prev.hotelName,
      groupTotal: range ? `${formatEur(range.low)} – ${formatEur(range.high)} (indicative)` : prev.groupTotal,
      perPersonPrice: range
        ? `${formatEur(Math.round(range.low / Math.max(1, draft?.partySize ?? 1)))} – ${formatEur(
            Math.round(range.high / Math.max(1, draft?.partySize ?? 1))
          )} (indicative)`
        : prev.perPersonPrice,
      quoteScopeSummary: activeStages.length ? activeStages.join(' · ') : prev.quoteScopeSummary,
      extraNotes: [
        `Source enquiry: ${row.reference_id}`,
        row.best_time_to_call ? `Best time to call: ${row.best_time_to_call}` : '',
        `Submitted: ${formatAdminDateTime(row.created_at)}`
      ]
        .filter(Boolean)
        .join('\n'),
      travelDates: formHints.travelDates ?? '',
      departureAirportRoute: formHints.departureAirportRoute ?? '',
      leadTravellerContact: [row.full_name, row.email, row.phone_whatsapp]
        .map((x) => (typeof x === 'string' ? x.trim() : ''))
        .filter(Boolean)
        .join(' · '),
      resortArea: formHints.resortArea ?? '',
      proposalSpecialRequests: '',
      airportTransfersDetail:
        draft?.stages.transfer ? 'Private Malaga (AGP) meet-and-greet; golf-bag friendly vehicle' : formHints.airportTransfersDetail ?? '',
      golfDayTransportDetail: draft?.stages.transfer ? 'Resort ↔ courses as per itinerary' : '',
      boardBasis: draft?.stages.hotel ? 'As per hotel offer (confirm at booking)' : '',
      upgradeNotes: '',
      pdfProductKind: formHints.pdfProductKind ?? prev.pdfProductKind
    }))
    setManualProposalFromEnquiryRef(row.reference_id)
    setManualProposalExpanded(false)
    setManualProposalAdminTab('golf')
    setManualGolfPickerQuery('')
    setManualProposalMessage(
      `Loaded enquiry ${row.reference_id} — quick fields below. Use “Show transfers, golf corridor & full PDF fields” for the full editor, Costa course list, and nearest hotels.`
    )
    revokeManualProposalPdfObjectUrl()
  }

  const applyManualCourseAndNearestHotel = (courseId: string, mode: 'replace' | 'append') => {
    const course = COURSES.find((c) => c.id === courseId)
    if (!course) {
      return
    }
    const hotels = NEARBY_HOTELS[courseId] ?? []
    const nearest = hotels[0]
    setManualProposalForm((prev) => {
      const line = course.name
      const nextCourse =
        mode === 'append' && prev.courseName.trim() ? `${prev.courseName.trim()}, ${line}` : line
      return {
        ...prev,
        courseName: nextCourse,
        hotelName: nearest?.name ?? prev.hotelName,
        hotelDist: nearest
          ? `~${nearest.dist} · ${nearest.stars}★ (${nearest.rating.toFixed(1)})`
          : prev.hotelDist,
        resortArea: course.region,
        rounds:
          mode === 'append'
            ? String(Math.max(1, (Number(prev.rounds) || 1) + 1))
            : String(Math.max(1, Number(prev.rounds) || 1))
      }
    })
    setManualProposalMessage(
      nearest
        ? `${mode === 'append' ? 'Added' : 'Set'} ${course.name} — nearest hotel pick: ${nearest.name} (${nearest.dist}).`
        : `${course.name} applied (add hotel copy manually if needed).`
    )
  }

  const manualGolfCoursesFiltered = useMemo(() => {
    const q = manualGolfPickerQuery.trim().toLowerCase()
    if (!q) {
      return [...COURSES]
    }
    return COURSES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    )
  }, [manualGolfPickerQuery])

  const manualEnquiryCompactRow = useMemo(
    () =>
      manualProposalFromEnquiryRef
        ? enquiries.find((e) => e.reference_id === manualProposalFromEnquiryRef) ?? null
        : null,
    [enquiries, manualProposalFromEnquiryRef]
  )
  const manualEnquiryCompactFormSource = useMemo(
    () => parseStoredFormPayload(manualEnquiryCompactRow?.form_payload)?.form ?? null,
    [manualEnquiryCompactRow]
  )

  const revokeManualProposalPdfObjectUrl = () => {
    if (manualProposalPdfObjectUrlRef.current) {
      URL.revokeObjectURL(manualProposalPdfObjectUrlRef.current)
      manualProposalPdfObjectUrlRef.current = null
    }
    setManualProposalPdfUrl(null)
  }

  const buildManualProposalPayload = (options?: { readonly forPreview?: boolean }): Record<string, unknown> => {
    const f = manualProposalForm
    const extraLines = f.extraNotes
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    const proposalIdForPdf =
      options?.forPreview === true
        ? f.proposalId.trim() || 'GSI-PREVIEW'
        : f.proposalId.trim() || createProposalId()

    return {
      variant: 'public',
      proposalId: proposalIdForPdf,
      proposalDate: f.proposalDate.trim() || formatDocumentDate(),
      packageName: f.packageName.trim(),
      stayName: f.stayName.trim(),
      transferName: f.transferName.trim(),
      groupSize: Number(f.groupSize) || 1,
      nights: Number(f.nights) || 1,
      rounds: Number(f.rounds) || 0,
      courseName: f.courseName.trim(),
      hotelName: f.hotelName.trim(),
      hotelDist: f.hotelDist.trim(),
      perPersonPrice: f.perPersonPrice.trim(),
      groupTotal: f.groupTotal.trim(),
      depositAmount: f.depositAmount.trim(),
      remainingBalance: f.remainingBalance.trim(),
      customerFullName: f.clientFullName.trim(),
      customerEmail: f.clientEmail.trim().toLowerCase(),
      customerPhoneWhatsApp: f.clientPhone.trim(),
      customerInterest: f.clientInterest.trim(),
      enquiryReferenceId: f.enquiryReferenceId.trim(),
      quoteScopeSummary: f.quoteScopeSummary.trim(),
      travelDates: f.travelDates.trim(),
      departureAirportRoute: f.departureAirportRoute.trim(),
      leadTravellerContact: f.leadTravellerContact.trim(),
      resortArea: f.resortArea.trim(),
      proposalSpecialRequests: f.proposalSpecialRequests.trim(),
      airportTransfersDetail: f.airportTransfersDetail.trim(),
      golfDayTransportDetail: f.golfDayTransportDetail.trim(),
      boardBasis: f.boardBasis.trim(),
      upgradeNotes: f.upgradeNotes.trim(),
      ...(f.tripShapeCustom.trim() ? { tripShapeCustom: f.tripShapeCustom.trim() } : {}),
      ...(extraLines.length ? { extraTripOverviewLines: extraLines } : {}),
      ...(f.pdfProductKind !== 'default' ? { proposalProductKind: f.pdfProductKind } : {})
    }
  }

  const validateManualProposal = (): string | null => {
    if (!manualProposalForm.clientFullName.trim()) {
      return 'Enter the customer name.'
    }
    if (!manualProposalForm.clientEmail.trim().includes('@')) {
      return 'Enter a valid customer email.'
    }
    if (!manualProposalForm.packageName.trim()) {
      return 'Enter the package name / proposal style.'
    }
    if (!manualProposalForm.groupTotal.trim() && !manualProposalForm.perPersonPrice.trim()) {
      return 'Enter at least a group total or per-person price.'
    }
    return null
  }

  const handlePreviewManualProposalPdf = async () => {
    const validation = validateManualProposal()
    if (validation) {
      setManualProposalMessage(validation)
      return
    }

    setManualProposalPdfLoading(true)
    setManualProposalMessage(null)
    revokeManualProposalPdfObjectUrl()

    if (!session?.access_token) {
      setManualProposalMessage('Sign in again to preview proposal PDFs.')
      setManualProposalPdfLoading(false)
      return
    }

    try {
      const res = await fetch('/api/proposal-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(buildManualProposalPayload({ forPreview: true }))
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string }
        throw new Error(data.message || 'Could not generate proposal PDF.')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      manualProposalPdfObjectUrlRef.current = url
      setManualProposalPdfUrl(url)
      setManualProposalMessage(
        manualProposalForm.proposalId.trim()
          ? 'Manual customer proposal PDF preview generated.'
          : 'Preview generated. The PDF shows GSI-PREVIEW as the proposal ID until you enter one above — email send assigns a real ID if the field is still empty.'
      )
    } catch (e) {
      setManualProposalMessage(e instanceof Error ? e.message : 'PDF generation failed.')
    } finally {
      setManualProposalPdfLoading(false)
    }
  }

  const handleEmailManualProposal = async () => {
    const validation = validateManualProposal()
    if (validation) {
      setManualProposalMessage(validation)
      return
    }

    if (!session?.access_token) {
      setManualProposalMessage('Session expired. Sign in again.')
      return
    }

    try {
      setManualProposalSending(true)
      setManualProposalMessage(null)

      const res = await fetch('/api/send-workspace-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          clientEmail: manualProposalForm.clientEmail.trim().toLowerCase(),
          greetingName: manualProposalForm.clientFullName.trim(),
          proposalPayload: buildManualProposalPayload(),
          saveToPortal: manualSaveProposalToPortal,
          linkPackageBuildIds: Object.entries(manualLinkBuildSelectedIds)
            .filter(([, on]) => on)
            .map(([id]) => id)
        })
      })

      const data = (await res.json().catch(() => ({}))) as {
        message?: string
        proposalId?: string
        savedToPortal?: boolean
        linkedBuildCount?: number
      }
      if (!res.ok) {
        throw new Error(data.message || 'Send failed.')
      }

      const portalNote =
        data.savedToPortal === true
          ? ' Also saved to their client dashboard under Account number & proposals (same login email) — they can re-download the PDF when “Show proposals” is on for the account.'
          : manualSaveProposalToPortal
            ? ' Not saved to the portal: no profile with this email (or server missing Supabase service role). The PDF is still in the email attachment.'
            : ' Not saved to the portal (you chose email only). The PDF is still in the email attachment.'

      const linkNote =
        typeof data.linkedBuildCount === 'number' && data.linkedBuildCount > 0
          ? ` Linked this proposal to ${data.linkedBuildCount} saved package build(s) — the client can open “View formal proposal” on those rows in Package builds.`
          : ''

      setManualProposalMessage(
        `Proposal emailed to ${manualProposalForm.clientEmail.trim().toLowerCase()} (${data.proposalId ?? manualProposalForm.proposalId}).${portalNote}${linkNote}`
      )
      setManualLinkBuildSelectedIds({})
    } catch (e) {
      setManualProposalMessage(e instanceof Error ? e.message : 'Send failed.')
    } finally {
      setManualProposalSending(false)
    }
  }

  const handleRemoveEnquiry = async (row: EnquiryRow) => {
    if (
      !window.confirm(
        `Remove enquiry ${row.reference_id} for ${row.full_name} from the admin list?\n\nThis only deletes the submission record. It does not remove the client’s login, account number, or saved packages on their dashboard.`
      )
    ) {
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setEnquiryDeleteMessage('Supabase is not configured.')
      return
    }

    setEnquiryDeletingId(row.id)
    setEnquiryDeleteMessage(null)

    const { error } = await supabase.from('enquiries').delete().eq('id', row.id)

    setEnquiryDeletingId(null)

    if (error) {
      setEnquiryDeleteMessage(
        error.message.includes('policy') || error.code === '42501'
          ? 'Delete blocked by database policy. Run supabase/run-in-sql-editor-enquiries-delete-admin.sql (or apply the latest migration) in Supabase.'
          : error.message
      )
      return
    }

    setEnquiries((prev) => prev.filter((e) => e.id !== row.id))
  }

  const handleSendPortalInvoice = async () => {
    const row = selectedEnquiryDetail
    if (!row) {
      setPortalInvoiceSendMessage('Open a submission with Details first.')
      return
    }
    if (!session?.access_token) {
      setPortalInvoiceSendMessage('Sign in again as admin to send invoices.')
      return
    }
    const parsed = Number(String(portalInvoiceAmountInput).replace(/,/g, '.').trim())
    if (!Number.isFinite(parsed) || parsed < 0.5) {
      setPortalInvoiceSendMessage('Enter a valid amount in euros (minimum €0.50).')
      return
    }
    setPortalInvoiceSendBusy(true)
    setPortalInvoiceSendMessage(null)
    try {
      const res = await fetch('/api/portal-invoice-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ enquiryId: row.id, amountEur: parsed })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string; invoiceNumber?: string }
      if (!res.ok) {
        setPortalInvoiceSendMessage(data.message ?? res.statusText)
        return
      }
      setPortalInvoiceSendMessage(
        `Sent invoice ${data.invoiceNumber ?? ''} — client emailed with PDF and Stripe checkout. They pay from /dashboard.`
      )
      setPortalInvoiceAmountInput('')
    } catch (e) {
      setPortalInvoiceSendMessage(e instanceof Error ? e.message : 'Request failed.')
    } finally {
      setPortalInvoiceSendBusy(false)
    }
  }

  const handleRemoveAllEnquiries = async () => {
    if (enquiries.length === 0) {
      return
    }

    if (
      !window.confirm(
        `Delete all ${enquiries.length} enquiry row(s) from the admin list?\n\nThis does not remove client logins or their dashboard data.`
      )
    ) {
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setEnquiryDeleteMessage('Supabase is not configured.')
      return
    }

    setEnquiryDeletingAll(true)
    setEnquiryDeleteMessage(null)

    const ids = enquiries.map((e) => e.id)
    const { error } = await supabase.from('enquiries').delete().in('id', ids)

    setEnquiryDeletingAll(false)

    if (error) {
      setEnquiryDeleteMessage(
        error.message.includes('policy') || error.code === '42501'
          ? 'Delete blocked by database policy. Run supabase/run-in-sql-editor-enquiries-delete-admin.sql (or apply the latest migration) in Supabase.'
          : error.message
      )
      return
    }

    setEnquiries([])
  }

  const persistWorkspaceDraft = (next: TripWorkspaceDraft) => {
    setWorkspaceDraft(next)
  }

  const resolveWorkspaceManualTotal = (): number | null => {
    const parsed = Number(String(workspaceManualTotalInput).replace(/,/g, '').trim())
    if (!workspaceUseManualTotal || !Number.isFinite(parsed) || parsed <= 0) {
      return null
    }
    return parsed
  }

  const handleWorkspaceStageToggle = (key: TripStageKey) => () => {
    if (!workspaceDraft) {
      return
    }
    persistWorkspaceDraft({
      ...workspaceDraft,
      stages: { ...workspaceDraft.stages, [key]: !workspaceDraft.stages[key] }
    })
  }

  const handleCopyClientLoginLink = async () => {
    if (!workspaceEnquiryRef) {
      return
    }

    try {
      await navigator.clipboard.writeText(buildClientLoginUrlForEnquiry(window.location.origin, workspaceEnquiryRef))
      setWorkspaceCopyMessage('Copied client login link (opens dashboard with this enquiry).')
    } catch {
      setWorkspaceCopyMessage('Could not copy — select the URL manually.')
    }

    window.setTimeout(() => setWorkspaceCopyMessage(null), 4000)
  }

  const handleWorkspaceTransferPayment = async (
    bookingId: string,
    paymentStatus: 'unpaid' | 'deposit' | 'paid',
    depositPercent = 20
  ) => {
    setWorkspaceTransferPayMsg(null)
    if (!session?.access_token) {
      setWorkspaceTransferPayMsg('Sign in again as admin.')
      return
    }
    setWorkspaceTransferPayBusyId(bookingId)
    try {
      const res = await fetch('/api/transfer-payment-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'set_payment',
          bookingId,
          paymentStatus,
          depositPercent,
          sendCustomerEmails: workspaceTransferSendCustomerEmails
        })
      })
      const data = (await res.json().catch(() => ({}))) as {
        message?: string
        thankYouError?: string | null
        thankYouSent?: string | null
        balanceRemindAt?: string | null
        unchanged?: boolean
      }
      if (!res.ok) {
        throw new Error(data.message || 'Update failed.')
      }
      const parts: string[] = []
      if (data.unchanged) {
        parts.push(data.message || 'No change.')
      } else {
        if (paymentStatus === 'deposit') {
          parts.push(
            data.balanceRemindAt
              ? `Deposit recorded. Balance reminder queued for ${formatAdminDateTime(data.balanceRemindAt)}.`
              : 'Deposit recorded.'
          )
        } else if (paymentStatus === 'paid') {
          parts.push('Full payment recorded.')
        } else {
          parts.push('Marked unpaid; reminder schedule cleared.')
        }
        if (workspaceTransferSendCustomerEmails) {
          if (data.thankYouSent) {
            parts.push(`Thank-you email sent (${data.thankYouSent === 'deposit' ? 'deposit' : 'paid in full'}).`)
          }
          if (data.thankYouError) {
            parts.push(`Email failed: ${data.thankYouError}`)
          }
        } else if (paymentStatus === 'deposit' || paymentStatus === 'paid') {
          parts.push('Customer thank-you email not sent (option unchecked).')
        }
      }
      setWorkspaceTransferPayMsg(parts.join(' '))

      const ref = workspaceEnquiryRef.trim()
      const em = activeWorkspaceEnquiry?.email?.trim().toLowerCase()
      const supabase = getSupabaseBrowserClient()
      if (supabase && (ref || em)) {
        let uid: string | null = null
        if (em) {
          const pr = await supabase.from('profiles').select('id').ilike('email', em).maybeSingle()
          uid = pr.data?.id ?? null
        }
        const orParts: string[] = []
        if (ref) {
          orParts.push(`enquiry_reference_id.eq.${ref}`)
        }
        if (uid) {
          orParts.push(`client_user_id.eq.${uid}`)
        }
        if (orParts.length) {
          const tb = await supabase
            .from('transfer_bookings')
            .select(
              'id,pickup_label,dropoff_label,scheduled_at,status,created_at,booking_source,enquiry_reference_id,client_email,payment_status,deposit_percent,balance_remind_at,balance_remind_sent_at,admin_price_eur,admin_price_vat_treatment,stripe_payment_intent_id,stripe_checkout_session_id'
            )
            .or(orParts.join(','))
            .order('created_at', { ascending: false })
            .limit(40)
          if (!tb.error && tb.data) {
            const dedup = new Map<string, CostaMapBookingPreviewRow>()
            for (const row of tb.data) {
              dedup.set(row.id, row as CostaMapBookingPreviewRow)
            }
            setWorkspaceCostaMapBookings([...dedup.values()])
          }
        }
      }
    } catch (e) {
      setWorkspaceTransferPayMsg(e instanceof Error ? e.message : 'Update failed.')
    } finally {
      setWorkspaceTransferPayBusyId(null)
    }
  }

  const handleWorkspaceRunBalanceReminders = async () => {
    setWorkspaceTransferPayMsg(null)
    if (!session?.access_token) {
      setWorkspaceTransferPayMsg('Sign in again as admin.')
      return
    }
    setWorkspaceTransferReminderBusy(true)
    try {
      const res = await fetch('/api/transfer-payment-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ action: 'run_balance_reminders' })
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string; sent?: number; candidates?: number }
      if (!res.ok) {
        throw new Error(data.message || 'Sweep failed.')
      }
      setWorkspaceTransferPayMsg(`Balance reminders: ${data.sent ?? 0} sent (${data.candidates ?? 0} due rows).`)
    } catch (e) {
      setWorkspaceTransferPayMsg(e instanceof Error ? e.message : 'Sweep failed.')
    } finally {
      setWorkspaceTransferReminderBusy(false)
    }
  }

  const handleCopyWorkspaceJson = async () => {
    if (!workspaceDraft) {
      return
    }

    const row = enquiries.find((e) => e.reference_id === workspaceDraft.referenceId)
    const manualOk = resolveWorkspaceManualTotal()

    const payload = {
      kind: 'golfsol.admin_trip_workspace',
      version: 1,
      referenceId: workspaceDraft.referenceId,
      customer: row
        ? {
            fullName: row.full_name,
            email: row.email,
            phoneWhatsApp: row.phone_whatsapp,
            interest: row.interest,
            bestTimeToCall: row.best_time_to_call,
            submittedAt: row.created_at
          }
        : null,
      partySize: workspaceDraft.partySize,
      stages: workspaceDraft.stages,
      courseIds: [...workspaceDraft.courseIds],
      courseLabels: workspaceDraft.courseIds.map((id) => COURSES.find((c) => c.id === id)?.name ?? id),
      hotelNotes: workspaceDraft.hotelNotes,
      illustrativeEur: illustrativeTripPriceRangeEur(workspaceDraft),
      tripNights: workspaceTripNights,
      manualGroupTotalEur: manualOk,
      tripShapeCustom: workspaceTripShapeCustom.trim() || null
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
      setWorkspaceCopyMessage('Copied structured draft JSON for proposals or spreadsheets.')
    } catch {
      setWorkspaceCopyMessage('Could not copy JSON.')
    }

    window.setTimeout(() => setWorkspaceCopyMessage(null), 4000)
  }

  const revokeWorkspacePdfObjectUrl = () => {
    if (workspacePdfObjectUrlRef.current) {
      URL.revokeObjectURL(workspacePdfObjectUrlRef.current)
      workspacePdfObjectUrlRef.current = null
    }
    setWorkspacePdfUrl(null)
  }

  const handleEmailWorkspaceProposal = async () => {
    if (!integrationRegistry.supabase.enabled) {
      setWorkspaceEmailMessage('Supabase is not configured.')
      return
    }

    if (!session?.access_token) {
      setWorkspaceEmailMessage('Session expired. Sign in again.')
      return
    }

    if (!workspaceDraft) {
      return
    }

    const active =
      workspaceDraft.stages.transfer || workspaceDraft.stages.golf || workspaceDraft.stages.hotel
    if (!active) {
      setWorkspaceEmailMessage('Select at least one option: transfers, golf, or hotel.')
      return
    }

    const row = enquiries.find((e) => e.reference_id === workspaceDraft.referenceId)
    if (!row) {
      setWorkspaceEmailMessage('Could not find this enquiry in the list.')
      return
    }

    const to = workspaceClientEmail.trim().toLowerCase()
    if (!to.includes('@')) {
      setWorkspaceEmailMessage('Enter a valid client email.')
      return
    }

    const proposalPayload = buildAdminWorkspaceProposalPdfPayload(row, workspaceDraft, {
      manualGroupTotalEur: resolveWorkspaceManualTotal(),
      tripNights: workspaceTripNights,
      tripShapeCustom: workspaceTripShapeCustom.trim() || null
    })

    try {
      setWorkspaceEmailBusy('client')
      setWorkspaceEmailMessage(null)

      const res = await fetch('/api/send-workspace-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          clientEmail: to,
          greetingName: row.full_name,
          proposalPayload
        })
      })

      const data = (await res.json().catch(() => ({}))) as {
        message?: string
        proposalId?: string
        savedToPortal?: boolean
      }

      if (!res.ok) {
        throw new Error(data.message || 'Send failed.')
      }

      const portalNote =
        data.savedToPortal === true
          ? ' Saved to their portal for download when “Show proposals” is on for their account.'
          : ' No portal row saved (no profile with this email, or Supabase service key missing on the server).'

      setWorkspaceEmailMessage(`Proposal emailed to ${to} (${data.proposalId ?? 'PDF attached'}).${portalNote}`)
    } catch (e) {
      setWorkspaceEmailMessage(e instanceof Error ? e.message : 'Send failed.')
    } finally {
      setWorkspaceEmailBusy('idle')
    }
  }

  const handleEmailHotelBrief = async () => {
    if (!integrationRegistry.supabase.enabled) {
      setWorkspaceEmailMessage('Supabase is not configured.')
      return
    }

    if (!session?.access_token) {
      setWorkspaceEmailMessage('Session expired. Sign in again.')
      return
    }

    if (!workspaceDraft) {
      return
    }

    const row = enquiries.find((e) => e.reference_id === workspaceDraft.referenceId)
    if (!row) {
      setWorkspaceEmailMessage('Could not find this enquiry in the list.')
      return
    }

    const hotel = workspaceHotelEmail.trim().toLowerCase()
    if (!hotel.includes('@')) {
      setWorkspaceEmailMessage('Enter a valid hotel reservations email.')
      return
    }

    if (workspaceTripNights < 1 || workspaceTripNights > 90) {
      setWorkspaceEmailMessage('Trip nights must be between 1 and 90.')
      return
    }

    try {
      setWorkspaceEmailBusy('hotel')
      setWorkspaceEmailMessage(null)

      const res = await fetch('/api/send-hotel-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          hotelEmail: hotel,
          bookingReference: row.reference_id,
          guestCount: workspaceDraft.partySize,
          nights: workspaceTripNights,
          preferencesNote: workspaceHotelNotes
        })
      })

      const data = (await res.json().catch(() => ({}))) as { message?: string }

      if (!res.ok) {
        throw new Error(data.message || 'Send failed.')
      }

      setWorkspaceEmailMessage(
        `Hotel brief sent to ${hotel}. Only booking ref ${row.reference_id}, ${workspaceDraft.partySize} pax, ${workspaceTripNights} nights — no guest name or contact.`
      )
    } catch (e) {
      setWorkspaceEmailMessage(e instanceof Error ? e.message : 'Send failed.')
    } finally {
      setWorkspaceEmailBusy('idle')
    }
  }

  const handlePreviewWorkspaceProposalPdf = async () => {
    if (!workspaceDraft) {
      return
    }

    const active =
      workspaceDraft.stages.transfer || workspaceDraft.stages.golf || workspaceDraft.stages.hotel
    if (!active) {
      setWorkspacePdfError('Select at least one option: transfers, golf, or hotel.')
      return
    }

    const row = enquiries.find((e) => e.reference_id === workspaceDraft.referenceId)
    if (!row) {
      setWorkspacePdfError('Could not find this enquiry in the list.')
      return
    }

    setWorkspacePdfError(null)
    setWorkspacePdfLoading(true)
    revokeWorkspacePdfObjectUrl()

    if (!session?.access_token) {
      setWorkspacePdfError('Sign in again to preview proposal PDFs.')
      setWorkspacePdfLoading(false)
      return
    }

    try {
      const payload = buildAdminWorkspaceProposalPdfPayload(row, workspaceDraft, {
        manualGroupTotalEur: resolveWorkspaceManualTotal(),
        tripNights: workspaceTripNights,
        tripShapeCustom: workspaceTripShapeCustom.trim() || null
      })
      const res = await fetch('/api/proposal-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errText = await res.text()
        let msg = 'Could not generate PDF.'
        try {
          const j = JSON.parse(errText) as { message?: string }
          if (j.message) {
            msg = j.message
          }
        } catch {
          if (errText.trim()) {
            msg = errText
          }
        }
        throw new Error(msg)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      workspacePdfObjectUrlRef.current = url
      setWorkspacePdfUrl(url)
    } catch (e) {
      setWorkspacePdfError(e instanceof Error ? e.message : 'PDF generation failed.')
    } finally {
      setWorkspacePdfLoading(false)
    }
  }

  const adminDataCardSections = useMemo(
    () =>
      buildClientDataCardSections({
        profile,
        userEmail: session?.user?.email ?? null,
        enquiries: [],
        packageBuilds: [],
        accountDesk: ADMIN_OPERATIONS_DESK_CARD
      }),
    [profile, session?.user?.email]
  )

  /** Operations hero uses a fixed desk identity (not the Supabase profile row). */
  const adminGreetingFirst = 'Greg'
  const adminHeroTitle = `Hello, ${adminGreetingFirst}`
  const [activeAdminSection, setActiveAdminSection] = useState<AdminPortalSectionId>('desk')

  const renderEnquirySubmissionsTable = (rows: EnquiryRow[]) => (
    <div className="mt-6 overflow-x-auto rounded-[2rem] border border-forest-100 bg-white shadow-soft">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="bg-forest-950 text-xs font-semibold uppercase tracking-[0.12em] text-white">
            <th className="whitespace-nowrap px-4 py-4 md:px-6">Ref</th>
            <th className="whitespace-nowrap px-4 py-4 md:px-6">Name</th>
            <th className="whitespace-nowrap px-4 py-4 md:px-6">Email</th>
            <th className="hidden whitespace-nowrap px-4 py-4 font-mono normal-case tracking-normal md:table-cell md:px-6">
              Portal account
            </th>
            <th className="hidden px-4 py-4 md:table-cell md:px-6 lg:table-cell">Interest</th>
            <th className="whitespace-nowrap px-4 py-4 md:px-6">When</th>
            <th className="whitespace-nowrap px-4 py-4 text-right md:px-6">Remove</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-forest-100">
          {rows.map((row, index) => (
            <tr className={cx('text-forest-900', index % 2 === 1 ? 'bg-offwhite/90' : 'bg-white')} key={row.id}>
              <td className="whitespace-nowrap px-4 py-4 font-mono text-xs md:px-6">
                <button
                  aria-label={`Fill account lookup with ${row.reference_id} and show submission detail`}
                  className={cx(
                    'rounded-full px-3 py-1.5 font-mono text-xs font-semibold underline-offset-2 transition-colors hover:underline',
                    isEnquiryAdminViewed(row)
                      ? 'bg-forest-100 text-forest-800 hover:bg-forest-200'
                      : 'bg-brand-50 text-brand-800 hover:bg-brand-100'
                  )}
                  onClick={() => {
                    const willOpen = selectedEnquiryDetailRef !== row.reference_id
                    setSelectedEnquiryDetailRef(willOpen ? row.reference_id : null)
                    setAccountLookupSeedFromTable({ ref: row.reference_id, key: Date.now() })
                    if (willOpen) {
                      void markEnquiryViewed(row)
                    }
                  }}
                  type="button"
                >
                  {row.reference_id}
                </button>
              </td>
              <td className="whitespace-nowrap px-4 py-4 font-medium md:px-6">{row.full_name}</td>
              <td className="px-4 py-4 md:px-6">
                <a
                  className="font-medium text-brand-600 underline-offset-2 transition-colors hover:text-brand-700 hover:underline"
                  href={`mailto:${row.email}`}
                >
                  {row.email}
                </a>
              </td>
              <td className="hidden px-4 py-4 font-mono text-xs text-forest-800 md:table-cell md:px-6">
                {row.client_portal_account_ref?.trim() ? row.client_portal_account_ref.trim() : '—'}
              </td>
              <td className="hidden max-w-xs truncate px-4 py-4 text-forest-600 md:table-cell md:px-6 lg:table-cell">
                {row.interest ?? '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-xs text-ge-gray500 md:px-6">
                {formatAdminDateTime(row.created_at)}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-right md:px-6">
                <button
                  aria-label={`Remove enquiry ${row.reference_id}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-800 transition-colors hover:bg-red-50 disabled:opacity-50"
                  disabled={enquiryDeletingId !== null || enquiryDeletingAll}
                  onClick={() => void handleRemoveEnquiry(row)}
                  type="button"
                >
                  {enquiryDeletingId === row.id ? 'Removing…' : 'Remove'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  if (isLoading || !session) {
    return <DashboardLoadingShell label="Loading admin dashboard…" />
  }

  if (!profile) {
    return (
      <DashboardLayout
        kicker="Operations"
        subtitle="Signed in, but your profile row did not load (network, RLS, or missing `profiles` row)."
        title="Admin dashboard"
        variant="admin"
      >
        <div className="rounded-3xl border border-chrome-200/90 bg-chrome-50/90 px-6 py-5 text-sm text-brand-950 shadow-soft">
          <p className="font-medium">Cannot verify admin access without a profile.</p>
          <p className="mt-2 text-brand-900/90">
            If your account is an admin, confirm <code className="rounded bg-white/80 px-1">profiles.role</code> is{' '}
            <code className="rounded bg-white/80 px-1">admin</code> for this user in Supabase, then retry.
          </p>
          <LuxuryButton className="mt-4" onClick={() => void refreshProfile()} type="button" variant="primary">
            Retry loading profile
          </LuxuryButton>
        </div>
      </DashboardLayout>
    )
  }

  if (profile.role !== 'admin') {
    return <DashboardLoadingShell label="Opening your client dashboard…" />
  }

  return (
    <DashboardLayout
      kicker="Operations"
      subtitle="Forms, packages, payments, and drivers — one desk. Use the left menu to open each area."
      title={adminHeroTitle}
      variant="admin"
    >
      {loadError ? (
        <div className="mb-8 rounded-3xl border border-red-200/80 bg-red-50/90 px-6 py-4 text-sm text-red-800 shadow-soft">
          {loadError}
        </div>
      ) : null}

      <AdminPortalShell activeSection={activeAdminSection} onSectionChange={setActiveAdminSection}>
        {accountLookupSeedFromTable && activeAdminSection !== 'transfers' ? (
          <div aria-hidden className="pointer-events-none fixed h-0 w-0 overflow-hidden opacity-0">
            <AdminAccountTransfersHub
              accountLookupSeed={accountLookupSeedFromTable}
              onAccountLookupSeedApplied={() => setAccountLookupSeedFromTable(null)}
            />
          </div>
        ) : null}
        <AdminOperationsHubHero adminFirstName={adminGreetingFirst} />

        <AdminPortalSection activeSection={activeAdminSection} section="desk">
        <AdminOperationsSectionShell
          bodyClassName="space-y-8 sm:space-y-10 sm:py-8"
          hideHeader
          id="admin-hub-payments"
        >
          <PortalClientDataCard sections={adminDataCardSections} />

          <div className="ge-on-dark rounded-[1.35rem] border border-brand-700/40 bg-gradient-to-br from-[#0f3d24] via-[#143d28] to-[#0a2416] px-5 py-4 shadow-[0_12px_32px_rgba(11,73,52,0.2)] ring-1 ring-white/10 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
              <span className="inline-flex w-fit shrink-0 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 font-ge text-[0.58rem] font-extrabold uppercase tracking-[0.18em] text-white">
                Stripe &amp; receipts
              </span>
              <p className="min-w-0 flex-1 text-sm leading-relaxed text-white/95">
                Same receipts and card totals guests see after checkout. Open{' '}
                <strong className="font-semibold text-white">Desk &amp; inbox</strong> in the left menu when you need this block.
              </p>
            </div>
          </div>

          <div className="relative border-t border-forest-200/80 pt-8">
            <div className="mb-6 max-w-3xl">
              <p className="font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-brand-600">Client interest tickets</p>
              <h3 className="font-display mt-2 text-xl font-semibold tracking-tight text-forest-950 sm:text-2xl">
                Transfers, golf &amp; hotels
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-forest-600">
                When a signed-in client opens a thread from their dashboard, it appears here. Reply to send an admin message back into
                their ticket timeline.
              </p>
            </div>
            {interestAdminTicketsError ? (
              <p className="mb-6 text-sm text-brand-900" role="alert">
                {interestAdminTicketsError}
              </p>
            ) : null}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-forest-100 bg-white p-5 shadow-soft md:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">Open tickets</p>
                  {openInterestTicketCount > 0 ? (
                    <span
                      className="inline-flex items-center rounded-full bg-chrome-100 px-2.5 py-0.5 text-xs font-semibold text-brand-950 ring-1 ring-amber-200/80"
                      title="Tickets still open — client is waiting for your first reply or follow-up."
                    >
                      {openInterestTicketCount} awaiting reply
                    </span>
                  ) : interestAdminTickets.length > 0 ? (
                    <span className="text-xs font-medium text-ge-gray500">All caught up</span>
                  ) : null}
                </div>
                {interestAdminTickets.length === 0 ? (
                  <p className="mt-3 text-sm text-forest-600">No tickets yet.</p>
                ) : (
                  <>
                    <ul className="mt-3 max-h-[420px] space-y-2 overflow-y-auto text-sm">
                      {interestAdminTickets.map((t) => (
                        <li key={t.id}>
                          <button
                            className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                              selectedAdminTicketId === t.id
                                ? 'border-fairway-500 bg-fairway-50/80'
                                : 'border-forest-100 bg-offwhite/80 hover:border-fairway-300'
                            }`}
                            onClick={() => {
                              setSelectedAdminTicketId(t.id)
                              setAdminTicketReplyMessage(null)
                            }}
                            type="button"
                          >
                            <PortalInterestCategoryGlyph category={t.category} size="sm" />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-forest-950">{PORTAL_INTEREST_LABELS[t.category]}</span>
                              {t.status === 'open' ? (
                                <span className="rounded-full bg-chrome-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-900 ring-1 ring-amber-200/70">
                                  New
                                </span>
                              ) : null}
                              </div>
                              <span className="mt-1 block text-xs text-forest-600">
                                {t.client_email ?? t.owner_id} · {t.status}
                              </span>
                              <span className="mt-0.5 block text-xs text-ge-gray500">{formatDateTimeDdMmYy(t.created_at)}</span>
                            </div>
                          </button>
                          {selectedAdminTicketId === t.id ? (
                            <div className="mt-2 rounded-xl border border-forest-100 bg-offwhite/90 px-4 py-3 text-sm shadow-inner">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ge-gray500">Client details</p>
                              <dl className="mt-2 grid gap-2 text-forest-900 sm:grid-cols-2">
                                <div>
                                  <dt className="text-xs text-ge-gray500">Name</dt>
                                  <dd className="mt-0.5 font-medium text-forest-950">{t.client_name?.trim() || '—'}</dd>
                                </div>
                                <div>
                                  <dt className="text-xs text-ge-gray500">Email</dt>
                                  <dd className="mt-0.5 font-medium text-forest-950 break-all">{t.client_email ?? '—'}</dd>
                                </div>
                                <div>
                                  <dt className="text-xs text-ge-gray500">Phone</dt>
                                  <dd className="mt-0.5 font-medium text-forest-950">{t.client_phone?.trim() || '—'}</dd>
                                </div>
                                <div className="sm:col-span-2">
                                  <dt className="text-xs text-ge-gray500">Account number</dt>
                                  <dd className="mt-0.5 font-mono text-sm font-semibold text-forest-950">
                                    {t.client_account_ref?.trim() || '—'}
                                  </dd>
                                </div>
                              </dl>
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              <div className="rounded-[2rem] border border-forest-100 bg-white p-5 shadow-soft md:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">Thread</p>
                {!selectedAdminTicketId ? (
                  <p className="mt-3 text-sm text-forest-600">Select a ticket to read messages and reply.</p>
                ) : adminTicketMessagesLoading ? (
                  <p className="mt-3 text-sm text-forest-600">Loading messages…</p>
                ) : (
                  <>
                    {selectedAdminInterestTicket ? (
                      <div className="mt-3 flex items-start gap-3 border-b border-forest-100 pb-3">
                        <PortalInterestCategoryGlyph category={selectedAdminInterestTicket.category} size="md" />
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-sm font-semibold text-forest-950 md:text-base">
                            {PORTAL_INTEREST_LABELS[selectedAdminInterestTicket.category]}
                          </p>
                          <p className="mt-0.5 text-xs text-ge-gray500">
                            {selectedAdminInterestTicket.status} ·{' '}
                            {formatDateTimeDdMmYy(selectedAdminInterestTicket.created_at)}
                          </p>
                        </div>
                      </div>
                    ) : null}
                    <ul className="mt-3 max-h-64 space-y-3 overflow-y-auto text-sm">
                      {adminTicketMessages.map((m) => (
                        <li
                          className={`rounded-xl border px-3 py-2 ${
                            m.author_kind === 'admin' ? 'border-fairway-200 bg-fairway-50/60' : 'border-forest-100 bg-offwhite/90'
                          }`}
                          key={m.id}
                        >
                          {m.author_kind === 'admin' ? (
                            <div className="flex min-h-[1.5rem] items-center">
                              <img
                                alt="Golf Sol Ireland"
                                className="h-6 w-auto max-w-[7rem] object-contain object-left"
                                src={GOLFSOL_BRAND_LOGO.svg}
                              />
                            </div>
                          ) : (
                            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-forest-600">
                              <UserRound aria-hidden className="h-3.5 w-3.5 shrink-0 text-ge-gray500" />
                              Client
                            </p>
                          )}
                          <p className="mt-1 whitespace-pre-wrap text-forest-900">{m.body}</p>
                          <p className="mt-1 text-xs text-ge-gray500">{formatDateTimeDdMmYy(m.created_at)}</p>
                        </li>
                      ))}
                    </ul>
                    <label className="mb-2 mt-4 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600" htmlFor="admin-ticket-reply">
                      Your reply
                    </label>
                    <textarea
                      className="mb-3 min-h-[100px] w-full rounded-2xl border border-forest-200 bg-white px-4 py-3 text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
                      id="admin-ticket-reply"
                      onChange={(e) => {
                        setAdminTicketReply(e.target.value)
                        setAdminTicketReplyMessage(null)
                      }}
                      placeholder="Write your reply…"
                      value={adminTicketReply}
                    />
                    <button
                      className="inline-flex min-h-11 items-center justify-center rounded-full bg-forest-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-800 disabled:opacity-60"
                      disabled={adminTicketReplyBusy}
                      onClick={() => void handleSendAdminTicketReply()}
                      type="button"
                    >
                      {adminTicketReplyBusy ? 'Sending…' : 'Send reply'}
                    </button>
                    {adminTicketReplyMessage ? (
                      <p className="mt-2 text-sm font-medium text-forest-800" role="status">
                        {adminTicketReplyMessage}
                      </p>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>

          <section className="relative mt-10 scroll-mt-28 border-t border-forest-200/80 pt-8" id="admin-hub-publish">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Publish client packages</p>
            <h3 className="font-display mt-2 text-xl font-semibold text-forest-950 md:text-2xl">Transfers, golf &amp; hotel</h3>

            <form
              className="mt-6 max-w-2xl space-y-5 rounded-[2rem] border border-forest-100 bg-white p-6 shadow-soft md:p-8"
              noValidate
              onSubmit={(e) => void handlePublishManualPackage(e)}
            >
              <div>
                <label className={adminTripLabelClass} htmlFor="manual-offer-email">
                  Client login email
                </label>
                <input
                  autoComplete="email"
                  className={adminTripInputClass}
                  id="manual-offer-email"
                  onChange={(e) => {
                    setManualOfferEmail(e.target.value)
                    setManualOfferMessage(null)
                  }}
                  placeholder="same@email they use to sign in"
                  type="email"
                  value={manualOfferEmail}
                />
              </div>

              <fieldset>
                <legend className={adminTripLabelClass}>Package type</legend>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {(
                    [
                      ['transfer', 'Transfers'],
                      ['golf', 'Golf courses'],
                      ['hotel', 'Hotel']
                    ] as const
                  ).map(([value, label]) => (
                    <label
                      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-forest-200 bg-offwhite/80 px-4 py-3 text-sm font-medium text-forest-900 has-[:checked]:border-fairway-500 has-[:checked]:bg-white"
                      key={value}
                    >
                      <input
                        checked={manualOfferKind === value}
                        className="h-4 w-4 shrink-0 border-forest-300 text-fairway-600 focus:ring-fairway-400"
                        name="manual-offer-kind"
                        onChange={() => {
                          setManualOfferKind(value)
                          setManualOfferMessage(null)
                        }}
                        type="radio"
                        value={value}
                      />
                      <PortalInterestCategoryGlyph category={MANUAL_OFFER_PORTAL_CATEGORY[value]} size="sm" />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label className={adminTripLabelClass} htmlFor="manual-offer-title">
                  Title (shown on client dashboard)
                </label>
                <input
                  className={adminTripInputClass}
                  id="manual-offer-title"
                  onChange={(e) => {
                    setManualOfferTitle(e.target.value)
                    setManualOfferMessage(null)
                  }}
                  placeholder="e.g. Private AGP return + two golf-day shuttles"
                  type="text"
                  value={manualOfferTitle}
                />
              </div>

              <div>
                <label className={adminTripLabelClass} htmlFor="manual-offer-summary">
                  Description / inclusions
                </label>
                <textarea
                  className={cx(adminTripInputClass, 'min-h-[120px] resize-y')}
                  id="manual-offer-summary"
                  onChange={(e) => {
                    setManualOfferSummary(e.target.value)
                    setManualOfferMessage(null)
                  }}
                  placeholder="What is included, vehicle type, courses, board basis, etc."
                  value={manualOfferSummary}
                />
              </div>

              <div>
                <label className={adminTripLabelClass} htmlFor="manual-offer-price">
                  Price (EUR, total for this line)
                </label>
                <input
                  className={cx(adminTripInputClass, 'max-w-[220px]')}
                  id="manual-offer-price"
                  inputMode="decimal"
                  min={0}
                  onChange={(e) => {
                    setManualOfferPrice(e.target.value)
                    setManualOfferMessage(null)
                  }}
                  placeholder="e.g. 1890"
                  type="number"
                  value={manualOfferPrice}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <LuxuryButton disabled={manualOfferBusy} type="submit" variant="primary">
                  {manualOfferBusy ? 'Publishing…' : 'Publish to client dashboard'}
                </LuxuryButton>
              </div>

              {manualOfferMessage ? (
                <p className="text-sm font-medium text-forest-800" role="status">
                  {manualOfferMessage}
                </p>
              ) : null}
            </form>
          </section>
        </AdminOperationsSectionShell>
        </AdminPortalSection>

        <AdminPortalSection activeSection={activeAdminSection} section="transfers">
        <AdminAccountTransfersHub
          accountLookupSeed={accountLookupSeedFromTable}
          onAccountLookupSeedApplied={() => setAccountLookupSeedFromTable(null)}
        />

        {listLoading ? null : (
            <div className="scroll-mt-28" id="admin-transfer-pipeline">
              <AdminTransferPipeline />
            </div>
        )}
        </AdminPortalSection>

        <AdminPortalSection activeSection={activeAdminSection} section="forms">
        {listLoading ? (
          <AdminOperationsSectionShell
            className="scroll-mt-28"
            id="admin-hub-forms"
            kicker="Step 1 · Website forms"
            title="Recent form submissions"
            description="Loading workspace data — form rows appear here once the list is ready."
          >
            <p className="text-sm font-medium text-forest-600">Loading…</p>
          </AdminOperationsSectionShell>
        ) : (
          <>
            <AdminOperationsSectionShell
              bodyClassName="space-y-6 sm:py-8"
              className="scroll-mt-28"
              description={
                <>
                  <strong className="font-medium text-forest-900">New</strong> submissions stay here until you open one (click{' '}
                  <span className="font-medium text-forest-800">Ref</span>). That loads{' '}
                  <span className="font-medium text-forest-800">Account lookup → Customer activity</span> (open the Transfers tab to see
                  results) and moves the row to <span className="font-medium text-forest-800">Already viewed</span> below.
                </>
              }
              headerAside={
                enquiries.length > 0 ? (
                  <div className="flex shrink-0 flex-col gap-2 self-start sm:flex-row sm:items-center">
                    <LuxuryButton
                      className="!px-5 !py-2.5 !text-xs"
                      onClick={() => setEnquiriesSectionVisible((v) => !v)}
                      type="button"
                      variant="outline"
                    >
                      {enquiriesSectionVisible ? 'Hide table' : 'Show table'}
                    </LuxuryButton>
                    <LuxuryButton
                      className="!border-red-300 !px-5 !py-2.5 !text-xs !text-red-800 hover:!bg-red-50"
                      disabled={enquiryDeletingAll || enquiryDeletingId !== null}
                      onClick={() => void handleRemoveAllEnquiries()}
                      type="button"
                      variant="outline"
                    >
                      {enquiryDeletingAll ? 'Removing…' : 'Remove all enquiries'}
                    </LuxuryButton>
                  </div>
                ) : undefined
              }
              id="admin-hub-forms"
              kicker="Step 1 · Website forms"
              title={`Recent form submissions${unviewedEnquiries.length > 0 ? ` (${unviewedEnquiries.length} new)` : ''}`}
            >
              {enquiriesSectionVisible && enquiries.length > 0 ? (
                <div className="rounded-2xl border border-forest-200/80 bg-fairway-50/40 px-4 py-4 sm:px-5">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-forest-700" htmlFor="enquiry-filter">
                    Filter by ref, name, email, or interest
                  </label>
                  <input
                    className="w-full max-w-xl rounded-2xl border-2 border-forest-200 bg-white px-4 py-3 text-sm text-forest-900 outline-none transition focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
                    id="enquiry-filter"
                    onChange={(e) => setEnquirySearchQuery(e.target.value)}
                    placeholder="e.g. GSI-… or part of a name"
                    type="search"
                    value={enquirySearchQuery}
                  />
                </div>
              ) : null}

                <details className="rounded-2xl border border-forest-100 bg-offwhite/70 px-4 py-3 text-sm text-forest-700">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">
                    Setup &amp; imports
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-forest-600">
                    Rows appear after the SQL migration and when the dev server has{' '}
                    <code className="rounded-md bg-forest-900 px-1.5 py-0.5 text-xs text-white">SUPABASE_SERVICE_ROLE_KEY</code>{' '}
                    set for <code className="rounded-md bg-forest-900 px-1.5 py-0.5 text-xs text-white">/api/enquiry</code>. Each
                    submitter gets a confirmation email with their enquiry PDF (Resend — same run as your internal notification). The{' '}
                    <span className="font-medium text-forest-800">Ref</span> column matches email subjects, e.g.{' '}
                    <span className="font-mono text-xs text-forest-800">GSI-E9DP-7132</span>. Trip timing, routes, and party size live in{' '}
                    <code className="rounded-md bg-forest-900 px-1.5 py-0.5 text-xs text-white">form_payload</code> — run{' '}
                    <code className="rounded-md bg-forest-900 px-1.5 py-0.5 text-xs text-white">supabase/run-in-sql-editor-enquiries-form-payload.sql</code>{' '}
                    (or the matching migration) if Submission detail is empty.
                  </p>
                </details>

            {enquiryDeleteMessage ? (
              <div
                className="rounded-2xl border border-red-200/90 bg-red-50/90 px-4 py-3 text-sm text-red-900"
                role="alert"
              >
                {enquiryDeleteMessage}
              </div>
            ) : null}

            {!enquiriesSectionVisible ? (
              <div className="mt-6 rounded-[2rem] border border-forest-200 bg-offwhite px-6 py-8 text-center text-sm text-forest-900 md:px-10">
                <p>Recent form submissions are hidden. Use <span className="font-medium text-forest-900">Show table</span> to view them again.</p>
              </div>
            ) : enquiries.length === 0 ? (
              <div className="mt-6 rounded-[2rem] border border-dashed border-forest-200 bg-offwhite px-6 py-10 text-center text-sm text-forest-900 md:px-10">
                No enquiries yet — submit the get-in-touch form locally to test the pipeline.
              </div>
            ) : unviewedEnquiries.length === 0 ? (
              <div className="mt-6 rounded-[2rem] border border-dashed border-forest-200 bg-offwhite px-6 py-10 text-center text-sm text-forest-900 md:px-10">
                {enquirySearchQuery.trim()
                  ? `No new submissions match “${enquirySearchQuery.trim()}”.`
                  : 'All caught up — no new form submissions. Previously viewed rows are listed below.'}
              </div>
            ) : (
              renderEnquirySubmissionsTable(unviewedEnquiries)
            )}

            {selectedEnquiryDetail ? (
              <div className="mt-6 rounded-[2rem] border border-brand-200 bg-white p-6 shadow-soft md:p-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Submission detail</p>
                    <h3 className="font-display mt-2 text-xl font-semibold text-forest-950">
                      {selectedEnquiryDetail.reference_id} — {selectedEnquiryDetail.full_name}
                    </h3>
                    <p className="mt-1 text-sm text-forest-600">
                      Form answers including trip timing (dates or already at Málaga AGP), routes, and any structured fields sent from the
                      site.
                    </p>
                    <p className="mt-2 text-xs text-ge-gray500">
                      <strong className="font-medium text-forest-700">Full quote &amp; VAT breakdown</strong> (deposit split, calculator) lives on
                      the linked <strong className="font-medium text-forest-700">client package build</strong> when it exists. You can also send a
                      simple <strong className="font-medium text-forest-700">priced invoice + Stripe</strong> from this card (portal profile must
                      match the enquiry email).
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <LuxuryButton
                      className="!px-5 !py-2.5 !text-xs"
                      onClick={() => {
                        setWorkspaceEnquiryRef(selectedEnquiryDetail.reference_id)
                        prefillManualProposalFromEnquiry(selectedEnquiryDetail, null)
                      }}
                      type="button"
                      variant="outline"
                    >
                      Use in manual proposal
                    </LuxuryButton>
                    <LuxuryButton
                      className="!px-5 !py-2.5 !text-xs"
                      onClick={() => setSelectedEnquiryDetailRef(null)}
                      type="button"
                      variant="outline"
                    >
                      Close
                    </LuxuryButton>
                  </div>
                </div>

                {websiteFormPackageBuildForSelectedEnquiry ? (
                  <div className="mt-5 rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-fairway-50/90 to-white px-4 py-4 text-sm text-forest-900 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-900">Linked client package</p>
                    <p className="mt-2 text-sm text-forest-700">
                      This enquiry is mirrored as a dashboard package row. Open it to enter the VAT-inclusive total, save the quote to
                      the portal, and trigger the branded PDF email.
                    </p>
                    <LuxuryButton
                      className="!mt-3"
                      onClick={() => {
                        setDetailBuildId(websiteFormPackageBuildForSelectedEnquiry.id)
                        window.requestAnimationFrame(() => {
                          document.getElementById('admin-build-detail-title')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                        })
                      }}
                      type="button"
                      variant="primary"
                    >
                      Open package &amp; add pricing
                    </LuxuryButton>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-chrome-200/80 bg-chrome-50/80 px-4 py-4 text-sm text-brand-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-900">No linked package for this ref in the list</p>
                    <p className="mt-2 text-sm text-brand-950/90">
                      A quotable <strong className="font-medium">website form</strong> package is created automatically only when the
                      submitter&apos;s email already had a <strong className="font-medium">portal profile</strong> at submit time. If they
                      were new, you still have this enquiry record — use <strong className="font-medium">Use in manual proposal</strong>, or
                      find their row under <strong className="font-medium">Client package builds</strong> and click <strong className="font-medium">View</strong> when it appears after they sign in.
                    </p>
                  </div>
                )}

                <div className="mt-6 rounded-2xl border border-violet-200/90 bg-gradient-to-br from-violet-50/95 to-white px-4 py-4 text-sm text-forest-900 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-800">Priced invoice + Stripe (simple path)</p>
                  <p className="mt-2 text-sm text-forest-700">
                    Enter one total (EUR, inc. VAT as you intend). We create a portal invoice row, Stripe Checkout, and email the client a
                    branded message with an invoice PDF. They pay from <span className="font-mono text-xs">/dashboard</span> (two cards:
                    submission + invoice).
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                    <div className="min-w-[8rem] flex-1">
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-900/80" htmlFor="portal-invoice-amount">
                        Amount (EUR)
                      </label>
                      <input
                        className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-sm font-medium text-forest-900 outline-none ring-violet-300/40 focus:ring-2"
                        id="portal-invoice-amount"
                        inputMode="decimal"
                        onChange={(e) => setPortalInvoiceAmountInput(e.target.value)}
                        placeholder="e.g. 2499"
                        type="text"
                        value={portalInvoiceAmountInput}
                      />
                    </div>
                    <LuxuryButton
                      className="!px-6 !py-2.5"
                      disabled={portalInvoiceSendBusy}
                      onClick={() => void handleSendPortalInvoice()}
                      type="button"
                      variant="primary"
                    >
                      {portalInvoiceSendBusy ? 'Sending…' : 'Send invoice & payment link'}
                    </LuxuryButton>
                  </div>
                  {portalInvoiceSendMessage ? (
                    <p className="mt-3 text-xs text-forest-700">{portalInvoiceSendMessage}</p>
                  ) : null}
                  <p className="mt-3 text-[11px] leading-relaxed text-ge-gray500">
                    Requires <code className="rounded bg-white/90 px-1">STRIPE_SECRET_KEY</code>,{' '}
                    <code className="rounded bg-white/90 px-1">STRIPE_WEBHOOK_SECRET</code>, and a Stripe webhook pointing to{' '}
                    <code className="rounded bg-white/90 px-1">/api/stripe-webhook</code> for <code className="rounded bg-white/90 px-1">checkout.session.completed</code>.
                  </p>
                </div>

                <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {submissionDetailRows(selectedEnquiryDetail).map(([label, value], rowIndex) => (
                    <div
                      className={cx(
                        'rounded-2xl border border-forest-100 bg-offwhite/80 px-4 py-3',
                        label === 'Trip interest (combined text)' && 'sm:col-span-2 lg:col-span-3'
                      )}
                      key={`${rowIndex}-${label}`}
                    >
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-600">{label}</dt>
                      <dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-forest-900">{value}</dd>
                    </div>
                  ))}
                </dl>

                <details className="mt-5 rounded-2xl border border-forest-100 bg-forest-950 p-4 text-white">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.16em] text-brand-300">
                    Raw database row
                  </summary>
                  <pre className="mt-4 max-h-72 overflow-auto rounded-xl bg-black/30 p-4 text-xs leading-relaxed text-white/85">
                    {JSON.stringify(selectedEnquiryDetail, null, 2)}
                  </pre>
                </details>
              </div>
            ) : null}
            </AdminOperationsSectionShell>

            {enquiriesSectionVisible && enquiries.some((row) => isEnquiryAdminViewed(row)) ? (
              <AdminOperationsSectionShell
                bodyClassName="space-y-6 sm:py-8"
                className="scroll-mt-28"
                description="Submissions you have already opened. Click Ref again to reload account lookup or reopen detail above."
                id="admin-hub-forms-viewed"
                kicker="Step 1 · Website forms"
                title={`Already viewed${viewedEnquiries.length > 0 ? ` (${viewedEnquiries.length})` : ''}`}
              >
                {viewedEnquiries.length === 0 ? (
                  <div className="rounded-[2rem] border border-dashed border-forest-200 bg-offwhite px-6 py-8 text-center text-sm text-forest-900">
                    No viewed submissions match your filter.
                  </div>
                ) : (
                  renderEnquirySubmissionsTable(viewedEnquiries)
                )}
              </AdminOperationsSectionShell>
            ) : null}

          </>
        )}
        </AdminPortalSection>

        <AdminPortalSection activeSection={activeAdminSection} section="testimonials">
          <AdminOperationsSectionShell
            kicker="Homepage · Guest reviews"
            title="Testimonials from the website form"
            description="Approve submissions before they appear on the homepage. Hide or delete anything you do not want public."
          >
            <AdminTestimonialsPanel sessionToken={session?.access_token ?? null} />
          </AdminOperationsSectionShell>
        </AdminPortalSection>

        <div className="space-y-14 md:space-y-16">
        <AdminPortalSection activeSection={activeAdminSection} section="proposals">
          {SHOW_ADMIN_WORKSPACE_UI ? (
            <>
          <section className="mb-8 rounded-[2rem] border border-fairway-300/70 bg-gradient-to-br from-fairway-50/95 to-white px-6 py-5 shadow-sm md:mb-10 md:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Recommended workflow</p>
            <h3 className="font-display mt-2 text-lg font-semibold text-forest-950 md:text-xl">
              Add the customer · Build transfers · Fill the proposal · Send the PDF
            </h3>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-forest-700">
              <li>
                <strong className="text-forest-900">Enquiries</strong> — click a <span className="font-mono text-xs">Ref</span> for{' '}
                <strong className="font-medium text-forest-800">Submission detail</strong> (form answers, travel dates, already at AGP, routes).
                VAT-inclusive quote pricing is not on this card: use <strong className="font-medium text-forest-800">Open package in Details</strong>{' '}
                when shown, or <strong className="font-medium text-forest-800">Client package builds</strong> →{' '}
                <strong className="font-medium text-forest-800">View</strong> on the row that lists this reference.
              </li>
              <li>
                <strong className="text-forest-900">Transfer package builder</strong> — tie the client (Details, Reference ID, or email), choose{' '}
                <strong className="font-medium text-forest-800">airport-only</strong> vs <strong className="font-medium text-forest-800">golf-course legs</strong>, then{' '}
                <strong className="font-medium text-forest-800">Apply</strong> to push into publish + PDF placeholders.
              </li>
              <li>
                <strong className="text-forest-900">Manual customer proposal</strong> — complete mustard-green fields, preview, and email the PDF when ready.
              </li>
            </ol>
            <div className="mt-4 rounded-xl border border-dashed border-fairway-300/70 bg-white/70 px-4 py-3 text-xs leading-relaxed text-forest-700">
              <p className="font-semibold text-forest-900">Show transfer package builder</p>
              <p className="mt-1 font-semibold text-forest-900">Show manual customer proposal</p>
            </div>
          </section>

          <section className="mb-14 md:mb-16">
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-forest-200 bg-white px-5 py-2.5 text-sm font-semibold text-forest-900 transition-colors hover:border-fairway-400 hover:bg-offwhite/80"
              aria-expanded={adminShowTransferBuilder}
              onClick={() => setAdminShowTransferBuilder((v) => !v)}
            >
              {adminShowTransferBuilder ? 'Hide' : 'Show'} transfer package builder
            </button>
            {adminShowTransferBuilder ? (
              <>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Transfer package builder</p>
                <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950 md:text-3xl">Airport-only vs golf-course legs</h2>
            <p className="mt-2 max-w-2xl text-sm text-forest-600">
              Pick <strong className="font-medium text-forest-800">airport-only</strong> (AGP → hotel or course) or{' '}
              <strong className="font-medium text-forest-800">golf-course legs</strong> (airport or hotel pickup → course). Tie the package
              to a client using <strong className="font-medium text-forest-800">Details</strong>, their{' '}
              <strong className="font-medium text-forest-800">Reference ID</strong> (e.g. GSI-3TY1-2719), or a portal email, then{' '}
              <strong className="font-medium text-forest-800">Apply</strong> to fill <strong className="font-medium text-forest-800">Publish client packages</strong> and the PDF header from that enquiry&apos;s information.
            </p>

            <div className="mt-6 max-w-3xl space-y-5 rounded-[2rem] border border-forest-100 bg-white p-6 shadow-soft md:p-8">
              <fieldset>
                <legend className={adminTripLabelClass}>Client for publish + PDF</legend>
                <p className="mt-1 max-w-2xl text-xs text-forest-600">
                  Dashboard publish uses the client&apos;s <strong className="font-medium text-forest-800">login email</strong> (they must
                  have signed in once). Pull it from <strong className="font-medium text-forest-800">Details</strong>, from an enquiry{' '}
                  <strong className="font-medium text-forest-800">Reference ID</strong>, or type the email.
                </p>
                <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:flex-wrap">
                  {(
                    [
                      ['enquiry', 'Use enquiry in Details'],
                      ['reference', 'Load by Reference ID'],
                      ['manual', 'Enter client login email']
                    ] as const
                  ).map(([value, label]) => (
                    <label
                      className="flex min-w-0 cursor-pointer items-center gap-2 rounded-2xl border border-forest-200 bg-offwhite/80 px-4 py-3 text-sm font-medium text-forest-900 has-[:checked]:border-fairway-500 has-[:checked]:bg-white"
                      key={value}
                    >
                      <input
                        checked={tbClientMode === value}
                        className="h-4 w-4 shrink-0 border-forest-300 text-fairway-600 focus:ring-fairway-400"
                        name="tb-client-mode"
                        onChange={() => {
                          setTbClientMode(value)
                          setTbApplyMessage(null)
                          if (value !== 'reference') {
                            setTbReferenceLookupMessage(null)
                          }
                        }}
                        type="radio"
                        value={value}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {tbClientMode === 'enquiry' ? (
                  <p className="mt-3 rounded-xl border border-forest-100 bg-offwhite/50 px-3 py-2 text-sm text-forest-800">
                    {selectedEnquiryDetail ? (
                      <>
                        <span className="font-mono text-forest-900">{selectedEnquiryDetail.reference_id}</span>
                        {' · '}
                        {selectedEnquiryDetail.full_name}
                        {' · '}
                        <span className="break-all">{selectedEnquiryDetail.email}</span>
                      </>
                    ) : (
                      <span className="text-forest-600">
                        No enquiry selected — open one with “Details” in the list, try “Load by Reference ID”, or switch to “Enter client login
                        email”.
                      </span>
                    )}
                  </p>
                ) : tbClientMode === 'reference' ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                      <div className="min-w-0 flex-1">
                        <label className={adminTripLabelClass} htmlFor="tb-reference-id">
                          Reference ID
                        </label>
                        <input
                          className={`${adminTripInputClass} font-mono`}
                          id="tb-reference-id"
                          onChange={(e) => {
                            setTbReferenceIdInput(e.target.value)
                            setTbReferenceLookupMessage(null)
                            setTbApplyMessage(null)
                            setTbReferenceResolvedRow(null)
                          }}
                          placeholder="e.g. GSI-3TY1-2719"
                          spellCheck={false}
                          type="text"
                          value={tbReferenceIdInput}
                        />
                      </div>
                      <LuxuryButton onClick={() => handleTbReferenceLookup()} type="button" variant="secondary">
                        Load enquiry
                      </LuxuryButton>
                    </div>
                    {tbReferenceLookupMessage ? (
                      <p
                        className={`text-sm font-medium ${tbReferenceResolvedRow ? 'text-fairway-900' : 'text-brand-900'}`}
                        role="status"
                      >
                        {tbReferenceLookupMessage}
                      </p>
                    ) : null}
                    {tbReferenceResolvedRow ? (
                      <p className="rounded-xl border border-forest-100 bg-offwhite/50 px-3 py-2 text-sm text-forest-800">
                        <span className="font-mono text-forest-900">{tbReferenceResolvedRow.reference_id}</span>
                        {' · '}
                        {tbReferenceResolvedRow.full_name}
                        {' · '}
                        <span className="break-all">{tbReferenceResolvedRow.email}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-forest-600">
                        Matches enquiries already loaded here (latest 100). Loading selects that row in <strong className="font-medium text-forest-800">Details</strong> too.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className={adminTripLabelClass} htmlFor="tb-manual-client-email">
                        Client login email
                      </label>
                      <input
                        autoComplete="email"
                        className={adminTripInputClass}
                        id="tb-manual-client-email"
                        onChange={(e) => {
                          setTbManualClientEmail(e.target.value)
                          setTbApplyMessage(null)
                        }}
                        placeholder="same@email they use to sign in"
                        type="email"
                        value={tbManualClientEmail}
                      />
                    </div>
                    <div>
                      <label className={adminTripLabelClass} htmlFor="tb-manual-client-name">
                        Display name on PDF (optional)
                      </label>
                      <input
                        className={adminTripInputClass}
                        id="tb-manual-client-name"
                        onChange={(e) => {
                          setTbManualClientDisplayName(e.target.value)
                          setTbApplyMessage(null)
                        }}
                        placeholder="e.g. John Murphy — leave blank to derive from email"
                        type="text"
                        value={tbManualClientDisplayName}
                      />
                    </div>
                    <div>
                      <label className={adminTripLabelClass} htmlFor="tb-manual-trip-ref">
                        Enquiry / trip ref on PDF (optional)
                      </label>
                      <input
                        className={adminTripInputClass}
                        id="tb-manual-trip-ref"
                        onChange={(e) => {
                          setTbManualTripRef(e.target.value)
                          setTbApplyMessage(null)
                        }}
                        placeholder="e.g. GSI-AB12CD"
                        type="text"
                        value={tbManualTripRef}
                      />
                    </div>
                    <LuxuryButton
                      disabled={!selectedEnquiryDetail}
                      onClick={() => {
                        if (!selectedEnquiryDetail) {
                          return
                        }
                        setTbManualClientEmail(selectedEnquiryDetail.email)
                        setTbManualClientDisplayName(selectedEnquiryDetail.full_name)
                        setTbManualTripRef(selectedEnquiryDetail.reference_id)
                        setTbApplyMessage(null)
                      }}
                      type="button"
                      variant="outline"
                    >
                      Copy from enquiry in Details
                    </LuxuryButton>
                  </div>
                )}
              </fieldset>

              <fieldset>
                <legend className={adminTripLabelClass}>Leg type</legend>
                <p className="mt-1 text-xs text-forest-600">
                  <strong className="font-medium text-forest-800">Airport-only</strong> sets the PDF to airport transfers.{' '}
                  <strong className="font-medium text-forest-800">Golf-course legs</strong> sets golf-day transfer copy (pickup airport or
                  hotel → course).
                </p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  {(
                    [
                      ['airport_only', 'Airport-only — AGP → hotel or golf course'],
                      ['golf_leg', 'Golf-course leg — airport or hotel → course']
                    ] as const
                  ).map(([value, label]) => (
                    <label
                      className="flex cursor-pointer items-center gap-2 rounded-2xl border border-forest-200 bg-offwhite/80 px-4 py-3 text-sm font-medium text-forest-900 has-[:checked]:border-fairway-500 has-[:checked]:bg-white"
                      key={value}
                    >
                      <input
                        checked={tbTemplate === value}
                        className="h-4 w-4 border-forest-300 text-fairway-600 focus:ring-fairway-400"
                        name="tb-template"
                        onChange={() => {
                          setTbTemplate(value)
                          setTbApplyMessage(null)
                        }}
                        type="radio"
                        value={value}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label className={adminTripLabelClass} htmlFor="tb-passengers">
                  Passengers (1–8)
                </label>
                <select
                  className={adminTripInputClass}
                  id="tb-passengers"
                  onChange={(e) => {
                    setTbPassengers(Number(e.target.value))
                    setTbApplyMessage(null)
                  }}
                  value={tbPassengers}
                >
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              {tbTemplate === 'airport_only' ? (
                <div className="space-y-4">
                  <fieldset>
                    <legend className={adminTripLabelClass}>Destination tab</legend>
                    <div className="mt-2 flex gap-2">
                      {(['hotels', 'golf'] as const).map((tab) => (
                        <button
                          className={cx(
                            'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                            tbDestTab === tab
                              ? 'bg-forest-900 text-white'
                              : 'border border-forest-200 bg-white text-forest-800 hover:border-fairway-400'
                          )}
                          key={tab}
                          onClick={() => {
                            setTbDestTab(tab)
                            setTbApplyMessage(null)
                          }}
                          type="button"
                        >
                          {tab === 'hotels' ? 'Hotels' : 'Golf courses'}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  {tbDestTab === 'hotels' ? (
                    <div>
                      <label className={adminTripLabelClass} htmlFor="tb-hotel-slug">
                        Hotel (Costa corridor list)
                      </label>
                      <select
                        className={adminTripInputClass}
                        id="tb-hotel-slug"
                        onChange={(e) => {
                          setTbHotelSlug(e.target.value)
                          setTbApplyMessage(null)
                        }}
                        value={tbHotelSlug}
                      >
                        <option value="">Select…</option>
                        {AIRPORT_CORRIDOR_HOTELS.map((h) => (
                          <option key={h.slug} value={h.slug}>
                            {h.name} ({h.stars}★)
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className={adminTripLabelClass} htmlFor="tb-course-air">
                        Golf course
                      </label>
                      <select
                        className={adminTripInputClass}
                        id="tb-course-air"
                        onChange={(e) => {
                          setTbCourseIdAirDest(e.target.value)
                          setTbApplyMessage(null)
                        }}
                        value={tbCourseIdAirDest}
                      >
                        <option value="">Select…</option>
                        {COURSES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} — {c.region}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <fieldset>
                    <legend className={adminTripLabelClass}>Pickup</legend>
                    <div className="mt-2 flex gap-2">
                      <button
                        className={cx(
                          'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                          tbPickupTab === 'airport'
                            ? 'bg-forest-900 text-white'
                            : 'border border-forest-200 bg-white text-forest-800 hover:border-fairway-400'
                        )}
                        onClick={() => {
                          setTbPickupTab('airport')
                          setTbApplyMessage(null)
                        }}
                        type="button"
                      >
                        Málaga Airport
                      </button>
                      <button
                        className={cx(
                          'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                          tbPickupTab === 'hotel'
                            ? 'bg-forest-900 text-white'
                            : 'border border-forest-200 bg-white text-forest-800 hover:border-fairway-400'
                        )}
                        onClick={() => {
                          setTbPickupTab('hotel')
                          setTbApplyMessage(null)
                        }}
                        type="button"
                      >
                        Hotel
                      </button>
                    </div>
                  </fieldset>
                  {tbPickupTab === 'hotel' ? (
                    <div>
                      <label className={adminTripLabelClass} htmlFor="tb-pickup-hotel">
                        Pickup hotel
                      </label>
                      <select
                        className={adminTripInputClass}
                        id="tb-pickup-hotel"
                        onChange={(e) => {
                          setTbPickupHotelSlug(e.target.value)
                          setTbApplyMessage(null)
                        }}
                        value={tbPickupHotelSlug}
                      >
                        <option value="">Select…</option>
                        {AIRPORT_CORRIDOR_HOTELS.map((h) => (
                          <option key={h.slug} value={h.slug}>
                            {h.name} ({h.stars}★)
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                  <div>
                    <label className={adminTripLabelClass} htmlFor="tb-golf-drop">
                      Drop-off golf course
                    </label>
                    <select
                      className={adminTripInputClass}
                      id="tb-golf-drop"
                      onChange={(e) => {
                        setTbGolfDropCourseId(e.target.value)
                        setTbApplyMessage(null)
                      }}
                      value={tbGolfDropCourseId}
                    >
                      <option value="">Select…</option>
                      {COURSES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — {c.region}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <LuxuryButton onClick={() => applyTransferBuilderToManualPublish()} type="button" variant="secondary">
                  Apply to publish form + PDF header
                </LuxuryButton>
              </div>
              {tbApplyMessage ? (
                <p className="text-sm font-medium text-forest-800" role="status">
                  {tbApplyMessage}
                </p>
              ) : null}
            </div>
              </>
            ) : null}
          </section>

          <section>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-forest-200 bg-white px-5 py-2.5 text-sm font-semibold text-forest-900 transition-colors hover:border-fairway-400 hover:bg-offwhite/80"
              aria-expanded={adminShowManualProposal}
              onClick={() => setAdminShowManualProposal((v) => !v)}
            >
              {adminShowManualProposal ? 'Hide' : 'Show'} manual customer proposal
            </button>
            {adminShowManualProposal ? (
              <>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Manual customer proposal</p>
                <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950 md:text-3xl">
                  Add a customer, fill the proposal, send the PDF
                </h2>
            <p className="mt-2 max-w-3xl text-sm text-forest-600">
              Step after <strong className="font-medium text-forest-800">Transfer package builder</strong>: paste a <strong className="font-medium text-forest-800">Ref ID</strong> into Proposal ID or Booking reference to load customer details, travel timing hints, and a{' '}
              <strong className="font-medium text-forest-800">quick view</strong>. Open <strong className="font-medium text-forest-800">transfers &amp; golf</strong> for the full Costa course list. Or start blank. Sample layout:{' '}
              <a className="font-semibold text-brand-700 underline-offset-2 hover:underline" href="/proposal-pdf-sample" target="_blank" rel="noreferrer">
                /proposal-pdf-sample
              </a>
              .
            </p>

            <div className="mt-6 space-y-6 rounded-[2rem] border border-forest-100 bg-white p-6 shadow-soft md:p-8">
              <div className="grid gap-5 lg:grid-cols-3">
                <div>
                  <label className={adminTripLabelClass} htmlFor="manual-client-name">
                    Customer name
                  </label>
                  <input
                    className={manualProposalInputClass}
                    id="manual-client-name"
                    onChange={handleManualProposalFieldChange('clientFullName')}
                    placeholder="e.g. John Murphy"
                    value={manualProposalForm.clientFullName}
                  />
                </div>
                <div>
                  <label className={adminTripLabelClass} htmlFor="manual-client-email">
                    Customer email
                  </label>
                  <input
                    className={manualProposalInputClass}
                    id="manual-client-email"
                    onChange={handleManualProposalFieldChange('clientEmail')}
                    placeholder="client@example.com"
                    type="email"
                    value={manualProposalForm.clientEmail}
                  />
                </div>
                <div>
                  <label className={adminTripLabelClass} htmlFor="manual-client-phone">
                    Phone / WhatsApp
                  </label>
                  <input
                    className={manualProposalInputClass}
                    id="manual-client-phone"
                    onChange={handleManualProposalFieldChange('clientPhone')}
                    placeholder="+353..."
                    value={manualProposalForm.clientPhone}
                  />
                </div>
              </div>

              <div className="max-w-xl">
                <label className={adminTripLabelClass} htmlFor="manual-pdf-product-kind">
                  PDF first-page header
                </label>
                <select
                  className={manualProposalInputClass}
                  id="manual-pdf-product-kind"
                  onChange={handleManualProposalFieldChange('pdfProductKind')}
                  value={manualProposalForm.pdfProductKind}
                >
                  <option value="default">Default — Costa del Sol golf proposal</option>
                  <option value="airport_transfer">Airport Transfers</option>
                  <option value="golf_transfer">Golf Transfers</option>
                  <option value="hotel_accommodation">Hotel Transfers / Accommodation</option>
                </select>
              </div>

              <div className="rounded-2xl border border-fairway-200 bg-gradient-to-br from-fairway-50/90 to-white p-4 md:p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-800">Client portal — account number &amp; proposals</p>
                <p className="mt-1 text-sm text-forest-700">
                  Matches the <strong className="font-medium text-forest-900">Account number</strong> and{' '}
                  <strong className="font-medium text-forest-900">Proposals &amp; PDFs</strong> area on their dashboard after sign-in.
                </p>
                {manualPortalSnapshot.loading ? (
                  <p className="mt-3 text-xs text-ge-gray500">Checking portal account for this email…</p>
                ) : manualPortalSnapshot.hasProfile ? (
                  <div className="mt-3 space-y-3">
                    <dl className="grid gap-2 text-sm text-forest-800 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ge-gray500">Account number</dt>
                        <dd className="mt-0.5 font-mono text-sm font-semibold text-forest-950">
                          {manualPortalSnapshot.accountRef?.trim()
                            ? manualPortalSnapshot.accountRef.trim()
                            : '— not set (edit in Account & documents below)'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ge-gray500">Formal proposals on dashboard</dt>
                        <dd className="mt-0.5">
                          {manualPortalSnapshot.proposalsEnabled ? (
                            <span className="font-medium text-fairway-800">Visible to client</span>
                          ) : (
                            <span className="text-forest-600">Hidden — enable under Account &amp; documents for this email.</span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ge-gray500">PDF library on dashboard</dt>
                        <dd className="mt-0.5">
                          {manualPortalSnapshot.pdfLibraryEnabled ? (
                            <span className="font-medium text-fairway-800">Visible (when access granted)</span>
                          ) : (
                            <span className="text-forest-600">Hidden — enable PDF library under Account &amp; documents.</span>
                          )}
                        </dd>
                      </div>
                    </dl>
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-forest-200 bg-white/90 p-3 text-sm text-forest-900">
                      <input
                        checked={manualSaveProposalToPortal}
                        className="mt-0.5 h-4 w-4 rounded border-forest-300 text-fairway-600 focus:ring-fairway-400"
                        onChange={(e) => {
                          const on = e.target.checked
                          setManualSaveProposalToPortal(on)
                          if (!on) {
                            setManualLinkBuildSelectedIds({})
                          }
                        }}
                        type="checkbox"
                      />
                      <span>
                        <span className="font-semibold text-forest-950">Save this formal proposal to their portal</span>
                        <span className="mt-1 block text-xs font-normal text-forest-600">
                          They can open it again when formal proposals are enabled for their email. Uncheck to email the PDF only — no dashboard copy or package-build links.
                        </span>
                      </span>
                    </label>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-forest-600">
                    No portal profile on this email yet — the client must sign in once with the same address before you can save a proposal here. You can still email the PDF. When an account exists, this panel shows their account number and the save option.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-forest-200 bg-offwhite/80 p-4 md:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">Link to client package builds (optional)</p>
                <p className="mt-1 text-xs text-forest-600">
                  Tick one or more of this client&apos;s saved calculator trips. After send, they use <strong className="font-medium text-forest-800">View formal proposal</strong>{' '}
                  on those rows in Package builds to see everything you entered here (and download the PDF). Requires the customer email above, a portal profile, and{' '}
                  <strong className="font-medium text-forest-800">Save this formal proposal to their portal</strong> turned on.
                </p>
                {manualLinkBuildLoading ? (
                  <p className="mt-3 text-xs text-ge-gray500">Loading their package builds…</p>
                ) : manualLinkBuildChoices.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {!manualSaveProposalToPortal ? (
                      <p className="text-xs text-brand-800">
                        Turn on <strong className="font-medium">Save this formal proposal to their portal</strong> above to link package builds to this proposal.
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      <LuxuryButton
                        className="!px-3 !py-2 !text-xs"
                        disabled={!manualSaveProposalToPortal}
                        onClick={() => {
                          const next: Record<string, boolean> = {}
                          for (const b of manualLinkBuildChoices) {
                            next[b.id] = true
                          }
                          setManualLinkBuildSelectedIds(next)
                        }}
                        type="button"
                        variant="outline"
                      >
                        Select all
                      </LuxuryButton>
                      <LuxuryButton
                        className="!px-3 !py-2 !text-xs"
                        disabled={!manualSaveProposalToPortal}
                        onClick={() => setManualLinkBuildSelectedIds({})}
                        type="button"
                        variant="outline"
                      >
                        Clear selection
                      </LuxuryButton>
                    </div>
                    <ul
                      className={`max-h-52 space-y-2 overflow-y-auto rounded-xl border border-forest-100 bg-white p-3 ${!manualSaveProposalToPortal ? 'pointer-events-none opacity-50' : ''}`}
                    >
                      {manualLinkBuildChoices.map((b) => (
                        <li key={b.id}>
                          <label className="flex cursor-pointer items-start gap-3 text-sm text-forest-900">
                            <input
                              checked={Boolean(manualLinkBuildSelectedIds[b.id])}
                              className="mt-1 h-4 w-4 rounded border-forest-300 text-fairway-600"
                              disabled={!manualSaveProposalToPortal}
                              onChange={() =>
                                setManualLinkBuildSelectedIds((prev) => ({
                                  ...prev,
                                  [b.id]: !prev[b.id]
                                }))
                              }
                              type="checkbox"
                            />
                            <span>
                              <span className="font-medium">{b.label?.trim() || 'Package build'}</span>
                              <span className="ml-2 text-xs text-ge-gray500">
                                {formatAdminDateTime(b.created_at)}
                              </span>
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {manualLinkBuildNotice ? (
                  <p className="mt-2 text-xs text-forest-600" role="status">
                    {manualLinkBuildNotice}
                  </p>
                ) : null}
              </div>

              {manualProposalFromEnquiryRef && !manualProposalExpanded ? (
                <div className="mt-2 rounded-[1.5rem] border border-forest-200 bg-gradient-to-b from-white to-fairway-50/25 p-5 shadow-sm md:p-6">
                  <div className="flex flex-col gap-3 border-b border-forest-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fairway-800">Quick view — enquiry loaded</p>
                      <p className="mt-1 font-mono text-sm font-bold text-forest-950">{manualProposalFromEnquiryRef}</p>
                      {manualEnquiryCompactFormSource ? (
                        <p className="mt-1 text-xs text-forest-600">
                          Form source: <span className="font-semibold text-forest-800">{manualEnquiryCompactFormSource}</span>
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs text-forest-600">
                        Customer, pricing hints, and interest are filled. Open the full editor for trip-shape lines, deposits, and the Costa course list with nearest hotels.
                      </p>
                    </div>
                    <LuxuryButton
                      className="!whitespace-nowrap !px-4 !py-2.5 !text-xs"
                      onClick={() => setManualProposalExpanded(true)}
                      type="button"
                      variant="primary"
                    >
                      Show transfers, golf corridor & full PDF fields
                    </LuxuryButton>
                  </div>
                  <div className="mt-5 grid gap-4 lg:grid-cols-3">
                    <div>
                      <label className={adminTripLabelClass} htmlFor="manual-compact-proposal-id">
                        New proposal ID (PDF)
                      </label>
                      <input
                        className={manualProposalInputClass}
                        id="manual-compact-proposal-id"
                        onChange={handleManualProposalFieldChange('proposalId')}
                        value={manualProposalForm.proposalId}
                      />
                    </div>
                    <div>
                      <label className={adminTripLabelClass} htmlFor="manual-compact-proposal-date">
                        Proposal date
                      </label>
                      <input
                        className={manualProposalInputClass}
                        id="manual-compact-proposal-date"
                        onChange={handleManualProposalFieldChange('proposalDate')}
                        value={manualProposalForm.proposalDate}
                      />
                    </div>
                    <div>
                      <label className={adminTripLabelClass} htmlFor="manual-compact-enquiry-ref">
                        Enquiry reference (locked)
                      </label>
                      <input
                        className={`${manualProposalInputClass} cursor-not-allowed bg-forest-50/80 opacity-90`}
                        disabled
                        id="manual-compact-enquiry-ref"
                        readOnly
                        value={manualProposalForm.enquiryReferenceId}
                      />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className={adminTripLabelClass} htmlFor="manual-compact-package">
                        Package name
                      </label>
                      <input
                        className={manualProposalInputClass}
                        id="manual-compact-package"
                        onChange={handleManualProposalFieldChange('packageName')}
                        value={manualProposalForm.packageName}
                      />
                    </div>
                    <div>
                      <label className={adminTripLabelClass} htmlFor="manual-compact-scope">
                        Quote scope
                      </label>
                      <input
                        className={manualProposalInputClass}
                        id="manual-compact-scope"
                        onChange={handleManualProposalFieldChange('quoteScopeSummary')}
                        value={manualProposalForm.quoteScopeSummary}
                      />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className={adminTripLabelClass} htmlFor="manual-compact-group">
                        Group size
                      </label>
                      <input
                        className={manualProposalInputClass}
                        id="manual-compact-group"
                        min={1}
                        onChange={handleManualProposalFieldChange('groupSize')}
                        type="number"
                        value={manualProposalForm.groupSize}
                      />
                    </div>
                    <div>
                      <label className={adminTripLabelClass} htmlFor="manual-compact-nights">
                        Nights
                      </label>
                      <input
                        className={manualProposalInputClass}
                        id="manual-compact-nights"
                        min={0}
                        onChange={handleManualProposalFieldChange('nights')}
                        type="number"
                        value={manualProposalForm.nights}
                      />
                    </div>
                    <div>
                      <label className={adminTripLabelClass} htmlFor="manual-compact-rounds">
                        Rounds
                      </label>
                      <input
                        className={manualProposalInputClass}
                        id="manual-compact-rounds"
                        min={0}
                        onChange={handleManualProposalFieldChange('rounds')}
                        type="number"
                        value={manualProposalForm.rounds}
                      />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className={adminTripLabelClass} htmlFor="manual-compact-pp">
                        Per-person price
                      </label>
                      <input
                        className={manualProposalInputClass}
                        id="manual-compact-pp"
                        onChange={handleManualProposalFieldChange('perPersonPrice')}
                        value={manualProposalForm.perPersonPrice}
                      />
                    </div>
                    <div>
                      <label className={adminTripLabelClass} htmlFor="manual-compact-total">
                        Group total
                      </label>
                      <input
                        className={manualProposalInputClass}
                        id="manual-compact-total"
                        onChange={handleManualProposalFieldChange('groupTotal')}
                        value={manualProposalForm.groupTotal}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className={adminTripLabelClass} htmlFor="manual-compact-interest">
                      Customer interest / brief
                    </label>
                    <textarea
                      className={manualProposalInputClass}
                      id="manual-compact-interest"
                      onChange={handleManualProposalFieldChange('clientInterest')}
                      rows={4}
                      value={manualProposalForm.clientInterest}
                    />
                  </div>
                </div>
              ) : null}

              {(!manualProposalFromEnquiryRef || manualProposalExpanded) ? (
                <>
                  {manualProposalFromEnquiryRef && manualProposalExpanded ? (
                    <div className="mb-6 rounded-2xl border border-fairway-200 bg-white p-4 shadow-sm md:p-5">
                      <div className="flex flex-col gap-3 border-b border-forest-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-800">Costa del Sol — transfers & golf</p>
                          <p className="mt-1 text-xs text-forest-600">
                            Pick transfer copy below, or choose a course — we set <strong className="font-medium">Courses</strong>,{' '}
                            <strong className="font-medium">Hotel</strong>, and <strong className="font-medium">Hotel distance</strong> from the nearest hotel list for that
                            fairway.
                          </p>
                        </div>
                        <LuxuryButton
                          className="!whitespace-nowrap !px-3 !py-2 !text-xs border-forest-300 !text-forest-900 hover:!bg-forest-50"
                          onClick={() => setManualProposalExpanded(false)}
                          type="button"
                          variant="outline"
                        >
                          Back to quick view
                        </LuxuryButton>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2" role="tablist">
                        <button
                          aria-selected={manualProposalAdminTab === 'transfers'}
                          className={cx(
                            'rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors',
                            manualProposalAdminTab === 'transfers'
                              ? 'bg-fairway-700 text-white shadow-sm'
                              : 'bg-forest-100 text-forest-700 hover:bg-forest-200'
                          )}
                          onClick={() => setManualProposalAdminTab('transfers')}
                          role="tab"
                          type="button"
                        >
                          Transfers
                        </button>
                        <button
                          aria-selected={manualProposalAdminTab === 'golf'}
                          className={cx(
                            'rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors',
                            manualProposalAdminTab === 'golf'
                              ? 'bg-fairway-700 text-white shadow-sm'
                              : 'bg-forest-100 text-forest-700 hover:bg-forest-200'
                          )}
                          onClick={() => setManualProposalAdminTab('golf')}
                          role="tab"
                          type="button"
                        >
                          Golf courses (Sol corridor)
                        </button>
                      </div>
                      {manualProposalAdminTab === 'transfers' ? (
                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                          <div>
                            <label className={adminTripLabelClass} htmlFor="manual-tab-transfer-style">
                              Transfer style
                            </label>
                            <textarea
                              className={manualProposalInputClass}
                              id="manual-tab-transfer-style"
                              onChange={handleManualProposalFieldChange('transferName')}
                              rows={3}
                              value={manualProposalForm.transferName}
                            />
                          </div>
                          <div>
                            <label className={adminTripLabelClass} htmlFor="manual-tab-departure">
                              Departure airport / route
                            </label>
                            <input
                              className={manualProposalInputClass}
                              id="manual-tab-departure"
                              onChange={handleManualProposalFieldChange('departureAirportRoute')}
                              value={manualProposalForm.departureAirportRoute}
                            />
                          </div>
                          <div>
                            <label className={adminTripLabelClass} htmlFor="manual-tab-airport-tx">
                              Airport transfers (PDF logistics)
                            </label>
                            <textarea
                              className={manualProposalInputClass}
                              id="manual-tab-airport-tx"
                              onChange={handleManualProposalFieldChange('airportTransfersDetail')}
                              rows={2}
                              value={manualProposalForm.airportTransfersDetail}
                            />
                          </div>
                          <div>
                            <label className={adminTripLabelClass} htmlFor="manual-tab-golf-tx">
                              Golf-day transport
                            </label>
                            <textarea
                              className={manualProposalInputClass}
                              id="manual-tab-golf-tx"
                              onChange={handleManualProposalFieldChange('golfDayTransportDetail')}
                              rows={2}
                              value={manualProposalForm.golfDayTransportDetail}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <label className={adminTripLabelClass} htmlFor="manual-golf-filter">
                            Search courses
                          </label>
                          <input
                            className={cx(adminTripInputClass, 'mt-1 max-w-md border-chrome-400')}
                            id="manual-golf-filter"
                            onChange={(e) => setManualGolfPickerQuery(e.target.value)}
                            placeholder="Name, town, or id (e.g. lasbrisas)"
                            value={manualGolfPickerQuery}
                          />
                          <ul className="mt-4 max-h-[min(52vh,420px)] space-y-2 overflow-y-auto rounded-xl border border-forest-100 bg-forest-950/[0.02] p-2">
                            {manualGolfCoursesFiltered.map((c) => {
                              const hotels = NEARBY_HOTELS[c.id] ?? []
                              const nearest = hotels[0]
                              return (
                                <li
                                  className="rounded-lg border border-forest-100 bg-white px-3 py-2.5 text-sm text-forest-900 shadow-sm"
                                  key={c.id}
                                >
                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                      <p className="font-semibold text-forest-950">{c.name}</p>
                                      <p className="text-xs text-forest-600">
                                        {c.region} · {c.tier} tier · ★ {c.rating.toFixed(1)}
                                      </p>
                                      {nearest ? (
                                        <p className="mt-1 text-xs text-forest-700">
                                          <span className="font-medium text-fairway-800">Nearest hotel:</span> {nearest.name} ({nearest.dist},{' '}
                                          {nearest.stars}★)
                                        </p>
                                      ) : (
                                        <p className="mt-1 text-xs text-brand-800">No hotel list for this id — type hotel manually in the full form.</p>
                                      )}
                                      {hotels.length > 1 ? (
                                        <p className="mt-0.5 text-[11px] text-ge-gray500">
                                          Also nearby: {hotels
                                            .slice(1, 4)
                                            .map((h) => h.name)
                                            .join(' · ')}
                                        </p>
                                      ) : null}
                                    </div>
                                    <div className="flex shrink-0 flex-wrap gap-2">
                                      <LuxuryButton
                                        className="!px-3 !py-1.5 !text-[11px]"
                                        onClick={() => applyManualCourseAndNearestHotel(c.id, 'replace')}
                                        type="button"
                                        variant="outline"
                                      >
                                        Use course + nearest
                                      </LuxuryButton>
                                      <LuxuryButton
                                        className="!px-3 !py-1.5 !text-[11px]"
                                        onClick={() => applyManualCourseAndNearestHotel(c.id, 'append')}
                                        type="button"
                                        variant="outline"
                                      >
                                        Add to list
                                      </LuxuryButton>
                                    </div>
                                  </div>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : null}

              <div className="grid gap-5 lg:grid-cols-3">
                <div>
                  <label className={adminTripLabelClass} htmlFor="manual-proposal-id">
                    Proposal ID or enquiry Ref ID
                  </label>
                  <input
                    className={manualProposalInputClass}
                    id="manual-proposal-id"
                    onChange={handleManualProposalFieldChange('proposalId')}
                    value={manualProposalForm.proposalId}
                  />
                  <p className="mt-1 text-xs text-ge-gray500">
                    Paste a <strong className="font-medium text-forest-700">recent enquiry Ref ID</strong> to load the submission (quick view + form hints), or leave empty for
                    preview ID <span className="font-mono font-semibold">GSI-PREVIEW</span>. Email send assigns a new formal proposal ID if still empty.
                  </p>
                </div>
                <div>
                  <label className={adminTripLabelClass} htmlFor="manual-proposal-date">
                    Proposal date
                  </label>
                  <input
                    className={manualProposalInputClass}
                    id="manual-proposal-date"
                    onChange={handleManualProposalFieldChange('proposalDate')}
                    value={manualProposalForm.proposalDate}
                  />
                </div>
                <div>
                  <label className={adminTripLabelClass} htmlFor="manual-reference">
                    Booking / enquiry reference
                  </label>
                  <input
                    className={manualProposalInputClass}
                    id="manual-reference"
                    onChange={handleManualProposalFieldChange('enquiryReferenceId')}
                    placeholder="Optional, e.g. GSI-MANUAL-001"
                    value={manualProposalForm.enquiryReferenceId}
                  />
                  <p className="mt-1 text-xs text-ge-gray500">
                    If this matches a recent submission Ref ID, customer/form details are pulled in automatically.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <label className={adminTripLabelClass} htmlFor="manual-interest">
                    Customer interest / brief
                  </label>
                  <textarea
                    className={manualProposalInputClass}
                    id="manual-interest"
                    onChange={handleManualProposalFieldChange('clientInterest')}
                    placeholder="What they asked for, dates, group type, priorities..."
                    rows={4}
                    value={manualProposalForm.clientInterest}
                  />
                </div>
                <div>
                  <label className={adminTripLabelClass} htmlFor="manual-extra-notes">
                    Extra PDF notes
                  </label>
                  <textarea
                    className={manualProposalInputClass}
                    id="manual-extra-notes"
                    onChange={handleManualProposalFieldChange('extraNotes')}
                    placeholder="One line per note. These appear in the proposal overview."
                    rows={4}
                    value={manualProposalForm.extraNotes}
                  />
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <label className={adminTripLabelClass} htmlFor="manual-package">
                    Package name / proposal style
                  </label>
                  <input
                    className={manualProposalInputClass}
                    id="manual-package"
                    onChange={handleManualProposalFieldChange('packageName')}
                    value={manualProposalForm.packageName}
                  />
                </div>
                <div>
                  <label className={adminTripLabelClass} htmlFor="manual-scope">
                    Quote scope
                  </label>
                  <input
                    className={manualProposalInputClass}
                    id="manual-scope"
                    onChange={handleManualProposalFieldChange('quoteScopeSummary')}
                    placeholder="Transfers · Golf · Hotel"
                    value={manualProposalForm.quoteScopeSummary}
                  />
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                <div>
                  <label className={adminTripLabelClass} htmlFor="manual-group-size">
                    Group size
                  </label>
                  <input
                    className={manualProposalInputClass}
                    id="manual-group-size"
                    min={1}
                    onChange={handleManualProposalFieldChange('groupSize')}
                    type="number"
                    value={manualProposalForm.groupSize}
                  />
                </div>
                <div>
                  <label className={adminTripLabelClass} htmlFor="manual-nights">
                    Nights
                  </label>
                  <input
                    className={manualProposalInputClass}
                    id="manual-nights"
                    min={0}
                    onChange={handleManualProposalFieldChange('nights')}
                    type="number"
                    value={manualProposalForm.nights}
                  />
                </div>
                <div>
                  <label className={adminTripLabelClass} htmlFor="manual-rounds">
                    Rounds
                  </label>
                  <input
                    className={manualProposalInputClass}
                    id="manual-rounds"
                    min={0}
                    onChange={handleManualProposalFieldChange('rounds')}
                    type="number"
                    value={manualProposalForm.rounds}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-chrome-300/60 bg-chrome-50/40 p-4 md:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">
                  PDF — Trip shape card
                </p>
                <p className="mt-1 text-xs text-forest-600">
                  Fills the lines under “Trip shape” on the proposal PDF (empty fields stay as underscore placeholders).
                </p>
                <div className="mt-4">
                  <label className={adminTripLabelClass} htmlFor="manual-trip-shape-custom">
                    Trip shape line (optional)
                  </label>
                  <input
                    className={manualProposalInputClass}
                    id="manual-trip-shape-custom"
                    onChange={handleManualProposalFieldChange('tripShapeCustom')}
                    placeholder="e.g. 4 nights / 3 rounds"
                    value={manualProposalForm.tripShapeCustom}
                  />
                  <p className="mt-1 text-xs text-forest-600">
                    Leave blank to use{' '}
                    <span className="font-medium text-forest-800">
                      {manualProposalForm.nights || '0'} nights / {manualProposalForm.rounds || '0'} rounds
                    </span>{' '}
                    from Nights and Rounds above.
                  </p>
                </div>
                <div className="mt-4 grid gap-5 lg:grid-cols-3">
                  <div>
                    <label className={adminTripLabelClass} htmlFor="manual-pdf-travel-dates">
                      Travel dates
                    </label>
                    <input
                      className={manualProposalInputClass}
                      id="manual-pdf-travel-dates"
                      onChange={handleManualProposalFieldChange('travelDates')}
                      placeholder="e.g. 12–19 Jun 2026"
                      value={manualProposalForm.travelDates}
                    />
                  </div>
                  <div>
                    <label className={adminTripLabelClass} htmlFor="manual-pdf-departure-route">
                      Departure airport / route
                    </label>
                    <input
                      className={manualProposalInputClass}
                      id="manual-pdf-departure-route"
                      onChange={handleManualProposalFieldChange('departureAirportRoute')}
                      placeholder="e.g. Dublin → Málaga (AGP)"
                      value={manualProposalForm.departureAirportRoute}
                    />
                  </div>
                  <div>
                    <label className={adminTripLabelClass} htmlFor="manual-pdf-lead-contact">
                      Lead traveller / contact
                    </label>
                    <input
                      className={manualProposalInputClass}
                      id="manual-pdf-lead-contact"
                      onChange={handleManualProposalFieldChange('leadTravellerContact')}
                      placeholder="Name · phone · email"
                      value={manualProposalForm.leadTravellerContact}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <label className={adminTripLabelClass} htmlFor="manual-stay">
                    Stay / hotel level
                  </label>
                  <textarea
                    className={manualProposalInputClass}
                    id="manual-stay"
                    onChange={handleManualProposalFieldChange('stayName')}
                    placeholder="Hotel name, star level, board basis, room assumptions..."
                    rows={3}
                    value={manualProposalForm.stayName}
                  />
                </div>
                <div>
                  <label className={adminTripLabelClass} htmlFor="manual-transfer">
                    Transfer style
                  </label>
                  <textarea
                    className={manualProposalInputClass}
                    id="manual-transfer"
                    onChange={handleManualProposalFieldChange('transferName')}
                    placeholder="Private airport transfers, golf day transport, vehicle type..."
                    rows={3}
                    value={manualProposalForm.transferName}
                  />
                </div>
                <div>
                  <label className={adminTripLabelClass} htmlFor="manual-courses">
                    Courses
                  </label>
                  <textarea
                    className={manualProposalInputClass}
                    id="manual-courses"
                    onChange={handleManualProposalFieldChange('courseName')}
                    placeholder="Course list shown on the PDF"
                    rows={3}
                    value={manualProposalForm.courseName}
                  />
                </div>
                <div>
                  <label className={adminTripLabelClass} htmlFor="manual-hotel">
                    Hotel name / area
                  </label>
                  <textarea
                    className={manualProposalInputClass}
                    id="manual-hotel"
                    onChange={handleManualProposalFieldChange('hotelName')}
                    placeholder="Hotel / resort / area shown on the PDF"
                    rows={3}
                    value={manualProposalForm.hotelName}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-chrome-300/60 bg-chrome-50/40 p-4 md:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">
                  PDF — Proposal details &amp; logistics cards
                </p>
                <p className="mt-1 text-xs text-forest-600">
                  “Resort area” and “Special requests” sit in the proposal details card; the four lines below map to “Logistics and inclusions”.
                </p>
                <div className="mt-4 grid gap-5 lg:grid-cols-2">
                  <div>
                    <label className={adminTripLabelClass} htmlFor="manual-pdf-resort-area">
                      Resort area
                    </label>
                    <input
                      className={manualProposalInputClass}
                      id="manual-pdf-resort-area"
                      onChange={handleManualProposalFieldChange('resortArea')}
                      placeholder="e.g. Nueva Andalucía / Marbella"
                      value={manualProposalForm.resortArea}
                    />
                  </div>
                  <div>
                    <label className={adminTripLabelClass} htmlFor="manual-pdf-special-requests">
                      Special requests (PDF proposal details)
                    </label>
                    <textarea
                      className={manualProposalInputClass}
                      id="manual-pdf-special-requests"
                      onChange={handleManualProposalFieldChange('proposalSpecialRequests')}
                      placeholder="Separate from “Customer interest” — shown only on this PDF line."
                      rows={2}
                      value={manualProposalForm.proposalSpecialRequests}
                    />
                  </div>
                  <div>
                    <label className={adminTripLabelClass} htmlFor="manual-pdf-airport-transfers">
                      Airport transfers
                    </label>
                    <textarea
                      className={manualProposalInputClass}
                      id="manual-pdf-airport-transfers"
                      onChange={handleManualProposalFieldChange('airportTransfersDetail')}
                      placeholder="Meet-and-greet, vehicle type, timing…"
                      rows={2}
                      value={manualProposalForm.airportTransfersDetail}
                    />
                  </div>
                  <div>
                    <label className={adminTripLabelClass} htmlFor="manual-pdf-golf-transport">
                      Golf-day transport
                    </label>
                    <textarea
                      className={manualProposalInputClass}
                      id="manual-pdf-golf-transport"
                      onChange={handleManualProposalFieldChange('golfDayTransportDetail')}
                      placeholder="Resort ↔ courses…"
                      rows={2}
                      value={manualProposalForm.golfDayTransportDetail}
                    />
                  </div>
                  <div>
                    <label className={adminTripLabelClass} htmlFor="manual-pdf-board-basis">
                      Board basis
                    </label>
                    <input
                      className={manualProposalInputClass}
                      id="manual-pdf-board-basis"
                      onChange={handleManualProposalFieldChange('boardBasis')}
                      placeholder="e.g. B&B / half board"
                      value={manualProposalForm.boardBasis}
                    />
                  </div>
                  <div>
                    <label className={adminTripLabelClass} htmlFor="manual-pdf-upgrade-notes">
                      Upgrade notes
                    </label>
                    <textarea
                      className={manualProposalInputClass}
                      id="manual-pdf-upgrade-notes"
                      onChange={handleManualProposalFieldChange('upgradeNotes')}
                      placeholder="Room upgrades, extra rounds…"
                      rows={2}
                      value={manualProposalForm.upgradeNotes}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-5">
                <div>
                  <label className={adminTripLabelClass} htmlFor="manual-hotel-distance">
                    Hotel distance
                  </label>
                  <input
                    className={manualProposalInputClass}
                    id="manual-hotel-distance"
                    onChange={handleManualProposalFieldChange('hotelDist')}
                    placeholder="Optional"
                    value={manualProposalForm.hotelDist}
                  />
                </div>
                <div>
                  <label className={adminTripLabelClass} htmlFor="manual-pp-price">
                    Per-person price
                  </label>
                  <input
                    className={manualProposalInputClass}
                    id="manual-pp-price"
                    onChange={handleManualProposalFieldChange('perPersonPrice')}
                    placeholder="€1,180"
                    value={manualProposalForm.perPersonPrice}
                  />
                </div>
                <div>
                  <label className={adminTripLabelClass} htmlFor="manual-group-total">
                    Group total
                  </label>
                  <input
                    className={manualProposalInputClass}
                    id="manual-group-total"
                    onChange={handleManualProposalFieldChange('groupTotal')}
                    placeholder="€7,080"
                    value={manualProposalForm.groupTotal}
                  />
                </div>
                <div>
                  <label className={adminTripLabelClass} htmlFor="manual-deposit">
                    Deposit
                  </label>
                  <input
                    className={manualProposalInputClass}
                    id="manual-deposit"
                    onChange={handleManualProposalFieldChange('depositAmount')}
                    placeholder="€1,416"
                    value={manualProposalForm.depositAmount}
                  />
                </div>
                <div>
                  <label className={adminTripLabelClass} htmlFor="manual-balance">
                    Remaining balance
                  </label>
                  <input
                    className={manualProposalInputClass}
                    id="manual-balance"
                    onChange={handleManualProposalFieldChange('remainingBalance')}
                    placeholder="€5,664"
                    value={manualProposalForm.remainingBalance}
                  />
                </div>
              </div>
                </>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <LuxuryButton
                  disabled={manualProposalPdfLoading || manualProposalSending}
                  onClick={() => void handlePreviewManualProposalPdf()}
                  type="button"
                  variant="primary"
                >
                  {manualProposalPdfLoading ? 'Building PDF…' : 'Preview manual proposal PDF'}
                </LuxuryButton>
                <LuxuryButton
                  className="!text-forest-900 border-forest-400/80 bg-white hover:!bg-forest-50 hover:!text-forest-950"
                  disabled={manualProposalSending || manualProposalPdfLoading}
                  onClick={() => void handleEmailManualProposal()}
                  type="button"
                  variant="outline"
                >
                  {manualProposalSending ? 'Sending…' : 'Email proposal PDF to customer'}
                </LuxuryButton>
                <LuxuryButton
                  className="!text-forest-900 border-forest-400/80 bg-white hover:!bg-forest-50 hover:!text-forest-950"
                  onClick={resetManualProposal}
                  type="button"
                  variant="outline"
                >
                  Reset manual customer
                </LuxuryButton>
                {manualProposalPdfUrl ? (
                  <LuxuryButton onClick={revokeManualProposalPdfObjectUrl} type="button" variant="outline">
                    Close PDF preview
                  </LuxuryButton>
                ) : null}
              </div>

              {manualProposalMessage ? (
                <p className="text-sm font-medium text-fairway-900" role="status">
                  {manualProposalMessage}
                </p>
              ) : null}

              {manualProposalPdfUrl ? (
                <div className="overflow-hidden rounded-2xl border border-forest-200 bg-forest-950/5 shadow-inner">
                  <p className="border-b border-forest-100 bg-offwhite px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-forest-600">
                    Manual customer proposal PDF preview
                  </p>
                  <iframe
                    className="h-[min(78vh,920px)] w-full bg-neutral-800"
                    src={manualProposalPdfUrl}
                    title="Manual customer proposal PDF preview"
                  />
                </div>
              ) : null}
            </div>
              </>
            ) : null}
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Trip proposal workspace</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950 md:text-3xl">Match an enquiry → sketch a quote</h2>
            <p className="mt-2 max-w-3xl text-sm text-forest-600">
              Pick the enquiry reference (same ID as in the customer email subject). After you choose <strong>Active enquiry</strong>, use{' '}
              <strong>Transfer payments (this enquiry)</strong> (card just below the enquiry details) to mark each linked transfer job
              as unpaid, deposit, or paid in full. Toggle <strong>transfer</strong>, <strong>golf</strong>, and/or <strong>hotel</strong>{' '}
              for 1–8 guests, select Costa courses (Benalmádena through Sotogrande — same roster as the site map). Generate a{' '}
              <strong>client-style proposal PDF</strong> below with enquiry contact details, your selections, and indicative pricing — or
              copy JSON for other tools. Illustrative prices only until you wire supplier rates.
            </p>

            {enquiries.length === 0 ? (
              <p className="mt-6 text-sm text-forest-600">Load enquiries above to use this workspace.</p>
            ) : (
              <div className="mt-6 space-y-6 rounded-[2rem] border border-forest-100 bg-offwhite/90 p-6 shadow-soft md:p-8">
                <div className="flex flex-col flex-wrap gap-4 md:flex-row md:items-end md:justify-between">
                  <div className="min-w-0 flex-1">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600" htmlFor="ws-enquiry">
                      Active enquiry
                    </label>
                    <select
                      className={adminTripInputClass}
                      id="ws-enquiry"
                      onChange={(e) => setWorkspaceEnquiryRef(e.target.value)}
                      value={workspaceEnquiryRef}
                    >
                      <option value="">Select reference…</option>
                      {enquiries.map((row) => (
                        <option key={row.id} value={row.reference_id}>
                          {row.reference_id} — {row.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <LuxuryButton
                    disabled={!workspaceEnquiryRef}
                    onClick={() => void handleCopyClientLoginLink()}
                    type="button"
                    variant="outline"
                  >
                    Copy client “save enquiry” link
                  </LuxuryButton>
                  <LuxuryButton
                    disabled={!workspaceEnquiryRef.trim()}
                    onClick={() =>
                      document
                        .getElementById('admin-transfer-payments-workspace')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                    type="button"
                    variant="outline"
                  >
                    Jump to transfer payments
                  </LuxuryButton>
                </div>

                {activeWorkspaceEnquiry ? (
                  <div className="rounded-2xl border border-brand-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">Active enquiry details</p>
                        <h3 className="mt-1 text-lg font-semibold text-forest-950">
                          {activeWorkspaceEnquiry.reference_id} — {activeWorkspaceEnquiry.full_name}
                        </h3>
                        <p className="mt-1 text-sm text-forest-600">
                          {activeWorkspaceEnquiry.email}
                          {activeWorkspaceEnquiry.phone_whatsapp ? ` · ${activeWorkspaceEnquiry.phone_whatsapp}` : ''}
                        </p>
                        {activeWorkspaceEnquiry.interest ? (
                          <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm text-forest-800">
                            {activeWorkspaceEnquiry.interest}
                          </p>
                        ) : null}
                        <p className="mt-2 text-xs text-ge-gray500">
                          Best time: {activeWorkspaceEnquiry.best_time_to_call ?? '—'} · Submitted{' '}
                          {formatAdminDateTime(activeWorkspaceEnquiry.created_at)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <LuxuryButton
                          className="!px-5 !py-2.5 !text-xs"
                          onClick={() => setSelectedEnquiryDetailRef(activeWorkspaceEnquiry.reference_id)}
                          type="button"
                          variant="outline"
                        >
                          View full submission card
                        </LuxuryButton>
                        <LuxuryButton
                          className="!px-5 !py-2.5 !text-xs"
                          onClick={() => prefillManualProposalFromEnquiry(activeWorkspaceEnquiry, workspaceDraft)}
                          type="button"
                          variant="outline"
                        >
                          Fill manual proposal from this enquiry
                        </LuxuryButton>
                      </div>
                    </div>
                  </div>
                ) : null}

                {workspaceEnquiryRef.trim() ? (
                  <div
                    className="scroll-mt-28 rounded-2xl border border-forest-200 bg-white p-4 shadow-sm md:p-6"
                    id="admin-transfer-payments-workspace"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">
                      Transfer payments (this enquiry)
                    </p>
                    <p className="mt-1 text-sm text-forest-600">
                      Each row is one <strong className="font-medium text-forest-800">transfer_bookings</strong> job (client map,
                      dashboard request, or website enquiry mirror). Use the buttons to set{' '}
                      <strong className="font-medium text-forest-800">Unpaid</strong>,{' '}
                      <strong className="font-medium text-forest-800">20% deposit</strong>, or{' '}
                      <strong className="font-medium text-forest-800">Paid in full</strong>.
                    </p>
                    {workspaceCostaMapBookings.length > 0 ? (
                      <div className="mt-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-600">
                            Linked transfer jobs
                          </p>
                          <LuxuryButton
                            className="!px-3 !py-2 !text-xs"
                            disabled={workspaceTransferReminderBusy}
                            onClick={() => void handleWorkspaceRunBalanceReminders()}
                            type="button"
                            variant="outline"
                          >
                            {workspaceTransferReminderBusy ? 'Running…' : 'Send due balance reminders now'}
                          </LuxuryButton>
                        </div>
                        <p className="mt-1 text-xs text-ge-gray500">
                          Thank-you emails send when you change payment (unless unchecked below). After a deposit, one balance reminder is
                          queued for <strong>48 hours before</strong> the scheduled pickup (see “Balance reminder due” below). Optional dev
                          override: server env{' '}
                          <code className="rounded bg-offwhite px-1">TRANSFER_BALANCE_REMINDER_AFTER_MINUTES</code> schedules that moment{' '}
                          <strong>N minutes after</strong> the deposit instead — remove on production. Cron{' '}
                          <code className="rounded bg-offwhite px-1">/api/transfer-balance-reminder-sweep</code> is scheduled{' '}
                          <strong>once daily</strong> on Vercel Hobby (see <code className="rounded bg-offwhite px-1">vercel.json</code>).
                          Use <strong>Send due balance reminders now</strong> anytime, or upgrade to Pro for frequent cron.
                        </p>
                        <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-sm text-forest-800">
                          <input
                            checked={workspaceTransferSendCustomerEmails}
                            className="mt-1 h-4 w-4 shrink-0 rounded border-forest-300 text-fairway-700 focus:ring-fairway-500"
                            id="ws-transfer-send-customer-emails"
                            onChange={(e) => setWorkspaceTransferSendCustomerEmails(e.target.checked)}
                            type="checkbox"
                          />
                          <span>
                            <span className="font-medium">Send customer thank-you email</span> when you change payment to deposit or
                            paid in full. Uncheck to update status only (no email); balance reminder scheduling still applies after a
                            deposit.
                          </span>
                        </label>
                        {workspaceTransferPayMsg ? (
                          <p className="mt-2 text-sm font-medium text-fairway-900" role="status">
                            {workspaceTransferPayMsg}
                          </p>
                        ) : null}
                        <ul className="mt-3 space-y-4 text-sm text-forest-900">
                          {workspaceCostaMapBookings.map((b) => {
                            const paySt = (b.payment_status ?? 'unpaid').toLowerCase()
                            const pct = typeof b.deposit_percent === 'number' ? b.deposit_percent : 20
                            const busy = workspaceTransferPayBusyId === b.id
                            return (
                              <li
                                className="rounded-xl border border-forest-100 bg-offwhite/80 px-3 py-3 sm:px-4"
                                key={b.id}
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-medium text-forest-800">
                                    {b.pickup_label} → {b.dropoff_label}
                                  </span>
                                  <TransferPaymentStatusBadge
                                    deposit_percent={b.deposit_percent}
                                    payment_status={b.payment_status}
                                    size="sm"
                                  />
                                  <span className="text-forest-600">
                                    {b.status.replace(/_/g, ' ')}
                                    {b.scheduled_at
                                      ? ` · ${formatAdminDateTime(b.scheduled_at)}`
                                      : ' · Pick-up time not set (ASAP)'}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-ge-gray500">
                                  {b.booking_source === 'website_enquiry' ? 'Website enquiry mirror' : 'Client dashboard'} ·{' '}
                                  {(b.client_email ?? '').trim() || '—'}
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  {b.balance_remind_at && paySt === 'deposit' ? (
                                    <span className="text-xs text-forest-600">
                                      Balance reminder due {formatAdminDateTime(b.balance_remind_at)}
                                      {b.balance_remind_sent_at
                                        ? ` · Sent ${formatAdminDateTime(b.balance_remind_sent_at)}`
                                        : ' · Not sent yet'}
                                    </span>
                                  ) : null}
                                </div>
                                {typeof b.admin_price_eur === 'number' && Number.isFinite(b.admin_price_eur) ? (
                                  <p className="mt-2 text-xs font-semibold text-fairway-900">
                                    <span className="text-forest-600">Quoted (admin):</span> {formatEur(b.admin_price_eur)}
                                    {(b.admin_price_vat_treatment ?? '').trim() === 'services' ? (
                                      <span className="text-forest-600"> · VAT services 23%</span>
                                    ) : (
                                      <span className="text-forest-600"> · VAT tourism 13.5%</span>
                                    )}
                                  </p>
                                ) : null}
                                {stripePaymentDashboardUrl(b.stripe_payment_intent_id) ||
                                stripeCheckoutSessionDashboardUrl(b.stripe_checkout_session_id) ? (
                                  <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold">
                                    {stripePaymentDashboardUrl(b.stripe_payment_intent_id) ? (
                                      <a
                                        className="text-fairway-900 underline decoration-fairway-600/60 underline-offset-2 hover:text-fairway-950"
                                        href={stripePaymentDashboardUrl(b.stripe_payment_intent_id) ?? '#'}
                                        rel="noreferrer"
                                        target="_blank"
                                      >
                                        Stripe payment / receipt
                                      </a>
                                    ) : null}
                                    {stripeCheckoutSessionDashboardUrl(b.stripe_checkout_session_id) ? (
                                      <a
                                        className="text-forest-700 underline decoration-forest-400/70 underline-offset-2 hover:text-forest-900"
                                        href={stripeCheckoutSessionDashboardUrl(b.stripe_checkout_session_id) ?? '#'}
                                        rel="noreferrer"
                                        target="_blank"
                                      >
                                        Checkout session
                                      </a>
                                    ) : null}
                                  </p>
                                ) : null}
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <LuxuryButton
                                    className="!px-3 !py-2 !text-xs"
                                    disabled={busy || paySt === 'unpaid'}
                                    onClick={() => void handleWorkspaceTransferPayment(b.id, 'unpaid')}
                                    type="button"
                                    variant="white"
                                  >
                                    Unpaid
                                  </LuxuryButton>
                                  <LuxuryButton
                                    className="!px-3 !py-2 !text-xs"
                                    disabled={busy || paySt === 'deposit'}
                                    onClick={() => void handleWorkspaceTransferPayment(b.id, 'deposit', 20)}
                                    type="button"
                                    variant="outline"
                                  >
                                    20% deposit received
                                  </LuxuryButton>
                                  <LuxuryButton
                                    className="!px-3 !py-2 !text-xs"
                                    disabled={busy || paySt === 'paid'}
                                    onClick={() => void handleWorkspaceTransferPayment(b.id, 'paid')}
                                    type="button"
                                    variant="primary"
                                  >
                                    Paid in full
                                  </LuxuryButton>
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-dashed border-forest-200 bg-offwhite/60 px-4 py-4 text-sm text-forest-700">
                        <p className="font-medium text-forest-900">No transfer jobs linked to this enquiry yet</p>
                        <p className="mt-2">
                          Rows show up when a booking uses enquiry reference{' '}
                          <span className="font-mono text-xs">{workspaceEnquiryRef}</span> (website transport mirror) or the same email as
                          this enquiry has a portal profile with map/dashboard transfer requests.
                        </p>
                        <div className="mt-3">
                          <LuxuryButton
                            className="!px-3 !py-2 !text-xs"
                            onClick={() =>
                              document
                                .getElementById('admin-transfer-pipeline')
                                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            }
                            type="button"
                            variant="outline"
                          >
                            Open Operations · Costa transfers
                          </LuxuryButton>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {workspaceClientTransferSnap || workspaceCostaMapBookings.length > 0 ? (
                  <div className="rounded-2xl border border-fairway-200 bg-gradient-to-br from-fairway-50/80 to-white p-4 shadow-sm md:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fairway-800">
                          Client transfers (portal + map)
                        </p>
                        <p className="mt-1 text-sm text-forest-700">
                          Saved trip legs from the client dashboard, map-based transfer requests for this enquiry email, and
                          original enquiry fields when available.
                          {workspaceClientTransferSnap?.buildUpdatedAt ? (
                            <>
                              {' '}
                              · Package updated {formatAdminDateTime(workspaceClientTransferSnap.buildUpdatedAt)}
                            </>
                          ) : null}
                        </p>
                      </div>
                      <LuxuryButton
                        className="!px-4 !py-2 !text-xs"
                        onClick={() =>
                          document
                            .getElementById('admin-transfer-pipeline')
                            ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }
                        type="button"
                        variant="outline"
                      >
                        Assign driver (operations)
                      </LuxuryButton>
                    </div>

                    {workspaceClientTransferSnap ? (
                      <>
                        {workspaceClientTransferSnap.originalTransferRows.length > 0 ? (
                          <div className="mt-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-600">Original form</p>
                            <ul className="mt-2 space-y-1.5 text-sm text-forest-900">
                              {workspaceClientTransferSnap.originalTransferRows.map((r) => (
                                <li key={`${r.label}:${r.value}`}>
                                  <span className="font-medium text-forest-800">{r.label}:</span> {r.value}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        {workspaceClientTransferSnap.portalPlan &&
                        ((workspaceClientTransferSnap.portalPlan.golfLegs.some((l) => l.courseId.trim()) ||
                          workspaceClientTransferSnap.portalPlan.hotelLegs.some((l) => l.hotelName.trim()))) ? (
                          <div className="mt-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-600">
                              Portal · golf & hotel legs
                            </p>
                            <ul className="mt-2 space-y-2 text-sm text-forest-900">
                              {workspaceClientTransferSnap.portalPlan.golfLegs
                                .filter((l) => l.courseId.trim())
                                .map((l) => {
                                  const name = COURSES.find((c) => c.id === l.courseId)?.name ?? l.courseId
                                  const pt = (l.pickupAtLocal ?? '').trim()
                                  return (
                                    <li key={`golf-${l.courseId}-${l.notes}-${pt}`}>
                                      <span className="font-medium text-forest-800">Golf · {name}</span>
                                      {l.notes.trim() ? <span className="text-forest-600"> — {l.notes.trim()}</span> : null}
                                      {pt ? (
                                        <span className="text-forest-600"> · Pick-up {pt.replace('T', ' ')}</span>
                                      ) : null}
                                    </li>
                                  )
                                })}
                              {workspaceClientTransferSnap.portalPlan.hotelLegs
                                .filter((l) => l.hotelName.trim())
                                .map((l) => {
                                  const pt = (l.pickupAtLocal ?? '').trim()
                                  return (
                                    <li key={`hotel-${l.hotelName}-${l.notes}-${pt}`}>
                                      <span className="font-medium text-forest-800">Hotel · {l.hotelName.trim()}</span>
                                      {l.notes.trim() ? <span className="text-forest-600"> — {l.notes.trim()}</span> : null}
                                      {pt ? (
                                        <span className="text-forest-600"> · Pick-up {pt.replace('T', ' ')}</span>
                                      ) : null}
                                    </li>
                                  )
                                })}
                            </ul>
                          </div>
                        ) : null}

                        <div className="mt-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-600">
                            Route order (portal)
                          </p>
                          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-forest-900">
                            {normalizeTransferStops(workspaceClientTransferSnap.hydratedDraft.transferStops).map((stop, i) => {
                              const label =
                                stop.kind === 'malaga_airport' || stop.ref === 'agp'
                                  ? 'Málaga Airport (AGP)'
                                  : stop.kind === 'golf_course'
                                    ? COURSES.find((c) => c.id === stop.ref)?.name ?? stop.ref
                                    : corridorHotelBySlug(stop.ref)?.name ?? stop.ref
                              const pt = (stop.pickupAtLocal ?? '').trim()
                              return (
                                <li key={`${stop.kind}-${stop.ref}-${i}`}>
                                  {stop.kind.replace(/_/g, ' ')} → {label}
                                  {pt ? <span className="text-forest-600"> · pick-up {pt.replace('T', ' ')}</span> : null}
                                </li>
                              )
                            })}
                          </ol>
                        </div>

                        {(workspaceClientTransferSnap.hydratedDraft.transferContactPhone ?? '').trim() ? (
                          <p className="mt-4 text-sm text-forest-800">
                            <span className="font-semibold">Transfer contact:</span>{' '}
                            {workspaceClientTransferSnap.hydratedDraft.transferContactPhone?.trim()}
                          </p>
                        ) : null}
                      </>
                    ) : workspaceCostaMapBookings.length > 0 ? (
                      <p className="mt-4 text-sm text-forest-600">
                        This enquiry email has map transfer requests. When the client saves <strong>Trip details</strong> for
                        their linked package, corridor route legs and pick-up times from the trip planner appear here too.
                      </p>
                    ) : null}

                    {workspaceTransferPreviewSrcDoc ? (
                      <div className="mt-5 overflow-hidden rounded-xl border border-forest-200 bg-white shadow-inner">
                        <p className="border-b border-forest-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-forest-600">
                          Transfer legs preview
                        </p>
                        <iframe
                          className="h-[min(52vh,560px)] w-full bg-white"
                          srcDoc={workspaceTransferPreviewSrcDoc}
                          title="Client transfer legs preview"
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {workspaceEnquiryRef ? (
                  <div className="rounded-2xl border border-forest-200 bg-white p-4 shadow-sm md:p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">
                      Linked package · update pricing for this enquiry
                    </p>
                    {workspaceLinkedWebsiteFormBuild ? (
                      <>
                        <p className="mt-1 text-sm text-forest-600">
                          Saves VAT-inclusive totals to the client&apos;s website-form package and emails the same branded
                          quote PDF as the package detail tool (portal legs and pick-up times are preserved).
                        </p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className={adminTripLabelClass} htmlFor="ws-pkg-quote-gross">
                              Group total (EUR, VAT inc.)
                            </label>
                            <input
                              className={adminTripInputClass}
                              id="ws-pkg-quote-gross"
                              inputMode="decimal"
                              onChange={(e) => setWorkspacePkgQuoteGross(e.target.value)}
                              placeholder="e.g. 8450"
                              value={workspacePkgQuoteGross}
                            />
                          </div>
                          <div>
                            <label className={adminTripLabelClass} htmlFor="ws-pkg-quote-vat">
                              VAT rate
                            </label>
                            <select
                              className={adminTripInputClass}
                              id="ws-pkg-quote-vat"
                              onChange={(e) => setWorkspacePkgQuoteVat(Number(e.target.value))}
                              value={workspacePkgQuoteVat}
                            >
                              <option value={IRISH_VAT_STANDARD_RATE}>Standard ({Math.round(IRISH_VAT_STANDARD_RATE * 100)}%)</option>
                              <option value={IRISH_VAT_REDUCED_TOURISM_RATE}>
                                Tourism ({Math.round(IRISH_VAT_REDUCED_TOURISM_RATE * 1000) / 10}%)
                              </option>
                            </select>
                          </div>
                        </div>
                        {workspacePkgQuotePreview ? (
                          <div className="mt-3 rounded-xl border border-forest-100 bg-offwhite/80 px-3 py-2 text-xs text-forest-800">
                            <p>
                              Net services {formatEur(workspacePkgQuotePreview.netServicesEur)} · VAT{' '}
                              {formatEur(workspacePkgQuotePreview.vatAmountEur)} ·{' '}
                              <span className="font-semibold">Total {formatEur(workspacePkgQuotePreview.grossTotalEur)}</span>
                            </p>
                            <p className="mt-1">
                              Deposit 20% {formatEur(workspacePkgQuotePreview.deposit20Eur)} · Balance{' '}
                              {formatEur(workspacePkgQuotePreview.balance80Eur)}
                            </p>
                          </div>
                        ) : null}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <LuxuryButton
                            disabled={workspacePkgQuoteBusy || !workspacePkgQuotePreview}
                            onClick={() => void handleWorkspaceSavePackageQuote()}
                            type="button"
                            variant="primary"
                          >
                            {workspacePkgQuoteBusy ? 'Saving…' : 'Save quote & email client'}
                          </LuxuryButton>
                        </div>
                        {workspacePkgQuoteMessage ? (
                          <p className="mt-3 text-sm font-medium text-fairway-900" role="status">
                            {workspacePkgQuoteMessage}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-forest-600">
                        No <code className="rounded bg-forest-900/10 px-1 text-xs">website_form</code> package row matches
                        this enquiry reference yet — create or link one from enquiries / client portal first.
                      </p>
                    )}
                  </div>
                ) : null}

                {workspaceCopyMessage ? (
                  <p className="text-sm font-medium text-fairway-800" role="status">
                    {workspaceCopyMessage}
                  </p>
                ) : null}

                {workspaceDraft ? (
                  <div className="grid gap-8 border-t border-forest-100 pt-8 lg:grid-cols-2">
                    <div className="space-y-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-700">Include in quote</p>
                      {(
                        [
                          ['transfer', 'Transfers (1–8 pax)'] as const,
                          ['golf', 'Golf rounds'] as const,
                          ['hotel', 'Hotel / base'] as const
                        ] satisfies readonly (readonly [TripStageKey, string])[]
                      ).map(([key, label]) => (
                        <label className="flex cursor-pointer items-center gap-3 text-sm text-forest-900" key={key}>
                          <input
                            checked={workspaceDraft.stages[key]}
                            className="h-4 w-4 rounded border-forest-300 text-fairway-600"
                            onChange={handleWorkspaceStageToggle(key)}
                            type="checkbox"
                          />
                          {label}
                        </label>
                      ))}
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600" htmlFor="ws-party">
                          Party size
                        </label>
                        <select
                          className={adminTripInputClass}
                          id="ws-party"
                          onChange={(e) =>
                            persistWorkspaceDraft({ ...workspaceDraft, partySize: Number(e.target.value) })
                          }
                          value={workspaceDraft.partySize}
                        >
                          {Array.from({ length: 8 }, (_, index) => index + 1).map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600" htmlFor="ws-courses">
                        Courses (multi-select)
                      </label>
                      <select
                        className={`${adminTripInputClass} h-48`}
                        id="ws-courses"
                        multiple
                        onChange={(e) =>
                          persistWorkspaceDraft({
                            ...workspaceDraft,
                            courseIds: Array.from(e.target.selectedOptions).map((o) => o.value)
                          })
                        }
                        value={[...workspaceDraft.courseIds]}
                      >
                        {COURSES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} — {c.region}
                          </option>
                        ))}
                      </select>
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600" htmlFor="ws-hotel">
                          Hotel notes
                        </label>
                        <textarea
                          className={adminTripInputClass}
                          id="ws-hotel"
                          onChange={(e) => persistWorkspaceDraft({ ...workspaceDraft, hotelNotes: e.target.value })}
                          placeholder="Star tier, board, resort vs town…"
                          rows={4}
                          value={workspaceDraft.hotelNotes}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                {workspaceDraft &&
                (workspaceDraft.stages.transfer || workspaceDraft.stages.golf || workspaceDraft.stages.hotel) ? (
                  <div className="rounded-2xl border border-forest-200 bg-white px-4 py-3 text-sm text-forest-800">
                    <p className="font-semibold text-forest-950">Illustrative range (EUR, not binding)</p>
                    <p className="mt-1">
                      {formatEur(illustrativeTripPriceRangeEur(workspaceDraft).low)} —{' '}
                      {formatEur(illustrativeTripPriceRangeEur(workspaceDraft).high)}
                    </p>
                  </div>
                ) : null}

                {workspaceDraft &&
                (workspaceDraft.stages.transfer || workspaceDraft.stages.golf || workspaceDraft.stages.hotel) ? (
                  <div className="space-y-4 rounded-2xl border border-forest-200 bg-white p-4 md:p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600">Trip length and admin total</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={adminTripLabelClass} htmlFor="ws-nights">
                          Nights (PDF + hotel email)
                        </label>
                        <input
                          className={adminTripInputClass}
                          id="ws-nights"
                          min={1}
                          max={90}
                          onChange={(e) => setWorkspaceTripNights(Math.min(90, Math.max(1, Number(e.target.value) || 1)))}
                          type="number"
                          value={workspaceTripNights}
                        />
                      </div>
                      <div>
                        <label className={adminTripLabelClass} htmlFor="ws-trip-shape-custom">
                          Trip shape line (optional PDF)
                        </label>
                        <input
                          className={adminTripInputClass}
                          id="ws-trip-shape-custom"
                          onChange={(e) => setWorkspaceTripShapeCustom(e.target.value)}
                          placeholder="e.g. 4 nights / 3 rounds"
                          value={workspaceTripShapeCustom}
                        />
                        <p className="mt-1 text-xs text-forest-600">
                          Overrides the auto “nights / rounds” line on the client proposal PDF when set.
                        </p>
                      </div>
                      <div className="flex flex-col justify-end gap-3 sm:col-span-2">
                        <label className="flex cursor-pointer items-center gap-3 text-sm text-forest-900">
                          <input
                            checked={workspaceUseManualTotal}
                            className="h-4 w-4 rounded border-forest-300 text-fairway-600"
                            onChange={(e) => setWorkspaceUseManualTotal(e.target.checked)}
                            type="checkbox"
                          />
                          Use manual group total (EUR) for PDF and client email
                        </label>
                        <input
                          aria-label="Manual group total EUR"
                          className={adminTripInputClass}
                          disabled={!workspaceUseManualTotal}
                          inputMode="decimal"
                          onChange={(e) => setWorkspaceManualTotalInput(e.target.value)}
                          placeholder="e.g. 12400"
                          value={workspaceManualTotalInput}
                        />
                      </div>
                    </div>
                    {workspaceUseManualTotal && resolveWorkspaceManualTotal() ? (
                      <div className="rounded-xl border border-dashed border-fairway-300 bg-fairway-50/40 px-3 py-2 text-xs text-forest-800">
                        <p className="font-semibold text-forest-950">Split preview (proportional to transfer / golf / hotel weights)</p>
                        {(() => {
                          const m = resolveWorkspaceManualTotal()
                          const a = m ? computeManualGroupPriceAllocation(workspaceDraft, m) : null
                          if (!a) {
                            return <p className="mt-1">Enter a positive number to see per-leg group totals.</p>
                          }
                          return (
                            <ul className="mt-2 list-inside list-disc space-y-0.5">
                              {workspaceDraft.stages.transfer ? (
                                <li>
                                  Transfers (group): {formatEur(a.transferGroup)} — ~{formatEur(Math.round(a.transferGroup / workspaceDraft.partySize))}{' '}
                                  per person within leg
                                </li>
                              ) : null}
                              {workspaceDraft.stages.golf ? (
                                <li>
                                  Golf (group): {formatEur(a.golfGroup)} — ~{formatEur(Math.round(a.golfGroup / workspaceDraft.partySize))} per person within leg
                                </li>
                              ) : null}
                              {workspaceDraft.stages.hotel ? (
                                <li>
                                  Hotel (group): {formatEur(a.hotelGroup)} — ~{formatEur(Math.round(a.hotelGroup / workspaceDraft.partySize))} per person within leg
                                </li>
                              ) : null}
                              <li>Even split across whole party: ~{formatEur(a.perPerson)} per person (group ÷ party size)</li>
                            </ul>
                          )
                        })()}
                      </div>
                    ) : null}

                    <div className="border-t border-forest-100 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600">Email actions</p>
                      <div className="mt-3 grid gap-4 lg:grid-cols-2">
                        <div className="space-y-2">
                          <label className={adminTripLabelClass} htmlFor="ws-client-email">
                            Client email
                          </label>
                          <input
                            className={adminTripInputClass}
                            id="ws-client-email"
                            onChange={(e) => setWorkspaceClientEmail(e.target.value)}
                            type="email"
                            value={workspaceClientEmail}
                          />
                          <LuxuryButton
                            disabled={
                              workspaceEmailBusy !== 'idle' ||
                              !(workspaceDraft.stages.transfer || workspaceDraft.stages.golf || workspaceDraft.stages.hotel)
                            }
                            onClick={() => void handleEmailWorkspaceProposal()}
                            type="button"
                            variant="outline"
                          >
                            {workspaceEmailBusy === 'client' ? 'Sending…' : 'Email proposal to client'}
                          </LuxuryButton>
                          <p className="text-xs text-forest-600">Branded message with PDF attachment. Does not require a dashboard account.</p>
                        </div>
                        <div className="space-y-2">
                          <label className={adminTripLabelClass} htmlFor="ws-hotel-email">
                            Hotel reservations email
                          </label>
                          <input
                            className={adminTripInputClass}
                            id="ws-hotel-email"
                            onChange={(e) => setWorkspaceHotelEmail(e.target.value)}
                            placeholder="reservations@hotel.example"
                            type="email"
                            value={workspaceHotelEmail}
                          />
                          <label className={adminTripLabelClass} htmlFor="ws-hotel-notes">
                            Optional preferences for hotel (no guest names)
                          </label>
                          <textarea
                            className={adminTripInputClass}
                            id="ws-hotel-notes"
                            onChange={(e) => setWorkspaceHotelNotes(e.target.value)}
                            placeholder="Board basis, twin vs double, quiet wing — never paste guest name, email, or phone here."
                            rows={3}
                            value={workspaceHotelNotes}
                          />
                          <LuxuryButton
                            disabled={workspaceEmailBusy !== 'idle'}
                            onClick={() => void handleEmailHotelBrief()}
                            type="button"
                            variant="outline"
                          >
                            {workspaceEmailBusy === 'hotel' ? 'Sending…' : 'Email hotel (booking ref only)'}
                          </LuxuryButton>
                          <p className="text-xs text-forest-600">
                            Sends branded partner request with enquiry reference, party size, and nights only — no guest PII.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {workspaceEmailMessage ? (
                  <p className="text-sm font-medium text-fairway-900" role="status">
                    {workspaceEmailMessage}
                  </p>
                ) : null}

                {workspaceDraft ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <LuxuryButton
                      disabled={
                        workspacePdfLoading ||
                        !(workspaceDraft.stages.transfer || workspaceDraft.stages.golf || workspaceDraft.stages.hotel)
                      }
                      onClick={() => void handlePreviewWorkspaceProposalPdf()}
                      type="button"
                      variant="primary"
                    >
                      {workspacePdfLoading ? 'Building PDF…' : 'Preview proposal PDF'}
                    </LuxuryButton>
                    <LuxuryButton onClick={() => void handleCopyWorkspaceJson()} type="button" variant="outline">
                      Copy proposal draft JSON
                    </LuxuryButton>
                    {workspacePdfUrl ? (
                      <LuxuryButton onClick={revokeWorkspacePdfObjectUrl} type="button" variant="outline">
                        Close PDF preview
                      </LuxuryButton>
                    ) : null}
                  </div>
                ) : null}

                {workspacePdfError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-900" role="alert">
                    {workspacePdfError}
                  </div>
                ) : null}

                {workspacePdfUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-forest-200 bg-forest-950/5 shadow-inner">
                    <p className="border-b border-forest-100 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-forest-600">
                      Proposal PDF preview (same layout as client proposals)
                    </p>
                    <iframe
                      className="h-[min(78vh,920px)] w-full bg-neutral-800"
                      src={workspacePdfUrl}
                      title="Proposal PDF preview"
                    />
                  </div>
                ) : null}
              </div>
            )}
          </section>
            </>
          ) : null}
        </AdminPortalSection>

        <AdminPortalSection activeSection={activeAdminSection} section="emails">
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">CRM — client PDFs</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950 md:text-3xl">Terms and thank-you documents</h2>

            <div className="mt-6 rounded-[2rem] border border-forest-100 bg-white p-6 shadow-soft md:p-8">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600" htmlFor="crm-doc-email">
                Client account email
              </label>
              <input
                autoComplete="email"
                className="mb-6 w-full max-w-md rounded-2xl border border-forest-200 bg-white px-4 py-3 text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
                id="crm-doc-email"
                onChange={(e) => {
                  setCrmDocEmail(e.target.value)
                  setCrmDocMessage(null)
                }}
                placeholder="client@example.com"
                type="email"
                value={crmDocEmail}
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  aria-label="Send terms and conditions to client email"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-forest-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-800 disabled:opacity-60"
                  disabled={crmDocSending !== 'idle'}
                  onClick={() => handleSendCrmDocument('terms')}
                  type="button"
                >
                  {crmDocSending === 'terms' ? 'Sending…' : 'Email terms PDF access'}
                </button>
                <button
                  aria-label="Send thank you document to client email"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-[#136047] bg-white px-6 py-3 text-sm font-semibold text-[#b34701] transition-colors hover:bg-[#136047]/10 disabled:opacity-60"
                  disabled={crmDocSending !== 'idle'}
                  onClick={() => handleSendCrmDocument('welcome')}
                  type="button"
                >
                  {crmDocSending === 'welcome' ? 'Sending…' : 'Email thank-you PDF access'}
                </button>
              </div>

              {crmDocMessage ? (
                <p className="mt-4 text-sm font-medium text-forest-800" role="status">
                  {crmDocMessage}
                </p>
              ) : null}
            </div>
          </section>
        </AdminPortalSection>

        <AdminPortalSection activeSection={activeAdminSection} section="portal">
          <section>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Manual clients</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950 md:text-3xl">Add or remove portal logins</h2>
            <p className="mt-2 max-w-2xl text-sm text-forest-600">
              Create a dashboard login with only name and email. An account number (same format as enquiry references) is assigned automatically. The client can add or update their mobile number after they sign in. Removing an enquiry from “Recent form submissions” does{' '}
              <strong className="font-medium text-forest-800">not</strong> delete a portal account — use remove below only when you intend to wipe that login entirely.
            </p>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-forest-100 bg-white p-6 shadow-soft md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">Add client</p>
                <label className="mb-2 mt-4 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600" htmlFor="manual-portal-full-name">
                  Full name
                </label>
                <input
                  autoComplete="name"
                  className="mb-4 w-full rounded-2xl border border-forest-200 bg-white px-4 py-3 text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
                  id="manual-portal-full-name"
                  onChange={(e) => setManualPortalCreateName(e.target.value)}
                  placeholder="Karen Harte"
                  type="text"
                  value={manualPortalCreateName}
                />
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600" htmlFor="manual-portal-email">
                  Email (sign-in)
                </label>
                <input
                  autoComplete="email"
                  className="mb-4 w-full rounded-2xl border border-forest-200 bg-white px-4 py-3 text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
                  id="manual-portal-email"
                  onChange={(e) => setManualPortalCreateEmail(e.target.value)}
                  placeholder="client@example.com"
                  type="email"
                  value={manualPortalCreateEmail}
                />
                <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-forest-100 bg-offwhite/80 px-4 py-3">
                  <input
                    checked={manualPortalCreateSendLink}
                    className="mt-1 h-4 w-4 rounded border-forest-300 text-fairway-600 focus:ring-fairway-400"
                    onChange={(e) => setManualPortalCreateSendLink(e.target.checked)}
                    type="checkbox"
                  />
                  <span className="text-sm text-forest-800">
                    <span className="font-semibold text-forest-950">Email magic sign-in link</span>
                    <span className="mt-1 block text-xs text-forest-600">Uses the same branded mail as the public login flow (needs Resend + SITE_URL on the server).</span>
                  </span>
                </label>
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-forest-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-800 disabled:opacity-60"
                  disabled={manualPortalCreateBusy}
                  onClick={() => void handleCreateManualPortalClient()}
                  type="button"
                >
                  {manualPortalCreateBusy ? 'Creating…' : 'Create client account'}
                </button>
              </div>

              <div className="rounded-[2rem] border border-forest-100 bg-white p-6 shadow-soft md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-800">Remove client</p>
                <p className="mt-2 text-sm text-forest-600">
                  Deletes the Supabase auth user and cascades their profile, package builds, and portal inbox rows. Does not remove enquiry history rows.
                </p>
                <label className="mb-2 mt-4 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600" htmlFor="manual-portal-delete-email">
                  Client login email
                </label>
                <input
                  autoComplete="email"
                  className="mb-4 w-full rounded-2xl border border-forest-200 bg-white px-4 py-3 text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
                  id="manual-portal-delete-email"
                  onChange={(e) => setManualPortalDeleteEmail(e.target.value)}
                  placeholder="client@example.com"
                  type="email"
                  value={manualPortalDeleteEmail}
                />
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-red-200 bg-white px-6 py-3 text-sm font-semibold text-red-800 transition-colors hover:bg-red-50 disabled:opacity-60"
                  disabled={manualPortalDeleteBusy}
                  onClick={() => void handleDeleteManualPortalClient()}
                  type="button"
                >
                  {manualPortalDeleteBusy ? 'Removing…' : 'Remove client account'}
                </button>
              </div>
            </div>

            {manualPortalCreateMessage ? (
              <p className="mt-4 text-sm font-medium text-forest-800" role="status">
                {manualPortalCreateMessage}
              </p>
            ) : null}
          </section>

          <section className="scroll-mt-28" id="admin-hub-portal">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Client portal</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950 md:text-3xl">Account number &amp; document area</h2>
            <p className="mt-2 max-w-2xl text-sm text-forest-600">
              Set the account number clients see after login. Use <strong className="font-medium text-forest-800">Formal proposals</strong> and{' '}
              <strong className="font-medium text-forest-800">PDF library</strong> independently — load by their login email, adjust the ticks, then save.
            </p>

            <div className="mt-6 rounded-[2rem] border border-forest-100 bg-white p-6 shadow-soft md:p-8">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600" htmlFor="portal-client-email">
                Client login email
              </label>
              <input
                autoComplete="email"
                className="mb-4 w-full max-w-md rounded-2xl border border-forest-200 bg-white px-4 py-3 text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
                id="portal-client-email"
                onChange={(e) => {
                  setPortalClientEmail(e.target.value)
                  setPortalSettingsMessage(null)
                }}
                placeholder="client@example.com"
                type="email"
                value={portalClientEmail}
              />

              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600" htmlFor="portal-account-ref">
                Account number (enquiry reference)
              </label>
              <input
                className="mb-4 w-full max-w-md rounded-2xl border border-forest-200 bg-white px-4 py-3 font-mono text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
                id="portal-account-ref"
                onChange={(e) => {
                  setPortalAccountRef(e.target.value)
                  setPortalSettingsMessage(null)
                }}
                placeholder="e.g. GSI-AB12CD"
                type="text"
                value={portalAccountRef}
              />

              <label className="flex max-w-md cursor-pointer items-start gap-3 rounded-2xl border border-forest-100 bg-offwhite/80 px-4 py-3">
                <input
                  checked={portalProposalsEnabled}
                  className="mt-1 h-4 w-4 rounded border-forest-300 text-fairway-600 focus:ring-fairway-400"
                  onChange={(e) => setPortalProposalsEnabled(e.target.checked)}
                  type="checkbox"
                />
                <span>
                  <span className="block text-sm font-semibold text-forest-900">Show formal proposals on client dashboard</span>
                  <span className="mt-1 block text-xs text-forest-600">
                    Lists proposal PDFs we have saved for this login. Off by default.
                  </span>
                </span>
              </label>

              <label className="mt-3 flex max-w-md cursor-pointer items-start gap-3 rounded-2xl border border-forest-100 bg-offwhite/80 px-4 py-3">
                <input
                  checked={portalPdfLibraryEnabled}
                  className="mt-1 h-4 w-4 rounded border-forest-300 text-fairway-600 focus:ring-fairway-400"
                  onChange={(e) => setPortalPdfLibraryEnabled(e.target.checked)}
                  type="checkbox"
                />
                <span>
                  <span className="block text-sm font-semibold text-forest-900">Show PDF library (terms &amp; thank-you) on client dashboard</span>
                  <span className="mt-1 block text-xs text-forest-600">
                    When on, the “Your PDF library” block appears if they already have access from the document tools above.
                  </span>
                </span>
              </label>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-forest-200 bg-white px-6 py-3 text-sm font-semibold text-forest-900 transition-colors hover:border-fairway-400 disabled:opacity-60"
                  disabled={portalSettingsBusy !== 'idle'}
                  onClick={() => void handleLoadPortalProfile()}
                  type="button"
                >
                  {portalSettingsBusy === 'load' ? 'Loading…' : 'Load current'}
                </button>
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-forest-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-800 disabled:opacity-60"
                  disabled={portalSettingsBusy !== 'idle'}
                  onClick={() => void handleSavePortalProfile()}
                  type="button"
                >
                  {portalSettingsBusy === 'save' ? 'Saving…' : 'Save to client account'}
                </button>
              </div>

              {portalSettingsMessage ? (
                <p className="mt-4 text-sm font-medium text-forest-800" role="status">
                  {portalSettingsMessage}
                </p>
              ) : null}
            </div>

            <div className="mt-8 rounded-[2rem] border border-forest-200 bg-offwhite/80 p-5 text-sm text-forest-700 shadow-inner md:p-6">
              <p className="font-semibold text-forest-900">Client access &amp; portal reset</p>
              <p className="mt-2 max-w-xl">
                Clear dashboard, copy signed login links, and block or unblock sign-in / enquiries for an address — moved to the{' '}
                <strong className="font-medium text-forest-900">bottom of this admin page</strong> so day-to-day enquiries and packages stay up top.
              </p>
            </div>

            <div className="mt-8 rounded-[2rem] border border-dashed border-forest-200 bg-offwhite/60 p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">Testing — reset one-time portal contact</p>
              <p className="mt-2 text-sm text-forest-600">
                Clears name, phone, account number, and the “contact saved” flag for this login email so the client (or your own
                admin test account) sees the one-time contact form again. Does not remove admin role or delete the auth user.
              </p>
              <label className="mb-2 mt-4 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600" htmlFor="portal-onboarding-reset-email">
                Login email
              </label>
              <input
                autoComplete="email"
                className="mb-4 w-full max-w-md rounded-2xl border border-forest-200 bg-white px-4 py-3 text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
                id="portal-onboarding-reset-email"
                onChange={(e) => {
                  setPortalOnboardingResetEmail(e.target.value)
                  setPortalOnboardingResetMsg(null)
                }}
                placeholder="e.g. golfsolirl@gmail.com"
                type="email"
                value={portalOnboardingResetEmail}
              />
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-forest-200 bg-white px-6 py-3 text-sm font-semibold text-forest-900 transition-colors hover:border-fairway-400 disabled:opacity-60"
                disabled={portalOnboardingResetBusy}
                onClick={() => void handleResetPortalOnboarding()}
                type="button"
              >
                {portalOnboardingResetBusy ? 'Resetting…' : 'Reset portal onboarding'}
              </button>
              {portalOnboardingResetMsg ? (
                <p className="mt-3 text-sm font-medium text-forest-800" role="status">
                  {portalOnboardingResetMsg}
                </p>
              ) : null}
            </div>
          </section>
        </AdminPortalSection>

        <AdminPortalSection activeSection={activeAdminSection} section="drivers">
          <section className="mb-14 md:mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Driver calendar</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950 md:text-3xl">Booked days &amp; printable runs</h2>
            <p className="mt-2 max-w-2xl text-sm text-forest-600">
              Add a row for each day that is <strong className="font-medium text-forest-800">fully booked</strong>. You do not need a real
              booking in other tables — use <strong className="font-medium text-forest-800">Block transfers on website</strong> on a selected
              day when you are at capacity. Public forms show a &quot;fully booked&quot; notice before submit and refuse those dates. Click a
              date for details and <strong className="font-medium text-forest-800">Print day sheet</strong> when you have passenger info.
            </p>
            <div className="mt-6">
              <AdminDriverCalendarPanel />
            </div>
          </section>
        </AdminPortalSection>

        <AdminPortalSection activeSection={activeAdminSection} section="emails">
          <section className="mb-14 md:mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Studio → client email</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950 md:text-3xl">Branded send + PDFs</h2>
            <p className="mt-2 max-w-2xl text-sm text-forest-600">
              Same visual family as enquiry and proposal mail — optional PDF attachments (quotes, hotel PDFs, etc.). Sends with
              Resend and logs a row on the client dashboard under <strong className="font-medium text-forest-800">Messages &amp; files</strong> so
              you both share one timeline.
            </p>

            <form
              className="mt-8 max-w-2xl space-y-5 rounded-[2rem] border border-forest-100 bg-white p-6 shadow-soft md:p-8"
              noValidate
              onSubmit={(e) => void handleSendStudioClientEmail(e)}
            >
              <div>
                <label className={adminTripLabelClass} htmlFor="studio-email-to">
                  Client login email
                </label>
                <input
                  autoComplete="email"
                  className={adminTripInputClass}
                  id="studio-email-to"
                  onChange={(e) => {
                    setStudioEmailTo(e.target.value)
                    setStudioEmailMessage(null)
                  }}
                  placeholder="client@email.com"
                  type="email"
                  value={studioEmailTo}
                />
              </div>

              <div>
                <label className={adminTripLabelClass} htmlFor="studio-email-subject">
                  Subject
                </label>
                <input
                  className={adminTripInputClass}
                  id="studio-email-subject"
                  onChange={(e) => {
                    setStudioEmailSubject(e.target.value)
                    setStudioEmailMessage(null)
                  }}
                  placeholder="e.g. Your Marbella transfer quote — PDF attached"
                  type="text"
                  value={studioEmailSubject}
                />
              </div>

              <div>
                <label className={adminTripLabelClass} htmlFor="studio-email-body">
                  Message
                </label>
                <textarea
                  className={cx(adminTripInputClass, 'min-h-[160px] resize-y')}
                  id="studio-email-body"
                  onChange={(e) => {
                    setStudioEmailBody(e.target.value)
                    setStudioEmailMessage(null)
                  }}
                  placeholder="Write in paragraphs. Blank lines become separate paragraphs in the email."
                  value={studioEmailBody}
                />
              </div>

              <div>
                <label className={adminTripLabelClass} htmlFor="studio-email-files">
                  PDF attachments (optional, max 4 × 4 MB)
                </label>
                <input
                  accept="application/pdf,.pdf"
                  className="mt-2 block w-full text-sm text-forest-800 file:mr-4 file:rounded-full file:border-0 file:bg-forest-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-forest-800"
                  id="studio-email-files"
                  multiple
                  ref={studioAttachmentsRef}
                  type="file"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <LuxuryButton disabled={studioEmailBusy} type="submit" variant="primary">
                  {studioEmailBusy ? 'Sending…' : 'Send email + log to client dashboard'}
                </LuxuryButton>
              </div>

              {studioEmailMessage ? (
                <p className="text-sm font-medium text-forest-800" role="status">
                  {studioEmailMessage}
                </p>
              ) : null}
            </form>
          </section>
        </AdminPortalSection>

        <AdminPortalSection activeSection={activeAdminSection} section="packages">
          <section className="scroll-mt-28" id="admin-hub-packages">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Client package builds</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950 md:text-3xl">All saved &amp; published packages</h2>
            <p className="mt-2 max-w-2xl text-sm text-forest-600">
              Calculator saves, website form captures (signed-in email), and manual lines you publish. Use View to open the trip
              form and adjust locked fields for the client. Use Remove to delete a row from the database — it disappears from this
              list and from the client dashboard packages.
            </p>

            {packageBuildDeleteMessage ? (
              <p
                className={cx(
                  'mt-4 text-sm font-medium',
                  packageBuildDeleteMessage.startsWith('Removed') ? 'text-fairway-900' : 'text-red-800'
                )}
                role="status"
              >
                {packageBuildDeleteMessage}
              </p>
            ) : null}

            {buildsLoadError ? (
              <div className="mt-6 rounded-3xl border border-chrome-200/90 bg-chrome-50/90 px-6 py-4 text-sm text-brand-950 shadow-soft">
                <p className="font-medium">Package builds could not be loaded.</p>
                <p className="mt-2 text-brand-900/85">{buildsLoadError}</p>
                <p className="mt-2 text-xs text-brand-900/70">
                  If the error mentions <code className="rounded bg-white/80 px-1">client_details</code>, run{' '}
                  <code className="rounded bg-white/80 px-1">supabase/run-in-sql-editor-add-client-details.sql</code> in Supabase
                  SQL. Otherwise check the <code className="rounded bg-white/80 px-1">package_builds</code> migration and the{' '}
                  <code className="rounded bg-white/80 px-1">profiles</code> join if PostgREST reports ambiguity.
                </p>
              </div>
            ) : packageBuilds.length === 0 ? (
              <div className="mt-6 rounded-[2rem] border border-dashed border-forest-200 bg-offwhite px-6 py-10 text-center text-sm text-forest-900 md:px-10">
                No client-saved package builds yet.
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-[2rem] border border-forest-100 bg-white shadow-soft">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="bg-forest-950 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">When</th>
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">Customer</th>
                      <th className="px-4 py-4 md:px-6">Build</th>
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">Source</th>
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">Trip form</th>
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">Group total</th>
                      <th className="whitespace-nowrap px-4 py-4 md:px-6">Details</th>
                      <th className="whitespace-nowrap px-4 py-4 text-right md:px-6">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-100">
                    {packageBuilds.map((row, index) => {
                      const prof = profileFromRow(row)
                      const cfg = parseAnyPackageBuildRowConfig(row.config)
                      const total =
                        cfg?.type === 'calculator' ? cfg.config.totals.estimatedGroupTotal : cfg?.type === 'manual' ? cfg.config.priceEur : undefined

                      return (
                        <tr
                          className={cx('text-forest-900', index % 2 === 1 ? 'bg-offwhite/90' : 'bg-white')}
                          key={row.id}
                        >
                          <td className="whitespace-nowrap px-4 py-4 text-xs text-ge-gray500 md:px-6">
                            {formatAdminDateTime(row.created_at)}
                          </td>
                          <td className="px-4 py-4 md:px-6">
                            <p className="font-medium text-forest-900">{prof?.full_name?.trim() || '—'}</p>
                            {prof?.email ? (
                              <a
                                className="text-xs font-medium text-brand-600 underline-offset-2 hover:text-brand-700 hover:underline"
                                href={`mailto:${prof.email}`}
                              >
                                {prof.email}
                              </a>
                            ) : (
                              <p className="mt-1 font-mono text-[11px] text-ge-gray500">{row.owner_id.slice(0, 8)}…</p>
                            )}
                          </td>
                          <td className="max-w-xs px-4 py-4 md:max-w-md md:px-6">
                            <p className="font-medium text-forest-900">{row.label ?? 'Package build'}</p>
                            {cfg?.type === 'calculator' ? (
                              <p className="mt-1 text-xs text-forest-600">
                                {cfg.config.packageStyle} · {cfg.config.groupSize} pax · {cfg.config.nights}n /{' '}
                                {cfg.config.rounds} rounds
                              </p>
                            ) : cfg?.type === 'manual' ? (
                              <p className="mt-1 line-clamp-2 text-xs text-forest-600">
                                {cfg.config.summary.trim() || 'Manual quote'}
                              </p>
                            ) : cfg?.type === 'website_form' ? (
                              <p className="mt-1 line-clamp-2 text-xs text-forest-600">
                                {humanizeFormKey(cfg.config.formKey)} · {cfg.config.enquiryReferenceId}
                              </p>
                            ) : null}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-xs text-forest-600 md:px-6">
                            {packageBuildDbSourceLabel(row.source)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-xs font-medium text-forest-700 md:px-6">
                            {hasMeaningfulTripDetails(row.client_details) ? 'Yes' : '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 font-medium text-forest-900 md:px-6">
                            {typeof total === 'number' ? formatEur(total) : '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 md:px-6">
                            <LuxuryButton
                              className="!px-5 !py-2.5 !text-xs"
                              onClick={() => setDetailBuildId(row.id)}
                              type="button"
                              variant="white"
                            >
                              View
                            </LuxuryButton>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-right md:px-6">
                            <button
                              aria-label={`Remove package build ${row.label ?? row.id}`}
                              className="inline-flex min-h-11 items-center justify-center rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-800 transition-colors hover:bg-red-50 disabled:opacity-50"
                              disabled={packageBuildDeletingId !== null}
                              onClick={() => void handleRemovePackageBuildRow(row)}
                              type="button"
                            >
                              {packageBuildDeletingId === row.id ? 'Removing…' : 'Remove'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </AdminPortalSection>

        <AdminPortalSection activeSection={activeAdminSection} section="proposals">
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Proposals</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950 md:text-3xl">CRM records</h2>
            <p className="mt-2 max-w-2xl text-sm text-forest-600">
              Populated when you insert rows (or automate later). Owners see their own rows on the client dashboard.
            </p>

            {proposals.length === 0 ? (
              <div className="mt-6 rounded-[2rem] border border-dashed border-forest-200 bg-offwhite px-6 py-10 text-center text-sm text-forest-900 md:px-10">
                No proposal rows in the database yet.
              </div>
            ) : (
              <ul className="mt-6 overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-soft">
                {proposals.map((row, index) => (
                  <li
                    className={cx(
                      'flex flex-col gap-3 border-b border-forest-100/80 px-5 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between md:px-7',
                      index % 2 === 1 ? 'bg-offwhite/90' : 'bg-white'
                    )}
                    key={row.id}
                  >
                    <div className="min-w-0">
                      <p className="font-display text-lg font-semibold text-forest-950">
                        {row.title?.trim() || row.proposal_id}
                      </p>
                      <p className="mt-1 font-mono text-xs text-ge-gray500">{row.proposal_id}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={cx(
                          'inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-black/5',
                          proposalStatusStyles[row.status] ?? 'bg-forest-800 text-white'
                        )}
                      >
                        {row.status}
                      </span>
                      <span className="text-xs font-medium text-ge-gray500">
                        {formatAdminDateTime(row.created_at)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </AdminPortalSection>
        </div>

      {detailRow ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center sm:p-6">
          <button
            aria-label="Close build details"
            className="absolute inset-0 bg-forest-950/55 backdrop-blur-[2px]"
            onClick={handleCloseBuildDetail}
            type="button"
          />
          <FocusTrapDialog
            active
            className="relative z-10 flex max-h-[min(90vh,920px)] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-2xl"
            labelledBy="admin-build-detail-title"
            onClose={handleCloseBuildDetail}
          >
            <div className="border-b border-forest-100 bg-offwhite px-6 py-5 md:px-8">
              <h2 className="font-display text-xl font-semibold text-forest-950 md:text-2xl" id="admin-build-detail-title">
                Client build and trip form
              </h2>
              <p className="mt-1 text-sm text-forest-600">
                {detailRow.label?.trim() || 'Package build'} · saved{' '}
                {formatAdminDateTime(detailRow.created_at)}
              </p>
              {(() => {
                const prof = profileFromRow(detailRow)
                return prof?.email || prof?.full_name ? (
                  <p className="mt-2 text-sm font-medium text-forest-800">
                    {prof.full_name?.trim() ? <span>{prof.full_name.trim()}</span> : null}
                    {prof.full_name?.trim() && prof.email ? <span className="text-ge-gray500"> · </span> : null}
                    {prof.email ? (
                      <a className="text-brand-600 underline-offset-2 hover:text-brand-700 hover:underline" href={`mailto:${prof.email}`}>
                        {prof.email}
                      </a>
                    ) : null}
                  </p>
                ) : (
                  <p className="mt-2 font-mono text-xs text-ge-gray500">Owner {detailRow.owner_id}</p>
                )
              })()}
            </div>

            <form className="flex min-h-0 flex-1 flex-col" noValidate onSubmit={handleAdminSaveBuildDetails}>
              <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8">
                {detailCalc ? (
                  <div className="mb-8 rounded-2xl border border-forest-100 bg-white px-4 py-4 text-sm text-forest-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">Calculator config (reference)</p>
                    <p className="mt-2 font-medium">
                      {detailCalc.packageStyle} · {detailCalc.groupSize} golfers · {detailCalc.nights} nights /{' '}
                      {detailCalc.rounds} rounds
                    </p>
                    <p className="mt-1 text-xs text-forest-600">
                      Stay: {detailCalc.stayName} · Transfer: {detailCalc.transferName}
                    </p>
                    <p className="mt-2 text-xs text-forest-600">Source: {packageBuildDbSourceLabel(detailRow.source)}</p>
                  </div>
                ) : null}

                {detailManual ? (
                  <div className="mb-8 rounded-2xl border border-fairway-200/80 bg-fairway-50/40 px-4 py-4 text-sm text-forest-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">Manual package (published)</p>
                    <p className="mt-2 font-display text-lg font-semibold text-forest-950">{detailManual.title}</p>
                    <p className="mt-2 text-sm font-semibold text-forest-800">{formatEur(detailManual.priceEur)} total</p>
                    {detailManual.summary.trim() ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-forest-700">{detailManual.summary}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-forest-600">Source: {packageBuildDbSourceLabel(detailRow.source)}</p>
                  </div>
                ) : null}

                {detailWebsite ? (
                  <div className="mb-8 rounded-2xl border border-forest-100 bg-white px-4 py-4 text-sm text-forest-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">Website form snapshot</p>
                    <p className="mt-2 font-medium">
                      {humanizeFormKey(detailWebsite.formKey)} · enquiry {detailWebsite.enquiryReferenceId}
                    </p>
                    <p className="mt-1 text-xs text-ge-gray500">
                      Submitted {formatAdminDateTime(detailWebsite.submittedAt)}
                    </p>
                    <dl className="mt-4 grid max-h-72 gap-3 overflow-y-auto text-xs sm:grid-cols-2">
                      {orderedWebsiteFormFieldEntries(detailWebsite.fields).map(([k, v]) => (
                        <div className="rounded-2xl border-2 border-orange-400/70 bg-offwhite/50 px-3 py-2.5" key={k}>
                          <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-brand-600">
                            {getWebsiteFormFieldLabel(k)}
                          </dt>
                          <dd className="mt-1 whitespace-pre-wrap text-sm font-medium text-forest-900">
                            {formatWebsiteFormFieldValueForDisplay(k, v).trim() || '—'}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-3 text-xs text-forest-600">Source: {packageBuildDbSourceLabel(detailRow.source)}</p>
                  </div>
                ) : null}

                {detailWebsite?.portalTransferPlan &&
                (detailWebsite.portalTransferPlan.golfLegs.some((l) => l.courseId.trim()) ||
                  detailWebsite.portalTransferPlan.hotelLegs.some((l) => l.hotelName.trim())) ? (
                  <div className="mb-8 rounded-2xl border border-fairway-200/90 bg-gradient-to-br from-[#f4faf6] to-white px-4 py-4 text-sm text-forest-900 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gs-green">Client transfer plan (portal)</p>
                    <p className="mt-1 text-xs text-forest-600">
                      Saved by the client from their dashboard — Costa del Sol courses and hotels for golf-day / hotel
                      transfers.
                    </p>
                    {detailWebsite.portalTransferPlan.updatedAt ? (
                      <p className="mt-2 text-xs text-ge-gray500">
                        Updated {formatAdminDateTime(detailWebsite.portalTransferPlan.updatedAt)}
                      </p>
                    ) : null}
                    {detailWebsite.portalTransferPlan.golfLegs.some((l) => l.courseId.trim()) ? (
                      <ul className="mt-3 space-y-2 rounded-xl border border-forest-100 bg-white/90 px-3 py-2">
                        {detailWebsite.portalTransferPlan.golfLegs
                          .filter((l) => l.courseId.trim())
                          .map((leg, gi) => {
                            const course = COURSES.find((c) => c.id === leg.courseId)
                            return (
                              <li className="text-sm text-forest-800" key={`golf-${String(gi)}-${leg.courseId}`}>
                                <span className="font-semibold text-forest-950">{course?.name ?? leg.courseId}</span>
                                {course?.region ? (
                                  <span className="text-ge-gray500"> · {course.region}</span>
                                ) : null}
                                {leg.notes.trim() ? (
                                  <span className="mt-0.5 block text-xs text-forest-600">{leg.notes.trim()}</span>
                                ) : null}
                              </li>
                            )
                          })}
                      </ul>
                    ) : null}
                    {detailWebsite.portalTransferPlan.hotelLegs.some((l) => l.hotelName.trim()) ? (
                      <ul className="mt-3 space-y-2 rounded-xl border border-forest-100 bg-white/90 px-3 py-2">
                        {detailWebsite.portalTransferPlan.hotelLegs
                          .filter((l) => l.hotelName.trim())
                          .map((leg, hi) => (
                            <li className="text-sm text-forest-800" key={`hotel-${String(hi)}-${leg.hotelName}`}>
                              <span className="font-semibold text-forest-950">{leg.hotelName.trim()}</span>
                              {leg.notes.trim() ? (
                                <span className="mt-0.5 block text-xs text-forest-600">{leg.notes.trim()}</span>
                              ) : null}
                            </li>
                          ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}

                {detailWebsite ? (
                  <div className="mb-8 rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-fairway-50/80 to-white px-4 py-5 text-sm text-forest-900 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-900">Client quote &amp; VAT</p>
                    <p className="mt-2 text-xs text-forest-600">
                      Enter the <strong className="font-medium text-forest-800">VAT-inclusive total</strong> the client pays. We
                      show Irish VAT ex-works, then add it back. Deposit is 20% of the total; balance is the remainder.
                    </p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={adminTripLabelClass} htmlFor="adm-web-quote-gross">
                          Total (EUR, inc VAT)
                        </label>
                        <input
                          className={adminTripInputClass}
                          id="adm-web-quote-gross"
                          inputMode="decimal"
                          onChange={(e) => setWebsiteQuoteGross(e.target.value)}
                          placeholder="e.g. 2450"
                          value={websiteQuoteGross}
                        />
                      </div>
                      <div>
                        <label className={adminTripLabelClass} htmlFor="adm-web-quote-vat">
                          Irish VAT rate
                        </label>
                        <select
                          className={adminTripInputClass}
                          id="adm-web-quote-vat"
                          onChange={(e) => setWebsiteQuoteVatRate(Number(e.target.value))}
                          value={websiteQuoteVatRate}
                        >
                          <option value={IRISH_VAT_STANDARD_RATE}>Standard 23% (services)</option>
                          <option value={IRISH_VAT_REDUCED_TOURISM_RATE}>Reduced 13.5% (tourism / hospitality where applicable)</option>
                          <option value={0}>Zero 0% (exempt / reverse charge — confirm with accountant)</option>
                        </select>
                      </div>
                    </div>
                    {websiteQuotePreview ? (
                      <ul className="mt-4 space-y-2 rounded-xl border border-forest-200/80 bg-white/90 px-4 py-3 text-xs text-forest-800">
                        <li className="flex justify-between gap-3">
                          <span>Services (ex VAT)</span>
                          <span className="font-semibold">{formatEur(websiteQuotePreview.netServicesEur)}</span>
                        </li>
                        <li className="flex justify-between gap-3">
                          <span>VAT ({Math.round(websiteQuotePreview.vatRate * 1000) / 10}%)</span>
                          <span className="font-semibold">{formatEur(websiteQuotePreview.vatAmountEur)}</span>
                        </li>
                        <li className="flex justify-between gap-3 border-t border-forest-100 pt-2 text-sm">
                          <span className="font-medium">Total (inc VAT)</span>
                          <span className="font-bold text-emerald-900">{formatEur(websiteQuotePreview.grossTotalEur)}</span>
                        </li>
                        <li className="flex justify-between gap-3">
                          <span>Deposit 20%</span>
                          <span className="font-semibold">{formatEur(websiteQuotePreview.deposit20Eur)}</span>
                        </li>
                        <li className="flex justify-between gap-3">
                          <span>Balance</span>
                          <span className="font-semibold">{formatEur(websiteQuotePreview.balance80Eur)}</span>
                        </li>
                      </ul>
                    ) : (
                      <p className="mt-3 text-xs text-ge-gray500">Enter a total above to preview VAT split and deposit.</p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <LuxuryButton
                        disabled={websiteQuoteBusy || !websiteQuotePreview}
                        onClick={() => void handleSaveWebsiteFormQuote()}
                        type="button"
                        variant="primary"
                      >
                        {websiteQuoteBusy ? 'Saving & emailing…' : 'Save quote to client portal'}
                      </LuxuryButton>
                      {detailWebsite.adminQuote ? (
                        <span className="text-xs text-ge-gray500">
                          Last saved {formatAdminDateTime(detailWebsite.adminQuote.savedAt)}
                        </span>
                      ) : null}
                    </div>
                    {websiteQuoteMessage ? (
                      <p className="mt-3 text-xs font-medium text-emerald-900" role="status">
                        {websiteQuoteMessage}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Trip details (editable)</p>
                <p className="mt-1 text-sm text-forest-600">
                  {detailManual
                    ? 'Locked package lines on the client dashboard match this manual quote — adjust them here if the quote changes. The client can still edit open fields (dates, notes, etc.).'
                    : detailWebsite
                      ? 'Website enquiry: full field snapshot and client transfer plan are above. Pricing / proposal / logistics / notes blocks are hidden from the portal trip form — use internal processes if you must amend those lines.'
                      : 'Clients cannot edit calculator-sourced package, stay, group size, nights, rounds, or pricing on their dashboard — update those here.'}{' '}
                  {hasMeaningfulTripDetails(serializeTripDetailsForDb(adminTripForm))
                    ? 'Extra client-entered fields are included below.'
                    : 'Most lines are still defaults until the client adds trip notes.'}
                </p>

                <div className="mt-6 space-y-8">
                  {TRIP_DETAILS_SECTIONS.filter((s) => {
                    if (TRIP_DETAILS_DASHBOARD_EXCLUDED_SECTION_TITLES.includes(s.title)) {
                      return false
                    }
                    if (detailWebsite && (s.title === 'Trip shape' || s.title === 'Trip overview')) {
                      return false
                    }
                    return true
                  }).map((section) => (
                    <div className="space-y-4" key={section.title}>
                      <h3 className="border-b border-orange-200/90 pb-2 font-display text-base font-semibold text-forest-900">
                        {section.title}
                      </h3>
                      {section.title === 'Trip shape' ? (
                        <p className="text-sm text-forest-700">
                          Trip shape: {adminTripForm.nights.trim() || '0'} nights / {adminTripForm.rounds.trim() || '0'} rounds
                        </p>
                      ) : null}
                      <div className="grid gap-4 sm:grid-cols-2">
                        {section.fields.map((field) => {
                          const id = `adm-td-${field.key}`
                          const isLong = TRIP_DETAILS_MULTILINE_KEYS.has(field.key)

                          return (
                            <div className={field.key === 'notesForGsol' ? 'sm:col-span-2' : ''} key={field.key}>
                              <label className={adminTripLabelClass} htmlFor={id}>
                                {field.label}
                              </label>
                              {isLong ? (
                                <textarea
                                  className={cx(adminTripInputClass, 'min-h-[100px] resize-y')}
                                  id={id}
                                  onChange={handleAdminTripFieldChange(field.key)}
                                  value={adminTripForm[field.key]}
                                />
                              ) : (
                                <input
                                  className={adminTripInputClass}
                                  id={id}
                                  onChange={handleAdminTripFieldChange(field.key)}
                                  value={adminTripForm[field.key]}
                                />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-forest-100 bg-white px-6 py-4 md:flex-row md:flex-wrap md:items-center md:px-8">
                <LuxuryButton disabled={adminSaveStatus === 'saving'} type="submit" variant="primary">
                  {adminSaveStatus === 'saving' ? 'Saving…' : 'Save trip details'}
                </LuxuryButton>
                <LuxuryButton onClick={handleCloseBuildDetail} type="button" variant="white">
                  Close
                </LuxuryButton>
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-red-200 bg-white px-5 py-2.5 text-xs font-semibold text-red-800 transition-colors hover:bg-red-50 disabled:opacity-50 md:ml-auto"
                  disabled={adminSaveStatus === 'saving' || packageBuildDeletingId !== null}
                  onClick={() => void handleRemovePackageBuildRow(detailRow)}
                  type="button"
                >
                  {packageBuildDeletingId === detailRow.id ? 'Removing…' : 'Remove from client packages'}
                </button>
                {adminSaveMessage ? (
                  <p
                    ref={adminSaveMessageRef}
                    className={cx(
                      'text-sm font-medium',
                      adminSaveStatus === 'error' ? 'text-red-700' : 'text-forest-800'
                    )}
                    role={adminSaveStatus === 'error' ? 'alert' : 'status'}
                  >
                    {adminSaveMessage}
                  </p>
                ) : null}
              </div>
            </form>
          </FocusTrapDialog>
        </div>
      ) : null}

      <AdminPortalSection activeSection={activeAdminSection} section="portal">
      <div className="mt-20 space-y-12 border-t border-forest-200 pt-14">
        <section
          aria-label="Clear client portal and copy signed login links"
          className="rounded-3xl border-2 border-red-200/90 bg-gradient-to-br from-red-50/95 to-white p-6 shadow-soft sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-900">Client portal reset</p>
          <h2 className="font-display mt-2 text-xl font-semibold text-forest-950">Clear dashboard or copy signed login URL</h2>
          <p className="mt-2 max-w-3xl text-sm text-forest-700">
            Use <strong className="font-medium text-forest-900">client login email</strong> and/or an <strong className="font-medium text-forest-900">account or enquiry ref</strong> (GSI-…) so we match the same profile that owns the inbox. Signed links use the account ref field and{' '}
            <code className="rounded bg-white/90 px-1 font-mono text-xs ring-1 ring-forest-200">PORTAL_LINK_SIGNING_SECRET</code> on the server.
          </p>
          <label className="mb-2 mt-5 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600" htmlFor="bottom-clear-portal-client-email">
            Client login email
          </label>
          <input
            autoComplete="email"
            className="mb-3 w-full max-w-md rounded-2xl border border-forest-200 bg-white px-4 py-3 text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
            id="bottom-clear-portal-client-email"
            onChange={(e) => {
              setClearPortalClientEmail(e.target.value)
              setClearDashboardMessage(null)
              setClearPortalInboxMessage(null)
              setPortalLinkCopyMessage(null)
            }}
            placeholder="Address they sign in with (best for clearing Messages & files)"
            type="email"
            value={clearPortalClientEmail}
          />
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600" htmlFor="bottom-clear-dashboard-ref">
            Account or enquiry reference (optional if email above is set)
          </label>
          <input
            className="mb-2 w-full max-w-md rounded-2xl border border-forest-200 bg-white px-4 py-3 font-mono text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
            id="bottom-clear-dashboard-ref"
            onChange={(e) => {
              setClearDashboardAccountRef(e.target.value)
              setClearDashboardMessage(null)
              setClearPortalInboxMessage(null)
              setPortalLinkCopyMessage(null)
            }}
            placeholder="e.g. GSI-3TY1-2719 (profile account # or quote enquiry ref)"
            type="text"
            value={clearDashboardAccountRef}
          />
          <p className="mb-4 max-w-xl text-xs text-forest-600">
            Quote titles may show an enquiry ref that differs from the profile account number — use login email when in doubt.
          </p>
          <p className="mb-4 max-w-2xl text-xs text-forest-600">
            <strong className="font-medium text-forest-800">Full dashboard clear</strong> also deletes portal invoices, transfer
            bookings, and the email→account anchor so the client can receive a <strong className="font-medium text-forest-800">new</strong>{' '}
            portal account number on next sign-in or when they save contact details again. Enquiry rows in the table above are kept.
          </p>
          <div className="flex flex-col flex-wrap gap-3 sm:flex-row sm:items-center">
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-chrome-300 bg-white px-6 py-3 text-sm font-semibold text-brand-950 transition-colors hover:bg-chrome-50 disabled:opacity-60"
              disabled={clearPortalInboxBusy || clearDashboardBusy}
              onClick={() => void handleClearPortalMessagesOnly()}
              type="button"
            >
              {clearPortalInboxBusy ? 'Clearing…' : 'Clear Messages & files only'}
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-red-300 bg-white px-6 py-3 text-sm font-semibold text-red-950 transition-colors hover:bg-red-50 disabled:opacity-60"
              disabled={clearDashboardBusy || clearPortalInboxBusy}
              onClick={() => void handleClearDashboardByAccountRef()}
              type="button"
            >
              {clearDashboardBusy ? 'Clearing…' : 'Clear entire client portal'}
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-forest-200 bg-white px-6 py-3 text-sm font-semibold text-forest-900 transition-colors hover:border-fairway-400 disabled:opacity-60"
              disabled={portalLinkCopyBusy !== 'idle'}
              onClick={() => void handleCopySignedPortalLoginLink('client')}
              type="button"
            >
              {portalLinkCopyBusy === 'client' ? 'Preparing…' : 'Copy signed client login link'}
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-forest-200 bg-white px-6 py-3 text-sm font-semibold text-forest-900 transition-colors hover:border-fairway-400 disabled:opacity-60"
              disabled={portalLinkCopyBusy !== 'idle'}
              onClick={() => void handleCopySignedPortalLoginLink('admin')}
              type="button"
            >
              {portalLinkCopyBusy === 'admin' ? 'Preparing…' : 'Copy signed admin login link'}
            </button>
          </div>
          {clearPortalInboxMessage ? (
            <p className="mt-4 text-sm font-medium text-brand-950" role="status">
              {clearPortalInboxMessage}
            </p>
          ) : null}
          {clearDashboardMessage ? (
            <p className="mt-4 text-sm font-medium text-forest-900" role="status">
              {clearDashboardMessage}
            </p>
          ) : null}
          {portalLinkCopyMessage ? (
            <p className="mt-3 text-sm font-medium text-forest-900" role="status">
              {portalLinkCopyMessage}
            </p>
          ) : null}
        </section>

        <section aria-label="Block sign-in and enquiries" className="rounded-3xl border border-forest-200 bg-white p-6 shadow-soft sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-800">Access control</p>
          <h2 className="font-display mt-2 text-lg font-semibold text-forest-950">Block or unblock an email</h2>
          <p className="mt-2 max-w-2xl text-sm text-forest-600">
            Blocked addresses cannot request magic links, submit website enquiries, or be created as a new client via admin “Create portal user”. Existing sessions are not revoked automatically.
          </p>
          <div className="mt-5 flex max-w-xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="min-w-0 flex-1">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600" htmlFor="auth-block-email">
                Email to block
              </label>
              <input
                autoComplete="email"
                className="w-full rounded-2xl border border-forest-200 bg-white px-4 py-3 text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
                id="auth-block-email"
                onChange={(e) => setAuthBlockEmailInput(e.target.value)}
                placeholder="client@example.com"
                type="email"
                value={authBlockEmailInput}
              />
            </div>
            <div className="min-w-0 flex-1 sm:min-w-[12rem]">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-brand-600" htmlFor="auth-block-reason">
                Reason (optional)
              </label>
              <input
                className="w-full rounded-2xl border border-forest-200 bg-white px-4 py-3 text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
                id="auth-block-reason"
                onChange={(e) => setAuthBlockReasonInput(e.target.value)}
                placeholder="Spam, abuse, duplicate…"
                type="text"
                value={authBlockReasonInput}
              />
            </div>
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-forest-900 bg-forest-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-800 disabled:opacity-60"
              disabled={authBlockBusy}
              onClick={() => void handleBlockAuthEmail()}
              type="button"
            >
              {authBlockBusy ? 'Working…' : 'Block email'}
            </button>
          </div>
          {authBlockMessage ? (
            <p className="mt-4 text-sm font-medium text-forest-900" role="status">
              {authBlockMessage}
            </p>
          ) : null}
          <div className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">Currently blocked</p>
              <button
                className="text-xs font-semibold text-gs-green underline decoration-gs-green/40 hover:decoration-gs-green"
                disabled={authBlockListLoading}
                onClick={() => void loadAuthEmailBlocks()}
                type="button"
              >
                {authBlockListLoading ? 'Refreshing…' : 'Refresh list'}
              </button>
            </div>
            {authBlockListLoading && authBlockList.length === 0 ? (
              <p className="mt-3 text-sm text-forest-600">Loading…</p>
            ) : authBlockList.length === 0 ? (
              <p className="mt-3 text-sm text-forest-600">No blocked addresses.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {authBlockList.map((row) => (
                  <li
                    className="flex flex-col gap-2 rounded-2xl border border-forest-100 bg-offwhite/80 px-4 py-3 text-sm text-forest-800 sm:flex-row sm:items-center sm:justify-between"
                    key={row.email}
                  >
                    <div>
                      <p className="font-mono text-sm font-semibold text-forest-950">{row.email}</p>
                      <p className="text-xs text-ge-gray500">
                        Since {formatDateTimeDdMmYy(row.blocked_at)}
                        {row.reason ? ` · ${row.reason}` : ''}
                      </p>
                    </div>
                    <button
                      className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-full border border-forest-200 bg-white px-4 text-xs font-semibold text-forest-900 hover:border-fairway-400 disabled:opacity-60"
                      disabled={authBlockBusy}
                      onClick={() => void handleUnblockAuthEmail(row.email)}
                      type="button"
                    >
                      Unblock
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
      </AdminPortalSection>
      </AdminPortalShell>
    </DashboardLayout>
  )
}
