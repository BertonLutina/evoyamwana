import type { AuthUser } from '@evoyamwana/shared';
import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { AuthContext, type AuthContextValue } from './auth-context';
import { authService } from '../services/auth.service';

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [token, setToken] = useState(() => localStorage.getItem('evoyamwana.token'));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const rawUser = localStorage.getItem('evoyamwana.user');
    return rawUser ? (JSON.parse(rawUser) as AuthUser) : null;
  });

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;
    authService.me()
      .then((currentUser) => {
        if (!isMounted) {
          return;
        }
        localStorage.setItem('evoyamwana.user', JSON.stringify(currentUser));
        setUser(currentUser);
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      setSession(session) {
        localStorage.setItem('evoyamwana.token', session.token);
        localStorage.setItem('evoyamwana.user', JSON.stringify(session.user));
        setToken(session.token);
        setUser(session.user);
      },
      logout() {
        localStorage.removeItem('evoyamwana.token');
        localStorage.removeItem('evoyamwana.user');
        setToken(null);
        setUser(null);
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
