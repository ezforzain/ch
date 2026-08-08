import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, API_BASE, setAccessToken, setUnauthorizedHandler, ApiRequestError } from '../lib/api';

const AuthContext = createContext(null);

/**
 * Real backend-backed auth (see server/README.md). The access token lives only in memory
 * (never localStorage — reduces XSS blast radius); the httpOnly refresh-token cookie the
 * server sets is what survives a page reload, so on mount we silently try /auth/refresh
 * before deciding whether anyone is logged in.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.accessToken && !cancelled) {
            setAccessToken(json.data.accessToken);
            setUser(json.data.user);
          }
        }
      } catch {
        /* not logged in / server unreachable — proceed as guest */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await api.post('/auth/register', payload);
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  // `idToken` is the credential Google Identity Services hands back after the user picks
  // an account — a JWT signed BY GOOGLE, not one of ours. The backend verifies it and
  // finds-or-creates the matching account (see server/src/controllers/auth.controller.js).
  const loginWithGoogle = useCallback(async (idToken) => {
    const res = await api.post('/auth/google', { credential: idToken });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const refreshMe = useCallback(async () => {
    const res = await api.get('/auth/me');
    setUser(res.data.user);
    return res.data.user;
  }, []);

  // Self-service profile update (name/phone/avatar — see server's PATCH /users/me). Applies
  // the PATCH response to auth state directly instead of a separate /auth/me round trip: that
  // extra request was a second point of failure that could leave a successful avatar upload
  // stuck showing the old photo until the next full refresh/login if it ever hiccuped.
  const updateProfile = useCallback(async (formData) => {
    const res = await api.patch('/users/me', formData, { isForm: true });
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      loginWithGoogle,
      register,
      logout,
      refreshMe,
      updateProfile,
    }),
    [user, loading, login, loginWithGoogle, register, logout, refreshMe, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/** Where to send a user right after login/register, based on role. Customers, admins, and
 * superadmins all land on the Marketplace first — admins reach the Admin Panel from the
 * navbar link instead of being dropped straight into it (see Navbar.jsx). */
export function redirectPathForRole(role) {
  if (role === 'seller') return '/seller';
  return '/marketplace';
}

export { ApiRequestError };
