import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

export interface UserContextProps {
  name: string;
  handleSetName: (name: string) => void;
}

export interface UserProviderProps {
  children: React.ReactNode;
}

export const UserContext = createContext<UserContextProps>(
  {} as UserContextProps
);

export function UserProvider({ children }: UserProviderProps): JSX.Element {
  const navigate = useNavigate();

  const [user, setUser] = useState({ name: '' });

  useEffect(() => {
    if (!user.name) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSetName = useCallback((name: string) => {
    const validName = name.trim();

    if (validName) {
      setUser({ name: validName });
    }
  }, []);

  const value = useMemo(
    () => ({ ...user, handleSetName }),
    [user, handleSetName]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextProps {
  return useContext(UserContext);
}
