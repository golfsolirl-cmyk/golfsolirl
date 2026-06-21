import assert from 'node:assert/strict'
import test from 'node:test'

import { selectPortalTripWorkspaceTarget } from './portal-trip-workspace-save-service.mjs'

test('selectPortalTripWorkspaceTarget returns the exact build for a real enquiry reference', () => {
  const rows = [
    { id: 'latest', config: { enquiryReferenceId: 'GSI-LATEST' } },
    { id: 'target', config: { enquiryReferenceId: 'GSI-TARGET' } }
  ]

  assert.equal(selectPortalTripWorkspaceTarget(rows, 'GSI-TARGET')?.id, 'target')
})

test('selectPortalTripWorkspaceTarget does not fall back for an unmatched real enquiry reference', () => {
  const rows = [
    { id: 'latest', config: { enquiryReferenceId: 'GSI-LATEST' } },
    { id: 'previous', config: { enquiryReferenceId: 'GSI-PREVIOUS' } }
  ]

  assert.equal(selectPortalTripWorkspaceTarget(rows, 'GSI-NEW'), null)
})

test('selectPortalTripWorkspaceTarget can reuse the latest row for non-reference saved drafts', () => {
  const rows = [
    { id: 'latest', config: { enquiryReferenceId: 'GSI-LATEST' } },
    { id: 'previous', config: { enquiryReferenceId: 'GSI-PREVIOUS' } }
  ]

  assert.equal(selectPortalTripWorkspaceTarget(rows, 'GSI-PENDING')?.id, 'latest')
  assert.equal(selectPortalTripWorkspaceTarget(rows, '')?.id, 'latest')
})
