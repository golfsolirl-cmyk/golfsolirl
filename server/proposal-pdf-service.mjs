import { createClient } from '@supabase/supabase-js'
import { createProposalFilename, createProposalPdf } from './proposal-service.mjs'

const throwStatus = (message, statusCode) => {
  const err = new Error(message)
  err.statusCode = statusCode
  throw err
}

export const extractBearerToken = (authHeader = '') =>
  typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '').trim() : ''

export const resolveProposalIdFromPayload = (payload) =>
  payload && typeof payload === 'object' && typeof payload.proposalId === 'string' ? payload.proposalId.trim() : ''

const createAdminClient = (env) => {
  const supabaseUrl = env.SUPABASE_URL?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!supabaseUrl || !serviceKey) {
    throwStatus('Supabase is not configured on the server.', 500)
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}

const resolveAuthorizedProposalPayload = async (payload, env, authHeader) => {
  const token = extractBearerToken(authHeader)
  if (!token) {
    throwStatus('Missing authorization.', 401)
  }

  const supabase = createAdminClient(env)
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser(token)

  if (userError || !user) {
    throwStatus('Invalid or expired session.', 401)
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    throwStatus(profileError.message || 'Unable to verify account access.', 500)
  }

  if (profile?.role === 'admin') {
    return payload
  }

  const proposalId = resolveProposalIdFromPayload(payload)
  if (!proposalId) {
    throwStatus('Proposal reference is required.', 403)
  }

  const { data: proposalRow, error: proposalError } = await supabase
    .from('proposals')
    .select('payload')
    .eq('owner_id', user.id)
    .eq('proposal_id', proposalId)
    .maybeSingle()

  if (proposalError) {
    throwStatus(proposalError.message || 'Unable to verify proposal access.', 500)
  }

  if (!proposalRow?.payload || typeof proposalRow.payload !== 'object') {
    throwStatus('You do not have access to that proposal PDF.', 403)
  }

  // Clients may only render the canonical saved payload for their own proposal.
  return { ...proposalRow.payload, variant: 'public' }
}

export const handleProposalPdfRequest = async (rawBody, env, { authHeader = '' } = {}) => {
  const payload = rawBody && typeof rawBody === 'object' ? rawBody : {}
  const authorizedPayload = await resolveAuthorizedProposalPayload(payload, env, authHeader)
  const { pdfBytes, proposal } = await createProposalPdf(authorizedPayload)
  const filename = createProposalFilename(proposal.proposalId)

  return { pdfBytes, filename }
}
