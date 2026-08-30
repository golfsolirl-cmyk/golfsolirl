// @ts-ignore Shared runtime module lives outside src
import * as raw from '../../shared/admin-mail-quotation.mjs'

export type MailQuotationHotelOption = {
  id: string
  name: string
  pricePerPerson: string
  golferCount: string
}

export type MailQuotationPackage = {
  destination: string
  travelDates: string
  duration: string
  golfers: string
  hotelOptions: MailQuotationHotelOption[]
  hotels: string
  golf: string
  airportTransfers: string
  golfTransfers: string
  breakfast: string
  assistance: string
  extraNotes: string
  transferTotal: string
  transferPerPerson: string
  depositPercent: string
  depositAmount: string
  balanceDue: string
  balanceDueDate: string
  quoteExpiry: string
  nextSteps: string
  signOffName: string
  signOffPhone: string
  signOffEmail: string
}

export type MailQuotationField = {
  readonly key: keyof MailQuotationPackage
  readonly label: string
  readonly placeholder: string
  readonly multiline?: boolean
}

export type MailQuotationComputed = {
  golfers: number
  options: Array<MailQuotationHotelOption & {
    pricePerPersonValue: number
    golferCountValue: number
    total: number
    summary: string
  }>
  leadTotal: number
  fromPerPerson: number
  depositPercent: number
  depositAmount: number
  balanceDue: number
  transferTotal: number
  transferPerPerson: number
}

const runtime = raw as unknown as {
  readonly MAIL_QUOTATION_INCLUDE_FIELDS: readonly MailQuotationField[]
  readonly MAIL_QUOTATION_NOTE_FIELDS: readonly MailQuotationField[]
  readonly MAIL_QUOTATION_FIELD_GROUPS: readonly {
    readonly id: string
    readonly title: string
    readonly fields: readonly MailQuotationField[]
  }[]
  readonly emptyHotelOption: (partial?: Partial<MailQuotationHotelOption>) => MailQuotationHotelOption
  readonly emptyMailQuotationPackage: () => MailQuotationPackage
  readonly normalizeMailQuotationPackage: (raw?: unknown) => MailQuotationPackage
  readonly prefillMailQuotationPackage: (
    raw?: unknown,
    extras?: { travelDates?: string; golfers?: string; numberOfGuests?: string; destination?: string; interest?: string }
  ) => MailQuotationPackage
  readonly quotationMailClosing: (pkg?: unknown) => string
  readonly buildQuotationMailBody: (pkg?: unknown, extras?: { reference?: string; firstName?: string }) => string
  readonly quotationMailVarsFromPackage: (pkg?: unknown) => Record<string, string>
  readonly quotationComputed: (pkg?: unknown) => MailQuotationComputed
  readonly formatQuotationEuro: (value: number) => string
  readonly parseQuotationMoney: (raw?: unknown) => number
  readonly hotelOptionSummary: (opt: MailQuotationHotelOption) => string
  readonly createMailQuotationReferenceId: () => string
}

export const MAIL_QUOTATION_INCLUDE_FIELDS = runtime.MAIL_QUOTATION_INCLUDE_FIELDS
export const MAIL_QUOTATION_NOTE_FIELDS = runtime.MAIL_QUOTATION_NOTE_FIELDS
export const MAIL_QUOTATION_FIELD_GROUPS = runtime.MAIL_QUOTATION_FIELD_GROUPS
export const emptyHotelOption = (partial?: Partial<MailQuotationHotelOption>): MailQuotationHotelOption =>
  runtime.emptyHotelOption(partial)
export const emptyMailQuotationPackage = (): MailQuotationPackage => runtime.emptyMailQuotationPackage()
export const normalizeMailQuotationPackage = (value?: unknown): MailQuotationPackage =>
  runtime.normalizeMailQuotationPackage(value)
export const prefillMailQuotationPackage = (
  value?: unknown,
  extras?: { travelDates?: string; golfers?: string; numberOfGuests?: string; destination?: string; interest?: string }
): MailQuotationPackage => runtime.prefillMailQuotationPackage(value, extras)
export const quotationMailClosing = (pkg?: unknown): string => runtime.quotationMailClosing(pkg)
export const buildQuotationMailBody = (
  pkg?: unknown,
  extras?: { reference?: string; firstName?: string }
): string => runtime.buildQuotationMailBody(pkg, extras)
export const quotationMailVarsFromPackage = (pkg?: unknown): Record<string, string> =>
  runtime.quotationMailVarsFromPackage(pkg)
export const quotationComputed = (pkg?: unknown): MailQuotationComputed => runtime.quotationComputed(pkg)
export const formatQuotationEuro = (value: number): string => runtime.formatQuotationEuro(value)
export const parseQuotationMoney = (raw?: unknown): number => runtime.parseQuotationMoney(raw)
export const hotelOptionSummary = (opt: MailQuotationHotelOption): string => runtime.hotelOptionSummary(opt)
export const createMailQuotationReferenceId = (): string => runtime.createMailQuotationReferenceId()
