import { LuxuryButton } from './ui/button'

export type FormalProposalPayload = Record<string, unknown>

const DISPLAY_ROWS: readonly { readonly key: string; readonly label: string }[] = [
  { key: 'proposalId', label: 'Proposal ID' },
  { key: 'proposalDate', label: 'Proposal date' },
  { key: 'packageName', label: 'Package' },
  { key: 'tripShapeCustom', label: 'Trip shape (custom)' },
  { key: 'stayName', label: 'Stay / hotel level' },
  { key: 'transferName', label: 'Transfer style' },
  { key: 'groupSize', label: 'Group size' },
  { key: 'nights', label: 'Nights' },
  { key: 'rounds', label: 'Rounds' },
  { key: 'courseName', label: 'Courses' },
  { key: 'hotelName', label: 'Hotel name / area' },
  { key: 'hotelDist', label: 'Hotel distance' },
  { key: 'quoteScopeSummary', label: 'Quote scope' },
  { key: 'travelDates', label: 'Travel dates' },
  { key: 'departureAirportRoute', label: 'Departure airport / route' },
  { key: 'leadTravellerContact', label: 'Lead traveller / contact' },
  { key: 'resortArea', label: 'Resort area' },
  { key: 'proposalSpecialRequests', label: 'Special requests' },
  { key: 'airportTransfersDetail', label: 'Airport transfers' },
  { key: 'golfDayTransportDetail', label: 'Golf-day transport' },
  { key: 'boardBasis', label: 'Board basis' },
  { key: 'upgradeNotes', label: 'Upgrade notes' },
  { key: 'customerFullName', label: 'Customer name' },
  { key: 'customerEmail', label: 'Customer email' },
  { key: 'customerPhoneWhatsApp', label: 'Phone / WhatsApp' },
  { key: 'customerInterest', label: 'Customer interest' },
  { key: 'enquiryReferenceId', label: 'Enquiry reference' },
  { key: 'perPersonPrice', label: 'Per-person price' },
  { key: 'groupTotal', label: 'Group total' },
  { key: 'depositAmount', label: 'Deposit' },
  { key: 'remainingBalance', label: 'Remaining balance' }
]

const formatCell = (value: unknown): string => {
  if (value === null || value === undefined) {
    return ''
  }
  if (typeof value === 'string') {
    return value.trim()
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }
  if (Array.isArray(value)) {
    return value.filter((x) => typeof x === 'string').join('\n')
  }
  return ''
}

export function FormalProposalPayloadSummary(props: {
  readonly payload: FormalProposalPayload
  readonly proposalIdText: string
  readonly onDownloadPdf: () => void | Promise<void>
  readonly pdfLoading?: boolean
}) {
  const rows = DISPLAY_ROWS.map(({ key, label }) => {
    const text = formatCell(props.payload[key])
    return text ? { label, text } : null
  }).filter((x): x is { label: string; text: string } => Boolean(x))

  return (
    <div className="rounded-2xl border border-fairway-200/90 bg-gradient-to-br from-offwhite via-white to-[#f4faf6] p-5 shadow-inner md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Formal proposal</p>
          <p className="mt-1 font-mono text-sm font-semibold text-forest-950">{props.proposalIdText}</p>
          <p className="mt-2 max-w-2xl text-xs text-forest-600">
            Details Golf Sol Ireland prepared for this package build. Use Download PDF for the same document as email.
          </p>
        </div>
        <LuxuryButton disabled={props.pdfLoading === true} onClick={() => void props.onDownloadPdf()} type="button" variant="primary">
          {props.pdfLoading === true ? 'Preparing PDF…' : 'Download PDF'}
        </LuxuryButton>
      </div>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-forest-600">No proposal fields to display.</p>
      ) : (
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {rows.map((row) => (
            <div className="rounded-xl border border-forest-100 bg-white/90 px-3 py-2.5" key={row.label}>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-forest-500">{row.label}</dt>
              <dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-forest-900">{row.text}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
