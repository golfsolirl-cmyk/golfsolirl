// @ts-ignore Shared runtime module lives outside src
import * as raw from '../../shared/admin-mail-templates.mjs'

const runtime = raw as unknown as {
  readonly applyMailTemplateVars: (input: string, vars?: Record<string, string>) => string
}

export const applyMailTemplateVars = (input: string, vars?: Record<string, string>): string =>
  runtime.applyMailTemplateVars(input, vars)
