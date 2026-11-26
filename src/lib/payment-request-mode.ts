/**
 * Typed re-export of shared payment-request mode helpers.
 */
// @ts-ignore Shared runtime module lives outside src
import * as raw from '../../shared/payment-request-mode.mjs'

export type PaymentRequestMode = 'deposit_20' | 'full'

export type PaymentRequestResolved = {
  readonly mode: PaymentRequestMode
  readonly tripTotalEur: number
  readonly depositEur: number
  readonly amountReceivedEur: number
  readonly outstandingEur: number
  readonly amountNowEur: number
  readonly remainingAfterNowEur: number
}

export type PaymentRequestMeta = {
  readonly mode: PaymentRequestMode
  readonly tripTotalEur: number
  readonly depositEur: number
  readonly amountNowEur: number
  readonly amountReceivedEur: number
  readonly remainingAfterNowEur: number
}

export const PAYMENT_REQUEST_MODES = raw.PAYMENT_REQUEST_MODES as readonly PaymentRequestMode[]

export const roundMoney2 = raw.roundMoney2 as (raw: unknown) => number | null
export const normalizePaymentRequestMode = raw.normalizePaymentRequestMode as (raw: unknown) => PaymentRequestMode
export const calcDeposit20Eur = raw.calcDeposit20Eur as (tripTotalEur: number | null | undefined) => number | null
export const resolvePaymentRequestAmounts = raw.resolvePaymentRequestAmounts as (input?: {
  mode?: unknown
  tripTotalEur?: unknown
  depositEur?: unknown
  amountReceivedEur?: unknown
}) => PaymentRequestResolved
export const buildPaymentRequestMeta = raw.buildPaymentRequestMeta as (
  resolved: PaymentRequestResolved
) => PaymentRequestMeta
export const readPaymentRequestMeta = raw.readPaymentRequestMeta as (
  tripDetails: unknown
) => PaymentRequestMeta | null
export const formatEurIe = raw.formatEurIe as (n: number) => string
export const paymentRequestSummaryLabel = raw.paymentRequestSummaryLabel as (
  resolved: PaymentRequestResolved
) => string
export const paymentRequestCustomerCopy = raw.paymentRequestCustomerCopy as (
  resolved: PaymentRequestResolved | PaymentRequestMeta,
  opts?: { amountCentsFallback?: number }
) => {
  mode: PaymentRequestMode
  headline: string
  amountNowLabel: string
  amountNowEur: number
  rows: [string, string][]
  leadExtra: string
}
