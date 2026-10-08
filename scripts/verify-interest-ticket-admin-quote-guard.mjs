/**
 * Regression: clients must not forge admin_quote_eur on portal_interest_tickets.
 * Run: npm run verify:interest-ticket-admin-quote-guard
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const migration = readFileSync(
  join(root, 'supabase/migrations/20260812160000_portal_interest_ticket_admin_quote_client_immutable.sql'),
  'utf8'
)

assert.match(migration, /portal_interest_tickets_client_update_guard/)
assert.match(migration, /admin_quote_eur is distinct from old\.admin_quote_eur/)
assert.match(migration, /portal_interest_tickets_client_insert_guard/)
assert.match(migration, /new\.admin_quote_eur := null/)
assert.match(migration, /Clients may only update read timestamps on interest tickets/)

// Quote column must exist before the immutability guard (ordering contract).
const quoteColMigration = readFileSync(
  join(root, 'supabase/migrations/20260812140000_portal_interest_ticket_quote_and_close.sql'),
  'utf8'
)
assert.match(quoteColMigration, /add column if not exists admin_quote_eur/)

console.log('verify-interest-ticket-admin-quote-guard: ok')
