import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { handleEnquirySubmission, handleTermsEmailRequest } from './server/enquiry-service.mjs'
import { handleMagicLinkRequest } from './server/magic-link-service.mjs'
import { handleSyncPortalProfile } from './server/sync-portal-profile-service.mjs'
import { handlePortalContactSetup } from './server/portal-contact-setup-service.mjs'
import { handleSendClientPortalEmail } from './server/client-portal-email-service.mjs'
import { handleSendWebsiteQuoteEmail } from './server/website-quote-email.mjs'
import { createProposalFilename, createProposalPdf } from './server/proposal-service.mjs'
import { handleSendClientDocument } from './server/send-client-document-service.mjs'
import {
  handleSendHotelReservationBrief,
  handleSendWorkspaceProposalToClient
} from './server/admin-workspace-email-service.mjs'
import { handleSendProposalToClient } from './server/send-proposal-client-service.mjs'
import { handleAdminPortalClient } from './server/admin-portal-client-service.mjs'
import { handlePortalInterestTicketReply } from './server/portal-interest-ticket-reply-service.mjs'
import { handleTransferBookingNotify } from './server/transfer-booking-notify-service.mjs'
import {
  handleTransferBookingNoDriverSweep,
  handleTransferRejectNoDriver
} from './server/transfer-booking-no-driver-service.mjs'
import { handleTransferBalanceReminderSweep, handleTransferPaymentAdmin } from './server/transfer-payment-service.mjs'
import { handleTransferRefund } from './server/transfer-refund-service.mjs'
import { handleTransferStripeCheckout } from './server/transfer-checkout-service.mjs'
import { handleTransferCheckoutSync } from './server/transfer-checkout-sync-service.mjs'
import { handlePortalInvoiceSend } from './server/portal-invoice-send-service.mjs'
import { handleStripeWebhook } from './server/stripe-webhook-service.mjs'
import { readIncomingMessageBodyBuffer } from './server/vercel-read-body.mjs'
import { handlePortalLinkIssue, handlePortalLinkVerify } from './server/portal-link-context-service.mjs'

const readRequestBody = (request: NodeJS.ReadableStream) =>
  new Promise<string>((resolve, reject) => {
    let body = ''

    request.on('data', (chunk) => {
      body += chunk.toString()
    })

    request.on('end', () => {
      resolve(body)
    })

    request.on('error', reject)
  })

const getClientIp = (request: import('http').IncomingMessage) => {
  const forwarded = request.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.trim() !== '') {
    return forwarded.split(',')[0]?.trim() ?? ''
  }

  return request.socket?.remoteAddress ?? 'unknown'
}

