/**
 * Regression: transfer checkout ownership must not follow email / account-ref
 * fallbacks when client_user_id is already assigned to another user.
 *
 * Run: npm run verify:profile-identity-idor
 */
import { clientOwnsTransferBooking } from '../server/transfer-booking-ownership.mjs'

const fail = (msg) => {
  console.error(`verify-profile-identity-idor: FAIL — ${msg}`)
  process.exit(1)
}

const mockAdmin = (profileRef = 'GSI-VICTIM-REF') => ({
  from(table) {
    if (table === 'profiles') {
      return {
        select() {
          return {
            eq() {
              return {
                maybeSingle: async () => ({ data: { account_reference_id: profileRef }, error: null })
              }
            }
          }
        }
      }
    }
    if (table === 'enquiries') {
      return {
        select() {
          return {
            eq() {
              return {
                ilike() {
                  return {
                    maybeSingle: async () => ({ data: { id: 'enq-1' }, error: null })
                  }
                }
              }
            }
          }
        }
      }
    }
    throw new Error(`unexpected table ${table}`)
  }
})

const attackerId = 'attacker-user'
const victimId = 'victim-user'
const admin = mockAdmin('GSI-VICTIM-REF')

// Direct owner match
{
  const ok = await clientOwnsTransferBooking(admin, victimId, 'victim@example.com', {
    client_user_id: victimId,
    client_email: 'victim@example.com',
    enquiry_reference_id: 'GSI-VICTIM-REF'
  })
  if (!ok) fail('owner should own their booking')
}

// Attacker must NOT own a booking already assigned to the victim, even with matching
// email / account_reference / enquiry email (pre-fix IDOR fallback path).
{
  const stolen = await clientOwnsTransferBooking(admin, attackerId, 'victim@example.com', {
    client_user_id: victimId,
    client_email: 'victim@example.com',
    enquiry_reference_id: 'GSI-VICTIM-REF'
  })
  if (stolen) fail('attacker must not own booking assigned to another client_user_id')
}

// Unattached booking: JWT email match still allowed
{
  const ok = await clientOwnsTransferBooking(admin, attackerId, 'guest@example.com', {
    client_user_id: null,
    client_email: 'guest@example.com',
    enquiry_reference_id: 'GSI-OTHER'
  })
  if (!ok) fail('unattached booking should match JWT email')
}

// Unattached booking: account_reference_id match still allowed for legitimate link
{
  const ok = await clientOwnsTransferBooking(admin, attackerId, 'attacker@example.com', {
    client_user_id: null,
    client_email: 'someone-else@example.com',
    enquiry_reference_id: 'GSI-VICTIM-REF'
  })
  if (!ok) fail('unattached booking should match locked account_reference_id')
}

console.log('verify-profile-identity-idor: ok')
