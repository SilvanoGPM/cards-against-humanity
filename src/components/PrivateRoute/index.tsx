import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { useBoolean } from '@/hooks/useBoolean';
import { isAdmin } from '@/services/users';
import { useToast } from '@chakra-ui/react';
import { useEffect } from 'react';
import { SomeLoading } from '../SomeLoading';

interface CustomRouteProps {
  children: JSX.Element;
  onlyAdmins?: boolean;
}

export function PrivateRoute({
  children,
  onlyAdmins = false,
}: CustomRouteProps): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, authenticated, isLoading } = useAuth();
  const toast = useToast();

  const [admin, setTrueAdmin] = useBoolean(false);

  useEffect(() => {
    async function verifyIfIsAdmin(): Promise<void> {
      const admin = await isAdmin(user.uid);

      if (!admin) {
        toast({
          title: 'Sem permissão',
          description: 'Você não possui permissão para acessar a página',
          status: 'warning',
        });

        navigate('/');
        return;
      }

      setTrueAdmin();
    }

    if (authenticated && onlyAdmins) {
      verifyIfIsAdmin();
    }
  }, [authenticated, onlyAdmins, user, navigate, setTrueAdmin, toast]);

  if (!authenticated && !isLoading && !user?.uid) {
    return (
      <Navigate
        to="/"
        state={{
          path: location.pathname,
        }}
      />
    );
  }

  if (onlyAdmins && !admin) {
    return <SomeLoading loading message="Verificando permissões..." />;
  }

  return children;
}
