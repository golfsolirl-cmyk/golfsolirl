import { corridorHotelBySlug } from '../data/airport-corridor-hotels'
import { COURSES } from '../data/coastal-golf-data'
import { ENQUIRY_STRUCTURED_FIELD_KEYS, QUOTE_INTENTS } from './enquiry-form-registry'
import {
  formatWebsiteFormFieldValueForDisplay,
  getWebsiteFormFieldLabel,
  normalizePortalTransferPlan,
  parseAnyPackageBuildRowConfig,
  type PortalTransferPlan
} from './package-build'
import {
  ensureTripWorkspaceDraftShape,
  emptyTripWorkspaceDraft,
  MALAGA_AIRPORT_REF,
  normalizeTransferStops,
  type PortalTransferStop,
  type TripWorkspaceDraft
} from './trip-workspace-draft'

const ORIGINAL_TRANSFER_FIELD_KEYS = new Set<string>([
  ENQUIRY_STRUCTURED_FIELD_KEYS.pax,
  'Passengers',
  ENQUIRY_STRUCTURED_FIELD_KEYS.pickupType,
  ENQUIRY_STRUCTURED_FIELD_KEYS.pickupId,
  ENQUIRY_STRUCTURED_FIELD_KEYS.pickupLabel,
  ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffType,
  ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffId,
  ENQUIRY_STRUCTURED_FIELD_KEYS.dropoffLabel,
  ENQUIRY_STRUCTURED_FIELD_KEYS.quoteIntent,
  ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateFrom,
  ENQUIRY_STRUCTURED_FIELD_KEYS.travelDateTo,
  ENQUIRY_STRUCTURED_FIELD_KEYS.alreadyAtMalagaAgp,
  'Destination',
  'Collection point',
  'Trip timing',
  'Collection timing',
  'ASAP',
  'Service date (already here)'
])

export type PackageBuildConfigRow = {
  readonly id?: string
  readonly config: unknown
  readonly updated_at?: string
  readonly created_at?: string
}

const buildSortTime = (row: PackageBuildConfigRow): number => {
  const raw = row.updated_at ?? row.created_at
  if (!raw) {
    return 0
  }
  const t = new Date(raw).getTime()
  return Number.isFinite(t) ? t : 0
}

export type AdminWorkspaceClientTransferSnapshot = {
  readonly referenceId: string
  readonly buildId: string | null
  /** Latest matching website_form row: `updated_at` when present, else `created_at`. */
  readonly buildUpdatedAt: string | null
  readonly hydratedDraft: TripWorkspaceDraft
  readonly portalPlan: PortalTransferPlan | null
  readonly websiteFormFields: Readonly<Record<string, string>>
  readonly originalTransferRows: readonly { readonly label: string; readonly value: string }[]
}

export type CostaMapBookingPreviewRow = {
  readonly id: string
  readonly pickup_label: string
  readonly dropoff_label: string
  readonly scheduled_at: string | null
  readonly status: string
  readonly created_at: string
  readonly booking_source?: string
  readonly enquiry_reference_id?: string | null
  readonly client_email?: string | null
  readonly payment_status?: string | null
  readonly deposit_percent?: number | null
  readonly balance_remind_at?: string | null
  readonly balance_remind_sent_at?: string | null
}

const formatPickupLocalDisplay = (raw: string | undefined): string => {
  const t = typeof raw === 'string' ? raw.trim() : ''
  if (!t) {
    return ''
  }
  return t.replace('T', ' ')
}

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const labelForStop = (stop: PortalTransferStop): string => {
  if (stop.kind === 'malaga_airport' || stop.ref === MALAGA_AIRPORT_REF) {
    return 'Málaga Airport (AGP)'
  }
  if (stop.kind === 'golf_course') {
    return COURSES.find((c) => c.id === stop.ref)?.name ?? stop.ref
  }
  const hotel = corridorHotelBySlug(stop.ref)
  return hotel?.name ?? stop.ref
}

