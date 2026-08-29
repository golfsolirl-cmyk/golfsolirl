// @ts-ignore Shared runtime module lives outside src
import * as raw from '../../shared/client-enquiry-document.mjs'

export type ClientDocumentTypeId =
  | 'enquiry_response'
  | 'quotation'
  | 'proposal'
  | 'booking_confirmation'
  | 'customer_letter'
  | 'custom'

export type ClientDocumentStatus = 'draft' | 'completed' | 'sent'

export type ClientDocumentCompany = {
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

export type ClientDocumentPricingMode = 'detailed' | 'single'

export type ClientDocumentSections = {
  enquiry: boolean
  message: boolean
  pricing: boolean
  notes: boolean
  payment: boolean
  terms: boolean
  signature: boolean
}

export type ClientDocumentCustomer = {
  name: string
  company: string
  contactName: string
  email: string
  phone: string
  address: string
}

export type ClientDocumentPricingLine = {
  id: string
  description: string
  qty: number
  unitPrice: number
}

export type ClientDocumentDraft = {
  id: string | null
  enquiryId: string | null
  enquiryReference: string
  status: ClientDocumentStatus
  documentType: ClientDocumentTypeId
  customTitle: string
  reference: string
  subject: string
  documentDate: string
  validUntil: string
  customer: ClientDocumentCustomer
  message: string
  enquirySummary: string
  notes: string
  terms: string
  paymentDetails: string
  sections: ClientDocumentSections
  pricingMode: ClientDocumentPricingMode
  vatEnabled: boolean
  vatPercent: number
  pricingLines: ClientDocumentPricingLine[]
  singlePrice: { description: string; total: number }
}

export type ClientDocumentListRow = {
  id: string
  reference: string
  customerName: string
  customerEmail: string
  documentType: string
  documentTitle: string
  documentDate: string
  total: number | null
  status: string
  enquiryReference: string | null
  enquiryId: string | null
  updatedAt: string
  createdAt: string
}

export type ClientDocumentMessageBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'bullets'; items: string[] }

export type ClientDocumentView = {
  title: string
  subject: string
  reference: string
  dateLabel: string
  validUntilLabel: string
  company: ClientDocumentCompany
  companyLines: string[]
  preparedFor: string[]
  enquirySummary: string
  message: string
  messageBlocks: ClientDocumentMessageBlock[]
  notes: string
  terms: string
  paymentDetails: string
  sections: ClientDocumentSections
  pricing: {
    mode: string
    lines: readonly { description: string; qty: number; unitPrice: number; lineTotal: number; id?: string }[]
    subtotal: number
    vatAmount: number
    vatPercent: number
    vatEnabled: boolean
    total: number
  }
  footerLine: string
  filenameBase: string
}

const runtime = raw as unknown as {
  CLIENT_DOCUMENT_COMPANY: ClientDocumentCompany
  CLIENT_DOCUMENT_VAT_PERCENT: number
  CLIENT_DOCUMENT_TYPES: readonly { readonly id: ClientDocumentTypeId; readonly label: string }[]
  CLIENT_DOCUMENT_STATUSES: readonly ClientDocumentStatus[]
  DEFAULT_CLIENT_DOCUMENT_SECTIONS: ClientDocumentSections
  DEFAULT_CLIENT_DOCUMENT_TERMS: string
  DEFAULT_CLIENT_DOCUMENT_PAYMENT: string
  createClientDocumentReferenceId: () => string
  formatClientDocumentLongDate: (value: string) => string
  todayIsoDate: () => string
  formatClientDocumentEuro: (value: number) => string
  documentTypeLabel: (type: string, customTitle?: string) => string
  emptyPricingLine: () => ClientDocumentPricingLine
  defaultClientDocumentDraft: (overrides?: Partial<ClientDocumentDraft>) => ClientDocumentDraft
  calculateClientDocumentPricing: (draft: ClientDocumentDraft) => ClientDocumentView['pricing']
  companyHeaderLines: () => string[]
  companyFooterLine: () => string
  preparedForLines: (customer: ClientDocumentCustomer) => string[]
  parseMessageBlocks: (message: string) => ClientDocumentMessageBlock[]
  buildClientDocumentFilename: (draft: ClientDocumentDraft, ext: string) => string
  buildClientDocumentView: (draft: ClientDocumentDraft) => ClientDocumentView
  normalizeClientDocumentDraft: (rawDraft: unknown) => ClientDocumentDraft
  draftFromEnquiryRow: (enquiry: unknown) => ClientDocumentDraft
}

export const CLIENT_DOCUMENT_COMPANY = runtime.CLIENT_DOCUMENT_COMPANY
export const CLIENT_DOCUMENT_VAT_PERCENT = runtime.CLIENT_DOCUMENT_VAT_PERCENT
export const CLIENT_DOCUMENT_TYPES = runtime.CLIENT_DOCUMENT_TYPES
export const CLIENT_DOCUMENT_STATUSES = runtime.CLIENT_DOCUMENT_STATUSES
export const DEFAULT_CLIENT_DOCUMENT_SECTIONS = runtime.DEFAULT_CLIENT_DOCUMENT_SECTIONS
export const DEFAULT_CLIENT_DOCUMENT_TERMS = runtime.DEFAULT_CLIENT_DOCUMENT_TERMS
export const DEFAULT_CLIENT_DOCUMENT_PAYMENT = runtime.DEFAULT_CLIENT_DOCUMENT_PAYMENT
export const createClientDocumentReferenceId = runtime.createClientDocumentReferenceId
export const formatClientDocumentLongDate = runtime.formatClientDocumentLongDate
export const todayIsoDate = runtime.todayIsoDate
export const formatClientDocumentEuro = runtime.formatClientDocumentEuro
export const documentTypeLabel = runtime.documentTypeLabel
export const emptyPricingLine = runtime.emptyPricingLine
export const defaultClientDocumentDraft = runtime.defaultClientDocumentDraft
export const calculateClientDocumentPricing = runtime.calculateClientDocumentPricing
export const companyHeaderLines = runtime.companyHeaderLines
export const companyFooterLine = runtime.companyFooterLine
export const preparedForLines = runtime.preparedForLines
export const parseMessageBlocks = runtime.parseMessageBlocks
export const buildClientDocumentFilename = runtime.buildClientDocumentFilename
export const buildClientDocumentView = runtime.buildClientDocumentView
export const normalizeClientDocumentDraft = runtime.normalizeClientDocumentDraft
export const draftFromEnquiryRow = runtime.draftFromEnquiryRow
