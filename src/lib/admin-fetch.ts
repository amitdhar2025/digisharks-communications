/**
 * Safe fetch wrapper for admin panel API calls.
 *
 * Handles the common case where the server returns an HTML error page
 * (e.g. 500 from Vercel) instead of JSON — prevents the dreaded
 * "JSON.parse: unexpected character at line 1 column 1" error.
 *
 * Returns a typed tuple: [data, response, error]
 * - On success: [parsedJson, response, null]
 * - On non-JSON response: [null, response, Error with status info]
 * - On network error: [null, null, Error]
 */
export async function adminFetch<T = any>(
  url: string,
  init?: RequestInit,
): Promise<{ data: T | null; res: Response | null; error: string | null }> {
  try {
    const res = await fetch(url, init)

    // Handle 401 by redirecting to login
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login?next=' + encodeURIComponent(window.location.pathname)
      }
      return { data: null, res, error: 'Session expired' }
    }

    // Read as text first, then try JSON parse
    const text = await res.text()
    let data: T | null = null
    try {
      data = JSON.parse(text) as T
    } catch {
      // Response was HTML or empty — not JSON
      return {
        data: null,
        res,
        error: `Server returned an invalid response (HTTP ${res.status}). Please try again.`,
      }
    }

    // If the HTTP status indicates an error AND the parsed body has an `error` field,
    // surface it as the `error` string so callers can handle it consistently.
    const errorMessage =
      !res.ok && data && typeof data === 'object' && 'error' in (data as Record<string, unknown>)
        ? (data as Record<string, unknown>).error as string
        : null
    return { data, res, error: errorMessage }
  } catch (err: any) {
    // Network error, DNS failure, etc.
    return {
      data: null,
      res: null,
      error: err?.message || 'Network error. Please check your connection.',
    }
  }
}

/**
 * Convenience wrapper that throws on error (for use inside try/catch blocks).
 * If the response is not OK and data has an `error` field, throws that message.
 */
export async function adminFetchOrThrow<T = any>(
  url: string,
  init?: RequestInit,
): Promise<{ data: T; res: Response }> {
  const { data, res, error } = await adminFetch<T>(url, init)

  if (error) throw new Error(error)
  if (!res?.ok) throw new Error((data as any)?.error || `Request failed (HTTP ${res?.status})`)
  if (!data) throw new Error('Empty response from server')

  return { data, res }
}