const mergeEnquiryHintsIntoDraft = (
  draft: TripWorkspaceDraft,
  fields: Record<string, string> | null | undefined
): TripWorkspaceDraft => {
  if (!fields) {
    return draft
  }
  const paxRaw = fields[ENQUIRY_STRUCTURED_FIELD_KEYS.pax] ?? fields.Passengers
  const n = typeof paxRaw === 'string' ? parseInt(paxRaw.replace(/\D+/g, ''), 10) : NaN
  let partySize = draft.partySize
  if (Number.isFinite(n) && n >= 1 && n <= 8) {
    partySize = n
  }

  const qi = fields[ENQUIRY_STRUCTURED_FIELD_KEYS.quoteIntent]?.trim()
  let stages = { ...draft.stages }
  if (qi === QUOTE_INTENTS.airportOnly) {
    stages = { transfer: true, golf: false, hotel: false }
  }

  return { ...draft, partySize, stages }
}

/** Build admin sketch draft from the newest website_form package row + enquiry hints. */
export const hydrateAdminWorkspaceDraftFromClientPackages = (
  referenceId: string,
  enquiryFields: Record<string, string> | null | undefined,
  builds: readonly PackageBuildConfigRow[]
): TripWorkspaceDraft => {
  let draft = emptyTripWorkspaceDraft(referenceId)

  const matches = builds
    .map((b) => ({ b, p: parseAnyPackageBuildRowConfig(b.config) }))
    .filter(
      (x): x is { b: PackageBuildConfigRow; p: Extract<NonNullable<ReturnType<typeof parseAnyPackageBuildRowConfig>>, { type: 'website_form' }> } =>
        x.p?.type === 'website_form' && x.p.config.enquiryReferenceId === referenceId
    )
    .sort((a, b) => buildSortTime(b.b) - buildSortTime(a.b))

  const newest = matches[0]
  if (newest) {
    const cfg = newest.p.config
    if (cfg.portalTripWorkspace) {
      draft = ensureTripWorkspaceDraftShape({
        ...cfg.portalTripWorkspace,
        referenceId
      })
    }

    if (cfg.portalTransferPlan) {
      const plan = normalizePortalTransferPlan(cfg.portalTransferPlan)
      const golfIds = plan.golfLegs.map((l) => l.courseId.trim()).filter(Boolean)
      const uniqueCourses = [...new Set([...draft.courseIds, ...golfIds])]
      const hotelLines = plan.hotelLegs
        .filter((l) => l.hotelName.trim())
        .map((l) => `${l.hotelName.trim()}${l.notes.trim() ? ` — ${l.notes.trim()}` : ''}`)
      const portalHotelBlock = hotelLines.join('\n')
      const mergedHotel = [draft.hotelNotes.trim(), portalHotelBlock].filter(Boolean).join('\n\n').trim()
      const stops = normalizeTransferStops(draft.transferStops)
      draft = ensureTripWorkspaceDraftShape({
        ...draft,
        courseIds: uniqueCourses,
        hotelNotes: mergedHotel,
        stages: {
          transfer:
            draft.stages.transfer ||
            golfIds.length > 0 ||
            hotelLines.length > 0 ||
            stops.length > 1 ||
            stops.some((s) => s.kind !== 'malaga_airport' || s.ref !== MALAGA_AIRPORT_REF),
          golf: draft.stages.golf || golfIds.length > 0,
          hotel: draft.stages.hotel || hotelLines.length > 0
        }
      })
    }
  }

  draft = mergeEnquiryHintsIntoDraft(draft, enquiryFields)
  return ensureTripWorkspaceDraftShape({ ...draft, referenceId })
}

export const buildOriginalTransferRowsFromEnquiryFields = (
  fields: Readonly<Record<string, string>> | null | undefined
): { readonly label: string; readonly value: string }[] => {
  if (!fields) {
    return []
  }
  const out: { label: string; value: string }[] = []
  for (const [key, raw] of Object.entries(fields)) {
    if (!ORIGINAL_TRANSFER_FIELD_KEYS.has(key) && !key.startsWith('_pick') && !key.startsWith('_drop') && !key.startsWith('_travel')) {
      continue
    }
    const v = String(raw).trim()
    if (!v) {
      continue
    }
    out.push({
      label: getWebsiteFormFieldLabel(key),
      value: formatWebsiteFormFieldValueForDisplay(key, v)
    })
  }
  return out
}

