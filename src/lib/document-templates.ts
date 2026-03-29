// @ts-ignore Shared runtime module lives outside src
import * as rawTemplates from '../../shared/document-templates.mjs'

export type DocumentIconKey = 'users' | 'calendar' | 'map' | 'bus'

export interface DocumentInfoCard {
  readonly icon: DocumentIconKey
  readonly title: string
  readonly items: readonly string[]
}

export interface DocumentTile {
  readonly label: string
  readonly value: string
}

export interface DocumentTemplate {
  readonly meta: Record<string, string | number>
  readonly hero: {
    readonly kicker: string
    readonly title: string
    readonly description: string
    readonly metaCard: readonly string[]
  }
  readonly infoCards: readonly DocumentInfoCard[]
  readonly summary: {
    readonly kicker: string
    readonly title: string
    readonly aside: string
    readonly topTiles: readonly DocumentTile[]
    readonly bottomTiles: readonly DocumentTile[]
    readonly notesTitle: string
    readonly noteLines: readonly string[]
  }
  readonly lower: {
    readonly left: {
      readonly kicker: string
      readonly items: readonly string[]
      readonly noteLines: readonly string[]
    }
    readonly right: {
      readonly kicker: string
      readonly paragraphs: readonly string[]
      readonly signoffTitle: string
      readonly signoffLines: readonly string[]
    }
  }
  readonly messageBlock: {
    readonly title: string
    readonly body: string
  }
  readonly disclaimer: {
    readonly title: string
    readonly paragraphs: readonly string[]
  }
}

const runtimeTemplates = rawTemplates as unknown as {
  readonly formatDocumentDate: () => string
  readonly createProposalId: () => string
  readonly createEnquiryReferenceId: () => string
  readonly parseNumberParam: (value: string | null, fallback: number) => number
  readonly buildProposalDocument: (rawPayload: Record<string, unknown>) => DocumentTemplate
  readonly buildEnquiryDocument: (rawPayload: Record<string, unknown>) => DocumentTemplate
}

export const formatDocumentDate = (): string => runtimeTemplates.formatDocumentDate()
export const createProposalId = (): string => runtimeTemplates.createProposalId()
export const createEnquiryReferenceId = (): string => runtimeTemplates.createEnquiryReferenceId()
export const parseNumberParam = (value: string | null, fallback: number): number => runtimeTemplates.parseNumberParam(value, fallback)
export const buildProposalDocument = (rawPayload: Record<string, unknown>): DocumentTemplate => runtimeTemplates.buildProposalDocument(rawPayload)
export const buildEnquiryDocument = (rawPayload: Record<string, unknown>): DocumentTemplate => runtimeTemplates.buildEnquiryDocument(rawPayload)
