import { apiClient } from './api';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  role?: 'user' | 'driver' | 'owner' | 'admin';
};

type AuthResponse = {
  token?: string;
  user?: AuthUser;
} & Partial<AuthUser>;

const CURRENT_USER_KEY = 'crs_current_user';
const TOKEN_KEY = 'authToken';

const normalizeAuthResponse = (response: AuthResponse): { user: AuthUser; token?: string } => {
  if (response.user) {
    return { user: response.user, token: response.token };
  }

  const { token, ...user } = response;
  if (!user.id || !user.email) {
    throw new Error('Invalid auth response');
  }
  return { user: user as AuthUser, token };
};

const persistAuth = (user: AuthUser, token?: string) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

const clearAuth = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

const hasToken = () => Boolean(localStorage.getItem(TOKEN_KEY));

export const authService = {
  syncClerkUser: async (): Promise<AuthUser> => {
    const response = await apiClient.get<AuthResponse>('/api/auth/sync');
    const { user } = normalizeAuthResponse(response);
    return user;
  },

  login: async (email: string, password: string): Promise<AuthUser> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', { email, password });
    const { user, token } = normalizeAuthResponse(response);
    persistAuth(user, token);
    return user;
  },

  signup: async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<AuthUser> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/signup', data);
    const { user, token } = normalizeAuthResponse(response);
    persistAuth(user, token);
    return user;
  },

  updateProfile: async (data: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
  }): Promise<AuthUser> => {
    const token = localStorage.getItem(TOKEN_KEY) ?? undefined;
    const response = await apiClient.put<AuthResponse>('/api/auth/profile', data, token);
    const { user } = normalizeAuthResponse(response);
    persistAuth(user, token);
    return user;
  },

  logout: () => {
    clearAuth();
  },

  getCurrentUser: (): AuthUser | null => {
    try {
      if (!hasToken()) {
        clearAuth();
        return null;
      }
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AuthUser;
      if (parsed?.id && parsed?.email) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  },
};
