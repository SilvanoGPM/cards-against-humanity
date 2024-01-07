import { User } from 'firebase/auth';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';

import { login } from '@/firebase/config';
import { useBoolean } from '@/hooks/useBoolean';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useStorage } from '@/hooks/useStorage';
import { newUser } from '@/services/users';

export interface AuthContextProps {
  user: User;
  authenticated: boolean;
  isAdmin: boolean;
  handleLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextProps>(
  {} as AuthContextProps
);

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useStorage<User>(
    '@CARDS_AGAINST_HUMANITY/USER',
    {} as User
  );

  const [authenticated, setTrueAuth, setFalseAuth] = useBoolean(false);

  const isAdmin = useIsAdmin(user, authenticated);

  useEffect(() => {
    if (user.uid && !authenticated) {
      setTrueAuth();
    }
  }, [user, setTrueAuth, authenticated]);

  const handleLogin = useCallback(async () => {
    try {
      const { user } = await login();

      await newUser(user);

      setUser(user);
      setTrueAuth();
    } catch (error) {
      setFalseAuth();

      throw error;
    }
  }, [setFalseAuth, setTrueAuth, setUser]);

  const handleLogout = useCallback(async () => {
    setUser({} as User);
    setFalseAuth();
  }, [setUser, setFalseAuth]);

  const value = useMemo(
    () => ({ user, authenticated, handleLogin, handleLogout, isAdmin }),
    [user, authenticated, handleLogin, handleLogout, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextProps {
  return useContext(AuthContext);
}
