import assert from 'node:assert/strict'
import {
  isLikelyEnquiryReferenceId,
  PENDING_TRIP_WORKSPACE_REFERENCE_ID,
  selectPortalTripWorkspacePackageBuild
} from '../server/portal-trip-workspace-save-service.mjs'

const rows = [
  { id: 'newest-real', config: { enquiryReferenceId: 'GSI-OLD1-1111' } },
  { id: 'pending-draft', config: { enquiryReferenceId: PENDING_TRIP_WORKSPACE_REFERENCE_ID } },
  { id: 'older-real', config: { enquiryReferenceId: 'GSI-OLD2-2222' } }
]

assert.equal(isLikelyEnquiryReferenceId('GSI-ABCD-1234'), true)
assert.equal(isLikelyEnquiryReferenceId(PENDING_TRIP_WORKSPACE_REFERENCE_ID), false)

assert.equal(
  selectPortalTripWorkspacePackageBuild(rows, 'GSI-OLD2-2222')?.id,
  'older-real',
  'exact real references should update their matching package build'
)

assert.equal(
  selectPortalTripWorkspacePackageBuild(rows, 'GSI-NEWR-3333'),
  null,
  'unmatched real references must not fall back to the newest existing package build'
)

assert.equal(
  selectPortalTripWorkspacePackageBuild([rows[0], rows[2]], PENDING_TRIP_WORKSPACE_REFERENCE_ID),
  null,
  'pending workspace saves must not target a real enquiry package build'
)

assert.equal(
  selectPortalTripWorkspacePackageBuild(rows, PENDING_TRIP_WORKSPACE_REFERENCE_ID)?.id,
  'pending-draft',
  'pending workspace saves may continue an existing pending preferences row'
)

console.log('Portal trip workspace targeting checks passed.')
