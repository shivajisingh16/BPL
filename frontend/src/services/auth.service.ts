import { apiClient, setToken } from './apiClient';
import type { AuthResponse, AuthUser } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>(
      '/auth/login',
      { email, password },
      { skipAuth: true },
    );
    setToken(res.token);
    return res;
  },

  async me(): Promise<AuthUser | null> {
    const res = await apiClient.get<{ user: AuthUser | null }>('/auth/me');
    return res.user;
  },

  logout(): void {
    setToken(null);
  },
};
