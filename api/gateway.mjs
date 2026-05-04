/**
 * Single Vercel Serverless entry for all /api/* routes (Hobby plan function limit).
 * vercel.json rewrites each public path to /api/gateway?r=...
 */
import { handleEnquirySubmission, handleTermsEmailRequest } from '../server/enquiry-service.mjs'
import { handleMagicLinkRequest } from '../server/magic-link-service.mjs'
import { handleSyncPortalProfile } from '../server/sync-portal-profile-service.mjs'
import { handlePortalContactSetup } from '../server/portal-contact-setup-service.mjs'
import { handleSendClientPortalEmail } from '../server/client-portal-email-service.mjs'
import { handleSendWebsiteQuoteEmail } from '../server/website-quote-email.mjs'
import { createProposalFilename, createProposalPdf } from '../server/proposal-service.mjs'
import { handleSendClientDocument } from '../server/send-client-document-service.mjs'
import {
  handleSendHotelReservationBrief,
  handleSendWorkspaceProposalToClient
} from '../server/admin-workspace-email-service.mjs'
import { handleSendProposalToClient } from '../server/send-proposal-client-service.mjs'
import { handleAdminPortalClient } from '../server/admin-portal-client-service.mjs'
import { handlePortalInterestTicketReply } from '../server/portal-interest-ticket-reply-service.mjs'
import { readIncomingMessageBodyUtf8 } from '../server/vercel-read-body.mjs'

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

const jsonEnd = (res, statusCode, payload) => {
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
          waitUntil: waitUntilFn ?? undefined
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
        const rawBody = await readIncomingMessageBodyUtf8(req)
        const payload = rawBody ? JSON.parse(rawBody) : {}
        const { pdfBytes, proposal } = await createProposalPdf(payload)
        const filename = createProposalFilename(proposal.proposalId)
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
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
    jsonEnd(res, statusCode, { message })
  }
}
