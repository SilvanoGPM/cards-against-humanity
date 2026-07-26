import { onAuthStateChanged, signOut, User } from 'firebase/auth';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { auth, login } from '@/firebase/config';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { newUser } from '@/services/users';

// Versões antigas persistiam o objeto User completo do Firebase (email +
// accessToken/refreshToken) em texto plano no localStorage, acessível a
// qualquer script na página. Não persistimos mais isso: a sessão passa a ser
// gerenciada pelo próprio Firebase via onAuthStateChanged.
const LEGACY_USER_KEY = '@CARDS_AGAINST_HUMANITY/USER';

export interface AuthContextProps {
  user: User & { wins?: number };
  authenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
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
  const [user, setUser] = useState<User>({} as User);
  const [isLoading, setIsLoading] = useState(true);

  const authenticated = Boolean(user?.uid);

  const { userIsAdmin, setUserIsAdmin } = useIsAdmin(user, authenticated);

  useEffect(() => {
    // Remove credenciais deixadas por versões antigas do app.
    try {
      localStorage.removeItem(LEGACY_USER_KEY);
    } catch {
      // Ignora: localStorage pode estar indisponível.
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? ({} as User));
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleLogin = useCallback(async () => {
    const { user: loggedUser } = await login();

    await newUser(loggedUser);
    // onAuthStateChanged atualiza o estado com o usuário logado.
  }, []);

  const handleLogout = useCallback(async () => {
    await signOut(auth);
    setUser({} as User);
    setUserIsAdmin(false);
  }, [setUserIsAdmin]);

  const value = useMemo(
    () => ({
      user,
      authenticated,
      handleLogin,
      handleLogout,
      isAdmin: userIsAdmin,
      isLoading,
    }),
    [user, authenticated, handleLogin, handleLogout, userIsAdmin, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextProps {
  return useContext(AuthContext);
}
