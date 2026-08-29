export type MailQuotationPackage = {
  destination: string
  travelDates: string
  duration: string
  golfers: string
  priceFiveStar: string
  priceFourStar: string
  hotels: string
  golf: string
  airportTransfers: string
  golfTransfers: string
  breakfast: string
  assistance: string
  extraNotes: string
  transferTotal: string
  nextSteps: string
  signOffName: string
  signOffPhone: string
}

export type MailQuotationField = {
  readonly key: keyof MailQuotationPackage
  readonly label: string
  readonly placeholder: string
  readonly multiline?: boolean
}

export type MailQuotationFieldGroup = {
  readonly id: string
  readonly title: string
  readonly fields: readonly MailQuotationField[]
}

export const MAIL_QUOTATION_FIELD_GROUPS: readonly MailQuotationFieldGroup[]
export function emptyMailQuotationPackage(): MailQuotationPackage
export function normalizeMailQuotationPackage(raw?: unknown): MailQuotationPackage
export function prefillMailQuotationPackage(
  raw?: unknown,
  extras?: { travelDates?: string; golfers?: string; numberOfGuests?: string }
): MailQuotationPackage
export function quotationMailClosing(pkg?: unknown): string
export function quotationPackageRows(
  pkg?: unknown,
  extras?: { reference?: string }
): { label: string; value: string }[]
export function buildQuotationMailBody(pkg?: unknown, extras?: { reference?: string; firstName?: string }): string
export function quotationMailVarsFromPackage(
  pkg?: unknown,
  extras?: Record<string, string>
): Record<string, string>
