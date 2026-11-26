/**
 * Email OTP contact verification — RETIRED.
 * Public quote/enquiry forms use invisible spam protection instead
 * (see server/enquiry-spam-guard.mjs). Handlers remain as no-ops so old clients fail soft.
 */

/**
 * @param {unknown} _body
 * @param {NodeJS.ProcessEnv} [_env]
 * @param {{ clientIp?: string }} [_runtime]
 */
export const handleEnquiryContactVerifySend = async (_body, _env = process.env, _runtime = {}) => ({
  ok: true,
  disabled: true,
  message: 'Email verification codes are no longer used on quote forms.'
})

/**
 * @param {unknown} _body
 * @param {NodeJS.ProcessEnv} [_env]
 * @param {{ clientIp?: string }} [_runtime]
 */
export const handleEnquiryContactVerifyCheck = async (_body, _env = process.env, _runtime = {}) => ({
  ok: true,
  disabled: true,
  message: 'Email verification codes are no longer used on quote forms.',
  contactVerifyToken: null
})

/**
 * No-op — contact verify is retired.
 * @param {import('@supabase/supabase-js').SupabaseClient} _sb
 * @param {{ email: string, phoneWhatsApp: string, contactVerifyToken?: string }} _enquiry
 * @param {NodeJS.ProcessEnv} [_env]
 */
export const assertEnquiryContactVerified = async (_sb, _enquiry, _env = process.env) => {}
