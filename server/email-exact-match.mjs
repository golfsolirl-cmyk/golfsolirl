/**
 * Exact email matching for PostgREST / Postgres.
 *
 * `.ilike('email', value)` treats `_` as “any one character” and `%` / `*` as
 * “any sequence”. A real address like `mary_okeeffe@gmail.com` therefore matches
 * `mary.okeeffe@gmail.com` and attaches transfers, package builds, invoices, or
 * checkout ownership to the wrong profile.
 */

export const normalizeEmailExact = (value) => String(value ?? '').trim().toLowerCase()

/**
 * Escape ILIKE / PostgREST wildcards so the pattern is a case-insensitive exact match.
 *
 * @param {string} value
 * @returns {string}
 */
export const escapeIlikeExact = (value) =>
  normalizeEmailExact(value)
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .replace(/\*/g, '\\*')

/**
 * SQL LIKE semantics used by unescaped `.ilike()` (underscore = one char, percent = any run).
 * Used by regression tests to lock the trigger scenario.
 *
 * @param {string} pattern
 * @param {string} candidate
 * @returns {boolean}
 */
export const sqlIlikeUnescapedMatches = (pattern, candidate) => {
  const p = String(pattern ?? '')
  const c = String(candidate ?? '')
  let regex = ''
  for (let i = 0; i < p.length; i += 1) {
    const ch = p[i]
    if (ch === '%') {
      regex += '.*'
    } else if (ch === '_') {
      regex += '.'
    } else if ('\\^$+*?()[]{}|.'.includes(ch)) {
      regex += `\\${ch}`
    } else {
      regex += ch
    }
  }
  return new RegExp(`^${regex}$`, 'i').test(c)
}

/**
 * Prefer equality on the normalized address, then escaped ILIKE for mixed-case rows.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} email
 * @param {string} [columns]
 * @returns {Promise<{ data: Record<string, unknown> | null, error: { message?: string } | null }>}
 */
export const findProfileByEmailExact = async (admin, email, columns = 'id') => {
  const normalized = normalizeEmailExact(email)
  if (!normalized || !normalized.includes('@')) {
    return { data: null, error: null }
  }

  const exact = await admin.from('profiles').select(columns).eq('email', normalized).maybeSingle()
  if (exact.error || exact.data) {
    return exact
  }

  return admin.from('profiles').select(columns).ilike('email', escapeIlikeExact(normalized)).maybeSingle()
}
