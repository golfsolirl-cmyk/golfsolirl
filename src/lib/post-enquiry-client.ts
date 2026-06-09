/** API returns this when the same normalized phone already has an enquiry or portal profile. */
export const ENQUIRY_CONFLICT_EXISTING_PHONE = 'EXISTING_PHONE_USE_LOGIN'

export type PostEnquiryFailure = {
  ok: false
  status: number
  message: string
  code?: string
}

export type PostEnquirySuccess = {
  ok: true
  message: string
  referenceId?: string
}

/**
 * POST public enquiry form to `/api/enquiry` (Vite dev proxy or production gateway).
 * Every registered website form (`WEBSITE_ENQUIRY_FORM` in `enquiry-form-registry.ts`) should use this
 * so all submissions share one server handler (PDFs, email, dedupe).
 */
export const postWebsiteEnquiry = async (body: Record<string, unknown>): Promise<PostEnquirySuccess | PostEnquiryFailure> => {
  const response = await fetch('/api/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  const data = (await response.json().catch(() => ({}))) as { message?: string; code?: string; referenceId?: string }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: data.message ?? 'Could not send your request right now.',
      code: typeof data.code === 'string' ? data.code : undefined
    }
  }

  return {
    ok: true,
    message: data.message ?? 'Your enquiry has been sent.',
    referenceId: typeof data.referenceId === 'string' ? data.referenceId : undefined
  }
}
