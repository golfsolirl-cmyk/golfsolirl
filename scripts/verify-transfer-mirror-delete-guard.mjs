/**
 * Regression: clients must not be able to DELETE paid/deposit package-mirror transfers.
 * Run: npm run verify:transfer-mirror-delete-guard
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { clientMayDeletePackageMirrorTransferBooking } from '../server/transfer-mirror-delete-guard.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const migration = readFileSync(
  join(root, 'supabase/migrations/20260811120000_transfer_bookings_client_delete_unpaid_mirror_only.sql'),
  'utf8'
)
const tsHelper = readFileSync(join(root, 'src/lib/sync-trip-workspace-transfer-booking.ts'), 'utf8')

assert.match(migration, /transfer_bookings_delete_client_package_mirror/)
assert.match(migration, /payment_status/)
assert.match(migration, /transfer_refund_status/)
assert.match(migration, /stripe_payment_intent_id/)
assert.match(migration, /assigned_driver_id/)
assert.match(migration, /unpaid/)

assert.match(tsHelper, /clientMayDeletePackageMirrorTransferBooking/)
assert.match(tsHelper, /Preserve deposit\/paid\/refunded\/assigned mirrors/)

assert.equal(
  clientMayDeletePackageMirrorTransferBooking({
    payment_status: 'unpaid',
    transfer_refund_status: 'none'
  }),
  true
)
assert.equal(clientMayDeletePackageMirrorTransferBooking({ payment_status: 'deposit' }), false)
assert.equal(clientMayDeletePackageMirrorTransferBooking({ payment_status: 'paid' }), false)
assert.equal(
  clientMayDeletePackageMirrorTransferBooking({
    payment_status: 'unpaid',
    transfer_refund_status: 'full'
  }),
  false
)
assert.equal(
  clientMayDeletePackageMirrorTransferBooking({
    payment_status: 'unpaid',
    stripe_payment_intent_id: 'pi_123'
  }),
  false
)
assert.equal(
  clientMayDeletePackageMirrorTransferBooking({
    payment_status: 'unpaid',
    assigned_driver_id: 'drv_1'
  }),
  false
)

console.log('verify-transfer-mirror-delete-guard: ok')
