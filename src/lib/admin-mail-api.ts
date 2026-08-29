export type AdminMailApiError = {
  readonly message: string
  readonly code?: string
}

async function readError(res: Response, fallback: string): Promise<{ message: string; code?: string }> {
  try {
    const data = (await res.json()) as { message?: string; code?: string }
    return {
      message: data.message?.trim() || fallback,
      code: data.code
    }
  } catch {
    return { message: fallback }
  }
}

export async function adminMailRequest<T>(
  token: string,
  body: Record<string, unknown>,
  url = '/api/admin-mail'
): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const err = await readError(res, 'Request failed. Please try again.')
    const error = new Error(err.message) as Error & { code?: string }
    error.code = err.code
    throw error
  }
  return (await res.json()) as T
}
