/**
 * Dedicated entry so POST /api/stripe-webhook hits a real serverless function.
 * (SPA rewrite /( *) → index.html can otherwise return 405 for POST webhooks.)
 */
import { handleStripeWebhook } from '../server/stripe-webhook-service.mjs'
import { readIncomingMessageBodyBuffer } from '../server/vercel-read-body.mjs'

const jsonEnd = (res, statusCode, payload) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }
  if (req.method !== 'POST') {
    jsonEnd(res, 405, { message: 'Method not allowed' })
    return
  }
  try {
    const rawBuffer = await readIncomingMessageBodyBuffer(req)
    const sig = req.headers['stripe-signature']
    const result = await handleStripeWebhook(rawBuffer, sig, process.env)
    jsonEnd(res, 200, result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed.'
    const statusCode =
      error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
        ? error.statusCode
        : 500
    jsonEnd(res, statusCode, { message })
  }
}
