export type ClientDocumentApiError = {
  readonly message: string
}

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string }
    return data.message?.trim() || fallback
  } catch {
    return fallback
  }
}

async function postJson<T>(
  url: string,
  token: string,
  body: Record<string, unknown>
): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    throw new Error(await readError(res, 'Request failed. Please try again.'))
  }
  return (await res.json()) as T
}

export async function clientDocumentRequest<T>(
  token: string,
  body: Record<string, unknown>,
  url = '/api/client-enquiry-document'
): Promise<T> {
  return postJson<T>(url, token, body)
}

export async function downloadClientDocumentFile(
  url: string,
  token: string,
  draft: unknown,
  fallbackName: string,
  failMessage: string
): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ draft })
  })
  if (!res.ok) {
    throw new Error(await readError(res, failMessage))
  }
  const blob = await res.blob()
  const header = res.headers.get('Content-Disposition') ?? ''
  const match = header.match(/filename="([^"]+)"/)
  const filename = match?.[1] || fallbackName
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(objectUrl)
}
