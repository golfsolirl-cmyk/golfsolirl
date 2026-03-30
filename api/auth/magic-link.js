import { handleMagicLinkRequest } from '../../server/magic-link-service.mjs'

const readRequestBody = (request) =>
  new Promise((resolve, reject) => {
    let body = ''

    request.on('data', (chunk) => {
      body += chunk
    })

    request.on('end', () => {
      resolve(body)
    })

    request.on('error', reject)
  })

const getClientIp = (request) => {
  const forwarded = request.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.trim() !== '') {
    return forwarded.split(',')[0]?.trim() ?? 'unknown'
  }

  return request.socket?.remoteAddress ?? 'unknown'
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ message: 'Method not allowed' })
    return
  }

  try {
    const rawBody = await readRequestBody(request)
    const payload = rawBody ? JSON.parse(rawBody) : {}
    const result = await handleMagicLinkRequest(payload, process.env, { clientIp: getClientIp(request) })

    response.status(200).json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to send sign-in email right now.'
    const statusCode =
      error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
        ? error.statusCode
        : 500

    response.status(statusCode).json({ message })
  }
}
