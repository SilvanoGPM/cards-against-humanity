import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';

interface CustomRouteProps {
  children: JSX.Element;
}

export function PrivateRoute({ children }: CustomRouteProps): JSX.Element {
  const location = useLocation();
  const { authenticated } = useAuth();

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

  return children;
}
