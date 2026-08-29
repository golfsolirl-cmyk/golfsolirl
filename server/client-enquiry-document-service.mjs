/**
 * Admin CRUD for client enquiry / quotation documents.
 * Structured rows only — Word/PDF are generated on download.
 */
import { createClient } from '@supabase/supabase-js'
import { requireAdminFromBearer } from './auth-verify-admin.mjs'
import {
  createClientDocumentReferenceId,
  dbRowToDraft,
  draftFromEnquiryRow,
  draftToDbRow,
  listRowFromDb,
  normalizeClientDocumentDraft
} from '../shared/client-enquiry-document.mjs'

const throwStatus = (message, statusCode) => {
  const err = new Error(message)
  err.statusCode = statusCode
  throw err
}

const getAdmin = (env) => {
  const url = env.SUPABASE_URL?.trim()
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    throwStatus('Supabase is not configured on the server.', 500)
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

const isMissingTable = (error) => {
  const code = error?.code
  const msg = String(error?.message ?? '')
  return code === '42P01' || /client_enquiry_documents/i.test(msg)
}

const tableMissingMessage =
  'Client documents are not installed yet. Run supabase/run-in-sql-editor-client-enquiry-documents.sql in the Supabase SQL editor, then try again.'

const requireAdmin = async (meta, env) => {
  const auth = await requireAdminFromBearer(meta?.authHeader, env)
  if (!auth.ok) {
    throwStatus(auth.message, auth.statusCode)
  }
  return auth.user
}

const fetchEnquiry = async (admin, enquiryId) => {
  const id = typeof enquiryId === 'string' ? enquiryId.trim() : ''
  if (!id) {
    throwStatus('Missing enquiry.', 400)
  }
  const { data, error } = await admin
    .from('enquiries')
    .select(
      'id, reference_id, email, full_name, interest, phone_whatsapp, best_time_to_call, created_at, form_payload'
    )
    .eq('id', id)
    .maybeSingle()
  if (error) {
    console.error('[client-enquiry-document] enquiry lookup failed', error)
    throwStatus('Unable to load that enquiry.', 500)
  }
  if (!data) {
    throwStatus('That enquiry could not be found.', 404)
  }
  return data
}

const listDocuments = async (admin) => {
  const { data, error } = await admin
    .from('client_enquiry_documents')
    .select(
      'id, reference, customer_name, customer_email, document_type, document_title, document_date, total, status, enquiry_reference, enquiry_id, updated_at, created_at'
    )
    .order('updated_at', { ascending: false })
    .limit(200)
  if (error) {
    if (isMissingTable(error)) throwStatus(tableMissingMessage, 503)
    console.error('[client-enquiry-document] list failed', error)
    throwStatus('Unable to load saved documents.', 500)
  }
  return (data ?? []).map(listRowFromDb)
}

const getDocument = async (admin, id) => {
  const docId = typeof id === 'string' ? id.trim() : ''
  if (!docId) throwStatus('Missing document.', 400)
  const { data, error } = await admin.from('client_enquiry_documents').select('*').eq('id', docId).maybeSingle()
  if (error) {
    if (isMissingTable(error)) throwStatus(tableMissingMessage, 503)
    console.error('[client-enquiry-document] get failed', error)
    throwStatus('Unable to load that document.', 500)
  }
  if (!data) throwStatus('That document could not be found.', 404)
  return dbRowToDraft(data)
}

const saveDocument = async (admin, body, userId) => {
  const draft = normalizeClientDocumentDraft(body?.draft ?? body)
  if (!draft.reference) {
    throwStatus('A document reference is required.', 400)
  }
  const row = draftToDbRow(draft, userId)
  if (draft.id) {
    const { created_by: _createdBy, ...updateRow } = row
    const { data, error } = await admin
      .from('client_enquiry_documents')
      .update(updateRow)
      .eq('id', draft.id)
      .select('*')
      .maybeSingle()
    if (error) {
      if (isMissingTable(error)) throwStatus(tableMissingMessage, 503)
      if (error.code === '23505') throwStatus('That reference number is already in use. Change it and save again.', 409)
      console.error('[client-enquiry-document] update failed', error)
      throwStatus('Unable to save changes.', 500)
    }
    if (!data) throwStatus('That document could not be found.', 404)
    return dbRowToDraft(data)
  }

  const { data, error } = await admin.from('client_enquiry_documents').insert(row).select('*').maybeSingle()
  if (error) {
    if (isMissingTable(error)) throwStatus(tableMissingMessage, 503)
    if (error.code === '23505') throwStatus('That reference number is already in use. Change it and save again.', 409)
    console.error('[client-enquiry-document] insert failed', error)
    throwStatus('Unable to save this document.', 500)
  }
  return dbRowToDraft(data)
}

const duplicateDocument = async (admin, id, userId) => {
  const source = await getDocument(admin, id)
  const copy = normalizeClientDocumentDraft({
    ...source,
    id: null,
    status: 'draft',
    reference: createClientDocumentReferenceId(),
    subject: source.subject
  })
  return saveDocument(admin, { draft: copy }, userId)
}

const deleteDocument = async (admin, id) => {
  const docId = typeof id === 'string' ? id.trim() : ''
  if (!docId) throwStatus('Missing document.', 400)
  const { error } = await admin.from('client_enquiry_documents').delete().eq('id', docId)
  if (error) {
    if (isMissingTable(error)) throwStatus(tableMissingMessage, 503)
    console.error('[client-enquiry-document] delete failed', error)
    throwStatus('Unable to remove that document.', 500)
  }
  return { ok: true }
}

const markSent = async (admin, draft) => {
  if (!draft?.id) return draft
  const next = normalizeClientDocumentDraft({ ...draft, status: 'sent' })
  return saveDocument(admin, { draft: next }, draft.createdBy ?? null)
}

/**
 * @param {unknown} body
 * @param {NodeJS.ProcessEnv} env
 * @param {{ authHeader?: string }} meta
 */
export const handleClientEnquiryDocument = async (body, env = process.env, meta = {}) => {
  const user = await requireAdmin(meta, env)
  const admin = getAdmin(env)
  const action = typeof body?.action === 'string' ? body.action.trim() : 'list'

  switch (action) {
    case 'list':
      return { ok: true, documents: await listDocuments(admin) }
    case 'get':
      return { ok: true, draft: await getDocument(admin, body?.id) }
    case 'blank':
      return { ok: true, draft: normalizeClientDocumentDraft({ documentType: body?.documentType || 'enquiry_response' }) }
    case 'from-enquiry': {
      const enquiry = await fetchEnquiry(admin, body?.enquiryId)
      const draft = draftFromEnquiryRow(enquiry)
      const { data: existing, error: refErr } = await admin
        .from('client_enquiry_documents')
        .select('id')
        .eq('reference', draft.reference)
        .maybeSingle()
      if (refErr && !isMissingTable(refErr)) {
        console.error('[client-enquiry-document] reference check failed', refErr)
      } else if (existing) {
        draft.reference = createClientDocumentReferenceId()
      }
      return { ok: true, draft }
    }
    case 'save':
      return { ok: true, draft: await saveDocument(admin, body, user.id) }
    case 'duplicate':
      return { ok: true, draft: await duplicateDocument(admin, body?.id, user.id) }
    case 'delete':
      return await deleteDocument(admin, body?.id)
    default:
      throwStatus('Unknown document action.', 400)
  }
}

export const requireClientDocumentAdmin = requireAdmin
export const markClientDocumentSent = markSent
export { throwStatus, getAdmin, normalizeClientDocumentDraft }