export const resolveAdminWorkspaceClientTransferSnapshot = (
  referenceId: string,
  enquiryFields: Readonly<Record<string, string>> | null | undefined,
  builds: readonly PackageBuildConfigRow[]
): AdminWorkspaceClientTransferSnapshot | null => {
  if (!referenceId.trim()) {
    return null
  }

  const hydratedDraft = hydrateAdminWorkspaceDraftFromClientPackages(referenceId, enquiryFields ?? null, builds)
  const originalTransferRows = buildOriginalTransferRowsFromEnquiryFields(enquiryFields ?? undefined)

  const matches = builds
    .map((b) => ({ b, p: parseAnyPackageBuildRowConfig(b.config) }))
    .filter(
      (x): x is { b: PackageBuildConfigRow; p: Extract<NonNullable<ReturnType<typeof parseAnyPackageBuildRowConfig>>, { type: 'website_form' }> } =>
        x.p?.type === 'website_form' && x.p.config.enquiryReferenceId === referenceId
    )
    .sort((a, b) => buildSortTime(b.b) - buildSortTime(a.b))

  const newest = matches[0]
  const websiteFormFields = (newest?.p.config.fields ?? {}) as Readonly<Record<string, string>>
  const portalPlanRaw = newest?.p.config.portalTransferPlan ? normalizePortalTransferPlan(newest.p.config.portalTransferPlan) : null
  const hasPlanLegs =
    portalPlanRaw &&
    (portalPlanRaw.golfLegs.some((l) => l.courseId.trim()) || portalPlanRaw.hotelLegs.some((l) => l.hotelName.trim()))
  const portalPlan = hasPlanLegs ? portalPlanRaw : null

  const hasPersistedWorkspace = Boolean(newest?.p.config.portalTripWorkspace)
  const hasRouteBeyondDefault = (() => {
    const s = normalizeTransferStops(hydratedDraft.transferStops)
    return s.length > 1 || s.some((x) => x.kind !== 'malaga_airport' || x.ref !== MALAGA_AIRPORT_REF)
  })()

  const hasLegPickupHints = (() => {
    const stops = normalizeTransferStops(hydratedDraft.transferStops)
    if (stops.some((s) => (s.pickupAtLocal ?? '').trim().length > 0)) {
      return true
    }
    if (!portalPlanRaw) {
      return false
    }
    return (
      portalPlanRaw.golfLegs.some((l) => (l.pickupAtLocal ?? '').trim().length > 0) ||
      portalPlanRaw.hotelLegs.some((l) => (l.pickupAtLocal ?? '').trim().length > 0)
    )
  })()

  const hasAnything =
    originalTransferRows.length > 0 ||
    Boolean(portalPlan) ||
    hasPersistedWorkspace ||
    hasRouteBeyondDefault ||
    hasLegPickupHints ||
    (hydratedDraft.transferContactPhone ?? '').trim().length > 0

  if (!hasAnything) {
    return null
  }

  return {
    referenceId,
    buildId: newest && typeof newest.b.id === 'string' ? newest.b.id : null,
    buildUpdatedAt: newest ? newest.b.updated_at ?? newest.b.created_at ?? null : null,
    hydratedDraft,
    portalPlan,
    websiteFormFields,
    originalTransferRows
  }
}

