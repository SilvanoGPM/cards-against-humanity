import { Navigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';

interface CustomRouteProps {
  children: JSX.Element;
}

export function PrivateRoute({ children }: CustomRouteProps): JSX.Element {
  const { authenticated } = useAuth();

  if (!authenticated) {
    return <Navigate to="/login" />;
  }

  return children;
}
