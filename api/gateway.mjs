/**
 * Single Vercel Serverless entry for all /api/* routes (Hobby plan function limit).
 * vercel.json rewrites each public path to /api/gateway?r=...
 */
import { handleEnquirySubmission, handleTermsEmailRequest } from '../server/enquiry-service.mjs'
import { getFormEmailPreviewHtml } from '../server/form-email-browser-preview.mjs'
import { getBrandedSampleDocumentPreviewHtml } from '../server/branded-sample-document-html.mjs'
import { handleMagicLinkRequest } from '../server/magic-link-service.mjs'
import { handleSyncPortalProfile } from '../server/sync-portal-profile-service.mjs'
import { handlePortalContactSetup } from '../server/portal-contact-setup-service.mjs'
import { handleSendClientPortalEmail } from '../server/client-portal-email-service.mjs'
import { handleSendWebsiteQuoteEmail } from '../server/website-quote-email.mjs'
import { handleSyncWebsiteQuotePortalPayment } from '../server/sync-website-quote-portal-payment.mjs'
import { createProposalFilename, createProposalPdf } from '../server/proposal-service.mjs'
import { buildHomepageBrandedClientPdfBytes } from '../server/homepage-branded-client-pdf.mjs'
import { handleSendClientDocument } from '../server/send-client-document-service.mjs'
import {
  handleSendHotelReservationBrief,
  handleSendWorkspaceProposalToClient
} from '../server/admin-workspace-email-service.mjs'
import { handleSendProposalToClient } from '../server/send-proposal-client-service.mjs'
import { handleAdminPortalClient } from '../server/admin-portal-client-service.mjs'
import { handlePackageBuildAdminPublish } from '../server/package-build-admin-publish-service.mjs'
import { handlePortalInterestTicketReply } from '../server/portal-interest-ticket-reply-service.mjs'
import { handleTransferBookingNotify } from '../server/transfer-booking-notify-service.mjs'
import {
  handleTransferBookingNoDriverSweep,
  handleTransferRejectNoDriver
} from '../server/transfer-booking-no-driver-service.mjs'
import { handleTransferBalanceReminderSweep, handleTransferPaymentAdmin } from '../server/transfer-payment-service.mjs'
import { handleTransferRefund } from '../server/transfer-refund-service.mjs'
import { handleRegeneratePortalPdfs } from '../server/transfer-portal-regenerate-pdfs.mjs'
import { guardHomepageClientPdfRequest, guardProposalPdfRequest } from '../server/pdf-route-guards.mjs'
import { handleTripReviewSubmit } from '../server/trip-review-submit-service.mjs'
import { handleWebsiteTestimonialSubmit } from '../server/website-testimonial-service.mjs'
import { handlePortalInvoiceSend } from '../server/portal-invoice-send-service.mjs'
import { handlePortalLinkIssue, handlePortalLinkVerify } from '../server/portal-link-context-service.mjs'
import { handleStripeWebhook } from '../server/stripe-webhook-service.mjs'
import { handleTransferStripeCheckout } from '../server/transfer-checkout-service.mjs'
import { handleTransferCheckoutSync } from '../server/transfer-checkout-sync-service.mjs'
import { readIncomingMessageBodyUtf8, readIncomingMessageBodyBuffer } from '../server/vercel-read-body.mjs'

const readStreamBody = (req) =>
  new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      resolve(body)
    })
    req.on('error', reject)
  })

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.trim() !== '') {
    return forwarded.split(',')[0]?.trim() ?? 'unknown'
  }
  return req.socket?.remoteAddress ?? 'unknown'
}

/** Baseline headers on every gateway response (JSON, HTML previews, PDF, webhook ack). */
const applyApiSecurityHeaders = (res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
}

