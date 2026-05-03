import { handlePortalContactSetup } from '../server/portal-contact-setup-service.mjs'
import { readIncomingMessageBodyUtf8 } from '../server/vercel-read-body.mjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ message: 'Method not allowed' }))
    return
  }

  try {
    const raw = await readIncomingMessageBodyUtf8(req)
    const payload = raw ? JSON.parse(raw) : {}
    const authHeader = typeof req.headers?.authorization === 'string' ? req.headers.authorization : ''
    const result = await handlePortalContactSetup(payload, process.env, { authHeader })

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(result))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed.'
    const statusCode =
      error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
        ? error.statusCode
        : 500

    res.statusCode = statusCode
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ message }))
  }
}
