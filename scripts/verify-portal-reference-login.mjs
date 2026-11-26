/**
 * Portal email + reference login must not treat ILIKE wildcards as the secret.
 * Run: node scripts/verify-portal-reference-login.mjs
 *
 * Trigger this locks: POST /api/portal-login with the victim's email and
 * reference "%%%%%%" used to open their trip desk, because .ilike() treats
 * % as "any string". The same hole let mary_smith@ match mary.smith@.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  PORTAL_REFERENCE_RE,
  escapeIlikeLiteral,
  findProfileByEmailAndReference
} from '../server/portal-otp-auth.mjs'

const assert = (cond, message) => {
  if (!cond) {
    console.error(`verify-portal-reference-login: ${message}`)
    process.exit(1)
  }
}

/** Postgres ILIKE, including backslash escapes. */
const ilikeMatch = (pattern, value) => {
  if (value == null) return false
  let regex = ''
  const src = String(pattern)
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i]
    if (ch === '\\') {
      const next = src[i + 1]
      if (next == null) break
      i += 1
      regex += next.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      continue
    }
    if (ch === '%') regex += '.*'
    else if (ch === '_') regex += '.'
    else regex += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
  return new RegExp(`^${regex}$`, 'i').test(String(value))
}

assert(ilikeMatch('%%%%%%', 'GSI-AB12-3456'), 'harness: unescaped percent matches any reference')
assert(ilikeMatch('mary_smith@example.com', 'mary.smith@example.com'), 'harness: underscore matches one character')
assert(!ilikeMatch(escapeIlikeLiteral('%%%%%%'), 'GSI-AB12-3456'), 'escaped percent is literal')
assert(!ilikeMatch(escapeIlikeLiteral('mary_smith@example.com'), 'mary.smith@example.com'), 'escaped underscore is literal')
assert(ilikeMatch(escapeIlikeLiteral('mary_smith@example.com'), 'Mary_Smith@example.com'), 'escaped underscore still matches itself')
assert(escapeIlikeLiteral('a\\b') === 'a\\\\b', 'backslash escaped first')

assert(PORTAL_REFERENCE_RE.test('GSI-AB12-3456'), 'real reference accepted')
assert(PORTAL_REFERENCE_RE.test('GSOL-SAMPLE'), 'GSOL reference accepted')
assert(PORTAL_REFERENCE_RE.test('GSQ-K7M2P'), 'GSQ reference accepted')
assert(!PORTAL_REFERENCE_RE.test('%%%%%%'), 'percent reference rejected')
assert(!PORTAL_REFERENCE_RE.test('GSI-%'), 'partial wildcard rejected')
assert(!PORTAL_REFERENCE_RE.test('GSI-____-____'), 'underscore reference rejected')
assert(!PORTAL_REFERENCE_RE.test('ABC'), 'short reference rejected')

const profiles = [
  {
    id: 'victim',
    email: 'victim@example.com',
    full_name: 'Victim',
    account_reference_id: 'GSI-AB12-3456',
    portal_token: null,
    portal_token_issued_at: null,
    portal_revoked_at: null,
    portal_auth: null,
    created_at: '2026-11-01T00:00:00.000Z'
  },
  {
    id: 'underscore',
    email: 'mary_smith@example.com',
    full_name: 'Mary Smith',
    account_reference_id: 'GSI-CD34-7890',
    portal_token: null,
    portal_token_issued_at: null,
    portal_revoked_at: null,
    portal_auth: null,
    created_at: '2026-11-02T00:00:00.000Z'
  },
  {
    id: 'dotted',
    email: 'mary.smith@example.com',
    full_name: 'Mary D Smith',
    account_reference_id: 'GSI-EF56-1111',
    portal_token: null,
    portal_token_issued_at: null,
    portal_revoked_at: null,
    portal_auth: null,
    created_at: '2026-11-03T00:00:00.000Z'
  },
  {
    id: 'enquiry-only',
    email: 'enquiry.only@example.com',
    full_name: 'Enquiry Only',
    account_reference_id: null,
    portal_token: null,
    portal_token_issued_at: null,
    portal_revoked_at: null,
    portal_auth: null,
    created_at: '2026-11-04T00:00:00.000Z'
  },
  {
    id: 'mixed-case',
    email: 'Mixed.Case@Example.com',
    full_name: 'Mixed Case',
    account_reference_id: 'gsi-aa11-2222',
    portal_token: null,
    portal_token_issued_at: null,
    portal_revoked_at: null,
    portal_auth: null,
    created_at: '2026-11-05T00:00:00.000Z'
  }
]

