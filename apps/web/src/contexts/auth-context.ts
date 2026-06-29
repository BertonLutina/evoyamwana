import { createContext } from 'react';
import type { AuthResponse, AuthUser } from '@evoyamwana/shared';

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  setSession: (session: AuthResponse) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
