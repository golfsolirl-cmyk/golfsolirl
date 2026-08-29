export const ADMIN_MAIL_VARIABLES: readonly { readonly key: string; readonly label: string }[]

export const ADMIN_MAIL_TEMPLATES: readonly {
  readonly id: string
  readonly label: string
  readonly blurb: string
  readonly subject: string
  readonly heading: string
  readonly introduction: string
  readonly body: string
  readonly ctaLabel: string
  readonly ctaUrl: string
  readonly closing: string
}[]

export function defaultMailTemplateVars(): Record<string, string>
export function splitMailInterest(interest: string): { interestTopic: string; interestDetails: string }
export function applyMailTemplateVars(input: string, vars?: Record<string, string>): string
export function getMailTemplateById(id: string): (typeof ADMIN_MAIL_TEMPLATES)[number]
export function mergeMailTemplate(
  id: string,
  override?: Partial<(typeof ADMIN_MAIL_TEMPLATES)[number]>
): (typeof ADMIN_MAIL_TEMPLATES)[number]
export function firstNameFromFullName(name: string): string
