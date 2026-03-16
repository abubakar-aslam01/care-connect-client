import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/auth.js';
import { storageKeys } from '../services/api.js';

const AuthContext = createContext(null);

const USER_KEY = 'ccp_user';

const getDashboardPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'doctor':
      return '/doctor/dashboard';
    case 'patient':
    default:
      return '/patient/dashboard';
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(storageKeys.token));
  const [loading, setLoading] = useState(!!token);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  // Persist auth state
  const persistAuth = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    if (nextToken) localStorage.setItem(storageKeys.token, nextToken);
    else localStorage.removeItem(storageKeys.token);

    if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    else localStorage.removeItem(USER_KEY);
  };

  // Validate token and fetch profile on mount
  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authService.me();
        const nextUser = data?.data?.user;
        persistAuth(token, nextUser);
      } catch (err) {
        // Token invalid; clear state
        persistAuth(null, null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (credentials) => {
    setAuthLoading(true);
    setError(null);
    try {
      const { data } = await authService.login(credentials);
      const { token: nextToken, user: nextUser } = data?.data || {};
      persistAuth(nextToken, nextUser);
      return { user: nextUser, token: nextToken };
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (payload) => {
    setAuthLoading(true);
    setError(null);
    try {
      const { data } = await authService.register(payload);
      const { token: nextToken, user: nextUser } = data?.data || {};
      persistAuth(nextToken, nextUser);
      return { user: nextUser, token: nextToken };
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => persistAuth(null, null);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      authLoading,
      error,
      login,
      register,
      logout,
      getDashboardPath
    }),
    [user, token, loading, authLoading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
