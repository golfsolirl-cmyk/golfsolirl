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
    readonly metaCard: readonly [string, string] | readonly string[]
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
  } | null
  readonly disclaimer: {
    readonly title: string
    readonly paragraphs: readonly string[]
  }
}

export function formatDocumentDate(): string
export function createProposalId(): string
export function createEnquiryReferenceId(): string
export function parseNumberParam(value: string | null, fallback: number): number
export function buildProposalDocument(rawPayload?: Record<string, unknown>): DocumentTemplate
export function buildEnquiryDocument(rawPayload?: Record<string, unknown>): DocumentTemplate
