type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

const getBaseUrl = () => {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!raw) return '';
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
};

const buildHeaders = (token?: string, extra?: HeadersInit): HeadersInit => {
  const headers: HeadersInit = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...extra,
  };

  if (token) {
    return { ...headers, Authorization: `Bearer ${token}` };
  }

  return headers;
};

const parseJson = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  if (!text) return null as T;
  return JSON.parse(text) as T;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: buildHeaders(token, options.headers),
    });

    if (!response.ok) {
      let details: unknown = undefined;
      try {
        details = await parseJson<unknown>(response);
      } catch {
        // Ignore JSON parse errors
      }

      const detailsMessage =
        details &&
        typeof details === 'object' &&
        'message' in details &&
        typeof (details as { message?: unknown }).message === 'string'
          ? (details as { message: string }).message
          : undefined;

      const error: ApiError = {
        status: response.status,
        message: detailsMessage || response.statusText || 'Request failed',
        details,
      };

      throw error;
    }

    return parseJson<T>(response);
  }

  get<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, token);
  }

  post<T>(endpoint: string, body?: unknown, token?: string): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      token
    );
  }

  put<T>(endpoint: string, body?: unknown, token?: string): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      },
      token
    );
  }

  delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, token);
  }
}

export const apiClient = new ApiClient(getBaseUrl());
