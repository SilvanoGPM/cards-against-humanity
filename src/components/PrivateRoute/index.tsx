import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { isAdmin } from '@/services/users';
import { useBoolean } from '@/hooks/useBoolean';
import { SomeLoading } from '../SomeLoading';
import { AppToaster } from '../Toast';

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
  const { user, authenticated } = useAuth();

  const [admin, setTrueAdmin] = useBoolean(false);

  useEffect(() => {
    async function verifyIfIsAdmin(): Promise<void> {
      const admin = await isAdmin(user.uid);

      if (!admin) {
        AppToaster.show({
          intent: 'warning',
          message: 'Você não possui permissão',
        });
        navigate('/');
        return;
      }

      setTrueAdmin();
    }

    if (authenticated && onlyAdmins) {
      verifyIfIsAdmin();
    }
  }, [authenticated, onlyAdmins, user, navigate, setTrueAdmin]);

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
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
