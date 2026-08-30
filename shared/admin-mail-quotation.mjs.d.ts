export function createMailQuotationReferenceId(): string
export function emptyHotelOption(partial?: {
  id?: string
  name?: string
  pricePerPerson?: string
  golferCount?: string
}): {
  id: string
  name: string
  pricePerPerson: string
  golferCount: string
}
export function parseQuotationMoney(raw?: unknown): number
export function formatQuotationEuro(value: number): string
export function hotelOptionTotal(opt?: unknown): number
export function hotelOptionSummary(opt?: unknown): string
export const MAIL_QUOTATION_INCLUDE_FIELDS: readonly {
  readonly key: string
  readonly label: string
  readonly placeholder: string
  readonly multiline?: boolean
}[]
export const MAIL_QUOTATION_NOTE_FIELDS: readonly {
  readonly key: string
  readonly label: string
  readonly placeholder: string
  readonly multiline?: boolean
}[]
export function emptyMailQuotationPackage(): Record<string, unknown>
export function normalizeMailQuotationPackage(raw?: unknown): Record<string, unknown>
export function quotationComputed(pkg?: unknown): Record<string, unknown>
export function prefillMailQuotationPackage(raw?: unknown, extras?: Record<string, string>): Record<string, unknown>
export function quotationMailClosing(pkg?: unknown): string
export function buildQuotationMailBody(pkg?: unknown, extras?: { reference?: string; firstName?: string }): string
export function quotationMailVarsFromPackage(pkg?: unknown): Record<string, string>