export const buildAdminTransferLegsPreviewHtml = (
  snap: AdminWorkspaceClientTransferSnapshot | null,
  referenceIdForTitle: string,
  mapBookings: readonly CostaMapBookingPreviewRow[]
): string => {
  const sections: { title: string; rows: { k: string; v: string }[] }[] = []

  if (snap && snap.originalTransferRows.length > 0) {
    sections.push({
      title: 'Original enquiry (transfer-related)',
      rows: snap.originalTransferRows.map((r) => ({ k: r.label, v: r.value }))
    })
  }

  if (snap?.portalPlan) {
    const legRows: { k: string; v: string }[] = []
    for (const leg of snap.portalPlan.golfLegs) {
      if (!leg.courseId.trim()) {
        continue
      }
      const name = COURSES.find((c) => c.id === leg.courseId)?.name ?? leg.courseId
      const pt = formatPickupLocalDisplay(leg.pickupAtLocal)
      const bits = [leg.notes.trim(), pt ? `Pick-up: ${pt}` : ''].filter(Boolean)
      legRows.push({ k: `Golf · ${name}`, v: bits.length ? bits.join(' · ') : '—' })
    }
    for (const leg of snap.portalPlan.hotelLegs) {
      if (!leg.hotelName.trim()) {
        continue
      }
      const pt = formatPickupLocalDisplay(leg.pickupAtLocal)
      const bits = [leg.notes.trim(), pt ? `Pick-up: ${pt}` : ''].filter(Boolean)
      legRows.push({ k: `Hotel · ${leg.hotelName.trim()}`, v: bits.length ? bits.join(' · ') : '—' })
    }
    if (legRows.length > 0) {
      sections.push({ title: 'Client portal · golf & hotel transfer legs', rows: legRows })
    }
  }

  if (snap) {
    const stops = normalizeTransferStops(snap.hydratedDraft.transferStops)
    if (stops.length > 0) {
      const legRows = stops.map((stop, i) => {
        const pt = formatPickupLocalDisplay(stop.pickupAtLocal)
        const line = `${stop.kind.replace(/_/g, ' ')} → ${labelForStop(stop)}`
        return {
          k: `Leg ${i + 1}`,
          v: pt ? `${line} · pick-up ${pt}` : line
        }
      })
      sections.push({
        title: 'Client portal · route order',
        rows: legRows
      })
    }

    if ((snap.hydratedDraft.transferContactPhone ?? '').trim()) {
      sections.push({
        title: 'Transfer contact',
        rows: [{ k: 'Phone / WhatsApp', v: snap.hydratedDraft.transferContactPhone!.trim() }]
      })
    }
  }

  if (mapBookings.length > 0) {
    const rows = mapBookings.map((b) => {
      const when = b.scheduled_at
        ? new Date(b.scheduled_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
        : 'ASAP / not set'
      return {
        k: `${b.pickup_label} → ${b.dropoff_label}`,
        v: `${b.status.replace(/_/g, ' ')} · ${when} · requested ${new Date(b.created_at).toLocaleDateString()}`
      }
    })
    sections.push({ title: 'Client dashboard · map transfer requests', rows })
  }

  const body = sections
    .map((sec) => {
      const rows = sec.rows
        .map((r) => `<tr><th>${escapeHtml(r.k)}</th><td>${escapeHtml(r.v)}</td></tr>`)
        .join('')
      return `<section><h2>${escapeHtml(sec.title)}</h2><table>${rows}</table></section>`
    })
    .join('')

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>Transfer legs</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:24px;color:#14221a;background:#faf9f6;}
  h1{font-size:1.25rem;margin:0 0 16px;}
  h2{font-size:0.75rem;text-transform:uppercase;letter-spacing:.12em;color:#6b7c72;margin:20px 0 8px;}
  table{width:100%;border-collapse:collapse;font-size:0.9rem;}
  th{text-align:left;padding:8px 12px 8px 0;border-bottom:1px solid #e3e8e4;width:38%;vertical-align:top;font-weight:600;}
  td{padding:8px 0;border-bottom:1px solid #e3e8e4;vertical-align:top;}
</style></head><body>
<h1>Transfer legs · ${escapeHtml(referenceIdForTitle || snap?.referenceId || '—')}</h1>
${body || '<p>No transfer rows yet.</p>'}
</body></html>`
}
