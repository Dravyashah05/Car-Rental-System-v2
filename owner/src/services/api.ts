const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'
const TOKEN_KEY = 'owner_token'

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY)

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

type ApiError = {
  message?: string
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (import.meta.env.DEV) {
    console.debug('[api]', {
      path,
      hasToken: Boolean(token),
      hasAuthHeader: headers.has('Authorization'),
    })
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    clearAuthToken()
    if (typeof window !== 'undefined') {
      window.location.assign('/login')
    }
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`
    try {
      const data = (await response.json()) as ApiError
      if (data?.message) {
        errorMessage = data.message
      }
    } catch {
      // keep default error message
    }
    throw new Error(errorMessage)
  }

  if (response.status === 204) {
    return {} as T
  }

  return (await response.json()) as T
}
