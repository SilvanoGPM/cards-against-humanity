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
import { useStorage } from '@/hooks/useStorage';
import { newUser } from '@/services/users';

export interface AuthContextProps {
  user: User;
  authenticated: boolean;
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
    } catch {
      setFalseAuth();
    }
  }, [setFalseAuth, setTrueAuth, setUser]);

  const handleLogout = useCallback(async () => {
    setUser({} as User);
    setFalseAuth();
  }, [setUser, setFalseAuth]);

  const value = useMemo(
    () => ({ user, authenticated, handleLogin, handleLogout }),
    [user, authenticated, handleLogin, handleLogout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextProps {
  return useContext(AuthContext);
}
