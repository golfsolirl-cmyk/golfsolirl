import assert from 'node:assert/strict'
import test from 'node:test'
import { extractBearerToken, handleProposalPdfRequest, resolveProposalIdFromPayload } from './proposal-pdf-service.mjs'

test('handleProposalPdfRequest rejects anonymous requests before generating a PDF', async () => {
  await assert.rejects(
    () => handleProposalPdfRequest({ proposalId: 'GSI-PROP-TEST' }, {}, { authHeader: '' }),
    (error) => error instanceof Error && error.message === 'Missing authorization.' && error.statusCode === 401
  )
})

test('proposal PDF auth helpers parse bearer headers and proposal ids', () => {
  assert.equal(extractBearerToken('Bearer access-token-value'), 'access-token-value')
  assert.equal(extractBearerToken('access-token-value'), 'access-token-value')
  assert.equal(resolveProposalIdFromPayload({ proposalId: '  GSI-PROP-1234  ' }), 'GSI-PROP-1234')
  assert.equal(resolveProposalIdFromPayload({ proposalId: 1234 }), '')
})
