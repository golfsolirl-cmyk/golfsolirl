import { createProposalFilename, createProposalPdf } from '../server/proposal-service.mjs'

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
    const { pdfBytes, proposal } = await createProposalPdf(payload)
    const filename = createProposalFilename(proposal.proposalId)

    response.status(200)
    response.setHeader('Content-Type', 'application/pdf')
    response.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    response.send(Buffer.from(pdfBytes))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to generate proposal PDF right now.'
    const statusCode =
      error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
        ? error.statusCode
        : 500

    response.status(statusCode).json({ message })
  }
}
