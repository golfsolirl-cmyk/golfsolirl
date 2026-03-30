import { handleSendClientDocument } from '../server/send-client-document-service.mjs'

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

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ message: 'Method not allowed' })
    return
  }

  try {
    const rawBody = await readRequestBody(request)
    const payload = rawBody ? JSON.parse(rawBody) : {}
    const authHeader = request.headers.authorization ?? ''

    const result = await handleSendClientDocument(payload, process.env, { authHeader })

    response.status(200).json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to send document right now.'
    const statusCode =
      error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
        ? error.statusCode
        : 500

    response.status(statusCode).json({ message })
  }
}
