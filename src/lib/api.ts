/**
 * API integration layer: typed fetch wrapper with loading and error states.
 * Replace BASE_URL and endpoints when backend is ready.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export type ApiError = {
  message: string;
  code?: string;
};

export async function postJson<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal
): Promise<{ data: T; error: null } | { data: null; error: ApiError }> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include', // send httpOnly cookies when auth is added
      signal,
    });
    const data = (await res.json().catch(() => ({}))) as T | { message?: string };
    if (!res.ok) {
      return {
        data: null,
        error: {
          message: (data as { message?: string }).message ?? `Request failed (${res.status})`,
          code: String(res.status),
        },
      };
    }
    return { data: data as T, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    if (typeof window !== 'undefined' && (window as unknown as { __errorReporter?: (e: unknown) => void }).__errorReporter) {
      (window as unknown as { __errorReporter: (e: unknown) => void }).__errorReporter(err);
    }
    return { data: null, error: { message } };
  }
}

/** Login (placeholder: wire to your auth backend) */
export async function login(data: { email: string; password: string }) {
  if (BASE_URL) {
    return postJson<{ token?: string; user?: unknown }>('/auth/login', data);
  }
  await new Promise((r) => setTimeout(r, 500));
  return { data: { token: 'placeholder', user: { email: data.email } }, error: null };
}

/** Register (placeholder: wire to your auth backend) */
export async function register(data: { name: string; email: string; password: string }) {
  if (BASE_URL) {
    return postJson<{ ok: boolean }>('/auth/register', data);
  }
  await new Promise((r) => setTimeout(r, 500));
  return { data: { ok: true }, error: null };
}

/** Forgot password (placeholder: wire to your auth backend) */
export async function forgotPassword(data: { email: string }) {
  if (BASE_URL) {
    return postJson<{ ok: boolean }>('/auth/forgot-password', data);
  }
  await new Promise((r) => setTimeout(r, 500));
  return { data: { ok: true }, error: null };
}

/** Contact form submission (placeholder: logs and returns success) */
export async function submitContact(data: { name: string; email: string; message: string }) {
  if (BASE_URL) {
    return postJson<{ ok: boolean }>('/contact', data);
  }
  await new Promise((r) => setTimeout(r, 600));
  return { data: { ok: true }, error: null };
}

/** Newsletter signup (placeholder) */
export async function submitNewsletter(data: { email: string }) {
  if (BASE_URL) {
    return postJson<{ ok: boolean }>('/newsletter', data);
  }
  await new Promise((r) => setTimeout(r, 400));
  return { data: { ok: true }, error: null };
}