const jsonEnd = (res, statusCode, payload) => {
  applyApiSecurityHeaders(res)
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

const resolveRouteKey = (req) => {
  const q = req.query?.r
  if (typeof q === 'string' && q.trim()) {
    return q.trim()
  }
  if (Array.isArray(q) && typeof q[0] === 'string' && q[0].trim()) {
    return q[0].trim()
  }
  const url = typeof req.url === 'string' ? req.url : ''
  const i = url.indexOf('?')
  if (i === -1) {
    return ''
  }
  return new URLSearchParams(url.slice(i + 1)).get('r')?.trim() ?? ''
}

export default async function handler(req, res) {
  const route = resolveRouteKey(req)

  if (!route) {
    jsonEnd(res, 404, { message: 'Not found.' })
    return
  }

  try {
    switch (route) {
      case 'enquiry': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const rawBody = await readStreamBody(req)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        let waitUntilFn = null
        try {
          const vercelFns = await import('@vercel/functions')
          waitUntilFn = typeof vercelFns.waitUntil === 'function' ? vercelFns.waitUntil : null
        } catch {
          /* non-Vercel */
        }
        const result = await handleEnquirySubmission(payload, process.env, {
          waitUntil: waitUntilFn ?? undefined,
          clientIp: getClientIp(req)
        })
        jsonEnd(res, 200, result)
        return
      }

      case 'terms-email': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const rawBody = await readStreamBody(req)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const result = await handleTermsEmailRequest(payload, process.env)
        jsonEnd(res, 200, result)
        return
      }

      case 'email-preview-html': {
        if (req.method !== 'GET') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        try {
          const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'localhost')
            .split(',')[0]
            ?.trim()
          const protoRaw = String(req.headers['x-forwarded-proto'] || 'https')
            .split(',')[0]
            ?.trim()
          const safeProto = protoRaw === 'http' || protoRaw === 'https' ? protoRaw : 'https'
          const urlPath = typeof req.url === 'string' ? req.url : '/'
          const u = new URL(urlPath, `${safeProto}://${host}`)
          const t = u.searchParams.get('t')?.trim() || 'enquiry-customer'
          const origin = `${safeProto}://${host}`
          const html = getFormEmailPreviewHtml(t, origin)
          applyApiSecurityHeaders(res)
          res.statusCode = 200
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.setHeader('Cache-Control', 'no-store')
          res.end(html)
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Bad request'
          jsonEnd(res, 400, { message })
        }
        return
      }

      case 'sample-branded-document-html': {
        if (req.method !== 'GET') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        try {
          const html = getBrandedSampleDocumentPreviewHtml()
          applyApiSecurityHeaders(res)
          res.statusCode = 200
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.setHeader('Cache-Control', 'no-store')
          res.end(html)
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Bad request'
          jsonEnd(res, 400, { message })
        }
        return
      }

      case 'sync-portal-profile': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const authHeader = req.headers.authorization ?? ''
        const result = await handleSyncPortalProfile(process.env, { authHeader })
        jsonEnd(res, 200, result)
        return
      }

      case 'portal-contact-setup': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const raw = await readIncomingMessageBodyUtf8(req)
        const payload = raw ? JSON.parse(raw) : {}
        const authHeader = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
        const result = await handlePortalContactSetup(payload, process.env, { authHeader })
        jsonEnd(res, 200, result)
        return
      }

      case 'magic-link': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const rawBody = await readStreamBody(req)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const result = await handleMagicLinkRequest(payload, process.env, { clientIp: getClientIp(req) })
        jsonEnd(res, 200, result)
        return
      }

      case 'proposal-pdf': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        await guardProposalPdfRequest(req, process.env, getClientIp)
        const rawBody = await readIncomingMessageBodyUtf8(req)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const { pdfBytes, proposal } = await createProposalPdf(payload)
        const filename = createProposalFilename(proposal.proposalId)
        applyApiSecurityHeaders(res)
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
        res.end(Buffer.from(pdfBytes))
        return
      }

      case 'homepage-client-pdf': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        await guardHomepageClientPdfRequest(req, process.env, getClientIp)
        const rawBody = await readIncomingMessageBodyUtf8(req)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const pdfBytes = await buildHomepageBrandedClientPdfBytes(payload)
        const ref =
          typeof payload.enquiryRef === 'string' && payload.enquiryRef.trim()
            ? payload.enquiryRef.trim().replace(/[^\w-]+/g, '-')
            : 'trip-overview'
        applyApiSecurityHeaders(res)
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="GolfSol-${ref}.pdf"`)
        res.end(Buffer.from(pdfBytes))
        return
      }

      case 'send-client-document': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const rawBody = await readStreamBody(req)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const authHeader = req.headers.authorization ?? ''
        const result = await handleSendClientDocument(payload, process.env, { authHeader })
        jsonEnd(res, 200, result)
        return
      }

      case 'send-proposal-to-client': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const rawBody = await readStreamBody(req)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const authHeader = req.headers.authorization ?? ''
        const result = await handleSendProposalToClient(payload, process.env, { authHeader })
        jsonEnd(res, 200, result)
        return
      }

      case 'send-client-portal-email': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const raw = await readIncomingMessageBodyUtf8(req)
        const payload = raw ? JSON.parse(raw) : {}
        const authHeader = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
        const result = await handleSendClientPortalEmail(payload, process.env, { authHeader })
        jsonEnd(res, 200, result)
        return
      }

      case 'send-website-quote-email': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const raw = await readIncomingMessageBodyUtf8(req)
        const payload = raw ? JSON.parse(raw) : {}
        const authHeader = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
        const result = await handleSendWebsiteQuoteEmail(payload, process.env, { authHeader })
        jsonEnd(res, 200, result)
        return
      }

      case 'sync-website-quote-payment': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const raw = await readIncomingMessageBodyUtf8(req)
        const payload = raw ? JSON.parse(raw) : {}
        const authHeader = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
        const result = await handleSyncWebsiteQuotePortalPayment(payload, process.env, { authHeader })
        jsonEnd(res, 200, result)
        return
      }

      case 'send-hotel-brief': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const raw = await readIncomingMessageBodyUtf8(req)
        const payload = raw ? JSON.parse(raw) : {}
        const authHeader = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
        const result = await handleSendHotelReservationBrief(payload, process.env, { authHeader })
        jsonEnd(res, 200, result)
        return
      }

      case 'send-workspace-proposal': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const raw = await readIncomingMessageBodyUtf8(req)
        const payload = raw ? JSON.parse(raw) : {}
        const authHeader = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
        const result = await handleSendWorkspaceProposalToClient(payload, process.env, { authHeader })
        jsonEnd(res, 200, result)
        return
      }

      case 'admin-portal-client': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const raw = await readIncomingMessageBodyUtf8(req)
        const payload = raw ? JSON.parse(raw) : {}
        const authHeader = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
        const result = await handleAdminPortalClient(payload, process.env, { authHeader })
        jsonEnd(res, 200, result)
        return
      }

      case 'portal-interest-ticket-reply': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const raw = await readIncomingMessageBodyUtf8(req)
        const payload = raw ? JSON.parse(raw) : {}
        const authHeader = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
        const result = await handlePortalInterestTicketReply(payload, process.env, { authHeader })
        jsonEnd(res, 200, result)
        return
      }

      case 'portal-link-verify': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const raw = await readIncomingMessageBodyUtf8(req)
        const payload = raw ? JSON.parse(raw) : {}
        const result = await handlePortalLinkVerify(payload, process.env)
        jsonEnd(res, 200, result)
        return
      }

      case 'portal-link-issue': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const raw = await readIncomingMessageBodyUtf8(req)
        const payload = raw ? JSON.parse(raw) : {}
        const authHeader = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
        const result = await handlePortalLinkIssue(payload, process.env, { authHeader })
        jsonEnd(res, 200, result)
        return
      }

      case 'transfer-notify': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const raw = await readIncomingMessageBodyUtf8(req)
        const payload = raw ? JSON.parse(raw) : {}
        const authHeader = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
        const result = await handleTransferBookingNotify(process.env, { authHeader, payload })
        jsonEnd(res, 200, result)
        return
      }

      case 'transfer-reject-no-driver': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const raw = await readIncomingMessageBodyUtf8(req)
        const payload = raw ? JSON.parse(raw) : {}
        const authHeader = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
        const result = await handleTransferRejectNoDriver(payload, process.env, { authHeader })
        jsonEnd(res, 200, result)
        return
      }

      case 'transfer-booking-sweep': {
        if (req.method !== 'GET' && req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const authHeader = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
        const result = await handleTransferBookingNoDriverSweep(process.env, { authHeader })
        jsonEnd(res, 200, result)
        return
      }

      case 'transfer-balance-reminder-sweep': {
        if (req.method !== 'GET' && req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const authHeader = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
        const result = await handleTransferBalanceReminderSweep(process.env, { authHeader })
        jsonEnd(res, 200, result)
        return
      }

      case 'transfer-payment-admin': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const raw = await readIncomingMessageBodyUtf8(req)
        const payload = raw ? JSON.parse(raw) : {}
        const authHeader = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
        const result = await handleTransferPaymentAdmin(payload, process.env, { authHeader })
        jsonEnd(res, 200, result)
        return
      }

      case 'package-build-admin-publish': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const raw = await readIncomingMessageBodyUtf8(req)
        const payload = raw ? JSON.parse(raw) : {}
        const authHeader = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
        const result = await handlePackageBuildAdminPublish(payload, process.env, { authHeader })
        jsonEnd(res, 200, result)
        return
      }

      case 'transfer-refund': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const raw = await readIncomingMessageBodyUtf8(req)
        const payload = raw ? JSON.parse(raw) : {}
        const authHeader = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
        const result = await handleTransferRefund(payload, process.env, { authHeader })
        jsonEnd(res, 200, result)
        return
      }

      case 'regenerate-portal-pdfs': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const raw = await readIncomingMessageBodyUtf8(req)
        const payload = raw ? JSON.parse(raw) : {}
        const authHeader = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
        const result = await handleRegeneratePortalPdfs(payload, process.env, { authHeader })
        jsonEnd(res, 200, result)
        return
      }

      case 'transfer-checkout': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const raw = await readIncomingMessageBodyUtf8(req)
        const payload = raw ? JSON.parse(raw) : {}
        const authHeader = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
        const result = await handleTransferStripeCheckout(payload, process.env, { authHeader })
        jsonEnd(res, 200, result)
        return
      }

      case 'transfer-checkout-sync': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const raw = await readIncomingMessageBodyUtf8(req)
        const payload = raw ? JSON.parse(raw) : {}
        const authHeader = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
        const result = await handleTransferCheckoutSync(payload, process.env, { authHeader })
        jsonEnd(res, 200, result)
        return
      }

      case 'trip-review-submit': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const raw = await readIncomingMessageBodyUtf8(req)
        const payload = raw ? JSON.parse(raw) : {}
        const result = await handleTripReviewSubmit(process.env, { payload })
        jsonEnd(res, 200, result)
        return
      }

      case 'website-testimonial': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const raw = await readIncomingMessageBodyUtf8(req)
        const payload = raw ? JSON.parse(raw) : {}
        const result = await handleWebsiteTestimonialSubmit(process.env, {
          payload,
          clientIp: getClientIp(req)
        })
        jsonEnd(res, 200, result)
        return
      }

      case 'portal-invoice-send': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const raw = await readIncomingMessageBodyUtf8(req)
        const payload = raw ? JSON.parse(raw) : {}
        const authHeader = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
        const result = await handlePortalInvoiceSend(payload, process.env, { authHeader })
        jsonEnd(res, 200, result)
        return
      }

      case 'stripe-webhook': {
        if (req.method !== 'POST') {
          jsonEnd(res, 405, { message: 'Method not allowed' })
          return
        }
        const rawBuffer = await readIncomingMessageBodyBuffer(req)
        const sig = req.headers['stripe-signature']
        const result = await handleStripeWebhook(rawBuffer, sig, process.env)
        jsonEnd(res, 200, result)
        return
      }

      default:
        jsonEnd(res, 404, { message: 'Unknown API route.' })
        return
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed.'
    const statusCode =
      error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
        ? error.statusCode
        : 500
    const code =
      error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' ? error.code : undefined
    jsonEnd(res, statusCode, code ? { message, code } : { message })
  }
}
