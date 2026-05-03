import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { handleEnquirySubmission, handleTermsEmailRequest } from './server/enquiry-service.mjs'
import { handleMagicLinkRequest } from './server/magic-link-service.mjs'
import { handleSyncPortalProfile } from './server/sync-portal-profile-service.mjs'
import { handlePortalContactSetup } from './server/portal-contact-setup-service.mjs'
import { handleSendClientPortalEmail } from './server/client-portal-email-service.mjs'
import { createProposalFilename, createProposalPdf } from './server/proposal-service.mjs'
import { handleSendClientDocument } from './server/send-client-document-service.mjs'
import {
  handleSendHotelReservationBrief,
  handleSendWorkspaceProposalToClient
} from './server/admin-workspace-email-service.mjs'
import { handleSendProposalToClient } from './server/send-proposal-client-service.mjs'
import { handleAdminPortalClient } from './server/admin-portal-client-service.mjs'
import { handlePortalInterestTicketReply } from './server/portal-interest-ticket-reply-service.mjs'

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
  }
})

export default defineConfig(({ mode }) => {
  const serverEnv = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), devEnquiryApiPlugin(serverEnv)]
  }
})
