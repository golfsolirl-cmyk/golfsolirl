import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { handleEnquirySubmission } from './server/enquiry-service.mjs'
import { handleMagicLinkRequest } from './server/magic-link-service.mjs'
import { createProposalFilename, createProposalPdf } from './server/proposal-service.mjs'

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
        const result = await handleEnquirySubmission(payload, {
          ...process.env,
          ...serverEnv
        })

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
  }
})

export default defineConfig(({ mode }) => {
  const serverEnv = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), devEnquiryApiPlugin(serverEnv)]
  }
})
