import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export function Login(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();

  const { handleLogin, authenticated } = useAuth();

  useEffect(() => {
    if (authenticated) {
      const { path } = location.state as { path: string };
      navigate(path || '/');
    }
  }, [authenticated, navigate, location]);

  async function handleLoginClick(): Promise<void> {
    await handleLogin();
    navigate('/');
  }

  return (
    <div>
      <button type="button" onClick={handleLoginClick}>
        Login
      </button>
    </div>
  );
}
