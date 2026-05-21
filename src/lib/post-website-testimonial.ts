export type WebsiteTestimonialPayload = {
  readonly fullName: string
  readonly email: string
  readonly phoneWhatsApp: string
  readonly tripType: string
  readonly travelMonth?: string
  readonly quoteText: string
  readonly rating: number
  readonly sourcePage?: string
}

export type WebsiteTestimonialResult =
  | { readonly ok: true; readonly displayName: string }
  | { readonly ok: false; readonly message: string }

export async function postWebsiteTestimonial(
  payload: WebsiteTestimonialPayload
): Promise<WebsiteTestimonialResult> {
  const response = await fetch('/api/website-testimonial', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const data = (await response.json().catch(() => ({}))) as {
    message?: string
    displayName?: string
  }
  if (!response.ok) {
    return { ok: false, message: data.message ?? 'Could not send your testimonial right now.' }
  }
  return {
    ok: true,
    displayName: typeof data.displayName === 'string' ? data.displayName : 'Guest'
  }
}
