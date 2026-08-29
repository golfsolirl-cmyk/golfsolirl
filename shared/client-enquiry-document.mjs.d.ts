export const CLIENT_DOCUMENT_COMPANY: {
  readonly name: string
  readonly tagline: string
  readonly addressLines: readonly string[]
  readonly irishPhone: string
  readonly spanishPhone: string
  readonly email: string
  readonly websiteDisplay: string
  readonly websiteUrl: string
  readonly companyReg: string
  readonly logoPublicPath: string
  readonly logoFilename: string
}

export const CLIENT_DOCUMENT_VAT_PERCENT: number
export const CLIENT_DOCUMENT_TYPES: readonly { readonly id: string; readonly label: string }[]
export const CLIENT_DOCUMENT_STATUSES: readonly string[]
export const DEFAULT_CLIENT_DOCUMENT_SECTIONS: Record<string, boolean>
export const DEFAULT_CLIENT_DOCUMENT_TERMS: string
export const DEFAULT_CLIENT_DOCUMENT_PAYMENT: string

export function createClientDocumentReferenceId(): string
export function formatClientDocumentLongDate(value: string): string
export function todayIsoDate(): string
export function formatClientDocumentEuro(value: number): string
export function documentTypeLabel(type: string, customTitle?: string): string
export function emptyPricingLine(): { id: string; description: string; qty: number; unitPrice: number }
export function defaultClientDocumentDraft(overrides?: Record<string, unknown>): Record<string, unknown>
export function calculateClientDocumentPricing(draft: unknown): {
  mode: string
  lines: readonly { description: string; qty: number; unitPrice: number; lineTotal: number; id?: string }[]
  subtotal: number
  vatAmount: number
  vatPercent: number
  vatEnabled: boolean
  total: number
}
export function companyHeaderLines(): string[]
export function companyFooterLine(): string
export function preparedForLines(customer: unknown): string[]
export function parseMessageBlocks(message: string): { type: string; text?: string; items?: string[] }[]
export function buildClientDocumentFilename(draft: unknown, ext: string): string
export function buildClientDocumentView(draft: unknown): Record<string, unknown>
export function readEnquiryFormFields(formPayload: unknown): Record<string, string>
export function buildEnquirySummaryFromRow(enquiry: unknown): string
export function draftFromEnquiryRow(enquiry: unknown): Record<string, unknown>
export function normalizeClientDocumentDraft(raw: unknown): Record<string, unknown>
export function draftToDbRow(draft: unknown, createdBy?: string | null): Record<string, unknown>
export function dbRowToDraft(row: unknown): Record<string, unknown>
export function listRowFromDb(row: unknown): Record<string, unknown>
