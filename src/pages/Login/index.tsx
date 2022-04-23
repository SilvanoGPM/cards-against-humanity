import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export function Login(): JSX.Element {
  const navigate = useNavigate();

  const { handleLogin, authenticated } = useAuth();

  useEffect(() => {
    if (authenticated) {
      navigate('/');
    }
  }, [authenticated, navigate]);

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