const enquiries = [
  {
    reference_id: 'GSI-ZZ99-0001',
    email: 'enquiry.only@example.com',
    full_name: 'Enquiry Only',
    form_payload: {},
    created_at: '2026-11-04T00:00:00.000Z'
  }
]

const tables = {
  profiles,
  enquiries,
  email_account_anchors: []
}

const rowMatches = (row, filters) =>
  filters.every((filter) => {
    const value = row[filter.col]
    if (filter.op === 'eq') {
      return value === filter.val
    }
    return ilikeMatch(filter.val, value)
  })

const admin = {
  from(table) {
    const rows = tables[table]
    if (!rows) throw new Error(`unexpected table ${table}`)
    const state = { filters: [], mode: 'select' }
    const chain = {
      select() {
        return chain
      },
      update(patch) {
        state.mode = 'update'
        state.patch = patch
        return chain
      },
      eq(col, val) {
        state.filters.push({ op: 'eq', col, val })
        if (state.mode === 'update') {
          const row = rows.find((item) => item.id === val || item[col] === val)
          if (row && state.patch) Object.assign(row, state.patch)
          return Promise.resolve({ error: null })
        }
        return chain
      },
      ilike(col, val) {
        state.filters.push({ op: 'ilike', col, val })
        return chain
      },
      order() {
        return chain
      },
      limit() {
        return chain
      },
      async maybeSingle() {
        const matches = rows.filter((row) => rowMatches(row, state.filters))
        if (matches.length > 1) {
          return { data: null, error: { message: 'multiple rows' } }
        }
        return { data: matches[0] ?? null, error: null }
      }
    }
    return chain
  },
  auth: { admin: {} }
}

const victim = await findProfileByEmailAndReference(admin, 'Victim@Example.com', 'gsi-ab12-3456')
assert(victim?.id === 'victim', 'exact email and reference still signs in')

const underscoreOk = await findProfileByEmailAndReference(admin, 'mary_smith@example.com', 'GSI-CD34-7890')
assert(underscoreOk?.id === 'underscore', 'a real underscore in the email still signs in')

const mixed = await findProfileByEmailAndReference(admin, 'mixed.case@example.com', 'GSI-AA11-2222')
assert(mixed?.id === 'mixed-case', 'mixed-case stored reference still signs in via escaped ILIKE')

const wildcardRef = await findProfileByEmailAndReference(admin, 'victim@example.com', '%%%%%%')
assert(wildcardRef == null, 'percent reference must not open the victim desk')

const partial = await findProfileByEmailAndReference(admin, 'victim@example.com', 'GSI-%')
assert(partial == null, 'trailing wildcard must not open the victim desk')

const emailWildcard = await findProfileByEmailAndReference(admin, '%@example.com', 'GSI-AB12-3456')
assert(emailWildcard == null, 'wildcard email plus a known reference must not match')

const underscoreEmail = await findProfileByEmailAndReference(admin, 'mary_smith@example.com', 'GSI-EF56-1111')
assert(underscoreEmail == null, 'underscore email must not match the dotted address that holds that reference')

const viaEnquiry = await findProfileByEmailAndReference(admin, 'enquiry.only@example.com', 'GSI-ZZ99-0001')
assert(viaEnquiry?.id === 'enquiry-only', 'enquiry reference still attaches the existing profile')
assert(profiles.find((row) => row.id === 'enquiry-only')?.account_reference_id === 'GSI-ZZ99-0001', 'enquiry login stores the real reference')

const src = readFileSync(fileURLToPath(new URL('../server/portal-otp-auth.mjs', import.meta.url)), 'utf8')
assert(!src.includes(".ilike('email', em)"), 'login must not ILIKE the raw email')
assert(!src.includes(".ilike('email', email)"), 'login must not ILIKE the raw email')
assert(!src.includes(".ilike('account_reference_id', ref)"), 'login must not ILIKE the raw reference')
assert(!src.includes(".ilike('reference_id', ref)"), 'login must not ILIKE the raw enquiry reference')
assert(src.includes('escapeIlikeLiteral(em)'), 'email fallback is escaped')
assert(src.includes('escapeIlikeLiteral(ref)'), 'reference fallback is escaped')

console.log('verify-portal-reference-login: ok')
