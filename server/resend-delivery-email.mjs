/** Extract bare address from `user@x.com` or `Name <user@x.com>`. */
export const parseEmailAddress = (raw) => {
  const s = String(raw ?? '').trim()
  const angle = s.match(/<([^>]+)>/)
  if (angle?.[1]) {
    return angle[1].trim().toLowerCase()
  }
  return s.toLowerCase()
}

/** Gmail / Googlemail: `user+tag@gmail.com` → `user@gmail.com`. */
export const gmailBaseAddress = (email) => {
  const normalized = String(email ?? '').trim().toLowerCase()
  const match = normalized.match(/^([^+@]+)(?:\+[^@]*)?@(gmail\.com|googlemail\.com)$/)
  if (!match) {
    return null
  }
  return `${match[1]}@${match[2]}`
}

const isResendSandboxFrom = (fromRaw) => {
  const from = parseEmailAddress(fromRaw)
  return from.endsWith('@resend.dev')
}

/**
 * Resend test senders (`*@resend.dev`) may only deliver to the account owner inbox.
 * Gmail plus aliases for that inbox arrive in the same mailbox — route delivery there.
 *
 * @param {string} requestedEmail sign-in / enquiry address (unchanged in Supabase)
 * @param {NodeJS.ProcessEnv} env
 */
export const resolveResendToAddress = (requestedEmail, env = process.env) => {
  const requested = String(requestedEmail ?? '').trim().toLowerCase()
  const fromRaw = env.RESEND_FROM_EMAIL?.trim() ?? ''

  if (!requested || !isResendSandboxFrom(fromRaw)) {
    return requested
  }

  const testInbox = parseEmailAddress(
    env.RESEND_TEST_DELIVERY_EMAIL?.trim() || env.RESEND_NOTIFICATION_TO?.trim() || ''
  )
  if (!testInbox) {
    return requested
  }

  const base = gmailBaseAddress(requested)
  if (base && base === testInbox) {
    return testInbox
  }

  if (requested === testInbox) {
    return requested
  }

  return requested
}

/** User-facing hint when Resend rejects a non-allowlisted recipient in test mode. */
export const resendSandboxRecipientHint = (env = process.env) => {
  const testInbox =
    parseEmailAddress(env.RESEND_TEST_DELIVERY_EMAIL?.trim() || env.RESEND_NOTIFICATION_TO?.trim() || '') ||
    'your verified Resend account email'
  return (
    `Resend is in test mode (from @resend.dev). Mail can only be delivered to ${testInbox} until you verify golfsolirl.com at resend.com/domains and set RESEND_FROM_EMAIL to an address on that domain (e.g. info@golfsolirl.com). ` +
    `Gmail plus addresses like golfsolirl+logingolfsol@gmail.com are delivered to the same inbox — we route those automatically when RESEND_NOTIFICATION_TO matches the base address.`
  )
}
