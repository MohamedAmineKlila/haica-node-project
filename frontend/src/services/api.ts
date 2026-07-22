const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? `${window.location.protocol}//${window.location.hostname}:3000/api`

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

export function resolveAvatarUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${API_ORIGIN}${url}`
}

const REQUEST_TIMEOUT_MS = 15000

type RequestOptions = RequestInit & {
  auth?: boolean
}

export class ApiError extends Error {
  status: number
  payload?: any

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function getStoredAccessToken() {
  return localStorage.getItem('haica_access_token')
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  if (!(options.body instanceof FormData) && options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.auth !== false) {
    const token = getStoredAccessToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    })
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new ApiError('Le serveur met trop de temps à répondre. Vérifiez que le backend est lancé.', 408)
    }
    throw new ApiError('Impossible de joindre le backend. Vérifiez http://localhost:3000/health.', 0)
  } finally {
    window.clearTimeout(timeout)
  }

  const contentType = response.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    const err = new ApiError(payload?.error ?? 'Request failed', response.status)
    err.payload = payload
    throw err
  }

  return payload as T
}

export const api = {
  get: <T>(path: string, options?: { params?: Record<string, string | number> }) => {
    let url = path
    if (options?.params) {
      const qs = new URLSearchParams()
      for (const [k, v] of Object.entries(options.params)) {
        if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
      }
      const qsStr = qs.toString()
      if (qsStr) url += `?${qsStr}`
    }
    return apiRequest<T>(url)
  },
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
      ...options,
    }),
  patch: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, {
      method: 'PATCH',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
}
