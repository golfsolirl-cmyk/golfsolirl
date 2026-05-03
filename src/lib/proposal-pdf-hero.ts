import type { TripWorkspaceDraft } from './trip-workspace-draft'

/** Drives proposal PDF hero copy in `shared/document-templates.mjs`. */
export type ProposalPdfProductKind = 'airport_transfer' | 'golf_transfer' | 'hotel_accommodation'

/**
 * Workspace PDF: hotel stays use hotel header; golf legs (with or without transfer) use golf transfers;
 * transfer-only uses airport transfers.
 */
export const inferProposalPdfProductKindFromWorkspace = (draft: TripWorkspaceDraft): ProposalPdfProductKind | null => {
  if (draft.stages.hotel) {
    return 'hotel_accommodation'
  }
  if (draft.stages.golf) {
    return 'golf_transfer'
  }
  if (draft.stages.transfer) {
    return 'airport_transfer'
  }
  return null
}
