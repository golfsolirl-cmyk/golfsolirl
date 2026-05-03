import { createProposalFilename, createProposalPdf } from '../server/proposal-service.mjs'
import { readIncomingMessageBodyUtf8 } from '../server/vercel-read-body.mjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ message: 'Method not allowed' }))
    return
  }

  try {
    const rawBody = await readIncomingMessageBodyUtf8(req)
    const payload = rawBody ? JSON.parse(rawBody) : {}
    const { pdfBytes, proposal } = await createProposalPdf(payload)
    const filename = createProposalFilename(proposal.proposalId)

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.end(Buffer.from(pdfBytes))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to generate proposal PDF right now.'
    const statusCode =
      error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
        ? error.statusCode
        : 500

    res.statusCode = statusCode
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ message }))
  }
}
