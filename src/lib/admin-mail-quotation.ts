// @ts-ignore Shared runtime module lives outside src
import * as raw from '../../shared/admin-mail-quotation.mjs'

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

const runtime = raw as unknown as {
  readonly MAIL_QUOTATION_FIELD_GROUPS: readonly MailQuotationFieldGroup[]
  readonly emptyMailQuotationPackage: () => MailQuotationPackage
  readonly normalizeMailQuotationPackage: (raw?: unknown) => MailQuotationPackage
  readonly prefillMailQuotationPackage: (
    raw?: unknown,
    extras?: { travelDates?: string; golfers?: string; numberOfGuests?: string }
  ) => MailQuotationPackage
  readonly quotationMailClosing: (pkg?: unknown) => string
  readonly buildQuotationMailBody: (pkg?: unknown, extras?: { reference?: string; firstName?: string }) => string
  readonly quotationMailVarsFromPackage: (pkg?: unknown, extras?: Record<string, string>) => Record<string, string>
}

export const MAIL_QUOTATION_FIELD_GROUPS = runtime.MAIL_QUOTATION_FIELD_GROUPS
export const emptyMailQuotationPackage = (): MailQuotationPackage => runtime.emptyMailQuotationPackage()
export const normalizeMailQuotationPackage = (value?: unknown): MailQuotationPackage =>
  runtime.normalizeMailQuotationPackage(value)
export const prefillMailQuotationPackage = (
  value?: unknown,
  extras?: { travelDates?: string; golfers?: string; numberOfGuests?: string }
): MailQuotationPackage => runtime.prefillMailQuotationPackage(value, extras)
export const quotationMailClosing = (pkg?: unknown): string => runtime.quotationMailClosing(pkg)
export const buildQuotationMailBody = (
  pkg?: unknown,
  extras?: { reference?: string; firstName?: string }
): string => runtime.buildQuotationMailBody(pkg, extras)
export const quotationMailVarsFromPackage = (pkg?: unknown, extras?: Record<string, string>): Record<string, string> =>
  runtime.quotationMailVarsFromPackage(pkg, extras)
