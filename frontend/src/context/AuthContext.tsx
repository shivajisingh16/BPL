import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { getToken } from '../services/apiClient';
import type { AuthUser } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True while we validate an existing token on first load. */
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Restore session from a stored token on first mount.
  useEffect(() => {
    let active = true;
    const token = getToken();
    if (!token) {
      setInitializing(false);
      return;
    }
    authService
      .me()
      .then((u) => {
        if (active) setUser(u);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setInitializing(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login(email, password);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: Boolean(user), initializing, login, logout }),
    [user, initializing, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