const devEnquiryApiPlugin = (serverEnv: Record<string, string>) => ({
  name: 'dev-enquiry-api',
  configureServer(server: import('vite').ViteDevServer) {
    server.middlewares.use('/api/enquiry', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const rawBody = await readRequestBody(request)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const result = await handleEnquirySubmission(
          payload,
          {
            ...process.env,
            ...serverEnv
          },
          {}
        )

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(result))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to send enquiry right now.'
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500

        response.statusCode = statusCode
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    server.middlewares.use('/api/terms-email', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const rawBody = await readRequestBody(request)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const result = await handleTermsEmailRequest(payload, {
          ...process.env,
          ...serverEnv
        })

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(result))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to send terms email right now.'
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500

        response.statusCode = statusCode
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    server.middlewares.use('/api/email-preview-html', async (request, response) => {
      if (request.method !== 'GET') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const host = (request.headers.host || 'localhost:5173').toString().split(',')[0]?.trim() || 'localhost:5173'
        const url = new URL(request.url || '/', `http://${host}`)
        const t = url.searchParams.get('t')?.trim() || 'enquiry-customer'
        const origin = `http://${host}`
        const { getFormEmailPreviewHtml } = await import('./server/form-email-browser-preview.mjs')
        const html = getFormEmailPreviewHtml(t, origin)
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/html; charset=utf-8')
        response.setHeader('Cache-Control', 'no-store')
        response.end(html)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Bad request'
        response.statusCode = 400
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    server.middlewares.use('/api/sample-branded-document-html', async (request, response) => {
      if (request.method !== 'GET') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const { getBrandedSampleDocumentPreviewHtml } = await import('./server/branded-sample-document-html.mjs')
        const html = getBrandedSampleDocumentPreviewHtml()
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/html; charset=utf-8')
        response.setHeader('Cache-Control', 'no-store')
        response.end(html)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Bad request'
        response.statusCode = 400
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    server.middlewares.use('/api/sync-portal-profile', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const authHeader = request.headers.authorization ?? ''
        const result = await handleSyncPortalProfile({ ...process.env, ...serverEnv }, { authHeader })

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(result))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to sync profile right now.'
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500

        response.statusCode = statusCode
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    server.middlewares.use('/api/portal-contact-setup', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const rawBody = await readRequestBody(request)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const authHeader = request.headers.authorization ?? ''
        const result = await handlePortalContactSetup(payload, { ...process.env, ...serverEnv }, { authHeader })

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(result))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to save contact details right now.'
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500

        response.statusCode = statusCode
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    server.middlewares.use('/api/auth/magic-link', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const rawBody = await readRequestBody(request)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const result = await handleMagicLinkRequest(payload, { ...process.env, ...serverEnv }, {
          clientIp: getClientIp(request)
        })

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(result))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to send sign-in email right now.'
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500

        response.statusCode = statusCode
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    server.middlewares.use('/api/proposal-pdf', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const rawBody = await readRequestBody(request)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const { pdfBytes, proposal } = await createProposalPdf(payload)
        const filename = createProposalFilename(proposal.proposalId)

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/pdf')
        response.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
        response.end(Buffer.from(pdfBytes))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to generate proposal PDF right now.'
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500

        response.statusCode = statusCode
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    server.middlewares.use('/api/send-client-document', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const rawBody = await readRequestBody(request)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const authHeader = request.headers.authorization ?? ''
        const result = await handleSendClientDocument(payload, { ...process.env, ...serverEnv }, { authHeader })

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(result))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to send document right now.'
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500

        response.statusCode = statusCode
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    server.middlewares.use('/api/send-proposal-to-client', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const rawBody = await readRequestBody(request)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const authHeader = request.headers.authorization ?? ''
        const result = await handleSendProposalToClient(payload, { ...process.env, ...serverEnv }, { authHeader })

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(result))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to send proposal right now.'
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500

        response.statusCode = statusCode
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    const workspaceEmailApi = (
      path: string,
      handler: (body: unknown, env: NodeJS.ProcessEnv, meta: { authHeader: string }) => Promise<unknown>
    ) => {
      server.middlewares.use(path, async (request, response) => {
        if (request.method !== 'POST') {
          response.statusCode = 405
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ message: 'Method not allowed' }))
          return
        }

        try {
          const rawBody = await readRequestBody(request)
          const payload = rawBody ? JSON.parse(rawBody) : {}
          const authHeader = request.headers.authorization ?? ''
          const result = await handler(payload, { ...process.env, ...serverEnv }, { authHeader })

          response.statusCode = 200
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify(result))
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to send email right now.'
          const statusCode =
            error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
              ? error.statusCode
              : 500

          response.statusCode = statusCode
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ message }))
        }
      })
    }

    workspaceEmailApi('/api/send-workspace-proposal', handleSendWorkspaceProposalToClient)
    workspaceEmailApi('/api/send-hotel-brief', handleSendHotelReservationBrief)

    workspaceEmailApi('/api/send-client-portal-email', handleSendClientPortalEmail)
    workspaceEmailApi('/api/send-website-quote-email', handleSendWebsiteQuoteEmail)

    server.middlewares.use('/api/admin-portal-client', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const rawBody = await readRequestBody(request)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const authHeader = typeof request.headers.authorization === 'string' ? request.headers.authorization : ''
        const result = await handleAdminPortalClient(payload, { ...process.env, ...serverEnv }, { authHeader })

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(result))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Request failed.'
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500

        response.statusCode = statusCode
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    server.middlewares.use('/api/portal-interest-ticket-reply', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const rawBody = await readRequestBody(request)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const authHeader = typeof request.headers.authorization === 'string' ? request.headers.authorization : ''
        const result = await handlePortalInterestTicketReply(payload, { ...process.env, ...serverEnv }, { authHeader })

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(result))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to send ticket reply right now.'
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500

        response.statusCode = statusCode
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    server.middlewares.use('/api/transfer-notify', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const rawBody = await readRequestBody(request)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const authHeader = typeof request.headers.authorization === 'string' ? request.headers.authorization : ''
        const result = await handleTransferBookingNotify({ ...process.env, ...serverEnv }, { authHeader, payload })

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(result))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Request failed.'
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500

        response.statusCode = statusCode
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    server.middlewares.use('/api/transfer-reject-no-driver', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const rawBody = await readRequestBody(request)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const authHeader = typeof request.headers.authorization === 'string' ? request.headers.authorization : ''
        const result = await handleTransferRejectNoDriver(payload, { ...process.env, ...serverEnv }, { authHeader })

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(result))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Request failed.'
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500

        response.statusCode = statusCode
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    server.middlewares.use('/api/portal-link-verify', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const rawBody = await readRequestBody(request)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const result = await handlePortalLinkVerify(payload, { ...process.env, ...serverEnv })

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(result))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Request failed.'
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500

        response.statusCode = statusCode
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    server.middlewares.use('/api/portal-link-issue', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const rawBody = await readRequestBody(request)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const authHeader = typeof request.headers.authorization === 'string' ? request.headers.authorization : ''
        const result = await handlePortalLinkIssue(payload, { ...process.env, ...serverEnv }, { authHeader })

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(result))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Request failed.'
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500

        response.statusCode = statusCode
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    server.middlewares.use('/api/transfer-booking-sweep', async (request, response) => {
      if (request.method !== 'GET' && request.method !== 'POST') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const authHeader = typeof request.headers.authorization === 'string' ? request.headers.authorization : ''
        const result = await handleTransferBookingNoDriverSweep({ ...process.env, ...serverEnv }, { authHeader })

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(result))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Request failed.'
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500

        response.statusCode = statusCode
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    server.middlewares.use('/api/transfer-balance-reminder-sweep', async (request, response) => {
      if (request.method !== 'GET' && request.method !== 'POST') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const authHeader = typeof request.headers.authorization === 'string' ? request.headers.authorization : ''
        const result = await handleTransferBalanceReminderSweep({ ...process.env, ...serverEnv }, { authHeader })

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(result))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Request failed.'
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500

        response.statusCode = statusCode
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    server.middlewares.use('/api/transfer-payment-admin', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const rawBody = await readRequestBody(request)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const authHeader = typeof request.headers.authorization === 'string' ? request.headers.authorization : ''
        const result = await handleTransferPaymentAdmin(payload, { ...process.env, ...serverEnv }, { authHeader })

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(result))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Request failed.'
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500

        response.statusCode = statusCode
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    server.middlewares.use('/api/transfer-refund', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const rawBody = await readRequestBody(request)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const authHeader = typeof request.headers.authorization === 'string' ? request.headers.authorization : ''
        const result = await handleTransferRefund(payload, { ...process.env, ...serverEnv }, { authHeader })

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(result))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Request failed.'
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500

        response.statusCode = statusCode
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    server.middlewares.use('/api/transfer-checkout', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const rawBody = await readRequestBody(request)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const authHeader = typeof request.headers.authorization === 'string' ? request.headers.authorization : ''
        const result = await handleTransferStripeCheckout(payload, { ...process.env, ...serverEnv }, { authHeader })

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(result))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Request failed.'
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500

        response.statusCode = statusCode
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    server.middlewares.use('/api/stripe-webhook', async (request, response) => {
      if (request.method === 'OPTIONS') {
        response.statusCode = 204
        response.end()
        return
      }
      if (request.method !== 'POST') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const rawBuffer = await readIncomingMessageBodyBuffer(request)
        const sig = request.headers['stripe-signature']
        const result = await handleStripeWebhook(rawBuffer, sig, { ...process.env, ...serverEnv })

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(result))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Request failed.'
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500

        response.statusCode = statusCode
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    server.middlewares.use('/api/transfer-checkout-sync', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const rawBody = await readRequestBody(request)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const authHeader = typeof request.headers.authorization === 'string' ? request.headers.authorization : ''
        const result = await handleTransferCheckoutSync(payload, { ...process.env, ...serverEnv }, { authHeader })

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(result))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Request failed.'
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500

        response.statusCode = statusCode
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })

    server.middlewares.use('/api/portal-invoice-send', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'Method not allowed' }))
        return
      }

      try {
        const rawBody = await readRequestBody(request)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const authHeader = typeof request.headers.authorization === 'string' ? request.headers.authorization : ''
        const result = await handlePortalInvoiceSend(payload, { ...process.env, ...serverEnv }, { authHeader })

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(result))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Request failed.'
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
            ? error.statusCode
            : 500

        response.statusCode = statusCode
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message }))
      }
    })
  }
})

export default defineConfig(({ mode }) => {
  const serverEnv = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), devEnquiryApiPlugin(serverEnv)],
    /**
     * Rolldown emits PLUGIN_TIMINGS when the Rust build exceeds ~3s and plugin hooks dominate vs link.
     * Informative only — suppress to keep CI logs readable (see https://rolldown.rs/options/checks).
     */
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (id.includes('leaflet')) return 'leaflet'
            if (id.includes('framer-motion')) return 'motion'
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('pdf-lib')) return 'pdf'
          }
        }
      },
      rolldownOptions: {
        checks: {
          pluginTimings: false
        }
      }
    },
    optimizeDeps: {
      rolldownOptions: {
        checks: {
          pluginTimings: false
        }
      }
    }
  }
})
